"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight, UserCircle, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  CONTACTED: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
  QUALIFIED: "bg-green-500/10 text-green-400 border border-green-500/20",
  CONVERTED: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
  LOST: "bg-red-500/10 text-red-400 border border-red-500/20",
};

export default function AdminGeneralLeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("source", "PARTNER");
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      params.set("page", page.toString());

      const res = await fetch(`/api/v1/admin/partner-leads?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLeads(data.data || []);
        setMeta(data.meta || { total: 0, pages: 1 });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#C2A878]/10 text-[#C2A878] border border-[#C2A878]/25 font-semibold">
              UNIFIED LEAD SYSTEM
            </span>
            <span className="text-xs text-gray-400">• Partner Inbound Queue</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Partner Sourced Leads</h1>
          <p className="text-sm text-gray-400">
            Client opportunities submitted by verified Business Partners / Brokers through the Unified Registration System.
          </p>
        </div>

        <Link
          href="/admin/crm/leads"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-medium transition-colors"
        >
          <span>Central Lead Management</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Info Notice */}
      <div className="p-4 rounded-xl bg-[#111111] border border-white/10 text-xs text-gray-300 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-[#C2A878] shrink-0" />
          <span>
            General Leads and Confirmed Leads are now consolidated into ONE unified workflow. All partner registrations
            are centrally tracked and can be qualified and converted directly to commercial projects.
          </span>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-[#111] border border-white/10 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={15} />
            <input
              type="text"
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0d0d0d] border border-white/10 rounded-md py-2 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-red-500/50"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0d0d0d] border border-white/10 rounded-md py-2 px-3 text-sm text-gray-400 focus:outline-none focus:border-red-500/50"
          >
            <option value="">All Statuses</option>
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="CONVERTED">Converted</option>
            <option value="LOST">Lost</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-[#0d0d0d] text-xs uppercase text-gray-500 font-mono">
              <tr>
                <th className="px-6 py-3">Lead ID</th>
                <th className="px-6 py-3">Client</th>
                <th className="px-6 py-3">Company</th>
                <th className="px-6 py-3">Broker Partner</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Created</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center">
                    Loading partner leads...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center">
                    No partner leads found.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-red-400 font-semibold">
                      <Link href={`/admin/crm/leads/${lead.id}`} className="hover:underline">
                        {lead.leadCode}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{lead.name}</div>
                      <div className="text-xs text-gray-500">{lead.email}</div>
                    </td>
                    <td className="px-6 py-4">{lead.companyName || "—"}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <UserCircle size={14} className="text-[#C2A878]" />
                        <span className="text-gray-300 text-xs">{lead.owner?.name || "Partner"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          STATUS_COLORS[lead.status] || "bg-gray-500/10 text-gray-400"
                        }`}
                      >
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/crm/leads/${lead.id}`}
                        className="text-xs text-red-400 hover:text-red-300 hover:underline inline-flex items-center gap-1 font-medium"
                      >
                        <span>Details</span>
                        <ArrowRight size={13} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {meta.pages > 1 && (
          <div className="p-4 border-t border-white/10 flex items-center justify-between text-sm">
            <span className="text-gray-500 font-mono text-xs">{meta.total} total partner leads</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1 rounded hover:bg-white/10 disabled:opacity-30"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-gray-400 text-xs">
                Page {page} of {meta.pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(meta.pages, p + 1))}
                disabled={page === meta.pages}
                className="p-1 rounded hover:bg-white/10 disabled:opacity-30"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
