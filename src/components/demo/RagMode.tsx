import React from 'react';
import { RagPreset } from '../../types';
import { RAG_PRESETS } from '../../data/ragPresets';
import { FileText, Sparkles, HelpCircle } from 'lucide-react';

interface RagModeProps {
  selectedPresetId: string;
  onSelectPreset: (preset: RagPreset) => void;
  query: string;
  onChangeQuery: (query: string) => void;
}

export const RagMode: React.FC<RagModeProps> = ({
  selectedPresetId,
  onSelectPreset,
  query,
  onChangeQuery,
}) => {
  return (
    <div className="space-y-4">
      {/* Sample Retrieved Context Selector */}
      <div className="space-y-2 bg-[#14141C] border border-[#2A2A38] rounded-[12px] p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#9494A6] uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-[#6EE7B7]" />
            <span>Select Retrieved Document Context:</span>
          </span>
          <span className="text-[11px] text-[#818CF8] font-mono-code">
            3 Production Presets
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          {RAG_PRESETS.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => onSelectPreset(preset)}
                className={`p-3 rounded-[8px] border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#1C1C26] border-[#6EE7B7] text-[#F5F5F7] shadow-[0_0_15px_rgba(110,231,183,0.15)]'
                    : 'bg-[#0A0A0F] border-[#2A2A38] text-[#9494A6] hover:border-[#9494A6]/50 hover:text-[#F5F5F7]'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-semibold text-xs text-[#F5F5F7] truncate">
                      {preset.title}
                    </span>
                    <span className="text-[9px] font-mono-code px-1.5 py-0.5 rounded bg-[#14141C] border border-[#2A2A38] text-[#818CF8] shrink-0">
                      {preset.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#9494A6] line-clamp-2 leading-snug">
                    {preset.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Target User Query / Focus Directive Input */}
      <div className="bg-[#14141C] border border-[#2A2A38] rounded-[12px] p-4 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-[#F5F5F7] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#818CF8]" />
            <span>Target User Query / Focus Directive:</span>
          </label>
          <span className="text-[11px] text-[#9494A6] font-mono-code">
            Required for RAG relevance filtering
          </span>
        </div>

        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => onChangeQuery(e.target.value)}
            placeholder="e.g. What is the minimum uptime commitment and credit policy for P1 outages?"
            className="w-full bg-[#0A0A0F] border border-[#2A2A38] focus:border-[#6EE7B7] rounded-[8px] px-3.5 py-2.5 text-xs text-[#F5F5F7] font-mono-code outline-none transition-colors"
          />
        </div>

        <p className="text-[11px] text-[#9494A6] leading-relaxed">
          In real RAG pipelines, compression happens relative to the user's explicit question. Gemini will prune all context irrelevant to this query while preserving every direct factual answer.
        </p>
      </div>
    </div>
  );
};
