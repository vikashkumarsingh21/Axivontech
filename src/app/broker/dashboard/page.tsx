"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  TrendingUp, 
  ArrowUpRight, 
  PlusCircle, 
  Copy, 
  Check, 
  Share2, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  ExternalLink, 
  FileText, 
  Briefcase, 
  Users, 
  Wallet,
  ShieldAlert,
  Send,
  MessageSquare,
  Sparkles
} from "lucide-react";
import { useBrokerFetch } from "@/components/broker/useBrokerFetch";
import { formatCurrencyINR, formatDateIN, formatNumberIN } from "@/components/broker/BrokerFormatters";
import { BrokerPageHeader } from "@/components/broker/BrokerPageHeader";
import { BrokerCard } from "@/components/broker/BrokerCard";
import { BrokerButton } from "@/components/broker/BrokerButton";
import { BrokerStatusBadge } from "@/components/broker/BrokerStatusBadge";
import { BrokerSkeletonMetrics, BrokerSkeletonCard } from "@/components/broker/BrokerSkeleton";
import { BrokerErrorState } from "@/components/broker/BrokerErrorState";
import { BrokerEmptyState } from "@/components/broker/BrokerEmptyState";

interface DashboardData {
  stats: {
    leads: { TOTAL: number; NEW?: number; QUALIFIED?: number };
    projects: { TOTAL: number; PENDING?: number; CONFIRMED?: number };
    earnings: {
      totalEarned: number;
      pending: number;
      eligible: number;
      requested: number;
      paid: number;
      thisMonth: number;
    };
  };
  pendingActions: Array<{
    id: string;
    type: string;
    title: string;
    description?: string;
    link: string;
    severity?: "HIGH" | "MEDIUM" | "LOW";
  }>;
  referral: {
    referralCode?: string;
    totalClicks?: number;
    totalLeads?: number;
    convertedProjects?: number;
  };
  recentMilestones?: Array<{
    id: string;
    title: string;
    targetDate: string;
    projectName: string;
    isCompleted: boolean;
  }>;
  recentActivity?: Array<{
    id: string;
    action: string;
    resource: string;
    details?: any;
    createdAt: string;
  }>;
}

interface AnalyticsData {
  monthlyEarnings: Array<{
    month: string;
    paid: number;
    eligible: number;
    count: number;
  }>;
  funnel: Array<{
    step: string;
    label: string;
    count: number;
    percentage: number;
  }>;
  serviceTypes: Array<{
    serviceType: string;
    count: number;
    totalEarned: number;
  }>;
}

