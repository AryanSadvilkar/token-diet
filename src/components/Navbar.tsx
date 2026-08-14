import React, { useState, useEffect } from 'react';
import { Terminal, Menu, X, ArrowUpRight, Calculator, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface NavbarProps {
  activeSection: string;
  onNavigate: (sectionId: string, focusInput?: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeSection, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Track page scroll progress for the top 2px indicator
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, progress)));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'product', label: 'Product' },
    { id: 'demo', label: 'Demo' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'architecture', label: 'Architecture' },
    { id: 'calculator', label: 'ROI Calculator' },
    { id: 'docs', label: 'Docs' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'compare', label: 'Compare' },
  ];

  const handleLinkClick = (id: string, focusDemo = false) => {
    onNavigate(id, focusDemo);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#14141C]/60 backdrop-blur-xl border-b border-[#2A2A38]/80 transition-all duration-300">
      {/* 2px Scroll Progress Bar at the top edge */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-[#1C1C26] overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#6EE7B7] via-[#80f9c8] to-[#818CF8] transition-all duration-100 ease-out shadow-[0_0_10px_rgba(110,231,183,0.8)]"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <div className="flex justify-between items-center px-4 md:px-8 py-3.5 max-w-7xl mx-auto">
        {/* Brand Logo */}
        <button
          onClick={() => handleLinkClick('product')}
          className="flex items-center gap-2.5 font-display text-xl md:text-2xl font-bold text-[#e4e1ed] tracking-tight hover:opacity-90 transition-opacity cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-[#14141C] border border-[#2A2A38] flex items-center justify-center group-hover:border-[#6EE7B7]/50 transition-colors">
            <span className="material-symbols-outlined text-[#6EE7B7] text-xl font-bold">
              terminal
            </span>
          </div>
          <span className="tracking-tight">TokenDiet</span>
        </button>

        {/* Desktop Navigation Links with Animated Active Indicator */}
        <div className="hidden lg:flex items-center gap-1 font-mono-code text-xs uppercase tracking-wider bg-[#0A0A0F]/50 p-1 rounded-full border border-white/5">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`relative px-3 py-1.5 rounded-full transition-colors duration-200 cursor-pointer font-medium ${
                  isActive
                    ? 'text-[#6EE7B7] font-bold'
                    : 'text-[#888899] hover:text-[#e4e1ed]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavHighlight"
                    className="absolute inset-0 bg-[#6EE7B7]/10 rounded-full border border-[#6EE7B7]/30 shadow-[0_0_12px_rgba(110,231,183,0.15)]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </button>
            );
          })}
        </div>

        {/* Action Buttons & Mobile Menu Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleLinkClick('demo', true)}
            className="bg-[#6EE7B7] text-[#0A0A0F] font-mono-code text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-2 hover:scale-[0.98] transition-all duration-200 btn-hover-glow uppercase tracking-wider cursor-pointer shadow-[0_0_15px_rgba(110,231,183,0.3)]"
          >
            <span>Try Live Demo</span>
            <span className="material-symbols-outlined text-[16px]">terminal</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-[#888899] hover:text-white bg-[#14141C] border border-[#2A2A38]"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-[#6EE7B7]" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="lg:hidden bg-[#14141C]/95 backdrop-blur-2xl border-b border-[#2A2A38] px-6 py-5 flex flex-col gap-2 font-mono-code text-xs shadow-2xl"
        >
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`text-left py-2.5 px-3 rounded-lg border flex justify-between items-center transition-all ${
                  isActive
                    ? 'bg-[#6EE7B7]/10 text-[#6EE7B7] border-[#6EE7B7]/30 font-bold'
                    : 'text-[#bccac1] border-transparent hover:bg-white/5'
                }`}
              >
                <span>{link.label}</span>
                <ArrowUpRight className={`w-3.5 h-3.5 ${isActive ? 'text-[#6EE7B7]' : 'text-[#888899]'}`} />
              </button>
            );
          })}
        </motion.div>
      )}
    </nav>
  );
};
