import React from 'react';
import { NavView, SessionStats } from '../../types';
import { Play, Layers, DollarSign, Zap, ArrowRight, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

interface CompareViewProps {
  stats: SessionStats;
  onNavigate: (view: NavView) => void;
}

export const CompareView: React.FC<CompareViewProps> = ({ stats, onNavigate }) => {
  const hasData = stats.totalCompressions > 0;

  // Session calculations
  const avgRawTokens = hasData ? Math.round(stats.totalRawTokens / stats.totalCompressions) : 0;
  const avgCompressedTokens = hasData ? Math.round(stats.totalCompressedTokens / stats.totalCompressions) : 0;
  
  // Cost per 1k queries assuming $2.50 per 1M tokens ($0.0025 per 1k tokens)
  const standardCostPer1k = hasData ? ((avgRawTokens * 1000) / 1000000 * 2.5).toFixed(2) : '0.00';
  const tokenDietCostPer1k = hasData ? ((avgCompressedTokens * 1000) / 1000000 * 2.5).toFixed(2) : '0.00';

  // Overall efficiency multiplier
  const efficiencyMultiplier = hasData && avgCompressedTokens > 0
    ? (avgRawTokens / avgCompressedTokens).toFixed(1)
    : '1.0';

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl">
      {/* Header */}
      <div className="space-y-2 border-b border-[#2A2A38] pb-5">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#F5F5F7] tracking-tight">
          Standard RAG vs. TokenDiet
        </h2>
        <p className="text-xs sm:text-sm text-[#9494A6]">
          Direct side-by-side performance benchmarking generated from your live session compressions.
        </p>
      </div>

      {!hasData ? (
        /* Placeholder State if no compressions have been run */
        <div className="bg-[#14141C] border border-[#2A2A38] rounded-[12px] p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-4">
          <div className="p-3.5 rounded-full bg-[#1C1C26] text-[#818CF8] border border-[#2A2A38]">
            <Sparkles className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-md">
            <h3 className="text-lg font-bold text-[#F5F5F7]">
              No Session Data Available Yet
            </h3>
            <p className="text-xs sm:text-sm text-[#9494A6]">
              Run a compression in Live Demo to see your real numbers here.
            </p>
          </div>
          <button
            onClick={() => onNavigate('demo')}
            className="bg-[#6EE7B7] hover:bg-[#80f9c8] text-[#0A0A0F] font-semibold text-xs uppercase tracking-wider px-6 py-3 rounded-[8px] flex items-center gap-2 cursor-pointer transition-all shadow-[0_0_15px_rgba(110,231,183,0.3)] active:scale-98"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Go to Live Demo</span>
          </button>
        </div>
      ) : (
        /* Real Session Comparison Grid */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* LEFT COLUMN: Standard RAG (muted gray/red styling) */}
            <div className="bg-[#14141C] border border-[#2A2A38] rounded-[12px] p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-[#2A2A38] pb-4">
                <div>
                  <div className="text-xs font-mono-code text-[#9494A6] uppercase tracking-wider">
                    Baseline Architecture
                  </div>
                  <div className="text-lg font-bold text-[#F5F5F7] mt-0.5">
                    Standard RAG
                  </div>
                </div>
                <span className="text-[10px] font-mono-code px-2.5 py-1 rounded-full bg-[#F87171]/15 text-[#F87171] border border-[#F87171]/30">
                  Uncompressed
                </span>
              </div>

              {/* Rows */}
              <div className="space-y-4 font-mono-code text-xs">
                {/* Avg tokens per query */}
                <div className="bg-[#0A0A0F] border border-[#2A2A38] rounded-[8px] p-3.5 flex items-center justify-between">
                  <span className="text-[#9494A6] font-sans">Avg tokens per query:</span>
                  <span className="text-sm font-bold text-[#F87171] tabular-nums">
                    {avgRawTokens.toLocaleString()} tokens
                  </span>
                </div>

                {/* Compression ratio */}
                <div className="bg-[#0A0A0F] border border-[#2A2A38] rounded-[8px] p-3.5 flex items-center justify-between">
                  <span className="text-[#9494A6] font-sans">Compression ratio:</span>
                  <span className="text-sm font-bold text-[#9494A6] tabular-nums">
                    1.0x (0% saved)
                  </span>
                </div>

                {/* Est cost per 1000 queries */}
                <div className="bg-[#0A0A0F] border border-[#2A2A38] rounded-[8px] p-3.5 flex items-center justify-between">
                  <span className="text-[#9494A6] font-sans">Est. cost per 1,000 queries:</span>
                  <span className="text-sm font-bold text-[#F87171] tabular-nums">
                    ${standardCostPer1k}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-[#9494A6] pt-2 border-t border-[#2A2A38] flex items-center gap-2">
                <ShieldAlert className="w-3.5 h-3.5 text-[#F87171]" />
                <span>Full context payload sent directly to LLM</span>
              </div>
            </div>

            {/* RIGHT COLUMN: TokenDiet (mint/indigo gradient glass styling) */}
            <div className="bg-gradient-to-b from-[#14141C] via-[#14141C] to-[#1C1C26] border border-[#6EE7B7]/40 rounded-[12px] p-6 space-y-6 shadow-[0_0_30px_rgba(110,231,183,0.08)] relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#2A2A38] pb-4">
                <div>
                  <div className="text-xs font-mono-code text-[#6EE7B7] uppercase tracking-wider">
                    Optimized Pipeline
                  </div>
                  <div className="text-lg font-bold text-[#F5F5F7] mt-0.5">
                    TokenDiet + Gemini
                  </div>
                </div>
                <span className="text-[10px] font-mono-code px-2.5 py-1 rounded-full bg-[#6EE7B7]/15 text-[#6EE7B7] border border-[#6EE7B7]/30 shadow-[0_0_10px_rgba(110,231,183,0.2)]">
                  {stats.avgPercentSaved} Pruned
                </span>
              </div>

              {/* Rows */}
              <div className="space-y-4 font-mono-code text-xs">
                {/* Avg tokens per query */}
                <div className="bg-[#0A0A0F] border border-[#6EE7B7]/30 rounded-[8px] p-3.5 flex items-center justify-between">
                  <span className="text-[#9494A6] font-sans">Avg tokens per query:</span>
                  <span className="text-sm font-bold text-[#6EE7B7] tabular-nums">
                    {avgCompressedTokens.toLocaleString()} tokens
                  </span>
                </div>

                {/* Compression ratio */}
                <div className="bg-[#0A0A0F] border border-[#6EE7B7]/30 rounded-[8px] p-3.5 flex items-center justify-between">
                  <span className="text-[#9494A6] font-sans">Compression ratio:</span>
                  <span className="text-sm font-bold text-[#6EE7B7] tabular-nums">
                    {stats.avgCompressionRatio} ({stats.avgPercentSaved} reduction)
                  </span>
                </div>

                {/* Est cost per 1000 queries */}
                <div className="bg-[#0A0A0F] border border-[#6EE7B7]/30 rounded-[8px] p-3.5 flex items-center justify-between">
                  <span className="text-[#9494A6] font-sans">Est. cost per 1,000 queries:</span>
                  <span className="text-sm font-bold text-[#6EE7B7] tabular-nums">
                    ${tokenDietCostPer1k}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-[#6EE7B7] pt-2 border-t border-[#2A2A38] flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#6EE7B7]" />
                <span>Distilled semantic context with zero factual loss</span>
              </div>
            </div>
          </div>

          {/* Large Full-Width Summary Card with Overall Efficiency Multiplier */}
          <div className="bg-[#14141C] border border-[#6EE7B7]/40 rounded-[12px] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-[0_0_35px_rgba(110,231,183,0.12)]">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-mono-code text-[#6EE7B7] uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-[#6EE7B7]" />
                <span>Pipeline Efficiency Multiplier</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#F5F5F7]">
                Your RAG workloads run {efficiencyMultiplier}x more efficiently with TokenDiet
              </h3>
              <p className="text-xs text-[#9494A6] max-w-xl">
                Based on your {stats.totalCompressions} session runs saving a cumulative {stats.totalTokensSaved.toLocaleString()} prompt tokens.
              </p>
            </div>

            <div className="text-left sm:text-right font-mono-code">
              <div className="text-4xl sm:text-5xl font-bold text-[#6EE7B7] tabular-nums drop-shadow-[0_0_15px_rgba(110,231,183,0.4)]">
                {efficiencyMultiplier}x
              </div>
              <div className="text-xs text-[#9494A6] mt-1">
                Context throughput gain
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
