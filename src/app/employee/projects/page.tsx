"use client";

import { useEffect, useState, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import {
  Briefcase,
  Loader2,
  Calendar,
  CheckSquare,
  Search,
  Users,
  FolderGit2,
} from "lucide-react";

interface ProjectItem {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  startDate?: string | null;
  endDate?: string | null;
  _count?: {
    tasks: number;
    members: number;
  };
}

export default function EmployeeProjectsPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/api/v1/employee/projects")
      .then((res) => res.json())
      .then((data) => {
        setProjects(data.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredProjects = useMemo(() => {
    if (!searchQuery) return projects;
    const q = searchQuery.toLowerCase();
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
    );
  }, [projects, searchQuery]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "COMPLETED":
        return "bg-[#67C5D8]/10 text-[#67C5D8] border-[#67C5D8]/30";
      case "ON_HOLD":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/30";
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F3F5F7] tracking-tight">
            Assigned Projects
          </h1>
          <p className="text-sm text-[#A7B0BC] mt-1">
            Active engineering projects, sprint milestones, and team workload assignments.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#566171] absolute left-3 top-3 pointer-events-none" />
          <Input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 pl-8 bg-[#10151B] border-[#29313B] text-xs text-[#F3F5F7] placeholder:text-[#566171] focus-visible:border-emerald-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-16 text-[#7E8997] gap-3">
          <Loader2 className="animate-spin w-5 h-5 text-emerald-500" />
          <span>Loading project workload...</span>
        </div>
      ) : filteredProjects.length === 0 ? (
        <Card className="p-12 text-center bg-[#151A21] border-[#29313B] rounded-xl space-y-2">
          <FolderGit2 className="w-10 h-10 text-[#566171] mx-auto" />
          <h3 className="text-base font-semibold text-[#F3F5F7]">No projects found</h3>
          <p className="text-xs text-[#7E8997]">
            {searchQuery
              ? "No projects match your query."
              : "No projects are currently assigned to your team profile."}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredProjects.map((p) => (
            <Card
              key={p.id}
              className="p-6 bg-[#151A21] border-[#29313B] rounded-2xl space-y-4 hover:border-[#364152] transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-[#F3F5F7]">{p.name}</h2>
                      <span className="text-xs text-[#7E8997] flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3 h-3 text-[#D6B779]" />
                        {p.startDate ? new Date(p.startDate).toLocaleDateString() : "Active Sprint"}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadge(
                      p.status
                    )}`}
                  >
                    {p.status}
                  </span>
                </div>

                <p className="text-xs text-[#A7B0BC] leading-relaxed line-clamp-3">
                  {p.description || "Production engineering project for Axivon client deliverables."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#1E2530] text-xs text-[#7E8997]">
                <div className="flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                  <span className="text-[#F3F5F7] font-medium">{p._count?.tasks || 0}</span>
                  <span>Tasks</span>
                </div>
                <div className="flex items-center gap-1.5 justify-end">
                  <Users className="w-4 h-4 text-[#67C5D8]" />
                  <span className="text-[#F3F5F7] font-medium">{p._count?.members || 1}</span>
                  <span>Members</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
