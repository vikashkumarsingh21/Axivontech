"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState("");
  const [work, setWork] = useState("");

  const loadData = () => {
    setLoading(true);
    fetch("/api/v1/employee/work-reports").then(res => res.json()).then(data => {
      if(data.success) setReports(data.reports);
      setLoading(false);
    });
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    await fetch("/api/v1/employee/work-reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: new Date().toISOString(), summary, workPerformed: work, hoursWorked: 8 })
    });
    setSummary(""); setWork("");
    loadData();
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Loading reports...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Work Reports</h1>
      
      <Card className="p-6 bg-[#0a0a0a]">
        <h2 className="text-xl text-white mb-4">Submit Daily Report</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input placeholder="Summary of the day" value={summary} onChange={e => setSummary(e.target.value)} required />
          <Input placeholder="Detailed work performed" value={work} onChange={e => setWork(e.target.value)} required />
          <Button type="submit">Submit Report</Button>
        </form>
      </Card>

      <Card className="p-6 bg-[#0a0a0a]">
        <h2 className="text-xl text-white mb-4">Past Reports</h2>
        {reports.length === 0 ? <div className="text-gray-500">No reports found.</div> : (
          <div className="space-y-3">
            {reports.map((r: any) => (
              <div key={r.id} className="p-3 border border-white/5 rounded bg-[#111111]">
                <div className="text-white font-medium">{new Date(r.date).toLocaleDateString()} - {r.summary}</div>
                <div className="text-sm text-gray-400 mt-1">{r.workPerformed}</div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
