"use client";

import React from "react";
import { Zap, Coins, Shrink } from "lucide-react";

interface KPICardsGridProps {
  originalTokens: number;
  compressedTokens: number;
  compressionPct: number;
  normalTtft: number;
  smartTtft: number;
  savingsPer1k: number;
}

const TokenReductionDonut: React.FC<{ pct: number }> = ({ pct }) => {
  const radius = 30;
  const strokeWidth = 6.5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative h-24 w-24 flex items-center justify-center select-none">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="transparent"
          stroke="rgba(255, 255, 255, 0.04)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="transparent"
          stroke="#10B981"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="font-mono font-bold text-slate-100 text-xs">{pct.toFixed(1)}%</span>
        <span className="text-[7px] text-slate-text font-bold uppercase tracking-wider">Saved</span>
      </div>
    </div>
  );
};

export const KPICardsGrid: React.FC<KPICardsGridProps> = ({
  originalTokens,
  compressedTokens,
  compressionPct,
  normalTtft,
  smartTtft,
  savingsPer1k
}) => {
  const speedup = smartTtft > 0 ? normalTtft / smartTtft : 1.0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* 1. Token Diet Reduction */}
      <div className="scroll-reveal-card relative group bg-slate-card/60 border border-white/8 rounded-xl p-5 hover:border-emerald-accent/30 transition-colors duration-300 shadow-xl flex flex-col justify-between">
        <div className="absolute top-4 right-4 text-slate-accent opacity-80 group-hover:scale-110 transition-transform duration-300">
          <Shrink size={16} />
        </div>
        <div className="flex flex-col space-y-1">
          <span className="text-[10px] font-bold text-slate-text uppercase tracking-wider font-display">
            Token Diet Reduction
          </span>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="font-mono text-2xl font-bold text-[#10B981]">
              {compressedTokens}
            </span>
            <span className="text-xs text-slate-text font-mono">/ {originalTokens}</span>
          </div>
          <span className="text-xs text-slate-text pt-1">
            Optimized payload size reduction
          </span>
        </div>
      </div>

      {/* 2. Token Reduction Circular Donut visual card */}
      <div className="scroll-reveal-card relative group bg-slate-card/60 border border-white/8 rounded-xl p-5 hover:border-emerald-accent/30 transition-colors duration-300 shadow-xl flex items-center justify-between">
        <div className="flex flex-col space-y-1">
          <span className="text-[10px] font-bold text-slate-text uppercase tracking-wider font-display">
            Compression Ratio
          </span>
          <span className="text-[11px] text-slate-text leading-snug pt-1">
            Visual breakdown of cut vs remaining context tokens.
          </span>
        </div>
        <TokenReductionDonut pct={compressionPct} />
      </div>

      {/* 3. TTFT Speedup */}
      <div className="scroll-reveal-card relative group bg-slate-card/60 border border-white/8 rounded-xl p-5 hover:border-cyan-accent/30 transition-colors duration-300 shadow-xl flex flex-col justify-between">
        <div className="absolute top-4 right-4 text-slate-accent opacity-80 group-hover:scale-110 transition-transform duration-300">
          <Zap size={16} />
        </div>
        <div className="flex flex-col space-y-1">
          <span className="text-[10px] font-bold text-slate-text uppercase tracking-wider font-display">
            TTFT Acceleration
          </span>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="font-mono text-2xl font-bold text-cyan-accent">
              {speedup.toFixed(2)}x
            </span>
            <span className="text-xs text-slate-text">Faster Response</span>
          </div>
          <span className="text-xs text-slate-text pt-1 font-mono">
            {smartTtft.toFixed(0)}ms vs {normalTtft.toFixed(0)}ms TTFT
          </span>
        </div>
      </div>

      {/* 4. API Cost Saved (using Amber accent specifically for financial metrics) */}
      <div className="scroll-reveal-card relative group bg-slate-card/60 border border-white/8 rounded-xl p-5 hover:border-amber-accent/30 transition-colors duration-300 shadow-xl flex flex-col justify-between">
        <div className="absolute top-4 right-4 text-slate-accent opacity-80 group-hover:scale-110 transition-transform duration-300">
          <Coins size={16} />
        </div>
        <div className="flex flex-col space-y-1">
          <span className="text-[10px] font-bold text-slate-text uppercase tracking-wider font-display">
            API Cost Saved
          </span>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="font-mono text-2xl font-bold text-amber-accent">
              ${savingsPer1k.toFixed(4)}
            </span>
            <span className="text-xs text-slate-text">/ 1k queries</span>
          </div>
          <span className="text-xs text-slate-text pt-1">
            Calculated on input parameters
          </span>
        </div>
      </div>
    </div>
  );
};
