"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Building2, Users, Briefcase, 
  ShieldCheck, FileSpreadsheet, ShieldAlert, Settings, LogOut,
  Activity, TrendingUp, Clock, Award, FileText, Crown, X
} from "lucide-react";

export interface ExecutiveSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface SidebarInnerProps {
  pathname: string;
  onClose?: () => void;
}

function SidebarInner({ pathname, onClose }: SidebarInnerProps) {
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
    <div className="flex flex-col h-full bg-[#0E1116] border-r border-[#1E2530] w-64 select-none shadow-xs pt-5">
      {/* Brand Header */}
      <div className="px-5 pb-5 border-b border-[#1E2530] flex items-center justify-between">
        <div>
          <Link href="/executive/dashboard" className="block transition-opacity hover:opacity-90">
            <Image
              src="/assets/logo/logo-full.png"
              alt="Axivon Technologies"
              width={140}
              height={36}
              className="h-7 w-auto brightness-0 invert opacity-90"
              priority
            />
          </Link>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#D6B779]/10 text-[#D6B779] border border-[#D6B779]/20">
            <Crown className="w-3 h-3 text-[#D6B779]" />
            <span>Executive Governance</span>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-[#566171] hover:text-[#F3F5F7] hover:bg-[#202833] transition-colors"
            aria-label="Close navigation sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto p-3.5 space-y-1">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/executive/dashboard" && pathname?.startsWith(item.href));

          return (
            <div key={item.name}>
              {index === 0 && (
                <div className="pt-1 pb-1.5 px-2 text-[10px] font-bold uppercase tracking-wider text-[#566171]">
                  Operations & People
                </div>
              )}
              {index === 4 && (
                <div className="pt-4 pb-1.5 px-2 text-[10px] font-bold uppercase tracking-wider text-[#D6B779]/80">
                  Business & CRM
                </div>
              )}
              {index === 8 && (
                <div className="pt-4 pb-1.5 px-2 text-[10px] font-bold uppercase tracking-wider text-[#566171]">
                  Governance & Compliance
                </div>
              )}
              <Link
                href={item.href}
                onClick={onClose}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                    : "text-[#A7B0BC] hover:text-[#F3F5F7] hover:bg-[#202833] border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? "text-emerald-500" : "text-[#566171] group-hover:text-[#A7B0BC]"
                    }`}
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
                  <span className="truncate">{item.name}</span>
                </div>
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                )}
              </Link>
            </div>
          );
        })}
      </nav>

      {/* Footer Profile & Logout */}
      <div className="p-3.5 border-t border-[#1E2530] bg-[#0B0D10]/50">
        <form action="/api/v1/auth/logout" method="POST">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-[#7E8997] hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 border border-transparent transition-all text-xs font-semibold"
          >
            <LogOut className="w-4 h-4 text-[#566171] group-hover:text-red-400" />
            <span>Sign Out</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export function ExecutiveSidebar({ isOpen, onClose }: ExecutiveSidebarProps) {
  const pathname = usePathname();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && onClose) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (isOpen !== undefined && onClose !== undefined) {
    return (
      <>
        <div className="hidden lg:flex h-full shrink-0">
          <SidebarInner pathname={pathname} onClose={onClose} />
        </div>
        <div
          className={`fixed inset-y-0 left-0 z-50 lg:hidden transition-transform duration-300 ease-in-out ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <SidebarInner pathname={pathname} onClose={onClose} />
        </div>
      </>
    );
  }

  return (
    <aside className="h-full shrink-0">
      <SidebarInner pathname={pathname} />
    </aside>
  );
}
