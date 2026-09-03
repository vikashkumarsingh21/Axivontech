const fs = require('fs');
const path = require('path');

const baseDir = 'c:/Users/vk010/Downloads/startup/axivon-technologies/axivon-technologies';
function writeFile(relPath, content) {
  const fp = path.join(baseDir, relPath);
  fs.mkdirSync(path.dirname(fp), { recursive: true });
  fs.writeFileSync(fp, content.trim() + '\n');
  console.log('Created: ' + relPath);
}

// ============================================================
// 1. EXECUTIVE SIDEBAR
// ============================================================
writeFile('src/components/portal/ExecutiveSidebar.tsx', `
"use client";

import Link from "next/link";
import Image from "next/image";
import { 
  LayoutDashboard, Building2, Users, Briefcase, CheckSquare, 
  CalendarCheck, FileText, Coffee, ShieldCheck, FileSpreadsheet, 
  ShieldAlert, Settings, LogOut
} from "lucide-react";

export function ExecutiveSidebar() {
  const navItems = [
    { name: "Executive Dashboard", href: "/executive/dashboard", icon: LayoutDashboard },
    { name: "Company Overview", href: "/executive/company", icon: Building2 },
    { name: "People Directory", href: "/executive/people", icon: Users },
    { name: "Projects & Delivery", href: "/executive/projects", icon: Briefcase },
    { name: "Governance Approvals", href: "/executive/approvals", icon: ShieldCheck },
    { name: "Executive Reports", href: "/executive/reports", icon: FileSpreadsheet },
    { name: "Audit & Security", href: "/executive/audit", icon: ShieldAlert },
    { name: "Executive Settings", href: "/executive/settings", icon: Settings },
  ];

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] border-r border-amber-500/10 w-64 pt-6">
      <div className="px-6 pb-6 border-b border-white/5">
        <Image src="/assets/logo/logo-full.png" alt="Axivon Technologies" width={160} height={40} className="h-8 w-auto brightness-0 invert" priority />
        <div className="mt-2 flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase tracking-widest">
            Executive Portal
          </span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-amber-200 hover:bg-amber-500/5 transition-colors group"
            >
              <Icon className="w-5 h-5 text-gray-500 group-hover:text-amber-400 transition-colors" />
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <form action="/api/v1/auth/logout" method="POST">
          <button 
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </form>
      </div>
    </div>
  );
}
`);

// ============================================================
// 2. EXECUTIVE LAYOUT & ROOT REDIRECT
// ============================================================
writeFile('src/app/executive/layout.tsx', `
import { ExecutiveSidebar } from "@/components/portal/ExecutiveSidebar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Executive Portal | Axivon Technologies",
};

export default function ExecutiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[#050505] text-white">
      <ExecutiveSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-amber-500/10 bg-[#0a0a0a] flex items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold text-amber-400/90 tracking-wide uppercase">
              Founder & Executive Command Center
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-sm shadow-inner">
              E
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
`);

writeFile('src/app/executive/page.tsx', `
import { redirect } from "next/navigation";

export default function ExecutiveRootPage() {
  redirect("/executive/dashboard");
}
`);

