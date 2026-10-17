import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const spinnerVariants = cva(
  "animate-spin rounded-full border-2 border-t-transparent",
  {
    variants: {
      size: {
        sm:      "h-4 w-4",
        default: "h-6 w-6",
        lg:      "h-10 w-10",
      },
      variant: {
        default:     "border-primary",
        muted:       "border-muted-foreground",
        destructive: "border-destructive",
        white:       "border-white",
      },
    },
    defaultVariants: {
      size:    "default",
      variant: "default",
    },
  }
);

interface SpinnerProps extends VariantProps<typeof spinnerVariants> {
  className?: string;
  label?: string;
}

export function Spinner({ size, variant, className, label = "Loading…" }: SpinnerProps) {
  return (
    <div role="status" aria-label={label} className="inline-flex items-center justify-center">
      <span className={cn(spinnerVariants({ size, variant }), className)} />
      <span className="sr-only">{label}</span>
    </div>
  );
}
