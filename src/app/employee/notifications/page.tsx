"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Bell, Check, Loader2 } from "lucide-react";

export default function NotificationsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    fetch("/api/v1/employee/notifications")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setItems(data.notifications || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const markRead = async (id: string) => {
    await fetch("/api/v1/employee/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-gray-400 gap-3">
        <Loader2 className="animate-spin w-5 h-5 text-indigo-400" />
        <span>Loading notifications...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Notifications</h1>
        <p className="text-sm text-gray-400 mt-1">Updates, system alerts, and task notices</p>
      </div>

      {items.length === 0 ? (
        <Card className="p-8 text-center text-gray-500 bg-[#0a0a0c] border border-gray-800">
          No notifications found.
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((n: any) => (
            <Card
              key={n.id}
              className={`p-4 sm:p-5 rounded-xl border transition-all ${
                n.isRead
                  ? "bg-[#0a0a0c] border-gray-800/80"
                  : "bg-indigo-950/20 border-indigo-500/30"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
                    )}
                    <h3 className="text-white font-semibold text-sm truncate">{n.title}</h3>
                  </div>
                  <p className="text-xs text-gray-400">{n.message}</p>
                  <span className="text-[11px] text-gray-500 block pt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
                {!n.isRead && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => markRead(n.id)}
                    className="shrink-0 self-start sm:self-center flex items-center gap-1.5 text-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
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
