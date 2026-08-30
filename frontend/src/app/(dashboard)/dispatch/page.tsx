"use client";

import React, { useState, useEffect } from "react";
import { Users, Radio, Play, CheckCircle2, PhoneCall, X } from "lucide-react";
import { cn } from "@/lib/utils";

const RESPONSE_TEAMS = [
  { id: "TEAM-1", name: "Fire Safety Unit", lead: "Captain R. Sharma", members: 6, status: "DISPATCHED", zone: "Welding Zone B", phone: "+91 98765 43210" },
  { id: "TEAM-2", name: "HazMat Control Team", lead: "Dr. A. Verma", members: 4, status: "DISPATCHED", zone: "Zone C Chemical Bay", phone: "+91 98765 43211" },
  { id: "TEAM-3", name: "First Aid & Medical Unit", lead: "Nurse K. Patel", members: 5, status: "STANDBY", zone: "Medical Station 1", phone: "+91 98765 43212" },
  { id: "TEAM-4", name: "Site Security & Patrol", lead: "Officer S. Kumar", members: 8, status: "ON PATROL", zone: "Perimeter Sector D", phone: "+91 98765 43213" },
];

export default function DispatchPage() {
  const [isDispatching, setIsDispatching] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepStatus, setStepStatus] = useState<"calling" | "connected" | "done">("done");

  // Handle the dispatch workflow simulation
  useEffect(() => {
    if (!isDispatching || currentStep >= RESPONSE_TEAMS.length) return;

    setStepStatus("calling");

    // Simulate ring time (2 seconds)
    const ringTimer = setTimeout(() => {
      setStepStatus("connected");

      // Simulate connection/instruction time (2 seconds) before moving to next team
      const nextTimer = setTimeout(() => {
        if (currentStep < RESPONSE_TEAMS.length - 1) {
          setCurrentStep(c => c + 1);
        } else {
          setStepStatus("done");
        }
      }, 2000);

      return () => clearTimeout(nextTimer);
    }, 2000);

    return () => clearTimeout(ringTimer);
  }, [isDispatching, currentStep]);

  const startWorkflow = () => {
    setCurrentStep(0);
    setStepStatus("calling");
    setIsDispatching(true);
  };

  const closeWorkflow = () => {
    setIsDispatching(false);
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white/90">Response Teams</h1>
          <p className="text-xs text-white/40">Live deployment, status tracking and radio dispatch for emergency units.</p>
        </div>
        <button
          onClick={startWorkflow}
          className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-all shadow-[0_0_20px_rgba(245,158,11,0.35)]"
        >
          <Play className="h-4 w-4 fill-current" />
          <span>Start Dispatch Workflow</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {RESPONSE_TEAMS.map((t) => (
          <div key={t.id} className="glass-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white/90">{t.name}</h3>
                  <p className="text-xs text-white/40">Lead: {t.lead}</p>
                </div>
              </div>

              <span className={`rounded-md px-2.5 py-0.5 text-[9px] font-black uppercase ${
                t.status === "DISPATCHED" ? "bg-red-500/20 text-red-400 border border-red-500/30 shadow-[0_0_8px_rgba(239,68,68,0.2)]" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              }`}>
                {t.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-white/70">
              <div className="bg-white/[0.04] border border-white/[0.08] p-2.5 rounded-xl">
                <span className="text-[10px] text-white/30 block uppercase">Assigned Zone</span>
                <span className="text-white/90">{t.zone}</span>
              </div>
              <div className="bg-white/[0.04] border border-white/[0.08] p-2.5 rounded-xl">
                <span className="text-[10px] text-white/30 block uppercase">Personnel</span>
                <span className="text-white/90">{t.members} Responders</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-mono font-bold text-white/40">{t.phone}</span>
              <button className="flex items-center gap-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-white/90 border border-white/[0.1] px-3 py-1.5 text-xs font-bold transition-colors">
                <Radio className="h-3.5 w-3.5 text-amber-400" />
                <span>Radio Connect</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Dispatch Workflow Overlay */}
      {isDispatching && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md p-6">
          <div className="w-full max-w-lg glass-card border-white/[0.08] overflow-hidden rounded-2xl">
            <div className="flex items-center justify-between bg-white/[0.02] px-6 py-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <Radio className="h-5 w-5 text-amber-500" />
                <h2 className="text-lg font-bold text-white/90">Automated Dispatch</h2>
              </div>
              <button onClick={closeWorkflow} className="text-white/40 hover:text-white/80 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[15px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/[0.1] before:to-transparent">
                {RESPONSE_TEAMS.map((team, idx) => {
                  const isPast = idx < currentStep;
                  const isCurrent = idx === currentStep;
                  const isFuture = idx > currentStep;
                  
                  return (
                    <div key={team.id} className="relative flex items-center gap-4">
                      <div className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 z-10",
                        isPast ? "bg-emerald-500 border-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.4)]" :
                        isCurrent ? "bg-amber-500/20 border-amber-500 text-amber-500 animate-pulse shadow-[0_0_12px_rgba(245,158,11,0.4)]" :
                        "bg-slate-900 border-white/[0.1] text-white/20"
                      )}>
                        {isPast ? <CheckCircle2 className="h-4 w-4" /> : <PhoneCall className="h-4 w-4" />}
                      </div>
                      <div className={cn(
                        "flex-1 rounded-xl border p-4 transition-all duration-300",
                        isPast ? "bg-white/[0.03] border-white/[0.08]" :
                        isCurrent ? "bg-amber-500/10 border-amber-500/30" :
                        "bg-transparent border-transparent opacity-30"
                      )}>
                        <h4 className={cn("text-sm font-bold", 
                          isPast ? "text-white/70" : 
                          isCurrent ? "text-amber-400" : 
                          "text-white/50"
                        )}>
                          {team.name}
                        </h4>
                        <p className="text-xs font-medium text-white/50 mt-1">
                          {isPast ? "Response confirmed. Team dispatched." : 
                           isCurrent ? (stepStatus === "calling" ? "Initiating radio contact..." : "Transmitting coordinates...") : 
                           "Awaiting contact..."}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {stepStatus === "done" && (
                <div className="mt-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="inline-flex items-center justify-center rounded-full bg-emerald-500/10 p-2 border border-emerald-500/20 mb-3">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                  </div>
                  <h3 className="text-sm font-bold text-emerald-500 mb-4">All teams successfully contacted.</h3>
                  <button onClick={closeWorkflow} className="rounded-xl bg-white/[0.08] hover:bg-white/[0.15] px-6 py-2.5 text-xs font-bold text-white transition-all w-full">
                    Close Dispatch Overlay
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
