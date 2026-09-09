"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Briefcase, Loader2, Calendar, CheckSquare } from "lucide-react";

export default function EmployeeProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/employee/projects")
      .then((res) => res.json())
      .then((data) => {
        setProjects(data.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statusColors: Record<string, string> = {
    ACTIVE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    COMPLETED: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    ON_HOLD: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Active Company Projects</h1>
        <p className="text-sm text-gray-400 mt-1">Overview of active projects, delivery timelines, and assigned workloads.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12 text-gray-400 gap-3">
          <Loader2 className="animate-spin w-5 h-5 text-indigo-400" />
          <span>Loading projects...</span>
        </div>
      ) : projects.length === 0 ? (
        <Card className="p-8 text-center text-gray-500 bg-[#0a0a0c] border border-gray-800">
          No projects running currently.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((p) => (
            <Card key={p.id} className="p-6 bg-[#0a0a0c] border border-gray-800 rounded-2xl space-y-4 hover:border-gray-700 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">{p.name}</h2>
                    <p className="text-xs text-gray-400 mt-0.5">{p.description || "No description provided."}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusColors[p.status] || "bg-gray-500/10 text-gray-400"}`}>
                  {p.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-800 text-xs text-gray-400">
                <div className="flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-indigo-400" />
                  <span>{p._count?.tasks || 0} Total Tasks</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span>{p.startDate ? new Date(p.startDate).toLocaleDateString() : "Ongoing"}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
