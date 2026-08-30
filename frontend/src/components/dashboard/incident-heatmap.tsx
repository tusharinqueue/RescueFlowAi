"use client";

import { useState } from "react";
import { MapPin, AlertTriangle, Users, ShieldAlert, ChevronRight } from "lucide-react";
import { useIncidents } from "@/hooks/use-incidents";
import Link from "next/link";

export function IncidentHeatmap() {
  const { incidents } = useIncidents();

  const activeIncidents = incidents.filter(i => i.status !== "resolved");

  // Build location groups — key on first segment of the address
  const locationMap = new Map<string, typeof incidents>();
  for (const inc of activeIncidents) {
    const parts = inc.location.split(",");
    const key = (parts[0] ?? inc.location).trim() || "Unknown Location";
    if (!locationMap.has(key)) locationMap.set(key, []);
    const existing = locationMap.get(key);
    if (existing) existing.push(inc);
  }

  const zones = Array.from(locationMap.entries())
    .slice(0, 4)
    .map(([location, incs]) => {
      const hasCritical  = incs.some(i => i.severity === "critical");
      const hasHigh      = incs.some(i => i.severity === "high");
      const status       = hasCritical ? "CRITICAL" : hasHigh ? "HIGH RISK" : "ACTIVE";
      const borderGlow   = hasCritical
        ? "border-red-500/40 shadow-[0_0_14px_rgba(239,68,68,0.15)]"
        : hasHigh
          ? "border-orange-500/40 shadow-[0_0_14px_rgba(249,115,22,0.12)]"
          : "border-amber-500/30";
      const badgeColor   = hasCritical
        ? "bg-red-500/20 text-red-400 border border-red-500/30 shadow-[0_0_8px_rgba(239,68,68,0.2)]"
        : hasHigh
          ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
          : "bg-amber-500/20 text-amber-400 border border-amber-500/30";
      const dotColor     = hasCritical ? "bg-red-400" : hasHigh ? "bg-orange-400" : "bg-amber-400";
      const totalWorkers = incs.reduce((s, i) => s + (i.workersAtRisk ?? 0), 0);
      const latest       = incs[0];
      return { location, incs, status, borderGlow, badgeColor, dotColor, count: incs.length, totalWorkers, latest };
    });

  const [selectedIdx, setSelectedIdx] = useState(0);
  const selected = zones[selectedIdx] ?? null;

  if (zones.length === 0) {
    return (
      <div className="p-4">
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/[0.08] bg-white/[0.02] py-12 text-center">
          <MapPin className="h-8 w-8 text-white/15" />
          <div>
            <p className="text-xs font-bold text-white/35">No active incident zones</p>
            <p className="text-[11px] text-white/20 mt-0.5">
              <Link href="/report" className="text-amber-400 hover:underline">Report an incident</Link> to see zone telemetry
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      {/* Zone Cards Grid */}
      <div className={`grid gap-3 ${
        zones.length === 1 ? "grid-cols-1" :
        zones.length === 2 ? "grid-cols-2" :
        zones.length === 3 ? "grid-cols-3" : "grid-cols-2"
      }`}>
        {zones.map((zone, idx) => {
          const isSelected = selectedIdx === idx;
          return (
            <div
              key={zone.location}
              onClick={() => setSelectedIdx(idx)}
              className={`relative rounded-xl border p-3.5 flex flex-col gap-3 cursor-pointer transition-all ${
                isSelected
                  ? `bg-white/[0.07] ${zone.borderGlow} ring-1 ring-white/10`
                  : "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.14]"
              }`}
            >
              {/* Header row */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${zone.dotColor} ${isSelected ? "animate-pulse" : ""}`} />
                  <span className="text-xs font-bold text-white/90 truncate leading-tight">{zone.location}</span>
                </div>
                <span className={`rounded-md px-2 py-0.5 text-[8px] font-black uppercase shrink-0 ${zone.badgeColor}`}>
                  {zone.status}
                </span>
              </div>

              {/* Latest incident title */}
              {zone.latest && (
                <p className="text-[11px] text-white/55 font-medium leading-snug line-clamp-2">
                  {zone.latest.title}
                </p>
              )}

              {/* Stats row */}
              <div className="flex items-center justify-between mt-auto">
                <span className="flex items-center gap-1 text-[10px] font-semibold text-white/40">
                  <AlertTriangle className="h-3 w-3" />
                  {zone.count} incident{zone.count !== 1 ? "s" : ""}
                </span>
                {zone.totalWorkers > 0 && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-orange-400/80">
                    <Users className="h-3 w-3" />
                    {zone.totalWorkers} at risk
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Zone Info Banner */}
      {selected && (
        <Link
          href={`/incidents/${selected.latest?.id ?? ""}`}
          className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] transition-colors px-3.5 py-2.5 group"
        >
          <div className="flex items-center gap-2.5 min-w-0 text-xs">
            <MapPin className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span className="font-bold text-white/80 truncate">{selected.location}</span>
            <span className="text-white/25 shrink-0">•</span>
            <span className="text-white/45 font-medium shrink-0 truncate max-w-[200px]">
              Latest: <strong className="text-white/80">{selected.latest?.title ?? "—"}</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            <span className="text-xs font-bold text-amber-400">{selected.count} Active</span>
            <ChevronRight className="h-3.5 w-3.5 text-white/20 group-hover:text-amber-400 transition-colors" />
          </div>
        </Link>
      )}
    </div>
  );
}
