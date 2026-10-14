// src/components/demo-projects/leadpilot/LeadPilotCharts.tsx
"use client";

import React from "react";
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
import { Lead, Deal } from "@/data/leadpilot-data";

interface LeadPilotChartsProps {
  leads: Lead[];
  deals: Deal[];
}

export default function LeadPilotCharts({ leads, deals }: LeadPilotChartsProps) {
  // 1. Leads by Source distribution
  const sourceData = React.useMemo(() => {
    const counts: Record<string, number> = {};
    leads.forEach((l) => {
      counts[l.source] = (counts[l.source] || 0) + 1;
    });

    const colors: Record<string, string> = {
      "Website Form": "#2F806A",
      "Demo Request": "#3B997F",
      "LinkedIn": "#DDA34B",
      "Inbound Referral": "#55645A",
      "Industry Event": "#7E8880",
      "Outbound Campaign": "#A6B1A8",
    };

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color: colors[name] || "#2F806A",
    }));
  }, [leads]);

  // 2. Deals pipeline value by stage
  const pipelineStageData = React.useMemo(() => {
    const stageOrder = ["Discovery", "Qualification", "Proposal", "Negotiation", "Won"];
    const stageValues: Record<string, number> = {
      Discovery: 0,
      Qualification: 0,
      Proposal: 0,
      Negotiation: 0,
      Won: 0,
    };

    deals.forEach((d) => {
      if (stageValues[d.stage] !== undefined) {
        stageValues[d.stage] += d.estimatedValue;
      }
    });

    return stageOrder.map((stage) => ({
      stage,
      value: stageValues[stage],
    }));
  }, [deals]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Chart 1: Deal Pipeline by Stage */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E3E6E1] shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#252925]">Pipeline Value by Stage</h3>
            <p className="text-xs text-[#747A75]">Active opportunity volume in USD ($)</p>
          </div>
          <span className="text-[11px] font-semibold text-[#2F806A] bg-[#E5F0EB] px-2.5 py-1 rounded-full">
            Dynamic sample data
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={pipelineStageData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <XAxis
                dataKey="stage"
                stroke="#747A75"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "#E3E6E1" }}
              />
              <YAxis
                stroke="#747A75"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "#E3E6E1" }}
                tickFormatter={(val) => `$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-[#252925] text-white p-2.5 rounded-lg text-xs shadow-md">
                        <div className="font-semibold">{data.stage}</div>
                        <div className="text-[#DDA34B] font-bold">
                          ${data.value.toLocaleString()}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {pipelineStageData.map((entry, index) => (
                  <Cell
                    key={`stage-cell-${index}`}
                    fill={entry.stage === "Won" ? "#2F806A" : "#DDA34B"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Lead Acquisition Sources */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E3E6E1] shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#252925]">Lead Acquisition Channels</h3>
            <p className="text-xs text-[#747A75]">Breakdown of inbound & outbound prospects</p>
          </div>
          <span className="text-[11px] font-semibold text-[#747A75] bg-[#F6F7F4] px-2.5 py-1 rounded-full border border-[#E3E6E1]">
            {leads.length} Total Leads
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 h-64">
          <div className="h-full w-full sm:w-1/2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`source-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#252925] text-white p-2 rounded-lg text-xs shadow-md">
                          <div className="font-medium">{data.name}</div>
                          <div className="font-bold text-[#2F806A]">{data.value} leads</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="w-full sm:w-1/2 space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {sourceData.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-xs py-1">
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="text-[#252925] truncate font-medium">{s.name}</span>
                </div>
                <span className="font-semibold text-[#747A75] shrink-0 ml-2">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
