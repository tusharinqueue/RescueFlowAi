"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Phone, MapPin, Shield, Activity, Navigation2,
  Loader2, RefreshCw, ExternalLink, ChevronRight,
  Building2, Siren, AlertCircle, CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

// ──────────────────────────────────────────────────────────────────────────────
// Option B: Local JSON directory — India emergency helplines
// These are real national/state numbers, safe to display in a demo
// ──────────────────────────────────────────────────────────────────────────────
const LOCAL_DIRECTORY: Authority[] = [
  // National helplines
  { id: "n1", name: "Police Emergency",        type: "police",   phone: "100",  lat: 28.5740, lng: 77.3112, source: "national", distanceM: 0, eta: "4 min" },
  { id: "n2", name: "Ambulance (EMRI)",         type: "hospital", phone: "108",  lat: 28.5750, lng: 77.3100, source: "national", distanceM: 0, eta: "7 min" },
  { id: "n3", name: "Fire Brigade",             type: "fire",     phone: "101",  lat: 28.5760, lng: 77.3090, source: "national", distanceM: 0, eta: "6 min" },
  { id: "n4", name: "Women Safety (UP)",        type: "safety",   phone: "1090", lat: 28.5730, lng: 77.3140, source: "national", distanceM: 0, eta: "8 min" },
  { id: "n5", name: "Disaster Management",      type: "disaster", phone: "1077", lat: 28.5720, lng: 77.3130, source: "national", distanceM: 0, eta: "10 min" },
  // Team Live Demo numbers (routes to team in demo)
  { id: "t1", name: "RescueFlow Dispatch Lead (Demo Team)", type: "safety",   phone: "+91 98765 43210", lat: 28.5740, lng: 77.3112, source: "local",    distanceM: 0, eta: "1 min" },
  { id: "t2", name: "On-Call Trauma Response Desk (Demo)",  type: "hospital", phone: "+91 98765 43211", lat: 28.5748, lng: 77.3119, source: "local",    distanceM: 0, eta: "2 min" },
  // Noida-specific authorities
  { id: "l1", name: "Noida Police Control",                 type: "police",   phone: "0120-2444444",   lat: 28.5851, lng: 77.3260, source: "local",    distanceM: 0, eta: "6 min" },
  { id: "l2", name: "Kailash Hospital Noida",               type: "hospital", phone: "0120-4444444",   lat: 28.5667, lng: 77.3119, source: "local",    distanceM: 0, eta: "9 min" },
  { id: "l3", name: "Jaypee Hospital Noida",                type: "hospital", phone: "0120-3838000",   lat: 28.5445, lng: 77.3895, source: "local",    distanceM: 0, eta: "14 min" },
  { id: "l4", name: "Noida Fire Station Sec-58",            type: "fire",     phone: "0120-2580101",   lat: 28.6126, lng: 77.3570, source: "local",    distanceM: 0, eta: "11 min" },
  { id: "l5", name: "Sector 39 Police Post",                type: "police",   phone: "0120-2538100",   lat: 28.5686, lng: 77.3160, source: "local",    distanceM: 0, eta: "5 min" },
  { id: "l6", name: "Sector 18 Commercial Police Post",     type: "police",   phone: "0120-2512100",   lat: 28.5700, lng: 77.3210, source: "local",    distanceM: 0, eta: "4 min" },
  { id: "l7", name: "DND Flyway Expressway Patrol",         type: "police",   phone: "0120-2445500",   lat: 28.5785, lng: 77.3020, source: "local",    distanceM: 0, eta: "3 min" },
  { id: "l8", name: "Neo Multi-Speciality Hospital",        type: "hospital", phone: "0120-4880000",   lat: 28.5760, lng: 77.3550, source: "local",    distanceM: 0, eta: "8 min" },
  { id: "l9", name: "Sector 2 Fire Brigade HQ",             type: "fire",     phone: "0120-2550101",   lat: 28.5860, lng: 77.3100, source: "local",    distanceM: 0, eta: "5 min" },
];

export interface Authority {
  id: string;
  name: string;
  type: "police" | "hospital" | "fire" | "safety" | "disaster";
  phone: string;
  lat: number;
  lng: number;
  source: "national" | "local" | "osm";
  distanceM: number;
  eta: string;
  osmTags?: Record<string, string>;
}

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

