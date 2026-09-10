"use client";

import { useEffect, useState, useCallback } from "react";
import {
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Users,
  Search,
  Calendar,
  Eye,
  X,
  ChevronRight,
  Loader2,
  Coffee,
  Settings,
  FileCheck,
  Mail,
  Check,
  Building2,
  Sliders,
} from "lucide-react";
import { useSearchParams } from "next/navigation";

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
  HALF_DAY: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  ABSENT: "bg-red-500/10 text-red-400 border-red-500/20",
  ON_LEAVE: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  HOLIDAY: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  WEEKLY_OFF: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

export default function AdminAttendancePage() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";

  const [activeTab, setActiveTab] = useState<"monitor" | "regularizations" | "policy">("monitor");
  const [records, setRecords] = useState<any[]>([]);
  const [policy, setPolicy] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split("T")[0]);
  const [search, setSearch] = useState(initialSearch);
  const [deptFilter, setDeptFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // History modal state
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [employeeHistory, setEmployeeHistory] = useState<any[]>([]);
  const [historyStats, setHistoryStats] = useState<any>(null);

  // Regularization queue state
  const [regRequests, setRegRequests] = useState<any[]>([]);
  const [regLoading, setRegLoading] = useState(false);
  const [regActionLoading, setRegActionLoading] = useState<string | null>(null);

  // Policy form state
  const [policyForm, setPolicyForm] = useState({
    workWindowStart: "08:00",
    workWindowEnd: "19:00",
    defaultRequiredMinutes: 480,
    graceMinutes: 15,
    cutoffTime: "19:00",
    enableIncompleteAlerts: true,
  });
  const [policySaving, setPolicySaving] = useState(false);
  const [policySavedMsg, setPolicySavedMsg] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateFilter) params.set("date", dateFilter);
      if (deptFilter) params.set("department", deptFilter);
      if (statusFilter) params.set("status", statusFilter);
      if (search) params.set("search", search);

      const res = await fetch(`/api/v1/admin/attendance?${params.toString()}`);
      const data = await res.json();
      setRecords(data.data || []);
      setSummary(data.summary || null);
      if (data.policy) {
        setPolicy(data.policy);
        setPolicyForm({
          workWindowStart: data.policy.workWindowStart || "08:00",
          workWindowEnd: data.policy.workWindowEnd || "19:00",
          defaultRequiredMinutes: data.policy.defaultRequiredMinutes || 480,
          graceMinutes: data.policy.graceMinutes ?? 15,
          cutoffTime: data.policy.cutoffTime || "19:00",
          enableIncompleteAlerts: data.policy.enableIncompleteAlerts ?? true,
        });
      }
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [dateFilter, deptFilter, statusFilter, search]);

  const loadRegularizations = async () => {
    setRegLoading(true);
    try {
      const res = await fetch("/api/v1/admin/attendance/regularize");
      const data = await res.json();
      setRegRequests(data.data || []);
    } catch {
      setRegRequests([]);
    } finally {
      setRegLoading(false);
    }
  };

  useEffect(() => {
    load();
    loadRegularizations();
  }, [load]);

  const viewEmployeeHistory = async (emp: any) => {
    setSelectedEmployee(emp);
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/attendance?employeeId=${emp.userId}&history=true`);
      const data = await res.json();
      setEmployeeHistory(data.history || []);
      setHistoryStats(data.stats || null);
    } catch {
      setEmployeeHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleRegularizeAction = async (requestId: string, action: "APPROVED" | "REJECTED") => {
    setRegActionLoading(requestId);
    try {
      const res = await fetch("/api/v1/admin/attendance/regularize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action, reviewNotes: `Decision: ${action} by Admin` }),
      });
      if (res.ok) {
        await loadRegularizations();
        await load();
      }
    } finally {
      setRegActionLoading(null);
    }
  };

  const handleSavePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    setPolicySaving(true);
    setPolicySavedMsg("");
    try {
      const res = await fetch("/api/v1/admin/attendance/policies", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(policyForm),
      });
      const data = await res.json();
      if (data.success) {
        setPolicySavedMsg("Attendance policy configuration updated successfully");
        setPolicy(data.policy);
        load();
      }
    } finally {
      setPolicySaving(false);
    }
  };

  const setQuickDate = (type: "today" | "yesterday") => {
    const d = new Date();
    if (type === "yesterday") d.setDate(d.getDate() - 1);
    setDateFilter(d.toISOString().split("T")[0]);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Clock className="w-6 h-6 text-green-500" /> Remote Attendance & Work Hours Center
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Company work window ({policy?.workWindowStart || "08:00 AM"} → {policy?.workWindowEnd || "07:00 PM"}), net hours calculations, break tracking, and automated cutoff alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Navigation Tabs */}
          <div className="flex bg-[#111111] border border-white/10 p-1 rounded-xl gap-1">
            <button
              onClick={() => setActiveTab("monitor")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "monitor" ? "bg-green-600 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              Live Monitor
            </button>
            <button
              onClick={() => setActiveTab("regularizations")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
                activeTab === "regularizations" ? "bg-green-600 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              Regularization
              {regRequests.filter((r) => r.status === "PENDING").length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 bg-red-500 text-white rounded-full text-[10px]">
                  {regRequests.filter((r) => r.status === "PENDING").length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("policy")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "policy" ? "bg-green-600 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              Policy Settings
            </button>
          </div>

          <button
            onClick={load}
            className="p-2 rounded-lg border border-white/10 bg-[#1a1a1a] text-gray-400 hover:text-white transition-colors"
            title="Refresh attendance data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-green-500" : ""}`} />
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: LIVE ATTENDANCE MONITOR */}
      {/* ============================================================ */}
      {activeTab === "monitor" && (
        <div className="space-y-6">
          {/* Summary Stats */}
          {summary && (
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
              {[
                { label: "Total Workforce", value: summary.totalEmployees, icon: Users, color: "text-white", bg: "bg-white/5" },
                { label: "Working Live", value: summary.currentlyWorking, icon: Clock, color: "text-blue-400", bg: "bg-blue-500/10" },
                { label: "On Break", value: summary.currentlyOnBreak, icon: Coffee, color: "text-amber-400", bg: "bg-amber-500/10" },
                { label: "Hours Completed", value: summary.completedToday, icon: CheckCircle2, color: "text-green-400", bg: "bg-green-500/10" },
                { label: "Under Target", value: summary.incompleteToday, icon: AlertCircle, color: "text-orange-400", bg: "bg-orange-500/10" },
                { label: "Not Checked In", value: summary.absentToday, icon: XCircle, color: "text-red-400", bg: "bg-red-500/10" },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className="bg-[#111111] border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${bg} shrink-0`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div>
                    <p className={`text-xl font-bold ${color}`}>{value}</p>
                    <p className="text-[11px] text-gray-400">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Filters Bar */}
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search employee by name, email, or ID..."
                className="w-full bg-[#1a1a1a] border border-white/10 text-white text-sm rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-green-500/50"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 bg-[#1a1a1a] border border-white/10 rounded-xl p-1">
                <button
                  onClick={() => setQuickDate("today")}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                    dateFilter === new Date().toISOString().split("T")[0]
                      ? "bg-green-600 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => setQuickDate("yesterday")}
                  className="px-2.5 py-1 text-xs text-gray-400 hover:text-white rounded-lg font-medium transition-all"
                >
                  Yesterday
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="bg-[#1a1a1a] border border-white/10 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-green-500/50"
                />
              </div>

              <input
                type="text"
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                placeholder="Department..."
                className="w-32 bg-[#1a1a1a] border border-white/10 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-green-500/50"
              />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#1a1a1a] border border-white/10 text-gray-300 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-green-500/50"
              >
                <option value="">All Statuses</option>
                <option value="COMPLETE">Complete</option>
                <option value="INCOMPLETE">Incomplete</option>
                <option value="HALF_DAY">Half Day</option>
                <option value="ABSENT">Absent / Not Checked In</option>
                <option value="ON_LEAVE">On Leave</option>
              </select>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-400">
                <thead className="bg-[#18181b] text-gray-300 text-xs uppercase font-semibold border-b border-white/10">
                  <tr>
                    <th className="px-5 py-3.5">Employee</th>
                    <th className="px-5 py-3.5">Check In / Out</th>
                    <th className="px-5 py-3.5">Gross Time</th>
                    <th className="px-5 py-3.5">Breaks</th>
                    <th className="px-5 py-3.5">Net Worked</th>
                    <th className="px-5 py-3.5">Daily Target</th>
                    <th className="px-5 py-3.5">Net Difference</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Alert Sent</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr>
                      <td colSpan={10} className="p-8 text-center text-gray-500">
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin text-green-500" />
                          Loading live attendance data...
                        </div>
                      </td>
                    </tr>
                  ) : records.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-12 text-center text-gray-500">
                        No attendance records found for the selected date and filters.
                      </td>
                    </tr>
                  ) : (
                    records.map((r, i) => {
                      const worked = r.workedMinutes || 0;
                      const req = r.requiredMinutes || 480;
                      const diff = worked - req;
                      return (
                        <tr
                          key={r.userId || i}
                          className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                          onClick={() => viewEmployeeHistory(r)}
                        >
                          <td className="px-5 py-4">
                            <div className="text-white font-medium group-hover:text-green-400 transition-colors">
                              {r.employeeName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {r.employeeCode ? `ID: ${r.employeeCode} • ` : ""}
                              {r.department || "General"}
                            </div>
                          </td>
                          <td className="px-5 py-4 font-mono text-xs">
                            <div>
                              {r.checkInAt ? (
                                <span className="text-green-400 font-semibold">{fmtTime(r.checkInAt)}</span>
                              ) : (
                                <span className="text-gray-600">Not checked in</span>
                              )}
                              <span className="text-gray-600"> → </span>
                              {r.checkOutAt ? (
                                <span className="text-blue-400 font-semibold">{fmtTime(r.checkOutAt)}</span>
                              ) : r.checkInAt ? (
                                <span className="text-amber-400 font-semibold">Working</span>
                              ) : (
                                <span className="text-gray-600">—</span>
                              )}
                            </div>
                            {r.isLate && (
                              <span className="text-[10px] text-red-400 block mt-0.5">Late ({r.lateMinutes}m)</span>
                            )}
                          </td>
                          <td className="px-5 py-4 font-mono text-xs text-gray-400">
                            {fmt(r.grossMinutes || worked).replace(/^[+-]/, "")}
                          </td>
                          <td className="px-5 py-4 font-mono text-xs text-amber-400">
                            {fmt(r.breakMinutes || 0).replace(/^[+-]/, "")}
                          </td>
                          <td className="px-5 py-4 font-mono text-xs text-white font-bold">
                            {fmt(worked).replace(/^[+-]/, "")}
                          </td>
                          <td className="px-5 py-4 font-mono text-xs text-gray-400">
                            {fmt(req).replace(/^[+-]/, "")}
                          </td>
                          <td className="px-5 py-4 font-mono text-xs font-semibold">
                            <span className={diff >= 0 ? "text-green-400" : "text-red-400"}>
                              {diff >= 0 ? "+" : ""}
                              {fmt(diff)}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                                STATUS_COLORS[r.status] || "bg-gray-500/10 text-gray-400 border-gray-500/20"
                              }`}
                            >
                              {r.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-xs font-mono">
                            {r.emailAlertSent ? (
                              <span className="inline-flex items-center gap-1 text-emerald-400">
                                <Mail className="w-3.5 h-3.5" /> Sent
                              </span>
                            ) : (
                              <span className="text-gray-600">—</span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                viewEmployeeHistory(r);
                              }}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/10 bg-[#1a1a1a] hover:bg-green-600 hover:border-green-600 text-gray-300 hover:text-white text-xs font-medium transition-all"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>History</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
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
      )}

      {/* ============================================================ */}
      {/* TAB 2: REGULARIZATION REQUESTS REVIEW QUEUE */}
      {/* ============================================================ */}
      {activeTab === "regularizations" && (
        <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden shadow-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-indigo-400" />
                <span>Employee Regularization Requests</span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Review missed punches, field duties, and duration correction submissions.
              </p>
            </div>
            <button
              onClick={loadRegularizations}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold"
            >
              Refresh Queue
            </button>
          </div>

          {regLoading ? (
            <div className="flex items-center justify-center p-12 text-gray-400 gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-green-500" />
              <span>Loading regularization requests...</span>
            </div>
          ) : regRequests.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm">
              No regularization requests submitted yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-[#18181b] text-xs uppercase font-semibold text-gray-400 border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Target Date</th>
                    <th className="py-3 px-4">Requested Punch</th>
                    <th className="py-3 px-4">Employee Reason</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Review Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {regRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-white/[0.02]">
                      <td className="py-3.5 px-4 font-medium text-white">
                        <div>{req.user.name}</div>
                        <div className="text-xs text-gray-500">{req.user.email}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs">
                        {new Date(req.date).toLocaleDateString("en-IN", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs">
                        <span className="text-green-400">{fmtTime(req.requestedCheckIn)}</span>
                        <span> → </span>
                        <span className="text-blue-400">{fmtTime(req.requestedCheckOut)}</span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-gray-300 max-w-xs">
                        {req.reason}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            req.status === "APPROVED"
                              ? "bg-green-500/10 text-green-400 border-green-500/20"
                              : req.status === "REJECTED"
                              ? "bg-red-500/10 text-red-400 border-red-500/20"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {req.status === "PENDING" ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleRegularizeAction(req.id, "APPROVED")}
                              disabled={regActionLoading === req.id}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleRegularizeAction(req.id, "REJECTED")}
                              disabled={regActionLoading === req.id}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-lg shadow-red-600/20"
                            >
                              <X className="w-3.5 h-3.5" />
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">
                            Reviewed {req.reviewedBy ? `by ${req.reviewedBy.name}` : ""}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: ATTENDANCE POLICY CONFIGURATION */}
      {/* ============================================================ */}
      {activeTab === "policy" && (
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 max-w-3xl space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-green-500" />
              <span>Company Attendance Policy & Work Window</span>
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Configure organizational remote work windows, default hours targets, and automated incomplete alerts.
            </p>
          </div>

          {policySavedMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{policySavedMsg}</span>
            </div>
          )}

          <form onSubmit={handleSavePolicy} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Company Work Window Start (Default: 08:00 AM)
                </label>
                <input
                  type="text"
                  required
                  value={policyForm.workWindowStart}
                  onChange={(e) => setPolicyForm({ ...policyForm, workWindowStart: e.target.value })}
                  placeholder="08:00"
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Company Work Window End (Default: 07:00 PM)
                </label>
                <input
                  type="text"
                  required
                  value={policyForm.workWindowEnd}
                  onChange={(e) => setPolicyForm({ ...policyForm, workWindowEnd: e.target.value })}
                  placeholder="19:00"
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Default Required Daily Minutes (e.g. 480 = 8 Hours)
                </label>
                <input
                  type="number"
                  required
                  value={policyForm.defaultRequiredMinutes}
                  onChange={(e) => setPolicyForm({ ...policyForm, defaultRequiredMinutes: Number(e.target.value) })}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Arrival Grace Period (Minutes)
                </label>
                <input
                  type="number"
                  required
                  value={policyForm.graceMinutes}
                  onChange={(e) => setPolicyForm({ ...policyForm, graceMinutes: Number(e.target.value) })}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="enableIncompleteAlerts"
                checked={policyForm.enableIncompleteAlerts}
                onChange={(e) => setPolicyForm({ ...policyForm, enableIncompleteAlerts: e.target.checked })}
                className="w-4 h-4 rounded border-gray-700 text-green-600 focus:ring-green-500"
              />
              <label htmlFor="enableIncompleteAlerts" className="text-xs text-gray-300">
                Enable automated 07:00 PM cutoff email notification for incomplete required working hours
              </label>
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end">
              <button
                type="submit"
                disabled={policySaving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white text-xs font-semibold shadow-lg shadow-green-600/20"
              >
                {policySaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Save Policy Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================ */}
      {/* EMPLOYEE FULL ATTENDANCE HISTORY MODAL */}
      {/* ============================================================ */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#111111] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#161a23]">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white">{selectedEmployee.employeeName}</h2>
                  <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/10 text-green-400 border border-green-500/20">
                    Detailed Attendance Log
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {selectedEmployee.employeeEmail} • Target: {fmt(selectedEmployee.requiredMinutes || 480).replace(/^[+-]/, "")}/day
                </p>
              </div>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Stats Bar */}
            {historyStats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-6 border-b border-white/5 bg-[#0a0a0c]">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-xs text-gray-400">Total Recorded Days</p>
                  <p className="text-lg font-bold text-white">{historyStats.totalDays} Days</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-xs text-gray-400">Total Net Worked</p>
                  <p className="text-lg font-bold text-green-400 font-mono">{fmt(historyStats.totalWorkedMinutes).replace(/^[+-]/, "")}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-xs text-gray-400">Total Break Time</p>
                  <p className="text-lg font-bold text-amber-400 font-mono">{fmt(historyStats.totalBreakMinutes || 0).replace(/^[+-]/, "")}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-xs text-gray-400">Target Met Days</p>
                  <p className="text-lg font-bold text-blue-400">{historyStats.totalCompletedDays} Days</p>
                </div>
              </div>
            )}

            {/* Modal Table Container */}
            <div className="flex-1 overflow-y-auto p-6">
              {historyLoading ? (
                <div className="flex items-center justify-center p-12 text-gray-400 gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-green-500" />
                  <span>Loading full attendance history...</span>
                </div>
              ) : employeeHistory.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No attendance history records logged for this employee yet.
                </div>
              ) : (
                <table className="w-full text-left text-sm text-gray-300">
                  <thead className="bg-gray-900/80 text-xs text-gray-400 uppercase tracking-wider border-b border-gray-800">
                    <tr>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Check In / Out</th>
                      <th className="py-3 px-4">Gross</th>
                      <th className="py-3 px-4">Breaks</th>
                      <th className="py-3 px-4">Net Worked</th>
                      <th className="py-3 px-4">Target</th>
                      <th className="py-3 px-4">Difference</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60">
                    {employeeHistory.map((h: any) => (
                      <tr key={h.id} className="hover:bg-gray-900/40 transition-colors">
                        <td className="py-3 px-4 font-medium text-white">
                          {new Date(h.date).toLocaleDateString("en-IN", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="py-3 px-4 font-mono text-xs">
                          {h.checkInAt ? fmtTime(h.checkInAt) : "—"} → {h.checkOutAt ? fmtTime(h.checkOutAt) : "—"}
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-gray-400">
                          {fmt(h.grossMinutes || h.workedMinutes).replace(/^[+-]/, "")}
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-amber-400">
                          {fmt(h.breakMinutes || 0).replace(/^[+-]/, "")}
                        </td>
                        <td className="py-3 px-4 font-mono text-xs font-bold text-white">
                          {fmt(h.workedMinutes).replace(/^[+-]/, "")}
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-gray-400">
                          {fmt(h.requiredMinutes).replace(/^[+-]/, "")}
                        </td>
                        <td className="py-3 px-4 font-mono text-xs font-semibold">
                          <span className={h.differenceMinutes >= 0 ? "text-green-400" : "text-red-400"}>
                            {h.differenceMinutes >= 0 ? "+" : ""}
                            {fmt(h.differenceMinutes)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                              STATUS_COLORS[h.status] || "bg-gray-500/10 text-gray-400 border-gray-500/20"
                            }`}
                          >
                            {h.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-white/10 bg-[#161a23] flex justify-end">
              <button
                onClick={() => setSelectedEmployee(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
