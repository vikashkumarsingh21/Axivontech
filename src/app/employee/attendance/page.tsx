"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
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
} from "lucide-react";

function formatMinutes(mins: number): string {
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
    fetch("/api/v1/employee/attendance")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setToday(data.today);
          setPolicy(data.policy);
          setRecords(data.records || []);
        } else {
          setError(data.error || "Failed to load attendance");
        }
      })
      .catch(() => setError("Failed to load attendance"))
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

      setSuccessMsg("Regularization request submitted successfully for Admin approval");
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
        return "bg-gray-500/10 text-gray-400 border-gray-500/30";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16 text-gray-400 gap-3">
        <Loader2 className="animate-spin w-5 h-5 text-indigo-400" />
        <span>Loading attendance details...</span>
      </div>
    );
  }

  const reqMins = today?.requiredMinutes || 480;
  const netMins = today?.netMinutes || 0;
  const progressPercent = Math.min(100, Math.round((netMins / reqMins) * 100));

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Attendance & Work Hours</h1>
          <p className="text-sm text-gray-400 mt-1">
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
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1e293b] hover:bg-[#334155] text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-semibold transition-all shadow-lg shadow-indigo-950/20"
        >
          <FileCheck className="w-4 h-4" />
          Request Regularization
        </button>
      </div>

      {/* Company Work Window Banner */}
      <div className="bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-purple-950/40 border border-blue-500/20 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-blue-400 font-semibold">Company Attendance Window</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-300 font-mono">
                {policy?.workWindowStart || "08:00 AM"} → {policy?.workWindowEnd || "07:00 PM"}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Standard daily window for remote check-ins. Your assigned daily target is <strong>{formatMinutes(reqMins)}</strong>.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Grace Time: <strong>{policy?.graceMinutes || 15} mins</strong> • Cutoff: <strong>{policy?.cutoffTime || "07:00 PM"}</strong></span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl flex items-center gap-3 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Today Work Dashboard Card */}
      <Card className="p-6 bg-[#0a0a0c] border border-gray-800 rounded-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-5">
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              <span>Today's Live Punch & Session</span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full border ${statusColor(today?.status)}`}
            >
              {today?.isOnBreak ? "ON BREAK" : today?.isWorking ? "WORKING LIVE" : today?.status || "NOT STARTED"}
            </span>

            {/* Check-In Button */}
            {!today?.checkInAt && (
              <Button onClick={() => handleAction("check-in")} disabled={actionLoading} className="bg-emerald-600 hover:bg-emerald-500 text-white">
                {actionLoading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                Check In Now
              </Button>
            )}

            {/* Break Controls */}
            {today?.checkInAt && !today?.checkOutAt && !today?.isOnBreak && (
              <div className="flex items-center gap-2">
                <select
                  value={breakType}
                  onChange={(e) => setBreakType(e.target.value)}
                  className="bg-gray-900 border border-gray-700 text-gray-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none"
                >
                  <option value="LUNCH">Lunch Break</option>
                  <option value="TEA">Tea / Coffee</option>
                  <option value="PERSONAL">Personal Break</option>
                  <option value="OTHER">Short Break</option>
                </select>
                <button
                  onClick={() => handleAction("break-start")}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold transition-all"
                >
                  <Coffee className="w-3.5 h-3.5" />
                  Take Break
                </button>
              </div>
            )}

            {/* Resume from Break */}
            {today?.isOnBreak && (
              <button
                onClick={() => handleAction("break-end")}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-lg shadow-blue-600/20"
              >
                {actionLoading ? <Loader2 className="animate-spin w-3.5 h-3.5 mr-1" /> : <Play className="w-3.5 h-3.5 mr-1" />}
                Resume Work
              </button>
            )}

            {/* Check-Out Button */}
            {today?.checkInAt && !today?.checkOutAt && (
              <Button onClick={() => handleAction("check-out")} disabled={actionLoading} variant="danger">
                {actionLoading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Square className="w-4 h-4 mr-2" />}
                Check Out
              </Button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400">Target Progress ({formatMinutes(netMins)} / {formatMinutes(reqMins)})</span>
            <span className={`font-semibold ${netMins >= reqMins ? "text-emerald-400" : "text-indigo-400"}`}>
              {progressPercent}% Completed
            </span>
          </div>
          <div className="h-2.5 w-full bg-gray-900 rounded-full overflow-hidden border border-gray-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                netMins >= reqMins
                  ? "bg-gradient-to-r from-emerald-500 to-green-400"
                  : "bg-gradient-to-r from-indigo-500 to-blue-400"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="p-4 rounded-xl bg-gray-900/50 border border-gray-800 space-y-1">
            <span className="text-xs text-gray-400 uppercase tracking-wider">Required Target</span>
            <div className="text-xl font-bold text-white">
              {formatMinutes(reqMins)}
            </div>
            <p className="text-[11px] text-gray-500">Admin Assigned</p>
          </div>

          <div className="p-4 rounded-xl bg-gray-900/50 border border-gray-800 space-y-1">
            <span className="text-xs text-gray-400 uppercase tracking-wider">Net Worked Time</span>
            <div className="text-xl font-bold text-indigo-400 font-mono">
              {formatMinutes(netMins)}
            </div>
            <p className="text-[11px] text-gray-500">Gross - Unpaid Breaks</p>
          </div>

          <div className="p-4 rounded-xl bg-gray-900/50 border border-gray-800 space-y-1">
            <span className="text-xs text-gray-400 uppercase tracking-wider">Total Break Time</span>
            <div className="text-xl font-bold text-amber-400 font-mono">
              {formatMinutes(today?.breakMinutes || 0)}
            </div>
            <p className="text-[11px] text-gray-500">{today?.breaks?.length || 0} session(s) taken</p>
          </div>

          <div className="p-4 rounded-xl bg-gray-900/50 border border-gray-800 space-y-1">
            <span className="text-xs text-gray-400 uppercase tracking-wider">Shortfall / Remaining</span>
            <div className={`text-xl font-bold font-mono ${today?.remainingMinutes > 0 ? "text-orange-400" : "text-emerald-400"}`}>
              {today?.remainingMinutes > 0 ? formatMinutes(today.remainingMinutes) : "0h 0m (Met)"}
            </div>
            <p className="text-[11px] text-gray-500">Target balance</p>
          </div>

          <div className="p-4 rounded-xl bg-gray-900/50 border border-gray-800 space-y-1">
            <span className="text-xs text-gray-400 uppercase tracking-wider">Check In / Out</span>
            <div className="text-sm font-semibold text-gray-200 mt-1">
              {formatTime(today?.checkInAt)} → {formatTime(today?.checkOutAt)}
            </div>
            <p className="text-[11px] text-gray-500">
              {today?.isLate ? <span className="text-red-400">Late Check-in</span> : "On-time arrival"}
            </p>
          </div>
        </div>
      </Card>

      {/* History Table */}
      <Card className="p-6 bg-[#0a0a0c] border border-gray-800 rounded-2xl space-y-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-400" />
          <span>Attendance History & Work Logs</span>
        </h2>

        {records.length === 0 ? (
          <div className="text-sm text-gray-500 py-6 text-center">No attendance records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-gray-900/80 text-xs text-gray-400 uppercase tracking-wider border-b border-gray-800">
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
              <tbody className="divide-y divide-gray-800/60">
                {records.map((r: any) => (
                  <tr key={r.id} className="hover:bg-gray-900/40 transition-colors">
                    <td className="py-3 px-4 font-medium text-white">
                      {new Date(r.date).toLocaleDateString("en-IN", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs">
                      {r.checkInAt ? formatTime(r.checkInAt) : "—"}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs">
                      {r.checkOutAt ? formatTime(r.checkOutAt) : r.checkInAt ? "Active" : "—"}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-gray-400">
                      {formatMinutes(r.grossMinutes || r.workedMinutes)}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-amber-400">
                      {formatMinutes(r.breakMinutes || 0)}
                    </td>
                    <td className="py-3 px-4 text-indigo-300 font-semibold font-mono text-xs">
                      {formatMinutes(r.workedMinutes)}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-gray-400">
                      {formatMinutes(r.requiredMinutes)}
                    </td>
                    <td className={`py-3 px-4 font-semibold font-mono text-xs ${r.differenceMinutes >= 0 ? "text-emerald-400" : "text-orange-400"}`}>
                      {formatMinutes(r.differenceMinutes)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusColor(r.status)}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ============================================================ */}
      {/* REGULARIZATION MODAL */}
      {/* ============================================================ */}
      {regModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#111111] border border-white/10 rounded-2xl w-full max-w-lg flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#161a23]">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Attendance Regularization Request</h3>
              </div>
              <button
                onClick={() => setRegModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegularizeSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Target Date</label>
                <input
                  type="date"
                  required
                  value={regDate}
                  onChange={(e) => setRegDate(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Requested Check-In</label>
                  <input
                    type="time"
                    required
                    value={regCheckIn}
                    onChange={(e) => setRegCheckIn(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Requested Check-Out</label>
                  <input
                    type="time"
                    required
                    value={regCheckOut}
                    onChange={(e) => setRegCheckOut(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Reason for Regularization</label>
                <textarea
                  required
                  rows={3}
                  value={regReason}
                  onChange={(e) => setRegReason(e.target.value)}
                  placeholder="Explain why the punch was missed or hours were incomplete (e.g., Client meeting off-site, power failure, technical glitch)..."
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setRegModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={regLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20"
                >
                  {regLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <Send className="w-4 h-4" />}
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
