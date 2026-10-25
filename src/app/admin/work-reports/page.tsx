"use client";

import { getErrorMessage, parseApiResponse } from "@/lib/errors/client";

import { useEffect, useState, useCallback } from "react";
import {
  FileText,
  RefreshCw,
  Search,
  Filter,
  CheckCircle,
  Clock,
  User,
  Calendar,
  X,
  Eye,
  AlertCircle,
  Check,
} from "lucide-react";

interface WorkReportItem {
  id: string;
  userId: string;
  date: string;
  summary: string;
  tasksCompleted?: string | null;
  workPerformed: string;
  challenges?: string | null;
  nextSteps?: string | null;
  hoursWorked?: number | null;
  status: "SUBMITTED" | "REVIEWED";
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    department?: string | null;
    designation?: string | null;
  };
}

export default function AdminWorkReportsPage() {
  const [reports, setReports] = useState<WorkReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");

  // Detail Modal
  const [selectedReport, setSelectedReport] = useState<WorkReportItem | null>(null);
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [feedbackBanner, setFeedbackBanner] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (dateFilter) params.set("date", dateFilter);
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/v1/admin/work-reports?${params.toString()}`);
      if (res.ok) {
        const d = await res.json();
        setReports(d.reports || d.data || []);
      }
    } catch {
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, dateFilter, search]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleMarkReviewed = async (reportId: string, customFeedback?: string) => {
    setReviewLoading(true);
    setFeedbackBanner(null);
    try {
      const res = await fetch(`/api/v1/admin/work-reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "REVIEWED",
          feedback: customFeedback || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(getErrorMessage(data) || "Review failed");
      setFeedbackBanner({ type: "success", message: "Work report marked as reviewed." });
      if (selectedReport && selectedReport.id === reportId) {
        setSelectedReport({ ...selectedReport, status: "REVIEWED" });
      }
      loadReports();
    } catch (err: any) {
      setFeedbackBanner({ type: "error", message: err.message || "Failed to mark as reviewed" });
    } finally {
      setReviewLoading(false);
    }
  };

  const pendingCount = reports.filter((r) => r.status === "SUBMITTED").length;
  const reviewedCount = reports.filter((r) => r.status === "REVIEWED").length;
  const totalHours = reports.reduce((acc, r) => acc + (r.hoursWorked || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-400" /> Work Reports
          </h1>
          <p className="text-[#7E8997] text-sm mt-1">
            Review daily work logs, achievements, challenges, and hours submitted by employees.
          </p>
        </div>
        <button
          onClick={loadReports}
          className="p-2.5 rounded-xl border border-[#29313B] bg-[#151A21] text-[#7E8997] hover:text-[#F3F5F7] hover:bg-[#1B222B] transition-colors"
          title="Refresh Reports"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald-400" : ""}`} />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Pending Review", value: pendingCount, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", icon: Clock },
          { label: "Reviewed Reports", value: reviewedCount, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle },
          { label: "Total Logged Hours", value: `${totalHours}h`, color: "text-[#D6B779]", bg: "bg-[#D6B779]/10 border-[#D6B779]/20", icon: Clock },
          { label: "Total Reports", value: reports.length, color: "text-[#F3F5F7]", bg: "bg-[#151A21] border-[#29313B]", icon: FileText },
        ].map(({ label, value, color, bg, icon: Icon }) => (
          <div key={label} className={`border rounded-2xl p-4 flex items-center gap-3.5 ${bg}`}>
            <Icon className={`w-5 h-5 shrink-0 ${color}`} />
            <div>
              <p className={`text-2xl font-bold tracking-tight ${color}`}>{value}</p>
              <p className="text-xs text-[#7E8997] font-medium">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {feedbackBanner && (
        <div
          className={`p-3.5 rounded-xl border text-sm flex items-center justify-between gap-2 ${
            feedbackBanner.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/20 text-rose-400"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackBanner.type === "success" ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            {feedbackBanner.message}
          </div>
          <button onClick={() => setFeedbackBanner(null)} className="text-inherit hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Toolbar / Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#151A21] border border-[#29313B] p-3 rounded-2xl">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#566171]" />
          <input
            type="text"
            placeholder="Search summary, work performed, or employee name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#10151B] border border-[#29313B] rounded-xl text-xs text-[#F3F5F7] placeholder-[#566171] focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-[#10151B] p-1 rounded-xl border border-[#29313B]">
            {["ALL", "SUBMITTED", "REVIEWED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  statusFilter === st
                    ? "bg-[#1B222B] text-emerald-400 border border-[#29313B]"
                    : "text-[#7E8997] hover:text-[#F3F5F7]"
                }`}
              >
                {st === "SUBMITTED" ? "Pending Review" : st === "REVIEWED" ? "Reviewed" : "All"}
              </button>
            ))}
          </div>

          {/* Date Picker */}
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-1.5 bg-[#10151B] border border-[#29313B] rounded-xl text-xs text-[#F3F5F7] focus:outline-none focus:border-emerald-500"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter("")}
              className="text-xs text-[#7E8997] hover:text-[#F3F5F7] underline px-1"
            >
              Clear Date
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#151A21] border border-[#29313B] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#A7B0BC]">
            <thead className="bg-[#10151B] text-[#7E8997] text-[11px] uppercase font-bold tracking-wider border-b border-[#29313B]">
              <tr>
                <th className="px-5 py-3.5">Employee</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Summary</th>
                <th className="px-5 py-3.5">Hours</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2530]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#7E8997]">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" /> Loading work reports…
                    </div>
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-[#566171]">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-[#3B4554]" />
                    No work reports found matching the criteria.
                  </td>
                </tr>
              ) : (
                reports.map((r) => (
                  <tr key={r.id} className="hover:bg-[#1B222B]/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="text-[#F3F5F7] font-semibold">{r.user?.name || "Staff Member"}</div>
                      <div className="text-[11px] text-[#566171]">
                        {r.user?.department || "General"} · {r.user?.email}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-medium text-[#F3F5F7]">
                      {new Date(r.date).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-5 py-4 max-w-sm truncate text-[#A7B0BC]" title={r.summary}>
                      {r.summary}
                    </td>
                    <td className="px-5 py-4 font-mono font-semibold text-[#F3F5F7]">
                      {r.hoursWorked ? `${r.hoursWorked} hrs` : "8 hrs"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                          r.status === "REVIEWED"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}
                      >
                        {r.status === "REVIEWED" ? "Reviewed" : "Submitted"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedReport(r);
                            setReviewFeedback("");
                          }}
                          className="px-3 py-1.5 bg-[#1B222B] hover:bg-[#202833] text-[#F3F5F7] border border-[#29313B] rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5 text-emerald-400" /> Inspect
                        </button>
                        {r.status === "SUBMITTED" && (
                          <button
                            onClick={() => handleMarkReviewed(r.id)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1 shadow-sm"
                          >
                            <Check className="w-3.5 h-3.5" /> Mark Reviewed
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Work Report Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#151A21] border border-[#29313B] rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#29313B]">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-400" /> Daily Work Report Details
                </h3>
                <p className="text-xs text-[#7E8997] mt-0.5">
                  Submitted by <strong className="text-white">{selectedReport.user?.name}</strong> on{" "}
                  {new Date(selectedReport.date).toLocaleDateString("en-IN", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <button onClick={() => setSelectedReport(null)} className="text-[#7E8997] hover:text-[#F3F5F7]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Summary */}
              <div className="p-3.5 bg-[#10151B] border border-[#29313B] rounded-xl">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7E8997] block mb-1">
                  Executive Summary
                </span>
                <p className="text-xs text-[#F3F5F7] font-medium whitespace-pre-wrap">{selectedReport.summary}</p>
              </div>

              {/* Work Performed */}
              <div className="p-3.5 bg-[#10151B] border border-[#29313B] rounded-xl">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7E8997] block mb-1">
                  Detailed Work Performed
                </span>
                <p className="text-xs text-[#A7B0BC] whitespace-pre-wrap leading-relaxed">{selectedReport.workPerformed}</p>
              </div>

              {/* Tasks Completed & Next Steps */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-[#10151B] border border-[#29313B] rounded-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#7E8997] block mb-1">
                    Tasks Completed
                  </span>
                  <p className="text-xs text-[#A7B0BC] whitespace-pre-wrap">
                    {selectedReport.tasksCompleted || "None specified"}
                  </p>
                </div>

                <div className="p-3.5 bg-[#10151B] border border-[#29313B] rounded-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#7E8997] block mb-1">
                    Next Steps / Tomorrow's Agenda
                  </span>
                  <p className="text-xs text-[#A7B0BC] whitespace-pre-wrap">
                    {selectedReport.nextSteps || "None specified"}
                  </p>
                </div>
              </div>

              {/* Challenges */}
              {selectedReport.challenges && (
                <div className="p-3.5 bg-rose-500/5 border border-rose-500/20 rounded-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block mb-1">
                    Challenges & Blockers Encountered
                  </span>
                  <p className="text-xs text-rose-300 whitespace-pre-wrap">{selectedReport.challenges}</p>
                </div>
              )}

              {/* Review Section */}
              <div className="pt-3 border-t border-[#29313B] space-y-3">
                <label className="block text-xs font-semibold text-white">Manager Review Feedback (Optional)</label>
                <textarea
                  rows={2}
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  placeholder="e.g. Great progress on the API integration. Approved."
                  className="w-full px-3 py-2 bg-[#10151B] border border-[#29313B] rounded-xl text-xs text-[#F3F5F7] placeholder-[#566171] focus:outline-none focus:border-emerald-500"
                />

                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#566171]">
                    Status: <strong className="text-white">{selectedReport.status}</strong>
                  </span>
                  <button
                    onClick={() => handleMarkReviewed(selectedReport.id, reviewFeedback)}
                    disabled={reviewLoading}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    {selectedReport.status === "REVIEWED" ? "Update Review Feedback" : "Confirm & Mark Reviewed"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
