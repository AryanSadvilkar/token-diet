import React, { useState } from 'react';
import { DetailsSubTab } from '../../types';
import {
  Layers,
  Cpu,
  Calculator,
  FileCode,
  BarChart3,
  Copy,
  Check,
  Sparkles,
  Database,
  Search,
  Bot,
  FileText,
  MessageSquare,
  ArrowDown,
  ArrowRight,
} from 'lucide-react';

export const DetailsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DetailsSubTab>('how-it-works');

  // ROI Calculator interactive state
  const [queriesPerDay, setQueriesPerDay] = useState<number>(50000);
  const [tokensPerQuery, setTokensPerQuery] = useState<number>(2400);
  const [costPer1kTokens, setCostPer1kTokens] = useState<number>(0.0025); // $2.50 per 1M tokens

  // ROI Math
  const baselineMonthlyTokens = queriesPerDay * tokensPerQuery * 30;
  const baselineMonthlyCost = (baselineMonthlyTokens / 1000) * costPer1kTokens;
  const compressedMonthlyTokens = baselineMonthlyTokens * 0.4; // 60% reduction
  const compressedMonthlyCost = (compressedMonthlyTokens / 1000) * costPer1kTokens;
  const monthlySavings = baselineMonthlyCost - compressedMonthlyCost;
  const annualSavings = monthlySavings * 12;

  // Code snippet copy state
  const [copiedCode, setCopiedCode] = useState(false);

  const pythonSnippet = `import os
from tokendiet import TokenDietCompressor

# Initialize TokenDiet client with Gemini 2.0 Flash
compressor = TokenDietCompressor(
    api_key=os.environ.get("GEMINI_API_KEY"),
    model="gemini-2.0-flash",
    preserve_factual_entities=True
)

# 1. RAG Mode: Compress retrieved context relative to a user query
rag_result = compressor.compress(
    context="Master Cloud SLA warranty specifies 99.95% uptime...",
    query="What is the minimum SLA uptime commitment?"
)
print(f"RAG Compressed: {rag_result.text}")
print(f"Tokens Saved: {rag_result.tokens_saved} ({rag_result.percent_saved}%)")

# 2. Paste Mode: Distill rambling text or messy transcripts
draft_result = compressor.distill(
    text="Hey team, just wanted to quickly write down a few notes from the call..."
)
print(f"Distilled: {draft_result.text}")
`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(pythonSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const tabs: { id: DetailsSubTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'how-it-works', label: 'How It Works', icon: Layers },
    { id: 'architecture', label: 'Architecture', icon: Cpu },
    { id: 'calculator', label: 'ROI Calculator', icon: Calculator },
    { id: 'docs', label: 'Docs', icon: FileCode },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl">
      {/* Header - visually quieter than Live Demo/Compare */}
      <div className="space-y-1 border-b border-[#2A2A38] pb-3">
        <h2 className="text-xl font-bold text-[#F5F5F7] tracking-tight">
          Details & Technical Specifications
        </h2>
        <p className="text-xs text-[#9494A6]">
          Reference material covering pipeline mechanics, system architecture, ROI calculations, and SDK usage.
        </p>
      </div>

      {/* Horizontal Tab Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[#2A2A38] scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-[8px] text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-[#6EE7B7] text-[#0A0A0F] shadow-[0_0_10px_rgba(110,231,183,0.25)]'
                  : 'bg-[#14141C] text-[#9494A6] hover:text-[#F5F5F7] border border-[#2A2A38]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#0A0A0F]' : 'text-[#9494A6]'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: How It Works (4-step visual: Query → Retrieve → Compress → Generate, step 3 emphasized) */}
      {activeTab === 'how-it-works' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Step 1 */}
            <div className="bg-[#14141C] border border-[#2A2A38] rounded-[12px] p-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono-code">
                <span className="text-[#9494A6]">STEP 01</span>
                <span className="p-1 rounded bg-[#1C1C26] text-[#9494A6]">
                  <Search className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="font-bold text-xs sm:text-sm text-[#F5F5F7]">1. User Query</div>
              <p className="text-xs text-[#9494A6] leading-relaxed">
                User enters a question or prompt. Embedding models vectorize the input in real time.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#14141C] border border-[#2A2A38] rounded-[12px] p-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono-code">
                <span className="text-[#9494A6]">STEP 02</span>
                <span className="p-1 rounded bg-[#1C1C26] text-[#9494A6]">
                  <Database className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="font-bold text-xs sm:text-sm text-[#F5F5F7]">2. Retrieve Context</div>
              <p className="text-xs text-[#9494A6] leading-relaxed">
                Vector store fetches top-K document chunks (typically 2,000–8,000 tokens of noisy text).
              </p>
            </div>

            {/* Step 3 - EMPHASIZED CORE INNOVATION */}
            <div className="bg-[#14141C] border-2 border-[#6EE7B7] rounded-[12px] p-4 space-y-2.5 shadow-[0_0_15px_rgba(110,231,183,0.15)] relative overflow-hidden">
              <div className="absolute top-0 right-0 px-2 py-0.5 bg-[#6EE7B7] text-[#0A0A0F] font-mono-code text-[9px] font-bold rounded-bl">
                CORE INNOVATION
              </div>
              <div className="flex items-center justify-between text-xs font-mono-code">
                <span className="text-[#6EE7B7] font-bold">STEP 03</span>
                <span className="p-1 rounded bg-[#6EE7B7]/20 text-[#6EE7B7]">
                  <Sparkles className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="font-bold text-xs sm:text-sm text-[#6EE7B7]">3. TokenDiet Compress</div>
              <p className="text-xs text-[#F5F5F7] leading-relaxed">
                Gemini 2.0 Flash prunes 60% of redundant phrasing and filler while preserving 100% of facts.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-[#14141C] border border-[#2A2A38] rounded-[12px] p-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono-code">
                <span className="text-[#9494A6]">STEP 04</span>
                <span className="p-1 rounded bg-[#1C1C26] text-[#818CF8]">
                  <Bot className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="font-bold text-xs sm:text-sm text-[#F5F5F7]">4. LLM Generation</div>
              <p className="text-xs text-[#9494A6] leading-relaxed">
                Target LLM generates the final response with lower latency, zero hallucination, and lower cost.
              </p>
            </div>
          </div>

          <div className="bg-[#14141C] border border-[#2A2A38] rounded-[12px] p-4 text-xs text-[#9494A6] space-y-1.5">
            <div className="font-semibold text-[#F5F5F7]">Information-Preserving Distillation:</div>
            <p className="leading-relaxed">
              Unlike brute-force truncation which chops off sentences midway, TokenDiet's semantic filtering evaluates each sentence against user intent, dropping legal boilerplate and conversational filler while retaining key numbers, terms, and causal logic.
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: Architecture (system diagram showing BOTH entry points feeding into compression layer) */}
      {activeTab === 'architecture' && (
        <div className="space-y-4">
          <div className="bg-[#14141C] border border-[#2A2A38] rounded-[12px] p-5 sm:p-6 space-y-5">
            <div className="text-xs font-mono-code text-[#9494A6] uppercase tracking-wider">
              Dual-Entry System Architecture
            </div>

            {/* Diagram showing both entry points (Retrieved chunks AND direct user paste) */}
            <div className="space-y-4">
              {/* Two Entry Points */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Entry Point A: RAG Chunks */}
                <div className="bg-[#0A0A0F] border border-[#2A2A38] rounded-[10px] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#F5F5F7] flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#818CF8]" />
                      <span>Entry Point A: RAG Documents</span>
                    </span>
                    <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-[#1C1C26] text-[#818CF8]">
                      Vector Pipeline
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 text-center text-xs font-mono-code">
                    <div className="bg-[#14141C] border border-[#2A2A38] rounded p-2 flex-1">
                      <div className="text-[#F5F5F7] font-semibold">Vector Store</div>
                      <div className="text-[10px] text-[#9494A6]">Pinecone / Chroma</div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#9494A6] shrink-0" />
                    <div className="bg-[#14141C] border border-[#2A2A38] rounded p-2 flex-1">
                      <div className="text-[#F5F5F7] font-semibold">Retriever</div>
                      <div className="text-[10px] text-[#9494A6]">Top-K Chunks + Query</div>
                    </div>
                  </div>
                </div>

                {/* Entry Point B: Direct User Paste */}
                <div className="bg-[#0A0A0F] border border-[#2A2A38] rounded-[10px] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#F5F5F7] flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-[#6EE7B7]" />
                      <span>Entry Point B: User Input</span>
                    </span>
                    <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-[#1C1C26] text-[#6EE7B7]">
                      Direct Input
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 text-center text-xs font-mono-code">
                    <div className="bg-[#14141C] border border-[#2A2A38] rounded p-2 flex-1">
                      <div className="text-[#F5F5F7] font-semibold">Draft Text</div>
                      <div className="text-[10px] text-[#9494A6]">Pasted Messy Context</div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#9494A6] shrink-0" />
                    <div className="bg-[#14141C] border border-[#2A2A38] rounded p-2 flex-1">
                      <div className="text-[#F5F5F7] font-semibold">OCR Image</div>
                      <div className="text-[10px] text-[#9494A6]">Gemini Multimodal</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Convergence arrow */}
              <div className="flex justify-center text-[#6EE7B7]">
                <ArrowDown className="w-5 h-5 animate-bounce" />
              </div>

              {/* Shared Compression Layer */}
              <div className="bg-[#0A0A0F] border-2 border-[#6EE7B7] rounded-[10px] p-4 text-center space-y-1.5 shadow-[0_0_15px_rgba(110,231,183,0.15)]">
                <div className="inline-flex items-center gap-1.5 text-xs font-mono-code font-bold text-[#6EE7B7] uppercase">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Shared TokenDiet Compression Layer</span>
                </div>
                <div className="text-sm font-semibold text-[#F5F5F7]">
                  Gemini 2.0 Flash In-Memory Semantic Pruning
                </div>
                <div className="text-xs text-[#9494A6] font-mono-code">
                  Filters boilerplate, extracts entities, and removes filler words (0.1 Temperature)
                </div>
              </div>

              {/* Final Delivery */}
              <div className="flex justify-center text-[#818CF8]">
                <ArrowDown className="w-5 h-5" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#0A0A0F] border border-[#2A2A38] rounded-[10px] p-3 text-center">
                  <div className="text-xs font-bold text-[#F5F5F7]">Target Foundation LLM</div>
                  <div className="text-[10px] font-mono-code text-[#818CF8]">Receives High-Density Context</div>
                </div>
                <div className="bg-[#0A0A0F] border border-[#2A2A38] rounded-[10px] p-3 text-center">
                  <div className="text-xs font-bold text-[#F5F5F7]">Client Application</div>
                  <div className="text-[10px] font-mono-code text-[#6EE7B7]">Fast, Accurate Response</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ROI Calculator (3 sliders: queries/day, avg tokens/query, cost per 1k tokens) */}
      {activeTab === 'calculator' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Sliders Card */}
            <div className="bg-[#14141C] border border-[#2A2A38] rounded-[12px] p-5 space-y-5">
              <div className="text-xs font-mono-code text-[#9494A6] uppercase tracking-wider">
                Workload Parameters
              </div>

              {/* Slider 1: Queries per day */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#9494A6]">Queries Per Day:</span>
                  <span className="font-mono-code font-bold text-[#F5F5F7]">
                    {queriesPerDay.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="500000"
                  step="5000"
                  value={queriesPerDay}
                  onChange={(e) => setQueriesPerDay(Number(e.target.value))}
                  className="w-full accent-[#6EE7B7] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#9494A6] font-mono-code">
                  <span>5k / day</span>
                  <span>500k / day</span>
                </div>
              </div>

              {/* Slider 2: Avg tokens per query */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#9494A6]">Avg Tokens Per Context Chunk:</span>
                  <span className="font-mono-code font-bold text-[#F5F5F7]">
                    {tokensPerQuery.toLocaleString()} tokens
                  </span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="10000"
                  step="100"
                  value={tokensPerQuery}
                  onChange={(e) => setTokensPerQuery(Number(e.target.value))}
                  className="w-full accent-[#6EE7B7] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#9494A6] font-mono-code">
                  <span>500 tokens</span>
                  <span>10,000 tokens</span>
                </div>
              </div>

              {/* Slider 3: Cost per 1K tokens */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#9494A6]">Model Cost per 1K Tokens ($):</span>
                  <span className="font-mono-code font-bold text-[#818CF8]">
                    ${costPer1kTokens.toFixed(4)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.0005"
                  max="0.0150"
                  step="0.0005"
                  value={costPer1kTokens}
                  onChange={(e) => setCostPer1kTokens(Number(e.target.value))}
                  className="w-full accent-[#818CF8] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#9494A6] font-mono-code">
                  <span>$0.0005 (Flash tier)</span>
                  <span>$0.0150 (Pro/Ultra tier)</span>
                </div>
              </div>
            </div>

            {/* Live Calculated Output Card */}
            <div className="bg-[#14141C] border border-[#6EE7B7]/40 rounded-[12px] p-5 space-y-4 flex flex-col justify-between shadow-[0_0_20px_rgba(110,231,183,0.08)]">
              <div>
                <div className="text-xs font-mono-code text-[#6EE7B7] uppercase tracking-wider">
                  Live Cost Reductions
                </div>
                <div className="mt-3 space-y-3 font-mono-code">
                  <div className="bg-[#0A0A0F] p-3.5 rounded-[8px] border border-[#2A2A38] flex items-center justify-between">
                    <span className="text-xs text-[#9494A6] font-sans">Baseline Monthly Spend:</span>
                    <span className="text-sm font-bold text-[#F87171] tabular-nums">
                      ${Math.round(baselineMonthlyCost).toLocaleString()} / mo
                    </span>
                  </div>

                  <div className="bg-[#0A0A0F] p-3.5 rounded-[8px] border border-[#6EE7B7]/30 flex items-center justify-between">
                    <span className="text-xs text-[#9494A6] font-sans">Spend with TokenDiet (-60%):</span>
                    <span className="text-sm font-bold text-[#6EE7B7] tabular-nums">
                      ${Math.round(compressedMonthlyCost).toLocaleString()} / mo
                    </span>
                  </div>
                </div>
              </div>

              {/* Monthly & Annual Savings Highlights */}
              <div className="p-4 rounded-[8px] bg-[#6EE7B7]/10 border border-[#6EE7B7]/30 space-y-1">
                <div className="text-xs font-mono-code text-[#6EE7B7]">Estimated Monthly Savings</div>
                <div className="text-2xl sm:text-3xl font-mono-code font-bold text-[#6EE7B7] tabular-nums">
                  ${Math.round(monthlySavings).toLocaleString()}
                </div>
                <div className="text-[11px] text-[#9494A6]">
                  ~${Math.round(annualSavings).toLocaleString()} estimated annual savings
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Docs (pip-install + code snippet with copy button) */}
      {activeTab === 'docs' && (
        <div className="space-y-4">
          <div className="bg-[#14141C] border border-[#2A2A38] rounded-[12px] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-mono-code text-[#9494A6] uppercase tracking-wider">
                  Python SDK Reference
                </div>
                <div className="text-sm font-bold text-[#F5F5F7] mt-0.5">
                  Drop-in Context Compression
                </div>
              </div>

              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#1C1C26] border border-[#2A2A38] hover:border-[#6EE7B7] text-xs font-mono-code text-[#F5F5F7] cursor-pointer transition-colors"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#6EE7B7]" />
                    <span className="text-[#6EE7B7]">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            {/* Terminal install block */}
            <div className="bg-[#0A0A0F] border border-[#2A2A38] rounded-[8px] p-3 font-mono-code text-xs text-[#6EE7B7]">
              $ pip install tokendiet-ai @google/genai
            </div>

            {/* Python Code snippet */}
            <div className="bg-[#0A0A0F] border border-[#2A2A38] rounded-[8px] p-4 font-mono-code text-xs text-[#F5F5F7] leading-relaxed overflow-x-auto">
              <pre>{pythonSnippet}</pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Analytics (mockup dashboard card with trend & bar chart) */}
      {activeTab === 'analytics' && (
        <div className="space-y-4">
          <div className="bg-[#14141C] border border-[#2A2A38] rounded-[12px] p-5 space-y-5">
            <div className="flex items-center justify-between border-b border-[#2A2A38] pb-3">
              <div>
                <div className="text-xs font-mono-code text-[#9494A6] uppercase tracking-wider">
                  Telemetry & Compression Trends
                </div>
                <div className="text-sm font-bold text-[#F5F5F7] mt-0.5">
                  Production Benchmark
                </div>
              </div>
              <span className="text-[10px] font-mono-code px-2.5 py-1 rounded bg-[#6EE7B7]/15 text-[#6EE7B7] border border-[#6EE7B7]/30">
                Avg 60.8% Reduction
              </span>
            </div>

            {/* Trend Bar Chart Visualization */}
            <div className="space-y-2">
              <div className="text-xs text-[#9494A6]">Daily Token Volume (Raw vs Compressed):</div>
              <div className="grid grid-cols-7 gap-2 pt-2">
                {[
                  { day: 'Mon', raw: 100, comp: 38 },
                  { day: 'Tue', raw: 120, comp: 45 },
                  { day: 'Wed', raw: 140, comp: 52 },
                  { day: 'Thu', raw: 110, comp: 41 },
                  { day: 'Fri', raw: 160, comp: 58 },
                  { day: 'Sat', raw: 90, comp: 34 },
                  { day: 'Sun', raw: 85, comp: 31 },
                ].map((item) => (
                  <div key={item.day} className="flex flex-col items-center gap-1.5">
                    <div className="w-full h-28 bg-[#0A0A0F] border border-[#2A2A38] rounded flex flex-col justify-end p-1 relative group">
                      {/* Raw token bar (gray/red) */}
                      <div
                        style={{ height: `${(item.raw / 160) * 100}%` }}
                        className="w-full bg-[#F87171]/20 border-t border-[#F87171] rounded-t mb-1"
                      />
                      {/* Compressed token bar (mint) */}
                      <div
                        style={{ height: `${(item.comp / 160) * 100}%` }}
                        className="w-full bg-[#6EE7B7] rounded-t shadow-[0_0_8px_rgba(110,231,183,0.3)]"
                      />
                    </div>
                    <span className="text-[10px] font-mono-code text-[#9494A6]">{item.day}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center gap-6 pt-3 text-xs font-mono-code">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded bg-[#F87171]/40 border border-[#F87171]" />
                  <span className="text-[#9494A6]">Raw Tokens (Uncompressed)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded bg-[#6EE7B7]" />
                  <span className="text-[#6EE7B7]">Compressed Tokens (TokenDiet)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
