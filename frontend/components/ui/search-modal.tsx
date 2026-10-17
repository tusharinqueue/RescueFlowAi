"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, AlertTriangle, BarChart2, Settings, User, FileText, ArrowRight } from "lucide-react";
import { useIncidents } from "@/hooks/use-incidents";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

const QUICK_LINKS = [
  { label: "Dashboard",        href: "/dashboard",       icon: BarChart2     },
  { label: "Report Incident",  href: "/report",          icon: AlertTriangle },
  { label: "Incident History", href: "/incidents",       icon: FileText      },
  { label: "Settings",         href: "/settings",        icon: Settings      },
  { label: "Profile",          href: "/settings/profile",icon: User          },
];

export function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery]   = useState("");
  const inputRef            = useRef<HTMLInputElement>(null);
  const { incidents }       = useIncidents();

  // Search only over real user-reported incidents
  const results = query.length >= 2
    ? incidents
        .filter((i) =>
          `${i.title} ${i.location} ${i.id} ${i.description}`
            .toLowerCase()
            .includes(query.toLowerCase())
        )
        .slice(0, 5)
    : [];

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      setQuery("");
    }
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (!open) onClose();
      }
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const SEV_COLOR: Record<string, string> = {
    critical: "text-red-400",
    high:     "text-orange-400",
    moderate: "text-amber-400",
    low:      "text-green-400",
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -12 }}
            animate={{ opacity: 1, scale: 1,    y: 0 }}
            exit={{ opacity: 0, scale: 0.96,    y: -12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed left-1/2 top-[10vh] z-50 w-full max-w-[520px] -translate-x-1/2 overflow-hidden rounded-2xl border border-white/[0.1] bg-card shadow-2xl shadow-black/60"
            role="dialog"
            aria-label="Search"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3">
              <Search className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
              <input
                ref={inputRef}
                type="search"
                placeholder="Search your incidents by title, location, ID…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
                aria-label="Search query"
              />
              {query && (
                <button onClick={() => setQuery("")} aria-label="Clear search"
                  className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              )}
              <kbd className="hidden rounded border border-white/10 bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground sm:inline-flex">
                ESC
              </kbd>
            </div>

            {/* Results / Quick links */}
            <div className="max-h-[420px] overflow-y-auto p-2">
              {query.length >= 2 ? (
                <>
                  {results.length === 0 ? (
                    <div className="px-3 py-8 text-center space-y-1">
                      <p className="text-sm text-muted-foreground">No incidents matching &ldquo;{query}&rdquo;</p>
                      {incidents.length === 0 && (
                        <p className="text-xs text-muted-foreground/60">
                          You haven&apos;t reported any incidents yet.{" "}
                          <Link href="/report" onClick={onClose} className="text-amber-400 hover:underline">Report one now</Link>
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-0.5">
                      <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                        Your Incidents
                      </p>
                      {results.map((incident) => (
                        <Link
                          key={incident.id}
                          href={`/incidents/${incident.id}`}
                          onClick={() => onClose?.()}
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/[0.04]"
                        >
                          <AlertTriangle className={cn("h-4 w-4 shrink-0", SEV_COLOR[incident.severity])} />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">{incident.title}</p>
                            <p className="text-[11px] text-muted-foreground">{incident.id} · {incident.location}</p>
                          </div>
                          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-0.5">
                  <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                    Quick Navigation
                  </p>
                  {QUICK_LINKS.map(({ label, href, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => onClose?.()}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/[0.04]"
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400/10">
                        <Icon className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
                      </div>
                      <span className="text-sm text-foreground">{label}</span>
                      <ArrowRight className="ml-auto h-3.5 w-3.5 text-muted-foreground/40" />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-3 border-t border-white/[0.06] px-4 py-2 text-[10px] text-muted-foreground/60">
              <span>↑↓ to navigate</span>
              <span>·</span>
              <span>↵ to select</span>
              <span>·</span>
              <span>ESC to close</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
