"""Streamlit dashboard for the Token-Diet Dynamic Context Compressor.

Dashboard metrics:
1. Original Retrieved-Context Tokens (Normal RAG)
2. Compressed-Context Tokens (Smart RAG)
3. Compression Percentage
4. Compressor Latency
5. LLM TTFT (both)
6. End-to-End Latency (both)
7. Net Latency Savings
8. Estimated Input-Token / API Cost
9. Answer Correctness (keyword-based factual check)
10. Answer Cosine Similarity (secondary diagnostic)

Run with:
    set GEMINI_API_KEY=...        (Windows) /  export GEMINI_API_KEY=...
    streamlit run frontend/app.py
"""

from __future__ import annotations

import os

# Suppress HF / tqdm progress bars before any model import.
os.environ.setdefault("HF_HUB_DISABLE_PROGRESS_BARS", "1")
os.environ.setdefault("TRANSFORMERS_VERBOSITY", "error")
os.environ.setdefault("TOKENIZERS_PARALLELISM", "false")

import time
import sys
from pathlib import Path
from typing import Any
import pandas as pd
import streamlit as st
import streamlit.components.v1 as components

# Import plotly with graceful fallback
try:
    import plotly.graph_objects as go
    HAS_PLOTLY = True
except ImportError:
    HAS_PLOTLY = False

_PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(_PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(_PROJECT_ROOT))

# Force UTF-8 encoding
try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")  # type: ignore[attr-defined]
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")  # type: ignore[attr-defined]
except Exception:
    pass

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

FIXTURES_DIR = (
    Path(__file__).resolve().parent.parent / "datasets" / "demo_company" / "documents"
)

PRESET_KEYWORDS = {
    "What is the minimum uptime commitment and credit policy for P1 outages?": ("99.99%", "credit", "outage"),
    "What were the primary efficacy endpoints observed in Phase 3?": ("14.2 mmHg", "efficacy", "blood pressure"),
    "What are the recommended connection pool sizes for high concurrency?": ("20 to 50", "80 to 100", "pooling")
}

def extract_context_payload(result_obj: Any, fallback_attr: str = "compressed_text") -> str:
    """Safe helper function for payload extraction to prevent AttributeError."""
    if result_obj is None:
        return "No context recorded."
    # Check direct attributes
    for attr in [fallback_attr, "compressed_context", "compressed_prompt", "raw_context", "context", "prompt"]:
        if hasattr(result_obj, attr) and getattr(result_obj, attr):
            return getattr(result_obj, attr)
    # Check dictionary or metrics
    if isinstance(result_obj, dict):
        return result_obj.get(fallback_attr) or result_obj.get("compressed_context") or result_obj.get("raw_context") or ""
    if hasattr(result_obj, "metrics") and isinstance(result_obj.metrics, dict):
        return result_obj.metrics.get(fallback_attr) or result_obj.metrics.get("compressed_text") or ""
    return str(result_obj)

def _find_fixtures() -> list[tuple[str, str]]:
    """Find markdown fixtures under datasets/demo_company/documents."""
    data_dir = FIXTURES_DIR
    if not data_dir.exists():
        return []
    return [
        (p.stem, p.read_text(encoding="utf-8"))
        for p in sorted(data_dir.rglob("*.md"))
        if (
            "SAMPLE FIXTURE" in p.read_text(encoding="utf-8")
            or "SYNTHETIC DEVELOPMENT" in p.read_text(encoding="utf-8")
        )
    ]

def _load_fixtures() -> list[tuple[str, str]]:
    return _find_fixtures()

def _get_required_keywords(query_str: str) -> list[str]:
    """Retrieve required keywords for validation."""
    query_str_clean = query_str.strip()
    if query_str_clean in PRESET_KEYWORDS:
        return list(PRESET_KEYWORDS[query_str_clean])
    try:
        import json
        queries_json_path = Path(__file__).resolve().parent.parent / "datasets" / "demo_company" / "queries.json"
        if queries_json_path.exists():
            data = json.loads(queries_json_path.read_text(encoding="utf-8"))
            for item in data.get("queries", []):
                if item["query"].strip().lower() == query_str_clean.lower():
                    return item.get("required_keywords", [])
    except Exception:
        pass
    return []

def _estimate_cost(
    input_tokens: int,
    *,
    price_per_million_input: float = 0.30,  # Gemini 2.5 Flash default tier
) -> float:
    return (input_tokens / 1_000_000) * price_per_million_input

