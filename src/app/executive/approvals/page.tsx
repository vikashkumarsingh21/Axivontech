"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Check, X } from "lucide-react";

export default function GovernanceApprovalsPage() {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetch("/api/v1/executive/approvals")
      .then((r) => r.json())
      .then((d) => {
        setApprovals(d.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAction = async (id: string, action: "approve" | "reject") => {
    await fetch("/api/v1/executive/approvals/" + id + "/" + action, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: action === "reject" ? JSON.stringify({ reason: "Rejected by executive review" }) : undefined,
    });
    load();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white tracking-tight">Governance & Approvals Engine</h1>
      <p className="text-gray-400 text-sm">Privileged access sign-off and approval queue.</p>

      <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-[#18181b] text-gray-300 text-xs uppercase font-semibold border-b border-white/10">
            <tr>
              <th className="px-5 py-3.5">Request Type</th>
              <th className="px-5 py-3.5">Requester</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5">Decided By</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td colSpan={5} className="p-6 text-center">Loading approvals...</td></tr>
            ) : approvals.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center">No governance requests found.</td></tr>
            ) : (
              approvals.map((a) => (
                <tr key={a.id} className="hover:bg-white/[0.02]">
                  <td className="px-5 py-4 font-mono text-xs text-amber-400">{a.requestType}</td>
                  <td className="px-5 py-4 text-white">{a.requestedBy?.name || "System"}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${a.status === "APPROVED" ? "bg-green-500/10 text-green-400" : a.status === "REJECTED" ? "bg-red-500/10 text-red-400" : "bg-yellow-500/10 text-yellow-400"}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">{a.decidedBy?.name || "-"}</td>
                  <td className="px-5 py-4 text-right">
                    {a.status === "PENDING" && (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleAction(a.id, "approve")} className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors">Approve</button>
                        <button onClick={() => handleAction(a.id, "reject")} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-colors">Reject</button>
                      </div>
                    )}
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
