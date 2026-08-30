import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:   "border-transparent bg-primary/15 text-primary",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline:   "border-border text-foreground",
        // Severity badges
        critical:  "border-transparent bg-red-500/15   text-red-400",
        high:      "border-transparent bg-orange-500/15 text-orange-400",
        moderate:  "border-transparent bg-yellow-500/15 text-yellow-400",
        low:       "border-transparent bg-green-500/15  text-green-400",
        // Status badges
        pending:   "border-transparent bg-blue-500/15   text-blue-400",
        resolved:  "border-transparent bg-green-500/15  text-green-400",
        active:    "border-transparent bg-orange-500/15 text-orange-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /** Dot indicator before the label */
  dot?: boolean;
}

function Badge({ className, variant, dot = false, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span
          className="h-1.5 w-1.5 rounded-full bg-current"
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
