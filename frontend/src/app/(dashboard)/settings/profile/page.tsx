"use client";

import { useState } from "react";
import { User, Mail, Phone, Building2, MapPin, Shield, Camera, Save, Award, Activity, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

// Fallback initial state for the profile
const DEFAULT_USER = {
  name: "Arjun Mehta",
  email: "arjun.m@techcorp.com",
  phone: "+91 98765 43210",
  company: "TechCorp Industries",
  department: "Safety & Compliance",
  location: "Mumbai Facility, Zone B",
  role: "Safety Officer",
};

export default function ProfilePage() {
  const [form, setForm] = useState(DEFAULT_USER);
  const [saved, setSaved] = useState(false);
  const { t } = useLanguage();
  const initials = form.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-extrabold text-white/90">{t("profile_title")}</h1>
        <p className="text-xs text-white/40">{t("profile_subtitle")}</p>
      </div>

      {/* Profile Header Card */}
      <div className="glass-card p-6 shadow-xs flex flex-col sm:flex-row items-center gap-6">
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/[0.08] text-amber-400 font-extrabold text-2xl shadow-md">
            {initials}
          </div>
          <button className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500 text-slate-950 shadow-xs hover:bg-amber-400">
            <Camera className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="text-center sm:text-left space-y-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="text-xl font-extrabold text-white/90">{form.name}</h2>
            <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
              {t("profile_verified")}
            </span>
          </div>
          <p className="text-xs text-white/40">{form.role} • {form.department}</p>
          <p className="text-xs font-semibold text-white/70">📍 {form.company} — {form.location}</p>
        </div>
      </div>

      {/* Information Form Card */}
      <div className="glass-card p-6 shadow-xs space-y-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 border-b border-white/[0.08] pb-2">
          {t("profile_personal_info")}
        </h3>

        <form onSubmit={(e) => { e.preventDefault(); setSaved(true); setTimeout(() => setSaved(false), 3000); }} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-white/70 block">{t("profile_full_name")}</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs font-bold text-white/90 focus:border-amber-500 outline-none placeholder:text-white/30"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-white/70 block">{t("profile_work_email")}</label>
              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs font-bold text-white/90 focus:border-amber-500 outline-none placeholder:text-white/30"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-white/70 block">{t("profile_phone")}</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs font-bold text-white/90 focus:border-amber-500 outline-none placeholder:text-white/30"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-white/70 block">{t("profile_department")}</label>
              <input
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs font-bold text-white/90 focus:border-amber-500 outline-none placeholder:text-white/30"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-all shadow-xs"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{t("profile_save")}</span>
            </button>
            {saved && <span className="text-xs font-bold text-emerald-400">{t("profile_saved")}</span>}
          </div>
        </form>
      </div>

    </div>
  );
}
