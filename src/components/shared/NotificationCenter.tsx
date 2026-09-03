"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUnread = async () => {
    try {
      const res = await fetch("/api/v1/notifications/unread-count");
      const d = await res.json();
      if (res.ok) setUnreadCount(d.unreadCount || 0);
    } catch (e) {}
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/notifications");
      const d = await res.json();
      if (res.ok) setNotifications(d.data || []);
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleOpen = () => {
    if (!isOpen) fetchNotifications();
    setIsOpen(!isOpen);
  };

  const markAsRead = async (id: string) => {
    await fetch("/api/v1/notifications/" + id + "/read", { method: "PATCH" });
    fetchNotifications();
    fetchUnread();
  };

  const markAllAsRead = async () => {
    await fetch("/api/v1/notifications/read-all", { method: "POST" });
    fetchNotifications();
    fetchUnread();
  };

  return (
    <div className="relative">
      <button
        onClick={toggleOpen}
        className="relative p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#111111] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#18181b]">
            <h3 className="font-bold text-white text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-amber-400 hover:underline flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
            {loading ? (
              <div className="p-6 text-center text-xs text-gray-500">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-500">No notifications.</div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && markAsRead(n.id)}
                  className={`p-4 transition-colors cursor-pointer ${n.isRead ? "bg-transparent opacity-70" : "bg-amber-500/5 font-medium"}`}
                >
                  <p className="text-xs text-white">{n.title}</p>
                  <p className="text-xs text-gray-400 mt-1">{n.message}</p>
                  <span className="text-[10px] text-gray-500 mt-2 block">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
