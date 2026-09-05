"use client";

import { useEffect, useState } from "react";
import { Users, Briefcase, CheckSquare, Activity, Clock, RefreshCw, AlertCircle } from "lucide-react";

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [pendingLeaves, setPendingLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [summaryRes, auditRes, leavesRes] = await Promise.all([
        fetch("/api/v1/admin/dashboard/summary"),
        fetch("/api/v1/admin/audit?limit=8"),
        fetch("/api/v1/admin/leaves?status=PENDING&limit=5"),
      ]);
      if (summaryRes.ok) setData(await summaryRes.json());
      if (auditRes.ok) {
        const d = await auditRes.json();
        setActivity(d.data || []);
      }
      if (leavesRes.ok) {
        const d = await leavesRes.json();
        setPendingLeaves(d.data || []);
      }
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  const formatAction = (action: string) => action.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Admin Dashboard</h1>
          <p className="text-gray-400 mt-1">{greeting} — Platform overview and operational KPIs.</p>
        </div>
        <button onClick={load} className="p-2 rounded-xl border border-white/10 bg-[#1a1a1a] text-gray-400 hover:text-white transition-colors">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Employees", value: data?.totalEmployees || 0, sub: `${data?.activeEmployees || 0} active`, icon: Users, color: "text-blue-400" },
          { label: "Present Today", value: data?.presentToday || 0, sub: "Checked in", icon: Clock, color: "text-green-400" },
          { label: "Active Projects", value: data?.totalProjects || 0, sub: "Active / On Hold", icon: Briefcase, color: "text-purple-400" },
          { label: "Open Tasks", value: data?.openTasks || 0, sub: "Across all projects", icon: CheckSquare, color: "text-orange-400" },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="bg-[#111111] border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <Icon className={`w-5 h-5 ${color}`} />
              <h3 className="font-medium text-gray-300 text-sm">{label}</h3>
            </div>
            <p className="text-3xl font-bold text-white">{loading ? "—" : value}</p>
            <p className="text-sm text-gray-500 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity from Audit Logs */}
        <div className="bg-[#111111] border border-white/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" /> Recent Activity
            </h3>
            <a href="/admin/activity" className="text-xs text-gray-500 hover:text-white transition-colors">View all →</a>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-10 bg-white/5 rounded-lg animate-pulse" />)}
            </div>
          ) : activity.length === 0 ? (
            <div className="text-sm text-gray-500 py-4 text-center border border-dashed border-white/10 rounded-lg">No recent activity</div>
          ) : (
            <div className="space-y-2.5">
              {activity.map((log: any) => (
                <div key={log.id} className="flex items-start justify-between gap-3 p-2.5 rounded-lg hover:bg-white/[0.02]">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{formatAction(log.action)}</p>
                    <p className="text-xs text-gray-500">{log.resource} · {log.user?.name || "System"}</p>
                  </div>
                  <span className="text-xs text-gray-600 whitespace-nowrap">{timeAgo(log.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Leave Requests */}
        <div className="bg-[#111111] border border-white/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-400" /> Pending Leave Requests
            </h3>
            <a href="/admin/leave" className="text-xs text-gray-500 hover:text-white transition-colors">Manage all →</a>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-10 bg-white/5 rounded-lg animate-pulse" />)}
            </div>
          ) : pendingLeaves.length === 0 ? (
            <div className="text-sm text-gray-500 py-4 text-center border border-dashed border-white/10 rounded-lg">No pending leave requests 🎉</div>
          ) : (
            <div className="space-y-2.5">
              {pendingLeaves.map((l: any) => (
                <div key={l.id} className="flex items-start justify-between gap-3 p-2.5 rounded-lg hover:bg-white/[0.02]">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white">{l.user?.name}</p>
                    <p className="text-xs text-gray-500">{l.leaveType} · {new Date(l.startDate).toLocaleDateString("en-IN")} → {new Date(l.endDate).toLocaleDateString("en-IN")}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 whitespace-nowrap">PENDING</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
