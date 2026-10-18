"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FolderCheck,
  CheckCircle2,
  Clock,
  Download,
  AlertCircle,
  Briefcase,
  ChevronRight,
  ShieldCheck,
  CheckCircle,
  Loader2,
  FileText,
  ExternalLink,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

interface DeliverableDoc {
  id: string;
  title: string;
  description?: string | null;
  fileUrl: string;
  mimeType?: string | null;
  sizeBytes?: number | null;
  createdAt: string;
}

interface ProjectUat {
  id: string;
  projectCode: string;
  projectName: string;
  status: string;
  qaStatus?: string | null;
  progressPercentage: number;
  expectedDeliveryDate?: string | null;
  deliveredAt?: string | null;
  documents: DeliverableDoc[];
}

export default function ClientUatPage() {
  const [projects, setProjects] = useState<ProjectUat[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const fetchUatData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/client/uat");
      if (res.ok) {
        const json = await res.json();
        setProjects(json.data || []);
      }
    } catch (err) {
      console.error("Error loading UAT deliverables:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUatData();
  }, []);

  const handleApprove = async (projectId: string) => {
    try {
      setApprovingId(projectId);
      const res = await fetch(`/api/v1/client/projects/${projectId}/uat`, {
        method: "POST",
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Approval failed");
      }
      fetchUatData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setApprovingId(null);
    }
  };

  const pendingApprovals = projects.filter((p) => p.qaStatus === "UAT_READY");
  const approvedProjects = projects.filter((p) => p.qaStatus === "UAT_APPROVED");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F3F5F7] tracking-tight">
            Deliverables & UAT Review Center
          </h1>
          <p className="text-sm text-[#7E8997] mt-0.5">
            Inspect compiled builds, test release packages, and authorize formal acceptance sign-offs.
          </p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-[#151A21] border-[#29313B]">
          <CardContent className="p-5">
            <span className="text-xs font-bold text-[#566171] uppercase tracking-wider">
              Ready for Review
            </span>
            <p className="text-2xl font-extrabold text-amber-400 mt-2">
              {loading ? "—" : pendingApprovals.length}
            </p>
            <p className="text-xs text-[#7E8997] mt-1">Requires client acceptance</p>
          </CardContent>
        </Card>

        <Card className="bg-[#151A21] border-[#29313B]">
          <CardContent className="p-5">
            <span className="text-xs font-bold text-[#566171] uppercase tracking-wider">
              UAT Approved
            </span>
            <p className="text-2xl font-extrabold text-emerald-400 mt-2">
              {loading ? "—" : approvedProjects.length}
            </p>
            <p className="text-xs text-[#7E8997] mt-1">Accepted deliverables</p>
          </CardContent>
        </Card>

        <Card className="bg-[#151A21] border-[#29313B]">
          <CardContent className="p-5">
            <span className="text-xs font-bold text-[#566171] uppercase tracking-wider">
              Total Engagements
            </span>
            <p className="text-2xl font-extrabold text-[#F3F5F7] mt-2">
              {loading ? "—" : projects.length}
            </p>
            <p className="text-xs text-[#7E8997] mt-1">Active client contracts</p>
          </CardContent>
        </Card>
      </div>

      {/* Projects Deliverables List */}
      {loading ? (
        <div className="p-16 text-center text-sm text-[#7E8997]">
          Loading client deliverables...
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderCheck}
          title="No Deliverables Available Yet"
          description="Deliverables ready for your inspection or user acceptance testing will appear here once published by engineering."
        />
      ) : (
        <div className="space-y-6">
          {projects.map((proj) => {
            const isReadyForUat = proj.qaStatus === "UAT_READY";
            const isApproved = proj.qaStatus === "UAT_APPROVED";

            return (
              <Card key={proj.id} className="bg-[#151A21] border-[#29313B]">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E2530] pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-emerald-400">
                        {proj.projectCode}
                      </span>
                      <span className="text-[#29313B]">•</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          isApproved
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : isReadyForUat
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-[#1B222B] text-[#7E8997] border-[#29313B]"
                        }`}
                      >
                        {proj.qaStatus?.replace("_", " ") || "INTERNAL QA"}
                      </span>
                    </div>
                    <CardTitle className="text-base font-bold text-[#F3F5F7]">
                      {proj.projectName}
                    </CardTitle>
                  </div>

                  <div className="flex items-center gap-3">
                    {isReadyForUat && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleApprove(proj.id)}
                        disabled={approvingId === proj.id}
                      >
                        {approvingId === proj.id ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-1.5" />
                        )}
                        <span>{approvingId === proj.id ? "Saving..." : "Accept & Approve"}</span>
                      </Button>
                    )}
                    <Link href={`/client/projects/${proj.id}`}>
                      <Button variant="outline" size="sm">
                        <span>Workspace</span>
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-4">
                  {proj.documents.length === 0 ? (
                    <p className="text-xs text-[#7E8997] italic">
                      No standalone downloadable release packages published for this sprint yet.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {proj.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="bg-[#101318] border border-[#29313B] rounded-xl p-3.5 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-[#F3F5F7] truncate">{doc.title}</h4>
                              <p className="text-[10px] text-[#566171]">
                                Shared: {new Date(doc.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <Link
                            href={`/api/v1/client/projects/${proj.id}/documents/${doc.id}/download`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="secondary" size="sm">
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
            );
          })}
        </div>
      )}
    </div>
  );
}
