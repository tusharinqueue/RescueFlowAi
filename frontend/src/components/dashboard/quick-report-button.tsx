"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight, Phone, Shield, Zap } from "lucide-react";

export function QuickReportButton() {
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-400/8 via-orange-400/5 to-transparent">
      {/* Grid pattern */}
      <div className="pointer-events-none absolute inset-0 grid-pattern opacity-20" aria-hidden="true" />

      {/* Pulsing glow behind button */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-400/10 blur-2xl" aria-hidden="true" />

      <div className="relative flex flex-1 flex-col items-center justify-center p-6 text-center">
        {/* Pulse rings */}
        <div className="relative mb-5">
          <span className="absolute inset-0 rounded-full bg-amber-400/15 animate-ping-slow" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-amber-400 shadow-lg shadow-amber-400/30">
            <AlertTriangle className="h-7 w-7 text-background" aria-hidden="true" />
          </div>
        </div>

        <h2 className="mb-1 text-base font-black text-foreground">Quick Report</h2>
        <p className="mb-5 text-xs text-muted-foreground leading-relaxed">
          Report a workplace incident immediately. AI will analyze and dispatch response teams.
        </p>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full"
        >
          <Link
            href="/report"
            id="quick-report-btn"
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-3 text-sm font-bold text-background shadow-lg shadow-amber-400/20 transition-all hover:bg-amber-300 hover:shadow-xl hover:shadow-amber-400/30"
          >
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            Report Incident Now
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </motion.div>

        {/* Emergency contacts */}
        <div className="mt-5 w-full space-y-2 border-t border-white/[0.06] pt-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            Emergency Contacts
          </p>
          {[
            { label: "Safety Hotline",  number: "1800-XXX-SAFE", icon: Shield },
            { label: "Emergency Medic", number: "+91-XXX-XXXX",  icon: Phone  },
            { label: "Control Room",    number: "Ext. 100",       icon: Zap   },
          ].map(({ label, number, icon: Icon }) => (
            <div key={label} className="flex items-center gap-2 rounded-lg bg-secondary/30 px-2.5 py-1.5">
              <Icon className="h-3 w-3 shrink-0 text-amber-400" aria-hidden="true" />
              <span className="flex-1 text-[10px] text-muted-foreground">{label}</span>
              <span className="font-mono-id text-[10px] font-semibold text-foreground">{number}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
