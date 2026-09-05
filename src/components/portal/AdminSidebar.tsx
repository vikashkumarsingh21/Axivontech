"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Users, CalendarCheck, Briefcase, 
  CheckSquare, FileText, Coffee, Bell, Megaphone, 
  FolderOpen, Activity, Settings, LogOut, DollarSign,
  TrendingUp, Award, Clock
} from "lucide-react";

export function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
    
    // CRM Section
    { name: "CRM Dashboard", href: "/admin/crm/dashboard", icon: Activity, isCrm: true },
    { name: "Lead Inbox", href: "/admin/crm/leads", icon: Users, isCrm: true },
    { name: "Sales Pipeline", href: "/admin/crm/pipeline", icon: TrendingUp, isCrm: true },
    { name: "CRM Follow-ups", href: "/admin/crm/follow-ups", icon: Clock, isCrm: true },
    { name: "CRM Clients", href: "/admin/crm/clients", icon: Award, isCrm: true },
    { name: "Proposals", href: "/admin/crm/proposals", icon: FileText, isCrm: true },

    // HR & Operations Section
    { name: "Employees", href: "/admin/employees", icon: Users },
    { name: "Attendance", href: "/admin/attendance", icon: CalendarCheck },
    { name: "Projects", href: "/admin/projects", icon: Briefcase },
    { name: "Tasks", href: "/admin/tasks", icon: CheckSquare },
    { name: "Work Reports", href: "/admin/work-reports", icon: FileText },
    { name: "Leave", href: "/admin/leave", icon: Coffee },
    { name: "Notifications", href: "/admin/notifications", icon: Bell },
    { name: "Announcements", href: "/admin/announcements", icon: Megaphone },
    { name: "Documents", href: "/admin/documents", icon: FolderOpen },
    { name: "Activity Logs", href: "/admin/activity", icon: Activity },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <aside className="flex flex-col h-full bg-[#0d0d0d] border-r border-white/10 w-64 flex-shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-white/10">
        <Link href="/admin/dashboard" className="block">
          <Image
            src="/assets/logo/logo-full.png"
            alt="Axivon Technologies"
            width={150}
            height={36}
            className="h-8 w-auto brightness-0 invert"
            priority
          />
        </Link>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[10px] font-bold text-red-500 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full uppercase tracking-widest">
            Admin & CRM
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname?.startsWith(item.href));

          // Divider before HR & Operations section
          const isFirstHr = index === 7;

          return (
            <div key={item.name}>
              {isFirstHr && (
                <div className="pt-4 pb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Operations & Workforce
                </div>
              )}
              {index === 1 && (
                <div className="pt-2 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-red-400">
                  CRM & Business Growth
                </div>
              )}
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? item.isCrm
                      ? "bg-gradient-to-r from-red-600/30 to-amber-600/20 text-white border border-red-500/30 shadow-lg shadow-red-600/10"
                      : "bg-white/10 text-white border border-white/10"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? "text-red-400" : "text-gray-500 group-hover:text-gray-300"
                  }`}
                />
                <span className="truncate">{item.name}</span>
              </Link>
            </div>
          );
        })}
      </nav>

      {/* Footer Logout */}
      <div className="p-4 border-t border-white/10 bg-[#0a0a0a]">
        <form action="/api/v1/auth/logout" method="POST">
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
