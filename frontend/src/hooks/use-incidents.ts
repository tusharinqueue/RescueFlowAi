/**
 * use-incidents.ts
 * Lightweight IndexedDB-backed incident store for hackathon demo.
 * Can store strings, objects, and raw file Blobs!
 */
"use client";

import { useCallback, useEffect, useState } from "react";

const DB_NAME = "RescueFlowDB";
const STORE_NAME = "incidents";
const STORAGE_KEY = "all_incidents";

export interface StoredIncident {
  id:          string;
  title:       string;
  severity:    "critical" | "high" | "moderate" | "low";
  status:      "pending" | "ai_processing" | "dispatched" | "resolved";
  location:    string;
  department?: string | undefined;
  description: string;
  aiSummary:   string;
  recommendation: string;
  hazards:     string[];
  teams:       string[];
  confidence:     number;
  workersAtRisk?: number;
  reportedAt:     string;
  method:         "photo" | "video" | "voice" | "text";
  mediaBlob?:     Blob | undefined; // We can now store raw files safely in IndexedDB!
}

// ── Native IndexedDB Helper ─────────────────────────────────────────────────
function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) return reject();
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveToIDB(incidents: StoredIncident[]) {
  try {
    const db = await getDB();
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put(incidents, STORAGE_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error("IDB Save Error:", err);
  }
}

async function loadFromIDB(): Promise<StoredIncident[]> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).get(STORAGE_KEY);
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

// ── Hook ────────────────────────────────────────────────────────────────────
export function useIncidents() {
  const [incidents, setIncidents] = useState<StoredIncident[]>([]);

  // Hydrate async on mount
  useEffect(() => {
    loadFromIDB().then(data => setIncidents(data));
  }, []);

  const addIncident = useCallback((incident: StoredIncident) => {
    setIncidents(prev => {
      const next = [incident, ...prev];
      saveToIDB(next);
      return next;
    });
  }, []);

  const updateStatus = useCallback((id: string, status: StoredIncident["status"]) => {
    setIncidents(prev => {
      const next = prev.map(inc => inc.id === id ? { ...inc, status } : inc);
      saveToIDB(next);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    saveToIDB([]);
    setIncidents([]);
  }, []);

  return { incidents, addIncident, updateStatus, clearAll };
}
