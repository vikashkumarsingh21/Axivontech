"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Send,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Search,
  Check,
} from "lucide-react";
import { PageHeader } from "@/components/employee/PageHeader";
import { SkeletonCard } from "@/components/employee/SkeletonCard";
import { StatusBadge } from "@/components/employee/StatusBadge";
import { EpButton } from "@/components/employee/EpButton";
import { EmptyState } from "@/components/employee/EmptyState";

interface WorkReportItem {
  id: string;
  date: string;
  summary: string;
  workPerformed: string;
  tasksCompleted?: string | null;
  challenges?: string | null;
  nextSteps?: string | null;
  hoursWorked: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<WorkReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [todayReport, setTodayReport] = useState<WorkReportItem | null>(null);
  const [userTargetHours, setUserTargetHours] = useState<number>(8);
  const [mounted, setMounted] = useState(false);
  const [todayDateString, setTodayDateString] = useState("");

  // Form State
  const [summary, setSummary] = useState("");
  const [workPerformed, setWorkPerformed] = useState("");
  const [tasksCompleted, setTasksCompleted] = useState("");
  const [challenges, setChallenges] = useState("");
  const [nextSteps, setNextSteps] = useState("");
  const [hoursWorked, setHoursWorked] = useState<number | string>(8);

  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    setTodayDateString(
      new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    );
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [res, meRes] = await Promise.all([
        fetch("/api/v1/employee/work-reports"),
        fetch("/api/v1/employee/me"),
      ]);
      const data = await res.json();
      const meData = await meRes.json().catch(() => null);

      const targetHours = meData?.user?.requiredDailyMinutes
        ? Math.round(meData.user.requiredDailyMinutes / 60)
        : 8;
      setUserTargetHours(targetHours);

