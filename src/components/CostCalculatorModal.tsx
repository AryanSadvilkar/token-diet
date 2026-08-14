import React, { useState } from 'react';
import { X, DollarSign, Calculator, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CostCalculatorModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const [dailyRequests, setDailyRequests] = useState<number>(100000);
  const [avgPromptTokens, setAvgPromptTokens] = useState<number>(3000);
  const [selectedModelPrice, setSelectedModelPrice] = useState<number>(2.50); // $2.50 per 1M tokens (e.g. GPT-4o)
  const [targetCompression, setTargetCompression] = useState<number>(0.60); // 60% savings

  if (!isOpen) return null;

  // Calculate monthly stats (30 days)
  const totalRawTokensMonthly = dailyRequests * avgPromptTokens * 30; // tokens per month
  const rawCostMonthly = (totalRawTokensMonthly / 1000000) * selectedModelPrice;
  const tokensSavedMonthly = totalRawTokensMonthly * targetCompression;
  const costSavedMonthly = (tokensSavedMonthly / 1000000) * selectedModelPrice;
  const optimizedCostMonthly = rawCostMonthly - costSavedMonthly;
  const costSavedAnnual = costSavedMonthly * 12;

  const modelOptions = [
    { name: 'GPT-4o ($2.50/M tokens)', price: 2.50 },
    { name: 'Claude 3.5 Sonnet ($3.00/M tokens)', price: 3.00 },
    { name: 'Gemini 1.5 Pro ($1.25/M tokens)', price: 1.25 },
    { name: 'Llama 3.1 70B ($0.90/M tokens)', price: 0.90 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#14141C] border border-[#2A2A38] rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#888899] hover:text-white rounded-lg bg-[#1C1C26] hover:bg-[#2A2A38] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#6EE7B7]/10 border border-[#6EE7B7]/30 text-[#6EE7B7]">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display text-xl font-bold text-[#e4e1ed]">
              RAG Cost Reduction Calculator
            </h3>
            <p className="font-body text-xs text-[#bccac1]">
              Estimate your monthly API savings with TokenDiet semantic compression.
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4 font-mono-code text-xs bg-[#0A0A0F] p-4 rounded-xl border border-[#2A2A38]">
          {/* Daily Request Volume Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[#bccac1]">
              <span>Daily RAG Queries:</span>
              <span className="text-[#6EE7B7] font-bold tabular-nums">
                {dailyRequests.toLocaleString()} req/day
              </span>
            </div>
            <input
              type="range"
              min={10000}
              max={1000000}
              step={10000}
              value={dailyRequests}
              onChange={(e) => setDailyRequests(Number(e.target.value))}
              className="w-full accent-[#6EE7B7] cursor-pointer"
            />
          </div>

          {/* Average Prompt Tokens */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-[#bccac1]">
              <span>Avg Tokens Per Context Window:</span>
              <span className="text-[#6EE7B7] font-bold tabular-nums">
                {avgPromptTokens.toLocaleString()} tokens
              </span>
            </div>
            <input
              type="range"
              min={1000}
              max={16000}
              step={500}
              value={avgPromptTokens}
              onChange={(e) => setAvgPromptTokens(Number(e.target.value))}
              className="w-full accent-[#6EE7B7] cursor-pointer"
            />
          </div>

          {/* Target LLM Selection */}
          <div className="space-y-1.5 pt-2">
            <label className="text-[#bccac1] block">Target LLM Model:</label>
            <select
              value={selectedModelPrice}
              onChange={(e) => setSelectedModelPrice(Number(e.target.value))}
              className="w-full bg-[#14141C] border border-[#2A2A38] text-[#e4e1ed] rounded-lg p-2.5 outline-none focus:border-[#6EE7B7]"
            >
              {modelOptions.map((opt) => (
                <option key={opt.name} value={opt.price}>
                  {opt.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Calculated Results Summary Box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#1C1C26] border border-[#2A2A38] p-4 rounded-xl space-y-1">
            <span className="font-mono-code text-[11px] text-[#888899] uppercase">
              Current Uncompressed Bill
            </span>
            <div className="font-mono-code text-2xl font-bold text-[#F87171] tabular-nums">
              ${Math.round(rawCostMonthly).toLocaleString()} / mo
            </div>
            <p className="font-body text-[11px] text-[#888899]">
              {(totalRawTokensMonthly / 1000000000).toFixed(2)}B tokens processed
            </p>
          </div>

          <div className="bg-[#6EE7B7]/10 border border-[#6EE7B7]/40 p-4 rounded-xl space-y-1">
            <span className="font-mono-code text-[11px] text-[#6EE7B7] font-bold uppercase">
              ESTIMATED MONTHLY SAVINGS
            </span>
            <div className="font-mono-code text-2xl font-bold text-[#6EE7B7] tabular-nums">
              ${Math.round(costSavedMonthly).toLocaleString()} / mo
            </div>
            <p className="font-body text-[11px] text-[#6EE7B7]">
              Annual ROI: ${Math.round(costSavedAnnual).toLocaleString()} / year
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full bg-[#6EE7B7] text-[#0A0A0F] font-mono-code text-xs py-3.5 rounded-xl font-bold uppercase tracking-wider btn-hover-glow cursor-pointer"
          >
            Start Compressing My RAG Pipeline
          </button>
        </div>
      </div>
    </div>
  );
};
