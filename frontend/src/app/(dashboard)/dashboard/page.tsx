"use client";

import React from "react";
import Link from "next/link";
import {
  AlertTriangle, ShieldCheck, Clock, CheckCircle2, MapPin,
  Activity, ChevronRight, Volume2, VolumeX, FileText,
  TrendingUp, Zap, Radio
} from "lucide-react";
import { cn } from "@/lib/utils";
import { IncidentHeatmap } from "@/components/dashboard/incident-heatmap";
import { IncidentTimeline } from "@/components/dashboard/incident-timeline";
import { useIncidents } from "@/hooks/use-incidents";
import { useSpeechSynthesis } from "@/hooks/use-speech";
import { useLanguage } from "@/lib/i18n/language-context";
import { DangerZoneAlertsButton } from "@/components/dashboard/danger-zone-alerts-button";

// Severity → normalized badge classes
function severityClasses(sev: string) {
  switch (sev.toLowerCase()) {
    case "critical": return "bg-red-500/15 text-red-300 border border-red-500/30";
    case "high": return "bg-amber-500/15 text-amber-300 border border-amber-500/30";
    case "moderate": return "bg-sky-500/15 text-sky-300 border border-sky-500/30";
    default: return "bg-slate-500/15 text-slate-300 border border-slate-500/30";
  }
}

// Severity → dot class
function severityDot(sev: string) {
  switch (sev.toLowerCase()) {
    case "critical": return "status-dot-critical";
    case "high": return "status-dot-high";
    case "moderate": return "status-dot-moderate";
    default: return "status-dot-low";
  }
}

