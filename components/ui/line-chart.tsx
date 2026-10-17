"use client";

import { cn } from "@/lib/utils";

interface LineChartProps {
  data: number[];
  labels?: string[];
  color?: string;
  height?: number;
  className?: string;
  showDots?: boolean;
  showArea?: boolean;
  showLabels?: boolean;
  animated?: boolean;
}

/**
 * SVG sparkline / line chart with optional area fill.
 */
export function LineChart({
  data,
  labels,
  color = "hsl(43 96% 56%)",
  height = 120,
  className,
  showDots = true,
  showArea = true,
  showLabels = true,
  animated = true,
}: LineChartProps) {
  if (!data.length) return null;

  const padding = { top: 12, right: 32, bottom: showLabels ? 28 : 12, left: 32 };
  const chartH  = height - padding.top - padding.bottom;
  const maxVal  = Math.max(...data);
  const minVal  = Math.min(...data);
  const range   = maxVal - minVal || 1;

  // Use a wide logical width to match typical container ratios 
  // and minimize viewBox distortion when using preserveAspectRatio="none"
  const pointCount = data.length;
  const W = 800; 

  const x = (i: number) => (i / (pointCount - 1)) * (W - padding.left - padding.right) + padding.left;
  const y = (v: number) => padding.top + ((maxVal - v) / range) * chartH;

  const polyPoints = data.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const areaPath   = `M ${x(0)},${y(data[0]!)} ` +
    data.slice(1).map((v, i) => `L ${x(i + 1)},${y(v)}`).join(" ") +
    ` L ${x(pointCount - 1)},${height} L ${x(0)},${height} Z`;

  const linePath = `M ${x(0)},${y(data[0]!)} ` +
    data.slice(1).map((v, i) => `L ${x(i + 1)},${y(v)}`).join(" ");

  const gradId = `line-chart-grad-${Math.random().toString(36).slice(2)}`;

  return (
    <div className={cn("w-full", className)}>
      <svg
        viewBox={`0 0 ${W} ${height}`}
        preserveAspectRatio="none"
        className="w-full overflow-visible"
        aria-label="Line chart"
        style={{ height }}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={color} stopOpacity={0.01} />
          </linearGradient>
        </defs>

        {/* Area fill */}
        {showArea && (
          <path d={areaPath} fill={`url(#${gradId})`} />
        )}

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          style={animated ? {
            strokeDasharray: 2000,
            strokeDashoffset: 0,
            animation: "draw-line 1.5s ease-out forwards",
          } : undefined}
        />

        {/* Dots */}
        {showDots && data.map((v, i) => (
          <circle
            key={i}
            cx={x(i)}
            cy={y(v)}
            r={5}
            fill={color}
            stroke="hsl(224 47% 4%)"
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
          />
        ))}

        {/* Labels */}
        {showLabels && labels && labels.map((label, i) => (
          <text
            key={i}
            x={x(i)}
            y={height - 6}
            textAnchor="middle"
            fontSize={12}
            fill="hsl(215 16% 45%)"
            vectorEffect="non-scaling-stroke"
          >
            {label}
          </text>
        ))}
      </svg>
    </div>
  );
}
