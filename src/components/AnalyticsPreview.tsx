import React, { useState } from 'react';
import { Activity, BarChart3, Clock, DollarSign, Zap, Globe, ArrowUpRight, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';

export const AnalyticsPreview: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('24h');

  // Throughput chart points (tokens/sec)
  const throughputPoints = [120, 145, 138, 180, 210, 195, 240, 260, 290, 310, 280, 340];
  const maxVal = Math.max(...throughputPoints);

  const endpointStats = [
    { endpoint: '/api/v1/customer-rag', calls: '482k', saved: '68%', latency: '12ms', status: 'Optimal' },
    { endpoint: '/api/v1/finance-search', calls: '290k', saved: '74%', latency: '15ms', status: 'Optimal' },
    { endpoint: '/api/v1/codebase-docs', calls: '640k', saved: '59%', latency: '11ms', status: 'Optimal' },
    { endpoint: '/api/v1/internal-wiki', calls: '180k', saved: '64%', latency: '14ms', status: 'Optimal' },
  ];

  return (
    <section className="space-y-10 my-24 scroll-mt-28" id="analytics">
      {/* Section Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#1C1C26] border border-[#2A2A38] font-mono-code text-xs text-[#6EE7B7] uppercase tracking-wider shadow-inner">
          <Activity className="w-3.5 h-3.5" />
          <span>PRODUCTION OBSERVABILITY</span>
        </div>
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-[#e4e1ed] tracking-tight">
          Enterprise Telemetry & Token Analytics
        </h2>
        <p className="font-body text-base text-[#bccac1] leading-relaxed">
          Monitor your context compression ratios, token throughput, and real-time cost savings across all RAG endpoints.
        </p>
      </div>

      {/* Browser Chrome Framed Mockup Dashboard */}
      <div className="border-technical bg-[#14141C]/80 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl border-t border-white/10">
        {/* Browser Chrome Bar */}
        <div className="bg-[#1C1C26] px-5 py-3.5 border-b border-[#2A2A38] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <span className="w-3 h-3 rounded-full bg-[#F87171]" />
              <span className="w-3 h-3 rounded-full bg-[#818CF8]" />
              <span className="w-3 h-3 rounded-full bg-[#6EE7B7]" />
            </div>
            <div className="hidden sm:flex items-center gap-2 bg-[#0A0A0F] px-4 py-1 rounded-md border border-[#2A2A38] text-[11px] font-mono-code text-[#888899]">
              <span className="text-[#6EE7B7]">https://</span>
              <span>app.tokendiet.io/analytics/enterprise-cluster-us-east</span>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono-code text-xs">
            <span className="w-2 h-2 rounded-full bg-[#6EE7B7] animate-pulse" />
            <span className="text-[#6EE7B7] text-[11px] font-bold">LIVE TELEMETRY</span>
          </div>
        </div>

        {/* Mockup Dashboard Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Top Quick Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono-code">
            <div className="bg-[#0A0A0F] border border-[#2A2A38] p-4 rounded-xl">
              <div className="text-[11px] text-[#888899] uppercase mb-1">Total Tokens Compressed</div>
              <div className="text-xl sm:text-2xl font-bold text-[#6EE7B7] tabular-nums">482.6M</div>
              <div className="text-[10px] text-[#80f9c8] mt-1">+14.2M today</div>
            </div>

            <div className="bg-[#0A0A0F] border border-[#2A2A38] p-4 rounded-xl">
              <div className="text-[11px] text-[#888899] uppercase mb-1">Cost Avoided (MTD)</div>
              <div className="text-xl sm:text-2xl font-bold text-[#e4e1ed] tabular-nums">$12,480.00</div>
              <div className="text-[10px] text-[#6EE7B7] mt-1">68.4% bill cut</div>
            </div>

            <div className="bg-[#0A0A0F] border border-[#2A2A38] p-4 rounded-xl">
              <div className="text-[11px] text-[#888899] uppercase mb-1">Avg Compression Overhead</div>
              <div className="text-xl sm:text-2xl font-bold text-[#80f9c8] tabular-nums">13.8ms</div>
              <div className="text-[10px] text-[#888899] mt-1">p99: 18.2ms</div>
            </div>

            <div className="bg-[#0A0A0F] border border-[#2A2A38] p-4 rounded-xl">
              <div className="text-[11px] text-[#888899] uppercase mb-1">Gateway Uptime</div>
              <div className="text-xl sm:text-2xl font-bold text-[#e4e1ed] tabular-nums">99.995%</div>
              <div className="text-[10px] text-[#6EE7B7] mt-1">SOC2 Certified</div>
            </div>
          </div>

          {/* Real-Time Throughput Line Chart & Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Throughput Chart (7 cols) */}
            <div className="lg:col-span-7 bg-[#0A0A0F] border border-[#2A2A38] p-5 rounded-xl space-y-4">
              <div className="flex justify-between items-center font-mono-code text-xs">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#6EE7B7]" />
                  <span className="text-[#e4e1ed] font-bold uppercase">Token Reduction Velocity (k tokens/sec)</span>
                </div>
                <div className="flex gap-1 bg-[#1C1C26] p-1 rounded-md">
                  {(['24h', '7d', '30d'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTimeframe(t)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        timeframe === t ? 'bg-[#6EE7B7] text-[#0A0A0F]' : 'text-[#888899] hover:text-white'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Responsive SVG Chart */}
              <div className="h-44 w-full pt-2">
                <svg viewBox="0 0 500 160" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="analyticsGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#6EE7B7" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#6EE7B7" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  <line x1="0" y1="40" x2="500" y2="40" stroke="#2A2A38" strokeDasharray="3 3" />
                  <line x1="0" y1="80" x2="500" y2="80" stroke="#2A2A38" strokeDasharray="3 3" />
                  <line x1="0" y1="120" x2="500" y2="120" stroke="#2A2A38" strokeDasharray="3 3" />

                  {/* Area */}
                  {(() => {
                    const pts = throughputPoints.map((v, i) => {
                      const x = (i / (throughputPoints.length - 1)) * 500;
                      const y = 140 - (v / maxVal) * 110;
                      return `${x},${y}`;
                    });
                    const pathD = `M ${pts.join(' L ')}`;
                    const areaD = `M 0,160 L ${pts.join(' L ')} L 500,160 Z`;

                    return (
                      <>
                        <path d={areaD} fill="url(#analyticsGrad)" />
                        <path d={pathD} fill="none" stroke="#6EE7B7" strokeWidth="2.5" strokeLinecap="round" />
                      </>
                    );
                  })()}
                </svg>
              </div>

              <div className="flex justify-between font-mono-code text-[10px] text-[#888899] pt-2 border-t border-white/5">
                <span>00:00 UTC</span>
                <span>06:00 UTC</span>
                <span>12:00 UTC</span>
                <span>18:00 UTC</span>
                <span>NOW (LIVE)</span>
              </div>
            </div>

            {/* Endpoints Table (5 cols) */}
            <div className="lg:col-span-5 bg-[#0A0A0F] border border-[#2A2A38] p-5 rounded-xl space-y-3 font-mono-code text-xs">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[#e4e1ed] font-bold uppercase text-xs">Active RAG Routes</span>
                <span className="text-[10px] text-[#6EE7B7]">4 Routes Connected</span>
              </div>

              <div className="space-y-2">
                {endpointStats.map((item) => (
                  <div
                    key={item.endpoint}
                    className="p-2.5 rounded-lg bg-[#14141C] border border-[#2A2A38] flex items-center justify-between hover:border-[#6EE7B7]/40 transition-colors"
                  >
                    <div>
                      <div className="text-[#e4e1ed] font-medium text-[11px] truncate max-w-[150px]">
                        {item.endpoint}
                      </div>
                      <div className="text-[10px] text-[#888899]">{item.calls} requests • {item.latency}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[#6EE7B7] font-bold text-xs">{item.saved} saved</div>
                      <div className="text-[10px] text-[#80f9c8]">{item.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