// ============================================================
// 3. EXECUTIVE DASHBOARD SUMMARY API & PAGE
// ============================================================
writeFile('src/app/api/v1/executive/dashboard/summary/route.ts', `
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getExecutiveScope, isDepartmentAllowed } from "@/lib/auth/executive-scope";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api-error";

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "executive.dashboard.view");
    const scope = await getExecutiveScope(userId);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const employeeWhere: any = {
      userRoles: { none: { role: { name: { in: ["FOUNDER", "CO_FOUNDER"] } } } },
    };

    if (scope.allowedDepartments) {
      employeeWhere.department = { in: scope.allowedDepartments };
    }

    const [
      totalEmployees,
      activeEmployees,
      presentToday,
      activeProjects,
      openTasks,
      overdueTasks,
      pendingLeave,
      pendingApprovals,
    ] = await Promise.all([
      db.user.count({ where: employeeWhere }),
      db.user.count({ where: { ...employeeWhere, status: "ACTIVE" } }),
      db.attendance.count({
        where: {
          date: { gte: today },
          user: employeeWhere,
        },
      }),
      db.project.count({ where: { status: "ACTIVE" } }),
      db.task.count({ where: { status: { notIn: ["COMPLETED"] } } }),
      db.task.count({
        where: {
          status: { notIn: ["COMPLETED"] },
          dueDate: { lt: new Date() },
        },
      }),
      db.leaveRequest.count({ where: { status: "PENDING" } }),
      db.approvalRequest.count({ where: { status: "PENDING" } }),
    ]);

    return NextResponse.json({
      data: {
        scope: {
          role: scope.role,
          responsibilityProfile: scope.responsibilityProfile,
          allowedDepartments: scope.allowedDepartments,
        },
        kpis: {
          totalEmployees,
          activeEmployees,
          presentToday,
          activeProjects,
          openTasks,
          overdueTasks,
          pendingLeave,
          pendingApprovals,
        },
      },
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
`);

writeFile('src/app/executive/dashboard/page.tsx', `
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
`);

// ============================================================
// 4. COMPANY OVERVIEW API & PAGE
// ============================================================
writeFile('src/app/api/v1/executive/company/overview/route.ts', `
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { getExecutiveScope } from "@/lib/auth/executive-scope";
import { handleApiError } from "@/lib/api-error";

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "executive.company.view");
    const scope = await getExecutiveScope(userId);

    const employeeWhere: any = {
      userRoles: { none: { role: { name: { in: ["FOUNDER", "CO_FOUNDER"] } } } },
    };

    if (scope.allowedDepartments) {
      employeeWhere.department = { in: scope.allowedDepartments };
    }

    const employees = await db.user.findMany({
      where: employeeWhere,
      select: { department: true, designation: true, status: true },
    });

    const departmentCounts: Record<string, number> = {};
    const statusCounts: Record<string, number> = { ACTIVE: 0, INACTIVE: 0 };

    for (const emp of employees) {
      const dept = emp.department || "Unassigned";
      departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
      const st = emp.status || "ACTIVE";
      statusCounts[st] = (statusCounts[st] || 0) + 1;
    }

    return NextResponse.json({
      data: {
        total: employees.length,
        statusCounts,
        departmentBreakdown: Object.entries(departmentCounts).map(([department, count]) => ({
          department,
          count,
        })),
      },
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
`);

writeFile('src/app/executive/company/page.tsx', `
"use client";

import { useEffect, useState } from "react";
import { Building2, Users } from "lucide-react";

export default function CompanyOverviewPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/executive/company/overview")
      .then((r) => r.json())
      .then((d) => {
        setData(d.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white tracking-tight">Company Overview</h1>
      <p className="text-gray-400 text-sm">Department headcount & organizational structure.</p>

      {loading ? (
        <div className="text-gray-500">Loading company overview...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Department Headcount</h2>
            <div className="space-y-3">
              {data?.departmentBreakdown?.map((item: any) => (
                <div key={item.department} className="flex justify-between items-center bg-[#1a1a1a] p-3 rounded-xl">
                  <span className="text-sm font-medium text-white">{item.department}</span>
                  <span className="text-sm font-bold text-amber-400">{item.count} employees</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#111111] border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Account Status Distribution</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-[#1a1a1a] p-3 rounded-xl">
                <span className="text-sm font-medium text-green-400">Active Accounts</span>
                <span className="text-sm font-bold text-white">{data?.statusCounts?.ACTIVE || 0}</span>
              </div>
              <div className="flex justify-between items-center bg-[#1a1a1a] p-3 rounded-xl">
                <span className="text-sm font-medium text-gray-400">Inactive Accounts</span>
                <span className="text-sm font-bold text-white">{data?.statusCounts?.INACTIVE || 0}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`);

