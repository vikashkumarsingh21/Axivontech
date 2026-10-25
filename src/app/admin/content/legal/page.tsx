"use client";

import { getErrorMessage, parseApiResponse } from "@/lib/errors/client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Scale,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  Clock,
  Lock,
  ExternalLink,
  X,
  Save,
  Loader2,
  FileText,
  ShieldCheck,
  History,
  Check,
  AlertCircle,
  MessageSquare,
  UserCheck,
} from "lucide-react";
import { LEGAL_CATEGORIES } from "@/lib/legal/legal-db";

interface Policy {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  version: string;
  status: "DRAFT" | "IN_REVIEW" | "APPROVED" | "PUBLISHED" | "ARCHIVED";
  effectiveDate: string;
  lastReviewedAt: string;
  reviewedBy?: string | null;
  publishedAt?: string | null;
  requiresApproval: boolean;
  missingDetails: string[];
  versions?: {
    id: string;
    version: string;
    title: string;
    changeLog?: string | null;
    publishedAt: string;
  }[];
}

interface PrivacyRequestItem {
  id: string;
  referenceId: string;
  category: string;
  status: "PENDING" | "UNDER_REVIEW" | "FULFILLED" | "REJECTED";
  requesterName: string;
  requesterEmail: string;
  requesterPhone?: string | null;
  requestDetails: string;
  resolutionNotes?: string | null;
  createdAt: string;
  resolvedAt?: string | null;
}

