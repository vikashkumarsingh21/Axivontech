"use client";

import Link from "next/link";
import {
  TrendingUp,
  BarChart3,
  Users,
  Briefcase,
  ArrowUpRight,
  ShieldCheck,
  Activity,
  ArrowLeft,
} from "lucide-react";

export default function ExecutiveAnalyticsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6 text-[#D6B779]" />
            <span>Executive Business Intelligence & Analytics</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Real-time organizational telemetry, delivery performance, sales velocity, and partner metrics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/executive/dashboard"
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Executive Overview</span>
          </Link>
          <Link
            href="/admin/analytics"
            className="flex items-center gap-2 px-4 py-2 bg-[#D6B779] hover:bg-[#C5A668] text-black rounded-xl text-xs font-bold transition-colors"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>BI Control Center</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#11141A] p-5 rounded-2xl border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-gray-500 text-xs">
            <span>Enterprise Pipeline</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white tracking-tight">₹48.2L</p>
          <p className="text-[11px] text-emerald-400">+18.4% from last quarter</p>
        </div>
        <div className="bg-[#11141A] p-5 rounded-2xl border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-gray-500 text-xs">
            <span>Active Deployments</span>
            <Briefcase className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white tracking-tight">12</p>
          <p className="text-[11px] text-blue-400">100% on-time milestone delivery</p>
        </div>
        <div className="bg-[#11141A] p-5 rounded-2xl border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-gray-500 text-xs">
            <span>Partner Network</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-white tracking-tight">24</p>
          <p className="text-[11px] text-purple-400">Active verified brokers</p>
        </div>
        <div className="bg-[#11141A] p-5 rounded-2xl border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-gray-500 text-xs">
            <span>Governance SLA</span>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white tracking-tight">99.8%</p>
          <p className="text-[11px] text-amber-400">Zero unhandled escalations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/crm/pipeline"
          className="bg-[#11141A] border border-white/10 hover:border-white/20 rounded-2xl p-6 transition-all group"
        >
          <h3 className="text-base font-bold text-white group-hover:text-[#D6B779] transition-colors flex items-center justify-between">
            <span>Sales & Pipeline Telemetry</span>
            <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-[#D6B779]" />
          </h3>
          <p className="text-xs text-gray-400 mt-2">
            Inspect lead velocity, proposal conversion rates, and deal cycle times across all sales stages.
          </p>
        </Link>
        <Link
          href="/admin/analytics"
          className="bg-[#11141A] border border-white/10 hover:border-white/20 rounded-2xl p-6 transition-all group"
        >
          <h3 className="text-base font-bold text-white group-hover:text-[#D6B779] transition-colors flex items-center justify-between">
            <span>Financial & Payout Metrics</span>
            <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-[#D6B779]" />
          </h3>
          <p className="text-xs text-gray-400 mt-2">
            View commission disbursements, 48h settlement compliance, and revenue realization.
          </p>
        </Link>
        <Link
          href="/executive/reports"
          className="bg-[#11141A] border border-white/10 hover:border-white/20 rounded-2xl p-6 transition-all group"
        >
          <h3 className="text-base font-bold text-white group-hover:text-[#D6B779] transition-colors flex items-center justify-between">
            <span>Executive Governance Reports</span>
            <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-[#D6B779]" />
          </h3>
          <p className="text-xs text-gray-400 mt-2">
            Generate and export board-level performance summaries, compliance audits, and team activity logs.
          </p>
        </Link>
      </div>
    </div>
  );
}
