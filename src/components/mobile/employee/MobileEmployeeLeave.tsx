"use client";

import { useState, useMemo } from "react";
import {
  Coffee,
  Calendar,
  Plus,
  Loader2,
  Send,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { CardList, type CardListItem } from "../CardList";
import { BottomSheet } from "../BottomSheet";
import { ConfirmDialog } from "../ConfirmDialog";

export interface LeaveBalances {
  sick: { total: number; used: number; balance: number };
  casual: { total: number; used: number; balance: number };
  paid: { total: number; used: number; balance: number };
  unpaid: { total: number; used: number; balance: number };
}

interface MobileEmployeeLeaveProps {
  requests: any[];
  balances?: LeaveBalances | null;
  onApplyLeave: (form: {
    type: string;
    start: string;
    end: string;
    reason: string;
  }) => Promise<void>;
  onCancelLeave: (requestId: string) => Promise<void>;
  isLoading?: boolean;
}

export function MobileEmployeeLeave({
  requests,
  balances,
  onApplyLeave,
  onCancelLeave,
  isLoading = false,
}: MobileEmployeeLeaveProps) {
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [leaveType, setLeaveType] = useState("CASUAL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);

  // Compute balances from requests if not explicitly passed (matches desktop formula)
  const computedBalances = useMemo(() => {
    if (balances) return balances;
    if (!requests || !Array.isArray(requests)) return null;

    let sickUsed = 0;
    let casualUsed = 0;
    let paidUsed = 0;
    let unpaidUsed = 0;

    requests.forEach((r: any) => {
      if (r?.status === "APPROVED") {
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
  }, [balances, requests]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason.trim()) return;

    setSubmitting(true);
    try {
      await onApplyLeave({
        type: leaveType,
        start: startDate,
        end: endDate,
        reason,
      });
      setApplyModalOpen(false);
      setReason("");
      setStartDate("");
      setEndDate("");
    } finally {
      setSubmitting(false);
    }
  };

  const cardItems: CardListItem[] = useMemo(() => {
    return requests.map((req) => {
      const isPending = req.status === "PENDING";
      const isApproved = req.status === "APPROVED";
      const isRejected = req.status === "REJECTED";

      const startFormatted = new Date(req.startDate).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
      });
      const endFormatted = new Date(req.endDate).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
      });

      return {
        id: req.id,
        title: `${req.leaveType} Leave`,
        subtitle: `${startFormatted} – ${endFormatted}`,
        status: {
          label: req.status,
          variant: isApproved ? "success" : isPending ? "warning" : "error",
        },
        fields: [
          {
            label: "Reason",
            value: <span className="line-clamp-1">{req.reason}</span>,
          },
          {
            label: "Applied On",
            value: new Date(req.createdAt).toLocaleDateString("en-IN", {
              month: "short",
              day: "numeric",
            }),
          },
        ],
        action: isPending ? (
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={() => setCancelTargetId(req.id)}
              className="text-xs font-semibold text-[#C85555] hover:underline flex items-center gap-1"
            >
              <XCircle className="h-3.5 w-3.5" />
              <span>Cancel Request</span>
            </button>
          </div>
        ) : undefined,
      };
    });
  }, [requests]);

  return (
    <div className="space-y-4">
      {/* ── Leave Balances Strip ─────────────────────────────────────── */}
      <section className="grid grid-cols-3 gap-2.5">
        <div className="rounded-2xl bg-[#1A1A1B] border border-[#2E2E30] p-3 text-center">
          <span className="text-[11px] font-medium text-[#B3AFA6] block">Casual Leave</span>
          {isLoading ? (
            <div className="h-7 w-8 bg-[#232324] animate-pulse rounded mx-auto my-0.5" />
          ) : (
            <span className="text-xl font-bold text-[#EDEBE6] tabular-nums mt-1 block">
              {computedBalances ? computedBalances.casual.balance : "—"}
            </span>
          )}
          <span className="text-[10px] text-[#4F9D83] mt-0.5 block">Days Available</span>
        </div>

        <div className="rounded-2xl bg-[#1A1A1B] border border-[#2E2E30] p-3 text-center">
          <span className="text-[11px] font-medium text-[#B3AFA6] block">Sick Leave</span>
          {isLoading ? (
            <div className="h-7 w-8 bg-[#232324] animate-pulse rounded mx-auto my-0.5" />
          ) : (
            <span className="text-xl font-bold text-[#EDEBE6] tabular-nums mt-1 block">
              {computedBalances ? computedBalances.sick.balance : "—"}
            </span>
          )}
          <span className="text-[10px] text-[#4F9D83] mt-0.5 block">Days Available</span>
        </div>

        <div className="rounded-2xl bg-[#1A1A1B] border border-[#2E2E30] p-3 text-center">
          <span className="text-[11px] font-medium text-[#B3AFA6] block">Paid (PTO)</span>
          {isLoading ? (
            <div className="h-7 w-8 bg-[#232324] animate-pulse rounded mx-auto my-0.5" />
          ) : (
            <span className="text-xl font-bold text-[#EDEBE6] tabular-nums mt-1 block">
              {computedBalances ? computedBalances.paid.balance : "—"}
            </span>
          )}
          <span className="text-[10px] text-[#C9A15B] mt-0.5 block">Days Available</span>
        </div>
      </section>

      {/* ── Apply CTA Button ─────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setApplyModalOpen(true)}
        className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-[#4F9D83] text-[#121212] font-semibold text-sm hover:bg-[#438770] active:scale-98 transition-all shadow-sm"
      >
        <Plus className="h-4 w-4" />
        <span>Apply for Time Off</span>
      </button>

      {/* ── Leave Requests History ───────────────────────────────────── */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-semibold text-[#EDEBE6]">Leave History</h2>
          <span className="text-xs text-[#B3AFA6]">
            {requests.length} {requests.length === 1 ? "record" : "records"}
          </span>
        </div>

        <CardList
          items={cardItems}
          emptyTitle="No leave applications"
          emptyDescription="You have not submitted any leave requests yet."
        />
      </section>

      {/* ── Apply Leave Bottom Sheet Form ────────────────────────────── */}
      <BottomSheet
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        title="Apply for Leave"
        description="Select dates and provide a reason for manager approval."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[#B3AFA6] block mb-1.5">
              Leave Category
            </label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="w-full h-12 px-3.5 rounded-xl bg-[#232324] border border-[#2E2E30] text-[#EDEBE6] text-sm focus:border-[#4F9D83] focus:outline-none"
            >
              <option value="CASUAL">Casual Leave (CL)</option>
              <option value="SICK">Sick Leave (SL)</option>
              <option value="PAID">Paid Time Off (PTO)</option>
              <option value="UNPAID">Unpaid Leave</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[#B3AFA6] block mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full h-12 px-3.5 rounded-xl bg-[#232324] border border-[#2E2E30] text-[#EDEBE6] text-sm focus:border-[#4F9D83] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[#B3AFA6] block mb-1.5">
                End Date
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full h-12 px-3.5 rounded-xl bg-[#232324] border border-[#2E2E30] text-[#EDEBE6] text-sm focus:border-[#4F9D83] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[#B3AFA6] block mb-1.5">
              Reason for Absence
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide context for manager review..."
              className="w-full p-3.5 rounded-xl bg-[#232324] border border-[#2E2E30] text-[#EDEBE6] text-sm focus:border-[#4F9D83] focus:outline-none resize-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-[#4F9D83] text-[#121212] font-semibold text-sm hover:bg-[#438770] active:scale-98 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span>Submit Leave Request</span>
            </button>
          </div>
        </form>
      </BottomSheet>

      {/* Cancel Request Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(cancelTargetId)}
        title="Cancel Leave Request?"
        message="Are you sure you want to cancel this pending leave request?"
        confirmLabel="Cancel Request"
        cancelLabel="Keep Request"
        isDestructive={true}
        onConfirm={async () => {
          if (cancelTargetId) {
            await onCancelLeave(cancelTargetId);
            setCancelTargetId(null);
          }
        }}
        onCancel={() => setCancelTargetId(null)}
      />
    </div>
  );
}
