/**
 * use-danger-zone-alerts.ts
 * Shared hook to manage Proactive Geofence Danger Zone Alerts (ON/OFF)
 * across the application, with localStorage persistence, audio chime,
 * and synchronized state between the Sidebar, Dashboard, and Geofence Whisper.
 */
"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "rescueflow_danger_zone_alerts_enabled";
const EVENT_KEY = "rescueflow:danger_zone_alerts_changed";

// Audio chime using Web Audio API (safe, zero external asset dependencies)
function playDangerAlertChime(isOn: boolean) {
  if (typeof window === "undefined") return;
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    if (isOn) {
      // Pleasant rising confirmation tone (440Hz -> 880Hz)
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    } else {
      // Soft downward muted tone (660Hz -> 330Hz)
      osc.frequency.setValueAtTime(660, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(330, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch {
    // Graceful fallback if Web Audio is restricted
  }
}

export function useDangerZoneAlerts() {
  const [alertsEnabled, setAlertsEnabledState] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load initial setting from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        setAlertsEnabledState(stored === "true");
      }
    } catch {
      // fallback true
    }

    // Listen to sync changes across components
    const handleSync = (e: Event) => {
      const detail = (e as CustomEvent<boolean>).detail;
      if (typeof detail === "boolean") {
        setAlertsEnabledState(detail);
      }
    };

    window.addEventListener(EVENT_KEY, handleSync);
    return () => window.removeEventListener(EVENT_KEY, handleSync);
  }, []);

  const setAlertsEnabled = useCallback((enabled: boolean) => {
    setAlertsEnabledState(enabled);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, String(enabled));
        window.dispatchEvent(new CustomEvent(EVENT_KEY, { detail: enabled }));
        playDangerAlertChime(enabled);
      } catch {
        // ignore
      }
    }

    const msg = enabled
      ? "Danger Zone Alerts Enabled: Proactive geofence whisper active on hazard entry"
      : "Danger Zone Alerts Muted: Geofence notifications paused";
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  const toggleAlerts = useCallback(() => {
    setAlertsEnabled(!alertsEnabled);
  }, [alertsEnabled, setAlertsEnabled]);

  return {
    alertsEnabled,
    setAlertsEnabled,
    toggleAlerts,
    toastMessage,
    clearToast: () => setToastMessage(null),
  };
}
