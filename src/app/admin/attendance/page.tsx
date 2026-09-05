"use client";

import { useEffect, useState, useCallback } from "react";
import { RefreshCw, Clock, CheckCircle2, XCircle, AlertCircle, Users } from "lucide-react";

function fmt(mins: number) {
  const h = Math.floor(Math.abs(mins) / 60);
  const m = Math.abs(mins) % 60;
  const sign = mins < 0 ? "-" : "+";
  return `${mins < 0 ? sign : ""}${h}h ${m}m`;
}

function fmtTime(dt: string | null) {
  if (!dt) return "—";
  return new Date(dt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

const STATUS_COLORS: Record<string, string> = {
  COMPLETE: "bg-green-500/10 text-green-400 border-green-500/20",
  IN_PROGRESS: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  INCOMPLETE: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  ABSENT: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function AdminAttendancePage() {
  const [records, setRecords] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split("T")[0]);
  const [deptFilter, setDeptFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateFilter) params.set("date", dateFilter);
      if (deptFilter) params.set("department", deptFilter);
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/v1/admin/attendance?${params.toString()}`);
      const data = await res.json();
      setRecords(data.data || []);
      setSummary(data.summary || null);
    } catch (e) {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [dateFilter, deptFilter, statusFilter]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Attendance</h1>
          <p className="text-gray-400 mt-1">Monitor employee check-in/out and work hours.</p>
        </div>
        <button onClick={load} className="p-2 rounded-xl border border-white/10 bg-[#1a1a1a] text-gray-400 hover:text-white transition-colors">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: "Total", value: summary.totalEmployees, icon: Users, color: "text-white" },
            { label: "Working", value: summary.currentlyWorking, icon: Clock, color: "text-blue-400" },
            { label: "Complete", value: summary.completedToday, icon: CheckCircle2, color: "text-green-400" },
            { label: "Incomplete", value: summary.incompleteToday, icon: AlertCircle, color: "text-orange-400" },
            { label: "Absent", value: summary.absentToday, icon: XCircle, color: "text-red-400" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-[#111111] border border-white/10 rounded-xl p-4 flex items-center gap-3">
              <Icon className={`w-5 h-5 ${color}`} />
              <div>
                <p className={`text-xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="bg-[#111111] border border-white/10 rounded-xl p-4 flex flex-wrap gap-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Date</label>
          <input
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className="bg-[#1a1a1a] border border-white/10 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-red-500/50"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Department</label>
          <input
            type="text"
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value)}
            placeholder="Filter by dept..."
            className="bg-[#1a1a1a] border border-white/10 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-red-500/50"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Status</label>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-[#1a1a1a] border border-white/10 text-gray-300 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-red-500/50"
          >
            <option value="">All</option>
            <option value="IN_PROGRESS">Working Now</option>
            <option value="COMPLETE">Complete</option>
            <option value="INCOMPLETE">Incomplete</option>
            <option value="ABSENT">Absent</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#111111] border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-[#1a1a1a] text-gray-300 text-xs uppercase font-semibold border-b border-white/10">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Check In</th>
                <th className="px-4 py-3">Check Out</th>
                <th className="px-4 py-3">Worked</th>
                <th className="px-4 py-3">Required</th>
                <th className="px-4 py-3">Difference</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="p-6 text-center text-gray-500">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-red-500" /> Loading attendance data...
                  </div>
                </td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={8} className="p-8 text-center text-gray-500">No attendance records found for the selected filters.</td></tr>
              ) : (
                records.map((r, i) => {
                  const worked = r.workedMinutes || 0;
                  const req = r.requiredMinutes || 480;
                  const diff = worked - req;
                  return (
                    <tr key={r.userId || i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <div className="text-white font-medium">{r.employeeName}</div>
                        <div className="text-xs text-gray-500">{r.employeeCode || r.employeeEmail}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-300">{r.department || "—"}</td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {r.checkInAt ? (
                          <span className="text-green-400">{fmtTime(r.checkInAt)}</span>
                        ) : <span className="text-gray-600">Not checked in</span>}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {r.checkOutAt ? (
                          <span className="text-blue-400">{fmtTime(r.checkOutAt)}</span>
                        ) : r.checkInAt ? (
                          <span className="text-yellow-400 animate-pulse">● Working</span>
                        ) : <span className="text-gray-600">—</span>}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-white">{fmt(worked).replace(/^[+-]/, "")}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-400">{fmt(req).replace(/^[+-]/, "")}</td>
                      <td className="px-4 py-3 font-mono text-xs">
                        <span className={diff >= 0 ? "text-green-400" : "text-red-400"}>
                          {diff >= 0 ? "+" : ""}{fmt(diff)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[r.status] || "bg-gray-500/10 text-gray-400 border-gray-500/20"}`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
