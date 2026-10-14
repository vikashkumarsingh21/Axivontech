// src/components/demo-projects/leadpilot/LeadPilotSidebar.tsx
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Contact,
  Building2,
  DollarSign,
  CheckSquare,
  Activity,
  Calendar,
  BarChart3,
  Settings,
  X,
  Target,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { useLeadPilot } from "@/context/LeadPilotContext";

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const NAV_ITEMS = [
  { name: "Overview", href: "/demo-projects/saas/leadpilot", icon: LayoutDashboard },
  { name: "Leads", href: "/demo-projects/saas/leadpilot/leads", icon: Users, badgeKey: "leads" },
  { name: "Contacts", href: "/demo-projects/saas/leadpilot/contacts", icon: Contact },
  { name: "Companies", href: "/demo-projects/saas/leadpilot/companies", icon: Building2 },
  { name: "Deals", href: "/demo-projects/saas/leadpilot/deals", icon: DollarSign, badgeKey: "deals" },
  { name: "Tasks", href: "/demo-projects/saas/leadpilot/tasks", icon: CheckSquare, badgeKey: "tasks" },
  { name: "Activities", href: "/demo-projects/saas/leadpilot/activities", icon: Activity },
  { name: "Calendar", href: "/demo-projects/saas/leadpilot/calendar", icon: Calendar },
  { name: "Reports", href: "/demo-projects/saas/leadpilot/reports", icon: BarChart3 },
  { name: "Settings", href: "/demo-projects/saas/leadpilot/settings", icon: Settings },
];

export default function LeadPilotSidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { newLeadsCount, openDealsCount, tasksDueCount } = useLeadPilot();

  const getBadgeValue = (key?: string) => {
    if (key === "leads") return newLeadsCount > 0 ? newLeadsCount : null;
    if (key === "deals") return openDealsCount > 0 ? openDealsCount : null;
    if (key === "tasks") return tasksDueCount > 0 ? tasksDueCount : null;
    return null;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Element */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#252925] text-[#F6F7F4] flex flex-col border-r border-[#343A34] transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="LeadPilot Primary Navigation"
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#343A34]">
          <Link
            href="/demo-projects/saas/leadpilot"
            className="flex items-center gap-2.5 group"
            onClick={onCloseMobile}
          >
            <div className="h-8 w-8 rounded-lg bg-[#2F806A] flex items-center justify-center text-white shadow-xs group-hover:bg-[#266b58] transition-colors">
              <Target className="h-4 w-4" />
            </div>
            <div>
              <div className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                LeadPilot
                <span className="text-[9px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-sm bg-[#353C35] text-[#E5F0EB]">
                  CRM
                </span>
              </div>
              <div className="text-[10px] text-[#A2A9A3]">Sales & Pipeline Suite</div>
            </div>
          </Link>

          {/* Mobile Close Button */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-md text-[#A2A9A3] hover:text-white hover:bg-[#343A34] transition-colors"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider uppercase text-[#747A75]">
            Sales Management
          </div>

          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/demo-projects/saas/leadpilot"
                ? pathname === "/demo-projects/saas/leadpilot"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            const badge = getBadgeValue(item.badgeKey);

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onCloseMobile}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-[#2F806A] text-white shadow-xs"
                    : "text-[#D6DDD7] hover:bg-[#303630] hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 transition-colors ${
                      isActive ? "text-white" : "text-[#9AA29C] group-hover:text-white"
                    }`}
                  />
                  <span>{item.name}</span>
                </div>

                {badge !== null && (
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-[#384038] text-[#E5F0EB] group-hover:bg-[#404940]"
                    }`}
                  >
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Demo Context Pill in Sidebar Footer */}
        <div className="p-4 border-t border-[#343A34] bg-[#1F231F]">
          <div className="rounded-xl border border-[#3A423A] bg-[#282E28] p-3 text-xs">
            <div className="flex items-center gap-2 font-semibold text-white">
              <Sparkles className="h-3.5 w-3.5 text-[#DDA34B]" />
              <span>Interactive Prototype</span>
            </div>
            <p className="mt-1 text-[11px] text-[#A2A9A3] leading-relaxed">
              State updates persist locally. No production Axivon data is modified.
            </p>
            <div className="mt-2.5 pt-2 border-t border-[#3A423A] flex items-center justify-between text-[11px]">
              <span className="text-[#848C85]">Active rep:</span>
              <span className="font-semibold text-[#E5F0EB]">Alex Rivera</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