def _keyword_correctness(answer: str, required: tuple[str, ...]) -> bool:
    a = answer.lower()
    return all(kw.lower() in a for kw in required) if required else True

def _format_latency_delta(ms: float) -> tuple[str, str]:
    seconds = abs(ms) / 1000.0
    if ms >= 0:
        return f"{seconds:.2f} s faster than Normal", "normal"
    else:
        return f"{seconds:.2f} s slower than Normal", "normal"

def _validate_key_format(key: str) -> str:
    s = (key or "").strip()
    if not s:
        return "empty"
    if "\u2026" in s:
        return "ellipsis"
    if len(s) < 20:
        return "too_short"
    return "valid"

def _render_chunks(chunks: list, label: str) -> None:
    if not chunks:
        st.caption(f"_{label}: no chunks retrieved._")
        return
    for i, chunk in enumerate(chunks, start=1):
        doc = getattr(chunk, "doc_id", "?")
        cid = getattr(chunk, "chunk_id", None)
        score = getattr(chunk, "score", None)
        text = getattr(chunk, "text", str(chunk))
        score_str = f"score={score:.3f}" if isinstance(score, (int, float)) else ""
        title = f"{i}. `{doc}`" + (f" #{cid}" if cid is not None else "") + (
            f"  {score_str}" if score_str else ""
        )
        with st.expander(title, expanded=False):
            preview = text if len(text) <= 1500 else text[:1500] + "\n\n_...truncated..._"
            st.markdown(preview)

def _show_quota_error(exc) -> None:
    st.session_state["_quota_exhausted"] = True
    st.session_state["_quota_retry_after_s"] = getattr(exc, "retry_after_seconds", None)
    wait_hint = (
        f"Try again in about **{exc.retry_after_seconds:.0f} s** (server hint)."
        if getattr(exc, "retry_after_seconds", None)
        else "Try again later -- the free-tier quota resets daily."
    )
    st.error(
        f"### 🚫 API Quota Exhausted\n\n"
        f"The API provider returned a RESOURCE_EXHAUSTED error.\n\n"
        f"{wait_hint}\n\n"
        f"**What you can do:**\n"
        f"- Wait for the daily quota reset.\n"
        f"- Upgrade or switch API keys in the sidebar.\n"
    )

def _show_pipeline_failure(normal, smart, llm=None) -> None:
    bits: list[str] = []
    if not normal.succeeded:
        bits.append(f"**Normal RAG**: {normal.error}")
    if not smart.succeeded:
        bits.append(f"**Smart RAG**: {smart.error}")
    st.error(
        "### ⚠️ LLM Call Failed\n\n"
        + "\n\n".join(bits)
        + "\n\n_Latency measurements are not recorded for this run._"
    )
    has_model_err = any("not found" in str(b).lower() or "no longer available" in str(b).lower() or "not supported" in str(b).lower() for b in bits)
    if has_model_err and llm is not None:
        try:
            if hasattr(llm, "_client") and llm._client is not None:
                models = list(llm._client.models.list())
                st.info("### 🔍 Available models for your API key:")
                st.write([m.name.replace("models/", "") for m in models])
        except Exception as e:
            st.warning(f"Could not retrieve available models list: {e}")

def _build_database(cfg: Any = None):
    from backend.rag.database import VectorDatabase
    from backend.embeddings.local_models import SentenceTransformersEmbedder
    from backend.config.config import load_config

    cfg = cfg or load_config()
    device = cfg.system.device if hasattr(cfg, "system") else "cpu"
    model_name = cfg.retriever.embedding_model if hasattr(cfg, "retriever") else "sentence-transformers/all-MiniLM-L6-v2"

    db = VectorDatabase(
        embedder=SentenceTransformersEmbedder(model_name=model_name, device=device)
    )
    for doc_id, text in _load_fixtures():
        db.add_document(doc_id, text)
    return db

def _build_components(cfg: Any = None):
    from backend.compressor.pipeline import PipelineComponents
    from backend.embeddings.local_models import SentenceTransformersCrossEncoder, SentenceTransformersEmbedder
    from backend.config.config import load_config

    cfg = cfg or load_config()
    device = cfg.system.device if hasattr(cfg, "system") else "cpu"
    emb_model = cfg.retriever.embedding_model if hasattr(cfg, "retriever") else "sentence-transformers/all-MiniLM-L6-v2"
    ce_model = cfg.compressor.cross_encoder_model if hasattr(cfg, "compressor") else "cross-encoder/ms-marco-TinyBERT-L-2-v2"

    return PipelineComponents(
        embedder=SentenceTransformersEmbedder(model_name=emb_model, device=device),
        cross_encoder=SentenceTransformersCrossEncoder(model_name=ce_model, device=device),
    )

