"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Clock,
  Coffee,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  FileCheck,
  Plus,
  Loader2,
  Send,
} from "lucide-react";
import { CardList, type CardListItem } from "../CardList";
import { BottomSheet } from "../BottomSheet";
import { ConfirmDialog } from "../ConfirmDialog";

interface MobileEmployeeAttendanceProps {
  today: any;
  policy: any;
  records: any[];
  unregularizedMissed?: any[];
  onAction: (action: "check-in" | "check-out" | "break-start" | "break-end") => Promise<void>;
  onRegularize: (data: {
    date: string;
    requestedCheckIn: string;
    requestedCheckOut: string;
    reason: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

export function MobileEmployeeAttendance({
  today,
  policy,
  records,
  unregularizedMissed = [],
  onAction,
  onRegularize,
  isLoading = false,
}: MobileEmployeeAttendanceProps) {
  const [regModalOpen, setRegModalOpen] = useState(false);
  const [regDate, setRegDate] = useState("");
  const [regCheckIn, setRegCheckIn] = useState("09:30");
  const [regCheckOut, setRegCheckOut] = useState("18:30");
  const [regReason, setRegReason] = useState("");
  const [regSubmitting, setRegSubmitting] = useState(false);
  const [confirmCheckoutOpen, setConfirmCheckoutOpen] = useState(false);

  const isCheckedIn = Boolean(today?.checkInAt && !today?.checkOutAt);
  const isCheckedOut = Boolean(today?.checkInAt && today?.checkOutAt);
  const isOnBreak = Boolean(today?.isOnBreak);

  const handleRegularizeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regDate || !regReason.trim()) return;

    setRegSubmitting(true);
    try {
      const checkInISO = `${regDate}T${regCheckIn}:00.000Z`;
      const checkOutISO = `${regDate}T${regCheckOut}:00.000Z`;
      await onRegularize({
        date: regDate,
        requestedCheckIn: checkInISO,
        requestedCheckOut: checkOutISO,
        reason: regReason,
      });
      setRegModalOpen(false);
      setRegDate("");
      setRegReason("");
    } finally {
      setRegSubmitting(false);
    }
  };

  // Convert past records to CardList items
  const historyItems: CardListItem[] = useMemo(() => {
    return (records || []).slice(0, 15).map((rec: any) => {
      const isPresent = rec.status === "PRESENT" || Boolean(rec.checkInAt);
      const isLate = Boolean(rec.isLate);
      const dateFormatted = new Date(rec.date).toLocaleDateString("en-IN", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });

      return {
        id: rec.id || rec.date,
        title: dateFormatted,
        subtitle: isPresent
          ? `${rec.checkInAt ? new Date(rec.checkInAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—"} to ${rec.checkOutAt ? new Date(rec.checkOutAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—"}`
          : "Absent / Non-Working",
        status: {
          label: rec.status || (isPresent ? "Present" : "Absent"),
          variant: isPresent ? (isLate ? "warning" : "success") : "error",
        },
        fields: [
          {
            label: "Total Hours",
            value: rec.workedMinutes
              ? `${Math.floor(rec.workedMinutes / 60)}h ${rec.workedMinutes % 60}m`
              : "—",
          },
          {
            label: "Break Time",
            value: rec.breakMinutes ? `${rec.breakMinutes}m` : "0m",
          },
        ],
      };
    });
  }, [records]);

