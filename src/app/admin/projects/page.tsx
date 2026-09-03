"use client";

import { useEffect, useState } from "react";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/admin/projects")
      .then(r => r.json())
      .then(d => { setProjects(d.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white tracking-tight">Projects</h1>
      
      <div className="bg-[#111111] border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-[#1a1a1a] text-gray-300 text-xs uppercase font-semibold border-b border-white/10">
            <tr>
              <th className="px-4 py-3">Project Name</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={2} className="p-4 text-center">Loading...</td></tr>
            ) : projects.length === 0 ? (
              <tr><td colSpan={2} className="p-4 text-center">No projects found.</td></tr>
            ) : (
              projects.map(p => (
                <tr key={p.id} className="border-b border-white/5">
                  <td className="px-4 py-3 text-white font-medium">{p.name}</td>
                  <td className="px-4 py-3">{p.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
