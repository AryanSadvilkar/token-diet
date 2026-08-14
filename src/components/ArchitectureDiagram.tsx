import React, { useState } from 'react';
import {
  Database,
  FileText,
  Filter,
  Cpu,
  Sparkles,
  Send,
  Layers,
  CheckCircle2,
  Shield,
  Clock,
  Zap,
  ArrowRight,
} from 'lucide-react';

export const ArchitectureDiagram: React.FC = () => {
  const [showLatency, setShowLatency] = useState(true);

  const nodes = [
    {
      id: 'docs',
      name: 'Unstructured Docs',
      tech: 'PDFs / Markdown / SQL',
      type: 'Ingestion Layer',
      icon: <FileText className="w-5 h-5 text-[#818CF8]" />,
      status: 'Source Data',
      latencyLabel: '4ms parsing',
    },
    {
      id: 'vector',
      name: 'Vector Database',
      tech: 'ChromaDB / Pinecone',
      type: 'Index Layer',
      icon: <Database className="w-5 h-5 text-[#818CF8]" />,
      status: 'Top-K Retrieval',
      latencyLabel: '22ms query',
    },
    {
      id: 'retriever',
      name: 'Semantic Retriever',
      tech: 'Cosine Similarity',
      type: 'Query Routing',
      icon: <Filter className="w-5 h-5 text-[#818CF8]" />,
      status: 'Raw Chunks (2.5k tok)',
      latencyLabel: '6ms buffer',
    },
    {
      id: 'compressor',
      name: 'TokenDiet Gateway',
      tech: 'Rust SIMD + BM25/CE',
      type: 'Compression Layer',
      icon: <Cpu className="w-6 h-6 text-[#6EE7B7]" />,
      status: '-68% Token Cut',
      isHero: true,
      latencyLabel: '+12ms overhead',
    },
    {
      id: 'llm',
      name: 'Foundation Model',
      tech: 'Gemini 2.0 / GPT-4o',
      type: 'Inference Engine',
      icon: <Sparkles className="w-5 h-5 text-[#80f9c8]" />,
      status: '720 Tokens (Lean)',
      latencyLabel: '110ms TTFT (-45%)',
    },
    {
      id: 'output',
      name: 'User Response',
      tech: 'Streamed Output',
      type: 'Application Client',
      icon: <Send className="w-5 h-5 text-[#80f9c8]" />,
      status: 'Instant UI Render',
      latencyLabel: 'Total: 154ms',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Toggle Bar for Latency Inspection */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#14141C] border border-[#2A2A38] p-4 rounded-xl font-mono-code text-xs">
        <div className="flex items-center gap-2 text-[#bccac1]">
          <Layers className="w-4 h-4 text-[#6EE7B7]" />
          <span className="text-[#e4e1ed] font-bold uppercase">System Latency Profiling</span>
          <span className="hidden md:inline text-[#888899]">• In-memory proxy topology</span>
        </div>

        <button
          onClick={() => setShowLatency(!showLatency)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all cursor-pointer font-bold ${
            showLatency
              ? 'bg-[#6EE7B7]/15 border-[#6EE7B7]/50 text-[#6EE7B7] shadow-glow-mint-soft'
              : 'bg-[#0A0A0F] border-[#2A2A38] text-[#888899] hover:text-white'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{showLatency ? 'Latency Overlay: Active' : 'Show Latency at Each Stage'}</span>
        </button>
      </div>

      {/* Rack Style Architecture Pipeline */}
      <div className="border-technical bg-[#14141C]/80 backdrop-blur-md rounded-2xl p-6 sm:p-8 md:p-10 shadow-premium-card border-t border-white/10 relative overflow-hidden">
        {/* Animated Background Flow Line on Desktop */}
        <div className="hidden xl:block absolute top-[90px] left-[5%] right-[5%] h-2 pointer-events-none z-0">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 relative z-10">
          {nodes.map((node, idx) => (
            <div
              key={node.id}
              className={`rounded-xl p-5 flex flex-col justify-between transition-all duration-300 relative group ${
                node.isHero
                  ? 'bg-[#1C1C26] border-2 border-[#6EE7B7] shadow-[0_0_25px_rgba(110,231,183,0.25)] xl:-translate-y-2'
                  : 'bg-[#14141C] border border-[#2A2A38] hover:border-white/20'
              }`}
            >
              <div>
                {/* Rack Node Header */}
                <div className="flex justify-between items-center mb-3">
                  <div
                    className={`p-2 rounded-lg border ${
                      node.isHero
                        ? 'bg-[#6EE7B7]/20 border-[#6EE7B7] text-[#6EE7B7]'
                        : 'bg-[#0A0A0F] border-[#2A2A38]'
                    }`}
                  >
                    {node.icon}
                  </div>
                  <span className="font-mono-code text-[10px] text-[#888899]">
                    NODE 0{idx + 1}
                  </span>
                </div>

                <div className="font-mono-code text-[10px] text-[#888899] uppercase tracking-wider mb-1">
                  {node.type}
                </div>
                <h3 className="font-display text-sm font-bold text-[#e4e1ed] mb-1">
                  {node.name}
                </h3>
              </div>

              {/* Server Rack Monospace Tech Caption */}
              <div className="mt-4 pt-3 border-t border-white/5 font-mono-code space-y-1.5">
                <div className="text-[11px] text-[#bccac1] font-medium truncate">
                  {node.tech}
                </div>
                <div
                  className={`text-[10px] px-2 py-0.5 rounded inline-block ${
                    node.isHero
                      ? 'bg-[#6EE7B7]/20 text-[#6EE7B7] font-bold'
                      : 'bg-[#0A0A0F] text-[#888899] border border-[#2A2A38]'
                  }`}
                >
                  {node.status}
                </div>

                {/* Toggleable Latency Badge */}
                {showLatency && (
                  <div
                    className={`text-[10px] px-2 py-0.5 rounded flex items-center gap-1 border ${
                      node.isHero
                        ? 'bg-[#6EE7B7]/10 text-[#6EE7B7] border-[#6EE7B7]/30'
                        : 'bg-[#1C1C26] text-[#80f9c8] border-white/5'
                    }`}
                  >
                    <Clock className="w-2.5 h-2.5" />
                    <span>{node.latencyLabel}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Latency Comparison Highlight Strip */}
        {showLatency && (
          <div className="mt-8 p-4 rounded-xl bg-[#0A0A0F] border border-[#6EE7B7]/30 flex flex-col md:flex-row items-center justify-between gap-4 font-mono-code text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#6EE7B7]/10 text-[#6EE7B7]">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[#e4e1ed] font-bold">Why TTFT is 45% faster:</div>
                <div className="text-[#888899] text-[11px]">
                  TokenDiet adds ~12ms proxy compute, but cuts LLM prefill ingestion time by ~130ms.
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold shrink-0">
              <div className="text-[#F87171]">Standard: ~290ms</div>
              <ArrowRight className="w-3.5 h-3.5 text-[#888899]" />
              <div className="text-[#6EE7B7]">TokenDiet: ~154ms (-47%)</div>
            </div>
          </div>
        )}

        {/* Security & Throughput Specs Footer Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/10 font-mono-code text-xs text-[#bccac1]">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#6EE7B7]" />
            <span>Zero Data Storage: Pure In-Memory Stream</span>
          </div>
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#818CF8]" />
            <span>Rust SIMD Vectorized Sentence Scoring</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#80f9c8]" />
            <span>Compatible with OpenAI, Anthropic, Gemini</span>
          </div>
        </div>
      </div>
    </div>
  );
};
