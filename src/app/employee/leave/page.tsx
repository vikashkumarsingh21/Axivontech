"use client";

import { useEffect, useState, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Coffee,
  Calendar,
  Loader2,
  Send,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Ban,
  ArrowRight,
  Info,
} from "lucide-react";

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
      const data = await res.json();
      if (data.success && Array.isArray(data.requests)) {
        setRequests(data.requests);
      }
    } catch {
      setActionError("Failed to fetch leave requests.");
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
      setActionError("Please provide start date, end date, and reason.");
      return;
    }

    if (new Date(form.start) > new Date(form.end)) {
      setActionError("End date cannot be earlier than start date.");
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

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit leave request.");
      }

      setActionSuccess("Leave request submitted successfully for approval.");
      setTimeout(() => setActionSuccess(null), 4000);
      setForm({ type: "SICK", start: "", end: "", reason: "" });
      loadData();
    } catch (err: any) {
      setActionError(err.message || "An error occurred while submitting.");
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
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to cancel leave request.");
      }

      setActionSuccess("Leave request cancelled successfully.");
      setTimeout(() => setActionSuccess(null), 3000);
      loadData();
    } catch (err: any) {
      setActionError(err.message || "Could not cancel request.");
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "REJECTED":
        return "bg-rose-500/10 text-rose-400 border-rose-500/30";
      case "CANCELLED":
        return "bg-slate-500/10 text-slate-400 border-slate-500/30";
      default:
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#F3F5F7] tracking-tight">
          Leave Management
        </h1>
        <p className="text-sm text-[#A7B0BC] mt-1">
          Apply for leaves, track annual quota allowances, and manage existing approvals.
        </p>
      </div>

      {/* Action Messages */}
      {actionSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Leave Quota Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-[#151A21] border border-[#29313B] rounded-xl space-y-1">
          <div className="text-xs text-[#7E8997] font-medium">Sick Leave Quota</div>
          <div className="text-2xl font-bold text-[#F3F5F7]">
            {balances.sick.balance}{" "}
            <span className="text-xs font-normal text-[#7E8997]">/ {balances.sick.total} days</span>
          </div>
          <div className="text-[11px] text-[#A7B0BC] pt-1">Used: {balances.sick.used} days</div>
        </div>

        <div className="p-4 bg-[#151A21] border border-[#29313B] rounded-xl space-y-1">
          <div className="text-xs text-[#7E8997] font-medium">Casual Leave Quota</div>
          <div className="text-2xl font-bold text-[#F3F5F7]">
            {balances.casual.balance}{" "}
            <span className="text-xs font-normal text-[#7E8997]">/ {balances.casual.total} days</span>
          </div>
          <div className="text-[11px] text-[#A7B0BC] pt-1">Used: {balances.casual.used} days</div>
        </div>

        <div className="p-4 bg-[#151A21] border border-[#29313B] rounded-xl space-y-1">
          <div className="text-xs text-[#7E8997] font-medium">Paid Time Off (PTO)</div>
          <div className="text-2xl font-bold text-[#D6B779]">
            {balances.paid.balance}{" "}
            <span className="text-xs font-normal text-[#7E8997]">/ {balances.paid.total} days</span>
          </div>
          <div className="text-[11px] text-[#A7B0BC] pt-1">Used: {balances.paid.used} days</div>
        </div>

        <div className="p-4 bg-[#151A21] border border-[#29313B] rounded-xl space-y-1">
          <div className="text-xs text-[#7E8997] font-medium">Unpaid Leave Logged</div>
          <div className="text-2xl font-bold text-[#F3F5F7]">
            {balances.unpaid.used}{" "}
            <span className="text-xs font-normal text-[#7E8997]">days</span>
          </div>
          <div className="text-[11px] text-[#A7B0BC] pt-1">Subject to manager approval</div>
        </div>
      </div>

      {/* New Leave Application Card */}
      <Card className="p-5 sm:p-6 bg-[#151A21] border-[#29313B] rounded-2xl space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-[#1E2530]">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Coffee className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#F3F5F7]">Apply for Leave</h2>
            <p className="text-xs text-[#7E8997]">
              Requests are routed directly to your reporting manager and HR desk.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#A7B0BC] mb-1.5">
                Leave Category <span className="text-rose-400">*</span>
              </label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full h-10 px-3 bg-[#10151B] border border-[#29313B] rounded-lg text-xs sm:text-sm text-[#F3F5F7] focus:outline-none focus:border-emerald-500"
              >
                <option value="SICK">Sick Leave</option>
                <option value="CASUAL">Casual Leave</option>
                <option value="PAID">Paid Time Off (PTO)</option>
                <option value="UNPAID">Unpaid Leave</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A7B0BC] mb-1.5">
                Start Date <span className="text-rose-400">*</span>
              </label>
              <Input
                type="date"
                value={form.start}
                onChange={(e) => setForm({ ...form, start: e.target.value })}
                required
                className="bg-[#10151B] border-[#29313B] text-[#F3F5F7] focus-visible:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A7B0BC] mb-1.5">
                End Date <span className="text-rose-400">*</span>
              </label>
              <Input
                type="date"
                value={form.end}
                min={form.start}
                onChange={(e) => setForm({ ...form, end: e.target.value })}
                required
                className="bg-[#10151B] border-[#29313B] text-[#F3F5F7] focus-visible:border-emerald-500"
              />
            </div>
          </div>

          {calculatedDays > 0 && (
            <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" />
              <span>
                Calculated duration: <strong>{calculatedDays} day{calculatedDays > 1 ? "s" : ""}</strong>
              </span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#A7B0BC] mb-1.5">
              Reason for Absence <span className="text-rose-400">*</span>
            </label>
            <Input
              placeholder="e.g. Attending family function / Medical appointment / Personal emergency"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              required
              className="bg-[#10151B] border-[#29313B] text-[#F3F5F7] placeholder:text-[#566171] focus-visible:border-emerald-500"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-[#04130E] font-semibold flex items-center justify-center gap-2"
            >
              {submitting ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>Submit Leave Request</span>
            </Button>
          </div>
        </form>
      </Card>

      {/* Leave History Card */}
      <Card className="p-5 sm:p-6 bg-[#151A21] border-[#29313B] rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1E2530]">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#F3F5F7]">Leave Requests History</h2>
            <p className="text-xs text-[#7E8997]">All submitted leave applications and their status</p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            {["ALL", "PENDING", "APPROVED", "REJECTED", "CANCELLED"].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedStatus === st
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    : "bg-[#10151B] text-[#7E8997] hover:text-[#F3F5F7] border border-[#1E2530]"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12 text-[#7E8997] gap-2">
            <Loader2 className="animate-spin w-4 h-4 text-emerald-500" />
            <span className="text-xs">Loading leave requests...</span>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-12 text-[#7E8997] text-xs">
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
                  className="p-4 border border-[#29313B] rounded-xl bg-[#10151B] flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#364152] transition-all"
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-[#F3F5F7] bg-[#151A21] border border-[#29313B] px-2.5 py-0.5 rounded">
                        {r.leaveType} LEAVE
                      </span>
                      <span className="text-xs text-[#D6B779] bg-[#D6B779]/10 border border-[#D6B779]/20 px-2 py-0.5 rounded">
                        {days} day{days > 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="text-xs text-[#A7B0BC] flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#7E8997]" />
                      <span>
                        {start.toLocaleDateString()} to {end.toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-xs text-[#7E8997]">{r.reason}</p>

                    {r.reviewNote && (
                      <p className="text-xs text-amber-400/90 bg-amber-500/5 p-2 rounded-lg border border-amber-500/10">
                        Manager note: {r.reviewNote}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-semibold border ${getStatusBadge(
                        r.status
                      )}`}
                    >
                      {r.status}
                    </span>

                    {r.status === "PENDING" && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isCancelling}
                        onClick={() => handleCancel(r.id)}
                        className="text-xs border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                      >
                        {isCancelling ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Ban className="w-3.5 h-3.5 mr-1" />
                        )}
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
