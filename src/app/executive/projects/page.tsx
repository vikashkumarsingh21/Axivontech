"use client";

import { useEffect, useState } from "react";
import { Briefcase } from "lucide-react";

export default function ExecutiveProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/executive/projects")
      .then((r) => r.json())
      .then((d) => {
        setProjects(d.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white tracking-tight">Project Portfolio Oversight</h1>
      <p className="text-gray-400 text-sm">Strategic health calculation & delivery monitoring.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="text-gray-500 col-span-full">Loading project portfolio...</div>
        ) : projects.length === 0 ? (
          <div className="text-gray-500 col-span-full">No active projects found.</div>
        ) : (
          projects.map((p) => (
            <div key={p.id} className="bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-white text-lg">{p.name}</h3>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${p.health === "Healthy" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                  {p.health}
                </span>
              </div>
              <p className="text-gray-400 text-sm line-clamp-2">{p.description || "No description provided."}</p>
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Task Completion</span>
                  <span>{p.taskProgress}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <div className="bg-amber-400 h-2 rounded-full" style={{ width: `${p.taskProgress}%` }} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
