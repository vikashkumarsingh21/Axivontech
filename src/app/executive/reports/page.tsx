"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileSpreadsheet,
  Download,
  DollarSign,
  Briefcase,
  Users,
  ShieldAlert,
  Crown,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Loader2,
  Calendar,
} from "lucide-react";

export default function ExecutiveReportsPage() {
  const [finance, setFinance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/v1/analytics/finance?preset=this_year")
      .then(async (res) => {
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          throw new Error(d.error || "Requires Founder / Executive permissions");
        }
        return res.json();
      })
      .then((d) => {
        setFinance(d.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleDownload = (reportType: string) => {
    window.open(`/api/v1/analytics/export?reportType=${reportType}&preset=this_year`, "_blank");
  };

  return (
    <div className="space-y-6 text-[#F3F5F7]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#1E2530] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-[#D6B779]" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Executive Intelligence & Financial Audit</h1>
          </div>
          <p className="text-[#A7B0BC] text-sm mt-1">
            Authoritative financial reconciliations, contracted values, and governance reports.
          </p>
        </div>

        <Link
          href="/admin/analytics"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#151A21] hover:bg-[#1B222B] border border-[#29313B] text-xs font-semibold text-[#F3F5F7] transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#10B981]" />
          Open Operational BI
        </Link>
      </div>

      {error ? (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-20 text-[#A7B0BC] gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-[#D6B779]" />
          <span>Synchronizing executive ledgers...</span>
        </div>
      ) : (
        <>
          {/* Financial Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#151A21] border border-[#29313B] rounded-2xl p-5 space-y-2">
              <span className="text-xs text-[#A7B0BC]">Confirmed Contracted Value</span>
              <div className="text-2xl font-bold text-white">
                {finance?.metrics?.contractedValue?.formatted || "₹0"}
              </div>
              <p className="text-[11px] text-gray-500">From signed client agreements</p>
            </div>

            <div className="bg-[#151A21] border border-[#29313B] rounded-2xl p-5 space-y-2">
              <span className="text-xs text-[#A7B0BC]">Verified Cash Collected</span>
              <div className="text-2xl font-bold text-emerald-400">
                {finance?.metrics?.cashCollected?.formatted || "₹0"}
              </div>
              <p className="text-[11px] text-emerald-500/80">Reconciled verified receipts</p>
            </div>

            <div className="bg-[#151A21] border border-[#29313B] rounded-2xl p-5 space-y-2">
              <span className="text-xs text-[#A7B0BC]">Pending Inbound Receivables</span>
              <div className="text-2xl font-bold text-amber-400">
                {finance?.metrics?.pendingReceivables?.formatted || "₹0"}
              </div>
              <p className="text-[11px] text-amber-500/80">Submitted payments in review</p>
            </div>

            <div className="bg-[#151A21] border border-[#29313B] rounded-2xl p-5 space-y-2">
              <span className="text-xs text-[#A7B0BC]">Approved Partner Commissions</span>
              <div className="text-2xl font-bold text-[#D6B779]">
                {finance?.metrics?.commissionsPayable?.formatted || "₹0"}
              </div>
              <p className="text-[11px] text-[#D6B779]/80">
                Paid: {finance?.metrics?.commissionsPaid?.formatted || "₹0"}
              </p>
            </div>
          </div>

          {/* Executive Download Catalog */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">Executive Audited Reports Catalogue</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  id: "leads",
                  name: "Sales Intake & Attribution Audit",
                  desc: "All client inquiries, conversion funnel progression, and partner attribution codes.",
                },
                {
                  id: "projects",
                  name: "Project Deliverables & Milestones Ledger",
                  desc: "Comprehensive project budgets, delivery milestones, and client sign-off records.",
                },
                {
                  id: "partners",
                  name: "Broker & Partner Program Directory",
                  desc: "Partner candidates, agreements, payment transactions, and verified payouts.",
                },
              ].map((r) => (
                <div key={r.id} className="bg-[#151A21] border border-[#29313B] rounded-2xl p-6 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-bold text-white text-base">{r.name}</h3>
                    <p className="text-xs text-[#A7B0BC] leading-relaxed">{r.desc}</p>
                  </div>
                  <button
                    onClick={() => handleDownload(r.id)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#D6B779] hover:bg-[#c4a466] text-[#1c1810] rounded-xl text-xs font-bold transition-colors shadow-lg shadow-[#D6B779]/10"
                  >
                    <Download className="w-4 h-4" /> Download Audited Dataset (CSV)
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Governance Notice */}
          <div className="p-4 rounded-2xl bg-[#151A21] border border-[#29313B] flex items-start gap-3 text-xs text-[#A7B0BC]">
            <ShieldAlert className="w-5 h-5 text-[#D6B779] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-white">Confidential Executive Records</p>
              <p>
                Financial measures in this dashboard reflect authoritative accounting entries. Every export event is
                immutably logged in the platform security audit trail with user identity and timestamp.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
