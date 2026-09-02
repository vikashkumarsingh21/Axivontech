"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function NotificationsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    fetch("/api/v1/employee/notifications").then(res => res.json()).then(data => {
      if(data.success) setItems(data.notifications);
      setLoading(false);
    });
  };

  useEffect(() => { loadData(); }, []);

  const markRead = async (id: string) => {
    await fetch("/api/v1/employee/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    loadData();
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Loading notifications...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Notifications</h1>
      {items.length === 0 ? <Card className="p-8 text-center text-gray-500 bg-[#0a0a0a]">No notifications.</Card> : (
        <div className="space-y-3">
          {items.map((n: any) => (
            <Card key={n.id} className={`p-4 ${n.isRead ? 'bg-[#111111]' : 'bg-[#1a1a1a] border-blue-500/30'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-white font-medium">{n.title}</h3>
                  <p className="text-sm text-gray-400 mt-1">{n.message}</p>
                </div>
                {!n.isRead && <Button size="sm" variant="outline" onClick={() => markRead(n.id)}>Mark Read</Button>}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
