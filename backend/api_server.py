"""FastAPI wrapper backend for the Token-Diet context compressor benchmark.
"""

from __future__ import annotations

import os
import sys
import time
from pathlib import Path
from typing import Any, Optional, Dict, List, Tuple
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

_PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(_PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(_PROJECT_ROOT))

# Lazy build helper logic
FIXTURES_DIR = _PROJECT_ROOT / "datasets" / "demo_company" / "documents"

def _find_fixtures() -> list[tuple[str, str]]:
    if not FIXTURES_DIR.exists():
        return []
    return [
        (p.stem, p.read_text(encoding="utf-8"))
        for p in sorted(FIXTURES_DIR.rglob("*.md"))
        if (
            "SAMPLE FIXTURE" in p.read_text(encoding="utf-8")
            or "SYNTHETIC DEVELOPMENT" in p.read_text(encoding="utf-8")
        )
    ]

def _build_database(cfg: Any):
    from backend.rag.database import VectorDatabase
    from backend.embeddings.local_models import SentenceTransformersEmbedder
    device = cfg.system.device if hasattr(cfg, "system") else "cpu"
    model_name = cfg.retriever.embedding_model if hasattr(cfg, "retriever") else "sentence-transformers/all-MiniLM-L6-v2"

    db = VectorDatabase(
        embedder=SentenceTransformersEmbedder(model_name=model_name, device=device)
    )
    for doc_id, text in _find_fixtures():
        db.add_document(doc_id, text)
    return db

def _build_components(cfg: Any):
    from backend.compressor.pipeline import PipelineComponents
    from backend.embeddings.local_models import SentenceTransformersCrossEncoder, SentenceTransformersEmbedder
    device = cfg.system.device if hasattr(cfg, "system") else "cpu"
    emb_model = cfg.retriever.embedding_model if hasattr(cfg, "retriever") else "sentence-transformers/all-MiniLM-L6-v2"
    ce_model = cfg.compressor.cross_encoder_model if hasattr(cfg, "compressor") else "cross-encoder/ms-marco-TinyBERT-L-2-v2"

    return PipelineComponents(
        embedder=SentenceTransformersEmbedder(model_name=emb_model, device=device),
        cross_encoder=SentenceTransformersCrossEncoder(model_name=ce_model, device=device),
    )

def _build_llm(cfg: Any, api_key: str = ""):
    from backend.llm.gemini_client import GeminiLLMClient
    from backend.llm.groq_client import GroqLLMClient

    provider = (cfg.llm.provider or "gemini").lower()
    if provider == "groq":
        return GroqLLMClient(cfg.llm)
    return GeminiLLMClient(cfg.llm)

# ---------------------------------------------------------------------------
# API Models
# ---------------------------------------------------------------------------

class BenchmarkRequest(BaseModel):
    query: str
    use_compressor: bool = True
    token_budget: int = 300
    top_k: int = 10
    api_key: Optional[str] = None

class BaselineRAGResponse(BaseModel):
    context_tokens: int = 0
    retrieval_time_ms: float = 0.0
    llm_ttft_ms: float = 0.0
    total_time_ms: float = 0.0
    answer: str = "—"
    raw_context: str = "—"
    llm_server_prompt_time_ms: float = 0.0
    llm_server_queue_time_ms: float = 0.0

class StageBreakdown(BaseModel):
    unit_formation_ms: float = 0.0
    fast_filter_ms: float = 0.0
    rerank_ms: float = 0.0
    selection_ms: float = 0.0
    pack_ms: float = 0.0

class SmartRAGResponse(BaseModel):
    original_tokens: int = 0
    compressed_tokens: int = 0
    retrieval_time_ms: float = 0.0
    compressor_time_ms: float = 0.0
    llm_ttft_ms: float = 0.0
    total_time_ms: float = 0.0
    answer: str = "—"
    compressed_text: str = "—"
    compressor_breakdown: StageBreakdown = Field(default_factory=StageBreakdown)
    llm_server_prompt_time_ms: float = 0.0
    llm_server_queue_time_ms: float = 0.0

class BenchmarkResponse(BaseModel):
    baseline: BaselineRAGResponse
    smart: Optional[SmartRAGResponse] = None
    token_compression_pct: float = 0.0
    net_latency_savings_ms: float = 0.0
    normal_succeeded: bool = True
    smart_succeeded: bool = True
    error: Optional[str] = None

# ---------------------------------------------------------------------------
# App Router
# ---------------------------------------------------------------------------

