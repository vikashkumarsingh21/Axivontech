"use client";

import { useEffect, useState } from "react";
import { FileSpreadsheet, Download } from "lucide-react";

export default function ExecutiveReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/executive/reports")
      .then((r) => r.json())
      .then((d) => {
        setData(d.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleExport = async (reportType: string) => {
    await fetch("/api/v1/executive/reports/" + reportType + "/export", { method: "POST" });
    alert("Report export audit logged!");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white tracking-tight">Executive Analytics & Reports</h1>
      <p className="text-gray-400 text-sm">Audited executive report datasets.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {["Headcount & Workforce", "Project Delivery Matrix", "Attendance & Work Hours"].map((r) => (
          <div key={r} className="bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-white text-lg">{r}</h3>
            <p className="text-sm text-gray-400">Export audited executive operational dataset.</p>
            <button onClick={() => handleExport(r.toLowerCase().replace(/\s+/g, "_"))}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold transition-colors">
              <Download className="w-4 h-4" /> Export Report
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
