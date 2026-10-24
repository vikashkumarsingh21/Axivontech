"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  Clock,
  CheckCircle2,
  FileText,
  AlertCircle,
  ArrowRight,
  Coffee,
  Calendar,
  Megaphone,
  Briefcase,
  ShieldCheck,
  PlusCircle,
  HelpCircle,
  FolderOpen,
  Sparkles,
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
      <div className="space-y-6 sm:space-y-8 animate-pulse">
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-slate-900 border border-slate-800 rounded-xl" />
            <div className="h-4 w-80 bg-slate-900/60 border border-slate-800/60 rounded-lg" />
          </div>
          <div className="flex gap-2.5">
            <div className="h-10 w-32 bg-slate-900 border border-slate-800 rounded-xl" />
            <div className="h-10 w-32 bg-slate-900 border border-slate-800 rounded-xl" />
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
            <div className="h-72 rounded-2xl bg-slate-900/80 border border-slate-800/80" />
            <div className="h-44 rounded-2xl bg-slate-900/80 border border-slate-800/80" />
          </div>
          <div className="space-y-6">
            <div className="h-48 rounded-2xl bg-slate-900/80 border border-slate-800/80" />
            <div className="h-64 rounded-2xl bg-slate-900/80 border border-slate-800/80" />
          </div>
        </div>
      </div>
    );
  }

  const attendance = data?.attendance;
  const isCheckedIn = attendance?.checkInAt && !attendance?.checkOutAt;
  const isCheckedOut = attendance?.checkInAt && attendance?.checkOutAt;
  const isOnBreak = attendance?.isOnBreak;
  const taskStats = data?.taskStats || { total: 0, active: 0, completed: 0, overdue: 0, dueToday: 0 };
  const hasReportToday = data?.hasReportToday;

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 sm:space-y-8 relative"
    >
      {/* ── Ambient Glow Background Effect ─────────────────────────── */}
      <div className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-[720px] h-[320px] bg-gradient-to-b from-indigo-500/12 via-sky-500/6 to-transparent blur-3xl opacity-70 -z-10" />

      {/* ── 1. Personalized Greeting & Header ───────────────────────── */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800/80"
      >
        <div className="space-y-1.5">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-heading text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-slate-200 to-indigo-200">
              {mounted ? greeting : "Hello"}, {user?.name?.split(" ")[0] || "Team Member"}
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-300 border border-indigo-500/25 shadow-xs">
              <Zap className="w-3 h-3 text-indigo-400" />
              <span>{user?.department || "Axivon Engineering"}</span>
            </span>
            {isCheckedIn && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shadow-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Active Shift</span>
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            {mounted ? dateStr : ""} • Daily workspace overview, tasks schedule & team updates.
          </p>
        </div>

        {/* Centralized Action Buttons in Header */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link href="/employee/attendance">
            <EpButton variant="primary" size="md" icon={<Clock className="w-3.5 h-3.5" />}>
              My Attendance
            </EpButton>
          </Link>
          <Link href="/employee/work-reports">
            <EpButton variant="secondary" size="md" icon={<FileText className="w-3.5 h-3.5 text-indigo-400" />}>
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
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="p-5 rounded-2xl bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 hover:border-sky-500/40 hover:shadow-lg hover:shadow-sky-500/5 transition-all duration-300 flex flex-col justify-between gap-3 group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-sky-500/10 transition-colors" />
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Today's Punch</span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/25 flex items-center justify-center text-sky-400 shadow-sm shadow-sky-500/10">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-slate-100 font-heading">
              {isCheckedIn
                ? `In • ${formatTime(attendance.checkInAt)}`
                : isCheckedOut
                ? "Shift Completed"
                : "Not Checked In"}
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              {isCheckedIn
                ? `Live worked: ${formatMinutes(attendance.netMinutes || attendance.grossMinutes || 0)}`
                : isCheckedOut
                ? `Out at ${formatTime(attendance.checkOutAt)} (${formatMinutes(attendance.netMinutes || attendance.grossMinutes || 0)})`
                : `Target: ${formatMinutes(user?.requiredDailyMinutes || attendance?.requiredDailyMinutes || 480)}`}
            </p>
          </div>
          <Link
            href="/employee/attendance"
            className="text-xs font-semibold text-sky-400 hover:text-sky-300 inline-flex items-center gap-1.5 pt-1 transition-colors group-hover:translate-x-0.5"
          >
            <span>View Attendance Log</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>

        {/* Card 2: Assigned Tasks */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="p-5 rounded-2xl bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col justify-between gap-3 group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-500/10 transition-colors" />
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Assigned Tasks</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400 shadow-sm shadow-indigo-500/10">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-slate-100 font-heading">
              {taskStats.active} Active
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs">
              {taskStats.overdue > 0 && (
                <span className="text-rose-400 font-semibold bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/25">
                  {taskStats.overdue} overdue
                </span>
              )}
              {taskStats.dueToday > 0 && (
                <span className="text-amber-400 font-semibold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/25">
                  {taskStats.dueToday} due today
                </span>
              )}
              {taskStats.overdue === 0 && taskStats.dueToday === 0 && (
                <span className="text-slate-400">All deliverables on track</span>
              )}
            </div>
          </div>
          <Link
            href="/employee/tasks"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1.5 pt-1 transition-colors group-hover:translate-x-0.5"
          >
            <span>Open Tasks Board</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>

        {/* Card 3: Today's Work Report */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="p-5 rounded-2xl bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300 flex flex-col justify-between gap-3 group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/10 transition-colors" />
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Daily Work Report</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shadow-sm shadow-amber-500/10">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-slate-100 font-heading">
              {hasReportToday ? "Submitted" : "Pending EOD"}
            </div>
            <p className="text-xs text-slate-400 mt-1 line-clamp-1">
              {hasReportToday
                ? `Logged: ${data.todayWorkReport.summary}`
                : "Required before ending shift"}
            </p>
          </div>
          <Link
            href="/employee/work-reports"
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1.5 pt-1 transition-colors group-hover:translate-x-0.5"
          >
            <span>{hasReportToday ? "Review / Edit Report" : "Submit Daily Report"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>

        {/* Card 4: Leave & Time Off */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="p-5 rounded-2xl bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-300 flex flex-col justify-between gap-3 group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-violet-500/10 transition-colors" />
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Leave & Time Off</span>
            <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/25 flex items-center justify-center text-violet-400 shadow-sm shadow-violet-500/10">
              <Coffee className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-slate-100 font-heading">
              {data?.leaveStats?.upcomingApproved
                ? "Approved Upcoming"
                : data?.leaveStats?.pendingCount > 0
                ? `${data.leaveStats.pendingCount} Pending`
                : "No Leave Active"}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {data?.leaveStats?.upcomingApproved
                ? `From ${new Date(data.leaveStats.upcomingApproved.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                : "Quota ready for requests"}
            </p>
          </div>
          <Link
            href="/employee/leave"
            className="text-xs font-semibold text-violet-400 hover:text-violet-300 inline-flex items-center gap-1.5 pt-1 transition-colors group-hover:translate-x-0.5"
          >
            <span>Manage Leave</span>
            <ArrowRight className="w-3.5 h-3.5" />
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
            className="p-5 sm:p-6 rounded-2xl bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 space-y-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2.5 font-heading">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span>Tasks Due Today & In Progress</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Deliverables requiring completion or active engineering focus today.
                </p>
              </div>
              <Link
                href="/employee/tasks"
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 transition-colors"
              >
                <span>All Tasks ({taskStats.total})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {data?.recentTasks?.length > 0 ? (
                data.recentTasks.map((t: any) => {
                  const isDone = t.status === "COMPLETED";
                  return (
                    <div
                      key={t.id}
                      className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-900/50 hover:bg-slate-800/40 hover:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all duration-200 group"
                    >
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2.5">
                          <button
                            onClick={() => handleTaskStatus(t.id, isDone ? "TODO" : "COMPLETED")}
                            disabled={togglingTaskId === t.id}
                            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                              isDone
                                ? "bg-gradient-to-tr from-emerald-600 to-emerald-400 border-emerald-500 text-white shadow-xs shadow-emerald-500/30"
                                : "border-slate-700 hover:border-indigo-400 hover:bg-indigo-500/10"
                            }`}
                            aria-label={`Toggle task completion: ${t.title}`}
                          >
                            {isDone && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                          </button>
                          <span
                            className={`text-sm font-semibold truncate transition-all ${
                              isDone ? "line-through text-slate-500" : "text-slate-100 group-hover:text-indigo-200"
                            }`}
                          >
                            {t.title}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 pl-7">
                          {t.project?.name && (
                            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/80 font-medium">
                              {t.project.name}
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 rounded-md font-semibold ${
                              t.priority === "URGENT" || t.priority === "HIGH"
                                ? "bg-rose-500/10 text-rose-400 border border-rose-500/25"
                                : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {t.priority}
                          </span>
                          {t.dueDate && (
                            <span className="flex items-center gap-1.5 text-slate-400">
                              <Calendar className="w-3 h-3 text-slate-500" />
                              Due: {new Date(t.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pl-7 sm:pl-0 shrink-0">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                            t.status === "COMPLETED"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25 shadow-xs"
                              : t.status === "IN_PROGRESS"
                              ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/25 shadow-xs"
                              : t.status === "BLOCKED"
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/25 shadow-xs"
                              : "bg-slate-800/80 text-slate-300 border-slate-700"
                          }`}
                        >
                          {t.status.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-800 rounded-xl bg-slate-900/30">
                  No active tasks assigned. Great work staying ahead of schedule!
                </div>
              )}
            </div>
          </motion.div>

          {/* Quick Work Report Summary Card */}
          <motion.div
            variants={itemVariants}
            className="p-5 sm:p-6 rounded-2xl bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 space-y-3.5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2.5 font-heading">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
                  <FileText className="w-4 h-4" />
                </div>
                <span>Today's Work Summary</span>
              </h2>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  hasReportToday
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25 shadow-xs"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/25 shadow-xs"
                }`}
              >
                {hasReportToday ? "REPORT SUBMITTED" : "PENDING SUBMISSION"}
              </span>
            </div>

            {hasReportToday ? (
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{data.todayWorkReport.summary}</span>
                  <span className="text-slate-400 font-mono">
                    {data.todayWorkReport.hoursWorked ?? (user?.requiredDailyMinutes ? Math.round(user.requiredDailyMinutes / 60) : 8)} hrs logged
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2">
                  {data.todayWorkReport.workPerformed}
                </p>
                <div className="pt-2 flex justify-end">
                  <Link
                    href="/employee/work-reports"
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors"
                  >
                    <span>Update Today's Report</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
                <div className="text-xs text-slate-400">
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
            className="p-5 sm:p-6 rounded-2xl bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 space-y-3.5 shadow-sm"
          >
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              <Link
                href="/employee/attendance"
                className="p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-sky-500/40 transition-all duration-200 flex flex-col gap-1 text-left group"
              >
                <Clock className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-slate-200">Attendance</span>
                <span className="text-[10px] text-slate-400">Punches & breaks</span>
              </Link>

              <Link
                href="/employee/calendar"
                className="p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-indigo-500/40 transition-all duration-200 flex flex-col gap-1 text-left group"
              >
                <Calendar className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-slate-200">Calendar</span>
                <span className="text-[10px] text-slate-400">Schedule & off</span>
              </Link>

              <Link
                href="/employee/documents"
                className="p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-violet-500/40 transition-all duration-200 flex flex-col gap-1 text-left group"
              >
                <FolderOpen className="w-4 h-4 text-violet-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-slate-200">Documents</span>
                <span className="text-[10px] text-slate-400">Policies & files</span>
              </Link>

              <Link
                href="/employee/support"
                className="p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-amber-500/40 transition-all duration-200 flex flex-col gap-1 text-left group"
              >
                <HelpCircle className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-slate-200">Support</span>
                <span className="text-[10px] text-slate-400">Tickets & FAQs</span>
              </Link>
            </div>
          </motion.div>

          {/* Recent Company Announcements */}
          <motion.div
            variants={itemVariants}
            className="p-5 sm:p-6 rounded-2xl bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 space-y-3.5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Megaphone className="w-3.5 h-3.5 text-indigo-400" />
                <span>Announcements</span>
              </h3>
              <Link href="/employee/announcements" className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 hover:underline">
                View all
              </Link>
            </div>

            <div className="space-y-2.5">
              {data?.recentAnnouncements?.length > 0 ? (
                data.recentAnnouncements.map((ann: any) => (
                  <Link
                    key={ann.id}
                    href="/employee/announcements"
                    className="block p-3.5 rounded-xl bg-slate-900/50 hover:bg-slate-800/70 border border-slate-800/80 hover:border-slate-700 transition-all duration-200 group"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors truncate">
                        {ann.title}
                      </span>
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          ann.priority === "URGENT" || ann.priority === "HIGH"
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/25"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {ann.priority}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{ann.content}</p>
                    <span className="text-[10px] text-slate-500 block mt-1.5 font-mono">
                      {new Date(ann.publishAt).toLocaleDateString()}
                    </span>
                  </Link>
                ))
              ) : (
                <div className="p-5 text-center text-xs text-slate-400 border border-dashed border-slate-800 rounded-xl bg-slate-900/30">
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
