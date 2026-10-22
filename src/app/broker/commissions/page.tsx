"use client";

import { useState, useEffect, useCallback } from "react";
import {
  IndianRupee,
  Clock,
  CheckCircle,
  Wallet,
  ArrowUpRight,
  Building,
  Smartphone,
  AlertCircle,
  X,
  Loader2,
  FileText,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";

interface Commission {
  id: string;
  partnerProjectId: string;
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
  updatedAt: string;
  partnerProject?: { projectCode: string; projectName: string };
  commissionRule?: { name: string; type: string; value: number };
}

interface CommissionStats {
  total: number;
  eligible: number;
  requested: number;
  processing: number;
  paid: number;
}

export default function BrokerCommissions() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [stats, setStats] = useState<CommissionStats>({ total: 0, eligible: 0, requested: 0, processing: 0, paid: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Payout Request Modal
  const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null);
  const [payoutMethod, setPayoutMethod] = useState<"BANK_TRANSFER" | "UPI">("BANK_TRANSFER");
  const [bankDetails, setBankDetails] = useState({
    accountHolder: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifsc: "",
    bankName: "",
  });
  const [upiId, setUpiId] = useState("");
  const [notes, setNotes] = useState("");
  const [submittingPayout, setSubmittingPayout] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Settlement Details Modal
  const [settledCommission, setSettledCommission] = useState<Commission | null>(null);

  const fetchCommissions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch("/api/v1/broker/commissions");
      if (!res.ok) throw new Error("Failed to load commissions data");
      const d = await res.json();
      setCommissions(d.data || []);
      setStats({
        total: d.stats?.total || 0,
        eligible: d.stats?.eligible || 0,
        requested: d.stats?.requested || 0,
        processing: d.stats?.processing || 0,
        paid: d.stats?.paid || 0,
      });
    } catch (e: any) {
      setError(e.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCommissions();
  }, [fetchCommissions]);

  const openPayoutModal = (comm: Commission) => {
    setSelectedCommission(comm);
    setModalError(null);
    setSuccessMessage(null);
    setPayoutMethod("BANK_TRANSFER");
    setBankDetails({
      accountHolder: "",
      accountNumber: "",
      confirmAccountNumber: "",
      ifsc: "",
      bankName: "",
    });
    setUpiId("");
    setNotes("");
  };

  const handlePayoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCommission) return;

    setModalError(null);

    let payoutDetailsPayload: any = {};
    if (payoutMethod === "BANK_TRANSFER") {
      if (!bankDetails.accountHolder.trim()) {
        setModalError("Please enter account holder name.");
        return;
      }
      if (!bankDetails.accountNumber.trim()) {
        setModalError("Please enter bank account number.");
        return;
      }
      if (bankDetails.accountNumber !== bankDetails.confirmAccountNumber) {
        setModalError("Account numbers do not match.");
        return;
      }
      if (!bankDetails.ifsc.trim()) {
        setModalError("Please enter bank IFSC code.");
        return;
      }
      const ifscClean = bankDetails.ifsc.trim().toUpperCase();
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscClean)) {
        setModalError("Invalid IFSC code format (e.g. HDFC0001234).");
        return;
      }
      payoutDetailsPayload = {
        accountHolder: bankDetails.accountHolder.trim(),
        accountNumber: bankDetails.accountNumber.trim(),
        ifsc: ifscClean,
        bankName: bankDetails.bankName.trim() || undefined,
      };
    } else {
      if (!upiId.trim() || !upiId.includes("@")) {
        setModalError("Please enter a valid UPI ID (e.g., username@okhdfcbank).");
        return;
      }
      payoutDetailsPayload = {
        upiId: upiId.trim(),
      };
    }

    try {
      setSubmittingPayout(true);
      const res = await fetch("/api/v1/broker/commissions/payout-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commissionId: selectedCommission.id,
          payoutMethod,
          payoutDetails: payoutDetailsPayload,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit payout request.");
      }

      setSuccessMessage("Payout request submitted successfully! Axivon Finance SLA is 48 business hours.");
      fetchCommissions();
      setTimeout(() => {
        setSelectedCommission(null);
      }, 2000);
    } catch (err: any) {
      setModalError(err.message || "Failed to submit payout request.");
    } finally {
      setSubmittingPayout(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center p-8 space-y-4">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="text-gray-400 text-sm">Loading verified commissions & payouts...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Title & Payout SLA Notice */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Commission & Payout Management</h1>
          <p className="text-gray-400 text-sm mt-1">
            Track referral earnings, submit payout requests, and monitor 48h settlement SLAs.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3.5 py-2 rounded-xl text-xs font-semibold">
          <Clock className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>Payout SLA: 48 Business Hours from Request</span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#111] p-5 rounded-xl border border-white/10">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Total Generated</p>
              <h3 className="text-xl font-bold text-white mt-0.5">₹{stats.total.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        <div className="bg-[#111] p-5 rounded-xl border border-white/10">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Ready for Payout</p>
              <h3 className="text-xl font-bold text-amber-400 mt-0.5">₹{stats.eligible.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        <div className="bg-[#111] p-5 rounded-xl border border-white/10">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400">In 48h Review</p>
              <h3 className="text-xl font-bold text-indigo-400 mt-0.5">₹{(stats.requested + stats.processing).toLocaleString()}</h3>
            </div>
          </div>
        </div>

        <div className="bg-[#111] p-5 rounded-xl border border-white/10">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Settled & Paid</p>
              <h3 className="text-xl font-bold text-emerald-400 mt-0.5">₹{stats.paid.toLocaleString()}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Commission Ledger Table */}
      <div className="bg-[#111] rounded-xl border border-white/10 overflow-hidden">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Commission & Payout History</h3>
            <p className="text-xs text-gray-500 mt-0.5">Verified commission records earned on referred client contracts.</p>
          </div>
          <button
            onClick={fetchCommissions}
            className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 transition"
          >
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.03] text-xs font-semibold text-gray-400 uppercase tracking-wider">
              <tr>
                <th className="p-4">Project</th>
                <th className="p-4">Contract Value</th>
                <th className="p-4">Commission</th>
                <th className="p-4">Status & SLA</th>
                <th className="p-4">Dates</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {commissions.map((comm) => {
                const isEligible = comm.status === "ELIGIBLE" || comm.status === "REJECTED";
                const isRequested = comm.status === "REQUESTED";
                const isProcessing = comm.status === "PROCESSING" || comm.status === "APPROVED";
                const isPaid = comm.status === "PAID";

                return (
                  <tr key={comm.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-white">{comm.partnerProject?.projectName || "Direct Project"}</div>
                      <div className="text-xs text-gray-500 font-mono mt-0.5">{comm.partnerProject?.projectCode}</div>
                    </td>

                    <td className="p-4">
                      <div className="font-medium text-gray-200">₹{comm.projectValue?.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">
                        {comm.commissionRule?.name || "Standard Rule"} ({comm.commissionRate || 10}%)
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="text-base font-bold text-emerald-400">
                        ₹{comm.commissionAmount?.toLocaleString()}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="space-y-1">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                            isPaid
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                              : isProcessing
                              ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                              : isRequested
                              ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                              : comm.status === "ELIGIBLE"
                              ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                              : comm.status === "REJECTED"
                              ? "bg-red-500/10 border-red-500/20 text-red-400"
                              : "bg-gray-500/10 border-gray-500/20 text-gray-400"
                          }`}
                        >
                          {isPaid && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {isRequested && <Clock className="w-3.5 h-3.5" />}
                          {comm.status === "ELIGIBLE" && "READY FOR PAYOUT"}
                          {comm.status === "REQUESTED" && "UNDER 48H REVIEW"}
                          {comm.status === "PROCESSING" && "SETTLEMENT IN PROGRESS"}
                          {comm.status === "APPROVED" && "SETTLEMENT APPROVED"}
                          {comm.status === "PAID" && "SETTLED"}
                          {comm.status === "REJECTED" && "PAYOUT REJECTED"}
                          {comm.status === "PENDING" && "PENDING VERIFICATION"}
                        </span>

                        {isRequested && comm.payoutDueAt && (
                          <div className="text-[11px] text-gray-400 flex items-center gap-1">
                            <span>SLA Due:</span>
                            <span className="font-mono text-gray-300">
                              {new Date(comm.payoutDueAt).toLocaleDateString()} {new Date(comm.payoutDueAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        )}

                        {comm.status === "REJECTED" && comm.rejectionReason && (
                          <div className="text-[11px] text-red-400 font-medium">
                            Reason: {comm.rejectionReason}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="p-4 text-xs text-gray-400">
                      <div>Earned: {new Date(comm.createdAt).toLocaleDateString()}</div>
                      {comm.paidAt && (
                        <div className="text-emerald-400 mt-0.5">
                          Paid: {new Date(comm.paidAt).toLocaleDateString()}
                        </div>
                      )}
                    </td>

                    <td className="p-4 text-right">
                      {isEligible && (
                        <button
                          onClick={() => openPayoutModal(comm)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-sm"
                        >
                          <span>Request Payout</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {isPaid && (
                        <button
                          onClick={() => setSettledCommission(comm)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-medium border border-white/10 transition"
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-400" />
                          <span>View Settlement</span>
                        </button>
                      )}

                      {(isRequested || isProcessing) && (
                        <span className="text-xs text-gray-500 italic">Processing under 48h SLA</span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {commissions.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-500">
                    <p className="text-sm">No commission records found.</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Commissions become eligible when referred clients execute contracts and advance payments are verified.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payout Request Modal */}
      {selectedCommission && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setSelectedCommission(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Direct Settlement</span>
              </div>
              <h2 className="text-xl font-bold text-white">Request Commission Payout</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Eligible Amount: <span className="text-emerald-400 font-bold text-sm">₹{selectedCommission.commissionAmount.toLocaleString()}</span> for {selectedCommission.partnerProject?.projectCode}
              </p>
            </div>

            {modalError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handlePayoutSubmit} className="space-y-4">
              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Payout Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPayoutMethod("BANK_TRANSFER")}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition ${
                      payoutMethod === "BANK_TRANSFER"
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                        : "bg-white/[0.02] border-white/10 text-gray-400 hover:text-white"
                    }`}
                  >
                    <Building className="w-4 h-4" />
                    <span>Bank Transfer (NEFT/IMPS)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPayoutMethod("UPI")}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition ${
                      payoutMethod === "UPI"
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                        : "bg-white/[0.02] border-white/10 text-gray-400 hover:text-white"
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>UPI Transfer</span>
                  </button>
                </div>
              </div>

              {/* Bank Details */}
              {payoutMethod === "BANK_TRANSFER" && (
                <div className="space-y-3 bg-white/[0.02] p-4 rounded-xl border border-white/5">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Account Holder Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={bankDetails.accountHolder}
                      onChange={(e) => setBankDetails({ ...bankDetails, accountHolder: e.target.value })}
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Account Number *</label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••••••"
                        value={bankDetails.accountNumber}
                        onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                        className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Confirm Account Number *</label>
                      <input
                        type="text"
                        required
                        placeholder="Re-enter number"
                        value={bankDetails.confirmAccountNumber}
                        onChange={(e) => setBankDetails({ ...bankDetails, confirmAccountNumber: e.target.value })}
                        className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">IFSC Code *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. HDFC0001234"
                        value={bankDetails.ifsc}
                        onChange={(e) => setBankDetails({ ...bankDetails, ifsc: e.target.value.toUpperCase() })}
                        className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm text-white uppercase placeholder-gray-600 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Bank Name</label>
                      <input
                        type="text"
                        placeholder="e.g. HDFC Bank"
                        value={bankDetails.bankName}
                        onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                        className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* UPI Option */}
              {payoutMethod === "UPI" && (
                <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5 space-y-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">UPI ID (VPA) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. mobile@okaxis or name@upi"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              {/* Optional Notes */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Payout Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="Additional remarks for Axivon Finance"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="text-[11px] text-gray-400 bg-white/[0.02] p-3 rounded-lg border border-white/5 flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Payouts are settled directly by Axivon Technologies within our guaranteed 48-business-hour SLA upon verification.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCommission(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPayout || !!successMessage}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-sm"
                >
                  {submittingPayout ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting Request...</span>
                    </>
                  ) : (
                    <span>Confirm & Request Payout</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settlement Details Receipt Modal */}
      {settledCommission && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setSettledCommission(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Settlement Confirmation</h3>
                <p className="text-xs text-gray-400">Axivon Technologies Official Disbursement</p>
              </div>
            </div>

            <div className="space-y-3 bg-white/[0.02] p-4 rounded-xl border border-white/5 text-sm">
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-xs text-gray-400">Project Reference:</span>
                <span className="font-mono text-white text-xs">{settledCommission.partnerProject?.projectCode}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-xs text-gray-400">Disbursed Amount:</span>
                <span className="font-bold text-emerald-400">₹{settledCommission.commissionAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-xs text-gray-400">Settlement UTR / Ref:</span>
                <span className="font-mono text-white text-xs bg-black/40 px-2 py-0.5 rounded border border-white/10">
                  {settledCommission.payoutReference || "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-xs text-gray-400">Payout Method:</span>
                <span className="text-white text-xs">{settledCommission.payoutMethod || "BANK_TRANSFER"}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-xs text-gray-400">Settlement Date:</span>
                <span className="text-white text-xs">
                  {settledCommission.paidAt ? new Date(settledCommission.paidAt).toLocaleString() : "Confirmed"}
                </span>
              </div>
            </div>

            <button
              onClick={() => setSettledCommission(null)}
              className="w-full py-2.5 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs rounded-xl transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
