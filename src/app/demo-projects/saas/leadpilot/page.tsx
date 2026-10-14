// src/app/demo-projects/saas/leadpilot/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import {
  Users,
  DollarSign,
  TrendingUp,
  CheckSquare,
  ArrowUpRight,
  Clock,
  Sparkles,
  Calendar,
  AlertCircle,
  Activity as ActivityIcon,
  ChevronRight,
  Filter,
} from "lucide-react";
import { useLeadPilot } from "@/context/LeadPilotContext";
import LeadPilotCharts from "@/components/demo-projects/leadpilot/LeadPilotCharts";

export default function LeadPilotOverviewPage() {
  const {
    leads,
    deals,
    tasks,
    activities,
    totalLeads,
    newLeadsCount,
    openDealsCount,
    pipelineValue,
    tasksDueCount,
    qualifiedLeadsCount,
    wonRevenue,
    selectedTimeRange,
    setTimeRange,
    toggleTaskStatus,
  } = useLeadPilot();

  // Top 5 upcoming tasks
  const pendingTasks = React.useMemo(() => {
    return tasks
      .filter((t) => t.status !== "Completed")
      .slice(0, 4);
  }, [tasks]);

  // Recent 5 activities
  const recentActivities = React.useMemo(() => {
    return activities.slice(0, 5);
  }, [activities]);

  // High priority deals in flight
  const priorityDeals = React.useMemo(() => {
    return deals
      .filter((d) => d.stage !== "Won" && d.stage !== "Lost")
      .sort((a, b) => b.estimatedValue - a.estimatedValue)
      .slice(0, 4);
  }, [deals]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. Header greeting & period filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#252925]">
              Good morning, Alex
            </h1>
            <span className="text-[11px] font-semibold bg-[#E5F0EB] text-[#2F806A] px-2.5 py-0.5 rounded-full border border-[#2F806A]/20">
              Active Rep View
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-[#747A75]">
            Here is your sales pipeline activity overview. All figures compute live from your sample records.
          </p>
        </div>

        {/* Time period filter */}
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-[#E3E6E1] shadow-2xs self-start sm:self-auto">
          <button
            onClick={() => setTimeRange("month")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedTimeRange === "month"
                ? "bg-[#252925] text-white"
                : "text-[#747A75] hover:text-[#252925]"
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setTimeRange("quarter")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedTimeRange === "quarter"
                ? "bg-[#252925] text-white"
                : "text-[#747A75] hover:text-[#252925]"
            }`}
          >
            Quarter
          </button>
          <button
            onClick={() => setTimeRange("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedTimeRange === "all"
                ? "bg-[#252925] text-white"
                : "text-[#747A75] hover:text-[#252925]"
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* 2. KPI Cards (Derived from real sample state) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
        {/* Total Leads */}
        <div className="bg-white p-4 rounded-xl border border-[#E3E6E1] shadow-2xs">
          <div className="flex items-center justify-between text-[#747A75] text-xs font-medium">
            <span>Total Leads</span>
            <Users className="h-4 w-4 text-[#2F806A]" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#252925]">{totalLeads}</div>
          <div className="mt-1 text-[11px] text-[#2F806A] font-semibold flex items-center gap-1">
            <span>{qualifiedLeadsCount} in pipeline</span>
          </div>
        </div>

        {/* New Leads */}
        <div className="bg-white p-4 rounded-xl border border-[#E3E6E1] shadow-2xs">
          <div className="flex items-center justify-between text-[#747A75] text-xs font-medium">
            <span>New Leads</span>
            <span className="h-2 w-2 rounded-full bg-[#DDA34B]" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#252925]">{newLeadsCount}</div>
          <div className="mt-1 text-[11px] text-[#747A75]">Awaiting initial contact</div>
        </div>

        {/* Open Deals */}
        <div className="bg-white p-4 rounded-xl border border-[#E3E6E1] shadow-2xs">
          <div className="flex items-center justify-between text-[#747A75] text-xs font-medium">
            <span>Open Deals</span>
            <DollarSign className="h-4 w-4 text-[#2F806A]" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#252925]">{openDealsCount}</div>
          <div className="mt-1 text-[11px] text-[#747A75]">Active commercial scope</div>
        </div>

        {/* Pipeline Value */}
        <div className="bg-white p-4 rounded-xl border border-[#E3E6E1] shadow-2xs">
          <div className="flex items-center justify-between text-[#747A75] text-xs font-medium">
            <span>Pipeline Value</span>
            <TrendingUp className="h-4 w-4 text-[#2F806A]" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#2F806A]">
            ${pipelineValue >= 1000 ? `${(pipelineValue / 1000).toFixed(0)}k` : pipelineValue}
          </div>
          <div className="mt-1 text-[11px] text-[#747A75]">Weighted deal sum</div>
        </div>

        {/* Tasks Due */}
        <div className="bg-white p-4 rounded-xl border border-[#E3E6E1] shadow-2xs">
          <div className="flex items-center justify-between text-[#747A75] text-xs font-medium">
            <span>Tasks Due</span>
            <CheckSquare className="h-4 w-4 text-[#DDA34B]" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#252925]">{tasksDueCount}</div>
          <div className="mt-1 text-[11px] text-[#DDA34B] font-semibold">Requires follow-up</div>
        </div>

        {/* Closed Won Revenue */}
        <div className="bg-white p-4 rounded-xl border border-[#E3E6E1] shadow-2xs">
          <div className="flex items-center justify-between text-[#747A75] text-xs font-medium">
            <span>Won Bookings</span>
            <Sparkles className="h-4 w-4 text-[#2F806A]" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#252925]">
            ${wonRevenue >= 1000 ? `${(wonRevenue / 1000).toFixed(0)}k` : wonRevenue}
          </div>
          <div className="mt-1 text-[11px] text-[#2F806A] font-semibold">Executed MSAs</div>
        </div>
      </div>

      {/* 3. Charts Area */}
      <LeadPilotCharts leads={leads} deals={deals} />

      {/* 4. Active Deals & Pending Tasks Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Priority Deals in Flight */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E3E6E1] p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#252925]">High-Value Opportunities</h3>
              <p className="text-xs text-[#747A75]">Largest active opportunities nearing close</p>
            </div>
            <Link
              href="/demo-projects/saas/leadpilot/deals"
              className="text-xs font-semibold text-[#2F806A] hover:underline flex items-center gap-1"
            >
              <span>View all deals</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[#E3E6E1]">
            {priorityDeals.map((deal) => (
              <div
                key={deal.id}
                className="py-3 sm:py-3.5 flex items-center justify-between gap-4 hover:bg-[#F6F7F4]/60 px-2 rounded-lg transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#252925] truncate">{deal.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-[#E5F0EB] text-[#2F806A]">
                      {deal.stage}
                    </span>
                  </div>
                  <div className="mt-0.5 text-[11px] text-[#747A75] flex items-center gap-3">
                    <span>{deal.companyName}</span>
                    <span>·</span>
                    <span>Close: {deal.expectedCloseDate}</span>
                    <span>·</span>
                    <span>Prob: {deal.probability}%</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm font-extrabold text-[#2F806A]">
                    ${deal.estimatedValue.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-[#747A75]">{deal.assignedOwner.split(" ")[0]}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Items / Follow-ups */}
        <div className="bg-white rounded-2xl border border-[#E3E6E1] p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#252925]">Immediate Follow-ups</h3>
              <p className="text-xs text-[#747A75]">Click checkbox to complete</p>
            </div>
            <Link
              href="/demo-projects/saas/leadpilot/tasks"
              className="text-xs font-semibold text-[#2F806A] hover:underline"
            >
              All tasks
            </Link>
          </div>

          <div className="space-y-3">
            {pendingTasks.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#747A75]">
                All pending tasks completed! Great work.
              </div>
            ) : (
              pendingTasks.map((t) => (
                <div
                  key={t.id}
                  className="p-3 rounded-xl border border-[#E3E6E1] bg-[#F6F7F4] flex items-start gap-3 hover:border-[#2F806A]/40 transition-colors"
                >
                  <button
                    onClick={() => toggleTaskStatus(t.id)}
                    className="mt-0.5 h-4 w-4 rounded-md border border-[#747A75] flex items-center justify-center hover:border-[#2F806A] transition-colors shrink-0"
                    aria-label="Mark task complete"
                  >
                    {t.status === "Completed" && <CheckSquare className="h-3.5 w-3.5 text-[#2F806A]" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-[#252925] leading-snug">
                      {t.title}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-[#747A75]">
                      <span className="flex items-center gap-1 text-[#DDA34B] font-semibold">
                        <Clock className="h-3 w-3" />
                        Due {t.dueDate}
                      </span>
                      {t.priority === "High" && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#FFF0E6] text-[#D9534F] font-bold">
                          HIGH
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 5. Live Activity Feed */}
      <div className="bg-white rounded-2xl border border-[#E3E6E1] p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#252925]">Recent Sales Activities</h3>
            <p className="text-xs text-[#747A75]">Live timeline of team touchpoints and status changes</p>
          </div>
          <Link
            href="/demo-projects/saas/leadpilot/activities"
            className="text-xs font-semibold text-[#2F806A] hover:underline flex items-center gap-1"
          >
            <span>Full timeline</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="space-y-3.5">
          {recentActivities.map((act) => (
            <div key={act.id} className="flex items-start gap-3 text-xs">
              <div className="h-7 w-7 rounded-full bg-[#E5F0EB] text-[#2F806A] flex items-center justify-center shrink-0 mt-0.5">
                <ActivityIcon className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#252925]">{act.title}</span>
                  <span className="text-[11px] text-[#747A75]">{act.date} at {act.time}</span>
                </div>
                <p className="mt-0.5 text-[11px] text-[#555C56]">{act.description}</p>
                <div className="mt-1 text-[10px] text-[#747A75]">By {act.performedBy}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
