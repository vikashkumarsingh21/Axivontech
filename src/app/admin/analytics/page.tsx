"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  RefreshCw,
  Users,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Sparkles,
  Award,
  Zap,
  Globe,
  Loader2,
  ArrowRight,
  ShieldCheck,
  FileSpreadsheet,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";

const CHART_COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EC4899", "#8B5CF6", "#14B8A6"];

export default function AdminAnalyticsDashboard() {
  const [preset, setPreset] = useState("last_30_days");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [showCustomRange, setShowCustomRange] = useState(false);

  const [overview, setOverview] = useState<any>(null);
  const [sales, setSales] = useState<any>(null);
  const [delivery, setDelivery] = useState<any>(null);
  const [systemHealth, setSystemHealth] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<string>("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({ preset });
      if (preset === "custom" && customStart && customEnd) {
        queryParams.set("startDate", customStart);
        queryParams.set("endDate", customEnd);
      }

      const [resOverview, resSales, resDelivery, resSystem] = await Promise.all([
        fetch(`/api/v1/analytics/overview?${queryParams}`),
        fetch(`/api/v1/analytics/sales?${queryParams}`),
        fetch(`/api/v1/analytics/delivery?${queryParams}`),
        fetch(`/api/v1/analytics/system?${queryParams}`),
      ]);

      if (!resOverview.ok || !resSales.ok || !resDelivery.ok) {
        throw new Error("Failed to load analytics records");
      }

      const [dataOverview, dataSales, dataDelivery, dataSystem] = await Promise.all([
        resOverview.json(),
        resSales.json(),
        resDelivery.json(),
        resSystem.json(),
      ]);

      setOverview(dataOverview.data);
      setSales(dataSales.data);
      setDelivery(dataDelivery.data);
      setSystemHealth(dataSystem.data);
      setLastRefreshed(new Date().toLocaleTimeString());
    } catch (err: any) {
      setError(err.message || "Failed to load business intelligence");
    } finally {
      setLoading(false);
    }
  }, [preset, customStart, customEnd]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleExportCsv = (reportType: string) => {
    const queryParams = new URLSearchParams({ reportType, preset });
    if (preset === "custom" && customStart && customEnd) {
      queryParams.set("startDate", customStart);
      queryParams.set("endDate", customEnd);
    }
    window.open(`/api/v1/analytics/export?${queryParams}`, "_blank");
  };

  const renderComparisonBadge = (comp?: any) => {
    if (!comp) return null;
    const { diff, percentage, direction } = comp;

    if (direction === "FLAT") {
      return (
        <span className="text-[11px] font-semibold text-gray-400 bg-gray-500/10 px-2 py-0.5 rounded-full border border-gray-500/20">
          0% vs prev period
        </span>
      );
    }

    if (percentage === null) {
      return (
        <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
          +{diff} (New)
        </span>
      );
    }

    const isPositive = diff > 0;
    return (
      <span
        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
          isPositive
            ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
            : "text-red-400 bg-red-500/10 border-red-500/20"
        }`}
      >
        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {isPositive ? `+${percentage}%` : `${percentage}%`} vs prev
      </span>
    );
  };

  return (
    <div className="space-y-6 text-[#F3F5F7] min-h-[90vh]">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-[#29313B] pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[#10B981]" /> Business Intelligence & Analytics
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/25">
              Live DB
            </span>
          </div>
          <p className="text-[#A7B0BC] text-sm mt-1">
            Authoritative operational metrics, sales conversions, project delivery, and platform diagnostics.
          </p>
        </div>

        {/* Date Filter & Export Controls */}
        <div className="flex items-center gap-2.5 flex-wrap w-full lg:w-auto">
          <select
            value={preset}
            onChange={(e) => {
              const val = e.target.value;
              setPreset(val);
              setShowCustomRange(val === "custom");
            }}
            className="bg-[#151A21] border border-[#29313B] text-sm text-[#F3F5F7] rounded-xl px-3 py-2 focus:outline-none focus:border-[#10B981] cursor-pointer"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last_7_days">Last 7 Days</option>
            <option value="last_30_days">Last 30 Days</option>
            <option value="last_90_days">Last 90 Days</option>
            <option value="this_month">This Month</option>
            <option value="previous_month">Previous Month</option>
            <option value="this_quarter">This Quarter</option>
            <option value="this_year">This Year</option>
            <option value="custom">Custom Range...</option>
          </select>

          {showCustomRange && (
            <div className="flex items-center gap-2 bg-[#151A21] border border-[#29313B] rounded-xl p-1 text-xs">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="bg-transparent text-[#F3F5F7] px-2 py-1 focus:outline-none"
              />
              <span className="text-[#A7B0BC]">to</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="bg-transparent text-[#F3F5F7] px-2 py-1 focus:outline-none"
              />
            </div>
          )}

          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 rounded-xl bg-[#151A21] hover:bg-[#1B222B] border border-[#29313B] text-[#A7B0BC] hover:text-white transition-colors"
            title="Refresh dataset"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#10B981]" : ""}`} />
          </button>

          <button
            onClick={() => handleExportCsv("leads")}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1B222B] hover:bg-[#202833] border border-[#29313B] text-xs font-semibold text-[#F3F5F7] transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#10B981]" />
            Export CSV
          </button>

          <Link
            href="/admin/reports"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-xs font-semibold text-[#04130E] transition-colors shadow-lg shadow-[#10B981]/20"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Reports Centre
          </Link>
        </div>
      </div>

      {lastRefreshed && (
        <div className="flex items-center justify-between text-xs text-[#A7B0BC]">
          <span>
            Reporting Period: <strong className="text-white">{overview?.periodLabel || preset}</strong>
          </span>
          <span>Last synchronized: {lastRefreshed}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && !overview ? (
        <div className="flex flex-col items-center justify-center py-24 text-[#A7B0BC] space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#10B981]" />
          <p className="text-sm">Calculating authoritative business metrics...</p>
        </div>
      ) : (
        <>
          {/* Section 1: KPI Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. New Leads */}
            <div className="bg-[#151A21] border border-[#29313B] rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between text-xs text-[#A7B0BC]">
                <span>New Leads</span>
                <Users className="w-4 h-4 text-[#10B981]" />
              </div>
              <div className="text-2xl font-bold text-white tracking-tight">
                {overview?.kpis?.newLeads?.current ?? 0}
              </div>
              <div className="flex items-center justify-between pt-1">
                {renderComparisonBadge(overview?.kpis?.newLeads)}
                <span className="text-[11px] text-[#A7B0BC]">Total: {overview?.kpis?.totalLeadsAllTime}</span>
              </div>
            </div>

            {/* 2. Qualified Leads */}
            <div className="bg-[#151A21] border border-[#29313B] rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between text-xs text-[#A7B0BC]">
                <span>Qualified Leads</span>
                <Award className="w-4 h-4 text-[#3B82F6]" />
              </div>
              <div className="text-2xl font-bold text-white tracking-tight">
                {overview?.kpis?.qualifiedLeads?.current ?? 0}
              </div>
              <div className="flex items-center justify-between pt-1">
                {renderComparisonBadge(overview?.kpis?.qualifiedLeads)}
                <span className="text-[11px] text-blue-400 font-mono">
                  {overview?.kpis?.qualificationRate?.formatted} rate
                </span>
              </div>
            </div>

            {/* 3. Confirmed Conversions */}
            <div className="bg-[#151A21] border border-[#29313B] rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between text-xs text-[#A7B0BC]">
                <span>Confirmed Projects</span>
                <Briefcase className="w-4 h-4 text-[#D6B779]" />
              </div>
              <div className="text-2xl font-bold text-white tracking-tight">
                {overview?.kpis?.convertedLeads?.current ?? 0}
              </div>
              <div className="flex items-center justify-between pt-1">
                {renderComparisonBadge(overview?.kpis?.convertedLeads)}
                <span className="text-[11px] text-[#D6B779] font-mono">
                  {overview?.kpis?.conversionRate?.formatted} conv
                </span>
              </div>
            </div>

            {/* 4. Active Delivery */}
            <div className="bg-[#151A21] border border-[#29313B] rounded-2xl p-5 space-y-2">
              <div className="flex items-center justify-between text-xs text-[#A7B0BC]">
                <span>Active Projects</span>
                <Clock className="w-4 h-4 text-[#EC4899]" />
              </div>
              <div className="text-2xl font-bold text-white tracking-tight">
                {overview?.kpis?.activeProjects?.current ?? 0}
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-emerald-400">
                  {overview?.kpis?.completedProjects?.current ?? 0} completed
                </span>
                {overview?.kpis?.overdueMilestones?.current > 0 ? (
                  <span className="text-[11px] text-red-400 font-semibold">
                    {overview?.kpis?.overdueMilestones?.current} overdue
                  </span>
                ) : (
                  <span className="text-[11px] text-gray-500">Milestones on-track</span>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Trend Line Chart */}
            <div className="bg-[#151A21] border border-[#29313B] rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-white">Lead Generation Trend</h3>
                  <p className="text-xs text-[#A7B0BC]">New inbound inquiries across the selected period</p>
                </div>
                <span className="text-xs font-mono text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-full">
                  {sales?.totalLeads || 0} Total
                </span>
              </div>

              {sales?.trend && sales.trend.length > 0 ? (
                <div className="h-64 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sales.trend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#29313B" />
                      <XAxis dataKey="date" stroke="#A7B0BC" fontSize={11} />
                      <YAxis stroke="#A7B0BC" fontSize={11} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#151A21",
                          borderColor: "#29313B",
                          color: "#F3F5F7",
                          borderRadius: "12px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        name="Leads Created"
                        stroke="#10B981"
                        strokeWidth={2}
                        dot={{ r: 3, fill: "#10B981" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-[#A7B0BC] text-xs">
                  <Calendar className="w-8 h-8 text-[#29313B] mb-2" />
                  No leads recorded in this specific date range.
                </div>
              )}
            </div>

            {/* Lead Sources Distribution Pie Chart */}
            <div className="bg-[#151A21] border border-[#29313B] rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-white">Inbound Lead Sources</h3>
                  <p className="text-xs text-[#A7B0BC]">Distribution across contact forms, demo apps, and referrals</p>
                </div>
              </div>

              {sales?.distributions?.bySource && sales.distributions.bySource.length > 0 ? (
                <div className="h-64 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sales.distributions.bySource}
                        dataKey="count"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={50}
                        paddingAngle={4}
                        label={({ name, percent }: any) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                        labelLine={false}
                      >
                        {sales.distributions.bySource.map((entry: any, index: number) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#151A21",
                          borderColor: "#29313B",
                          color: "#F3F5F7",
                          borderRadius: "12px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-[#A7B0BC] text-xs">
                  <Layers className="w-8 h-8 text-[#29313B] mb-2" />
                  No source breakdown available for current filters.
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Project Delivery & Platform Health Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Delivery Health */}
            <div className="bg-[#151A21] border border-[#29313B] rounded-2xl p-5 space-y-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#D6B779]" /> Project Milestone Health
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs p-3 rounded-xl bg-[#1B222B]">
                  <span className="text-[#A7B0BC]">Total Tracked Projects</span>
                  <span className="font-bold text-white">{delivery?.totalProjects || 0}</span>
                </div>
                <div className="flex justify-between items-center text-xs p-3 rounded-xl bg-[#1B222B]">
                  <span className="text-[#A7B0BC]">Active In-Flight Projects</span>
                  <span className="font-bold text-[#10B981]">{delivery?.activeProjects || 0}</span>
                </div>
                <div className="flex justify-between items-center text-xs p-3 rounded-xl bg-[#1B222B]">
                  <span className="text-[#A7B0BC]">Overdue Milestones</span>
                  <span className="font-bold text-red-400">{delivery?.overdueMilestonesCount || 0}</span>
                </div>
                <div className="flex justify-between items-center text-xs p-3 rounded-xl bg-[#1B222B]">
                  <span className="text-[#A7B0BC]">Upcoming Milestones (14d)</span>
                  <span className="font-bold text-[#3B82F6]">{delivery?.upcomingMilestones?.length || 0}</span>
                </div>
              </div>
            </div>

            {/* Step 8 Platform Health & Automation Diagnostics */}
            <div className="bg-[#151A21] border border-[#29313B] rounded-2xl p-5 space-y-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#F59E0B]" /> Platform Automation Health
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs p-3 rounded-xl bg-[#1B222B]">
                  <span className="text-[#A7B0BC]">Active Automation Rules</span>
                  <span className="font-bold text-white">{systemHealth?.activeWorkflowsCount || 0}</span>
                </div>
                <div className="flex justify-between items-center text-xs p-3 rounded-xl bg-[#1B222B]">
                  <span className="text-[#A7B0BC]">Automation Success Rate</span>
                  <span className="font-bold text-emerald-400">
                    {systemHealth?.automation?.successRate?.formatted || "100%"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs p-3 rounded-xl bg-[#1B222B]">
                  <span className="text-[#A7B0BC]">Background Job Queue</span>
                  <span className="font-mono text-xs text-amber-400">
                    {systemHealth?.jobQueue?.PENDING || 0} Pending / {systemHealth?.jobQueue?.COMPLETED || 0} Done
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs p-3 rounded-xl bg-[#1B222B]">
                  <span className="text-[#A7B0BC]">Email Delivery Success</span>
                  <span className="font-bold text-cyan-400">
                    {systemHealth?.emailDelivery?.deliveryRate}% ({systemHealth?.emailDelivery?.sent} sent)
                  </span>
                </div>
              </div>
            </div>

            {/* External Web Analytics Health Card */}
            <div className="bg-[#151A21] border border-[#29313B] rounded-2xl p-5 space-y-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#3B82F6]" /> Web Analytics Integrations
              </h3>
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-[#1B222B] space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">Google Analytics 4</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        systemHealth?.externalIntegrations?.ga4?.status === "CONNECTED"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-gray-500/10 text-gray-400 border border-gray-500/20"
                      }`}
                    >
                      {systemHealth?.externalIntegrations?.ga4?.status || "CONNECTED"}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#A7B0BC]">Client tracking via Centralized Web Analytics Engine</p>
                </div>

                <div className="p-3 rounded-xl bg-[#1B222B] space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">Google Search Console</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        systemHealth?.externalIntegrations?.searchConsole?.status === "VERIFIED"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {systemHealth?.externalIntegrations?.searchConsole?.status || "CONFIGURED"}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#A7B0BC]">Organic sitemaps and indexing signals</p>
                </div>

                <div className="pt-1">
                  <Link
                    href="/admin/activity"
                    className="flex items-center justify-between text-xs text-[#10B981] hover:underline"
                  >
                    <span>View Security Audit Logs</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Recent Inbound Leads Drill-Down Table */}
          <div className="bg-[#151A21] border border-[#29313B] rounded-2xl overflow-hidden shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-[#29313B] bg-[#101318]">
              <div>
                <h3 className="text-sm font-semibold text-white">Recent Inbound Inquiries</h3>
                <p className="text-xs text-[#A7B0BC]">Directly drill down into CRM lead records</p>
              </div>
              <Link
                href="/admin/crm/leads"
                className="text-xs text-[#10B981] hover:underline flex items-center gap-1"
              >
                <span>Open Lead Inbox</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <table className="w-full text-left text-xs text-[#A7B0BC]">
              <thead className="bg-[#1B222B] text-[#F3F5F7] text-[11px] uppercase font-semibold border-b border-[#29313B]">
                <tr>
                  <th className="px-5 py-3">Lead Code</th>
                  <th className="px-5 py-3">Name / Company</th>
                  <th className="px-5 py-3">Service Interest</th>
                  <th className="px-5 py-3">Source</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#29313B]/50">
                {!sales?.recentLeads || sales.recentLeads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-[#A7B0BC]">
                      No leads received during the selected time period.
                    </td>
                  </tr>
                ) : (
                  sales.recentLeads.map((lead: any) => (
                    <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3.5 font-mono text-white font-semibold">{lead.leadCode}</td>
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-white">{lead.name}</div>
                        {lead.companyName && (
                          <div className="text-[11px] text-[#A7B0BC]">{lead.companyName}</div>
                        )}
                      </td>
                      <td className="px-5 py-3.5">{lead.serviceInterest || "General Inquiry"}</td>
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-[10px] bg-white/5 px-2 py-0.5 rounded">
                          {lead.source}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            lead.status === "CONVERTED"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : lead.status === "NEW"
                              ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                              : "bg-gray-500/10 text-gray-400 border border-gray-500/20"
                          }`}
                        >
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[11px]">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          href={`/admin/crm/leads/${lead.id}`}
                          className="text-[#10B981] hover:underline font-semibold"
                        >
                          View Details →
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
