"use client";

import { toast } from "@/lib/notifications/toast";
import { getErrorMessage, parseApiResponse } from "@/lib/errors/client";

import { useState, useEffect, useCallback } from "react";
import {
  Check,
  X,
  CreditCard,
  Clock,
  AlertTriangle,
  AlertCircle,
  Building,
  Smartphone,
  CheckCircle2,
  Filter,
  Loader2,
  RefreshCw,
  Search,
} from "lucide-react";

interface AdminCommission {
  id: string;
  partnerProjectId: string;
  brokerProfileId: string;
  projectValue: number;
  commissionType: string;
  commissionRate: number | null;
  commissionAmount: number;
  currency: string;
  status: "PENDING" | "ELIGIBLE" | "REQUESTED" | "PROCESSING" | "APPROVED" | "PAID" | "REJECTED" | "CANCELLED";
  eligibleAt: string | null;
  approvedAt: string | null;
  paidAt: string | null;
  payoutReference: string | null;
  payoutRequestedAt: string | null;
  payoutDueAt: string | null;
  payoutMethod: string | null;
  payoutDetails: any;
  payoutNotes: string | null;
  rejectionReason: string | null;
  createdAt: string;
  slaStatus: "HEALTHY" | "WARNING" | "BREACHED" | "SETTLED" | "N_A";
  hoursRemaining: number | null;
  hoursElapsed: number | null;
  partnerProject?: { projectCode: string; projectName: string };
  brokerProfile?: { user: { name: string; email: string } };
  commissionRule?: { name: string };
}

