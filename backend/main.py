"""FastAPI backend API server for Token-Diet benchmark runs.
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

def _build_llm(cfg: Any):
    from backend.llm.gemini_client import GeminiLLMClient
    from backend.llm.groq_client import GroqLLMClient

    provider = (cfg.llm.provider or "gemini").lower()
    if provider == "groq":
        return GroqLLMClient(cfg.llm)
    return GeminiLLMClient(cfg.llm)

# ---------------------------------------------------------------------------
# API Models (Aligned exactly with User JSON payload specification)
# ---------------------------------------------------------------------------

class BenchmarkRequest(BaseModel):
    query: str
    document_id: Optional[str] = None
    token_budget: int = 300
    top_k: int = 10
    enable_compressor: bool = True
    api_key: Optional[str] = None

class BaselineRAGResponse(BaseModel):
    tokens: int = 0
    latency_s: float = 0.0
    ttft_ms: float = 0.0
    answer: str = "—"
    raw_context: str = "—"

class SmartRAGResponse(BaseModel):
    tokens: int = 0
    latency_s: float = 0.0
    ttft_ms: float = 0.0
    answer: str = "—"
    compressed_text: str = "—"

class StageTimings(BaseModel):
    unit_formation: float = 0.0
    fast_filter: float = 0.0
    rerank: float = 0.0
    selection: float = 0.0
    pack: float = 0.0

class MetricsSummary(BaseModel):
    token_reduction_pct: float = 0.0
    speedup_factor: float = 0.0
    cost_saved_usd: float = 0.0

class BenchmarkResponse(BaseModel):
    baseline: BaselineRAGResponse
    smart: Optional[SmartRAGResponse] = None
    stage_timings_ms: StageTimings = Field(default_factory=StageTimings)
    metrics: MetricsSummary = Field(default_factory=MetricsSummary)
    normal_succeeded: bool = True
    smart_succeeded: bool = True
    error: Optional[str] = None

# ---------------------------------------------------------------------------
# App Router
# ---------------------------------------------------------------------------

app = FastAPI(title="Token-Diet Context Compressor REST API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/run-benchmark", response_model=BenchmarkResponse)
async def run_benchmark(req: BenchmarkRequest) -> BenchmarkResponse:
    from backend.config.config import load_config, AppConfig, RetrieverConfig, CompressorConfig
    from backend.rag.normal_rag import NormalRAG
    from backend.rag.smart_rag import SmartRAG
    from backend.llm.gemini_client import LLMQuotaExhaustedError

    cfg = load_config()
    
    # Verify API key matches environment (dynamically loaded)
    key = req.api_key.strip() if req.api_key else ""
    provider = None

    if key:
        if key.startswith("gsk_"):
            provider = "groq"
            os.environ["GROQ_API_KEY"] = key
        elif key.startswith("AIza"):
            provider = "gemini"
            os.environ["GEMINI_API_KEY"] = key
        else:
            # Fallback default configuration
            provider = "gemini"
            os.environ["GEMINI_API_KEY"] = key
    else:
        # Load dotenv manually if present
        try:
            from dotenv import load_dotenv
            load_dotenv()
        except ImportError:
            pass

        if os.environ.get("GROQ_API_KEY"):
            provider = "groq"
        elif os.environ.get("GEMINI_API_KEY"):
            provider = "gemini"

    if not provider:
        print("[API Server] Missing API key or configuration env variables.")
        raise HTTPException(
            status_code=400,
            detail="Please enter a valid Groq (gsk_...) or Gemini API key in the sidebar."
        )

    # Override parameters from request payload
    new_retriever = RetrieverConfig(**{**cfg.retriever.__dict__, "top_k": req.top_k})
    new_compressor = CompressorConfig(**{**cfg.compressor.__dict__, "global_token_budget": req.token_budget})
    
    # Dynamic LLM override based on detected provider
    if provider == "groq":
        new_llm = {
            "provider": "groq",
            "model": "llama3-8b-8192",
            "temperature": cfg.llm.temperature,
            "max_tokens": cfg.llm.max_tokens,
            "api_key_env": "GROQ_API_KEY"
        }
    else:
        new_llm = {
            "provider": "gemini",
            "model": "gemini-2.5-flash",
            "temperature": cfg.llm.temperature,
            "max_tokens": cfg.llm.max_tokens,
            "api_key_env": "GEMINI_API_KEY"
        }
    
    from backend.config.config import LLMConfig
    cfg = AppConfig(
        system=cfg.system,
        retriever=new_retriever,
        compressor=new_compressor,
        llm=LLMConfig(**new_llm)
    )
    
    key_env = cfg.llm.api_key_env
    print(f"[API Server] Running benchmark. Provider: {provider}, Model: {cfg.llm.model}, Key Env: {key_env}, Key Length: {len(os.environ.get(key_env) or '')}")

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
    if req.enable_compressor:
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

    if normal_res:
        print(f"[API Server] Normal RAG succeeded={normal_res.succeeded}, error={normal_res.error}, answer_len={len(normal_res.answer)}")
    if smart_res:
        print(f"[API Server] Smart RAG succeeded={smart_res.succeeded}, error={smart_res.error}, answer_len={len(smart_res.answer)}")

    # Build safe return payloads
    # 1. Baseline safe metrics
    b_tokens = getattr(normal_res, "context_tokens", 0) if normal_res else 0
    b_ret_time = getattr(normal_res, "retrieval_time_ms", 0.0) if normal_res else 0.0
    b_ttft = getattr(normal_res, "llm_ttft_ms", 0.0) if normal_res else 0.0
    b_total = getattr(normal_res, "total_time_ms", 0.0) if normal_res else 0.0
    
    if normal_res and not normal_res.succeeded:
        b_ans = f"LLM Error: {normal_res.error}"
    else:
        b_ans = getattr(normal_res, "answer", "—") if normal_res else "—"
        if not b_ans or b_ans.strip() == "":
            b_ans = "No answer produced by model."
    
    b_raw_context = ""
    if normal_res and hasattr(normal_res, "raw_chunks") and normal_res.raw_chunks:
        b_raw_context = "\n\n".join(getattr(c, "text", str(c)) for c in normal_res.raw_chunks)
    else:
        b_raw_context = "—"

    baseline_payload = BaselineRAGResponse(
        tokens=b_tokens,
        latency_s=b_total / 1000.0,
        ttft_ms=b_ttft,
        answer=b_ans,
        raw_context=b_raw_context
    )

    # 2. Smart safe metrics
    smart_payload = None
    stage_payload = StageTimings()
    s_comp = 0
    s_ttft = 0.0
    if req.enable_compressor and smart_res:
        s_comp = getattr(smart_res, "compressed_tokens", 0)
        s_ret_time = getattr(smart_res, "retrieval_time_ms", 0.0)
        s_comp_time = getattr(smart_res, "compressor_time_ms", 0.0)
        s_ttft = getattr(smart_res, "llm_ttft_ms", 0.0)
        s_total = getattr(smart_res, "total_time_ms", 0.0)
        
        if smart_res and not smart_res.succeeded:
            s_ans = f"LLM Error: {smart_res.error}"
        else:
            s_ans = getattr(smart_res, "answer", "—")
            if not s_ans or s_ans.strip() == "":
                s_ans = "No answer produced by model."
        s_text = getattr(smart_res, "compressed_text", "—")

        smart_payload = SmartRAGResponse(
            tokens=s_comp,
            latency_s=s_total / 1000.0,
            ttft_ms=s_ttft,
            answer=s_ans,
            compressed_text=s_text
        )

        breakdown = getattr(smart_res, "compressor_breakdown", {})
        stage_payload = StageTimings(
            unit_formation=breakdown.get("unit_formation_ms", 0.0),
            fast_filter=breakdown.get("fast_filter_ms", 0.0),
            rerank=breakdown.get("rerank_ms", 0.0),
            selection=breakdown.get("selection_ms", 0.0),
            pack=breakdown.get("pack_ms", 0.0)
        )

    # 3. Deltas comparison calculation
    cmp_tokens_pct = 0.0
    if b_tokens > 0 and smart_payload:
        cmp_tokens_pct = ((b_tokens - s_comp) / b_tokens) * 100.0

    speedup = 1.0
    if b_ttft > 0 and s_ttft > 0:
        speedup = b_ttft / s_ttft

    savings_usd = max((b_tokens - s_comp) / 1_000_000.0 * 0.30, 0.0)

    metrics_payload = MetricsSummary(
        token_reduction_pct=cmp_tokens_pct,
        speedup_factor=speedup,
        cost_saved_usd=savings_usd
    )

    return BenchmarkResponse(
        baseline=baseline_payload,
        smart=smart_payload,
        stage_timings_ms=stage_payload,
        metrics=metrics_payload,
        normal_succeeded=normal_succeeded,
        smart_succeeded=smart_succeeded,
        error=err_msg
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
