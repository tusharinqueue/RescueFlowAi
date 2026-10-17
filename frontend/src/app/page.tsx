"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity, Brain, Camera, Video, Mic, FileText,
  ChevronRight, Building2, Globe, ArrowRight,
  Zap, Shield, MapPin, Clock, TrendingUp, AlertCircle,
  Radio, Navigation, AlertTriangle
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { Language } from "@/lib/i18n/translations";

// ── Illustrative client list (not confirmed customers) ─────────────────────
const CLIENTS = [
  "Tata Steel", "Siemens", "Bharat Steel", "NTPC", "L&T Construction", "Coal India",
];

const LANGS: { code: Language; label: string; name: string }[] = [
  { code: "en", label: "EN", name: "English" },
  { code: "hi", label: "HI", name: "हिन्दी" },
  { code: "pa", label: "PA", name: "ਪੰਜਾਬੀ" },
];

// ── Ticker items ────────────────────────────────────────────────────────────
const TICKER_ITEMS = [
  { severity: "critical", text: "Industrial fire reported at Zone 7, Tata Steel Jamshedpur" },
  { severity: "high",     text: "Medical emergency, construction site B-4, L&T Chennai" },
  { severity: "moderate", text: "Structural concern flagged, Building 12, NTPC Korba" },
  { severity: "critical", text: "Chemical leak detected, Bharat Steel Plant C" },
  { severity: "low",      text: "Road accident handled — NH-48 km 212. Responders en route." },
];

const SEV_DOT: Record<string, string> = {
  critical: "bg-red-500 shadow-[0_0_6px_rgba(220,38,38,0.8)]",
  high:     "bg-orange-500",
  moderate: "bg-amber-500",
  low:      "bg-emerald-500",
};

