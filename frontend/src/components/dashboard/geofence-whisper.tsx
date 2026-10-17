"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Shield, MapPin, Eye, EyeOff, Bell, BellOff,
  AlertTriangle, Navigation2, X, ChevronRight, Clock, ShieldAlert, ShieldOff
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDangerZoneAlerts } from "@/hooks/use-danger-zone-alerts";

// ── Danger zone definitions (Noida NCR) ────────────────────────────────────
const DANGER_ZONES = [
  {
    id: "z1",
    name: "Sector 63 Industrial Belt",
    lat: 28.6200, lng: 77.3680,
    radiusM: 400,
    level: "red" as const,
    reason: "High incident density · Poor lighting after 20:00",
  },
  {
    id: "z2",
    name: "Expressway Service Road",
    lat: 28.5800, lng: 77.3200,
    radiusM: 300,
    level: "purple" as const,
    reason: "Low visibility zone · Sparse CCTV coverage",
  },
  {
    id: "z3",
    name: "Sector 62 Underpass",
    lat: 28.6080, lng: 77.3640,
    radiusM: 200,
    level: "purple" as const,
    reason: "Women safety concern · Unlit passage after 21:00",
  },
  {
    id: "z4",
    name: "Sector 16B Unlit Service Corridor",
    lat: 28.5710, lng: 77.3080,
    radiusM: 250,
    level: "purple" as const,
    reason: "3 reports of broken streetlights & no CCTV coverage",
  },
  {
    id: "z5",
    name: "Yamuna Embankment Marginal Bund",
    lat: 28.5730, lng: 77.3010,
    radiusM: 350,
    level: "red" as const,
    reason: "Isolated unpaved riverbank path with zero emergency lighting",
  },
];

