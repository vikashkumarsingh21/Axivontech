"use client";

import { useEffect, useState } from "react";

export default function AdminLeavePage() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadLeaves = () => {
    setLoading(true);
    fetch("/api/v1/admin/leaves")
      .then(r => r.json())
      .then(d => { setLeaves(d.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { loadLeaves(); }, []);

  const handleAction = async (id: string, action: "APPROVED" | "REJECTED") => {
    setActionLoading(id);
    try {
      await fetch("/api/v1/admin/leaves/" + id + "/" + action.toLowerCase().replace("d", ""), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: action === "REJECTED" ? "Not approved at this time" : undefined }),
      });
      loadLeaves();
    } catch (e) {}
    setActionLoading(null);
  };

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-500/10 text-yellow-400",
    APPROVED: "bg-green-500/10 text-green-400",
    REJECTED: "bg-red-500/10 text-red-400",
    CANCELLED: "bg-gray-500/10 text-gray-400",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white tracking-tight">Leave Management</h1>
      <p className="text-gray-400">Approve or reject employee leave requests.</p>

      <div className="bg-[#111111] border border-white/10 rounded-xl overflow-hidden">
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
              <tr><td colSpan={7} className="p-4 text-center">Loading...</td></tr>
            ) : leaves.length === 0 ? (
              <tr><td colSpan={7} className="p-4 text-center">No leave requests found.</td></tr>
            ) : (
              leaves.map(l => (
                <tr key={l.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3 text-white font-medium">{l.user?.name || "-"}</td>
                  <td className="px-4 py-3">{l.leaveType}</td>
                  <td className="px-4 py-3">{new Date(l.startDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{new Date(l.endDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 max-w-xs truncate">{l.reason}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${statusColors[l.status] || ""}`}>{l.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    {l.status === "PENDING" ? (
                      <div className="flex gap-2">
                        <button onClick={() => handleAction(l.id, "APPROVED")} disabled={actionLoading === l.id}
                          className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors disabled:opacity-50">
                          Approve
                        </button>
                        <button onClick={() => handleAction(l.id, "REJECTED")} disabled={actionLoading === l.id}
                          className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors disabled:opacity-50">
                          Reject
                        </button>
                      </div>
                    ) : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
