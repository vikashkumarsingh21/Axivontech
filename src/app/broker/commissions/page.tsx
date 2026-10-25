"use client";

import { getErrorMessage, parseApiResponse } from "@/lib/errors/client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  Calculator,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  Search,
  Filter,
  CreditCard,
  Building,
  ShieldCheck,
  Check,
  X,
  FileText,
  Sparkles,
  TrendingUp,
  Receipt,
  HelpCircle,
  AlertTriangle,
} from "lucide-react";
import { BrokerPageHeader } from "@/components/broker/BrokerPageHeader";
import { BrokerCard } from "@/components/broker/BrokerCard";
import { BrokerButton } from "@/components/broker/BrokerButton";
import { BrokerStatusBadge } from "@/components/broker/BrokerStatusBadge";
import { BrokerSkeletonTable } from "@/components/broker/BrokerSkeleton";
import { BrokerEmptyState } from "@/components/broker/BrokerEmptyState";
import { formatCurrencyINR, formatDateIN } from "@/components/broker/BrokerFormatters";

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
  partnerProject?: {
    projectCode: string;
    projectName: string;
    clientName?: string;
    companyName?: string;
    status?: string;
  };
  commissionRule?: {
    name: string;
    type: string;
    value: number;
  };
}

interface SummaryStats {
  totalEarned: number;
  pending: number;
  eligible: number;
  requested: number;
  processing: number;
  paid: number;
  thisMonth: number;
}

