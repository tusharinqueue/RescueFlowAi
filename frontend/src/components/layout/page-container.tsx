import { cn } from "@/lib/utils";

interface PageContainerProps {
  heading?: string;
  subheading?: string;
  /** Extra class names on the outer wrapper */
  className?: string;
  children: React.ReactNode;
  /** Slot for header-row action buttons */
  actions?: React.ReactNode;
}

/**
 * Standard page content wrapper.
 * Provides consistent max-width, heading, subheading, and actions slot.
 */
export function PageContainer({
  heading,
  subheading,
  className,
  children,
  actions,
}: PageContainerProps) {
  return (
    <div className={cn("mx-auto w-full max-w-screen-2xl animate-fade-in", className)}>
      {/* Page header */}
      {(heading != null || actions != null) && (
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            {heading != null && (
              <h1 className="text-2xl font-bold text-foreground md:text-3xl">
                {heading}
              </h1>
            )}
            {subheading != null && (
              <p className="mt-1 text-sm text-muted-foreground">{subheading}</p>
            )}
          </div>

          {actions != null && (
            <div className="flex shrink-0 items-center gap-2">{actions}</div>
          )}
        </div>
      )}

      {/* Page content */}
      {children}
    </div>
  );
}
