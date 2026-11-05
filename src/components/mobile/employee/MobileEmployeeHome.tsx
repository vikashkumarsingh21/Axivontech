"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Clock,
  CheckCircle2,
  Coffee,
  AlertCircle,
  Calendar,
  Megaphone,
  ArrowRight,
  Loader2,
  CalendarCheck,
  FileText,
  FolderOpen,
  Sparkles,
} from "lucide-react";
import { ConfirmDialog } from "../ConfirmDialog";
import { CardList, type CardListItem } from "../CardList";

interface MobileEmployeeHomeProps {
  data: any;
  user: any;
  onRefresh?: () => Promise<void>;
}

export function MobileEmployeeHome({ data, user, onRefresh }: MobileEmployeeHomeProps) {
  const [tickerSeconds, setTickerSeconds] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirmCheckoutOpen, setConfirmCheckoutOpen] = useState(false);
  const [togglingTaskId, setTogglingTaskId] = useState<string | null>(null);

  const attendance = data?.attendance;
  const isCheckedIn = Boolean(attendance?.checkInAt && !attendance?.checkOutAt);
  const isCheckedOut = Boolean(attendance?.checkInAt && attendance?.checkOutAt);
  const isOnBreak = Boolean(attendance?.isOnBreak);
  const taskStats = data?.taskStats || { total: 0, active: 0, completed: 0, dueToday: 0 };
  const recentTasks = data?.recentTasks || [];
  const announcements = data?.announcements || [];

  // Live seconds ticker when checked in
  useEffect(() => {
    if (!isCheckedIn || !attendance?.checkInAt) {
      setTickerSeconds(0);
      return;
    }

    const checkInTime = new Date(attendance.checkInAt).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const elapsedSec = Math.max(0, Math.floor((now - checkInTime) / 1000));
      setTickerSeconds(elapsedSec);
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [isCheckedIn, attendance?.checkInAt]);

  const formattedTimer = useMemo(() => {
    if (!isCheckedIn) return "00:00:00";
    const hrs = Math.floor(tickerSeconds / 3600);
    const mins = Math.floor((tickerSeconds % 3600) / 60);
    const secs = tickerSeconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, [isCheckedIn, tickerSeconds]);

  // Attendance metric
  const attendancePercentDisplay = useMemo(() => {
    if (typeof attendance?.monthlyPercent === "number") {
      return `${Math.round(attendance.monthlyPercent)}%`;
    }
    if (typeof attendance?.monthlyPercent === "string" && attendance.monthlyPercent.trim()) {
      return `${attendance.monthlyPercent}%`;
    }
    const reqMins = attendance?.requiredDailyMinutes || user?.requiredDailyMinutes || 480;
    const netMins = attendance?.netMinutes ?? attendance?.grossMinutes;
    if (typeof netMins === "number" && reqMins > 0 && (isCheckedIn || isCheckedOut)) {
      return `${Math.min(100, Math.round((netMins / reqMins) * 100))}%`;
    }
    return "—";
  }, [attendance, user, isCheckedIn, isCheckedOut]);

  // Leaves available
  const leavesRemainingDisplay = useMemo(() => {
    if (typeof data?.leaveBalance === "number") {
      return `${data.leaveBalance} d`;
    }
    const balances = data?.leaveStats?.balances;
    if (Array.isArray(balances) && balances.length > 0) {
      const totalRemaining = balances.reduce((acc: number, b: any) => acc + (b.remainingDays || 0), 0);
      return `${totalRemaining} d`;
    }
    if (data?.leaveStats?.pendingCount !== undefined) {
      return `${data.leaveStats.pendingCount} req`;
    }
    return "—";
  }, [data]);

  const checkInAt = attendance?.checkInAt;
  const checkInTimeStr = useMemo(() => {
    if (!checkInAt) return null;
    return new Date(checkInAt).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [checkInAt]);

  const handleAttendanceAction = async (action: "check-in" | "check-out" | "break-start" | "break-end") => {
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await fetch("/api/v1/employee/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, breakType: "LUNCH", notes: "" }),
      });
      const resJson = await res.json();
      if (!res.ok) {
        throw new Error(resJson.error || resJson.message || "Attendance action failed");
      }
      if (onRefresh) {
        await onRefresh();
      }
    } catch (e: any) {
      setActionError(e.message || "Failed to update attendance.");
    } finally {
      setActionLoading(false);
      setConfirmCheckoutOpen(false);
    }
  };

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "COMPLETED" ? "IN_PROGRESS" : "COMPLETED";
    setTogglingTaskId(taskId);
    try {
      await fetch("/api/v1/employee/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, status: nextStatus }),
      });
      if (onRefresh) {
        await onRefresh();
      }
    } catch (e) {
      // Ignored
    } finally {
      setTogglingTaskId(null);
    }
  };

  // Map priority tasks for CardList
  const taskCardItems: CardListItem[] = recentTasks.slice(0, 3).map((task: any) => ({
    id: task.id,
    title: task.title,
    subtitle: task.project?.name || "General Work",
    status: {
      label: task.status === "COMPLETED" ? "Completed" : "In Progress",
      variant: task.status === "COMPLETED" ? "success" : "accent",
    },
    fields: [
      {
        label: "Priority",
        value: (
          <span
            className={
              task.priority === "HIGH" || task.priority === "CRITICAL"
                ? "text-rose-600 font-semibold"
                : "text-slate-600"
            }
          >
            {task.priority || "NORMAL"}
          </span>
        ),
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
    action: (
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          disabled={togglingTaskId === task.id}
          onClick={() => handleToggleTask(task.id, task.status)}
          className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 active:scale-95 transition-transform"
        >
          {togglingTaskId === task.id ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-teal-600" />
          ) : task.status === "COMPLETED" ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />
          ) : (
            <div className="h-3.5 w-3.5 rounded-xs border border-slate-400" />
          )}
          <span>{task.status === "COMPLETED" ? "Completed" : "Mark Done"}</span>
        </button>
        <Link
          href="/employee/tasks"
          className="text-xs font-semibold text-teal-600 flex items-center gap-1 hover:underline"
        >
          <span>Details</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    ),
  }));

  return (
    <div className="space-y-4">
      {/* ── Error Banner if any ────────────────────────────────────────── */}
      {Boolean(actionError) && (
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs shadow-xs">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span className="flex-1 font-medium">{actionError}</span>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="text-rose-600 hover:text-rose-800 font-bold ml-2"
          >
            &times;
          </button>
        </div>
      )}

      {/* ── Attendance Running Shift Card (Light Enterprise) ─────────────── */}
      <section className="rounded-2xl bg-white border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Today&apos;s Shift
              </span>
              <span className="text-xs font-semibold text-slate-800">
                {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
              </span>
            </div>
          </div>

          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
              isCheckedIn
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : isCheckedOut
                ? "bg-slate-100 text-slate-600 border-slate-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isCheckedIn
                  ? "bg-emerald-500 animate-pulse"
                  : isCheckedOut
                  ? "bg-slate-400"
                  : "bg-amber-500"
              }`}
            />
            <span>
              {isCheckedIn
                ? `Checked In • ${checkInTimeStr}`
                : isCheckedOut
                ? "Shift Completed"
                : "Not Checked In"}
            </span>
          </div>
        </div>

        {/* Live Ticker Clock */}
        <div className="text-center py-2 bg-slate-50 rounded-xl border border-slate-100">
          <div className="text-3xl font-extrabold tracking-tight text-slate-900 tabular-nums">
            {isCheckedIn ? formattedTimer : "00:00:00"}
          </div>
          <div className="text-xs text-slate-500 mt-1 font-medium">
            {isCheckedIn
              ? isOnBreak
                ? "Currently on Break"
                : "Active Work Session"
              : isCheckedOut
              ? "Day closed • Shift complete"
              : `Daily Shift Target: ${Math.round((user?.requiredDailyMinutes || attendance?.requiredDailyMinutes || 480) / 60)}h`}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          {!isCheckedIn ? (
            <button
              type="button"
              disabled={actionLoading || isCheckedOut}
              onClick={() => handleAttendanceAction("check-in")}
              className="col-span-2 h-12 flex items-center justify-center gap-2 rounded-xl bg-teal-600 text-white font-semibold text-sm hover:bg-teal-700 active:scale-[0.99] transition-all shadow-xs disabled:opacity-50"
            >
              {actionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Clock className="h-4 w-4" />
              )}
              <span>{isCheckedOut ? "Shift Completed for Today" : "Check In Now"}</span>
            </button>
          ) : (
            <>
              {/* Break toggle button */}
              <button
                type="button"
                disabled={actionLoading}
                onClick={() =>
                  handleAttendanceAction(isOnBreak ? "break-end" : "break-start")
                }
                className="h-12 flex items-center justify-center gap-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 font-semibold text-sm hover:bg-slate-200 active:scale-[0.99] transition-all disabled:opacity-50"
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
                ) : (
                  <Coffee className="h-4 w-4 text-amber-600" />
                )}
                <span>{isOnBreak ? "End Break" : "Take Break"}</span>
              </button>

              {/* Check Out button */}
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setConfirmCheckoutOpen(true)}
                className="h-12 flex items-center justify-center gap-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-semibold text-sm hover:bg-rose-100 active:scale-[0.99] transition-all disabled:opacity-50"
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Clock className="h-4 w-4" />
                )}
                <span>Check Out</span>
              </button>
            </>
          )}
        </div>
      </section>

      {/* ── Key Metrics Strip (Light Enterprise) ─────────────────────────── */}
      <section className="grid grid-cols-3 gap-2.5">
        <div className="rounded-2xl bg-white border border-slate-200/90 p-3.5 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500">Attendance</span>
          <span className="text-xl font-extrabold text-slate-900 tabular-nums mt-1">
            {attendancePercentDisplay}
          </span>
          <span className="text-[10px] font-medium text-teal-600 mt-0.5">
            {attendancePercentDisplay !== "—" ? "Monthly" : "No Session"}
          </span>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200/90 p-3.5 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500">Tasks Due</span>
          <span className="text-xl font-extrabold text-slate-900 tabular-nums mt-1">
            {taskStats.dueToday || taskStats.active || 0}
          </span>
          <span className="text-[10px] font-medium text-amber-600 mt-0.5">Assigned</span>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200/90 p-3.5 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500">Leaves Left</span>
          <span className="text-xl font-extrabold text-slate-900 tabular-nums mt-1">
            {leavesRemainingDisplay}
          </span>
          <span className="text-[10px] font-medium text-slate-500 mt-0.5">Balance</span>
        </div>
      </section>

      {/* ── Quick Action Tiles (Light) ─────────────────────────────────── */}
      <section className="grid grid-cols-4 gap-2">
        <Link
          href="/employee/leave"
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 active:scale-95 transition-all"
        >
          <div className="h-10 w-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mb-1.5">
            <Coffee className="h-5 w-5" />
          </div>
          <span className="text-[11px] font-semibold text-slate-800 text-center leading-tight">
            Apply Leave
          </span>
        </Link>

        <Link
          href="/employee/work-reports"
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 active:scale-95 transition-all"
        >
          <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-1.5">
            <FileText className="h-5 w-5" />
          </div>
          <span className="text-[11px] font-semibold text-slate-800 text-center leading-tight">
            Work Report
          </span>
        </Link>

        <Link
          href="/employee/calendar"
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 active:scale-95 transition-all"
        >
          <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mb-1.5">
            <Calendar className="h-5 w-5" />
          </div>
          <span className="text-[11px] font-semibold text-slate-800 text-center leading-tight">
            Calendar
          </span>
        </Link>

        <Link
          href="/employee/documents"
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 active:scale-95 transition-all"
        >
          <div className="h-10 w-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 mb-1.5">
            <FolderOpen className="h-5 w-5" />
          </div>
          <span className="text-[11px] font-semibold text-slate-800 text-center leading-tight">
            Documents
          </span>
        </Link>
      </section>

      {/* ── Priority Tasks Section ────────────────────────────────────── */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-slate-900">Priority Tasks</h2>
          <Link
            href="/employee/tasks"
            className="text-xs font-semibold text-teal-600 flex items-center gap-1 hover:underline"
          >
            <span>View All ({taskStats.total || recentTasks.length})</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <CardList
          items={taskCardItems}
          emptyTitle="All caught up!"
          emptyDescription="You have no pending tasks assigned for today."
        />
      </section>

      {/* ── Announcements Notice Section (Light Enterprise) ───────────── */}
      {announcements.length > 0 && Boolean(announcements[0]?.title) && (
        <section className="rounded-2xl bg-amber-50/60 border border-amber-200/70 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-amber-600 shrink-0" />
            <span className="text-xs font-bold text-amber-900">Company Announcement</span>
          </div>
          <div className="text-xs text-slate-900 font-semibold">
            {announcements[0].title}
          </div>
          {Boolean(announcements[0]?.content) && (
            <p className="text-[11px] text-slate-600 line-clamp-2">
              {announcements[0].content}
            </p>
          )}
        </section>
      )}

      {/* Confirm Check-out Dialog */}
      <ConfirmDialog
        isOpen={confirmCheckoutOpen}
        title="Check Out for the Day?"
        message="Are you sure you want to end your shift? Once checked out, your daily hours will be finalized."
        confirmLabel="Confirm Check Out"
        cancelLabel="Continue Working"
        isDestructive={false}
        isLoading={actionLoading}
        onConfirm={() => handleAttendanceAction("check-out")}
        onCancel={() => setConfirmCheckoutOpen(false)}
      />
    </div>
  );
}
