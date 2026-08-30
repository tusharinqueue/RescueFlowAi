"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronRight, AlertTriangle, Menu, X } from "lucide-react";
import { useState } from "react";
import { NotificationPanel } from "@/components/ui/notification-panel";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { Sidebar } from "@/components/navigation/sidebar";
import { useLanguage } from "@/lib/i18n/language-context";
import { useIncidents } from "@/hooks/use-incidents";

function useBreadcrumbs(t: (key: any) => string) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; href: string }[] = [
    { label: t("breadcrumb_home"), href: "/dashboard" },
  ];
  const routeMap: Record<string, any> = {
    "/dashboard":         "route_dashboard",
    "/incidents":         "route_incidents",
    "/dispatch":          "route_dispatch",
    "/analytics":         "route_analytics",
    "/map":               "route_map",
    "/settings":          "route_settings",
    "/settings/profile":  "route_profile",
    "/report":            "route_report",
  };
  let built = "";
  for (const seg of segments) {
    built += `/${seg}`;
    const key = routeMap[built];
    const label = key ? t(key) : seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    crumbs.push({ label, href: built });
  }
  return crumbs;
}

export function Navbar() {
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useLanguage();
  const crumbs      = useBreadcrumbs(t);
  
  const { incidents } = useIncidents();
  // We treat "pending" incidents as new/unread notifications
  const unreadCount = incidents.filter(i => i.status === "pending").length;
  
  // Generic user initials since we don't have real auth yet
  const initials    = "SO"; // Safety Officer

  return (
    <>
      <header
        aria-label="Top navigation bar"
        className="flex h-14 shrink-0 items-center justify-between px-4 md:px-6 z-30 glass-navbar"
      >
        <div className="flex items-center gap-2">
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex items-center justify-center h-8 w-8 rounded-lg bg-white/[0.06] border border-white/[0.08] text-white/70 hover:bg-white/[0.1] hover:text-white md:hidden"
          >
            <Menu className="h-4 w-4" />
          </button>

          {/* Left: breadcrumb */}
          <nav aria-label="Breadcrumbs" className="hidden sm:flex items-center gap-1.5 text-xs text-white/40">
          {crumbs.map((crumb, idx) => {
            const isLast = idx === crumbs.length - 1;
            return (
              <span key={`${crumb.href}-${idx}`} className="flex items-center gap-1.5">
                {idx > 0 && <ChevronRight className="h-3 w-3 text-white/20" aria-hidden="true" />}
                {isLast ? (
                  <span className="font-semibold text-white/80">{crumb.label}</span>
                ) : (
                  <Link href={crumb.href} className="hover:text-white/70 transition-colors font-medium">
                    {crumb.label}
                  </Link>
                )}
              </span>
            );
          })}
        </nav>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2.5">
          {/* Language Switcher — replaces search */}
          <LanguageSwitcher />

          {/* Report Incident CTA */}
          <Link
            href="/report"
            className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-all shadow-[0_0_16px_rgba(245,158,11,0.3)]"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>{t("dashboard_report_btn")}</span>
          </Link>

          {/* Notifications */}
          <button
            onClick={() => setNotifOpen(true)}
            className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/50 hover:bg-white/[0.10] hover:text-white/80 transition-colors"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-extrabold text-white shadow-[0_0_8px_rgba(239,68,68,0.6)]">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Avatar */}
          <Link
            href="/settings/profile"
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400/15 text-amber-400 font-bold text-xs ring-1 ring-amber-400/25 hover:ring-amber-400/50 hover:bg-amber-400/20 transition-all"
          >
            {initials}
          </Link>
        </div>
      </header>

      <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
      
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative z-50 h-full w-[240px] flex-col shadow-2xl animate-in slide-in-from-left duration-200">
            <Sidebar isMobile onClose={() => setMobileMenuOpen(false)} />
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 -right-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-md"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
