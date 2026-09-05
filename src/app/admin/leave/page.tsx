"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";

export default function AdminLeavePage() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const loadLeaves = () => {
    setLoading(true);
    fetch("/api/v1/admin/leaves")
      .then(r => r.json())
      .then(d => { setLeaves(d.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { loadLeaves(); }, []);

  // FIX: was using .replace("d","") which turned "REJECTED" → "rejecte" (wrong)
  const handleAction = async (id: string, action: "approve" | "reject") => {
    setActionLoading(id + action);
    setFeedback(null);
    try {
      const res = await fetch(`/api/v1/admin/leaves/${id}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action === "reject" ? { reason: "Not approved at this time" } : {}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed");
      setFeedback({ type: "success", message: `Leave request ${action === "approve" ? "approved" : "rejected"} successfully.` });
      loadLeaves();
    } catch (e: any) {
      setFeedback({ type: "error", message: e.message || "Action failed" });
    }
    setActionLoading(null);
  };

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    APPROVED: "bg-green-500/10 text-green-400 border-green-500/20",
    REJECTED: "bg-red-500/10 text-red-400 border-red-500/20",
    CANCELLED: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  };

  const pending = leaves.filter(l => l.status === "PENDING").length;
  const approved = leaves.filter(l => l.status === "APPROVED").length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Leave Management</h1>
          <p className="text-gray-400 mt-1">Approve or reject employee leave requests.</p>
        </div>
        <button onClick={loadLeaves} className="p-2 rounded-xl border border-white/10 bg-[#1a1a1a] text-gray-400 hover:text-white transition-colors">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: "Pending", value: pending, color: "text-yellow-400", icon: Clock },
          { label: "Approved", value: approved, color: "text-green-400", icon: CheckCircle },
          { label: "Total", value: leaves.length, color: "text-white", icon: RefreshCw },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="bg-[#111111] border border-white/10 rounded-xl p-4 flex items-center gap-3">
            <Icon className={`w-5 h-5 ${color}`} />
            <div>
              <p className={`text-xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {feedback && (
        <div className={`p-3 rounded-xl border text-sm flex items-center gap-2 ${feedback.type === "success" ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
          {feedback.type === "success" ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {feedback.message}
        </div>
      )}

      <div className="bg-[#111111] border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-[#1a1a1a] text-gray-300 text-xs uppercase font-semibold border-b border-white/10">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">From</th>
                <th className="px-4 py-3">To</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="p-6 text-center text-gray-500">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-red-500" /> Loading...
                  </div>
                </td></tr>
              ) : leaves.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-500">No leave requests found.</td></tr>
              ) : (
                leaves.map(l => (
                  <tr key={l.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-white font-medium">{l.user?.name || "-"}</div>
                      <div className="text-xs text-gray-500">{l.user?.email || ""}</div>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-300">{l.leaveType}</td>
                    <td className="px-4 py-3">{new Date(l.startDate).toLocaleDateString("en-IN")}</td>
                    <td className="px-4 py-3">{new Date(l.endDate).toLocaleDateString("en-IN")}</td>
                    <td className="px-4 py-3 max-w-[200px] truncate" title={l.reason}>{l.reason}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[l.status] || ""}`}>{l.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      {l.status === "PENDING" ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAction(l.id, "approve")}
                            disabled={!!actionLoading}
                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1"
                          >
                            <CheckCircle className="w-3 h-3" /> Approve
                          </button>
                          <button
                            onClick={() => handleAction(l.id, "reject")}
                            disabled={!!actionLoading}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1"
                          >
                            <XCircle className="w-3 h-3" /> Reject
                          </button>
                        </div>
                      ) : <span className="text-gray-600 text-xs">No action needed</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
