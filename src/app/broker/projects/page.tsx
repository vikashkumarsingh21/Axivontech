"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Briefcase,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Building,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { BrokerPageHeader } from "@/components/broker/BrokerPageHeader";
import { BrokerCard } from "@/components/broker/BrokerCard";
import { BrokerButton } from "@/components/broker/BrokerButton";
import { BrokerStatusBadge } from "@/components/broker/BrokerStatusBadge";
import { BrokerSkeletonTable } from "@/components/broker/BrokerSkeleton";
import { BrokerEmptyState } from "@/components/broker/BrokerEmptyState";
import { formatCurrencyINR, formatDateIN } from "@/components/broker/BrokerFormatters";

interface ProjectItem {
  id: string;
  projectCode: string;
  projectName: string;
  clientName: string;
  clientEmail: string;
  companyName: string;
  requiredService: string;
  expectedTimeline?: string | null;
  projectBudget?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  contract?: {
    id: string;
    status: string;
    contractCode: string;
  } | null;
  payment?: {
    id: string;
    status: string;
    advanceAmount?: number | null;
  } | null;
  commission?: {
    id: string;
    commissionAmount: number;
    status: string;
  } | null;
}

export default function BrokerProjectsPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (statusFilter && statusFilter !== "ALL") params.set("status", statusFilter);
      params.set("page", currentPage.toString());
      params.set("limit", "15");

      const res = await fetch(`/api/v1/broker/projects?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setProjects(json.data || []);
        if (json.pagination) {
          setTotalCount(json.pagination.total || 0);
          setTotalPages(json.pagination.pages || json.pagination.totalPages || 1);
        }
      }
    } catch (err) {
      console.error("Failed to load projects:", err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, currentPage]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const metrics = useMemo(() => {
    const total = totalCount;
    const requested = projects.filter((p) => p.status === "PROJECT_REQUESTED" || p.status === "REVIEWING").length;
    const active = projects.filter(
      (p) => p.status === "PROJECT_CONFIRMED" || p.status === "IN_PROGRESS" || p.status === "CONTRACT_SIGNED"
    ).length;
    const completed = projects.filter((p) => p.status === "COMPLETED").length;
    return { total, requested, active, completed };
  }, [projects, totalCount]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <BrokerPageHeader
        title="Commercial Projects Pipeline"
        subtitle="Track submitted client contracts, milestone progress, deliverables, and commission accruals."
        badge={
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#C2A878]/10 text-[#C2A878] border border-[#C2A878]/25">
            <Briefcase className="w-3.5 h-3.5" />
            Contract Lifecycle
          </span>
        }
        actions={
          <Link href="/broker/projects/new">
            <BrokerButton variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}>
              Submit Project Referral
            </BrokerButton>
          </Link>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <BrokerCard className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#8B94A1]">Total Projects</span>
            <div className="w-8 h-8 rounded-lg bg-[#171A1F] flex items-center justify-center text-[#C2A878]">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-[#E6E8EB]">{totalCount}</div>
          <span className="text-[11px] text-[#566171]">Lifetime client submissions</span>
        </BrokerCard>

        <BrokerCard className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#8B94A1]">Under Review</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-400">{metrics.requested}</div>
          <span className="text-[11px] text-[#566171]">Feasibility & pricing scoping</span>
        </BrokerCard>

        <BrokerCard className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#8B94A1]">Active Engagements</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-blue-400">{metrics.active}</div>
          <span className="text-[11px] text-[#566171]">In engineering or contracting</span>
        </BrokerCard>

        <BrokerCard className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#8B94A1]">Delivered & Closed</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-400">{metrics.completed}</div>
          <span className="text-[11px] text-[#566171]">Fully settled contracts</span>
        </BrokerCard>
      </div>

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
            placeholder="Search by code, title, client, company..."
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
            <option value="ALL">All Project Statuses</option>
            <option value="PROJECT_REQUESTED">Requested</option>
            <option value="REVIEWING">Reviewing</option>
            <option value="PROPOSAL_SENT">Proposal Sent</option>
            <option value="CONTRACT_SENT">Contract Sent</option>
            <option value="CONTRACT_SIGNED">Contract Signed</option>
            <option value="PAYMENT_PENDING">Payment Pending</option>
            <option value="PROJECT_CONFIRMED">Confirmed</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Projects Table */}
      {loading ? (
        <BrokerSkeletonTable rows={6} cols={6} />
      ) : projects.length === 0 ? (
        <BrokerEmptyState
          type="projects"
          title="No Projects Found"
          description={
            search || statusFilter !== "ALL"
              ? "No commercial projects matched your filter settings."
              : "You haven't submitted any client projects yet. Initiate your first project referral to start earning commissions."
          }
          actionLabel="Submit Project Referral"
          actionHref="/broker/projects/new"
        />
      ) : (
        <BrokerCard noPadding className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0E1013] border-b border-[#1E232B] text-[#8B94A1] uppercase font-mono tracking-wider">
                <tr>
                  <th className="px-5 py-3 font-semibold">Project Code</th>
                  <th className="px-5 py-3 font-semibold">Project & Service</th>
                  <th className="px-5 py-3 font-semibold">Client & Company</th>
                  <th className="px-5 py-3 font-semibold">Project Status</th>
                  <th className="px-5 py-3 font-semibold">Contract</th>
                  <th className="px-5 py-3 font-semibold">Payment</th>
                  <th className="px-5 py-3 font-semibold">Submitted</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E232B] text-[#D0D4DC]">
                {projects.map((proj) => (
                  <tr
                    key={proj.id}
                    className="hover:bg-[#171A1F]/60 transition-colors group cursor-pointer"
                  >
                    <td className="px-5 py-3.5 font-mono text-[#C2A878] font-medium whitespace-nowrap">
                      <Link href={`/broker/projects/${proj.id}`} className="hover:underline">
                        {proj.projectCode}
                      </Link>
                    </td>

                    <td className="px-5 py-3.5">
                      <Link
                        href={`/broker/projects/${proj.id}`}
                        className="font-semibold text-[#E6E8EB] group-hover:text-[#C2A878] transition-colors block max-w-[200px] truncate"
                      >
                        {proj.projectName}
                      </Link>
                      <span className="text-[11px] text-[#8B94A1]">{proj.requiredService}</span>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="text-[#E6E8EB] font-medium">{proj.clientName}</div>
                      <div className="text-[11px] text-[#566171]">{proj.companyName}</div>
                    </td>

                    <td className="px-5 py-3.5">
                      <BrokerStatusBadge status={proj.status} category="project" />
                    </td>

                    <td className="px-5 py-3.5">
                      {proj.contract ? (
                        <BrokerStatusBadge status={proj.contract.status} category="contract" />
                      ) : (
                        <span className="text-[#566171] text-[11px]">—</span>
                      )}
                    </td>

                    <td className="px-5 py-3.5">
                      {proj.payment ? (
                        <BrokerStatusBadge status={proj.payment.status} category="payment" />
                      ) : (
                        <span className="text-[#566171] text-[11px]">—</span>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-[#8B94A1] whitespace-nowrap">
                      {formatDateIN(proj.createdAt)}
                    </td>

                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <Link
                        href={`/broker/projects/${proj.id}`}
                        className="text-xs text-[#C2A878] hover:text-[#D4BC8B] font-medium inline-flex items-center gap-1"
                      >
                        <span>Manage</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="px-5 py-3 border-t border-[#1E232B] bg-[#0E1013] flex items-center justify-between text-xs text-[#8B94A1]">
              <span>
                Showing {projects.length} of {totalCount} projects
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
    </div>
  );
}
