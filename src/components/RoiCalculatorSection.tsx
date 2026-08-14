import React, { useState } from 'react';
import { Calculator, DollarSign, ArrowRight, TrendingUp, Zap, Sparkles, CheckCircle2 } from 'lucide-react';

export const RoiCalculatorSection: React.FC = () => {
  const [dailyRequests, setDailyRequests] = useState<number>(100000);
  const [avgPromptTokens, setAvgPromptTokens] = useState<number>(3500);
  const [selectedModelPrice, setSelectedModelPrice] = useState<number>(2.50); // $2.50 per 1M tokens (GPT-4o)
  const [reductionTarget, setReductionTarget] = useState<number>(0.60); // 60% savings

  // Calculations (30 days/month)
  const totalTokensMonthly = dailyRequests * avgPromptTokens * 30;
  const rawCostMonthly = (totalTokensMonthly / 1_000_000) * selectedModelPrice;
  const tokensSavedMonthly = totalTokensMonthly * reductionTarget;
  const costSavedMonthly = (tokensSavedMonthly / 1_000_000) * selectedModelPrice;
  const optimizedCostMonthly = rawCostMonthly - costSavedMonthly;
  const annualSavings = costSavedMonthly * 12;

  const models = [
    { name: 'GPT-4o ($2.50/M)', price: 2.50 },
    { name: 'Claude 3.5 Sonnet ($3.00/M)', price: 3.00 },
    { name: 'Gemini 1.5 Pro ($1.25/M)', price: 1.25 },
    { name: 'Llama 3.1 70B ($0.90/M)', price: 0.90 },
  ];

  // Visual Bar heights (percentage)
  const maxVal = Math.max(rawCostMonthly, 1);
  const rawBarHeight = 100;
  const optBarHeight = Math.max(10, Math.round((optimizedCostMonthly / maxVal) * 100));

  return (
    <section className="space-y-10 my-24 scroll-mt-28" id="calculator">
      {/* Section Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#1C1C26] border border-[#2A2A38] font-mono-code text-xs text-[#6EE7B7] uppercase tracking-wider shadow-inner">
          <Calculator className="w-3.5 h-3.5" />
          <span>ENTERPRISE ROI MODEL</span>
        </div>
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-[#e4e1ed] tracking-tight">
          Calculate your savings
        </h2>
        <p className="font-body text-base text-[#bccac1] leading-relaxed">
          See the exact dollar impact TokenDiet semantic context compression makes on your monthly LLM API bills.
        </p>
      </div>

      {/* Main Glass Calculator Card */}
      <div className="border-technical bg-[#14141C]/80 backdrop-blur-xl rounded-2xl p-6 sm:p-8 md:p-10 shadow-premium-card border-t border-white/10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Interactive Input Sliders & Model Presets (7 cols) */}
        <div className="lg:col-span-7 space-y-6 font-mono-code text-xs">
          {/* Daily Requests Slider */}
          <div className="space-y-2 bg-[#0A0A0F]/80 p-4 rounded-xl border border-[#2A2A38]">
            <div className="flex justify-between items-center text-[#bccac1]">
              <span className="font-bold uppercase tracking-wider">Queries per Day:</span>
              <span className="text-[#6EE7B7] text-sm font-bold tabular-nums">
                {dailyRequests.toLocaleString()} reqs/day
              </span>
            </div>
            <input
              type="range"
              min={10000}
              max={1000000}
              step={10000}
              value={dailyRequests}
              onChange={(e) => setDailyRequests(Number(e.target.value))}
              className="w-full accent-[#6EE7B7] cursor-pointer h-2 bg-[#1C1C26] rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-[#888899]">
              <span>10k / day</span>
              <span>500k / day</span>
              <span>1M+ / day</span>
            </div>
          </div>

          {/* Average Prompt Tokens Slider */}
          <div className="space-y-2 bg-[#0A0A0F]/80 p-4 rounded-xl border border-[#2A2A38]">
            <div className="flex justify-between items-center text-[#bccac1]">
              <span className="font-bold uppercase tracking-wider">Avg Tokens per Context Window:</span>
              <span className="text-[#6EE7B7] text-sm font-bold tabular-nums">
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
              className="w-full accent-[#6EE7B7] cursor-pointer h-2 bg-[#1C1C26] rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-[#888899]">
              <span>1k tokens</span>
              <span>8k tokens</span>
              <span>16k tokens</span>
            </div>
          </div>

          {/* Model Selection Preset Chips */}
          <div className="space-y-2 bg-[#0A0A0F]/80 p-4 rounded-xl border border-[#2A2A38]">
            <div className="text-[#bccac1] font-bold uppercase tracking-wider mb-2">
              Foundation LLM Target:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {models.map((mod) => {
                const isSelected = selectedModelPrice === mod.price;
                return (
                  <button
                    key={mod.name}
                    onClick={() => setSelectedModelPrice(mod.price)}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#6EE7B7]/15 border-[#6EE7B7] text-[#6EE7B7] font-bold shadow-[0_0_10px_rgba(110,231,183,0.15)]'
                        : 'bg-[#14141C] border-[#2A2A38] text-[#888899] hover:text-white'
                    }`}
                  >
                    <div className="text-[11px] truncate">{mod.name.split(' ')[0]}</div>
                    <div className="text-[10px] opacity-70">${mod.price}/M</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Live-Updating Output Panel & Comparison Bar Chart (5 cols) */}
        <div className="lg:col-span-5 bg-[#0A0A0F] border border-[#2A2A38] rounded-xl p-6 sm:p-7 space-y-6 shadow-inner">
          <div>
            <span className="font-mono-code text-[11px] text-[#888899] uppercase tracking-wider block mb-1">
              ESTIMATED MONTHLY SAVINGS
            </span>
            <div
              className="font-display text-4xl sm:text-5xl font-mono-code text-[#6EE7B7] font-bold tabular-nums tracking-tight"
              style={{ textShadow: '0 0 24px rgba(110, 231, 183, 0.4)' }}
            >
              ${Math.round(costSavedMonthly).toLocaleString()}
              <span className="text-base text-[#888899] font-normal ml-1">/ mo</span>
            </div>
            <p className="font-mono-code text-xs text-[#80f9c8] mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              Annual ROI: ${Math.round(annualSavings).toLocaleString()} / year
            </p>
          </div>

          {/* Interactive Comparison Bar Chart */}
          <div className="space-y-3 pt-3 border-t border-white/10 font-mono-code text-xs">
            <div className="text-[#888899] uppercase tracking-wider text-[10px]">
              Monthly Bill Breakdown Comparison:
            </div>

            {/* Without TokenDiet Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[#bccac1]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#F87171]" />
                  Without TokenDiet
                </span>
                <span className="text-[#F87171] font-bold tabular-nums">
                  ${Math.round(rawCostMonthly).toLocaleString()}
                </span>
              </div>
              <div className="w-full h-3 bg-[#1C1C26] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#F87171] rounded-full transition-all duration-300"
                  style={{ width: `${rawBarHeight}%` }}
                />
              </div>
            </div>

            {/* With TokenDiet Bar */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[#bccac1]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#6EE7B7]" />
                  With TokenDiet (-60%)
                </span>
                <span className="text-[#6EE7B7] font-bold tabular-nums">
                  ${Math.round(optimizedCostMonthly).toLocaleString()}
                </span>
              </div>
              <div className="w-full h-3 bg-[#1C1C26] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#6EE7B7] rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(110,231,183,0.5)]"
                  style={{ width: `${optBarHeight}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick takeaway badge */}
          <div className="bg-[#6EE7B7]/10 border border-[#6EE7B7]/30 rounded-lg p-3 font-mono-code text-xs text-[#6EE7B7] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#6EE7B7]" />
            <span>
              Saves {(tokensSavedMonthly / 1_000_000_000).toFixed(2)} Billion prompt tokens monthly.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
