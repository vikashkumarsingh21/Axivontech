"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight, Briefcase, Users } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-blue-500/10 text-blue-400",
  CONTACTED: "bg-yellow-500/10 text-yellow-400",
  INTERESTED: "bg-cyan-500/10 text-cyan-400",
  QUALIFIED: "bg-green-500/10 text-green-400",
  CONVERTED: "bg-purple-500/10 text-purple-400",
  LOST: "bg-red-500/10 text-red-400",
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

export default function BrokerLeadsPage() {
  const [activeTab, setActiveTab] = useState<"general" | "projects">("general");
  const [leads, setLeads] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [searchLeads, setSearchLeads] = useState("");
  const [searchProjects, setSearchProjects] = useState("");
  const [leadStatusFilter, setLeadStatusFilter] = useState("");
  const [projectStatusFilter, setProjectStatusFilter] = useState("");
  const [leadPage, setLeadPage] = useState(1);
  const [projectPage, setProjectPage] = useState(1);
  const [leadMeta, setLeadMeta] = useState({ total: 0, pages: 1 });
  const [projectMeta, setProjectMeta] = useState({ total: 0, pages: 1 });

  const fetchLeads = useCallback(async () => {
    setLoadingLeads(true);
    try {
      const params = new URLSearchParams();
      if (searchLeads) params.set("search", searchLeads);
      if (leadStatusFilter) params.set("status", leadStatusFilter);
      params.set("page", leadPage.toString());
      const res = await fetch(`/api/v1/broker/leads?${params}`);
      if (res.ok) {
        const data = await res.json();
        setLeads(data.data || []);
        setLeadMeta(data.meta || { total: 0, pages: 1 });
      }
    } finally {
      setLoadingLeads(false);
    }
  }, [searchLeads, leadStatusFilter, leadPage]);

  const fetchProjects = useCallback(async () => {
    setLoadingProjects(true);
    try {
      const params = new URLSearchParams();
      if (searchProjects) params.set("search", searchProjects);
      if (projectStatusFilter) params.set("status", projectStatusFilter);
      params.set("page", projectPage.toString());
      const res = await fetch(`/api/v1/broker/projects?${params}`);
      if (res.ok) {
        const data = await res.json();
        setProjects(data.data || []);
        setProjectMeta(data.meta || { total: 0, pages: 1 });
      }
    } finally {
      setLoadingProjects(false);
    }
  }, [searchProjects, projectStatusFilter, projectPage]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);
  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">My Leads</h1>
        <p className="text-gray-400 text-sm">Track all leads and confirmed projects submitted through your referral links.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#0d0d0d] border border-white/10 rounded-xl p-1 w-fit">
        <button
          onClick={() => setActiveTab("general")}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "general"
              ? "bg-red-600 text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Users size={16} /> General Leads
          <span className="ml-1 bg-black/30 text-xs px-1.5 py-0.5 rounded-full">{leadMeta.total}</span>
        </button>
        <button
          onClick={() => setActiveTab("projects")}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "projects"
              ? "bg-red-600 text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <Briefcase size={16} /> Confirmed Projects
          <span className="ml-1 bg-black/30 text-xs px-1.5 py-0.5 rounded-full">{projectMeta.total}</span>
        </button>
      </div>

      {/* General Leads Tab */}
      {activeTab === "general" && (
        <div className="bg-[#111] rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={15} />
              <input
                type="text"
                placeholder="Search leads..."
                value={searchLeads}
                onChange={e => setSearchLeads(e.target.value)}
                className="w-full bg-[#0d0d0d] border border-white/10 rounded-md py-2 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-red-500/50"
              />
            </div>
            <select
              value={leadStatusFilter}
              onChange={e => setLeadStatusFilter(e.target.value)}
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
            <table className="w-full text-sm text-left text-gray-400">
              <thead className="bg-[#0d0d0d] text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-3">Lead ID</th>
                  <th className="px-6 py-3">Client</th>
                  <th className="px-6 py-3">Company</th>
                  <th className="px-6 py-3">Service</th>
                  <th className="px-6 py-3">City</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loadingLeads ? (
                  <tr><td colSpan={7} className="px-6 py-10 text-center text-gray-500">Loading...</td></tr>
                ) : leads.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-10 text-center text-gray-500">No general leads found.</td></tr>
                ) : (
                  leads.map(lead => (
                    <tr key={lead.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-red-400">{lead.leadCode}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{lead.name}</div>
                        <div className="text-xs text-gray-500">{lead.email}</div>
                      </td>
                      <td className="px-6 py-4">{lead.companyName || "—"}</td>
                      <td className="px-6 py-4 text-xs">{lead.serviceInterest || "—"}</td>
                      <td className="px-6 py-4 text-xs">{lead.city || "—"}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${STATUS_COLORS[lead.status] || "bg-gray-500/10 text-gray-400"}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs">{new Date(lead.createdAt).toLocaleDateString("en-IN")}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {leadMeta.pages > 1 && (
            <div className="p-4 border-t border-white/10 flex items-center justify-between text-sm">
              <span className="text-gray-500">{leadMeta.total} total leads</span>
              <div className="flex gap-2">
                <button onClick={() => setLeadPage(p => Math.max(1, p - 1))} disabled={leadPage === 1} className="p-1 rounded hover:bg-white/10 disabled:opacity-30 transition-colors">
                  <ChevronLeft size={16} />
                </button>
                <span className="text-gray-400">Page {leadPage} of {leadMeta.pages}</span>
                <button onClick={() => setLeadPage(p => Math.min(leadMeta.pages, p + 1))} disabled={leadPage === leadMeta.pages} className="p-1 rounded hover:bg-white/10 disabled:opacity-30 transition-colors">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirmed Projects Tab */}
      {activeTab === "projects" && (
        <div className="bg-[#111] rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={15} />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchProjects}
                onChange={e => setSearchProjects(e.target.value)}
                className="w-full bg-[#0d0d0d] border border-white/10 rounded-md py-2 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-red-500/50"
              />
            </div>
            <select
              value={projectStatusFilter}
              onChange={e => setProjectStatusFilter(e.target.value)}
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
            <table className="w-full text-sm text-left text-gray-400">
              <thead className="bg-[#0d0d0d] text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-3">Project ID</th>
                  <th className="px-6 py-3">Client</th>
                  <th className="px-6 py-3">Company</th>
                  <th className="px-6 py-3">Service</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Contract</th>
                  <th className="px-6 py-3">Payment</th>
                  <th className="px-6 py-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loadingProjects ? (
                  <tr><td colSpan={8} className="px-6 py-10 text-center text-gray-500">Loading...</td></tr>
                ) : projects.length === 0 ? (
                  <tr><td colSpan={8} className="px-6 py-10 text-center text-gray-500">No confirmed projects found.</td></tr>
                ) : (
                  projects.map(proj => (
                    <tr key={proj.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-emerald-400">{proj.projectCode}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{proj.clientName}</div>
                        <div className="text-xs text-gray-500">{proj.clientEmail}</div>
                      </td>
                      <td className="px-6 py-4">{proj.companyName}</td>
                      <td className="px-6 py-4 text-xs">{proj.requiredService}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${STATUS_COLORS[proj.status] || "bg-gray-500/10 text-gray-400"}`}>
                          {proj.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {proj.contract ? (
                          <span className={`px-2 py-1 rounded text-[10px] font-bold ${STATUS_COLORS[proj.contract.status] || "bg-gray-500/10 text-gray-400"}`}>
                            {proj.contract.status}
                          </span>
                        ) : <span className="text-gray-600 text-xs">—</span>}
                      </td>
                      <td className="px-6 py-4">
                        {proj.payment ? (
                          <span className={`px-2 py-1 rounded text-[10px] font-bold ${STATUS_COLORS[proj.payment.status] || "bg-gray-500/10 text-gray-400"}`}>
                            {proj.payment.status}
                          </span>
                        ) : <span className="text-gray-600 text-xs">—</span>}
                      </td>
                      <td className="px-6 py-4 text-xs">{new Date(proj.createdAt).toLocaleDateString("en-IN")}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {projectMeta.pages > 1 && (
            <div className="p-4 border-t border-white/10 flex items-center justify-between text-sm">
              <span className="text-gray-500">{projectMeta.total} total projects</span>
              <div className="flex gap-2">
                <button onClick={() => setProjectPage(p => Math.max(1, p - 1))} disabled={projectPage === 1} className="p-1 rounded hover:bg-white/10 disabled:opacity-30 transition-colors">
                  <ChevronLeft size={16} />
                </button>
                <span className="text-gray-400">Page {projectPage} of {projectMeta.pages}</span>
                <button onClick={() => setProjectPage(p => Math.min(projectMeta.pages, p + 1))} disabled={projectPage === projectMeta.pages} className="p-1 rounded hover:bg-white/10 disabled:opacity-30 transition-colors">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
