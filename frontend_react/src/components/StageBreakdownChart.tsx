"use client";

import React, { useRef } from "react";
import { scaleLinear, scaleBand } from "@visx/scale";
import { Group } from "@visx/group";
import { useTooltip, Tooltip, defaultStyles } from "@visx/tooltip";
import { ParentSize } from "@visx/responsive";
import { StageTimings } from "../types/benchmark";

interface StageBreakdownChartProps {
  breakdown: StageTimings;
}

interface TimingDataItem {
  name: string;
  ms: number;
}

const ChartInner: React.FC<{
  breakdown: StageTimings;
  width: number;
  height: number;
}> = ({ breakdown, width, height }) => {
  const containerRef = useRef<SVGSVGElement>(null);

  const data: TimingDataItem[] = [
    { name: "Unit Formation", ms: breakdown.unit_formation },
    { name: "Fast Filter", ms: breakdown.fast_filter },
    { name: "Cross-Encoder Rerank", ms: breakdown.rerank },
    { name: "Budget Selection", ms: breakdown.selection },
    { name: "Pack", ms: breakdown.pack }
  ];

  const total = data.reduce((acc, d) => acc + d.ms, 0) || 1.0;

  // Margin definitions
  const margin = { top: 10, right: 30, bottom: 20, left: 130 };
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  // visx scales
  const xScale = scaleLinear<number>({
    domain: [0, Math.max(...data.map((d) => d.ms)) * 1.1 || 10],
    range: [0, xMax],
  });

  const yScale = scaleBand<string>({
    domain: data.map((d) => d.name),
    range: [0, yMax],
    padding: 0.35,
  });

  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip<TimingDataItem>();

  return (
    <div className="relative">
      <svg ref={containerRef} width={width} height={height}>
        {/* Background grids */}
        <Group left={margin.left} top={margin.top}>
          {xScale.ticks(5).map((tick, i) => {
            const x = xScale(tick);
            return (
              <line
                key={`grid-${i}`}
                x1={x}
                x2={x}
                y1={0}
                y2={yMax}
                stroke="rgba(255, 255, 255, 0.04)"
                strokeWidth={1}
              />
            );
          })}

          {/* Render bars and labels */}
          {data.map((d, i) => {
            const barWidth = xScale(d.ms);
            const barHeight = yScale.step() * (1 - yScale.padding());
            const barY = yScale(d.name) || 0;

            return (
              <g key={`bar-group-${i}`}>
                {/* Y-Axis labels */}
                <text
                  x={-15}
                  y={barY + barHeight / 2}
                  dy="0.35em"
                  fill="#E2E8F0"
                  textAnchor="end"
                  className="font-sans text-[11px] font-semibold"
                >
                  {d.name}
                </text>

                {/* Interactive bar */}
                <rect
                  className="cursor-pointer fill-[#06B6D4] hover:fill-[#22D3EE] transition-colors duration-150"
                  x={0}
                  y={barY}
                  width={barWidth}
                  height={barHeight}
                  rx={4}
                  onMouseMove={(event) => {
                    const rect = event.currentTarget.ownerSVGElement?.getBoundingClientRect();
                    const x = rect ? event.clientX - rect.left : event.clientX;
                    const y = rect ? event.clientY - rect.top : event.clientY;
                    showTooltip({
                      tooltipData: d,
                      tooltipLeft: x,
                      tooltipTop: y - 20,
                    });
                  }}
                  onMouseLeave={() => {
                    hideTooltip();
                  }}
                />
              </g>
            );
          })}

          {/* X-Axis bottom line */}
          <line
            x1={0}
            x2={xMax}
            y1={yMax}
            y2={yMax}
            stroke="#64748B"
            strokeWidth={1}
          />

          {/* X-Axis ticks */}
          {xScale.ticks(5).map((tick, i) => {
            const x = xScale(tick);
            return (
              <g key={`tick-${i}`} transform={`translate(${x}, ${yMax})`}>
                <line y2={4} stroke="#64748B" strokeWidth={1} />
                <text
                  y={16}
                  textAnchor="middle"
                  fill="#64748B"
                  className="font-mono text-[9px]"
                >
                  {tick}ms
                </text>
              </g>
            );
          })}
        </Group>
      </svg>

      {/* Tooltip Overlay */}
      {tooltipOpen && tooltipData && (
        <Tooltip
          top={tooltipTop}
          left={tooltipLeft}
          style={{
            ...defaultStyles,
            backgroundColor: "#131722",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            color: "#F8FAFC",
            padding: "10px 14px",
            borderRadius: "8px",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
            fontFamily: "var(--font-sans)",
            fontSize: "11px",
            pointerEvents: "none",
          }}
        >
          <div className="font-bold text-slate-100 font-display mb-1">{tooltipData.name}</div>
          <div className="font-mono text-cyan-accent text-xs">
            Duration: <span className="font-bold">{tooltipData.ms.toFixed(1)} ms</span>
          </div>
          <div className="font-mono text-slate-text text-[10px] mt-0.5">
            Share: <span className="font-bold">{((tooltipData.ms / total) * 100).toFixed(1)}%</span>
          </div>
        </Tooltip>
      )}
    </div>
  );
};

export const StageBreakdownChart: React.FC<StageBreakdownChartProps> = ({ breakdown }) => {
  return (
    <div className="bg-slate-card/40 border border-white/5 rounded-2xl p-6 shadow-lg h-[280px]">
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-text mb-4 font-display">
        ⚡ Compressor Stage Timings (ms)
      </div>
      <div className="w-full h-[180px]">
        <ParentSize>
          {({ width, height }) => (
            <ChartInner breakdown={breakdown} width={width} height={height} />
          )}
        </ParentSize>
      </div>
    </div>
  );
};
