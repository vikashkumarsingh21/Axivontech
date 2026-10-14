// src/app/demo-projects/saas/leadpilot/reports/page.tsx
"use client";

import React, { useMemo } from "react";
import {
  BarChart3,
  TrendingUp,
  Download,
  Users,
  DollarSign,
  PieChart as PieIcon,
  CheckCircle2,
  FileSpreadsheet,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { useLeadPilot } from "@/context/LeadPilotContext";

export default function LeadPilotReportsPage() {
  const { leads, deals, tasks, wonRevenue, pipelineValue } = useLeadPilot();

  // Status breakdown data
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    leads.forEach((l) => {
      counts[l.status] = (counts[l.status] || 0) + 1;
    });

    const colors: Record<string, string> = {
      New: "#DDA34B",
      Contacted: "#7E8880",
      Qualified: "#3B997F",
      Proposal: "#2F806A",
      Won: "#252925",
      Lost: "#C96D56",
    };

    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      color: colors[name] || "#2F806A",
    }));
  }, [leads]);

  // Deal size distribution
  const dealSizeData = useMemo(() => {
    const buckets = [
      { name: "<$25k", count: 0 },
      { name: "$25k-$50k", count: 0 },
      { name: "$50k-$75k", count: 0 },
      { name: "$75k+", count: 0 },
    ];

    deals.forEach((d) => {
      if (d.estimatedValue < 25000) buckets[0].count += 1;
      else if (d.estimatedValue <= 50000) buckets[1].count += 1;
      else if (d.estimatedValue <= 75000) buckets[2].count += 1;
      else buckets[3].count += 1;
    });

    return buckets;
  }, [deals]);

  // Export report summary
  const handleExportReportCSV = () => {
    const rows = [
      ["Metric", "Value"],
      ["Total Leads in Pipeline", leads.length],
      ["Open Deals Count", deals.filter((d) => d.stage !== "Won" && d.stage !== "Lost").length],
      ["Total Active Pipeline Value ($)", pipelineValue],
      ["Closed Won Revenue ($)", wonRevenue],
      ["Tasks Completed", tasks.filter((t) => t.status === "Completed").length],
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `leadpilot_sales_report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#252925]">
            Sales Analytics & Conversion Reports
          </h1>
          <p className="mt-0.5 text-xs text-[#747A75]">
            Executive reporting on lead stages, deal size distributions, and team closing velocity.
          </p>
        </div>

        <button
          onClick={handleExportReportCSV}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#F6F7F4] text-[#252925] border border-[#E3E6E1] rounded-xl text-xs font-semibold shadow-2xs transition-colors self-start sm:self-auto"
        >
          <FileSpreadsheet className="h-4 w-4 text-[#2F806A]" />
          <span>Export Executive Summary</span>
        </button>
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E3E6E1] shadow-2xs">
          <div className="text-xs font-semibold text-[#747A75]">Total Closed Bookings</div>
          <div className="mt-2 text-2xl font-extrabold text-[#2F806A]">
            ${wonRevenue.toLocaleString()}
          </div>
          <div className="mt-1 text-[11px] text-[#747A75]">Across executed contracts</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E3E6E1] shadow-2xs">
          <div className="text-xs font-semibold text-[#747A75]">Active Pipeline Exposure</div>
          <div className="mt-2 text-2xl font-extrabold text-[#252925]">
            ${pipelineValue.toLocaleString()}
          </div>
          <div className="mt-1 text-[11px] text-[#747A75]">Open deals in negotiation/proposal</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E3E6E1] shadow-2xs">
          <div className="text-xs font-semibold text-[#747A75]">Average Deal Size</div>
          <div className="mt-2 text-2xl font-extrabold text-[#252925]">
            $
            {deals.length > 0
              ? Math.round(
                  deals.reduce((s, d) => s + d.estimatedValue, 0) / deals.length
                ).toLocaleString()
              : 0}
          </div>
          <div className="mt-1 text-[11px] text-[#747A75]">Calculated across all deals</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E3E6E1] shadow-2xs">
          <div className="text-xs font-semibold text-[#747A75]">Task Execution Velocity</div>
          <div className="mt-2 text-2xl font-extrabold text-[#DDA34B]">
            {tasks.length > 0
              ? Math.round(
                  (tasks.filter((t) => t.status === "Completed").length / tasks.length) * 100
                )
              : 0}
            %
          </div>
          <div className="mt-1 text-[11px] text-[#747A75]">Task resolution rate</div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Leads by Status */}
        <div className="bg-white p-6 rounded-2xl border border-[#E3E6E1] shadow-xs">
          <h3 className="text-sm font-bold text-[#252925] mb-1">Prospect Funnel Distribution</h3>
          <p className="text-xs text-[#747A75] mb-4">Volume of leads across lifecycle stages</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" fontSize={11} stroke="#747A75" tickLine={false} />
                <YAxis fontSize={11} stroke="#747A75" tickLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#252925] text-white p-2 rounded-lg text-xs">
                          <div>{payload[0].payload.name}</div>
                          <div className="font-bold text-[#2F806A]">
                            {payload[0].payload.count} leads
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {statusData.map((e, idx) => (
                    <Cell key={`cell-${idx}`} fill={e.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Deal Size Buckets */}
        <div className="bg-white p-6 rounded-2xl border border-[#E3E6E1] shadow-xs">
          <h3 className="text-sm font-bold text-[#252925] mb-1">Deal Ticket Size Distribution</h3>
          <p className="text-xs text-[#747A75] mb-4">Count of opportunities categorized by contract value</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dealSizeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" fontSize={11} stroke="#747A75" tickLine={false} />
                <YAxis fontSize={11} stroke="#747A75" tickLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#252925] text-white p-2 rounded-lg text-xs">
                          <div>{payload[0].payload.name}</div>
                          <div className="font-bold text-[#DDA34B]">
                            {payload[0].payload.count} deals
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" fill="#2F806A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