// ============================================================
// 5. PEOPLE DIRECTORY API & PAGE
// ============================================================
writeFile('src/app/api/v1/executive/people/route.ts', `
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission, hasPermission } from "@/lib/auth/permissions";
import { getExecutiveScope } from "@/lib/auth/executive-scope";
import { handleApiError } from "@/lib/api-error";

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "people.view");
    const scope = await getExecutiveScope(userId);
    const canViewSensitive = userId ? await hasPermission(userId, "people.sensitive.view") : false;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = 10;
    const skip = (page - 1) * limit;

    const where: any = {
      userRoles: { none: { role: { name: { in: ["FOUNDER", "CO_FOUNDER"] } } } },
    };

    if (scope.allowedDepartments) {
      where.department = { in: scope.allowedDepartments };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { department: { contains: search, mode: "insensitive" } },
      ];
    }

    const [people, total] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          employeeId: true,
          department: true,
          designation: true,
          status: true,
          joiningDate: true,
          phone: canViewSensitive,
          address: canViewSensitive,
          emergencyContact: canViewSensitive,
          userRoles: { select: { role: { select: { name: true } } } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      db.user.count({ where }),
    ]);

    return NextResponse.json({
      data: people,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
`);

writeFile('src/app/executive/people/page.tsx', `
"use client";

import { useEffect, useState } from "react";
import { Search, Users } from "lucide-react";

export default function ExecutivePeoplePage() {
  const [people, setPeople] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/v1/executive/people?search=" + encodeURIComponent(search))
      .then((r) => r.json())
      .then((d) => {
        setPeople(d.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [search]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white tracking-tight">Executive People Directory</h1>
      <p className="text-gray-400 text-sm">Company-wide workforce directory with scope enforcement.</p>

      <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search directory..."
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
            />
          </div>
        </div>

        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-[#18181b] text-gray-300 text-xs uppercase font-semibold border-b border-white/10">
            <tr>
              <th className="px-5 py-3.5">Name</th>
              <th className="px-5 py-3.5">Department</th>
              <th className="px-5 py-3.5">Designation</th>
              <th className="px-5 py-3.5">Role</th>
              <th className="px-5 py-3.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td colSpan={5} className="p-6 text-center">Loading directory...</td></tr>
            ) : people.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center">No people found.</td></tr>
            ) : (
              people.map((p) => (
                <tr key={p.id} className="hover:bg-white/[0.02]">
                  <td className="px-5 py-4 font-medium text-white">{p.name}<div className="text-xs text-gray-500">{p.email}</div></td>
                  <td className="px-5 py-4">{p.department || "-"}</td>
                  <td className="px-5 py-4">{p.designation || "-"}</td>
                  <td className="px-5 py-4 text-xs">{p.userRoles?.map((ur: any) => ur.role.name).join(", ")}</td>
                  <td className="px-5 py-4">
                    <span className={\`px-2.5 py-1 rounded-full text-xs \${p.status === "ACTIVE" ? "bg-green-500/10 text-green-400" : "bg-gray-500/10 text-gray-400"}\`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
`);

// ============================================================
// 6. PROJECTS & OVERSIGHT API & PAGE
// ============================================================
writeFile('src/app/api/v1/executive/projects/route.ts', `
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api-error";

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "projects.company.view");

    const projects = await db.project.findMany({
      include: {
        members: { include: { user: { select: { name: true, email: true } } } },
        tasks: { select: { id: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = projects.map((p) => {
      const totalTasks = p.tasks.length;
      const completedTasks = p.tasks.filter((t) => t.status === "COMPLETED").length;
      const blockedTasks = p.tasks.filter((t) => t.status === "BLOCKED").length;

      let health = "Healthy";
      if (blockedTasks > 0) health = "Blocked";
      else if (p.status === "ON_HOLD") health = "Needs Attention";

      return {
        id: p.id,
        name: p.name,
        description: p.description,
        status: p.status,
        health,
        memberCount: p.members.length,
        taskProgress: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      };
    });

    return NextResponse.json({ data: formatted });
  } catch (error: any) {
    return handleApiError(error);
  }
}
`);

