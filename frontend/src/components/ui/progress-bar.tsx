import { cn } from "@/lib/utils";

type ProgressVariant = "default" | "critical" | "warning" | "success" | "info";

interface ProgressBarProps {
  value:      number;      // 0-100
  variant?:   ProgressVariant;
  label?:     string;
  showValue?: boolean;
  height?:    "sm" | "md" | "lg";
  className?: string;
  animated?:  boolean;
}

const VARIANT_CLASSES: Record<ProgressVariant, string> = {
  default:  "bg-amber-400",
  critical: "bg-red-500",
  warning:  "bg-orange-500",
  success:  "bg-green-500",
  info:     "bg-blue-500",
};

const HEIGHT_CLASSES = { sm: "h-1", md: "h-1.5", lg: "h-2.5" };

export function ProgressBar({
  value, variant = "default", label, showValue = false,
  height = "md", className, animated = true,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={cn("w-full", className)}>
      {(label != null || showValue) && (
        <div className="mb-1.5 flex items-center justify-between">
          {label != null && <span className="text-xs text-muted-foreground">{label}</span>}
          {showValue && <span className="text-xs font-semibold text-foreground">{clamped}%</span>}
        </div>
      )}
      <div className={cn("w-full rounded-full bg-secondary/60", HEIGHT_CLASSES[height])}>
        <div
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
          className={cn(
            "rounded-full transition-all duration-700 ease-out",
            HEIGHT_CLASSES[height],
            VARIANT_CLASSES[variant],
            animated && "transition-[width]"
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
