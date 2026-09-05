"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Plus, X, RefreshCw, AlertCircle, CheckCircle2, UserPlus, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface Lead {
  id: string;
  leadCode: string;
  name: string;
  email: string;
  phone?: string | null;
  companyName?: string | null;
  serviceInterest?: string | null;
  source: string;
  status: string;
  qualificationStatus: string;
  isDuplicate: boolean;
  duplicateReason?: string | null;
  owner?: { id: string; name: string } | null;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  CONTACTED: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  QUALIFIED: "bg-green-500/10 text-green-400 border-green-500/20",
  UNQUALIFIED: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  CONVERTED: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  NURTURE: "bg-orange-500/10 text-orange-400 border-orange-500/20",
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [addForm, setAddForm] = useState({
    name: "",
    email: "",
    phone: "",
    companyName: "",
    website: "",
    serviceInterest: "",
    message: "",
    source: "MANUAL",
  });

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      if (sourceFilter) params.set("source", sourceFilter);
      params.set("page", page.toString());
      params.set("limit", "15");

      const res = await fetch(`/api/v1/crm/leads?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setLeads(data.data || []);
        setTotalPages(data.meta?.pages || 1);
        setTotalRecords(data.meta?.total || 0);
      }
    } catch (e: any) {
      setFeedback({ type: "error", message: "Failed to connect to server." });
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, sourceFilter, page]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");
    try {
      const res = await fetch("/api/v1/crm/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create lead.");

      setIsAddOpen(false);
      setFeedback({ type: "success", message: `Lead ${data.data.leadCode} created successfully.` });
      fetchLeads();
    } catch (err: any) {
      setFormError(err.message || "An unexpected error occurred.");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Lead Inbox</h1>
          <p className="text-gray-400 mt-1 text-sm">
            Centralized lead tracking, qualification and pipeline intake ({totalRecords} leads)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchLeads()}
            className="p-2.5 rounded-xl border border-white/10 bg-[#1a1a1a] text-gray-400 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => {
              setAddForm({ name: "", email: "", phone: "", companyName: "", website: "", serviceInterest: "", message: "", source: "MANUAL" });
              setFormError("");
              setIsAddOpen(true);
            }}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-red-600/20"
          >
            <Plus className="w-4 h-4" /> Add Lead
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-sm ${
            feedback.type === "success" ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row items-center gap-4 justify-between">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search leads by name, email, company, code..."
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-red-500/50"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-[#1a1a1a] border border-white/10 text-gray-300 text-sm rounded-xl px-3 py-2 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="QUALIFIED">Qualified</option>
              <option value="UNQUALIFIED">Unqualified</option>
              <option value="CONVERTED">Converted</option>
            </select>

            <select
              value={sourceFilter}
              onChange={(e) => {
                setSourceFilter(e.target.value);
                setPage(1);
              }}
              className="bg-[#1a1a1a] border border-white/10 text-gray-300 text-sm rounded-xl px-3 py-2 focus:outline-none"
            >
              <option value="">All Sources</option>
              <option value="WEBSITE_CONTACT">Website Contact</option>
              <option value="CONSULTATION">Consultation</option>
              <option value="REFERRAL">Referral</option>
              <option value="MANUAL">Manual Entry</option>
            </select>
          </div>
        </div>

        {/* Lead Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-[#18181b] text-gray-300 text-xs uppercase font-semibold border-b border-white/10">
              <tr>
                <th className="px-5 py-3.5">Lead Code</th>
                <th className="px-5 py-3.5">Contact Name</th>
                <th className="px-5 py-3.5">Company / Service</th>
                <th className="px-5 py-3.5">Source</th>
                <th className="px-5 py-3.5">Owner</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-red-500" /> Loading leads...
                    </div>
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    No leads found matching your criteria.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4 font-mono text-xs text-red-400">
                      <Link href={`/admin/crm/leads/${lead.id}`} className="hover:underline font-semibold">
                        {lead.leadCode}
                      </Link>
                      {lead.isDuplicate && (
                        <span className="block mt-0.5 text-[10px] text-amber-400 font-sans" title={lead.duplicateReason || ""}>
                          ⚠️ Possible Duplicate
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <Link href={`/admin/crm/leads/${lead.id}`} className="font-semibold text-white hover:text-red-400 transition-colors">
                        {lead.name}
                      </Link>
                      <div className="text-xs text-gray-500">{lead.email}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-white text-sm">{lead.companyName || "—"}</div>
                      <div className="text-xs text-gray-500">{lead.serviceInterest || "General Inquiry"}</div>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-300">
                      <span className="bg-white/5 px-2 py-1 rounded-md border border-white/5">
                        {lead.source}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-300">
                      {lead.owner ? lead.owner.name : <span className="text-gray-600">Unassigned</span>}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[lead.status] || ""}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/crm/leads/${lead.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/10 bg-[#1a1a1a] hover:bg-white/10 text-xs font-medium text-white transition-colors"
                      >
                        View Detail →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-400 bg-[#18181b]">
            <div>
              Page <span className="font-semibold text-white">{page}</span> of{" "}
              <span className="font-semibold text-white">{totalPages}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-white/10 bg-[#1a1a1a] hover:bg-white/10 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-white/10 bg-[#1a1a1a] hover:bg-white/10 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Lead Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h2 className="text-lg font-bold text-white">Create New Lead</h2>
              <button onClick={() => setIsAddOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="m-6 mb-0 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Contact Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={addForm.name}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                    placeholder="e.g. Vikram Verma"
                    className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    placeholder="e.g. vikram@techcorp.in"
                    className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={addForm.phone}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Company Name</label>
                  <input
                    type="text"
                    value={addForm.companyName}
                    onChange={(e) => setAddForm({ ...addForm, companyName: e.target.value })}
                    placeholder="TechCorp Pvt Ltd"
                    className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Service Interest</label>
                  <input
                    type="text"
                    value={addForm.serviceInterest}
                    onChange={(e) => setAddForm({ ...addForm, serviceInterest: e.target.value })}
                    placeholder="Custom Software Development"
                    className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Lead Source</label>
                  <select
                    value={addForm.source}
                    onChange={(e) => setAddForm({ ...addForm, source: e.target.value })}
                    className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none"
                  >
                    <option value="MANUAL">Manual Entry</option>
                    <option value="REFERRAL">Referral</option>
                    <option value="WEBSITE_CONTACT">Website Contact</option>
                    <option value="CONSULTATION">Consultation</option>
                    <option value="PARTNER">Partner</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-all"
                >
                  {formLoading ? "Saving..." : "Create Lead"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
