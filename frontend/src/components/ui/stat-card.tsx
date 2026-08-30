"use client";

import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { CountUp } from "@/components/ui/count-up";

type Trend = "up" | "down" | "neutral";

interface StatCardProps {
  title:       string;
  value:       string | number;
  subtitle?:   string;
  icon:        LucideIcon;
  trend?:      Trend;
  trendLabel?: string;
  variant?:    "default" | "critical" | "warning" | "success" | "info";
  glowing?:    boolean;
  className?:  string;
  delay?:      number;
  animated?:   boolean;
}

const VARIANT_STYLES = {
  default:  { icon: "text-amber-400  bg-amber-400/10",  border: "border-amber-400/20",  glow: "glow-yellow", accent: "from-amber-400/5"  },
  critical: { icon: "text-red-400    bg-red-400/10",    border: "border-red-400/20",    glow: "glow-red",    accent: "from-red-400/5"    },
  warning:  { icon: "text-orange-400 bg-orange-400/10", border: "border-orange-400/20", glow: "glow-orange", accent: "from-orange-400/5" },
  success:  { icon: "text-green-400  bg-green-400/10",  border: "border-green-400/20",  glow: "glow-green",  accent: "from-green-400/5"  },
  info:     { icon: "text-blue-400   bg-blue-400/10",   border: "border-blue-400/20",   glow: "glow-blue",   accent: "from-blue-400/5"   },
} as const;

const TREND_STYLES: Record<Trend, string> = {
  up:      "text-green-400",
  down:    "text-red-400",
  neutral: "text-muted-foreground",
};

const TREND_ARROWS: Record<Trend, string> = {
  up:      "↑",
  down:    "↓",
  neutral: "→",
};

export function StatCard({
  title, value, subtitle, icon: Icon, trend, trendLabel,
  variant = "default", glowing = false, className, delay = 0, animated = true,
}: StatCardProps) {
  const styles = VARIANT_STYLES[variant];
  const numericValue = typeof value === "number" ? value : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: "easeOut" }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-card p-5 transition-shadow duration-300",
        styles.border,
        glowing && styles.glow,
        "hover:shadow-2xl",
        className
      )}
    >
      {/* Background gradient sweep */}
      <div
        className={cn(
          "pointer-events-none absolute -right-4 -top-4 h-28 w-28 rounded-full bg-gradient-to-br to-transparent opacity-60",
          styles.accent
        )}
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-0 grid-pattern-fine opacity-[0.15]" aria-hidden="true" />

      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {title}
          </p>
          <p className="mt-2.5 text-4xl font-black tracking-tight text-foreground">
            {animated && numericValue !== null ? (
              <CountUp end={numericValue} duration={1200} />
            ) : (
              value
            )}
          </p>

          {(subtitle != null || (trend != null && trendLabel != null)) && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {trend != null && trendLabel != null && (
                <span className={cn(
                  "flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-bold",
                  trend === "up"   && "bg-green-500/10 text-green-400",
                  trend === "down" && "bg-red-500/10 text-red-400",
                  trend === "neutral" && "bg-secondary/60 text-muted-foreground",
                )}>
                  {TREND_ARROWS[trend]} {trendLabel}
                </span>
              )}
              {subtitle != null && (
                <span className="text-[11px] text-muted-foreground">{subtitle}</span>
              )}
            </div>
          )}
        </div>

        <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", styles.icon)}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>

      {/* Critical pulse ring */}
      {glowing && variant === "critical" && (
        <div className="pointer-events-none absolute right-4 top-4 h-11 w-11" aria-hidden="true">
          <span className="absolute inset-0 rounded-xl animate-ping-slow bg-red-500/25" />
        </div>
      )}
    </motion.div>
  );
}
