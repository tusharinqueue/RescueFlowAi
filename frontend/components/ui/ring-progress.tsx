"use client";

import { cn } from "@/lib/utils";

interface RingProgressProps {
  value: number;        // 0–100
  size?: number;        // px diameter
  strokeWidth?: number; // px
  color?: string;       // CSS color string
  trackColor?: string;
  label?: React.ReactNode;
  className?: string;
  animated?: boolean;
}

const COLOR_MAP: Record<string, string> = {
  critical: "#EF4444",
  high:     "#F97316",
  moderate: "#F59E0B",
  low:      "#22C55E",
  info:     "#3B82F6",
  success:  "#22C55E",
  warning:  "#F59E0B",
};

/**
 * SVG circular ring progress indicator.
 */
export function RingProgress({
  value,
  size = 64,
  strokeWidth = 5,
  color,
  trackColor = "hsl(220 22% 12%)",
  label,
  className,
  animated = true,
}: RingProgressProps) {
  const radius          = (size - strokeWidth) / 2;
  const circumference  = 2 * Math.PI * radius;
  const resolvedColor  = color
    ? (COLOR_MAP[color] ?? color)
    : value >= 90 ? COLOR_MAP.success
    : value >= 75 ? COLOR_MAP.info
    : value >= 60 ? COLOR_MAP.warning
    : COLOR_MAP.critical;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div
      className={cn("relative flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      role="meter"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={resolvedColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={animated ? { transition: "stroke-dashoffset 1s ease-out" } : undefined}
        />
      </svg>
      {label !== undefined && (
        <div className="absolute inset-0 flex items-center justify-center">
          {label}
        </div>
      )}
    </div>
  );
}