export default function LandingPage() {
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();
  const [langOpen,  setLangOpen]  = useState(false);
  const [mounted,   setMounted]   = useState(false);
  const [ticker,    setTicker]    = useState(0);
  const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setMounted(true);
    tickerRef.current = setInterval(() => {
      setTicker(p => (p + 1) % TICKER_ITEMS.length);
    }, 4000);
    return () => { if (tickerRef.current) clearInterval(tickerRef.current); };
  }, []);

  const HOW_IT_WORKS = [
    {
      icon: Camera, color: "amber",
      title: t("landing_step1_title"),
      desc:  t("landing_step1_desc"),
      sub:   t("landing_step1_sub"),
    },
    {
      icon: Brain, color: "blue",
      title: t("landing_step2_title"),
      desc:  t("landing_step2_desc"),
      sub:   t("landing_step2_sub"),
    },
    {
      icon: Navigation, color: "green",
      title: t("landing_step3_title"),
      desc:  t("landing_step3_desc"),
      sub:   t("landing_step3_sub"),
    },
  ];

  const FEATURES = [
    { icon: Zap,        color: "amber", title: "Instant AI Triage",      desc: "Gemini classifies incident type, severity, and required units in under 2 seconds." },
    { icon: MapPin,     color: "blue",  title: "Live GIS Heatmap",       desc: "Real-time geospatial tracking of all incidents and responders across the facility." },
    { icon: Mic,        color: "green", title: "Voice-to-Action",        desc: "Whisper AI converts voice reports in Hindi, Punjabi, and English to structured alerts." },
    { icon: Shield,     color: "red",   title: "Automated Dispatch",     desc: "Twilio-powered instant voice calls and SMS to the nearest qualified responders." },
    { icon: TrendingUp, color: "amber", title: "Safety Analytics",       desc: "Track incident frequency, response times, and safety scores across zones and shifts." },
    { icon: Globe,      color: "blue",  title: "Multi-language Support", desc: "AI understands and responds in the reporter's language — no translation needed." },
  ];

  const goReport = (method?: string) =>
    router.push(method ? `/report?method=${method}` : "/report");

  const currentLang = LANGS.find(l => l.code === language) || LANGS[0]!;
  const currentItem = TICKER_ITEMS[ticker]!;

  return (
    <div className="min-h-screen font-sans antialiased text-white/85 overflow-x-hidden">

      {/* ── Emergency ticker bar ── */}
      <div
        role="status"
        aria-live="polite"
        aria-label="Live emergency feed"
        className="relative z-40 bg-[#0e0608]/90 border-b border-red-900/35 backdrop-blur-sm overflow-hidden h-9 flex items-center"
      >
        <div className="mx-auto max-w-7xl w-full px-4 flex items-center gap-4">
          <span className="shrink-0 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-red-400 border-r border-red-900/40 pr-4">
            <span className="animate-alert inline-block h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_6px_rgba(220,38,38,0.9)]" />
            LIVE
          </span>
          <div className="overflow-hidden flex-1">
            {mounted && (
              <div key={ticker} className="flex items-center gap-2.5 animate-ticker">
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${SEV_DOT[currentItem.severity]}`} />
                <p className="text-[11px] font-medium text-white/55 truncate">
                  {currentItem.text}
                </p>
              </div>
            )}
          </div>
          <Link href="/dashboard" className="shrink-0 text-[10px] font-bold text-white/30 hover:text-amber-400 transition-colors flex items-center gap-1">
            Monitor <ChevronRight className="h-2.5 w-2.5" />
          </Link>
        </div>
      </div>

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 glass-navbar">
        <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6" aria-label="Main navigation">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl glass-amber">
              <Activity className="h-4.5 w-4.5 text-amber-400" aria-hidden="true" />
              <span className="absolute h-full w-full rounded-xl ring-1 ring-amber-400/30 animate-ping opacity-25" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[15px] font-bold tracking-tight text-white/92">
                Rescue<span className="text-amber-400">Flow</span>
                <span className="text-[11px] font-black text-white/38 ml-0.5">AI</span>
              </span>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-amber-400/55">
                Emergency Response
              </span>
            </div>
          </Link>

          {/* Nav links */}
          <div className="hidden items-center gap-8 md:flex text-sm font-medium text-white/40">
            <Link href="/"            className="hover:text-white/80 transition-colors">{t("landing_home")}</Link>
            <Link href="#how-it-works" className="hover:text-white/80 transition-colors">{t("landing_how_it_works")}</Link>
            <Link href="/dashboard"   className="hover:text-white/80 transition-colors">Dashboard</Link>
            <Link href="#about"       className="hover:text-white/80 transition-colors">{t("landing_about")}</Link>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2.5">
            {/* Language switcher */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(prev => !prev)}
                aria-expanded={langOpen}
                aria-haspopup="listbox"
                className="flex items-center gap-1.5 rounded-xl border border-white/[0.10] bg-white/[0.04] px-2.5 py-2 text-xs font-bold text-white/55 hover:border-amber-400/35 hover:bg-white/[0.07] hover:text-white/80 transition-all duration-200"
              >
                <Globe className="h-3.5 w-3.5 text-amber-400/65" />
                <span>{currentLang.label}</span>
                <span className="text-white/22 text-[10px]">▾</span>
              </button>

              {langOpen && (
                <div
                  role="listbox"
                  className="absolute right-0 top-[calc(100%+8px)] z-50 min-w-[150px] overflow-hidden rounded-xl border border-white/[0.10] bg-[#0b1120]/95 backdrop-blur-xl shadow-[0_16px_48px_rgba(0,0,0,0.6)] animate-fade-scale"
                >
                  <div className="px-3 py-2 border-b border-white/[0.06]">
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/25">Language</p>
                  </div>
                  {LANGS.map(lang => (
                    <button
                      key={lang.code}
                      role="option"
                      aria-selected={language === lang.code}
                      onClick={() => { setLanguage(lang.code); setLangOpen(false); }}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-xs font-semibold transition-colors hover:bg-white/[0.06] ${
                        language === lang.code ? "text-amber-400 bg-amber-500/[0.08]" : "text-white/55"
                      }`}
                    >
                      <span className="font-black text-[10px] tracking-widest w-6 shrink-0 opacity-60">{lang.label}</span>
                      <span className="flex-1">{lang.name}</span>
                      {language === lang.code && <span className="text-amber-400">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link href="/dashboard" className="hidden sm:block text-sm font-medium text-white/50 hover:text-white px-3 py-2 transition-colors">
              Command Center
            </Link>

            <button
              onClick={() => goReport()}
              id="hero-report-btn"
              className="btn-press flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-slate-950 shadow-[0_4px_20px_rgba(245,158,11,0.32)] hover:bg-amber-400 hover:shadow-[0_4px_28px_rgba(245,158,11,0.48)] transition-all duration-200"
            >
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">{t("landing_report_btn")}</span>
              <span className="sm:hidden">SOS</span>
            </button>
          </div>
        </nav>
      </header>

      {langOpen && <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* HERO — the ONE signature animated moment               */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-20 pb-24 lg:pt-28 lg:pb-32">

        {/* Architectural corner accents — static, not decorative flash */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <svg className="absolute top-0 right-0 w-96 h-96 text-amber-500/12" fill="none" stroke="currentColor" strokeWidth="0.75" viewBox="0 0 384 384">
            <path d="M384 0 L384 120 L280 120 L280 200 L200 200" />
            <path d="M384 40 L360 40 L360 160 L240 160" />
            <circle cx="280" cy="120" r="4" fill="currentColor" opacity="0.6" />
            <circle cx="200" cy="200" r="2.5" fill="currentColor" opacity="0.4" />
          </svg>
          <svg className="absolute bottom-0 left-0 w-80 h-64 text-blue-500/10" fill="none" stroke="currentColor" strokeWidth="0.75" viewBox="0 0 320 256">
            <path d="M0 256 L0 140 L100 140 L100 80 L180 80" />
            <circle cx="100" cy="140" r="3.5" fill="currentColor" opacity="0.5" />
          </svg>
        </div>

        <div className="mx-auto max-w-5xl px-6 text-center">

          {/* Live status badge — fades in first */}
          <div className="flex justify-center mb-8 animate-fade-in">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-amber-400/22 bg-amber-400/[0.07] px-5 py-2 text-xs font-bold text-amber-400 tracking-wide">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-55" />
                <span className="relative h-2 w-2 rounded-full bg-amber-500" />
              </span>
              {t("landing_powered_by")}
              <span className="text-amber-400/40">·</span>
              <span className="text-white/45 font-medium">Gemini + Whisper</span>
            </div>
          </div>

          {/* ── HERO HEADLINE — the signature hero-reveal animation ── */}
          {/* blur+rise: one authored moment; the rest of the page fades normally */}
          <h1 className="animate-hero delay-75 text-5xl font-bold tracking-tight text-white/95 sm:text-6xl lg:text-[5.5rem] leading-[1.05]">
            <span className="block">{t("landing_hero_title1")}</span>
            {/* Emphasis via size and weight, not gradient text */}
            <span className="block mt-1 text-amber-400">{t("landing_hero_title2")}</span>
          </h1>

          <p className="animate-fade-in delay-200 mt-7 mx-auto max-w-2xl text-lg text-white/42 leading-relaxed">
            {t("landing_hero_desc")}
          </p>

          {/* CTA group */}
          <div className="animate-fade-in delay-300 mt-11 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => goReport()}
              id="hero-report-cta"
              className="btn-press group w-full sm:w-auto flex items-center justify-center gap-3 rounded-2xl bg-amber-500 px-9 py-[1.1rem] text-[17px] font-bold text-slate-950 shadow-[0_4px_40px_rgba(245,158,11,0.35)] hover:bg-amber-400 hover:shadow-[0_4px_56px_rgba(245,158,11,0.52)] transition-all duration-200"
            >
              <AlertCircle className="h-5 w-5 transition-transform group-hover:rotate-12 duration-200" aria-hidden="true" />
              <span>{t("landing_report_btn")}</span>
              <ArrowRight className="h-4 w-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" aria-hidden="true" />
            </button>

            <Link
              href="/dashboard"
              className="group w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl glass glass-hover px-8 py-[1.1rem] text-base font-semibold text-white/55 transition-all duration-200 hover:text-white/80"
            >
              <span>{t("landing_view_dashboard")}</span>
              <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-200" aria-hidden="true" />
            </Link>
          </div>

          {/* Report method strip — staggered in below CTAs */}
          <div className="animate-fade-in delay-400 mt-14 glass-card p-6 max-w-2xl mx-auto">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/32 mb-5">
              {t("landing_report_using")}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: Camera,   label: t("landing_method_photo"), method: "photo", color: "amber" },
                { icon: Video,    label: t("landing_method_video"), method: "video", color: "blue"  },
                { icon: Mic,      label: t("landing_method_voice"), method: "voice", color: "green" },
                { icon: FileText, label: t("landing_method_text"),  method: "text",  color: "orange"},
              ].map(({ icon: Icon, label, method, color }) => (
                <button
                  key={method}
                  id={`method-${method}`}
                  onClick={() => goReport(method)}
                  className={`group btn-press flex items-center justify-center gap-2.5 rounded-xl border bg-white/[0.03] py-3 px-4 font-semibold text-white/50 text-sm transition-all duration-200
                    ${color === "amber"  ? "border-white/[0.07] hover:border-amber-400/45 hover:bg-amber-400/[0.07] hover:text-amber-400" : ""}
                    ${color === "blue"   ? "border-white/[0.07] hover:border-blue-400/45 hover:bg-blue-400/[0.07] hover:text-blue-400" : ""}
                    ${color === "green"  ? "border-white/[0.07] hover:border-green-400/45 hover:bg-green-400/[0.07] hover:text-green-400" : ""}
                    ${color === "orange" ? "border-white/[0.07] hover:border-orange-400/45 hover:bg-orange-400/[0.07] hover:text-orange-400" : ""}
                  `}
                >
                  <Icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110 duration-200" aria-hidden="true" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* PERFORMANCE PROOF — inline text, not hero-metric cards */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="py-10 border-y border-white/[0.05]" aria-label="Performance facts">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm text-white/38 font-medium">
            <span className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-amber-400/60" aria-hidden="true" />
              <strong className="text-white/85 font-bold">4.2 s</strong> avg. AI triage time
            </span>
            <span className="text-white/15 hidden sm:inline">|</span>
            <span className="flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5 text-green-400/60" aria-hidden="true" />
              <strong className="text-white/85 font-bold">98.7%</strong> dispatch accuracy
            </span>
            <span className="text-white/15 hidden sm:inline">|</span>
            <span className="flex items-center gap-2">
              <Shield className="h-3.5 w-3.5 text-blue-400/60" aria-hidden="true" />
              <strong className="text-white/85 font-bold">12 000+</strong> incidents handled
            </span>
            <span className="text-white/15 hidden sm:inline">|</span>
            <span className="flex items-center gap-2">
              <Radio className="h-3.5 w-3.5 text-amber-400/60" aria-hidden="true" />
              <strong className="text-white/85 font-bold">24/7</strong> AI monitoring
            </span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* HOW IT WORKS — no eyebrow kicker, heading carries weight*/}
      {/* ═══════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-24">
        <div className="mx-auto max-w-6xl px-6">

          {/* Heading stands alone — no kicker above it */}
          <div className="mb-16 max-w-xl">
            <h2 className="text-3xl font-bold text-white/92 sm:text-4xl tracking-tight leading-tight">
              {t("landing_how_it_works_title")}
            </h2>
            <p className="mt-4 text-sm text-white/40 leading-relaxed">
              Three automated steps between witnessing an emergency and the right responders arriving.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 relative">
            {/* Connector line — semantic, shows flow */}
            <div className="hidden md:block absolute top-8 left-[calc(33%+1.5rem)] right-[calc(33%+1.5rem)] h-px bg-gradient-to-r from-amber-400/20 via-blue-400/20 to-green-400/20" aria-hidden="true" />

            {HOW_IT_WORKS.map(({ icon: Icon, color, title, desc, sub }, idx) => (
              <div
                key={title}
                className="glass-card card-interactive p-8 relative group"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* Icon */}
                <div className={`mb-7 flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110
                  ${color === "amber" ? "glass-amber shadow-[0_0_20px_rgba(245,158,11,0.15)]" : ""}
                  ${color === "blue"  ? "glass-blue  shadow-[0_0_20px_rgba(59,130,246,0.15)]" : ""}
                  ${color === "green" ? "glass-green shadow-[0_0_20px_rgba(34,197,94,0.15)]"  : ""}
                `}>
                  <Icon className={`h-6 w-6
                    ${color === "amber" ? "text-amber-400" : ""}
                    ${color === "blue"  ? "text-blue-400"  : ""}
                    ${color === "green" ? "text-green-400" : ""}
                  `} aria-hidden="true" />
                </div>

                <h3 className="text-lg font-bold text-white/88 mb-2 tracking-tight">{title}</h3>
                <p className="text-sm font-semibold text-white/50 mb-2.5">{desc}</p>
                <p className="text-xs text-white/30 leading-relaxed">{sub}</p>

                {/* Hover bottom accent */}
                <div className={`absolute bottom-0 inset-x-8 h-px rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300
                  ${color === "amber" ? "bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" : ""}
                  ${color === "blue"  ? "bg-gradient-to-r from-transparent via-blue-400/40 to-transparent"  : ""}
                  ${color === "green" ? "bg-gradient-to-r from-transparent via-green-400/40 to-transparent" : ""}
                `} aria-hidden="true" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* ENTERPRISE TRUST — no kicker label                     */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section id="about" className="py-16 border-t border-white/[0.05]" aria-label="Illustrative enterprise deployments">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-center text-xs text-white/22 font-medium mb-10">
            {t("landing_enterprise_trust")} — <em>illustrative, not confirmed clients</em>
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {CLIENTS.map((name) => (
              <div key={name} className="flex items-center gap-2 text-white/28 text-sm font-semibold hover:text-white/50 transition-colors duration-200 cursor-default group">
                <Building2 className="h-4 w-4 text-white/15 group-hover:text-amber-400/45 transition-colors duration-200" aria-hidden="true" />
                <span>{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* CAPABILITIES — heading leads, no eyebrow kicker        */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="py-24 border-t border-white/[0.05]">
        <div className="mx-auto max-w-6xl px-6">

          <div className="mb-16 max-w-lg">
            <h2 className="text-3xl font-bold text-white/92 tracking-tight leading-tight">
              Built for real emergencies
            </h2>
            <p className="mt-4 text-sm text-white/40 leading-relaxed">
              Every capability exists to close the gap between incident and intervention.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, color, title, desc }, idx) => (
              <div
                key={title}
                className="glass-card card-interactive p-6 group animate-fade-in"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <div className={`mb-5 inline-flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-250 group-hover:scale-110
                  ${color === "amber" ? "glass-amber" : ""}
                  ${color === "blue"  ? "glass-blue"  : ""}
                  ${color === "green" ? "glass-green" : ""}
                  ${color === "red"   ? "glass-red"   : ""}
                `}>
                  <Icon className={`h-5 w-5
                    ${color === "amber" ? "text-amber-400" : ""}
                    ${color === "blue"  ? "text-blue-400"  : ""}
                    ${color === "green" ? "text-green-400" : ""}
                    ${color === "red"   ? "text-red-400"   : ""}
                  `} aria-hidden="true" />
                </div>
                <h3 className="text-[15px] font-bold text-white/85 mb-2 tracking-tight">{title}</h3>
                <p className="text-[13px] text-white/40 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* BOTTOM CTA — heading leads, no gradient text           */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="py-20 border-t border-white/[0.05]">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <div className="glass-card p-12 relative overflow-hidden">
            {/* Ambient tint — intentional, earns its place */}
            <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-br from-amber-500/[0.04] via-transparent to-red-500/[0.04]" aria-hidden="true" />

            {/* Heading carries its weight alone — no kicker above it */}
            <h2 className="text-3xl font-bold text-white/93 mb-3 tracking-tight">
              Every second counts.
            </h2>
            <p className="text-xl font-semibold text-amber-400 mb-5">Deploy in minutes. Save lives.</p>
            <p className="text-white/40 mb-9 leading-relaxed max-w-md mx-auto">
              AI-powered emergency response for your facility — no complex setup required.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => goReport()}
                id="cta-report-btn"
                className="btn-press group flex items-center gap-2.5 rounded-xl bg-amber-500 px-8 py-3.5 text-[15px] font-bold text-slate-950 shadow-[0_4px_32px_rgba(245,158,11,0.35)] hover:bg-amber-400 hover:shadow-[0_4px_48px_rgba(245,158,11,0.52)] transition-all duration-200"
              >
                <AlertTriangle className="h-4.5 w-4.5" aria-hidden="true" />
                Report Incident Now
              </button>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-sm font-semibold text-white/42 hover:text-white/68 transition-colors duration-200"
              >
                View Command Dashboard
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.05] py-10">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-5 text-xs text-white/25">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-white/62 text-sm hover:text-white/80 transition-colors">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg glass-amber">
              <Activity className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
            </div>
            <span>Rescue<span className="text-amber-400">Flow</span> AI</span>
          </Link>
          <p>{t("landing_footer_rights")}</p>
          <div className="flex gap-6">
            <Link href="/incidents" className="hover:text-white/52 transition-colors">{t("nav_incidents")}</Link>
            <Link href="/dashboard" className="hover:text-white/52 transition-colors">Dashboard</Link>
            <Link href="/report"    className="hover:text-white/52 transition-colors">{t("nav_report")}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
