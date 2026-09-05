"use client";

import { useEffect, useState } from "react";
import { Clock, CheckCircle2, AlertTriangle, Plus, RefreshCw, X, Calendar, Phone, Mail, MessageSquare } from "lucide-react";

export default function FollowUpsPage() {
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Complete modal
  const [completeModalId, setCompleteModalId] = useState<string | null>(null);
  const [completionNotes, setCompletionNotes] = useState("");

  const loadFollowUps = async () => {
    setLoading(true);
    try {
      const url = statusFilter ? `/api/v1/crm/follow-ups?status=${statusFilter}` : "/api/v1/crm/follow-ups";
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) setFollowUps(data.data || []);
    } catch (e) {
      setFeedback({ type: "error", message: "Failed to load follow-ups." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadFollowUps(); }, [statusFilter]);

  const handleCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completeModalId) return;
    try {
      const res = await fetch(`/api/v1/crm/follow-ups/${completeModalId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completionNotes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to complete follow-up.");
      setCompleteModalId(null);
      setCompletionNotes("");
      setFeedback({ type: "success", message: "Follow-up marked as completed!" });
      loadFollowUps();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message });
    }
  };

  const overdue = followUps.filter(f => f.status === "OVERDUE").length;
  const upcoming = followUps.filter(f => f.status === "UPCOMING").length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">CRM Follow-Ups</h1>
          <p className="text-gray-400 mt-1 text-sm">Schedule, track and complete sales activities and client touchpoints.</p>
        </div>
        <button onClick={loadFollowUps} className="p-2.5 rounded-xl border border-white/10 bg-[#1a1a1a] text-gray-400 hover:text-white">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {feedback && (
        <div className={`p-4 rounded-xl border flex items-center justify-between text-sm ${feedback.type === "success" ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)}>✕</button>
        </div>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-4 flex items-center gap-3">
          <Clock className="w-5 h-5 text-blue-400" />
          <div>
            <p className="text-xl font-bold text-white">{upcoming}</p>
            <p className="text-xs text-gray-500">Upcoming Follow-Ups</p>
          </div>
        </div>
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <div>
            <p className="text-xl font-bold text-red-400">{overdue}</p>
            <p className="text-xs text-gray-500">Overdue Follow-Ups</p>
          </div>
        </div>
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-400" />
          <div>
            <p className="text-xl font-bold text-green-400">{followUps.filter(f => f.status === "COMPLETED").length}</p>
            <p className="text-xs text-gray-500">Completed Total</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {["", "UPCOMING", "OVERDUE", "COMPLETED"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              statusFilter === s ? "bg-red-600 border-red-600 text-white" : "border-white/10 bg-[#111111] text-gray-400 hover:text-white"
            }`}
          >
            {s || "All Follow-ups"}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-[#18181b] text-gray-300 text-xs uppercase font-semibold border-b border-white/10">
              <tr>
                <th className="px-5 py-3.5">Type</th>
                <th className="px-5 py-3.5">Target Lead / Client</th>
                <th className="px-5 py-3.5">Due Date & Time</th>
                <th className="px-5 py-3.5">Assigned To</th>
                <th className="px-5 py-3.5">Notes</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">Loading follow-ups...</td>
                </tr>
              ) : followUps.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">No follow-ups found.</td>
                </tr>
              ) : (
                followUps.map((f) => (
                  <tr key={f.id} className="hover:bg-white/[0.02]">
                    <td className="px-5 py-4 font-semibold text-white text-xs">{f.type}</td>
                    <td className="px-5 py-4">
                      {f.lead ? (
                        <div>
                          <p className="text-white font-medium text-xs">{f.lead.name}</p>
                          <p className="text-[10px] text-gray-500">{f.lead.companyName || f.lead.email}</p>
                        </div>
                      ) : f.opportunity ? (
                        <p className="text-white text-xs">{f.opportunity.name}</p>
                      ) : (
                        <span className="text-gray-500 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-gray-300">
                      {new Date(f.dueAt).toLocaleString("en-IN")}
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-300">{f.assignedTo?.name || "Unassigned"}</td>
                    <td className="px-5 py-4 text-xs text-gray-400 max-w-xs truncate" title={f.notes || ""}>{f.notes || "—"}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                          f.status === "COMPLETED"
                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                            : f.status === "OVERDUE"
                            ? "bg-red-500/10 text-red-400 border-red-500/20"
                            : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                        }`}
                      >
                        {f.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {f.status !== "COMPLETED" ? (
                        <button
                          onClick={() => { setCompleteModalId(f.id); setCompletionNotes(""); }}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors"
                        >
                          Complete
                        </button>
                      ) : (
                        <span className="text-gray-600 text-xs">Done</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Completion Notes Modal */}
      {completeModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-bold text-white">Mark Follow-Up Completed</h2>
            <form onSubmit={handleCompleteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Completion Notes / Outcome</label>
                <textarea
                  rows={3}
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="e.g. Discussed proposal with client, agreed to send revised quote..."
                  className="w-full bg-[#1e1e1e] border border-white/10 text-white text-xs rounded-xl p-3 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setCompleteModalId(null)} className="px-4 py-2 text-xs text-gray-400">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-xl">Save & Complete</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
