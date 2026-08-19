"use client";

import React, { useEffect, useState } from "react";
import { Play, Sparkles } from "lucide-react";

interface ExecutionBarProps {
  query: string;
  setQuery: (val: string) => void;
  isLoading: boolean;
  onExecute: () => void;
}

const STAGES = [
  { name: "Unit Formation" },
  { name: "Fast Filter" },
  { name: "Cross-Encoder Rerank" },
  { name: "Budget Selection" },
  { name: "Pack & Order" }
];

export const ExecutionBar: React.FC<ExecutionBarProps> = ({
  query,
  setQuery,
  isLoading,
  onExecute
}) => {
  const [visualLoading, setVisualLoading] = useState(false);
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  // Smooth indeterminate loading with a decelerating curve, then snap to 100%
  useEffect(() => {
    if (isLoading) {
      setVisualLoading(true);
      setProgress(0);
      setCurrentStageIdx(0);

      const interval = setInterval(() => {
        setProgress((prev) => {
          // Decelerate asymptotically towards 92%
          const next = prev + (92 - prev) * 0.06;
          
          // Step indices mapping
          const stageIndex = Math.min(
            Math.floor((next / 100) * STAGES.length),
            STAGES.length - 1
          );
          setCurrentStageIdx(stageIndex);
          return next;
        });
      }, 80);

      return () => clearInterval(interval);
    } else {
      if (visualLoading) {
        setProgress(100);
        setCurrentStageIdx(STAGES.length - 1);

        const timer = setTimeout(() => {
          setVisualLoading(false);
        }, 380);

        return () => clearTimeout(timer);
      }
    }
  }, [isLoading, visualLoading]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isLoading}
            placeholder="Type a custom query or select a preset chip above..."
            className="w-full bg-[#0A0A0C] text-slate-100 placeholder-slate-500 rounded-lg px-4 py-3.5 border border-white/8 focus:outline-none focus:border-cyan-accent focus:ring-1 focus:ring-cyan-accent transition-all duration-200 font-sans text-sm"
          />
          {query && (
            <div className="absolute right-3 top-3.5 flex items-center gap-1.5 text-[10px] bg-emerald-accent/10 border border-emerald-accent/20 px-2 py-0.5 rounded text-emerald-accent font-mono uppercase tracking-wide select-none">
              <Sparkles size={10} />
              <span>Ready</span>
            </div>
          )}
        </div>

        <button
          onClick={onExecute}
          disabled={isLoading || !query.trim()}
          className="cursor-pointer w-full md:w-56 h-[48px] flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-accent to-[#059669] text-white font-semibold rounded-lg shadow-lg hover:shadow-emerald-accent/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm">
              <span>Processing...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm">
              <Play size={14} fill="currentColor" />
              <span>⚡ Run Live Benchmark</span>
            </div>
          )}
        </button>
      </div>

      {/* 5-Stage Pipeline Loader */}
      {visualLoading && (
        <div className="overflow-hidden bg-slate-card/40 border border-white/5 rounded-xl p-5">
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-text font-medium font-display">Pipeline execution status:</span>
              <span className="text-cyan-accent font-semibold font-mono tracking-wide">
                Stage {currentStageIdx + 1}/5: {STAGES[currentStageIdx].name}
              </span>
            </div>

            {/* Progress track */}
            <div className="relative h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
              <div
                className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-cyan-accent to-emerald-accent rounded-full transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Segment Labeled Stages */}
            <div className="grid grid-cols-5 gap-2 pt-2">
              {STAGES.map((s, idx) => {
                const isDone = currentStageIdx > idx;
                const isActive = currentStageIdx === idx;
                return (
                  <div
                    key={s.name}
                    className="flex flex-col items-center text-center space-y-1"
                  >
                    <div
                      className={`h-2 w-2 rounded-full border transition-all duration-200 ${
                        isDone
                          ? "bg-emerald-accent border-emerald-accent scale-110 shadow-[0_0_6px_#10B981]"
                          : isActive
                          ? "bg-cyan-accent border-cyan-accent scale-110 animate-pulse"
                          : "bg-slate-card border-white/10"
                      }`}
                    />
                    <span
                      className={`text-[9px] font-semibold tracking-tight transition-all duration-200 font-display ${
                        isDone
                          ? "text-emerald-accent"
                          : isActive
                          ? "text-cyan-accent"
                          : "text-slate-text"
                      }`}
                    >
                      {s.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
