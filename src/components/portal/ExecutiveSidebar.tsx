"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Building2, Users, Briefcase, 
  ShieldCheck, FileSpreadsheet, ShieldAlert, Settings, LogOut,
  Activity, TrendingUp, Clock, Award, FileText
} from "lucide-react";

export function ExecutiveSidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Executive Overview", href: "/executive/dashboard", icon: LayoutDashboard },
    { name: "Company Profile", href: "/executive/company", icon: Building2 },
    { name: "People Directory", href: "/executive/people", icon: Users },
    { name: "Projects & Delivery", href: "/executive/projects", icon: Briefcase },

    // Executive CRM Access
    { name: "CRM Overview", href: "/admin/crm/dashboard", icon: Activity, isCrm: true },
    { name: "Sales Pipeline", href: "/admin/crm/pipeline", icon: TrendingUp, isCrm: true },
    { name: "CRM Leads", href: "/admin/crm/leads", icon: Users, isCrm: true },
    { name: "Proposals", href: "/admin/crm/proposals", icon: FileText, isCrm: true },

    // Executive Governance
    { name: "Governance Approvals", href: "/executive/approvals", icon: ShieldCheck },
    { name: "Executive Reports", href: "/executive/reports", icon: FileSpreadsheet },
    { name: "Audit & Security", href: "/executive/audit", icon: ShieldAlert },
    { name: "Executive Settings", href: "/executive/settings", icon: Settings },
  ];

  return (
    <aside className="flex flex-col h-full bg-[#0d0d0d] border-r border-amber-500/10 w-64 flex-shrink-0">
      <div className="p-6 border-b border-white/10">
        <Link href="/executive/dashboard" className="block">
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
          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-widest">
            Executive Portal
          </span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/executive/dashboard" && pathname?.startsWith(item.href));

          return (
            <div key={item.name}>
              {index === 4 && (
                <div className="pt-3 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  Business & CRM
                </div>
              )}
              {index === 8 && (
                <div className="pt-3 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Governance & Compliance
                </div>
              )}
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-amber-500/10 text-amber-300 border border-amber-500/20 shadow-lg shadow-amber-500/10"
                    : "text-gray-400 hover:text-amber-200 hover:bg-white/5"
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? "text-amber-400" : "text-gray-500 group-hover:text-amber-400"
                  }`}
                />
                <span className="truncate">{item.name}</span>
              </Link>
            </div>
          );
        })}
      </nav>

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
