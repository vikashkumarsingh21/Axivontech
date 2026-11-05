"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  Briefcase,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  CalendarCheck,
  CheckSquare,
  ShieldCheck,
  AlertCircle,
  FolderOpen,
  RefreshCw,
  Loader2,
  Sparkles,
} from "lucide-react";
import { CardList, type CardListItem } from "../CardList";

interface MobileAdminHomeProps {
  initialData?: any;
  onRefresh?: () => Promise<void>;
}

export function MobileAdminHome({ initialData, onRefresh }: MobileAdminHomeProps) {
  const [data, setData] = useState<any>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/v1/admin/dashboard/summary");
      if (!res.ok) throw new Error("Failed to load admin summary");
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
        <div className="h-48 rounded-2xl bg-white border border-slate-200" />
      </div>
    );
  }

  const summary = data?.summary || {};
  const recentLeads = data?.recentLeads || [];
  const recentActivity = data?.recentActivity || [];

  const leadCardItems: CardListItem[] = recentLeads.slice(0, 4).map((lead: any) => ({
    id: lead.id,
    title: lead.name,
    subtitle: lead.companyName || lead.email || "Lead Inquiry",
    status: {
      label: lead.status || "NEW",
      variant:
        lead.status === "QUALIFIED" || lead.status === "CONVERTED"
          ? "success"
          : lead.status === "LOST"
          ? "error"
          : "accent",
    },
    fields: [
      {
        label: "Source",
        value: lead.source || "WEBSITE",
      },
      {
        label: "Created",
        value: lead.createdAt
          ? new Date(lead.createdAt).toLocaleDateString("en-IN", {
              month: "short",
              day: "numeric",
            })
          : "—",
      },
    ],
    href: `/admin/crm/leads`,
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
            onClick={() => fetchSummary()}
            className="text-teal-700 hover:underline font-semibold"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Executive Operations Hero Card (Light Enterprise) ───────────── */}
      <section className="rounded-2xl bg-white border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Executive Control
              </span>
              <h2 className="text-sm font-bold text-slate-900">Admin Operations Hub</h2>
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
            <span>Central Lead Intelligence & Health</span>
          </div>
          <span className="text-slate-400 text-[11px]">
            {new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
          </span>
        </div>
      </section>

      {/* ── 4 KPI Grid (Clean White Cards) ──────────────────────────────── */}
      <section className="grid grid-cols-2 gap-2.5">
        <Link
          href="/admin/employees"
          className="rounded-2xl bg-white border border-slate-200/90 p-4 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Employees</span>
            <div className="h-7 w-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Users className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {summary.totalEmployees ?? 0}
            </div>
            <span className="text-[10px] font-medium text-slate-500">Active Team</span>
          </div>
        </Link>

        <Link
          href="/admin/projects"
          className="rounded-2xl bg-white border border-slate-200/90 p-4 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Projects</span>
            <div className="h-7 w-7 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
              <Briefcase className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {summary.activeProjects ?? 0}
            </div>
            <span className="text-[10px] font-medium text-teal-600">In Delivery</span>
          </div>
        </Link>

        <Link
          href="/admin/business-partners/applications"
          className="rounded-2xl bg-white border border-slate-200/90 p-4 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Partner Apps</span>
            <div className="h-7 w-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <FileCheck2 className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {summary.pendingPartnerApplications ?? 0}
            </div>
            <span className="text-[10px] font-medium text-amber-600">Pending Review</span>
          </div>
        </Link>

        <Link
          href="/admin/crm/leads"
          className="rounded-2xl bg-white border border-slate-200/90 p-4 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">CRM Leads</span>
            <div className="h-7 w-7 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {summary.inboundLeads ?? 0}
            </div>
            <span className="text-[10px] font-medium text-purple-600">Total Inquiries</span>
          </div>
        </Link>
      </section>

      {/* ── Quick Action Tiles (Light) ─────────────────────────────────── */}
      <section className="grid grid-cols-4 gap-2">
        <Link
          href="/admin/leave"
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 active:scale-95 transition-all"
        >
          <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mb-1.5">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <span className="text-[11px] font-semibold text-slate-800 text-center leading-tight">
            Approvals
          </span>
        </Link>

        <Link
          href="/admin/attendance"
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 active:scale-95 transition-all"
        >
          <div className="h-10 w-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mb-1.5">
            <CalendarCheck className="h-5 w-5" />
          </div>
          <span className="text-[11px] font-semibold text-slate-800 text-center leading-tight">
            Attendance
          </span>
        </Link>

        <Link
          href="/admin/tasks"
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 active:scale-95 transition-all"
        >
          <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-1.5">
            <CheckSquare className="h-5 w-5" />
          </div>
          <span className="text-[11px] font-semibold text-slate-800 text-center leading-tight">
            Tasks
          </span>
        </Link>

        <Link
          href="/admin/reports"
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 active:scale-95 transition-all"
        >
          <div className="h-10 w-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 mb-1.5">
            <FolderOpen className="h-5 w-5" />
          </div>
          <span className="text-[11px] font-semibold text-slate-800 text-center leading-tight">
            Reports
          </span>
        </Link>
      </section>

      {/* ── Recent Inbound Leads ────────────────────────────────────────── */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-slate-900">Recent CRM Leads</h2>
          <Link
            href="/admin/crm/leads"
            className="text-xs font-semibold text-teal-600 flex items-center gap-1 hover:underline"
          >
            <span>View All</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <CardList
          items={leadCardItems}
          emptyTitle="No leads yet"
          emptyDescription="Inbound contact requests and partner referrals will appear here."
        />
      </section>
    </div>
  );
}
