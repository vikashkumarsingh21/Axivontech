"use client";

import { MobileNotificationCenter } from "../MobileNotificationCenter";

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
  return (
    <MobileNotificationCenter
      notifications={notifications}
      onMarkAsRead={onMarkAsRead}
      onMarkAllAsRead={onMarkAllAsRead}
      isLoading={isLoading}
      emptyTitle="No employee notices"
      emptyDescription="You're all caught up. No new announcements or assigned task updates."
    />
  );
}
