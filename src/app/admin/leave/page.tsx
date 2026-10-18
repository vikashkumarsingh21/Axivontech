"use client";

import { useEffect, useState, useCallback } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Search,
  Filter,
  Calendar,
  AlertCircle,
  X,
  User,
  FileText,
} from "lucide-react";

interface LeaveItem {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    department?: string | null;
    designation?: string | null;
  };
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  APPROVED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  REJECTED: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  CANCELLED: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

export default function AdminLeavePage() {
  const [leaves, setLeaves] = useState<LeaveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  // Reject modal
  const [rejectModalItem, setRejectModalItem] = useState<LeaveItem | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const loadLeaves = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (typeFilter !== "ALL") params.set("leaveType", typeFilter);
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/v1/admin/leaves?${params.toString()}`);
      const data = await res.json();
      setLeaves(data.leaves || data.data || []);
    } catch {
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, search]);

  useEffect(() => {
    loadLeaves();
  }, [loadLeaves]);

  const handleApprove = async (id: string) => {
    setActionLoading(id + "approve");
    setFeedback(null);
    try {
      const res = await fetch(`/api/v1/admin/leaves/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Approval failed");
      setFeedback({ type: "success", message: "Leave request approved successfully." });
      loadLeaves();
    } catch (e: any) {
      setFeedback({ type: "error", message: e.message || "Approval failed" });
    } finally {
      setActionLoading(null);
    }
  };

  const openRejectModal = (item: LeaveItem) => {
    setRejectModalItem(item);
    setRejectReason("");
  };

  const handleConfirmReject = async () => {
    if (!rejectModalItem) return;
    setActionLoading(rejectModalItem.id + "reject");
    setFeedback(null);
    try {
      const res = await fetch(`/api/v1/admin/leaves/${rejectModalItem.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Rejection failed");
      setFeedback({ type: "success", message: "Leave request rejected." });
      setRejectModalItem(null);
      loadLeaves();
    } catch (e: any) {
      setFeedback({ type: "error", message: e.message || "Rejection failed" });
    } finally {
      setActionLoading(null);
    }
  };

  const pending = leaves.filter((l) => l.status === "PENDING").length;
  const approved = leaves.filter((l) => l.status === "APPROVED").length;
  const rejected = leaves.filter((l) => l.status === "REJECTED").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-emerald-400" /> Leave Management
          </h1>
          <p className="text-[#7E8997] text-sm mt-1">Review, approve, and track employee leave requests with automated notification workflows.</p>
        </div>
        <button
          onClick={loadLeaves}
          className="p-2.5 rounded-xl border border-[#29313B] bg-[#151A21] text-[#7E8997] hover:text-[#F3F5F7] hover:bg-[#1B222B] transition-colors"
          title="Refresh Leaves"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald-400" : ""}`} />
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Pending Review", value: pending, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", icon: Clock },
          { label: "Approved Leaves", value: approved, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle },
          { label: "Rejected Requests", value: rejected, color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20", icon: XCircle },
          { label: "Total In View", value: leaves.length, color: "text-[#F3F5F7]", bg: "bg-[#151A21] border-[#29313B]", icon: FileText },
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

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-sm flex items-center justify-between gap-2 ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/20 text-rose-400"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            {feedback.message}
          </div>
          <button onClick={() => setFeedback(null)} className="text-inherit hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#151A21] border border-[#29313B] p-3 rounded-2xl">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#566171]" />
          <input
            type="text"
            placeholder="Search employee, email, department, or reason…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#10151B] border border-[#29313B] rounded-xl text-xs text-[#F3F5F7] placeholder-[#566171] focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-[#10151B] p-1 rounded-xl border border-[#29313B]">
            {["ALL", "PENDING", "APPROVED", "REJECTED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  statusFilter === st ? "bg-[#1B222B] text-emerald-400 border border-[#29313B]" : "text-[#7E8997] hover:text-[#F3F5F7]"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Leave Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 bg-[#10151B] border border-[#29313B] rounded-xl text-xs text-[#F3F5F7] focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Types</option>
            <option value="SICK">Sick Leave</option>
            <option value="CASUAL">Casual Leave</option>
            <option value="ANNUAL">Annual Leave</option>
            <option value="UNPAID">Unpaid Leave</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#151A21] border border-[#29313B] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#A7B0BC]">
            <thead className="bg-[#10151B] text-[#7E8997] text-[11px] uppercase font-bold tracking-wider border-b border-[#29313B]">
              <tr>
                <th className="px-5 py-3.5">Employee</th>
                <th className="px-5 py-3.5">Leave Type</th>
                <th className="px-5 py-3.5">Dates / Duration</th>
                <th className="px-5 py-3.5">Reason</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2530]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#7E8997]">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" /> Loading leave requests…
                    </div>
                  </td>
                </tr>
              ) : leaves.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-[#566171]">
                    <Calendar className="w-8 h-8 mx-auto mb-2 text-[#3B4554]" />
                    No leave requests match the current filters.
                  </td>
                </tr>
              ) : (
                leaves.map((l) => (
                  <tr key={l.id} className="hover:bg-[#1B222B]/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                          {l.user?.name ? l.user.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div>
                          <div className="text-[#F3F5F7] font-semibold">{l.user?.name || "Unknown"}</div>
                          <div className="text-[11px] text-[#566171]">
                            {l.user?.department || "Staff"} · {l.user?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-[#F3F5F7]">{l.leaveType}</td>
                    <td className="px-5 py-4">
                      <div className="text-[#F3F5F7] font-medium">
                        {new Date(l.startDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })} —{" "}
                        {new Date(l.endDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                      </div>
                      <div className="text-[11px] text-[#566171]">
                        Requested {new Date(l.createdAt).toLocaleDateString("en-IN")}
                      </div>
                    </td>
                    <td className="px-5 py-4 max-w-xs truncate text-[#A7B0BC]" title={l.reason}>
                      {l.reason}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${STATUS_COLORS[l.status] || ""}`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {l.status === "PENDING" ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleApprove(l.id)}
                            disabled={!!actionLoading}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1 shadow-sm"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => openRejectModal(l)}
                            disabled={!!actionLoading}
                            className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[#566171] text-xs">Processed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModalItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#151A21] border border-[#29313B] rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#29313B]">
              <div className="flex items-center gap-2 text-rose-400">
                <XCircle className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Reject Leave Request</h3>
              </div>
              <button onClick={() => setRejectModalItem(null)} className="text-[#7E8997] hover:text-[#F3F5F7]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#A7B0BC] mb-4">
              Rejecting leave for <strong className="text-white">{rejectModalItem.user?.name}</strong> (
              {new Date(rejectModalItem.startDate).toLocaleDateString()} to {new Date(rejectModalItem.endDate).toLocaleDateString()}).
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#7E8997] mb-1">Reason for Rejection (sent to employee)</label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Critical project delivery deadline requires all hands this week…"
                  className="w-full px-3 py-2 bg-[#10151B] border border-[#29313B] rounded-xl text-xs text-[#F3F5F7] placeholder-[#566171] focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setRejectModalItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-[#7E8997] hover:text-[#F3F5F7] hover:bg-[#1B222B]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReject}
                  disabled={actionLoading === rejectModalItem.id + "reject"}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
