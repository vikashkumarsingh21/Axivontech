"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileSpreadsheet,
  Download,
  Calendar,
  Filter,
  Users,
  Briefcase,
  CheckSquare,
  Zap,
  UserCheck,
  ShieldAlert,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface ReportItem {
  id: string;
  title: string;
  category: "Sales" | "Delivery" | "Partners" | "Operations" | "System";
  description: string;
  reportType: string;
  icon: any;
  endpoint: string;
}

const REPORTS_CATALOGUE: ReportItem[] = [
  {
    id: "rep-leads",
    title: "Leads & Sales Intake Report",
    category: "Sales",
    description: "Export all inbound inquiries with client name, source, contact info, and qualification status.",
    reportType: "leads",
    icon: Users,
    endpoint: "/api/v1/analytics/export?reportType=leads",
  },
  {
    id: "rep-projects",
    title: "Client Projects Delivery Matrix",
    category: "Delivery",
    description: "Comprehensive status of client projects, budgets, final values, and active progress.",
    reportType: "projects",
    icon: Briefcase,
    endpoint: "/api/v1/analytics/export?reportType=projects",
  },
  {
    id: "rep-partners",
    title: "Business Partner Applications",
    category: "Partners",
    description: "Referral partner candidate submissions, verification status, and business domains.",
    reportType: "partners",
    icon: UserCheck,
    endpoint: "/api/v1/analytics/export?reportType=partners",
  },
  {
    id: "rep-tasks",
    title: "Workforce Tasks & Deadlines",
    category: "Operations",
    description: "Employee assigned tasks, progress status, priorities, and upcoming target dates.",
    reportType: "tasks",
    icon: CheckSquare,
    endpoint: "/api/v1/analytics/export?reportType=tasks",
  },
  {
    id: "rep-automations",
    title: "Platform Automation Audit Log",
    category: "System",
    description: "Step 8 event execution history, deduplication keys, outcomes, and failure forensic records.",
    reportType: "automations",
    icon: Zap,
    endpoint: "/api/v1/analytics/export?reportType=automations",
  },
];

export default function ReportsCentrePage() {
  const [selectedPreset, setSelectedPreset] = useState("last_30_days");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const filteredReports =
    selectedCategory === "ALL"
      ? REPORTS_CATALOGUE
      : REPORTS_CATALOGUE.filter((r) => r.category === selectedCategory);

  const handleDownload = (reportType: string) => {
    window.open(`/api/v1/analytics/export?reportType=${reportType}&preset=${selectedPreset}`, "_blank");
  };

  return (
    <div className="space-y-6 text-[#F3F5F7] min-h-[90vh]">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-[#29313B] pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <FileSpreadsheet className="w-6 h-6 text-[#10B981]" /> Reports Centre & Data Exports
            </h1>
          </div>
          <p className="text-[#A7B0BC] text-sm mt-1">
            Generate and download sanitized, audit-logged CSV reports across business operations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/analytics"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#151A21] hover:bg-[#1B222B] border border-[#29313B] text-xs font-semibold text-[#F3F5F7] transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#10B981]" />
            Back to BI Dashboard
          </Link>
        </div>
      </div>

      {/* Global Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#151A21] border border-[#29313B]">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-[#A7B0BC] font-semibold uppercase tracking-wider">Filter Category:</span>
          {["ALL", "Sales", "Delivery", "Partners", "Operations", "System"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                selectedCategory === cat
                  ? "bg-[#10B981] text-[#04130E]"
                  : "bg-[#1B222B] text-[#A7B0BC] hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#A7B0BC]" />
          <span className="text-xs text-[#A7B0BC]">Period:</span>
          <select
            value={selectedPreset}
            onChange={(e) => setSelectedPreset(e.target.value)}
            className="bg-[#1B222B] border border-[#29313B] text-xs text-[#F3F5F7] rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#10B981] cursor-pointer"
          >
            <option value="last_7_days">Last 7 Days</option>
            <option value="last_30_days">Last 30 Days</option>
            <option value="last_90_days">Last 90 Days</option>
            <option value="this_month">This Month</option>
            <option value="previous_month">Previous Month</option>
            <option value="this_year">This Year</option>
          </select>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredReports.map((report) => {
          const Icon = report.icon;
          return (
            <div
              key={report.id}
              className="bg-[#151A21] border border-[#29313B] hover:border-[#10B981]/40 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#1B222B] flex items-center justify-center border border-[#29313B]">
                    <Icon className="w-5 h-5 text-[#10B981]" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 text-[#A7B0BC] border border-white/10">
                    {report.category}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-white">{report.title}</h3>
                  <p className="text-xs text-[#A7B0BC] mt-1 leading-relaxed">{report.description}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-[#29313B]/60 flex items-center justify-between">
                <span className="text-[11px] text-[#A7B0BC]">Format: RFC 4180 CSV</span>
                <button
                  onClick={() => handleDownload(report.reportType)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1B222B] hover:bg-[#10B981] text-[#F3F5F7] hover:text-[#04130E] border border-[#29313B] hover:border-[#10B981] rounded-xl text-xs font-semibold transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Security & Audit Guidance Banner */}
      <div className="p-4 rounded-2xl bg-[#151A21] border border-[#29313B] flex items-start gap-3 text-xs text-[#A7B0BC]">
        <ShieldAlert className="w-5 h-5 text-[#D6B779] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-white">Compliance & Formula Injection Guard</p>
          <p>
            All generated reports automatically sanitize potentially dangerous spreadsheet formulas (cells starting
            with =, +, -, @ are escaped with leading apostrophes). Every download event is timestamped and recorded
            in the administrative audit log for traceability.
          </p>
        </div>
      </div>
    </div>
  );
}