function etaLabel(metres: number): string {
  const walkMpm = 80; // metres per minute walking
  const driveMpm = 500; // metres per minute driving in city
  const mins = metres < 800
    ? Math.max(1, Math.round(metres / walkMpm))
    : Math.max(2, Math.round(metres / driveMpm));
  return `${mins} min`;
}

// ── Overpass API query for nearest police/hospital ─────────────────────────
async function fetchOverpass(lat: number, lng: number, radiusM = 2000): Promise<Authority[]> {
  const query = `
    [out:json][timeout:15];
    (
      node["amenity"="police"](around:${radiusM},${lat},${lng});
      node["amenity"="hospital"](around:${radiusM},${lat},${lng});
      node["amenity"="fire_station"](around:${radiusM},${lat},${lng});
      way["amenity"="police"](around:${radiusM},${lat},${lng});
      way["amenity"="hospital"](around:${radiusM},${lat},${lng});
    );
    out center 10;
  `;
  const resp = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: query,
    headers: { "Content-Type": "text/plain" },
    signal: AbortSignal.timeout(12000),
  });
  if (!resp.ok) throw new Error("Overpass API error");
  const data = await resp.json() as { elements: any[] };

  return data.elements.slice(0, 8).map((el: any) => {
    const elLat = el.lat ?? el.center?.lat ?? lat;
    const elLng = el.lon ?? el.center?.lon ?? lng;
    const amenity = el.tags?.amenity ?? "police";
    const type: Authority["type"] =
      amenity === "hospital"      ? "hospital" :
      amenity === "fire_station"  ? "fire"     : "police";
    const dist = haversineM(lat, lng, elLat, elLng);

    return {
      id: String(el.id),
      name: el.tags?.name || el.tags?.["name:en"] || (type === "hospital" ? "Hospital" : type === "fire" ? "Fire Station" : "Police Station"),
      type,
      phone: el.tags?.phone || el.tags?.["contact:phone"] || (type === "police" ? "100" : "108"),
      lat: elLat,
      lng: elLng,
      source: "osm" as const,
      distanceM: Math.round(dist),
      eta: etaLabel(dist),
      osmTags: el.tags,
    };
  }).sort((a: Authority, b: Authority) => a.distanceM - b.distanceM);
}

// ── Type metadata ─────────────────────────────────────────────────────────
const TYPE_META: Record<Authority["type"], { icon: React.ElementType; color: string; bg: string; border: string; label: string }> = {
  police:  { icon: Shield,     color: "text-blue-400",   bg: "glass-blue",  border: "border-blue-500/25",   label: "Police"     },
  hospital:{ icon: Activity,   color: "text-red-400",    bg: "glass-red",   border: "border-red-500/25",    label: "Hospital"   },
  fire:    { icon: Siren,      color: "text-orange-400", bg: "glass-amber", border: "border-orange-500/25", label: "Fire"       },
  safety:  { icon: Shield,     color: "text-purple-400", bg: "bg-purple-500/10 border border-purple-500/22", border: "border-purple-500/25", label: "Safety" },
  disaster:{ icon: AlertCircle,color: "text-amber-400",  bg: "glass-amber", border: "border-amber-500/25",  label: "Disaster"   },
};

// ── Hardcoded User Location: Microsoft Sovereign Office, Noida ─────────────
const MICROSOFT_SOVEREIGN_OFFICE = {
  name: "Microsoft Sovereign Office, Noida",
  address: "KP Towers, Sector 16B, Noida, UP 201301",
  lat: 28.5740,
  lng: 77.3112,
};

type FilterType = "all" | Authority["type"];

