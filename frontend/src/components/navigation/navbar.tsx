"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronRight, AlertTriangle, Menu, X, Clock } from "lucide-react";
import { useState, useEffect } from "react";
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
    "/dashboard":        "route_dashboard",
    "/incidents":        "route_incidents",
    "/dispatch":         "route_dispatch",
    "/analytics":        "route_analytics",
    "/map":              "route_map",
    "/settings":         "route_settings",
    "/settings/profile": "route_profile",
    "/report":           "route_report",
  };
  let built = "";
  for (const seg of segments) {
    built += `/${seg}`;
    const key = routeMap[built];
    const label = key
      ? t(key)
      : seg.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    crumbs.push({ label, href: built });
  }
  return crumbs;
}

function LiveClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const update = () => {
      setTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="hidden lg:flex items-center gap-1.5 h-8 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5">
      <Clock className="h-3.5 w-3.5 text-amber-400/70" />
      <span className="font-mono text-xs font-medium text-white/60 tracking-wider">{time}</span>
    </div>
  );
}

export function Navbar() {
  const [notifOpen,      setNotifOpen]      = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t }       = useLanguage();
  const crumbs      = useBreadcrumbs(t);
  const { incidents } = useIncidents();

  // Pending = unread
  const unreadCount   = incidents.filter(i => i.status === "pending").length;
  const criticalCount = incidents.filter(i => i.severity === "critical" && i.status !== "resolved").length;
  const initials      = "SO";

  return (
    <>
      <header
        aria-label="Top navigation bar"
        className="flex h-14 shrink-0 items-center justify-between px-4 md:px-6 z-30 glass-navbar"
      >
        {/* Left */}
        <div className="flex items-center gap-3">
          {/* Mobile menu toggle */}
          <button
            id="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
            className="flex items-center justify-center h-8 w-8 rounded-lg bg-white/[0.05] border border-white/[0.07] text-white/60 hover:bg-white/[0.09] hover:text-white transition-colors duration-200 md:hidden"
          >
            <Menu className="h-4 w-4" />
          </button>

          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumbs" className="hidden sm:flex items-center gap-1.5 text-xs text-white/35">
            {crumbs.map((crumb, idx) => {
              const isLast = idx === crumbs.length - 1;
              return (
                <span key={`${crumb.href}-${idx}`} className="flex items-center gap-1.5">
                  {idx > 0 && (
                    <ChevronRight className="h-3 w-3 text-white/18" aria-hidden="true" />
                  )}
                  {isLast ? (
                    <span className="font-bold text-white/80">{crumb.label}</span>
                  ) : (
                    <Link
                      href={crumb.href}
                      className="font-medium hover:text-white/65 transition-colors duration-200"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </span>
              );
            })}
          </nav>

          {/* Critical alert pill (visible when critical incidents exist) */}
          {criticalCount > 0 && (
            <Link
              href="/incidents"
              className="hidden sm:flex items-center gap-1.5 rounded-xl bg-red-500/12 border border-red-500/25 px-2.5 py-1 text-[10px] font-bold text-red-400 hover:bg-red-500/20 transition-all duration-200 animate-alert"
            >
              <AlertTriangle className="h-3 w-3" />
              {criticalCount} Critical
            </Link>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Live clock */}
          <LiveClock />

          {/* Language switcher */}
          <LanguageSwitcher />

          {/* Report CTA */}
          <Link
            href="/report"
            id="navbar-report-btn"
            className="flex items-center gap-1.5 h-8 rounded-lg bg-amber-500 hover:bg-amber-400 px-3 text-xs font-semibold text-slate-950 transition-all duration-150 shadow-sm"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t("dashboard_report_btn")}</span>
            <span className="sm:hidden">SOS</span>
          </Link>

          {/* Notifications */}
          <button
            id="notif-btn"
            onClick={() => setNotifOpen(true)}
            aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
            className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/50 hover:bg-white/[0.08] hover:text-white transition-colors duration-150"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[8px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User avatar */}
          <Link
            href="/settings/profile"
            id="user-avatar-btn"
            aria-label="Go to profile settings"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 border border-amber-400/25 text-amber-400 font-bold text-xs hover:border-amber-400/50 hover:bg-amber-500/20 transition-all duration-150"
          >
            {initials}
          </Link>
        </div>
      </header>

      <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden animate-fade-in">
          <div
            className="fixed inset-0 bg-black/65 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-50 h-full w-[248px] flex-col shadow-2xl animate-slide-left">
            <Sidebar isMobile onClose={() => setMobileMenuOpen(false)} />
            <button
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close navigation menu"
              className="absolute top-4 -right-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/12 text-white hover:bg-white/20 backdrop-blur-md transition-colors duration-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
