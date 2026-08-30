/**
 * use-speech.ts
 * Custom hooks for Web Speech API:
 *  - useSpeechSynthesis: text-to-speech readout
 *  - useSpeechRecognition: microphone → transcript
 */
"use client";

// ── Ambient type declarations for Web Speech API (not in default TS lib) ──────
declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionInstance extends EventTarget {
  lang:            string;
  interimResults:  boolean;
  maxAlternatives: number;
  continuous:      boolean;
  onstart:  ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionEvent) => void) | null;
  onerror:  ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
  onend:    ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
  start(): void;
  stop():  void;
  abort(): void;
}

import { useCallback, useRef, useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Text-to-Speech (SpeechSynthesis)
// ─────────────────────────────────────────────────────────────────────────────

export function useSpeechSynthesis() {
  const [speaking, setSpeaking] = useState(false);

  const speak = useCallback((text: string, rate = 0.92) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const synth = window.speechSynthesis;

    // Stop anything playing
    synth.cancel();

    const utter = new SpeechSynthesisUtterance(text);
    utter.rate  = rate;
    utter.pitch = 1;
    utter.lang  = "en-US";

    utter.onstart = () => setSpeaking(true);
    utter.onend   = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);

    // Call directly — no setTimeout, no voice preloading.
    // This matches the working browser console pattern exactly.
    synth.speak(utter);
    setSpeaking(true); // optimistic UI update
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== "undefined") {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  }, []);

  return { speak, stop, speaking };
}



// ─────────────────────────────────────────────────────────────────────────────
// Speech-to-Text (SpeechRecognition — Chrome / Edge)
// ─────────────────────────────────────────────────────────────────────────────

type RecognitionState = "idle" | "listening" | "error";

export function useSpeechRecognition() {
  const [transcript, setTranscript] = useState("");
  const [state, setState] = useState<RecognitionState>("idle");
  const recRef = useRef<SpeechRecognitionInstance | null>(null);

  const supported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const startListening = useCallback(() => {
    if (!supported) {
      setState("error");
      return;
    }

    const SpeechRecognitionImpl =
      window.SpeechRecognition ??
      window.webkitSpeechRecognition;

    if (!SpeechRecognitionImpl) { setState("error"); return; }
    const rec: SpeechRecognitionInstance = new SpeechRecognitionImpl();
    rec.lang              = "en-US";
    rec.interimResults    = true;
    rec.maxAlternatives   = 1;
    rec.continuous        = false;

    rec.onstart = () => setState("listening");

    rec.onresult = (event) => {
      const current = event.results[event.results.length - 1];
      const text = current?.[0]?.transcript ?? "";
      setTranscript(text);
    };

    rec.onerror = () => setState("error");
    rec.onend   = () => setState("idle");

    recRef.current = rec;
    setTranscript("");
    rec.start();
  }, [supported]);

  const stopListening = useCallback(() => {
    recRef.current?.stop();
    setState("idle");
  }, []);

  return { transcript, state, supported, startListening, stopListening, setTranscript };
}