export function NearestAuthorityLookup() {
  const [results,       setResults]       = useState<Authority[]>([]);
  const [loading,       setLoading]       = useState(false);
  const [source,        setSource]        = useState<"none" | "haversine" | "osm">("none");
  const [error,         setError]         = useState<string | null>(null);
  const [userLoc,       setUserLoc]       = useState<{ lat: number; lng: number }>(MICROSOFT_SOVEREIGN_OFFICE);
  const [filter,        setFilter]        = useState<FilterType>("all");
  const [callingId,     setCallingId]     = useState<string | null>(null);
  const [showQuery,     setShowQuery]     = useState(false);

  const lookupWithHaversine = useCallback((lat: number, lng: number) => {
    const sorted = LOCAL_DIRECTORY
      .map(a => ({
        ...a,
        distanceM: Math.round(haversineM(lat, lng, a.lat, a.lng)),
        eta: etaLabel(haversineM(lat, lng, a.lat, a.lng)),
      }))
      .sort((a, b) => a.distanceM - b.distanceM);
    setResults(sorted);
    setSource("haversine");
    setError(null);
  }, []);

  // Pre-load nearest authorities on mount for Microsoft Sovereign Office
  useEffect(() => {
    lookupWithHaversine(MICROSOFT_SOVEREIGN_OFFICE.lat, MICROSOFT_SOVEREIGN_OFFICE.lng);
  }, [lookupWithHaversine]);

  const handleLookup = useCallback(async (forceHaversine = false) => {
    setLoading(true);
    setError(null);
    setResults([]);

    const { lat, lng } = MICROSOFT_SOVEREIGN_OFFICE;
    setUserLoc({ lat, lng });

    if (forceHaversine) {
      lookupWithHaversine(lat, lng);
      setLoading(false);
      return;
    }

    try {
      const osmResults = await fetchOverpass(lat, lng);
      if (osmResults.length > 0) {
        setResults(osmResults);
        setSource("osm");
      } else {
        lookupWithHaversine(lat, lng);
      }
    } catch {
      lookupWithHaversine(lat, lng);
    }
    setLoading(false);
  }, [lookupWithHaversine]);

  const simulateCall = (id: string) => {
    setCallingId(id);
    setTimeout(() => setCallingId(null), 3000);
  };

  const filtered = filter === "all" ? results : results.filter(r => r.type === filter);
  const filterTypes: FilterType[] = ["all", "police", "hospital", "fire", "safety"];

  return (
    <section className="glass-card p-5 space-y-4" aria-label="Nearest authority lookup">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl glass-amber shadow-[0_0_16px_rgba(245,158,11,0.2)]">
            <Phone className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white/88">Nearest Authority Lookup</h2>
            <p className="text-[11px] text-white/38 mt-0.5">Overpass API (OSM) · Haversine fallback · Local India directory</p>
          </div>
        </div>

        <button
          onClick={() => setShowQuery(s => !s)}
          className="shrink-0 text-[10px] font-bold text-white/30 hover:text-white/55 transition-colors"
        >
          {showQuery ? "Hide" : "View"} query
        </button>
      </div>

      {/* Strategy selector */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={() => handleLookup(false)}
          disabled={loading}
          className="btn-press flex items-center gap-2.5 rounded-xl bg-amber-500/12 border border-amber-500/28 px-4 py-3 text-xs font-bold text-amber-300 hover:bg-amber-500/22 transition-all duration-200 disabled:opacity-50"
        >
          {loading && source !== "haversine" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <ExternalLink className="h-3.5 w-3.5" />
          )}
          <div className="text-left">
            <p>Option A — Overpass API</p>
            <p className="text-[9px] text-amber-400/50 font-medium mt-0.5">OpenStreetMap · live OSM data</p>
          </div>
        </button>

        <button
          onClick={() => handleLookup(true)}
          disabled={loading}
          className="btn-press flex items-center gap-2.5 rounded-xl bg-blue-500/12 border border-blue-500/28 px-4 py-3 text-xs font-bold text-blue-300 hover:bg-blue-500/22 transition-all duration-200 disabled:opacity-50"
        >
          {loading && source === "haversine" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Navigation2 className="h-3.5 w-3.5" />
          )}
          <div className="text-left">
            <p>Option B — Haversine + JSON</p>
            <p className="text-[9px] text-blue-400/50 font-medium mt-0.5">Local directory · no API needed</p>
          </div>
        </button>
      </div>

      {/* Overpass query preview */}
      {showQuery && (
        <div className="rounded-xl bg-black/40 border border-white/[0.07] p-4 animate-fade-in">
          <p className="id-label text-[9px] text-white/28 mb-2 uppercase tracking-widest">Overpass API Query — 2 km radius</p>
          <pre className="text-[10.5px] text-green-300/80 font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap">{`[out:json][timeout:15];
(
  node["amenity"="police"](around:2000,LAT,LNG);
  node["amenity"="hospital"](around:2000,LAT,LNG);
  node["amenity"="fire_station"](around:2000,LAT,LNG);
  way["amenity"="police"](around:2000,LAT,LNG);
  way["amenity"="hospital"](around:2000,LAT,LNG);
);
out center 10;`}</pre>
          <div className="mt-3 flex items-center gap-3 text-[10px] text-white/30">
            <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-400" />No API key needed</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-400" />Free tier OSM</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-400" />Real-time data</span>
          </div>
        </div>
      )}

      {/* Status line: Hardcoded location banner */}
      <div className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs border bg-cyan-500/10 border-cyan-500/30 text-cyan-300">
        <MapPin className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
        <span className="truncate">
          Location: <strong className="text-white">Microsoft Sovereign Office, Noida</strong> ({userLoc.lat.toFixed(4)}°N, {userLoc.lng.toFixed(4)}°E · Sector 16B)
        </span>
        {source !== "none" && (
          <span className="ml-auto id-label text-[9px] uppercase text-cyan-400 shrink-0 font-bold">
            {source === "osm" ? "via OSM Live" : "via Haversine"}
          </span>
        )}
      </div>

      {/* Filter tabs */}
      {results.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {filterTypes.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "h-6 px-2.5 rounded-lg text-[10px] font-bold capitalize transition-all duration-150",
                filter === f
                  ? "bg-amber-500/20 border border-amber-500/35 text-amber-400"
                  : "bg-white/[0.04] border border-white/[0.07] text-white/35 hover:text-white/55"
              )}
            >
              {f === "all" ? `All (${results.length})` : f}
            </button>
          ))}
          <button
            onClick={() => handleLookup(source === "haversine")}
            className="ml-auto flex items-center gap-1 text-[10px] text-white/28 hover:text-white/50 transition-colors"
          >
            <RefreshCw className="h-3 w-3" /> Refresh
          </button>
        </div>
      )}

      {/* Results list */}
      {filtered.length > 0 && (
        <div className="space-y-2">
          {filtered.map((auth, idx) => {
            const meta = TYPE_META[auth.type];
            const Icon = meta.icon;
            const isCalling = callingId === auth.id;

            return (
              <div
                key={auth.id}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-3.5 transition-all duration-200 animate-fade-in",
                  "bg-white/[0.025] border-white/[0.07] hover:bg-white/[0.05] hover:border-white/[0.12]"
                )}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {/* Type icon */}
                <div className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                  meta.bg
                )}>
                  <Icon className={cn("h-4 w-4", meta.color)} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-[12px] font-bold text-white/82 truncate">{auth.name}</p>
                    {idx === 0 && (
                      <span className="shrink-0 text-[8px] font-black text-green-400 bg-green-500/12 border border-green-500/22 rounded px-1.5 py-0.5 uppercase">
                        Nearest
                      </span>
                    )}
                    {auth.source === "osm" && (
                      <span className="shrink-0 text-[8px] font-black text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded px-1 py-0.5 uppercase">
                        OSM
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2.5 text-[10px] text-white/35">
                    <span className="font-mono font-bold text-amber-400/70">{auth.phone}</span>
                    <span className="text-white/18">·</span>
                    {auth.distanceM < 1000
                      ? <span>{auth.distanceM} m away</span>
                      : <span>{(auth.distanceM / 1000).toFixed(1)} km away</span>
                    }
                    <span className="text-white/18">·</span>
                    <span className="flex items-center gap-0.5">
                      <Navigation2 className="h-2.5 w-2.5" /> {auth.eta}
                    </span>
                  </div>
                </div>

                {/* Call button */}
                <a
                  href={`tel:${auth.phone}`}
                  onClick={(e) => { e.preventDefault(); simulateCall(auth.id); }}
                  className={cn(
                    "btn-press shrink-0 flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all duration-200",
                    isCalling
                      ? "bg-green-500/20 border border-green-500/35 text-green-300"
                      : "bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25"
                  )}
                >
                  {isCalling ? (
                    <><Activity className="h-3.5 w-3.5 animate-pulse" /> Calling…</>
                  ) : (
                    <><Phone className="h-3.5 w-3.5" /> Call</>
                  )}
                </a>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!loading && results.length === 0 && source === "none" && (
        <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.035] border border-white/[0.07]">
            <MapPin className="h-6 w-6 text-white/18" />
          </div>
          <div>
            <p className="text-sm font-bold text-white/40">Choose a lookup strategy above</p>
            <p className="text-[11px] text-white/25 mt-1">GPS location will be requested to find nearest authorities</p>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center gap-3 py-8">
          <Loader2 className="h-5 w-5 text-amber-400 animate-spin" />
          <p className="text-sm text-white/45">
            {source === "haversine" ? "Calculating Haversine distances…" : "Querying Overpass API…"}
          </p>
        </div>
      )}
    </section>
  );
}