export default function AdminLegalCmsPage() {
  const [activeTab, setActiveTab] = useState<"policies" | "requests">("policies");

  // Policies state
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [policyStats, setPolicyStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    inReview: 0,
    missingDetailsCount: 0,
  });
  const [loadingPolicies, setLoadingPolicies] = useState(true);
  const [searchPolicy, setSearchPolicy] = useState("");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");

  // Policy Modal state
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);
  const [policyForm, setPolicyForm] = useState({
    title: "",
    slug: "",
    category: "CORE_LEGAL",
    summary: "",
    content: "",
    version: "1.0.0",
    status: "DRAFT" as Policy["status"],
    requiresApproval: false,
    missingDetails: [] as string[],
    changeLog: "",
    bypassGateAcknowledgement: false,
  });
  const [previewMode, setPreviewMode] = useState(false);
  const [savingPolicy, setSavingPolicy] = useState(false);
  const [policyError, setPolicyError] = useState<string | null>(null);
  const [gateWarning, setGateWarning] = useState<string | null>(null);

  // Privacy requests state
  const [requests, setRequests] = useState<PrivacyRequestItem[]>([]);
  const [requestStats, setRequestStats] = useState({
    total: 0,
    pending: 0,
    underReview: 0,
    fulfilled: 0,
  });
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [filterRequestStatus, setFilterRequestStatus] = useState("ALL");

  // Request Review Modal
  const [reviewingRequest, setReviewingRequest] = useState<PrivacyRequestItem | null>(null);
  const [requestStatusForm, setRequestStatusForm] = useState<PrivacyRequestItem["status"]>("PENDING");
  const [resolutionNotesForm, setResolutionNotesForm] = useState("");
  const [savingRequest, setSavingRequest] = useState(false);

  // Fetch policies
  const fetchPolicies = useCallback(async () => {
    setLoadingPolicies(true);
    try {
      const res = await fetch("/api/v1/admin/legal/policies");
      if (res.ok) {
        const data = await res.json();
        setPolicies(data.policies || []);
        if (data.stats) setPolicyStats(data.stats);
      }
    } catch {
      // safe fallback
    } finally {
      setLoadingPolicies(false);
    }
  }, []);

  // Fetch privacy requests
  const fetchRequests = useCallback(async () => {
    setLoadingRequests(true);
    try {
      const url =
        filterRequestStatus === "ALL"
          ? "/api/v1/admin/legal/privacy-requests"
          : `/api/v1/admin/legal/privacy-requests?status=${filterRequestStatus}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
        if (data.stats) setRequestStats(data.stats);
      }
    } catch {
      // safe fallback
    } finally {
      setLoadingRequests(false);
    }
  }, [filterRequestStatus]);

  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  useEffect(() => {
    if (activeTab === "requests") {
      fetchRequests();
    }
  }, [activeTab, fetchRequests]);

  const openCreatePolicy = () => {
    setEditingPolicy(null);
    setPolicyForm({
      title: "",
      slug: "",
      category: "CORE_LEGAL",
      summary: "",
      content: "## 1. Overview\n\nEnter policy terms here...",
      version: "1.0.0",
      status: "DRAFT",
      requiresApproval: false,
      missingDetails: [],
      changeLog: "",
      bypassGateAcknowledgement: false,
    });
    setPolicyError(null);
    setGateWarning(null);
    setPreviewMode(false);
    setShowPolicyModal(true);
  };

  const openEditPolicy = (p: Policy) => {
    setEditingPolicy(p);
    setPolicyForm({
      title: p.title,
      slug: p.slug,
      category: p.category,
      summary: p.summary,
      content: p.content,
      version: p.version,
      status: p.status,
      requiresApproval: p.requiresApproval,
      missingDetails: p.missingDetails || [],
      changeLog: "",
      bypassGateAcknowledgement: false,
    });
    setPolicyError(null);
    setGateWarning(null);
    setPreviewMode(false);
    setShowPolicyModal(true);
  };

  const handleSavePolicy = async () => {
    if (!policyForm.title.trim() || !policyForm.slug.trim() || !policyForm.content.trim()) {
      setPolicyError("Title, slug, and content cannot be blank.");
      return;
    }

    setSavingPolicy(true);
    setPolicyError(null);
    setGateWarning(null);

    try {
      let res: Response;
      if (editingPolicy) {
        res = await fetch(`/api/v1/admin/legal/policies/${editingPolicy.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(policyForm),
        });
      } else {
        res = await fetch("/api/v1/admin/legal/policies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(policyForm),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        if (data.error === "PUBLICATION_GATE_TRIGGERED") {
          setGateWarning(data.message);
          setSavingPolicy(false);
          return;
        }
        throw new Error(getErrorMessage(data) || "Failed to save policy.");
      }

      setShowPolicyModal(false);
      fetchPolicies();
    } catch (err: any) {
      setPolicyError(err.message || "An error occurred while saving.");
    } finally {
      setSavingPolicy(false);
    }
  };

  const handleTogglePolicyStatus = async (p: Policy) => {
    const nextStatus = p.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      const res = await fetch(`/api/v1/admin/legal/policies/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          bypassGateAcknowledgement: true,
        }),
      });
      if (res.ok) {
        fetchPolicies();
      }
    } catch {
      // safe fallback
    }
  };

  const handleDeletePolicy = async (p: Policy) => {
    if (!confirm(`Are you sure you want to delete "${p.title}"?`)) return;

    try {
      const res = await fetch(`/api/v1/admin/legal/policies/${p.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchPolicies();
      }
    } catch {
      // safe fallback
    }
  };

  const openReviewRequest = (r: PrivacyRequestItem) => {
    setReviewingRequest(r);
    setRequestStatusForm(r.status);
    setResolutionNotesForm(r.resolutionNotes || "");
  };

  const handleSaveRequest = async () => {
    if (!reviewingRequest) return;
    setSavingRequest(true);
    try {
      const res = await fetch(`/api/v1/admin/legal/privacy-requests/${reviewingRequest.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: requestStatusForm,
          resolutionNotes: resolutionNotesForm,
        }),
      });
      if (res.ok) {
        setReviewingRequest(null);
        fetchRequests();
      }
    } catch {
      // safe fallback
    } finally {
      setSavingRequest(false);
    }
  };

  const filteredPolicies = policies.filter((p) => {
    const matchCat = filterCategory === "ALL" || p.category === filterCategory;
    const matchStatus = filterStatus === "ALL" || p.status === filterStatus;
    const matchSearch =
      !searchPolicy.trim() ||
      p.title.toLowerCase().includes(searchPolicy.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchPolicy.toLowerCase());
    return matchCat && matchStatus && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#0B0D10] text-[#F3F5F7] p-6 lg:p-10 selection:bg-emerald-500/20 selection:text-emerald-300">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E2530] pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#F3F5F7] tracking-tight">
                Legal & Policy Management CMS
              </h1>
              <p className="text-xs text-[#7E8997] mt-0.5">
                Centralized governance, DPDP Act 2023 compliance, version tracking, and privacy requests.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/legal"
              target="_blank"
              className="flex items-center gap-1.5 px-3 py-2 bg-[#151A21] hover:bg-[#1B222B] text-[#A7B0BC] hover:text-[#F3F5F7] border border-[#29313B] rounded-xl text-xs font-semibold transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Public Center
            </Link>
            <button
              onClick={openCreatePolicy}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-[#04130E] rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Policy
            </button>
          </div>
        </div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
          <div className="bg-[#10151B] border border-[#1E2530] rounded-xl p-4">
            <span className="text-[11px] text-[#7E8997] uppercase tracking-wider font-semibold">Total Policies</span>
            <p className="text-2xl font-bold text-[#F3F5F7] mt-1">{policyStats.total || policies.length}</p>
          </div>
          <div className="bg-[#10151B] border border-[#1E2530] rounded-xl p-4">
            <span className="text-[11px] text-emerald-400 uppercase tracking-wider font-semibold">Published</span>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{policyStats.published}</p>
          </div>
          <div className="bg-[#10151B] border border-[#1E2530] rounded-xl p-4">
            <span className="text-[11px] text-[#7E8997] uppercase tracking-wider font-semibold">Drafts & Review</span>
            <p className="text-2xl font-bold text-[#A7B0BC] mt-1">{policyStats.draft + policyStats.inReview}</p>
          </div>
          <div className="bg-[#10151B] border border-[#1E2530] rounded-xl p-4">
            <span className="text-[11px] text-amber-400 uppercase tracking-wider font-semibold">Privacy Requests</span>
            <p className="text-2xl font-bold text-amber-400 mt-1">{requestStats.pending || 0}</p>
          </div>
          <div className="bg-[#10151B] border border-[#1E2530] rounded-xl p-4 col-span-2 lg:col-span-1">
            <span className="text-[11px] text-cyan-400 uppercase tracking-wider font-semibold">Compliance Status</span>
            <p className="text-sm font-bold text-[#F3F5F7] mt-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              DPDP 2023 Ready
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 border-b border-[#1E2530]">
          <button
            onClick={() => setActiveTab("policies")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "policies"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-[#7E8997] hover:text-[#F3F5F7]"
            }`}
          >
            <FileText className="w-4 h-4" />
            Policies & Documents ({policies.length})
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "requests"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-[#7E8997] hover:text-[#F3F5F7]"
            }`}
          >
            <Lock className="w-4 h-4" />
            Data Subject Privacy Requests ({requests.length || requestStats.total})
          </button>
        </div>

        {/* TAB 1: POLICIES */}
        {activeTab === "policies" && (
          <div className="space-y-4">
            {/* Filter toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#10151B] border border-[#1E2530] rounded-xl p-3">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#566171]" />
                <input
                  type="text"
                  placeholder="Search policies…"
                  value={searchPolicy}
                  onChange={(e) => setSearchPolicy(e.target.value)}
                  className="w-full h-8 pl-8 pr-3 bg-[#151A21] border border-[#1E2530] rounded-lg text-xs text-[#F3F5F7] placeholder:text-[#566171] focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="h-8 px-2.5 bg-[#151A21] border border-[#1E2530] rounded-lg text-xs text-[#A7B0BC] focus:outline-none focus:border-emerald-500"
                >
                  <option value="ALL">All Categories</option>
                  {LEGAL_CATEGORIES.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.label}
                    </option>
                  ))}
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="h-8 px-2.5 bg-[#151A21] border border-[#1E2530] rounded-lg text-xs text-[#A7B0BC] focus:outline-none focus:border-emerald-500"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="DRAFT">Draft</option>
                  <option value="IN_REVIEW">In Review</option>
                  <option value="APPROVED">Approved</option>
                </select>

                <button
                  onClick={fetchPolicies}
                  className="p-2 rounded-lg bg-[#151A21] border border-[#1E2530] text-[#7E8997] hover:text-[#F3F5F7] transition-colors cursor-pointer"
                  title="Refresh"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Policies Table */}
            {loadingPolicies ? (
              <div className="text-center py-16 bg-[#10151B] border border-[#1E2530] rounded-xl">
                <Loader2 className="w-6 h-6 text-emerald-400 animate-spin mx-auto mb-2" />
                <p className="text-xs text-[#7E8997]">Loading policy records…</p>
              </div>
            ) : filteredPolicies.length === 0 ? (
              <div className="text-center py-16 bg-[#10151B] border border-[#1E2530] rounded-xl">
                <FileText className="w-8 h-8 text-[#566171] mx-auto mb-2" />
                <p className="text-xs text-[#7E8997]">No policies found matching filters.</p>
              </div>
            ) : (
              <div className="bg-[#10151B] border border-[#1E2530] rounded-xl overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#151A21] border-b border-[#1E2530] text-[#7E8997] font-semibold uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3">Document Title</th>
                        <th className="px-4 py-3">Route Slug</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Version</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Last Reviewed</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E2530] text-[#A7B0BC]">
                      {filteredPolicies.map((p) => {
                        const catMeta = LEGAL_CATEGORIES.find((c) => c.key === p.category);
                        return (
                          <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="px-4 py-3 font-semibold text-[#F3F5F7]">
                              <div>{p.title}</div>
                              {p.missingDetails && p.missingDetails.length > 0 && (
                                <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 mt-0.5">
                                  <AlertTriangle className="w-3 h-3" />
                                  Pending: {p.missingDetails.join(", ")}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 font-mono text-[11px] text-[#7E8997]">
                              /{p.slug}
                            </td>
                            <td className="px-4 py-3">
                              {catMeta && (
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${catMeta.badgeColor}`}>
                                  {catMeta.label}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 font-mono text-[11px] text-emerald-400">
                              v{p.version}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                  p.status === "PUBLISHED"
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                    : "bg-[#1E2530] text-[#7E8997] border-[#29313B]"
                                }`}
                              >
                                {p.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-[11px] text-[#7E8997]">
                              {new Date(p.lastReviewedAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Link
                                  href={`/${p.slug}`}
                                  target="_blank"
                                  className="p-1.5 rounded-lg bg-[#151A21] hover:bg-[#1B222B] text-[#7E8997] hover:text-[#F3F5F7] transition-colors"
                                  title="View Public Document"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </Link>
                                <button
                                  onClick={() => handleTogglePolicyStatus(p)}
                                  className={`p-1.5 rounded-lg bg-[#151A21] hover:bg-[#1B222B] transition-colors cursor-pointer ${
                                    p.status === "PUBLISHED"
                                      ? "text-emerald-400 hover:text-amber-400"
                                      : "text-[#7E8997] hover:text-emerald-400"
                                  }`}
                                  title={p.status === "PUBLISHED" ? "Unpublish to Draft" : "Publish Document"}
                                >
                                  {p.status === "PUBLISHED" ? <Check className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                </button>
                                <button
                                  onClick={() => openEditPolicy(p)}
                                  className="p-1.5 rounded-lg bg-[#151A21] hover:bg-[#1B222B] text-cyan-400 transition-colors cursor-pointer"
                                  title="Edit Policy & History"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeletePolicy(p)}
                                  className="p-1.5 rounded-lg bg-[#151A21] hover:bg-[#1B222B] text-red-400 transition-colors cursor-pointer"
                                  title="Delete Policy"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PRIVACY REQUESTS */}
        {activeTab === "requests" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 bg-[#10151B] border border-[#1E2530] rounded-xl p-3">
              <span className="text-xs font-semibold text-[#A7B0BC]">
                Data Subject Inquiries & Grievances
              </span>
              <div className="flex items-center gap-2">
                <select
                  value={filterRequestStatus}
                  onChange={(e) => setFilterRequestStatus(e.target.value)}
                  className="h-8 px-2.5 bg-[#151A21] border border-[#1E2530] rounded-lg text-xs text-[#A7B0BC] focus:outline-none focus:border-emerald-500"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">Pending Review</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="FULFILLED">Fulfilled</option>
                  <option value="REJECTED">Rejected</option>
                </select>
                <button
                  onClick={fetchRequests}
                  className="p-2 rounded-lg bg-[#151A21] border border-[#1E2530] text-[#7E8997] hover:text-[#F3F5F7] transition-colors cursor-pointer"
                  title="Refresh"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {loadingRequests ? (
              <div className="text-center py-16 bg-[#10151B] border border-[#1E2530] rounded-xl">
                <Loader2 className="w-6 h-6 text-emerald-400 animate-spin mx-auto mb-2" />
                <p className="text-xs text-[#7E8997]">Loading requests…</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-16 bg-[#10151B] border border-[#1E2530] rounded-xl">
                <Lock className="w-8 h-8 text-[#566171] mx-auto mb-2" />
                <p className="text-xs text-[#7E8997]">No privacy requests logged yet.</p>
              </div>
            ) : (
              <div className="bg-[#10151B] border border-[#1E2530] rounded-xl overflow-hidden shadow-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#151A21] border-b border-[#1E2530] text-[#7E8997] font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Reference ID</th>
                      <th className="px-4 py-3">Requester Name</th>
                      <th className="px-4 py-3">Email Address</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Submitted</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E2530] text-[#A7B0BC]">
                    {requests.map((r) => (
                      <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-emerald-400">
                          {r.referenceId}
                        </td>
                        <td className="px-4 py-3 font-semibold text-[#F3F5F7]">
                          {r.requesterName}
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] text-[#7E8997]">
                          {r.requesterEmail}
                        </td>
                        <td className="px-4 py-3 font-semibold text-cyan-400">
                          {r.category}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              r.status === "FULFILLED"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : r.status === "REJECTED"
                                ? "bg-red-500/10 text-red-400 border-red-500/20"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[11px] text-[#7E8997]">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => openReviewRequest(r)}
                            className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Review & Resolve
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* POLICY EDIT/CREATE MODAL */}
      {showPolicyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-4xl bg-[#10151B] border border-[#1E2530] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E2530] bg-[#151A21]">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold text-[#F3F5F7]">
                  {editingPolicy ? `Edit: ${editingPolicy.title}` : "Create New Legal Policy"}
                </h2>
              </div>
              <button
                onClick={() => setShowPolicyModal(false)}
                className="p-1 rounded-lg text-[#7E8997] hover:text-[#F3F5F7] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {policyError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{policyError}</span>
                </div>
              )}

              {gateWarning && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-400">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Publication Gate Triggered</span>
                  </div>
                  <p>{gateWarning}</p>
                  <label className="flex items-center gap-2 pt-2 cursor-pointer font-semibold text-[#F3F5F7]">
                    <input
                      type="checkbox"
                      checked={policyForm.bypassGateAcknowledgement}
                      onChange={(e) =>
                        setPolicyForm({
                          ...policyForm,
                          bypassGateAcknowledgement: e.target.checked,
                        })
                      }
                      className="rounded bg-[#151A21] border-[#1E2530] text-emerald-500 focus:ring-emerald-500"
                    />
                    <span>I explicitly confirm executive approval to publish with noted pending filings.</span>
                  </label>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#A7B0BC] mb-1">
                    Document Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={policyForm.title}
                    onChange={(e) => setPolicyForm({ ...policyForm, title: e.target.value })}
                    className="w-full h-9 px-3 bg-[#151A21] border border-[#1E2530] rounded-lg text-xs text-[#F3F5F7] focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#A7B0BC] mb-1">
                    Route Slug <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={policyForm.slug}
                    onChange={(e) => setPolicyForm({ ...policyForm, slug: e.target.value })}
                    className="w-full h-9 px-3 bg-[#151A21] border border-[#1E2530] rounded-lg text-xs font-mono text-[#F3F5F7] focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#A7B0BC] mb-1">Category</label>
                  <select
                    value={policyForm.category}
                    onChange={(e) => setPolicyForm({ ...policyForm, category: e.target.value })}
                    className="w-full h-9 px-3 bg-[#151A21] border border-[#1E2530] rounded-lg text-xs text-[#F3F5F7] focus:outline-none focus:border-emerald-500"
                  >
                    {LEGAL_CATEGORIES.map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#A7B0BC] mb-1">Version</label>
                  <input
                    type="text"
                    value={policyForm.version}
                    onChange={(e) => setPolicyForm({ ...policyForm, version: e.target.value })}
                    className="w-full h-9 px-3 bg-[#151A21] border border-[#1E2530] rounded-lg text-xs font-mono text-[#F3F5F7] focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#A7B0BC] mb-1">Status</label>
                  <select
                    value={policyForm.status}
                    onChange={(e) => setPolicyForm({ ...policyForm, status: e.target.value as any })}
                    className="w-full h-9 px-3 bg-[#151A21] border border-[#1E2530] rounded-lg text-xs text-[#F3F5F7] focus:outline-none focus:border-emerald-500"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="IN_REVIEW">In Review</option>
                    <option value="APPROVED">Approved</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A7B0BC] mb-1">Summary</label>
                <textarea
                  rows={2}
                  value={policyForm.summary}
                  onChange={(e) => setPolicyForm({ ...policyForm, summary: e.target.value })}
                  className="w-full p-2.5 bg-[#151A21] border border-[#1E2530] rounded-lg text-xs text-[#F3F5F7] focus:outline-none focus:border-emerald-500 resize-none leading-relaxed"
                />
              </div>

              {/* Content Editor / Preview Switch */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[#A7B0BC]">
                    Policy Body Content (Markdown)
                  </label>
                  <button
                    type="button"
                    onClick={() => setPreviewMode(!previewMode)}
                    className="text-[11px] font-semibold text-emerald-400 hover:underline cursor-pointer"
                  >
                    {previewMode ? "Edit Raw Markdown" : "Preview Formatted"}
                  </button>
                </div>

                {previewMode ? (
                  <div className="w-full h-72 p-4 bg-[#151A21] border border-[#1E2530] rounded-xl overflow-y-auto text-xs text-[#A7B0BC] leading-relaxed whitespace-pre-wrap font-sans">
                    {policyForm.content}
                  </div>
                ) : (
                  <textarea
                    rows={12}
                    value={policyForm.content}
                    onChange={(e) => setPolicyForm({ ...policyForm, content: e.target.value })}
                    className="w-full p-3 bg-[#151A21] border border-[#1E2530] rounded-xl text-xs font-mono text-[#F3F5F7] focus:outline-none focus:border-emerald-500 leading-relaxed"
                  />
                )}
              </div>

              {editingPolicy && editingPolicy.versions && editingPolicy.versions.length > 0 && (
                <div className="pt-2 border-t border-[#1E2530]">
                  <span className="text-[11px] font-semibold text-[#7E8997] uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <History className="w-3.5 h-3.5" />
                    Past Revision Snapshots ({editingPolicy.versions.length})
                  </span>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {editingPolicy.versions.map((v) => (
                      <div
                        key={v.id}
                        className="p-2 rounded-lg bg-[#151A21] border border-[#1E2530] text-[11px] flex items-center justify-between"
                      >
                        <span className="font-mono text-emerald-400">v{v.version}</span>
                        <span className="text-[#7E8997]">{v.changeLog || "Archived version"}</span>
                        <span className="text-[#566171]">{new Date(v.publishedAt).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-[#1E2530] bg-[#151A21] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowPolicyModal(false)}
                className="px-4 py-2 text-xs font-semibold text-[#A7B0BC] hover:text-[#F3F5F7] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePolicy}
                disabled={savingPolicy}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-[#04130E] text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-2"
              >
                {savingPolicy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                {savingPolicy ? "Saving Policy…" : "Save Policy Document"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRIVACY REQUEST REVIEW MODAL */}
      {reviewingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#10151B] border border-[#1E2530] rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E2530] bg-[#151A21]">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-[#F3F5F7]">
                  Review Privacy Request {reviewingRequest.referenceId}
                </h3>
              </div>
              <button
                onClick={() => setReviewingRequest(null)}
                className="p-1 rounded-lg text-[#7E8997] hover:text-[#F3F5F7]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[#151A21] border border-[#1E2530]">
                <div>
                  <span className="text-[#7E8997]">Requester:</span>
                  <p className="font-semibold text-[#F3F5F7] mt-0.5">{reviewingRequest.requesterName}</p>
                </div>
                <div>
                  <span className="text-[#7E8997]">Email:</span>
                  <p className="font-semibold text-[#F3F5F7] mt-0.5 font-mono">{reviewingRequest.requesterEmail}</p>
                </div>
                <div className="mt-2">
                  <span className="text-[#7E8997]">Category:</span>
                  <p className="font-semibold text-cyan-400 mt-0.5">{reviewingRequest.category}</p>
                </div>
                <div className="mt-2">
                  <span className="text-[#7E8997]">Submitted:</span>
                  <p className="font-semibold text-[#F3F5F7] mt-0.5">
                    {new Date(reviewingRequest.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-[#7E8997] font-semibold">Requester Description:</span>
                <p className="mt-1 p-3 rounded-xl bg-[#151A21] border border-[#1E2530] text-[#A7B0BC] leading-relaxed">
                  {reviewingRequest.requestDetails}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A7B0BC] mb-1">
                  Resolution Status
                </label>
                <select
                  value={requestStatusForm}
                  onChange={(e) => setRequestStatusForm(e.target.value as any)}
                  className="w-full h-9 px-3 bg-[#151A21] border border-[#1E2530] rounded-lg text-xs text-[#F3F5F7] focus:outline-none focus:border-emerald-500"
                >
                  <option value="PENDING">Pending</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="FULFILLED">Fulfilled</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A7B0BC] mb-1">
                  Resolution Notes (Visible to requester upon tracking)
                </label>
                <textarea
                  rows={3}
                  value={resolutionNotesForm}
                  onChange={(e) => setResolutionNotesForm(e.target.value)}
                  placeholder="Record verification outcomes or fulfillment steps…"
                  className="w-full p-2.5 bg-[#151A21] border border-[#1E2530] rounded-lg text-xs text-[#F3F5F7] focus:outline-none focus:border-emerald-500 leading-relaxed resize-none"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-[#1E2530] bg-[#151A21] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setReviewingRequest(null)}
                className="px-4 py-2 text-xs font-semibold text-[#A7B0BC] hover:text-[#F3F5F7]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRequest}
                disabled={savingRequest}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-[#04130E] text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-2"
              >
                {savingRequest ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save Request Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
