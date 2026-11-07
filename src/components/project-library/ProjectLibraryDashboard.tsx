"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Search,
  Filter,
  Download,
  Plus,
  ExternalLink,
  Sparkles,
  Building,
  Calendar,
  Layers,
  Archive,
  RotateCcw,
  Eye,
  CheckCircle,
  FileSpreadsheet,
  AlertCircle,
  Briefcase,
  Lock,
  X,
  Edit2,
  FolderGit2,
} from "lucide-react";
import { ProjectDetailModal } from "./ProjectDetailModal";
import { ProjectFormModal } from "./ProjectFormModal";
import { ProjectPresentationModal } from "./ProjectPresentationModal";

export function ProjectLibraryDashboard() {
  const [projects, setProjects] = useState<any[]>([]);
  const [stats, setStats] = useState<any | null>(null);
  const [canWrite, setCanWrite] = useState(false);
  const [userRole, setUserRole] = useState<string>("EMPLOYEE");
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("ALL");
  const [selectedYear, setSelectedYear] = useState("ALL");
  const [showArchived, setShowArchived] = useState(false);
  const [viewMode, setViewMode] = useState<"card" | "table">("card");

  // Modal States
  const [detailProjectId, setDetailProjectId] = useState<string | null>(null);
  const [presentationProjectId, setPresentationProjectId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (selectedIndustry !== "ALL") params.append("industry", selectedIndustry);
      if (selectedYear !== "ALL") params.append("year", selectedYear);
      if (showArchived) params.append("archived", "true");

      const res = await fetch(`/api/v1/project-library?${params.toString()}`);
      const json = await res.json();
      if (json.success && json.data) {
        setProjects(json.data.items || []);
        setStats(json.data.stats || null);
        setCanWrite(Boolean(json.data.canWrite));
        setUserRole(json.data.userRole || "EMPLOYEE");
      }
    } catch (err) {
      console.error("Failed to load project library:", err);
      setFeedback({ type: "error", message: "Failed to load project archive." });
    } finally {
      setLoading(false);
    }
  }, [search, selectedIndustry, selectedYear, showArchived]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleArchive = async (id: string) => {
    if (!confirm("Are you sure you want to archive this project record?")) return;
    try {
      const res = await fetch(`/api/v1/project-library/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to archive project");
      setFeedback({ type: "success", message: "Project archived successfully." });
      setDetailProjectId(null);
      loadProjects();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Archive operation failed." });
    }
  };

  const handleRestore = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/project-library/${id}/restore`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to restore project");
      setFeedback({ type: "success", message: "Project restored successfully." });
      setDetailProjectId(null);
      loadProjects();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Restore operation failed." });
    }
  };

  const handleExportExcel = () => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (selectedIndustry !== "ALL") params.append("industry", selectedIndustry);
    window.open(`/api/v1/project-library/export?${params.toString()}`, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero */}
      <div className="bg-[#0E1116] rounded-2xl p-6 sm:p-8 border border-[#1E2530] shadow-xl relative overflow-hidden">
        {/* Ambient Brand Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D6B779]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-[#e8a064]/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#D6B779]/10 border border-[#D6B779]/20 text-[#D6B779] text-xs font-semibold">
              <FolderGit2 className="w-3.5 h-3.5 text-[#D6B779]" />
              <span>AxivonTech Centralized Project Library</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F3F5F7] tracking-tight">
              Completed Projects Archive
            </h1>
            <p className="text-xs sm:text-sm text-[#A7B0BC] max-w-2xl leading-relaxed">
              Official centralized repository of all verified projects successfully delivered by Axivon Technologies. Whenever presenting previous achievements to potential clients or verifying historical delivery records, access verified case data here.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 relative z-10">
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#151A21] hover:bg-[#1B222B] text-[#F3F5F7] rounded-xl text-xs font-bold border border-[#1E2530] hover:border-[#D6B779]/30 transition-all shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#10B981]" />
              <span>{canWrite ? "Export Excel (Full Master)" : "Export Excel (Read-Only)"}</span>
            </button>

            {canWrite && (
              <button
                onClick={() => {
                  setEditingProject(null);
                  setIsFormOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#D6B779] to-[#e8a064] hover:opacity-95 text-[#0B0D10] font-black rounded-xl text-xs shadow-lg shadow-[#D6B779]/20 transition-all"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Add Completed Project</span>
              </button>
            )}
          </div>
        </div>

        {/* Analytics & Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#1E2530] relative z-10">
          <div className="bg-[#151A21] p-4 rounded-xl border border-[#1E2530]">
            <p className="text-[11px] font-bold text-[#7E8997] uppercase tracking-wider">Total Delivered</p>
            <p className="text-2xl font-black text-[#F3F5F7] mt-1">{stats?.totalCompleted || projects.length}</p>
          </div>

          <div className="bg-[#151A21] p-4 rounded-xl border border-[#1E2530]">
            <p className="text-[11px] font-bold text-[#7E8997] uppercase tracking-wider">Industries Covered</p>
            <p className="text-2xl font-black text-[#D6B779] mt-1">
              {stats?.availableIndustries?.length || 6}
            </p>
          </div>

          <div className="bg-[#151A21] p-4 rounded-xl border border-[#1E2530]">
            <p className="text-[11px] font-bold text-[#7E8997] uppercase tracking-wider">Active Deployments</p>
            <p className="text-2xl font-black text-[#10B981] mt-1">100%</p>
          </div>

          <div className="bg-[#151A21] p-4 rounded-xl border border-[#1E2530]">
            <p className="text-[11px] font-bold text-[#7E8997] uppercase tracking-wider">Access Clearance</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#1B222B] text-[#D6B779] border border-[#D6B779]/20">
                {userRole}
              </span>
              <span className="text-[11px] font-semibold text-[#7E8997]">
                {canWrite ? "(Write & Present)" : "(Restricted Read-Only)"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between border ${
            feedback.type === "success"
              ? "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30"
              : "bg-red-500/10 text-red-400 border-red-500/30"
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Search Controls */}
      <div className="bg-[#0E1116] p-4 rounded-2xl border border-[#1E2530] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-1 flex-col sm:flex-row items-center gap-3 w-full">
          {/* Search */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7E8997]" />
            <input
              type="text"
              placeholder="Search projects by name, tech..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#10151B] border border-[#1E2530] rounded-xl py-2 pl-9 pr-3 text-xs text-[#F3F5F7] placeholder-[#566171] outline-none focus:border-[#D6B779]/50 transition-all"
            />
          </div>

          {/* Industry Filter */}
          <div className="w-full sm:w-auto">
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="w-full bg-[#10151B] border border-[#1E2530] rounded-xl py-2 px-3 text-xs text-[#F3F5F7] outline-none focus:border-[#D6B779]/50 transition-all cursor-pointer"
            >
              <option value="ALL" className="bg-[#10151B] text-[#F3F5F7]">All Industries</option>
              {(stats?.availableIndustries || []).map((ind: string) => (
                <option key={ind} value={ind} className="bg-[#10151B] text-[#F3F5F7]">
                  {ind}
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div className="w-full sm:w-auto">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full bg-[#10151B] border border-[#1E2530] rounded-xl py-2 px-3 text-xs text-[#F3F5F7] outline-none focus:border-[#D6B779]/50 transition-all cursor-pointer"
            >
              <option value="ALL" className="bg-[#10151B] text-[#F3F5F7]">All Completion Years</option>
              {(stats?.availableYears || [2026, 2025]).map((yr: number) => (
                <option key={yr} value={yr} className="bg-[#10151B] text-[#F3F5F7]">
                  {yr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* View mode toggle & write user archive toggle */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {canWrite && (
            <button
              onClick={() => setShowArchived((prev) => !prev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                showArchived
                  ? "bg-[#D6B779]/15 text-[#D6B779] border-[#D6B779]/40"
                  : "bg-[#151A21] text-[#7E8997] border-[#1E2530] hover:text-[#A7B0BC] hover:bg-[#1B222B]"
              }`}
            >
              {showArchived ? "Viewing Archived" : "View Archived"}
            </button>
          )}

          <div className="flex bg-[#10151B] p-1 rounded-xl border border-[#1E2530]">
            <button
              onClick={() => setViewMode("card")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === "card"
                  ? "bg-[#1B222B] text-[#F3F5F7] shadow-xs"
                  : "text-[#7E8997] hover:text-[#A7B0BC]"
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === "table"
                  ? "bg-[#1B222B] text-[#F3F5F7] shadow-xs"
                  : "text-[#7E8997] hover:text-[#A7B0BC]"
              }`}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* Projects Grid / Table */}
      {loading ? (
        <div className="p-16 text-center text-[#7E8997] bg-[#0E1116] rounded-2xl border border-[#1E2530]">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-[#D6B779] border-t-transparent rounded-full mb-3" />
          <p className="text-xs font-semibold">Loading archived projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="p-16 text-center bg-[#0E1116] rounded-2xl border border-[#1E2530] space-y-3">
          <Briefcase className="w-10 h-10 text-[#566171] mx-auto" />
          <h3 className="text-base font-bold text-[#F3F5F7]">No project records found</h3>
          <p className="text-xs text-[#7E8997] max-w-sm mx-auto">
            No projects matched your search criteria. Try modifying your industry or year filter.
          </p>
        </div>
      ) : viewMode === "card" ? (
        // CARD VIEW
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <div
              key={p.id}
              className="bg-[#101318] hover:bg-[#151A21] rounded-2xl border border-[#1E2530] hover:border-[#D6B779]/30 shadow-md hover:shadow-xl transition-all duration-200 flex flex-col justify-between overflow-hidden group"
            >
              {/* Card Thumbnail / Header */}
              <div>
                {/* For write users, display thumbnail image if present */}
                {canWrite && p.thumbnailUrl ? (
                  <div className="relative aspect-video w-full bg-[#0B0D10] overflow-hidden border-b border-[#1E2530]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.thumbnailUrl}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                    />
                    {p.isArchived && (
                      <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D6B779] text-[#0B0D10] shadow-xs">
                        Archived
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="p-6 pb-0">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#D6B779]/10 text-[#D6B779] border border-[#D6B779]/20">
                        <Building className="w-3 h-3" />
                        {p.industry}
                      </span>
                      {p.completionDate && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#7E8997]">
                          <Calendar className="w-3 h-3" />
                          {new Date(p.completionDate).toISOString().split("T")[0]}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Card Body */}
                <div className="p-6 pt-4 space-y-3">
                  <div>
                    <h3 className="text-base font-bold text-[#F3F5F7] tracking-tight group-hover:text-[#e8a064] transition-colors">
                      {p.name}
                    </h3>
                    {canWrite && p.clientCompany && (
                      <p className="text-xs text-[#A7B0BC] mt-0.5 font-medium">{p.clientCompany}</p>
                    )}
                  </div>

                  {/* For write users: short description */}
                  {canWrite && p.shortDescription && (
                    <p className="text-xs text-[#7E8997] line-clamp-2 leading-relaxed">
                      {p.shortDescription}
                    </p>
                  )}

                  {/* For read-only users: exactly the 4 required fields */}
                  {!canWrite && (
                    <div className="space-y-1.5 text-xs text-[#A7B0BC] pt-2 border-t border-[#1E2530]">
                      <div className="flex justify-between">
                        <span className="font-semibold text-[#7E8997]">Industry:</span>
                        <span className="font-bold text-[#F3F5F7]">{p.industry}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-[#7E8997]">Completion:</span>
                        <span className="font-bold text-[#F3F5F7]">
                          {p.completionDate
                            ? new Date(p.completionDate).toISOString().split("T")[0]
                            : "Verified"}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Live URL Link */}
                  {p.liveUrl && (
                    <div className="pt-2">
                      <a
                        href={p.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D6B779] hover:text-[#e8a064] hover:underline break-all transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{p.liveUrl}</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="bg-[#0E1116] px-6 py-3.5 border-t border-[#1E2530] flex items-center justify-between gap-2">
                <button
                  onClick={() => setDetailProjectId(p.id)}
                  className="text-xs font-bold text-[#A7B0BC] hover:text-[#F3F5F7] transition-colors flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{canWrite ? "Full Details" : "View Record"}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {canWrite && (
                    <>
                      <button
                        onClick={() => setPresentationProjectId(p.id)}
                        title="Present Project to Client"
                        className="p-1.5 text-[#D6B779] hover:bg-[#D6B779]/10 rounded-lg transition-colors border border-[#D6B779]/20"
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingProject(p);
                          setIsFormOpen(true);
                        }}
                        title="Edit Project Details"
                        className="p-1.5 text-[#A7B0BC] hover:text-[#F3F5F7] hover:bg-[#1B222B] rounded-lg transition-colors border border-[#1E2530]"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // TABLE VIEW
        <div className="bg-[#101318] rounded-2xl border border-[#1E2530] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0E1116] border-b border-[#1E2530] text-[#7E8997] font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Project Name</th>
                  <th className="py-3.5 px-4">Industry / Field</th>
                  <th className="py-3.5 px-4">Live URL</th>
                  <th className="py-3.5 px-4">Completion Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2530] font-medium text-[#A7B0BC]">
                {projects.map((p) => (
                  <tr key={p.id} className="hover:bg-[#151A21] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#F3F5F7]">
                      {p.name}
                      {canWrite && p.clientCompany && (
                        <span className="block text-[11px] font-normal text-[#7E8997]">
                          {p.clientCompany}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#D6B779]/10 text-[#D6B779] font-semibold border border-[#D6B779]/20">
                        {p.industry}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {p.liveUrl ? (
                        <a
                          href={p.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[#D6B779] hover:text-[#e8a064] hover:underline font-semibold transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>{p.liveUrl}</span>
                        </a>
                      ) : (
                        <span className="text-[#566171]">N/A</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-[#A7B0BC] font-mono">
                      {p.completionDate
                        ? new Date(p.completionDate).toISOString().split("T")[0]
                        : "Verified"}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => setDetailProjectId(p.id)}
                          className="px-2.5 py-1 bg-[#151A21] hover:bg-[#1B222B] text-[#F3F5F7] border border-[#1E2530] rounded-lg text-xs font-bold transition-colors"
                        >
                          View
                        </button>
                        {canWrite && (
                          <button
                            onClick={() => setPresentationProjectId(p.id)}
                            className="px-2.5 py-1 bg-[#D6B779]/10 hover:bg-[#D6B779]/20 text-[#D6B779] border border-[#D6B779]/30 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>Present</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailProjectId && (
        <ProjectDetailModal
          projectId={detailProjectId}
          isOpen={Boolean(detailProjectId)}
          onClose={() => setDetailProjectId(null)}
          onEdit={(proj) => {
            setDetailProjectId(null);
            setEditingProject(proj);
            setIsFormOpen(true);
          }}
          onPresent={(id) => {
            setDetailProjectId(null);
            setPresentationProjectId(id);
          }}
          onArchive={handleArchive}
          onRestore={handleRestore}
        />
      )}

      {/* Presentation Modal */}
      {presentationProjectId && (
        <ProjectPresentationModal
          projectId={presentationProjectId}
          isOpen={Boolean(presentationProjectId)}
          onClose={() => setPresentationProjectId(null)}
        />
      )}

      {/* Create / Edit Form Modal */}
      {isFormOpen && (
        <ProjectFormModal
          isOpen={isFormOpen}
          initialData={editingProject}
          onClose={() => {
            setIsFormOpen(false);
            setEditingProject(null);
          }}
          onSuccess={() => {
            setFeedback({
              type: "success",
              message: editingProject
                ? `Project "${editingProject.name}" updated successfully.`
                : "Project record added to library successfully.",
            });
            loadProjects();
          }}
        />
      )}
    </div>
  );
}
