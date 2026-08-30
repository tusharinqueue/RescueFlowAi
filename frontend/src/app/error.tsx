"use client";

import { useEffect } from "react";
import Link from "next/link";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log error to monitoring service in production
    console.error("[RescueFlowAI] Unhandled error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-destructive/30 bg-destructive/10">
        <span className="text-2xl">⚠️</span>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          An unexpected error occurred. Our team has been notified.
          {error.digest != null && (
            <span className="mt-1 block font-mono text-xs text-muted-foreground/60">
              Error ID: {error.digest}
            </span>
          )}
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={reset}
          className="inline-flex h-9 items-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex h-9 items-center rounded-md border border-border px-6 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
