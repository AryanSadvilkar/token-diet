"use client";

import React from "react";
import { Sparkles, Trash2, ArrowRight } from "lucide-react";
import { BaselineRAGResponse, SmartRAGResponse } from "../types/benchmark";

interface ResponseWorkspaceProps {
  baseline: BaselineRAGResponse;
  smart: SmartRAGResponse | null;
  requiredKeywords: string[];
}

export const ResponseWorkspace: React.FC<ResponseWorkspaceProps> = ({
  baseline,
  smart,
  requiredKeywords,
}) => {
  // Extract answers fallback
  const baselineAnswer =
    (baseline as any)?.answer ||
    (baseline as any)?.response ||
    (baseline as any)?.generated_text ||
    "";

  const smartAnswer =
    (smart as any)?.answer ||
    (smart as any)?.response ||
    (smart as any)?.generated_text ||
    (smart as any)?.compressed_text ||
    "";

  // Helper function to highlight keywords inside answers (for visual parity checks)
  const highlightKeywords = (text: string) => {
    if (!text) return "No output generated.";
    if (!requiredKeywords || requiredKeywords.length === 0) return text;

    let highlighted = text;
    requiredKeywords.forEach((kw) => {
      if (!kw.trim()) return;
      const regex = new RegExp(`(${kw})`, "gi");
      highlighted = highlighted.replace(regex, '<mark class="bg-cyan-accent/20 border-b border-cyan-accent text-cyan-accent px-0.5">$1</mark>');
    });

    return <span dangerouslySetInnerHTML={{ __html: highlighted }} />;
  };

  // Determine token sizes to detect if budget is exceeded
  const normalTokens = baseline?.tokens || 0;
  const smartTokens = smart?.tokens || 0;
  const isMismatch = smartAnswer !== baselineAnswer && smartAnswer !== "" && baselineAnswer !== "";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* 1. Left Card: Standard RAG (Baseline) */}
      <div className="scroll-reveal-workspace-card flex flex-col space-y-4">
        <div className="bg-slate-card/60 border border-white/8 rounded-2xl p-6 shadow-xl flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/8 pb-4 mb-4">
              <span className="badge badge-gray text-xs font-mono">
                Standard RAG (Raw Chunks)
              </span>
              <span className="font-mono text-xs text-slate-text">
                {baseline.tokens} Tokens | {baseline.latency_s.toFixed(2)}s | TTFT: {baseline.ttft_ms.toFixed(0)}ms
              </span>
            </div>

            {/* Answer Display */}
            <div className="text-sm leading-relaxed text-slate-200 min-h-[140px] select-text">
              {baselineAnswer ? (
                <p className="whitespace-pre-line">{baselineAnswer}</p>
              ) : (
                <p className="text-[#94A3B8] italic">No output generated.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Right Card: Smart RAG (Token-Diet) */}
      {smart ? (
        <div className="scroll-reveal-workspace-card flex flex-col space-y-4">
          <div className="bg-slate-card/60 border border-white/8 rounded-2xl p-6 shadow-xl flex-1 flex flex-col justify-between"
               style={{ borderColor: isMismatch ? "rgba(100, 116, 139, 0.4)" : "rgba(16, 185, 129, 0.4)" }}
          >
            <div>
              <div className="flex items-center justify-between border-b border-white/8 pb-4 mb-4">
                <span className="badge badge-green text-xs font-mono flex items-center gap-1.5">
                  <Sparkles size={11} className="text-emerald-accent" />
                  <span>Smart RAG (Compressed)</span>
                </span>
                <span className="font-mono text-xs text-slate-text">
                  {smart.tokens} Tokens | {smart.latency_s.toFixed(2)}s | TTFT: {smart.ttft_ms.toFixed(0)}ms
                </span>
              </div>

              {/* Answer Display */}
              <div className="text-sm leading-relaxed text-slate-200 min-h-[140px] select-text">
                {smartAnswer ? (
                  <p className="whitespace-pre-line">{smartAnswer}</p>
                ) : (
                  <p className="text-[#94A3B8] italic">No output generated.</p>
                )}
              </div>
            </div>

            {/* Token size reduction percentage badge indicator */}
            {normalTokens > 0 && (
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-text">Token Budget Reduction</span>
                <span className="text-[#10B981] font-bold">
                  -{((1 - smartTokens / normalTokens) * 100).toFixed(0)}% Payload Cut
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-slate-card/20 border border-dashed border-white/8 rounded-2xl p-6 shadow-xl flex items-center justify-center min-h-[220px]">
          <div className="text-center space-y-2">
            <Sparkles size={24} className="text-[#64748B] mx-auto animate-pulse" />
            <p className="text-xs text-[#94A3B8]">Waiting for benchmark run results...</p>
          </div>
        </div>
      )}
    </div>
  );
};
