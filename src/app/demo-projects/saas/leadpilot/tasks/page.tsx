// src/app/demo-projects/saas/leadpilot/tasks/page.tsx
"use client";

import React, { useState, useMemo } from "react";
import {
  CheckSquare,
  Search,
  Filter,
  Plus,
  Clock,
  AlertCircle,
  Trash2,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { useLeadPilot } from "@/context/LeadPilotContext";
import { TaskStatus, TaskPriority } from "@/data/leadpilot-data";

export default function LeadPilotTasksPage() {
  const { tasks, toggleTaskStatus, deleteTask, addTask, leads } = useLeadPilot();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          (t.relatedCompanyName && t.relatedCompanyName.toLowerCase().includes(q))
      );
    }

    if (statusFilter !== "All") {
      result = result.filter((t) => t.status === statusFilter);
    }

    if (priorityFilter !== "All") {
      result = result.filter((t) => t.priority === priorityFilter);
    }

    // Sort by due date
    result.sort((a, b) => a.dueDate.localeCompare(b.dueDate));

    return result;
  }, [tasks, searchQuery, statusFilter, priorityFilter]);

  const completedCount = tasks.filter((t) => t.status === "Completed").length;
  const pendingCount = tasks.length - completedCount;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#252925]">
            Sales Tasks & Follow-ups
          </h1>
          <p className="mt-0.5 text-xs text-[#747A75]">
            SLA action items, prospect follow-ups, and commercial deliverables tracking.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="px-3 py-1.5 rounded-xl bg-white border border-[#E3E6E1] text-[#DDA34B]">
            {pendingCount} Pending
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-white border border-[#E3E6E1] text-[#2F806A]">
            {completedCount} Completed
          </span>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E3E6E1] shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#747A75]" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#F6F7F4] border border-[#E3E6E1] rounded-lg text-xs text-[#252925] focus:outline-none focus:ring-1 focus:ring-[#2F806A]"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-[#F6F7F4] border border-[#E3E6E1] rounded-lg text-xs text-[#252925] focus:outline-none focus:ring-1 focus:ring-[#2F806A]"
          >
            <option value="All">All Statuses</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full px-3 py-2 bg-[#F6F7F4] border border-[#E3E6E1] rounded-lg text-xs text-[#252925] focus:outline-none focus:ring-1 focus:ring-[#2F806A]"
          >
            <option value="All">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-2xl border border-[#E3E6E1] shadow-xs divide-y divide-[#E3E6E1]">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#747A75]">
            No tasks found matching current filters.
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 flex items-start justify-between gap-4 hover:bg-[#F6F7F4]/50 transition-colors ${
                task.status === "Completed" ? "opacity-60 bg-[#FAFAFA]" : ""
              }`}
            >
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <button
                  onClick={() => toggleTaskStatus(task.id)}
                  className={`mt-0.5 h-5 w-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                    task.status === "Completed"
                      ? "bg-[#2F806A] border-[#2F806A] text-white"
                      : "border-[#747A75] hover:border-[#2F806A] bg-white"
                  }`}
                  aria-label="Toggle task status"
                >
                  {task.status === "Completed" && <CheckSquare className="h-3.5 w-3.5" />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-xs font-bold text-[#252925] ${
                        task.status === "Completed" ? "line-through text-[#747A75]" : ""
                      }`}
                    >
                      {task.title}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                        task.priority === "High"
                          ? "bg-[#FFF0E6] text-[#D9534F]"
                          : task.priority === "Medium"
                          ? "bg-[#FFF8E6] text-[#DDA34B]"
                          : "bg-[#F0F2F0] text-[#747A75]"
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>

                  {task.description && (
                    <p className="mt-1 text-[11px] text-[#555C56] leading-relaxed">
                      {task.description}
                    </p>
                  )}

                  <div className="mt-2 flex items-center gap-3 text-[10px] text-[#747A75] flex-wrap">
                    <span className="flex items-center gap-1 font-semibold text-[#DDA34B]">
                      <Clock className="h-3 w-3" />
                      Due: {task.dueDate}
                    </span>
                    {task.relatedCompanyName && (
                      <span>Account: {task.relatedCompanyName}</span>
                    )}
                    {task.relatedLeadName && <span>Lead: {task.relatedLeadName}</span>}
                    <span>Owner: {task.assignedOwner.split(" ")[0]}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  if (window.confirm(`Delete task "${task.title}"?`)) {
                    deleteTask(task.id);
                  }
                }}
                className="text-[#747A75] hover:text-red-600 p-1 rounded transition-colors"
                title="Delete task"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
