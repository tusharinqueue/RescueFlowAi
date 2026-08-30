// ──────────────────────────────────────────────────────────────────────────────
//  Domain enumerations
// ──────────────────────────────────────────────────────────────────────────────

export type IncidentSeverity = "critical" | "high" | "moderate" | "low";

export type IncidentStatus =
  | "pending"
  | "ai_processing"
  | "dispatched"
  | "on_scene"
  | "resolved"
  | "cancelled";

export type IncidentType =
  | "road_accident"
  | "fire"
  | "medical"
  | "industrial"
  | "natural_disaster"
  | "security"
  | "other";

export type MediaType = "image" | "video" | "audio" | "text";

export type ResponderType = "ambulance" | "fire_brigade" | "police" | "rescue";

export type UserRole = "citizen" | "dispatcher" | "responder" | "admin";

// ──────────────────────────────────────────────────────────────────────────────
//  User
// ──────────────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl: string | null;
  createdAt: string;
}

// ──────────────────────────────────────────────────────────────────────────────
//  Location
// ──────────────────────────────────────────────────────────────────────────────

export interface GeoLocation {
  latitude: number;
  longitude: number;
  address: string | null;
}

// ──────────────────────────────────────────────────────────────────────────────
//  Incident
// ──────────────────────────────────────────────────────────────────────────────

export interface Incident {
  id: string;
  reportedBy: string;          // User ID
  type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  title: string;
  description: string;
  location: GeoLocation;
  mediaUrls: string[];
  mediaTypes: MediaType[];
  aiReport: AiIncidentReport | null;
  dispatchedUnits: DispatchUnit[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateIncidentPayload {
  description: string;
  location: GeoLocation;
  mediaUrls?: string[];
  mediaTypes?: MediaType[];
}

// ──────────────────────────────────────────────────────────────────────────────
//  AI Report
// ──────────────────────────────────────────────────────────────────────────────

export interface AiIncidentReport {
  incidentType: IncidentType;
  severity: IncidentSeverity;
  summary: string;
  recommendedResponders: ResponderType[];
  estimatedCasualties: number | null;
  immediateActions: string[];
  confidenceScore: number;   // 0–1
  generatedAt: string;
}

// ──────────────────────────────────────────────────────────────────────────────
//  Dispatch
// ──────────────────────────────────────────────────────────────────────────────

export interface DispatchUnit {
  id: string;
  responderType: ResponderType;
  unitName: string;
  status: "en_route" | "on_scene" | "available";
  estimatedArrivalMinutes: number | null;
  dispatchedAt: string;
}

// ──────────────────────────────────────────────────────────────────────────────
//  API Response wrappers
// ──────────────────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
}
