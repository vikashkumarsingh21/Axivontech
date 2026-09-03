"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

export default function AdminAnnouncementsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState("NORMAL");
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    fetch("/api/v1/admin/announcements")
      .then(r => r.json())
      .then(d => { setItems(d.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await fetch("/api/v1/admin/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, priority }),
    });
    setTitle(""); setContent(""); setShowForm(false); setSubmitting(false);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Announcements</h1>
          <p className="text-gray-400 mt-1">Create and manage company announcements.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> New Announcement
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-[#111111] border border-white/10 rounded-xl p-6 space-y-4">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" required
            className="w-full bg-[#1a1a1a] border border-white/5 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-red-500/50" />
          <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Content" required rows={4}
            className="w-full bg-[#1a1a1a] border border-white/5 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-red-500/50" />
          <select value={priority} onChange={e => setPriority(e.target.value)}
            className="bg-[#1a1a1a] border border-white/5 rounded-lg px-4 py-2 text-sm text-white focus:outline-none">
            <option value="LOW">Low</option>
            <option value="NORMAL">Normal</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
          <button type="submit" disabled={submitting} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
            {submitting ? "Publishing..." : "Publish"}
          </button>
        </form>
      )}

      <div className="space-y-4">
        {loading ? <p className="text-gray-400">Loading...</p> : items.length === 0 ? <p className="text-gray-400">No announcements.</p> : (
          items.map(a => (
            <div key={a.id} className="bg-[#111111] border border-white/10 rounded-xl p-5">
              <div className="flex justify-between items-start">
                <h3 className="text-white font-semibold">{a.title}</h3>
                <span className={`px-2 py-1 rounded-full text-xs ${a.priority === "URGENT" ? "bg-red-500/10 text-red-400" : a.priority === "HIGH" ? "bg-orange-500/10 text-orange-400" : "bg-gray-500/10 text-gray-400"}`}>
                  {a.priority}
                </span>
              </div>
              <p className="text-gray-400 text-sm mt-2">{a.content}</p>
              <p className="text-gray-600 text-xs mt-3">{new Date(a.createdAt).toLocaleString()}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
