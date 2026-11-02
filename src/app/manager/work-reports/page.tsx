"use client";

import { useEffect, useState, useMemo } from "react";
import {
  FileText,
  Search,
  Calendar,
  Clock,
  User,
  AlertCircle,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  ArrowRight,
} from "lucide-react";

interface WorkReportItem {
  id: string;
  userId: string;
  date: string;
  tasksCompleted: string;
  blockers: string | null;
  nextDayPlan: string | null;
  hoursWorked: number | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    designation: string | null;
  };
}

export default function ManagerWorkReportsPage() {
  const [reports, setReports] = useState<WorkReportItem[]>([]);
  const [departmentName, setDepartmentName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/v1/manager/work-reports")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load department work reports.");
        return res.json();
      })
      .then((json) => {
        if (json.success) {
          setReports(json.reports || []);
          setDepartmentName(json.department || "");
        } else {
          setError(json.message || "Failed to retrieve reports.");
        }
      })
      .catch((err) => setError(err.message || "Network error loading work reports."))
      .finally(() => setLoading(false));
  }, []);

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const q = search.toLowerCase();
      return (
        search.trim() === "" ||
        r.user.name.toLowerCase().includes(q) ||
        r.user.email.toLowerCase().includes(q) ||
        r.tasksCompleted.toLowerCase().includes(q) ||
        (r.blockers && r.blockers.toLowerCase().includes(q)) ||
        (r.nextDayPlan && r.nextDayPlan.toLowerCase().includes(q))
      );
    });
  }, [reports, search]);

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center space-y-3 shadow-xs">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
        <h3 className="text-sm font-bold text-slate-900">Loading Work Reports...</h3>
        <p className="text-xs text-slate-500">Retrieving operational submissions from your team members.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md bg-indigo-600 text-white font-mono font-bold text-xs">
              {departmentName ? departmentName.slice(0, 4).toUpperCase() : "DEPT"}
            </span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Department Accountability
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Work Reports</h1>
          <p className="text-xs text-slate-600 mt-1">
            Review daily activity logs, progress updates, and impediments reported by {departmentName} personnel.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2">
          <FileText className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-bold text-slate-800">
            {reports.length} Total Submission{reports.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      {/* Security Scope Notice */}
      <div className="p-4 rounded-xl bg-slate-100/80 border border-slate-200 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 leading-relaxed">
          <strong className="text-slate-800">Department Scope Enforcement:</strong> Only work reports logged by team members in <span className="font-semibold text-indigo-700">{departmentName}</span> are shown. External department progress reports remain private.
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by team member, tasks, or blockers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing {filteredReports.length} of {reports.length} reports
        </div>
      </div>

      {/* Reports Feed */}
      {error ? (
        <div className="bg-white border border-red-200 rounded-2xl p-10 text-center space-y-3 shadow-xs">
          <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">Error Loading Reports</h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto">{error}</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-2">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No Work Reports Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {search
              ? "No reports match your search query."
              : `No daily work reports have been filed by ${departmentName} personnel yet.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs hover:border-indigo-200 transition-all space-y-4"
            >
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                    {report.user.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {report.user.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {report.user.designation || "Department Specialist"} &bull; {report.user.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Report Date: {new Date(report.date).toLocaleDateString()}</span>
                  </span>

                  {report.hoursWorked !== null && report.hoursWorked !== undefined && (
                    <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-lg border border-emerald-200 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{report.hoursWorked} hrs logged</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Work Report Content */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Tasks Completed */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 md:col-span-2">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Tasks & Completed Activities:</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-line pl-5">
                    {report.tasksCompleted}
                  </p>
                </div>

                {/* Tomorrow's Plan */}
                <div className="p-4 rounded-xl bg-indigo-50/40 border border-indigo-100 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-indigo-950">
                    <ArrowRight className="w-4 h-4 text-indigo-600" />
                    <span>Next Working Day Plan:</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-line pl-5">
                    {report.nextDayPlan || "No specific priorities outlined."}
                  </p>
                </div>
              </div>

              {/* Blockers / Impediments if any */}
              {report.blockers && (
                <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-900 block font-semibold mb-0.5">
                      Reported Blocker / Impediment:
                    </strong>
                    <p className="text-amber-800 leading-relaxed">{report.blockers}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