writeFile('src/app/executive/projects/page.tsx', `
"use client";

import { useEffect, useState } from "react";
import { Briefcase } from "lucide-react";

export default function ExecutiveProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/executive/projects")
      .then((r) => r.json())
      .then((d) => {
        setProjects(d.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white tracking-tight">Project Portfolio Oversight</h1>
      <p className="text-gray-400 text-sm">Strategic health calculation & delivery monitoring.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="text-gray-500 col-span-full">Loading project portfolio...</div>
        ) : projects.length === 0 ? (
          <div className="text-gray-500 col-span-full">No active projects found.</div>
        ) : (
          projects.map((p) => (
            <div key={p.id} className="bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-white text-lg">{p.name}</h3>
                <span className={\`px-2.5 py-1 rounded-full text-xs font-semibold \${p.health === "Healthy" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}\`}>
                  {p.health}
                </span>
              </div>
              <p className="text-gray-400 text-sm line-clamp-2">{p.description || "No description provided."}</p>
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Task Completion</span>
                  <span>{p.taskProgress}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <div className="bg-amber-400 h-2 rounded-full" style={{ width: \`\${p.taskProgress}%\` }} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
`);

// ============================================================
// 7. GOVERNANCE APPROVALS API & PAGE
// ============================================================
writeFile('src/app/api/v1/executive/approvals/route.ts', `
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api-error";

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "governance.role_changes.approve").catch(() => {});

    const approvals = await db.approvalRequest.findMany({
      include: {
        requestedBy: { select: { name: true, email: true } },
        decidedBy: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: approvals });
  } catch (error: any) {
    return handleApiError(error);
  }
}
`);

writeFile('src/app/api/v1/executive/approvals/[id]/approve/route.ts', `
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { ApiError, handleApiError } from "@/lib/api-error";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const adminId = req.headers.get("x-user-id");
    await requirePermission(adminId, "governance.role_changes.approve");

    const approval = await db.approvalRequest.findUnique({ where: { id } });
    if (!approval) throw new ApiError(404, "Approval request not found");
    if (approval.status !== "PENDING") throw new ApiError(400, "Request already processed");

    // Self-approval prevention
    if (approval.requestedById === adminId) {
      throw new ApiError(403, "Forbidden: Self-approval is strictly prohibited by security policy.");
    }

    const updated = await db.approvalRequest.update({
      where: { id },
      data: {
        status: "APPROVED",
        decidedById: adminId,
        decidedAt: new Date(),
      },
    });

    await db.securityEvent.create({
      data: {
        userId: adminId,
        eventType: "ROLE_CHANGED",
        details: { approvalId: id, requestType: approval.requestType, decision: "APPROVED" },
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error: any) {
    return handleApiError(error);
  }
}
`);

writeFile('src/app/api/v1/executive/approvals/[id]/reject/route.ts', `
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { ApiError, handleApiError } from "@/lib/api-error";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const adminId = req.headers.get("x-user-id");
    await requirePermission(adminId, "governance.role_changes.approve");

    const body = await req.json();
    if (!body.reason) throw new ApiError(400, "Rejection reason is required");

    const approval = await db.approvalRequest.findUnique({ where: { id } });
    if (!approval) throw new ApiError(404, "Approval request not found");
    if (approval.status !== "PENDING") throw new ApiError(400, "Request already processed");

    const updated = await db.approvalRequest.update({
      where: { id },
      data: {
        status: "REJECTED",
        reason: body.reason,
        decidedById: adminId,
        decidedAt: new Date(),
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error: any) {
    return handleApiError(error);
  }
}
`);

