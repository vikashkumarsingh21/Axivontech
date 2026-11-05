"use client";

import { useState, useMemo } from "react";
import { Bell, CheckCircle2, Clock, Check, Loader2 } from "lucide-react";
import { CardList, type CardListItem } from "./CardList";

export interface MobileNotificationItem {
  id: string;
  title: string;
  message?: string;
  content?: string;
  type?: string;
  isRead?: boolean;
  read?: boolean;
  createdAt: string;
  link?: string | null;
}

interface MobileNotificationCenterProps {
  notifications: MobileNotificationItem[];
  onMarkAsRead?: (id: string) => Promise<void>;
  onMarkAllAsRead?: () => Promise<void>;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function MobileNotificationCenter({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  isLoading = false,
  emptyTitle = "No notifications",
  emptyDescription = "You're all caught up. No new announcements or alerts.",
}: MobileNotificationCenterProps) {
  const [filter, setFilter] = useState<"ALL" | "UNREAD">("ALL");
  const [markingAll, setMarkingAll] = useState(false);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead && !n.read).length,
    [notifications]
  );

  const filteredItems = useMemo(() => {
    if (filter === "UNREAD") {
      return notifications.filter((n) => !n.isRead && !n.read);
    }
    return notifications;
  }, [notifications, filter]);

  const handleMarkAll = async () => {
    if (!onMarkAllAsRead) return;
    setMarkingAll(true);
    try {
      await onMarkAllAsRead();
    } finally {
      setMarkingAll(false);
    }
  };

  const cardItems: CardListItem[] = useMemo(() => {
    return filteredItems.map((n) => {
      const isUnread = !n.isRead && !n.read;
      return {
        id: n.id,
        title: (
          <div className="flex items-center gap-2">
            {isUnread && <span className="h-2 w-2 rounded-full bg-teal-500 shrink-0" />}
            <span className={isUnread ? "font-bold text-slate-900" : "text-slate-700"}>
              {n.title || "Notification"}
            </span>
          </div>
        ),
        subtitle: n.message || n.content || "",
        status: {
          label: isUnread ? "New" : "Read",
          variant: isUnread ? "accent" : "neutral",
        },
        fields: [
          {
            label: "Received",
            value: n.createdAt
              ? new Date(n.createdAt).toLocaleDateString("en-IN", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Just now",
          },
          {
            label: "Category",
            value: n.type || "System Alert",
          },
        ],
        onClick: isUnread && onMarkAsRead ? () => onMarkAsRead(n.id) : undefined,
      };
    });
  }, [filteredItems, onMarkAsRead]);

  return (
    <div className="space-y-4">
      {/* ── Top Header with Filter & Mark All Read ─────────────────────── */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200/80">
            <button
              type="button"
              onClick={() => setFilter("ALL")}
              className={`py-1 px-3 rounded-lg text-xs font-semibold transition-all ${
                filter === "ALL"
                  ? "bg-white text-teal-700 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("UNREAD")}
              className={`py-1 px-3 rounded-lg text-xs font-semibold transition-all ${
                filter === "UNREAD"
                  ? "bg-white text-teal-700 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </div>

        {unreadCount > 0 && onMarkAllAsRead && (
          <button
            type="button"
            disabled={markingAll}
            onClick={handleMarkAll}
            className="flex items-center gap-1 text-xs font-bold text-teal-600 hover:text-teal-700 active:scale-95 transition-transform"
          >
            {markingAll ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
            <span>Mark all read</span>
          </button>
        )}
      </div>

      <CardList
        items={cardItems}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
      />
    </div>
  );
}
