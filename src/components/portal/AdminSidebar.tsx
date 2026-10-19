"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, Users, CalendarCheck, Calendar, Briefcase, 
  CheckSquare, FileText, Coffee, Bell, Megaphone, 
  FolderOpen, Activity, Settings, LogOut, DollarSign,
  TrendingUp, Award, Clock, MessageSquare, ChevronDown, 
  ChevronRight, Building, UserCheck, ShieldCheck,
  CreditCard, UserPlus, Image as ImageIcon, LayoutTemplate,
  GraduationCap, X, Sparkles, Home, Layers, Building2, Info,
  HelpCircle, BookOpen, Globe, Sliders, BarChart3, LineChart, FileSpreadsheet, Bot, Zap
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

export interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface SidebarInnerProps {
  pathname: string;
  onClose?: () => void;
}

function SidebarInner({ pathname, onClose }: SidebarInnerProps) {
  // Track open dropdowns by title - default open CRM and Partners
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    "Sales CRM & Leads": true,
    "Business Partner Network": true,
    "Workforce & Operations": false,
    "Careers & Recruitment": false,
    "Content Management": false,
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
      title: "Business Intelligence",
      icon: BarChart3,
      badge: "BI",
      items: [
        { name: "BI Dashboard", href: "/admin/analytics", icon: LineChart, isHighlight: true },
        { name: "Reports Centre", href: "/admin/reports", icon: FileSpreadsheet },
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
        { name: "Calendar & Holidays", href: "/admin/calendar", icon: Calendar },
        { name: "Leave Approvals", href: "/admin/leave", icon: Coffee },
        { name: "Work Reports", href: "/admin/work-reports", icon: FileText },
        { name: "Projects", href: "/admin/projects", icon: Briefcase },
        { name: "Tasks", href: "/admin/tasks", icon: CheckSquare },
      ]
    },
    {
      title: "Careers & Recruitment",
      icon: GraduationCap,
      items: [
        { name: "Job Postings", href: "/admin/careers", icon: Briefcase },
        { name: "Candidate Applications", href: "/admin/careers/applications", icon: Users },
        { name: "Page Content Settings", href: "/admin/careers/settings", icon: Settings },
      ]
    },
    {
      title: "Content Management",
      icon: LayoutTemplate,
      badge: "CMS",
      items: [
        { name: "Content Overview", href: "/admin/content", icon: LayoutDashboard },
        { name: "Homepage Content", href: "/admin/content/homepage", icon: Home },
        { name: "Services Catalog", href: "/admin/content/services", icon: Layers },
        { name: "Industry Sectors", href: "/admin/content/industries", icon: Building2 },
        { name: "About & Company", href: "/admin/content/about", icon: Info },
        { name: "FAQ Directory", href: "/admin/content/faqs", icon: HelpCircle },
        { name: "Blog Articles", href: "/admin/content/blog", icon: BookOpen },
        { name: "Media Library", href: "/admin/content/media", icon: ImageIcon },
        { name: "SEO Settings", href: "/admin/content/seo", icon: Globe },
        { name: "Demo Projects", href: "/admin/content/demo-projects", icon: Sparkles },
        { name: "Login Posters", href: "/admin/content/login-posters", icon: Sliders },
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
        { name: "Automation Center", href: "/admin/automations", icon: Zap, isHighlight: true },
        { name: "AI Assistant & Knowledge", href: "/admin/ai/knowledge", icon: Bot, isHighlight: true },
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
        onClick={onClose}
        className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
          isActive
            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
            : item.isHighlight
            ? "text-[#F3F5F7] hover:text-[#F3F5F7] hover:bg-[#202833] border border-transparent"
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

        {item.badge && (
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider ${
            isActive ? "bg-emerald-500/15 text-emerald-400" : "bg-[#202833] text-[#7E8997]"
          }`}>
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#0E1116] border-r border-[#1E2530] w-64 shrink-0 select-none shadow-xs">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#1E2530] flex items-center justify-between">
        <div>
          <Link href="/admin/dashboard" className="block transition-opacity hover:opacity-90">
            <Image
              src="/assets/logo/logo-full.png"
              alt="Axivon Technologies"
              width={140}
              height={34}
              className="h-7 w-auto brightness-0 invert opacity-90"
              priority
            />
          </Link>
          <div className="mt-2.5 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              Control Center
            </span>
            <span className="text-[10px] text-[#566171] font-mono">v2.4</span>
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

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-3.5 space-y-4 scrollbar-thin scrollbar-thumb-[#29313B] scrollbar-track-transparent">
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
                type="button"
                onClick={() => toggleGroup(group.title)}
                className="flex items-center justify-between w-full px-2 py-1.5 text-left transition-colors group focus:outline-none"
              >
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#566171] group-hover:text-[#A7B0BC]">
                  {GroupIcon && <GroupIcon className="w-3.5 h-3.5 text-[#566171] group-hover:text-[#7E8997]" />}
                  <span>{group.title}</span>
                </div>
                {isOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-[#566171] group-hover:text-[#7E8997] transition-transform" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-[#566171] group-hover:text-[#7E8997] transition-transform" />
                )}
              </button>
              
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="pt-1 pb-1 space-y-1 pl-2 border-l border-[#29313B] ml-3">
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
      <div className="p-3.5 border-t border-[#1E2530] bg-[#0B0D10]/50">
        <form action="/api/v1/auth/logout" method="POST">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-[#7E8997] hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 border border-transparent transition-all text-xs font-semibold"
          >
            <LogOut className="w-3.5 h-3.5 text-[#566171] group-hover:text-red-400" />
            <span>Sign Out Securely</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
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