writeFile('src/app/executive/approvals/page.tsx', `
"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Check, X } from "lucide-react";

export default function GovernanceApprovalsPage() {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetch("/api/v1/executive/approvals")
      .then((r) => r.json())
      .then((d) => {
        setApprovals(d.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAction = async (id: string, action: "approve" | "reject") => {
    await fetch("/api/v1/executive/approvals/" + id + "/" + action, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: action === "reject" ? JSON.stringify({ reason: "Rejected by executive review" }) : undefined,
    });
    load();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white tracking-tight">Governance & Approvals Engine</h1>
      <p className="text-gray-400 text-sm">Privileged access sign-off and approval queue.</p>

      <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-[#18181b] text-gray-300 text-xs uppercase font-semibold border-b border-white/10">
            <tr>
              <th className="px-5 py-3.5">Request Type</th>
              <th className="px-5 py-3.5">Requester</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5">Decided By</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td colSpan={5} className="p-6 text-center">Loading approvals...</td></tr>
            ) : approvals.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center">No governance requests found.</td></tr>
            ) : (
              approvals.map((a) => (
                <tr key={a.id} className="hover:bg-white/[0.02]">
                  <td className="px-5 py-4 font-mono text-xs text-amber-400">{a.requestType}</td>
                  <td className="px-5 py-4 text-white">{a.requestedBy?.name || "System"}</td>
                  <td className="px-5 py-4">
                    <span className={\`px-2.5 py-1 rounded-full text-xs font-semibold \${a.status === "APPROVED" ? "bg-green-500/10 text-green-400" : a.status === "REJECTED" ? "bg-red-500/10 text-red-400" : "bg-yellow-500/10 text-yellow-400"}\`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">{a.decidedBy?.name || "-"}</td>
                  <td className="px-5 py-4 text-right">
                    {a.status === "PENDING" && (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleAction(a.id, "approve")} className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors">Approve</button>
                        <button onClick={() => handleAction(a.id, "reject")} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-colors">Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
`);

// ============================================================
// 8. REPORTS & EXPORTS API & PAGE
// ============================================================
writeFile('src/app/api/v1/executive/reports/route.ts', `
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api-error";

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "reports.executive.view");

    const [totalEmployees, activeProjects, openTasks, completedTasks] = await Promise.all([
      db.user.count(),
      db.project.count({ where: { status: "ACTIVE" } }),
      db.task.count({ where: { status: { notIn: ["COMPLETED"] } } }),
      db.task.count({ where: { status: "COMPLETED" } }),
    ]);

    return NextResponse.json({
      data: {
        summary: { totalEmployees, activeProjects, openTasks, completedTasks },
      },
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
`);

writeFile('src/app/api/v1/executive/reports/[id]/export/route.ts', `
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api-error";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "reports.executive.export");

    await db.auditLog.create({
      data: {
        userId,
        action: "SENSITIVE_REPORT_EXPORTED",
        resource: "Report",
        details: { reportType: id, timestamp: new Date() },
      },
    });

    await db.securityEvent.create({
      data: {
        userId,
        eventType: "SENSITIVE_EXPORT",
        details: { reportType: id },
      },
    });

    return NextResponse.json({ success: true, downloadUrl: "/api/v1/executive/reports" });
  } catch (error: any) {
    return handleApiError(error);
  }
}
`);

writeFile('src/app/executive/reports/page.tsx', `
"use client";

import { useEffect, useState } from "react";
import { FileSpreadsheet, Download } from "lucide-react";

export default function ExecutiveReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/executive/reports")
      .then((r) => r.json())
      .then((d) => {
        setData(d.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleExport = async (reportType: string) => {
    await fetch("/api/v1/executive/reports/" + reportType + "/export", { method: "POST" });
    alert("Report export audit logged!");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white tracking-tight">Executive Analytics & Reports</h1>
      <p className="text-gray-400 text-sm">Audited executive report datasets.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {["Headcount & Workforce", "Project Delivery Matrix", "Attendance & Work Hours"].map((r) => (
          <div key={r} className="bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-white text-lg">{r}</h3>
            <p className="text-sm text-gray-400">Export audited executive operational dataset.</p>
            <button onClick={() => handleExport(r.toLowerCase().replace(/\\s+/g, "_"))}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold transition-colors">
              <Download className="w-4 h-4" /> Export Report
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
`);

