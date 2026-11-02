"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Coffee,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  User,
  AlertTriangle,
  Loader2,
  X,
  ShieldCheck,
  Search,
  Filter,
  MessageSquare,
} from "lucide-react";

interface LeaveItem {
  id: string;
  leaveType?: string;
  type?: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason?: string | null;
  approverComment?: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    designation: string | null;
  };
}

export default function ManagerLeavePage() {
  const [leaves, setLeaves] = useState<LeaveItem[]>([]);
  const [departmentName, setDepartmentName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  // Action Modal
  const [selectedLeave, setSelectedLeave] = useState<LeaveItem | null>(null);
  const [actionType, setActionType] = useState<"APPROVE" | "REJECT" | null>(null);
  const [reviewComment, setReviewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/manager/leave");
      const json = await res.json();
      if (json.success) {
        setLeaves(json.leaves || []);
        setDepartmentName(json.department || "");
      } else {
        setError(json.message || "Failed to load leave requests.");
      }
    } catch (err: any) {
      setError(err.message || "Network error loading leave requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeave || !actionType) return;

    setSubmitting(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await fetch("/api/v1/manager/leave", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leaveId: selectedLeave.id,
          action: actionType,
          comment: reviewComment,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setActionSuccess(`Leave request successfully ${actionType.toLowerCase()}d.`);
        await fetchLeaves();
        setTimeout(() => {
          setSelectedLeave(null);
          setActionType(null);
          setReviewComment("");
          setActionSuccess(null);
        }, 1200);
      } else {
        setActionError(json.message || `Failed to ${actionType.toLowerCase()} leave request.`);
      }
    } catch (err: any) {
      setActionError(err.message || "Error processing leave request.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredLeaves = useMemo(() => {
    return leaves.filter((item) => {
      const matchesSearch =
        search.trim() === "" ||
        item.user.name.toLowerCase().includes(search.toLowerCase()) ||
        item.user.email.toLowerCase().includes(search.toLowerCase()) ||
        item.reason.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [leaves, search, statusFilter]);

  const pendingCount = leaves.filter((l) => l.status === "PENDING").length;
  const approvedCount = leaves.filter((l) => l.status === "APPROVED").length;
  const rejectedCount = leaves.filter((l) => l.status === "REJECTED").length;

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center space-y-3 shadow-xs">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
        <h3 className="text-sm font-bold text-slate-900">Loading Leave Requests...</h3>
        <p className="text-xs text-slate-500">Retrieving leave applications for your department.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md bg-indigo-600 text-white font-mono font-bold text-xs">
              {departmentName ? departmentName.slice(0, 4).toUpperCase() : "DEPT"}
            </span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Department Operations
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Leave Requests</h1>
          <p className="text-xs text-slate-600 mt-1">
            Review, approve, or reject absence and time-off requests submitted by {departmentName} personnel.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2">
          <Clock className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-bold text-indigo-950">
            {pendingCount} Pending Action{pendingCount === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      {/* Security Scope Notice */}
      <div className="p-4 rounded-xl bg-slate-100/80 border border-slate-200 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 leading-relaxed">
          <strong className="text-slate-800">Department Authorization Boundary:</strong> You possess approval authority exclusively over leave applications submitted by <span className="font-semibold text-indigo-700">{departmentName}</span> employees. Attempting to approve leaves of other department staff is rejected at the API boundary.
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Pending Review</span>
            <span className="text-2xl font-bold text-amber-600 mt-1 block">{pendingCount}</span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Requires manager action</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Approved</span>
            <span className="text-2xl font-bold text-emerald-600 mt-1 block">{approvedCount}</span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Authorized time off</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Rejected</span>
            <span className="text-2xl font-bold text-rose-600 mt-1 block">{rejectedCount}</span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Declined requests</span>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 text-rose-600">
            <XCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by employee name or reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="flex items-center gap-2">
          {["ALL", "PENDING", "APPROVED", "REJECTED"].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                statusFilter === tab
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab === "ALL" ? `All (${leaves.length})` : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Leave Cards */}
      {filteredLeaves.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-2">
          <Coffee className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No Leave Requests Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {search || statusFilter !== "ALL"
              ? "No leave requests match your search or filter."
              : `No leave applications currently submitted in ${departmentName}.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredLeaves.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-indigo-200 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                      {item.user.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-snug">
                        {item.user.name}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {item.user.designation || "Team Member"}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      item.status === "APPROVED"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : item.status === "REJECTED"
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2 mb-3 text-xs">
                  <div className="flex items-center justify-between text-slate-700 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                      <span>
                        {new Date(item.startDate).toLocaleDateString()} &rarr;{" "}
                        {new Date(item.endDate).toLocaleDateString()}
                      </span>
                    </span>
                    <span className="font-semibold text-slate-800">{item.leaveType || item.type}</span>
                  </div>

                  <div className="text-slate-600 text-xs leading-relaxed">
                    <strong className="text-slate-700">Reason:</strong> {item.reason}
                  </div>
                </div>

                {(item.rejectionReason || item.approverComment) && (
                  <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs text-indigo-950 mb-3">
                    <strong className="text-indigo-800 flex items-center gap-1 mb-1">
                      <MessageSquare className="w-3.5 h-3.5" />
                      Review Comment:
                    </strong>
                    <span>{item.rejectionReason || item.approverComment}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons for Pending Requests */}
              {item.status === "PENDING" && (
                <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setSelectedLeave(item);
                      setActionType("APPROVE");
                      setReviewComment("");
                      setActionError(null);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve Request</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedLeave(item);
                      setActionType("REJECT");
                      setReviewComment("");
                      setActionError(null);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 text-xs font-semibold transition-colors border border-slate-200 hover:border-rose-200"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject Request</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Review Action Confirmation Modal */}
      {selectedLeave && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div
                  className={`p-2 rounded-xl ${
                    actionType === "APPROVE"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-rose-50 text-rose-600"
                  }`}
                >
                  {actionType === "APPROVE" ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {actionType === "APPROVE" ? "Approve Leave Request" : "Reject Leave Request"}
                  </h3>
                  <p className="text-xs text-slate-500">Applicant: {selectedLeave.user.name}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedLeave(null);
                  setActionType(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                {actionSuccess}
              </div>
            )}

            {actionError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                {actionError}
              </div>
            )}

            <form onSubmit={handleAction} className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div>
                  <strong className="text-slate-700">Dates:</strong>{" "}
                  {new Date(selectedLeave.startDate).toLocaleDateString()} &rarr;{" "}
                  {new Date(selectedLeave.endDate).toLocaleDateString()}
                </div>
                <div>
                  <strong className="text-slate-700">Leave Type:</strong> {selectedLeave.leaveType || selectedLeave.type}
                </div>
                <div>
                  <strong className="text-slate-700">Reason:</strong> {selectedLeave.reason}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Manager Feedback / Notes {actionType === "REJECT" && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  rows={3}
                  required={actionType === "REJECT"}
                  placeholder={
                    actionType === "APPROVE"
                      ? "Optional instructions or approval remarks..."
                      : "Reason for rejection (required)..."
                  }
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedLeave(null);
                    setActionType(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs text-white ${
                    actionType === "APPROVE"
                      ? "bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50"
                      : "bg-rose-600 hover:bg-rose-500 disabled:opacity-50"
                  }`}
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Confirm {actionType === "APPROVE" ? "Approval" : "Rejection"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
