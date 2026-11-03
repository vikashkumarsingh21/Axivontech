"use client";

import { useMemo } from "react";
import { Bell, CheckCircle2, Clock } from "lucide-react";
import { CardList, type CardListItem } from "../CardList";

interface MobileEmployeeNotificationsProps {
  notifications: any[];
  onMarkAsRead?: (id: string) => Promise<void>;
  onMarkAllAsRead?: () => Promise<void>;
  isLoading?: boolean;
}

export function MobileEmployeeNotifications({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  isLoading = false,
}: MobileEmployeeNotificationsProps) {
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead && !n.read).length,
    [notifications]
  );

  const cardItems: CardListItem[] = useMemo(() => {
    return notifications.map((n) => {
      const isUnread = !n.isRead && !n.read;
      return {
        id: n.id,
        title: (
          <div className="flex items-center gap-2">
            {isUnread && <span className="h-2 w-2 rounded-full bg-[#4F9D83] shrink-0" />}
            <span className={isUnread ? "font-semibold text-[#EDEBE6]" : "text-[#B3AFA6]"}>
              {n.title || "Notification"}
            </span>
          </div>
        ),
        subtitle: n.message || n.content || "",
        status: {
          label: isUnread ? "Unread" : "Read",
          variant: isUnread ? "accent" : "neutral",
        },
        fields: [
          {
            label: "Received",
            value: new Date(n.createdAt).toLocaleDateString("en-IN", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ],
        onClick: isUnread && onMarkAsRead ? () => onMarkAsRead(n.id) : undefined,
      };
    });
  }, [notifications, onMarkAsRead]);

  return (
    <div className="space-y-4">
      {/* Header with Mark all read button */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-[#4F9D83]" />
          <h2 className="text-sm font-semibold text-[#EDEBE6]">
            Inbox ({unreadCount} unread)
          </h2>
        </div>
        {unreadCount > 0 && onMarkAllAsRead && (
          <button
            type="button"
            onClick={onMarkAllAsRead}
            className="text-xs font-semibold text-[#4F9D83] hover:underline"
          >
            Mark all read
          </button>
        )}
      </div>

      <CardList
        items={cardItems}
        emptyTitle="No notifications"
        emptyDescription="You're all caught up. No new announcements or alerts."
      />
    </div>
  );
}
