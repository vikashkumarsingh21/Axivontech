"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  PlusCircle, 
  Wallet, 
  ArrowUpRight, 
  FileText, 
  Share2, 
  UserCircle, 
  HelpCircle, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  ShieldCheck,
  Building2,
  Sparkles
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  badge?: number | string;
  badgeType?: "accent" | "warning" | "neutral";
}

interface NavGroup {
  groupName: string;
  items: NavItem[];
}

export interface BrokerPortalSidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
  unreadCount?: number;
  pendingActionsCount?: number;
}

export function BrokerPortalSidebar({
  mobileOpen,
  onMobileClose,
  unreadCount = 0,
  pendingActionsCount = 0,
}: BrokerPortalSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // Read collapsed preference from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("axivon_broker_sidebar_collapsed");
      if (stored === "true") setCollapsed(true);
    } catch {}
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("axivon_broker_sidebar_collapsed", String(next));
      } catch {}
      return next;
    });
  };

  const navGroups: NavGroup[] = [
    {
      groupName: "Overview",
      items: [
        { name: "Dashboard", href: "/broker/dashboard", icon: LayoutDashboard },
      ],
    },
    {
      groupName: "Business Pipeline",
      items: [
        { name: "My Leads", href: "/broker/leads", icon: Users },
        { name: "Projects", href: "/broker/projects", icon: Briefcase },
        { name: "Submit Project", href: "/broker/projects/new", icon: PlusCircle },
      ],
    },
    {
      groupName: "Financials",
      items: [
        { name: "Commissions", href: "/broker/commissions", icon: Wallet },
      ],
    },
    {
      groupName: "Resources",
      items: [
        { name: "Documents & Policy", href: "/broker/documents", icon: FileText },
      ],
    },
    {
      groupName: "Account & Support",
      items: [
        { 
          name: "Partner Profile", 
          href: "/broker/profile", 
          icon: UserCircle,
          badge: pendingActionsCount > 0 ? `${pendingActionsCount} pending` : undefined,
          badgeType: "warning",
        },
        { name: "Support Desk", href: "/broker/support", icon: HelpCircle },
      ],
    },
  ];

  const isLinkActive = (href: string) => {
    if (href === "/broker/dashboard") return pathname === "/broker/dashboard";
    return pathname === href || pathname?.startsWith(`${href}/`);
  };

  const sidebarContent = (
    <div className={`flex flex-col h-full bg-[#0E1013] border-r border-[#22262D] transition-all duration-200 select-none ${
      collapsed ? "w-18" : "w-64"
    }`}>
      {/* Brand Header */}
      <div className="h-16 px-4 border-b border-[#1E232B] flex items-center justify-between shrink-0">
        {!collapsed ? (
          <Link href="/broker/dashboard" className="flex items-center gap-2.5 overflow-hidden">
            <Image
              src="/assets/logo/logo-full.png"
              alt="Axivon Technologies"
              width={118}
              height={30}
              className="h-6 w-auto brightness-0 invert opacity-90"
              priority
            />
            <span className="text-[10px] font-mono tracking-widest uppercase px-1.5 py-0.5 rounded border border-[#C2A878]/30 bg-[#C2A878]/10 text-[#C2A878] font-medium">
              PARTNER
            </span>
          </Link>
        ) : (
          <Link href="/broker/dashboard" className="mx-auto block" title="Axivon Partner Portal">
            <div className="w-8 h-8 rounded-lg bg-[#C2A878]/10 border border-[#C2A878]/30 flex items-center justify-center text-[#C2A878] font-bold text-sm">
              A
            </div>
          </Link>
        )}

        {/* Mobile Close Button */}
        <button
          onClick={onMobileClose}
          className="lg:hidden p-1.5 rounded-lg text-[#8B94A1] hover:text-[#E6E8EB] hover:bg-[#171A1F]"
          aria-label="Close navigation"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav Groups Container */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-[#1F2530]">
        {navGroups.map((group, gIdx) => (
          <div key={group.groupName} className="space-y-1">
            {!collapsed && (
              <div className="px-3 text-[10px] uppercase font-mono tracking-wider text-[#566171] mb-2 font-medium">
                {group.groupName}
              </div>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = isLinkActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onMobileClose}
                  title={collapsed ? item.name : undefined}
                  className={`group relative flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? "bg-[#C2A878]/10 text-[#C2A878] font-semibold"
                      : "text-[#8B94A1] hover:text-[#E6E8EB] hover:bg-[#171A1F]"
                  } ${collapsed ? "justify-center px-0 py-2.5" : ""}`}
                >
                  {/* Left accent bar on active item */}
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r bg-[#C2A878]" />
                  )}

                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      active
                        ? "text-[#C2A878]"
                        : "text-[#8B94A1] group-hover:text-[#E6E8EB]"
                    }`}
                    strokeWidth={active ? 2.2 : 1.75}
                  />

                  {!collapsed && (
                    <span className="truncate flex-1">{item.name}</span>
                  )}

                  {!collapsed && item.badge && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full border ${
                        item.badgeType === "warning"
                          ? "bg-amber-500/10 border-amber-500/25 text-amber-400"
                          : item.badgeType === "accent"
                          ? "bg-[#C2A878]/10 border-[#C2A878]/25 text-[#C2A878]"
                          : "bg-[#1E232B] border-[#2C313A] text-[#8B94A1]"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Collapse Desktop Toggle & Sign Out Footer */}
      <div className="p-3 border-t border-[#1E232B] space-y-2 shrink-0">
        <button
          onClick={toggleCollapsed}
          className="hidden lg:flex w-full items-center justify-center gap-2 py-1.5 px-2 rounded-lg text-xs text-[#8B94A1] hover:text-[#E6E8EB] hover:bg-[#171A1F] transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-[#8B94A1]" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 text-[#8B94A1]" />
              <span className="text-[11px] font-mono">Collapse</span>
            </>
          )}
        </button>

        <form action="/api/v1/auth/logout" method="POST">
          <button
            type="submit"
            title={collapsed ? "Sign Out" : undefined}
            className={`w-full flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-medium text-[#8B94A1] hover:text-red-400 hover:bg-red-500/10 transition-colors ${
              collapsed ? "justify-center px-0" : ""
            }`}
          >
            <LogOut className="w-4 h-4 shrink-0 text-[#8B94A1] group-hover:text-red-400" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex h-screen sticky top-0 shrink-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          onClick={onMobileClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 lg:hidden transition-transform duration-250 ease-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
