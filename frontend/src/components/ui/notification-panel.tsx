"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, AlertTriangle, CheckCircle2, AlertOctagon, InboxIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIncidents } from "@/hooks/use-incidents";
import Link from "next/link";

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { incidents } = useIncidents();

  // Build notifications from real incidents (most recent 8)
  const notifications = [...incidents]
    .sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime())
    .slice(0, 8)
    .map((inc) => ({
      id:      inc.id,
      type:    inc.severity === "critical" ? "critical" as const
             : inc.severity === "high"     ? "warning"  as const
             :                               "info"      as const,
      title:   inc.title,
      message: inc.aiSummary || inc.description || `Incident reported at ${inc.location}`,
      time:    new Date(inc.reportedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      href:    `/incidents/${inc.id}`,
      isNew:   inc.status === "pending",
    }));

  const unreadCount = notifications.filter(n => n.isNew).length;

  const TYPE_CONFIG = {
    critical: { icon: AlertOctagon,  color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/20"    },
    warning:  { icon: AlertTriangle, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
    info:     { icon: Bell,          color: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/20"   },
    success:  { icon: CheckCircle2,  color: "text-green-400",  bg: "bg-green-500/10",  border: "border-green-500/20"  },
  };

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, x: 16, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 16, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed right-4 top-20 z-50 w-[360px] overflow-hidden rounded-2xl border border-white/[0.08] bg-card shadow-2xl shadow-black/40"
            role="dialog"
            aria-label="Notifications"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-amber-400" aria-hidden="true" />
                <span className="font-semibold text-foreground">Notifications</span>
                {unreadCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                aria-label="Close notifications"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Notifications list */}
            <div className="max-h-[420px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.04] border border-white/[0.08]">
                    <InboxIcon className="h-5 w-5 text-white/20" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white/40">No notifications yet</p>
                    <p className="text-xs text-white/25 mt-0.5">Report an incident to see alerts here</p>
                  </div>
                </div>
              ) : (
                notifications.map((notif, idx) => {
                  const { icon: Icon, color, bg, border } = TYPE_CONFIG[notif.type];
                  return (
                    <Link key={notif.id} href={notif.href} onClick={onClose}>
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className={cn(
                          "flex gap-3 border-b border-white/[0.04] px-4 py-3 transition-colors hover:bg-white/[0.04] cursor-pointer",
                          notif.isNew && "bg-white/[0.015]"
                        )}
                      >
                        <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border", bg, border)}>
                          <Icon className={cn("h-4 w-4", color)} aria-hidden="true" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className={cn("text-sm font-semibold", notif.isNew ? "text-foreground" : "text-muted-foreground")}>
                              {notif.title}
                            </p>
                            {notif.isNew && (
                              <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed line-clamp-2">{notif.message}</p>
                          <p className="mt-1 text-[10px] text-muted-foreground/60">{notif.time}</p>
                        </div>
                      </motion.div>
                    </Link>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-white/[0.06] px-4 py-3">
              <Link
                href="/incidents"
                onClick={() => onClose?.()}
                className="block w-full rounded-lg bg-amber-400/10 py-2 text-center text-xs font-semibold text-amber-400 transition-colors hover:bg-amber-400/15"
              >
                View All Incidents
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
