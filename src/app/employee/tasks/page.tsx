"use client";

import { useEffect, useState, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  CheckSquare,
  Calendar,
  AlertCircle,
  Loader2,
  Search,
  Filter,
  MessageSquare,
  Clock,
  Briefcase,
  ChevronRight,
  Send,
  X,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

interface TaskComment {
  id: string;
  content: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  } | null;
}

interface TaskItem {
  id: string;
  title: string;
  description?: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "TODO" | "IN_PROGRESS" | "BLOCKED" | "COMPLETED";
  dueDate?: string | null;
  createdAt: string;
  project?: {
    id: string;
    name: string;
    status: string;
  } | null;
  comments?: TaskComment[];
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedPriority, setSelectedPriority] = useState<string>("ALL");
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  // Selected Task Drawer / Modal State
  const [activeTask, setActiveTask] = useState<TaskItem | null>(null);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/employee/tasks");
      const data = await res.json();
      if (data.success && Array.isArray(data.tasks)) {
        setTasks(data.tasks);
        // If a task modal is open, refresh active task
        if (activeTask) {
          const updatedActive = data.tasks.find((t: TaskItem) => t.id === activeTask.id);
          if (updatedActive) setActiveTask(updatedActive);
        }
      }
    } catch {
      setActionError("Failed to fetch assigned tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateStatus = async (taskId: string, newStatus: string) => {
    try {
      setUpdatingTaskId(taskId);
      setActionError(null);
      const res = await fetch("/api/v1/employee/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update status");
      }

      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus as any } : t))
      );
      if (activeTask && activeTask.id === taskId) {
        setActiveTask((prev) => (prev ? { ...prev, status: newStatus as any } : null));
      }

      setActionSuccess(`Task updated to ${newStatus.replace("_", " ")}`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setActionError(err.message || "Failed to update task status");
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTask || !newComment.trim()) return;

    try {
      setSubmittingComment(true);
      setActionError(null);
      const res = await fetch("/api/v1/employee/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: activeTask.id, content: newComment.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit comment");
      }

      const createdComment: TaskComment = data.comment;
      setActiveTask((prev) =>
        prev ? { ...prev, comments: [...(prev.comments || []), createdComment] } : null
      );
      setTasks((prev) =>
        prev.map((t) =>
          t.id === activeTask.id
            ? { ...t, comments: [...(t.comments || []), createdComment] }
            : t
        )
      );
      setNewComment("");
      setActionSuccess("Comment posted successfully");
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setActionError(err.message || "Could not post comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  // Metrics computation
  const stats = useMemo(() => {
    const now = new Date();
    const total = tasks.length;
    let todo = 0;
    let inProgress = 0;
    let blocked = 0;
    let completed = 0;
    let overdue = 0;

    tasks.forEach((t) => {
      if (t.status === "COMPLETED") completed++;
      else if (t.status === "IN_PROGRESS") inProgress++;
      else if (t.status === "BLOCKED") blocked++;
      else todo++;

      if (t.status !== "COMPLETED" && t.dueDate && new Date(t.dueDate) < now) {
        overdue++;
      }
    });

    return { total, todo, inProgress, blocked, completed, overdue };
  }, [tasks]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    const now = new Date();
    return tasks.filter((t) => {
      // Search matching
      const matchesSearch =
        searchQuery === "" ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.project && t.project.name.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      // Status matching
      if (selectedStatus === "OVERDUE") {
        if (t.status === "COMPLETED" || !t.dueDate || new Date(t.dueDate) >= now) return false;
      } else if (selectedStatus !== "ALL" && t.status !== selectedStatus) {
        return false;
      }

      // Priority matching
      if (selectedPriority !== "ALL" && t.priority !== selectedPriority) {
        return false;
      }

      return true;
    });
  }, [tasks, searchQuery, selectedStatus, selectedPriority]);

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "CRITICAL":
        return "bg-rose-500/10 text-rose-400 border-rose-500/30";
      case "HIGH":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "MEDIUM":
        return "bg-[#67C5D8]/10 text-[#67C5D8] border-[#67C5D8]/30";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/30";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "IN_PROGRESS":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "BLOCKED":
        return "bg-rose-500/10 text-rose-400 border-rose-500/30";
      default:
        return "bg-[#67C5D8]/10 text-[#67C5D8] border-[#67C5D8]/30";
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F3F5F7] tracking-tight">
            My Assigned Tasks
          </h1>
          <p className="text-sm text-[#A7B0BC] mt-1">
            Track sprints, change task execution status, and coordinate updates on deliverables.
          </p>
        </div>

        <Button
          onClick={loadData}
          variant="outline"
          size="sm"
          disabled={loading}
          className="self-start sm:self-auto border-[#29313B] bg-[#151A21] hover:bg-[#1B222B] text-[#A7B0BC] hover:text-[#F3F5F7]"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Refresh
        </Button>
      </div>

      {/* Alerts */}
      {actionSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div
          onClick={() => setSelectedStatus("ALL")}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            selectedStatus === "ALL"
              ? "bg-[#1B222B] border-emerald-500/40 shadow-sm"
              : "bg-[#151A21] border-[#29313B] hover:border-[#364152]"
          }`}
        >
          <div className="text-xs text-[#7E8997] font-medium">Total Tasks</div>
          <div className="text-2xl font-bold text-[#F3F5F7] mt-1">{stats.total}</div>
        </div>

        <div
          onClick={() => setSelectedStatus("TODO")}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            selectedStatus === "TODO"
              ? "bg-[#1B222B] border-[#67C5D8]/50 shadow-sm"
              : "bg-[#151A21] border-[#29313B] hover:border-[#364152]"
          }`}
        >
          <div className="text-xs text-[#67C5D8] font-medium">To Do</div>
          <div className="text-2xl font-bold text-[#F3F5F7] mt-1">{stats.todo}</div>
        </div>

        <div
          onClick={() => setSelectedStatus("IN_PROGRESS")}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            selectedStatus === "IN_PROGRESS"
              ? "bg-[#1B222B] border-amber-500/40 shadow-sm"
              : "bg-[#151A21] border-[#29313B] hover:border-[#364152]"
          }`}
        >
          <div className="text-xs text-amber-400 font-medium">In Progress</div>
          <div className="text-2xl font-bold text-[#F3F5F7] mt-1">{stats.inProgress}</div>
        </div>

        <div
          onClick={() => setSelectedStatus("BLOCKED")}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            selectedStatus === "BLOCKED"
              ? "bg-[#1B222B] border-rose-500/40 shadow-sm"
              : "bg-[#151A21] border-[#29313B] hover:border-[#364152]"
          }`}
        >
          <div className="text-xs text-rose-400 font-medium">Blocked</div>
          <div className="text-2xl font-bold text-[#F3F5F7] mt-1">{stats.blocked}</div>
        </div>

        <div
          onClick={() => setSelectedStatus("COMPLETED")}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            selectedStatus === "COMPLETED"
              ? "bg-[#1B222B] border-emerald-500/40 shadow-sm"
              : "bg-[#151A21] border-[#29313B] hover:border-[#364152]"
          }`}
        >
          <div className="text-xs text-emerald-400 font-medium">Completed</div>
          <div className="text-2xl font-bold text-[#F3F5F7] mt-1">{stats.completed}</div>
        </div>

        <div
          onClick={() => setSelectedStatus("OVERDUE")}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            selectedStatus === "OVERDUE"
              ? "bg-[#1B222B] border-rose-500/60 shadow-sm"
              : "bg-[#151A21] border-[#29313B] hover:border-[#364152]"
          }`}
        >
          <div className="text-xs text-rose-400 font-medium flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Overdue
          </div>
          <div className="text-2xl font-bold text-rose-400 mt-1">{stats.overdue}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 bg-[#151A21] border-[#29313B] rounded-xl space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#566171] absolute left-3 top-3 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search tasks by title, project, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-[#10151B] border-[#29313B] text-[#F3F5F7] placeholder:text-[#566171] focus-visible:border-emerald-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-[#7E8997] hover:text-[#F3F5F7]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="h-10 px-3 bg-[#10151B] border border-[#29313B] rounded-lg text-xs text-[#A7B0BC] focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 text-xs">
          {[
            { id: "ALL", label: "All Tasks" },
            { id: "TODO", label: "To Do" },
            { id: "IN_PROGRESS", label: "In Progress" },
            { id: "BLOCKED", label: "Blocked" },
            { id: "COMPLETED", label: "Completed" },
            { id: "OVERDUE", label: "Overdue Only" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedStatus === tab.id
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                  : "bg-[#10151B] text-[#7E8997] hover:text-[#F3F5F7] border border-[#1E2530]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Task List */}
      {loading ? (
        <div className="flex items-center justify-center p-16 text-[#7E8997] gap-3">
          <Loader2 className="animate-spin w-5 h-5 text-emerald-500" />
          <span>Loading tasks...</span>
        </div>
      ) : filteredTasks.length === 0 ? (
        <Card className="p-12 text-center bg-[#151A21] border-[#29313B] rounded-xl space-y-3">
          <CheckSquare className="w-10 h-10 text-[#566171] mx-auto" />
          <h3 className="text-base font-semibold text-[#F3F5F7]">No tasks found</h3>
          <p className="text-xs text-[#7E8997] max-w-sm mx-auto">
            {searchQuery || selectedStatus !== "ALL" || selectedPriority !== "ALL"
              ? "No tasks match your selected search criteria. Try resetting filters."
              : "You have no assigned tasks. When project leads assign deliverables, they will appear here."}
          </p>
          {(searchQuery || selectedStatus !== "ALL" || selectedPriority !== "ALL") && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setSelectedStatus("ALL");
                setSelectedPriority("ALL");
              }}
              className="mt-2"
            >
              Reset Filters
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid gap-3.5">
          {filteredTasks.map((t) => {
            const isOverdue =
              t.status !== "COMPLETED" && t.dueDate && new Date(t.dueDate) < new Date();
            const isUpdating = updatingTaskId === t.id;

            return (
              <Card
                key={t.id}
                className="p-4 sm:p-5 bg-[#151A21] border-[#29313B] rounded-xl hover:border-[#364152] transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Left Task Content */}
                <div
                  className="space-y-2 flex-1 cursor-pointer min-w-0"
                  onClick={() => setActiveTask(t)}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getStatusBadge(
                        t.status
                      )}`}
                    >
                      {t.status.replace("_", " ")}
                    </span>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getPriorityBadge(
                        t.priority
                      )}`}
                    >
                      {t.priority}
                    </span>
                    {t.project && (
                      <span className="text-[11px] text-[#A7B0BC] bg-[#10151B] border border-[#29313B] px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Briefcase className="w-3 h-3 text-[#D6B779]" />
                        {t.project.name}
                      </span>
                    )}
                  </div>

                  <h3 className="text-[#F3F5F7] font-semibold text-base hover:text-emerald-400 transition-colors">
                    {t.title}
                  </h3>

                  {t.description && (
                    <p className="text-xs text-[#A7B0BC] line-clamp-2 max-w-3xl">
                      {t.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-[#7E8997]">
                    {t.dueDate && (
                      <span
                        className={`flex items-center gap-1.5 ${
                          isOverdue ? "text-rose-400 font-medium" : "text-[#A7B0BC]"
                        }`}
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        Due: {new Date(t.dueDate).toLocaleDateString()}
                        {isOverdue && " (Overdue)"}
                      </span>
                    )}

                    <span className="flex items-center gap-1.5 hover:text-[#F3F5F7]">
                      <MessageSquare className="w-3.5 h-3.5 text-[#566171]" />
                      {t.comments?.length || 0} comments
                    </span>
                  </div>
                </div>

                {/* Right Status Actions */}
                <div className="flex items-center gap-2.5 shrink-0 self-end lg:self-center pt-2 lg:pt-0 border-t lg:border-t-0 border-[#1E2530] w-full lg:w-auto justify-between lg:justify-end">
                  <div className="flex items-center gap-2">
                    <select
                      value={t.status}
                      disabled={isUpdating}
                      onChange={(e) => updateStatus(t.id, e.target.value)}
                      className="h-8 px-2.5 bg-[#10151B] border border-[#29313B] rounded-lg text-xs text-[#F3F5F7] focus:outline-none focus:border-emerald-500 cursor-pointer disabled:opacity-50"
                    >
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="BLOCKED">Blocked</option>
                      <option value="COMPLETED">Completed</option>
                    </select>

                    {t.status !== "COMPLETED" && (
                      <Button
                        size="sm"
                        disabled={isUpdating}
                        onClick={() => updateStatus(t.id, "COMPLETED")}
                        className="h-8 px-3 text-xs bg-emerald-500 hover:bg-emerald-600 text-[#04130E] font-semibold flex items-center gap-1.5"
                      >
                        {isUpdating ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckSquare className="w-3.5 h-3.5" />
                        )}
                        <span>Done</span>
                      </Button>
                    )}
                  </div>

                  <button
                    onClick={() => setActiveTask(t)}
                    className="p-1.5 text-[#7E8997] hover:text-[#F3F5F7] hover:bg-[#1B222B] rounded-lg transition-colors"
                    title="View details and comments"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Task Details & Comments Modal Drawer */}
      {activeTask && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#151A21] border border-[#29313B] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#1E2530] flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getStatusBadge(
                      activeTask.status
                    )}`}
                  >
                    {activeTask.status.replace("_", " ")}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getPriorityBadge(
                      activeTask.priority
                    )}`}
                  >
                    {activeTask.priority}
                  </span>
                  {activeTask.project && (
                    <span className="text-[10px] text-[#A7B0BC] bg-[#10151B] border border-[#29313B] px-2 py-0.5 rounded">
                      {activeTask.project.name}
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-bold text-[#F3F5F7] mt-1">{activeTask.title}</h2>
              </div>
              <button
                onClick={() => setActiveTask(null)}
                className="p-1.5 rounded-lg text-[#7E8997] hover:text-[#F3F5F7] hover:bg-[#1B222B]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 overflow-y-auto space-y-6 flex-1 text-sm">
              {/* Description */}
              <div>
                <h4 className="text-xs font-semibold text-[#7E8997] uppercase tracking-wider mb-2">
                  Deliverable Description
                </h4>
                <div className="p-3.5 bg-[#10151B] border border-[#1E2530] rounded-xl text-[#F3F5F7] whitespace-pre-wrap leading-relaxed text-xs sm:text-sm">
                  {activeTask.description || "No specific details provided for this task."}
                </div>
              </div>

              {/* Status Update Control */}
              <div className="p-3.5 bg-[#1B222B] border border-[#29313B] rounded-xl flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-medium text-[#F3F5F7]">Execution Status</div>
                  <div className="text-[11px] text-[#7E8997]">
                    Change as work progresses across development phases.
                  </div>
                </div>
                <select
                  value={activeTask.status}
                  onChange={(e) => updateStatus(activeTask.id, e.target.value)}
                  className="h-8 px-2.5 bg-[#10151B] border border-[#29313B] rounded-lg text-xs text-[#F3F5F7] focus:outline-none focus:border-emerald-500"
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="BLOCKED">Blocked</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>

              {/* Metadata row */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#10151B] border border-[#1E2530] rounded-xl">
                  <div className="text-[#7E8997] mb-1">Due Date</div>
                  <div className="font-medium text-[#F3F5F7]">
                    {activeTask.dueDate
                      ? new Date(activeTask.dueDate).toLocaleDateString()
                      : "No deadline specified"}
                  </div>
                </div>
                <div className="p-3 bg-[#10151B] border border-[#1E2530] rounded-xl">
                  <div className="text-[#7E8997] mb-1">Created</div>
                  <div className="font-medium text-[#F3F5F7]">
                    {new Date(activeTask.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Comments Section */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-semibold text-[#7E8997] uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Discussion & Activity Log ({activeTask.comments?.length || 0})</span>
                </h4>

                <div className="space-y-2.5">
                  {!activeTask.comments || activeTask.comments.length === 0 ? (
                    <div className="p-4 text-center text-xs text-[#566171] bg-[#10151B] border border-[#1E2530] rounded-xl">
                      No comments logged yet. Use the input below to record task updates or ask
                      questions.
                    </div>
                  ) : (
                    activeTask.comments.map((c) => (
                      <div
                        key={c.id}
                        className="p-3 bg-[#10151B] border border-[#1E2530] rounded-xl space-y-1"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-emerald-400">
                            {c.user?.name || "Team Member"}
                          </span>
                          <span className="text-[#566171]">
                            {new Date(c.createdAt).toLocaleDateString()}{" "}
                            {new Date(c.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-[#A7B0BC] whitespace-pre-wrap">{c.content}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Comment Box */}
                <form onSubmit={handleAddComment} className="pt-2">
                  <div className="relative">
                    <textarea
                      rows={2}
                      placeholder="Add an update or leave a comment on this task..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="w-full bg-[#10151B] border border-[#29313B] rounded-xl p-3 text-xs text-[#F3F5F7] placeholder:text-[#566171] focus:outline-none focus:border-emerald-500 resize-none pr-12"
                    />
                    <button
                      type="submit"
                      disabled={submittingComment || !newComment.trim()}
                      className="absolute right-2.5 bottom-3.5 p-2 rounded-lg bg-emerald-500 text-[#04130E] hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      {submittingComment ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#1E2530] bg-[#10151B]/50 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTask(null)}
                className="border-[#29313B] text-[#A7B0BC]"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
