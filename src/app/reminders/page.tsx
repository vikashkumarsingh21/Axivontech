"use client";

import { useEffect, useState } from "react";

export default function RemindersPage() {
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [dueAt, setDueAt] = useState("");

  const load = () => {
    setLoading(true);
    fetch("/api/v1/reminders")
      .then((r) => r.json())
      .then((d) => {
        setReminders(d.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/v1/reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, dueAt }),
    });
    setTitle(""); setDueAt("");
    load();
  };

  const handleComplete = async (id: string) => {
    await fetch("/api/v1/reminders/" + id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "COMPLETED" }),
    });
    load();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 text-white">
      <h1 className="text-2xl font-bold tracking-tight">Personal Reminders</h1>

      <form onSubmit={handleCreate} className="bg-[#111111] border border-white/10 rounded-2xl p-4 flex gap-4">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Reminder title..." required className="flex-1 bg-[#1a1a1a] border border-white/10 px-4 py-2 rounded-xl text-sm" />
        <input type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} required className="bg-[#1a1a1a] border border-white/10 px-4 py-2 rounded-xl text-sm" />
        <button type="submit" className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl text-sm font-medium">Add</button>
      </form>

      <div className="space-y-3">
        {loading ? <p className="text-gray-500">Loading reminders...</p> : reminders.map((r) => (
          <div key={r.id} className="bg-[#111111] border border-white/10 p-4 rounded-xl flex justify-between items-center">
            <div>
              <p className={`font-semibold ${r.status === "COMPLETED" ? "line-through text-gray-500" : "text-white"}`}>{r.title}</p>
              <p className="text-xs text-gray-400">Due: {new Date(r.dueAt).toLocaleString()}</p>
            </div>
            {r.status === "PENDING" && (
              <button onClick={() => handleComplete(r.id)} className="px-3 py-1 bg-green-600/20 text-green-400 rounded-lg text-xs">Complete</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
