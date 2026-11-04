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
  Check,
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

  // Attendance metric: real monthly percent or computed today's progress percent, otherwise "—"
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

  // Leaves available: computed from real leave balances or API, otherwise "—"
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

  const checkInTimeStr = useMemo(() => {
    if (!attendance?.checkInAt) return null;
    return new Date(attendance.checkInAt).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [attendance?.checkInAt]);

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
    subtitle: task.project?.name || "—",
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
                ? "text-[#C85555] font-semibold"
                : "text-[#B3AFA6]"
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
          className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-[#232324] border border-[#2E2E30] text-xs font-medium text-[#EDEBE6] active:scale-95 transition-transform"
        >
          {togglingTaskId === task.id ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-[#4F9D83]" />
          ) : task.status === "COMPLETED" ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-[#4F9D83]" />
          ) : (
            <div className="h-3.5 w-3.5 rounded-sm border border-[#B3AFA6]" />
          )}
          <span>{task.status === "COMPLETED" ? "Mark Incomplete" : "Mark Done"}</span>
        </button>
        <Link
          href="/employee/tasks"
          className="text-xs font-semibold text-[#4F9D83] flex items-center gap-1 hover:underline"
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
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#2A1515] border border-[#5A2424] text-[#F5A3A3] text-xs">
          <AlertCircle className="h-4 w-4 shrink-0 text-[#C85555]" />
          <span className="flex-1">{actionError}</span>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="text-[#F5A3A3] hover:text-white font-bold ml-2"
          >
            &times;
          </button>
        </div>
      )}

      {/* ── Attendance Running Shift Card ─────────────────────────────── */}
      <section className="rounded-2xl bg-[#1A1A1B] border border-[#2E2E30] p-4 sm:p-5 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#4F9D83]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#B3AFA6]">
              Today&apos;s Shift
            </span>
          </div>

          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
              isCheckedIn
                ? "bg-[#162721] text-[#A2D9C7] border-[#27483C]"
                : isCheckedOut
                ? "bg-[#232324] text-[#B3AFA6] border-[#2E2E30]"
                : "bg-[#2A1515] text-[#F5A3A3] border-[#5A2424]"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isCheckedIn
                  ? "bg-[#4F9D83] animate-pulse"
                  : isCheckedOut
                  ? "bg-[#827E76]"
                  : "bg-[#C85555]"
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
        <div className="text-center py-2">
          <div className="text-3xl font-bold tracking-tight text-[#EDEBE6] tabular-nums">
            {isCheckedIn ? formattedTimer : "00:00:00"}
          </div>
          <div className="text-xs text-[#827E76] mt-0.5 font-medium">
            {isCheckedIn
              ? isOnBreak
                ? "Currently on Break"
                : "Active Work Session"
              : isCheckedOut
              ? "Day closed"
              : `Daily Shift Target: ${Math.round((user?.requiredDailyMinutes || attendance?.requiredDailyMinutes || 480) / 60)}h`}
          </div>
        </div>

        {/* Action Buttons (Touch target >= 44px) */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          {!isCheckedIn ? (
            <button
              type="button"
              disabled={actionLoading || isCheckedOut}
              onClick={() => handleAttendanceAction("check-in")}
              className="col-span-2 h-12 flex items-center justify-center gap-2 rounded-xl bg-[#4F9D83] text-[#121212] font-semibold text-sm hover:bg-[#438770] active:scale-98 transition-all disabled:opacity-50"
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
                className="h-12 flex items-center justify-center gap-2 rounded-xl bg-[#232324] border border-[#2E2E30] text-[#EDEBE6] font-semibold text-sm hover:bg-[#2A2A2C] active:scale-98 transition-all disabled:opacity-50"
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-[#4F9D83]" />
                ) : (
                  <Coffee className="h-4 w-4 text-[#D4A359]" />
                )}
                <span>{isOnBreak ? "End Break" : "Take Break"}</span>
              </button>

              {/* Check Out button */}
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setConfirmCheckoutOpen(true)}
                className="h-12 flex items-center justify-center gap-2 rounded-xl bg-[#C85555] text-white font-semibold text-sm hover:bg-[#B04545] active:scale-98 transition-all disabled:opacity-50"
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

      {/* ── Key Metrics Strip ─────────────────────────────────────────── */}
      <section className="grid grid-cols-3 gap-2.5">
        <div className="rounded-2xl bg-[#1A1A1B] border border-[#2E2E30] p-3 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-[#B3AFA6]">Attendance</span>
          <span className="text-lg font-bold text-[#EDEBE6] tabular-nums mt-1">
            {attendancePercentDisplay}
          </span>
          <span className="text-[10px] text-[#4F9D83] mt-0.5">
            {attendancePercentDisplay !== "—" ? "Monthly / Shift" : "No Session"}
          </span>
        </div>

        <div className="rounded-2xl bg-[#1A1A1B] border border-[#2E2E30] p-3 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-[#B3AFA6]">Tasks Due</span>
          <span className="text-lg font-bold text-[#EDEBE6] tabular-nums mt-1">
            {taskStats.dueToday || taskStats.active || 0}
          </span>
          <span className="text-[10px] text-[#B3AFA6] mt-0.5">Pending</span>
        </div>

        <div className="rounded-2xl bg-[#1A1A1B] border border-[#2E2E30] p-3 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-[#B3AFA6]">Leaves Left</span>
          <span className="text-lg font-bold text-[#EDEBE6] tabular-nums mt-1">
            {leavesRemainingDisplay}
          </span>
          <span className="text-[10px] text-[#B3AFA6] mt-0.5">Available</span>
        </div>
      </section>

      {/* ── Priority Tasks Section ────────────────────────────────────── */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-semibold text-[#EDEBE6]">Priority Tasks</h2>
          <Link
            href="/employee/tasks"
            className="text-xs font-semibold text-[#4F9D83] flex items-center gap-1 hover:underline"
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

      {/* ── Announcements Notice Section ─────────────────────────────── */}
      {announcements.length > 0 && Boolean(announcements[0]?.title) && (
        <section className="rounded-2xl bg-[#1A1A1B] border border-[#2E2E30] p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-[#D4A359]" />
            <span className="text-xs font-semibold text-[#EDEBE6]">Company Announcements</span>
          </div>
          <div className="text-xs text-[#EDEBE6] font-medium">
            {announcements[0].title}
          </div>
          {Boolean(announcements[0]?.content) && (
            <p className="text-[11px] text-[#B3AFA6] line-clamp-2">
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
