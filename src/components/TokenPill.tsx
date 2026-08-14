import React from 'react';

interface TokenPillProps {
  tokens: number;
  type?: 'raw' | 'compressed' | 'saved' | 'neutral';
  label?: string;
  isEstimate?: boolean;
  className?: string;
}

export const TokenPill: React.FC<TokenPillProps> = ({
  tokens,
  type = 'neutral',
  label,
  isEstimate = true,
  className = '',
}) => {
  const getColors = () => {
    switch (type) {
      case 'raw':
        return 'bg-[#F87171]/15 text-[#F87171] border-[#F87171]/30';
      case 'compressed':
        return 'bg-[#6EE7B7]/15 text-[#6EE7B7] border-[#6EE7B7]/30 shadow-[0_0_12px_rgba(110,231,183,0.15)]';
      case 'saved':
        return 'bg-[#818CF8]/15 text-[#818CF8] border-[#818CF8]/30';
      default:
        return 'bg-[#1C1C26] text-[#9494A6] border-[#2A2A38]';
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono-code border transition-all ${getColors()} ${className}`}
    >
      {label && <span className="text-[11px] font-sans opacity-80">{label}:</span>}
      <span className="font-bold tabular-nums">
        {tokens.toLocaleString()}
      </span>
      <span className="text-[10px] opacity-75 font-sans">tokens</span>
      {isEstimate && (
        <span className="text-[9px] opacity-60 font-sans tracking-tight" title="Estimated as ~4 characters per token">
          (est)
        </span>
      )}
    </span>
  );
};
