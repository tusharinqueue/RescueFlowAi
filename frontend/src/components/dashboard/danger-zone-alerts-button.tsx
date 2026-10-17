"use client";

import React from "react";
import { ShieldAlert, ShieldOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDangerZoneAlerts } from "@/hooks/use-danger-zone-alerts";

interface DangerZoneAlertsButtonProps {
  variant?: "sidebar" | "header" | "compact";
  className?: string;
}

export function DangerZoneAlertsButton({
  variant = "sidebar",
  className,
}: DangerZoneAlertsButtonProps) {
  const { alertsEnabled, toggleAlerts, toastMessage } = useDangerZoneAlerts();

  if (variant === "header") {
    return (
      <div className="relative inline-flex flex-col">
        <button
          type="button"
          onClick={toggleAlerts}
          id="danger-zone-alert-header-btn"
          title={
            alertsEnabled
              ? "Danger Zone Alerts: ON. Click to mute alerts when entering danger zones."
              : "Danger Zone Alerts: OFF. Click to enable proactive geofence alerts."
          }
          className={cn(
            "btn-press flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium border transition-all duration-200",
            alertsEnabled
              ? "bg-amber-500/15 border-amber-400/40 text-amber-200 shadow-sm"
              : "bg-white/[0.04] border-white/[0.08] text-white/60 hover:bg-white/[0.08] hover:text-white",
            className
          )}
        >
          {alertsEnabled ? (
            <div className="relative flex items-center justify-center">
              <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
              <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
            </div>
          ) : (
            <ShieldOff className="h-3.5 w-3.5 text-white/40" />
          )}

          <span>Zone Alerts:</span>

          <span
            className={cn(
              "font-mono text-[10px] font-bold uppercase px-1.5 py-0.5 rounded",
              alertsEnabled
                ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                : "bg-white/[0.06] text-white/40 border border-white/[0.08]"
            )}
          >
            {alertsEnabled ? "ON" : "OFF"}
          </span>
        </button>

        {/* Temporary floating toast notification */}
        {toastMessage && (
          <div className="absolute top-full right-0 mt-1.5 z-50 whitespace-nowrap rounded-lg bg-slate-950/95 border border-white/15 px-2.5 py-1 text-[11px] font-mono text-amber-300 shadow-xl backdrop-blur-md">
            {toastMessage}
          </div>
        )}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="relative flex justify-center w-full">
        <button
          type="button"
          onClick={toggleAlerts}
          id="compact-sidebar-danger-zone-alert-btn"
          title={
            alertsEnabled
              ? "Danger Zone Alerts: ON. Proactive Geofence Whisper is ACTIVE."
              : "Danger Zone Alerts: OFF. Click to activate geofence alerts."
          }
          className={cn(
            "btn-press flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-200",
            alertsEnabled
              ? "bg-amber-500/15 border-amber-400/50 text-amber-300 shadow-sm"
              : "bg-white/[0.04] border-white/[0.08] text-white/50 hover:bg-white/[0.08] hover:text-white",
            className
          )}
        >
          {alertsEnabled ? (
            <div className="relative flex items-center justify-center">
              <ShieldAlert className="h-4 w-4 text-amber-400" />
              <span className="absolute -top-1 -right-1 h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
            </div>
          ) : (
            <ShieldOff className="h-4 w-4 text-white/40" />
          )}
        </button>

        {/* Temporary floating toast notification */}
        {toastMessage && (
          <div className="absolute left-full ml-3 top-0 z-50 whitespace-nowrap rounded-lg bg-slate-950/95 border border-white/15 px-2.5 py-1 text-[11px] font-mono text-amber-300 shadow-xl backdrop-blur-md">
            {toastMessage}
          </div>
        )}
      </div>
    );
  }

  // Sidebar variant (Full width, right below "Report Incident" CTA)
  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={toggleAlerts}
        id="sidebar-danger-zone-alert-btn"
        title={
          alertsEnabled
            ? "Danger Zone Alerts are currently ACTIVE. Click to turn OFF."
            : "Danger Zone Alerts are MUTED. Click to turn ON."
        }
        className={cn(
          "btn-press group flex items-center justify-between w-full rounded-xl px-3 py-2 text-xs font-medium border transition-all duration-200",
          alertsEnabled
            ? "bg-amber-500/10 border-amber-400/35 text-white shadow-sm hover:border-amber-400/50"
            : "bg-white/[0.03] border-white/[0.08] text-white/55 hover:bg-white/[0.06] hover:text-white/80",
          className
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors",
              alertsEnabled
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                : "bg-white/[0.04] text-white/40 border border-white/[0.06]"
            )}
          >
            {alertsEnabled ? (
              <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
            ) : (
              <ShieldOff className="h-3.5 w-3.5 text-white/40" />
            )}
          </div>
          <div className="text-left min-w-0">
            <p className="text-xs font-semibold leading-tight truncate text-white/90">
              Danger Zone Alerts
            </p>
            <p className="text-[10px] text-white/40 leading-tight truncate mt-0.5">
              {alertsEnabled ? "Geofence whisper active" : "Hazard alerts muted"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 pl-1">
          <span
            className={cn(
              "font-mono text-[10px] font-bold uppercase px-1.5 py-0.5 rounded tracking-wider",
              alertsEnabled
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                : "bg-white/[0.06] text-white/40 border border-white/[0.08]"
            )}
          >
            {alertsEnabled ? "ON" : "OFF"}
          </span>
        </div>
      </button>

      {/* Floating feedback notification */}
      {toastMessage && (
        <div className="absolute -bottom-8 inset-x-0 z-50 rounded-lg bg-slate-950/95 border border-white/15 p-1 text-[10px] font-mono text-amber-300 text-center shadow-2xl backdrop-blur-md">
          {alertsEnabled ? "🔔 Alerts ON: Geofence Whisper Active" : "🔕 Alerts OFF: Geofence Muted"}
        </div>
      )}
    </div>
  );
}
