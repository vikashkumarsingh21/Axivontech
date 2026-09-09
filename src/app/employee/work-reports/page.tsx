"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FileText, Loader2, Send } from "lucide-react";

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [summary, setSummary] = useState("");
  const [work, setWork] = useState("");

  const loadData = () => {
    setLoading(true);
    fetch("/api/v1/employee/work-reports")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setReports(data.reports);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch("/api/v1/employee/work-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: new Date().toISOString(),
          summary,
          workPerformed: work,
          hoursWorked: 8,
        }),
      });
      setSummary("");
      setWork("");
      loadData();
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-gray-400 gap-3">
        <Loader2 className="animate-spin w-5 h-5 text-indigo-400" />
        <span>Loading reports...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Work Reports</h1>
        <p className="text-sm text-gray-400 mt-1">Submit your daily work summary and view submission logs</p>
      </div>

      <Card className="p-4 sm:p-6 bg-[#0a0a0c] border border-gray-800 rounded-xl space-y-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-400" />
          <span>Submit Daily Report</span>
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Summary of Work <span className="text-red-400">*</span>
            </label>
            <Input
              placeholder="e.g. Completed CRM responsiveness & bug fixes"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Detailed Work Performed <span className="text-red-400">*</span>
            </label>
            <textarea
              className="w-full bg-[#111111] border border-gray-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-indigo-500 min-h-[90px]"
              placeholder="Describe tasks completed, code merged, or issues investigated..."
              value={work}
              onChange={(e) => setWork(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={submitting} className="flex items-center gap-2 w-full sm:w-auto">
              {submitting ? <Loader2 className="animate-spin w-4 h-4" /> : <Send className="w-4 h-4" />}
              <span>{submitting ? "Submitting..." : "Submit Report"}</span>
            </Button>
          </div>
        </form>
      </Card>

      <Card className="p-4 sm:p-6 bg-[#0a0a0c] border border-gray-800 rounded-xl space-y-4">
        <h2 className="text-lg font-semibold text-white">Past Submission History</h2>
        {reports.length === 0 ? (
          <div className="text-gray-500 text-sm py-4 text-center">No past reports found.</div>
        ) : (
          <div className="space-y-3">
            {reports.map((r: any) => (
              <div
                key={r.id}
                className="p-4 border border-gray-800 rounded-lg bg-[#111111] space-y-1.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="text-white font-medium text-sm">{r.summary}</div>
                  <span className="text-xs text-gray-400">
                    {new Date(r.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <p className="text-xs text-gray-400">{r.workPerformed}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
