"use client";

import { useEffect, useState } from "react";
import { DollarSign, CheckCircle, XCircle, Plus, RefreshCw, AlertCircle, TrendingUp } from "lucide-react";

const STAGES = [
  { key: "QUALIFIED", name: "Qualified", color: "border-blue-500/40 text-blue-400" },
  { key: "DISCOVERY", name: "Discovery", color: "border-amber-500/40 text-amber-400" },
  { key: "PROPOSAL", name: "Proposal", color: "border-purple-500/40 text-purple-400" },
  { key: "NEGOTIATION", name: "Negotiation", color: "border-orange-500/40 text-orange-400" },
  { key: "WON", name: "Closed Won", color: "border-green-500/40 text-green-400" },
  { key: "LOST", name: "Closed Lost", color: "border-red-500/40 text-red-400" },
];

export default function PipelinePage() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Loss modal
  const [lossModalOpp, setLossModalOpp] = useState<any>(null);
  const [lossReason, setLossReason] = useState("");

  const loadPipeline = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/crm/opportunities?limit=100");
      const d = await res.json();
      if (res.ok) setOpportunities(d.data || []);
    } catch (e) {
      setFeedback({ type: "error", message: "Failed to load pipeline." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPipeline(); }, []);

  const moveStage = async (oppId: string, newStage: string) => {
    try {
      const res = await fetch(`/api/v1/crm/opportunities/${oppId}/stage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to change stage.");
      setFeedback({ type: "success", message: `Opportunity moved to ${newStage}` });
      loadPipeline();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message });
    }
  };

  const handleWin = async (oppId: string) => {
    try {
      const res = await fetch(`/api/v1/crm/opportunities/${oppId}/win`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to mark as Won.");
      setFeedback({ type: "success", message: "🎉 Deal Marked as Closed Won!" });
      loadPipeline();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message });
    }
  };

  const handleLossSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lossModalOpp || !lossReason.trim()) return;
    try {
      const res = await fetch(`/api/v1/crm/opportunities/${lossModalOpp.id}/loss`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lossReason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to mark as Lost.");
      setLossModalOpp(null);
      setLossReason("");
      setFeedback({ type: "success", message: "Deal marked as Closed Lost." });
      loadPipeline();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message });
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Sales Pipeline Board</h1>
          <p className="text-gray-400 mt-1 text-sm">Visual deal stage management, value estimation & closing workflow.</p>
        </div>
        <button onClick={loadPipeline} className="p-2.5 rounded-xl border border-white/10 bg-[#1a1a1a] text-gray-400 hover:text-white">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {feedback && (
        <div className={`p-4 rounded-xl border flex items-center justify-between text-sm ${feedback.type === "success" ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)}>✕</button>
        </div>
      )}

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto pb-4">
        {STAGES.map((s) => {
          const stageOpps = opportunities.filter((o) => o.stage === s.key);
          const stageTotal = stageOpps.reduce((sum, o) => sum + (o.value || 0), 0);

          return (
            <div key={s.key} className="bg-[#111111] border border-white/10 rounded-2xl p-4 min-w-[240px] flex flex-col h-[70vh]">
              {/* Stage Header */}
              <div className="pb-3 mb-3 border-b border-white/5">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold uppercase tracking-wider ${s.color}`}>{s.name}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/5 text-gray-300">
                    {stageOpps.length}
                  </span>
                </div>
                <p className="text-xs font-mono text-gray-400 mt-1 font-semibold">{formatCurrency(stageTotal)}</p>
              </div>

              {/* Cards Container */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {loading ? (
                  <div className="py-6 text-center text-xs text-gray-500">Loading...</div>
                ) : stageOpps.length === 0 ? (
                  <div className="py-8 text-center text-xs text-gray-600 border border-dashed border-white/5 rounded-xl">No deals</div>
                ) : (
                  stageOpps.map((opp) => (
                    <div key={opp.id} className="p-3.5 rounded-xl bg-[#18181b] border border-white/5 hover:border-white/20 transition-all space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-red-400 font-bold">{opp.opportunityCode}</span>
                        <span className="text-[10px] text-gray-500 font-mono">{opp.probability}% win prob</span>
                      </div>

                      <h3 className="text-xs font-semibold text-white truncate">{opp.name}</h3>

                      <div className="flex items-center justify-between text-xs font-mono text-green-400 font-bold">
                        <span>{formatCurrency(opp.value)}</span>
                      </div>

                      <p className="text-[10px] text-gray-400 truncate">
                        {opp.client?.companyName || opp.lead?.companyName || opp.lead?.name || "No Client"}
                      </p>

                      {/* Action buttons */}
                      {s.key !== "WON" && s.key !== "LOST" && (
                        <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-1">
                          <select
                            value={opp.stage}
                            onChange={(e) => moveStage(opp.id, e.target.value)}
                            className="bg-[#111111] border border-white/10 text-[10px] text-gray-300 rounded px-1.5 py-1 focus:outline-none"
                          >
                            {STAGES.map((st) => (
                              <option key={st.key} value={st.key}>{st.name}</option>
                            ))}
                          </select>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleWin(opp.id)}
                              title="Mark Won"
                              className="p-1 rounded bg-green-500/10 hover:bg-green-500/20 text-green-400 transition-colors"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => { setLossModalOpp(opp); setLossReason(""); }}
                              title="Mark Lost"
                              className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Loss Reason Modal */}
      {lossModalOpp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-bold text-white">Close Opportunity as Lost</h2>
            <p className="text-xs text-gray-400">Please provide a mandatory loss reason for audit traceability ({lossModalOpp.opportunityCode}).</p>

            <form onSubmit={handleLossSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Loss Reason <span className="text-red-500">*</span></label>
                <textarea
                  required
                  rows={3}
                  value={lossReason}
                  onChange={(e) => setLossReason(e.target.value)}
                  placeholder="e.g. Competitor won on price, Project deferred by client..."
                  className="w-full bg-[#1e1e1e] border border-white/10 text-white text-xs rounded-xl p-3 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setLossModalOpp(null)} className="px-4 py-2 text-xs text-gray-400">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl">Confirm Deal Lost</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
