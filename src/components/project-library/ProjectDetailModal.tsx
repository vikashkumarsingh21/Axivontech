"use client";

import { useEffect, useState } from "react";
import {
  X,
  ExternalLink,
  Calendar,
  Building,
  CheckCircle,
  FileText,
  Layers,
  Lock,
  Sparkles,
  Edit2,
  Archive,
  RotateCcw,
  Clock,
  User,
  ShieldAlert,
  FolderGit2,
} from "lucide-react";

interface ProjectDetailModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (project: any) => void;
  onPresent?: (projectId: string) => void;
  onArchive?: (projectId: string) => void;
  onRestore?: (projectId: string) => void;
}

export function ProjectDetailModal({
  projectId,
  isOpen,
  onClose,
  onEdit,
  onPresent,
  onArchive,
  onRestore,
}: ProjectDetailModalProps) {
  const [project, setProject] = useState<any | null>(null);
  const [canWrite, setCanWrite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "tech" | "features" | "media" | "internal" | "audit"
  >("overview");

  useEffect(() => {
    if (!isOpen || !projectId) return;
    setLoading(true);
    fetch(`/api/v1/project-library/${projectId}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setProject(json.data.project);
          setCanWrite(Boolean(json.data.canWrite));
        }
      })
      .catch((err) => console.error("Failed to load project details:", err))
      .finally(() => setLoading(false));
  }, [isOpen, projectId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#0B0D10]/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#101318] rounded-2xl shadow-2xl border border-[#1E2530] overflow-hidden my-8 text-[#F3F5F7]">
        {/* Header */}
        <div className="px-6 py-5 bg-[#0E1116] text-[#F3F5F7] flex items-center justify-between border-b border-[#1E2530]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D6B779]/10 border border-[#D6B779]/20 flex items-center justify-center text-[#D6B779]">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#1B222B] text-[#D6B779] border border-[#D6B779]/20">
                  {project?.industry || "Completed Project"}
                </span>
                {project?.status && (
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                    {project.status}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold tracking-tight text-[#F3F5F7] mt-1">
                {project ? project.name : "Loading Project Details..."}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#7E8997] hover:text-[#F3F5F7] hover:bg-[#151A21] rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="p-16 text-center text-[#7E8997]">
            <div className="inline-block animate-spin w-8 h-8 border-4 border-[#D6B779] border-t-transparent rounded-full mb-3" />
            <p className="text-sm font-medium">Loading project information...</p>
          </div>
        ) : !project ? (
          <div className="p-12 text-center text-[#7E8997]">
            <p className="text-sm">Project details not found.</p>
          </div>
        ) : !canWrite ? (
          // ─────────────────────────────────────────────────────────────
          // STRICT RESTRICTED READ-ONLY VIEW (BROKER / EMPLOYEE / GUEST)
          // Displays strictly ONLY:
          // 1. Project Name
          // 2. Project Field / Industry
          // 3. Project Live URL
          // 4. Project Completion Date
          // ─────────────────────────────────────────────────────────────
          <div className="p-6 sm:p-8 space-y-6">
            <div className="bg-[#151A21] border border-[#1E2530] rounded-2xl p-6 space-y-6">
              <div className="border-b border-[#1E2530] pb-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#7E8997] mb-1">
                  Project Record
                </p>
                <h3 className="text-2xl font-bold text-[#F3F5F7] tracking-tight">
                  {project.name}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Field / Industry */}
                <div className="bg-[#101318] p-4 rounded-xl border border-[#1E2530] space-y-1">
                  <p className="text-xs font-semibold text-[#7E8997] flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-[#D6B779]" />
                    <span>Project Field / Industry</span>
                  </p>
                  <p className="text-base font-bold text-[#F3F5F7]">
                    {project.industry}
                  </p>
                </div>

                {/* Completion Date */}
                <div className="bg-[#101318] p-4 rounded-xl border border-[#1E2530] space-y-1">
                  <p className="text-xs font-semibold text-[#7E8997] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>Completion Date</span>
                  </p>
                  <p className="text-base font-bold text-[#F3F5F7]">
                    {project.completionDate
                      ? new Date(project.completionDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Verified Completed"}
                  </p>
                </div>
              </div>

              {/* Live Website Link */}
              <div className="bg-[#101318] p-4 rounded-xl border border-[#1E2530] space-y-2">
                <p className="text-xs font-semibold text-[#7E8997] flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-[#D6B779]" />
                  <span>Project Live URL</span>
                </p>
                {project.liveUrl ? (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#D6B779] hover:text-[#e8a064] hover:underline break-all transition-colors"
                  >
                    <span>{project.liveUrl}</span>
                    <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                  </a>
                ) : (
                  <p className="text-xs text-[#566171]">Live URL archived in internal records.</p>
                )}
              </div>
            </div>

            <div className="bg-[#151A21] border border-[#D6B779]/20 rounded-xl p-4 text-xs text-[#A7B0BC] flex items-start gap-3">
              <Lock className="w-4 h-4 text-[#D6B779] flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#F3F5F7]">Access Clearance Notice: </span>
                <span>
                  You have authorized read-only visibility for this project. To request additional client presentation assets or technical specifications, contact your portal administrator.
                </span>
              </div>
            </div>
          </div>
        ) : (
          // ─────────────────────────────────────────────────────────────
          // FULL COMPREHENSIVE VIEW FOR AUTHORIZED WRITE USERS
          // Admin, Founder, Co-Founder, Manager
          // ─────────────────────────────────────────────────────────────
          <div className="p-6 sm:p-8 space-y-6">
            {/* Top Navigation Tabs */}
            <div className="flex border-b border-[#1E2530] gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === "overview"
                    ? "bg-[#D6B779]/15 text-[#D6B779] border border-[#D6B779]/30"
                    : "text-[#7E8997] hover:text-[#A7B0BC] hover:bg-[#151A21]"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Overview & Scope</span>
              </button>
              <button
                onClick={() => setActiveTab("tech")}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === "tech"
                    ? "bg-[#D6B779]/15 text-[#D6B779] border border-[#D6B779]/30"
                    : "text-[#7E8997] hover:text-[#A7B0BC] hover:bg-[#151A21]"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Tech Stack</span>
              </button>
              <button
                onClick={() => setActiveTab("features")}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === "features"
                    ? "bg-[#D6B779]/15 text-[#D6B779] border border-[#D6B779]/30"
                    : "text-[#7E8997] hover:text-[#A7B0BC] hover:bg-[#151A21]"
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Features ({project.features?.length || 0})</span>
              </button>
              <button
                onClick={() => setActiveTab("media")}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === "media"
                    ? "bg-[#D6B779]/15 text-[#D6B779] border border-[#D6B779]/30"
                    : "text-[#7E8997] hover:text-[#A7B0BC] hover:bg-[#151A21]"
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                <span>Media & Assets</span>
              </button>
              <button
                onClick={() => setActiveTab("internal")}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === "internal"
                    ? "bg-[#D6B779]/15 text-[#D6B779] border border-[#D6B779]/30"
                    : "text-[#7E8997] hover:text-[#A7B0BC] hover:bg-[#151A21]"
                }`}
              >
                <Lock className="w-3.5 h-3.5 text-[#D6B779]" />
                <span>Internal Information</span>
              </button>
              <button
                onClick={() => setActiveTab("audit")}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === "audit"
                    ? "bg-[#D6B779]/15 text-[#D6B779] border border-[#D6B779]/30"
                    : "text-[#7E8997] hover:text-[#A7B0BC] hover:bg-[#151A21]"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Audit Trail</span>
              </button>
            </div>

            {/* Tab 1: Overview & Scope */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#151A21] p-4 rounded-xl border border-[#1E2530]">
                  <div>
                    <p className="text-[11px] font-bold text-[#7E8997] uppercase">Client / Company</p>
                    <p className="text-sm font-bold text-[#F3F5F7] mt-0.5">
                      {project.clientCompany || project.clientName || "Axivon Technologies"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[#7E8997] uppercase">Project Type</p>
                    <p className="text-sm font-bold text-[#F3F5F7] mt-0.5">
                      {project.projectType || project.category}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[#7E8997] uppercase">Completion Date</p>
                    <p className="text-sm font-bold text-[#F3F5F7] mt-0.5">
                      {project.completionDate
                        ? new Date(project.completionDate).toISOString().split("T")[0]
                        : "N/A"}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#7E8997]">
                    Short Description
                  </h4>
                  <p className="text-sm text-[#A7B0BC] leading-relaxed bg-[#151A21] p-4 rounded-xl border border-[#1E2530]">
                    {project.shortDescription}
                  </p>
                </div>

                {project.overview && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#7E8997]">
                      Complete Project Overview
                    </h4>
                    <p className="text-sm text-[#A7B0BC] leading-relaxed bg-[#151A21] p-4 rounded-xl border border-[#1E2530] whitespace-pre-line">
                      {project.overview}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.problemStatement && (
                    <div className="bg-[#151A21] border border-[#1E2530] p-4 rounded-xl space-y-1">
                      <h4 className="text-xs font-bold text-[#F3F5F7]">Problem Statement</h4>
                      <p className="text-xs text-[#A7B0BC] leading-relaxed whitespace-pre-line">
                        {project.problemStatement}
                      </p>
                    </div>
                  )}
                  {project.solutionDelivered && (
                    <div className="bg-[#10B981]/5 border border-[#10B981]/20 p-4 rounded-xl space-y-1">
                      <h4 className="text-xs font-bold text-[#10B981]">Solution Delivered</h4>
                      <p className="text-xs text-[#A7B0BC] leading-relaxed whitespace-pre-line">
                        {project.solutionDelivered}
                      </p>
                    </div>
                  )}
                </div>

                {project.liveUrl && (
                  <div className="flex items-center gap-3 p-3 bg-[#151A21] border border-[#D6B779]/20 rounded-xl">
                    <ExternalLink className="w-4 h-4 text-[#D6B779]" />
                    <span className="text-xs font-semibold text-[#A7B0BC]">Production URL:</span>
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-[#D6B779] hover:text-[#e8a064] hover:underline transition-colors"
                    >
                      {project.liveUrl}
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Tech Stack */}
            {activeTab === "tech" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#151A21] p-4 rounded-xl border border-[#1E2530] space-y-2">
                    <h4 className="text-[11px] font-bold text-[#7E8997] uppercase tracking-wider">Frontend Technologies</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {(project.frontendTech?.length ? project.frontendTech : ["React", "TypeScript"]).map(
                        (t: string, i: number) => (
                          <span key={i} className="px-2.5 py-1 bg-[#101318] border border-[#1E2530] rounded-md text-xs font-medium text-[#F3F5F7]">
                            {t}
                          </span>
                        )
                      )}
                    </div>
                  </div>

                  <div className="bg-[#151A21] p-4 rounded-xl border border-[#1E2530] space-y-2">
                    <h4 className="text-[11px] font-bold text-[#7E8997] uppercase tracking-wider">Backend Technologies</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {(project.backendTech?.length ? project.backendTech : ["Node.js"]).map(
                        (t: string, i: number) => (
                          <span key={i} className="px-2.5 py-1 bg-[#101318] border border-[#1E2530] rounded-md text-xs font-medium text-[#F3F5F7]">
                            {t}
                          </span>
                        )
                      )}
                    </div>
                  </div>

                  <div className="bg-[#151A21] p-4 rounded-xl border border-[#1E2530] space-y-2">
                    <h4 className="text-[11px] font-bold text-[#7E8997] uppercase tracking-wider">Database Technologies</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {(project.databaseTech?.length ? project.databaseTech : ["PostgreSQL"]).map(
                        (t: string, i: number) => (
                          <span key={i} className="px-2.5 py-1 bg-[#101318] border border-[#1E2530] rounded-md text-xs font-medium text-[#F3F5F7]">
                            {t}
                          </span>
                        )
                      )}
                    </div>
                  </div>

                  <div className="bg-[#151A21] p-4 rounded-xl border border-[#1E2530] space-y-2">
                    <h4 className="text-[11px] font-bold text-[#7E8997] uppercase tracking-wider">APIs & Integrations</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {(project.apisAndIntegrations?.length ? project.apisAndIntegrations : ["REST API"]).map(
                        (t: string, i: number) => (
                          <span key={i} className="px-2.5 py-1 bg-[#101318] border border-[#1E2530] rounded-md text-xs font-medium text-[#F3F5F7]">
                            {t}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>

                {project.hostingPlatform && (
                  <div className="bg-[#151A21] p-4 rounded-xl border border-[#1E2530]">
                    <span className="text-xs font-bold text-[#7E8997]">Hosting Platform: </span>
                    <span className="text-xs font-bold text-[#D6B779]">{project.hostingPlatform}</span>
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Features */}
            {activeTab === "features" && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#7E8997]">
                  Delivered Functional Features
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(project.features || []).map((feat: string, i: number) => (
                    <div
                      key={i}
                      className="flex items-center gap-2.5 p-3 bg-[#151A21] border border-[#1E2530] rounded-xl text-xs font-semibold text-[#F3F5F7]"
                    >
                      <CheckCircle className="w-4 h-4 text-[#10B981] flex-shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 4: Media & Assets */}
            {activeTab === "media" && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#7E8997]">
                  Project Screenshots & Gallery
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {project.thumbnailUrl && (
                    <div className="border border-[#1E2530] rounded-xl overflow-hidden bg-[#0B0D10]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={project.thumbnailUrl}
                        alt="Thumbnail"
                        className="w-full h-40 object-cover"
                      />
                      <p className="p-2.5 text-[11px] font-semibold text-[#A7B0BC] bg-[#0E1116] border-t border-[#1E2530]">
                        Primary Thumbnail
                      </p>
                    </div>
                  )}
                  {(project.websiteScreenshots || []).map((src: string, i: number) => (
                    <div key={i} className="border border-[#1E2530] rounded-xl overflow-hidden bg-[#0B0D10]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt={`Screenshot ${i + 1}`} className="w-full h-40 object-cover" />
                      <p className="p-2.5 text-[11px] font-semibold text-[#A7B0BC] bg-[#0E1116] border-t border-[#1E2530]">
                        Screenshot #{i + 1}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 5: Internal Information (STRICT RESTRICTED) */}
            {activeTab === "internal" && (
              <div className="space-y-4 bg-[#151A21] border border-[#D6B779]/30 rounded-2xl p-6">
                <div className="flex items-center gap-2 text-[#D6B779] border-b border-[#1E2530] pb-3">
                  <ShieldAlert className="w-5 h-5 text-[#D6B779]" />
                  <h4 className="text-sm font-bold text-[#F3F5F7]">Confidential Internal Project Information</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D6B779]/15 text-[#D6B779] border border-[#D6B779]/30">
                    Restricted Access
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="bg-[#101318] p-4 rounded-xl border border-[#1E2530]">
                    <p className="text-[11px] font-bold text-[#7E8997] uppercase">Project Owner</p>
                    <p className="text-sm font-semibold text-[#F3F5F7] mt-1">
                      {project.projectOwner || "VIKASH KUMAR"}
                    </p>
                  </div>
                  <div className="bg-[#101318] p-4 rounded-xl border border-[#1E2530]">
                    <p className="text-[11px] font-bold text-[#7E8997] uppercase">Assigned Team / Department</p>
                    <p className="text-sm font-semibold text-[#F3F5F7] mt-1">
                      {project.assignedTeam || project.developmentDepartment || "Core Development"}
                    </p>
                  </div>
                </div>

                {project.internalNotes && (
                  <div className="bg-[#101318] p-4 rounded-xl border border-[#1E2530] space-y-1">
                    <p className="text-[11px] font-bold text-[#7E8997] uppercase">Internal Notes</p>
                    <p className="text-xs text-[#A7B0BC] leading-relaxed whitespace-pre-line">
                      {project.internalNotes}
                    </p>
                  </div>
                )}

                {project.deliveryNotes && (
                  <div className="bg-[#101318] p-4 rounded-xl border border-[#1E2530] space-y-1">
                    <p className="text-[11px] font-bold text-[#7E8997] uppercase">Delivery Notes</p>
                    <p className="text-xs text-[#A7B0BC] leading-relaxed">
                      {project.deliveryNotes}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Tab 6: Audit Trail */}
            {activeTab === "audit" && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#7E8997]">
                  Recent Project Operations & Audit Trail
                </h4>
                <div className="bg-[#151A21] border border-[#1E2530] rounded-xl overflow-hidden divide-y divide-[#1E2530]">
                  {(project.auditLogs || []).map((log: any, i: number) => (
                    <div key={i} className="p-3.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-[#F3F5F7]">{log.action}</span>
                        <span className="text-[#7E8997] ml-2">by {log.userName || log.userRole || "User"}</span>
                      </div>
                      <span className="text-[#7E8997] font-mono text-[11px]">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))}
                  {(!project.auditLogs || project.auditLogs.length === 0) && (
                    <div className="p-6 text-center text-[#7E8997] text-xs">
                      No audit history entries recorded.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal Action Footer */}
        <div className="bg-[#0E1116] px-6 py-4 border-t border-[#1E2530] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {canWrite && project && (
              <>
                <button
                  onClick={() => onPresent && onPresent(project.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#D6B779]/15 hover:bg-[#D6B779]/25 text-[#D6B779] border border-[#D6B779]/30 rounded-xl text-xs font-semibold shadow-xs transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Present to Client</span>
                </button>
                <button
                  onClick={() => onEdit && onEdit(project)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#151A21] hover:bg-[#1B222B] text-[#F3F5F7] border border-[#1E2530] rounded-xl text-xs font-semibold transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Details</span>
                </button>
                {project.isArchived ? (
                  <button
                    onClick={() => onRestore && onRestore(project.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#10B981]/15 hover:bg-[#10B981]/25 text-[#10B981] border border-[#10B981]/30 rounded-xl text-xs font-semibold transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore Project</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onArchive && onArchive(project.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#151A21] hover:bg-red-500/10 hover:text-red-400 text-[#7E8997] border border-[#1E2530] rounded-xl text-xs font-semibold transition-colors"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    <span>Archive</span>
                  </button>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            {project?.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#D6B779] to-[#e8a064] text-[#0B0D10] font-bold rounded-xl text-xs transition-opacity hover:opacity-95 shadow-md shadow-[#D6B779]/20"
              >
                <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Visit Live</span>
              </a>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#151A21] hover:bg-[#1B222B] text-[#A7B0BC] hover:text-[#F3F5F7] border border-[#1E2530] rounded-xl text-xs font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
