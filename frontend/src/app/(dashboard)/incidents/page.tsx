"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search, AlertTriangle, Clock, CheckCircle2,
  PlusCircle, Camera, Video, Mic, FileText, CalendarDays, ChevronDown
} from "lucide-react";
import { useIncidents, type StoredIncident } from "@/hooks/use-incidents";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────
type Severity   = StoredIncident["severity"];
type SortOption = "newest" | "oldest" | "severity";

const SEVERITY_BADGE: Record<Severity, string> = {
  critical: "bg-red-500/20 text-red-400 border border-red-500/30 shadow-[0_0_8px_rgba(239,68,68,0.2)]",
  high:     "bg-orange-500/20 text-orange-400 border border-orange-500/30",
  moderate: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
  low:      "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
};

const SEVERITY_BORDER: Record<Severity, string> = {
  critical: "border-l-red-500/50",
  high:     "border-l-orange-500/50",
  moderate: "border-l-amber-500/50",
  low:      "border-l-emerald-500/50",
};

const SEVERITY_ORDER: Record<Severity, number> = {
  critical: 0, high: 1, moderate: 2, low: 3,
};

const METHOD_ICON: Record<StoredIncident["method"], React.ElementType> = {
  photo: Camera, video: Video, voice: Mic, text: FileText,
};

// ── Helpers ────────────────────────────────────────────────────────────────
function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function dateOnly(iso: string) {
  return iso.slice(0, 10); // "YYYY-MM-DD"
}

