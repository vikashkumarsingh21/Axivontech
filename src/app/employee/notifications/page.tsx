"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Bell,
  Check,
  CheckCheck,
  Loader2,
  ExternalLink,
  Calendar,
  AlertTriangle,
  Info,
  Clock,
  Sparkles,
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

  const unreadCount = useMemo(() => items.filter((n) => !n.isRead).length, [items]);

  const displayedItems = useMemo(() => {
    if (filterMode === "UNREAD") return items.filter((n) => !n.isRead);
    return items;
  }, [items, filterMode]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "WARNING":
      case "ALERT":
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case "SUCCESS":
        return <Check className="w-4 h-4 text-emerald-400" />;
      default:
        return <Bell className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#F3F5F7] tracking-tight">
              Notifications & Alerts
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-sm text-[#A7B0BC] mt-1">
            System updates, task status changes, leave approvals, and workspace reminders.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            size="sm"
            onClick={markAllAsRead}
            disabled={markingAll}
            className="self-start sm:self-auto bg-[#1B222B] hover:bg-[#202833] text-[#F3F5F7] border border-[#29313B] flex items-center gap-2"
          >
            {markingAll ? (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
            ) : (
              <CheckCheck className="w-4 h-4 text-emerald-400" />
            )}
            <span>Mark All as Read</span>
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1E2530] pb-2 text-xs">
        <button
          onClick={() => setFilterMode("ALL")}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            filterMode === "ALL"
              ? "bg-[#1B222B] text-[#F3F5F7] border border-[#29313B]"
              : "text-[#7E8997] hover:text-[#F3F5F7]"
          }`}
        >
          All Notifications ({items.length})
        </button>
        <button
          onClick={() => setFilterMode("UNREAD")}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            filterMode === "UNREAD"
              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
              : "text-[#7E8997] hover:text-[#F3F5F7]"
          }`}
        >
          Unread Only ({unreadCount})
        </button>
      </div>

      {/* Notification List */}
      {loading ? (
        <div className="flex items-center justify-center p-16 text-[#7E8997] gap-3">
          <Loader2 className="animate-spin w-5 h-5 text-emerald-500" />
          <span>Loading notifications...</span>
        </div>
      ) : displayedItems.length === 0 ? (
        <Card className="p-12 text-center bg-[#151A21] border-[#29313B] rounded-xl space-y-2">
          <Bell className="w-10 h-10 text-[#566171] mx-auto" />
          <h3 className="text-base font-semibold text-[#F3F5F7]">No notifications</h3>
          <p className="text-xs text-[#7E8997]">
            {filterMode === "UNREAD"
              ? "You are all caught up! There are no unread notifications."
              : "No notification records found for your account."}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {displayedItems.map((n) => (
            <Card
              key={n.id}
              className={`p-4 sm:p-5 rounded-xl border transition-all ${
                n.isRead
                  ? "bg-[#151A21] border-[#29313B]/70"
                  : "bg-[#1B222B] border-emerald-500/30 shadow-xs"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      n.isRead
                        ? "bg-[#10151B] border border-[#29313B]"
                        : "bg-emerald-500/10 border border-emerald-500/25"
                    }`}
                  >
                    {getTypeIcon(n.type)}
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                      )}
                      <h3 className="text-[#F3F5F7] font-semibold text-sm truncate">{n.title}</h3>
                    </div>

                    <p className="text-xs text-[#A7B0BC] leading-relaxed">{n.message}</p>

                    <div className="flex items-center gap-3 pt-1 text-[11px] text-[#7E8997]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(n.createdAt).toLocaleDateString()}{" "}
                        {new Date(n.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>

                      {n.link && (
                        <Link
                          href={n.link}
                          className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
                        >
                          <span>Open link</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {!n.isRead && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => markRead(n.id)}
                    className="shrink-0 self-start sm:self-center text-xs border-[#29313B] bg-[#10151B] hover:bg-[#151A21] text-[#A7B0BC] hover:text-[#F3F5F7]"
                  >
                    <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                    Mark Read
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
