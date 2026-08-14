import React from 'react';
import { NavView } from '../types';
import { LayoutDashboard, Play, GitCompare, Info, Sparkles, Zap, ShieldCheck } from 'lucide-react';

interface SidebarProps {
  activeView: NavView;
  onNavigate: (view: NavView) => void;
  totalTokensSaved: number;
  totalCompressions: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onNavigate,
  totalTokensSaved,
  totalCompressions,
}) => {
  const navItems: { id: NavView; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'demo', label: 'Live Demo', icon: Play },
    { id: 'compare', label: 'Compare', icon: GitCompare },
    { id: 'details', label: 'Details', icon: Info },
  ];

  return (
    <aside className="w-full md:w-[240px] h-full bg-[#14141C]/80 backdrop-blur-xl border-r border-[#2A2A38] flex flex-col justify-between p-4 shrink-0 select-none z-30">
      {/* Top Header & Brand */}
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="pt-2 px-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1C1C26] border border-[#2A2A38] flex items-center justify-center text-[#6EE7B7] shadow-[0_0_15px_rgba(110,231,183,0.15)]">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-base tracking-tight text-[#F5F5F7]">
                TokenDiet
              </div>
            </div>
          </div>

          {/* Indigo Powered by Gemini Badge */}
          <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#818CF8]/15 border border-[#818CF8]/30 text-[11px] font-mono-code text-[#818CF8]">
            <Sparkles className="w-3 h-3 text-[#818CF8]" />
            <span>Powered by Gemini</span>
          </div>
        </div>

        {/* 4 Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#6EE7B7] text-[#0A0A0F] font-semibold shadow-[0_0_15px_rgba(110,231,183,0.35)]'
                    : 'text-[#9494A6] hover:text-[#F5F5F7] hover:bg-[#1C1C26]'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#0A0A0F]' : 'text-[#9494A6]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Session Counter */}
      <div className="pt-4 border-t border-[#2A2A38] space-y-2">
        <div className="bg-[#0A0A0F]/80 border border-[#2A2A38] rounded-[12px] p-3.5 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-[#9494A6] font-mono-code uppercase tracking-wider">
            <span>Session Saved</span>
            <span className="w-2 h-2 rounded-full bg-[#6EE7B7] animate-pulse" />
          </div>

          <div className="text-xl font-mono-code font-bold text-[#6EE7B7] tabular-nums tracking-tight">
            {totalTokensSaved.toLocaleString()}
            <span className="text-xs font-normal text-[#9494A6] ml-1">tokens</span>
          </div>

          <div className="flex justify-between items-center text-[10px] font-mono-code text-[#9494A6] pt-1 border-t border-white/5">
            <span>{totalCompressions} runs active</span>
            <span className="text-[#818CF8]">Real-time</span>
          </div>
        </div>

        <div className="text-[10px] text-[#9494A6] text-center font-mono-code">
          Stateless In-Memory Proxy
        </div>
      </div>
    </aside>
  );
};