      if (data.success && Array.isArray(data.reports)) {
        setReports(data.reports);

        // Check if there is already a report for today
        const todayStr = new Date().toDateString();
        const existingToday = data.reports.find(
          (r: WorkReportItem) => new Date(r.date).toDateString() === todayStr
        );

        if (existingToday) {
          setTodayReport(existingToday);
          setSummary(existingToday.summary || "");
          setWorkPerformed(existingToday.workPerformed || "");
          setTasksCompleted(existingToday.tasksCompleted || "");
          setChallenges(existingToday.challenges || "");
          setNextSteps(existingToday.nextSteps || "");
          setHoursWorked(existingToday.hoursWorked ?? targetHours);
        } else {
          setTodayReport(null);
          setHoursWorked(targetHours);
        }
      }
    } catch {
      setActionError("Failed to load work reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary.trim() || !workPerformed.trim()) {
      setActionError("Summary and detailed work performed are required.");
      return;
    }

    try {
      setSubmitting(true);
      setActionError(null);
      const res = await fetch("/api/v1/employee/work-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: new Date().toISOString(),
          summary: summary.trim(),
          workPerformed: workPerformed.trim(),
          tasksCompleted: tasksCompleted.trim() || null,
          challenges: challenges.trim() || null,
          nextSteps: nextSteps.trim() || null,
          hoursWorked: Number(hoursWorked) || userTargetHours,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit work report");
      }

      setActionSuccess(
        todayReport
          ? "Today's work report updated successfully."
          : "Daily work report submitted successfully."
      );
      setTimeout(() => setActionSuccess(null), 3500);
      loadData();
    } catch (err: any) {
      setActionError(err.message || "Failed to save work report.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredReports = useMemo(() => {
    if (!searchQuery) return reports;
    const query = searchQuery.toLowerCase();
    return reports.filter(
      (r) =>
        r.summary.toLowerCase().includes(query) ||
        r.workPerformed.toLowerCase().includes(query) ||
        (r.tasksCompleted && r.tasksCompleted.toLowerCase().includes(query)) ||
        (r.challenges && r.challenges.toLowerCase().includes(query))
    );
  }, [reports, searchQuery]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-8 max-w-7xl pb-16"
    >
      {/* Header */}
      <PageHeader
        title="Daily Work Reports (EOD)"
        subtitle="Submit end-of-day work summaries, track completed milestones, log blockers, and review historical submission records."
        icon={FileText}
      />

      {/* Action Messages */}
      {actionSuccess && (
        <div className="p-3.5 bg-[#5FAE7E]/10 border border-[#5FAE7E]/25 rounded-lg text-[#5FAE7E] text-xs font-medium flex items-center gap-2.5 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-3.5 bg-[#C46A62]/10 border border-[#C46A62]/25 rounded-lg text-[#C46A62] text-xs font-medium flex items-center gap-2.5 shadow-2xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Daily Submission Card */}
      <div className="p-6 sm:p-7 bg-[#1A1A1B] border border-[#2E2E30] rounded-xl space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#2E2E30]">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#4F9D83]/12 border border-[#4F9D83]/28 flex items-center justify-center text-[#4F9D83] shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#EDEBE6] tracking-tight">
                {todayReport ? "Update Today's Work Report" : "Submit Today's Work Report"}
              </h2>
              <p className="text-xs text-[#B3AFA6] mt-0.5">
                Reporting period: {mounted ? todayDateString : "Today"}
              </p>
            </div>
          </div>

          {todayReport && (
            <StatusBadge variant="success">
              Report Submitted for Today
            </StatusBadge>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Summary and Hours Row */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-5">
            <div className="sm:col-span-3 space-y-1.5">
              <label className="block text-xs font-medium text-[#B3AFA6]">
                Executive Work Summary <span className="text-[#C46A62]">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Completed frontend authentication & attendance integration"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                required
                className="w-full h-10 px-3 bg-[#232324] border border-[#2E2E30] rounded-lg text-sm text-[#EDEBE6] placeholder:text-xs placeholder:text-[#7C786F] focus:outline-none focus:border-[#4F9D83] focus:ring-2 focus:ring-[#4F9D83]/25 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#B3AFA6]">
                Hours Worked <span className="text-[#C46A62]">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={0.5}
                  max={24}
                  step={0.5}
                  value={hoursWorked}
                  onChange={(e) => setHoursWorked(e.target.value)}
                  required
                  className="w-full h-10 px-3 pr-9 bg-[#232324] border border-[#2E2E30] rounded-lg text-sm text-[#EDEBE6] font-mono focus:outline-none focus:border-[#4F9D83] focus:ring-2 focus:ring-[#4F9D83]/25 transition-all"
                />
                <span className="absolute right-3 top-2.5 text-xs text-[#8A867E] pointer-events-none font-mono">
                  hrs
                </span>
              </div>
            </div>
          </div>

          {/* Work Performed */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[#B3AFA6]">
              Detailed Work Performed <span className="text-[#C46A62]">*</span>
            </label>
            <textarea
              rows={4}
              className="w-full bg-[#232324] border border-[#2E2E30] rounded-lg p-3 text-sm text-[#EDEBE6] placeholder:text-xs placeholder:text-[#7C786F] focus:outline-none focus:border-[#4F9D83] focus:ring-2 focus:ring-[#4F9D83]/25 transition-all resize-none leading-relaxed"
              placeholder="Provide a breakdown of features coded, tests written, bug investigations, or client meetings..."
              value={workPerformed}
              onChange={(e) => setWorkPerformed(e.target.value)}
              required
            />
          </div>

          {/* Tasks Completed & Blockers (2 Columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#B3AFA6]">
                Specific Tasks & PRs Completed (Optional)
              </label>
              <textarea
                rows={3}
                className="w-full bg-[#232324] border border-[#2E2E30] rounded-lg p-3 text-xs text-[#EDEBE6] placeholder:text-[#7C786F] focus:outline-none focus:border-[#4F9D83] focus:ring-2 focus:ring-[#4F9D83]/25 transition-all resize-none leading-relaxed font-mono"
                placeholder="- Fixed task status update API&#10;- Merged employee sidebar navigation"
                value={tasksCompleted}
                onChange={(e) => setTasksCompleted(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#B3AFA6]">
                Challenges / Blockers Encountered (Optional)
              </label>
              <textarea
                rows={3}
                className="w-full bg-[#232324] border border-[#2E2E30] rounded-lg p-3 text-xs text-[#EDEBE6] placeholder:text-[#7C786F] focus:outline-none focus:border-[#4F9D83] focus:ring-2 focus:ring-[#4F9D83]/25 transition-all resize-none leading-relaxed"
                placeholder="Mention API dependency delays, missing assets, or technical obstacles..."
                value={challenges}
                onChange={(e) => setChallenges(e.target.value)}
              />
            </div>
          </div>

          {/* Next Steps */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[#B3AFA6]">
              Planned Next Steps (Tomorrow / Next Working Day)
            </label>
            <input
              type="text"
              placeholder="e.g. Complete responsive audit for employee calendar & document browser"
              value={nextSteps}
              onChange={(e) => setNextSteps(e.target.value)}
              className="w-full h-10 px-3 bg-[#232324] border border-[#2E2E30] rounded-lg text-sm text-[#EDEBE6] placeholder:text-xs placeholder:text-[#7C786F] focus:outline-none focus:border-[#4F9D83] focus:ring-2 focus:ring-[#4F9D83]/25 transition-all"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#2E2E30]">
            <p className="text-xs text-[#8A867E]">
              Submitted reports are logged into team records and verified in management dashboards.
            </p>
            <div className="w-full sm:w-auto flex items-center gap-3">
              <EpButton
                type="submit"
                variant="primary"
                size="md"
                loading={submitting}
                icon={<Send className="w-3.5 h-3.5" />}
                className="w-full sm:w-auto"
              >
                {todayReport ? "Update Today's Report" : "Submit EOD Report"}
              </EpButton>
            </div>
          </div>
        </form>
      </div>

      {/* Past Reports History */}
      <div className="p-6 sm:p-7 bg-[#1A1A1B] border border-[#2E2E30] rounded-xl space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#2E2E30]">
          <div>
            <h2 className="text-lg font-semibold text-[#EDEBE6] tracking-tight">
              Past Work Report Submissions
            </h2>
            <p className="text-xs text-[#B3AFA6] mt-0.5">
              Historical ledger of all submitted daily EOD reports
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#8A867E] absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search past reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-8 pr-3 bg-[#232324] border border-[#2E2E30] rounded-lg text-xs text-[#EDEBE6] placeholder:text-[#7C786F] focus:outline-none focus:border-[#4F9D83] focus:ring-1 focus:ring-[#4F9D83]/30 transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredReports.length === 0 ? (
          <EmptyState
            title={
              searchQuery
                ? "No matching work reports found"
                : "No past work reports logged yet"
            }
            description={
              searchQuery
                ? "Try adjusting your search keywords to locate previous reports."
                : "Your daily EOD submissions will be recorded here chronologically."
            }
            icon={FileText}
          />
        ) : (
          <div className="space-y-3">
            {filteredReports.map((r) => {
              const isExpanded = expandedReportId === r.id;
              const formattedDate = mounted
                ? new Date(r.date).toLocaleDateString("en-IN", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "";

              return (
                <div
                  key={r.id}
                  className="border border-[#2E2E30] rounded-xl bg-[#232324] overflow-hidden transition-all hover:border-[#3A3A3D] shadow-2xs"
                >
                  {/* Collapsed Header */}
                  <div
                    onClick={() => setExpandedReportId(isExpanded ? null : r.id)}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge variant="info">
                          {r.status || "SUBMITTED"}
                        </StatusBadge>
                        <span className="text-xs text-[#8A867E] flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#8A867E]" />
                          {formattedDate}
                        </span>
                        <span className="text-xs text-[#EDEBE6] bg-[#1A1A1B] border border-[#2E2E30] px-2 py-0.5 rounded-md flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-[#4F9D83]" />
                          {r.hoursWorked || 8} hrs
                        </span>
                      </div>
                      <h4 className="text-sm font-medium text-[#EDEBE6] truncate">{r.summary}</h4>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center text-xs text-[#8A867E]">
                      <span>{isExpanded ? "Collapse" : "Details"}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-[#8A867E]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#8A867E]" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="p-4 pt-2 border-t border-[#2E2E30] bg-[#1A1A1B] space-y-4 text-xs">
                      <div>
                        <div className="font-medium text-[#B3AFA6] uppercase tracking-wider text-[11px] mb-1.5">
                          Detailed Work Performed
                        </div>
                        <div className="p-3 bg-[#232324] border border-[#2E2E30] rounded-lg text-[#EDEBE6] whitespace-pre-wrap leading-relaxed text-xs">
                          {r.workPerformed}
                        </div>
                      </div>

                      {r.tasksCompleted && (
                        <div>
                          <div className="font-medium text-[#B3AFA6] uppercase tracking-wider text-[11px] mb-1.5">
                            Specific Tasks Completed
                          </div>
                          <div className="p-3 bg-[#232324] border border-[#2E2E30] rounded-lg text-[#EDEBE6] whitespace-pre-wrap text-xs font-mono">
                            {r.tasksCompleted}
                          </div>
                        </div>
                      )}

                      {r.challenges && (
                        <div>
                          <div className="font-medium text-[#C46A62] uppercase tracking-wider text-[11px] mb-1.5">
                            Blockers & Challenges
                          </div>
                          <div className="p-3 bg-[#C46A62]/10 border border-[#C46A62]/20 rounded-lg text-[#C46A62] whitespace-pre-wrap text-xs">
                            {r.challenges}
                          </div>
                        </div>
                      )}

                      {r.nextSteps && (
                        <div>
                          <div className="font-medium text-[#4F9D83] uppercase tracking-wider text-[11px] mb-1.5">
                            Next Steps
                          </div>
                          <div className="p-3 bg-[#4F9D83]/10 border border-[#4F9D83]/20 rounded-lg text-[#4F9D83] text-xs">
                            {r.nextSteps}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
