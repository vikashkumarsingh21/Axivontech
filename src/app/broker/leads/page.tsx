"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  LayoutList,
  Kanban,
  Filter,
  Calendar,
  X,
  User,
  Building,
  Mail,
  Phone,
  MessageSquare,
  Clock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Share2,
  Copy,
  Check,
  TrendingUp,
  FileText,
  DollarSign,
} from "lucide-react";
import { BrokerPageHeader } from "@/components/broker/BrokerPageHeader";
import { BrokerCard } from "@/components/broker/BrokerCard";
import { BrokerButton } from "@/components/broker/BrokerButton";
import { BrokerStatusBadge } from "@/components/broker/BrokerStatusBadge";
import { BrokerSkeletonTable, BrokerSkeletonCard } from "@/components/broker/BrokerSkeleton";
import { BrokerEmptyState } from "@/components/broker/BrokerEmptyState";
import { formatCurrencyINR, formatDateIN } from "@/components/broker/BrokerFormatters";
import { parseApiResponse, getErrorMessage } from "@/lib/errors/client";
import { toast } from "@/lib/notifications/toast";

interface Activity {
  id: string;
  type: string;
  title: string;
  createdAt: string;
}

interface BrokerLead {
  id: string;
  leadCode: string;
  name: string;
  email: string;
  phone: string;
  whatsapp?: string | null;
  companyName?: string | null;
  designation?: string | null;
  industry?: string | null;
  city?: string | null;
  serviceInterest: string;
  message?: string | null;
  budget?: number | string | null;
  timeline?: string | null;
  status: "NEW" | "CONTACTED" | "INTERESTED" | "QUALIFIED" | "CONVERTED" | "LOST";
  qualificationStatus?: string | null;
  source: string;
  createdAt: string;
  updatedAt: string;
  activities?: Activity[];
}

const SERVICE_OPTIONS = [
  "Custom Software Development",
  "Enterprise Web Application",
  "Mobile App (iOS & Android)",
  "Cloud & DevOps Architecture",
  "AI & Machine Learning Solutions",
  "UI/UX Product Design",
  "Cybersecurity & Compliance",
  "Dedicated Developer Team",
];

const KANBAN_STAGES = [
  { key: "NEW", label: "New Inquiries", description: "Freshly submitted leads" },
  { key: "CONTACTED", label: "Contacted", description: "Initial discovery call in progress" },
  { key: "QUALIFIED", label: "Qualified", description: "Technical scope & budget verified" },
  { key: "CONVERTED", label: "Converted", description: "Advanced to client project" },
  { key: "LOST", label: "Archived / Lost", description: "Not proceeding at this time" },
];

