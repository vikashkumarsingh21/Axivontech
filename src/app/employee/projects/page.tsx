"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  Calendar,
  CheckSquare,
  Search,
  Users,
  FolderGit2,
} from "lucide-react";
import { PageHeader } from "@/components/employee/PageHeader";
import { SkeletonCard } from "@/components/employee/SkeletonCard";
import { StatusBadge } from "@/components/employee/StatusBadge";

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

  const getStatusVariant = (status: string): "info" | "success" | "warning" | "neutral" => {
    switch (status) {
      case "ACTIVE":
        return "info";
      case "COMPLETED":
        return "success";
      case "ON_HOLD":
        return "warning";
      default:
        return "neutral";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6 max-w-7xl"
    >
      {/* Header */}
      <PageHeader
        title="Assigned Projects"
        subtitle="Active engineering projects, sprint milestones, and team workload assignments."
        action={
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#566171] absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-8 pr-3 bg-[#111317] border border-[#1E2530] rounded-xl text-xs text-[#E6E8EB] placeholder:text-[#566171] focus:outline-hidden focus:border-[#5FA8A0]"
            />
          </div>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} className="h-48" />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="p-12 text-center bg-[#111317] border border-[#1E2530] rounded-xl space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#171A1F] flex items-center justify-center border border-[#22262D]">
            <svg
              className="w-8 h-8 text-[#5FA8A0]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#E6E8EB]">No projects found</h3>
            <p className="text-xs text-[#566171] max-w-sm mx-auto mt-1">
              {searchQuery
                ? "No projects match your search query."
                : "No projects are currently assigned to your team profile."}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredProjects.map((p) => (
            <div
              key={p.id}
              className="p-6 bg-[#111317] border border-[#1E2530] rounded-xl space-y-4 hover:border-[#22262D] transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--ep-accent-soft)] border border-[var(--ep-accent-border)] flex items-center justify-center text-[#5FA8A0] shrink-0">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-[#E6E8EB]">{p.name}</h2>
                      <span className="text-xs text-[#566171] flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3 h-3 text-[#D6B779]" />
                        {p.startDate ? new Date(p.startDate).toLocaleDateString() : "Active Sprint"}
                      </span>
                    </div>
                  </div>

                  <StatusBadge variant={getStatusVariant(p.status)}>
                    {p.status}
                  </StatusBadge>
                </div>

                <p className="text-xs text-[#8B94A1] leading-relaxed line-clamp-3">
                  {p.description || "Production engineering project for Axivon client deliverables."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#1E2530] text-xs text-[#566171]">
                <div className="flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-[#5FA8A0]" />
                  <span className="text-[#E6E8EB] font-medium">{p._count?.tasks || 0}</span>
                  <span>Tasks</span>
                </div>
                <div className="flex items-center gap-1.5 justify-end">
                  <Users className="w-4 h-4 text-[#67C5D8]" />
                  <span className="text-[#E6E8EB] font-medium">{p._count?.members || 1}</span>
                  <span>Members</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
