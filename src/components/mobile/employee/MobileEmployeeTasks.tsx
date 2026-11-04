"use client";

import { useState, useMemo } from "react";
import {
  CheckSquare,
  Calendar,
  AlertCircle,
  Briefcase,
  ChevronRight,
  Loader2,
  CheckCircle2,
  Clock,
  Filter,
} from "lucide-react";
import { SegmentedControl } from "../SegmentedControl";
import { CardList, type CardListItem } from "../CardList";
import { BottomSheet } from "../BottomSheet";

interface MobileEmployeeTasksProps {
  tasks: any[];
  onUpdateStatus: (taskId: string, status: string) => Promise<void>;
  isLoading?: boolean;
}

export function MobileEmployeeTasks({
  tasks,
  onUpdateStatus,
  isLoading = false,
}: MobileEmployeeTasksProps) {
  const [filter, setFilter] = useState<"ALL" | "IN_PROGRESS" | "COMPLETED">("ALL");
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (filter === "IN_PROGRESS") return t.status === "IN_PROGRESS" || t.status === "TODO";
      if (filter === "COMPLETED") return t.status === "COMPLETED";
      return true;
    });
  }, [tasks, filter]);

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    setUpdatingId(taskId);
    try {
      await onUpdateStatus(taskId, newStatus);
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask({ ...selectedTask, status: newStatus });
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const cardItems: CardListItem[] = useMemo(() => {
    return filteredTasks.map((t) => {
      const isCompleted = t.status === "COMPLETED";
      const isCritical = t.priority === "HIGH" || t.priority === "CRITICAL";

      return {
        id: t.id,
        title: t.title,
        subtitle: t.project?.name || "—",
        status: {
          label: isCompleted ? "Completed" : t.status === "IN_PROGRESS" ? "In Progress" : "Pending",
          variant: isCompleted ? "success" : "accent",
        },
        fields: [
          {
            label: "Priority",
            value: (
              <span className={isCritical ? "text-[#C85555] font-semibold" : "text-[#B3AFA6]"}>
                {t.priority || "NORMAL"}
              </span>
            ),
          },
          {
            label: "Due Date",
            value: t.dueDate
              ? new Date(t.dueDate).toLocaleDateString("en-IN", {
                  month: "short",
                  day: "numeric",
                })
              : "No deadline",
          },
        ],
        onClick: () => setSelectedTask(t),
      };
    });
  }, [filteredTasks]);

  return (
    <div className="space-y-4">
      {/* ── Segmented Control Filter ─────────────────────────────────── */}
      <SegmentedControl
        options={[
          { value: "ALL", label: "All Tasks", badge: tasks.length },
          {
            value: "IN_PROGRESS",
            label: "Active",
            badge: tasks.filter((t) => t.status !== "COMPLETED").length,
          },
          {
            value: "COMPLETED",
            label: "Completed",
            badge: tasks.filter((t) => t.status === "COMPLETED").length,
          },
        ]}
        value={filter}
        onChange={setFilter}
      />

      {/* ── Task Card List ───────────────────────────────────────────── */}
      <CardList
        items={cardItems}
        emptyTitle="No tasks found"
        emptyDescription={
          filter === "COMPLETED"
            ? "You have not completed any tasks yet."
            : "No active tasks assigned to your queue."
        }
      />

      {/* ── Task Details Bottom Sheet ───────────────────────────────── */}
      <BottomSheet
        isOpen={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
        title={selectedTask?.title || "Task Details"}
        description={selectedTask?.project?.name || "—"}
      >
        {selectedTask && (
          <div className="space-y-4">
            {/* Description */}
            <div className="rounded-xl bg-[#232324] border border-[#2E2E30] p-3.5 space-y-1">
              <span className="text-[10px] text-[#827E76] font-semibold uppercase tracking-wider">
                Task Description
              </span>
              <p className="text-xs text-[#EDEBE6] leading-relaxed">
                {selectedTask.description || "No additional description provided for this task."}
              </p>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-[#232324] border border-[#2E2E30] p-3">
                <span className="text-[10px] text-[#827E76] font-semibold uppercase tracking-wider">
                  Priority Level
                </span>
                <div className="text-xs font-semibold text-[#EDEBE6] mt-0.5">
                  {selectedTask.priority || "NORMAL"}
                </div>
              </div>

              <div className="rounded-xl bg-[#232324] border border-[#2E2E30] p-3">
                <span className="text-[10px] text-[#827E76] font-semibold uppercase tracking-wider">
                  Due Date
                </span>
                <div className="text-xs font-semibold text-[#EDEBE6] mt-0.5">
                  {selectedTask.dueDate
                    ? new Date(selectedTask.dueDate).toLocaleDateString("en-IN", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })
                    : "Flexible"}
                </div>
              </div>
            </div>

            {/* Quick Status Change Actions */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-semibold text-[#B3AFA6] block">
                Update Task Status
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  disabled={updatingId === selectedTask.id}
                  onClick={() => handleStatusChange(selectedTask.id, "TODO")}
                  className={`h-11 rounded-xl border text-xs font-semibold transition-all ${
                    selectedTask.status === "TODO"
                      ? "bg-[#232324] border-[#4F9D83] text-[#4F9D83]"
                      : "bg-[#232324] border-[#2E2E30] text-[#B3AFA6]"
                  }`}
                >
                  To Do
                </button>

                <button
                  type="button"
                  disabled={updatingId === selectedTask.id}
                  onClick={() => handleStatusChange(selectedTask.id, "IN_PROGRESS")}
                  className={`h-11 rounded-xl border text-xs font-semibold transition-all ${
                    selectedTask.status === "IN_PROGRESS"
                      ? "bg-[#162721] border-[#27483C] text-[#A2D9C7]"
                      : "bg-[#232324] border-[#2E2E30] text-[#B3AFA6]"
                  }`}
                >
                  In Progress
                </button>

                <button
                  type="button"
                  disabled={updatingId === selectedTask.id}
                  onClick={() => handleStatusChange(selectedTask.id, "COMPLETED")}
                  className={`h-11 rounded-xl border text-xs font-semibold transition-all ${
                    selectedTask.status === "COMPLETED"
                      ? "bg-[#4F9D83] border-[#4F9D83] text-[#121212]"
                      : "bg-[#232324] border-[#2E2E30] text-[#B3AFA6]"
                  }`}
                >
                  Completed
                </button>
              </div>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
