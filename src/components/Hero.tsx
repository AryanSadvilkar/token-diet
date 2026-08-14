import React, { useState } from 'react';
import { ArrowRight, Sparkles, Zap, ShieldCheck, Database, Layers, Cpu, Code2 } from 'lucide-react';

interface HeroProps {
  onTryDemo: () => void;
  onSeeHowItWorks: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onTryDemo, onSeeHowItWorks }) => {
  const [tokensBefore, setTokensBefore] = useState(1847);
  const [tokensAfter, setTokensAfter] = useState(612);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSimulate = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setTokensBefore(2840);
    setTokensAfter(2840);

    let current = 2840;
    const target = 720;
    const interval = setInterval(() => {
      current -= 90;
      if (current <= target) {
        current = target;
        clearInterval(interval);
        setIsSimulating(false);
      }
      setTokensAfter(current);
    }, 35);
  };

  const integrations = [
    { name: 'ChromaDB', type: 'Vector Database', icon: '⚡' },
    { name: 'Pinecone', type: 'Vector Index', icon: '🌲' },
    { name: 'Gemini 2.0', type: 'LLM Gateway', icon: '✨' },
    { name: 'LangChain', type: 'Orchestration', icon: '🦜' },
    { name: 'Qdrant', type: 'Vector Search', icon: '🎯' },
    { name: 'Weaviate', type: 'Hybrid DB', icon: '🔮' },
    { name: 'LlamaIndex', type: 'Data Framework', icon: '🦙' },
  ];

  return (
    <section
      id="product"
      className="relative min-h-[720px] flex flex-col justify-center items-center text-center overflow-hidden border-technical bg-[#14141C]/50 backdrop-blur-md rounded-2xl shadow-premium-card border-t border-white/10 p-8 sm:p-12 md:p-16 scroll-mt-28"
    >
      {/* Background Radial Glow */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[340px] bg-[#6EE7B7]/10 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute -bottom-20 right-10 w-[300px] h-[200px] bg-[#818CF8]/10 rounded-full blur-[90px] pointer-events-none" />

      <div className="relative z-10 space-y-8 max-w-4xl mx-auto w-full">
        {/* Version Badge */}
        <div className="inline-flex items-center gap-2 border border-white/10 px-4 py-1.5 rounded-full bg-[#1C1C26]/90 backdrop-blur-md font-mono-code text-xs text-[#6EE7B7] uppercase tracking-widest shadow-inner cursor-pointer hover:border-[#6EE7B7]/50 transition-colors">
          <span className="w-2 h-2 rounded-full bg-[#6EE7B7] animate-pulse" />
          <span>v2.0 is live • 3x Faster Compression</span>
        </div>

        {/* Display Headline */}
        <div className="space-y-2">
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-[#e4e1ed] font-bold tracking-tight leading-[1.08]">
            Cut your RAG costs by{' '}
            <span
              className="text-[#6EE7B7] font-extrabold inline-block relative px-1"
              style={{ textShadow: '0 0 32px rgba(110, 231, 183, 0.45)' }}
            >
              60%
            </span>
          </h1>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-[#e4e1ed] font-bold tracking-tight leading-[1.08]">
            without touching your LLM
          </h1>
        </div>

        {/* Subtitle */}
        <p className="font-body text-base sm:text-lg text-[#bccac1] max-w-2xl mx-auto leading-relaxed pt-2">
          TokenDiet sits between your vector DB and LLM, semantically compressing context windows.
          Faster inference, lower bills, identical accuracy.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
          <button
            onClick={onTryDemo}
            className="w-full sm:w-auto bg-[#6EE7B7] text-[#0A0A0F] font-mono-code text-xs px-8 py-3.5 rounded-lg transition-all btn-hover-glow uppercase tracking-wider font-bold flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(110,231,183,0.3)]"
          >
            <span>Try Live Demo</span>
            <span className="material-symbols-outlined text-[18px]">terminal</span>
          </button>

          <button
            onClick={onSeeHowItWorks}
            className="w-full sm:w-auto border border-white/20 font-mono-code text-xs px-8 py-3.5 rounded-lg text-[#e4e1ed] hover:bg-white/5 transition-all uppercase tracking-wider backdrop-blur-sm hover:border-[#6EE7B7]/40 cursor-pointer"
          >
            See How It Works
          </button>
        </div>

        {/* Token Counter Pill Widget with Live Interactive Scrub/Simulate */}
        <div className="pt-4">
          <div
            onClick={handleSimulate}
            title="Click to re-simulate real-time stream compression"
            className="font-mono-code text-sm border border-white/10 bg-[#0A0A0F]/90 backdrop-blur-md px-6 py-4 rounded-xl inline-flex items-center gap-4 text-[#bccac1] shadow-inner hover:border-[#6EE7B7]/50 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#888899]">RAW</span>
              <span className="text-[#F87171] font-bold tabular-nums">
                {tokensBefore.toLocaleString()} tokens
              </span>
            </div>

            <span className="material-symbols-outlined text-[#3d4a43] group-hover:text-[#6EE7B7] transition-colors">
              arrow_right_alt
            </span>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[#888899]">OPTIMIZED</span>
              <span
                className={`text-[#6EE7B7] font-bold tabular-nums ${
                  isSimulating ? 'animate-pulse' : ''
                }`}
                style={{ textShadow: '0 0 12px rgba(110,231,183,0.4)' }}
              >
                {tokensAfter.toLocaleString()} tokens
              </span>
            </div>

            <span className="text-[11px] bg-[#6EE7B7]/15 text-[#6EE7B7] px-2.5 py-1 rounded font-bold uppercase tracking-wider ml-1 border border-[#6EE7B7]/30">
              -67%
            </span>
          </div>
        </div>

        {/* Tech Integration Badges Strip (Beneath the fold element) */}
        <div className="pt-10 border-t border-white/5">
          <p className="font-mono-code text-[11px] uppercase tracking-widest text-[#888899] mb-4">
            Seamless 1-Line Drop-in with your AI stack
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {integrations.map((item) => (
              <div
                key={item.name}
                className="flex items-center gap-2 bg-[#1C1C26]/60 hover:bg-[#1C1C26] border border-[#2A2A38] hover:border-[#6EE7B7]/40 px-3.5 py-2 rounded-lg transition-all duration-200 group cursor-default"
              >
                <span className="text-sm opacity-70 group-hover:opacity-100 transition-opacity">
                  {item.icon}
                </span>
                <span className="font-mono-code text-xs text-[#888899] group-hover:text-[#e4e1ed] transition-colors font-medium">
                  {item.name}
                </span>
                <span className="text-[10px] text-[#6EE7B7]/60 group-hover:text-[#6EE7B7] font-mono-code hidden sm:inline">
                  • {item.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
