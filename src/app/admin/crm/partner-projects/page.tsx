"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight, UserCircle } from "lucide-react";
import Link from "next/link";

const STATUS_COLORS: Record<string, string> = {
  PROJECT_REQUESTED: "bg-blue-500/10 text-blue-400",
  REVIEWING: "bg-yellow-500/10 text-yellow-400",
  DISCUSSION: "bg-cyan-500/10 text-cyan-400",
  PROPOSAL_SENT: "bg-indigo-500/10 text-indigo-400",
  NEGOTIATION: "bg-orange-500/10 text-orange-400",
  CONTRACT_SENT: "bg-violet-500/10 text-violet-400",
  CONTRACT_SIGNED: "bg-emerald-500/10 text-emerald-400",
  PAYMENT_PENDING: "bg-amber-500/10 text-amber-400",
  PAYMENT_SUBMITTED: "bg-teal-500/10 text-teal-400",
  PROJECT_CONFIRMED: "bg-green-500/10 text-green-400",
  IN_PROGRESS: "bg-blue-600/10 text-blue-400",
  COMPLETED: "bg-green-700/10 text-green-300",
  CANCELLED: "bg-gray-500/10 text-gray-400",
  REJECTED: "bg-red-600/10 text-red-400",
};

export default function AdminPartnerProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, pages: 1 });

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      params.set("page", page.toString());

      const res = await fetch(`/api/v1/admin/partner-projects?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProjects(data.data || []);
        setMeta(data.meta || { total: 0, pages: 1 });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Confirmed Projects (Partner Sourced)</h1>
        <p className="text-sm text-gray-400">Projects requested directly by Brokers via Type B onboarding forms.</p>
      </div>

      <div className="bg-[#111] border border-white/10 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={15} />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#0d0d0d] border border-white/10 rounded-md py-2 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-red-500/50"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-[#0d0d0d] border border-white/10 rounded-md py-2 px-3 text-sm text-gray-400 focus:outline-none focus:border-red-500/50"
          >
            <option value="">All Statuses</option>
            <option value="PROJECT_REQUESTED">Requested</option>
            <option value="REVIEWING">Reviewing</option>
            <option value="PROPOSAL_SENT">Proposal Sent</option>
            <option value="CONTRACT_SENT">Contract Sent</option>
            <option value="CONTRACT_SIGNED">Contract Signed</option>
            <option value="PAYMENT_PENDING">Payment Pending</option>
            <option value="PROJECT_CONFIRMED">Confirmed</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-[#0d0d0d] text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-3">Project ID</th>
                <th className="px-6 py-3">Client</th>
                <th className="px-6 py-3">Company</th>
                <th className="px-6 py-3">Broker</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center">Loading...</td></tr>
              ) : projects.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center">No partner projects found.</td></tr>
              ) : (
                projects.map((proj) => (
                  <tr key={proj.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-emerald-400">
                      <Link href={`/admin/crm/partner-projects/${proj.id}`} className="hover:underline">
                        {proj.projectCode}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{proj.clientName}</div>
                      <div className="text-xs text-gray-500">{proj.clientEmail}</div>
                    </td>
                    <td className="px-6 py-4">{proj.companyName}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <UserCircle size={14} className="text-gray-500" />
                        <span className="text-gray-300 text-xs">{proj.brokerProfile?.user?.name || "Unknown"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${STATUS_COLORS[proj.status] || "bg-gray-500/10 text-gray-400"}`}>
                        {proj.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs">{new Date(proj.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {meta.pages > 1 && (
          <div className="p-4 border-t border-white/10 flex items-center justify-between text-sm">
            <span className="text-gray-500">{meta.total} total projects</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1 rounded hover:bg-white/10 disabled:opacity-30">
                <ChevronLeft size={16} />
              </button>
              <span className="text-gray-400">Page {page} of {meta.pages}</span>
              <button onClick={() => setPage(p => Math.min(meta.pages, p + 1))} disabled={page === meta.pages} className="p-1 rounded hover:bg-white/10 disabled:opacity-30">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
