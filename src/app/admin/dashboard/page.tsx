"use client";

import { useEffect, useState } from "react";
import { Users, Briefcase, CheckSquare, Activity } from "lucide-react";

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/v1/admin/dashboard/summary")
      .then(res => {
        if (!res.ok) throw new Error("Failed to load dashboard data");
        return res.json();
      })
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-gray-400">Loading admin dashboard...</div>;
  if (error) return <div className="text-red-400">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Admin Dashboard</h1>
          <p className="text-gray-400 mt-1">Platform overview and operational KPIs.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#111111] border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-blue-400" />
            <h3 className="font-medium text-gray-300">Total Employees</h3>
          </div>
          <p className="text-3xl font-bold text-white">{data?.totalEmployees || 0}</p>
          <p className="text-sm text-gray-500 mt-1">{data?.activeEmployees || 0} active</p>
        </div>
        
        <div className="bg-[#111111] border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-5 h-5 text-green-400" />
            <h3 className="font-medium text-gray-300">Present Today</h3>
          </div>
          <p className="text-3xl font-bold text-white">{data?.presentToday || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Checked in</p>
        </div>
        
        <div className="bg-[#111111] border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <Briefcase className="w-5 h-5 text-purple-400" />
            <h3 className="font-medium text-gray-300">Projects</h3>
          </div>
          <p className="text-3xl font-bold text-white">{data?.totalProjects || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Active / Pending</p>
        </div>
        
        <div className="bg-[#111111] border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <CheckSquare className="w-5 h-5 text-orange-400" />
            <h3 className="font-medium text-gray-300">Open Tasks</h3>
          </div>
          <p className="text-3xl font-bold text-white">{data?.openTasks || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Across all projects</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-[#111111] border border-white/10 rounded-xl p-5">
           <h3 className="font-semibold text-white mb-4">Recent Activity</h3>
           <div className="text-sm text-gray-400">No recent activity found.</div>
        </div>
        <div className="bg-[#111111] border border-white/10 rounded-xl p-5">
           <h3 className="font-semibold text-white mb-4">Pending Approvals</h3>
           <div className="text-sm text-gray-400">No pending leave or reports.</div>
        </div>
      </div>
    </div>
  );
}
