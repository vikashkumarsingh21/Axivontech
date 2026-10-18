"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  Briefcase,
  ChevronLeft,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FolderCheck,
  FileText,
  Download,
  Users,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Layers,
  ArrowRight,
  Send,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";

interface Milestone {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  startDate?: string | null;
  targetDate?: string | null;
  completionDate?: string | null;
  order: number;
}

interface DocumentItem {
  id: string;
  title: string;
  description?: string | null;
  category: string;
  mimeType?: string | null;
  sizeBytes?: number | null;
  isImportant?: boolean;
  createdAt: string;
}

interface TeamMember {
  role: string;
  user: {
    name: string;
    email: string;
  };
}

interface ProjectDetail {
  id: string;
  projectCode: string;
  projectName: string;
  requiredService: string;
  detailedRequirement?: string | null;
  expectedTimeline?: string | null;
  projectBudget?: string | null;
  status: string;
  progressPercentage: number;
  expectedDeliveryDate?: string | null;
  companyName?: string | null;
  clientName?: string | null;
  clientEmail?: string | null;
  clientPhone?: string | null;
  qaStatus?: string | null;
  deliveredAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  milestones: Milestone[];
  documents: DocumentItem[];
  team: TeamMember[];
}

export default function ClientProjectWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"milestones" | "deliverables" | "documents" | "support">("milestones");

  // UAT Approval Modal state
  const [approvingUat, setApprovingUat] = useState(false);
  const [uatSuccess, setUatSuccess] = useState(false);

  // Quick Support Ticket state
  const [supportSubject, setSupportSubject] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [supportPriority, setSupportPriority] = useState("MEDIUM");
  const [submittingSupport, setSubmittingSupport] = useState(false);
  const [supportSuccess, setSupportSuccess] = useState(false);

  const fetchProject = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/v1/client/projects/${projectId}`);
      if (!res.ok) {
        throw new Error("Project not found or authorized access denied");
      }
      const json = await res.json();
      setProject(json.data);
    } catch (err: any) {
      setError(err.message || "Failed to load project details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const handleApproveUat = async () => {
    try {
      setApprovingUat(true);
      const res = await fetch(`/api/v1/client/projects/${projectId}/uat`, {
        method: "POST",
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "UAT approval failed");
      }
      setUatSuccess(true);
      fetchProject();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setApprovingUat(false);
    }
  };

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportSubject.trim() || !supportMessage.trim()) return;

    try {
      setSubmittingSupport(true);
      const res = await fetch("/api/v1/client/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          subject: supportSubject,
          message: supportMessage,
          priority: supportPriority,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to submit inquiry");
      }
      setSupportSuccess(true);
      setSupportSubject("");
      setSupportMessage("");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmittingSupport(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge variant="success">Completed</Badge>;
      case "IN_PROGRESS":
        return <Badge variant="brand">In Progress</Badge>;
      case "UAT":
      case "UNDER_REVIEW":
        return <Badge variant="warning">Under Review / UAT</Badge>;
      case "ON_HOLD":
        return <Badge variant="neutral">On Hold</Badge>;
      default:
        return <Badge variant="neutral">{status.replace("_", " ")}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-3">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        <p className="text-sm text-[#7E8997]">Loading project workspace...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="space-y-4">
        <Link href="/client/projects" className="inline-flex items-center text-xs text-[#7E8997] hover:text-[#F3F5F7]">
          <ChevronLeft className="w-4 h-4 mr-1" />
          <span>Back to Projects Directory</span>
        </Link>
        <Card className="bg-[#151A21] border-red-500/20">
          <CardContent className="p-8 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
            <h2 className="text-lg font-bold text-[#F3F5F7]">{error || "Project Not Found"}</h2>
            <p className="text-xs text-[#7E8997] max-w-md mx-auto">
              This project does not exist or your client session is not authorized to inspect its workspace.
            </p>
            <Link href="/client/projects">
              <Button variant="outline" size="sm" className="mt-2">
                Return to Directory
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/client/projects"
          className="inline-flex items-center text-xs font-semibold text-[#7E8997] hover:text-[#F3F5F7] transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          <span>Back to All Projects</span>
        </Link>
        <div className="flex items-center gap-2 font-mono text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{project.projectCode}</span>
        </div>
      </div>

      {/* Project Header Banner */}
      <div className="bg-[#151A21] border border-[#29313B] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="font-mono text-xs font-bold text-emerald-400 uppercase tracking-wider">
                {project.companyName || "Axivon Client Delivery"}
              </span>
              <span className="text-[#29313B]">•</span>
              {getStatusBadge(project.status)}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F3F5F7] tracking-tight">
              {project.projectName}
            </h1>
            <p className="text-sm text-[#7E8997] mt-1">
              {project.requiredService || "Custom Software Development"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href={`/client/uat`}>
              <Button variant={project.qaStatus === "UAT_READY" ? "primary" : "secondary"} size="sm">
                <FolderCheck className="w-4 h-4 mr-1.5" />
                <span>UAT & Deliverables</span>
              </Button>
            </Link>
            <Link href={`/client/documents`}>
              <Button variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-1.5" />
                <span>Document Vault</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Progress & Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#1E2530]">
          <div>
            <span className="text-xs text-[#566171] uppercase font-bold tracking-wider">Sprint Progress</span>
            <div className="flex items-center gap-3 mt-1.5">
              <div className="flex-1 h-2 bg-[#1B222B] rounded-full overflow-hidden border border-[#29313B]">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(project.progressPercentage || 0, 100)}%` }}
                />
              </div>
              <span className="font-mono text-xs font-bold text-[#F3F5F7]">{project.progressPercentage || 0}%</span>
            </div>
          </div>

          <div>
            <span className="text-xs text-[#566171] uppercase font-bold tracking-wider">Target Delivery</span>
            <div className="flex items-center gap-2 mt-1.5 text-xs font-semibold text-[#F3F5F7]">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {project.expectedDeliveryDate
                  ? new Date(project.expectedDeliveryDate).toLocaleDateString()
                  : "Scheduled Sprint"}
              </span>
            </div>
          </div>

          <div>
            <span className="text-xs text-[#566171] uppercase font-bold tracking-wider">Engagement Team</span>
            <div className="flex items-center gap-2 mt-1.5 text-xs font-semibold text-[#F3F5F7]">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {project.team.length > 0
                  ? `${project.team.length} Engineers Assigned`
                  : "Dedicated Axivon Team"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Workspace Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1E2530] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("milestones")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === "milestones"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
              : "text-[#7E8997] hover:text-[#F3F5F7] hover:bg-[#1B222B]"
          }`}
        >
          Milestones & Timeline ({project.milestones.length})
        </button>
        <button
          onClick={() => setActiveTab("deliverables")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === "deliverables"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
              : "text-[#7E8997] hover:text-[#F3F5F7] hover:bg-[#1B222B]"
          }`}
        >
          Deliverables & UAT {project.qaStatus === "UAT_READY" && "• Needs Action"}
        </button>
        <button
          onClick={() => setActiveTab("documents")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === "documents"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
              : "text-[#7E8997] hover:text-[#F3F5F7] hover:bg-[#1B222B]"
          }`}
        >
          Shared Documents ({project.documents.length})
        </button>
        <button
          onClick={() => setActiveTab("support")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === "support"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
              : "text-[#7E8997] hover:text-[#F3F5F7] hover:bg-[#1B222B]"
          }`}
        >
          Inquiry & Support
        </button>
      </div>

      {/* Tab 1: Milestones Timeline */}
      {activeTab === "milestones" && (
        <Card className="bg-[#151A21] border-[#29313B]">
          <CardHeader className="border-b border-[#1E2530] pb-4">
            <CardTitle className="text-[#F3F5F7]">Milestone Delivery Timeline</CardTitle>
            <CardDescription className="text-[#7E8997]">
              Track phased delivery requirements, start dates, and completed deliverables.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {project.milestones.length === 0 ? (
              <EmptyState
                icon={Layers}
                title="No Milestones Defined Yet"
                description="Your dedicated project manager is currently calibrating milestone delivery dates for this engagement."
              />
            ) : (
              <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#29313B]">
                {project.milestones.map((m, idx) => {
                  const isCompleted = m.status === "COMPLETED";
                  const isInProgress = m.status === "IN_PROGRESS";

                  return (
                    <div key={m.id} className="relative">
                      {/* Node bullet */}
                      <div
                        className={`absolute -left-[27px] top-1 w-4 h-4 rounded-full border-2 ${
                          isCompleted
                            ? "bg-emerald-500 border-emerald-400"
                            : isInProgress
                            ? "bg-emerald-500/20 border-emerald-400 animate-pulse"
                            : "bg-[#101318] border-[#364152]"
                        }`}
                      />

                      <div className="bg-[#101318]/70 border border-[#29313B] rounded-xl p-4.5 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <h4 className="text-sm font-bold text-[#F3F5F7]">
                            <span className="text-[#566171] mr-2">#{idx + 1}</span>
                            {m.title}
                          </h4>
                          <span
                            className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                              isCompleted
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : isInProgress
                                ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                : "bg-[#1B222B] text-[#7E8997] border-[#29313B]"
                            }`}
                          >
                            {m.status.replace("_", " ")}
                          </span>
                        </div>

                        {m.description && (
                          <p className="text-xs text-[#7E8997] leading-relaxed">
                            {m.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-xs text-[#566171] pt-2 border-t border-[#1E2530]">
                          {m.startDate && (
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Started: {new Date(m.startDate).toLocaleDateString()}</span>
                            </div>
                          )}
                          {m.targetDate && (
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>Target: {new Date(m.targetDate).toLocaleDateString()}</span>
                            </div>
                          )}
                          {m.completionDate && (
                            <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Delivered: {new Date(m.completionDate).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab 2: Deliverables & UAT */}
      {activeTab === "deliverables" && (
        <div className="space-y-6">
          {/* UAT Status Alert */}
          <div className="bg-[#151A21] border border-[#29313B] rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-[#566171] uppercase tracking-wider">Quality Assurance & UAT Stage</span>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                    project.qaStatus === "UAT_APPROVED"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : project.qaStatus === "UAT_READY"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      : "bg-[#1B222B] text-[#7E8997] border-[#29313B]"
                  }`}
                >
                  {project.qaStatus?.replace("_", " ") || "INTERNAL QA"}
                </span>
              </div>
              <h3 className="text-base font-bold text-[#F3F5F7]">
                {project.qaStatus === "UAT_APPROVED"
                  ? "Deliverables Approved & Accepted"
                  : project.qaStatus === "UAT_READY"
                  ? "Engineering Release Ready for Client Acceptance"
                  : "Engagements in Active Quality Assurance"}
              </h3>
              <p className="text-xs text-[#7E8997] mt-1">
                {project.qaStatus === "UAT_APPROVED"
                  ? "Official acceptance sign-off is logged. Engagement is transitioning to final production handover."
                  : project.qaStatus === "UAT_READY"
                  ? "Please review the build deliverables below and submit your formal client approval."
                  : "Our QA engineers are currently testing sprint features against defined acceptance criteria."}
              </p>
            </div>

            {project.qaStatus === "UAT_READY" && !uatSuccess && (
              <Button
                variant="primary"
                onClick={handleApproveUat}
                disabled={approvingUat}
                className="whitespace-nowrap"
              >
                {approvingUat ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                <span>{approvingUat ? "Recording Approval..." : "Approve Deliverables"}</span>
              </Button>
            )}

            {uatSuccess && (
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
                <CheckCircle2 className="w-4 h-4" />
                <span>Approval Recorded Successfully!</span>
              </div>
            )}
          </div>

          {/* Deliverables List */}
          <Card className="bg-[#151A21] border-[#29313B]">
            <CardHeader className="border-b border-[#1E2530] pb-4">
              <CardTitle className="text-[#F3F5F7]">Published Deliverable Assets</CardTitle>
              <CardDescription className="text-[#7E8997]">
                Live builds, compiled binaries, release packages, and test reports.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {project.documents.filter((d) => d.category === "CLIENT_DELIVERABLE").length === 0 ? (
                <EmptyState
                  icon={FolderCheck}
                  title="No Deliverables Published Yet"
                  description="When sprint releases or build archives are deployed by the engineering team, you will find direct downloads here."
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {project.documents
                    .filter((d) => d.category === "CLIENT_DELIVERABLE")
                    .map((del) => (
                      <div
                        key={del.id}
                        className="bg-[#101318] border border-[#29313B] rounded-xl p-4 flex items-start justify-between gap-3 hover:border-[#364152] transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                            <h4 className="text-xs font-bold text-[#F3F5F7] line-clamp-1">{del.title}</h4>
                          </div>
                          {del.description && (
                            <p className="text-[11px] text-[#7E8997] line-clamp-2">{del.description}</p>
                          )}
                          <span className="text-[10px] text-[#566171] block">
                            Published: {new Date(del.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <Link
                          href={`/api/v1/client/projects/${project.id}/documents/${del.id}/download`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="outline" size="sm">
                            <Download className="w-3.5 h-3.5 mr-1" />
                            <span>Download</span>
                          </Button>
                        </Link>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 3: Shared Documents */}
      {activeTab === "documents" && (
        <Card className="bg-[#151A21] border-[#29313B]">
          <CardHeader className="border-b border-[#1E2530] pb-4">
            <CardTitle className="text-[#F3F5F7]">Project Document Vault</CardTitle>
            <CardDescription className="text-[#7E8997]">
              Specifications, signed contracts, architectural briefs, and meeting notes.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {project.documents.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  icon={FileText}
                  title="No Documents Uploaded Yet"
                  description="All official technical specifications and contracts will appear here."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#A7B0BC]">
                  <thead className="bg-[#101318]/80 text-[#7E8997] text-[11px] uppercase font-bold tracking-wider border-b border-[#29313B]">
                    <tr>
                      <th className="px-6 py-3.5">Document Title</th>
                      <th className="px-6 py-3.5">Classification</th>
                      <th className="px-6 py-3.5">Date Shared</th>
                      <th className="px-6 py-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E2530]">
                    {project.documents.map((doc) => (
                      <tr key={doc.id} className="hover:bg-[#202833] transition-colors">
                        <td className="px-6 py-4 font-semibold text-[#F3F5F7]">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>{doc.title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#1B222B] text-[#A7B0BC] border border-[#29313B]">
                            {doc.category.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[#7E8997]">
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/api/v1/client/projects/${project.id}/documents/${doc.id}/download`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" size="sm">
                              <Download className="w-3.5 h-3.5 mr-1" />
                              <span>Download</span>
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab 4: Inquiry & Support */}
      {activeTab === "support" && (
        <Card className="bg-[#151A21] border-[#29313B]">
          <CardHeader className="border-b border-[#1E2530] pb-4">
            <CardTitle className="text-[#F3F5F7]">Direct Project Inquiry & Support</CardTitle>
            <CardDescription className="text-[#7E8997]">
              Submit requests or clarify technical requirements directly with the lead engineers assigned to {project.projectCode}.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {supportSuccess ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center space-y-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="text-base font-bold text-[#F3F5F7]">Inquiry Dispatched Successfully</h4>
                <p className="text-xs text-[#7E8997] max-w-md mx-auto">
                  Your inquiry has been assigned to the lead engineers and technical management. We will notify you when a response is ready.
                </p>
                <Button variant="outline" size="sm" onClick={() => setSupportSuccess(false)}>
                  Submit Another Inquiry
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSupportSubmit} className="space-y-4 max-w-xl">
                <div>
                  <label className="block text-xs font-semibold text-[#A7B0BC] mb-1">
                    Inquiry Subject
                  </label>
                  <Input
                    placeholder="e.g. Clarification on Sprint 2 Milestone"
                    value={supportSubject}
                    onChange={(e) => setSupportSubject(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A7B0BC] mb-1">
                    Priority Level
                  </label>
                  <select
                    value={supportPriority}
                    onChange={(e) => setSupportPriority(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-[#29313B] bg-[#10151B] text-xs font-medium text-[#F3F5F7] focus:outline-none focus:border-emerald-500"
                  >
                    <option value="LOW">Low (Routine observation)</option>
                    <option value="MEDIUM">Medium (General question / clarification)</option>
                    <option value="HIGH">High (Urgent milestone feedback)</option>
                    <option value="CRITICAL">Critical (Blocker)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A7B0BC] mb-1">
                    Detailed Message
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Describe your inquiry, observations, or feedback in detail..."
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    required
                    className="w-full p-3 rounded-lg border border-[#29313B] bg-[#10151B] text-xs text-[#F3F5F7] focus:outline-none focus:border-emerald-500 placeholder:text-[#566171]"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={submittingSupport}
                  className="w-full sm:w-auto"
                >
                  {submittingSupport ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                  <span>{submittingSupport ? "Sending Inquiry..." : "Dispatch to Team"}</span>
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
