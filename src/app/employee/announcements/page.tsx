"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";

export default function AnnouncementsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/employee/announcements").then(res => res.json()).then(data => {
      if(data.success) setItems(data.announcements);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-400">Loading announcements...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Company Announcements</h1>
      {items.length === 0 ? <Card className="p-8 text-center text-gray-500 bg-[#0a0a0a]">No announcements.</Card> : (
        <div className="space-y-4">
          {items.map((a: any) => (
            <Card key={a.id} className="p-5 bg-[#0a0a0a]">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-white">{a.title}</h3>
                <span className="text-xs text-gray-500">{new Date(a.publishedAt).toLocaleDateString()}</span>
              </div>
              <p className="text-gray-300">{a.content}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
