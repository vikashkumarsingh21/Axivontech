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
