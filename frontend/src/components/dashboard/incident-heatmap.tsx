"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  AlertTriangle, Layers, ZoomIn, ZoomOut, Navigation2, Radio,
  Crosshair, Shield, Activity, Phone, X,
  Building2, Sparkles, MapPin, PhoneCall, Zap, ShieldAlert,
  Maximize2, Minimize2, Eye, Siren, Truck
} from "lucide-react";
import { useIncidents } from "@/hooks/use-incidents";
import { cn } from "@/lib/utils";

// ── Hardcoded User Location: Microsoft Sovereign Office, Noida ──────────────
const MICROSOFT_SOVEREIGN_OFFICE_NOIDA: [number, number] = [77.3112, 28.5740];
const NOIDA_DEFAULT: [number, number] = MICROSOFT_SOVEREIGN_OFFICE_NOIDA;

// ── High-Resolution Satellite Hybrid Map Style ────────────────────────────────
const SATELLITE_HYBRID_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    "esri-satellite": {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      ],
      tileSize: 256,
      attribution: "© Esri, Maxar, Earthstar Geographics",
      maxzoom: 19,
    },
    "esri-roads": {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}"
      ],
      tileSize: 256,
      maxzoom: 19,
    },
    "esri-labels": {
      type: "raster",
      tiles: [
        "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
      ],
      tileSize: 256,
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: "esri-satellite-layer",
      type: "raster",
      source: "esri-satellite",
      minzoom: 0,
      maxzoom: 19,
      paint: {
        "raster-saturation": 0.1,
        "raster-contrast": 0.05,
      },
    },
    {
      id: "esri-roads-layer",
      type: "raster",
      source: "esri-roads",
      minzoom: 0,
      maxzoom: 19,
      paint: {
        "raster-opacity": 0.85,
      },
    },
    {
      id: "esri-labels-layer",
      type: "raster",
      source: "esri-labels",
      minzoom: 0,
      maxzoom: 19,
      paint: {
        "raster-opacity": 0.95,
      },
    },
  ],
};

const DARK_TACTICAL_STYLE = "https://tiles.openfreemap.org/styles/dark";

// ── 14 Realistic Baseline Incidents Around Noida ─────────────────────────────
const BASELINE_INCIDENTS = [
  {
    id: "DI-001",
    lng: 77.3112, lat: 28.5740,
    severity: "critical" as const,
    title: "Chemical Spill — Basement Laboratory B2",
    zone: "Microsoft KP Towers, Sector 16B",
    workers: 24,
    time: "2 min ago",
    hazard: "Toxic Fumes / Acid Contamination",
  },
  {
    id: "DI-002",
    lng: 77.3092, lat: 28.5762,
    severity: "high" as const,
    title: "Electrical Fire — Primary Data Center",
    zone: "Delhi One Commercial Complex",
    workers: 12,
    time: "8 min ago",
    hazard: "Class C Electrical Arc",
  },
  {
    id: "DI-003",
    lng: 77.3135, lat: 28.5718,
    severity: "moderate" as const,
    title: "Worker Fall — Floor 7 Construction",
    zone: "Sector 16B Commercial Tower",
    workers: 3,
    time: "15 min ago",
    hazard: "Structural Fall Trauma",
  },
  {
    id: "DI-004",
    lng: 77.3075, lat: 28.5725,
    severity: "high" as const,
    title: "LPG Pipeline Leak — Cafeteria Block",
    zone: "Amity Campus Western Perimeter",
    workers: 47,
    time: "22 min ago",
    hazard: "Explosive Vapor Dispersion",
  },
  {
    id: "DI-005",
    lng: 77.3155, lat: 28.5760,
    severity: "moderate" as const,
    title: "Crowd Surge & Panic — Lobby Turnstile",
    zone: "Logix Technopark, Sector 16",
    workers: 8,
    time: "31 min ago",
    hazard: "Stampede Risk",
  },
  {
    id: "DI-006",
    lng: 77.3050, lat: 28.5748,
    severity: "critical" as const,
    title: "Multi-Vehicle Pileup & Tanker Rollover",
    zone: "DND Flyway Slip Road Intersection",
    workers: 14,
    time: "4 min ago",
    hazard: "Highway Obstruction / Flammable Cargo",
  },
  {
    id: "DI-007",
    lng: 77.3122, lat: 28.5695,
    severity: "critical" as const,
    title: "Warehouse Structural Fire & Collapse",
    zone: "Film City Compound, Sector 16A",
    workers: 31,
    time: "1 min ago",
    hazard: "Active Inferno / Roof Failure",
  },
  {
    id: "DI-008",
    lng: 77.3098, lat: 28.5780,
    severity: "low" as const,
    title: "Suspicious Metallic Package Left",
    zone: "Sector 16A Metro Station Plaza",
    workers: 0,
    time: "1 hr ago",
    hazard: "Bomb Squad Cordon Ordered",
  },
  {
    id: "DI-009",
    lng: 77.3168, lat: 28.5710,
    severity: "high" as const,
    title: "Tower Crane Hydraulic Mast Failure",
    zone: "Wave One Construction, Sec 18",
    workers: 6,
    time: "19 min ago",
    hazard: "High-Altitude Collapse Risk",
  },
  {
    id: "DI-010",
    lng: 77.3032, lat: 28.5770,
    severity: "moderate" as const,
    title: "Flash Underpass Waterlogging — 3 Buses Trapped",
    zone: "Sector 15A Expressway Underpass",
    workers: 28,
    time: "40 min ago",
    hazard: "Submersion / Electrical Stall",
  },
  {
    id: "DI-011",
    lng: 77.3180, lat: 28.5742,
    severity: "high" as const,
    title: "Substation 33kV Step-Down Arc Flash",
    zone: "Sector 18 Power Station",
    workers: 4,
    time: "12 min ago",
    hazard: "Thermal Radiation / High Voltage",
  },
  {
    id: "DI-012",
    lng: 77.3105, lat: 28.5752,
    severity: "critical" as const,
    title: "Acute Cardiac Arrest & Collapse on Platform",
    zone: "Sector 16 Metro Station Concourse",
    workers: 1,
    time: "Just now",
    hazard: "Critical Medical Life Threat",
  },
  {
    id: "DI-013",
    lng: 77.3142, lat: 28.5680,
    severity: "high" as const,
    title: "Ammonia Refrigeration Line Rupture",
    zone: "Cold Storage Facility, Sector 16",
    workers: 19,
    time: "27 min ago",
    hazard: "Irritant Inhalation Risk",
  },
  {
    id: "DI-014",
    lng: 77.3020, lat: 28.5730,
    severity: "low" as const,
    title: "Perimeter Chain-Link Breach Detected",
    zone: "Yamuna Embankment Marginal Bund",
    workers: 0,
    time: "55 min ago",
    hazard: "Patrol Dispatched",
  },
];

// ── Geodesic Circle Generator for Smooth Circular Hazard Zones ──────────────
function createGeoCircle(
  centerLng: number,
  centerLat: number,
  radiusMeters: number,
  points: number = 64
): [number, number][] {
  const coords: [number, number][] = [];
  const km = radiusMeters / 1000;
  const R = 6371; // Earth radius in km
  const latRad = (centerLat * Math.PI) / 180;
  const lngRad = (centerLng * Math.PI) / 180;
  const dByR = km / R;

  for (let i = 0; i <= points; i++) {
    const bearing = (i * 2 * Math.PI) / points;
    const pLat = Math.asin(
      Math.sin(latRad) * Math.cos(dByR) +
      Math.cos(latRad) * Math.sin(dByR) * Math.cos(bearing)
    );
    const pLng = lngRad + Math.atan2(
      Math.sin(bearing) * Math.sin(dByR) * Math.cos(latRad),
      Math.cos(dByR) - Math.sin(latRad) * Math.sin(pLat)
    );
    coords.push([
      Number(((pLng * 180) / Math.PI).toFixed(6)),
      Number(((pLat * 180) / Math.PI).toFixed(6)),
    ]);
  }
  return coords;
}