export default function IncidentsPage() {
  const { incidents: live } = useIncidents();

  const [query,    setQuery]    = useState("");
  const [severity, setSeverity] = useState<Severity | "all">("all");
  const [sortBy,   setSortBy]   = useState<SortOption>("newest");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo,   setDateTo]   = useState("");
  const [page,     setPage]     = useState(1);
  const PER_PAGE = 8;

  const filtered = useMemo(() => {
    let result = live.filter(inc => {
      if (severity !== "all" && inc.severity !== severity) return false;
      if (query) {
        const haystack = `${inc.id} ${inc.title} ${inc.location} ${inc.description}`.toLowerCase();
        if (!haystack.includes(query.toLowerCase())) return false;
      }
      if (dateFrom && dateOnly(inc.reportedAt) < dateFrom) return false;
      if (dateTo   && dateOnly(inc.reportedAt) > dateTo)   return false;
      return true;
    });

    result = [...result].sort((a, b) => {
      if (sortBy === "newest")   return new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime();
      if (sortBy === "oldest")   return new Date(a.reportedAt).getTime() - new Date(b.reportedAt).getTime();
      if (sortBy === "severity") return SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
      return 0;
    });

    return result;
  }, [live, query, severity, sortBy, dateFrom, dateTo]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged      = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white/90">Incident Management</h1>
          <p className="text-xs text-white/40">
            {filtered.length} incident{filtered.length !== 1 ? "s" : ""} found
            {live.length > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
                {live.length} reported by you
              </span>
            )}
          </p>
        </div>
        <Link
          href="/report"
          className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-xs hover:bg-amber-400 transition-all"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Report New Incident</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-4 shadow-xs space-y-3">
        {/* Row 1: Search + Sort */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              placeholder="Search by ID, title, location…"
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] pl-9 pr-3 py-2 text-xs text-white/90 focus:border-amber-500 focus:bg-white/[0.08] outline-none placeholder:text-white/30"
            />
          </div>
          <div className="relative">
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
            <select
              value={sortBy}
              onChange={e => { setSortBy(e.target.value as SortOption); setPage(1); }}
              className="appearance-none rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 pr-8 text-xs font-semibold text-white/70 focus:border-amber-500 outline-none cursor-pointer"
            >
              <option value="newest"   className="bg-slate-900 text-white">Newest First</option>
              <option value="oldest"   className="bg-slate-900 text-white">Oldest First</option>
              <option value="severity" className="bg-slate-900 text-white">By Severity</option>
            </select>
          </div>
        </div>

        {/* Row 2: Severity pills + Date range */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex flex-wrap gap-1.5">
            {(["all", "critical", "high", "moderate", "low"] as const).map(s => (
              <button
                key={s}
                onClick={() => { setSeverity(s); setPage(1); }}
                className={cn(
                  "rounded-xl px-3 py-1 text-xs font-bold capitalize transition-all",
                  severity === s ? "bg-white/[0.12] text-white/90 border border-white/[0.2]" : "bg-white/[0.04] text-white/60 hover:bg-white/[0.1] border border-transparent"
                )}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <CalendarDays className="h-4 w-4 text-white/30 shrink-0" />
            <input
              type="date"
              value={dateFrom}
              onChange={e => { setDateFrom(e.target.value); setPage(1); }}
              className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-2 py-1.5 text-xs font-semibold text-white/70 focus:border-amber-500 outline-none [color-scheme:dark]"
            />
            <span className="text-xs text-white/30 font-medium">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={e => { setDateTo(e.target.value); setPage(1); }}
              className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-2 py-1.5 text-xs font-semibold text-white/70 focus:border-amber-500 outline-none [color-scheme:dark]"
            />
            {(dateFrom || dateTo) && (
              <button
                onClick={() => { setDateFrom(""); setDateTo(""); setPage(1); }}
                className="text-xs font-bold text-red-500 hover:text-red-700"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Incidents Grid */}
      {live.length === 0 ? (
        // Global empty state — no incidents reported at all
        <div className="rounded-2xl border border-dashed border-white/[0.08] py-20 text-center space-y-4">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-white/[0.04] border border-white/[0.08]">
            <AlertTriangle className="h-7 w-7 text-white/20" />
          </div>
          <div>
            <p className="text-sm font-bold text-white/40">No incidents reported yet</p>
            <p className="text-xs text-white/25 mt-1">Use the button above to report your first incident</p>
          </div>
          <Link
            href="/report"
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-all shadow-[0_0_20px_rgba(245,158,11,0.25)]"
          >
            <PlusCircle className="h-4 w-4" /> Report First Incident
          </Link>
        </div>
      ) : paged.length === 0 ? (
        // Filtered empty state
        <div className="rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.01] py-16 text-center">
          <AlertTriangle className="mx-auto h-10 w-10 text-white/20 mb-3" />
          <p className="text-sm font-bold text-white/40">No incidents match your filters</p>
          <p className="text-xs text-white/30 mt-1">Try adjusting the date range or search query</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paged.map(inc => {
            const MethodIcon = METHOD_ICON[inc.method] ?? FileText;
            return (
              <Link
                key={inc.id}
                href={`/incidents/${inc.id}`}
                className={cn(
                  "group block glass-card p-5 hover:bg-white/[0.06] transition-all border-l-4",
                  SEVERITY_BORDER[inc.severity]
                )}
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[11px] font-bold text-white/30">{inc.id}</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[9px] font-black text-emerald-400 uppercase tracking-wide">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" /> Live
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white/90 group-hover:text-amber-600 transition-colors mt-0.5 truncate">
                      {inc.title}
                    </h3>
                  </div>
                  <span className={cn("rounded-md px-2 py-0.5 text-[10px] font-black uppercase shrink-0", SEVERITY_BADGE[inc.severity])}>
                    {inc.severity}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-white/60 mt-2 line-clamp-2 leading-relaxed">
                  {inc.description}
                </p>

                {/* AI Summary if available */}
                {inc.aiSummary && inc.aiSummary !== inc.description && (
                  <p className="text-xs text-blue-300 bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2 mt-2 line-clamp-2 italic">
                    &ldquo;{inc.aiSummary}&rdquo;
                  </p>
                )}

                {/* Footer */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.08] pt-3">
                  <div className="flex items-center gap-3 text-[11px] font-medium text-white/40">
                    <span className="flex items-center gap-1">
                      <MethodIcon className="h-3 w-3" />
                      {inc.method}
                    </span>
                    <span>📍 {inc.location}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-[11px] font-bold text-white/70">{fmtDate(inc.reportedAt)}</p>
                    <p className="font-mono text-[10px] text-white/30">{fmtTime(inc.reportedAt)}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg glass-card border-0 px-3 py-1.5 text-xs font-bold text-white/60 hover:bg-white/[0.08] disabled:opacity-40"
          >
            ← Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={cn(
                "h-8 w-8 rounded-lg text-xs font-bold transition-all",
                page === p ? "bg-white/[0.12] text-white/90 border border-white/[0.2]" : "glass-card border-0 text-white/60 hover:bg-white/[0.08]"
              )}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-lg glass-card border-0 px-3 py-1.5 text-xs font-bold text-white/60 hover:bg-white/[0.08] disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
