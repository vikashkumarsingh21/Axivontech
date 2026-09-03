"use client";

import { useEffect, useState } from "react";

export default function AdminWorkReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/admin/work-reports")
      .then(r => r.json())
      .then(d => { setReports(d.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white tracking-tight">Work Reports</h1>
      <p className="text-gray-400">Review employee daily work reports.</p>

      <div className="bg-[#111111] border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-[#1a1a1a] text-gray-300 text-xs uppercase font-semibold border-b border-white/10">
            <tr>
              <th className="px-4 py-3">Employee</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Summary</th>
              <th className="px-4 py-3">Hours</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-4 text-center">Loading...</td></tr>
            ) : reports.length === 0 ? (
              <tr><td colSpan={5} className="p-4 text-center">No work reports found.</td></tr>
            ) : (
              reports.map(r => (
                <tr key={r.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3 text-white font-medium">{r.user?.name || "-"}</td>
                  <td className="px-4 py-3">{new Date(r.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3 max-w-xs truncate">{r.summary}</td>
                  <td className="px-4 py-3">{r.hoursWorked ?? "-"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${r.status === "REVIEWED" ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"}`}>
                      {r.status}
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
