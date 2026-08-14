import React, { useState, useEffect } from 'react';
import { Search, Database, Cpu, Bot, ArrowRight, Play, RotateCcw, Sparkles, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const HowItWorks: React.FC = () => {
  const [replayStep, setReplayStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  const steps = [
    {
      num: '01',
      title: 'Query Intent Analysis',
      subtitle: 'Extract Core Semantic Constraints',
      desc: 'TokenDiet parses the incoming user prompt to identify entity boundaries, question directives, and factual priorities.',
      icon: <Search className="w-5 h-5 text-[#818CF8]" />,
      payload: 'Query: "What is the Q3 revenue growth?"',
      metric: 'Intent Vector: 768-d',
      isHero: false,
    },
    {
      num: '02',
      title: 'Vector Context Retrieval',
      subtitle: 'Top-K Chunks from Vector DB',
      desc: 'Your application queries ChromaDB, Pinecone, or Qdrant for top-K matching document chunks (often full of unneeded filler).',
      icon: <Database className="w-5 h-5 text-[#818CF8]" />,
      payload: 'Raw Context: 2,450 tokens (4 docs)',
      metric: 'Standard RAG Payload',
      isHero: false,
    },
    {
      num: '03',
      title: 'TokenDiet Semantic Pruning',
      subtitle: 'Sub-15ms Rust SIMD Engine',
      desc: 'Sentences are scored for semantic necessity. Redundant headers, repetitive greetings, and off-topic paragraphs are surgically eliminated.',
      icon: <Cpu className="w-6 h-6 text-[#6EE7B7]" />,
      payload: 'Trimmed: 720 tokens retained (-70%)',
      metric: 'Zero Information Loss',
      isHero: true, // Emphasized Hero Node
    },
    {
      num: '04',
      title: 'Ultra-Lean LLM Generation',
      subtitle: 'Gemini / Claude / OpenAI',
      desc: 'Only the distilled, high-signal tokens are sent to the LLM. You get 45% faster time-to-first-token and 60% lower API invoices.',
      icon: <Bot className="w-5 h-5 text-[#80f9c8]" />,
      payload: 'Inference latency: 120ms (vs 240ms)',
      metric: 'Exact Same Answer Quality',
      isHero: false,
    },
  ];

  // Auto-play interactive live replay mini-visual
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setReplayStep((prev) => (prev + 1) % 4);
    }, 2800);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const replaySamples = [
    {
      label: 'Stage 1: Raw Vector Dump (Full Bloat)',
      tokens: 2450,
      cost: '$0.0245',
      badge: 'Uncompressed',
      badgeColor: 'text-[#F87171] bg-[#F87171]/10 border-[#F87171]/30',
      text: `Acme Corp reported Q3 revenue of $420 million, representing a 28% year-over-year growth driven by enterprise SaaS adoption. The conference call featured opening remarks by the CEO who talked at length about his summer vacation and company culture. Gross margin expanded by 180 basis points to 74.2%. Many general remarks were shared regarding macro weather conditions. Operating margin reached 22.5%, surpassing consensus estimates of 19.8%. The slide deck was presented on Zoom.`,
    },
    {
      label: 'Stage 2: Semantic Relevance Scanning',
      tokens: 1820,
      cost: '$0.0182',
      badge: 'Scanning Intent',
      badgeColor: 'text-[#818CF8] bg-[#818CF8]/10 border-[#818CF8]/30',
      text: `Acme Corp reported Q3 revenue of $420 million, representing a 28% year-over-year growth driven by enterprise SaaS adoption. [Filtering non-revenue remarks] Gross margin expanded by 180 basis points to 74.2%. [Filtering presentation remarks] Operating margin reached 22.5%, surpassing consensus estimates of 19.8%.`,
    },
    {
      label: 'Stage 3: TokenDiet Surgical Pruning',
      tokens: 720,
      cost: '$0.0072',
      badge: '-70% Compressed',
      badgeColor: 'text-[#6EE7B7] bg-[#6EE7B7]/15 border-[#6EE7B7]/40 font-bold',
      text: `Acme Corp reported Q3 revenue of $420 million (28% YoY growth via enterprise SaaS). Gross margin: 74.2% (+180 bps). Operating margin: 22.5% (vs 19.8% consensus).`,
    },
    {
      label: 'Stage 4: Lean LLM Inference Delivered',
      tokens: 720,
      cost: '$0.0072',
      badge: 'Answer Delivered (120ms)',
      badgeColor: 'text-[#80f9c8] bg-[#80f9c8]/15 border-[#80f9c8]/40 font-bold',
      text: `LLM Response: "Acme Corp Q3 revenue was $420M (+28% YoY growth), gross margin was 74.2%, and operating margin reached 22.5%."`,
    },
  ];

  return (
    <section className="space-y-12 my-24 scroll-mt-28" id="how-it-works">
      {/* Section Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#1C1C26] border border-[#2A2A38] font-mono-code text-xs text-[#6EE7B7] uppercase tracking-wider shadow-inner">
          <Zap className="w-3.5 h-3.5 text-[#6EE7B7]" />
          <span>END-TO-END PIPELINE</span>
        </div>
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-[#e4e1ed] tracking-tight">
          From bloated prompts to lean context — in four steps
        </h2>
        <p className="font-body text-base text-[#bccac1] leading-relaxed">
          TokenDiet functions as a high-throughput, stateless middle layer between your retrieval system and your foundation models.
        </p>
      </div>

      {/* 4-Step Horizontal Stepper with Flowing Dotted Connector Line */}
      <div className="relative border-technical bg-[#14141C]/50 backdrop-blur-md rounded-2xl p-6 sm:p-8 lg:p-10 shadow-premium-card border-t border-white/10">
        {/* Animated Flowing Dotted Connecting Line (Visible on Desktop) */}
        <div className="hidden lg:block absolute top-[72px] left-[8%] right-[8%] h-2 pointer-events-none z-0">
          <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
            <line
              x1="0%"
              y1="50%"
              x2="100%"
              y2="50%"
              stroke="#6EE7B7"
              strokeWidth="2"
              strokeOpacity="0.4"
              className="animate-flow-dash"
            />
          </svg>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          {steps.map((item, idx) => (
            <div
              key={item.num}
              className={`flex flex-col justify-between rounded-xl p-6 transition-all duration-300 relative ${
                item.isHero
                  ? 'bg-gradient-to-b from-[#1C1C26] to-[#14141C] border-2 border-[#6EE7B7]/60 shadow-[0_0_30px_rgba(110,231,183,0.2)] lg:-translate-y-2'
                  : 'bg-[#1C1C26]/70 border border-[#2A2A38] hover:border-white/20'
              }`}
            >
              <div>
                {/* Node Number & Icon Badge */}
                <div className="flex justify-between items-center mb-5">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-inner ${
                      item.isHero
                        ? 'bg-[#6EE7B7]/20 border-[#6EE7B7] text-[#6EE7B7] shadow-[0_0_15px_rgba(110,231,183,0.3)]'
                        : 'bg-[#0A0A0F] border-[#2A2A38] text-[#818CF8]'
                    }`}
                  >
                    {item.icon}
                  </div>
                  <span
                    className={`font-mono-code text-xs font-bold px-2.5 py-1 rounded ${
                      item.isHero
                        ? 'bg-[#6EE7B7] text-[#0A0A0F]'
                        : 'bg-[#0A0A0F] text-[#888899] border border-[#2A2A38]'
                    }`}
                  >
                    STEP {item.num}
                  </span>
                </div>

                <h3 className="font-display text-lg font-bold text-[#e4e1ed] mb-1">
                  {item.title}
                </h3>
                <p className="font-mono-code text-[11px] text-[#6EE7B7] mb-3">
                  {item.subtitle}
                </p>
                <p className="font-body text-xs text-[#bccac1] leading-relaxed">
                  {item.desc}
                </p>
              </div>

              {/* Monospace Payload Metadata */}
              <div className="mt-6 pt-4 border-t border-white/5 space-y-1 font-mono-code text-[11px]">
                <div className="text-[#888899] truncate">{item.payload}</div>
                <div className="text-[#6EE7B7] font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-[#6EE7B7]" />
                  <span>{item.metric}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Interactive Replay Mini-Visual (Below Stepper) */}
      <div className="bg-[#14141C]/80 border border-[#2A2A38] rounded-2xl p-6 sm:p-8 shadow-premium-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#6EE7B7]/10 border border-[#6EE7B7]/30 text-[#6EE7B7]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-display text-lg font-bold text-[#e4e1ed]">
                Live Context Pruning Replay
              </h4>
              <p className="font-body text-xs text-[#888899]">
                Watch a real RAG prompt transform from raw vector bloat into lean, high-signal tokens.
              </p>
            </div>
          </div>

          {/* Stepper scrubber controls */}
          <div className="flex items-center gap-2 font-mono-code text-xs">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1 bg-[#1C1C26] hover:bg-[#2A2A38] text-[#e4e1ed] px-3 py-1.5 rounded-lg border border-[#2A2A38] cursor-pointer"
            >
              {isPlaying ? 'Pause Loop' : 'Play Loop'}
            </button>
            <div className="flex gap-1">
              {[0, 1, 2, 3].map((stepIdx) => (
                <button
                  key={stepIdx}
                  onClick={() => {
                    setReplayStep(stepIdx);
                    setIsPlaying(false);
                  }}
                  className={`w-8 h-7 rounded font-bold transition-all cursor-pointer ${
                    replayStep === stepIdx
                      ? 'bg-[#6EE7B7] text-[#0A0A0F] shadow-[0_0_10px_rgba(110,231,183,0.4)]'
                      : 'bg-[#0A0A0F] text-[#888899] border border-[#2A2A38] hover:text-white'
                  }`}
                >
                  {stepIdx + 1}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Replay Viewport */}
        <AnimatePresence mode="wait">
          <motion.div
            key={replayStep}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="bg-[#0A0A0F] border border-[#2A2A38] rounded-xl p-6 font-mono-code text-xs space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#6EE7B7] animate-pulse" />
                <span className="text-[#e4e1ed] font-bold">
                  {replaySamples[replayStep].label}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#888899]">
                  Est. Prompt Cost:{' '}
                  <span className="text-white font-bold">{replaySamples[replayStep].cost}</span>
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded border text-[11px] font-mono ${replaySamples[replayStep].badgeColor}`}
                >
                  {replaySamples[replayStep].badge}
                </span>
              </div>
            </div>

            <p className="font-body text-sm sm:text-base text-[#e4e1ed] leading-relaxed pt-1">
              {replaySamples[replayStep].text}
            </p>

            <div className="flex items-center justify-between text-[11px] text-[#888899] pt-2 border-t border-white/5 font-mono-code">
              <span>Token Count: {replaySamples[replayStep].tokens} tokens</span>
              <span className="text-[#6EE7B7]">
                {replayStep >= 2 ? 'High Signal-to-Noise Ratio' : 'Contains Raw Redundancy'}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};
