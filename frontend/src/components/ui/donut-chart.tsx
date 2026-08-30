"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutSlice[];
  size?: number;
  strokeWidth?: number;
  className?: string;
  showLegend?: boolean;
}

/**
 * Animated SVG donut chart.
 */
export function DonutChart({
  data,
  size = 180,
  strokeWidth = 28,
  className,
  showLegend = true,
}: DonutChartProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const total = data.reduce((s, d) => s + d.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;

  let cumulative = 0;

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
          {data.map((slice) => {
            const pct    = slice.value / total;
            const offset = circumference - pct * circumference;
            const dash   = circumference * pct;
            const dashOffset = circumference - cumulative * circumference / total;
            cumulative  += slice.value;
            const isActive = hovered === slice.label;

            return (
              <circle
                key={slice.label}
                cx={cx}
                cy={cy}
                r={radius}
                fill="none"
                stroke={slice.color}
                strokeWidth={isActive ? strokeWidth + 4 : strokeWidth}
                strokeLinecap="butt"
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={dashOffset}
                style={{ transition: "all 0.3s ease-out", cursor: "pointer" }}
                onMouseEnter={() => setHovered(slice.label)}
                onMouseLeave={() => setHovered(null)}
                aria-label={`${slice.label}: ${slice.value}%`}
              />
            );
          })}
        </svg>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {hovered ? (
            <>
              <span className="text-xl font-black text-foreground">
                {data.find((d) => d.label === hovered)?.value}%
              </span>
              <span className="text-[10px] text-muted-foreground">{hovered}</span>
            </>
          ) : (
            <>
              <span className="text-xl font-black text-foreground">{total}%</span>
              <span className="text-[10px] text-muted-foreground">Total</span>
            </>
          )}
        </div>
      </div>

      {showLegend && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 w-full">
          {data.map((slice) => (
            <div
              key={slice.label}
              className={cn(
                "flex items-center gap-2 cursor-pointer rounded-md px-1.5 py-0.5 transition-colors",
                hovered === slice.label ? "bg-white/[0.04]" : ""
              )}
              onMouseEnter={() => setHovered(slice.label)}
              onMouseLeave={() => setHovered(null)}
            >
              <span
                className="inline-block h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: slice.color }}
              />
              <span className="text-[11px] text-muted-foreground truncate">{slice.label}</span>
              <span className="ml-auto text-[11px] font-semibold text-foreground">{slice.value}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
