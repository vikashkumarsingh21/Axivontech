"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Filter,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  CheckSquare,
  FileText,
  Loader2,
  AlertTriangle,
  Plus,
  ShieldCheck,
} from "lucide-react";

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  designation: string | null;
  department: string | null;
  status: string;
  avatarUrl: string | null;
  joiningDate: string | null;
  _count: {
    tasks: number;
    workReports: number;
  };
}

export default function ManagerEmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [department, setDepartment] = useState<{ id: string; name: string; code: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    fetch("/api/v1/manager/employees")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load department employees.");
        return res.json();
      })
      .then((json) => {
        if (json.success) {
          setEmployees(json.employees || []);
          setDepartment(json.department || null);
        } else {
          setError(json.message || "Failed to retrieve employee roster.");
        }
      })
      .catch((err) => setError(err.message || "Network error loading team members."))
      .finally(() => setLoading(false));
  }, []);

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch =
        search.trim() === "" ||
        emp.name.toLowerCase().includes(search.toLowerCase()) ||
        emp.email.toLowerCase().includes(search.toLowerCase()) ||
        (emp.designation && emp.designation.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus =
        statusFilter === "ALL" || emp.status.toUpperCase() === statusFilter.toUpperCase();

      return matchesSearch && matchesStatus;
    });
  }, [employees, search, statusFilter]);

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center space-y-3 shadow-xs">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
        <h3 className="text-sm font-bold text-slate-900">Loading Department Team...</h3>
        <p className="text-xs text-slate-500">Retrieving personnel scoped strictly to your department.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-red-200 rounded-2xl p-10 text-center space-y-3 shadow-xs">
        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-900">Unable to Load Team Members</h3>
        <p className="text-xs text-slate-600 max-w-md mx-auto">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md bg-indigo-600 text-white font-mono font-bold text-xs">
              {department?.code || "DEPT"}
            </span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {department?.name || "Department"} Team Roster
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Team Members</h1>
          <p className="text-xs text-slate-600 mt-1">
            View active personnel, monitor assigned tasks, and review work activity in your department.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/manager/tasks"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Assign Task</span>
          </Link>
        </div>
      </div>

      {/* Security Scope Notice */}
      <div className="p-4 rounded-xl bg-slate-100/80 border border-slate-200 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 leading-relaxed">
          <strong className="text-slate-800">Department Scope Enforcement:</strong> You are authorized to manage team members assigned to <span className="font-semibold text-indigo-700">{department?.name}</span>. Employees belonging to other business divisions cannot be accessed or modified from this portal.
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, designation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="ALL">All Statuses ({employees.length})</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="ON_LEAVE">On Leave</option>
          </select>
        </div>
      </div>

      {/* Employee Grid */}
      {filteredEmployees.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-2">
          <Users className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No Team Members Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {search || statusFilter !== "ALL"
              ? "No team members matched your search criteria."
              : `No employees currently assigned to the ${department?.name || ""} department.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((emp) => (
            <div
              key={emp.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-indigo-200 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold text-sm flex items-center justify-center shrink-0">
                      {emp.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-snug">{emp.name}</h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {emp.designation || "Department Specialist"}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      emp.status === "ACTIVE"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : emp.status === "ON_LEAVE"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}
                  >
                    {emp.status}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{emp.email}</span>
                  </div>
                  {emp.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{emp.phone}</span>
                    </div>
                  )}
                  {emp.joiningDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Joined {new Date(emp.joiningDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Workload Metric Pills & Quick Actions */}
              <div className="border-t border-slate-100 pt-3">
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-center">
                    <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 font-medium mb-0.5">
                      <CheckSquare className="w-3 h-3 text-indigo-500" />
                      <span>Tasks</span>
                    </div>
                    <span className="text-xs font-bold text-slate-800">{emp._count.tasks}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-center">
                    <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 font-medium mb-0.5">
                      <FileText className="w-3 h-3 text-emerald-500" />
                      <span>Reports</span>
                    </div>
                    <span className="text-xs font-bold text-slate-800">{emp._count.workReports}</span>
                  </div>
                </div>

                <Link
                  href={`/manager/tasks?assignTo=${emp.id}`}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-xs font-semibold transition-colors border border-slate-200 hover:border-indigo-200"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Assign Direct Task</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

