"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loader2, CheckCircle2, Clock, Calendar, AlertCircle } from "lucide-react";

function formatMinutes(mins: number): string {
  const isNegative = mins < 0;
  const abs = Math.abs(mins);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  const str = `${h}h ${m}m`;
  return isNegative ? `-${str}` : str;
}

export default function AttendancePage() {
  const [today, setToday] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const loadData = () => {
    setLoading(true);
    fetch("/api/v1/employee/attendance")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setToday(data.today);
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
      if (today?.isWorking) {
        setToday((prev: any) => {
          if (!prev || !prev.checkInAt) return prev;
          const elapsed = Math.floor((Date.now() - new Date(prev.checkInAt).getTime()) / 60000);
          return { ...prev, currentWorkingMinutes: elapsed };
        });
      }
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (action: "check-in" | "check-out") => {
    setActionLoading(true);
    setError("");
    try {
      const res = await fetch("/api/v1/employee/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, notes: "" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed");
      loadData();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-gray-400 gap-3">
        <Loader2 className="animate-spin w-5 h-5 text-indigo-400" />
        <span>Loading attendance details...</span>
      </div>
    );
  }

  const statusColor = (status: string) => {
    switch (status) {
      case "COMPLETE":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "IN_PROGRESS":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "INCOMPLETE":
        return "bg-orange-500/10 text-orange-400 border-orange-500/30";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Attendance & Work Hours</h1>
        <p className="text-sm text-gray-400 mt-1">Track your daily work duration and attendance records</p>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Today Summary Card */}
      <Card className="p-6 bg-[#0a0a0c] border border-gray-800 rounded-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              <span>Today's Work Summary</span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full border ${statusColor(today?.status)}`}
            >
              {today?.status || "NOT_STARTED"}
            </span>

            {!today?.isWorking && today?.status !== "COMPLETE" && (
              <Button onClick={() => handleAction("check-in")} disabled={actionLoading}>
                {actionLoading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                Check In
              </Button>
            )}

            {today?.isWorking && (
              <Button onClick={() => handleAction("check-out")} disabled={actionLoading} variant="danger">
                {actionLoading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Clock className="w-4 h-4 mr-2" />}
                Check Out
              </Button>
            )}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-gray-900/50 border border-gray-800 space-y-1">
            <span className="text-xs text-gray-400 uppercase tracking-wider">Required Hours</span>
            <div className="text-xl font-bold text-white">
              {formatMinutes(today?.requiredMinutes || 480)}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gray-900/50 border border-gray-800 space-y-1">
            <span className="text-xs text-gray-400 uppercase tracking-wider">Worked Hours</span>
            <div className="text-xl font-bold text-indigo-400">
              {formatMinutes(today?.workedMinutes || 0)}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gray-900/50 border border-gray-800 space-y-1">
            <span className="text-xs text-gray-400 uppercase tracking-wider">Remaining Hours</span>
            <div className="text-xl font-bold text-amber-400">
              {formatMinutes(today?.remainingMinutes || 0)}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gray-900/50 border border-gray-800 space-y-1">
            <span className="text-xs text-gray-400 uppercase tracking-wider">Check In Time</span>
            <div className="text-xl font-bold text-gray-200">
              {today?.checkInAt ? new Date(today.checkInAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--"}
            </div>
          </div>
        </div>
      </Card>

      {/* History Table */}
      <Card className="p-6 bg-[#0a0a0c] border border-gray-800 rounded-2xl space-y-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-400" />
          <span>Attendance History</span>
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
                  <th className="py-3 px-4">Worked</th>
                  <th className="py-3 px-4">Required</th>
                  <th className="py-3 px-4">Difference</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {records.map((r: any) => (
                  <tr key={r.id} className="hover:bg-gray-900/40 transition-colors">
                    <td className="py-3 px-4 font-medium text-white">
                      {new Date(r.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      {r.checkInAt ? new Date(r.checkInAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-"}
                    </td>
                    <td className="py-3 px-4">
                      {r.checkOutAt ? new Date(r.checkOutAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Active"}
                    </td>
                    <td className="py-3 px-4 text-indigo-300 font-semibold">
                      {formatMinutes(r.workedMinutes)}
                    </td>
                    <td className="py-3 px-4">{formatMinutes(r.requiredMinutes)}</td>
                    <td className={`py-3 px-4 font-semibold ${r.differenceMinutes >= 0 ? "text-emerald-400" : "text-orange-400"}`}>
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
    </div>
  );
}
