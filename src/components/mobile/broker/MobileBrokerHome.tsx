"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  Briefcase,
  Coins,
  Copy,
  Check,
  Share2,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  FolderOpen,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { CardList, type CardListItem } from "../CardList";

interface MobileBrokerHomeProps {
  initialData?: any;
  onRefresh?: () => Promise<void>;
}

export function MobileBrokerHome({ initialData, onRefresh }: MobileBrokerHomeProps) {
  const [data, setData] = useState<any>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/v1/broker/dashboard?fresh=1");
      if (!res.ok) throw new Error("Failed to load partner dashboard");
      const json = await res.json();
      setData(json.data);
    } catch (e: any) {
      setError(e.message || "Failed to load broker data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!initialData) {
      fetchDashboard();
    }
  }, [initialData, fetchDashboard]);

  const handlePullRefresh = async () => {
    setRefreshing(true);
    if (onRefresh) {
      await onRefresh();
    }
    await fetchDashboard();
  };

  const copyReferralCode = () => {
    const code = data?.profile?.referralCode || "";
    if (!code) return;
    navigator.clipboard?.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (loading && !data) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-32 rounded-2xl bg-white border border-slate-200" />
        <div className="grid grid-cols-2 gap-2.5">
          <div className="h-24 rounded-2xl bg-white border border-slate-200" />
          <div className="h-24 rounded-2xl bg-white border border-slate-200" />
        </div>
        <div className="h-44 rounded-2xl bg-white border border-slate-200" />
      </div>
    );
  }

  const profile = data?.profile || {};
  const stats = data?.stats || {};
  const earnings = stats?.earnings || {};
  const leads = stats?.leads || {};
  const projects = stats?.projects || {};
  const recentLeads = data?.recentLeads || [];

  const formatINR = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const leadCardItems: CardListItem[] = recentLeads.slice(0, 4).map((lead: any) => ({
    id: lead.id,
    title: lead.name,
    subtitle: lead.companyName || "Client Lead",
    status: {
      label: lead.status || "NEW",
      variant:
        lead.status === "CONVERTED" || lead.status === "QUALIFIED"
          ? "success"
          : lead.status === "LOST"
          ? "error"
          : "accent",
    },
    fields: [
      {
        label: "Registered",
        value: lead.createdAt
          ? new Date(lead.createdAt).toLocaleDateString("en-IN", {
              month: "short",
              day: "numeric",
            })
          : "—",
      },
      {
        label: "Stage",
        value: lead.status === "CONVERTED" ? "Client Onboarded" : "In Pipeline",
      },
    ],
    href: `/broker/leads`,
  }));

  return (
    <div className="space-y-4">
      {/* ── Error Banner ────────────────────────────────────────────────── */}
      {Boolean(error) && (
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs shadow-xs">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span className="flex-1 font-medium">{error}</span>
          <button
            type="button"
            onClick={() => fetchDashboard()}
            className="text-teal-700 hover:underline font-semibold"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Referral Code & Partner Identity Card (Axivon Gold Accent) ─── */}
      <section className="rounded-2xl bg-gradient-to-br from-amber-500/10 via-white to-teal-500/5 border border-amber-200/80 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 block">
              Authorized Business Partner
            </span>
            <h2 className="text-base font-bold text-slate-900">
              {profile.name || "Axivon Partner"}
            </h2>
          </div>

          <button
            type="button"
            onClick={handlePullRefresh}
            disabled={refreshing}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-600 active:scale-95 transition-transform shadow-xs"
            aria-label="Refresh Dashboard"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-teal-600" : ""}`} />
          </button>
        </div>

        {/* Referral Code Pill */}
        <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Your Referral Code
            </span>
            <span className="text-sm font-mono font-extrabold text-slate-900 tracking-wider">
              {profile.referralCode || "AXIVON-PARTNER"}
            </span>
          </div>

          <button
            type="button"
            onClick={copyReferralCode}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-white border border-amber-300 text-amber-900 text-xs font-bold hover:bg-amber-50 active:scale-95 transition-transform shadow-xs"
          >
            {copiedCode ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-amber-700" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* ── Partner Commission & Earnings Card ─────────────────────────── */}
      <section className="rounded-2xl bg-white border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
              <Coins className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Total Commission Earned
              </span>
              <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
                {formatINR(earnings.totalEarned || 0)}
              </div>
            </div>
          </div>

          <Link
            href="/broker/commissions"
            className="text-xs font-bold text-teal-600 flex items-center gap-1 hover:underline"
          >
            <span>Payouts</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Pending / In Review
            </span>
            <span className="text-sm font-extrabold text-amber-600 tabular-nums">
              {formatINR(earnings.pendingAmount || earnings.requestedAmount || 0)}
            </span>
          </div>

          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Eligible for Payout
            </span>
            <span className="text-sm font-extrabold text-emerald-600 tabular-nums">
              {formatINR(earnings.eligibleAmount || 0)}
            </span>
          </div>
        </div>
      </section>

      {/* ── Quick Action: Register New Lead Button ──────────────────────── */}
      <Link
        href="/broker/leads"
        className="flex items-center justify-center gap-2 h-12 w-full rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-xs active:scale-[0.99] transition-all"
      >
        <PlusCircle className="h-4 w-4" />
        <span>+ Register New Client Lead</span>
      </Link>

      {/* ── Pipeline Statistics Grid ────────────────────────────────────── */}
      <section className="grid grid-cols-3 gap-2.5">
        <Link
          href="/broker/leads"
          className="rounded-2xl bg-white border border-slate-200/90 p-3.5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
        >
          <span className="text-[11px] font-semibold text-slate-500">Total Leads</span>
          <span className="text-xl font-extrabold text-slate-900 tabular-nums mt-1">
            {leads.total ?? recentLeads.length ?? 0}
          </span>
          <span className="text-[10px] font-medium text-slate-400 mt-0.5">Registered</span>
        </Link>

        <Link
          href="/broker/leads"
          className="rounded-2xl bg-white border border-slate-200/90 p-3.5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
        >
          <span className="text-[11px] font-semibold text-slate-500">Active</span>
          <span className="text-xl font-extrabold text-teal-600 tabular-nums mt-1">
            {leads.active ?? 0}
          </span>
          <span className="text-[10px] font-medium text-teal-600 mt-0.5">In Progress</span>
        </Link>

        <Link
          href="/broker/projects"
          className="rounded-2xl bg-white border border-slate-200/90 p-3.5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
        >
          <span className="text-[11px] font-semibold text-slate-500">Projects</span>
          <span className="text-xl font-extrabold text-emerald-600 tabular-nums mt-1">
            {projects.TOTAL ?? 0}
          </span>
          <span className="text-[10px] font-medium text-emerald-600 mt-0.5">Won & Active</span>
        </Link>
      </section>

      {/* ── Recent Leads Pipeline ───────────────────────────────────────── */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-slate-900">Recent Lead Pipeline</h2>
          <Link
            href="/broker/leads"
            className="text-xs font-semibold text-teal-600 flex items-center gap-1 hover:underline"
          >
            <span>View All Leads</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <CardList
          items={leadCardItems}
          emptyTitle="No leads registered yet"
          emptyDescription="Register your first client lead to start earning partnership commissions."
        />
      </section>
    </div>
  );
}
