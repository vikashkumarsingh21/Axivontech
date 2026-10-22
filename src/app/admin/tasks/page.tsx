"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  X,
  RefreshCw,
  CheckSquare,
  AlertCircle,
  CheckCircle,
  Search,
  Filter,
  MessageSquare,
  Trash2,
  Calendar,
  User,
  Clock,
  ArrowRight,
  Send,
  Edit2,
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  TODO: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  IN_PROGRESS: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  BLOCKED: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  COMPLETED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "text-[#7E8997] bg-gray-500/10 border-gray-500/20",
  MEDIUM: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  HIGH: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  URGENT: "text-rose-400 bg-rose-500/10 border-rose-500/20",
};

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  // Create Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    userId: "",
    projectId: "",
    priority: "MEDIUM",
    dueDate: "",
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");

  // Edit / Details Modal
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  // Feedback banner
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/v1/admin/tasks?${params.toString()}`);
      if (res.ok) {
        const d = await res.json();
        setTasks(d.data || []);
      }
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  const loadDependencies = async () => {
    try {
      const [empRes, projRes] = await Promise.all([
        fetch("/api/v1/admin/employees?limit=100&includeAdmins=true"),
        fetch("/api/v1/admin/projects"),
      ]);
      if (empRes.ok) {
        const d = await empRes.json();
        setEmployees(d.data || []);
      }
      if (projRes.ok) {
        const d = await projRes.json();
        setProjects(d.data || []);
      }
    } catch {
      // non-fatal
    }
  };

  useEffect(() => {
    loadTasks();
    loadDependencies();
  }, [loadTasks]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.title.trim() || !createForm.userId) {
      setCreateError("Task title and assigned employee are required.");
      return;
    }
    setCreateLoading(true);
    setCreateError("");
    try {
      const res = await fetch("/api/v1/admin/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: createForm.title.trim(),
          description: createForm.description?.trim() || null,
          userId: createForm.userId,
          projectId: createForm.projectId || null,
          priority: createForm.priority,
          dueDate: createForm.dueDate || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create task");
      setIsCreateOpen(false);
      setFeedback({ type: "success", message: `Task "${createForm.title}" assigned successfully!` });
      loadTasks();
    } catch (err: any) {
      setCreateError(err.message || "Failed to assign task");
    } finally {
      setCreateLoading(false);
    }
  };

  const openTaskDetail = async (task: any) => {
    setSelectedTask(task);
    setEditForm({
      title: task.title,
      description: task.description || "",
      userId: task.userId,
      projectId: task.projectId || "",
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : "",
    });
    setNewComment("");

    // Fetch full task with comments
    try {
      const res = await fetch(`/api/v1/admin/tasks/${task.id}`);
      if (res.ok) {
        const d = await res.json();
        setSelectedTask(d.task);
      }
    } catch {
      // fallback to initial task
    }
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !editForm) return;
    setEditLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/tasks/${selectedTask.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editForm.title.trim(),
          description: editForm.description?.trim() || null,
          userId: editForm.userId,
          projectId: editForm.projectId || null,
          priority: editForm.priority,
          status: editForm.status,
          dueDate: editForm.dueDate || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update task");
      setSelectedTask(data.task);
      setFeedback({ type: "success", message: `Task "${editForm.title}" updated successfully.` });
      loadTasks();
    } catch (err: any) {
      alert(err.message || "Update failed");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;
    if (!confirm(`Are you sure you want to permanently delete task "${selectedTask.title}"?`)) return;
    try {
      const res = await fetch(`/api/v1/admin/tasks/${selectedTask.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setSelectedTask(null);
      setFeedback({ type: "success", message: "Task deleted successfully." });
      loadTasks();
    } catch (err: any) {
      alert(err.message || "Failed to delete task");
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !newComment.trim()) return;
    setCommentLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/tasks/${selectedTask.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to post comment");
      setNewComment("");
      // Add comment to local list
      setSelectedTask((prev: any) => ({
        ...prev,
        comments: [...(prev.comments || []), data.comment],
      }));
    } catch (err: any) {
      alert(err.message || "Comment failed");
    } finally {
      setCommentLoading(false);
    }
  };

  // Filter tasks locally by search and priority
  const filteredTasks = tasks.filter((t) => {
    if (priorityFilter && t.priority !== priorityFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      const matchUser = t.user?.name?.toLowerCase().includes(q) || t.user?.email?.toLowerCase().includes(q);
      const matchProj = t.project?.name?.toLowerCase().includes(q);
      return matchTitle || matchDesc || matchUser || matchProj;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-emerald-400" /> Task Management
          </h1>
          <p className="text-[#7E8997] text-sm mt-1">
            Assign, supervise, and collaborate on employee tasks with live comment threads and deadlines.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadTasks}
            className="p-2.5 rounded-xl border border-[#29313B] bg-[#151A21] text-[#7E8997] hover:text-[#F3F5F7] hover:bg-[#1B222B] transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald-400" : ""}`} />
          </button>
          <button
            onClick={() => {
              setCreateForm({ title: "", description: "", userId: "", projectId: "", priority: "MEDIUM", dueDate: "" });
              setCreateError("");
              setIsCreateOpen(true);
            }}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-md shadow-emerald-950/40"
          >
            <Plus className="w-4 h-4" /> Assign New Task
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-sm flex items-center justify-between gap-2 ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/20 text-rose-400"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            {feedback.message}
          </div>
          <button onClick={() => setFeedback(null)} className="text-inherit hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Toolbar / Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#151A21] border border-[#29313B] p-3 rounded-2xl">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#566171]" />
          <input
            type="text"
            placeholder="Search tasks, descriptions, or assigned employee…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#10151B] border border-[#29313B] rounded-xl text-xs text-[#F3F5F7] placeholder-[#566171] focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-[#10151B] p-1 rounded-xl border border-[#29313B]">
            {["", "TODO", "IN_PROGRESS", "BLOCKED", "COMPLETED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  statusFilter === st
                    ? "bg-[#1B222B] text-emerald-400 border border-[#29313B]"
                    : "text-[#7E8997] hover:text-[#F3F5F7]"
                }`}
              >
                {st || "All Status"}
              </button>
            ))}
          </div>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 bg-[#10151B] border border-[#29313B] rounded-xl text-xs text-[#F3F5F7] focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
      </div>

      {/* Task Table */}
      <div className="bg-[#151A21] border border-[#29313B] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#A7B0BC]">
            <thead className="bg-[#10151B] text-[#7E8997] text-[11px] uppercase font-bold tracking-wider border-b border-[#29313B]">
              <tr>
                <th className="px-5 py-3.5">Task</th>
                <th className="px-5 py-3.5">Assignee</th>
                <th className="px-5 py-3.5">Project</th>
                <th className="px-5 py-3.5">Priority</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Due Date</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2530]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#7E8997]">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" /> Loading tasks…
                    </div>
                  </td>
                </tr>
              ) : filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-[#566171]">
                    <CheckSquare className="w-8 h-8 mx-auto mb-2 text-[#3B4554]" />
                    No tasks found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((t) => (
                  <tr key={t.id} className="hover:bg-[#1B222B]/50 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="text-[#F3F5F7] font-semibold flex items-center gap-1.5">
                        {t.title}
                      </div>
                      {t.description && (
                        <div className="text-[11px] text-[#566171] truncate max-w-xs mt-0.5">{t.description}</div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-[#F3F5F7] font-medium">{t.user?.name || "—"}</div>
                      <div className="text-[11px] text-[#566171]">{t.user?.department || "Staff"}</div>
                    </td>
                    <td className="px-5 py-4 text-[#A7B0BC]">{t.project?.name || "—"}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${PRIORITY_COLORS[t.priority] || ""}`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${STATUS_COLORS[t.status] || ""}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[#A7B0BC]">
                      {t.dueDate ? new Date(t.dueDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => openTaskDetail(t)}
                        className="px-3 py-1.5 bg-[#1B222B] hover:bg-[#202833] text-[#F3F5F7] border border-[#29313B] rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1.5 shadow-xs"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-emerald-400" /> Details & Thread
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Task Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#151A21] border border-[#29313B] rounded-2xl p-6 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#29313B]">
              <div className="flex items-center gap-2 text-emerald-400">
                <Plus className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Assign Task</h3>
              </div>
              <button onClick={() => setIsCreateOpen(false)} className="text-[#7E8997] hover:text-[#F3F5F7]">
                <X className="w-4 h-4" />
              </button>
            </div>

            {createError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#7E8997] mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  placeholder="e.g. Integrate Payment Gateway API"
                  className="w-full px-3 py-2 bg-[#10151B] border border-[#29313B] rounded-xl text-xs text-[#F3F5F7] focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#7E8997] mb-1">Assign To Employee *</label>
                <select
                  required
                  value={createForm.userId}
                  onChange={(e) => setCreateForm({ ...createForm, userId: e.target.value })}
                  className="w-full px-3 py-2 bg-[#10151B] border border-[#29313B] rounded-xl text-xs text-[#F3F5F7] focus:outline-none focus:border-emerald-500"
                >
                  <option value="">Select Employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.department || "Staff"}) — {emp.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#7E8997] mb-1">Project</label>
                  <select
                    value={createForm.projectId}
                    onChange={(e) => setCreateForm({ ...createForm, projectId: e.target.value })}
                    className="w-full px-3 py-2 bg-[#10151B] border border-[#29313B] rounded-xl text-xs text-[#F3F5F7] focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Internal / No Project</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#7E8997] mb-1">Priority</label>
                  <select
                    value={createForm.priority}
                    onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value })}
                    className="w-full px-3 py-2 bg-[#10151B] border border-[#29313B] rounded-xl text-xs text-[#F3F5F7] focus:outline-none focus:border-emerald-500"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#7E8997] mb-1">Due Date</label>
                <input
                  type="date"
                  value={createForm.dueDate}
                  onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })}
                  className="w-full px-3 py-2 bg-[#10151B] border border-[#29313B] rounded-xl text-xs text-[#F3F5F7] focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#7E8997] mb-1">Description & Requirements</label>
                <textarea
                  rows={3}
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="Provide task scope, test cases, and expected deliverables…"
                  className="w-full px-3 py-2 bg-[#10151B] border border-[#29313B] rounded-xl text-xs text-[#F3F5F7] focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#29313B]">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-[#7E8997] hover:text-[#F3F5F7]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-50"
                >
                  {createLoading ? "Assigning…" : "Assign Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Details & Thread Modal */}
      {selectedTask && editForm && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#151A21] border border-[#29313B] rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#29313B]">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-emerald-400" /> Task Details & Discussion
                </h3>
                <p className="text-xs text-[#7E8997] mt-0.5">Manage task parameters and review employee updates.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDeleteTask}
                  className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors"
                  title="Delete Task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button onClick={() => setSelectedTask(null)} className="text-[#7E8997] hover:text-[#F3F5F7]">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleUpdateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#7E8997] mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-[#10151B] border border-[#29313B] rounded-xl text-xs text-[#F3F5F7] focus:outline-none focus:border-emerald-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#7E8997] mb-1">Assignee</label>
                  <select
                    value={editForm.userId}
                    onChange={(e) => setEditForm({ ...editForm, userId: e.target.value })}
                    className="w-full px-3 py-2 bg-[#10151B] border border-[#29313B] rounded-xl text-xs text-[#F3F5F7] focus:outline-none focus:border-emerald-500"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#7E8997] mb-1">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-3 py-2 bg-[#10151B] border border-[#29313B] rounded-xl text-xs text-[#F3F5F7] focus:outline-none focus:border-emerald-500 font-semibold"
                  >
                    <option value="TODO">TODO</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="BLOCKED">BLOCKED</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#7E8997] mb-1">Priority</label>
                  <select
                    value={editForm.priority}
                    onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                    className="w-full px-3 py-2 bg-[#10151B] border border-[#29313B] rounded-xl text-xs text-[#F3F5F7] focus:outline-none focus:border-emerald-500"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#7E8997] mb-1">Due Date</label>
                  <input
                    type="date"
                    value={editForm.dueDate}
                    onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 bg-[#10151B] border border-[#29313B] rounded-xl text-xs text-[#F3F5F7] focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#7E8997] mb-1">Project</label>
                  <select
                    value={editForm.projectId}
                    onChange={(e) => setEditForm({ ...editForm, projectId: e.target.value })}
                    className="w-full px-3 py-2 bg-[#10151B] border border-[#29313B] rounded-xl text-xs text-[#F3F5F7] focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Internal / No Project</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#7E8997] mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#10151B] border border-[#29313B] rounded-xl text-xs text-[#F3F5F7] focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-50"
                >
                  {editLoading ? "Saving…" : "Save Task Changes"}
                </button>
              </div>
            </form>

            {/* Conversation Thread */}
            <div className="pt-4 border-t border-[#29313B] space-y-3">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                <MessageSquare className="w-4 h-4 text-emerald-400" /> Collaboration Thread ({selectedTask.comments?.length || 0})
              </h4>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {(!selectedTask.comments || selectedTask.comments.length === 0) ? (
                  <p className="text-xs text-[#566171] italic py-2">No comments or updates yet on this task.</p>
                ) : (
                  selectedTask.comments.map((c: any) => (
                    <div key={c.id} className="p-3 bg-[#10151B] border border-[#29313B] rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-white">{c.user?.name || "Participant"}</span>
                        <span className="text-[#566171]">{new Date(c.createdAt).toLocaleDateString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      <p className="text-[#A7B0BC] whitespace-pre-wrap">{c.content}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Reply Form */}
              <form onSubmit={handlePostComment} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Post manager feedback or instructions…"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 px-3 py-2 bg-[#10151B] border border-[#29313B] rounded-xl text-xs text-[#F3F5F7] placeholder-[#566171] focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  disabled={commentLoading || !newComment.trim()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Send
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
