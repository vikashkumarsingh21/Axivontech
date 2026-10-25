"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Coffee,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Ban,
  Info,
  Send,
} from "lucide-react";
import { PageHeader } from "@/components/employee/PageHeader";
import { SkeletonCard } from "@/components/employee/SkeletonCard";
import { StatusBadge } from "@/components/employee/StatusBadge";
import { EpButton } from "@/components/employee/EpButton";
import { parseApiResponse, getErrorMessage } from "@/lib/errors/client";
import { toast } from "@/lib/notifications/toast";

interface LeaveRequestItem {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  reviewNote?: string | null;
  createdAt: string;
}

export default function LeavePage() {
  const [requests, setRequests] = useState<LeaveRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Form State
  const [form, setForm] = useState({
    type: "SICK",
    start: "",
    end: "",
    reason: "",
  });

  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/employee/leave");
      const parsed = await parseApiResponse(res);
      const data = parsed.data || parsed.raw;
      if (parsed.ok && data?.success && Array.isArray(data.requests)) {
        setRequests(data.requests);
      } else if (!parsed.ok) {
        const msg = parsed.errorMessage || "Failed to fetch leave requests.";
        setActionError(msg);
        toast.error(msg);
      }
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      setActionError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute calculated days for form
  const calculatedDays = useMemo(() => {
    if (!form.start || !form.end) return 0;
    const start = new Date(form.start);
    const end = new Date(form.end);
    if (end < start) return 0;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }, [form.start, form.end]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setActionSuccess(null);

    if (!form.start || !form.end || !form.reason.trim()) {
      const msg = "Please provide start date, end date, and reason.";
      setActionError(msg);
      toast.warning(msg);
      return;
    }

    if (new Date(form.start) > new Date(form.end)) {
      const msg = "End date cannot be earlier than start date.";
      setActionError(msg);
      toast.warning(msg);
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/v1/employee/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leaveType: form.type,
          startDate: form.start,
          endDate: form.end,
          reason: form.reason.trim(),
        }),
      });

      const parsed = await parseApiResponse(res);
      if (!parsed.ok) {
        const msg = parsed.errorMessage || "Failed to submit leave request.";
        setActionError(msg);
        toast.error(msg);
        return;
      }

      const successMsg = "Leave request submitted successfully for approval.";
      setActionSuccess(successMsg);
      toast.success(successMsg);
      setTimeout(() => setActionSuccess(null), 4000);
      setForm({ type: "SICK", start: "", end: "", reason: "" });
      loadData();
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      setActionError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (requestId: string) => {
    if (!confirm("Are you sure you want to cancel this pending leave request?")) return;

    try {
      setCancellingId(requestId);
      setActionError(null);
      const res = await fetch("/api/v1/employee/leave", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action: "CANCEL" }),
      });
      const parsed = await parseApiResponse(res);
      if (!parsed.ok) {
        const msg = parsed.errorMessage || "Failed to cancel leave request.";
        setActionError(msg);
        toast.error(msg);
        return;
      }

      const successMsg = "Leave request cancelled successfully.";
      setActionSuccess(successMsg);
      toast.success(successMsg);
      setTimeout(() => setActionSuccess(null), 3000);
      loadData();
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      setActionError(msg);
      toast.error(msg);
    } finally {
      setCancellingId(null);
    }
  };

  // Leave balances computation
  const balances = useMemo(() => {
    let sickUsed = 0;
    let casualUsed = 0;
    let paidUsed = 0;
    let unpaidUsed = 0;

    requests.forEach((r) => {
      if (r.status === "APPROVED") {
        const start = new Date(r.startDate);
        const end = new Date(r.endDate);
        const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

        if (r.leaveType === "SICK") sickUsed += days;
        else if (r.leaveType === "CASUAL") casualUsed += days;
        else if (r.leaveType === "PAID") paidUsed += days;
        else if (r.leaveType === "UNPAID") unpaidUsed += days;
      }
    });

    return {
      sick: { total: 12, used: sickUsed, balance: Math.max(0, 12 - sickUsed) },
      casual: { total: 12, used: casualUsed, balance: Math.max(0, 12 - casualUsed) },
      paid: { total: 15, used: paidUsed, balance: Math.max(0, 15 - paidUsed) },
      unpaid: { total: 0, used: unpaidUsed, balance: unpaidUsed },
    };
  }, [requests]);

  const filteredRequests = useMemo(() => {
    if (selectedStatus === "ALL") return requests;
    return requests.filter((r) => r.status === selectedStatus);
  }, [requests, selectedStatus]);

  const getStatusVariant = (status: string): "success" | "error" | "warning" | "neutral" => {
    switch (status) {
      case "APPROVED":
        return "success";
      case "REJECTED":
        return "error";
      case "CANCELLED":
        return "neutral";
      default:
        return "warning";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6 max-w-7xl pb-12"
    >
      {/* Header */}
      <PageHeader
        title="Leave Management"
        subtitle="Apply for leaves, track annual quota allowances, and manage existing approvals."
      />

      {/* Action Messages */}
      {actionSuccess && (
        <div className="p-3 bg-[#4F9D83]/10 border border-[#4F9D83]/25 rounded-xl text-[#4F9D83] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-3 bg-[#C46A62]/10 border border-[#C46A62]/25 rounded-xl text-[#C46A62] text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Leave Quota Cards with Progress Bars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sick Leave */}
        <div className="p-4 bg-[#1A1A1B] border border-[#2E2E30] rounded-xl space-y-2.5">
          <div className="flex items-center justify-between text-xs text-[#8A867E] font-medium">
            <span>Sick Leave</span>
            <span className="text-[#B3AFA6]">{balances.sick.used} used</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-semibold text-[#EDEBE6]">{balances.sick.balance}</span>
            <span className="text-xs text-[#8A867E]">/ {balances.sick.total} days</span>
          </div>
          <div className="h-1.5 w-full bg-[#121212] rounded-full overflow-hidden border border-[#2E2E30]">
            <div
              className="h-full bg-[#4F9D83] rounded-full transition-all"
              style={{ width: `${Math.min(100, (balances.sick.used / balances.sick.total) * 100)}%` }}
            />
          </div>
        </div>

        {/* Casual Leave */}
        <div className="p-4 bg-[#1A1A1B] border border-[#2E2E30] rounded-xl space-y-2.5">
          <div className="flex items-center justify-between text-xs text-[#8A867E] font-medium">
            <span>Casual Leave</span>
            <span className="text-[#B3AFA6]">{balances.casual.used} used</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-semibold text-[#EDEBE6]">{balances.casual.balance}</span>
            <span className="text-xs text-[#8A867E]">/ {balances.casual.total} days</span>
          </div>
          <div className="h-1.5 w-full bg-[#121212] rounded-full overflow-hidden border border-[#2E2E30]">
            <div
              className="h-full bg-[#8E9AAF] rounded-full transition-all"
              style={{ width: `${Math.min(100, (balances.casual.used / balances.casual.total) * 100)}%` }}
            />
          </div>
        </div>

        {/* Paid Time Off */}
        <div className="p-4 bg-[#1A1A1B] border border-[#2E2E30] rounded-xl space-y-2.5">
          <div className="flex items-center justify-between text-xs text-[#8A867E] font-medium">
            <span>Paid Time Off (PTO)</span>
            <span className="text-[#B3AFA6]">{balances.paid.used} used</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-semibold text-[#C9A15B]">{balances.paid.balance}</span>
            <span className="text-xs text-[#8A867E]">/ {balances.paid.total} days</span>
          </div>
          <div className="h-1.5 w-full bg-[#121212] rounded-full overflow-hidden border border-[#2E2E30]">
            <div
              className="h-full bg-[#C9A15B] rounded-full transition-all"
              style={{ width: `${Math.min(100, (balances.paid.used / balances.paid.total) * 100)}%` }}
            />
          </div>
        </div>

        {/* Unpaid Leave */}
        <div className="p-4 bg-[#1A1A1B] border border-[#2E2E30] rounded-xl space-y-2.5">
          <div className="flex items-center justify-between text-xs text-[#8A867E] font-medium">
            <span>Unpaid Leave</span>
            <span className="text-[#8A867E]">Manager review</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-semibold text-[#EDEBE6]">{balances.unpaid.used}</span>
            <span className="text-xs text-[#8A867E]">days taken</span>
          </div>
          <div className="h-1.5 w-full bg-[#121212] rounded-full overflow-hidden border border-[#2E2E30]">
            <div
              className="h-full bg-[#C46A62] rounded-full transition-all"
              style={{ width: `${balances.unpaid.used > 0 ? 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* New Leave Application Card */}
      <div className="p-5 sm:p-6 bg-[#1A1A1B] border border-[#2E2E30] rounded-xl space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-[#2E2E30]">
          <div className="w-10 h-10 rounded-lg bg-[#232324] border border-[#2E2E30] flex items-center justify-center text-[#4F9D83]">
            <Coffee className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-[#EDEBE6]">Apply for Leave</h2>
            <p className="text-xs text-[#8A867E]">
              Requests are routed directly to your reporting manager and HR desk.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#B3AFA6] mb-1.5">
                Leave Category <span className="text-[#C46A62]">*</span>
              </label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full h-10 px-3 bg-[#232324] border border-[#2E2E30] rounded-lg text-xs sm:text-sm text-[#EDEBE6] focus:outline-hidden focus:border-[#4F9D83] focus:ring-1 focus:ring-[#4F9D83] cursor-pointer"
              >
                <option value="SICK">Sick Leave</option>
                <option value="CASUAL">Casual Leave</option>
                <option value="PAID">Paid Time Off (PTO)</option>
                <option value="UNPAID">Unpaid Leave</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#B3AFA6] mb-1.5">
                Start Date <span className="text-[#C46A62]">*</span>
              </label>
              <input
                type="date"
                value={form.start}
                onChange={(e) => setForm({ ...form, start: e.target.value })}
                required
                className="w-full h-10 px-3 bg-[#232324] border border-[#2E2E30] rounded-lg text-xs sm:text-sm text-[#EDEBE6] focus:outline-hidden focus:border-[#4F9D83] focus:ring-1 focus:ring-[#4F9D83]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#B3AFA6] mb-1.5">
                End Date <span className="text-[#C46A62]">*</span>
              </label>
              <input
                type="date"
                value={form.end}
                min={form.start}
                onChange={(e) => setForm({ ...form, end: e.target.value })}
                required
                className="w-full h-10 px-3 bg-[#232324] border border-[#2E2E30] rounded-lg text-xs sm:text-sm text-[#EDEBE6] focus:outline-hidden focus:border-[#4F9D83] focus:ring-1 focus:ring-[#4F9D83]"
              />
            </div>
          </div>

          {calculatedDays > 0 && (
            <div className="p-3 bg-[#4F9D83]/10 border border-[#4F9D83]/25 rounded-lg text-xs text-[#4F9D83] flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" />
              <span>
                Calculated duration: <strong>{calculatedDays} day{calculatedDays > 1 ? "s" : ""}</strong>
              </span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#B3AFA6] mb-1.5">
              Reason for Absence <span className="text-[#C46A62]">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Medical appointment, family function, or personal emergency"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              required
              className="w-full h-10 px-3 bg-[#232324] border border-[#2E2E30] rounded-lg text-xs sm:text-sm text-[#EDEBE6] placeholder:text-[#7C786F] focus:outline-hidden focus:border-[#4F9D83] focus:ring-1 focus:ring-[#4F9D83]"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <EpButton
              type="submit"
              variant="primary"
              size="md"
              loading={submitting}
              icon={<Send className="w-3.5 h-3.5" />}
              className="w-full sm:w-auto"
            >
              Submit Leave Request
            </EpButton>
          </div>
        </form>
      </div>

      {/* Leave History Card */}
      <div className="p-5 sm:p-6 bg-[#1A1A1B] border border-[#2E2E30] rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#2E2E30]">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-[#EDEBE6]">Leave Requests History</h2>
            <p className="text-xs text-[#8A867E]">All submitted leave applications and their status</p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            {["ALL", "PENDING", "APPROVED", "REJECTED", "CANCELLED"].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer text-xs ${
                  selectedStatus === st
                    ? "bg-[#4F9D83]/15 text-[#4F9D83] border border-[#4F9D83]/30 font-semibold"
                    : "bg-[#232324] text-[#8A867E] hover:text-[#EDEBE6] border border-[#2E2E30]"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-12 text-[#8A867E] text-xs">
            No leave requests found for this filter.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRequests.map((r) => {
              const start = new Date(r.startDate);
              const end = new Date(r.endDate);
              const days = Math.max(
                1,
                Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
              );
              const isCancelling = cancellingId === r.id;

              return (
                <div
                  key={r.id}
                  className="p-4 border border-[#2E2E30] rounded-xl bg-[#121212]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#3A3A3D] transition-colors"
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-[#EDEBE6] bg-[#232324] border border-[#2E2E30] px-2.5 py-0.5 rounded">
                        {r.leaveType} LEAVE
                      </span>
                      <span className="text-xs text-[#4F9D83] bg-[#4F9D83]/10 border border-[#4F9D83]/25 px-2 py-0.5 rounded font-medium">
                        {days} day{days > 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="text-xs text-[#8A867E] flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#8A867E]" />
                      <span>
                        {start.toLocaleDateString()} to {end.toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-xs text-[#8A867E]">{r.reason}</p>

                    {r.reviewNote && (
                      <p className="text-xs text-[#C9A15B] bg-[#C9A15B]/10 p-2 rounded-lg border border-[#C9A15B]/20">
                        Manager note: {r.reviewNote}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <StatusBadge variant={getStatusVariant(r.status)}>
                      {r.status}
                    </StatusBadge>

                    {r.status === "PENDING" && (
                      <EpButton
                        size="sm"
                        variant="danger"
                        disabled={isCancelling}
                        loading={isCancelling}
                        onClick={() => handleCancel(r.id)}
                        icon={<Ban className="w-3.5 h-3.5" />}
                      >
                        Cancel
                      </EpButton>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