// ============================================================
// 9. AUDIT & SECURITY CENTER API & PAGE
// ============================================================
writeFile('src/app/api/v1/executive/audit/route.ts', `
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api-error";

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "governance.audit.view");

    const logs = await db.auditLog.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ data: logs });
  } catch (error: any) {
    return handleApiError(error);
  }
}
`);

writeFile('src/app/api/v1/executive/security-events/route.ts', `
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api-error";

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "governance.security.view");

    const events = await db.securityEvent.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ data: events });
  } catch (error: any) {
    return handleApiError(error);
  }
}
`);

writeFile('src/app/executive/audit/page.tsx', `
"use client";

import { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";

export default function ExecutiveAuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/v1/executive/audit").then((r) => r.json()),
      fetch("/api/v1/executive/security-events").then((r) => r.json()),
    ]).then(([lData, eData]) => {
      setLogs(lData.data || []);
      setEvents(eData.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white tracking-tight">Governance Audit & Security Center</h1>
      <p className="text-gray-400 text-sm">Audit log and privileged security event monitoring.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">Privileged Security Events</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {events.length === 0 ? <p className="text-gray-500 text-sm">No security events logged.</p> : (
              events.map((e) => (
                <div key={e.id} className="p-3 bg-[#1a1a1a] rounded-xl text-xs flex justify-between">
                  <span className="font-mono text-amber-400">{e.eventType}</span>
                  <span className="text-gray-400">{new Date(e.createdAt).toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">Audit Log</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {logs.length === 0 ? <p className="text-gray-500 text-sm">No audit logs.</p> : (
              logs.map((l) => (
                <div key={l.id} className="p-3 bg-[#1a1a1a] rounded-xl text-xs flex justify-between">
                  <div>
                    <span className="font-semibold text-white">{l.user?.name || "System"}</span>
                    <span className="ml-2 font-mono text-gray-400">{l.action}</span>
                  </div>
                  <span className="text-gray-500">{new Date(l.createdAt).toLocaleTimeString()}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
`);

// ============================================================
// 10. EXECUTIVE SETTINGS API & PAGE
// ============================================================
writeFile('src/app/api/v1/executive/settings/route.ts', `
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api-error";

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "governance.settings.approve");

    const settings = await db.organizationSetting.findMany();
    return NextResponse.json({ data: settings });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function PATCH(req: Request) {
  try {
    const userId = req.headers.get("x-user-id");
    await requirePermission(userId, "governance.settings.approve");

    const body = await req.json();
    const { key, value } = body;

    const setting = await db.organizationSetting.upsert({
      where: { key },
      update: { value, updatedById: userId },
      create: { key, value, updatedById: userId },
    });

    await db.auditLog.create({
      data: { userId, action: "ORGANIZATION_SETTING_UPDATED", resource: "OrganizationSetting", details: { key } },
    });

    return NextResponse.json({ data: setting });
  } catch (error: any) {
    return handleApiError(error);
  }
}
`);

writeFile('src/app/executive/settings/page.tsx', `
"use client";

import { useEffect, useState } from "react";
import { Settings } from "lucide-react";

export default function ExecutiveSettingsPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/executive/settings")
      .then((r) => r.json())
      .then((d) => {
        setSettings(d.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white tracking-tight">Executive Settings</h1>
      <p className="text-gray-400 text-sm">Company policies, organizational defaults, and security configuration.</p>

      <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-white">Company Policy Settings</h2>
        {loading ? <p className="text-gray-500 text-sm">Loading settings...</p> : (
          <div className="space-y-3">
            <div className="p-4 bg-[#1a1a1a] rounded-xl flex justify-between items-center text-sm">
              <span className="text-white font-medium">Default Attendance Policy</span>
              <span className="text-amber-400 font-mono text-xs">Standard (09:00 - 18:00 IST)</span>
            </div>
            <div className="p-4 bg-[#1a1a1a] rounded-xl flex justify-between items-center text-sm">
              <span className="text-white font-medium">Privileged Session Timeout</span>
              <span className="text-amber-400 font-mono text-xs">30 Minutes</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
`);

console.log("\nAll Phase 4 Executive Portal modules scaffolded successfully.");
