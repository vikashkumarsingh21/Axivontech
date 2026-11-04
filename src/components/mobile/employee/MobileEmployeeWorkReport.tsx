"use client";

import { useState, useMemo } from "react";
import { FileText, Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { CardList, type CardListItem } from "../CardList";

interface MobileEmployeeWorkReportProps {
  reports: any[];
  hasReportToday?: boolean;
  onSubmitReport: (form: {
    tasksCompleted: string;
    hoursSpent: number;
    blockers?: string;
    planForTomorrow?: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

export function MobileEmployeeWorkReport({
  reports,
  hasReportToday = false,
  onSubmitReport,
  isLoading = false,
}: MobileEmployeeWorkReportProps) {
  const [tasksCompleted, setTasksCompleted] = useState("");
  const [hoursSpent, setHoursSpent] = useState("8");
  const [blockers, setBlockers] = useState("");
  const [planForTomorrow, setPlanForTomorrow] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tasksCompleted.trim()) return;

    setSubmitting(true);
    try {
      await onSubmitReport({
        tasksCompleted,
        hoursSpent: parseFloat(hoursSpent) || 8,
        blockers,
        planForTomorrow,
      });
      setSuccess(true);
      setTasksCompleted("");
      setBlockers("");
      setPlanForTomorrow("");
    } finally {
      setSubmitting(false);
    }
  };

  const reportItems: CardListItem[] = useMemo(() => {
    return reports.map((rep) => ({
      id: rep.id,
      title: new Date(rep.createdAt || rep.date).toLocaleDateString("en-IN", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      subtitle: rep.hoursSpent !== undefined && rep.hoursSpent !== null ? `${rep.hoursSpent} hours logged` : "—",
      status: {
        label: "Submitted",
        variant: "success",
      },
      fields: [
        {
          label: "Summary",
          value: <span className="line-clamp-2">{rep.tasksCompleted || rep.content}</span>,
        },
      ],
    }));
  }, [reports]);

  return (
    <div className="space-y-4">
      {/* ── Today's EOD Form Card ────────────────────────────────────── */}
      <section className="rounded-2xl bg-[#1A1A1B] border border-[#2E2E30] p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#4F9D83]" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#B3AFA6]">
              End of Day (EOD) Report
            </h2>
          </div>
          {hasReportToday && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#162721] text-[#A2D9C7] border border-[#27483C]">
              <CheckCircle2 className="h-3 w-3 text-[#4F9D83]" />
              <span>Submitted Today</span>
            </span>
          )}
        </div>

        {hasReportToday && !success ? (
          <div className="p-3.5 rounded-xl bg-[#162721] border border-[#27483C] text-[#A2D9C7] text-xs">
            Your daily work report for today has already been logged. You may submit another update if needed.
          </div>
        ) : null}

        {success && (
          <div className="p-3.5 rounded-xl bg-[#162721] border border-[#27483C] text-[#A2D9C7] text-xs">
            EOD report submitted successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-medium text-[#B3AFA6] block mb-1">
              Deliverables Completed Today *
            </label>
            <textarea
              required
              rows={3}
              value={tasksCompleted}
              onChange={(e) => setTasksCompleted(e.target.value)}
              placeholder="List features, bug fixes, or deliverables completed..."
              className="w-full p-3.5 rounded-xl bg-[#232324] border border-[#2E2E30] text-[#EDEBE6] text-sm focus:border-[#4F9D83] focus:outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[#B3AFA6] block mb-1">
                Hours Worked
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="16"
                value={hoursSpent}
                onChange={(e) => setHoursSpent(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-[#232324] border border-[#2E2E30] text-[#EDEBE6] text-sm focus:border-[#4F9D83] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[#B3AFA6] block mb-1">
                Blockers (if any)
              </label>
              <input
                type="text"
                value={blockers}
                onChange={(e) => setBlockers(e.target.value)}
                placeholder="e.g. pending API spec"
                className="w-full h-11 px-3.5 rounded-xl bg-[#232324] border border-[#2E2E30] text-[#EDEBE6] text-sm focus:border-[#4F9D83] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[#B3AFA6] block mb-1">
              Plan for Tomorrow
            </label>
            <textarea
              rows={2}
              value={planForTomorrow}
              onChange={(e) => setPlanForTomorrow(e.target.value)}
              placeholder="Upcoming tasks and priority items..."
              className="w-full p-3.5 rounded-xl bg-[#232324] border border-[#2E2E30] text-[#EDEBE6] text-sm focus:border-[#4F9D83] focus:outline-none resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !tasksCompleted.trim()}
            className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-[#4F9D83] text-[#121212] font-semibold text-sm hover:bg-[#438770] active:scale-98 transition-all disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span>Submit EOD Work Report</span>
          </button>
        </form>
      </section>

      {/* ── Submission History ───────────────────────────────────────── */}
      <section className="space-y-2.5">
        <h3 className="text-sm font-semibold text-[#EDEBE6] px-1">Past Submissions</h3>
        <CardList
          items={reportItems}
          emptyTitle="No past work reports"
          emptyDescription="Your submitted daily work logs will appear here."
        />
      </section>
    </div>
  );
}
