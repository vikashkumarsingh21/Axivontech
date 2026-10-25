"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Bell,
  Check,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  DollarSign,
  Briefcase,
  User,
  Filter,
} from "lucide-react";
import { BrokerPageHeader } from "@/components/broker/BrokerPageHeader";
import { BrokerCard } from "@/components/broker/BrokerCard";
import { BrokerButton } from "@/components/broker/BrokerButton";
import { BrokerSkeletonCard } from "@/components/broker/BrokerSkeleton";
import { BrokerEmptyState } from "@/components/broker/BrokerEmptyState";
import { formatDateIN } from "@/components/broker/BrokerFormatters";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  link?: string | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}

export default function BrokerNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/notifications?limit=50");
      if (res.ok) {
        const json = await res.json();
        setNotifications(json.data || []);
      }
    } catch (e) {
      console.error("Failed to load notifications", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  const markSingleRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
    );

    try {
      await fetch(`/api/v1/notifications/${id}/read`, { method: "POST" });
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    setNotifications((prev) =>
      prev.map((n) => ({ ...prev, ...n, isRead: true, readAt: new Date().toISOString() }))
    );

    try {
      await fetch("/api/v1/notifications/read-all", { method: "POST" });
    } catch (err) {
      console.error(err);
    } finally {
      setMarkingAll(false);
    }
  };

  // Group notifications by date
  const groupedNotifications = useMemo(() => {
    const list = unreadOnly ? notifications.filter((n) => !n.isRead) : notifications;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterday = today - 86400000;

    const groups: { [key: string]: NotificationItem[] } = {
      Today: [],
      Yesterday: [],
      Earlier: [],
    };

    list.forEach((item) => {
      const itemDate = new Date(item.createdAt).getTime();
      if (itemDate >= today) {
        groups.Today.push(item);
      } else if (itemDate >= yesterday) {
        groups.Yesterday.push(item);
      } else {
        groups.Earlier.push(item);
      }
    });

    return groups;
  }, [notifications, unreadOnly]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <BrokerPageHeader
        title="Partner Notifications"
        subtitle="Real-time alerts regarding lead progress, contract milestones, and commission disbursements."
        badge={
          unreadCount > 0 ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#C2A878]/15 text-[#C2A878] border border-[#C2A878]/30">
              <span className="w-2 h-2 rounded-full bg-[#C2A878] animate-pulse" />
              {unreadCount} Unread
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Inbox Zero
            </span>
          )
        }
        actions={
          <div className="flex items-center gap-2">
            <BrokerButton
              variant="secondary"
              size="sm"
              onClick={() => setUnreadOnly(!unreadOnly)}
            >
              {unreadOnly ? "Show All" : "Unread Only"}
            </BrokerButton>

            {unreadCount > 0 && (
              <BrokerButton
                variant="primary"
                size="sm"
                loading={markingAll}
                onClick={markAllRead}
                icon={<Check className="w-3.5 h-3.5" />}
              >
                Mark All Read
              </BrokerButton>
            )}
          </div>
        }
      />

      {loading ? (
        <div className="space-y-3">
          <BrokerSkeletonCard />
          <BrokerSkeletonCard />
          <BrokerSkeletonCard />
        </div>
      ) : notifications.length === 0 ? (
        <BrokerEmptyState
          type="notifications"
          title="No Notifications Yet"
          description="When updates regarding your client leads, contracts, or commission payouts occur, they will appear here in real time."
        />
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedNotifications).map(([groupTitle, items]) => {
            if (items.length === 0) return null;

            return (
              <div key={groupTitle} className="space-y-3">
                <h4 className="text-xs font-bold text-[#8B94A1] uppercase tracking-wider pl-1">
                  {groupTitle}
                </h4>

                <div className="space-y-2.5">
                  {items.map((n) => {
                    const isUnread = !n.isRead;
                    return (
                      <div
                        key={n.id}
                        onClick={() => {
                          if (isUnread) markSingleRead(n.id);
                        }}
                        className={`p-4 rounded-xl border transition-all ${
                          isUnread
                            ? "bg-[#171A1F] border-[#C2A878]/40 shadow-sm"
                            : "bg-[#111317] border-[#22262D] hover:border-[#2C313A]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 min-w-0 flex-1">
                            {/* Icon */}
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                                isUnread
                                  ? "bg-[#C2A878]/15 text-[#C2A878] border border-[#C2A878]/30"
                                  : "bg-[#171A1F] text-[#8B94A1] border border-[#22262D]"
                              }`}
                            >
                              <Bell className="w-4 h-4" />
                            </div>

                            {/* Content */}
                            <div className="min-w-0 space-y-1">
                              <div className="flex items-center gap-2">
                                {isUnread && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#C2A878]" />
                                )}
                                <h5
                                  className={`text-xs font-bold truncate ${
                                    isUnread ? "text-[#E6E8EB]" : "text-[#D0D4DC]"
                                  }`}
                                >
                                  {n.title}
                                </h5>
                              </div>
                              <p className="text-xs text-[#8B94A1] leading-relaxed">{n.message}</p>
                              <span className="text-[10px] text-[#566171] font-mono block pt-0.5">
                                {new Date(n.createdAt).toLocaleTimeString("en-IN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>

                          {/* Action Link or Mark Read */}
                          <div className="flex items-center gap-2 shrink-0 self-center">
                            {n.link && (
                              <Link
                                href={n.link}
                                onClick={(e) => {
                                  if (isUnread) markSingleRead(n.id, e);
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#171A1F] hover:bg-[#22262D] text-[#C2A878] hover:text-[#D4BC8B] text-xs font-medium border border-[#22262D] transition-colors"
                              >
                                <span>View</span>
                                <ArrowRight className="w-3 h-3" />
                              </Link>
                            )}

                            {isUnread && (
                              <button
                                type="button"
                                onClick={(e) => markSingleRead(n.id, e)}
                                title="Mark as read"
                                className="p-1 rounded text-[#8B94A1] hover:text-[#E6E8EB] hover:bg-[#171A1F] transition-colors"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
