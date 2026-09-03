"use client";

import { useEffect, useState } from "react";
import { CheckSquare } from "lucide-react";

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const url = filter ? "/api/v1/admin/tasks?status=" + filter : "/api/v1/admin/tasks";
    fetch(url)
      .then(r => r.json())
      .then(d => { setTasks(d.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [filter]);

  const statusColors: Record<string, string> = {
    TODO: "bg-gray-500/10 text-gray-400",
    IN_PROGRESS: "bg-blue-500/10 text-blue-400",
    BLOCKED: "bg-red-500/10 text-red-400",
    COMPLETED: "bg-green-500/10 text-green-400",
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Tasks</h1>
          <p className="text-gray-400 mt-1">Create, assign and monitor tasks.</p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["", "TODO", "IN_PROGRESS", "BLOCKED", "COMPLETED"].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${filter === s ? "bg-white/10 border-white/20 text-white" : "border-white/5 text-gray-500 hover:text-white"}`}>
            {s || "All"}
          </button>
        ))}
      </div>

      <div className="bg-[#111111] border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-[#1a1a1a] text-gray-300 text-xs uppercase font-semibold border-b border-white/10">
            <tr>
              <th className="px-4 py-3">Task</th>
              <th className="px-4 py-3">Assignee</th>
              <th className="px-4 py-3">Project</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Due Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-4 text-center">Loading...</td></tr>
            ) : tasks.length === 0 ? (
              <tr><td colSpan={6} className="p-4 text-center">No tasks found.</td></tr>
            ) : (
              tasks.map(t => (
                <tr key={t.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3 text-white font-medium">{t.title}</td>
                  <td className="px-4 py-3">{t.user?.name || "-"}</td>
                  <td className="px-4 py-3">{t.project?.name || "-"}</td>
                  <td className="px-4 py-3">{t.priority}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${statusColors[t.status] || ""}`}>{t.status}</span>
                  </td>
                  <td className="px-4 py-3">{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
