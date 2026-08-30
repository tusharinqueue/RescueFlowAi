"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, FileText } from "lucide-react";
import { useIncidents } from "@/hooks/use-incidents";
import Link from "next/link";

export function IncidentTimeline() {
  const { incidents } = useIncidents();

  // Show the 5 most recent incidents
  const recent = [...incidents]
    .sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime())
    .slice(0, 5);

  if (recent.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.04] border border-white/[0.08]">
          <FileText className="h-5 w-5 text-white/20" />
        </div>
        <div>
          <p className="text-xs font-bold text-white/40">No incidents reported yet</p>
          <p className="text-[11px] text-white/25 mt-0.5">
            <Link href="/report" className="text-amber-400 hover:underline">Report an incident</Link> to see it here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recent.map((inc, idx) => {
        const isCritical   = inc.severity === "critical";
        const isResolved   = inc.status === "resolved";
        const isDispatched = inc.status === "dispatched";
        const time = new Date(inc.reportedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

        const severityColors =
          isCritical                 ? "bg-red-500/10 border-red-500/20 text-red-400" :
          inc.severity === "high"    ? "bg-orange-500/10 border-orange-500/20 text-orange-400" :
          inc.severity === "moderate"? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                                       "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";

        const statusBadge =
          isResolved   ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
          isDispatched ? "bg-amber-500/20 text-amber-400 border-amber-500/30" :
                         "bg-red-500/20 text-red-400 border-red-500/30 shadow-[0_0_8px_rgba(239,68,68,0.15)]";

        const statusLabel =
          isResolved   ? "Resolved" :
          isDispatched ? "Dispatched" : "Active";

        return (
          <Link key={inc.id} href={`/incidents/${inc.id}`}>
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.03] p-3.5 hover:bg-white/[0.06] hover:border-white/[0.12] transition-all text-xs cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${severityColors}`}>
                  {isResolved
                    ? <CheckCircle2 className="h-4 w-4" />
                    : <AlertTriangle className="h-4 w-4" />}
                </div>
                <div>
                  <p className="font-bold text-white/90 truncate max-w-[220px]">{inc.title}</p>
                  <p className="text-[11px] text-white/40 font-medium">
                    {inc.teams?.length > 0
                      ? <>Assigned to: <strong className="text-white/70">{inc.teams[0]}</strong></>
                      : <span className="text-white/30">📍 {inc.location}</span>}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="font-mono text-[11px] font-bold text-white/40 block">{time}</span>
                <span className={`inline-block mt-0.5 rounded px-2 py-0.5 text-[9px] font-black uppercase border ${statusBadge}`}>
                  {statusLabel}
                </span>
              </div>
            </motion.div>
          </Link>
        );
      })}
    </div>
  );
}
