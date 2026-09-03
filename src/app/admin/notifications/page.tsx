"use client";

import { useEffect, useState } from "react";

export default function AdminNotificationsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/admin/notifications")
      .then(r => r.json())
      .then(d => { setItems(d.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white tracking-tight">Notifications</h1>
      <p className="text-gray-400">View system notifications sent to employees.</p>

      <div className="space-y-3">
        {loading ? <p className="text-gray-400">Loading...</p> : items.length === 0 ? <p className="text-gray-400">No notifications.</p> : (
          items.map(n => (
            <div key={n.id} className={`bg-[#111111] border border-white/10 rounded-xl p-4 ${n.isRead ? "opacity-60" : ""}`}>
              <div className="flex justify-between">
                <div>
                  <p className="text-white font-medium text-sm">{n.title}</p>
                  <p className="text-gray-400 text-sm mt-1">{n.message}</p>
                  <p className="text-gray-600 text-xs mt-2">To: {n.user?.name} &middot; {new Date(n.createdAt).toLocaleString()}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full h-fit ${n.isRead ? "bg-gray-500/10 text-gray-500" : "bg-blue-500/10 text-blue-400"}`}>
                  {n.isRead ? "Read" : "Unread"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
