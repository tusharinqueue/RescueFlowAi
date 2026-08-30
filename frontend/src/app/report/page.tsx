"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Camera, Video, Mic, FileText, MapPin, Clock,
  CheckCircle2, ArrowRight, AlertTriangle, Users,
  ChevronLeft, Sparkles, RefreshCw, MicOff, Volume2, VolumeX,
  Square, ImageIcon, Film, Play, Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSpeechSynthesis, useSpeechRecognition } from "@/hooks/use-speech";
import { useIncidents, type StoredIncident } from "@/hooks/use-incidents";
import { type AIResult } from "@/app/api/analyze/route";

type MethodType = "photo" | "video" | "voice" | "text" | null;

// ─── Typewriter hook ───────────────────────────────────────────────────────────
function useTypewriter(text: string, speed = 18, active = false) {
  const [displayed, setDisplayed] = useState("");
  const idxRef = useRef(0);
  useEffect(() => {
    if (!active) { setDisplayed(""); idxRef.current = 0; return; }
    setDisplayed(""); idxRef.current = 0;
    const id = setInterval(() => {
      idxRef.current += 1;
      setDisplayed(text.slice(0, idxRef.current));
      if (idxRef.current >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed, active]);
  return displayed;
}

export default function ReportIncidentPage() {
  const router = useRouter();

  const [step, setStep]     = useState<1 | 2 | 3 | 4>(1);
  const [method, setMethod] = useState<MethodType>(null);

  // Media state
  const [photoPreview,  setPhotoPreview]  = useState<string | null>(null);
  const [videoPreview,  setVideoPreview]  = useState<string | null>(null);
  const [audioUrl,      setAudioUrl]      = useState<string | null>(null);
  const [isRecording,   setIsRecording]   = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);

  // Context fields — auto-fetched from browser
  const [location,     setLocation]     = useState("Fetching location...");
  const [locationLoading, setLocationLoading] = useState(true);
  const [detectedTime, setDetectedTime] = useState("");
  const [textDescription, setTextDescription] = useState("");

  // AI / analysis state
  const [analyzing,    setAnalyzing]    = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [dispatchStep, setDispatchStep] = useState(0);
  const [resultReady,  setResultReady]  = useState(false);
  const [aiResult,     setAiResult]     = useState<AIResult | null>(null);

  // Refs
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const mediaRecRef   = useRef<MediaRecorder | null>(null);
  const mediaBlobRef  = useRef<Blob | null>(null);
  const chunksRef     = useRef<BlobPart[]>([]);
  const timerRef      = useRef<ReturnType<typeof setInterval> | null>(null);

  // Hooks
  const { speak, stop: stopSpeech, speaking } = useSpeechSynthesis();
  const { transcript, state: recState, supported: recSupported, startListening, stopListening } = useSpeechRecognition();
  const { addIncident, updateStatus } = useIncidents();
  const [currentIncidentId, setCurrentIncidentId] = useState<string | null>(null);

  const typedSummary = useTypewriter(aiResult?.summary || "", 18, resultReady);

  // ── Auto-read AI brief when result appears ────────────────────────────────
  // Removed automatic speech per user request; will only trigger via button click.
  // useEffect(() => { ... }, []);
  // Sync speech-to-text transcript → description field
  useEffect(() => { if (transcript) setTextDescription(transcript); }, [transcript]);

  // Auto-fetch time and location on mount
  useEffect(() => {
    const now = new Date();
    setDetectedTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));

    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            if (res.ok) {
              const data = await res.json();
              if (data.display_name) {
                setLocation(data.display_name);
              } else {
                setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
              }
            } else {
              setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            }
          } catch (e) {
            setLocation(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
          } finally {
            setLocationLoading(false);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocation("Location access denied or unavailable");
          setLocationLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setLocation("Location not supported");
      setLocationLoading(false);
    }
  }, []);
  // ── Read query param ?method= on mount to auto-select method ─────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const m = params.get("method") as MethodType;
    if (m && ["photo", "video", "voice", "text"].includes(m)) {
      activateMethod(m);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Media handlers ────────────────────────────────────────────────────────
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    mediaBlobRef.current = file;
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    mediaBlobRef.current = file;
    setVideoPreview(URL.createObjectURL(file));
  };

  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        mediaBlobRef.current = blob;
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      mediaRecRef.current = mr;
      setIsRecording(true);
      setRecordSeconds(0);
      timerRef.current = setInterval(() => setRecordSeconds((s) => s + 1), 1000);
    } catch {
      alert("Microphone access denied. Please allow microphone permission.");
    }
  };

  const stopAudioRecording = () => {
    mediaRecRef.current?.stop();
    setIsRecording(false);
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  // ── Core method activation (used from both card click and query param) ─────
  const activateMethod = useCallback((m: MethodType) => {
    setMethod(m);
    setStep(2);
    if (m === "photo") setTimeout(() => photoInputRef.current?.click(), 150);
    if (m === "video") setTimeout(() => videoInputRef.current?.click(), 150);
    if (m === "voice") setTimeout(() => startAudioRecording(), 150);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toBase64 = (blob: Blob) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1] || "");
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  // ── Analysis ──────────────────────────────────────────────────────────────
  const handleStartAnalysis = async () => {
    setStep(3);
    setAnalyzing(true);
    setAnalysisStep(0);
    setResultReady(false);
    
    // Fake progress steps while API runs
    const intervals = [1, 2, 3, 4, 5].map((s, i) => setTimeout(() => setAnalysisStep(s), (i + 1) * 800));

    try {
      let imageBase64;
      let imageMime;
      
      if (method === "photo" && mediaBlobRef.current) {
        imageBase64 = await toBase64(mediaBlobRef.current);
        imageMime = mediaBlobRef.current.type || "image/jpeg";
      }

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: textDescription,
          location,
          method,
          imageBase64,
          imageMime
        })
      });

      const data: AIResult = await res.json();
      if (!res.ok) throw new Error("API error");

      setAiResult(data);
      
      const incidentId = `INC-${Date.now()}`;
      setCurrentIncidentId(incidentId);

      const incident: StoredIncident = {
        id:             incidentId,
        title:          data.title,
        severity:       data.severity,
        status:         "pending",
        location,
        description:    textDescription || `Reported via ${method} at ${location}`,
        aiSummary:      data.summary,
        recommendation: data.recommendation,
        hazards:        data.hazards,
        teams:          data.teams,
        confidence:     data.confidence,
        workersAtRisk:  data.workersAtRisk,
        reportedAt:     new Date().toISOString(),
        method:         method ?? "text",
        mediaBlob:      mediaBlobRef.current || undefined,
      };
      
      addIncident(incident);
      setAnalysisStep(5);
    } catch (err) {
      console.error(err);
      alert("Failed to analyze incident.");
    } finally {
      intervals.forEach(clearTimeout);
      setAnalyzing(false);
      setResultReady(true);
    }
  };

  const hasMedia =
    (method === "photo" && !!photoPreview) ||
    (method === "video" && !!videoPreview) ||
    (method === "voice" && !!audioUrl) ||
    method === "text";

  const fmtSecs = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="min-h-screen font-sans text-white/85 antialiased p-4 sm:p-6 lg:p-8">
      {/* Hidden file inputs */}
      <input ref={photoInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoChange} />
      <input ref={videoInputRef} type="file" accept="video/*" capture="environment" className="hidden" onChange={handleVideoChange} />

      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/40 hover:text-white/90 transition-colors">
            <ChevronLeft className="h-4 w-4" />Back to Dashboard
          </Link>
          <span className="text-xs font-mono font-bold text-white/30">Step {step > 3 ? 3 : step} of 3</span>
        </div>

        {/* ================================================================= */}
        {/* STEP 1 – SELECT METHOD                                             */}
        {/* ================================================================= */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-extrabold text-white/90">Report an Incident</h1>
              <p className="text-sm text-white/40 mt-1">Tell us what happened. AI will handle the rest.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { id: "photo", label: "Take Photo",        emoji: "📷", desc: "Opens camera to capture image" },
                { id: "video", label: "Record Video",      emoji: "🎥", desc: "Opens camera to record a clip" },
                { id: "voice", label: "Record Voice",      emoji: "🎤", desc: "Records audio from microphone" },
                { id: "text",  label: "Describe Incident", emoji: "✏️", desc: "Type or speak your description" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => activateMethod(item.id as MethodType)}
                  className="flex flex-col items-center justify-center p-8 glass-card hover:bg-white/[0.06] hover:border-amber-500/50 hover:shadow-[0_0_16px_rgba(245,158,11,0.15)] transition-all text-center min-h-[160px] active:scale-[0.98]"
                >
                  <span className="text-4xl mb-3">{item.emoji}</span>
                  <h3 className="text-lg font-bold text-white/90">{item.label}</h3>
                  <p className="text-xs text-white/40 mt-1">{item.desc}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ================================================================= */}
        {/* STEP 2 – PREVIEW + CONTEXT                                         */}
        {/* ================================================================= */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
              <div>
                <h1 className="text-2xl font-extrabold text-white/90">Incident Details</h1>
                <p className="text-xs text-white/40">Review captured media and confirm context.</p>
              </div>
              <button onClick={() => { setStep(1); setPhotoPreview(null); setVideoPreview(null); setAudioUrl(null); }}
                className="text-xs font-semibold text-white/40 hover:text-white/90">
                Change Method
              </button>
            </div>

            {/* ── PHOTO ── */}
            {method === "photo" && (
              <div className="glass-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white/70 flex items-center gap-2"><ImageIcon className="h-4 w-4 text-amber-500" /> Photo Capture</span>
                  {photoPreview && <button onClick={() => { setPhotoPreview(null); photoInputRef.current?.click(); }} className="text-xs text-blue-600 font-semibold hover:underline">Retake</button>}
                </div>
                {photoPreview ? (
                  <img src={photoPreview} alt="Captured incident" className="w-full rounded-xl object-cover max-h-64 border border-white/[0.08]" />
                ) : (
                  <button onClick={() => photoInputRef.current?.click()}
                    className="w-full flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/[0.2] bg-white/[0.04] border border-white/[0.08] py-10 text-white/30 hover:border-amber-400 hover:text-amber-500 transition-all">
                    <Camera className="h-10 w-10" />
                    <span className="text-sm font-semibold">Tap to open camera</span>
                  </button>
                )}
              </div>
            )}

            {/* ── VIDEO ── */}
            {method === "video" && (
              <div className="glass-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white/70 flex items-center gap-2"><Film className="h-4 w-4 text-blue-500" /> Video Clip</span>
                  {videoPreview && <button onClick={() => { setVideoPreview(null); videoInputRef.current?.click(); }} className="text-xs text-blue-600 font-semibold hover:underline">Re-record</button>}
                </div>
                {videoPreview ? (
                  <video src={videoPreview} controls className="w-full rounded-xl max-h-64 border border-white/[0.08] bg-black/50" />
                ) : (
                  <button onClick={() => videoInputRef.current?.click()}
                    className="w-full flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/[0.2] bg-white/[0.04] border border-white/[0.08] py-10 text-white/30 hover:border-blue-400 hover:text-blue-500 transition-all">
                    <Video className="h-10 w-10" />
                    <span className="text-sm font-semibold">Tap to record video</span>
                  </button>
                )}
              </div>
            )}

            {/* ── VOICE RECORDING ── */}
            {method === "voice" && (
              <div className="glass-card p-5 space-y-4">
                <span className="text-sm font-bold text-white/70 flex items-center gap-2"><Mic className="h-4 w-4 text-red-500" /> Voice Recording</span>
                {isRecording ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                        </span>
                        <span className="text-sm font-bold text-red-700">Recording…</span>
                      </div>
                      <span className="font-mono text-sm font-bold text-red-600">{fmtSecs(recordSeconds)}</span>
                    </div>
                    <button onClick={stopAudioRecording}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-500 py-3 text-sm font-bold text-white hover:bg-red-600 transition-all">
                      <Square className="h-4 w-4 fill-white" /> Stop Recording
                    </button>
                  </div>
                ) : audioUrl ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span className="text-xs font-semibold text-emerald-800">Recording saved — {fmtSecs(recordSeconds)}</span>
                    </div>
                    <audio src={audioUrl} controls className="w-full rounded-xl" />
                    <button onClick={() => { setAudioUrl(null); startAudioRecording(); }} className="text-xs font-semibold text-blue-600 hover:underline">Re-record</button>
                  </div>
                ) : (
                  <button onClick={startAudioRecording}
                    className="w-full flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-red-300 bg-red-50 py-10 hover:border-red-400 transition-all">
                    <Mic className="h-10 w-10 text-red-400" />
                    <span className="text-sm font-semibold text-red-600">Tap to start recording</span>
                  </button>
                )}
              </div>
            )}

            {/* ── TEXT / SPEAK ── */}
            {method === "text" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white/70">Incident Description</label>
                  {recSupported && (
                    <button onClick={() => recState === "listening" ? stopListening() : startListening()}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all",
                        recState === "listening" ? "bg-red-500 text-white animate-pulse" : "bg-white/[0.08] text-white/70 hover:bg-amber-100 hover:text-amber-800"
                      )}>
                      {recState === "listening" ? <><MicOff className="h-3.5 w-3.5" /> Stop</> : <><Mic className="h-3.5 w-3.5" /> Speak</>}
                    </button>
                  )}
                </div>
                {recState === "listening" && (
                  <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                    </span>
                    <span className="text-xs font-semibold text-red-700">Listening… speak clearly</span>
                  </div>
                )}
                <textarea rows={4} value={textDescription} onChange={(e) => setTextDescription(e.target.value)}
                  placeholder="e.g. Fire hazard near welding area with sparks close to combustible material."
                  className="w-full rounded-xl glass-card border-0 p-3 text-sm text-white/90 placeholder:text-white/30 focus:border-amber-500 outline-none" />
              </div>
            )}

            {/* Auto-detected metadata */}
            <div className="glass-card p-5 space-y-4 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white/30">Detected Context</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Location — auto from GPS */}
                <div className="space-y-1">
                  <span className="text-white/40 block font-medium">Location (GPS)</span>
                  <div className="flex items-center gap-2 rounded-lg bg-white/[0.04] border border-white/[0.08] px-2 py-1.5">
                    <MapPin className={cn("h-4 w-4 shrink-0", locationLoading ? "text-white/20 animate-pulse" : "text-amber-500")} />
                    <span className="font-bold text-white/90 truncate">{location}</span>
                  </div>
                </div>
                {/* Time — auto from system clock */}
                <div className="space-y-1">
                  <span className="text-white/40 block font-medium">Time (Auto)</span>
                  <div className="flex items-center gap-2 rounded-lg bg-white/[0.04] border border-white/[0.08] px-2 py-1.5 font-mono font-bold text-white/90">
                    <Clock className="h-4 w-4 text-white/30 shrink-0" />
                    <span>{detectedTime}</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleStartAnalysis}
              disabled={!hasMedia}
              className={cn(
                "w-full flex items-center justify-center gap-3 rounded-2xl py-4 text-lg font-extrabold text-slate-950 shadow-md transition-all active:scale-[0.98]",
                hasMedia ? "bg-amber-500 hover:bg-amber-400" : "bg-slate-200 text-white/30 cursor-not-allowed"
              )}
            >
              <Sparkles className="h-5 w-5" />
              <span>Analyse &amp; Submit</span>
            </button>
          </motion.div>
        )}

        {/* ================================================================= */}
        {/* STEP 3 – AI RESULT                                                 */}
        {/* ================================================================= */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
            {analyzing ? (
              <div className="glass-card p-8 text-center space-y-6 shadow-xs">
                <div className="flex justify-center">
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 border border-amber-200">
                    <RefreshCw className="h-8 w-8 text-amber-500 animate-spin" />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-white/90">RescueFlow AI is analysing the incident</h2>
                  <p className="text-xs text-white/40 mt-1 font-mono">Running hazard classification engine…</p>
                </div>
                <div className="max-w-xs mx-auto text-left space-y-2 text-xs font-semibold">
                  {["Media analysed", "Hazard identified", "Severity calculated", "Response team determined", "Incident report generated"].map((task, idx) => (
                    <div key={task} className="flex items-center gap-2.5">
                      {analysisStep > idx
                        ? <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        : <div className="h-4 w-4 rounded-full border border-white/[0.2] shrink-0" />}
                      <span className={analysisStep > idx ? "text-white/90 font-bold" : "text-white/30"}>{task}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="h-3.5 w-3.5" /> AI Analysis Complete
                  </span>
                  <button
                    onClick={() => speaking ? stopSpeech() : speak(
                      `Alert! ${aiResult?.title} detected. Severity: ${aiResult?.severity}. ${aiResult?.recommendation} Recommended teams: ${aiResult?.teams.join(", ")}.`,
                      0.9
                    )}
                    className={cn("inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all shadow-sm",
                      speaking ? "bg-blue-600 text-white shadow-blue-500/25" : "bg-blue-500 hover:bg-blue-400 text-white"
                    )}
                  >
                    {speaking ? <Square className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
                    {speaking ? "Stop Playing" : "Play AI Summary"}
                  </button>
                </div>

                <div className="glass-card p-6 shadow-sm space-y-5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
                    <div>
                      <h2 className="text-xl font-extrabold text-white/90">{aiResult?.title}</h2>
                      <p className="text-xs text-white/40 mt-0.5">Location: <strong className="text-white/90">{location}</strong></p>
                    </div>
                    <span className={cn("rounded-xl px-3 py-1 text-xs font-black text-white uppercase tracking-wider shadow-xs animate-pulse", aiResult?.severityColor)}>
                      {aiResult?.severity}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center bg-white/[0.04] border border-white/[0.08] rounded-xl p-3 border border-white/[0.08]">
                    <div><span className="text-[10px] text-white/40 block uppercase font-semibold">Location</span><span className="text-xs font-bold text-white/90">{location}</span></div>
                    <div><span className="text-[10px] text-white/40 block uppercase font-semibold">Workers at Risk</span><span className="text-xs font-bold text-orange-600">{aiResult?.workersAtRisk} Workers</span></div>
                    <div><span className="text-[10px] text-white/40 block uppercase font-semibold">AI Confidence</span><span className="text-xs font-bold text-blue-600">{aiResult?.confidence}%</span></div>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-white/70 uppercase tracking-wider">Potential Hazards</h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {aiResult?.hazards?.map((h) => (
                        <li key={h} className="rounded-lg bg-orange-50 border border-orange-200/60 px-2.5 py-1.5 text-xs font-semibold text-orange-900 flex items-center gap-1.5">
                          <AlertTriangle className="h-3.5 w-3.5 text-orange-600 shrink-0" />{h}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl bg-blue-50/60 border border-blue-200/60 p-3.5 space-y-1 min-h-[60px]">
                    <span className="text-xs font-bold text-blue-900 block">AI Summary</span>
                    <p className="text-xs text-blue-950 leading-relaxed italic">
                      &ldquo;{typedSummary}<span className="animate-pulse">|</span>&rdquo;
                    </p>
                  </div>

                  <div className="rounded-xl bg-amber-50 border border-amber-200 p-3.5 space-y-1">
                    <span className="text-xs font-bold text-amber-900 block uppercase">Immediate Recommendation</span>
                    <p className="text-xs font-semibold text-amber-950">{aiResult?.recommendation}</p>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-white/70 uppercase tracking-wider">Recommended Teams</h4>
                    <div className="flex flex-wrap gap-2">
                      {aiResult?.teams?.map((team) => (
                        <span key={team} className="rounded-lg bg-white/[0.08] border border-white/[0.08] px-3 py-1 text-xs font-bold text-white/80 flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-white/40" />{team}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span className="text-xs font-semibold text-emerald-800">Incident saved — visible on Dashboard &amp; Incidents list.</span>
                </div>

                <button
                  onClick={() => { 
                    stopSpeech();
                    setStep(4);
                    setDispatchStep(0);
                    const teams = aiResult?.teams || ["Emergency Responders"];
                    
                    setTimeout(() => setDispatchStep(1), 1000); // Network connection
                    
                    teams.forEach((_, idx) => {
                       setTimeout(() => setDispatchStep(idx + 2), 1000 + (idx + 1) * 1200);
                    });
                    
                    const finalStep = teams.length + 2;
                    setTimeout(() => {
                      setDispatchStep(finalStep);
                      if (currentIncidentId) {
                        updateStatus(currentIncidentId, "resolved");
                      }
                    }, 1000 + teams.length * 1200 + 800);
                    
                    setTimeout(() => router.push("/dashboard"), 1000 + teams.length * 1200 + 2000);
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-amber-500 py-4 text-base font-extrabold text-slate-950 shadow-md hover:bg-amber-400 transition-all active:scale-[0.98]"
                >
                  <span>Start Response Workflow</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* ================================================================= */}
        {/* STEP 4 – DISPATCHING                                               */}
        {/* ================================================================= */}
        {step === 4 && (() => {
          const LIFECYCLE_STEPS = ["Reported", "AI Analysed", "Assigned", "In Progress", "Resolved"];
          const numTeams = aiResult?.teams?.length || 1;
          const finalDispatchStep = numTeams + 2;
          const isDispatchFinished = dispatchStep >= finalDispatchStep;
          
          // Progress the top lifecycle as the dispatch steps proceed
          let lifecycleCurrentStep = 3; // Starts at Assigned
          if (dispatchStep > 0) lifecycleCurrentStep = 4; // In Progress
          if (dispatchStep > numTeams) lifecycleCurrentStep = 5; 
          if (isDispatchFinished) lifecycleCurrentStep = 6; // Fully Resolved

          return (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
              
              {/* Lifecycle Component */}
              <div className="glass-card p-6 shadow-xs space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white/30">Incident Lifecycle</h3>
                <div className="flex items-center justify-between">
                  {LIFECYCLE_STEPS.map((title, idx) => {
                    const lStep     = idx + 1;
                    const isDone    = lifecycleCurrentStep > lStep;
                    const isCurrent = lifecycleCurrentStep === lStep;
                    return (
                      <React.Fragment key={title}>
                        <div className="flex flex-col items-center gap-2">
                          <div className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-full text-xs font-extrabold transition-all",
                            isDone    ? "bg-emerald-600 text-white" :
                            isCurrent ? "bg-amber-500/10 border border-amber-500/200 text-amber-500 ring-4 ring-amber-500/20" :
                                        "bg-white/[0.08] text-white/30 border border-white/[0.08]"
                          )}>
                            {isDone ? <Check className="h-4 w-4 stroke-[3]" /> : lStep}
                          </div>
                          <span className={cn("text-[10px] sm:text-xs font-bold text-center",
                            isDone ? "text-emerald-400" : isCurrent ? "text-amber-400" : "text-white/30"
                          )}>{title}</span>
                        </div>
                        {idx < LIFECYCLE_STEPS.length - 1 && (
                          <div className={cn("h-1 flex-1 mx-1 sm:mx-3 rounded-full transition-all",
                            lifecycleCurrentStep > idx + 1 ? "bg-emerald-500" : "bg-white/[0.08]"
                          )} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              <div className="glass-card p-8 text-center space-y-6 shadow-xs">
                <div className="flex justify-center">
                  <div className={cn("relative flex h-16 w-16 items-center justify-center rounded-full border transition-colors", 
                    isDispatchFinished ? "bg-emerald-50 border-emerald-200" : "bg-blue-50 border-blue-200"
                  )}>
                    {isDispatchFinished ? (
                      <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                    ) : (
                      <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
                    )}
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-white/90">
                    {isDispatchFinished ? "Dispatch Complete" : "Dispatching Response Teams"}
                  </h2>
                  <p className="text-xs text-white/40 mt-1 font-mono">
                    {isDispatchFinished ? "All units notified successfully." : "Initiating communication protocols…"}
                  </p>
                </div>
                <div className="max-w-xs mx-auto text-left space-y-2 text-xs font-semibold">
                  <div className="flex items-center gap-2.5">
                    {dispatchStep > 0
                      ? <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      : <div className="h-4 w-4 rounded-full border border-white/[0.2] shrink-0" />}
                    <span className={dispatchStep > 0 ? "text-white/90 font-bold" : "text-white/30"}>Connecting to dispatch network</span>
                  </div>
                  {aiResult?.teams?.map((team, idx) => (
                    <div key={team} className="flex items-center gap-2.5">
                      {dispatchStep > idx + 1
                        ? <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        : <div className="h-4 w-4 rounded-full border border-white/[0.2] shrink-0" />}
                      <span className={dispatchStep > idx + 1 ? "text-white/90 font-bold" : "text-white/30"}>Notifying {team}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-2.5">
                    {dispatchStep > (aiResult?.teams?.length || 0) + 1
                      ? <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      : <div className="h-4 w-4 rounded-full border border-white/[0.2] shrink-0" />}
                    <span className={dispatchStep > (aiResult?.teams?.length || 0) + 1 ? "text-white/90 font-bold" : "text-white/30"}>Sending exact coordinates &amp; briefing</span>
                  </div>
                </div>

                {/* Call status div */}
                {isDispatchFinished && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 flex items-start sm:items-center gap-3 rounded-xl border border-emerald-200/50 bg-emerald-500/10 px-4 py-3 text-left">
                    <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0" />
                    <span className="text-sm font-bold text-emerald-400">
                      These teams are informed and they will be reaching the location in approximately 2 minutes.
                    </span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })()}
      </div>
    </div>
  );
}


