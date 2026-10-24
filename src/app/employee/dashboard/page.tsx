"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
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
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 sm:space-y-8 animate-pulse">
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E2530]">
          <div className="space-y-2">
            <div className="h-7 w-64 bg-[#111317] border border-[#1E2530] rounded-lg" />
            <div className="h-4 w-80 bg-[#111317] border border-[#1E2530] rounded-lg" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-32 bg-[#111317] border border-[#1E2530] rounded-xl" />
            <div className="h-9 w-32 bg-[#111317] border border-[#1E2530] rounded-xl" />
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
            <div className="h-64 rounded-2xl bg-[#111317] border border-[#1E2530]" />
            <div className="h-44 rounded-2xl bg-[#111317] border border-[#1E2530]" />
          </div>
          <div className="space-y-6">
            <div className="h-48 rounded-2xl bg-[#111317] border border-[#1E2530]" />
            <div className="h-60 rounded-2xl bg-[#111317] border border-[#1E2530]" />
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6 sm:space-y-8"
    >
      {/* ── 1. Personalized Greeting & Header ───────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E2530]">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#E6E8EB] tracking-tight font-heading">
              {mounted ? greeting : "Hello"}, {user?.name?.split(" ")[0] || "Team Member"}
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--ep-accent-soft)] text-[#5FA8A0] border border-[var(--ep-accent-border)]">
              {user?.department || "Axivon ONE"}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#8B94A1]">
            {mounted ? dateStr : ""} • Daily workflow overview & team updates.
          </p>
        </div>

        {/* Centralized My Attendance & Work Report Links in Header */}
        <div className="flex items-center gap-2">
          <Link href="/employee/attendance">
            <EpButton variant="primary" size="md" icon={<Clock className="w-3.5 h-3.5" />}>
              My Attendance
            </EpButton>
          </Link>
          <Link href="/employee/work-reports">
            <EpButton variant="secondary" size="md" icon={<FileText className="w-3.5 h-3.5 text-[#5FA8A0]" />}>
              Work Report
            </EpButton>
          </Link>
        </div>
      </div>

      {/* ── 2. Top Metric Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Attendance Today */}
        <div className="p-4 sm:p-5 rounded-xl bg-[#111317] border border-[#1E2530] flex flex-col justify-between gap-3 shadow-xs hover:border-[#22262D] transition-all">
          <div className="flex items-center justify-between text-[#8B94A1]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#566171]">Today's Punch</span>
            <Clock className="w-4 h-4 text-[#5FA8A0]" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-[#E6E8EB]">
              {isCheckedIn
                ? `Checked In • ${formatTime(attendance.checkInAt)}`
                : isCheckedOut
                ? "Shift Completed"
                : "Not Checked In"}
            </div>
            <p className="text-xs text-[#566171] mt-0.5">
              {isCheckedIn
                ? `Live worked: ${formatMinutes(attendance.netMinutes || attendance.grossMinutes || 0)}`
                : isCheckedOut
                ? `Out at ${formatTime(attendance.checkOutAt)} (${formatMinutes(attendance.netMinutes || attendance.grossMinutes || 0)})`
                : `Target: ${formatMinutes(user?.requiredDailyMinutes || attendance?.requiredDailyMinutes || 480)}`}
            </p>
          </div>
          <Link
            href="/employee/attendance"
            className="text-xs font-medium text-[#5FA8A0] hover:text-[#6DB8B0] inline-flex items-center gap-1 pt-1 transition-colors"
          >
            <span>View Attendance Log</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Card 2: Assigned Tasks */}
        <div className="p-4 sm:p-5 rounded-xl bg-[#111317] border border-[#1E2530] flex flex-col justify-between gap-3 shadow-xs hover:border-[#22262D] transition-all">
          <div className="flex items-center justify-between text-[#8B94A1]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#566171]">Assigned Tasks</span>
            <CheckCircle2 className="w-4 h-4 text-[#5FA8A0]" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-[#E6E8EB]">
              {taskStats.active} Active
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-[#566171]">
              {taskStats.overdue > 0 && (
                <span className="text-red-400 font-semibold">{taskStats.overdue} overdue</span>
              )}
              {taskStats.dueToday > 0 && (
                <span className="text-[#FBBF24] font-semibold">{taskStats.dueToday} due today</span>
              )}
              {taskStats.overdue === 0 && taskStats.dueToday === 0 && (
                <span>All deadlines on schedule</span>
              )}
            </div>
          </div>
          <Link
            href="/employee/tasks"
            className="text-xs font-medium text-[#5FA8A0] hover:text-[#6DB8B0] inline-flex items-center gap-1 pt-1 transition-colors"
          >
            <span>Open Tasks Board</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Card 3: Today's Work Report */}
        <div className="p-4 sm:p-5 rounded-xl bg-[#111317] border border-[#1E2530] flex flex-col justify-between gap-3 shadow-xs hover:border-[#22262D] transition-all">
          <div className="flex items-center justify-between text-[#8B94A1]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#566171]">Daily Work Report</span>
            <FileText className="w-4 h-4 text-[#5FA8A0]" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-[#E6E8EB]">
              {hasReportToday ? "Submitted" : "Pending EOD"}
            </div>
            <p className="text-xs text-[#566171] mt-0.5">
              {hasReportToday
                ? `Logged: ${data.todayWorkReport.summary?.slice(0, 32)}...`
                : "Required before ending shift"}
            </p>
          </div>
          <Link
            href="/employee/work-reports"
            className="text-xs font-medium text-[#5FA8A0] hover:text-[#6DB8B0] inline-flex items-center gap-1 pt-1 transition-colors"
          >
            <span>{hasReportToday ? "Review or Edit Report" : "Submit Daily Report"}</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Card 4: Leave & Time Off */}
        <div className="p-4 sm:p-5 rounded-xl bg-[#111317] border border-[#1E2530] flex flex-col justify-between gap-3 shadow-xs hover:border-[#22262D] transition-all">
          <div className="flex items-center justify-between text-[#8B94A1]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#566171]">Leave & Time Off</span>
            <Coffee className="w-4 h-4 text-[#67C5D8]" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-[#E6E8EB]">
              {data?.leaveStats?.upcomingApproved
                ? "Approved Upcoming"
                : data?.leaveStats?.pendingCount > 0
                ? `${data.leaveStats.pendingCount} Pending`
                : "No Leave Active"}
            </div>
            <p className="text-xs text-[#566171] mt-0.5">
              {data?.leaveStats?.upcomingApproved
                ? `From ${new Date(data.leaveStats.upcomingApproved.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                : "Available for requests"}
            </p>
          </div>
          <Link
            href="/employee/leave"
            className="text-xs font-medium text-[#67C5D8] hover:text-[#88d9e9] inline-flex items-center gap-1 pt-1 transition-colors"
          >
            <span>Manage Leave</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* ── 3. Main Dashboard Layout (2/3 and 1/3) ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left Column: Tasks & Live Punch Widget */}
        <div className="lg:col-span-2 space-y-6">
          {/* Priority Task Watchlist */}
          <div className="p-5 sm:p-6 rounded-xl bg-[#111317] border border-[#1E2530] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#E6E8EB] flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#5FA8A0]" />
                  <span>Tasks Due Today & In Progress</span>
                </h2>
                <p className="text-xs text-[#566171] mt-0.5">
                  Items requiring immediate completion or focus today.
                </p>
              </div>
              <Link
                href="/employee/tasks"
                className="text-xs font-semibold text-[#5FA8A0] hover:text-[#6DB8B0] inline-flex items-center gap-1 transition-colors"
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
                      className="p-3.5 rounded-xl border border-[#1E2530] bg-[#0F1215] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#22262D] transition-all"
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleTaskStatus(t.id, isDone ? "TODO" : "COMPLETED")}
                            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 cursor-pointer ${
                              isDone
                                ? "bg-[#5FA8A0] border-[#5FA8A0] text-[#071918]"
                                : "border-[#22262D] hover:border-[#5FA8A0]"
                            }`}
                            aria-label={`Toggle task completion: ${t.title}`}
                          >
                            {isDone && <CheckCircle2 className="w-3 h-3 stroke-[3]" />}
                          </button>
                          <span
                            className={`text-sm font-semibold truncate ${
                              isDone ? "line-through text-[#566171]" : "text-[#E6E8EB]"
                            }`}
                          >
                            {t.title}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#8B94A1] pl-6">
                          {t.project?.name && (
                            <span className="px-1.5 py-0.5 rounded bg-[#171A1F] text-[#8B94A1] border border-[#1E2530]">
                              {t.project.name}
                            </span>
                          )}
                          <span
                            className={`px-1.5 py-0.5 rounded font-semibold ${
                              t.priority === "URGENT" || t.priority === "HIGH"
                                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                : "bg-[#171A1F] text-[#8B94A1]"
                            }`}
                          >
                            {t.priority}
                          </span>
                          {t.dueDate && (
                            <span className="flex items-center gap-1 text-[#566171]">
                              <Calendar className="w-3 h-3 text-[#566171]" />
                              Due: {new Date(t.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pl-6 sm:pl-0 shrink-0">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            t.status === "COMPLETED"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : t.status === "IN_PROGRESS"
                              ? "bg-[var(--ep-accent-soft)] text-[#5FA8A0] border-[var(--ep-accent-border)]"
                              : t.status === "BLOCKED"
                              ? "bg-red-500/10 text-red-400 border-red-500/20"
                              : "bg-[#171A1F] text-[#8B94A1] border-[#22262D]"
                          }`}
                        >
                          {t.status.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-xs text-[#566171] border border-dashed border-[#1E2530] rounded-xl bg-[#0F1215]">
                  No active tasks assigned. Great work staying ahead of schedule!
                </div>
              )}
            </div>
          </div>

          {/* Quick Work Report Summary Card */}
          <div className="p-5 sm:p-6 rounded-xl bg-[#111317] border border-[#1E2530] space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#E6E8EB] flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#5FA8A0]" />
                <span>Today's Work Summary</span>
              </h2>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  hasReportToday
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                }`}
              >
                {hasReportToday ? "REPORT SUBMITTED" : "PENDING SUBMISSION"}
              </span>
            </div>

            {hasReportToday ? (
              <div className="p-4 rounded-xl bg-[#0F1215] border border-[#1E2530] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#E6E8EB]">{data.todayWorkReport.summary}</span>
                  <span className="text-[#566171]">
                    {data.todayWorkReport.hoursWorked ?? (user?.requiredDailyMinutes ? Math.round(user.requiredDailyMinutes / 60) : 8)} hrs logged
                  </span>
                </div>
                <p className="text-xs text-[#8B94A1] line-clamp-2">
                  {data.todayWorkReport.workPerformed}
                </p>
                <div className="pt-2 flex justify-end">
                  <Link
                    href="/employee/work-reports"
                    className="text-xs font-semibold text-[#5FA8A0] hover:text-[#6DB8B0] flex items-center gap-1 transition-colors"
                  >
                    <span>Update Today's Report</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#0F1215] border border-[#1E2530] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-[#8B94A1]">
                  You have not submitted a work report for today yet. Logging your daily progress helps keep deliverables on track.
                </div>
                <Link href="/employee/work-reports">
                  <EpButton variant="primary" size="sm" icon={<PlusCircle className="w-3.5 h-3.5" />}>
                    Submit Report
                  </EpButton>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Quick Navigation, Announcements & Help */}
        <div className="space-y-6">
          {/* Quick Shortcuts */}
          <div className="p-5 sm:p-6 rounded-xl bg-[#111317] border border-[#1E2530] space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#566171]">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              <Link
                href="/employee/attendance"
                className="p-3 rounded-xl bg-[#0F1215] hover:bg-[#171A1F] border border-[#1E2530] hover:border-[#5FA8A0]/30 transition-all flex flex-col gap-1 text-left group"
              >
                <Clock className="w-4 h-4 text-[#5FA8A0] group-hover:scale-105 transition-transform" />
                <span className="text-xs font-semibold text-[#E6E8EB]">Attendance</span>
                <span className="text-[10px] text-[#566171]">Punches & breaks</span>
              </Link>

              <Link
                href="/employee/calendar"
                className="p-3 rounded-xl bg-[#0F1215] hover:bg-[#171A1F] border border-[#1E2530] hover:border-[#5FA8A0]/30 transition-all flex flex-col gap-1 text-left group"
              >
                <Calendar className="w-4 h-4 text-[#D6B779] group-hover:scale-105 transition-transform" />
                <span className="text-xs font-semibold text-[#E6E8EB]">Calendar</span>
                <span className="text-[10px] text-[#566171]">Schedule & off</span>
              </Link>

              <Link
                href="/employee/documents"
                className="p-3 rounded-xl bg-[#0F1215] hover:bg-[#171A1F] border border-[#1E2530] hover:border-[#5FA8A0]/30 transition-all flex flex-col gap-1 text-left group"
              >
                <FolderOpen className="w-4 h-4 text-[#67C5D8] group-hover:scale-105 transition-transform" />
                <span className="text-xs font-semibold text-[#E6E8EB]">Documents</span>
                <span className="text-[10px] text-[#566171]">Policies & guides</span>
              </Link>

              <Link
                href="/employee/support"
                className="p-3 rounded-xl bg-[#0F1215] hover:bg-[#171A1F] border border-[#1E2530] hover:border-[#5FA8A0]/30 transition-all flex flex-col gap-1 text-left group"
              >
                <HelpCircle className="w-4 h-4 text-[#8B94A1] group-hover:scale-105 transition-transform" />
                <span className="text-xs font-semibold text-[#E6E8EB]">Support</span>
                <span className="text-[10px] text-[#566171]">FAQs & contact</span>
              </Link>
            </div>
          </div>

          {/* Recent Company Announcements */}
          <div className="p-5 sm:p-6 rounded-xl bg-[#111317] border border-[#1E2530] space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#566171] flex items-center gap-1.5">
                <Megaphone className="w-3.5 h-3.5 text-[#5FA8A0]" />
                <span>Announcements</span>
              </h3>
              <Link href="/employee/announcements" className="text-[11px] font-semibold text-[#5FA8A0] hover:text-[#6DB8B0] hover:underline">
                View all
              </Link>
            </div>

            <div className="space-y-2.5">
              {data?.recentAnnouncements?.length > 0 ? (
                data.recentAnnouncements.map((ann: any) => (
                  <Link
                    key={ann.id}
                    href="/employee/announcements"
                    className="block p-3 rounded-xl bg-[#0F1215] hover:bg-[#171A1F] border border-[#1E2530] hover:border-[#22262D] transition-all group"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-semibold text-[#E6E8EB] group-hover:text-[#5FA8A0] transition-colors truncate">
                        {ann.title}
                      </span>
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                          ann.priority === "URGENT" || ann.priority === "HIGH"
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : "bg-[#171A1F] text-[#8B94A1]"
                        }`}
                      >
                        {ann.priority}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8B94A1] line-clamp-2">{ann.content}</p>
                    <span className="text-[10px] text-[#566171] block mt-1">
                      {new Date(ann.publishAt).toLocaleDateString()}
                    </span>
                  </Link>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-[#566171] border border-dashed border-[#1E2530] rounded-xl bg-[#0F1215]">
                  No new announcements.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