// ── 5 Circular Hazard Zones & Safety Perimeters ─────────────────────────────
const HAZARD_ZONES_GEOJSON: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: [
    // 1. Purple Circle: Women's Safety Alert Zone (Circular unlit road perimeter)
    {
      type: "Feature",
      id: "zone-women-safety",
      properties: {
        id: "zone-women-safety",
        name: "Women's Safety Alert Zone",
        type: "women_safety",
        level: "purple",
        reason: "3 reports of broken streetlights & no CCTV coverage",
        location: "Sector 16B Unlit Service Corridor",
        fillColor: "#c026d3",
        lineColor: "#e879f9",
        radiusM: 250,
        timeActive: "Active After 20:00 (Night Protocol)",
      },
      geometry: {
        type: "Polygon",
        coordinates: [createGeoCircle(77.3085, 28.5714, 250)],
      },
    },
    // 2. Orange Circle: Structural Hazard Zone (Circular flyover pillar perimeter)
    {
      type: "Feature",
      id: "zone-structural-hazard",
      properties: {
        id: "zone-structural-hazard",
        name: "Structural Hazard Zone",
        type: "structural_hazard",
        level: "orange",
        reason: "AI-verified pillar spalling reported — PWD notified",
        location: "Sector 16 Elevated Flyover & Pillar #4",
        fillColor: "#ea580c",
        lineColor: "#fb923c",
        radiusM: 220,
        timeActive: "Active PWD Structural Inspection Order",
      },
      geometry: {
        type: "Polygon",
        coordinates: [createGeoCircle(77.3148, 28.5764, 220)],
      },
    },
    // 3. Red Circle: Chemical Plume Dispersion Zone (Circular dispersion buffer)
    {
      type: "Feature",
      id: "zone-chemical-plume",
      properties: {
        id: "zone-chemical-plume",
        name: "Chemical Plume Hazard Zone",
        type: "chemical_plume",
        level: "red",
        reason: "Anhydrous ammonia tank micro-fracture — 260m perimeter cordon active",
        location: "Sector 10 Industrial Storage Buffer",
        fillColor: "#dc2626",
        lineColor: "#f87171",
        radiusM: 260,
        timeActive: "HazMat Level-2 Containment in Effect",
      },
      geometry: {
        type: "Polygon",
        coordinates: [createGeoCircle(77.3195, 28.5718, 260)],
      },
    },
    // 4. Yellow Circle: High-Voltage Grid Risk (Circular substation flashover buffer)
    {
      type: "Feature",
      id: "zone-substation-arc",
      properties: {
        id: "zone-substation-arc",
        name: "High-Voltage Flashover Risk Zone",
        type: "high_voltage",
        level: "yellow",
        reason: "Grid step-down transformer overheating during peak load — Fire tender on standby",
        location: "Sector 18 Electrical Substation Grid",
        fillColor: "#eab308",
        lineColor: "#fde047",
        radiusM: 190,
        timeActive: "Cooling Protocol Active",
      },
      geometry: {
        type: "Polygon",
        coordinates: [createGeoCircle(77.3202, 28.5752, 190)],
      },
    },
    // 5. Green Circle: Designated Safe Assembly & Triage Zone (Circular triage shelter)
    {
      type: "Feature",
      id: "zone-safe-assembly",
      properties: {
        id: "zone-safe-assembly",
        name: "Designated Safe Triage & Assembly Zone",
        type: "safe_zone",
        level: "green",
        reason: "Primary Level-1 Triage, First-Aid Station & Medical Evac Helipad",
        location: "KP Towers Central Courtyard & Plaza",
        fillColor: "#10b981",
        lineColor: "#34d399",
        radiusM: 130,
        timeActive: "24/7 Verified Emergency Shelter",
      },
      geometry: {
        type: "Polygon",
        coordinates: [createGeoCircle(77.3112, 28.5740, 130)],
      },
    },
  ],
};

// ── Live Responding Emergency Units on Satellite Map ────────────────────────
const LIVE_RESPONDING_UNITS = [
  {
    id: "UNIT-AMB-108",
    name: "Ambulance Unit Alpha (EMS-108)",
    type: "ambulance" as const,
    lng: 77.3102, lat: 28.5732,
    eta: "3 min",
    speed: "42 km/h",
    status: "Responding to Chemical Spill (KP Towers)",
    phone: "108",
  },
  {
    id: "UNIT-FIRE-02",
    name: "Heavy Foam Tender Squad-02",
    type: "fire_tender" as const,
    lng: 77.3140, lat: 28.5720,
    eta: "5 min",
    speed: "35 km/h",
    status: "Dispatched to Warehouse Fire",
    phone: "101",
  },
  {
    id: "UNIT-PCR-09",
    name: "Police PCR Patrol-09 (Noida)",
    type: "police_patrol" as const,
    lng: 77.3085, lat: 28.5750,
    eta: "On Scene",
    speed: "25 km/h",
    status: "Patrolling Women's Safety Corridor",
    phone: "100",
  },
];

const SEV_COLOR: Record<string, string> = {
  critical: "#ef4444",
  high:     "#f97316",
  moderate: "#f59e0b",
  low:      "#22c55e",
};

export interface AuthorityFacility {
  id: string;
  name: string;
  type: "police" | "hospital";
  lat: number;
  lng: number;
  phone: string;
  address?: string;
  emergency?: string;
  distanceM?: number;
  source: "osm" | "directory";
}

export interface HazardZoneInfo {
  id: string;
  name: string;
  type: string;
  level: string;
  reason: string;
  location: string;
  timeActive: string;
  color: string;
  radiusM?: number;
}

type Incident = typeof BASELINE_INCIDENTS[number];