  return (
    <div className="space-y-4">
      {/* ── Unregularized Missed Checkout Warning ───────────────────── */}
      {unregularizedMissed.length > 0 && (
        <div className="rounded-2xl bg-[#2B2113] border border-[#523E1F] p-4 space-y-2">
          <div className="flex items-center gap-2 text-[#D4A359]">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <h3 className="text-xs font-semibold">Missed Check-Out Recorded</h3>
          </div>
          <p className="text-xs text-[#F5D59E] leading-relaxed">
            You have an unclosed check-in from a previous shift. Please submit an attendance
            regularization request to prevent pay deduction.
          </p>
          <button
            type="button"
            onClick={() => {
              setRegDate(unregularizedMissed[0]?.date || "");
              setRegModalOpen(true);
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#D4A359] hover:underline pt-1"
          >
            <span>Regularize Missing Shift</span>
            <span aria-hidden="true">&rarr;</span>
          </button>
        </div>
      )}

      {/* ── Today's Active Attendance Card ─────────────────────────── */}
      <section className="rounded-2xl bg-[#1A1A1B] border border-[#2E2E30] p-4 sm:p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#4F9D83]" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#B3AFA6]">
              Today&apos;s Attendance
            </h2>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
              isCheckedIn
                ? "bg-[#162721] text-[#A2D9C7] border-[#27483C]"
                : isCheckedOut
                ? "bg-[#232324] text-[#B3AFA6] border-[#2E2E30]"
                : "bg-[#2A1515] text-[#F5A3A3] border-[#5A2424]"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isCheckedIn
                  ? "bg-[#4F9D83] animate-pulse"
                  : isCheckedOut
                  ? "bg-[#827E76]"
                  : "bg-[#C85555]"
              }`}
            />
            <span>
              {isCheckedIn
                ? "Checked In"
                : isCheckedOut
                ? "Shift Finished"
                : "Not Checked In"}
            </span>
          </span>
        </div>

        {/* Daily Shift Timeline details */}
        <div className="grid grid-cols-2 gap-3 py-1">
          <div className="rounded-xl bg-[#232324] border border-[#2E2E30] p-3">
            <span className="text-[10px] text-[#827E76] uppercase tracking-wider font-semibold">
              Check-In Time
            </span>
            <div className="text-sm font-semibold text-[#EDEBE6] tabular-nums mt-0.5">
              {today?.checkInAt
                ? new Date(today.checkInAt).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "—"}
            </div>
          </div>

          <div className="rounded-xl bg-[#232324] border border-[#2E2E30] p-3">
            <span className="text-[10px] text-[#827E76] uppercase tracking-wider font-semibold">
              Check-Out Time
            </span>
            <div className="text-sm font-semibold text-[#EDEBE6] tabular-nums mt-0.5">
              {today?.checkOutAt
                ? new Date(today.checkOutAt).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : isCheckedIn
                ? "Active"
                : "—"}
            </div>
          </div>

          <div className="rounded-xl bg-[#232324] border border-[#2E2E30] p-3">
            <span className="text-[10px] text-[#827E76] uppercase tracking-wider font-semibold">
              Net Hours Worked
            </span>
            <div className="text-sm font-semibold text-[#4F9D83] tabular-nums mt-0.5">
              {today?.netMinutes
                ? `${Math.floor(today.netMinutes / 60)}h ${today.netMinutes % 60}m`
                : "0h 0m"}
            </div>
          </div>

          <div className="rounded-xl bg-[#232324] border border-[#2E2E30] p-3">
            <span className="text-[10px] text-[#827E76] uppercase tracking-wider font-semibold">
              Break Time
            </span>
            <div className="text-sm font-semibold text-[#D4A359] tabular-nums mt-0.5">
              {today?.breakMinutes ? `${today.breakMinutes} mins` : "0 mins"}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          {!isCheckedIn ? (
            <button
              type="button"
              disabled={isLoading || isCheckedOut}
              onClick={() => onAction("check-in")}
              className="col-span-2 h-12 flex items-center justify-center gap-2 rounded-xl bg-[#4F9D83] text-[#121212] font-semibold text-sm hover:bg-[#438770] active:scale-98 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Clock className="h-4 w-4" />
              )}
              <span>{isCheckedOut ? "Completed for Today" : "Check In"}</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => onAction(isOnBreak ? "break-end" : "break-start")}
                className="h-12 flex items-center justify-center gap-2 rounded-xl bg-[#232324] border border-[#2E2E30] text-[#EDEBE6] font-semibold text-sm hover:bg-[#2A2A2C] active:scale-98 transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-[#4F9D83]" />
                ) : (
                  <Coffee className="h-4 w-4 text-[#D4A359]" />
                )}
                <span>{isOnBreak ? "Resume Work" : "Take Break"}</span>
              </button>

              <button
                type="button"
                disabled={isLoading}
                onClick={() => setConfirmCheckoutOpen(true)}
                className="h-12 flex items-center justify-center gap-2 rounded-xl bg-[#C85555] text-white font-semibold text-sm hover:bg-[#B04545] active:scale-98 transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Clock className="h-4 w-4" />
                )}
                <span>Check Out</span>
              </button>
            </>
          )}
        </div>
      </section>

      {/* ── Attendance History Section ─────────────────────────────── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-semibold text-[#EDEBE6]">Recent Attendance</h2>
          <button
            type="button"
            onClick={() => setRegModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#4F9D83] hover:underline"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Regularize</span>
          </button>
        </div>

        <CardList
          items={historyItems}
          emptyTitle="No attendance records"
          emptyDescription="Your past attendance history will appear here."
        />
      </section>

      {/* ── Regularization Bottom Sheet Modal ──────────────────────── */}
      <BottomSheet
        isOpen={regModalOpen}
        onClose={() => setRegModalOpen(false)}
        title="Attendance Regularization"
        description="Submit a request to adjust missed check-in or check-out times."
      >
        <form onSubmit={handleRegularizeSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[#B3AFA6] block mb-1.5">
              Shift Date
            </label>
            <input
              type="date"
              required
              value={regDate}
              onChange={(e) => setRegDate(e.target.value)}
              className="w-full h-12 px-3.5 rounded-xl bg-[#232324] border border-[#2E2E30] text-[#EDEBE6] text-sm focus:border-[#4F9D83] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[#B3AFA6] block mb-1.5">
                Check-In Time
              </label>
              <input
                type="time"
                required
                value={regCheckIn}
                onChange={(e) => setRegCheckIn(e.target.value)}
                className="w-full h-12 px-3.5 rounded-xl bg-[#232324] border border-[#2E2E30] text-[#EDEBE6] text-sm focus:border-[#4F9D83] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[#B3AFA6] block mb-1.5">
                Check-Out Time
              </label>
              <input
                type="time"
                required
                value={regCheckOut}
                onChange={(e) => setRegCheckOut(e.target.value)}
                className="w-full h-12 px-3.5 rounded-xl bg-[#232324] border border-[#2E2E30] text-[#EDEBE6] text-sm focus:border-[#4F9D83] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[#B3AFA6] block mb-1.5">
              Reason for Adjustment
            </label>
            <textarea
              required
              rows={3}
              value={regReason}
              onChange={(e) => setRegReason(e.target.value)}
              placeholder="e.g. client visit, power outage, forgot to check in"
              className="w-full p-3.5 rounded-xl bg-[#232324] border border-[#2E2E30] text-[#EDEBE6] text-sm focus:border-[#4F9D83] focus:outline-none resize-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={regSubmitting}
              className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-[#4F9D83] text-[#121212] font-semibold text-sm hover:bg-[#438770] active:scale-98 transition-all disabled:opacity-50"
            >
              {regSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span>Submit Regularization</span>
            </button>
          </div>
        </form>
      </BottomSheet>

      {/* Confirm Check-out Dialog */}
      <ConfirmDialog
        isOpen={confirmCheckoutOpen}
        title="Check Out for Today?"
        message="Ending your shift will stop tracking attendance for today. Are you sure you want to check out?"
        confirmLabel="Check Out"
        cancelLabel="Cancel"
        isLoading={isLoading}
        onConfirm={() => {
          setConfirmCheckoutOpen(false);
          onAction("check-out");
        }}
        onCancel={() => setConfirmCheckoutOpen(false)}
      />
    </div>
  );
}
