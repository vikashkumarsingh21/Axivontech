"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  CheckSquare,
  CalendarCheck,
  Coffee,
  FileText,
  AlertTriangle,
  Clock,
  ArrowRight,
  Plus,
  Loader2,
  Building2,
  ShieldCheck,
  Megaphone,
} from "lucide-react";

export default function ManagerDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/v1/manager/dashboard")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load department dashboard data.");
        return res.json();
      })
      .then((json) => {
        if (json.success) {
          setData(json.data);
        } else {
          setError(json.message || "Failed to load department dashboard.");
        }
      })
      .catch((err) => setError(err.message || "Network error loading dashboard."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center space-y-3 shadow-xs">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
        <h3 className="text-sm font-bold text-slate-900">Loading Department Dashboard...</h3>
        <p className="text-xs text-slate-500">Resolving authorized department records and live operational metrics.</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white border border-red-200 rounded-2xl p-10 text-center space-y-3 shadow-xs">
        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-900">Department Access Restricted</h3>
        <p className="text-xs text-slate-600 max-w-md mx-auto">
          {error || "You are not assigned as an active manager for any department."}
        </p>
      </div>
    );
  }

  const { department, metrics, employees, tasks, pendingLeaves, recentWorkReports, announcements } = data;

  return (
    <div className="space-y-6">
      {/* Department Hero Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-md bg-indigo-600 text-white font-mono font-bold text-xs">
              {department.code}
            </span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Department Operations Center
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {department.name} Department
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            {department.description || "Manage personnel, assign tasks, review work reports, and oversee attendance."}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/manager/tasks"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Assign Task</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Team Members */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold">Team Members</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{metrics.totalEmployees}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            {metrics.activeEmployees} active in department
          </div>
        </div>

        {/* Attendance Today */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold">Attendance Today</span>
            <CalendarCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700">{metrics.presentToday}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Checked in today
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold">Open Tasks</span>
            <CheckSquare className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{metrics.pendingTasks}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            {metrics.completedTasks} completed
          </div>
        </div>

        {/* Pending Leaves */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold">Leave Requests</span>
            <Coffee className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700">{metrics.pendingLeavesCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Awaiting manager action
          </div>
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Team & Tasks (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Department Tasks Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-indigo-600" />
                  Active Department Tasks
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Assigned workload across department staff</p>
              </div>
              <Link
                href="/manager/tasks"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {tasks.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                <CheckSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <span>No tasks currently assigned to {department.name} staff.</span>
              </div>
            ) : (
              <div className="space-y-2">
                {tasks.slice(0, 5).map((task: any) => (
                  <div
                    key={task.id}
                    className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-900 block">{task.title}</span>
                      <span className="text-[11px] text-slate-500">
                        Assigned to: <strong className="text-slate-700">{task.user?.name}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          task.priority === "URGENT"
                            ? "bg-red-100 text-red-700"
                            : task.priority === "HIGH"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {task.priority}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          task.status === "COMPLETED"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Department Staff Roster Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  Department Staff Roster
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Personnel assigned to {department.name}</p>
              </div>
              <Link
                href="/manager/employees"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <span>View Full Team</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {employees.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <span>No employees currently assigned to this department.</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {employees.slice(0, 6).map((emp: any) => (
                  <div
                    key={emp.id}
                    className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center gap-3 text-xs"
                  >
                    <div className="w-9 h-9 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center font-bold text-indigo-700 shrink-0">
                      {emp.name.charAt(0)}
                    </div>
                    <div className="truncate">
                      <span className="font-bold text-slate-900 block truncate">{emp.name}</span>
                      <span className="text-[11px] text-slate-500 block truncate">{emp.designation || "Staff"}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Leaves, Reports & Announcements (1 Col) */}
        <div className="space-y-6">
          {/* Pending Leave Requests */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Coffee className="w-4 h-4 text-amber-600" />
                Pending Leaves ({pendingLeaves.length})
              </h3>
              <Link href="/manager/leave" className="text-xs text-indigo-600 font-semibold">
                Review
              </Link>
            </div>

            {pendingLeaves.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No pending leave requests.</p>
            ) : (
              <div className="space-y-2">
                {pendingLeaves.slice(0, 3).map((leave: any) => (
                  <div key={leave.id} className="p-3 rounded-xl bg-amber-50/60 border border-amber-100 text-xs">
                    <span className="font-semibold text-slate-900 block">{leave.user?.name}</span>
                    <span className="text-[11px] text-slate-600 block mt-0.5">{leave.reason || "Personal Leave"}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Department Announcements */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Megaphone className="w-4 h-4 text-indigo-600" />
                Announcements
              </h3>
            </div>

            {announcements.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No active announcements.</p>
            ) : (
              <div className="space-y-2">
                {announcements.map((ann: any) => (
                  <div key={ann.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <span className="font-semibold text-slate-900 block">{ann.title}</span>
                    <span className="text-[11px] text-slate-600 block mt-1 line-clamp-2">{ann.content}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

