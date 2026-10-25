"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/employee/PageHeader";
import { EpButton } from "@/components/employee/EpButton";
import { SkeletonCard } from "@/components/employee/SkeletonCard";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  ExternalLink,
  AlertTriangle,
  Clock,
} from "lucide-react";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [clearingRead, setClearingRead] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<"ALL" | "UNREAD">("ALL");

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/employee/notifications");
      const data = await res.json();
      if (data.success && Array.isArray(data.notifications)) {
        setItems(data.notifications);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const markRead = async (id: string) => {
    try {
      await fetch("/api/v1/employee/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch {
      // ignore
    }
  };

  const markAllAsRead = async () => {
    try {
      setMarkingAll(true);
      await fetch("/api/v1/employee/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // ignore
    } finally {
      setMarkingAll(false);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      setDeletingId(id);
      const res = await fetch("/api/v1/employee/notifications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        setItems((prev) => prev.filter((n) => n.id !== id));
      }
    } catch {
      // ignore
    } finally {
      setDeletingId(null);
    }
  };

  const clearAllRead = async () => {
    try {
      setClearingRead(true);
      const res = await fetch("/api/v1/employee/notifications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clearAllRead: true }),
      });
      const data = await res.json();
      if (data.success) {
        setItems((prev) => prev.filter((n) => !n.isRead));
      }
    } catch {
      // ignore
    } finally {
      setClearingRead(false);
    }
  };

  const unreadCount = useMemo(() => items.filter((n) => !n.isRead).length, [items]);
  const hasReadItems = useMemo(() => items.some((n) => n.isRead), [items]);

  const displayedItems = useMemo(() => {
    if (filterMode === "UNREAD") return items.filter((n) => !n.isRead);
    return items;
  }, [items, filterMode]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "WARNING":
      case "ALERT":
        return <AlertTriangle className="w-4 h-4 text-[#C9A15B]" />;
      case "SUCCESS":
        return <Check className="w-4 h-4 text-[#5FAE7E]" />;
      default:
        return <Bell className="w-4 h-4 text-[#4F9D83]" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6 max-w-5xl pb-12"
    >
      {/* Page Header */}
      <PageHeader
        title="Notifications & Alerts"
        subtitle="System updates, task status changes, leave approvals, and workspace reminders."
        icon={Bell}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {unreadCount > 0 && (
              <EpButton
                size="sm"
                variant="primary"
                onClick={markAllAsRead}
                loading={markingAll}
                className="text-xs h-8 px-3"
              >
                <CheckCheck className="w-3.5 h-3.5 mr-1.5" />
                <span>Mark All Read</span>
              </EpButton>
            )}

            {hasReadItems && (
              <EpButton
                size="sm"
                variant="secondary"
                onClick={clearAllRead}
                loading={clearingRead}
                className="text-xs h-8 px-3 text-[#8A867E] hover:text-[#C46A62]"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                <span>Clear Read</span>
              </EpButton>
            )}
          </div>
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#2E2E30] pb-2 text-xs">
        <button
          onClick={() => setFilterMode("ALL")}
          className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
            filterMode === "ALL"
              ? "bg-[#232324] text-[#EDEBE6] border border-[#2E2E30]"
              : "text-[#8A867E] hover:text-[#EDEBE6]"
          }`}
        >
          All Notifications ({items.length})
        </button>
        <button
          onClick={() => setFilterMode("UNREAD")}
          className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
            filterMode === "UNREAD"
              ? "bg-[#4F9D83]/15 text-[#4F9D83] border border-[#4F9D83]/30 font-semibold"
              : "text-[#8A867E] hover:text-[#EDEBE6]"
          }`}
        >
          <span>Unread Only</span>
          {unreadCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-[#4F9D83] text-[#0F1A16] text-[10px] font-bold flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Notification List */}
      {loading ? (
        <div className="space-y-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : displayedItems.length === 0 ? (
        <div className="p-12 text-center bg-[#1A1A1B] border border-[#2E2E30] rounded-xl space-y-3">
          <div className="w-12 h-12 rounded-xl bg-[#232324] border border-[#2E2E30] flex items-center justify-center mx-auto text-[#8A867E]">
            <Bell className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-[#EDEBE6]">No notifications</h3>
          <p className="text-xs text-[#8A867E] max-w-sm mx-auto">
            {filterMode === "UNREAD"
              ? "You are all caught up! There are no unread notifications right now."
              : "No notification records found for your account."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {displayedItems.map((n) => (
              <motion.div
                key={n.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
              >
                <div
                  className={`p-4 sm:p-5 rounded-xl border transition-colors ${
                    n.isRead
                      ? "bg-[#1A1A1B] border-[#2E2E30]"
                      : "bg-[#232324] border-[#4F9D83]/40 shadow-xs"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          n.isRead
                            ? "bg-[#121212] border border-[#2E2E30]"
                            : "bg-[#4F9D83]/10 border border-[#4F9D83]/25"
                        }`}
                      >
                        {getTypeIcon(n.type)}
                      </div>

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          {!n.isRead && (
                            <span className="w-2 h-2 rounded-full bg-[#4F9D83] shrink-0" />
                          )}
                          <h3 className="text-[#EDEBE6] font-semibold text-sm truncate">{n.title}</h3>
                        </div>

                        <p className="text-xs text-[#8A867E] leading-relaxed">{n.message}</p>

                        <div className="flex items-center gap-3 pt-1 text-[11px] text-[#8A867E]">
                          <span className="flex items-center gap-1 text-[#8A867E]">
                            <Clock className="w-3 h-3 text-[#8A867E]" />
                            {new Date(n.createdAt).toLocaleDateString()}{" "}
                            {new Date(n.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>

                          {n.link && (
                            <Link
                              href={n.link}
                              className="text-[#4F9D83] hover:text-[#5BB094] flex items-center gap-1 font-medium transition-colors"
                            >
                              <span>Open link</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {!n.isRead && (
                        <EpButton
                          size="sm"
                          variant="secondary"
                          onClick={() => markRead(n.id)}
                          className="text-xs h-7 px-2.5"
                        >
                          <Check className="w-3 h-3 mr-1 text-[#4F9D83]" />
                          Mark Read
                        </EpButton>
                      )}

                      <button
                        onClick={() => deleteNotification(n.id)}
                        disabled={deletingId === n.id}
                        className="p-1.5 rounded-lg border border-transparent hover:border-[#2E2E30] text-[#8A867E] hover:text-[#C46A62] hover:bg-[#1A1A1B] transition-colors cursor-pointer"
                        title="Delete notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
