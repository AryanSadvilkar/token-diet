import React from 'react';
import { TrendingUp, Clock, Zap, DollarSign } from 'lucide-react';

interface MetricItem {
  id: string;
  label: string;
  value: string;
  subtext: string;
  trendLabel: string;
  sparklineData: number[]; // 7 data points for sparkline
  icon: React.ReactNode;
}

export const MetricStrip: React.FC = () => {
  const metrics: MetricItem[] = [
    {
      id: 'ratio',
      label: 'COMPRESSION RATIO',
      value: '3.2x',
      subtext: 'Average token reduction across RAG workloads',
      trendLabel: '+0.4x vs v1.8',
      sparklineData: [2.1, 2.4, 2.3, 2.8, 2.9, 3.1, 3.2],
      icon: <TrendingUp className="w-4 h-4 text-[#6EE7B7]" />,
    },
    {
      id: 'latency',
      label: 'LATENCY DROP',
      value: '-45%',
      subtext: 'Faster First Token Response (TTFT)',
      trendLabel: '14.2ms avg overhead',
      sparklineData: [32, 28, 30, 22, 19, 16, 14],
      icon: <Clock className="w-4 h-4 text-[#6EE7B7]" />,
    },
    {
      id: 'tokens',
      label: 'TOKENS SAVED (24H)',
      value: '14.2M',
      subtext: 'Compressed across active production gateways',
      trendLabel: '+18% weekly growth',
      sparklineData: [8.2, 9.4, 10.1, 11.8, 12.6, 13.5, 14.2],
      icon: <Zap className="w-4 h-4 text-[#6EE7B7]" />,
    },
    {
      id: 'cost',
      label: 'COST SAVED (AVG/MO)',
      value: '$4.2k',
      subtext: 'Direct API bill reduction per project',
      trendLabel: '99.98% semantic fidelity',
      sparklineData: [2.4, 2.8, 3.1, 3.4, 3.7, 4.0, 4.2],
      icon: <DollarSign className="w-4 h-4 text-[#6EE7B7]" />,
    },
  ];

  // Helper to generate SVG sparkline smooth path
  const renderSparkline = (data: number[], isInverse = false) => {
    const width = 160;
    const height = 36;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const points = data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      // Invert Y coordinate if lower is better (like latency) or standard
      const normalized = isInverse ? (max - val) / range : (val - min) / range;
      const y = height - (normalized * (height - 10) + 5);
      return `${x},${y}`;
    });

    const pathD = `M ${points.join(' L ')}`;
    const areaD = `M 0,${height} L ${points.join(' L ')} L ${width},${height} Z`;

    return (
      <div className="w-full h-9 mt-3 pt-1">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={`grad-${data[0]}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#6EE7B7" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#6EE7B7" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path d={areaD} fill={`url(#grad-${data[0]})`} />
          <path
            d={pathD}
            fill="none"
            stroke="#6EE7B7"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="filter drop-shadow-[0_0_6px_rgba(110,231,183,0.5)]"
          />
          {/* Endpoint Pulse Dot */}
          {points.length > 0 && (
            <circle
              cx={points[points.length - 1].split(',')[0]}
              cy={points[points.length - 1].split(',')[1]}
              r="3"
              fill="#6EE7B7"
              className="animate-ping"
            />
          )}
          {points.length > 0 && (
            <circle
              cx={points[points.length - 1].split(',')[0]}
              cy={points[points.length - 1].split(',')[1]}
              r="2.5"
              fill="#FFFFFF"
            />
          )}
        </svg>
      </div>
    );
  };

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 my-12">
      {metrics.map((metric) => (
        <div
          key={metric.id}
          className="border-t border-white/10 bg-[#1f1f27]/50 backdrop-blur-lg p-6 rounded-xl premium-card-hover shadow-premium-card border border-white/5 flex flex-col justify-between group relative overflow-hidden"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono-code text-xs text-[#bccac1] uppercase tracking-wider font-medium">
                {metric.label}
              </span>
              <div className="p-1.5 rounded-lg bg-[#14141C] border border-[#2A2A38] group-hover:border-[#6EE7B7]/40 transition-colors">
                {metric.icon}
              </div>
            </div>

            <div className="flex items-baseline justify-between">
              <div className="font-display text-3xl sm:text-4xl font-mono-code text-[#6EE7B7] font-bold tabular-nums tracking-tight py-1">
                {metric.value}
              </div>
              <span className="font-mono-code text-[10px] text-[#80f9c8] bg-[#6EE7B7]/10 px-2 py-0.5 rounded border border-[#6EE7B7]/20">
                {metric.trendLabel}
              </span>
            </div>

            {/* Animated Sparkline Graphic */}
            {renderSparkline(metric.sparklineData, metric.id === 'latency')}
          </div>

          <p className="font-body text-xs text-[#888899] mt-3 border-t border-white/5 pt-2 leading-relaxed">
            {metric.subtext}
          </p>
        </div>
      ))}
    </section>
  );
};