export default function DashboardPage() {
  const { incidents: liveIncidents } = useIncidents();
  const { speak, stop: stopSpeech, speaking } = useSpeechSynthesis();
  const { t } = useLanguage();

  const resolvedCount = liveIncidents.filter(i => i.status === "resolved").length;
  const totalCount = liveIncidents.length;
  const activeCount = liveIncidents.filter(i => i.status !== "resolved").length;
  const criticalCount = liveIncidents.filter(i => i.severity === "critical" && i.status !== "resolved").length;

  // Average response time
  const avgResponseMins = (() => {
    const active = liveIncidents.filter(i => i.status !== "resolved");
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

  const safetyScore = 87;

  const kpis = [
    {
      id: "active",
      label: t("kpi_active_incidents"),
      value: String(activeCount),
      sub: activeCount === 0 ? "No active incidents" : `${criticalCount} critical`,
      icon: AlertTriangle,
      iconColor: "text-amber-400",
      pulse: false,
      trend: null,
    },
    {
      id: "critical",
      label: t("kpi_critical"),
      value: String(criticalCount),
      sub: criticalCount === 0 ? "All clear ✓" : "Immediate attention needed",
      icon: ShieldCheck,
      iconColor: criticalCount > 0 ? "text-red-400" : "text-white/60",
      pulse: criticalCount > 0,
      trend: null,
    },
    {
      id: "response",
      label: t("kpi_avg_response"),
      value: avgResponseLabel,
      sub: avgResponseMins === null ? "No data yet" : `${activeCount} active incident${activeCount !== 1 ? "s" : ""}`,
      icon: Clock,
      iconColor: "text-sky-400",
      pulse: false,
      trend: null,
    },
    {
      id: "safety",
      label: t("kpi_safety_score"),
      value: `${safetyScore}%`,
      sub: "Good standing",
      icon: CheckCircle2,
      iconColor: "text-emerald-400",
      pulse: false,
      trend: "+2.4%",
    },
  ];

  const displayIncidents = liveIncidents
    .filter(i => i.status !== "resolved")
    .slice(0, 6)
    .map(inc => ({
      id: inc.id,
      title: inc.title,
      severity: inc.severity,
      zone: inc.location,
      time: t("dashboard_just_now"),
    }));

  const handleBriefing = () => {
    if (speaking) { stopSpeech(); return; }
    speak(
      `Dispatcher briefing. There are currently ${activeCount} active incidents. ` +
      `${criticalCount} are classified as critical. Safety score is at ${safetyScore} percent.`,
      0.9
    );
  };

  return (
    <div className="space-y-6 pb-10">

      {/* ── Alert Banner (critical incidents) ── */}
      {criticalCount > 0 && (
        <div className="relative rounded-xl overflow-hidden border border-red-500/28 bg-red-950/28 px-5 py-3.5 flex items-center gap-4 animate-slide-up">
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl glass-red">
            <AlertTriangle className="h-4.5 w-4.5 text-red-400" />
            <span className="absolute inset-0 rounded-xl ring-1 ring-red-500/30 animate-ping opacity-35" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-red-300">{criticalCount} Critical Incident{criticalCount !== 1 ? "s" : ""} Active</p>
            <p className="text-xs text-red-400/55 mt-0.5">Immediate response required</p>
          </div>
          <Link
            href="/incidents"
            className="btn-press shrink-0 flex items-center gap-1.5 rounded-xl bg-red-500 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-red-400 transition-colors duration-200"
          >
            Respond <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-hero-slow">
        <div>
          {/* h1 gets the signature blur+rise; no kicker label above it */}
          <h1 className="text-[22px] font-bold text-white/92 tracking-tight">{t("dashboard_title")}</h1>
          <p className="text-xs text-white/35 mt-1 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.7)]" />
            {t("dashboard_subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleBriefing}
            title={speaking ? "Stop briefing" : "Play dispatcher briefing"}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all duration-200 border",
              speaking
                ? "bg-blue-500/18 border-blue-500/35 text-blue-300"
                : "bg-white/[0.04] border-white/[0.07] text-white/45 hover:bg-white/[0.08] hover:text-white/75 hover:border-white/[0.12]"
            )}
          >
            {speaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            {speaking ? t("dashboard_briefing_stop") : t("dashboard_briefing_play")}
          </button>

          <Link
            href="/report"
            id="dashboard-report-btn"
            className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-all duration-200 shadow-[0_0_20px_rgba(245,158,11,0.32)]"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>{t("dashboard_report_btn")}</span>
          </Link>

          {/* ── Danger Zone Alerts On/Off Button ── */}
          <DangerZoneAlertsButton variant="header" />
        </div>
      </div>

      {/* ── KPI Cards (Normalized 4-col grid) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ id, label, value, sub, icon: Icon, iconColor, pulse, trend }, i) => (
          <div
            key={id}
            className={cn(
              "rounded-xl border border-white/[0.08] bg-slate-900/50 p-4 transition-all duration-150 hover:border-white/15",
              pulse && "border-red-500/30 bg-red-950/20"
            )}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-white/50">{label}</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.08]">
                <Icon className={cn("h-4 w-4", iconColor)} />
              </div>
            </div>

            <div>
              <span className="text-3xl font-bold font-mono tracking-tight text-white">{value}</span>
              <div className="flex items-center justify-between mt-1 text-xs text-white/40">
                <span className="truncate">{sub}</span>
                {trend && (
                  <span className="flex items-center gap-0.5 text-xs font-mono font-medium text-emerald-400 shrink-0">
                    <TrendingUp className="h-3 w-3" />
                    {trend}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main Grid: Map + Incidents ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Site Map */}
        <div className="lg:col-span-2 glass-card p-5 space-y-4 animate-fade-in delay-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <MapPin className="h-4 w-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white/82">{t("dashboard_site_map")}</h2>
              <span className="flex items-center gap-1 rounded-full bg-green-500/12 border border-green-500/22 px-2 py-0.5 text-[9px] font-bold text-green-400">
                <span className="h-1 w-1 rounded-full bg-green-500 animate-pulse" />
                LIVE
              </span>
            </div>
            <span className="text-[9px] font-bold text-white/28 uppercase tracking-widest">{t("dashboard_live_telemetry")}</span>
          </div>
          <div className="overflow-hidden rounded-xl border border-white/[0.065] bg-black/20 scan-line">
            <IncidentHeatmap />
          </div>
        </div>

        {/* Active Incidents panel */}
        <div className="glass-card p-5 space-y-4 animate-fade-in delay-300">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                <AlertTriangle className={cn("h-4 w-4", activeCount > 0 ? "text-amber-400" : "text-white/40")} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white/90">{t("dashboard_active_incidents")}</h2>
                <p className="text-xs text-white/40">{activeCount} active</p>
              </div>
            </div>
            <Link
              href="/incidents"
              className="text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1"
            >
              {t("dashboard_view_all")}
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-2">
            {displayIncidents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.03] border border-white/[0.08]">
                  <Zap className="h-5 w-5 text-white/20" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white/50">All clear</p>
                  <p className="text-xs text-white/30 mt-0.5">No active incidents reported</p>
                </div>
                <Link
                  href="/report"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/25 transition-all duration-150"
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Report Incident
                </Link>
              </div>
            ) : (
              displayIncidents.map((inc, idx) => (
                <Link
                  key={inc.id}
                  href={`/incidents/${inc.id}`}
                  className="group flex items-start gap-3 rounded-lg bg-white/[0.02] border border-white/[0.06] p-3 hover:bg-white/[0.05] hover:border-white/10 transition-all duration-150"
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                  {/* Severity indicator */}
                  <span className={cn("status-dot mt-1.5 shrink-0", severityDot(inc.severity))} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-semibold text-white/85 group-hover:text-amber-400 transition-colors duration-150 leading-tight truncate">
                        {inc.title}
                      </span>
                      <span className={cn(
                        "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider",
                        severityClasses(inc.severity)
                      )}>
                        {inc.severity}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-white/40">
                      <span className="flex items-center gap-1 min-w-0">
                        <MapPin className="h-3 w-3 shrink-0 text-white/30" />
                        <span className="truncate">{inc.zone}</span>
                      </span>
                      <span className="font-mono shrink-0 ml-2">{inc.time}</span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          {displayIncidents.length > 0 && (
            <Link
              href="/incidents"
              className="flex items-center justify-center gap-1.5 h-8 rounded-lg bg-white/[0.03] border border-white/[0.08] text-xs font-medium text-white/60 hover:text-white hover:bg-white/[0.06] transition-all duration-150"
            >
              {t("dashboard_manage_all")} ({activeCount})
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* ── Activity Timeline ── */}
      <div className="glass-card p-5 space-y-4 animate-fade-in delay-400">
        <div className="flex items-center justify-between border-b border-white/[0.065] pb-3.5">
          <div className="flex items-center gap-2.5">
            <Activity className="h-4 w-4 text-blue-400" />
            <h2 className="text-sm font-bold text-white/82">{t("dashboard_timeline")}</h2>
          </div>
          <span className="flex items-center gap-1.5 text-[10px] text-white/30 font-medium">
            <Radio className="h-3 w-3 text-green-400/60" />
            {t("dashboard_auto_updated")}
          </span>
        </div>
        <IncidentTimeline />
      </div>
    </div>
  );
}
