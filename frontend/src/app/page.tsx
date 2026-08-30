"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity, Brain, Camera, Video, Mic, FileText,
  ChevronRight, Building2, Users, Globe
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { Language } from "@/lib/i18n/translations";

const CLIENTS = ["Tata Steel", "Siemens", "Bharat Steel", "NTPC", "L&T Construction", "Coal India"];

const LANGS: { code: Language; label: string; name: string }[] = [
  { code: "en", label: "EN", name: "English" },
  { code: "hi", label: "HI", name: "हिन्दी" },
  { code: "pa", label: "PA", name: "ਪੰਜਾਬੀ" },
];

export default function LandingPage() {
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();
  const [langOpen, setLangOpen] = useState(false);

  const HOW_IT_WORKS = [
    { step: "1", icon: Camera, title: t("landing_step1_title"), desc: t("landing_step1_desc"), sub: t("landing_step1_sub") },
    { step: "2", icon: Brain,  title: t("landing_step2_title"), desc: t("landing_step2_desc"), sub: t("landing_step2_sub") },
    { step: "3", icon: Users,  title: t("landing_step3_title"), desc: t("landing_step3_desc"), sub: t("landing_step3_sub") },
  ];

  const goReport = (method?: string) =>
    router.push(method ? `/report?method=${method}` : "/report");

  const currentLang = LANGS.find(l => l.code === language) || LANGS[0]!;

  return (
    <div className="min-h-screen font-sans antialiased text-white/85">

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 glass-navbar">
        <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6" aria-label="Main navigation">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl glass-amber shadow-[0_0_12px_rgba(245,158,11,0.3)]">
              <Activity className="h-4 w-4 text-amber-400" aria-hidden="true" />
            </div>
            <span className="text-[15px] font-bold tracking-tight text-white/90">
              Rescue<span className="text-amber-400">FlowAI</span>
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex text-sm font-medium text-white/45">
            <Link href="/" className="hover:text-white/80 transition-colors">{t("landing_home")}</Link>
            <Link href="#how-it-works" className="hover:text-white/80 transition-colors">{t("landing_how_it_works")}</Link>
            <Link href="/dashboard" className="hover:text-white/80 transition-colors">Dashboard</Link>
            <Link href="#about" className="hover:text-white/80 transition-colors">{t("landing_about")}</Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* ── Premium Language Switcher ── */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(prev => !prev)}
                className="flex items-center gap-1.5 rounded-xl border border-white/[0.12] bg-white/[0.05] px-2.5 py-2 text-xs font-bold text-white/70 hover:border-amber-400/40 hover:bg-white/[0.09] hover:text-white transition-all"
              >
                <Globe className="h-3.5 w-3.5 text-amber-400" />
                <span>{currentLang.label}</span>
                <span className="text-white/25 text-[10px]">▾</span>
              </button>

              {langOpen && (
                <div className="absolute right-0 top-[calc(100%+8px)] z-50 min-w-[140px] overflow-hidden rounded-xl border border-white/[0.12] bg-[#0d1220] shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                  <div className="px-3 py-2 border-b border-white/[0.06]">
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/25">Language</p>
                  </div>
                  {LANGS.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => { setLanguage(lang.code); setLangOpen(false); }}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-xs font-semibold transition-colors hover:bg-white/[0.07] ${
                        language === lang.code
                          ? "text-amber-400 bg-amber-500/10"
                          : "text-white/60"
                      }`}
                    >
                      <span className="font-black text-[10px] tracking-widest w-6 shrink-0 opacity-70">{lang.label}</span>
                      <span className="flex-1">{lang.name}</span>
                      {language === lang.code && (
                        <span className="text-amber-400 text-[10px]">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Login — hidden on mobile */}
            <Link href="/login" className="hidden sm:block text-sm font-medium text-white/40 hover:text-white/70 px-3 py-2 transition-colors">
              {t("landing_login")}
            </Link>

            {/* Report button — icon-only on mobile, full text on sm+ */}
            <button
              onClick={() => goReport()}
              className="flex items-center gap-2 rounded-xl bg-amber-500 px-3 sm:px-4 py-2 text-sm font-bold text-slate-950 shadow-[0_0_16px_rgba(245,158,11,0.3)] hover:bg-amber-400 transition-all active:scale-95"
            >
              <span>🚨</span>
              <span className="hidden sm:inline">{t("landing_report_btn")}</span>
            </button>
          </div>
        </nav>
      </header>

      {/* Click-outside dismiss */}
      {langOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
      )}

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden pt-24 pb-24 lg:pt-32 lg:pb-32">
        <div className="mx-auto max-w-5xl px-6 text-center">

          <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/10 border border-amber-400/20 px-4 py-1.5 text-xs font-bold text-amber-400 mb-8 tracking-wide">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse inline-block" />
            {t("landing_powered_by")}
          </div>

          <h1 className="text-5xl font-extrabold tracking-tight text-white/95 sm:text-6xl lg:text-7xl leading-[1.08]">
            {t("landing_hero_title1")}<br />
            <span className="text-amber-400">{t("landing_hero_title2")}</span>
          </h1>

          <p className="mt-6 mx-auto max-w-2xl text-lg text-white/45 leading-relaxed">
            {t("landing_hero_desc")}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => goReport()}
              className="w-full sm:w-auto flex items-center justify-center gap-3 rounded-2xl bg-amber-500 px-8 py-4 text-lg font-bold text-slate-950 shadow-[0_0_32px_rgba(245,158,11,0.35)] hover:bg-amber-400 hover:shadow-[0_0_40px_rgba(245,158,11,0.5)] transition-all active:scale-[0.98]"
            >
              <span className="text-xl">🚨</span>
              <span>{t("landing_report_btn")}</span>
            </button>

            <Link
              href="/dashboard"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl glass glass-hover px-7 py-4 text-base font-semibold text-white/70 transition-all"
            >
              <span>{t("landing_view_dashboard")}</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Report Method Strip */}
          <div className="mt-14 glass-card p-6 max-w-2xl mx-auto">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-4">
              {t("landing_report_using")}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: Camera,   label: t("landing_method_photo"), method: "photo" },
                { icon: Video,    label: t("landing_method_video"), method: "video" },
                { icon: Mic,      label: t("landing_method_voice"), method: "voice" },
                { icon: FileText, label: t("landing_method_text"),  method: "text"  },
              ].map(({ icon: Icon, label, method }) => (
                <div
                  key={method}
                  onClick={() => goReport(method)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-white/[0.04] border border-white/[0.08] py-3 px-4 font-semibold text-white/60 text-sm hover:border-amber-400/50 hover:bg-amber-400/[0.08] hover:text-amber-400 cursor-pointer transition-all"
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-20 border-t border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-2">{t("landing_simple_workflow")}</p>
            <h2 className="text-3xl font-extrabold text-white/90 sm:text-4xl">{t("landing_how_it_works_title")}</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {HOW_IT_WORKS.map(({ step, icon: Icon, title, desc, sub }) => (
              <div
                key={step}
                className="glass-card p-8 hover:border-amber-400/20 transition-all"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl glass-amber shadow-[0_0_16px_rgba(245,158,11,0.2)]">
                    <Icon className="h-6 w-6 text-amber-400" />
                  </div>
                  <span className="text-4xl font-black text-white/[0.06] font-mono">0{step}</span>
                </div>
                <h3 className="text-lg font-bold text-white/85 mb-1">{step}. {title}</h3>
                <p className="text-sm font-semibold text-white/55 mb-2">{desc}</p>
                <p className="text-xs text-white/30 leading-relaxed">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Enterprise Trust Bar ── */}
      <section id="about" className="py-16 border-t border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-8">
            {t("landing_enterprise_trust")}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 text-white/35 text-sm font-semibold">
            {CLIENTS.map((name) => (
              <div key={name} className="flex items-center gap-2 hover:text-white/60 transition-colors">
                <Building2 className="h-4 w-4 text-white/20" />
                <span>{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.06] py-10">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/25">
          <div className="flex items-center gap-2 font-bold text-white/70 text-sm">
            <Activity className="h-4 w-4 text-amber-400" />
            <span>RescueFlowAI</span>
          </div>
          <p>{t("landing_footer_rights")}</p>
          <div className="flex gap-6">
            <Link href="/login"     className="hover:text-white/60 transition-colors">{t("landing_login")}</Link>
            <Link href="/dashboard" className="hover:text-white/60 transition-colors">Dashboard</Link>
            <Link href="/report"    className="hover:text-white/60 transition-colors">{t("nav_report")}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
