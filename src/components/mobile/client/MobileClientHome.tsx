"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Briefcase,
  FileText,
  CreditCard,
  HelpCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  FolderOpen,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { CardList, type CardListItem } from "../CardList";

interface MobileClientHomeProps {
  initialProjects?: any[];
  onRefresh?: () => Promise<void>;
}

export function MobileClientHome({ initialProjects, onRefresh }: MobileClientHomeProps) {
  const [projects, setProjects] = useState<any[]>(initialProjects || []);
  const [loading, setLoading] = useState(!initialProjects);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/v1/client/projects");
      if (!res.ok) throw new Error("Failed to load projects");
      const json = await res.json();
      if (json?.data) {
        setProjects(json.data);
      }
    } catch (e: any) {
      setError(e.message || "Failed to load project details");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!initialProjects) {
      fetchProjects();
    }
  }, [initialProjects, fetchProjects]);

  const handlePullRefresh = async () => {
    setRefreshing(true);
    if (onRefresh) {
      await onRefresh();
    }
    await fetchProjects();
  };

  if (loading && projects.length === 0) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-28 rounded-2xl bg-white border border-slate-200" />
        <div className="grid grid-cols-2 gap-2.5">
          <div className="h-20 rounded-2xl bg-white border border-slate-200" />
          <div className="h-20 rounded-2xl bg-white border border-slate-200" />
        </div>
        <div className="h-44 rounded-2xl bg-white border border-slate-200" />
      </div>
    );
  }

  const inProgressCount = projects.filter(
    (p) => p.status === "IN_PROGRESS" || p.status === "ACTIVE"
  ).length;
  const completedCount = projects.filter(
    (p) => p.status === "COMPLETED" || p.status === "DELIVERED"
  ).length;

  const projectCardItems: CardListItem[] = projects.map((proj) => ({
    id: proj.id,
    title: proj.projectName,
    subtitle: proj.projectCode || "Client Engagement",
    status: {
      label: proj.status || "IN_PROGRESS",
      variant:
        proj.status === "COMPLETED" || proj.status === "DELIVERED"
          ? "success"
          : "accent",
    },
    fields: [
      {
        label: "Progress",
        value: `${proj.progressPercentage || 0}%`,
      },
      {
        label: "Target Date",
        value: proj.expectedDeliveryDate
          ? new Date(proj.expectedDeliveryDate).toLocaleDateString("en-IN", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "In Progress",
      },
    ],
    action: (
      <div className="space-y-2 pt-2 border-t border-slate-100">
        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-teal-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(0, proj.progressPercentage || 0))}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs font-semibold text-teal-600">
          <span>Project Workspace</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </div>
      </div>
    ),
    href: `/client/projects`,
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
            onClick={() => fetchProjects()}
            className="text-teal-700 hover:underline font-semibold"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Client Workspace Header Card (Light Enterprise) ─────────────── */}
      <section className="rounded-2xl bg-white border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
              <Briefcase className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Client Workspace
              </span>
              <h2 className="text-base font-bold text-slate-900">Active Deliverables</h2>
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
          <span className="text-slate-600 font-medium">Real-time status, milestone tracking & deliverables</span>
          <span className="text-slate-400 text-[11px]">
            {new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
          </span>
        </div>
      </section>

      {/* ── Summary Strip ──────────────────────────────────────────────── */}
      <section className="grid grid-cols-2 gap-2.5">
        <div className="rounded-2xl bg-white border border-slate-200/90 p-4 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500">Active Projects</span>
          <div className="text-2xl font-extrabold text-teal-700 tabular-nums mt-1">
            {inProgressCount || projects.length}
          </div>
          <span className="text-[10px] font-medium text-teal-600 mt-0.5">In Progress</span>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200/90 p-4 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500">Completed</span>
          <div className="text-2xl font-extrabold text-emerald-700 tabular-nums mt-1">
            {completedCount}
          </div>
          <span className="text-[10px] font-medium text-emerald-600 mt-0.5">Delivered</span>
        </div>
      </section>

      {/* ── Quick Action Tiles (Light) ─────────────────────────────────── */}
      <section className="grid grid-cols-3 gap-2">
        <Link
          href="/client/documents"
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 active:scale-95 transition-all"
        >
          <div className="h-10 w-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mb-1.5">
            <FileText className="h-5 w-5" />
          </div>
          <span className="text-[11px] font-semibold text-slate-800 text-center leading-tight">
            Documents
          </span>
        </Link>

        <Link
          href="/client/invoices"
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 active:scale-95 transition-all"
        >
          <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-1.5">
            <CreditCard className="h-5 w-5" />
          </div>
          <span className="text-[11px] font-semibold text-slate-800 text-center leading-tight">
            Invoices
          </span>
        </Link>

        <Link
          href="/client/support"
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 active:scale-95 transition-all"
        >
          <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mb-1.5">
            <HelpCircle className="h-5 w-5" />
          </div>
          <span className="text-[11px] font-semibold text-slate-800 text-center leading-tight">
            Support
          </span>
        </Link>
      </section>

      {/* ── Active Projects List ────────────────────────────────────────── */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-slate-900">Your Project Portfolio</h2>
          <span className="text-xs text-slate-400 font-medium">
            {projects.length} Total
          </span>
        </div>

        <CardList
          items={projectCardItems}
          emptyTitle="No projects allocated"
          emptyDescription="Your active project deliverables and milestone timelines will appear here."
        />
      </section>
    </div>
  );
}
