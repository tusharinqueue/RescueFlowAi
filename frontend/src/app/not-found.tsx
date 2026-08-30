import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "404 – Page Not Found" };

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <div className="space-y-2">
        <p className="font-mono text-6xl font-bold text-primary/40">404</p>
        <h1 className="text-3xl font-bold text-foreground">Page not found</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
      </div>
      <Link
        href="/"
        className="inline-flex h-10 items-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground hover:opacity-90"
      >
        Back to Home
      </Link>
    </div>
  );
}
