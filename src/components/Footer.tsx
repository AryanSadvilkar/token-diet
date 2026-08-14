import React from 'react';
import { ArrowRight, Terminal, Github, BookOpen, ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (sectionId: string, focusDemo?: boolean) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-[#14141C]/90 backdrop-blur-xl border-t border-white/10 mt-28">
      {/* High-Conversion Pre-Footer Final CTA Banner */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 border-b border-white/5">
        <div className="bg-gradient-to-r from-[#1C1C26] via-[#14141C] to-[#1C1C26] border border-[#2A2A38] rounded-2xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
          {/* Subtle Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#6EE7B7]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-2 text-center md:text-left relative z-10">
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#e4e1ed] tracking-tight">
              Ready to cut your RAG costs?
            </h3>
            <p className="font-body text-sm text-[#bccac1]">
              Start compressing your context windows today with sub-15ms overhead and zero data retention.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 relative z-10 w-full md:w-auto">
            <button
              onClick={() => onNavigate('demo', true)}
              className="bg-[#6EE7B7] text-[#0A0A0F] font-mono-code text-xs px-6 py-3.5 rounded-xl font-bold uppercase tracking-wider btn-hover-glow cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(110,231,183,0.3)]"
            >
              <span>Try Live Demo</span>
              <span className="material-symbols-outlined text-[16px]">terminal</span>
            </button>
            <button
              onClick={() => onNavigate('docs')}
              className="bg-[#14141C] border border-[#2A2A38] hover:border-white/20 text-[#e4e1ed] font-mono-code text-xs px-6 py-3.5 rounded-xl uppercase tracking-wider cursor-pointer"
            >
              Read Docs
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Copyright */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 flex flex-col md:flex-row justify-between items-center gap-6 font-body text-xs text-[#888899]">
        {/* Brand & System Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-display text-lg font-bold text-[#e4e1ed]">
            <div className="w-6 h-6 rounded-md bg-[#0A0A0F] border border-[#2A2A38] flex items-center justify-center">
              <span className="material-symbols-outlined text-[#6EE7B7] text-sm font-bold">
                terminal
              </span>
            </div>
            <span>TokenDiet</span>
          </div>

          <div className="h-4 w-px bg-white/10 hidden sm:block" />

          <div className="flex items-center gap-1.5 font-mono-code text-[11px] text-[#6EE7B7]">
            <span className="w-2 h-2 rounded-full bg-[#6EE7B7] animate-pulse" />
            <span>All systems operational • v2.0</span>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 font-mono-code text-xs text-[#bccac1] uppercase tracking-wider">
          <button onClick={() => onNavigate('product')} className="hover:text-[#6EE7B7] transition-colors cursor-pointer">
            Product
          </button>
          <button onClick={() => onNavigate('demo')} className="hover:text-[#6EE7B7] transition-colors cursor-pointer">
            Demo
          </button>
          <button onClick={() => onNavigate('how-it-works')} className="hover:text-[#6EE7B7] transition-colors cursor-pointer">
            How It Works
          </button>
          <button onClick={() => onNavigate('architecture')} className="hover:text-[#6EE7B7] transition-colors cursor-pointer">
            Architecture
          </button>
          <button onClick={() => onNavigate('calculator')} className="hover:text-[#6EE7B7] transition-colors cursor-pointer">
            ROI Model
          </button>
          <button onClick={() => onNavigate('docs')} className="hover:text-[#6EE7B7] transition-colors cursor-pointer">
            Docs
          </button>
          <button onClick={() => onNavigate('analytics')} className="hover:text-[#6EE7B7] transition-colors cursor-pointer">
            Analytics
          </button>
          <button onClick={() => onNavigate('compare')} className="hover:text-[#6EE7B7] transition-colors cursor-pointer">
            Compare
          </button>
        </div>

        {/* Copyright */}
        <div className="text-[#888899] font-mono-code text-[11px]">
          © 2026 TokenDiet Architecture Labs.
        </div>
      </div>
    </footer>
  );
};
