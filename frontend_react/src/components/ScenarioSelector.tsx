"use client";

import React from "react";
import { FileText } from "lucide-react";

interface ScenarioSelectorProps {
  activePreset: string | null;
  onSelectPreset: (presetName: string, queryText: string) => void;
}

export const presets = {
  "Cloud SLA Policy": "What is the minimum uptime commitment and credit policy for P1 outages?",
  "Clinical Efficacy Study": "What were the primary efficacy endpoints observed in Phase 3?",
  "DB Connection Pooling": "What are the recommended connection pool sizes for high concurrency?"
};

export const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({
  activePreset,
  onSelectPreset,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-text font-display">
        <FileText size={14} className="text-cyan-accent" />
        <span>Scenario Presets</span>
      </div>
      <div className="flex flex-wrap gap-3">
        {Object.entries(presets).map(([name, query]) => {
          const isActive = activePreset === name;
          return (
            <button
              key={name}
              onClick={() => onSelectPreset(name, query)}
              className={`relative cursor-pointer px-4.5 py-2.5 text-xs font-semibold rounded-full border transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-emerald-accent/40 ${
                isActive
                  ? "bg-emerald-accent/12 border-emerald-accent/40 text-emerald-accent"
                  : "border-white/8 text-[#64748B] hover:text-slate-200 hover:border-white/20"
              }`}
            >
              <span>{name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
