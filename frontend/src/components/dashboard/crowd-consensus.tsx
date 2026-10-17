"use client";

import { useState, useEffect, useRef } from "react";
import {
  GitMerge, Camera, Shield, TrendingUp, Clock, Users,
  ChevronDown, ChevronUp, CheckCircle2, AlertTriangle, Zap,
  PhoneOff, Sparkles, ArrowUpRight
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── 3 Selectable Deduplication Scenarios with Realistic Dummy Data ────────────
const SCENARIOS = {
  crash: {
    id: "INC-0047",
    title: "Major Multi-Vehicle Highway Collision",
    type: "Vehicle Collision",
    location: "NH-24 near Sector 62, Noida NCR",
    coords: "28.6270° N, 77.3590° E",
    lat: 28.6270, lng: 77.3590,
    totalBystanders: 25,
    twilioSaved: 24,
    startConfidence: 72,
    windowMinutes: "2 min",
    bystanders: [
      { id: "r1", time: "09:41:22", method: "photo", reporter: "Bystander #1 (First Caller)", distanceM: 0, note: "Initial impact photo uploaded via web report" },
      { id: "r2", time: "09:41:35", method: "photo", reporter: "Bystander #2", distanceM: 18, note: "Wide shot showing 3 cars involved" },
      { id: "r3", time: "09:41:48", method: "photo", reporter: "Bystander #3", distanceM: 32, note: "Front cabin smoke visible" },
      { id: "r4", time: "09:42:01", method: "photo", reporter: "Bystander #4", distanceM: 45, note: "Traffic stalled on westbound lane" },
      { id: "r5", time: "09:42:15", method: "voice", reporter: "Bystander #5", distanceM: 27, note: "Audio note: 'Airbags deployed, everyone is out'" },
      { id: "r6", time: "09:42:28", method: "photo", reporter: "Bystander #6", distanceM: 61, note: "Oil leak on road surface" },
      { id: "r7", time: "09:42:40", method: "photo", reporter: "Bystander #7", distanceM: 74, note: "License plate captured for recovery unit" },
      { id: "r8", time: "09:42:55", method: "text",  reporter: "Bystander #8", distanceM: 88, note: "Police siren audible in distance" },
    ],
  },
  collapse: {
    id: "INC-0051",
    title: "Commercial Facade & Glass Canopy Collapse",
    type: "Structural Collapse",
    location: "Sector 18 Commercial Hub, Noida",
    coords: "28.5700° N, 77.3210° E",
    lat: 28.5700, lng: 77.3210,
    totalBystanders: 18,
    twilioSaved: 17,
    startConfidence: 68,
    windowMinutes: "90 sec",
    bystanders: [
      { id: "c1", time: "14:10:05", method: "photo", reporter: "Security Guard (First Caller)", distanceM: 0, note: "Glass canopy fracture photo" },
      { id: "c2", time: "14:10:18", method: "photo", reporter: "Shopper #2", distanceM: 14, note: "Pedestrian walkway debris" },
      { id: "c3", time: "14:10:29", method: "photo", reporter: "Store Manager", distanceM: 22, note: "Cordon tape deployed at mall entrance" },
      { id: "c4", time: "14:10:45", method: "photo", reporter: "Office Worker", distanceM: 38, note: "Upper floor cantilever intact" },
      { id: "c5", time: "14:11:02", method: "voice", reporter: "Bystander #5", distanceM: 19, note: "No trapped casualties confirmed" },
    ],
  },
  flood: {
    id: "INC-0058",
    title: "Expressway Underpass Flash Submersion",
    type: "Flooding / Trapped Vehicles",
    location: "Sector 62 Underpass & NH-24 Cut",
    coords: "28.6080° N, 77.3640° E",
    lat: 28.6080, lng: 77.3640,
    totalBystanders: 21,
    twilioSaved: 20,
    startConfidence: 74,
    windowMinutes: "3 min",
    bystanders: [
      { id: "f1", time: "18:22:10", method: "photo", reporter: "Bus Driver (First Caller)", distanceM: 0, note: "Water level above tire rim" },
      { id: "f2", time: "18:22:25", method: "photo", reporter: "Commuter #2", distanceM: 12, note: "2 private cars stalled in middle lane" },
      { id: "f3", time: "18:22:42", method: "photo", reporter: "Traffic Police Officer", distanceM: 29, note: "Drainage pump failure photo" },
      { id: "f4", time: "18:23:05", method: "text",  reporter: "Commuter #4", distanceM: 52, note: "Vehicles turning back onto service lane" },
      { id: "f5", time: "18:23:28", method: "photo", reporter: "Delivery Rider", distanceM: 41, note: "Drainage backflow photo" },
    ],
  },
};

type ScenarioKey = keyof typeof SCENARIOS;

export function CrowdConsensusPanel() {
  const [activeScenarioKey, setActiveScenarioKey] = useState<ScenarioKey>("crash");
  const scenario = SCENARIOS[activeScenarioKey];

  const [animating, setAnimating] = useState(false);
  const [bystandersCount, setBystandersCount] = useState(scenario.totalBystanders);
  const [twilioSaved, setTwilioSaved] = useState(scenario.twilioSaved);
  const [confidence, setConfidence] = useState(99);
  const [showQuery, setShowQuery] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const surgeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset metrics when changing scenario
  useEffect(() => {
    setBystandersCount(scenario.totalBystanders);
    setTwilioSaved(scenario.twilioSaved);
    setConfidence(99);
  }, [activeScenarioKey, scenario]);

  const runSimulation = () => {
    if (surgeTimerRef.current) clearInterval(surgeTimerRef.current);
    setAnimating(true);
    setBystandersCount(1);
    setTwilioSaved(0);
    setConfidence(scenario.startConfidence);

    let currentBystanders = 1;
    let currentTwilio = 0;
    let currentConf = scenario.startConfidence;

    surgeTimerRef.current = setInterval(() => {
      currentBystanders += 2;
      currentTwilio = Math.max(0, currentBystanders - 1);
      currentConf = Math.min(99, Math.round(scenario.startConfidence + (currentBystanders / scenario.totalBystanders) * (99 - scenario.startConfidence)));

      if (currentBystanders >= scenario.totalBystanders) {
        currentBystanders = scenario.totalBystanders;
        currentTwilio = scenario.twilioSaved;
        currentConf = 99;
        setBystandersCount(scenario.totalBystanders);
        setTwilioSaved(scenario.twilioSaved);
        setConfidence(99);
        setAnimating(false);
        if (surgeTimerRef.current) clearInterval(surgeTimerRef.current);
      } else {
        setBystandersCount(currentBystanders);
        setTwilioSaved(currentTwilio);
        setConfidence(currentConf);
      }
    }, 60);
  };

  useEffect(() => {
    return () => {
      if (surgeTimerRef.current) clearInterval(surgeTimerRef.current);
    };
  }, []);

  const postgisQuery = `-- Supabase PostGIS Spatiotemporal Deduplication Query
-- Executed before inserting a new incident or triggering Twilio dispatch:
WITH existing_incident AS (
  SELECT id, title, severity, confidence_score
  FROM incidents
  WHERE type = '${scenario.type}'
    AND status IN ('active', 'dispatched')
    AND ST_DWithin(
      location::geography,
      ST_SetSRID(ST_MakePoint(${scenario.lng}, ${scenario.lat}), 4326)::geography,
      100  -- 100 meters radius threshold
    )
    AND reported_at >= NOW() - INTERVAL '15 minutes'
  ORDER BY reported_at ASC
  LIMIT 1
)
-- If spatial & temporal match found:
-- 1. Attach new photo into existing ticket's corroborating evidence array
-- 2. Upgrade ticket confidence_score to 99%
-- 3. Skip Twilio outbound call to keep phone lines clear for other emergencies
UPDATE incidents
SET 
  confidence_score = 99,
  corroborating_count = corroborating_count + 1,
  evidence_urls = array_append(evidence_urls, $new_photo_url)
WHERE id = (SELECT id FROM existing_incident)
RETURNING id, confidence_score, 'MERGED_NO_CALL' AS action;`;

  return (
    <section className="glass-card p-5 space-y-5 animate-fade-in" aria-label="Crowd consensus deduplication">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl glass-blue shadow-[0_0_18px_rgba(59,130,246,0.25)]">
            <GitMerge className="h-5 w-5 text-blue-400" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white/90">Spatiotemporal Deduplication (Crowd-Consensus)</h2>
              <span className="rounded-md bg-blue-500/15 border border-blue-500/30 text-blue-300 text-[9px] font-black px-1.5 py-0.5 uppercase tracking-wide">
                PostGIS ST_DWithin
              </span>
            </div>
            <p className="text-[11px] text-white/40 mt-0.5">
              Consolidates multi-witness surges into 1 verified ticket within 100m / 15-min window
            </p>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={runSimulation}
            disabled={animating}
            className="btn-press flex items-center gap-1.5 rounded-xl bg-blue-500 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-400 transition-all duration-200 shadow-[0_0_16px_rgba(59,130,246,0.35)] disabled:opacity-50"
          >
            <Zap className={cn("h-3.5 w-3.5", animating && "animate-spin")} />
            <span>{animating ? `Merging ${scenario.totalBystanders} Reports…` : `Simulate ${scenario.totalBystanders}-Bystander Surge`}</span>
          </button>
        </div>
      </div>

      {/* Scenario Switcher Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.035] border border-white/[0.07] overflow-x-auto">
        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-2 hidden sm:inline">
          Crisis Scenarios:
        </span>
        {(Object.keys(SCENARIOS) as ScenarioKey[]).map((key) => {
          const sc = SCENARIOS[key];
          return (
            <button
              key={key}
              onClick={() => {
                setActiveScenarioKey(key);
                setExpanded(false);
              }}
              className={cn(
                "btn-press flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0",
                activeScenarioKey === key
                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/35 shadow-[0_0_10px_rgba(59,130,246,0.2)]"
                  : "text-white/40 hover:text-white/70"
              )}
            >
              <span>{key === "crash" ? "🚗 Highway Pileup" : key === "collapse" ? "🏢 Facade Collapse" : "🌊 Underpass Flood"}</span>
              <span className="text-[9px] font-mono opacity-60">({sc.totalBystanders})</span>
            </button>
          );
        })}
      </div>

      {/* Narrative Alert / Key Benefit */}
      <div className="rounded-xl border border-blue-500/20 bg-blue-950/25 p-3.5 flex items-start gap-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400 mt-0.5">
          <PhoneOff className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-blue-200">
            {twilioSaved} Outbound Twilio Calls Saved · Dispatcher Lines Kept 100% Free
          </p>
          <p className="text-[11px] text-white/45 mt-0.5 leading-relaxed">
            When {scenario.totalBystanders} bystanders upload photos within {scenario.windowMinutes} of this {scenario.type.toLowerCase()}, the system triggers a Supabase PostGIS <code className="text-blue-300 font-mono">ST_DWithin(100m)</code> spatial query. Instead of {scenario.totalBystanders} ringing phones jamming dispatcher bandwidth, all subsequent photos merge as corroborating evidence and upgrade ticket confidence to <strong className="text-green-400 font-bold">99%</strong>.
          </p>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.07] p-3 text-center">
          <Users className="h-4 w-4 text-blue-400 mx-auto mb-1" />
          <p className="text-xl font-bold text-white/90 stat-number">{bystandersCount}</p>
          <p className="text-[9px] text-white/35 font-medium uppercase tracking-wide">Bystander Reports</p>
        </div>

        <div className="rounded-xl bg-white/[0.03] border border-white/[0.07] p-3 text-center">
          <PhoneOff className="h-4 w-4 text-green-400 mx-auto mb-1" />
          <p className="text-xl font-bold text-green-400 stat-number">{twilioSaved}</p>
          <p className="text-[9px] text-white/35 font-medium uppercase tracking-wide">Calls Prevented</p>
        </div>

        <div className="rounded-xl bg-white/[0.03] border border-white/[0.07] p-3 text-center">
          <Clock className="h-4 w-4 text-amber-400 mx-auto mb-1" />
          <p className="text-xl font-bold text-white/90 stat-number">{scenario.windowMinutes}</p>
          <p className="text-[9px] text-white/35 font-medium uppercase tracking-wide">Surge Window</p>
        </div>

        <div className="rounded-xl bg-white/[0.03] border border-white/[0.07] p-3 text-center">
          <TrendingUp className="h-4 w-4 text-emerald-400 mx-auto mb-1" />
          <p className="text-xl font-bold text-emerald-400 stat-number">{confidence}%</p>
          <p className="text-[9px] text-white/35 font-medium uppercase tracking-wide">Confidence Score</p>
        </div>
      </div>

      {/* Incident details & Confidence Meter */}
      <div className="rounded-xl border border-white/[0.08] bg-black/20 p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="id-label">{scenario.id}</span>
              <span className="text-sm font-bold text-white/90">{scenario.title}</span>
              <span className="rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[9px] font-black px-1.5 py-0.5 uppercase tracking-wide">
                Consensus Confirmed (99%)
              </span>
            </div>
            <p className="text-[11px] text-white/40 mt-1">
              {scenario.location} · Coordinates: {scenario.coords}
            </p>
          </div>
          <button
            onClick={() => setShowQuery(q => !q)}
            className="text-[11px] font-bold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 self-start sm:self-auto"
          >
            <span>{showQuery ? "Hide" : "View"} PostGIS ST_DWithin Query</span>
            <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>

        {/* Animated Confidence Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
              AI & Crowd-Consensus Confidence
            </span>
            <span className="font-mono font-bold text-emerald-400 text-sm">
              {confidence}% {confidence === 99 && "✓ Verified"}
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${confidence}%`,
                background: "linear-gradient(90deg, #3b82f6 0%, #10b981 100%)",
                boxShadow: "0 0 10px rgba(16, 185, 129, 0.5)",
              }}
            />
          </div>
        </div>

        {/* PostGIS Query Dropdown */}
        {showQuery && (
          <div className="rounded-xl bg-slate-950/80 border border-white/[0.08] p-4 font-mono text-[11px] text-blue-300/90 leading-relaxed overflow-x-auto animate-fade-in">
            <div className="flex items-center justify-between text-[10px] text-white/30 uppercase tracking-wider mb-2 font-sans">
              <span>SQL Query · Supabase PostGIS Extension</span>
              <span>100m Radius · 15min Window</span>
            </div>
            <pre className="whitespace-pre">{postgisQuery}</pre>
          </div>
        )}

        {/* Bystander Corroboration Feed */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
              Corroborating Evidence Feed ({bystandersCount} Photos / Reports)
            </span>
            <button
              onClick={() => setExpanded(e => !e)}
              className="text-[10px] font-bold text-white/35 hover:text-white/60 transition-colors flex items-center gap-1"
            >
              {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {expanded ? "Show Less" : `Expand All ${scenario.bystanders.length} Bystanders`}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(expanded ? scenario.bystanders : scenario.bystanders.slice(0, 4)).map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-2.5 rounded-xl bg-white/[0.025] border border-white/[0.055] p-2.5"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-500/12 text-blue-400 mt-0.5">
                  <Camera className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] font-bold text-white/80 truncate">{item.reporter}</span>
                    <span className="text-[9px] font-mono text-white/30 shrink-0">{item.time}</span>
                  </div>
                  <p className="text-[10px] text-white/40 truncate mt-0.5">{item.note}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] font-mono text-blue-400/80">Δ {item.distanceM}m away</span>
                    <span className="text-[9px] text-emerald-400/80 flex items-center gap-0.5">
                      <CheckCircle2 className="h-2.5 w-2.5" /> Merged
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
