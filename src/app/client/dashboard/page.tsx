"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Briefcase, 
  FolderCheck, 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  TrendingUp,
  Download,
  Calendar,
  Layers,
  Sparkles
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

interface ProjectItem {
  id: string;
  projectCode: string;
  projectName: string;
  status: string;
  progressPercentage: number;
  expectedDeliveryDate?: string | null;
  requiredService?: string | null;
  companyName?: string | null;
  createdAt: string;
}

export default function ClientDashboardPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/client/projects")
      .then((res) => res.json())
      .then((json) => {
        if (json?.data) {
          setProjects(json.data);
        }
      })
      .catch((err) => console.error("Error loading client projects:", err))
      .finally(() => setLoading(false));
  }, []);

  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status === "IN_PROGRESS" || p.status === "ACTIVE").length;
  const completedProjects = projects.filter((p) => p.status === "COMPLETED" || p.status === "DELIVERED").length;
  const inReviewProjects = projects.filter((p) => p.status === "UNDER_REVIEW" || p.status === "UAT").length;

  const getStatusBadgeVariant = (status: string): "neutral" | "brand" | "success" | "warning" | "danger" | "info" => {
    switch (status) {
      case "COMPLETED":
      case "DELIVERED":
        return "success";
      case "IN_PROGRESS":
      case "ACTIVE":
        return "brand";
      case "UNDER_REVIEW":
      case "UAT":
        return "warning";
      default:
        return "neutral";
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#151A21] border border-[#29313B] rounded-2xl p-6 sm:p-8 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Dedicated Client Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F3F5F7] tracking-tight">
            Client Project Command
          </h1>
          <p className="text-sm text-[#7E8997] mt-1 max-w-xl">
            Track active engineering engagements, inspect milestone deliverables, approve UAT releases, and review project documentation.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link href="/client/projects" className="w-full sm:w-auto">
            <Button variant="primary" className="w-full sm:w-auto">
              <Briefcase className="w-4 h-4 mr-2" />
              <span>View All Projects</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Engagements */}
        <Card className="bg-[#151A21] border-[#29313B]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#566171] uppercase tracking-wider">
                Total Projects
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#1B222B] border border-[#29313B] flex items-center justify-center text-[#A7B0BC]">
                <Briefcase className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-[#F3F5F7] tracking-tight">
              {loading ? "—" : totalProjects}
            </p>
            <p className="text-xs text-[#7E8997] mt-2 font-medium">
              Contracted software deliveries
            </p>
          </CardContent>
        </Card>

        {/* Active In Progress */}
        <Card className="bg-[#151A21] border-[#29313B]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#566171] uppercase tracking-wider">
                Active Sprints
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-[#F3F5F7] tracking-tight">
              {loading ? "—" : activeProjects}
            </p>
            <p className="text-xs text-[#7E8997] mt-2 font-medium">
              Engineering in active development
            </p>
          </CardContent>
        </Card>

        {/* In Review / UAT */}
        <Card className="bg-[#151A21] border-[#29313B]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#566171] uppercase tracking-wider">
                Awaiting UAT
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <FolderCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-[#F3F5F7] tracking-tight">
              {loading ? "—" : inReviewProjects}
            </p>
            <p className="text-xs text-[#7E8997] mt-2 font-medium">
              Deliverables ready for your approval
            </p>
          </CardContent>
        </Card>

        {/* Completed */}
        <Card className="bg-[#151A21] border-[#29313B]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#566171] uppercase tracking-wider">
                Delivered
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-[#F3F5F7] tracking-tight">
              {loading ? "—" : completedProjects}
            </p>
            <p className="text-xs text-[#7E8997] mt-2 font-medium">
              Successfully delivered systems
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Projects Showcase Table */}
      <Card className="bg-[#151A21] border-[#29313B]">
        <CardHeader className="flex flex-row items-center justify-between border-b border-[#1E2530] pb-4">
          <div>
            <CardTitle className="text-[#F3F5F7]">Engagements & Deliverables</CardTitle>
            <CardDescription className="text-[#7E8997]">
              Status tracking, sprint completion percentages, and milestone delivery dates.
            </CardDescription>
          </div>
          <Link href="/client/projects" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
            <span>All Projects</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-sm text-[#7E8997]">
              Loading project deliverables...
            </div>
          ) : projects.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={Briefcase}
                title="No Active Projects Yet"
                description="Once an engineering agreement is finalized with Axivon Technologies, your project milestones and live code deliverables will appear here."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#A7B0BC]">
                <thead className="bg-[#101318]/80 text-[#7E8997] text-[11px] uppercase font-bold tracking-wider border-b border-[#29313B]">
                  <tr>
                    <th className="px-6 py-3.5">Code</th>
                    <th className="px-6 py-3.5">Project Name</th>
                    <th className="px-6 py-3.5">Service Stream</th>
                    <th className="px-6 py-3.5">Progress</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Est. Delivery</th>
                    <th className="px-6 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2530]">
                  {projects.map((project) => (
                    <tr key={project.id} className="hover:bg-[#202833] transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-emerald-400 whitespace-nowrap">
                        {project.projectCode}
                      </td>
                      <td className="px-6 py-4 font-semibold text-[#F3F5F7]">
                        {project.projectName}
                        {project.companyName && (
                          <span className="block text-[11px] text-[#566171] font-normal">
                            {project.companyName}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-[#A7B0BC] whitespace-nowrap">
                        {project.requiredService || "Custom Development"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap w-44">
                        <div className="flex items-center gap-2.5">
                          <div className="flex-1 h-2 bg-[#1B222B] rounded-full overflow-hidden border border-[#29313B]">
                            <div
                              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(project.progressPercentage || 0, 100)}%` }}
                            />
                          </div>
                          <span className="font-mono text-xs font-bold text-[#A7B0BC] w-8 text-right">
                            {project.progressPercentage || 0}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getStatusBadgeVariant(project.status)}>
                          {project.status.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-[#7E8997] whitespace-nowrap">
                        {project.expectedDeliveryDate
                          ? new Date(project.expectedDeliveryDate).toLocaleDateString()
                          : "Scheduled"}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <Link href={`/client/projects/${project.id}`}>
                          <Button variant="outline" size="sm">
                            Inspect
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
    </div>
  );
}
