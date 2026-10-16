"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, Users, CalendarCheck, Briefcase, 
  CheckSquare, FileText, Coffee, Bell, Megaphone, 
  FolderOpen, Activity, Settings, LogOut, DollarSign,
  TrendingUp, Award, Clock, MessageSquare, ChevronDown, 
  ChevronRight, Building, UserCheck, ShieldCheck,
  CreditCard, UserPlus, Layers, Sparkles
} from "lucide-react";

type NavItem = {
  name: string;
  href: string;
  icon: any;
  badge?: string;
  isHighlight?: boolean;
};

type NavGroup = {
  title: string;
  icon?: any;
  badge?: string;
  items: NavItem[];
};

export function AdminSidebar() {
  const pathname = usePathname();
  
  // Track open dropdowns by title - default open CRM and Partners
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    "Sales CRM & Leads": true,
    "Business Partner Network": true,
    "Workforce & Operations": false,
    "Platform & Governance": false,
  });

  const toggleGroup = (title: string) => {
    setOpenGroups(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const topItems: NavItem[] = [
    { name: "Admin Overview", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Lead Inbox", href: "/admin/crm/leads", icon: Users, badge: "Live", isHighlight: true },
  ];

  const groupedItems: NavGroup[] = [
    {
      title: "Sales CRM & Leads",
      icon: TrendingUp,
      items: [
        { name: "All Leads", href: "/admin/crm/leads", icon: Users },
        { name: "Pipeline Board", href: "/admin/crm/pipeline", icon: TrendingUp },
        { name: "Follow-up Schedule", href: "/admin/crm/follow-ups", icon: Clock },
        { name: "Clients Directory", href: "/admin/crm/clients", icon: Award },
        { name: "Proposals", href: "/admin/crm/proposals", icon: FileText },
        { name: "CRM Analytics", href: "/admin/crm/dashboard", icon: Activity },
      ]
    },
    {
      title: "Business Partner Network",
      icon: UserCheck,
      badge: "Partner",
      items: [
        { name: "Partner Applications", href: "/admin/business-partners/applications", icon: UserPlus, isHighlight: true },
        { name: "Brokers & Partners", href: "/admin/crm/brokers", icon: Users },
        { name: "Partner Leads", href: "/admin/crm/general-leads", icon: UserCheck },
        { name: "Partner Projects", href: "/admin/crm/partner-projects", icon: Briefcase },
        { name: "Partner Documents", href: "/admin/crm/documents", icon: FolderOpen },
        { name: "Payment Verification", href: "/admin/crm/payments", icon: DollarSign },
        { name: "Commissions", href: "/admin/crm/commissions", icon: CreditCard },
      ]
    },
    {
      title: "Workforce & Operations",
      icon: Users,
      items: [
        { name: "Employees", href: "/admin/employees", icon: Users },
        { name: "Attendance", href: "/admin/attendance", icon: CalendarCheck },
        { name: "Leave Approvals", href: "/admin/leave", icon: Coffee },
        { name: "Work Reports", href: "/admin/work-reports", icon: FileText },
        { name: "Projects", href: "/admin/projects", icon: Briefcase },
        { name: "Tasks", href: "/admin/tasks", icon: CheckSquare },
      ]
    },
    {
      title: "Platform & Governance",
      icon: Building,
      items: [
        { name: "Reviews Moderation", href: "/admin/reviews", icon: MessageSquare },
        { name: "Announcements", href: "/admin/announcements", icon: Megaphone },
        { name: "Notifications", href: "/admin/notifications", icon: Bell },
        { name: "Documents Repository", href: "/admin/documents", icon: FolderOpen },
        { name: "Audit & Activity Logs", href: "/admin/activity", icon: Activity },
        { name: "Payment Settings", href: "/admin/settings/payment", icon: CreditCard },
        { name: "General Settings", href: "/admin/settings", icon: Settings },
      ]
    }
  ];

  const renderNavItem = (item: NavItem) => {
    const Icon = item.icon;
    const isExactMatch = pathname === item.href;
    const isSubMatch = item.href !== "/admin/dashboard" && item.href !== "/admin/crm/dashboard" && pathname?.startsWith(item.href);
    const isActive = isExactMatch || isSubMatch;

    return (
      <Link
        key={item.name}
        href={item.href}
        className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
          isActive
            ? "bg-red-600/15 text-white border border-red-500/30 shadow-sm"
            : item.isHighlight
            ? "text-gray-200 hover:text-white hover:bg-white/5 border border-transparent"
            : "text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent"
        }`}
      >
        <div className="flex items-center gap-2.5 truncate">
          <Icon
            className={`w-4 h-4 shrink-0 transition-colors ${
              isActive ? "text-red-400" : "text-gray-500 group-hover:text-gray-300"
            }`}
            strokeWidth={isActive ? 2.2 : 1.8}
          />
          <span className="truncate">{item.name}</span>
        </div>

        {item.badge && (
          <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold uppercase tracking-wider ${
            isActive ? "bg-red-500/20 text-red-300" : "bg-white/10 text-gray-400"
          }`}>
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <aside className="flex flex-col h-full bg-[#0a0a0a] border-r border-white/10 w-64 shrink-0 shadow-2xl select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-white/10 bg-[#0d0d0d]">
        <Link href="/admin/dashboard" className="block transition-opacity hover:opacity-85">
          <Image
            src="/assets/logo/logo-full.png"
            alt="Axivon Technologies"
            width={140}
            height={34}
            className="h-6 w-auto brightness-0 invert"
          />
        </Link>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
            Control Center
          </span>
          <span className="text-[10px] text-gray-500 font-mono">v2.4</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-3.5 space-y-5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {/* Top Priority Items */}
        <div className="space-y-1">
          {topItems.map(renderNavItem)}
        </div>

        {/* Grouped Accordions */}
        {groupedItems.map((group) => {
          const isOpen = openGroups[group.title] !== false;
          const GroupIcon = group.icon;
          
          return (
            <div key={group.title} className="space-y-1">
              <button
                onClick={() => toggleGroup(group.title)}
                className="flex items-center justify-between w-full px-2 py-1.5 text-left transition-colors group focus:outline-none"
              >
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-gray-500 group-hover:text-gray-300">
                  {GroupIcon && <GroupIcon className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-400" />}
                  <span>{group.title}</span>
                </div>
                {isOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-400 transition-transform" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-400 transition-transform" />
                )}
              </button>
              
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="pt-1 pb-1 space-y-1 pl-2 border-l border-white/10 ml-3">
                      {group.items.map(renderNavItem)}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {/* Footer Profile & Logout */}
      <div className="p-3 border-t border-white/10 bg-[#0d0d0d]">
        <form action="/api/v1/auth/logout" method="POST">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-red-400/80 border border-red-500/10 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all text-xs font-semibold"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Securely</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
