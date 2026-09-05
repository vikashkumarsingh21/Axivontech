"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, X, RefreshCw, CheckSquare, AlertCircle, CheckCircle } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  TODO: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  IN_PROGRESS: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  BLOCKED: "bg-red-500/10 text-red-400 border-red-500/20",
  COMPLETED: "bg-green-500/10 text-green-400 border-green-500/20",
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "text-gray-400",
  MEDIUM: "text-yellow-400",
  HIGH: "text-orange-400",
  URGENT: "text-red-400",
};

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    userId: "",
    projectId: "",
    priority: "MEDIUM",
    dueDate: "",
  });

  const loadTasks = useCallback(async () => {
    setLoading(true);
    const url = filter ? `/api/v1/admin/tasks?status=${filter}` : "/api/v1/admin/tasks";
    const res = await fetch(url).catch(() => null);
    if (res) {
      const d = await res.json();
      setTasks(d.data || []);
    }
    setLoading(false);
  }, [filter]);

  const loadEmployees = async () => {
    const res = await fetch("/api/v1/admin/employees?limit=100").catch(() => null);
    if (res) {
      const d = await res.json();
      setEmployees(d.data || []);
    }
  };

  const loadProjects = async () => {
    const res = await fetch("/api/v1/admin/projects").catch(() => null);
    if (res) {
      const d = await res.json();
      setProjects(d.data || []);
    }
  };

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const openModal = () => {
    setForm({ title: "", description: "", userId: "", projectId: "", priority: "MEDIUM", dueDate: "" });
    setFormError("");
    setIsModalOpen(true);
    loadEmployees();
    loadProjects();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.userId) {
      setFormError("Task title and employee are required.");
      return;
    }
    setFormLoading(true);
    setFormError("");
    try {
      const res = await fetch("/api/v1/admin/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description || null,
          userId: form.userId,
          projectId: form.projectId || null,
          priority: form.priority,
          dueDate: form.dueDate || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create task");
      setIsModalOpen(false);
      setFeedback({ type: "success", message: `Task "${form.title}" assigned successfully!` });
      loadTasks();
    } catch (err: any) {
      setFormError(err.message || "An error occurred");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Tasks</h1>
          <p className="text-gray-400 mt-1">Assign and monitor tasks across all employees.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadTasks} className="p-2 rounded-xl border border-white/10 bg-[#1a1a1a] text-gray-400 hover:text-white transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={openModal}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-lg shadow-red-600/20"
          >
            <Plus className="w-4 h-4" /> Assign Task
          </button>
        </div>
      </div>

      {feedback && (
        <div className={`p-3 rounded-xl border text-sm flex items-center justify-between gap-2 ${feedback.type === "success" ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {feedback.message}
          </div>
          <button onClick={() => setFeedback(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Status Filters */}
      <div className="flex gap-2 flex-wrap">
        {["", "TODO", "IN_PROGRESS", "BLOCKED", "COMPLETED"].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${filter === s ? "bg-white/10 border-white/20 text-white" : "border-white/5 text-gray-500 hover:text-white"}`}>
            {s || "All"}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#111111] border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
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
                <tr><td colSpan={6} className="p-6 text-center">
                  <div className="flex items-center justify-center gap-2 text-gray-500">
                    <RefreshCw className="w-4 h-4 animate-spin text-red-500" /> Loading tasks...
                  </div>
                </td></tr>
              ) : tasks.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">
                  <CheckSquare className="w-8 h-8 mx-auto mb-2 text-gray-700" />
                  No tasks found. Use "Assign Task" to create one.
                </td></tr>
              ) : (
                tasks.map(t => (
                  <tr key={t.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-white font-medium">{t.title}</div>
                      {t.description && <div className="text-xs text-gray-500 truncate max-w-[200px]">{t.description}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-300">{t.user?.name || "—"}</div>
                      <div className="text-xs text-gray-600">{t.user?.department || ""}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{t.project?.name || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold ${PRIORITY_COLORS[t.priority] || "text-gray-400"}`}>{t.priority}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[t.status] || ""}`}>{t.status}</span>
                    </td>
                    <td className="px-4 py-3 text-xs">{t.dueDate ? new Date(t.dueDate).toLocaleDateString("en-IN") : "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h2 className="text-lg font-bold text-white">Assign Task to Employee</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mx-6 mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Task Title <span className="text-red-500">*</span></label>
                <input
                  type="text" required value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Design landing page mockup"
                  className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-red-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Task details..."
                  rows={3}
                  className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-red-500/50 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Assign To <span className="text-red-500">*</span></label>
                  <select
                    required value={form.userId}
                    onChange={e => setForm({ ...form, userId: e.target.value })}
                    className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-red-500/50"
                  >
                    <option value="">Select employee...</option>
                    {employees.filter(emp => emp.status === "ACTIVE").map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name} ({emp.department || "No dept"})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Project</label>
                  <select
                    value={form.projectId}
                    onChange={e => setForm({ ...form, projectId: e.target.value })}
                    className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-red-500/50"
                  >
                    <option value="">No project</option>
                    {projects.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Priority</label>
                  <select
                    value={form.priority}
                    onChange={e => setForm({ ...form, priority: e.target.value })}
                    className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-red-500/50"
                  >
                    <option>LOW</option>
                    <option>MEDIUM</option>
                    <option>HIGH</option>
                    <option>URGENT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Due Date</label>
                  <input
                    type="date" value={form.dueDate}
                    onChange={e => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-red-500/50"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={formLoading}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-red-600/20 disabled:opacity-50">
                  {formLoading ? "Assigning..." : "Assign Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
