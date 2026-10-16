"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Briefcase, 
  Search, 
  Filter, 
  Clock, 
  ChevronRight, 
  Calendar,
  Layers,
  ArrowUpRight
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
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

export default function ClientProjectsPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

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

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      !search ||
      p.projectName.toLowerCase().includes(search.toLowerCase()) ||
      p.projectCode.toLowerCase().includes(search.toLowerCase()) ||
      (p.requiredService && p.requiredService.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F3F5F7] tracking-tight">
            Engineering Projects Directory
          </h1>
          <p className="text-sm text-[#7E8997] mt-0.5">
            Overview of all software development contracts and live delivery streams.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search by code, title, or service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 rounded-lg border border-[#29313B] bg-[#151A21] text-xs font-medium text-[#A7B0BC] focus:outline-none focus:border-emerald-500 shadow-2xs"
        >
          <option value="ALL">All Statuses</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="UNDER_REVIEW">Under Review / UAT</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {/* Projects Grid / List */}
      {loading ? (
        <div className="p-16 text-center text-sm text-[#7E8997]">
          Loading client engagements...
        </div>
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No Matching Projects"
          description={search ? "Try adjusting your search criteria." : "You do not have any registered client projects yet."}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="bg-[#151A21] border-[#29313B] hover:border-[#364152] transition-all hover:shadow-sm">
              <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-bold text-emerald-400">
                      {project.projectCode}
                    </span>
                    <Badge variant={getStatusBadgeVariant(project.status)}>
                      {project.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <h3 className="text-base font-bold text-[#F3F5F7] tracking-tight line-clamp-1">
                    {project.projectName}
                  </h3>
                  <p className="text-xs text-[#7E8997] mt-1 line-clamp-1">
                    {project.requiredService || "Custom Software Engineering"}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5 pt-2 border-t border-[#1E2530]">
                  <div className="flex justify-between text-xs text-[#7E8997]">
                    <span>Sprint Completion</span>
                    <span className="font-mono font-bold text-[#A7B0BC]">{project.progressPercentage || 0}%</span>
                  </div>
                  <div className="h-2 w-full bg-[#1B222B] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(project.progressPercentage || 0, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-[#566171] pt-2 border-t border-[#1E2530]">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#566171]" />
                    <span>
                      {project.expectedDeliveryDate
                        ? new Date(project.expectedDeliveryDate).toLocaleDateString()
                        : "Ongoing"}
                    </span>
                  </div>
                  <Link
                    href={`/client/projects/${project.id}`}
                    className="inline-flex items-center gap-1 font-semibold text-emerald-400 hover:text-emerald-300"
                  >
                    <span>View Workspace</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
