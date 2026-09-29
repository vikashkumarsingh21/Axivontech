"use client";
import { useEffect, useState } from "react";
import { Bell, Check, Loader2 } from "lucide-react";

export default function BrokerNotificationsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    fetch("/api/v1/me/notifications")
      .then((res) => res.json())
      .then((data) => {
        if (data.data) setItems(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const markRead = async (id: string) => {
    await fetch(`/api/v1/notifications/${id}/read`, {
      method: "POST",
    });
    loadData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-gray-400 gap-3">
        <Loader2 className="animate-spin w-5 h-5 text-red-500" />
        <span>Loading notifications...</span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Notifications</h1>
        <p className="text-sm text-gray-400 mt-1">Updates, system alerts, and activity notices</p>
      </div>

      {items.length === 0 ? (
        <div className="p-8 text-center text-gray-500 bg-[#111] border border-white/10 rounded-xl">
          No notifications found.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((n: any) => (
            <div
              key={n.id}
              className={`p-4 sm:p-5 rounded-xl border transition-all ${
                n.isRead
                  ? "bg-[#111] border-white/10"
                  : "bg-red-500/10 border-red-500/30"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                    )}
                    <h3 className="text-white font-semibold text-sm truncate">{n.title}</h3>
                  </div>
                  <p className="text-xs text-gray-400">{n.message}</p>
                  <span className="text-[11px] text-gray-500 block pt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
                {!n.isRead && (
                  <button
                    onClick={() => markRead(n.id)}
                    className="shrink-0 self-start sm:self-center flex items-center gap-1.5 text-xs bg-[#1a1a1a] border border-white/20 text-white px-3 py-1.5 rounded hover:bg-white/10 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5 text-green-500" />
                    Mark Read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
