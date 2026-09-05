"use client";

import { useEffect, useState } from "react";
import { Users, TrendingUp, DollarSign, Target, CheckCircle2, Clock, AlertTriangle, ArrowRight, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function CrmDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/crm/dashboard/summary");
      if (res.ok) {
        const d = await res.json();
        setData(d.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">CRM Dashboard</h1>
          <p className="text-gray-400 mt-1 text-sm">Real-time business development, sales pipeline & lead metrics.</p>
        </div>
        <button
          onClick={loadData}
          className="p-2 rounded-xl border border-white/10 bg-[#1a1a1a] text-gray-400 hover:text-white transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Leads</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{loading ? "—" : data?.totalLeads || 0}</p>
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
            <span className="text-green-400 font-semibold">{data?.newLeads || 0} new</span>
            <span>·</span>
            <span>{data?.qualifiedLeads || 0} qualified</span>
          </div>
        </div>

        <div className="bg-[#111111] border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pipeline Value</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{loading ? "—" : formatCurrency(data?.pipelineValue || 0)}</p>
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
            <span>Weighted:</span>
            <span className="text-purple-300 font-semibold">{formatCurrency(data?.weightedPipeline || 0)}</span>
          </div>
        </div>

        <div className="bg-[#111111] border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Won Deals Value</span>
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{loading ? "—" : formatCurrency(data?.wonDealsValue || 0)}</p>
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
            <span className="text-green-400 font-semibold">{data?.wonDealsCount || 0} won</span>
            <span>·</span>
            <span>Win Rate: {data?.winRate || 0}%</span>
          </div>
        </div>

        <div className="bg-[#111111] border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Follow-Up Health</span>
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{loading ? "—" : data?.pendingFollowupsCount || 0}</p>
          <div className="flex items-center gap-2 mt-2 text-xs">
            {data?.overdueFollowupsCount > 0 ? (
              <span className="text-red-400 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {data.overdueFollowupsCount} overdue
              </span>
            ) : (
              <span className="text-green-400">All follow-ups on track</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Stage Breakdown */}
        <div className="lg:col-span-2 bg-[#111111] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold text-white">Pipeline Stage Breakdown</h2>
              <p className="text-xs text-gray-400 mt-0.5">Value and count of active deals by stage</p>
            </div>
            <Link
              href="/admin/crm/pipeline"
              className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300 font-medium"
            >
              View Pipeline Board <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="py-8 text-center text-gray-500">Loading pipeline stages...</div>
            ) : !data?.stageBreakdown || data.stageBreakdown.length === 0 ? (
              <div className="py-8 text-center text-gray-500">No active opportunities found in pipeline.</div>
            ) : (
              data.stageBreakdown.map((s: any) => {
                const totalVal = data.pipelineValue || 1;
                const percentage = Math.min(100, Math.round((s.value / totalVal) * 100));
                return (
                  <div key={s.stage} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white">{s.stage} ({s.count})</span>
                      <span className="text-gray-300 font-mono">{formatCurrency(s.value)}</span>
                    </div>
                    <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-600 to-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Leads */}
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold text-white">Recent Leads</h2>
            <Link href="/admin/crm/leads" className="text-xs text-red-400 hover:text-red-300">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="py-8 text-center text-gray-500">Loading leads...</div>
            ) : !data?.recentLeads || data.recentLeads.length === 0 ? (
              <div className="py-8 text-center text-gray-500">No leads captured yet.</div>
            ) : (
              data.recentLeads.map((lead: any) => (
                <Link
                  key={lead.id}
                  href={`/admin/crm/leads/${lead.id}`}
                  className="block p-3 rounded-xl bg-[#18181b] border border-white/5 hover:border-red-500/30 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white truncate">{lead.name}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-medium">
                      {lead.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 truncate">{lead.companyName || lead.source}</p>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