export default function AdminCommissions() {
  const [commissions, setCommissions] = useState<AdminCommission[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Settlement Modal state
  const [settlingCommission, setSettlingCommission] = useState<AdminCommission | null>(null);
  const [payoutUtr, setPayoutUtr] = useState("");
  const [settlementNotes, setSettlementNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Rejection Modal state
  const [rejectingCommission, setRejectingCommission] = useState<AdminCommission | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const fetchCommissions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch("/api/v1/admin/commissions");
      if (!res.ok) throw new Error("Failed to load commissions.");
      const data = await res.json();
      setCommissions(data.data || []);
    } catch (e: any) {
      setError(e.message || "Error loading commissions.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCommissions();
  }, [fetchCommissions]);

  const handleSimpleAction = async (id: string, action: string, notes?: string) => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/v1/admin/commissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, notes }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(getErrorMessage(data) || "Action failed.");
      }
      fetchCommissions();
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const submitSettlement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settlingCommission) return;

    if (!payoutUtr.trim()) {
      setActionError("Bank Transaction Reference (UTR) is strictly required for settlement.");
      return;
    }

    try {
      setActionLoading(true);
      setActionError(null);
      const res = await fetch(`/api/v1/admin/commissions/${settlingCommission.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "pay",
          payoutReference: payoutUtr.trim(),
          notes: settlementNotes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(getErrorMessage(data) || "Failed to mark as paid.");
      }

      setSettlingCommission(null);
      setPayoutUtr("");
      setSettlementNotes("");
      fetchCommissions();
    } catch (err: any) {
      setActionError(err.message || "Settlement failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const submitRejection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingCommission) return;

    if (!rejectionReason.trim()) {
      setActionError("Please provide a reason for rejecting the payout request.");
      return;
    }

    try {
      setActionLoading(true);
      setActionError(null);
      const res = await fetch(`/api/v1/admin/commissions/${rejectingCommission.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reject",
          rejectionReason: rejectionReason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(getErrorMessage(data) || "Failed to reject payout request.");
      }

      setRejectingCommission(null);
      setRejectionReason("");
      fetchCommissions();
    } catch (err: any) {
      setActionError(err.message || "Rejection failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredCommissions = commissions.filter((c) => {
    if (filterStatus !== "ALL" && c.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const brokerName = c.brokerProfile?.user?.name?.toLowerCase() || "";
      const brokerEmail = c.brokerProfile?.user?.email?.toLowerCase() || "";
      const projCode = c.partnerProject?.projectCode?.toLowerCase() || "";
      const projName = c.partnerProject?.projectName?.toLowerCase() || "";
      const utr = c.payoutReference?.toLowerCase() || "";
      return brokerName.includes(q) || brokerEmail.includes(q) || projCode.includes(q) || projName.includes(q) || utr.includes(q);
    }
    return true;
  });

  const requestedCount = commissions.filter((c) => c.status === "REQUESTED").length;
  const breachedCount = commissions.filter((c) => c.slaStatus === "BREACHED").length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Commissions & Payout Administration</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Audit partner commissions, process payout requests, enforce 48h SLAs, and settle disbursements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {breachedCount > 0 && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-1.5 rounded-lg text-xs font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{breachedCount} SLA Breached</span>
            </div>
          )}
          {requestedCount > 0 && (
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-1.5 rounded-lg text-xs font-bold">
              <Clock className="w-4 h-4 shrink-0" />
              <span>{requestedCount} Payout Requests Pending Review</span>
            </div>
          )}
          <button
            onClick={fetchCommissions}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-medium border border-white/10 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#111] p-4 rounded-xl border border-white/10">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-gray-400" />
          <div className="flex flex-wrap gap-1.5">
            {["ALL", "REQUESTED", "PROCESSING", "APPROVED", "ELIGIBLE", "PAID", "REJECTED"].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  filterStatus === st
                    ? "bg-emerald-600 text-white"
                    : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" />
          <input
            type="text"
            placeholder="Search broker, project, or UTR..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#111] rounded-xl border border-white/10 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
            <p className="text-sm">Loading commission ledger...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-white/[0.03] text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <tr>
                  <th className="p-4">Broker / Partner</th>
                  <th className="p-4">Project</th>
                  <th className="p-4">Commission</th>
                  <th className="p-4">Payout Method & Details</th>
                  <th className="p-4">Status & SLA</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredCommissions.map((c) => {
                  const details = c.payoutDetails;
                  return (
                    <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <div className="font-semibold text-white">{c.brokerProfile?.user?.name || "Partner"}</div>
                        <div className="text-xs text-gray-500">{c.brokerProfile?.user?.email}</div>
                      </td>

                      <td className="p-4">
                        <div className="font-medium text-gray-200">{c.partnerProject?.projectName}</div>
                        <div className="text-xs text-gray-500 font-mono mt-0.5">{c.partnerProject?.projectCode}</div>
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-emerald-400 text-base">₹{c.commissionAmount?.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">
                          {c.commissionRule?.name || "Standard"} ({c.commissionRate || 10}%)
                        </div>
                      </td>

                      <td className="p-4 text-xs">
                        {c.payoutMethod === "BANK_TRANSFER" && details ? (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 text-gray-300 font-medium">
                              <Building className="w-3.5 h-3.5 text-blue-400" />
                              <span>{details.bankName || "Bank Transfer"}</span>
                            </div>
                            <div className="text-gray-400">A/C: {details.accountNumber}</div>
                            <div className="text-gray-400 font-mono text-[11px]">IFSC: {details.ifsc}</div>
                            <div className="text-gray-500">Name: {details.accountHolder}</div>
                          </div>
                        ) : c.payoutMethod === "UPI" && details ? (
                          <div className="flex items-center gap-1.5 text-gray-300">
                            <Smartphone className="w-3.5 h-3.5 text-purple-400" />
                            <span className="font-mono text-xs">{details.upiId}</span>
                          </div>
                        ) : (
                          <span className="text-gray-600 italic">No payout requested yet</span>
                        )}

                        {c.payoutReference && (
                          <div className="mt-1 text-emerald-400 font-mono text-[11px]">
                            UTR: {c.payoutReference}
                          </div>
                        )}
                      </td>

                      <td className="p-4">
                        <div className="space-y-1.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                              c.status === "PAID"
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                : c.status === "REQUESTED"
                                ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                                : c.status === "PROCESSING" || c.status === "APPROVED"
                                ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                                : c.status === "ELIGIBLE"
                                ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                                : "bg-red-500/10 border-red-500/20 text-red-400"
                            }`}
                          >
                            {c.status}
                          </span>

                          {/* Live 48h SLA Tracking Badges */}
                          {c.slaStatus === "BREACHED" && (
                            <div className="flex items-center gap-1 text-[11px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                              <AlertTriangle className="w-3 h-3 shrink-0" />
                              <span>SLA BREACHED ({c.hoursElapsed}h elapsed)</span>
                            </div>
                          )}

                          {c.slaStatus === "WARNING" && (
                            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                              <Clock className="w-3 h-3 shrink-0" />
                              <span>SLA Warning ({c.hoursRemaining}h left)</span>
                            </div>
                          )}

                          {c.slaStatus === "HEALTHY" && (
                            <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              <Clock className="w-3 h-3 shrink-0" />
                              <span>SLA Healthy ({c.hoursRemaining}h left)</span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {c.status === "REQUESTED" && (
                            <>
                              <button
                                onClick={() => handleSimpleAction(c.id, "process")}
                                className="px-2.5 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 rounded-lg text-xs font-semibold transition"
                                title="Acknowledge and mark Processing"
                              >
                                Process
                              </button>
                              <button
                                onClick={() => {
                                  setSettlingCommission(c);
                                  setPayoutUtr("");
                                  setActionError(null);
                                }}
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                                title="Settle and Mark Paid (Enter UTR)"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                                <span>Settle</span>
                              </button>
                              <button
                                onClick={() => {
                                  setRejectingCommission(c);
                                  setRejectionReason("");
                                  setActionError(null);
                                }}
                                className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs transition"
                                title="Reject Payout Request"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {(c.status === "PROCESSING" || c.status === "APPROVED") && (
                            <button
                              onClick={() => {
                                setSettlingCommission(c);
                                setPayoutUtr("");
                                setActionError(null);
                              }}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Confirm Settlement</span>
                            </button>
                          )}

                          {c.status === "PAID" && (
                            <span className="text-xs text-emerald-400 flex items-center gap-1 justify-end font-medium">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Settled</span>
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredCommissions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-gray-500">
                      No matching commission records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Settle Commission / Enter UTR Modal */}
      {settlingCommission && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setSettlingCommission(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-xl font-bold text-white">Confirm Payout Settlement</h2>
              <p className="text-xs text-gray-400 mt-1">
                Settling payout for <span className="text-white font-semibold">{settlingCommission.brokerProfile?.user?.name}</span>
              </p>
            </div>

            {actionError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Commission Amount:</span>
                <span className="font-bold text-emerald-400 text-sm">
                  ₹{settlingCommission.commissionAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Destination:</span>
                <span className="text-white font-mono">
                  {settlingCommission.payoutMethod === "BANK_TRANSFER"
                    ? `A/C ${settlingCommission.payoutDetails?.accountNumber} (${settlingCommission.payoutDetails?.ifsc})`
                    : settlingCommission.payoutDetails?.upiId || "N/A"}
                </span>
              </div>
            </div>

            <form onSubmit={submitSettlement} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                  Settlement Bank Reference (UTR) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AXIV260212345678"
                  value={payoutUtr}
                  onChange={(e) => setPayoutUtr(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm text-white uppercase placeholder-gray-600 focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Verified corporate bank settlement transaction number is mandatory.
                </p>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Settlement Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. Paid via Corporate Net Banking"
                  value={settlementNotes}
                  onChange={(e) => setSettlementNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSettlingCommission(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition flex items-center gap-2"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Confirm Settlement</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Payout Request Modal */}
      {rejectingCommission && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setRejectingCommission(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-xl font-bold text-white">Reject Payout Request</h2>
              <p className="text-xs text-gray-400 mt-1">
                Provide a reason so the broker can correct account details and re-request.
              </p>
            </div>

            {actionError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <form onSubmit={submitRejection} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                  Rejection Reason *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Incorrect bank account number or invalid IFSC code."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingCommission(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition flex items-center gap-2"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                  <span>Reject Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
