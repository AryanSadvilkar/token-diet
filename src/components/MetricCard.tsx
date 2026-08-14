import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: LucideIcon;
  accentColor?: 'mint' | 'indigo' | 'red' | 'default';
  isEmpty?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtext,
  icon: Icon,
  accentColor = 'mint',
  isEmpty = false,
}) => {
  const getAccentClass = () => {
    switch (accentColor) {
      case 'mint':
        return 'text-[#6EE7B7]';
      case 'indigo':
        return 'text-[#818CF8]';
      case 'red':
        return 'text-[#F87171]';
      default:
        return 'text-[#F5F5F7]';
    }
  };

  return (
    <div className="bg-[#14141C] border border-[#2A2A38] hover:border-[#6EE7B7]/30 rounded-[12px] p-5 sm:p-6 transition-all duration-300 shadow-sm relative group overflow-hidden">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-[#9494A6] uppercase tracking-wider">
            {label}
          </p>
          <div
            className={`text-2xl sm:text-3xl font-mono-code font-bold tabular-nums tracking-tight ${getAccentClass()} ${
              isEmpty ? 'opacity-40' : ''
            }`}
          >
            {value}
          </div>
        </div>
        {Icon && (
          <div className="p-2.5 rounded-lg bg-[#1C1C26] border border-[#2A2A38] text-[#9494A6] group-hover:text-[#6EE7B7] transition-colors">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {subtext && (
        <p className="mt-3 text-xs text-[#9494A6] flex items-center gap-1.5 font-mono-code">
          {subtext}
        </p>
      )}
    </div>
  );
};