export default function BrokerLeadsPage() {
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
  const [leads, setLeads] = useState<BrokerLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalLeads, setTotalLeads] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  // Drawer & Modal State
  const [selectedLead, setSelectedLead] = useState<BrokerLead | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // Add Lead Form State
  const [submittingLead, setSubmittingLead] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formWarning, setFormWarning] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [newLead, setNewLead] = useState({
    name: "",
    email: "",
    phone: "",
    whatsapp: "",
    companyName: "",
    designation: "",
    industry: "",
    city: "",
    serviceInterest: SERVICE_OPTIONS[0],
    budget: "",
    timeline: "4-8 weeks",
    message: "",
  });

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (statusFilter && statusFilter !== "ALL") params.set("status", statusFilter);
      if (fromDate) params.set("from", fromDate);
      if (toDate) params.set("to", toDate);
      params.set("sortBy", sortBy);
      params.set("sortOrder", sortOrder);
      params.set("page", currentPage.toString());
      params.set("limit", "15");

      const res = await fetch(`/api/v1/broker/leads?${params.toString()}`);
      const parsed = await parseApiResponse(res);

      if (!parsed.ok) {
        toast.error(parsed.errorMessage || "Failed to load leads");
        return;
      }

      const json = parsed.data || parsed.raw;
      setLeads(json?.data || []);
      if (json?.pagination) {
        setTotalLeads(json.pagination.total || 0);
        setTotalPages(json.pagination.pages || json.pagination.totalPages || 1);
      }
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      console.error("Failed to load leads:", err);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, fromDate, toDate, sortBy, sortOrder, currentPage]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Compute metrics from current dataset
  const metrics = useMemo(() => {
    const total = totalLeads;
    const newCount = leads.filter((l) => l.status === "NEW").length;
    const qualifiedCount = leads.filter((l) => l.status === "QUALIFIED").length;
    const convertedCount = leads.filter((l) => l.status === "CONVERTED").length;
    return { total, newCount, qualifiedCount, convertedCount };
  }, [leads, totalLeads]);

  // Handle Add Lead Form Submission
  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormWarning(null);

    if (!newLead.name.trim()) {
      setFormError("Client name is required");
      return;
    }
    if (!newLead.email.trim() || !newLead.email.includes("@")) {
      setFormError("Valid client email is required");
      return;
    }
    if (!newLead.phone.trim()) {
      setFormError("Client mobile number is required");
      return;
    }
    if (!newLead.message.trim()) {
      setFormError("Please provide requirement details");
      return;
    }

    try {
      setSubmittingLead(true);
      const res = await fetch("/api/v1/broker/leads/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newLead,
          budget: newLead.budget ? Number(newLead.budget.replace(/[^0-9]/g, "")) : null,
        }),
      });

      const parsed = await parseApiResponse(res);
      if (!parsed.ok) {
        const msg = parsed.errorMessage || "Failed to submit lead";
        setFormError(msg);
        toast.error(msg);
        return;
      }

      const json = parsed.data || parsed.raw;
      if (json?.warning) {
        setFormWarning(json.warning);
        toast.warning(json.warning);
      } else {
        const successMsg = `Lead ${json?.leadCode || ""} recorded successfully!`;
        setFormSuccess(successMsg);
        toast.success(successMsg);
      }

      fetchLeads();
      setTimeout(() => {
        setIsAddModalOpen(false);
        setFormSuccess(null);
        setFormWarning(null);
        setNewLead({
          name: "",
          email: "",
          phone: "",
          whatsapp: "",
          companyName: "",
          designation: "",
          industry: "",
          city: "",
          serviceInterest: SERVICE_OPTIONS[0],
          budget: "",
          timeline: "4-8 weeks",
          message: "",
        });
      }, 1500);
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      setFormError(msg);
      toast.error(msg);
    } finally {
      setSubmittingLead(false);
    }
  };

  const copyReferralUrl = () => {
    navigator.clipboard.writeText(`${window.location.origin}/business-partner`);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <BrokerPageHeader
        title="Leads & Prospects Pipeline"
        subtitle="Manage and track prospective client referrals, requirement stages, and deal conversions."
        badge={
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#C2A878]/10 text-[#C2A878] border border-[#C2A878]/25">
            <TrendingUp className="w-3.5 h-3.5" />
            Active Deal Flow
          </span>
        }
        actions={
          <div className="flex items-center gap-2.5">
            <BrokerButton
              variant="secondary"
              size="sm"
              onClick={copyReferralUrl}
              icon={copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            >
              {copiedText ? "Link Copied" : "Share Intake Link"}
            </BrokerButton>

            <BrokerButton
              variant="primary"
              size="sm"
              onClick={() => {
                setFormError(null);
                setFormWarning(null);
                setFormSuccess(null);
                setIsAddModalOpen(true);
              }}
              icon={<Plus className="w-4 h-4" />}
            >
              Submit New Lead
            </BrokerButton>
          </div>
        }
      />

      {/* Metrics Counter Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <BrokerCard className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#8B94A1]">Total Attributed Leads</span>
            <div className="w-8 h-8 rounded-lg bg-[#171A1F] flex items-center justify-center text-[#C2A878]">
              <User className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-[#E6E8EB]">{totalLeads}</div>
          <span className="text-[11px] text-[#566171]">Lifetime broker registrations</span>
        </BrokerCard>

        <BrokerCard className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#8B94A1]">New Inquiries</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-blue-400">{metrics.newCount}</div>
          <span className="text-[11px] text-[#566171]">Awaiting tech qualification</span>
        </BrokerCard>

        <BrokerCard className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#8B94A1]">Qualified Prospects</span>
            <div className="w-8 h-8 rounded-lg bg-[#C2A878]/10 flex items-center justify-center text-[#C2A878]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-[#C2A878]">{metrics.qualifiedCount}</div>
          <span className="text-[11px] text-[#566171]">Scope confirmed & scoped</span>
        </BrokerCard>

        <BrokerCard className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#8B94A1]">Closed Conversions</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-400">{metrics.convertedCount}</div>
          <span className="text-[11px] text-[#566171]">Yielding broker commissions</span>
        </BrokerCard>
      </div>

      {/* Filter and View Switcher Toolbar */}
      <div className="p-4 rounded-xl border border-[#22262D] bg-[#111317] flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Search & Filters */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#566171]" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by client, company, lead code..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#171A1F] border border-[#22262D] text-xs text-[#E6E8EB] placeholder-[#566171] focus:outline-none focus:border-[#C2A878]"
            />
          </div>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 rounded-lg bg-[#171A1F] border border-[#22262D] text-xs text-[#E6E8EB] focus:outline-none focus:border-[#C2A878]"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="CONVERTED">Converted</option>
            <option value="LOST">Lost</option>
          </select>

          {/* Date Range Picker */}
          <div className="flex items-center gap-1.5 text-xs text-[#8B94A1]">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-[#171A1F] border border-[#22262D] text-xs text-[#E6E8EB] focus:outline-none focus:border-[#C2A878]"
            />
            <span>to</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-[#171A1F] border border-[#22262D] text-xs text-[#E6E8EB] focus:outline-none focus:border-[#C2A878]"
            />
          </div>
        </div>

        {/* Right: View Mode Toggle */}
        <div className="flex items-center gap-1 bg-[#0E1013] p-1 rounded-lg border border-[#22262D] shrink-0 self-end md:self-auto">
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              viewMode === "table"
                ? "bg-[#C2A878] text-[#0A0B0D]"
                : "text-[#8B94A1] hover:text-[#E6E8EB]"
            }`}
          >
            <LayoutList className="w-3.5 h-3.5" />
            <span>Table</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("kanban")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              viewMode === "kanban"
                ? "bg-[#C2A878] text-[#0A0B0D]"
                : "text-[#8B94A1] hover:text-[#E6E8EB]"
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>Pipeline</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <BrokerSkeletonTable rows={6} cols={6} />
      ) : leads.length === 0 ? (
        <BrokerEmptyState
          type="leads"
          title="No Leads Found"
          description={
            search || statusFilter !== "ALL"
              ? "No leads matched your search criteria. Try clearing some filters."
              : "You haven't submitted any client leads yet. Share your intake link or manually submit a lead."
          }
          actionLabel="Submit First Lead"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : viewMode === "table" ? (
        /* TABLE VIEW */
        <BrokerCard noPadding className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0E1013] border-b border-[#1E232B] text-[#8B94A1] uppercase font-mono tracking-wider">
                <tr>
                  <th className="px-5 py-3 font-semibold">Lead ID</th>
                  <th className="px-5 py-3 font-semibold">Client & Contact</th>
                  <th className="px-5 py-3 font-semibold">Company / Location</th>
                  <th className="px-5 py-3 font-semibold">Service Interest</th>
                  <th className="px-5 py-3 font-semibold">Estimated Budget</th>
                  <th className="px-5 py-3 font-semibold">Pipeline Status</th>
                  <th className="px-5 py-3 font-semibold">Submitted</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E232B] text-[#D0D4DC]">
                {leads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className="hover:bg-[#171A1F]/60 transition-colors cursor-pointer group"
                  >
                    <td className="px-5 py-3.5 font-mono text-[#C2A878] font-medium whitespace-nowrap">
                      {lead.leadCode}
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-[#E6E8EB] group-hover:text-[#C2A878] transition-colors">
                        {lead.name}
                      </div>
                      <div className="text-[11px] text-[#8B94A1] truncate max-w-[180px]">
                        {lead.email}
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="text-[#E6E8EB]">{lead.companyName || "—"}</div>
                      <div className="text-[11px] text-[#566171]">{lead.city || "India"}</div>
                    </td>

                    <td className="px-5 py-3.5 text-[#E6E8EB]">
                      <span className="inline-block px-2 py-0.5 rounded bg-[#171A1F] border border-[#22262D] text-[11px]">
                        {lead.serviceInterest}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 font-mono text-[#E6E8EB]">
                      {lead.budget ? formatCurrencyINR(Number(lead.budget)) : "—"}
                    </td>

                    <td className="px-5 py-3.5">
                      <BrokerStatusBadge status={lead.status} category="lead" />
                    </td>

                    <td className="px-5 py-3.5 text-[#8B94A1] whitespace-nowrap">
                      {formatDateIN(lead.createdAt)}
                    </td>

                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLead(lead);
                        }}
                        className="text-xs text-[#C2A878] hover:text-[#D4BC8B] font-medium inline-flex items-center gap-1"
                      >
                        <span>Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Pagination */}
          {totalPages > 1 && (
            <div className="px-5 py-3 border-t border-[#1E232B] bg-[#0E1013] flex items-center justify-between text-xs text-[#8B94A1]">
              <span>
                Showing {leads.length} of {totalLeads} leads
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
      ) : (
        /* KANBAN PIPELINE VIEW */
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {KANBAN_STAGES.map((stage) => {
            const stageLeads = leads.filter((l) => l.status === stage.key);

            return (
              <div
                key={stage.key}
                className="rounded-xl border border-[#22262D] bg-[#111317] flex flex-col min-w-[240px] max-w-full"
              >
                {/* Stage Header */}
                <div className="px-4 py-3 border-b border-[#1E232B] flex items-center justify-between bg-[#0E1013] rounded-t-xl">
                  <div>
                    <h4 className="text-xs font-bold text-[#E6E8EB]">{stage.label}</h4>
                    <p className="text-[10px] text-[#566171]">{stage.description}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-[#171A1F] text-[#C2A878] border border-[#22262D]">
                    {stageLeads.length}
                  </span>
                </div>

                {/* Stage Cards Container */}
                <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[600px]">
                  {stageLeads.length === 0 ? (
                    <div className="py-8 text-center text-[11px] text-[#566171]">
                      No leads in this stage
                    </div>
                  ) : (
                    stageLeads.map((lead) => (
                      <div
                        key={lead.id}
                        onClick={() => setSelectedLead(lead)}
                        className="p-3.5 rounded-lg bg-[#171A1F] border border-[#22262D] hover:border-[#C2A878]/50 cursor-pointer transition-all space-y-2 group shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] text-[#C2A878] font-semibold">
                            {lead.leadCode}
                          </span>
                          <span className="text-[10px] text-[#566171]">
                            {formatDateIN(lead.createdAt)}
                          </span>
                        </div>

                        <div>
                          <h5 className="text-xs font-semibold text-[#E6E8EB] group-hover:text-[#C2A878] transition-colors">
                            {lead.name}
                          </h5>
                          {lead.companyName && (
                            <p className="text-[11px] text-[#8B94A1] truncate">{lead.companyName}</p>
                          )}
                        </div>

                        <div className="text-[10px] text-[#8B94A1] bg-[#0E1013] px-2 py-1 rounded border border-[#22262D] truncate">
                          {lead.serviceInterest}
                        </div>

                        {lead.budget && (
                          <div className="text-xs font-mono font-medium text-emerald-400">
                            {formatCurrencyINR(Number(lead.budget))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LEAD DETAIL SLIDE-OVER DRAWER */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedLead(null)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-[#111317] border-l border-[#22262D] text-[#E6E8EB] shadow-2xl flex flex-col">
              {/* Drawer Header */}
              <div className="px-6 py-5 border-b border-[#1E232B] flex items-center justify-between bg-[#0E1013]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#C2A878]">
                      {selectedLead.leadCode}
                    </span>
                    <BrokerStatusBadge status={selectedLead.status} category="lead" />
                  </div>
                  <h3 className="text-base font-bold text-[#E6E8EB] mt-1">{selectedLead.name}</h3>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedLead(null)}
                  className="p-1.5 rounded-lg text-[#8B94A1] hover:text-[#E6E8EB] hover:bg-[#171A1F] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Contact Information */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-[#8B94A1] uppercase tracking-wider">
                    Contact Details
                  </h4>
                  <div className="p-3.5 rounded-xl bg-[#171A1F] border border-[#22262D] space-y-2 text-xs">
                    <div className="flex items-center gap-2.5">
                      <Mail className="w-4 h-4 text-[#C2A878] shrink-0" />
                      <a
                        href={`mailto:${selectedLead.email}`}
                        className="text-[#E6E8EB] hover:underline truncate"
                      >
                        {selectedLead.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-[#C2A878] shrink-0" />
                      <a href={`tel:${selectedLead.phone}`} className="text-[#E6E8EB] hover:underline">
                        {selectedLead.phone}
                      </a>
                    </div>
                    {selectedLead.whatsapp && (
                      <div className="flex items-center gap-2.5">
                        <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-[#8B94A1]">WhatsApp: {selectedLead.whatsapp}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Company & Location */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-[#8B94A1] uppercase tracking-wider">
                    Client Organization
                  </h4>
                  <div className="p-3.5 rounded-xl bg-[#171A1F] border border-[#22262D] space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#8B94A1]">Company:</span>
                      <span className="font-medium text-[#E6E8EB]">
                        {selectedLead.companyName || "Independent"}
                      </span>
                    </div>
                    {selectedLead.designation && (
                      <div className="flex justify-between">
                        <span className="text-[#8B94A1]">Designation:</span>
                        <span className="text-[#E6E8EB]">{selectedLead.designation}</span>
                      </div>
                    )}
                    {selectedLead.industry && (
                      <div className="flex justify-between">
                        <span className="text-[#8B94A1]">Industry:</span>
                        <span className="text-[#E6E8EB]">{selectedLead.industry}</span>
                      </div>
                    )}
                    {selectedLead.city && (
                      <div className="flex justify-between">
                        <span className="text-[#8B94A1]">Location:</span>
                        <span className="text-[#E6E8EB]">{selectedLead.city}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Project Requirements & Budget */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-[#8B94A1] uppercase tracking-wider">
                    Project Requirement
                  </h4>
                  <div className="p-3.5 rounded-xl bg-[#171A1F] border border-[#22262D] space-y-2.5 text-xs">
                    <div>
                      <span className="text-[#8B94A1] block mb-1">Service Required:</span>
                      <span className="px-2.5 py-1 rounded bg-[#0E1013] border border-[#22262D] text-[#C2A878] font-medium inline-block">
                        {selectedLead.serviceInterest}
                      </span>
                    </div>
                    {selectedLead.budget && (
                      <div className="flex justify-between pt-1">
                        <span className="text-[#8B94A1]">Estimated Budget:</span>
                        <span className="font-mono text-emerald-400 font-bold">
                          {formatCurrencyINR(Number(selectedLead.budget))}
                        </span>
                      </div>
                    )}
                    {selectedLead.timeline && (
                      <div className="flex justify-between">
                        <span className="text-[#8B94A1]">Target Timeline:</span>
                        <span className="text-[#E6E8EB]">{selectedLead.timeline}</span>
                      </div>
                    )}
                    {selectedLead.message && (
                      <div className="pt-2 border-t border-[#22262D]">
                        <span className="text-[#8B94A1] block mb-1">Client Statement:</span>
                        <p className="text-[#D0D4DC] leading-relaxed bg-[#0E1013] p-2.5 rounded-lg border border-[#22262D] text-[11px]">
                          {selectedLead.message}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Safe Activity Timeline */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-[#8B94A1] uppercase tracking-wider">
                    Progression Timeline
                  </h4>
                  {selectedLead.activities && selectedLead.activities.length > 0 ? (
                    <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#22262D]">
                      {selectedLead.activities.map((act) => (
                        <div key={act.id} className="relative text-xs">
                          <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-[#111317] border-2 border-[#C2A878] flex items-center justify-center" />
                          <div className="text-[#E6E8EB] font-medium">{act.title}</div>
                          <div className="text-[11px] text-[#566171]">{formatDateIN(act.createdAt)}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 text-center text-xs text-[#566171] bg-[#171A1F] rounded-lg border border-[#22262D]">
                      Lead registered on {formatDateIN(selectedLead.createdAt)}.
                    </div>
                  )}
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-4 border-t border-[#1E232B] bg-[#0E1013] flex items-center gap-3">
                <Link
                  href={`/broker/projects/new?clientName=${encodeURIComponent(
                    selectedLead.name
                  )}&clientEmail=${encodeURIComponent(
                    selectedLead.email
                  )}&clientPhone=${encodeURIComponent(selectedLead.phone)}&companyName=${encodeURIComponent(
                    selectedLead.companyName || ""
                  )}&serviceInterest=${encodeURIComponent(selectedLead.serviceInterest)}`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#C2A878] hover:bg-[#D4BC8B] text-[#0A0B0D] font-semibold text-xs transition-colors shadow-sm"
                >
                  <FileText className="w-4 h-4" />
                  <span>Initiate Project Contract</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD LEAD MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
              onClick={() => setIsAddModalOpen(false)}
            />

            <div className="inline-block align-bottom bg-[#111317] border border-[#22262D] rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-[#1E232B] flex items-center justify-between bg-[#0E1013]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#C2A878]/10 flex items-center justify-center text-[#C2A878]">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#E6E8EB]">Submit Prospective Client</h3>
                    <p className="text-[11px] text-[#8B94A1]">
                      Attributed exclusively to your partner account.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 rounded-md text-[#8B94A1] hover:text-[#E6E8EB] hover:bg-[#171A1F]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleCreateLead} className="p-6 space-y-4">
                {formError && (
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {formWarning && (
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{formWarning}</span>
                  </div>
                )}

                {formSuccess && (
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{formSuccess}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-medium text-[#8B94A1] mb-1">
                      Client Full Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newLead.name}
                      onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3 py-2 rounded-lg bg-[#171A1F] border border-[#22262D] text-xs text-[#E6E8EB] placeholder-[#566171] focus:outline-none focus:border-[#C2A878]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#8B94A1] mb-1">
                      Client Email Address <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={newLead.email}
                      onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                      placeholder="client@company.com"
                      className="w-full px-3 py-2 rounded-lg bg-[#171A1F] border border-[#22262D] text-xs text-[#E6E8EB] placeholder-[#566171] focus:outline-none focus:border-[#C2A878]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#8B94A1] mb-1">
                      Mobile Number <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newLead.phone}
                      onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                      placeholder="+91 9876543210"
                      className="w-full px-3 py-2 rounded-lg bg-[#171A1F] border border-[#22262D] text-xs text-[#E6E8EB] placeholder-[#566171] focus:outline-none focus:border-[#C2A878]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#8B94A1] mb-1">
                      Company / Organization
                    </label>
                    <input
                      type="text"
                      value={newLead.companyName}
                      onChange={(e) => setNewLead({ ...newLead, companyName: e.target.value })}
                      placeholder="e.g. Apex Innovations Pvt Ltd"
                      className="w-full px-3 py-2 rounded-lg bg-[#171A1F] border border-[#22262D] text-xs text-[#E6E8EB] placeholder-[#566171] focus:outline-none focus:border-[#C2A878]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#8B94A1] mb-1">
                      Service Requirement <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={newLead.serviceInterest}
                      onChange={(e) => setNewLead({ ...newLead, serviceInterest: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#171A1F] border border-[#22262D] text-xs text-[#E6E8EB] focus:outline-none focus:border-[#C2A878]"
                    >
                      {SERVICE_OPTIONS.map((svc) => (
                        <option key={svc} value={svc}>
                          {svc}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#8B94A1] mb-1">
                      Estimated Budget (INR)
                    </label>
                    <input
                      type="text"
                      value={newLead.budget}
                      onChange={(e) => setNewLead({ ...newLead, budget: e.target.value })}
                      placeholder="e.g. 500000"
                      className="w-full px-3 py-2 rounded-lg bg-[#171A1F] border border-[#22262D] text-xs text-[#E6E8EB] placeholder-[#566171] focus:outline-none focus:border-[#C2A878] font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#8B94A1] mb-1">
                    Requirement Summary & Notes <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={newLead.message}
                    onChange={(e) => setNewLead({ ...newLead, message: e.target.value })}
                    placeholder="Briefly describe what the client is looking to build, tech preferences, or business problem..."
                    className="w-full px-3 py-2 rounded-lg bg-[#171A1F] border border-[#22262D] text-xs text-[#E6E8EB] placeholder-[#566171] focus:outline-none focus:border-[#C2A878] leading-relaxed"
                  />
                </div>

                <div className="pt-3 border-t border-[#1E232B] flex items-center justify-end gap-2.5">
                  <BrokerButton
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsAddModalOpen(false)}
                  >
                    Cancel
                  </BrokerButton>

                  <BrokerButton
                    type="submit"
                    variant="primary"
                    size="sm"
                    loading={submittingLead}
                    icon={<Plus className="w-4 h-4" />}
                  >
                    Submit Client Lead
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
