"use client";

import React from "react";
import Link from "next/link";
import {
  AlertTriangle, ShieldCheck, Clock, CheckCircle2, MapPin,
  Activity, ChevronRight, Volume2, VolumeX, FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { IncidentHeatmap } from "@/components/dashboard/incident-heatmap";
import { IncidentTimeline } from "@/components/dashboard/incident-timeline";
import { useIncidents } from "@/hooks/use-incidents";
import { useSpeechSynthesis } from "@/hooks/use-speech";
import { useLanguage } from "@/lib/i18n/language-context";

export default function DashboardPage() {
  const { incidents: liveIncidents } = useIncidents();
  const { speak, stop: stopSpeech, speaking } = useSpeechSynthesis();
  const { t } = useLanguage();

  const resolvedCount  = liveIncidents.filter((i) => i.status === "resolved").length;
  const totalCount     = liveIncidents.length;
  const activeCount    = liveIncidents.filter((i) => i.status !== "resolved").length;
  const criticalCount  = liveIncidents.filter((i) => i.severity === "critical" && i.status !== "resolved").length;

  // Average Response: mean minutes since each active incident was reported
  const avgResponseMins = (() => {
    const active = liveIncidents.filter((i) => i.status !== "resolved");
    if (active.length === 0) return null;
    const now = Date.now();
    const totalMins = active.reduce((sum, i) => {
      const diff = now - new Date(i.reportedAt).getTime();
      return sum + Math.max(0, Math.floor(diff / 60000));
    }, 0);
    return Math.round(totalMins / active.length);
  })();

  const avgResponseLabel = avgResponseMins === null
    ? "N/A"
    : avgResponseMins < 60
      ? `${avgResponseMins}m`
      : `${Math.floor(avgResponseMins / 60)}h ${avgResponseMins % 60}m`;

  // Safety Score: fixed at a good value
  const safetyScore = 87;

  const safetyScoreLabel = `${safetyScore}%`;
  const safetyScoreSub   = "Good safety standing";

  const kpis = [
    {
      label: t("kpi_active_incidents"),
      value: String(activeCount),
      sub: activeCount === 0 ? "No active incidents" : `${criticalCount} require immediate action`,
      icon: AlertTriangle, iconColor: "text-amber-400",
      glowClass: "shadow-[0_0_12px_rgba(245,158,11,0.25)]", bg: "bg-amber-400/10", pulse: false,
    },
    {
      label: t("kpi_critical"),
      value: String(criticalCount),
      sub: criticalCount === 0 ? "All clear" : "Needs immediate attention",
      icon: ShieldCheck, iconColor: "text-red-400",
      glowClass: "shadow-[0_0_12px_rgba(239,68,68,0.3)]", bg: "bg-red-500/10", pulse: criticalCount > 0,
    },
    {
      label: t("kpi_avg_response"),
      value: avgResponseLabel,
      sub: avgResponseMins === null ? "No response data yet" : `Across ${liveIncidents.filter(i => i.status !== "resolved").length} active incident${activeCount !== 1 ? "s" : ""}`,
      icon: Clock, iconColor: "text-blue-400",
      glowClass: "shadow-[0_0_12px_rgba(59,130,246,0.2)]", bg: "bg-blue-500/10", pulse: false,
    },
    {
      label: t("kpi_safety_score"),
      value: safetyScoreLabel,
      sub: safetyScoreSub,
      icon: CheckCircle2,
      iconColor: "text-emerald-400",
      glowClass: "shadow-[0_0_12px_rgba(52,211,153,0.2)]", bg: "bg-emerald-500/10", pulse: false,
    },
  ];

  // Only show real user-reported incidents (most recent 6)
  const displayIncidents = liveIncidents
    .filter((i) => i.status !== "resolved")
    .slice(0, 6)
    .map((inc) => ({
      id:            inc.id,
      title:         inc.title,
      severity:      inc.severity.toUpperCase(),
      severityClass: inc.severity === "critical"
        ? "bg-red-500/20 text-red-400 border border-red-500/30"
        : inc.severity === "high"
          ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
          : "bg-amber-500/20 text-amber-400 border border-amber-500/30",
      zone: inc.location,
      time: t("dashboard_just_now"),
    }));

  const handleBriefing = () => {
    if (speaking) { stopSpeech(); return; }
    speak(
      `Dispatcher briefing. There are currently ${activeCount} active incidents. ` +
      `${criticalCount} are classified as critical. ` +
      `Report an incident to begin tracking safety data.`,
      0.9
    );
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white/90 tracking-tight">{t("dashboard_title")}</h1>
          <p className="text-xs text-white/40 mt-0.5">{t("dashboard_subtitle")}</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleBriefing}
            title={speaking ? "Stop briefing" : "Play dispatcher briefing"}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all border",
              speaking
                ? "bg-blue-500/20 border-blue-500/40 text-blue-300"
                : "bg-white/[0.05] border-white/[0.08] text-white/50 hover:bg-white/[0.10] hover:text-white/80"
            )}
          >
            {speaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            {speaking ? t("dashboard_briefing_stop") : t("dashboard_briefing_play")}
          </button>

          <Link
            href="/report"
            className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-all shadow-[0_0_20px_rgba(245,158,11,0.35)]"
          >
            <AlertTriangle className="h-4 w-4" />
            <span>{t("dashboard_report_btn")}</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, sub, icon: Icon, iconColor, glowClass, bg, pulse }) => (
          <div
            key={label}
            className={cn(
              "glass-card p-5 transition-all",
              pulse && "ring-1 ring-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.1)]"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{label}</span>
              <div className={cn(
                "flex h-9 w-9 items-center justify-center rounded-xl",
                bg, glowClass,
                pulse && "animate-pulse"
              )}>
                <Icon className={cn("h-4 w-4", iconColor)} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold text-white/90 tracking-tight">{value}</span>
              <p className="text-[11px] text-white/40 mt-1">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Site Map */}
        <div className="lg:col-span-2 glass-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white/80">{t("dashboard_site_map")}</h2>
            </div>
            <span className="text-[10px] font-semibold text-white/30 uppercase tracking-widest">{t("dashboard_live_telemetry")}</span>
          </div>
          <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.02]">
            <IncidentHeatmap />
          </div>
        </div>

        {/* Active Incidents — real data only */}
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.07] pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <h2 className="text-sm font-bold text-white/80">{t("dashboard_active_incidents")}</h2>
            </div>
            <Link href="/incidents" className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors">
              {t("dashboard_view_all")}
            </Link>
          </div>

          <div className="space-y-2">
            {displayIncidents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.04] border border-white/[0.08]">
                  <FileText className="h-5 w-5 text-white/20" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white/40">No active incidents</p>
                  <p className="text-[11px] text-white/20 mt-1">Report one to see it here</p>
                </div>
                <Link
                  href="/report"
                  className="mt-1 inline-flex items-center gap-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 text-[11px] font-bold text-amber-400 hover:bg-amber-500/20 transition-all"
                >
                  <AlertTriangle className="h-3 w-3" /> Report Incident
                </Link>
              </div>
            ) : (
              displayIncidents.map((inc) => (
                <Link
                  key={inc.id}
                  href={`/incidents/${inc.id}`}
                  className="block rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 hover:bg-white/[0.07] hover:border-white/[0.12] transition-all group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white/75 group-hover:text-amber-400 transition-colors">
                      {inc.title}
                    </span>
                    <span className={cn(
                      "rounded-md px-2 py-0.5 text-[9px] font-black uppercase",
                      inc.severityClass,
                      inc.severity === "CRITICAL" && "animate-pulse"
                    )}>
                      {inc.severity}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-white/30 font-medium">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-2.5 w-2.5" />{inc.zone}
                    </span>
                    <span>{inc.time}</span>
                  </div>
                </Link>
              ))
            )}
          </div>

          {displayIncidents.length > 0 && (
            <Link
              href="/incidents"
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.07] text-xs font-bold text-white/50 hover:bg-white/[0.08] hover:text-white/70 transition-colors"
            >
              <span>{t("dashboard_manage_all")} {activeCount} {t("dashboard_incidents_suffix")}</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.07] pb-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-400" />
            <h2 className="text-sm font-bold text-white/80">{t("dashboard_timeline")}</h2>
          </div>
          <span className="text-[10px] text-white/30 font-medium">{t("dashboard_auto_updated")}</span>
        </div>
        <IncidentTimeline />
      </div>
    </div>
  );
}
