"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
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
  DollarSign,
  UserCheck,
  Target,
  BarChart3,
  Activity,
  CheckCircle,
  XCircle,
  HelpCircle,
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

const CHART_COLORS = ["#10B981", "#3B82F6", "#D6B779", "#EC4899", "#8B5CF6", "#14B8A6"];

type DashboardTab = "ALL" | "SALES" | "DELIVERY" | "PARTNERS" | "FINANCE" | "SYSTEM";

export default function AdminAnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState<DashboardTab>("ALL");
  const [preset, setPreset] = useState("last_30_days");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [showCustomRange, setShowCustomRange] = useState(false);

  const [overview, setOverview] = useState<any>(null);
  const [sales, setSales] = useState<any>(null);
  const [delivery, setDelivery] = useState<any>(null);
  const [partners, setPartners] = useState<any>(null);
  const [finance, setFinance] = useState<any>(null);
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

      // Fetch all BI modules via Promise.allSettled for maximum fault isolation
      const [
        resOverview,
        resSales,
        resDelivery,
        resPartners,
        resSystem,
        resFinance,
      ] = await Promise.allSettled([
        fetch(`/api/v1/analytics/overview?${queryParams}`).then((r) => r.ok ? r.json() : Promise.reject(r)),
        fetch(`/api/v1/analytics/sales?${queryParams}`).then((r) => r.ok ? r.json() : Promise.reject(r)),
        fetch(`/api/v1/analytics/delivery?${queryParams}`).then((r) => r.ok ? r.json() : Promise.reject(r)),
        fetch(`/api/v1/analytics/partners?${queryParams}`).then((r) => r.ok ? r.json() : Promise.reject(r)),
        fetch(`/api/v1/analytics/system?${queryParams}`).then((r) => r.ok ? r.json() : Promise.reject(r)),
        fetch(`/api/v1/analytics/finance?${queryParams}`).then((r) => r.ok ? r.json() : null),
      ]);

      if (resOverview.status === "fulfilled" && resOverview.value?.data) {
        setOverview(resOverview.value.data);
      }
      if (resSales.status === "fulfilled" && resSales.value?.data) {
        setSales(resSales.value.data);
      }
      if (resDelivery.status === "fulfilled" && resDelivery.value?.data) {
        setDelivery(resDelivery.value.data);
      }
      if (resPartners.status === "fulfilled" && resPartners.value?.data) {
        setPartners(resPartners.value.data);
      }
      if (resSystem.status === "fulfilled" && resSystem.value?.data) {
        setSystemHealth(resSystem.value.data);
      }
      if (resFinance.status === "fulfilled" && resFinance.value?.data) {
        setFinance(resFinance.value.data);
      }

      // Check if critical core overview failed
      if (resOverview.status === "rejected" && resSales.status === "rejected") {
        throw new Error("Unable to load core analytics records. Please check database connectivity.");
      }

      setLastRefreshed(new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" }));
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

    if (direction === "FLAT" || diff === 0) {
      return (
        <span className="text-[11px] font-semibold text-gray-400 bg-gray-500/10 px-2 py-0.5 rounded-full border border-gray-500/20">
          0% vs prev period
        </span>
      );
    }

    if (percentage === null) {
      return (
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
          diff > 0
            ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
            : "text-red-400 bg-red-500/10 border-red-500/20"
        }`}>
          {diff > 0 ? `+${diff}` : `${diff}`} (New)
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
    <div className="space-y-6 text-[#F3F5F7] min-h-[90vh] pb-12">
      {/* ── Top Header ────────────────────────────────────────────── */}
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
            Authoritative operational metrics, sales conversions, delivery tracking, partner metrics, and platform health.
          </p>
        </div>

        {/* Date Filter & Export Controls */}
        <div className="flex items-center gap-2.5 flex-wrap w-full lg:w-auto">
          <div className="flex items-center gap-1.5 bg-[#151A21] border border-[#29313B] rounded-xl px-2.5 py-1.5">
            <Calendar className="w-4 h-4 text-[#A7B0BC]" />
            <select
              value={preset}
              onChange={(e) => {
                const val = e.target.value;
                setPreset(val);
                setShowCustomRange(val === "custom");
              }}
              className="bg-transparent text-xs sm:text-sm text-[#F3F5F7] focus:outline-none cursor-pointer"
            >
              <option value="today" className="bg-[#151A21]">Today</option>
              <option value="yesterday" className="bg-[#151A21]">Yesterday</option>
              <option value="last_7_days" className="bg-[#151A21]">Last 7 Days</option>
              <option value="last_30_days" className="bg-[#151A21]">Last 30 Days</option>
              <option value="last_90_days" className="bg-[#151A21]">Last 90 Days</option>
              <option value="this_month" className="bg-[#151A21]">This Month</option>
              <option value="previous_month" className="bg-[#151A21]">Previous Month</option>
              <option value="this_quarter" className="bg-[#151A21]">This Quarter</option>
              <option value="this_year" className="bg-[#151A21]">This Year</option>
              <option value="custom" className="bg-[#151A21]">Custom Range...</option>
            </select>
          </div>

          {showCustomRange && (
            <div className="flex items-center gap-2 bg-[#151A21] border border-[#29313B] rounded-xl p-1.5 text-xs">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="bg-transparent text-[#F3F5F7] px-1 focus:outline-none"
              />
              <span className="text-[#A7B0BC]">to</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="bg-transparent text-[#F3F5F7] px-1 focus:outline-none"
              />
            </div>
          )}

          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 rounded-xl bg-[#151A21] hover:bg-[#1B222B] border border-[#29313B] text-[#A7B0BC] hover:text-white transition-colors"
            title="Refresh analytics dataset"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#10B981]" : ""}`} />
          </button>

          <button
            onClick={() => handleExportCsv("leads")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1B222B] hover:bg-[#202833] border border-[#29313B] text-xs font-semibold text-[#F3F5F7] transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#10B981]" />
            Export CSV
          </button>

          <Link
            href="/admin/reports"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-xs font-semibold text-[#04130E] transition-colors shadow-lg shadow-[#10B981]/20"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Reports Centre
          </Link>
        </div>
      </div>

      {/* ── Sub Navigation Tabs ──────────────────────────────────── */}
      <div className="flex items-center gap-1.5 p-1 bg-[#101318] border border-[#29313B] rounded-xl overflow-x-auto text-xs font-semibold">
        {[
          { key: "ALL", label: "Executive Overview", icon: BarChart3 },
          { key: "SALES", label: "Sales & Conversions", icon: Target },
          { key: "DELIVERY", label: "Delivery & Projects", icon: Briefcase },
          { key: "PARTNERS", label: "Partner Program", icon: UserCheck },
          { key: "FINANCE", label: "Revenue & Finance", icon: DollarSign },
          { key: "SYSTEM", label: "Automation Health", icon: Zap },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as DashboardTab)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                isActive
                  ? "bg-[#10B981] text-[#04130E] shadow-sm font-bold"
                  : "text-[#A7B0BC] hover:text-[#F3F5F7] hover:bg-[#1B222B]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {lastRefreshed && (
        <div className="flex items-center justify-between text-xs text-[#A7B0BC] px-1">
          <span>
            Active Reporting Window: <strong className="text-white">{overview?.periodLabel || preset}</strong>
          </span>
          <span>Last synchronized: {lastRefreshed} IST</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadData}
            className="text-xs px-2.5 py-1 rounded bg-red-500/20 hover:bg-red-500/30 font-semibold"
          >
            Retry
          </button>
        </div>
      )}

      {loading && !overview ? (
        <div className="flex flex-col items-center justify-center py-24 text-[#A7B0BC] space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#10B981]" />
          <p className="text-sm">Aggregating verified business metrics from production database...</p>
        </div>
      ) : (
        <>
          {/* ── Section 1: Executive KPI Overview ───────────────────── */}
          {(activeTab === "ALL" || activeTab === "SALES") && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-[#A7B0BC] flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#10B981]" /> Inbound Sales & Demand Metrics
                </h2>
                <Link href="/admin/crm/leads" className="text-xs text-[#10B981] hover:underline flex items-center gap-1">
                  Lead CRM Inbox <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. New Inbound Leads */}
                <div className="bg-[#151A21] border border-[#29313B] rounded-2xl p-5 space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#A7B0BC]">
                    <span>Inbound Inquiries</span>
                    <Users className="w-4 h-4 text-[#10B981]" />
                  </div>
                  <div className="text-3xl font-bold text-white tracking-tight">
                    {overview?.kpis?.newLeads?.current ?? sales?.totalLeads ?? 0}
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    {renderComparisonBadge(overview?.kpis?.newLeads)}
                    <span className="text-[11px] text-[#A7B0BC]">Total: {overview?.kpis?.totalLeadsAllTime || 0}</span>
                  </div>
                </div>

                {/* 2. Qualified Leads */}
                <div className="bg-[#151A21] border border-[#29313B] rounded-2xl p-5 space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#A7B0BC]">
                    <span>Qualified Demand</span>
                    <Award className="w-4 h-4 text-[#3B82F6]" />
                  </div>
                  <div className="text-3xl font-bold text-white tracking-tight">
                    {overview?.kpis?.qualifiedLeads?.current ?? sales?.qualifiedLeads ?? 0}
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    {renderComparisonBadge(overview?.kpis?.qualifiedLeads)}
                    <span className="text-[11px] text-blue-400 font-mono">
                      {overview?.kpis?.qualificationRate?.formatted || `${sales?.qualificationRate || 0}%`} rate
                    </span>
                  </div>
                </div>

                {/* 3. Confirmed Conversions */}
                <div className="bg-[#151A21] border border-[#29313B] rounded-2xl p-5 space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#A7B0BC]">
                    <span>Confirmed Projects</span>
                    <Briefcase className="w-4 h-4 text-[#D6B779]" />
                  </div>
                  <div className="text-3xl font-bold text-white tracking-tight">
                    {overview?.kpis?.convertedLeads?.current ?? sales?.convertedLeads ?? 0}
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    {renderComparisonBadge(overview?.kpis?.convertedLeads)}
                    <span className="text-[11px] text-[#D6B779] font-mono">
                      {overview?.kpis?.conversionRate?.formatted || `${sales?.conversionRate || 0}%`} conv
                    </span>
                  </div>
                </div>

                {/* 4. Active Clients & Accounts */}
                <div className="bg-[#151A21] border border-[#29313B] rounded-2xl p-5 space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#A7B0BC]">
                    <span>Active Client Accounts</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-3xl font-bold text-white tracking-tight">
                    {overview?.kpis?.activeClients ?? 0}
                  </div>
                  <div className="flex items-center justify-between pt-1 text-[11px] text-[#A7B0BC]">
                    <span>Overdue Followups: <strong className="text-amber-400">{sales?.overdueFollowUps || 0}</strong></span>
                    <Link href="/admin/crm/follow-ups" className="text-[#10B981] hover:underline">Schedule</Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Section 2: Visual Trend Charts ──────────────────────── */}
          {(activeTab === "ALL" || activeTab === "SALES") && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sales Trend Line Chart */}
              <div className="bg-[#151A21] border border-[#29313B] rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-white">Lead Generation Trend</h3>
                    <p className="text-xs text-[#A7B0BC]">Daily inquiries received across selected window</p>
                  </div>
                  <span className="text-xs font-mono text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-full border border-[#10B981]/25">
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
                          name="Inquiries Received"
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
                    No lead inquiries recorded in this specific date range.
                  </div>
                )}
              </div>

              {/* Lead Sources Distribution Pie Chart */}
              <div className="bg-[#151A21] border border-[#29313B] rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-white">Inbound Lead Sources</h3>
                    <p className="text-xs text-[#A7B0BC]">Channel breakdown across Website, Demos, Chatbot & Partners</p>
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
          )}

          {/* ── Section 3: Project Delivery & Milestones ─────────────── */}
          {(activeTab === "ALL" || activeTab === "DELIVERY") && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-[#A7B0BC] flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#D6B779]" /> Project Delivery & Milestone Health
                </h2>
                <Link href="/admin/crm/partner-projects" className="text-xs text-[#10B981] hover:underline flex items-center gap-1">
                  Manage Projects <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#151A21] border border-[#29313B] rounded-2xl p-5 space-y-2">
                  <div className="text-xs text-[#A7B0BC]">Active Projects</div>
                  <div className="text-2xl font-bold text-white">{delivery?.activeProjects || 0}</div>
                  <div className="text-[11px] text-emerald-400 font-medium">In engineering sprints</div>
                </div>

                <div className="bg-[#151A21] border border-[#29313B] rounded-2xl p-5 space-y-2">
                  <div className="text-xs text-[#A7B0BC]">Completed Projects</div>
                  <div className="text-2xl font-bold text-emerald-400">{delivery?.completedProjects || 0}</div>
                  <div className="text-[11px] text-[#A7B0BC]">Shipped to production</div>
                </div>

                <div className="bg-[#151A21] border border-[#29313B] rounded-2xl p-5 space-y-2">
                  <div className="text-xs text-[#A7B0BC]">Overdue Milestones</div>
                  <div className="text-2xl font-bold text-red-400">{delivery?.overdueMilestonesCount || 0}</div>
                  <div className="text-[11px] text-red-400/80 font-medium">Requiring immediate attention</div>
                </div>

                <div className="bg-[#151A21] border border-[#29313B] rounded-2xl p-5 space-y-2">
                  <div className="text-xs text-[#A7B0BC]">Upcoming Milestones (14d)</div>
                  <div className="text-2xl font-bold text-blue-400">{delivery?.upcomingMilestones?.length || 0}</div>
                  <div className="text-[11px] text-[#A7B0BC]">Scheduled on calendar</div>
                </div>
              </div>

              {/* Overdue Milestones Alert Table */}
              {delivery?.overdueMilestones && delivery.overdueMilestones.length > 0 && (
                <div className="bg-[#151A21] border border-red-500/20 rounded-2xl overflow-hidden shadow-lg">
                  <div className="p-4 border-b border-red-500/20 bg-red-500/5 flex items-center justify-between">
                    <span className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> Overdue Project Milestones
                    </span>
                    <span className="text-xs text-red-400/80 font-mono">
                      {delivery.overdueMilestones.length} milestones past due date
                    </span>
                  </div>
                  <div className="divide-y divide-[#29313B]">
                    {delivery.overdueMilestones.map((m: any) => (
                      <div key={m.id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-xs">
                        <div>
                          <p className="font-semibold text-white">{m.title}</p>
                          <p className="text-[#A7B0BC]">{m.partnerProject?.projectName} &bull; Client: {m.partnerProject?.clientName || "Direct"}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-red-400 font-mono">Target: {new Date(m.targetDate).toLocaleDateString()}</span>
                          <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/25 font-bold uppercase text-[10px]">
                            {m.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Section 4: Partner & Broker Network ─────────────────── */}
          {(activeTab === "ALL" || activeTab === "PARTNERS") && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-[#A7B0BC] flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-400" /> Business Partner & Broker Program
                </h2>
                <Link href="/admin/business-partners/applications" className="text-xs text-[#10B981] hover:underline flex items-center gap-1">
                  Partner Applications <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#151A21] border border-[#29313B] rounded-2xl p-5 space-y-2">
                  <div className="text-xs text-[#A7B0BC]">Partner Applications</div>
                  <div className="text-2xl font-bold text-white">{partners?.totalApplications || 0}</div>
                  <div className="text-[11px] text-[#A7B0BC]">{partners?.applicationsInPeriod || 0} in this period</div>
                </div>

                <div className="bg-[#151A21] border border-[#29313B] rounded-2xl p-5 space-y-2">
                  <div className="text-xs text-[#A7B0BC]">Active Brokers</div>
                  <div className="text-2xl font-bold text-[#10B981]">{partners?.activeBrokersCount || 0}</div>
                  <div className="text-[11px] text-[#A7B0BC]">Verified referral agents</div>
                </div>

                <div className="bg-[#151A21] border border-[#29313B] rounded-2xl p-5 space-y-2">
                  <div className="text-xs text-[#A7B0BC]">Partner Leads Generated</div>
                  <div className="text-2xl font-bold text-[#D6B779]">{partners?.partnerLeadsCount || 0}</div>
                  <div className="text-[11px] text-[#A7B0BC]">{partners?.partnerContractsCount || 0} signed contracts</div>
                </div>

                <div className="bg-[#151A21] border border-[#29313B] rounded-2xl p-5 space-y-2">
                  <div className="text-xs text-[#A7B0BC]">Commissions & Payouts</div>
                  <div className="text-2xl font-bold text-cyan-400">{partners?.pendingCommissionsCount || 0}</div>
                  <div className="text-[11px] text-[#A7B0BC]">{partners?.verifiedPaymentsCount || 0} verified payments</div>
                </div>
              </div>
            </div>
          )}

          {/* ── Section 5: Financial Analytics (Founder/Finance) ────── */}
          {(activeTab === "ALL" || activeTab === "FINANCE") && finance && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-[#A7B0BC] flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#10B981]" /> Financial Performance (Authorized)
                </h2>
                <Link href="/admin/crm/payments" className="text-xs text-[#10B981] hover:underline flex items-center gap-1">
                  Payment Ledger <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#151A21] border border-[#29313B] rounded-2xl p-5 space-y-2">
                  <div className="text-xs text-[#A7B0BC]">Cash Collected</div>
                  <div className="text-2xl font-bold text-emerald-400">
                    {finance?.metrics?.cashCollected?.formatted || "₹0"}
                  </div>
                  <div className="text-[11px] text-[#A7B0BC]">Verified received funds</div>
                </div>

                <div className="bg-[#151A21] border border-[#29313B] rounded-2xl p-5 space-y-2">
                  <div className="text-xs text-[#A7B0BC]">Contracted Value</div>
                  <div className="text-2xl font-bold text-white">
                    {finance?.metrics?.contractedValue?.formatted || "₹0"}
                  </div>
                  <div className="text-[11px] text-[#A7B0BC]">Signed client deliverables</div>
                </div>

                <div className="bg-[#151A21] border border-[#29313B] rounded-2xl p-5 space-y-2">
                  <div className="text-xs text-[#A7B0BC]">Pending Receivables</div>
                  <div className="text-2xl font-bold text-amber-400">
                    {finance?.metrics?.pendingReceivables?.formatted || "₹0"}
                  </div>
                  <div className="text-[11px] text-[#A7B0BC]">Awaiting settlement</div>
                </div>

                <div className="bg-[#151A21] border border-[#29313B] rounded-2xl p-5 space-y-2">
                  <div className="text-xs text-[#A7B0BC]">Broker Commissions Paid</div>
                  <div className="text-2xl font-bold text-purple-400">
                    {finance?.metrics?.commissionsPaid?.formatted || "₹0"}
                  </div>
                  <div className="text-[11px] text-[#A7B0BC]">
                    {finance?.metrics?.commissionsPayable?.formatted} payable
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Section 6: Platform Health & Automation Diagnostics ─── */}
          {(activeTab === "ALL" || activeTab === "SYSTEM") && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Automation Diagnostics */}
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
                    <span className="text-[#A7B0BC]">Workflow Execution Success Rate</span>
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
                    <span className="text-[#A7B0BC]">System Email Dispatches</span>
                    <span className="font-bold text-cyan-400">
                      {systemHealth?.emailDelivery?.deliveryRate || 100}% ({systemHealth?.emailDelivery?.sent || 0} sent)
                    </span>
                  </div>
                </div>
              </div>

              {/* Web Analytics Integrations */}
              <div className="bg-[#151A21] border border-[#29313B] rounded-2xl p-5 space-y-4">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#3B82F6]" /> Web Analytics & SEO Signals
                </h3>
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-[#1B222B] space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white">Google Analytics 4</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {systemHealth?.externalIntegrations?.ga4?.status || "CONNECTED"}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#A7B0BC]">Measurement ID G-QCHH8ELS1K active on public website</p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#1B222B] space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white">Google Search Console</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {systemHealth?.externalIntegrations?.searchConsole?.status || "VERIFIED"}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#A7B0BC]">Organic XML sitemap & robots indexation enabled</p>
                  </div>

                  <div className="pt-1">
                    <Link
                      href="/admin/activity"
                      className="flex items-center justify-between text-xs text-[#10B981] hover:underline"
                    >
                      <span>Inspect Audit Logs & Security History</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Section 7: Recent Inbound Leads Drill-Down Table ─────── */}
          {(activeTab === "ALL" || activeTab === "SALES") && (
            <div className="bg-[#151A21] border border-[#29313B] rounded-2xl overflow-hidden shadow-xl">
              <div className="flex items-center justify-between p-4 border-b border-[#29313B] bg-[#101318]">
                <div>
                  <h3 className="text-sm font-semibold text-white">Recent Inbound Inquiries</h3>
                  <p className="text-xs text-[#A7B0BC]">Real-time customer inquiries from verified database</p>
                </div>
                <Link
                  href="/admin/crm/leads"
                  className="text-xs text-[#10B981] hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>Open Complete Lead Inbox</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#A7B0BC]">
                  <thead className="bg-[#1B222B] text-[#F3F5F7] text-[11px] uppercase font-semibold border-b border-[#29313B]">
                    <tr>
                      <th className="px-5 py-3">Lead Code</th>
                      <th className="px-5 py-3">Client / Organization</th>
                      <th className="px-5 py-3">Service Interest</th>
                      <th className="px-5 py-3">Source</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Date</th>
                      <th className="px-5 py-3 text-right">Drill-Down</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#29313B]/50">
                    {!sales?.recentLeads || sales.recentLeads.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-[#A7B0BC]">
                          No inquiries received during the selected time window.
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
                            <span className="font-mono text-[10px] bg-white/5 px-2 py-0.5 rounded border border-white/10">
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
                              View Lead Record →
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
