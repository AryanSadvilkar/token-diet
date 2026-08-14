import React from 'react';
import { Check, X, ShieldAlert, Zap, Layers, Sparkles } from 'lucide-react';

export const ComparisonTable: React.FC = () => {
  const comparisonRows = [
    {
      feature: 'Token Waste per Retrieval',
      standard: '55% - 75% noise & redundant filler',
      tokendiet: '< 5% residual noise (60-70% removed)',
      impact: 'Massive Cost Reduction',
    },
    {
      feature: 'Time-to-First-Token (TTFT)',
      standard: '240ms - 450ms (large context prompt)',
      tokendiet: '110ms - 170ms (45% faster inference)',
      impact: 'Instant UI Stream',
    },
    {
      feature: 'Context Window Exhaustion',
      standard: 'Frequent truncation on multi-doc RAG',
      tokendiet: 'Preserves 3x more relevant context',
      impact: 'Zero Lost in the Middle',
    },
    {
      feature: 'Cost per 1 Million Queries',
      standard: '$7,500 - $12,000 / mo',
      tokendiet: '$2,400 - $3,800 / mo',
      impact: '60% Net Savings',
    },
    {
      feature: 'Setup & Integration Effort',
      standard: 'Requires vector re-indexing & chunk tuning',
      tokendiet: '3 lines of code (zero vector DB changes)',
      impact: '10-Minute Drop-in',
    },
    {
      feature: 'Data Privacy & Retention',
      standard: 'Varies by provider',
      tokendiet: '100% Stateless RAM (zero disk storage)',
      impact: 'SOC2 Compliant',
    },
  ];

  return (
    <section className="space-y-10 my-24 scroll-mt-28" id="compare">
      {/* Section Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#1C1C26] border border-[#2A2A38] font-mono-code text-xs text-[#6EE7B7] uppercase tracking-wider shadow-inner">
          <Sparkles className="w-3.5 h-3.5" />
          <span>TECHNICAL BENCHMARK</span>
        </div>
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-[#e4e1ed] tracking-tight">
          Standard RAG vs. TokenDiet
        </h2>
        <p className="font-body text-base text-[#bccac1] leading-relaxed">
          Why leading AI teams compress context before running LLM inference.
        </p>
      </div>

      {/* Comparison Matrix Table */}
      <div className="border-technical bg-[#14141C]/80 backdrop-blur-xl rounded-2xl overflow-hidden shadow-premium-card border-t border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono-code text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-[#1C1C26]/80 text-[#bccac1]">
                <th className="py-4 px-6 uppercase font-bold text-xs">Architecture Metric</th>
                <th className="py-4 px-6 uppercase text-[#F87171] font-bold text-xs bg-[#F87171]/5 border-x border-white/5">
                  Standard RAG Pipeline
                </th>
                <th className="py-4 px-6 uppercase text-[#6EE7B7] font-bold text-xs bg-[#6EE7B7]/10">
                  TokenDiet Optimized RAG
                </th>
                <th className="py-4 px-6 uppercase text-[#888899] font-medium hidden md:table-cell">
                  Business Impact
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-[#e4e1ed]">
              {comparisonRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-6 font-bold text-sm text-[#e4e1ed]">
                    {row.feature}
                  </td>
                  <td className="py-4 px-6 text-[#bccac1] bg-[#F87171]/5 border-x border-white/5 font-normal">
                    <div className="flex items-center gap-2">
                      <X className="w-4 h-4 text-[#F87171] shrink-0" />
                      <span>{row.standard}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-[#6EE7B7] bg-[#6EE7B7]/10 font-bold">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#6EE7B7] shrink-0" />
                      <span>{row.tokendiet}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-[#888899] hidden md:table-cell">
                    <span className="bg-[#1C1C26] px-2.5 py-1 rounded text-[11px] text-[#bccac1] border border-white/5">
                      {row.impact}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
