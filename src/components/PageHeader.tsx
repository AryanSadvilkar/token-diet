import React from 'react';

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  actionButton?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  eyebrow,
  title,
  description,
  actionButton,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/5">
      <div className="space-y-1.5 max-w-3xl">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1C1C26] border border-[#2A2A38] font-mono-code text-[11px] text-[#6EE7B7] uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-[#6EE7B7]" />
          <span>{eyebrow}</span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-[#e4e1ed] tracking-tight">
          {title}
        </h1>
        <p className="font-body text-xs sm:text-sm text-[#bccac1] leading-relaxed">
          {description}
        </p>
      </div>

      {actionButton && <div className="shrink-0">{actionButton}</div>}
    </div>
  );
};
