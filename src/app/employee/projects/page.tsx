"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  Calendar,
  CheckSquare,
  Search,
  Users,
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
      className="space-y-6 max-w-7xl pb-12"
    >
      {/* Header */}
      <PageHeader
        title="Assigned Projects"
        subtitle="Active engineering projects, sprint milestones, and team workload assignments."
        action={
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#8A867E] absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-8 pr-3 bg-[#1A1A1B] border border-[#2E2E30] rounded-lg text-xs text-[#EDEBE6] placeholder:text-[#7C786F] focus:outline-hidden focus:border-[#4F9D83] focus:ring-1 focus:ring-[#4F9D83]"
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
        <div className="p-12 text-center bg-[#1A1A1B] border border-[#2E2E30] rounded-xl space-y-4">
          <div className="w-14 h-14 mx-auto rounded-xl bg-[#232324] flex items-center justify-center border border-[#2E2E30]">
            <Briefcase className="w-7 h-7 text-[#4F9D83]" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#EDEBE6]">No projects found</h3>
            <p className="text-xs text-[#8A867E] max-w-sm mx-auto mt-1">
              {searchQuery
                ? "No projects match your search query."
                : "No projects are currently assigned to your profile."}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredProjects.map((p) => (
            <div
              key={p.id}
              className="p-6 bg-[#1A1A1B] border border-[#2E2E30] rounded-xl space-y-4 hover:border-[#3A3A3D] transition-colors flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#232324] border border-[#2E2E30] flex items-center justify-center text-[#4F9D83] shrink-0">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-[#EDEBE6]">{p.name}</h2>
                      <span className="text-xs text-[#8A867E] flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3 h-3 text-[#8A867E]" />
                        {p.startDate ? new Date(p.startDate).toLocaleDateString() : "Active Sprint"}
                      </span>
                    </div>
                  </div>

                  <StatusBadge variant={getStatusVariant(p.status)}>
                    {p.status}
                  </StatusBadge>
                </div>

                <p className="text-xs text-[#8A867E] leading-relaxed line-clamp-3">
                  {p.description || "Production engineering project for Axivon client deliverables."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#2E2E30] text-xs text-[#8A867E]">
                <div className="flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-[#4F9D83]" />
                  <span className="text-[#EDEBE6] font-medium">{p._count?.tasks || 0}</span>
                  <span>Tasks</span>
                </div>
                <div className="flex items-center gap-1.5 justify-end">
                  <Users className="w-4 h-4 text-[#8E9AAF]" />
                  <span className="text-[#EDEBE6] font-medium">{p._count?.members || 1}</span>
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