export default function BrokerCommissionsPage() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [summary, setSummary] = useState<SummaryStats>({
    totalEarned: 0,
    pending: 0,
    eligible: 0,
    requested: 0,
    processing: 0,
    paid: 0,
    thisMonth: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Estimator Widget State
  const [showEstimator, setShowEstimator] = useState(false);
  const [estimateBudget, setEstimateBudget] = useState("500000");
  const [estimateService, setEstimateService] = useState("CUSTOM_SOFTWARE");
  const [estimateResult, setEstimateResult] = useState<{
    grossCommission: number;
    tdsRate: number;
    tdsAmount: number;
    netPayout: number;
  } | null>(null);
  const [calculatingEstimate, setCalculatingEstimate] = useState(false);

  // Detail Drawer State
  const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null);

  // Payout Request Modal State
  const [payoutTarget, setPayoutTarget] = useState<Commission | null>(null);
  const [payoutMethod, setPayoutMethod] = useState<"BANK_TRANSFER" | "UPI">("BANK_TRANSFER");
  const [bankDetails, setBankDetails] = useState({
    accountHolder: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifsc: "",
    bankName: "",
  });
  const [upiId, setUpiId] = useState("");
  const [payoutNotes, setPayoutNotes] = useState("");
  const [submittingPayout, setSubmittingPayout] = useState(false);
  const [payoutError, setPayoutError] = useState<string | null>(null);
  const [payoutSuccess, setPayoutSuccess] = useState<string | null>(null);

  const fetchCommissions = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (statusFilter && statusFilter !== "ALL") params.set("status", statusFilter);
      params.set("page", currentPage.toString());
      params.set("limit", "15");

      const res = await fetch(`/api/v1/broker/commissions?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        const data = json.data;
        setCommissions(data.commissions || []);
        if (data.summary) {
          setSummary(data.summary);
        }
        if (data.pagination) {
          setTotalCount(data.pagination.total || 0);
          setTotalPages(data.pagination.totalPages || 1);
        }
      }
    } catch (e) {
      console.error("Failed to load commissions:", e);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, currentPage]);

  useEffect(() => {
    fetchCommissions();
  }, [fetchCommissions]);

  // Live Commission Estimator calculation
  const runEstimator = useCallback(async (budgetStr: string, serviceStr: string) => {
    const num = Number(budgetStr.replace(/[^0-9]/g, ""));
    if (!num || num <= 0) return;
    try {
      setCalculatingEstimate(true);
      const res = await fetch("/api/v1/broker/commissions/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ budget: num, serviceType: serviceStr }),
      });
      if (res.ok) {
        const json = await res.json();
        setEstimateResult(json.data?.calculation || null);
      }
    } catch (e) {
      console.error("Estimator error", e);
    } finally {
      setCalculatingEstimate(false);
    }
  }, []);

  useEffect(() => {
    if (showEstimator) {
      runEstimator(estimateBudget, estimateService);
    }
  }, [showEstimator, estimateBudget, estimateService, runEstimator]);

  // Handle Export CSV
  const handleExportCsv = () => {
    const params = new URLSearchParams();
    if (statusFilter !== "ALL") params.set("status", statusFilter);
    window.open(`/api/v1/broker/commissions/export?${params.toString()}`, "_blank");
  };

  // Submit Payout Request
  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payoutTarget) return;
    setPayoutError(null);

    let payoutDetailsPayload: any = {};
    if (payoutMethod === "BANK_TRANSFER") {
      if (!bankDetails.accountHolder.trim() || !bankDetails.accountNumber.trim()) {
        setPayoutError("Account holder name and account number are required.");
        return;
      }
      if (bankDetails.accountNumber !== bankDetails.confirmAccountNumber) {
        setPayoutError("Account numbers do not match.");
        return;
      }
      const ifscClean = bankDetails.ifsc.trim().toUpperCase();
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscClean)) {
        setPayoutError("Invalid IFSC code format (e.g. HDFC0001234).");
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
        setPayoutError("Valid UPI ID is required (e.g. name@bank).");
        return;
      }
      payoutDetailsPayload = { upiId: upiId.trim() };
    }

    try {
      setSubmittingPayout(true);
      const res = await fetch("/api/v1/broker/commissions/payout-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commissionId: payoutTarget.id,
          payoutMethod,
          payoutDetails: payoutDetailsPayload,
          notes: payoutNotes.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(getErrorMessage(json) || "Failed to submit payout request.");
      }

      setPayoutSuccess("Payout request recorded! Axivon Accounts SLA is 48 business hours.");
      fetchCommissions();
      setTimeout(() => {
        setPayoutTarget(null);
        setPayoutSuccess(null);
      }, 2000);
    } catch (err: any) {
      setPayoutError(err.message);
    } finally {
      setSubmittingPayout(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <BrokerPageHeader
        title="Commission Ledger & Settlements"
        subtitle="Manage commission accruals, statutory Section 194H TDS compliance, and 48-hour bank disbursements."
        badge={
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#C2A878]/10 text-[#C2A878] border border-[#C2A878]/25">
            <DollarSign className="w-3.5 h-3.5" />
            Guaranteed 10% Yield
          </span>
        }
        actions={
          <div className="flex items-center gap-2.5">
            <BrokerButton
              variant="secondary"
              size="sm"
              onClick={() => setShowEstimator(!showEstimator)}
              icon={<Calculator className="w-3.5 h-3.5" />}
            >
              {showEstimator ? "Hide Estimator" : "Commission Estimator"}
            </BrokerButton>

            <BrokerButton
              variant="secondary"
              size="sm"
              onClick={handleExportCsv}
              icon={<Download className="w-3.5 h-3.5" />}
            >
              Export Statement (CSV)
            </BrokerButton>
          </div>
        }
      />

      {/* 5-Metric Financial Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <BrokerCard className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#8B94A1]">Total Settled</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-emerald-400">
            {formatCurrencyINR(summary.paid)}
          </div>
          <span className="text-[10px] text-[#566171]">Lifetime disbursed payouts</span>
        </BrokerCard>

        <BrokerCard className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#8B94A1]">Eligible for Payout</span>
            <div className="w-7 h-7 rounded-lg bg-[#C2A878]/15 flex items-center justify-center text-[#C2A878]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-[#C2A878]">
            {formatCurrencyINR(summary.eligible)}
          </div>
          <span className="text-[10px] text-[#566171]">Cleared milestone funds</span>
        </BrokerCard>

        <BrokerCard className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#8B94A1]">In Processing</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-blue-400">
            {formatCurrencyINR(summary.requested + summary.processing)}
          </div>
          <span className="text-[10px] text-[#566171]">48h banking SLA queue</span>
        </BrokerCard>

        <BrokerCard className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#8B94A1]">Pending Delivery</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-amber-400">
            {formatCurrencyINR(summary.pending)}
          </div>
          <span className="text-[10px] text-[#566171]">Awaiting client invoice</span>
        </BrokerCard>

        <BrokerCard className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#8B94A1]">This Month</span>
            <div className="w-7 h-7 rounded-lg bg-[#171A1F] flex items-center justify-center text-[#C2A878]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-[#E6E8EB]">
            {formatCurrencyINR(summary.thisMonth)}
          </div>
          <span className="text-[10px] text-[#566171]">Current billing cycle</span>
        </BrokerCard>
      </div>

      {/* Interactive Commission Estimator Card (Collapsible) */}
      {showEstimator && (
        <BrokerCard
          title="Commission Yield Estimator"
          subtitle="Model potential partner revenues based on proposed enterprise project budgets."
          className="animate-fadeIn border-[#C2A878]/30 bg-gradient-to-r from-[#C2A878]/10 via-[#111317] to-[#111317]"
          action={
            <button
              onClick={() => setShowEstimator(false)}
              className="p-1 rounded text-[#8B94A1] hover:text-[#E6E8EB]"
            >
              <X className="w-4 h-4" />
            </button>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Inputs */}
            <div className="md:col-span-5 space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#8B94A1] mb-1">
                  Expected Client Contract Value (INR)
                </label>
                <input
                  type="text"
                  value={estimateBudget}
                  onChange={(e) => setEstimateBudget(e.target.value)}
                  placeholder="e.g. 500000"
                  className="w-full px-3 py-2 rounded-lg bg-[#171A1F] border border-[#22262D] text-xs text-[#E6E8EB] font-mono focus:outline-none focus:border-[#C2A878]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8B94A1] mb-1">Service Type</label>
                <select
                  value={estimateService}
                  onChange={(e) => setEstimateService(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#171A1F] border border-[#22262D] text-xs text-[#E6E8EB] focus:outline-none focus:border-[#C2A878]"
                >
                  <option value="CUSTOM_SOFTWARE">Custom Software Engineering (10%)</option>
                  <option value="AI_ML">AI & Cloud Automation (10%)</option>
                  <option value="MOBILE_APP">Mobile App Development (10%)</option>
                  <option value="DEDICATED_TEAM">Dedicated Engineering Team (10%)</option>
                </select>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex gap-2 pt-1">
                {["200000", "500000", "1000000", "2500000"].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setEstimateBudget(preset)}
                    className="px-2 py-1 rounded bg-[#171A1F] hover:bg-[#22262D] text-[10px] font-mono text-[#C2A878] border border-[#22262D] transition-colors"
                  >
                    ₹{(Number(preset) / 100000).toFixed(0)}L
                  </button>
                ))}
              </div>
            </div>

            {/* Calculations Breakdown Output */}
            <div className="md:col-span-7 bg-[#0E1013] p-4 rounded-xl border border-[#22262D]">
              <span className="text-[11px] font-semibold text-[#8B94A1] uppercase tracking-wider block mb-3">
                Calculated Commercial Yield
              </span>

              {estimateResult ? (
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-lg bg-[#171A1F] border border-[#22262D]">
                    <span className="text-[10px] text-[#8B94A1] block">Gross Commission</span>
                    <span className="text-sm font-bold font-mono text-[#C2A878] mt-1 block">
                      {formatCurrencyINR(estimateResult.grossCommission)}
                    </span>
                    <span className="text-[10px] text-[#566171]">10% Deal Rate</span>
                  </div>

                  <div className="p-3 rounded-lg bg-[#171A1F] border border-[#22262D]">
                    <span className="text-[10px] text-[#8B94A1] block">Section 194H TDS</span>
                    <span className="text-sm font-bold font-mono text-amber-400 mt-1 block">
                      - {formatCurrencyINR(estimateResult.tdsAmount)}
                    </span>
                    <span className="text-[10px] text-[#566171]">5% Tax At Source</span>
                  </div>

                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-[10px] text-emerald-400 block font-medium">Net Bank Payout</span>
                    <span className="text-sm font-bold font-mono text-emerald-400 mt-1 block">
                      {formatCurrencyINR(estimateResult.netPayout)}
                    </span>
                    <span className="text-[10px] text-emerald-400/70">Direct NEFT/UPI</span>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-[#8B94A1] py-4 text-center">Enter a budget to calculate yield</div>
              )}
            </div>
          </div>
        </BrokerCard>
      )}

      {/* Filter Toolbar */}
      <div className="p-4 rounded-xl border border-[#22262D] bg-[#111317] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#566171]" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by project code, name..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#171A1F] border border-[#22262D] text-xs text-[#E6E8EB] placeholder-[#566171] focus:outline-none focus:border-[#C2A878]"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 rounded-lg bg-[#171A1F] border border-[#22262D] text-xs text-[#E6E8EB] focus:outline-none focus:border-[#C2A878]"
          >
            <option value="ALL">All Ledger Statuses</option>
            <option value="ELIGIBLE">Eligible (Available to Withdraw)</option>
            <option value="REQUESTED">Requested (In Review)</option>
            <option value="PROCESSING">Processing (Bank Queue)</option>
            <option value="PAID">Paid / Settled</option>
            <option value="PENDING">Pending Milestone Settlement</option>
          </select>
        </div>
      </div>

      {/* Commissions Table */}
      {loading ? (
        <BrokerSkeletonTable rows={5} cols={6} />
      ) : commissions.length === 0 ? (
        <BrokerEmptyState
          type="commissions"
          title="No Commission Entries"
          description={
            search || statusFilter !== "ALL"
              ? "No ledger records matched your search query."
              : "When client referrals reach signed contracts and milestone clearances, your commissions will appear here."
          }
          actionLabel="View Projects"
          actionHref="/broker/projects"
        />
      ) : (
        <BrokerCard noPadding className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0E1013] border-b border-[#1E232B] text-[#8B94A1] uppercase font-mono tracking-wider">
                <tr>
                  <th className="px-5 py-3 font-semibold">Project Code</th>
                  <th className="px-5 py-3 font-semibold">Client Project</th>
                  <th className="px-5 py-3 font-semibold">Project Value</th>
                  <th className="px-5 py-3 font-semibold">Commission Rate</th>
                  <th className="px-5 py-3 font-semibold">Gross Fee</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Settlement Ref</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E232B] text-[#D0D4DC]">
                {commissions.map((comm) => (
                  <tr
                    key={comm.id}
                    className="hover:bg-[#171A1F]/60 transition-colors cursor-pointer group"
                    onClick={() => setSelectedCommission(comm)}
                  >
                    <td className="px-5 py-3.5 font-mono text-[#C2A878] font-medium whitespace-nowrap">
                      {comm.partnerProject?.projectCode || "PRJ-XXXX"}
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-[#E6E8EB] group-hover:text-[#C2A878] transition-colors truncate max-w-[200px]">
                        {comm.partnerProject?.projectName || "Client Project"}
                      </div>
                      <div className="text-[11px] text-[#566171]">{formatDateIN(comm.createdAt)}</div>
                    </td>

                    <td className="px-5 py-3.5 font-mono text-[#E6E8EB]">
                      {formatCurrencyINR(comm.projectValue)}
                    </td>

                    <td className="px-5 py-3.5 font-mono text-[#C2A878] font-bold">
                      {comm.commissionRate || 10}%
                    </td>

                    <td className="px-5 py-3.5 font-mono text-emerald-400 font-bold">
                      {formatCurrencyINR(comm.commissionAmount)}
                    </td>

                    <td className="px-5 py-3.5">
                      <BrokerStatusBadge status={comm.status} category="commission" />
                    </td>

                    <td className="px-5 py-3.5 font-mono text-[11px] text-[#8B94A1] whitespace-nowrap">
                      {comm.payoutReference || (comm.paidAt ? formatDateIN(comm.paidAt) : "—")}
                    </td>

                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      {comm.status === "ELIGIBLE" ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPayoutTarget(comm);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#C2A878] hover:bg-[#D4BC8B] text-[#0A0B0D] font-bold text-xs transition-colors shadow-sm inline-flex items-center gap-1"
                        >
                          <span>Request Payout</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCommission(comm);
                          }}
                          className="text-xs text-[#C2A878] hover:text-[#D4BC8B] font-medium inline-flex items-center gap-1"
                        >
                          <span>Breakdown</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="px-5 py-3 border-t border-[#1E232B] bg-[#0E1013] flex items-center justify-between text-xs text-[#8B94A1]">
              <span>
                Showing {commissions.length} of {totalCount} ledger records
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1 rounded-md bg-[#171A1F] border border-[#22262D] disabled:opacity-30 hover:text-[#E6E8EB]"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-mono text-[#E6E8EB]">
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1 rounded-md bg-[#171A1F] border border-[#22262D] disabled:opacity-30 hover:text-[#E6E8EB]"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </BrokerCard>
      )}

      {/* COMMISSION DETAIL & TDS DRAWER */}
      {selectedCommission && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedCommission(null)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-[#111317] border-l border-[#22262D] text-[#E6E8EB] shadow-2xl flex flex-col">
              {/* Drawer Header */}
              <div className="px-6 py-5 border-b border-[#1E232B] flex items-center justify-between bg-[#0E1013]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#C2A878]">
                      {selectedCommission.partnerProject?.projectCode || "COMMISSION"}
                    </span>
                    <BrokerStatusBadge status={selectedCommission.status} category="commission" />
                  </div>
                  <h3 className="text-base font-bold text-[#E6E8EB] mt-1">
                    Settlement & Tax Certificate
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedCommission(null)}
                  className="p-1.5 rounded-lg text-[#8B94A1] hover:text-[#E6E8EB] hover:bg-[#171A1F]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
                {/* Project Info */}
                <div className="p-3.5 rounded-xl bg-[#171A1F] border border-[#22262D] space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#8B94A1]">Project Title:</span>
                    <span className="font-medium text-[#E6E8EB] truncate max-w-[200px]">
                      {selectedCommission.partnerProject?.projectName || "Commercial Project"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8B94A1]">Client Contract Value:</span>
                    <span className="font-mono font-semibold text-[#E6E8EB]">
                      {formatCurrencyINR(selectedCommission.projectValue)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8B94A1]">Partner Fee Rate:</span>
                    <span className="font-mono font-bold text-[#C2A878]">
                      {selectedCommission.commissionRate || 10}%
                    </span>
                  </div>
                </div>

                {/* Section 194H Tax Breakdown Box */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-[#8B94A1] uppercase tracking-wider">
                    Statutory Tax & Net Payout Calculation
                  </h4>
                  <div className="p-4 rounded-xl bg-[#0E1013] border border-[#22262D] space-y-2.5 font-mono">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#8B94A1]">Gross Commission:</span>
                      <span className="font-bold text-[#E6E8EB]">
                        {formatCurrencyINR(selectedCommission.commissionAmount)}
                      </span>
                    </div>

                    <div className="flex justify-between text-xs text-amber-400">
                      <span>Less: 5% Section 194H TDS:</span>
                      <span>
                        - {formatCurrencyINR(Math.round(selectedCommission.commissionAmount * 0.05))}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm font-bold border-t border-[#1E232B] pt-2 text-emerald-400">
                      <span>Net Disbursement:</span>
                      <span>
                        {formatCurrencyINR(
                          selectedCommission.commissionAmount -
                            Math.round(selectedCommission.commissionAmount * 0.05)
                        )}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#566171] leading-relaxed">
                    Axivon files quarterly TDS returns under Section 194H. Your Form 16A certificate is
                    issued digitally to your registered partner email.
                  </p>
                </div>

                {/* Disbursement Details */}
                {selectedCommission.paidAt && (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                    <span className="font-semibold text-emerald-400 block text-xs">
                      Cleared & Disbursed
                    </span>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-[#8B94A1]">Settlement Date:</span>
                      <span className="text-[#E6E8EB]">{formatDateIN(selectedCommission.paidAt)}</span>
                    </div>
                    {selectedCommission.payoutReference && (
                      <div className="flex justify-between text-[11px]">
                        <span className="text-[#8B94A1]">Bank UTR Reference:</span>
                        <span className="font-mono text-[#E6E8EB] font-bold">
                          {selectedCommission.payoutReference}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-[#1E232B] bg-[#0E1013]">
                {selectedCommission.status === "ELIGIBLE" ? (
                  <BrokerButton
                    variant="primary"
                    className="w-full"
                    onClick={() => {
                      const comm = selectedCommission;
                      setSelectedCommission(null);
                      setPayoutTarget(comm);
                    }}
                    icon={<ArrowRight className="w-4 h-4" />}
                  >
                    Request Payout Now
                  </BrokerButton>
                ) : (
                  <BrokerButton
                    variant="secondary"
                    className="w-full"
                    onClick={() => setSelectedCommission(null)}
                  >
                    Close Breakdown
                  </BrokerButton>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REQUEST PAYOUT MODAL */}
      {payoutTarget && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
              onClick={() => setPayoutTarget(null)}
            />

            <div className="relative bg-[#111317] border border-[#22262D] rounded-xl max-w-lg w-full p-6 text-xs text-[#E6E8EB] space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#1E232B] pb-3">
                <div>
                  <h3 className="text-sm font-bold">Request Commission Disbursement</h3>
                  <p className="text-[11px] text-[#8B94A1]">
                    Ref: {payoutTarget.partnerProject?.projectCode || payoutTarget.id}
                  </p>
                </div>
                <button
                  onClick={() => setPayoutTarget(null)}
                  className="p-1 rounded text-[#8B94A1] hover:text-[#E6E8EB]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {payoutError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{payoutError}</span>
                </div>
              )}

              {payoutSuccess && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{payoutSuccess}</span>
                </div>
              )}

              {/* Amount Breakdown Summary */}
              <div className="p-3.5 rounded-xl bg-[#0E1013] border border-[#22262D] space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-[#8B94A1]">Gross Commission:</span>
                  <span className="font-bold text-[#E6E8EB]">
                    {formatCurrencyINR(payoutTarget.commissionAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-amber-400">
                  <span>Less 5% Section 194H TDS:</span>
                  <span>- {formatCurrencyINR(Math.round(payoutTarget.commissionAmount * 0.05))}</span>
                </div>
                <div className="flex justify-between text-sm font-bold border-t border-[#1E232B] pt-1.5 text-emerald-400">
                  <span>Net Receivable:</span>
                  <span>
                    {formatCurrencyINR(
                      payoutTarget.commissionAmount - Math.round(payoutTarget.commissionAmount * 0.05)
                    )}
                  </span>
                </div>
              </div>

              <form onSubmit={handleRequestPayout} className="space-y-4">
                {/* Method Switch */}
                <div>
                  <label className="block text-xs font-medium text-[#8B94A1] mb-1.5">
                    Disbursement Method
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPayoutMethod("BANK_TRANSFER")}
                      className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 ${
                        payoutMethod === "BANK_TRANSFER"
                          ? "bg-[#C2A878]/15 border-[#C2A878] text-[#E6E8EB]"
                          : "bg-[#171A1F] border-[#22262D] text-[#8B94A1]"
                      }`}
                    >
                      <Building className="w-3.5 h-3.5 text-[#C2A878]" />
                      <span>Bank Account (NEFT)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPayoutMethod("UPI")}
                      className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 ${
                        payoutMethod === "UPI"
                          ? "bg-[#C2A878]/15 border-[#C2A878] text-[#E6E8EB]"
                          : "bg-[#171A1F] border-[#22262D] text-[#8B94A1]"
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5 text-[#C2A878]" />
                      <span>Instant UPI ID</span>
                    </button>
                  </div>
                </div>

                {payoutMethod === "BANK_TRANSFER" ? (
                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-[11px] font-medium text-[#8B94A1] mb-1">
                        Account Holder Name <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={bankDetails.accountHolder}
                        onChange={(e) =>
                          setBankDetails({ ...bankDetails, accountHolder: e.target.value })
                        }
                        placeholder="Jane Doe or Agency LLP"
                        className="w-full px-3 py-1.5 rounded-lg bg-[#171A1F] border border-[#22262D] text-xs text-[#E6E8EB] focus:outline-none focus:border-[#C2A878]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-medium text-[#8B94A1] mb-1">
                          Account Number <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="password"
                          required
                          value={bankDetails.accountNumber}
                          onChange={(e) =>
                            setBankDetails({ ...bankDetails, accountNumber: e.target.value })
                          }
                          placeholder="••••••••••••"
                          className="w-full px-3 py-1.5 rounded-lg bg-[#171A1F] border border-[#22262D] text-xs text-[#E6E8EB] font-mono focus:outline-none focus:border-[#C2A878]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-[#8B94A1] mb-1">
                          Confirm Account <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={bankDetails.confirmAccountNumber}
                          onChange={(e) =>
                            setBankDetails({ ...bankDetails, confirmAccountNumber: e.target.value })
                          }
                          placeholder="Re-enter account"
                          className="w-full px-3 py-1.5 rounded-lg bg-[#171A1F] border border-[#22262D] text-xs text-[#E6E8EB] font-mono focus:outline-none focus:border-[#C2A878]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-medium text-[#8B94A1] mb-1">
                          IFSC Code <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={bankDetails.ifsc}
                          onChange={(e) =>
                            setBankDetails({ ...bankDetails, ifsc: e.target.value.toUpperCase() })
                          }
                          placeholder="HDFC0001234"
                          maxLength={11}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#171A1F] border border-[#22262D] text-xs text-[#E6E8EB] uppercase font-mono focus:outline-none focus:border-[#C2A878]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-[#8B94A1] mb-1">
                          Bank Name
                        </label>
                        <input
                          type="text"
                          value={bankDetails.bankName}
                          onChange={(e) =>
                            setBankDetails({ ...bankDetails, bankName: e.target.value })
                          }
                          placeholder="e.g. HDFC Bank"
                          className="w-full px-3 py-1.5 rounded-lg bg-[#171A1F] border border-[#22262D] text-xs text-[#E6E8EB] focus:outline-none focus:border-[#C2A878]"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-medium text-[#8B94A1] mb-1">
                      UPI ID <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. username@okhdfcbank"
                      className="w-full px-3 py-1.5 rounded-lg bg-[#171A1F] border border-[#22262D] text-xs text-[#E6E8EB] font-mono focus:outline-none focus:border-[#C2A878]"
                    />
                  </div>
                )}

                <div className="p-3 rounded-lg bg-[#0E1013] border border-[#22262D] text-[11px] text-[#8B94A1]">
                  <strong>48h Payout SLA:</strong> Upon submission, Axivon Finance verifies client clearance
                  and initiates direct transfer within 48 business hours.
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#1E232B]">
                  <BrokerButton
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setPayoutTarget(null)}
                  >
                    Cancel
                  </BrokerButton>
                  <BrokerButton
                    type="submit"
                    variant="primary"
                    size="sm"
                    loading={submittingPayout}
                    icon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    Confirm Payout Request
                  </BrokerButton>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