export default function BrokerDashboardPage() {
  const { data: dashboard, loading: dashLoading, error: dashError, refetch: refetchDash } =
    useBrokerFetch<DashboardData>("/api/v1/broker/dashboard");

  const { data: analytics, loading: analyticsLoading } =
    useBrokerFetch<AnalyticsData>("/api/v1/broker/analytics/earnings");

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const referralCode = dashboard?.referral?.referralCode || "";
  const origin = typeof window !== "undefined" ? window.location.origin : "https://axivontech.in";
  const referralLink = `${origin}/lead/${referralCode}`;
  const projectStartLink = `${origin}/project/start/${referralCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const shareText = `Partner with Axivon Technologies for high-performance software engineering, cloud architecture, and AI platforms. Get in touch directly through my partner link: ${referralLink}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
  const emailUrl = `mailto:?subject=${encodeURIComponent("Enterprise Software Partnership — Axivon Technologies")}&body=${encodeURIComponent(shareText)}`;

  if (dashLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 bg-[#171A1F] rounded-lg animate-pulse" />
        <BrokerSkeletonMetrics count={4} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <BrokerSkeletonCard className="lg:col-span-2 h-72" />
          <BrokerSkeletonCard className="h-72" />
        </div>
      </div>
    );
  }

  if (dashError) {
    return <BrokerErrorState message={dashError} onRetry={refetchDash} />;
  }

  const earnings = dashboard?.stats?.earnings || {
    totalEarned: 0,
    eligible: 0,
    pending: 0,
    requested: 0,
    paid: 0,
    thisMonth: 0,
  };

  const pendingActions = dashboard?.pendingActions || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Page Header */}
      <BrokerPageHeader
        title="Partner Dashboard"
        subtitle="Performance analytics, referral tracking, and real-time commission settlement."
        badge={
          referralCode ? (
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-md border border-[#C2A878]/30 bg-[#C2A878]/10 text-[#C2A878] font-medium flex items-center gap-1.5">
              <span>Code:</span>
              <strong className="tracking-wide">{referralCode}</strong>
            </span>
          ) : undefined
        }
        actions={
          <div className="flex items-center gap-2.5">
            <BrokerButton
              variant="secondary"
              size="sm"
              onClick={() => setShowShareModal(true)}
              icon={<Share2 className="w-3.5 h-3.5" />}
            >
              Share Referral Link
            </BrokerButton>
            <Link href="/broker/projects/new">
              <BrokerButton
                variant="primary"
                size="sm"
                icon={<PlusCircle className="w-3.5 h-3.5 text-[#0A0B0D]" />}
              >
                Submit Project
              </BrokerButton>
            </Link>
          </div>
        }
      />

      {/* 1. FINANCIAL EARNINGS STRIP (4 METRICS) */}
      <section aria-label="Earnings overview" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Earned */}
        <div className="rounded-xl border border-[#22262D] bg-[#111317] p-5 hover:border-[#2C313A] transition-colors shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#8B94A1] mb-2 font-medium">
            <span>Total Settled Earnings</span>
            <Wallet className="w-4 h-4 text-[#C2A878]" />
          </div>
          <div className="text-2xl font-semibold tracking-tight text-[#E6E8EB] font-mono">
            {formatCurrencyINR(earnings.totalEarned)}
          </div>
          <div className="text-[11px] text-[#8B94A1] mt-1.5 flex items-center justify-between">
            <span>This Month: <strong className="text-[#E6E8EB] font-mono">{formatCurrencyINR(earnings.thisMonth)}</strong></span>
            <span className="text-[10px] text-emerald-400 font-medium">Settled to bank</span>
          </div>
        </div>

        {/* Eligible for Payout */}
        <div className="rounded-xl border border-[#C2A878]/30 bg-[#161411] p-5 hover:border-[#C2A878]/50 transition-colors shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#C2A878] mb-2 font-medium">
            <span>Eligible for Payout</span>
            <span className="w-2 h-2 rounded-full bg-[#C2A878] animate-pulse" />
          </div>
          <div className="text-2xl font-semibold tracking-tight text-[#E6E8EB] font-mono">
            {formatCurrencyINR(earnings.eligible)}
          </div>
          <div className="text-[11px] text-[#8B94A1] mt-1.5 flex items-center justify-between">
            <span>Min ₹500 threshold</span>
            {earnings.eligible >= 500 ? (
              <Link href="/broker/commissions" className="text-[11px] text-[#C2A878] hover:underline font-medium inline-flex items-center gap-0.5">
                Request Now <ArrowUpRight className="w-3 h-3" />
              </Link>
            ) : (
              <span className="text-[10px] text-[#566171]">Accruing</span>
            )}
          </div>
        </div>

        {/* Active Projects */}
        <div className="rounded-xl border border-[#22262D] bg-[#111317] p-5 hover:border-[#2C313A] transition-colors shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#8B94A1] mb-2 font-medium">
            <span>Active Projects Pipeline</span>
            <Briefcase className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-semibold tracking-tight text-[#E6E8EB] font-mono">
            {dashboard?.stats?.projects?.TOTAL || 0}
          </div>
          <div className="text-[11px] text-[#8B94A1] mt-1.5 flex items-center justify-between">
            <span>In Review: <strong className="text-[#E6E8EB] font-mono">{dashboard?.stats?.projects?.PENDING || 0}</strong></span>
            <Link href="/broker/projects" className="text-[11px] text-[#8B94A1] hover:text-[#E6E8EB] transition-colors">
              View All →
            </Link>
          </div>
        </div>

        {/* Referred Leads */}
        <div className="rounded-xl border border-[#22262D] bg-[#111317] p-5 hover:border-[#2C313A] transition-colors shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#8B94A1] mb-2 font-medium">
            <span>Attributed Leads</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-semibold tracking-tight text-[#E6E8EB] font-mono">
            {dashboard?.stats?.leads?.TOTAL || 0}
          </div>
          <div className="text-[11px] text-[#8B94A1] mt-1.5 flex items-center justify-between">
            <span>Qualified: <strong className="text-[#E6E8EB] font-mono">{dashboard?.stats?.leads?.QUALIFIED || 0}</strong></span>
            <Link href="/broker/leads" className="text-[11px] text-[#8B94A1] hover:text-[#E6E8EB] transition-colors">
              Manage Leads →
            </Link>
          </div>
        </div>
      </section>

      {/* 2. ANALYTICS: 12-MONTH TREND & CONVERSION FUNNEL */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Monthly Trend Chart (2 Cols) */}
        <BrokerCard
          title="Earnings Trend (Last 12 Months)"
          subtitle="Monthly settled commissions and eligible accruals in INR"
          className="lg:col-span-2"
          action={
            <Link href="/broker/commissions" className="text-xs text-[#C2A878] hover:underline font-medium inline-flex items-center gap-1 font-mono">
              View Ledger <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          }
        >
          {analyticsLoading ? (
            <div className="h-56 flex items-center justify-center text-xs text-[#8B94A1] animate-pulse">
              Loading 12-month earnings trend...
            </div>
          ) : !analytics?.monthlyEarnings || analytics.monthlyEarnings.length === 0 ? (
            <div className="h-56 flex flex-col items-center justify-center text-xs text-[#8B94A1] text-center p-4">
              <TrendingUp className="w-8 h-8 text-[#566171] mb-2" />
              <span>Earnings data will populate as client milestones complete.</span>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              {/* Responsive Bar Visualization */}
              <div className="h-48 flex items-end gap-2 md:gap-3 px-2 pt-6 border-b border-[#1E232B]">
                {analytics.monthlyEarnings.map((item, idx) => {
                  const maxEarnings = Math.max(
                    ...analytics.monthlyEarnings.map((m) => m.paid + m.eligible),
                    10000
                  );
                  const total = item.paid + item.eligible;
                  const heightPercent = Math.max(Math.round((total / maxEarnings) * 100), 4);

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                      {/* Tooltip */}
                      <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-[#171A1F] border border-[#2C313A] rounded-md px-2 py-1 text-[10px] font-mono whitespace-nowrap z-20 shadow-lg text-[#E6E8EB]">
                        {item.month}: {formatCurrencyINR(total)}
                      </div>

                      {/* Bar Fill */}
                      <div
                        className={`w-full rounded-t transition-all ${
                          item.paid > 0
                            ? "bg-[#C2A878] hover:bg-[#D4BE92]"
                            : item.eligible > 0
                            ? "bg-[#C2A878]/40"
                            : "bg-[#1E232B] hover:bg-[#252C36]"
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                      <span className="text-[9px] text-[#566171] font-mono truncate w-full text-center">
                        {item.month.split(" ")[0]}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-end gap-4 text-[11px] text-[#8B94A1] font-mono pt-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#C2A878]" />
                  Paid Settlement
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#C2A878]/40" />
                  Eligible Accrual
                </span>
              </div>
            </div>
          )}
        </BrokerCard>

        {/* Lead-to-Project Funnel (1 Col) */}
        <BrokerCard
          title="Conversion Funnel"
          subtitle="From referral intake to completed delivery"
        >
          {analyticsLoading ? (
            <div className="h-56 flex items-center justify-center text-xs text-[#8B94A1] animate-pulse">
              Computing conversion rates...
            </div>
          ) : !analytics?.funnel || analytics.funnel.length === 0 ? (
            <div className="h-56 flex flex-col items-center justify-center text-xs text-[#8B94A1] text-center p-4">
              <span>Conversion rates calculate automatically as leads progress.</span>
            </div>
          ) : (
            <div className="space-y-3.5 py-1">
              {analytics.funnel.map((step) => (
                <div key={step.step} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#8B94A1] font-medium">{step.label}</span>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-[#E6E8EB] font-semibold">{step.count}</span>
                      <span className="text-[10px] text-[#566171]">({step.percentage}%)</span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#171A1F] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#C2A878] transition-all duration-300"
                      style={{ width: `${step.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </BrokerCard>

      </section>

      {/* 3. OPERATIONS: NEEDS ATTENTION & REFERRAL ENGINE */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Needs Your Attention Action Center */}
        <BrokerCard
          title="Needs Your Attention"
          subtitle="Required contract signatures, payment proofs, and onboarding checkpoints"
        >
          {pendingActions.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#8B94A1] space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400/80 mx-auto" />
              <p className="font-semibold text-[#E6E8EB]">All systems verified</p>
              <p className="text-[11px] text-[#566171]">No pending actions or urgent blockers requiring partner action.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#1E232B] -mx-5 -my-2">
              {pendingActions.map((action) => (
                <Link
                  key={action.id}
                  href={action.link}
                  className="flex items-center justify-between p-4 hover:bg-[#171A1F] transition-colors group"
                >
                  <div className="flex items-start gap-3 min-w-0 pr-4">
                    <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-[#E6E8EB] group-hover:text-[#C2A878] transition-colors truncate">
                        {action.title}
                      </h4>
                      {action.description && (
                        <p className="text-[11px] text-[#8B94A1] mt-0.5 line-clamp-1">
                          {action.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-[#C2A878] font-medium shrink-0 flex items-center gap-1 font-mono">
                    Complete <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              ))}
            </div>
          )}
        </BrokerCard>

        {/* Referral Engine Card */}
        <BrokerCard
          title="Partner Referral Engine"
          subtitle="Client attribution links and shareable messaging"
        >
          <div className="space-y-4">
            
            {/* Referral Code Display */}
            <div>
              <label className="block text-[11px] text-[#8B94A1] mb-1 font-medium font-mono uppercase">
                Active Partner Referral Code
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2 rounded-lg border border-[#22262D] bg-[#0E1013] text-sm font-mono text-[#E6E8EB] tracking-wider font-semibold">
                  {referralCode || "—"}
                </div>
                <BrokerButton
                  variant="secondary"
                  size="sm"
                  onClick={handleCopyCode}
                  icon={copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                >
                  {copiedCode ? "Copied" : "Copy Code"}
                </BrokerButton>
              </div>
            </div>

            {/* Direct Client Landing Link */}
            <div>
              <label className="block text-[11px] text-[#8B94A1] mb-1 font-medium font-mono uppercase">
                Direct Lead Intake URL
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2 rounded-lg border border-[#22262D] bg-[#0E1013] text-xs font-mono text-[#8B94A1] truncate">
                  {referralLink}
                </div>
                <BrokerButton
                  variant="secondary"
                  size="sm"
                  onClick={handleCopyLink}
                  icon={copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                >
                  {copiedLink ? "Copied" : "Copy"}
                </BrokerButton>
              </div>
            </div>

            {/* 1-Click Messaging Templates */}
            <div className="pt-2 border-t border-[#1E232B] flex items-center gap-2.5">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 px-3 rounded-lg border border-[#22262D] bg-[#171A1F] hover:bg-[#1E232B] text-xs text-[#E6E8EB] transition-colors flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp Share</span>
              </a>
              <a
                href={emailUrl}
                className="flex-1 py-2 px-3 rounded-lg border border-[#22262D] bg-[#171A1F] hover:bg-[#1E232B] text-xs text-[#E6E8EB] transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5 text-[#C2A878]" />
                <span>Email Invitation</span>
              </a>
            </div>

          </div>
        </BrokerCard>

      </section>

      {/* 4. ACTIVITY & MILESTONES */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Activity Timeline */}
        <BrokerCard
          title="Recent Activity Timeline"
          subtitle="Audit events across your leads, projects, contracts, and payouts"
          action={
            <Link href="/broker/activity" className="text-xs text-[#8B94A1] hover:text-[#E6E8EB] transition-colors font-mono">
              View Complete Feed →
            </Link>
          }
        >
          {!dashboard?.recentActivity || dashboard.recentActivity.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#8B94A1]">
              <span>No recorded partner activity yet.</span>
            </div>
          ) : (
            <div className="space-y-4">
              {dashboard.recentActivity.slice(0, 5).map((act) => (
                <div key={act.id} className="flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-[#C2A878] mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[#E6E8EB] font-medium">{act.action.replace(/_/g, " ")}</p>
                    <p className="text-[11px] text-[#8B94A1] font-mono mt-0.5">
                      {act.resource} · {formatDateIN(act.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </BrokerCard>

        {/* Upcoming Milestones */}
        <BrokerCard
          title="Upcoming Project Milestones"
          subtitle="Scheduled delivery phases for active referred projects"
          action={
            <Link href="/broker/projects" className="text-xs text-[#8B94A1] hover:text-[#E6E8EB] transition-colors font-mono">
              All Projects →
            </Link>
          }
        >
          {!dashboard?.recentMilestones || dashboard.recentMilestones.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#8B94A1]">
              <Clock className="w-6 h-6 text-[#566171] mx-auto mb-2" />
              <span>No upcoming milestones scheduled.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {dashboard.recentMilestones.map((m) => (
                <div key={m.id} className="p-3 rounded-lg border border-[#22262D] bg-[#0E1013] flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <p className="font-semibold text-[#E6E8EB] truncate">{m.title}</p>
                    <p className="text-[11px] text-[#8B94A1] mt-0.5 truncate">{m.projectName}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-[#C2A878] font-mono block">
                      Target: {formatDateIN(m.targetDate)}
                    </span>
                    <BrokerStatusBadge status={m.isCompleted ? "COMPLETED" : "IN_PROGRESS"} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </BrokerCard>

      </section>

      {/* Share Templates Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="rounded-xl border border-[#22262D] bg-[#111317] p-6 max-w-lg w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#1E232B] pb-3">
              <h3 className="text-sm font-semibold text-[#E6E8EB]">Shareable Referral Invitations</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-[#8B94A1] hover:text-[#E6E8EB] text-xs font-mono"
              >
                Close ✕
              </button>
            </div>

            <p className="text-xs text-[#8B94A1] leading-relaxed">
              Copy and send these pre-formatted messages to your prospective clients. Inbound inquiries will be 
              permanently credited to your partner account.
            </p>

            <div className="space-y-2">
              <label className="text-[11px] font-mono text-[#8B94A1]">WhatsApp / Direct Message Template</label>
              <div className="p-3 rounded-lg border border-[#22262D] bg-[#0E1013] text-xs text-[#E6E8EB] font-mono leading-relaxed select-all">
                {shareText}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <BrokerButton
                variant="secondary"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(shareText);
                  alert("Template copied to clipboard!");
                }}
                icon={<Copy className="w-3.5 h-3.5" />}
              >
                Copy Message
              </BrokerButton>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <BrokerButton
                  variant="primary"
                  size="sm"
                  icon={<MessageSquare className="w-3.5 h-3.5 text-[#0A0B0D]" />}
                >
                  Open WhatsApp
                </BrokerButton>
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
