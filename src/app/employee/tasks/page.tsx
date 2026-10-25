"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckSquare,
  Calendar,
  AlertCircle,
  Loader2,
  Search,
  MessageSquare,
  Briefcase,
  ChevronRight,
  Send,
  X,
  AlertTriangle,
  CheckCircle2,
  RotateCw,
} from "lucide-react";
import { PageHeader } from "@/components/employee/PageHeader";
import { SkeletonCard } from "@/components/employee/SkeletonCard";
import { StatusBadge } from "@/components/employee/StatusBadge";
import { EpButton } from "@/components/employee/EpButton";

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
      const matchesSearch =
        searchQuery === "" ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.project && t.project.name.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (selectedStatus === "OVERDUE") {
        if (t.status === "COMPLETED" || !t.dueDate || new Date(t.dueDate) >= now) return false;
      } else if (selectedStatus !== "ALL" && t.status !== selectedStatus) {
        return false;
      }

      if (selectedPriority !== "ALL" && t.priority !== selectedPriority) {
        return false;
      }

      return true;
    });
  }, [tasks, searchQuery, selectedStatus, selectedPriority]);

  const getPriorityVariant = (priority: string): "error" | "warning" | "info" | "neutral" => {
    switch (priority) {
      case "CRITICAL":
        return "error";
      case "HIGH":
        return "warning";
      case "MEDIUM":
        return "info";
      default:
        return "neutral";
    }
  };

  const getStatusVariant = (status: string): "success" | "info" | "error" | "neutral" => {
    switch (status) {
      case "COMPLETED":
        return "success";
      case "IN_PROGRESS":
        return "info";
      case "BLOCKED":
        return "error";
      default:
        return "neutral";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6 max-w-7xl pb-12"
    >
      {/* Header */}
      <PageHeader
        title="My Assigned Tasks"
        subtitle="Track deliverables, update execution status, and record progress updates."
        action={
          <EpButton
            variant="secondary"
            size="sm"
            onClick={loadData}
            loading={loading}
            icon={<RotateCw className="w-3.5 h-3.5 text-[#4F9D83]" />}
          >
            Refresh
          </EpButton>
        }
      />

      {/* Alerts */}
      {actionSuccess && (
        <div className="p-3 bg-[#4F9D83]/10 border border-[#4F9D83]/25 rounded-xl text-[#4F9D83] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-3 bg-[#C46A62]/10 border border-[#C46A62]/25 rounded-xl text-[#C46A62] text-xs font-semibold flex items-center gap-2">
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
              ? "bg-[#232324] border-[#4F9D83]/50 shadow-sm"
              : "bg-[#1A1A1B] border-[#2E2E30] hover:border-[#3A3A3D]"
          }`}
        >
          <div className="text-xs text-[#8A867E] font-medium">Total Tasks</div>
          <div className="text-2xl font-semibold text-[#EDEBE6] mt-1">{stats.total}</div>
        </div>

        <div
          onClick={() => setSelectedStatus("TODO")}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            selectedStatus === "TODO"
              ? "bg-[#232324] border-[#4F9D83]/50 shadow-sm"
              : "bg-[#1A1A1B] border-[#2E2E30] hover:border-[#3A3A3D]"
          }`}
        >
          <div className="text-xs text-[#8A867E] font-medium">To Do</div>
          <div className="text-2xl font-semibold text-[#EDEBE6] mt-1">{stats.todo}</div>
        </div>

        <div
          onClick={() => setSelectedStatus("IN_PROGRESS")}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            selectedStatus === "IN_PROGRESS"
              ? "bg-[#232324] border-[#4F9D83]/50 shadow-sm"
              : "bg-[#1A1A1B] border-[#2E2E30] hover:border-[#3A3A3D]"
          }`}
        >
          <div className="text-xs text-[#4F9D83] font-medium">In Progress</div>
          <div className="text-2xl font-semibold text-[#EDEBE6] mt-1">{stats.inProgress}</div>
        </div>

        <div
          onClick={() => setSelectedStatus("BLOCKED")}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            selectedStatus === "BLOCKED"
              ? "bg-[#232324] border-[#C46A62]/50 shadow-sm"
              : "bg-[#1A1A1B] border-[#2E2E30] hover:border-[#3A3A3D]"
          }`}
        >
          <div className="text-xs text-[#C46A62] font-medium">Blocked</div>
          <div className="text-2xl font-semibold text-[#EDEBE6] mt-1">{stats.blocked}</div>
        </div>

        <div
          onClick={() => setSelectedStatus("COMPLETED")}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            selectedStatus === "COMPLETED"
              ? "bg-[#232324] border-[#5FAE7E]/50 shadow-sm"
              : "bg-[#1A1A1B] border-[#2E2E30] hover:border-[#3A3A3D]"
          }`}
        >
          <div className="text-xs text-[#5FAE7E] font-medium">Completed</div>
          <div className="text-2xl font-semibold text-[#EDEBE6] mt-1">{stats.completed}</div>
        </div>

        <div
          onClick={() => setSelectedStatus("OVERDUE")}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            selectedStatus === "OVERDUE"
              ? "bg-[#232324] border-[#C46A62]/60 shadow-sm"
              : "bg-[#1A1A1B] border-[#2E2E30] hover:border-[#3A3A3D]"
          }`}
        >
          <div className="text-xs text-[#C46A62] font-medium flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Overdue
          </div>
          <div className="text-2xl font-semibold text-[#C46A62] mt-1">{stats.overdue}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-[#1A1A1B] border border-[#2E2E30] rounded-xl space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8A867E] absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search tasks by title, project, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-lg bg-[#232324] border border-[#2E2E30] text-[#EDEBE6] text-xs placeholder:text-[#7C786F] focus:outline-hidden focus:border-[#4F9D83] focus:ring-1 focus:ring-[#4F9D83]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-[#8A867E] hover:text-[#EDEBE6] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="h-9 px-3 bg-[#232324] border border-[#2E2E30] rounded-lg text-xs text-[#B3AFA6] focus:outline-hidden focus:border-[#4F9D83] cursor-pointer"
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
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer text-xs ${
                selectedStatus === tab.id
                  ? "bg-[#4F9D83]/15 text-[#4F9D83] border border-[#4F9D83]/30 font-semibold"
                  : "bg-[#232324] text-[#8A867E] hover:text-[#EDEBE6] border border-[#2E2E30]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="p-12 text-center bg-[#1A1A1B] border border-[#2E2E30] rounded-xl space-y-3">
          <CheckSquare className="w-10 h-10 text-[#8A867E] mx-auto" />
          <h3 className="text-base font-semibold text-[#EDEBE6]">No tasks found</h3>
          <p className="text-xs text-[#8A867E] max-w-sm mx-auto">
            {searchQuery || selectedStatus !== "ALL" || selectedPriority !== "ALL"
              ? "No tasks match your selected search criteria. Try resetting filters."
              : "You have no assigned tasks. When project leads assign deliverables, they will appear here."}
          </p>
          {(searchQuery || selectedStatus !== "ALL" || selectedPriority !== "ALL") && (
            <EpButton
              size="sm"
              variant="secondary"
              onClick={() => {
                setSearchQuery("");
                setSelectedStatus("ALL");
                setSelectedPriority("ALL");
              }}
              className="mt-2"
            >
              Reset Filters
            </EpButton>
          )}
        </div>
      ) : (
        <div className="grid gap-3">
          <AnimatePresence mode="popLayout">
            {filteredTasks.map((t, index) => {
              const isOverdue =
                t.status !== "COMPLETED" && t.dueDate && new Date(t.dueDate) < new Date();
              const isUpdating = updatingTaskId === t.id;

              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15, delay: Math.min(index * 0.03, 0.3) }}
                  className="p-4 sm:p-5 bg-[#1A1A1B] border border-[#2E2E30] rounded-xl hover:border-[#3A3A3D] transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  {/* Left Task Content */}
                  <div
                    className="space-y-2 flex-1 cursor-pointer min-w-0"
                    onClick={() => setActiveTask(t)}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge variant={getStatusVariant(t.status)}>
                        {t.status.replace("_", " ")}
                      </StatusBadge>
                      <StatusBadge variant={getPriorityVariant(t.priority)}>
                        {t.priority}
                      </StatusBadge>
                      {t.project && (
                        <span className="text-[10px] text-[#B3AFA6] bg-[#232324] border border-[#2E2E30] px-2 py-0.5 rounded font-medium flex items-center gap-1">
                          <Briefcase className="w-3 h-3 text-[#4F9D83]" />
                          {t.project.name}
                        </span>
                      )}
                    </div>

                    <h3 className="text-[#EDEBE6] font-medium text-sm sm:text-base hover:text-[#4F9D83] transition-colors">
                      {t.title}
                    </h3>

                    {t.description && (
                      <p className="text-xs text-[#8A867E] line-clamp-2 max-w-3xl">
                        {t.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-[#8A867E]">
                      {t.dueDate && (
                        <span
                          className={`flex items-center gap-1.5 ${
                            isOverdue ? "text-[#C46A62] font-medium" : "text-[#8A867E]"
                          }`}
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          Due: {new Date(t.dueDate).toLocaleDateString()}
                          {isOverdue && " (Overdue)"}
                        </span>
                      )}

                      <span className="flex items-center gap-1.5 hover:text-[#EDEBE6]">
                        <MessageSquare className="w-3.5 h-3.5 text-[#8A867E]" />
                        {t.comments?.length || 0} comments
                      </span>
                    </div>
                  </div>

                  {/* Right Status Actions */}
                  <div className="flex items-center gap-2.5 shrink-0 self-end lg:self-center pt-2 lg:pt-0 border-t lg:border-t-0 border-[#2E2E30] w-full lg:w-auto justify-between lg:justify-end">
                    <div className="flex items-center gap-2">
                      <select
                        value={t.status}
                        disabled={isUpdating}
                        onChange={(e) => updateStatus(t.id, e.target.value)}
                        className="h-8 px-2.5 bg-[#232324] border border-[#2E2E30] rounded-lg text-xs text-[#EDEBE6] focus:outline-hidden focus:border-[#4F9D83] cursor-pointer disabled:opacity-50"
                      >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="BLOCKED">Blocked</option>
                        <option value="COMPLETED">Completed</option>
                      </select>

                      {t.status !== "COMPLETED" && (
                        <EpButton
                          size="sm"
                          variant="primary"
                          disabled={isUpdating}
                          loading={isUpdating}
                          onClick={() => updateStatus(t.id, "COMPLETED")}
                          icon={<CheckSquare className="w-3.5 h-3.5" />}
                        >
                          Done
                        </EpButton>
                      )}
                    </div>

                    <button
                      onClick={() => setActiveTask(t)}
                      className="p-1.5 text-[#8A867E] hover:text-[#EDEBE6] hover:bg-[#232324] rounded-lg transition-colors cursor-pointer"
                      title="View details and comments"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Task Details & Comments Modal Drawer */}
      {activeTask && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#1A1A1B] border border-[#2E2E30] rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#2E2E30] bg-[#121212] flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <StatusBadge variant={getStatusVariant(activeTask.status)}>
                    {activeTask.status.replace("_", " ")}
                  </StatusBadge>
                  <StatusBadge variant={getPriorityVariant(activeTask.priority)}>
                    {activeTask.priority}
                  </StatusBadge>
                  {activeTask.project && (
                    <span className="text-[10px] text-[#B3AFA6] bg-[#232324] border border-[#2E2E30] px-2 py-0.5 rounded font-medium">
                      {activeTask.project.name}
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-semibold text-[#EDEBE6] mt-1">{activeTask.title}</h2>
              </div>
              <button
                onClick={() => setActiveTask(null)}
                className="p-1.5 rounded-lg text-[#8A867E] hover:text-[#EDEBE6] hover:bg-[#232324] cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 overflow-y-auto space-y-6 flex-1 text-sm">
              {/* Description */}
              <div>
                <h4 className="text-xs font-semibold text-[#8A867E] uppercase tracking-wider mb-2">
                  Deliverable Description
                </h4>
                <div className="p-3.5 bg-[#121212]/60 border border-[#2E2E30] rounded-xl text-[#EDEBE6] whitespace-pre-wrap leading-relaxed text-xs sm:text-sm">
                  {activeTask.description || "No specific details provided for this task."}
                </div>
              </div>

              {/* Status Update Control */}
              <div className="p-3.5 bg-[#232324] border border-[#2E2E30] rounded-xl flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-medium text-[#EDEBE6]">Execution Status</div>
                  <div className="text-[11px] text-[#8A867E]">
                    Change as work progresses across development phases.
                  </div>
                </div>
                <select
                  value={activeTask.status}
                  onChange={(e) => updateStatus(activeTask.id, e.target.value)}
                  className="h-8 px-2.5 bg-[#1A1A1B] border border-[#2E2E30] rounded-lg text-xs text-[#EDEBE6] focus:outline-hidden focus:border-[#4F9D83] cursor-pointer"
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="BLOCKED">Blocked</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>

              {/* Metadata row */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#121212]/60 border border-[#2E2E30] rounded-xl">
                  <div className="text-[#8A867E] mb-1">Due Date</div>
                  <div className="font-medium text-[#EDEBE6]">
                    {activeTask.dueDate
                      ? new Date(activeTask.dueDate).toLocaleDateString()
                      : "No deadline specified"}
                  </div>
                </div>
                <div className="p-3 bg-[#121212]/60 border border-[#2E2E30] rounded-xl">
                  <div className="text-[#8A867E] mb-1">Created</div>
                  <div className="font-medium text-[#EDEBE6]">
                    {new Date(activeTask.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Comments Section */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-semibold text-[#8A867E] uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-[#4F9D83]" />
                  <span>Discussion & Activity Log ({activeTask.comments?.length || 0})</span>
                </h4>

                <div className="space-y-2.5">
                  {!activeTask.comments || activeTask.comments.length === 0 ? (
                    <div className="p-4 text-center text-xs text-[#8A867E] bg-[#121212]/60 border border-[#2E2E30] rounded-xl">
                      No comments logged yet. Use the input below to record task updates or ask questions.
                    </div>
                  ) : (
                    activeTask.comments.map((c) => (
                      <div
                        key={c.id}
                        className="p-3 bg-[#121212]/60 border border-[#2E2E30] rounded-xl space-y-1"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-[#4F9D83]">
                            {c.user?.name || "Team Member"}
                          </span>
                          <span className="text-[#8A867E]">
                            {new Date(c.createdAt).toLocaleDateString()}{" "}
                            {new Date(c.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-[#B3AFA6] whitespace-pre-wrap">{c.content}</p>
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
                      className="w-full bg-[#232324] border border-[#2E2E30] rounded-xl p-3 text-xs text-[#EDEBE6] placeholder:text-[#7C786F] focus:outline-hidden focus:border-[#4F9D83] focus:ring-1 focus:ring-[#4F9D83] resize-none pr-12"
                    />
                    <button
                      type="submit"
                      disabled={submittingComment || !newComment.trim()}
                      className="absolute right-2.5 bottom-3.5 p-2 rounded-lg bg-[#4F9D83] text-[#0F1A16] hover:bg-[#5BB094] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
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
            <div className="p-4 border-t border-[#2E2E30] bg-[#121212] flex justify-end">
              <EpButton
                variant="secondary"
                size="sm"
                onClick={() => setActiveTask(null)}
              >
                Close
              </EpButton>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
