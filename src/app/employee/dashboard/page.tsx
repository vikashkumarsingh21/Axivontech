"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import {
  Clock,
  CheckCircle2,
  FileText,
  ArrowRight,
  Coffee,
  Calendar,
  Megaphone,
  PlusCircle,
  HelpCircle,
  FolderOpen,
  Zap,
} from "lucide-react";
import { SkeletonCard } from "@/components/employee/SkeletonCard";
import { EpButton } from "@/components/employee/EpButton";

function formatMinutes(mins: number): string {
  if (mins === undefined || mins === null) return "0h 0m";
  const abs = Math.abs(mins);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `${h}h ${m}m`;
}

function formatTime(dt: string | null) {
  if (!dt) return "—";
  return new Date(dt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

export default function EmployeeDashboard() {
  const [user, setUser] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [greeting, setGreeting] = useState("Hello");
  const [dateStr, setDateStr] = useState("");
  const [togglingTaskId, setTogglingTaskId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening");
    setDateStr(
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    );
  }, []);

  const fetchDashboard = useCallback(async () => {
    try {
      const [meRes, dashRes] = await Promise.all([
        fetch("/api/v1/employee/me"),
        fetch("/api/v1/employee/dashboard"),
      ]);
      const meData = await meRes.json();
      const dashData = await dashRes.json();
      if (meData?.user) setUser(meData.user);
      if (dashData?.success) setData(dashData.data);
    } catch (e) {
      console.error("Dashboard load error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleTaskStatus = async (taskId: string, newStatus: string) => {
    setTogglingTaskId(taskId);
    // Optimistic UI update
    setData((prev: any) => {
      if (!prev?.recentTasks) return prev;
      return {
        ...prev,
        recentTasks: prev.recentTasks.map((t: any) =>
          t.id === taskId ? { ...t, status: newStatus } : t
        ),
      };
    });

    try {
      const res = await fetch("/api/v1/employee/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, status: newStatus }),
      });
      if (res.ok) {
        fetchDashboard();
      }
    } catch (e) {
      console.error("Task toggle error:", e);
      fetchDashboard();
    } finally {
      setTogglingTaskId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 sm:space-y-8 animate-pulse pb-12">
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2E2E30]">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-[#1A1A1B] border border-[#2E2E30] rounded-lg" />
            <div className="h-4 w-80 bg-[#1A1A1B]/70 border border-[#2E2E30]/70 rounded-md" />
          </div>
          <div className="flex gap-2.5">
            <div className="h-10 w-32 bg-[#1A1A1B] border border-[#2E2E30] rounded-lg" />
            <div className="h-10 w-32 bg-[#1A1A1B] border border-[#2E2E30] rounded-lg" />
          </div>
        </div>

        {/* 4 Metric cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>

        {/* 2-col content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-72 rounded-xl bg-[#1A1A1B] border border-[#2E2E30]" />
            <div className="h-44 rounded-xl bg-[#1A1A1B] border border-[#2E2E30]" />
          </div>
          <div className="space-y-6">
            <div className="h-48 rounded-xl bg-[#1A1A1B] border border-[#2E2E30]" />
            <div className="h-64 rounded-xl bg-[#1A1A1B] border border-[#2E2E30]" />
          </div>
        </div>
      </div>
    );
  }

  const attendance = data?.attendance;
  const isCheckedIn = attendance?.checkInAt && !attendance?.checkOutAt;
  const isCheckedOut = attendance?.checkInAt && attendance?.checkOutAt;
  const taskStats = data?.taskStats || { total: 0, active: 0, completed: 0, overdue: 0, dueToday: 0 };
  const hasReportToday = data?.hasReportToday;

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 sm:space-y-8 relative pb-12"
    >
      {/* ── 1. Personalized Greeting & Header ───────────────────────── */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#2E2E30]"
      >
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#EDEBE6]">
              {mounted ? greeting : "Hello"}, {user?.name?.split(" ")[0] || "Team Member"}
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#232324] text-[#B3AFA6] border border-[#2E2E30]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4F9D83]" />
              <span>{user?.department || "Engineering"}</span>
            </span>
            {isCheckedIn && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#5FAE7E]/10 text-[#5FAE7E] border border-[#5FAE7E]/30">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5FAE7E] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#5FAE7E]"></span>
                </span>
                <span>Active Shift</span>
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-[#8A867E]">
            {mounted ? dateStr : ""} • Daily workspace overview, deliverables & team updates.
          </p>
        </div>

        {/* Centralized Action Buttons in Header */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link href="/employee/attendance">
            <EpButton variant="primary" size="md" icon={<Clock className="w-4 h-4" />}>
              My Attendance
            </EpButton>
          </Link>
          <Link href="/employee/work-reports">
            <EpButton variant="secondary" size="md" icon={<FileText className="w-4 h-4 text-[#4F9D83]" />}>
              Work Report
            </EpButton>
          </Link>
        </div>
      </motion.div>

      {/* ── 2. Top Metric Cards ─────────────────────────────────────── */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* Card 1: Attendance Today */}
        <motion.div
          variants={itemVariants}
          className="p-5 rounded-xl bg-[#1A1A1B] border border-[#2E2E30] hover:border-[#3A3A3D] transition-all duration-200 flex flex-col justify-between gap-3 group"
        >
          <div className="flex items-center justify-between text-[#8A867E]">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8A867E]">Today's Shift</span>
            <div className="w-8 h-8 rounded-lg bg-[#232324] border border-[#2E2E30] flex items-center justify-center text-[#4F9D83]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-semibold text-[#EDEBE6]">
              {isCheckedIn
                ? `In • ${formatTime(attendance.checkInAt)}`
                : isCheckedOut
                ? "Shift Completed"
                : "Not Checked In"}
            </div>
            <p className="text-xs text-[#B3AFA6] mt-1 font-mono">
              {isCheckedIn
                ? `Live worked: ${formatMinutes(attendance.netMinutes || attendance.grossMinutes || 0)}`
                : isCheckedOut
                ? `Out at ${formatTime(attendance.checkOutAt)} (${formatMinutes(attendance.netMinutes || attendance.grossMinutes || 0)})`
                : `Target: ${formatMinutes(user?.requiredDailyMinutes || attendance?.requiredDailyMinutes || 480)}`}
            </p>
          </div>
          <Link
            href="/employee/attendance"
            className="text-xs font-medium text-[#4F9D83] hover:text-[#5BB094] inline-flex items-center gap-1.5 pt-1 transition-colors"
          >
            <span>View Attendance Log</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </motion.div>

        {/* Card 2: Assigned Tasks */}
        <motion.div
          variants={itemVariants}
          className="p-5 rounded-xl bg-[#1A1A1B] border border-[#2E2E30] hover:border-[#3A3A3D] transition-all duration-200 flex flex-col justify-between gap-3 group"
        >
          <div className="flex items-center justify-between text-[#8A867E]">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8A867E]">Assigned Tasks</span>
            <div className="w-8 h-8 rounded-lg bg-[#232324] border border-[#2E2E30] flex items-center justify-center text-[#4F9D83]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-semibold text-[#EDEBE6]">
              {taskStats.active} Active
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs">
              {taskStats.overdue > 0 && (
                <span className="text-[#C46A62] font-semibold bg-[#C46A62]/10 px-1.5 py-0.5 rounded border border-[#C46A62]/25">
                  {taskStats.overdue} overdue
                </span>
              )}
              {taskStats.dueToday > 0 && (
                <span className="text-[#C9A15B] font-semibold bg-[#C9A15B]/10 px-1.5 py-0.5 rounded border border-[#C9A15B]/25">
                  {taskStats.dueToday} due today
                </span>
              )}
              {taskStats.overdue === 0 && taskStats.dueToday === 0 && (
                <span className="text-[#8A867E]">All deliverables on track</span>
              )}
            </div>
          </div>
          <Link
            href="/employee/tasks"
            className="text-xs font-medium text-[#4F9D83] hover:text-[#5BB094] inline-flex items-center gap-1.5 pt-1 transition-colors"
          >
            <span>Open Tasks Board</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </motion.div>

        {/* Card 3: Today's Work Report */}
        <motion.div
          variants={itemVariants}
          className="p-5 rounded-xl bg-[#1A1A1B] border border-[#2E2E30] hover:border-[#3A3A3D] transition-all duration-200 flex flex-col justify-between gap-3 group"
        >
          <div className="flex items-center justify-between text-[#8A867E]">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8A867E]">Daily Work Report</span>
            <div className="w-8 h-8 rounded-lg bg-[#232324] border border-[#2E2E30] flex items-center justify-center text-[#4F9D83]">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-semibold text-[#EDEBE6]">
              {hasReportToday ? "Submitted" : "Pending EOD"}
            </div>
            <p className="text-xs text-[#B3AFA6] mt-1 line-clamp-1">
              {hasReportToday
                ? `Logged: ${data.todayWorkReport.summary}`
                : "Required before ending shift"}
            </p>
          </div>
          <Link
            href="/employee/work-reports"
            className="text-xs font-medium text-[#4F9D83] hover:text-[#5BB094] inline-flex items-center gap-1.5 pt-1 transition-colors"
          >
            <span>{hasReportToday ? "Review / Edit Report" : "Submit Daily Report"}</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </motion.div>

        {/* Card 4: Leave & Time Off */}
        <motion.div
          variants={itemVariants}
          className="p-5 rounded-xl bg-[#1A1A1B] border border-[#2E2E30] hover:border-[#3A3A3D] transition-all duration-200 flex flex-col justify-between gap-3 group"
        >
          <div className="flex items-center justify-between text-[#8A867E]">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8A867E]">Leave & Time Off</span>
            <div className="w-8 h-8 rounded-lg bg-[#232324] border border-[#2E2E30] flex items-center justify-center text-[#8E9AAF]">
              <Coffee className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-semibold text-[#EDEBE6]">
              {data?.leaveStats?.upcomingApproved
                ? "Approved Upcoming"
                : data?.leaveStats?.pendingCount > 0
                ? `${data.leaveStats.pendingCount} Pending`
                : "No Leave Active"}
            </div>
            <p className="text-xs text-[#B3AFA6] mt-1">
              {data?.leaveStats?.upcomingApproved
                ? `From ${new Date(data.leaveStats.upcomingApproved.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                : "Leave balance ready"}
            </p>
          </div>
          <Link
            href="/employee/leave"
            className="text-xs font-medium text-[#4F9D83] hover:text-[#5BB094] inline-flex items-center gap-1.5 pt-1 transition-colors"
          >
            <span>Manage Leave</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </motion.div>
      </motion.div>

      {/* ── 3. Main Dashboard Layout (2/3 and 1/3) ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left Column: Tasks & Live Punch Widget */}
        <div className="lg:col-span-2 space-y-6">
          {/* Priority Task Watchlist */}
          <motion.div
            variants={itemVariants}
            className="p-5 sm:p-6 rounded-xl bg-[#1A1A1B] border border-[#2E2E30] space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-[#EDEBE6] flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#232324] border border-[#2E2E30] flex items-center justify-center text-[#4F9D83]">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span>Tasks Due Today & In Progress</span>
                </h2>
                <p className="text-xs text-[#8A867E] mt-1">
                  Deliverables requiring completion or active engineering focus today.
                </p>
              </div>
              <Link
                href="/employee/tasks"
                className="text-xs font-medium text-[#4F9D83] hover:text-[#5BB094] inline-flex items-center gap-1 transition-colors"
              >
                <span>All Tasks ({taskStats.total})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {data?.recentTasks?.length > 0 ? (
                data.recentTasks.map((t: any) => {
                  const isDone = t.status === "COMPLETED";
                  return (
                    <div
                      key={t.id}
                      className="p-3.5 rounded-lg border border-[#2E2E30] bg-[#121212]/50 hover:bg-[#232324]/50 hover:border-[#3A3A3D] flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors group"
                    >
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2.5">
                          <button
                            onClick={() => handleTaskStatus(t.id, isDone ? "TODO" : "COMPLETED")}
                            disabled={togglingTaskId === t.id}
                            className={`w-5 h-5 rounded border flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                              isDone
                                ? "bg-[#4F9D83] border-[#4F9D83] text-[#0F1A16]"
                                : "border-[#3A3A3D] hover:border-[#4F9D83] hover:bg-[#4F9D83]/10"
                            }`}
                            aria-label={`Toggle task completion: ${t.title}`}
                          >
                            {isDone && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                          </button>
                          <span
                            className={`text-sm font-medium truncate transition-colors ${
                              isDone ? "line-through text-[#8A867E]" : "text-[#EDEBE6] group-hover:text-[#EDEBE6]"
                            }`}
                          >
                            {t.title}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#8A867E] pl-7">
                          {t.project?.name && (
                            <span className="px-2 py-0.5 rounded bg-[#232324] text-[#B3AFA6] border border-[#2E2E30] font-medium">
                              {t.project.name}
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 rounded font-medium ${
                              t.priority === "URGENT" || t.priority === "HIGH"
                                ? "bg-[#C46A62]/10 text-[#C46A62] border border-[#C46A62]/25"
                                : "bg-[#232324] text-[#8A867E]"
                            }`}
                          >
                            {t.priority}
                          </span>
                          {t.dueDate && (
                            <span className="flex items-center gap-1.5 text-[#8A867E]">
                              <Calendar className="w-3 h-3 text-[#8A867E]" />
                              Due: {new Date(t.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pl-7 sm:pl-0 shrink-0">
                        <span
                          className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${
                            t.status === "COMPLETED"
                              ? "bg-[#5FAE7E]/10 text-[#5FAE7E] border-[#5FAE7E]/25"
                              : t.status === "IN_PROGRESS"
                              ? "bg-[#4F9D83]/10 text-[#4F9D83] border-[#4F9D83]/25"
                              : t.status === "BLOCKED"
                              ? "bg-[#C46A62]/10 text-[#C46A62] border-[#C46A62]/25"
                              : "bg-[#232324] text-[#B3AFA6] border-[#2E2E30]"
                          }`}
                        >
                          {t.status.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-xs text-[#8A867E] border border-dashed border-[#2E2E30] rounded-lg bg-[#121212]/30">
                  No active tasks assigned. Great work staying ahead of schedule!
                </div>
              )}
            </div>
          </motion.div>

          {/* Quick Work Report Summary Card */}
          <motion.div
            variants={itemVariants}
            className="p-5 sm:p-6 rounded-xl bg-[#1A1A1B] border border-[#2E2E30] space-y-3.5"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-[#EDEBE6] flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#232324] border border-[#2E2E30] flex items-center justify-center text-[#4F9D83]">
                  <FileText className="w-4 h-4" />
                </div>
                <span>Today's Work Summary</span>
              </h2>
              <span
                className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded border ${
                  hasReportToday
                    ? "bg-[#5FAE7E]/10 text-[#5FAE7E] border-[#5FAE7E]/25"
                    : "bg-[#C9A15B]/10 text-[#C9A15B] border-[#C9A15B]/25"
                }`}
              >
                {hasReportToday ? "REPORT SUBMITTED" : "PENDING SUBMISSION"}
              </span>
            </div>

            {hasReportToday ? (
              <div className="p-4 rounded-lg bg-[#121212]/60 border border-[#2E2E30] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#EDEBE6]">{data.todayWorkReport.summary}</span>
                  <span className="text-[#8A867E] font-mono">
                    {data.todayWorkReport.hoursWorked ?? (user?.requiredDailyMinutes ? Math.round(user.requiredDailyMinutes / 60) : 8)} hrs logged
                  </span>
                </div>
                <p className="text-xs text-[#B3AFA6] line-clamp-2">
                  {data.todayWorkReport.workPerformed}
                </p>
                <div className="pt-2 flex justify-end">
                  <Link
                    href="/employee/work-reports"
                    className="text-xs font-medium text-[#4F9D83] hover:text-[#5BB094] flex items-center gap-1.5 transition-colors"
                  >
                    <span>Update Today's Report</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-[#121212]/60 border border-[#2E2E30] flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
                <div className="text-xs text-[#8A867E]">
                  You have not submitted a work report for today yet. Logging your daily progress helps keep team deliverables aligned.
                </div>
                <Link href="/employee/work-reports">
                  <EpButton variant="primary" size="sm" icon={<PlusCircle className="w-3.5 h-3.5" />}>
                    Submit Report
                  </EpButton>
                </Link>
              </div>
            )}
          </motion.div>
        </div>

        {/* Right Column: Quick Navigation, Announcements & Help */}
        <div className="space-y-6">
          {/* Quick Shortcuts */}
          <motion.div
            variants={itemVariants}
            className="p-5 sm:p-6 rounded-xl bg-[#1A1A1B] border border-[#2E2E30] space-y-3.5"
          >
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8A867E]">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              <Link
                href="/employee/attendance"
                className="p-3.5 rounded-lg bg-[#121212]/60 hover:bg-[#232324] border border-[#2E2E30] hover:border-[#4F9D83]/40 transition-colors flex flex-col gap-1 text-left group"
              >
                <Clock className="w-4 h-4 text-[#4F9D83] group-hover:scale-105 transition-transform" />
                <span className="text-xs font-medium text-[#EDEBE6]">Attendance</span>
                <span className="text-[10px] text-[#8A867E]">Punches & breaks</span>
              </Link>

              <Link
                href="/employee/calendar"
                className="p-3.5 rounded-lg bg-[#121212]/60 hover:bg-[#232324] border border-[#2E2E30] hover:border-[#4F9D83]/40 transition-colors flex flex-col gap-1 text-left group"
              >
                <Calendar className="w-4 h-4 text-[#4F9D83] group-hover:scale-105 transition-transform" />
                <span className="text-xs font-medium text-[#EDEBE6]">Calendar</span>
                <span className="text-[10px] text-[#8A867E]">Schedule & holidays</span>
              </Link>

              <Link
                href="/employee/documents"
                className="p-3.5 rounded-lg bg-[#121212]/60 hover:bg-[#232324] border border-[#2E2E30] hover:border-[#4F9D83]/40 transition-colors flex flex-col gap-1 text-left group"
              >
                <FolderOpen className="w-4 h-4 text-[#4F9D83] group-hover:scale-105 transition-transform" />
                <span className="text-xs font-medium text-[#EDEBE6]">Documents</span>
                <span className="text-[10px] text-[#8A867E]">Policies & files</span>
              </Link>

              <Link
                href="/employee/support"
                className="p-3.5 rounded-lg bg-[#121212]/60 hover:bg-[#232324] border border-[#2E2E30] hover:border-[#4F9D83]/40 transition-colors flex flex-col gap-1 text-left group"
              >
                <HelpCircle className="w-4 h-4 text-[#4F9D83] group-hover:scale-105 transition-transform" />
                <span className="text-xs font-medium text-[#EDEBE6]">Support</span>
                <span className="text-[10px] text-[#8A867E]">Tickets & FAQs</span>
              </Link>
            </div>
          </motion.div>

          {/* Recent Company Announcements */}
          <motion.div
            variants={itemVariants}
            className="p-5 sm:p-6 rounded-xl bg-[#1A1A1B] border border-[#2E2E30] space-y-3.5"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8A867E] flex items-center gap-2">
                <Megaphone className="w-3.5 h-3.5 text-[#4F9D83]" />
                <span>Announcements</span>
              </h3>
              <Link href="/employee/announcements" className="text-[11px] font-medium text-[#4F9D83] hover:text-[#5BB094] hover:underline">
                View all
              </Link>
            </div>

            <div className="space-y-2.5">
              {data?.recentAnnouncements?.length > 0 ? (
                data.recentAnnouncements.map((ann: any) => (
                  <Link
                    key={ann.id}
                    href="/employee/announcements"
                    className="block p-3.5 rounded-lg bg-[#121212]/60 hover:bg-[#232324] border border-[#2E2E30] hover:border-[#3A3A3D] transition-colors group"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-medium text-[#EDEBE6] group-hover:text-[#4F9D83] transition-colors truncate">
                        {ann.title}
                      </span>
                      <span
                        className={`text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
                          ann.priority === "URGENT" || ann.priority === "HIGH"
                            ? "bg-[#C46A62]/10 text-[#C46A62] border border-[#C46A62]/25"
                            : "bg-[#232324] text-[#8A867E]"
                        }`}
                      >
                        {ann.priority}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8A867E] line-clamp-2">{ann.content}</p>
                    <span className="text-[10px] text-[#8A867E]/80 block mt-1.5 font-mono">
                      {new Date(ann.publishAt).toLocaleDateString()}
                    </span>
                  </Link>
                ))
              ) : (
                <div className="p-5 text-center text-xs text-[#8A867E] border border-dashed border-[#2E2E30] rounded-lg bg-[#121212]/30">
                  No new announcements.
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
