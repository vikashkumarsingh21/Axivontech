"use client";

import { useEffect, useState } from "react";
import { FileText, Plus, RefreshCw, Send, CheckCircle2, AlertCircle, X } from "lucide-react";

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [form, setForm] = useState({
    opportunityId: "",
    title: "",
    amount: "",
    validUntil: "",
    documentReference: "",
  });

  const loadProposals = async () => {
    setLoading(true);
    try {
      const [pRes, oRes] = await Promise.all([
        fetch("/api/v1/crm/proposals"),
        fetch("/api/v1/crm/opportunities?limit=100"),
      ]);
      if (pRes.ok) {
        const d = await pRes.json();
        setProposals(d.data || []);
      }
      if (oRes.ok) {
        const d = await oRes.json();
        setOpportunities(d.data || []);
      }
    } catch (e) {
      setFeedback({ type: "error", message: "Failed to load proposals." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProposals(); }, []);

  const handleSend = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/crm/proposals/${id}/send`, { method: "POST" });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed to send proposal.");
      setFeedback({ type: "success", message: "Proposal marked as SENT and opportunity stage updated!" });
      loadProposals();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message });
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/crm/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed to create proposal.");
      setIsAddOpen(false);
      setFeedback({ type: "success", message: `Proposal ${d.data.proposalNumber} created successfully.` });
      loadProposals();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Proposals</h1>
          <p className="text-gray-400 mt-1 text-sm">Commercial proposals, pricing documents & client send tracking.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadProposals} className="p-2.5 rounded-xl border border-white/10 bg-[#1a1a1a] text-gray-400 hover:text-white">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => {
              setForm({ opportunityId: "", title: "", amount: "", validUntil: "", documentReference: "" });
              setIsAddOpen(true);
            }}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-red-600/20"
          >
            <Plus className="w-4 h-4" /> Create Proposal
          </button>
        </div>
      </div>

      {feedback && (
        <div className={`p-4 rounded-xl border flex items-center justify-between text-sm ${feedback.type === "success" ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)}>✕</button>
        </div>
      )}

      <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-[#18181b] text-gray-300 text-xs uppercase font-semibold border-b border-white/10">
              <tr>
                <th className="px-5 py-3.5">Proposal #</th>
                <th className="px-5 py-3.5">Title</th>
                <th className="px-5 py-3.5">Opportunity</th>
                <th className="px-5 py-3.5">Amount</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">Loading proposals...</td></tr>
              ) : proposals.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">No proposals created yet.</td></tr>
              ) : (
                proposals.map((p) => (
                  <tr key={p.id} className="hover:bg-white/[0.02]">
                    <td className="px-5 py-4 font-mono text-xs text-purple-400 font-bold">{p.proposalNumber}</td>
                    <td className="px-5 py-4 font-semibold text-white">{p.title}</td>
                    <td className="px-5 py-4 text-xs text-gray-300">{p.opportunity?.name || "—"}</td>
                    <td className="px-5 py-4 font-mono text-xs text-green-400 font-bold">₹{p.amount}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${p.status === "SENT" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-gray-500/10 text-gray-400 border-gray-500/20"}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {p.status === "DRAFT" ? (
                        <button
                          onClick={() => handleSend(p.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
                        >
                          <Send className="w-3 h-3" /> Send Proposal
                        </button>
                      ) : (
                        <span className="text-gray-500 text-xs">Sent on {new Date(p.sentAt).toLocaleDateString()}</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <h2 className="text-lg font-bold text-white">Create New Proposal</h2>
              <button onClick={() => setIsAddOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Opportunity <span className="text-red-500">*</span></label>
                <select
                  required
                  value={form.opportunityId}
                  onChange={(e) => setForm({ ...form, opportunityId: e.target.value })}
                  className="w-full bg-[#1e1e1e] border border-white/10 text-white text-xs rounded-xl p-2.5"
                >
                  <option value="">Select Opportunity...</option>
                  {opportunities.map((o: any) => (
                    <option key={o.id} value={o.id}>{o.opportunityCode} — {o.name} (₹{o.value})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Proposal Title <span className="text-red-500">*</span></label>
                <input required type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Commercial Proposal v1" className="w-full bg-[#1e1e1e] border border-white/10 text-white text-xs rounded-xl p-2.5" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Amount (INR) <span className="text-red-500">*</span></label>
                  <input required type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="500000" className="w-full bg-[#1e1e1e] border border-white/10 text-white text-xs rounded-xl p-2.5" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Valid Until</label>
                  <input type="date" value={form.validUntil} onChange={e => setForm({ ...form, validUntil: e.target.value })} className="w-full bg-[#1e1e1e] border border-white/10 text-white text-xs rounded-xl p-2.5" />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 text-xs text-gray-400">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-red-600 text-white text-xs rounded-xl font-semibold">Create Proposal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
