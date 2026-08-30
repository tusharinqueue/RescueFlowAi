"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, AlertTriangle, Radio,
  BarChart2, FileText, Settings, Activity,
  User, Shield, PlusCircle, Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";
import { useIncidents } from "@/hooks/use-incidents";

export function Sidebar({ isMobile, onClose }: { isMobile?: boolean; onClose?: () => void } = {}) {
  const pathname  = usePathname();
  const initials  = "SO"; // Safety Officer
  const { t } = useLanguage();
  const { incidents } = useIncidents();
  
  const activeIncidentsCount = incidents.filter(i => i.status !== "resolved").length;

  const NAV_ITEMS = [
    { labelKey: "nav_overview",  href: "/dashboard",              icon: LayoutDashboard, badge: null },
    { labelKey: "nav_incidents", href: "/incidents",              icon: AlertTriangle,   badge: activeIncidentsCount },
    { labelKey: "nav_report",    href: "/report",                 icon: PlusCircle,      badge: null },
    { labelKey: "nav_teams",     href: "/dispatch",               icon: Users,           badge: null },
    { labelKey: "nav_analytics", href: "/analytics",              icon: BarChart2,       badge: null },
    { labelKey: "nav_reports",   href: "/incidents?view=reports", icon: FileText,        badge: null },
  ] as const;

  const BOTTOM_NAV = [
    { labelKey: "nav_profile",  href: "/settings/profile", icon: User     },
    { labelKey: "nav_settings", href: "/settings",          icon: Settings },
  ] as const;

  return (
    <aside
      aria-label="Main navigation"
      className={cn(
        "w-[240px] shrink-0 flex-col glass-sidebar",
        isMobile ? "flex h-full" : "hidden md:flex"
      )}
    >
      {/* Logo */}
      <Link
        href="/"
        onClick={() => onClose?.()}
        className="flex h-16 items-center gap-2.5 px-5 border-b border-white/[0.07] hover:bg-white/[0.04] transition-colors"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-xl glass-amber ring-0 shadow-[0_0_12px_rgba(245,158,11,0.25)]">
          <Activity className="h-4 w-4 text-amber-400" aria-hidden="true" />
        </div>
        <span className="font-bold tracking-tight text-white/90 text-[15px]">
          Rescue<span className="text-amber-400">FlowAI</span>
        </span>
      </Link>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto p-3" aria-label="Main menu">
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-white/30">
          {t("nav_navigation")}
        </p>
        <ul className="space-y-0.5" role="list">
          {NAV_ITEMS.map(({ labelKey, href, icon: Icon, badge }) => {
            const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <li key={href} className="relative">
                <Link
                  href={href}
                  onClick={() => onClose?.()}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150",
                    isActive
                      ? "nav-item-active font-semibold"
                      : "text-white/50 hover:text-white/80 hover:bg-white/[0.05]"
                  )}
                >
                  <Icon
                    className={cn("h-4 w-4 shrink-0 transition-colors",
                      isActive ? "text-amber-400" : "text-white/35 group-hover:text-white/60"
                    )}
                    aria-hidden="true"
                  />
                  <span className="flex-1">{t(labelKey as any)}</span>
                  {badge !== null && badge > 0 && (
                    <span className={cn(
                      "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-extrabold",
                      isActive
                        ? "bg-amber-400/20 text-amber-300"
                        : "bg-red-500/20 text-red-400 border border-red-500/25"
                    )}>
                      {badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Secondary nav */}
        <p className="mb-2 mt-6 px-3 text-[10px] font-bold uppercase tracking-widest text-white/30">
          {t("nav_system")}
        </p>
        <ul className="space-y-0.5" role="list">
          {BOTTOM_NAV.map(({ labelKey, href, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => onClose?.()}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-white/[0.08] text-white/90"
                      : "text-white/40 hover:bg-white/[0.05] hover:text-white/70"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{t(labelKey as any)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Footer */}
      <div className="border-t border-white/[0.07] p-3">
        <div className="flex items-center gap-3 rounded-xl bg-white/[0.05] border border-white/[0.07] p-2.5 hover:bg-white/[0.08] transition-colors">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-400/15 text-amber-400 text-xs font-black ring-1 ring-amber-400/25">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-white/90">Arjun Mehta</p>
            <p className="truncate text-[10px] text-white/40">Safety Officer</p>
          </div>
          <Shield className="h-4 w-4 text-emerald-400/80 shrink-0" />
        </div>
      </div>
    </aside>
  );
}