export function IncidentHeatmap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<maplibregl.Map | null>(null);
  const incidentMarkersRef  = useRef<maplibregl.Marker[]>([]);
  const authorityMarkersRef = useRef<maplibregl.Marker[]>([]);
  const unitsMarkersRef     = useRef<maplibregl.Marker[]>([]);
  const userMarkerRef       = useRef<maplibregl.Marker | null>(null);

  const [mapLoaded,    setMapLoaded]    = useState(false);
  const [mapError,     setMapError]     = useState(false);
  const [styleMode,    setStyleMode]    = useState<"satellite" | "dark">("satellite");
  const [is3D,         setIs3D]         = useState(false); // Default to 2D Top-Down orientation
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showIncidents, setShowIncidents] = useState(true);
  const [showPolice,   setShowPolice]   = useState(true);
  const [showHospitals, setShowHospitals] = useState(true);
  const [showZones,    setShowZones]    = useState(true);
  const [showUnits,    setShowUnits]    = useState(true);

  // Selected item overlays
  const [selectedInc,  setSelectedInc]  = useState<Incident | null>(null);
  const [selectedAuth, setSelectedAuth] = useState<AuthorityFacility | null>(null);
  const [selectedZone, setSelectedZone] = useState<HazardZoneInfo | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<typeof LIVE_RESPONDING_UNITS[0] | null>(null);
  const [showUserOverlay, setShowUserOverlay] = useState(false);

  // Live Stage Demo Pin & OmniDimension Call
  const [liveStageIncident, setLiveStageIncident] = useState<{
    id: string;
    title: string;
    lng: number;
    lat: number;
    confidence: number;
    time: string;
    isCalling: boolean;
  } | null>(null);

  // Overpass dynamic facilities
  const [facilities,   setFacilities]   = useState<AuthorityFacility[]>([]);
  const [loadingOverpass, setLoadingOverpass] = useState(false);
  const [overpassSource, setOverpassSource] = useState<string>("loading");

  // User location & coordinates telemetry (Hardcoded: Microsoft Sovereign Office, Noida)
  const [currentCenter, setCurrentCenter] = useState<[number, number]>(MICROSOFT_SOVEREIGN_OFFICE_NOIDA);
  const [userLocation,  setUserLocation]  = useState<[number, number]>(MICROSOFT_SOVEREIGN_OFFICE_NOIDA);
  const [locatingUser,  setLocatingUser]  = useState(false);
  const [callActive,    setCallActive]    = useState<string | null>(null);
  const [telemetryZoom, setTelemetryZoom] = useState("15.0");
  const [cursorCoords,  setCursorCoords]  = useState<{ lat: string; lng: string }>({
    lat: "28.5740° N",
    lng: "77.3112° E",
  });

  const { incidents: userIncidents } = useIncidents();

  const allIncidents: Incident[] = [
    ...(liveStageIncident ? [{
      id: liveStageIncident.id,
      lng: liveStageIncident.lng,
      lat: liveStageIncident.lat,
      severity: "critical" as const,
      title: liveStageIncident.title,
      zone: "Stage Demo Incident Location",
      workers: 24,
      time: "Just now (Stage Upload)",
      hazard: "Active Multi-Impact Fire",
    }] : []),
    ...BASELINE_INCIDENTS,
    ...userIncidents
      .filter(i => i.status !== "resolved")
      .map(i => ({
        id:       i.id,
        lng:      currentCenter[0] + (Math.random() - 0.5) * 0.015,
        lat:      currentCenter[1] + (Math.random() - 0.5) * 0.012,
        severity: i.severity,
        title:    i.title,
        zone:     i.location || "Noida NCR",
        workers:  i.workersAtRisk ?? 0,
        time:     "Just now",
        hazard:   "User Reported via Web SOS",
      })),
  ];

  // ── Fetch Overpass Police & Hospitals ─────────────────────────────────────
  const fetchNearbyAuthorities = useCallback(async (lat: number, lng: number) => {
    setLoadingOverpass(true);
    try {
      const res = await fetch(`/api/overpass?lat=${lat}&lng=${lng}&radius=3500`);
      if (res.ok) {
        const data = await res.json();
        if (data.facilities && Array.isArray(data.facilities)) {
          setFacilities(data.facilities);
          setOverpassSource(data.source === "osm_overpass" ? "Overpass OSM Live" : "Verified Noida Directory");
        }
      }
    } catch {
      // Graceful fallback
    } finally {
      setLoadingOverpass(false);
    }
  }, []);

  useEffect(() => {
    fetchNearbyAuthorities(NOIDA_DEFAULT[1], NOIDA_DEFAULT[0]);
  }, [fetchNearbyAuthorities]);

  // ── Setup Hazard Polygon Zones ────────────────────────────────────────────
  const setupHazardZones = useCallback((map: maplibregl.Map) => {
    if (map.getSource("hazard-zones")) {
      (map.getSource("hazard-zones") as maplibregl.GeoJSONSource).setData(HAZARD_ZONES_GEOJSON);
      return;
    }

    map.addSource("hazard-zones", {
      type: "geojson",
      data: HAZARD_ZONES_GEOJSON,
    });

    map.addLayer({
      id: "hazard-zones-fill",
      type: "fill",
      source: "hazard-zones",
      paint: {
        "fill-color": ["get", "fillColor"],
        "fill-opacity": showZones ? 0.38 : 0,
      },
    });

    map.addLayer({
      id: "hazard-zones-line",
      type: "line",
      source: "hazard-zones",
      paint: {
        "line-color": ["get", "lineColor"],
        "line-width": 3,
        "line-dasharray": [3, 1.5],
        "line-opacity": showZones ? 1.0 : 0,
      },
    });

    map.on("click", "hazard-zones-fill", (e) => {
      const feat = e.features?.[0];
      if (feat && feat.properties) {
        setSelectedZone({
          id: feat.properties.id,
          name: feat.properties.name,
          type: feat.properties.type,
          level: feat.properties.level,
          reason: feat.properties.reason,
          location: feat.properties.location,
          timeActive: feat.properties.timeActive,
          color: feat.properties.lineColor,
          radiusM: feat.properties.radiusM,
        });
        setSelectedInc(null);
        setSelectedAuth(null);
        setSelectedUnit(null);
        setShowUserOverlay(false);
      }
    });

    map.on("mouseenter", "hazard-zones-fill", () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", "hazard-zones-fill", () => {
      map.getCanvas().style.cursor = "";
    });
  }, [showZones]);

  // ── Incident Markers ──────────────────────────────────────────────────────
  const renderIncidentMarkers = useCallback((map: maplibregl.Map) => {
    incidentMarkersRef.current.forEach(m => m.remove());
    incidentMarkersRef.current = [];

    if (!showIncidents) return;

    allIncidents.forEach(inc => {
      const isStageLive = liveStageIncident && inc.id === liveStageIncident.id;
      const color = isStageLive ? "#ef4444" : (SEV_COLOR[inc.severity] ?? "#f59e0b");
      const isCritical = inc.severity === "critical" || inc.severity === "high" || isStageLive;

      const el = document.createElement("div");
      el.style.cssText = `
        width: 36px !important;
        height: 36px !important;
        min-width: 36px !important;
        max-width: 36px !important;
        position: relative !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        cursor: pointer !important;
      `;

      el.innerHTML = `
        <div style="
          width: 32px; height: 32px;
          border-radius: 50%;
          background: ${isStageLive ? "#7f1d1d" : "#0f172a"};
          border: 2.5px solid ${color};
          box-shadow: 0 0 16px ${color}, 0 2px 8px rgba(0,0,0,0.9);
          display: flex; align-items: center; justify-content: center;
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          ${isCritical ? "animation: markerPulse 1.5s ease-in-out infinite;" : ""}
        ">
          <div style="width: 10px; height: 10px; border-radius: 50%; background: ${color}; box-shadow: 0 0 10px ${color};"></div>
        </div>
        ${isCritical ? `
          <div style="
            position: absolute;
            width: 54px; height: 54px;
            border-radius: 50%;
            border: 2px solid ${color};
            animation: markerRing 1.5s ease-out infinite;
            pointer-events: none;
          "></div>
        ` : ""}
      `;

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        setSelectedInc(inc);
        setSelectedAuth(null);
        setSelectedZone(null);
        setSelectedUnit(null);
        setShowUserOverlay(false);
        map.flyTo({ center: [inc.lng, inc.lat], zoom: 16, duration: 800, essential: true });
      });

      const marker = new maplibregl.Marker({ element: el, anchor: "center" })
        .setLngLat([inc.lng, inc.lat])
        .addTo(map);

      incidentMarkersRef.current.push(marker);
    });
  }, [allIncidents, showIncidents, liveStageIncident]);

  // ── Police and Hospital Pinpoint Circular Markers (No Stretching) ─────────
  const renderAuthorityMarkers = useCallback((map: maplibregl.Map) => {
    authorityMarkersRef.current.forEach(m => m.remove());
    authorityMarkersRef.current = [];

    facilities.forEach(facility => {
      const isPolice = facility.type === "police";
      if (isPolice && !showPolice) return;
      if (!isPolice && !showHospitals) return;

      const badgeColor = isPolice ? "#38bdf8" : "#34d399";
      const iconSvg = isPolice
        ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`
        : `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>`;

      const tagText = isPolice ? "POLICE" : "HOSPITAL";

      const el = document.createElement("div");
      el.style.cssText = `
        width: 36px !important;
        height: 36px !important;
        min-width: 36px !important;
        max-width: 36px !important;
        position: relative !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        cursor: pointer !important;
      `;

      el.innerHTML = `
        <div style="
          width: 32px; height: 32px;
          border-radius: 50%;
          background: #080d17;
          border: 2px solid ${badgeColor};
          box-shadow: 0 0 16px ${badgeColor}aa, 0 4px 10px rgba(0,0,0,0.9);
          display: flex; align-items: center; justify-content: center;
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        ">
          ${iconSvg}
        </div>
        <div style="
          position: absolute;
          bottom: -15px;
          background: #080d17f5;
          border: 1px solid ${badgeColor}88;
          border-radius: 4px;
          padding: 1px 5px;
          font-size: 8px;
          font-weight: 800;
          font-family: monospace;
          color: ${badgeColor};
          box-shadow: 0 2px 8px rgba(0,0,0,0.8);
          pointer-events: none;
          white-space: nowrap;
        ">
          ${tagText}
        </div>
      `;

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        setSelectedAuth(facility);
        setSelectedInc(null);
        setSelectedZone(null);
        setSelectedUnit(null);
        setShowUserOverlay(false);
        map.flyTo({ center: [facility.lng, facility.lat], zoom: 16.2, duration: 800, essential: true });
      });

      const marker = new maplibregl.Marker({ element: el, anchor: "center" })
        .setLngLat([facility.lng, facility.lat])
        .addTo(map);

      authorityMarkersRef.current.push(marker);
    });
  }, [facilities, showPolice, showHospitals]);

  // ── Render Responding Emergency Units (Ambulances, Patrols, Fire Tenders) ─
  const renderUnitsMarkers = useCallback((map: maplibregl.Map) => {
    unitsMarkersRef.current.forEach(m => m.remove());
    unitsMarkersRef.current = [];

    if (!showUnits) return;

    LIVE_RESPONDING_UNITS.forEach(unit => {
      const color = unit.type === "ambulance" ? "#10b981" : unit.type === "fire_tender" ? "#f97316" : "#3b82f6";
      const iconLabel = unit.type === "ambulance" ? "🚑 AMB-108" : unit.type === "fire_tender" ? "🚒 FIRE-02" : "🚓 PCR-09";

      const el = document.createElement("div");
      el.style.cssText = `
        width: 38px !important;
        height: 38px !important;
        position: relative !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        cursor: pointer !important;
      `;

      el.innerHTML = `
        <div style="
          width: 34px; height: 34px;
          border-radius: 50%;
          background: #080d17;
          border: 2px solid ${color};
          box-shadow: 0 0 18px ${color}, 0 2px 8px rgba(0,0,0,0.8);
          display: flex; align-items: center; justify-content: center;
          font-size: 14px;
          animation: markerPulse 2s ease-in-out infinite;
        ">
          ${unit.type === "ambulance" ? "🚑" : unit.type === "fire_tender" ? "🚒" : "🚓"}
        </div>
        <div style="
          position: absolute;
          bottom: -15px;
          background: #080d17f5;
          border: 1px solid ${color};
          border-radius: 4px;
          padding: 1px 5px;
          font-size: 8px;
          font-weight: 800;
          font-family: monospace;
          color: ${color};
          white-space: nowrap;
          pointer-events: none;
        ">
          ${iconLabel}
        </div>
      `;

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        setSelectedUnit(unit);
        setSelectedInc(null);
        setSelectedAuth(null);
        setSelectedZone(null);
        setShowUserOverlay(false);
        map.flyTo({ center: [unit.lng, unit.lat], zoom: 16.5, duration: 800, essential: true });
      });

      const marker = new maplibregl.Marker({ element: el, anchor: "center" })
        .setLngLat([unit.lng, unit.lat])
        .addTo(map);

      unitsMarkersRef.current.push(marker);
    });
  }, [showUnits]);

  // ── Render Ultra-Visible User Location Beacon (2D Top-Down & 3D Ready) ──
  const renderUserMarker = useCallback((map: maplibregl.Map, coords: [number, number], isGpsTracked: boolean = false) => {
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    const el = document.createElement("div");
    el.style.cssText = `
      width: 44px !important;
      height: 44px !important;
      min-width: 44px !important;
      max-width: 44px !important;
      position: relative !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      cursor: pointer !important;
      z-index: 50 !important;
    `;

    el.innerHTML = `
      <!-- High-Contrast Floating Badge Anchored Above Pin -->
      <div style="
        position: absolute;
        bottom: calc(100% + 14px);
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        flex-direction: column;
        align-items: center;
        pointer-events: auto;
        white-space: nowrap;
        filter: drop-shadow(0 6px 18px rgba(0,0,0,0.95));
      ">
        <div style="
          background: #080d17f5;
          border: 2px solid #06b6d4;
          border-radius: 9999px;
          padding: 4px 11px 4px 9px;
          display: flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 0 24px rgba(6, 182, 212, 0.8), inset 0 0 10px rgba(6, 182, 212, 0.25);
        ">
          <span style="
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #22d3ee;
            box-shadow: 0 0 10px #22d3ee;
            animation: userPulse 1.2s ease-in-out infinite;
          "></span>
          <span style="
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            font-size: 11px;
            font-weight: 900;
            letter-spacing: 0.06em;
            color: #ffffff;
            text-shadow: 0 0 8px rgba(6, 182, 212, 0.9);
          ">YOU ARE HERE</span>
          <span style="
            background: rgba(6, 182, 212, 0.25);
            border: 1px solid rgba(6, 182, 212, 0.6);
            border-radius: 4px;
            padding: 1.5px 6px;
            font-size: 8.5px;
            font-weight: 800;
            color: #67e8f9;
            font-family: monospace;
          ">MICROSOFT SOVEREIGN OFFICE, NOIDA</span>
        </div>
        <div style="
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 7px solid #06b6d4;
          margin-top: -1px;
        "></div>
      </div>

      <!-- Outermost Radar Ripple Wave 1 -->
      <div style="
        position: absolute;
        width: 86px; height: 86px;
        border-radius: 50%;
        border: 2px solid rgba(6, 182, 212, 0.85);
        background: radial-gradient(circle, rgba(6,182,212,0.3) 0%, rgba(6,182,212,0) 70%);
        animation: userRadarWave 2.2s cubic-bezier(0.2, 0.8, 0.2, 1) infinite;
        pointer-events: none;
      "></div>

      <!-- Intermediate Radar Wave 2 (delayed) -->
      <div style="
        position: absolute;
        width: 62px; height: 62px;
        border-radius: 50%;
        border: 1.5px dashed rgba(34, 211, 238, 0.75);
        animation: userRadarWave 2.2s cubic-bezier(0.2, 0.8, 0.2, 1) infinite 0.75s;
        pointer-events: none;
      "></div>

      <!-- Center Aiming Reticle Circle -->
      <div style="
        width: 36px; height: 36px;
        border-radius: 50%;
        border: 2.5px solid #22d3ee;
        box-shadow: 0 0 20px rgba(6, 182, 212, 0.95), 0 3px 12px rgba(0,0,0,0.9);
        background: #080d17;
        display: flex; align-items: center; justify-content: center;
        z-index: 10;
        transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      ">
        <!-- Bright White / Cyan Center Core -->
        <div style="
          width: 14px; height: 14px;
          border-radius: 50%;
          background: #ffffff;
          border: 2.5px solid #06b6d4;
          box-shadow: 0 0 14px #22d3ee, 0 0 28px #06b6d4;
        "></div>
      </div>
    `;

    el.addEventListener("click", (e) => {
      e.stopPropagation();
      setShowUserOverlay(true);
      setSelectedInc(null);
      setSelectedAuth(null);
      setSelectedZone(null);
      setSelectedUnit(null);
      map.flyTo({ center: coords, zoom: 16.5, duration: 800, essential: true });
    });

    const marker = new maplibregl.Marker({ element: el, anchor: "center" })
      .setLngLat(coords)
      .addTo(map);

    userMarkerRef.current = marker;
  }, []);

  // ── Initialize Map (Defaults to 2D Top-Down View) ─────────────────────────
  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return;

    try {
      const map = new maplibregl.Map({
        container: mapContainer.current,
        style: SATELLITE_HYBRID_STYLE,
        center: NOIDA_DEFAULT,
        zoom: 15.2,
        pitch: 0,       // 2D Overhead Top-Down by default
        bearing: 0,     // Strictly North-Up orientation by default
        antialias: true,
        attributionControl: false,
      });

      map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");

      map.on("load", () => {
        setMapLoaded(true);
        setupHazardZones(map);
        renderIncidentMarkers(map);
        renderAuthorityMarkers(map);
        renderUnitsMarkers(map);
        renderUserMarker(map, NOIDA_DEFAULT, false);
      });

      map.on("mousemove", (e) => {
        setCursorCoords({
          lat: `${e.lngLat.lat.toFixed(4)}° N`,
          lng: `${e.lngLat.lng.toFixed(4)}° E`,
        });
      });

      map.on("zoom", () => {
        setTelemetryZoom(map.getZoom().toFixed(1));
      });

      map.on("error", () => setMapError(true));

      mapRef.current = map;
    } catch {
      setMapError(true);
    }

    return () => {
      incidentMarkersRef.current.forEach(m => m.remove());
      authorityMarkersRef.current.forEach(m => m.remove());
      unitsMarkersRef.current.forEach(m => m.remove());
      userMarkerRef.current?.remove();
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync markers when data changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;
    renderIncidentMarkers(map);
  }, [renderIncidentMarkers, mapLoaded]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;
    renderAuthorityMarkers(map);
  }, [renderAuthorityMarkers, mapLoaded]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;
    renderUnitsMarkers(map);
  }, [renderUnitsMarkers, mapLoaded]);

  // Sync hazard zones visibility
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;
    if (map.getLayer("hazard-zones-fill")) {
      map.setPaintProperty("hazard-zones-fill", "fill-opacity", showZones ? 0.38 : 0);
    }
    if (map.getLayer("hazard-zones-line")) {
      map.setPaintProperty("hazard-zones-line", "line-opacity", showZones ? 1.0 : 0);
    }
  }, [showZones, mapLoaded]);

  // ── Stage Demo: Trigger Live Photo Upload & OmniDimension Call ────────────
  const triggerLiveStageDemo = () => {
    const targetLng = userLocation ? userLocation[0] : (NOIDA_DEFAULT[0] + 0.0018);
    const targetLat = userLocation ? userLocation[1] : (NOIDA_DEFAULT[1] + 0.0012);

    const liveData = {
      id: "LIVE-STAGE-01",
      title: "Live Incident: Multi-Vehicle Impact & Fire",
      lng: targetLng,
      lat: targetLat,
      confidence: 99,
      time: "Just now (Stage Upload)",
      isCalling: true,
      hazard: "Active Flammable Hazard",
    };

    setLiveStageIncident(liveData);

    const map = mapRef.current;
    if (map) {
      map.flyTo({
        center: [targetLng, targetLat],
        zoom: 16.5,
        pitch: 50,
        bearing: -10,
        duration: 1200,
        essential: true,
      });
    }
  };

  // ── Track User Location (Hardcoded: Microsoft Sovereign Office, Noida) ────
  const trackMyLocation = () => {
    setLocatingUser(true);
    setTimeout(() => {
      setUserLocation(MICROSOFT_SOVEREIGN_OFFICE_NOIDA);
      setCurrentCenter(MICROSOFT_SOVEREIGN_OFFICE_NOIDA);
      setLocatingUser(false);

      const map = mapRef.current;
      if (map) {
        renderUserMarker(map, MICROSOFT_SOVEREIGN_OFFICE_NOIDA, true);
        map.flyTo({
          center: MICROSOFT_SOVEREIGN_OFFICE_NOIDA,
          zoom: 16.5,
          pitch: is3D ? 45 : 0,
          bearing: is3D ? -15 : 0,
          duration: 1000,
          essential: true,
        });
      }

      fetchNearbyAuthorities(MICROSOFT_SOVEREIGN_OFFICE_NOIDA[1], MICROSOFT_SOVEREIGN_OFFICE_NOIDA[0]);
    }, 400);
  };

  const resetToNoida = () => {
    setCurrentCenter(MICROSOFT_SOVEREIGN_OFFICE_NOIDA);
    setUserLocation(MICROSOFT_SOVEREIGN_OFFICE_NOIDA);
    const map = mapRef.current;
    if (map) {
      renderUserMarker(map, MICROSOFT_SOVEREIGN_OFFICE_NOIDA, true);
      map.flyTo({
        center: MICROSOFT_SOVEREIGN_OFFICE_NOIDA,
        zoom: 15.5,
        pitch: is3D ? 45 : 0,
        bearing: is3D ? -15 : 0,
        duration: 1000,
      });
    }
    fetchNearbyAuthorities(MICROSOFT_SOVEREIGN_OFFICE_NOIDA[1], MICROSOFT_SOVEREIGN_OFFICE_NOIDA[0]);
  };

  const toggle3D = () => {
    const map = mapRef.current;
    if (!map) return;
    const nextIs3D = !is3D;
    setIs3D(nextIs3D);
    map.easeTo({
      pitch: nextIs3D ? 45 : 0,
      bearing: nextIs3D ? -15 : 0,
      duration: 600,
    });
  };

  const toggleStyle = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const next = styleMode === "satellite" ? "dark" : "satellite";
    setStyleMode(next);
    setMapLoaded(false);

    if (next === "satellite") {
      map.setStyle(SATELLITE_HYBRID_STYLE);
    } else {
      map.setStyle(DARK_TACTICAL_STYLE);
    }

    map.once("styledata", () => {
      setupHazardZones(map);
      renderIncidentMarkers(map);
      renderAuthorityMarkers(map);
      renderUnitsMarkers(map);
      renderUserMarker(map, userLocation || currentCenter, Boolean(userLocation));
      setMapLoaded(true);
    });
  }, [styleMode, userLocation, currentCenter, setupHazardZones, renderIncidentMarkers, renderAuthorityMarkers, renderUnitsMarkers, renderUserMarker]);

  const simulateCall = (phone: string) => {
    setCallActive(phone);
    setTimeout(() => setCallActive(null), 3000);
  };

  const hospitalCount = facilities.filter(f => f.type === "hospital").length;
  const policeCount   = facilities.filter(f => f.type === "police").length;

  if (mapError) {
    return (
      <div className="flex items-center justify-center h-[650px] bg-black/20 rounded-xl">
        <div className="text-center space-y-2 p-6">
          <AlertTriangle className="h-8 w-8 text-amber-400 mx-auto" />
          <p className="text-sm font-bold text-white/60">Satellite Map unavailable</p>
          <p className="text-xs text-white/30">Check network connection</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "relative rounded-xl overflow-hidden bg-[#080d17] border border-white/[0.12] shadow-2xl transition-all",
      isFullscreen ? "fixed inset-4 z-50 h-[calc(100vh-2rem)]" : "h-[640px] lg:h-[700px]"
    )}>

      {/* ── Keyframes ── */}
      <style>{`
        @keyframes markerPulse {
          0%, 100% { box-shadow: 0 0 16px rgba(239,68,68,0.7), 0 0 6px #ef4444; transform: scale(1); }
          50%       { box-shadow: 0 0 32px rgba(239,68,68,0.95), 0 0 16px #ef4444; transform: scale(1.12); }
        }
        @keyframes markerRing {
          0%   { transform: scale(0.6); opacity: 0.95; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        @keyframes userRadarWave {
          0%   { transform: scale(0.35); opacity: 0.95; }
          50%  { opacity: 0.65; }
          100% { transform: scale(2.3); opacity: 0; }
        }
        @keyframes userPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%      { transform: scale(1.35); opacity: 0.55; }
        }
        .maplibregl-canvas { border-radius: 0.75rem; }
        .maplibregl-ctrl-bottom-right { bottom: 8px !important; right: 8px !important; }
      `}</style>

      {/* ── Map Canvas (Satellite Imagery) ── */}
      <div ref={mapContainer} className="absolute inset-0" />

      {/* ── Loading Overlay ── */}
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#080d17]/90 z-20 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="h-9 w-9 rounded-full border-2 border-cyan-400/30 border-t-cyan-400 animate-spin" />
            <p className="text-xs font-bold text-white/70">Streaming High-Res Satellite Tiles & Street Overlays…</p>
          </div>
        </div>
      )}

      {/* ── Top-Left: Normalized Tactical Command Toolbar ── */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-2 max-w-[calc(100%-120px)] sm:max-w-3xl pointer-events-auto">
        {/* Primary Command Hub Pill */}
        <div className="flex items-center gap-2 rounded-lg bg-slate-950/85 border border-white/10 backdrop-blur-md px-3 h-8 shadow-sm">
          <Radio className="h-3.5 w-3.5 text-amber-400 shrink-0 animate-pulse" />
          <span className="text-xs font-semibold text-white/90 tracking-tight">Tactical Satellite</span>
          <span className="h-3 w-px bg-white/15" />
          <button
            onClick={() => {
              setShowUserOverlay(true);
              mapRef.current?.flyTo({ center: MICROSOFT_SOVEREIGN_OFFICE_NOIDA, zoom: 16.5, duration: 800 });
            }}
            title="Command Base: Microsoft Sovereign Office, Noida"
            className="flex items-center gap-1.5 text-xs text-white/70 hover:text-white transition-colors"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="truncate max-w-[160px] sm:max-w-none">Microsoft Sovereign Office, Noida</span>
          </button>
          <span className="h-3 w-px bg-white/15 hidden sm:inline" />
          <span className="text-[10px] font-mono text-white/40 hidden sm:inline">{overpassSource}</span>
        </div>

        {/* Cohesive Layer Filters */}
        <div className="flex items-center gap-1 rounded-lg bg-slate-950/85 border border-white/10 backdrop-blur-md p-1 h-8 shadow-sm overflow-x-auto">
          {/* Incidents Toggle */}
          <button
            onClick={() => setShowIncidents(v => !v)}
            className={cn(
              "flex items-center gap-1.5 h-6 px-2 rounded text-xs font-medium transition-colors shrink-0",
              showIncidents
                ? "bg-white/10 text-white border border-white/15"
                : "text-white/45 hover:text-white hover:bg-white/5"
            )}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
            <span>Incidents ({allIncidents.length})</span>
          </button>

          {/* Hospitals Toggle */}
          <button
            onClick={() => setShowHospitals(v => !v)}
            className={cn(
              "flex items-center gap-1.5 h-6 px-2 rounded text-xs font-medium transition-colors shrink-0",
              showHospitals
                ? "bg-white/10 text-white border border-white/15"
                : "text-white/45 hover:text-white hover:bg-white/5"
            )}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>Hospitals ({hospitalCount})</span>
          </button>

          {/* Police Toggle */}
          <button
            onClick={() => setShowPolice(v => !v)}
            className={cn(
              "flex items-center gap-1.5 h-6 px-2 rounded text-xs font-medium transition-colors shrink-0",
              showPolice
                ? "bg-white/10 text-white border border-white/15"
                : "text-white/45 hover:text-white hover:bg-white/5"
            )}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
            <span>Police ({policeCount})</span>
          </button>

          {/* Responding Units Toggle */}
          <button
            onClick={() => setShowUnits(v => !v)}
            className={cn(
              "flex items-center gap-1.5 h-6 px-2 rounded text-xs font-medium transition-colors shrink-0",
              showUnits
                ? "bg-white/10 text-white border border-white/15"
                : "text-white/45 hover:text-white hover:bg-white/5"
            )}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>Units ({LIVE_RESPONDING_UNITS.length})</span>
          </button>

          {/* Hazard Zones Toggle */}
          <button
            onClick={() => setShowZones(v => !v)}
            className={cn(
              "flex items-center gap-1.5 h-6 px-2 rounded text-xs font-medium transition-colors shrink-0",
              showZones
                ? "bg-white/10 text-white border border-white/15"
                : "text-white/45 hover:text-white hover:bg-white/5"
            )}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <span>5 Hazard Zones</span>
          </button>
        </div>
      </div>

      {/* ── Top-Right: Quick Tactical Action Controls (All 32px height) ── */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
        {/* Stage Demo Action Button */}
        <button
          onClick={triggerLiveStageDemo}
          title="STAGE DEMO: Upload incident photo & trigger live OmniDimension call on stage"
          className="btn-press flex h-8 items-center gap-1.5 rounded-lg bg-red-600/90 hover:bg-red-500 px-2.5 text-xs font-semibold text-white shadow-sm border border-red-400/30 transition-all"
        >
          <Zap className="h-3.5 w-3.5 animate-pulse" />
          <span className="hidden sm:inline">Stage Demo</span>
        </button>

        {/* Track User Location */}
        <button
          onClick={trackMyLocation}
          disabled={locatingUser}
          title="Track Real Location (GPS) & Center on My Location"
          className={cn(
            "btn-press flex h-8 w-8 items-center justify-center rounded-lg border backdrop-blur-md transition-all duration-200",
            userLocation
              ? "bg-amber-500/20 border-amber-400/60 text-amber-300"
              : "bg-slate-950/85 border-white/10 text-white/60 hover:text-white hover:border-white/20"
          )}
        >
          <Crosshair className={cn("h-4 w-4", locatingUser && "animate-spin text-amber-400")} />
        </button>

        {/* Reset to Microsoft Noida Center */}
        <button
          onClick={resetToNoida}
          title="Reset View to Microsoft Sovereign Office (Noida Sector 16B)"
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950/85 border border-white/10 backdrop-blur-md text-white/60 hover:text-white hover:border-white/20 transition-all duration-200"
        >
          <Building2 className="h-4 w-4" />
        </button>

        {/* 2D / 3D Orientation Toggle (Standardized 32x32px square) */}
        <button
          onClick={toggle3D}
          title={is3D ? "Switch to 2D Overhead (North-Up)" : "Switch to 3D Tactical Perspective"}
          className={cn(
            "btn-press flex h-8 w-8 items-center justify-center rounded-lg border backdrop-blur-md text-[11px] font-mono font-bold transition-all duration-200",
            is3D
              ? "bg-amber-500/20 border-amber-400/60 text-amber-300"
              : "bg-slate-950/85 border-white/10 text-white/60 hover:text-white hover:border-white/20"
          )}
        >
          <span>{is3D ? "3D" : "2D"}</span>
        </button>

        {/* Zoom In */}
        <button
          onClick={() => mapRef.current?.zoomIn({ duration: 300 })}
          title="Zoom In"
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950/85 border border-white/10 backdrop-blur-md text-white/60 hover:text-white hover:border-white/20 transition-all duration-200"
        >
          <ZoomIn className="h-4 w-4" />
        </button>

        {/* Zoom Out */}
        <button
          onClick={() => mapRef.current?.zoomOut({ duration: 300 })}
          title="Zoom Out"
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950/85 border border-white/10 backdrop-blur-md text-white/60 hover:text-white hover:border-white/20 transition-all duration-200"
        >
          <ZoomOut className="h-4 w-4" />
        </button>

        {/* Satellite vs Dark Vector Toggle */}
        <button
          onClick={toggleStyle}
          title={styleMode === "satellite" ? "Switch to Dark Tactical Vector" : "Switch to Satellite Hybrid"}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950/85 border border-white/10 backdrop-blur-md text-white/60 hover:text-white hover:border-white/20 transition-all duration-200 text-[10px] font-mono font-bold"
        >
          {styleMode === "satellite" ? "SAT" : "VEC"}
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={() => setIsFullscreen(f => !f)}
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Map View"}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950/85 border border-white/10 backdrop-blur-md text-white/60 hover:text-white hover:border-white/20 transition-all duration-200"
        >
          {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* ── STAGE DEMO: OmniDimension Phone Call Ringing Alert Overlay ── */}
      {liveStageIncident && (
        <div className="absolute top-20 right-3 z-30 w-84 animate-slide-up">
          <div className="rounded-2xl bg-slate-950/95 border-2 border-red-500 p-4 shadow-[0_0_35px_rgba(239,68,68,0.7)] backdrop-blur-2xl">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="flex h-3 w-3 rounded-full bg-red-500 animate-ping" />
                <span className="text-xs font-black uppercase text-red-400 tracking-wider">
                  LIVE INCIDENT PIN DROPPED
                </span>
              </div>
              <button
                onClick={() => setLiveStageIncident(null)}
                className="text-white/40 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs font-bold text-white/95 leading-tight mb-2">
              {liveStageIncident.title}
            </p>

            <div className="rounded-xl bg-red-950/50 border border-red-500/35 p-3 mb-3 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-red-200">
                <PhoneCall className="h-4 w-4 text-red-400 animate-bounce" />
                <span>OmniDimension Voice Call Ringing On Stage!</span>
              </div>
              <p className="text-[10px] text-white/70">
                Calling Station Lead: <strong className="text-white font-mono">+91 98765 43210</strong>
              </p>
              <div className="flex items-center gap-1.5 pt-1 text-[9px] font-mono text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Confidence: 99% · PostGIS ST_DWithin Corroborated</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => alert("OmniDimension Call Connected! Live dispatcher audio established.")}
                className="btn-press flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg transition-all"
              >
                <Phone className="h-3.5 w-3.5" />
                <span>Connect Stage Call</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Active Incident Card Overlay ── */}
      {selectedInc && (
        <div className="absolute bottom-12 right-3 z-20 w-80 animate-slide-up">
          <div className="rounded-2xl bg-[#080d17]/95 border border-red-500/40 backdrop-blur-xl p-4 shadow-[0_12px_40px_rgba(0,0,0,0.9)]">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-ping" />
                <span className="text-xs font-bold text-white/95 leading-tight truncate">
                  {selectedInc.title}
                </span>
              </div>
              <button
                onClick={() => setSelectedInc(null)}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-[11px] text-white/60 mb-2">{selectedInc.zone}</p>
            {selectedInc.hazard && (
              <p className="text-[10px] font-mono text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded px-2 py-1 mb-3">
                Hazard: {selectedInc.hazard}
              </p>
            )}

            <div className="space-y-1.5 text-[11px] mb-3 border-t border-white/[0.08] pt-2">
              <div className="flex justify-between">
                <span className="text-white/40">Severity</span>
                <span className="font-bold uppercase text-[9px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                  {selectedInc.severity}
                </span>
              </div>
              {selectedInc.workers > 0 && (
                <div className="flex justify-between">
                  <span className="text-white/40">Personnel at Risk</span>
                  <span className="font-bold text-amber-400">{selectedInc.workers} Personnel</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-white/40">Reported</span>
                <span className="font-mono text-white/60">{selectedInc.time}</span>
              </div>
            </div>

            <button
              onClick={() => alert(`Dispatch unit alerted for ${selectedInc.title}`)}
              className="btn-press w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-500 text-xs font-bold text-white hover:bg-red-400 transition-all shadow-[0_0_14px_rgba(239,68,68,0.5)]"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Deploy Immediate Response</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Active Polygon Hazard Zone Card Overlay ── */}
      {selectedZone && (
        <div className="absolute bottom-12 right-3 z-20 w-84 animate-slide-up">
          <div className="rounded-2xl bg-[#080d17]/95 border backdrop-blur-xl p-4 shadow-[0_12px_40px_rgba(0,0,0,0.9)]"
            style={{ borderColor: `${selectedZone.color}88` }}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg"
                  style={{ background: `${selectedZone.color}22`, color: selectedZone.color }}
                >
                  <ShieldAlert className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white/95 leading-tight block">
                    {selectedZone.name}
                  </span>
                  <span className="text-[9px] font-mono uppercase font-black"
                    style={{ color: selectedZone.color }}
                  >
                    {selectedZone.level === "purple" ? "Women Safety Alert Corridor" : selectedZone.level === "orange" ? "Structural Risk Zone" : selectedZone.level === "red" ? "HazMat Chemical Zone" : selectedZone.level === "yellow" ? "High-Voltage Risk" : "Emergency Shelter"}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedZone(null)}
                className="text-white/40 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-xl bg-white/[0.04] border border-white/[0.09] p-3 my-2 space-y-1">
              <span className="text-[9px] uppercase tracking-wider text-white/40 block font-bold">
                Hazard Reason & Assessment
              </span>
              <p className="text-xs text-white/95 font-medium leading-relaxed">
                "{selectedZone.reason}"
              </p>
            </div>

            <div className="space-y-1.5 text-[11px] mb-3">
              <div className="flex justify-between">
                <span className="text-white/40">Location</span>
                <span className="text-white/70 font-medium truncate max-w-[170px]">{selectedZone.location}</span>
              </div>
              {selectedZone.radiusM && (
                <div className="flex justify-between">
                  <span className="text-white/40">Perimeter Radius</span>
                  <span className="font-mono text-cyan-300 font-bold">{selectedZone.radiusM}m Circular Zone</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-white/40">Protocol</span>
                <span className="text-amber-400 font-mono text-[10px]">{selectedZone.timeActive}</span>
              </div>
            </div>

            <button
              onClick={() => alert(`Patrol dispatched to ${selectedZone.name}`)}
              className="btn-press w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-md"
              style={{ background: selectedZone.color }}
            >
              <Navigation2 className="h-3.5 w-3.5" />
              <span>Deploy Sector Response Unit</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Active Responding Emergency Unit Card ── */}
      {selectedUnit && (
        <div className="absolute bottom-12 right-3 z-20 w-80 animate-slide-up">
          <div className="rounded-2xl bg-[#080d17]/95 border border-emerald-500/40 backdrop-blur-xl p-4 shadow-[0_12px_40px_rgba(0,0,0,0.9)]">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-lg">
                  {selectedUnit.type === "ambulance" ? "🚑" : selectedUnit.type === "fire_tender" ? "🚒" : "🚓"}
                </div>
                <div>
                  <span className="text-xs font-bold text-white/95 leading-tight block">
                    {selectedUnit.name}
                  </span>
                  <span className="text-[9px] font-mono text-emerald-400 uppercase font-black">
                    Live Telemetry · {selectedUnit.speed}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedUnit(null)}
                className="text-white/40 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-[11px] text-white/70 mb-3 bg-white/[0.04] p-2 rounded-lg border border-white/[0.08]">
              {selectedUnit.status}
            </p>

            <div className="space-y-1.5 text-[11px] mb-3">
              <div className="flex justify-between">
                <span className="text-white/40">ETA to Destination</span>
                <span className="font-bold text-emerald-400 font-mono">{selectedUnit.eta}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Radio Channel</span>
                <span className="font-mono text-white/70">TAC-4 Emergency</span>
              </div>
            </div>

            <button
              onClick={() => simulateCall(selectedUnit.phone)}
              className="btn-press w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-all shadow-md"
            >
              <Phone className="h-3.5 w-3.5" />
              <span>Radio Call Crew ({selectedUnit.phone})</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Active Authority Facility (Police / Hospital) Card Overlay ── */}
      {selectedAuth && (
        <div className="absolute bottom-12 right-3 z-20 w-80 animate-slide-up">
          <div className={cn(
            "rounded-2xl bg-[#080d17]/95 border backdrop-blur-xl p-4 shadow-[0_12px_40px_rgba(0,0,0,0.9)]",
            selectedAuth.type === "police" ? "border-sky-500/40" : "border-emerald-500/40"
          )}>
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-lg",
                  selectedAuth.type === "police" ? "bg-sky-500/20 text-sky-400" : "bg-emerald-500/20 text-emerald-400"
                )}>
                  {selectedAuth.type === "police" ? <Shield className="h-4 w-4" /> : <Activity className="h-4 w-4" />}
                </div>
                <div>
                  <span className="text-xs font-bold text-white/95 leading-tight block">
                    {selectedAuth.name}
                  </span>
                  <span className={cn(
                    "text-[9px] font-mono uppercase font-black",
                    selectedAuth.type === "police" ? "text-sky-400" : "text-emerald-400"
                  )}>
                    {selectedAuth.type === "police" ? "Police Station (OSM)" : "Trauma Hospital (OSM)"}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedAuth(null)}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {selectedAuth.address && (
              <p className="text-[11px] text-white/60 mb-2 flex items-center gap-1">
                <MapPin className="h-3 w-3 text-white/30 shrink-0" />
                <span className="truncate">{selectedAuth.address}</span>
              </p>
            )}

            <div className="space-y-1.5 text-[11px] mb-3 border-t border-white/[0.08] pt-2">
              <div className="flex justify-between">
                <span className="text-white/40">Distance from Center</span>
                <span className="font-mono font-bold text-white/80">
                  {selectedAuth.distanceM ? `${selectedAuth.distanceM} m` : "Calculated live"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Helpline / Hotline</span>
                <span className="font-mono font-bold text-amber-400">{selectedAuth.phone}</span>
              </div>
              {selectedAuth.emergency && (
                <div className="flex justify-between">
                  <span className="text-white/40">Service Mode</span>
                  <span className="text-emerald-400 font-semibold">{selectedAuth.emergency}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => simulateCall(selectedAuth.phone)}
                className={cn(
                  "btn-press flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-md",
                  selectedAuth.type === "police"
                    ? "bg-sky-600 hover:bg-sky-500 shadow-[0_0_14px_rgba(56,189,248,0.5)]"
                    : "bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_14px_rgba(52,211,153,0.5)]"
                )}
              >
                <Phone className={cn("h-3.5 w-3.5", callActive === selectedAuth.phone && "animate-bounce")} />
                <span>{callActive === selectedAuth.phone ? "Calling…" : `Call ${selectedAuth.phone}`}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Active User Location Tactical Card Overlay ── */}
      {showUserOverlay && (
        <div className="absolute bottom-12 right-3 z-20 w-84 animate-slide-up">
          <div className="rounded-2xl bg-[#080d17]/95 border-2 border-cyan-500/70 backdrop-blur-xl p-4 shadow-[0_0_35px_rgba(6,182,212,0.35),0_12px_40px_rgba(0,0,0,0.9)]">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.4)]">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-black text-white uppercase tracking-wider block">
                    YOUR COMMAND LOCATION
                  </span>
                  <span className="text-[9px] font-mono font-bold text-cyan-400">
                    {userLocation ? "HIGH ACCURACY GPS TELEMETRY" : "SECTOR 16B COMMAND BASE"}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowUserOverlay(false)}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-xl bg-cyan-950/40 border border-cyan-500/30 p-2.5 mb-3 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-white/50">Primary Facility:</span>
                <span className="text-cyan-300 font-bold">Microsoft Sovereign Office, Noida</span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-white/50">Coordinates:</span>
                <span className="text-white font-bold">28.5740° N, 77.3112° E</span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-white/50">Campus:</span>
                <span className="text-white/80 font-mono">KP Towers, Sector 16B, Noida</span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-white/50">Orientation Mode:</span>
                <span className="text-emerald-400 font-mono font-bold">{is3D ? "3D Tactical Tilt (-15°)" : "2D Top-Down Overhead (0°)"}</span>
              </div>
            </div>

            <div className="space-y-1.5 text-[11px] mb-3">
              <div className="flex justify-between">
                <span className="text-white/40">Safe Assembly Triage:</span>
                <span className="text-emerald-400 font-mono font-bold">80m (Courtyard)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Nearest Police Station:</span>
                <span className="text-sky-300 font-mono font-bold">420m (Sector 18 Post)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Nearest Hospital:</span>
                <span className="text-emerald-300 font-mono font-bold">650m (Kailash Hospital)</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={trackMyLocation}
                disabled={locatingUser}
                className="btn-press flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)]"
              >
                <Crosshair className={cn("h-3.5 w-3.5", locatingUser && "animate-spin")} />
                <span>{locatingUser ? "Acquiring GPS…" : "Refresh GPS Fix"}</span>
              </button>
              <button
                onClick={() => {
                  const map = mapRef.current;
                  if (map) {
                    map.flyTo({ center: userLocation || NOIDA_DEFAULT, zoom: 16.5, duration: 600 });
                  }
                }}
                className="btn-press px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white border border-white/20 transition-all"
              >
                Center
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bottom Bar: Satellite Telemetry & Coordinates Bar ── */}
      <div className="absolute bottom-3 inset-x-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left Legend: Unified Muted Indicators */}
        <div className="flex flex-wrap items-center gap-3 rounded-lg bg-slate-950/85 border border-white/10 backdrop-blur-md px-3 h-7 shadow-sm pointer-events-auto">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
            <span className="text-[11px] text-white/70 font-medium">Incidents</span>
          </div>
          <div className="flex items-center gap-1.5 border-l border-white/10 pl-3">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
            <span className="text-[11px] text-white/70 font-medium">Police</span>
          </div>
          <div className="flex items-center gap-1.5 border-l border-white/10 pl-3">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="text-[11px] text-white/70 font-medium">Hospitals</span>
          </div>
          <div className="flex items-center gap-1.5 border-l border-white/10 pl-3">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <span className="text-[11px] text-white/70 font-medium">Hazard Zones</span>
          </div>
        </div>

        {/* Right Telemetry Bar (Cursor & Satellite Info) */}
        <div className="hidden md:flex items-center gap-2.5 rounded-lg bg-slate-950/85 border border-white/10 backdrop-blur-md px-3 h-7 shadow-sm pointer-events-auto text-[11px] font-mono text-white/60">
          <div className="flex items-center gap-1 text-white/80">
            <Navigation2 className="h-3 w-3 text-amber-400" />
            <span>{cursorCoords.lat}, {cursorCoords.lng}</span>
          </div>
          <span className="text-white/20">|</span>
          <span>{telemetryZoom}x ZOOM</span>
          <span className="text-white/20">|</span>
          <span className="text-white/70">ESRI HIGH-RES</span>
        </div>
      </div>
    </div>
  );
}