// Haversine distance in metres
function haversineM(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371000;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

type DangerLevel = "red" | "purple";

const LEVEL_STYLE: Record<DangerLevel, { border: string; bg: string; dot: string; label: string; labelClass: string }> = {
  red: { border: "border-red-500/35", bg: "bg-red-950/50", dot: "bg-red-500 shadow-[0_0_8px_rgba(220,38,38,0.8)]", label: "RED ZONE", labelClass: "text-red-400 bg-red-500/15 border-red-500/30" },
  purple: { border: "border-purple-500/35", bg: "bg-purple-950/50", dot: "bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]", label: "CAUTION ZONE", labelClass: "text-purple-400 bg-purple-500/15 border-purple-500/30" },
};

interface GeofenceWhisperProps {
  /** Force show for demo purposes */
  forceShow?: boolean;
}

export function GeofenceWhisper({ forceShow = false }: GeofenceWhisperProps) {
  const { alertsEnabled, toggleAlerts } = useDangerZoneAlerts();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [companionOn, setCompanionOn] = useState(false);
  const [standbyOn, setStandbyOn] = useState(false);
  const [triggeredZone, setTriggeredZone] = useState<typeof DANGER_ZONES[0] | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({ lat: 28.5740, lng: 77.3112 });
  const [locationStatus, setLocationStatus] = useState<"idle" | "watching" | "denied">("watching");
  const [currentHour, setCurrentHour] = useState(new Date().getHours());
  const watchIdRef = useRef<number | null>(null);

  // Update hour every minute (for 9pm check)
  useEffect(() => {
    const id = setInterval(() => setCurrentHour(new Date().getHours()), 60000);
    return () => clearInterval(id);
  }, []);

  const isNightTime = currentHour >= 21 || currentHour < 6;

  const checkZones = useCallback((lat: number, lng: number) => {
    if (!alertsEnabled) return;
    for (const zone of DANGER_ZONES) {
      const dist = haversineM(lat, lng, zone.lat, zone.lng);
      if (dist <= zone.radiusM) {
        setTriggeredZone(zone);
        setVisible(true);
        return;
      }
    }
  }, [alertsEnabled]);

  const startWatching = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationStatus("denied");
      return;
    }
    setLocationStatus("watching");
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        checkZones(latitude, longitude);
      },
      () => setLocationStatus("denied"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [checkZones]);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation?.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Demo: simulate entering a zone
  const simulateEnter = () => {
    const zone = DANGER_ZONES[1]!; // Expressway Service Road
    setTriggeredZone(zone);
    setDismissed(false);
    setVisible(true);
  };

  const dismiss = () => {
    setVisible(false);
    setDismissed(true);
  };

  const zone = triggeredZone || DANGER_ZONES[1]!;
  const style = LEVEL_STYLE[zone.level];

  return (
    <section className="glass-card p-5 space-y-4" aria-label="Proactive geofence companion">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/12 border border-purple-500/25 shadow-[0_0_16px_rgba(168,85,247,0.18)]">
            <Navigation2 className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white/88">Proactive Geofence Whisper</h2>
            <p className="text-[11px] text-white/38 mt-0.5">Web Push · Haversine proximity · Night-mode aware</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border", isNightTime ? "text-purple-400 bg-purple-500/12 border-purple-500/25" : "text-white/30 bg-white/[0.04] border-white/[0.07]")}>
            {isNightTime ? "🌙 Night Mode" : "☀️ Day Mode"}
          </span>
        </div>
      </div>

      {/* Zone list */}
      <div className="space-y-2">
        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/28 px-0.5">Monitored zones — Noida NCR</p>
        {DANGER_ZONES.map((z) => {
          const s = LEVEL_STYLE[z.level];
          return (
            <div key={z.id} className={cn("flex items-center gap-3 rounded-xl border px-3.5 py-2.5", s.border, "bg-white/[0.025]")}>
              <span className={cn("h-2 w-2 shrink-0 rounded-full", s.dot)} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white/75 truncate">{z.name}</p>
                <p className="text-[10px] text-white/35 truncate">{z.reason}</p>
              </div>
              <span className="shrink-0 text-[8px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded border" style={{}} aria-label={s.label}>
                <span className={cn("", s.labelClass.split(" ").join(" "))}>{s.label.split(" ")[0]}</span>
              </span>
              <span className="text-[10px] text-white/28 font-mono shrink-0">{z.radiusM} m</span>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2.5">
        <button
          onClick={locationStatus === "watching" ? undefined : startWatching}
          disabled={locationStatus === "watching"}
          className={cn(
            "btn-press flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold border transition-all duration-200",
            locationStatus === "watching"
              ? "bg-green-500/15 border-green-500/30 text-green-400 cursor-default"
              : "bg-white/[0.04] border-white/[0.08] text-white/50 hover:bg-white/[0.08] hover:text-white/75"
          )}
        >
          {locationStatus === "watching" ? (
            <><MapPin className="h-3.5 w-3.5 animate-pulse" /> Watching GPS</>
          ) : (
            <><MapPin className="h-3.5 w-3.5" /> Start GPS Watch</>
          )}
        </button>

        <button
          onClick={simulateEnter}
          className="btn-press flex items-center gap-2 rounded-xl bg-purple-500/15 border border-purple-500/30 px-3.5 py-2 text-xs font-bold text-purple-300 hover:bg-purple-500/25 transition-all duration-200"
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          Simulate Zone Entry
        </button>

        {/* Alerts status badge */}
        <button
          onClick={toggleAlerts}
          title="Click to toggle danger zone alert listening state"
          className={cn(
            "btn-press flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-mono font-bold border transition-all duration-200",
            alertsEnabled
              ? "bg-purple-500/20 border-purple-500/40 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.25)]"
              : "bg-white/[0.04] border-white/[0.08] text-white/40 hover:text-white/70"
          )}
        >
          {alertsEnabled ? <ShieldAlert className="h-3.5 w-3.5 text-purple-400 animate-pulse" /> : <ShieldOff className="h-3.5 w-3.5" />}
          <span>Alerts: {alertsEnabled ? "ACTIVE (ON)" : "MUTED (OFF)"}</span>
        </button>

        {userLocation && (
          <span className="text-[10px] text-cyan-300 font-mono flex items-center gap-1 bg-cyan-500/10 border border-cyan-500/25 px-2 py-1 rounded-lg">
            <MapPin className="h-3 w-3 text-cyan-400" />
            <span>Microsoft Sovereign Office, Noida ({userLocation.lat.toFixed(4)}°N, {userLocation.lng.toFixed(4)}°E)</span>
          </span>
        )}
      </div>

      {/* ── The Whisper Prompt itself ── */}
      {(visible || forceShow) && !dismissed && (
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl border p-5 animate-slide-up",
            style.border, style.bg
          )}
          role="dialog"
          aria-label="Geofence safety alert"
        >
          {/* Ambient background pulse */}
          <div className={cn(
            "absolute inset-0 opacity-10 rounded-2xl",
            zone.level === "red" ? "bg-red-500" : "bg-purple-500"
          )} aria-hidden="true" />

          <button
            onClick={dismiss}
            className="absolute top-3 right-3 h-6 w-6 flex items-center justify-center rounded-full bg-white/[0.08] text-white/40 hover:text-white/70 transition-colors"
            aria-label="Dismiss alert"
          >
            <X className="h-3.5 w-3.5" />
          </button>

          {/* Zone badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className={cn("animate-alert h-2 w-2 rounded-full shrink-0", style.dot)} />
            <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border", style.labelClass)}>
              {style.label}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-white/35">
              <Clock className="h-3 w-3" />
              {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>

          {/* Whisper text - exact user specification */}
          <p className="text-sm font-bold text-white/95 leading-snug mb-1">
            Entering a low-visibility zone.
          </p>
          <p className="text-[12px] text-white/60 leading-relaxed mb-4">
            Would you like to enable <span className="text-blue-300 font-semibold">Live Companion Tracking</span> or keep your <span className="text-amber-300 font-semibold">emergency trigger on standby</span>?
          </p>

          {/* Action cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Companion tracking */}
            <button
              onClick={() => setCompanionOn(c => !c)}
              className={cn(
                "btn-press flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all duration-200",
                companionOn
                  ? "bg-blue-500/15 border-blue-500/35 text-blue-300"
                  : "bg-white/[0.05] border-white/[0.09] text-white/55 hover:bg-white/[0.09] hover:text-white/80"
              )}
            >
              <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg mt-0.5 transition-colors", companionOn ? "glass-blue" : "bg-white/[0.05]")}>
                {companionOn ? <Eye className="h-4 w-4 text-blue-400" /> : <EyeOff className="h-4 w-4 text-white/35" />}
              </div>
              <div>
                <p className="text-xs font-bold leading-tight">Live Companion Tracking</p>
                <p className="text-[10px] text-white/40 mt-0.5 leading-tight">Share real-time location with your trusted contacts</p>
                {companionOn && (
                  <span className="inline-block mt-1.5 text-[9px] font-black text-green-400 bg-green-500/12 border border-green-500/25 rounded px-1.5 py-0.5 uppercase tracking-wide">
                    Active
                  </span>
                )}
              </div>
            </button>

            {/* Emergency standby */}
            <button
              onClick={() => setStandbyOn(s => !s)}
              className={cn(
                "btn-press flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all duration-200",
                standbyOn
                  ? "bg-amber-500/15 border-amber-500/35 text-amber-300"
                  : "bg-white/[0.05] border-white/[0.09] text-white/55 hover:bg-white/[0.09] hover:text-white/80"
              )}
            >
              <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg mt-0.5 transition-colors", standbyOn ? "glass-amber" : "bg-white/[0.05]")}>
                {standbyOn ? <Bell className="h-4 w-4 text-amber-400 animate-float" /> : <BellOff className="h-4 w-4 text-white/35" />}
              </div>
              <div>
                <p className="text-xs font-bold leading-tight">Emergency Trigger Standby</p>
                <p className="text-[10px] text-white/40 mt-0.5 leading-tight">One-tap SOS that auto-dispatches your location</p>
                {standbyOn && (
                  <span className="inline-block mt-1.5 text-[9px] font-black text-amber-400 bg-amber-500/12 border border-amber-500/25 rounded px-1.5 py-0.5 uppercase tracking-wide">
                    Standby armed
                  </span>
                )}
              </div>
            </button>
          </div>

          {/* Dismiss row */}
          <div className="mt-3 flex items-center justify-between">
            <button onClick={dismiss} className="text-[10px] text-white/28 hover:text-white/48 transition-colors">
              I'm aware, continue
            </button>
            <Link href="/report" className="flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 transition-colors">
              Open SOS <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}

      {dismissed && (
        <div className="flex items-center gap-2 rounded-xl bg-white/[0.03] border border-white/[0.07] px-4 py-2.5 text-xs text-white/35">
          <Shield className="h-3.5 w-3.5 text-white/25" />
          Alert dismissed — geofence monitoring still active
          <button onClick={() => setDismissed(false)} className="ml-auto text-amber-400/60 hover:text-amber-400 transition-colors font-bold text-[10px]">
            Re-show
          </button>
        </div>
      )}
    </section>
  );
}

// Need Link for the button inside
import Link from "next/link";
