"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  CheckCircle2,
  Clock,
  Calendar,
  AlertCircle,
  Coffee,
  Play,
  Square,
  FileCheck,
  Send,
  X,
  Building2,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

function formatMinutes(mins: number): string {
  if (mins === undefined || mins === null) return "0h 0m";
  const isNegative = mins < 0;
  const abs = Math.abs(mins);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  const str = `${h}h ${m}m`;
  return isNegative ? `-${str}` : str;
}

function formatTime(dt: string | null) {
  if (!dt) return "—";
  return new Date(dt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function formatDateStr(dateVal: string | Date | null | undefined): string {
  if (!dateVal) return "—";
  if (typeof dateVal === "string") {
    const match = dateVal.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const [year, month, day] = match[0].split("-").map(Number);
      const d = new Date(year, month - 1, day);
      return d.toLocaleDateString("en-IN", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
  }
  return new Date(dateVal).toLocaleDateString("en-IN", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AttendancePage() {
  const [today, setToday] = useState<any>(null);
  const [policy, setPolicy] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Break modal state
  const [breakType, setBreakType] = useState("LUNCH");

  // Regularization modal state
  const [regModalOpen, setRegModalOpen] = useState(false);
  const [regDate, setRegDate] = useState("");
  const [regCheckIn, setRegCheckIn] = useState("09:00");
  const [regCheckOut, setRegCheckOut] = useState("18:00");
  const [regReason, setRegReason] = useState("");
  const [regLoading, setRegLoading] = useState(false);

  const loadData = () => {
    setLoading(true);
    setError("");
    fetch("/api/v1/employee/attendance")
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(data?.error || `Server error (${res.status})`);
        }
        return data;
      })
      .then((data) => {
        if (data?.success) {
          setToday(data.today);
          setPolicy(data.policy);
          setRecords(data.records || []);
        } else {
          setError(data?.error || "Failed to load attendance");
        }
      })
      .catch((err: any) => setError(err.message || "Failed to load attendance"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      setToday((prev: any) => {
        if (!prev || !prev.checkInAt || prev.checkOutAt) return prev;
        const grossMs = Math.max(0, Date.now() - new Date(prev.checkInAt).getTime());
        const grossMins = Math.floor(grossMs / 60000);
        const netMins = Math.max(0, grossMins - (prev.breakMinutes || 0));
        const remMins = Math.max(0, (prev.requiredMinutes || 480) - netMins);
        return {
          ...prev,
          grossMinutes: grossMins,
          workedMinutes: netMins,
          netMinutes: netMins,
          remainingMinutes: remMins,
          differenceMinutes: netMins - (prev.requiredMinutes || 480),
        };
      });
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (action: "check-in" | "check-out" | "break-start" | "break-end") => {
    setActionLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await fetch("/api/v1/employee/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, breakType, notes: "" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed");
      setSuccessMsg(data.message || "Action updated successfully");
      loadData();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRegularizeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegLoading(true);
    setError("");
    try {
      const checkInISO = `${regDate}T${regCheckIn}:00.000Z`;
      const checkOutISO = `${regDate}T${regCheckOut}:00.000Z`;

      const res = await fetch("/api/v1/employee/attendance/regularize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: regDate,
          requestedCheckIn: checkInISO,
          requestedCheckOut: checkOutISO,
          reason: regReason,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit regularization");

      setSuccessMsg("Regularization request submitted successfully for Admin review");
      setRegModalOpen(false);
      setRegReason("");
      loadData();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setRegLoading(false);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "COMPLETE":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "IN_PROGRESS":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "INCOMPLETE":
        return "bg-orange-500/10 text-orange-400 border-orange-500/30";
      case "HALF_DAY":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "ON_LEAVE":
        return "bg-purple-500/10 text-purple-400 border-purple-500/30";
      case "HOLIDAY":
      case "WEEKLY_OFF":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/30";
      default:
        return "bg-[#1B222B] text-[#A7B0BC] border-[#29313B]";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16 text-[#A7B0BC] gap-3">
        <Loader2 className="animate-spin w-5 h-5 text-emerald-500" />
        <span>Loading attendance details...</span>
      </div>
    );
  }

  const reqMins = today?.requiredMinutes ?? 480;
  const netMins = today?.netMinutes ?? today?.workedMinutes ?? 0;
  const remainingMinutes = Math.max(0, reqMins - netMins);
  const isTargetMet = netMins >= reqMins && reqMins > 0;
  const progressPercent = Math.min(100, Math.round((netMins / reqMins) * 100));

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-[#29313B]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F3F5F7] tracking-tight">
            Attendance & Work Hours
          </h1>
          <p className="text-xs sm:text-sm text-[#A7B0BC] mt-1">
            Track daily check-ins, breaks, required hours target, and submit regularization requests.
          </p>
        </div>
        <button
          onClick={() => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            setRegDate(yesterday.toISOString().split("T")[0]);
            setRegModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1B222B] hover:bg-[#202833] text-emerald-400 hover:text-white border border-[#29313B] hover:border-emerald-500/30 text-xs font-semibold transition-all shadow-xs"
        >
          <FileCheck className="w-4 h-4 text-emerald-400" />
          <span>Request Regularization</span>
        </button>
      </div>

      {/* ── Policy Banner ───────────────────────────────────────────── */}
      <div className="bg-[#151A21] border border-[#29313B] rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs uppercase tracking-wider text-emerald-400 font-bold">
                Daily Work Window
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-[#1B222B] text-[#F3F5F7] font-mono border border-[#29313B]">
                {policy?.workWindowStart || "06:00 AM"} → {policy?.workWindowEnd || "11:00 PM"}
              </span>
            </div>
            <p className="text-xs text-[#A7B0BC] mt-0.5">
              Configured company attendance window. Assigned daily target:{" "}
              <strong className="text-[#F3F5F7]">{formatMinutes(reqMins)}</strong>.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#7E8997]">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Grace: <strong>{policy?.graceMinutes || 15}m</strong> • Cutoff:{" "}
            <strong>{policy?.cutoffTime || "11:00 PM"}</strong>
          </span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadData}
            className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-semibold transition-colors shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center gap-3 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ── Today Live Session Card ─────────────────────────────────── */}
      <div className="p-6 rounded-2xl bg-[#151A21] border border-[#29313B] space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#29313B] pb-5">
          <div>
            <h2 className="text-lg font-bold text-[#F3F5F7] flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              <span>Today's Live Punch & Session</span>
            </h2>
            <p className="text-xs text-[#7E8997] mt-0.5">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full border ${statusColor(
                today?.status
              )}`}
            >
              {today?.isOnBreak
                ? "ON BREAK"
                : today?.isWorking
                ? "WORKING LIVE"
                : today?.status || "NOT STARTED"}
            </span>

            {/* Check-In Button */}
            {!today?.checkInAt && (
              <button
                onClick={() => handleAction("check-in")}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-[#04130E] font-bold text-xs shadow-xs transition-all disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>Check In Now</span>
              </button>
            )}

            {/* Break Controls */}
            {today?.checkInAt && !today?.checkOutAt && !today?.isOnBreak && (
              <div className="flex items-center gap-2">
                <select
                  value={breakType}
                  onChange={(e) => setBreakType(e.target.value)}
                  className="bg-[#10151B] border border-[#29313B] text-[#F3F5F7] text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
                >
                  <option value="LUNCH">Lunch Break</option>
                  <option value="TEA">Tea / Coffee</option>
                  <option value="PERSONAL">Personal Break</option>
                  <option value="OTHER">Short Break</option>
                </select>
                <button
                  onClick={() => handleAction("break-start")}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 text-xs font-semibold transition-all disabled:opacity-50"
                >
                  <Coffee className="w-3.5 h-3.5" />
                  <span>Take Break</span>
                </button>
              </div>
            )}

            {/* Resume from Break */}
            {today?.isOnBreak && (
              <button
                onClick={() => handleAction("break-end")}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-[#04130E] text-xs font-bold transition-all shadow-xs disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="animate-spin w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>Resume Work</span>
              </button>
            )}

            {/* Check-Out Button */}
            {today?.checkInAt && !today?.checkOutAt && (
              <button
                onClick={() => handleAction("check-out")}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold text-xs shadow-xs transition-all disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <Square className="w-4 h-4" />}
                <span>Check Out</span>
              </button>
            )}
          </div>
        </div>

        {/* Target Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#A7B0BC]">
              Target Progress ({formatMinutes(netMins)} / {formatMinutes(reqMins)})
            </span>
            <span
              className={`font-semibold ${
                netMins >= reqMins ? "text-emerald-400" : "text-emerald-500"
              }`}
            >
              {progressPercent}% Completed
            </span>
          </div>
          <div className="h-2.5 w-full bg-[#10151B] rounded-full overflow-hidden border border-[#29313B]">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                netMins >= reqMins
                  ? "bg-emerald-500"
                  : "bg-gradient-to-r from-emerald-600 to-emerald-400"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
          <div className="p-4 rounded-xl bg-[#10151B] border border-[#29313B] space-y-1">
            <span className="text-[11px] text-[#7E8997] uppercase tracking-wider font-semibold">
              Required Target
            </span>
            <div className="text-xl font-bold text-[#F3F5F7]">{formatMinutes(reqMins)}</div>
            <p className="text-[10px] text-[#566171]">Company Standard</p>
          </div>

          <div className="p-4 rounded-xl bg-[#10151B] border border-[#29313B] space-y-1">
            <span className="text-[11px] text-[#7E8997] uppercase tracking-wider font-semibold">
              Net Worked Time
            </span>
            <div className="text-xl font-bold text-emerald-400 font-mono">
              {formatMinutes(netMins)}
            </div>
            <p className="text-[10px] text-[#566171]">Gross - Breaks</p>
          </div>

          <div className="p-4 rounded-xl bg-[#10151B] border border-[#29313B] space-y-1">
            <span className="text-[11px] text-[#7E8997] uppercase tracking-wider font-semibold">
              Break Time
            </span>
            <div className="text-xl font-bold text-amber-400 font-mono">
              {formatMinutes(today?.breakMinutes || 0)}
            </div>
            <p className="text-[10px] text-[#566171]">
              {today?.breaks?.length || 0} session(s)
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#10151B] border border-[#29313B] space-y-1">
            <span className="text-[11px] text-[#7E8997] uppercase tracking-wider font-semibold">
              Remaining Target
            </span>
            <div
              className={`text-xl font-bold font-mono ${
                isTargetMet ? "text-emerald-400" : "text-[#FBBF24]"
              }`}
            >
              {isTargetMet ? "0h 0m (Met)" : formatMinutes(remainingMinutes)}
            </div>
            <p className="text-[10px] text-[#566171]">Target balance</p>
          </div>

          <div className="p-4 rounded-xl bg-[#10151B] border border-[#29313B] space-y-1">
            <span className="text-[11px] text-[#7E8997] uppercase tracking-wider font-semibold">
              Check In / Out
            </span>
            <div className="text-sm font-semibold text-[#F3F5F7] mt-1 font-mono">
              {today?.checkInAt ? formatTime(today.checkInAt) : "—"}{" "}
              <span className="text-[#566171]">→</span>{" "}
              {today?.checkOutAt ? (
                formatTime(today.checkOutAt)
              ) : today?.checkInAt ? (
                <span className="text-emerald-400">Active</span>
              ) : (
                "—"
              )}
            </div>
            <p className="text-[10px] text-[#566171]">
              {today?.isLate ? (
                <span className="text-red-400 font-medium">Late Arrival</span>
              ) : (
                "On-time arrival"
              )}
            </p>
          </div>
        </div>
      </div>

      {/* ── Attendance History Log ──────────────────────────────────── */}
      <div className="p-6 rounded-2xl bg-[#151A21] border border-[#29313B] space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#F3F5F7] flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <span>Attendance History (Last 60 Days)</span>
          </h2>
          <span className="text-xs text-[#7E8997]">{records.length} records</span>
        </div>

        {records.length === 0 ? (
          <div className="text-sm text-[#7E8997] py-8 text-center border border-dashed border-[#29313B] rounded-xl">
            {error ? "Unable to load attendance records due to server error." : "No attendance records found for this period."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#A7B0BC]">
              <thead className="bg-[#10151B] text-[11px] text-[#7E8997] uppercase tracking-wider border-b border-[#29313B]">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Check In</th>
                  <th className="py-3 px-4">Check Out</th>
                  <th className="py-3 px-4">Gross</th>
                  <th className="py-3 px-4">Breaks</th>
                  <th className="py-3 px-4">Net Worked</th>
                  <th className="py-3 px-4">Daily Target</th>
                  <th className="py-3 px-4">Shortfall / Overtime</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2530]">
                {records.map((r: any) => (
                  <tr key={r.id} className="hover:bg-[#1B222B]/60 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-[#F3F5F7]">
                      {formatDateStr(r.date)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs">
                      {r.checkInAt ? formatTime(r.checkInAt) : "—"}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs">
                      {r.checkOutAt ? formatTime(r.checkOutAt) : r.checkInAt ? "Active" : "—"}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#7E8997]">
                      {formatMinutes(r.grossMinutes || r.workedMinutes)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-amber-400">
                      {formatMinutes(r.breakMinutes || 0)}
                    </td>
                    <td className="py-3.5 px-4 text-emerald-400 font-semibold font-mono">
                      {formatMinutes(r.workedMinutes)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#7E8997]">
                      {formatMinutes(r.requiredMinutes)}
                    </td>
                    <td
                      className={`py-3.5 px-4 font-semibold font-mono ${
                        r.differenceMinutes >= 0 ? "text-emerald-400" : "text-[#F87171]"
                      }`}
                    >
                      {formatMinutes(r.differenceMinutes)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${statusColor(
                          r.status
                        )}`}
                      >
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Regularization Request Modal ────────────────────────────── */}
      {regModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#151A21] border border-[#29313B] rounded-2xl w-full max-w-lg flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#29313B] bg-[#10151B]">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-[#F3F5F7]">
                  Attendance Regularization Request
                </h3>
              </div>
              <button
                onClick={() => setRegModalOpen(false)}
                className="p-1 rounded-lg text-[#7E8997] hover:text-[#F3F5F7] hover:bg-[#1B222B] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegularizeSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#A7B0BC] mb-1.5">
                  Target Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={regDate}
                  onChange={(e) => setRegDate(e.target.value)}
                  className="w-full bg-[#10151B] border border-[#29313B] rounded-xl px-3 py-2 text-sm text-[#F3F5F7] focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#A7B0BC] mb-1.5">
                    Requested Check-In <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={regCheckIn}
                    onChange={(e) => setRegCheckIn(e.target.value)}
                    className="w-full bg-[#10151B] border border-[#29313B] rounded-xl px-3 py-2 text-sm text-[#F3F5F7] focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#A7B0BC] mb-1.5">
                    Requested Check-Out <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={regCheckOut}
                    onChange={(e) => setRegCheckOut(e.target.value)}
                    className="w-full bg-[#10151B] border border-[#29313B] rounded-xl px-3 py-2 text-sm text-[#F3F5F7] focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A7B0BC] mb-1.5">
                  Reason for Regularization <span className="text-red-400">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={regReason}
                  onChange={(e) => setRegReason(e.target.value)}
                  placeholder="Explain why the punch was missed or hours were incomplete (e.g. Client meeting off-site, power outage, technical issue)..."
                  className="w-full bg-[#10151B] border border-[#29313B] rounded-xl px-3 py-2.5 text-xs text-[#F3F5F7] placeholder:text-[#566171] focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-[#29313B]">
                <button
                  type="button"
                  onClick={() => setRegModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#1B222B] hover:bg-[#202833] text-[#A7B0BC] hover:text-[#F3F5F7] text-xs font-semibold border border-[#29313B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={regLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-[#04130E] text-xs font-bold shadow-xs disabled:opacity-50 transition-all"
                >
                  {regLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <Send className="w-4 h-4" />}
                  <span>Submit Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
