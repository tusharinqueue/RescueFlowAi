"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle, Camera, Video, Mic, FileText, MapPin, Clock,
  Building2, ArrowRight, CheckCircle2, X, Sparkles, Shield,
  Check, RefreshCw, Cpu
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface QuickReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ReportMethod = "image" | "video" | "voice" | "type" | null;

export function QuickReportModal({ isOpen, onClose }: QuickReportModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [method, setMethod] = useState<ReportMethod>(null);
  
  const [gpsLocation, setGpsLocation] = useState("Welding Zone B");
  const [siteName] = useState("Manufacturing Plant 01");
  const [department, setDepartment] = useState("Welding");
  const [timestamp, setTimestamp] = useState("");
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      setTimestamp(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } else {
      setTimeout(() => {
        setStep(1);
        setMethod(null);
        setIsAnalyzing(false);
        setIsSubmitted(false);
      }, 300);
    }
  }, [isOpen]);

  const handleSelectMethod = (m: ReportMethod) => {
    setMethod(m);
    setStep(2);
  };

  const handleAnalyzeAndSubmit = () => {
    setStep(3);
    setIsAnalyzing(true);

    setTimeout(() => {
      setIsAnalyzing(false);
      setIsSubmitted(true);
    }, 1800);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl my-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-bold">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-50">Report an Incident</h2>
                <p className="text-xs text-slate-500">Fast reporting • Step {step} of 3</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-6">
            {/* Step 1 */}
            {step === 1 && (
              <div className="space-y-4">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Choose input method:</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "image", label: "Upload Photo", emoji: "📷" },
                    { id: "video", label: "Upload Video", emoji: "🎥" },
                    { id: "voice", label: "Record Voice", emoji: "🎤" },
                    { id: "type",  label: "Describe Incident", emoji: "✏️" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelectMethod(item.id as ReportMethod)}
                      className="flex flex-col items-center justify-center p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 hover:bg-amber-50/40 hover:border-amber-400 transition-all text-center min-h-[120px]"
                    >
                      <span className="text-3xl mb-2">{item.emoji}</span>
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-50">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-4 space-y-3 text-xs">
                  <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                    <span className="text-slate-500 font-medium">Location</span>
                    <span className="font-bold text-slate-900 dark:text-slate-50">📍 {gpsLocation}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                    <span className="text-slate-500 font-medium">Site</span>
                    <span className="font-bold text-slate-900 dark:text-slate-50">🏭 {siteName}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                    <span className="text-slate-500 font-medium">Department</span>
                    <span className="font-bold text-slate-900 dark:text-slate-50">{department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Time</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-50">{timestamp}</span>
                  </div>
                </div>

                <button
                  onClick={handleAnalyzeAndSubmit}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-3.5 text-sm font-extrabold text-slate-950 hover:bg-amber-400 transition-all"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Analyse &amp; Submit</span>
                </button>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div>
                {isAnalyzing ? (
                  <div className="py-8 text-center space-y-4">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-500">
                      <RefreshCw className="h-6 w-6 animate-spin" />
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-50">RescueFlow AI is analysing the incident</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-4 space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <h4 className="font-extrabold text-slate-900 dark:text-slate-50 text-sm">Welding Fire Hazard</h4>
                        <span className="rounded bg-orange-500 px-2 py-0.5 font-bold text-white uppercase text-[10px]">HIGH</span>
                      </div>
                      <p className="text-slate-600">Location: {gpsLocation} • AI Confidence: 94%</p>
                      <p className="text-amber-900 font-semibold bg-amber-50 p-2 rounded border border-amber-200">
                        Recommendation: Stop welding operations and isolate affected zone.
                      </p>
                    </div>

                    <Link
                      href="/dispatch"
                      onClick={() => onClose?.()}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-3.5 text-sm font-extrabold text-slate-950 hover:bg-amber-400 transition-all"
                    >
                      <span>Start Response Workflow</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
