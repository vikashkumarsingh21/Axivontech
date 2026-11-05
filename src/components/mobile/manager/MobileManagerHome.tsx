"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  CheckSquare,
  CalendarCheck,
  Coffee,
  FileText,
  AlertCircle,
  ArrowRight,
  Building2,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import { CardList, type CardListItem } from "../CardList";

interface MobileManagerHomeProps {
  initialData?: any;
  onRefresh?: () => Promise<void>;
}

export function MobileManagerHome({ initialData, onRefresh }: MobileManagerHomeProps) {
  const [data, setData] = useState<any>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/v1/manager/dashboard");
      if (!res.ok) throw new Error("Failed to load department metrics");
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        throw new Error(json.message || "Failed to load department dashboard");
      }
    } catch (e: any) {
      setError(e.message || "Failed to load department data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!initialData) {
      fetchDashboard();
    }
  }, [initialData, fetchDashboard]);

  const handlePullRefresh = async () => {
    setRefreshing(true);
    if (onRefresh) {
      await onRefresh();
    }
    await fetchDashboard();
  };

  if (loading && !data) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-28 rounded-2xl bg-white border border-slate-200" />
        <div className="grid grid-cols-2 gap-2.5">
          <div className="h-24 rounded-2xl bg-white border border-slate-200" />
          <div className="h-24 rounded-2xl bg-white border border-slate-200" />
          <div className="h-24 rounded-2xl bg-white border border-slate-200" />
          <div className="h-24 rounded-2xl bg-white border border-slate-200" />
        </div>
        <div className="h-44 rounded-2xl bg-white border border-slate-200" />
      </div>
    );
  }

  const dept = data?.department || {};
  const metrics = data?.metrics || {};
  const pendingLeaves = data?.pendingLeaves || [];
  const tasks = data?.tasks || [];

  const leaveCardItems: CardListItem[] = pendingLeaves.slice(0, 3).map((leave: any) => ({
    id: leave.id,
    title: leave.user?.name || "Employee",
    subtitle: `${leave.leaveType || "Leave"} • ${leave.totalDays || 1} day(s)`,
    status: {
      label: "Pending Approval",
      variant: "warning",
    },
    fields: [
      {
        label: "Start Date",
        value: leave.startDate
          ? new Date(leave.startDate).toLocaleDateString("en-IN", {
              month: "short",
              day: "numeric",
            })
          : "—",
      },
      {
        label: "Reason",
        value: leave.reason || "Personal",
      },
    ],
    href: "/manager/leave",
  }));

  const taskCardItems: CardListItem[] = tasks.slice(0, 3).map((task: any) => ({
    id: task.id,
    title: task.title,
    subtitle: task.user?.name ? `Assignee: ${task.user.name}` : "Unassigned",
    status: {
      label: task.status === "COMPLETED" ? "Completed" : "In Progress",
      variant: task.status === "COMPLETED" ? "success" : "accent",
    },
    fields: [
      {
        label: "Priority",
        value: task.priority || "NORMAL",
      },
      {
        label: "Due Date",
        value: task.dueDate
          ? new Date(task.dueDate).toLocaleDateString("en-IN", {
              month: "short",
              day: "numeric",
            })
          : "No deadline",
      },
    ],
    href: "/manager/tasks",
  }));

  return (
    <div className="space-y-4">
      {/* ── Error Banner ────────────────────────────────────────────────── */}
      {Boolean(error) && (
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs shadow-xs">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span className="flex-1 font-medium">{error}</span>
          <button
            type="button"
            onClick={() => fetchDashboard()}
            className="text-teal-700 hover:underline font-semibold"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Department Header Card (Light Enterprise) ───────────────────── */}
      <section className="rounded-2xl bg-white border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Department Management
              </span>
              <h2 className="text-base font-bold text-slate-900">
                {dept.name || "Operations Department"}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePullRefresh}
            disabled={refreshing}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 active:scale-95 transition-transform"
            aria-label="Refresh Dashboard"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-teal-600" : ""}`} />
          </button>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">Code: {dept.code || "DEPT"}</span>
          <span className="text-slate-400 text-[11px]">
            {new Date().toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" })}
          </span>
        </div>
      </section>

      {/* ── 4 Key Department Metrics (Clean White Cards) ────────────────── */}
      <section className="grid grid-cols-2 gap-2.5">
        <Link
          href="/manager/employees"
          className="rounded-2xl bg-white border border-slate-200/90 p-4 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Team Size</span>
            <div className="h-7 w-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Users className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {metrics.totalEmployees ?? 0}
            </div>
            <span className="text-[10px] font-medium text-slate-500">Employees</span>
          </div>
        </Link>

        <Link
          href="/manager/attendance"
          className="rounded-2xl bg-white border border-slate-200/90 p-4 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Present Today</span>
            <div className="h-7 w-7 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
              <CalendarCheck className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-teal-700 tabular-nums">
              {metrics.presentToday ?? 0}
            </div>
            <span className="text-[10px] font-medium text-teal-600">Checked In</span>
          </div>
        </Link>

        <Link
          href="/manager/leave"
          className="rounded-2xl bg-white border border-slate-200/90 p-4 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Leave Requests</span>
            <div className="h-7 w-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Coffee className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-amber-600 tabular-nums">
              {metrics.pendingLeavesCount ?? pendingLeaves.length ?? 0}
            </div>
            <span className="text-[10px] font-medium text-amber-600">Pending Review</span>
          </div>
        </Link>

        <Link
          href="/manager/tasks"
          className="rounded-2xl bg-white border border-slate-200/90 p-4 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Pending Tasks</span>
            <div className="h-7 w-7 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <CheckSquare className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {metrics.pendingTasks ?? 0}
            </div>
            <span className="text-[10px] font-medium text-slate-500">Workload</span>
          </div>
        </Link>
      </section>

      {/* ── Pending Leave Approvals Section ─────────────────────────────── */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-slate-900">Pending Leaves</h2>
          <Link
            href="/manager/leave"
            className="text-xs font-semibold text-teal-600 flex items-center gap-1 hover:underline"
          >
            <span>View All ({pendingLeaves.length})</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <CardList
          items={leaveCardItems}
          emptyTitle="No pending leave requests"
          emptyDescription="All leave requests for your department have been reviewed."
        />
      </section>

      {/* ── Department Workload / Tasks ─────────────────────────────────── */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-slate-900">Active Tasks</h2>
          <Link
            href="/manager/tasks"
            className="text-xs font-semibold text-teal-600 flex items-center gap-1 hover:underline"
          >
            <span>View All Tasks</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <CardList
          items={taskCardItems}
          emptyTitle="No active tasks"
          emptyDescription="There are currently no assigned tasks in your department."
        />
      </section>
    </div>
  );
}
