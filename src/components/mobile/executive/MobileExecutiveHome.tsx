"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  Briefcase,
  CheckCircle2,
  BarChart3,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
  Building2,
  TrendingUp,
  Award,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface MobileExecutiveHomeProps {
  initialData?: any;
  onRefresh?: () => Promise<void>;
}

export function MobileExecutiveHome({ initialData, onRefresh }: MobileExecutiveHomeProps) {
  const [data, setData] = useState<any>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/v1/executive/dashboard/summary");
      if (!res.ok) throw new Error("Failed to load executive summary");
      const json = await res.json();
      setData(json.data);
    } catch (e: any) {
      setError(e.message || "Failed to load summary");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!initialData) {
      fetchSummary();
    }
  }, [initialData, fetchSummary]);

  const handlePullRefresh = async () => {
    setRefreshing(true);
    if (onRefresh) {
      await onRefresh();
    }
    await fetchSummary();
  };

  if (loading && !data) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-28 rounded-2xl bg-white border border-slate-200" />
        <div className="grid grid-cols-2 gap-2.5">
          <div className="h-24 rounded-2xl bg-white border border-slate-200" />
          <div className="h-24 rounded-2xl bg-white border border-slate-200" />
          <div className="h-24 rounded-2xl bg-white border border-slate-200" />
          <div className="h-24 rounded-2xl bg-white border border-slate-200" />
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const scope = data?.scope || {};

  return (
    <div className="space-y-4">
      {/* ── Error Banner ────────────────────────────────────────────────── */}
      {Boolean(error) && (
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs shadow-xs">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span className="flex-1 font-medium">{error}</span>
          <button
            type="button"
            onClick={() => fetchSummary()}
            className="text-teal-700 hover:underline font-semibold"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Executive Leadership Card (Light Enterprise) ────────────────── */}
      <section className="rounded-2xl bg-white border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Executive Dossier
              </span>
              <h2 className="text-sm font-bold text-slate-900">
                {scope.role === "FOUNDER" ? "Founder Oversight" : "Executive Leadership"}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePullRefresh}
            disabled={refreshing}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 active:scale-95 transition-transform"
            aria-label="Refresh Dashboard"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-teal-600" : ""}`} />
          </button>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-600 font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Profile: {scope.responsibilityProfile || "General Executive"}</span>
          </div>
          <span className="text-slate-400 text-[11px]">
            {new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
          </span>
        </div>
      </section>

      {/* ── Strategic KPI Cards (Clean White Surfaces) ──────────────────── */}
      <section className="grid grid-cols-2 gap-2.5">
        <Link
          href="/executive/people"
          className="rounded-2xl bg-white border border-slate-200/90 p-4 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Total Headcount</span>
            <div className="h-7 w-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Users className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {kpis.totalEmployees ?? 0}
            </div>
            <span className="text-[10px] font-medium text-slate-500">Employees & Staff</span>
          </div>
        </Link>

        <Link
          href="/executive/reports"
          className="rounded-2xl bg-white border border-slate-200/90 p-4 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Deliverables</span>
            <div className="h-7 w-7 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
              <Briefcase className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {kpis.activeProjects ?? 0}
            </div>
            <span className="text-[10px] font-medium text-teal-600">Active Engagements</span>
          </div>
        </Link>

        <Link
          href="/executive/approvals"
          className="rounded-2xl bg-white border border-slate-200/90 p-4 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Approvals</span>
            <div className="h-7 w-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {kpis.pendingApprovals ?? 0}
            </div>
            <span className="text-[10px] font-medium text-amber-600">Awaiting Sign-off</span>
          </div>
        </Link>

        <Link
          href="/executive/reports"
          className="rounded-2xl bg-white border border-slate-200/90 p-4 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Org Health</span>
            <div className="h-7 w-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-emerald-700 tabular-nums">
              {kpis.orgHealth || "100%"}
            </div>
            <span className="text-[10px] font-medium text-emerald-600">Operational Index</span>
          </div>
        </Link>
      </section>

      {/* ── Executive Quick Navigation Tiles ───────────────────────────── */}
      <section className="grid grid-cols-2 gap-2.5">
        <Link
          href="/executive/approvals"
          className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 active:scale-98 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Pending Sign-offs</span>
              <span className="text-[11px] text-slate-500">Leaves, budgets, contracts</span>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400" />
        </Link>

        <Link
          href="/executive/people"
          className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 active:scale-98 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Leadership & Staff</span>
              <span className="text-[11px] text-slate-500">Department directories</span>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400" />
        </Link>

        <Link
          href="/executive/reports"
          className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 active:scale-98 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Quarterly Reports</span>
              <span className="text-[11px] text-slate-500">Finance & operations</span>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400" />
        </Link>

        <Link
          href="/executive/settings"
          className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 active:scale-98 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Org Settings</span>
              <span className="text-[11px] text-slate-500">Governance & parameters</span>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400" />
        </Link>
      </section>
    </div>
  );
}
