import React from 'react';
import { NavView, SessionStats } from '../../types';
import { MetricCard } from '../MetricCard';
import { ArrowRight, Zap, Play, Layers, TrendingDown, Clock, ShieldCheck, Sparkles } from 'lucide-react';

interface OverviewViewProps {
  stats: SessionStats;
  onNavigate: (view: NavView) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ stats, onNavigate }) => {
  const hasUsage = stats.totalCompressions > 0;

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl">
      {/* Top Hero Section */}
      <div className="space-y-4 pt-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#14141C] border border-[#2A2A38] text-xs font-mono-code text-[#6EE7B7]">
          <span className="w-2 h-2 rounded-full bg-[#6EE7B7] animate-pulse" />
          <span>AI CONTEXT COMPRESSION GATEWAY</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F5F5F7] tracking-tight leading-[1.15]">
          Cut your RAG costs by 60% without touching your LLM
        </h1>

        <p className="text-base sm:text-lg text-[#9494A6] max-w-3xl leading-relaxed">
          TokenDiet filters redundant tokens, boilerplate phrasing, and low-signal sentences from retrieved context before sending it to your foundation model.
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-4">
          <button
            onClick={() => onNavigate('demo')}
            className="bg-[#6EE7B7] hover:bg-[#80f9c8] text-[#0A0A0F] font-semibold text-sm px-6 py-3 rounded-[8px] flex items-center gap-2 cursor-pointer transition-all duration-200 shadow-[0_0_20px_rgba(110,231,183,0.3)] active:scale-98"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Try Live Demo</span>
          </button>

          <button
            onClick={() => onNavigate('compare')}
            className="bg-transparent hover:bg-[#1C1C26] text-[#F5F5F7] border border-[#2A2A38] hover:border-[#9494A6] text-sm font-medium px-5 py-3 rounded-[8px] flex items-center gap-2 cursor-pointer transition-colors active:scale-98"
          >
            <span>View Architecture Compare</span>
            <ArrowRight className="w-4 h-4 text-[#9494A6]" />
          </button>
        </div>
      </div>

      {/* 3 Real Session Stat Cards (start empty/zero, populate live from actual usage) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between text-xs font-mono-code text-[#9494A6]">
          <span className="uppercase tracking-wider">Session Real-Time Performance</span>
          <span>{hasUsage ? 'Live Session Telemetry' : 'Awaiting First Compression'}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricCard
            label="Total Compressions Run"
            value={stats.totalCompressions}
            subtext={hasUsage ? `${stats.totalCompressions} queries processed` : '0 queries run yet'}
            icon={Zap}
            accentColor={hasUsage ? 'mint' : 'default'}
            isEmpty={!hasUsage}
          />

          <MetricCard
            label="Total Tokens Saved"
            value={stats.totalTokensSaved.toLocaleString()}
            subtext={hasUsage ? `~${((stats.totalTokensSaved / 1000) * 0.0025).toFixed(4)} estimated savings` : '0 prompt tokens saved'}
            icon={TrendingDown}
            accentColor={hasUsage ? 'mint' : 'default'}
            isEmpty={!hasUsage}
          />

          <MetricCard
            label="Avg Compression Ratio"
            value={stats.avgCompressionRatio}
            subtext={hasUsage ? `${stats.avgPercentSaved} average context reduction` : '0.0x baseline'}
            icon={Layers}
            accentColor={hasUsage ? 'indigo' : 'default'}
            isEmpty={!hasUsage}
          />
        </div>
      </div>

      {/* Interactive Quick-Start Teaser Banner */}
      <div className="bg-[#14141C] border border-[#2A2A38] hover:border-[#6EE7B7]/30 rounded-[12px] p-6 sm:p-7 space-y-4 transition-all duration-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#F5F5F7]">
              <Sparkles className="w-4 h-4 text-[#818CF8]" />
              <span>Ready to test context compression?</span>
            </div>
            <p className="text-xs text-[#9494A6] leading-relaxed">
              Load realistic enterprise documents (SLA contracts, clinical trials, SEC 10-Q filings), paste custom context, or upload document screenshots.
            </p>
          </div>

          <button
            onClick={() => onNavigate('demo')}
            className="bg-[#1C1C26] hover:bg-[#6EE7B7] hover:text-[#0A0A0F] text-[#F5F5F7] border border-[#2A2A38] hover:border-[#6EE7B7] text-xs font-semibold px-4 py-2.5 rounded-[8px] flex items-center gap-2 self-start md:self-auto cursor-pointer transition-all duration-200"
          >
            <span>Launch Testbed</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3 Value Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[#2A2A38] text-xs text-[#9494A6]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6EE7B7]" />
            <span>Drop-in API middleware</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#818CF8]" />
            <span>Multimodal document parsing</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6EE7B7]" />
            <span>Stateless zero-retention proxy</span>
          </div>
        </div>
      </div>
    </div>
  );
};
