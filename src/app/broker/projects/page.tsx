"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, ChevronRight, Briefcase } from "lucide-react";

export default function BrokerProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchProjects();
  }, [search, statusFilter]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      
      const res = await fetch(`/api/v1/broker/projects?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch projects");
      setProjects(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">My Projects</h1>
          <p className="text-sm text-gray-400">Manage your confirmed projects and track their progress.</p>
        </div>
      </div>

      <div className="bg-[#111] border border-white/10 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={15} />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0d0d0d] border border-white/10 rounded-md py-2 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-red-500/50"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0d0d0d] border border-white/10 rounded-md py-2 px-3 text-sm text-gray-400 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="PROJECT_REQUESTED">Requested</option>
            <option value="CONTRACT_SENT">Contract Sent</option>
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
                <th className="px-6 py-3">Project</th>
                <th className="px-6 py-3">Client</th>
                <th className="px-6 py-3">Service</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Contract</th>
                <th className="px-6 py-3">Payment</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center">Loading...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-red-500">{error}</td>
                </tr>
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Briefcase size={32} className="text-gray-600 mb-3" />
                      <p>No confirmed projects found.</p>
                      <p className="text-xs mt-1">Convert leads to projects from the admin panel.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                  <tr key={project.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{project.projectName}</div>
                      <div className="text-xs text-gray-500 font-mono">{project.projectCode}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div>{project.clientName}</div>
                      <div className="text-xs text-gray-500">{project.companyName}</div>
                    </td>
                    <td className="px-6 py-4">{project.requiredService}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-white/5 rounded text-[10px] font-bold text-blue-400">
                        {project.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {project.contract ? (
                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                          project.contract.status === "VERIFIED" ? "bg-emerald-500/10 text-emerald-400" :
                          project.contract.status === "REJECTED" ? "bg-red-500/10 text-red-400" :
                          "bg-amber-500/10 text-amber-400"
                        }`}>
                          {project.contract.status}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-600">Pending</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {project.payment ? (
                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                          project.payment.status === "VERIFIED" ? "bg-emerald-500/10 text-emerald-400" :
                          project.payment.status === "REJECTED" ? "bg-red-500/10 text-red-400" :
                          "bg-amber-500/10 text-amber-400"
                        }`}>
                          {project.payment.status}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-600">Pending</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/broker/projects/${project.id}`}>
                        <button className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors">
                          <ChevronRight size={18} />
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