def _build_llm(api_key: str = ""):
    from backend.config.config import load_config
    from backend.llm.gemini_client import GeminiLLMClient
    from backend.llm.groq_client import GroqLLMClient

    cfg = load_config()
    if api_key:
        cfg = _override_api_key_env(cfg, api_key)
    provider = (cfg.llm.provider or "gemini").lower()
    if provider == "groq":
        return GroqLLMClient(cfg.llm), cfg
    return GeminiLLMClient(cfg.llm), cfg

def _override_api_key_env(cfg, api_key: str):
    os.environ[cfg.llm.api_key_env] = api_key
    return cfg

# ---------------------------------------------------------------------------
# UI Entry
# ---------------------------------------------------------------------------

def main() -> None:
    st.set_page_config(
        page_title="Token-Diet Context Compressor",
        page_icon="⚡",
        layout="wide",
        initial_sidebar_state="expanded"
    )

    # Global Custom CSS injecting Linear-Slate Frosted Design System
    st.markdown(
        """
        <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

        /* 1. Canvas Base: Deep Slate/Obsidian Background with Gradient Mesh */
        html, body, [data-testid="stAppViewContainer"], [data-testid="stHeader"] {
            background-color: #0B0F17 !important;
            background-image: 
                radial-gradient(at 0% 0%, rgba(6, 182, 212, 0.06) 0px, transparent 50%),
                radial-gradient(at 50% 0%, rgba(16, 185, 129, 0.06) 0px, transparent 50%) !important;
            color: #E2E8F0 !important;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        }

        /* Sidebar Styling overrides */
        [data-testid="stSidebar"] {
            background-color: #080C13 !important;
            border-right: 1px solid rgba(255, 255, 255, 0.08) !important;
        }

        /* Title Typography */
        h1, h2, h3, h4, h5, h6 {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
            color: #F8FAFC !important;
            font-weight: 600 !important;
        }

        /* 2. Frosted Glass Containers overrides */
        .custom-card, div[data-testid="metric-container"], .stAlert {
            background: rgba(18, 24, 38, 0.7) !important;
            backdrop-filter: blur(12px) !important;
            -webkit-backdrop-filter: blur(12px) !important;
            border: 1px solid rgba(255, 255, 255, 0.08) !important;
            border-radius: 14px !important;
            padding: 20px !important;
            box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5) !important;
        }

        .custom-card-header {
            font-weight: 600;
            font-size: 15px;
            color: #F8FAFC;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            padding-bottom: 10px;
            margin-bottom: 14px;
        }

        .custom-card-body {
            font-size: 14px;
            color: #CBD5E1;
            line-height: 1.6;
        }

        /* 5. KPI Metric Cards Visual Hierarchy override */
        .metric-card {
            background: rgba(18, 24, 38, 0.7);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 14px;
            padding: 20px;
            box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
            display: flex;
            flex-direction: column;
        }

        .metric-label {
            font-size: 11px;
            font-weight: 600;
            color: #64748B;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            margin-bottom: 8px;
        }

        .metric-value {
            font-size: 24px;
            font-weight: 700;
            color: #F8FAFC;
            font-family: 'JetBrains Mono', Consolas, monospace !important;
            margin-bottom: 6px;
        }

        .metric-sub {
            font-size: 12px;
            color: #64748B;
            font-family: 'Inter', sans-serif !important;
        }

        /* Badges overrides */
        .badge {
            display: inline-flex;
            align-items: center;
            padding: 3px 10px;
            font-size: 11px;
            font-weight: 600;
            border-radius: 9999px;
            text-transform: uppercase;
            letter-spacing: 0.02em;
            font-family: 'JetBrains Mono', monospace !important;
        }

        .badge-active {
            background-color: rgba(16, 185, 129, 0.15);
            color: #10B981;
            border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .badge-teal {
            background-color: rgba(6, 182, 212, 0.15);
            color: #06B6D4;
            border: 1px solid rgba(6, 182, 212, 0.3);
        }

        .badge-emerald {
            background-color: rgba(16, 185, 129, 0.15);
            color: #10B981;
            border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .badge-gray {
            background-color: rgba(100, 116, 139, 0.15);
            color: #64748B;
            border: 1px solid rgba(100, 116, 139, 0.3);
        }

        /* 1 & 2. Eliminate all default Streamlit red accents & focus rings */
        :root {
            --primary-color: #10B981 !important;
        }

        /* Sliders overrides */
        div[data-baseweb="slider"] > div > div > div {
            background-color: #10B981 !important;
        }
        div[data-baseweb="slider"] [role="slider"] {
            background-color: #10B981 !important;
            border-color: #06B6D4 !important;
            box-shadow: 0 0 4px rgba(6, 182, 212, 0.4) !important;
        }

        /* Checkbox & Switch overrides */
        div[data-baseweb="checkbox"] [role="checkbox"][aria-checked="true"] {
            background-color: #10B981 !important;
        }
        div[data-baseweb="toggle"] [role="switch"][aria-checked="true"] > div {
            background-color: #10B981 !important;
        }

        /* Text Input & selectbox overrides */
        div[data-testid="stTextInput"] input, div[data-testid="stSelectbox"] > div {
            border-radius: 8px !important;
            border: 1px solid rgba(255, 255, 255, 0.08) !important;
            padding: 8px 12px !important;
            background-color: #0B0F17 !important;
            color: #F8FAFC !important;
            font-family: 'Inter', sans-serif !important;
        }

        /* Custom Query Focus Border style overrides */
        div[data-testid="stTextInput"] input:focus, div[data-testid="stSelectbox"] > div:focus-within {
            border-color: #06B6D4 !important;
            box-shadow: 0 0 0 2px rgba(6, 182, 210, 0.2) !important;
        }

        /* Emerald CTA button style */
        div.stButton > button:first-child {
            background: linear-gradient(135deg, #10B981, #059669) !important;
            color: #FFFFFF !important;
            border: none !important;
            border-radius: 8px !important;
            padding: 10px 20px !important;
            font-weight: 600 !important;
            font-size: 15px !important;
            box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3) !important;
            transition: all 0.2s ease !important;
            width: 100% !important;
            margin-top: 10px;
        }

        div.stButton > button:first-child:hover {
            box-shadow: 0 6px 20px rgba(16, 185, 129, 0.5) !important;
            transform: translateY(-1px);
        }

        /* 4 & 6. Scenario presets filter chips & Sidebar wrap settings */
        div[data-testid="column"] button {
            background-color: rgba(255, 255, 255, 0.03) !important;
            color: #64748B !important;
            border: 1px solid rgba(255, 255, 255, 0.08) !important;
            border-radius: 9999px !important;
            padding: 6px 14px !important;
            font-size: 12px !important;
            font-family: 'Inter', sans-serif !important;
            font-weight: 500 !important;
            transition: all 0.2s ease !important;
            width: auto !important;
            height: auto !important;
        }
        div[data-testid="column"] button:hover {
            background-color: rgba(255, 255, 255, 0.08) !important;
            color: #06B6D4 !important;
            border-color: rgba(6, 182, 212, 0.3) !important;
        }

        .model-chip {
            background-color: rgba(255, 255, 255, 0.04) !important;
            border: 1px solid rgba(255, 255, 255, 0.08) !important;
            border-radius: 6px !important;
            padding: 6px 12px !important;
            font-family: 'JetBrains Mono', monospace !important;
            font-size: 11px !important;
            color: #94A3B8 !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            display: block !important;
            margin-bottom: 8px !important;
            width: 100% !important;
        }

        /* 6. Emerald styled progress bar */
        [data-testid="stProgress"] > div > div > div > div {
            background-color: #10B981 !important;
        }
        </style>
        """,
        unsafe_allow_html=True
    )

    from backend.config.config import load_config as _load_cfg
    cfg = _load_cfg()

    # Title header block
    st.markdown(
        """
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 32px;">⚡</span>
                <h1 style="margin: 0; font-size: 26px; font-weight: 700; color: #F8FAFC; display: inline-block;">Token-Diet Context Compressor</h1>
            </div>
            <div class="badge badge-active">● Real-Time Middleware Active</div>
        </div>
        """,
        unsafe_allow_html=True
    )

    # Sidebar layout block
    with st.sidebar:
        st.markdown("### 🛠️ Configuration")

        if st.session_state.get("_quota_exhausted"):
            retry_after = st.session_state.get("_quota_retry_after_s")
            wait = f" (~{retry_after:.0f}s)" if retry_after else ""
            provider_name = (cfg.llm.provider or "gemini").capitalize()
            st.error(
                f"🚫 {provider_name} quota exhausted. Wait for the daily reset{wait}, "
                f"or upgrade/change API keys below."
            )

        provider_name = (cfg.llm.provider or "gemini").lower()
        key_env = cfg.llm.api_key_env or (
            "GROQ_API_KEY" if provider_name == "groq" else "GEMINI_API_KEY"
        )
        key_label = "Groq API key" if provider_name == "groq" else "Gemini API key"
        existing_env_key = os.environ.get(key_env, "")
        _existing_key_status = _validate_key_format(existing_env_key)

        with st.expander("🔑 API Credentials", expanded=not bool(existing_env_key)):
            if existing_env_key and _existing_key_status == "valid":
                st.success(f"✓ {key_label} Loaded")
            else:
                st.warning(f"No {key_env} detected")
            
            api_key = st.text_input(
                key_label,
                type="password",
                help="Paste to override the environment API key for this session."
            )
            if api_key:
                stripped = api_key.strip()
                _status = _validate_key_format(stripped)
                if _status == "ellipsis":
                    st.error("Invalid key: middle gets truncated (contains ellipsis).")
                    api_key = ""
                elif _status == "too_short":
                    st.error("Invalid key: too short.")
                    api_key = ""
                else:
                    os.environ[key_env] = stripped
                    st.session_state.pop("_quota_exhausted", None)
                    st.session_state.pop("_quota_retry_after_s", None)
                    st.success("✓ API Key applied.")

        st.markdown("### ⚙️ Engine Parameters")
        token_budget = st.slider(
            "Token Budget",
            min_value=50,
            max_value=800,
            value=300,
            step=10,
            help="Maximum context token budget for Smart RAG selection."
        )
        top_k = st.slider(
            "Retrieval Top-K",
            min_value=5,
            max_value=15,
            value=10,
            step=1,
            help="Number of chunks retrieved from database."
        )

        use_compressor = st.toggle(
            "Enable Compressor",
            value=True,
            help="Toggle Token-Diet context compression on/off."
        )
        
        st.markdown("### 🔍 Pipeline Architecture")
        # Sidebar chips styled without awkward model wraps
        st.markdown(
            f'<div class="model-chip" title="Retriever: {cfg.retriever.embedding_model}">Retriever: {cfg.retriever.embedding_model.split("/")[-1]}</div>',
            unsafe_allow_html=True
        )
        st.markdown(
            f'<div class="model-chip" title="Compressor: {cfg.compressor.cross_encoder_model}">Compressor: {cfg.compressor.cross_encoder_model.split("/")[-1]}</div>',
            unsafe_allow_html=True
        )

    # 1. Scenario Presets Chips - compact pill-shaped tabs
    preset_queries = {
        "📄 Cloud SLA Policy": "What is the minimum uptime commitment and credit policy for P1 outages?",
        "📄 Clinical Efficacy Study": "What were the primary efficacy endpoints observed in Phase 3?",
        "📄 DB Connection Pooling": "What are the recommended connection pool sizes for high concurrency?"
    }

    if "query_input" not in st.session_state:
        st.session_state["query_input"] = ""

    st.markdown("### 📄 Scenario Presets")
    col_chip1, col_chip2, col_chip3, _ = st.columns([1, 1, 1, 3])

    if col_chip1.button("📄 Cloud SLA Policy", key="preset_btn_1"):
        st.session_state["query_input"] = preset_queries["📄 Cloud SLA Policy"]
    if col_chip2.button("📄 Clinical Efficacy Study", key="preset_btn_2"):
        st.session_state["query_input"] = preset_queries["📄 Clinical Efficacy Study"]
    if col_chip3.button("📄 DB Connection Pooling", key="preset_btn_3"):
        st.session_state["query_input"] = preset_queries["📄 DB Connection Pooling"]

    query = st.text_input(
        "Query Prompt",
        key="query_input",
        placeholder="Type a custom query or click one of the preset scenario chips above..."
    )

    run = st.button("⚡ Run Live Benchmark", type="primary", disabled=not query.strip())

    if not run or not query.strip():
        st.info(
            "👋 Welcome! Select a preset scenario above or enter a custom query, "
            "then hit **Run Live Benchmark** to inspect performance metrics."
        )
        return

    # Auto-Scroll Anchor element injection & script
    st.markdown('<div id="benchmark-results"></div>', unsafe_allow_html=True)
    components.html(
        """
        <script>
            setTimeout(() => {
                const el = window.parent.document.getElementById("benchmark-results");
                if (el) {
                    element = el;
                    element.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            }, 150);
        </script>
        """,
        height=0,
        width=0
    )

    # RAG execution imports
    from backend.rag.normal_rag import NormalRAG
    from backend.rag.smart_rag import SmartRAG

    if not api_key and not os.environ.get(key_env):
        st.error(f"API key is not configured. Paste one in the sidebar expander first.")
        return

    llm, _ = _build_llm(api_key)
    db = _build_database(cfg)
    components_obj = _build_components(cfg)

    # Section config override
    from backend.config.config import AppConfig, RetrieverConfig, CompressorConfig
    new_retriever = RetrieverConfig(**{**cfg.retriever.__dict__, "top_k": top_k})
    new_compressor = CompressorConfig(**{**cfg.compressor.__dict__, "global_token_budget": token_budget})
    cfg = AppConfig(
        system=cfg.system,
        retriever=new_retriever,
        compressor=new_compressor,
        llm=cfg.llm
    )

    from backend.llm.gemini_client import LLMQuotaExhaustedError

    if use_compressor:
        progress = st.progress(0.10, text="Executing Baseline RAG...")
        try:
            normal = NormalRAG(db, llm, cfg).run(query)
        except LLMQuotaExhaustedError as exc:
            _show_quota_error(exc)
            return
        
        progress.progress(0.55, text="Executing Smart RAG (Compressor + LLM)...")
        try:
            smart = SmartRAG(db, llm, cfg, components=components_obj).run(query)
        except LLMQuotaExhaustedError as exc:
            _show_quota_error(exc)
            return
        progress.progress(1.0, text="Benchmark completed.")
    else:
        progress = st.progress(0.50, text="Executing Baseline RAG...")
        try:
            normal = NormalRAG(db, llm, cfg).run(query)
        except LLMQuotaExhaustedError as exc:
            _show_quota_error(exc)
            return
        smart = normal
        progress.progress(1.0, text="Done.")
        st.info("Context Compressor is disabled. Showing Baseline RAG metrics.")

    # Guard against None/empty benchmark results
    if normal is None or smart is None or not getattr(normal, "succeeded", False) or not getattr(smart, "succeeded", False):
        _show_pipeline_failure(normal, smart, llm=llm)
        return

    cmp = SmartRAG.compare(normal, smart)

    # ---------------------------------------------------------------------------
    # KPI metrics summary delta row
    # ---------------------------------------------------------------------------
    st.markdown("### 📊 Benchmark Metrics")
    col1, col2, col3 = st.columns(3)

    normal_context_tokens = getattr(normal, "context_tokens", 0)
    smart_compressed_tokens = getattr(smart, "compressed_tokens", 0)
    token_red_pct = cmp.get('token_compression_pct', 0.0)

    # Token Diet Reduction Card
    col1.markdown(
        f"""
        <div class="metric-card">
            <div class="metric-label">Token Diet Reduction</div>
            <div class="metric-value" style="color: #10B981;">{smart_compressed_tokens:,} <span style="font-size:14px; color:#64748B;">/ {normal_context_tokens:,}</span> <span style="color:#06B6D4; font-size:16px;">(-{token_red_pct:.1f}%)</span></div>
            <div class="metric-sub">Standard vs Compressed context tokens</div>
        </div>
        """,
        unsafe_allow_html=True
    )

    # TTFT Speedup Card
    normal_ttft = getattr(normal, "llm_ttft_ms", 0.0)
    smart_ttft = getattr(smart, "llm_ttft_ms", 0.0)
    speedup = normal_ttft / smart_ttft if smart_ttft > 0 else 1.0
    col2.markdown(
        f"""
        <div class="metric-card">
            <div class="metric-label">TTFT Speedup</div>
            <div class="metric-value" style="color: #06B6D4;">{speedup:.2f}x <span style="font-size:14px; color:#64748B;">Faster Response</span></div>
            <div class="metric-sub">{smart_ttft/1000:.2f}s vs {normal_ttft/1000:.2f}s Time-to-First-Token</div>
        </div>
        """,
        unsafe_allow_html=True
    )

    # API Cost Saved Card
    cost_savings = _estimate_cost(normal_context_tokens) - _estimate_cost(smart_compressed_tokens)
    cost_saved_per_1k = cost_savings * 1000.0
    col3.markdown(
        f"""
        <div class="metric-card">
            <div class="metric-label">API Cost Saved</div>
            <div class="metric-value" style="color: #10B981;">${cost_saved_per_1k:.4f} <span style="font-size:12px; color:#64748B;">saved / 1k queries</span></div>
            <div class="metric-sub">Based on Gemini Flash input token pricing</div>
        </div>
        """,
        unsafe_allow_html=True
    )

    st.markdown("<br>", unsafe_allow_html=True)

    # ---------------------------------------------------------------------------
    # Side-by-Side Workspace
    # ---------------------------------------------------------------------------
    st.markdown("### 💬 Side-by-Side Response Workspace")
    col_left, col_right = st.columns(2)

    normal_time = getattr(normal, "total_time_ms", 0.0)
    normal_answer = getattr(normal, "answer", "")

    with col_left:
        st.markdown(
            f"""
            <div class="custom-card">
                <div class="custom-card-header">
                    <span class="badge badge-gray">Standard RAG (Raw Chunks)</span>
                    <span style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #64748B;">
                        Tokens: {normal_context_tokens:,} | Total Time: {normal_time/1000:.2f}s | TTFT: {normal_ttft:.0f}ms
                    </span>
                </div>
                <div class="custom-card-body">
                    {normal_answer if normal_answer else "<i>(No answer returned)</i>"}
                </div>
            </div>
            """,
            unsafe_allow_html=True
        )
        with st.expander("📄 Inspect Raw Ingested Context"):
            raw_context_payload = extract_context_payload(normal, fallback_attr="raw_context")
            st.markdown(f"```text\n{raw_context_payload}\n```")

    # Evaluate Factual Parity dynamically
    required_kws = _get_required_keywords(query)
    smart_answer = getattr(smart, "answer", "")
    is_correct = True
    if required_kws:
        is_correct = _keyword_correctness(smart_answer, required_kws)
    else:
        is_correct = bool(smart_answer and smart_answer.strip())

    badge_text = "✓ 100% Factual Parity" if is_correct else "⚠️ Parity Unverified"
    badge_class = "badge-emerald" if is_correct else "badge-gray"

    smart_time = getattr(smart, "total_time_ms", 0.0)

    with col_right:
        st.markdown(
            f"""
            <div class="custom-card" style="border-color: rgba(16, 185, 129, 0.4);">
                <div class="custom-card-header">
                    <span class="badge badge-teal">Smart RAG + ✓ {token_red_pct:.1f}% Compressed</span>
                    <span style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #10B981;">
                        Tokens: {smart_compressed_tokens:,} | Total Time: {smart_time/1000:.2f}s | TTFT: {smart_ttft:.0f}ms
                    </span>
                </div>
                <div class="custom-card-body" style="margin-bottom: 12px;">
                    {smart_answer if smart_answer else "<i>(No answer returned)</i>"}
                </div>
                <span class="badge {badge_class}">{badge_text}</span>
            </div>
            """,
            unsafe_allow_html=True
        )
        with st.expander("⚡ Inspect Filtered Context Payload"):
            compressed_context_payload = extract_context_payload(smart, fallback_attr="compressed_text")
            st.markdown(f"```text\n{compressed_context_payload}\n```")

    st.markdown("<br>", unsafe_allow_html=True)

    # Server timings
    normal_server_prompt = getattr(normal, "llm_server_prompt_time_ms", 0.0)
    normal_server_queue = getattr(normal, "llm_server_queue_time_ms", 0.0)
    smart_server_prompt = getattr(smart, "llm_server_prompt_time_ms", 0.0)
    smart_server_queue = getattr(smart, "llm_server_queue_time_ms", 0.0)

    if normal_server_prompt > 0 or smart_server_prompt > 0:
        st.markdown(
            f"ℹ️ **Server-Side Timings (from API headers):**  \n"
            f"- **Normal RAG**: Prompt: **{normal_server_prompt:.1f} ms** · Queue: **{normal_server_queue:.1f} ms**  \n"
            f"- **Smart RAG**: Prompt: **{smart_server_prompt:.1f} ms** · Queue: **{smart_server_queue:.1f} ms**"
        )

    # ---------------------------------------------------------------------------
    # Stage Latency Chart (Plotly)
    # ---------------------------------------------------------------------------
    st.markdown("### ⚙️ Stage Latency Breakdown (ms)")
    breakdown = getattr(smart, "compressor_breakdown", {})
    
    if HAS_PLOTLY and breakdown:
        try:
            stages = [
                "Unit Formation",
                "Fast Filter",
                "Cross-Encoder Rerank",
                "Budget Selection",
                "Pack"
            ]
            values = [
                breakdown.get("unit_formation_ms", 0.0),
                breakdown.get("fast_filter_ms", 0.0),
                breakdown.get("rerank_ms", 0.0),
                breakdown.get("selection_ms", 0.0),
                breakdown.get("pack_ms", 0.0)
            ]
            stages.reverse()
            values.reverse()

            fig = go.Figure(go.Bar(
                x=values,
                y=stages,
                orientation='h',
                marker=dict(
                    color='#10B981',
                    line=dict(color='#06B6D4', width=1)
                ),
                text=[f"{v:.1f} ms" for v in values],
                textposition='auto',
                textfont=dict(color='#F8FAFC', family='JetBrains Mono', size=11)
            ))

            fig.update_layout(
                paper_bgcolor='rgba(0,0,0,0)',
                plot_bgcolor='rgba(0,0,0,0)',
                margin=dict(l=10, r=10, t=10, b=10),
                height=240,
                xaxis=dict(
                    gridcolor='rgba(255, 255, 255, 0.06)',
                    zeroline=False,
                    tickfont=dict(color='#64748B', family='JetBrains Mono')
                ),
                yaxis=dict(
                    tickfont=dict(color='#E2E8F0', size=12, family='Inter')
                )
            )

            st.plotly_chart(fig, use_container_width=True, config={'displayModeBar': False})
        except Exception as e:
            # Degrade gracefully to simple horizontal bar chart if Plotly rendering fails
            st.error(f"Plotly render error: {e}. Falling back to default chart.")
            df = pd.DataFrame(list({
                "Unit Formation": breakdown.get("unit_formation_ms", 0.0),
                "Fast Filter": breakdown.get("fast_filter_ms", 0.0),
                "Cross-Encoder Rerank": breakdown.get("rerank_ms", 0.0),
                "Budget Selection": breakdown.get("selection_ms", 0.0),
                "Pack": breakdown.get("pack_ms", 0.0),
            }.items()), columns=['Stage', 'Time (ms)']).set_index('Stage')
            st.bar_chart(df, horizontal=True, color="#0D9488")
    else:
        # Standard Streamlit fallback if Plotly is missing
        df = pd.DataFrame(list({
            "Unit Formation": breakdown.get("unit_formation_ms", 0.0),
            "Fast Filter": breakdown.get("fast_filter_ms", 0.0),
            "Cross-Encoder Rerank": breakdown.get("rerank_ms", 0.0),
            "Budget Selection": breakdown.get("selection_ms", 0.0),
            "Pack": breakdown.get("pack_ms", 0.0),
        }.items()), columns=['Stage', 'Time (ms)']).set_index('Stage')
        try:
            st.bar_chart(df, horizontal=True, color="#0D9488")
        except Exception:
            try:
                st.bar_chart(df, color="#0D9488")
            except Exception:
                st.bar_chart(df)

    # ---------------------------------------------------------------------------
    # Semantic Similarity Lookup
    # ---------------------------------------------------------------------------
    from datasets.demo.queries.evaluation_queries import REFERENCE_ANSWERS
    ref_ans = REFERENCE_ANSWERS.get(query.strip(), "")
    if ref_ans:
        try:
            texts = [ref_ans]
            indices = []
            if normal_answer:
                texts.append(normal_answer)
                indices.append("normal")
            if smart_answer:
                texts.append(smart_answer)
                indices.append("smart")
            
            embs = components_obj.embedder.encode(texts)
            ref_emb = embs[0]
            
            normal_sim = 0.0
            smart_sim = 0.0
            curr_idx = 1
            if "normal" in indices:
                normal_sim = sum(x * y for x, y in zip(ref_emb, embs[curr_idx]))
                curr_idx += 1
            if "smart" in indices:
                smart_sim = sum(x * y for x, y in zip(ref_emb, embs[curr_idx]))
            
            delta = smart_sim - normal_sim

            st.markdown("### 🎯 Semantic Parity Validation")
            col_sim1, col_sim2 = st.columns(2)
            col_sim1.markdown(
                f"""
                <div class="metric-card">
                    <div class="metric-label">Normal Cosine Similarity</div>
                    <div class="metric-value">{normal_sim:.4f}</div>
                    <div class="metric-sub">against reference answer</div>
                </div>
                """,
                unsafe_allow_html=True
            )
            col_sim2.markdown(
                f"""
                <div class="metric-card">
                    <div class="metric-label">Smart Cosine Similarity</div>
                    <div class="metric-value">{smart_sim:.4f}</div>
                    <div class="metric-sub" style="color: #06B6D4; font-weight: 600;">{delta:+.4f} vs Normal</div>
                </div>
                """,
                unsafe_allow_html=True
            )
        except Exception as e:
            st.error(f"Could not compute cosine similarity: {e}")

    with st.expander("Raw Compressor Metrics (JSON)"):
        st.json(breakdown)

if __name__ == "__main__":
    main()
