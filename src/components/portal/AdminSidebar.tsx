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
  ChevronRight, Building, UserCheck
} from "lucide-react";

type NavItem = {
  name: string;
  href: string;
  icon: any;
  isCrm?: boolean;
};

type NavGroup = {
  title: string;
  icon?: any;
  isCrmGroup?: boolean;
  items: NavItem[];
};

export function AdminSidebar() {
  const pathname = usePathname();
  
  // Track open dropdowns by title
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    "CRM & Business Growth": true,
    "HR & Workforce": true,
  });

  const toggleGroup = (title: string) => {
    setOpenGroups(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const topItems: NavItem[] = [
    { name: "Admin Overview", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "CRM Dashboard", href: "/admin/crm/dashboard", icon: Activity, isCrm: true },
  ];

  const groupedItems: NavGroup[] = [
    {
      title: "CRM & Business Growth",
      icon: TrendingUp,
      isCrmGroup: true,
      items: [
        { name: "Brokers", href: "/admin/crm/brokers", icon: Users, isCrm: true },
        { name: "Partner Leads", href: "/admin/crm/general-leads", icon: UserCheck, isCrm: true },
        { name: "Partner Projects", href: "/admin/crm/partner-projects", icon: Briefcase, isCrm: true },
        { name: "Partner Documents", href: "/admin/crm/documents", icon: FolderOpen, isCrm: true },
        { name: "Partner Payments", href: "/admin/crm/payments", icon: DollarSign, isCrm: true },
        { name: "Lead Inbox", href: "/admin/crm/leads", icon: Users, isCrm: true },
        { name: "Sales Pipeline", href: "/admin/crm/pipeline", icon: TrendingUp, isCrm: true },
        { name: "CRM Follow-ups", href: "/admin/crm/follow-ups", icon: Clock, isCrm: true },
        { name: "CRM Clients", href: "/admin/crm/clients", icon: Award, isCrm: true },
        { name: "Proposals", href: "/admin/crm/proposals", icon: FileText, isCrm: true },
      ]
    },
    {
      title: "HR & Workforce",
      icon: Users,
      items: [
        { name: "Employees", href: "/admin/employees", icon: Users },
        { name: "Attendance", href: "/admin/attendance", icon: CalendarCheck },
        { name: "Leave", href: "/admin/leave", icon: Coffee },
        { name: "Work Reports", href: "/admin/work-reports", icon: FileText },
      ]
    },
    {
      title: "Projects & Tasks",
      icon: Briefcase,
      items: [
        { name: "Projects", href: "/admin/projects", icon: Briefcase },
        { name: "Tasks", href: "/admin/tasks", icon: CheckSquare },
      ]
    },
    {
      title: "Operations & Engagement",
      icon: Building,
      items: [
        { name: "Announcements", href: "/admin/announcements", icon: Megaphone },
        { name: "Notifications", href: "/admin/notifications", icon: Bell },
        { name: "Documents", href: "/admin/documents", icon: FolderOpen },
        { name: "Reviews & Testimonials", href: "/admin/reviews", icon: MessageSquare },
        { name: "Activity Logs", href: "/admin/activity", icon: Activity },
      ]
    },
    {
      title: "Settings",
      icon: Settings,
      items: [
        { name: "General Settings", href: "/admin/settings", icon: Settings },
        { name: "Payment Settings", href: "/admin/settings/payment", icon: DollarSign },
      ]
    }
  ];

  const renderNavItem = (item: NavItem) => {
    const Icon = item.icon;
    const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && item.href !== "/admin/crm/dashboard" && pathname?.startsWith(item.href));

    return (
      <Link
        key={item.name}
        href={item.href}
        className={`flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-200 ${
          isActive
            ? item.isCrm
              ? "bg-gradient-to-r from-red-600/30 to-amber-600/20 text-white border border-red-500/30 shadow-lg shadow-red-600/10"
              : "bg-white/10 text-white border border-white/10 shadow-sm"
            : "text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent"
        }`}
      >
        <Icon
          className={`w-[18px] h-[18px] transition-colors ${
            isActive ? (item.isCrm ? "text-red-400" : "text-white") : "text-gray-500 group-hover:text-gray-400"
          }`}
          strokeWidth={2}
        />
        <span className="truncate">{item.name}</span>
      </Link>
    );
  };

  return (
    <aside className="flex flex-col h-full bg-[#0a0a0a] border-r border-white/5 w-64 flex-shrink-0 shadow-2xl">
      {/* Brand Header */}
      <div className="p-6 border-b border-white/5 bg-[#0d0d0d]">
        <Link href="/admin/dashboard" className="block transition-opacity hover:opacity-80">
          <Image
            src="/assets/logo/logo-full.png"
            alt="Axivon Technologies"
            width={150}
            height={36}
            className="h-7 w-auto brightness-0 invert"
          />
        </Link>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[10px] font-bold text-red-500 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full uppercase tracking-widest shadow-sm">
            Admin & CRM
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        
        {/* Top Level Items */}
        <div className="space-y-1.5">
          {topItems.map(renderNavItem)}
        </div>

        {/* Grouped Items */}
        {groupedItems.map((group) => {
          const isOpen = openGroups[group.title] !== false; // Default to true if not explicitly false for default open ones
          const GroupIcon = group.icon;
          
          return (
            <div key={group.title} className="space-y-1">
              <button
                onClick={() => toggleGroup(group.title)}
                className="flex items-center justify-between w-full px-2 py-1.5 text-left transition-colors group focus:outline-none"
              >
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-gray-500 group-hover:text-gray-300">
                  {GroupIcon && <GroupIcon className="w-3.5 h-3.5" />}
                  <span className={group.isCrmGroup ? "text-red-500/80 group-hover:text-red-400" : ""}>
                    {group.title}
                  </span>
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
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="pt-1 pb-2 space-y-1.5 pl-2 border-l border-white/5 ml-3">
                      {group.items.map(renderNavItem)}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {/* Footer Logout */}
      <div className="p-4 border-t border-white/5 bg-[#0d0d0d]">
        <form action="/api/v1/auth/logout" method="POST">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-red-400/80 border border-red-500/10 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Securely</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
