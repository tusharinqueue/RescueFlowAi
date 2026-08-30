"use client";

import { useState } from "react";
import { Bell, Shield, Key, Database } from "lucide-react";

export default function SettingsPage() {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts]     = useState(true);

  return (
    <div className="space-y-6 pb-10 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-white/90">System Settings</h1>
        <p className="text-xs text-white/40">Configure notifications, security protocols and integration endpoints.</p>
      </div>

      {/* Notifications Section */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3">
          <Bell className="h-4 w-4 text-amber-500" />
          <h2 className="text-sm font-extrabold text-white/90">Notification Alerts</h2>
        </div>

        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between py-2 border-b border-white/[0.08]">
            <div>
              <p className="font-bold text-white/90">Critical Incident SMS Dispatch</p>
              <p className="text-white/40">Send high-priority SMS alerts to safety response leaders immediately.</p>
            </div>
            <input
              type="checkbox"
              checked={smsAlerts}
              onChange={(e) => setSmsAlerts(e.target.checked)}
              className="h-4 w-4 rounded border-white/[0.2] text-amber-500 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-bold text-white/90">Daily OSHA Compliance Summary</p>
              <p className="text-white/40">Receive an email digest of recorded workplace incidents every evening.</p>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="h-4 w-4 rounded border-white/[0.2] text-amber-500 focus:ring-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Integrations Section */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3">
          <Database className="h-4 w-4 text-blue-600" />
          <h2 className="text-sm font-extrabold text-white/90">AI &amp; System Integrations</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="rounded-xl bg-white/[0.04] border border-white/[0.08] p-3 flex items-center justify-between hover:bg-white/[0.06] transition-colors">
            <span className="font-bold text-white/90">Google Gemini AI Engine</span>
            <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[9px] font-black uppercase text-emerald-400 border border-emerald-500/30 shadow-[0_0_8px_rgba(52,211,153,0.15)]">Connected</span>
          </div>

          <div className="rounded-xl bg-white/[0.04] border border-white/[0.08] p-3 flex items-center justify-between hover:bg-white/[0.06] transition-colors">
            <span className="font-bold text-white/90">IndexedDB</span>
            <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[9px] font-black uppercase text-emerald-400 border border-emerald-500/30 shadow-[0_0_8px_rgba(52,211,153,0.15)]">Connected</span>
          </div>
        </div>
      </div>

    </div>
  );
}
