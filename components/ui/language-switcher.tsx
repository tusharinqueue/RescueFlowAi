"use client";

import { useState, useRef, useEffect } from "react";
import { Globe } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { Language } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";

const LANGUAGES: { code: Language; label: string; native: string; flag: string }[] = [
  { code: "en", label: "English",  native: "EN",  flag: "🇬🇧" },
  { code: "hi", label: "हिन्दी",   native: "हिं", flag: "🇮🇳" },
  { code: "pa", label: "ਪੰਜਾਬੀ",  native: "ਪੰ",  flag: "🇮🇳" },
];

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0]!

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all",
          open
            ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
            : "bg-white/[0.06] border-white/[0.08] text-white/60 hover:bg-white/[0.10] hover:text-white/80"
        )}
        aria-label="Switch language"
      >
        <Globe className="h-3.5 w-3.5 shrink-0" />
        <span className="hidden sm:inline">{current!.flag} {current!.native}</span>
        <span className="sm:hidden">{current!.native}</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-10 z-50 w-40 rounded-2xl border border-white/[0.10] bg-[hsl(224_47%_6%)] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => { setLanguage(lang.code); setOpen(false); }}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-2.5 text-xs font-semibold transition-colors",
                language === lang.code
                  ? "bg-amber-500/20 text-amber-300"
                  : "text-white/60 hover:bg-white/[0.07] hover:text-white/90"
              )}
            >
              <span className="text-base">{lang.flag}</span>
              <div className="text-left">
                <p className="font-bold leading-none">{lang.label}</p>
                <p className="text-[10px] text-white/30 mt-0.5 uppercase tracking-widest">{lang.code}</p>
              </div>
              {language === lang.code && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-amber-400" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