app = FastAPI(title="Token-Diet Context Compressor Backend API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/benchmark", response_model=BenchmarkResponse)
async def run_benchmark(req: BenchmarkRequest) -> BenchmarkResponse:
    from backend.config.config import load_config, AppConfig, RetrieverConfig, CompressorConfig
    from backend.rag.normal_rag import NormalRAG
    from backend.rag.smart_rag import SmartRAG
    from backend.llm.gemini_client import LLMQuotaExhaustedError

    cfg = load_config()
    
    # Overrides API Key in environment if provided
    provider_name = (cfg.llm.provider or "gemini").lower()
    key_env = cfg.llm.api_key_env or (
        "GROQ_API_KEY" if provider_name == "groq" else "GEMINI_API_KEY"
    )
    if req.api_key:
        os.environ[key_env] = req.api_key.strip()
    
    # Verify we have some key
    if not os.environ.get(key_env):
        raise HTTPException(status_code=400, detail=f"API key env '{key_env}' is not set.")

    # Override parameters from request sliders
    new_retriever = RetrieverConfig(**{**cfg.retriever.__dict__, "top_k": req.top_k})
    new_compressor = CompressorConfig(**{**cfg.compressor.__dict__, "global_token_budget": req.token_budget})
    cfg = AppConfig(
        system=cfg.system,
        retriever=new_retriever,
        compressor=new_compressor,
        llm=cfg.llm
    )

    try:
        db = _build_database(cfg)
        components = _build_components(cfg)
        llm = _build_llm(cfg)
    except Exception as e:
        return BenchmarkResponse(
            baseline=BaselineRAGResponse(answer="—", raw_context="—"),
            normal_succeeded=False,
            smart_succeeded=False,
            error=f"Initialization Error: {e}"
        )

    normal_res = None
    smart_res = None
    normal_succeeded = True
    smart_succeeded = True
    err_msg = None

    # Execute Baseline RAG
    try:
        normal_res = NormalRAG(db, llm, cfg).run(req.query)
    except LLMQuotaExhaustedError as exc:
        return BenchmarkResponse(
            baseline=BaselineRAGResponse(answer="—", raw_context="—"),
            normal_succeeded=False,
            smart_succeeded=False,
            error=f"API Quota Exhausted: {exc}"
        )
    except Exception as e:
        normal_succeeded = False
        err_msg = f"Baseline RAG failed: {e}"

    # Execute Smart RAG (if toggled)
    if req.use_compressor:
        try:
            smart_res = SmartRAG(db, llm, cfg, components=components).run(req.query)
        except LLMQuotaExhaustedError as exc:
            return BenchmarkResponse(
                baseline=BaselineRAGResponse(answer="—", raw_context="—"),
                normal_succeeded=normal_succeeded,
                smart_succeeded=False,
                error=f"API Quota Exhausted during compressor run: {exc}"
            )
        except Exception as e:
            smart_succeeded = False
            err_msg = (err_msg + " | " if err_msg else "") + f"Smart RAG failed: {e}"
    else:
        smart_res = normal_res
        smart_succeeded = normal_succeeded

    # Build safe return payloads
    # 1. Baseline safe metrics
    b_tokens = getattr(normal_res, "context_tokens", 0) if normal_res else 0
    b_ret_time = getattr(normal_res, "retrieval_time_ms", 0.0) if normal_res else 0.0
    b_ttft = getattr(normal_res, "llm_ttft_ms", 0.0) if normal_res else 0.0
    b_total = getattr(normal_res, "total_time_ms", 0.0) if normal_res else 0.0
    b_ans = getattr(normal_res, "answer", "—") if normal_res else "—"
    
    b_raw_context = ""
    if normal_res and hasattr(normal_res, "raw_chunks") and normal_res.raw_chunks:
        b_raw_context = "\n\n".join(getattr(c, "text", str(c)) for c in normal_res.raw_chunks)
    else:
        b_raw_context = "—"

    b_prompt_time = getattr(normal_res, "llm_server_prompt_time_ms", 0.0) if normal_res else 0.0
    b_queue_time = getattr(normal_res, "llm_server_queue_time_ms", 0.0) if normal_res else 0.0

    baseline_payload = BaselineRAGResponse(
        context_tokens=b_tokens,
        retrieval_time_ms=b_ret_time,
        llm_ttft_ms=b_ttft,
        total_time_ms=b_total,
        answer=b_ans,
        raw_context=b_raw_context,
        llm_server_prompt_time_ms=b_prompt_time,
        llm_server_queue_time_ms=b_queue_time
    )

    # 2. Smart safe metrics
    smart_payload = None
    if req.use_compressor and smart_res:
        s_orig = getattr(smart_res, "original_tokens", 0)
        s_comp = getattr(smart_res, "compressed_tokens", 0)
        s_ret_time = getattr(smart_res, "retrieval_time_ms", 0.0)
        s_comp_time = getattr(smart_res, "compressor_time_ms", 0.0)
        s_ttft = getattr(smart_res, "llm_ttft_ms", 0.0)
        s_total = getattr(smart_res, "total_time_ms", 0.0)
        s_ans = getattr(smart_res, "answer", "—")
        s_text = getattr(smart_res, "compressed_text", "—")
        
        breakdown = getattr(smart_res, "compressor_breakdown", {})
        breakdown_payload = StageBreakdown(
            unit_formation_ms=breakdown.get("unit_formation_ms", 0.0),
            fast_filter_ms=breakdown.get("fast_filter_ms", 0.0),
            rerank_ms=breakdown.get("rerank_ms", 0.0),
            selection_ms=breakdown.get("selection_ms", 0.0),
            pack_ms=breakdown.get("pack_ms", 0.0)
        )

        s_prompt_time = getattr(smart_res, "llm_server_prompt_time_ms", 0.0)
        s_queue_time = getattr(smart_res, "llm_server_queue_time_ms", 0.0)

        smart_payload = SmartRAGResponse(
            original_tokens=s_orig,
            compressed_tokens=s_comp,
            retrieval_time_ms=s_ret_time,
            compressor_time_ms=s_comp_time,
            llm_ttft_ms=s_ttft,
            total_time_ms=s_total,
            answer=s_ans,
            compressed_text=s_text,
            compressor_breakdown=breakdown_payload,
            llm_server_prompt_time_ms=s_prompt_time,
            llm_server_queue_time_ms=s_queue_time
        )

    # 3. Deltas comparison calculation
    cmp_tokens_pct = 0.0
    if b_tokens > 0 and smart_payload:
        cmp_tokens_pct = ((b_tokens - smart_payload.compressed_tokens) / b_tokens) * 100.0

    net_latency_savings = 0.0
    if smart_payload:
        net_latency_savings = b_total - smart_payload.total_time_ms

    return BenchmarkResponse(
        baseline=baseline_payload,
        smart=smart_payload,
        token_compression_pct=cmp_tokens_pct,
        net_latency_savings_ms=net_latency_savings,
        normal_succeeded=normal_succeeded,
        smart_succeeded=smart_succeeded,
        error=err_msg
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
