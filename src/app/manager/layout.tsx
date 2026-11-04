"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  FileText,
  CalendarCheck,
  Coffee,
  Building2,
  LogOut,
  Bell,
  Menu,
  X,
  ShieldCheck,
  ChevronRight,
  User,
} from "lucide-react";
import { MobileShell } from "@/components/mobile/MobileShell";
import { useAppMode } from "@/features/app-mode/useAppMode";

interface ManagerLayoutProps {
  children: React.ReactNode;
}

export default function ManagerLayout({ children }: ManagerLayoutProps) {
  const pathname = usePathname();
  const { isAppMode } = useAppMode();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [managerData, setManagerData] = useState<{
    managerName: string;
    departmentName: string;
    departmentCode: string;
    role: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/v1/manager/dashboard")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setManagerData({
            managerName: `${json.data.department?.name || "Department"} Manager`,
            departmentName: json.data.department?.name || "Operations",
            departmentCode: json.data.department?.code || "DEPT",
            role: "DEPARTMENT_MANAGER",
          });
        }
      })
      .catch(() => {});
  }, []);

  const navItems = [
    { name: "Department Overview", href: "/manager/dashboard", icon: LayoutDashboard },
    { name: "Team Members", href: "/manager/employees", icon: Users },
    { name: "Tasks & Workload", href: "/manager/tasks", icon: CheckSquare },
    { name: "Work Reports", href: "/manager/work-reports", icon: FileText },
    { name: "Attendance", href: "/manager/attendance", icon: CalendarCheck },
    { name: "Leave Requests", href: "/manager/leave", icon: Coffee },
  ];

  // Dedicated App-Mode Mobile Shell
  if (isAppMode) {
    return (
      <div className="min-h-screen bg-[#121212] text-[#EDEBE6]">
        <MobileShell
          role="DEPARTMENT_MANAGER"
          userName={managerData?.managerName || "Department Manager"}
          userEmail={managerData?.departmentName ? `${managerData.departmentName} Department` : ""}
        >
          {children}
        </MobileShell>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans antialiased overflow-hidden">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0 shadow-xl" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Brand Header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200">
            <Link href="/manager/dashboard" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-600/20">
                A
              </div>
              <div>
                <span className="font-bold text-slate-900 tracking-tight text-sm block leading-tight">
                  Axivon ONE
                </span>
                <span className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">
                  Management Portal
                </span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              aria-label="Close navigation sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Department Indicator Badge */}
          <div className="p-4 mx-4 my-3 rounded-xl bg-indigo-50/70 border border-indigo-100/80">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-[10px] font-bold text-indigo-900 tracking-wider uppercase">
                Assigned Department
              </span>
            </div>
            <p className="text-xs font-semibold text-indigo-950 truncate">
              {managerData?.departmentName || "Loading Department..."}
            </p>
            {managerData?.departmentCode && (
              <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-medium bg-indigo-200/60 text-indigo-800">
                Code: {managerData.departmentCode}
              </span>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const active = pathname === item.href || (item.href !== "/manager/dashboard" && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${active ? "text-white" : "text-slate-400"}`} />
                    <span>{item.name}</span>
                  </div>
                  {active && <ChevronRight className="w-3.5 h-3.5 text-white/70" />}
                </Link>
              );
            })}
          </nav>

          {/* Footer User & Logout */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <form action="/api/v1/auth/logout" method="POST">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-colors"
              >
                <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-500" />
                <span>Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Body */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Open navigation sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-slate-900">
                {managerData?.departmentName ? `${managerData.departmentName} Department` : "Department Operations"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Manager Authorization Active</span>
            </span>

            <div className="h-5 w-px bg-slate-200" />

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-xs font-bold text-indigo-700">
                M
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-xs font-bold text-slate-900 block leading-tight">
                  {managerData?.departmentName ? `${managerData.departmentName} Lead` : "Manager"}
                </span>
                <span className="text-[10px] text-slate-500 block">Department Manager</span>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
