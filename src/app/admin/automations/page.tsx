"use client";

import { useEffect, useState } from "react";

export default function AdminAutomationsPage() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/automations")
      .then((r) => r.json())
      .then((d) => {
        setWorkflows(d.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 text-white">
      <h1 className="text-2xl font-bold tracking-tight">Automation Workflows</h1>
      <p className="text-gray-400 text-sm">Controlled trigger-condition-action workflow engine.</p>

      <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-[#18181b] text-gray-300 text-xs uppercase font-semibold">
            <tr>
              <th className="px-5 py-3.5">Workflow Name</th>
              <th className="px-5 py-3.5">Trigger</th>
              <th className="px-5 py-3.5">Created By</th>
              <th className="px-5 py-3.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td colSpan={4} className="p-6 text-center">Loading automations...</td></tr>
            ) : workflows.length === 0 ? (
              <tr><td colSpan={4} className="p-6 text-center">No active workflows configured.</td></tr>
            ) : (
              workflows.map((w) => (
                <tr key={w.id} className="hover:bg-white/[0.02]">
                  <td className="px-5 py-4 font-medium text-white">{w.name}</td>
                  <td className="px-5 py-4 font-mono text-xs text-amber-400">{w.triggerType}</td>
                  <td className="px-5 py-4">{w.createdBy?.name || "System"}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs ${w.isActive ? "bg-green-500/10 text-green-400" : "bg-gray-500/10 text-gray-400"}`}>
                      {w.isActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
