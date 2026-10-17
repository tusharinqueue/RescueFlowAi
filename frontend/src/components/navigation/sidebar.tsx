"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  AlertTriangle,
  Users,
  BarChart2,
  Settings,
  Menu,
  ChevronRight,
  PlusCircle,
  Radio,
  Activity,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";
import { useIncidents } from "@/hooks/use-incidents";
import { DangerZoneAlertsButton } from "@/components/dashboard/danger-zone-alerts-button";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SidebarProps {
  isMobile?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isMobile, onClose }: SidebarProps = {}) {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();
  const { t } = useLanguage();
  const { incidents } = useIncidents();

  const activeIncidentsCount = incidents.filter((i) => i.status !== "resolved").length;
  const criticalCount = incidents.filter(
    (i) => i.severity === "critical" && i.status !== "resolved"
  ).length;

  const isOverviewActive = pathname === "/dashboard" || pathname === "/";
  const isIncidentsActive = pathname.startsWith("/incidents");
  const isDispatchActive = pathname.startsWith("/dispatch");
  const isAnalyticsActive = pathname.startsWith("/analytics");
  const isSettingsActive = pathname.startsWith("/settings");

  // On mobile overlay drawer, always expand full width
  const effectiveOpen = isMobile ? true : isOpen;

  return (
    <aside
      aria-label="Main navigation"
      className={cn(
        effectiveOpen ? "w-64" : "w-16",
        "flex flex-col border-r border-white/[0.08] transition-all duration-300 ease-in-out glass-sidebar shrink-0",
        isMobile ? "h-full w-64" : "h-screen hidden md:flex sticky top-0"
      )}
    >
      {/* ── Top Header / Logo / Collapse Toggle ── */}
      <div className="flex h-14 items-center justify-between border-b border-white/[0.08] px-3.5">
        <Link
          href="/"
          onClick={() => onClose?.()}
          className="group flex items-center gap-2.5 overflow-hidden transition-opacity hover:opacity-95"
        >
          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 border border-amber-400/30">
            <Activity className="h-4 w-4 text-amber-400" aria-hidden="true" />
            <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-emerald-400 border border-[#080d17]" />
          </div>

          {effectiveOpen && (
            <div className="flex flex-col leading-tight min-w-0">
              <span className="text-sm font-bold tracking-tight text-white/90">
                Rescue<span className="text-amber-400">Flow</span>
                <span className="text-[10px] font-mono text-white/40 ml-1">AI</span>
              </span>
              <span className="text-[10px] text-white/40 font-medium">Command Centre</span>
            </div>
          )}
        </Link>

        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/[0.06] shrink-0"
            title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            <Menu className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* ── System Status ── */}
      {effectiveOpen ? (
        <div className="mx-3 mt-3 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center gap-2.5">
          <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white/80 truncate">System Operational</p>
            <p className="text-[10px] text-white/40 truncate">All channels active</p>
          </div>
        </div>
      ) : (
        <div
          className="mx-auto mt-3 flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.03] border border-white/[0.06]"
          title="System Operational: All channels active"
        >
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
        </div>
      )}

      {/* ── Scrollable Nav ── */}
      <ScrollArea className="flex-1">
        <nav className="p-2 space-y-1" aria-label="Main navigation menu">
          {effectiveOpen && (
            <p className="mb-1.5 px-3 pt-2 text-[10px] font-semibold uppercase tracking-wider text-white/35">
              {t("nav_navigation")}
            </p>
          )}

          {/* Home / Overview */}
          <Link href="/dashboard" onClick={() => onClose?.()}>
            <Button
              variant="ghost"
              className={cn(
                "w-full text-xs font-medium transition-all duration-150",
                effectiveOpen ? "justify-start px-3 h-9" : "justify-center px-0 h-9",
                isOverviewActive
                  ? "bg-white/[0.08] text-white font-semibold border border-white/10"
                  : "text-white/60 hover:text-white hover:bg-white/[0.05]"
              )}
              title={!effectiveOpen ? "Overview Dashboard" : undefined}
            >
              <Home
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  effectiveOpen && "mr-2.5",
                  isOverviewActive ? "text-amber-400" : "text-white/45"
                )}
              />
              {effectiveOpen && <span>{t("nav_overview")}</span>}
            </Button>
          </Link>

          {/* Incidents (Collapsible Submenu when open, Direct Icon when collapsed) */}
          {effectiveOpen ? (
            <Collapsible defaultOpen={true}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "group w-full justify-start text-xs font-medium px-3 h-9 transition-all duration-150",
                    isIncidentsActive
                      ? "bg-white/[0.08] text-white font-semibold border border-white/10"
                      : "text-white/60 hover:text-white hover:bg-white/[0.05]"
                  )}
                >
                  <AlertTriangle
                    className={cn(
                      "mr-2.5 h-4 w-4 shrink-0 transition-colors",
                      isIncidentsActive ? "text-amber-400" : "text-white/45"
                    )}
                  />
                  <span className="flex-1 text-left truncate">{t("nav_incidents")}</span>
                  {activeIncidentsCount > 0 && (
                    <span
                      className={cn(
                        "mr-1.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-mono font-bold",
                        criticalCount > 0
                          ? "bg-red-500/20 text-red-300 border border-red-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      )}
                    >
                      {activeIncidentsCount}
                    </span>
                  )}
                  <ChevronRight className="ml-auto h-3.5 w-3.5 text-white/35 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="ml-3 pl-3 border-l border-white/10 space-y-0.5 mt-1">
                <Link href="/incidents" onClick={() => onClose?.()}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start h-7 px-2 text-xs text-white/55 hover:text-white hover:bg-white/[0.04] rounded-md"
                  >
                    All Incidents ({activeIncidentsCount})
                  </Button>
                </Link>
                <Link href="/dispatch" onClick={() => onClose?.()}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start h-7 px-2 text-xs text-white/55 hover:text-white hover:bg-white/[0.04] rounded-md"
                  >
                    Emergency Dispatch
                  </Button>
                </Link>
                <Link href="/incidents?view=reports" onClick={() => onClose?.()}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start h-7 px-2 text-xs text-white/55 hover:text-white hover:bg-white/[0.04] rounded-md"
                  >
                    Verified Reports
                  </Button>
                </Link>
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <Link href="/incidents" onClick={() => onClose?.()}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-center px-0 h-9 transition-colors",
                  isIncidentsActive
                    ? "bg-white/[0.08] text-amber-400 border border-white/10"
                    : "text-white/45 hover:text-white hover:bg-white/[0.05]"
                )}
                title={`Incidents (${activeIncidentsCount} active)`}
              >
                <AlertTriangle className="h-4 w-4" />
              </Button>
            </Link>
          )}

          {/* Teams / Dispatch */}
          <Link href="/dispatch" onClick={() => onClose?.()}>
            <Button
              variant="ghost"
              className={cn(
                "w-full text-xs font-medium transition-all duration-150",
                effectiveOpen ? "justify-start px-3 h-9" : "justify-center px-0 h-9",
                isDispatchActive
                  ? "bg-white/[0.08] text-white font-semibold border border-white/10"
                  : "text-white/60 hover:text-white hover:bg-white/[0.05]"
              )}
              title={!effectiveOpen ? "Emergency Teams / Dispatch" : undefined}
            >
              <Users
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  effectiveOpen && "mr-2.5",
                  isDispatchActive ? "text-amber-400" : "text-white/45"
                )}
              />
              {effectiveOpen && <span>{t("nav_teams")}</span>}
            </Button>
          </Link>

          {/* Analytics */}
          <Link href="/analytics" onClick={() => onClose?.()}>
            <Button
              variant="ghost"
              className={cn(
                "w-full text-xs font-medium transition-all duration-150",
                effectiveOpen ? "justify-start px-3 h-9" : "justify-center px-0 h-9",
                isAnalyticsActive
                  ? "bg-white/[0.08] text-white font-semibold border border-white/10"
                  : "text-white/60 hover:text-white hover:bg-white/[0.05]"
              )}
              title={!effectiveOpen ? "Analytics & Trends" : undefined}
            >
              <BarChart2
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  effectiveOpen && "mr-2.5",
                  isAnalyticsActive ? "text-amber-400" : "text-white/45"
                )}
              />
              {effectiveOpen && <span>{t("nav_analytics")}</span>}
            </Button>
          </Link>

          {/* Settings */}
          <Link href="/settings" onClick={() => onClose?.()}>
            <Button
              variant="ghost"
              className={cn(
                "w-full text-xs font-medium transition-all duration-150",
                effectiveOpen ? "justify-start px-3 h-9" : "justify-center px-0 h-9",
                isSettingsActive
                  ? "bg-white/[0.08] text-white font-semibold border border-white/10"
                  : "text-white/60 hover:text-white hover:bg-white/[0.05]"
              )}
              title={!effectiveOpen ? "Settings & System Config" : undefined}
            >
              <Settings
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  effectiveOpen && "mr-2.5",
                  isSettingsActive ? "text-white" : "text-white/45"
                )}
              />
              {effectiveOpen && <span>{t("nav_settings")}</span>}
            </Button>
          </Link>

          {/* ── Actions CTA Area (Report Incident & Danger Zone Alerts) ── */}
          {effectiveOpen ? (
            <div className="mt-4 px-1 space-y-2 pt-3 border-t border-white/[0.08]">
              <Link
                href="/report"
                onClick={() => onClose?.()}
                id="sidebar-report-cta"
                className="flex items-center justify-center gap-2 w-full h-9 rounded-xl bg-amber-500 hover:bg-amber-400 px-3 text-xs font-semibold text-slate-950 transition-all duration-150 shadow-sm"
              >
                <PlusCircle className="h-4 w-4" />
                Report Incident
              </Link>
              <DangerZoneAlertsButton variant="sidebar" />
            </div>
          ) : (
            <div className="mt-4 px-1 flex flex-col items-center space-y-2 pt-3 border-t border-white/[0.08]">
              <Link
                href="/report"
                onClick={() => onClose?.()}
                title="Report Incident"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm transition-all duration-150"
              >
                <PlusCircle className="h-4 w-4" />
              </Link>
              <DangerZoneAlertsButton variant="compact" />
            </div>
          )}
        </nav>
      </ScrollArea>

      {/* ── User Footer with Avatar ── */}
      {effectiveOpen ? (
        <div className="border-t border-white/[0.08] p-3">
          <div className="flex items-center gap-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] p-2 hover:bg-white/[0.06] transition-all duration-150 cursor-pointer">
            <Avatar className="h-8 w-8 border border-white/10">
              <AvatarImage
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="Arjun Mehta"
              />
              <AvatarFallback className="bg-amber-500/15 text-amber-300 font-bold text-xs">
                AM
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white/90">Arjun Mehta</p>
              <p className="truncate text-[10px] text-white/40">Safety Officer</p>
            </div>
            <Shield className="h-3.5 w-3.5 text-white/30 shrink-0" />
          </div>
        </div>
      ) : (
        <div className="border-t border-white/[0.08] p-2 flex justify-center">
          <Avatar
            className="h-8 w-8 border border-white/10 cursor-pointer"
            title="Arjun Mehta (Safety Officer)"
          >
            <AvatarImage
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              alt="Arjun Mehta"
            />
            <AvatarFallback className="bg-amber-500/15 text-amber-300 font-bold text-xs">
              AM
            </AvatarFallback>
          </Avatar>
        </div>
      )}
    </aside>
  );
}

export const Sidenavbar = Sidebar;
export default Sidebar;
