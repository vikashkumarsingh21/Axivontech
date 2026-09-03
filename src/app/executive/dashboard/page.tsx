"use client";

import { useEffect, useState } from "react";
import { Users, Activity, Briefcase, CheckSquare, Clock, Coffee, ShieldCheck, AlertCircle } from "lucide-react";

export default function ExecutiveDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/v1/executive/dashboard/summary")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load executive summary");
        return res.json();
      })
      .then((d) => {
        setData(d.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-amber-400/70 p-4">Loading Executive Dashboard...</div>;
  if (error) return <div className="text-red-400 p-4">{error}</div>;

  const kpis = data?.kpis || {};
  const scope = data?.scope || {};

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Executive Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">
            Real-time organizational health & delivery metrics ({scope.role} &middot; Profile: {scope.responsibilityProfile})
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111111] border border-amber-500/20 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-400 uppercase">Headcount</span>
            <Users className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{kpis.totalEmployees || 0}</div>
          <div className="text-xs text-gray-500 mt-1">{kpis.activeEmployees || 0} active employees</div>
        </div>

        <div className="bg-[#111111] border border-green-500/20 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-400 uppercase">Attendance Today</span>
            <Activity className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{kpis.presentToday || 0}</div>
          <div className="text-xs text-gray-500 mt-1">Employees checked in</div>
        </div>

        <div className="bg-[#111111] border border-purple-500/20 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-400 uppercase">Active Projects</span>
            <Briefcase className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{kpis.activeProjects || 0}</div>
          <div className="text-xs text-gray-500 mt-1">Projects underway</div>
        </div>

        <div className="bg-[#111111] border border-blue-500/20 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-400 uppercase">Open Tasks</span>
            <CheckSquare className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{kpis.openTasks || 0}</div>
          <div className="text-xs text-red-400 mt-1">{kpis.overdueTasks || 0} overdue</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              Governance & Approvals Queue
            </h2>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {kpis.pendingApprovals || 0} Pending
            </span>
          </div>
          <p className="text-sm text-gray-400">
            High-privilege role requests, sensitive exports, and setting exception changes requiring executive sign-off.
          </p>
        </div>

        <div className="bg-[#111111] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Coffee className="w-5 h-5 text-blue-400" />
              Operations Pipeline
            </h2>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {kpis.pendingLeave || 0} Leave Requests
            </span>
          </div>
          <p className="text-sm text-gray-400">
            Company-wide leave requests and daily work report submissions ready for executive review.
          </p>
        </div>
      </div>
    </div>
  );
}
