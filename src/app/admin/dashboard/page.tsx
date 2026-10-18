"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { 
  Users, Briefcase, CheckSquare, Activity, Clock, RefreshCw, 
  AlertCircle, ArrowRight, TrendingUp, UserCheck, ShieldAlert,
  FileCheck2, DollarSign, Award, Plus, Sparkles, ExternalLink,
  ChevronRight, Calendar, Building2, CheckCircle2, Megaphone, FileText
} from "lucide-react";

interface LeadItem {
  id: string;
  leadCode: string;
  name: string;
  email: string;
  phone?: string | null;
  companyName?: string | null;
  serviceInterest?: string | null;
  source: string;
  status: string;
  qualificationStatus: string;
  isDuplicate: boolean;
  createdAt: string;
  owner?: { name: string } | null;
}

interface ActivityItem {
  id: string;
  category: "LEAD" | "SECURITY" | "PARTNER";
  title: string;
  description: string;
  actor: string;
  createdAt: string;
}

const STATUS_BADGES: Record<string, string> = {
  NEW: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  CONTACTED: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  QUALIFIED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  CONVERTED: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  UNQUALIFIED: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  LOST: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("Welcome");
  const [activeChartTab, setActiveChartTab] = useState<"source" | "status" | "partners">("source");

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return "";
    const time = new Date(dateStr);
    if (isNaN(time.getTime())) return "";
    return time.toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/dashboard/summary");
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
      }
    } catch (e) {
      console.error("Failed to load admin summary:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening");
    loadData();
  }, [loadData]);

  const summary = data?.summary || {};
  const recentLeads: LeadItem[] = data?.recentLeads || [];
  const activities: ActivityItem[] = data?.recentActivity || [];
  const charts = data?.charts || {};

  return (
    <div className="space-y-8">
      {/* ── Top Header & Greeting ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            Executive Operations Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {greeting}, Administrator
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Real-time business overview, centralized lead intelligence, and operational health.
          </p>
        </div>

        <div className="flex items-center gap-2.5 relative z-10 w-full sm:w-auto justify-between sm:justify-end">
          <button
            onClick={loadData}
            title="Refresh Data"
            className="p-2.5 rounded-xl border border-white/10 bg-[#161618] text-gray-300 hover:text-white hover:bg-white/5 transition-all shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-red-500" : ""}`} />
          </button>
          <Link
            href="/admin/crm/leads"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-lg shadow-red-600/20"
          >
            <Users className="w-4 h-4" />
            <span>Open Lead Inbox</span>
          </Link>
        </div>
      </div>

      {/* ── Core KPI Summary Grid (4 Primary Cards) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Leads Command */}
        <Link
          href="/admin/crm/leads"
          className="group block bg-[#111111] hover:bg-[#151515] border border-white/10 hover:border-red-500/40 rounded-2xl p-5 transition-all duration-200 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider group-hover:text-red-400 transition-colors">
              Total Leads
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white tracking-tight">
            {loading ? "—" : summary.totalLeads ?? 0}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
            <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 font-semibold">
              {summary.newLeads ?? 0} New
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-semibold">
              {summary.qualifiedLeads ?? 0} Qualified
            </span>
          </div>
        </Link>

        {/* Card 2: Partner Applications */}
        <Link
          href="/admin/business-partners/applications"
          className="group block bg-[#111111] hover:bg-[#151515] border border-white/10 hover:border-amber-500/40 rounded-2xl p-5 transition-all duration-200 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider group-hover:text-amber-400 transition-colors">
              Partner Applications
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white tracking-tight">
            {loading ? "—" : summary.totalApplications ?? 0}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
            <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 font-semibold">
              {summary.pendingApplications ?? 0} Awaiting Review
            </span>
            <span className="text-gray-500 text-[11px]">
              {summary.activePartners ?? 0} Active Partners
            </span>
          </div>
        </Link>

        {/* Card 3: Active Client Projects */}
        <Link
          href="/admin/crm/partner-projects"
          className="group block bg-[#111111] hover:bg-[#151515] border border-white/10 hover:border-purple-500/40 rounded-2xl p-5 transition-all duration-200 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider group-hover:text-purple-400 transition-colors">
              Client Projects
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white tracking-tight">
            {loading ? "—" : summary.activeProjects ?? 0}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
            <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 font-semibold">
              {summary.completedProjects ?? 0} Delivered
            </span>
            <span className="text-gray-500 text-[11px]">
              {summary.pendingContracts ?? 0} Contracts Pending
            </span>
          </div>
        </Link>

        {/* Card 4: Workforce & Operations */}
        <Link
          href="/admin/employees"
          className="group block bg-[#111111] hover:bg-[#151515] border border-white/10 hover:border-emerald-500/40 rounded-2xl p-5 transition-all duration-200 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider group-hover:text-emerald-400 transition-colors">
              Workforce Today
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white tracking-tight">
            {loading ? "—" : summary.presentToday ?? 0}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-semibold">
              Checked In
            </span>
            <span className="text-gray-500 text-[11px]">
              {summary.totalEmployees ?? 0} Total Staff · {summary.openTasks ?? 0} Tasks
            </span>
          </div>
        </Link>
      </div>

      {/* ── Quick Action Alert Pills Bar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          href="/admin/crm/follow-ups"
          className="flex items-center justify-between p-3.5 rounded-xl bg-[#111111] border border-white/5 hover:border-amber-500/30 transition-all text-xs"
        >
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-gray-300 font-medium">Follow-ups Due</span>
          </div>
          <span className="font-mono font-bold text-white bg-white/5 px-2 py-0.5 rounded">
            {loading ? "—" : summary.followUpDueCount ?? 0}
          </span>
        </Link>

        <Link
          href="/admin/crm/payments"
          className="flex items-center justify-between p-3.5 rounded-xl bg-[#111111] border border-white/5 hover:border-blue-500/30 transition-all text-xs"
        >
          <div className="flex items-center gap-2.5">
            <DollarSign className="w-4 h-4 text-blue-400" />
            <span className="text-gray-300 font-medium">Payments To Verify</span>
          </div>
          <span className="font-mono font-bold text-white bg-white/5 px-2 py-0.5 rounded">
            {loading ? "—" : summary.paymentsAwaitingVerification ?? 0}
          </span>
        </Link>

        <Link
          href="/admin/crm/commissions"
          className="flex items-center justify-between p-3.5 rounded-xl bg-[#111111] border border-white/5 hover:border-purple-500/30 transition-all text-xs"
        >
          <div className="flex items-center gap-2.5">
            <Award className="w-4 h-4 text-purple-400" />
            <span className="text-gray-300 font-medium">Pending Commissions</span>
          </div>
          <span className="font-mono font-bold text-white bg-white/5 px-2 py-0.5 rounded">
            {loading ? "—" : summary.pendingCommissions ?? 0}
          </span>
        </Link>

        <Link
          href="/admin/crm/clients"
          className="flex items-center justify-between p-3.5 rounded-xl bg-[#111111] border border-white/5 hover:border-emerald-500/30 transition-all text-xs"
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-gray-300 font-medium">Active Clients</span>
          </div>
          <span className="font-mono font-bold text-white bg-white/5 px-2 py-0.5 rounded">
            {loading ? "—" : summary.totalClients ?? 0}
          </span>
        </Link>
      </div>

      {/* ── Workforce & Operations Overview Strip ── */}
      <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Workforce Operations & Pending Actions
            </h3>
          </div>
          <Link href="/admin/attendance" className="text-[11px] text-gray-400 hover:text-emerald-400 transition-colors">
            Attendance Monitor →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <Link
            href="/admin/leave"
            className="flex flex-col p-3 rounded-xl bg-[#161618] border border-white/5 hover:border-amber-500/30 transition-all text-xs group"
          >
            <div className="flex items-center justify-between text-gray-400 group-hover:text-amber-400 mb-1">
              <span className="text-[11px] font-medium">Pending Leaves</span>
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <p className="text-lg font-bold text-white font-mono">
              {loading ? "—" : summary.pendingLeaves ?? 0}
            </p>
          </Link>

          <Link
            href="/admin/work-reports"
            className="flex flex-col p-3 rounded-xl bg-[#161618] border border-white/5 hover:border-blue-500/30 transition-all text-xs group"
          >
            <div className="flex items-center justify-between text-gray-400 group-hover:text-blue-400 mb-1">
              <span className="text-[11px] font-medium">Reports Pending</span>
              <FileText className="w-3.5 h-3.5" />
            </div>
            <p className="text-lg font-bold text-white font-mono">
              {loading ? "—" : summary.pendingWorkReportsReview ?? 0}
            </p>
          </Link>

          <Link
            href="/admin/tasks"
            className="flex flex-col p-3 rounded-xl bg-[#161618] border border-white/5 hover:border-emerald-500/30 transition-all text-xs group"
          >
            <div className="flex items-center justify-between text-gray-400 group-hover:text-emerald-400 mb-1">
              <span className="text-[11px] font-medium">Open Tasks</span>
              <CheckSquare className="w-3.5 h-3.5" />
            </div>
            <p className="text-lg font-bold text-white font-mono">
              {loading ? "—" : summary.openTasks ?? 0}
            </p>
          </Link>

          <Link
            href="/admin/attendance"
            className="flex flex-col p-3 rounded-xl bg-[#161618] border border-white/5 hover:border-emerald-500/30 transition-all text-xs group"
          >
            <div className="flex items-center justify-between text-gray-400 group-hover:text-emerald-400 mb-1">
              <span className="text-[11px] font-medium">Staff Present</span>
              <Clock className="w-3.5 h-3.5" />
            </div>
            <p className="text-lg font-bold text-white font-mono">
              {loading ? "—" : `${summary.presentToday ?? 0}/${summary.totalEmployees ?? 0}`}
            </p>
          </Link>

          <Link
            href="/admin/calendar"
            className="flex flex-col p-3 rounded-xl bg-[#161618] border border-white/5 hover:border-purple-500/30 transition-all text-xs group"
          >
            <div className="flex items-center justify-between text-gray-400 group-hover:text-purple-400 mb-1">
              <span className="text-[11px] font-medium">Upcoming Holidays</span>
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <p className="text-lg font-bold text-white font-mono">
              {loading ? "—" : summary.upcomingCompanyHolidaysCount ?? 0}
            </p>
          </Link>

          <Link
            href="/admin/announcements"
            className="flex flex-col p-3 rounded-xl bg-[#161618] border border-white/5 hover:border-cyan-500/30 transition-all text-xs group"
          >
            <div className="flex items-center justify-between text-gray-400 group-hover:text-cyan-400 mb-1">
              <span className="text-[11px] font-medium">Announcements</span>
              <Megaphone className="w-3.5 h-3.5" />
            </div>
            <p className="text-lg font-bold text-white font-mono">
              {loading ? "—" : summary.activeAnnouncementsCount ?? 0}
            </p>
          </Link>
        </div>
      </div>

      {/* ── Real Recent Leads Ingestion Table ── */}
      <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">Live Lead Stream</h2>
              <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-[10px] font-bold uppercase tracking-wider">
                Real Ingestion
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Inquiries captured across Contact, Consultation, and Partner forms.
            </p>
          </div>

          <Link
            href="/admin/crm/leads"
            className="inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-semibold transition-colors"
          >
            <span>View Full Lead Inbox ({summary.totalLeads ?? 0})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#161618] text-gray-400 text-[11px] uppercase font-bold tracking-wider border-b border-white/10">
              <tr>
                <th className="px-5 py-3.5">Lead Code</th>
                <th className="px-5 py-3.5">Contact & Company</th>
                <th className="px-5 py-3.5">Interest / Service</th>
                <th className="px-5 py-3.5">Source</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Received</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-red-500" />
                    Fetching live inquiries from database...
                  </td>
                </tr>
              ) : recentLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-gray-400">
                    <div className="max-w-sm mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-gray-500">
                        <Users className="w-6 h-6" />
                      </div>
                      <p className="font-semibold text-white">No Website Inquiries Yet</p>
                      <p className="text-xs text-gray-500">
                        Leads submitted via the website contact form, consultation scheduler, or partner referral links will automatically appear here.
                      </p>
                      <Link
                        href="/contact"
                        target="_blank"
                        className="inline-flex items-center gap-1.5 text-xs text-red-400 hover:underline pt-1"
                      >
                        <span>Open Public Contact Form to Test</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                recentLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5 font-mono text-red-400 font-bold whitespace-nowrap">
                      <Link href={`/admin/crm/leads/${lead.id}`} className="hover:underline">
                        {lead.leadCode}
                      </Link>
                      {lead.isDuplicate && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-sans font-medium">
                          <AlertCircle className="w-3 h-3 text-amber-400" />
                          <span>Duplicate</span>
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <Link href={`/admin/crm/leads/${lead.id}`} className="font-semibold text-white hover:text-red-400 transition-colors block">
                        {lead.name}
                      </Link>
                      <div className="text-[11px] text-gray-400">
                        {lead.companyName || lead.email}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-medium text-white block max-w-xs truncate">
                        {lead.serviceInterest || "General Inquiry"}
                      </span>
                      {lead.phone && <span className="text-[10px] text-gray-500">{lead.phone}</span>}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-gray-300 text-[11px]">
                        {lead.source}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${STATUS_BADGES[lead.status] || "bg-gray-500/10 text-gray-400"}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 whitespace-nowrap">
                      {formatDateTime(lead.createdAt)}
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <Link
                        href={`/admin/crm/leads/${lead.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white font-medium text-xs border border-white/10 transition-colors"
                      >
                        <span>Details</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Analytics & Live Activity Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Analytics Breakdown Card (7 cols) */}
        <div className="lg:col-span-7 bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <h3 className="text-base font-bold text-white">Pipeline Analytics</h3>
              <p className="text-xs text-gray-400 mt-0.5">Real-time source and lifecycle distribution.</p>
            </div>

            <div className="flex items-center gap-1 bg-[#18181b] border border-white/10 p-1 rounded-xl text-xs">
              <button
                onClick={() => setActiveChartTab("source")}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  activeChartTab === "source" ? "bg-red-600 text-white shadow-sm" : "text-gray-400 hover:text-white"
                }`}
              >
                By Source
              </button>
              <button
                onClick={() => setActiveChartTab("status")}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  activeChartTab === "status" ? "bg-red-600 text-white shadow-sm" : "text-gray-400 hover:text-white"
                }`}
              >
                By Status
              </button>
              <button
                onClick={() => setActiveChartTab("partners")}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  activeChartTab === "partners" ? "bg-red-600 text-white shadow-sm" : "text-gray-400 hover:text-white"
                }`}
              >
                Partners
              </button>
            </div>
          </div>

          {/* Chart Distribution Bars */}
          <div className="space-y-4">
            {loading ? (
              <div className="py-12 text-center text-xs text-gray-500">Loading metrics...</div>
            ) : activeChartTab === "source" ? (
              (!charts.leadsBySource || charts.leadsBySource.length === 0) ? (
                <div className="py-8 text-center text-xs text-gray-500">No source data recorded yet.</div>
              ) : (
                charts.leadsBySource.map((s: any) => {
                  const max = Math.max(...charts.leadsBySource.map((i: any) => i.count), 1);
                  const pct = Math.round((s.count / max) * 100);
                  return (
                    <div key={s.name} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-white">{s.name}</span>
                        <span className="text-gray-400 font-mono font-bold">{s.count} leads</span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-red-600 to-amber-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(pct, 6)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )
            ) : activeChartTab === "status" ? (
              (!charts.leadsByStatus || charts.leadsByStatus.length === 0) ? (
                <div className="py-8 text-center text-xs text-gray-500">No status data recorded yet.</div>
              ) : (
                charts.leadsByStatus.map((s: any) => {
                  const max = Math.max(...charts.leadsByStatus.map((i: any) => i.count), 1);
                  const pct = Math.round((s.count / max) * 100);
                  return (
                    <div key={s.name} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-white">{s.name}</span>
                        <span className="text-gray-400 font-mono font-bold">{s.count} leads</span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(pct, 6)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )
            ) : (
              (!charts.applicationsByStatus || charts.applicationsByStatus.length === 0) ? (
                <div className="py-8 text-center text-xs text-gray-500">No partner application data recorded yet.</div>
              ) : (
                charts.applicationsByStatus.map((s: any) => {
                  const max = Math.max(...charts.applicationsByStatus.map((i: any) => i.count), 1);
                  const pct = Math.round((s.count / max) * 100);
                  return (
                    <div key={s.name} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-white">{s.name}</span>
                        <span className="text-gray-400 font-mono font-bold">{s.count} applications</span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(pct, 6)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )
            )}
          </div>
        </div>

        {/* Unified Live Audit / Activity Feed (5 cols) */}
        <div className="lg:col-span-5 bg-[#111111] border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-red-500" />
                <h3 className="text-base font-bold text-white">System Activity Feed</h3>
              </div>
              <Link href="/admin/activity" className="text-xs text-gray-400 hover:text-white transition-colors">
                All Logs →
              </Link>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="space-y-3 py-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : activities.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-500 border border-dashed border-white/10 rounded-xl">
                  No activity events logged yet.
                </div>
              ) : (
                activities.map((act) => (
                  <div
                    key={act.id}
                    className="p-3 rounded-xl bg-[#161618] border border-white/5 hover:border-white/15 transition-all text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white truncate max-w-[180px]">{act.title}</span>
                      <span className="text-[10px] text-gray-500 whitespace-nowrap">
                        {formatDateTime(act.createdAt)}
                      </span>
                    </div>
                    {act.description && (
                      <p className="text-[11px] text-gray-400 mt-1 truncate">{act.description}</p>
                    )}
                    <span className="inline-block mt-1 text-[9px] font-semibold text-gray-500">
                      By {act.actor}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 mt-4">
            <Link
              href="/admin/crm/pipeline"
              className="flex items-center justify-between text-xs text-gray-400 hover:text-white group"
            >
              <span>Explore Kanban Pipeline Board</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
