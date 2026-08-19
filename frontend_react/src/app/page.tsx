"use client";

import React, { useState, useEffect } from "react";
import { ScenarioSelector } from "../components/ScenarioSelector";
import { ExecutionBar } from "../components/ExecutionBar";
import { KPICardsGrid } from "../components/KPICard";
import { ResponseWorkspace } from "../components/ResponseWorkspace";
import { StageBreakdownChart } from "../components/StageBreakdownChart";
import { BenchmarkResponse } from "../types/benchmark";
import { KeyRound, Sliders, Settings, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [tokenBudget, setTokenBudget] = useState(300);
  const [topK, setTopK] = useState(10);
  const [useCompressor, setUseCompressor] = useState(true);
  const [apiKey, setApiKey] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<BenchmarkResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showInternals, setShowInternals] = useState(false);

  // Preset Selection direct assignment
  const handleSelectPreset = (name: string, queryText: string) => {
    setActivePreset(name);
    setQuery(queryText);
  };

  // Smooth scroll specifically centering the side-by-side comparison
  useEffect(() => {
    if (data) {
      const timer = setTimeout(() => {
        const el = document.getElementById("benchmark-results-container");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100); // Trigger instantly on data arrival
      return () => clearTimeout(timer);
    }
  }, [data]);

  // Run the benchmark request
  const handleRunBenchmark = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    setError(null);
    setData(null);
    setShowInternals(false);

    try {
      const res = await fetch("http://localhost:8000/api/run-benchmark", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          document_id: null,
          token_budget: tokenBudget,
          top_k: topK,
          enable_compressor: useCompressor,
          api_key: apiKey || null,
        }),
      });

      if (!res.ok) {
        const errDetail = await res.json();
        console.error("Benchmark API Error (status non-200):", errDetail);
        throw new Error(errDetail.detail || "Server failed to execute benchmark query.");
      }

      const payload: BenchmarkResponse = await res.json();
      console.log("Backend response payload:", payload);
      if (payload.error) {
        throw new Error(payload.error);
      }
      setData(payload);
    } catch (e: any) {
      console.error("Benchmark exception caught:", e);
      setError(e.message || "An unexpected error occurred during execution.");
    } finally {
      setIsLoading(false);
    }
  };

  // Extract preset keywords dynamically for parity checker
  const getKeywords = () => {
    if (!query) return [];
    if (query.includes("uptime")) return ["99.99%", "credit", "outage"];
    if (query.includes("efficacy")) return ["14.2 mmHg", "efficacy", "blood pressure"];
    if (query.includes("connection pool")) return ["20 to 50", "80 to 100", "pooling"];
    return [];
  };

  return (
    <div className="flex min-h-screen bg-obsidian text-slate-100 font-sans selection:bg-emerald-accent/20 selection:text-emerald-accent relative">
      {/* 1. Sidebar Panel */}
      <aside className="w-80 shrink-0 bg-[#08080A] border-r border-white/5 p-6 flex flex-col justify-between hidden md:flex">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-accent/10 border border-emerald-accent/25 rounded-lg text-emerald-accent">
              <Settings size={18} />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-200 font-display tracking-wide uppercase">Token-Diet</h2>
              <p className="text-[9px] text-[#94A3B8] font-semibold uppercase tracking-widest">Operator Panel</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Credentials expandable section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#94A3B8] font-display">
                <KeyRound size={13} className="text-cyan-accent" />
                <span>API Credentials</span>
              </div>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Session API Key override..."
                className="w-full bg-[#0A0A0C] text-slate-200 placeholder-[#64748B] rounded-lg px-3 py-2 border border-white/8 focus:outline-none focus:border-cyan-accent text-xs font-mono focus:ring-1 focus:ring-cyan-accent/30"
              />
              <p className="text-[10px] text-[#94A3B8] leading-tight">
                Overrides environment keys locally for this workspace session. Never stored.
              </p>
            </div>

            {/* Sliders and Toggles */}
            <div className="space-y-5 pt-4 border-t border-white/5 font-display">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-1">
                <Sliders size={13} className="text-cyan-accent" />
                <span>Engine Parameters</span>
              </div>

              {/* Slider 1: Token Budget */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[#94A3B8]">Token Budget</span>
                  <span className="text-emerald-accent font-semibold">{tokenBudget}</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="800"
                  step="10"
                  value={tokenBudget}
                  onChange={(e) => setTokenBudget(parseInt(e.target.value))}
                  className="w-full accent-emerald-accent cursor-pointer h-1 bg-white/10 rounded-lg appearance-none"
                />
              </div>

              {/* Slider 2: Retrieval Top-K */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[#94A3B8]">Retrieval Top-K</span>
                  <span className="text-emerald-accent font-semibold">{topK}</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="15"
                  step="1"
                  value={topK}
                  onChange={(e) => setTopK(parseInt(e.target.value))}
                  className="w-full accent-emerald-accent cursor-pointer h-1 bg-white/10 rounded-lg appearance-none"
                />
              </div>

              {/* Toggle: Compressor Switch */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-[#94A3B8]">Enable Compressor</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useCompressor}
                    onChange={(e) => setUseCompressor(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-400 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-accent peer-checked:after:bg-white peer-checked:after:border-white"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Footer info details */}
        <div className="border-t border-white/5 pt-4 text-[10px] text-[#94A3B8] font-mono space-y-1">
          <div>Embedding: all-MiniLM-L6-v2</div>
          <div>Reranker: ms-marco-TinyBERT</div>
        </div>
      </aside>

      {/* 2. Main Content Board */}
      <main className="flex-1 overflow-y-auto px-8 py-8 md:px-12">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/5 pb-5">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2 font-display">
                <span>Token-Diet Context Compressor</span>
              </h1>
              <p className="text-xs text-[#94A3B8] mt-1">
                Optimizing RAG payload sizes to accelerate time-to-first-token & reduce API costs.
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-accent/10 border border-emerald-accent/20 rounded-full text-[10px] font-semibold text-emerald-accent tracking-wide uppercase select-none font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-accent animate-pulse" />
              <span>Real-Time Middleware Active</span>
            </div>
          </div>

          {/* Scenario presets Chips selector */}
          <div>
            <ScenarioSelector activePreset={activePreset} onSelectPreset={handleSelectPreset} />
          </div>

          {/* Sticky Pinned ExecutionBar Container */}
          <div className="sticky top-0 z-40 bg-obsidian py-4 border-b border-white/5">
            <ExecutionBar
              query={query}
              setQuery={(val) => {
                setQuery(val);
                setActivePreset(null);
              }}
              isLoading={isLoading}
              onExecute={handleRunBenchmark}
            />
          </div>

          {/* Error Alert Box */}
          {error && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex gap-3 text-amber-400">
              <AlertCircle className="shrink-0 mt-0.5" size={16} />
              <div className="text-xs leading-relaxed">
                <span className="font-bold">Attention Required:</span> {error}
              </div>
            </div>
          )}

          {/* Active Query Display Card */}
          {query && (
            <div className="bg-slate-card/20 border border-white/5 rounded-xl p-4 text-xs text-slate-text font-mono shadow-md">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-accent block mb-1 font-display">Active Benchmark Query</span>
              &ldquo;{query}&rdquo;
            </div>
          )}

          {/* Hero Results payoff zone */}
          {data && (
            <div className="space-y-8">
              {/* KPI Summary metrics grid */}
              <div>
                <KPICardsGrid
                  originalTokens={data.baseline.tokens}
                  compressedTokens={data.smart?.tokens || 0}
                  compressionPct={data.metrics.token_reduction_pct}
                  normalTtft={data.baseline.ttft_ms}
                  smartTtft={data.smart?.ttft_ms || 0}
                  savingsPer1k={data.metrics.cost_saved_usd * 1000}
                />
              </div>

              {/* Workspace comparison */}
              <div id="benchmark-results-container" className="pt-2">
                <ResponseWorkspace
                  baseline={data.baseline}
                  smart={data.smart}
                  requiredKeywords={getKeywords()}
                />
              </div>

              {/* Collapsible Pipeline Internals Deep-dive zone (progressive disclosure) */}
              {data.smart && (
                <div className="bg-slate-card/30 border border-white/5 rounded-2xl overflow-hidden mt-6 shadow-2xl">
                  <button
                    onClick={() => setShowInternals(!showInternals)}
                    className="w-full flex items-center justify-between px-6 py-4 text-xs font-bold text-[#94A3B8] hover:text-slate-100 transition-colors focus:outline-none font-display border-b border-white/5 bg-[#0B0F17]/40 cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Settings className="text-cyan-accent" size={15} />
                      <span>PIPELINE INTERNALS & DIAGNOSTIC DATA</span>
                    </span>
                    {showInternals ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>

                  {showInternals && (
                    <div className="p-6 space-y-6 overflow-hidden">
                      {/* 1. Timings chart */}
                      <StageBreakdownChart breakdown={data.stage_timings_ms} />

                      {/* 2. Side-by-side Context comparisons */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider font-display">📄 Raw Ingested Context</span>
                          <pre className="whitespace-pre-wrap overflow-auto max-h-72 font-mono text-[11px] text-slate-300 bg-black/40 border border-white/5 rounded-lg p-4 select-text">
                            {data.baseline.raw_context || (data.baseline as any).context || (data.baseline as any).raw_text || "No raw context."}
                          </pre>
                        </div>
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider font-display">⚡ Filtered Context Payload</span>
                          <pre className="whitespace-pre-wrap overflow-auto max-h-72 font-mono text-[11px] text-slate-300 bg-black/40 border border-white/5 rounded-lg p-4 select-text">
                            {data.smart.compressed_text || (data.smart as any).compressed_context || (data.smart as any).compressed_text_payload || "No compressed context."}
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
