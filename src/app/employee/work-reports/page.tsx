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
} from "lucide-react";
import { PageHeader } from "@/components/employee/PageHeader";
import { SkeletonCard } from "@/components/employee/SkeletonCard";
import { StatusBadge } from "@/components/employee/StatusBadge";
import { EpButton } from "@/components/employee/EpButton";

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
      new Date().toLocaleDateString("en-US", {
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
      className="space-y-6 max-w-7xl"
    >
      {/* Header */}
      <PageHeader
        title="Daily Work Reports (EOD)"
        subtitle="Submit end-of-day work summaries, track completed milestones, log blockers, and review submission logs."
      />

      {/* Action Messages */}
      {actionSuccess && (
        <div className="p-3 bg-[var(--ep-accent-soft)] border border-[var(--ep-accent-border)] rounded-xl text-[#5FA8A0] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Daily Submission Card */}
      <div className="p-5 sm:p-6 bg-[#111317] border border-[#1E2530] rounded-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1E2530]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--ep-accent-soft)] border border-[var(--ep-accent-border)] flex items-center justify-center text-[#5FA8A0]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#E6E8EB]">
                {todayReport ? "Update Today's Work Report" : "Submit Today's Work Report"}
              </h2>
              <p className="text-xs text-[#566171]">
                Reporting for {mounted ? todayDateString : "Today"}
              </p>
            </div>
          </div>

          {todayReport && (
            <StatusBadge variant="info">
              Report Submitted for Today
            </StatusBadge>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Summary and Hours Row */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-[#8B94A1] mb-1.5">
                Executive Work Summary <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Completed frontend authentication & attendance integration"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                required
                className="w-full h-10 px-3 bg-[#0F1215] border border-[#1E2530] rounded-xl text-xs sm:text-sm text-[#E6E8EB] placeholder:text-[#566171] focus:outline-hidden focus:border-[#5FA8A0]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#8B94A1] mb-1.5">
                Hours Worked <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                min={1}
                max={24}
                step={0.5}
                value={hoursWorked}
                onChange={(e) => setHoursWorked(e.target.value)}
                required
                className="w-full h-10 px-3 bg-[#0F1215] border border-[#1E2530] rounded-xl text-xs sm:text-sm text-[#E6E8EB] focus:outline-hidden focus:border-[#5FA8A0]"
              />
            </div>
          </div>

          {/* Work Performed */}
          <div>
            <label className="block text-xs font-semibold text-[#8B94A1] mb-1.5">
              Detailed Work Performed <span className="text-red-400">*</span>
            </label>
            <textarea
              rows={4}
              className="w-full bg-[#0F1215] border border-[#1E2530] rounded-xl p-3 text-xs sm:text-sm text-[#E6E8EB] placeholder:text-[#566171] focus:outline-hidden focus:border-[#5FA8A0] resize-none"
              placeholder="Provide a breakdown of features coded, tests written, bug investigations, or client meetings..."
              value={workPerformed}
              onChange={(e) => setWorkPerformed(e.target.value)}
              required
            />
          </div>

          {/* Tasks Completed & Blockers (2 Columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#8B94A1] mb-1.5">
                Specific Tasks & PRs Completed (Optional)
              </label>
              <textarea
                rows={2}
                className="w-full bg-[#0F1215] border border-[#1E2530] rounded-xl p-3 text-xs text-[#E6E8EB] placeholder:text-[#566171] focus:outline-hidden focus:border-[#5FA8A0] resize-none"
                placeholder="- Fixed task status update API&#10;- Merged employee sidebar navigation"
                value={tasksCompleted}
                onChange={(e) => setTasksCompleted(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#8B94A1] mb-1.5">
                Challenges / Blockers Encountered (Optional)
              </label>
              <textarea
                rows={2}
                className="w-full bg-[#0F1215] border border-[#1E2530] rounded-xl p-3 text-xs text-[#E6E8EB] placeholder:text-[#566171] focus:outline-hidden focus:border-[#5FA8A0] resize-none"
                placeholder="Mention API dependency delays, missing assets, or technical obstacles..."
                value={challenges}
                onChange={(e) => setChallenges(e.target.value)}
              />
            </div>
          </div>

          {/* Next Steps */}
          <div>
            <label className="block text-xs font-semibold text-[#8B94A1] mb-1.5">
              Planned Next Steps (Tomorrow / Next Working Day)
            </label>
            <input
              type="text"
              placeholder="e.g. Complete responsive audit for employee calendar & document browser"
              value={nextSteps}
              onChange={(e) => setNextSteps(e.target.value)}
              className="w-full h-10 px-3 bg-[#0F1215] border border-[#1E2530] rounded-xl text-xs sm:text-sm text-[#E6E8EB] placeholder:text-[#566171] focus:outline-hidden focus:border-[#5FA8A0]"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#1E2530]">
            <p className="text-[11px] text-[#566171]">
              Submitted reports are logged into management dashboards and team records.
            </p>
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
        </form>
      </div>

      {/* Past Reports History */}
      <div className="p-5 sm:p-6 bg-[#111317] border border-[#1E2530] rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1E2530]">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#E6E8EB]">
              Past Work Report Submissions
            </h2>
            <p className="text-xs text-[#566171]">History of all submitted daily logs</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#566171] absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search past reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-8 pr-3 bg-[#0F1215] border border-[#1E2530] rounded-xl text-xs text-[#E6E8EB] placeholder:text-[#566171] focus:outline-hidden focus:border-[#5FA8A0]"
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
          <div className="text-center py-12 text-[#566171] text-xs">
            {searchQuery
              ? "No work reports match your search query."
              : "No past work reports logged yet. Your submissions will appear here."}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredReports.map((r) => {
              const isExpanded = expandedReportId === r.id;
              const formattedDate = mounted
                ? new Date(r.date).toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "";

              return (
                <div
                  key={r.id}
                  className="border border-[#1E2530] rounded-xl bg-[#0F1215] overflow-hidden transition-all hover:border-[#22262D]"
                >
                  {/* Collapsed Header */}
                  <div
                    onClick={() => setExpandedReportId(isExpanded ? null : r.id)}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <StatusBadge variant="info">
                          {r.status || "SUBMITTED"}
                        </StatusBadge>
                        <span className="text-xs text-[#566171] flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formattedDate}
                        </span>
                        <span className="text-xs text-[#8B94A1] bg-[#171A1F] border border-[#1E2530] px-2 py-0.5 rounded flex items-center gap-1 font-semibold">
                          <Clock className="w-3 h-3 text-[#5FA8A0]" />
                          {r.hoursWorked || 8} hrs
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-[#E6E8EB] truncate">{r.summary}</h4>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center text-xs text-[#566171]">
                      <span>{isExpanded ? "Collapse" : "Details"}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-[#8B94A1]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#8B94A1]" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="p-4 pt-2 border-t border-[#1E2530] bg-[#111317] space-y-4 text-xs">
                      <div>
                        <div className="font-semibold text-[#8B94A1] uppercase tracking-wider mb-1">
                          Detailed Work Performed
                        </div>
                        <div className="p-3 bg-[#0F1215] border border-[#1E2530] rounded-xl text-[#E6E8EB] whitespace-pre-wrap leading-relaxed">
                          {r.workPerformed}
                        </div>
                      </div>

                      {r.tasksCompleted && (
                        <div>
                          <div className="font-semibold text-[#8B94A1] uppercase tracking-wider mb-1">
                            Specific Tasks Completed
                          </div>
                          <div className="p-3 bg-[#0F1215] border border-[#1E2530] rounded-xl text-[#8B94A1] whitespace-pre-wrap">
                            {r.tasksCompleted}
                          </div>
                        </div>
                      )}

                      {r.challenges && (
                        <div>
                          <div className="font-semibold text-red-400 uppercase tracking-wider mb-1">
                            Blockers & Challenges
                          </div>
                          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 whitespace-pre-wrap">
                            {r.challenges}
                          </div>
                        </div>
                      )}

                      {r.nextSteps && (
                        <div>
                          <div className="font-semibold text-[#5FA8A0] uppercase tracking-wider mb-1">
                            Next Steps
                          </div>
                          <div className="p-3 bg-[var(--ep-accent-soft)] border border-[var(--ep-accent-border)] rounded-xl text-[#5FA8A0]">
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
