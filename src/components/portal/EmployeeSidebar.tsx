"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  CalendarCheck,
  CheckSquare,
  FileText,
  Coffee,
  Bell,
  Megaphone,
  FolderOpen,
  Settings,
  LogOut,
  Briefcase,
  X,
  User,
  Shield,
  Calendar,
  HelpCircle,
  ListChecks,
} from "lucide-react";

interface NavGroup {
  label: string;
  items: {
    name: string;
    href: string;
    icon: any;
    badge?: string;
  }[];
}

const navGroups: NavGroup[] = [
  {
    label: "Workspace",
    items: [
      { name: "Dashboard", href: "/employee/dashboard", icon: LayoutDashboard },
      { name: "My Attendance", href: "/employee/attendance", icon: CalendarCheck },
      { name: "My Tasks", href: "/employee/tasks", icon: CheckSquare },
      { name: "Work Reports", href: "/employee/work-reports", icon: FileText },
      { name: "Projects", href: "/employee/projects", icon: Briefcase },
    ],
  },
  {
    label: "Schedule & Leave",
    items: [
      { name: "Company Calendar", href: "/employee/calendar", icon: Calendar },
      { name: "Leave Management", href: "/employee/leave", icon: Coffee },
    ],
  },
  {
    label: "Organization Hub",
    items: [
      { name: "Announcements", href: "/employee/announcements", icon: Megaphone },
      { name: "Document Center", href: "/employee/documents", icon: FolderOpen },
      { name: "Notifications", href: "/employee/notifications", icon: Bell },
    ],
  },
  {
    label: "Account & Support",
    items: [
      { name: "My Profile", href: "/employee/profile", icon: User },
      { name: "Onboarding Checklist", href: "/employee/onboarding", icon: ListChecks },
      { name: "Help & Support", href: "/employee/support", icon: HelpCircle },
      { name: "Settings", href: "/employee/settings", icon: Settings },
    ],
  },
];

interface EmployeeSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SidebarInnerProps {
  pathname: string;
  onClose: () => void;
}

function SidebarInner({ pathname, onClose }: SidebarInnerProps) {
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="flex flex-col h-full bg-[#090D16] border-r border-[#1E293B] w-64 pt-5 select-none shadow-xl">
      {/* Brand Header */}
      <div className="px-5 pb-5 border-b border-[#1E293B] flex items-center justify-between">
        <div>
          <Link href="/employee/dashboard" className="block transition-opacity hover:opacity-90">
            <Image
              src="/assets/logo/logo-full.png"
              alt="Axivon Technologies"
              width={140}
              height={36}
              className="h-7 w-auto brightness-0 invert opacity-90"
              priority
            />
          </Link>
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 shadow-xs">
            <Shield className="w-3 h-3 text-indigo-400" />
            <span>Employee Portal</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Close navigation sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav Items Grouped */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-1">
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {group.label}
            </div>
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 group ${
                    active
                      ? "bg-gradient-to-r from-indigo-500/15 via-indigo-500/10 to-transparent text-indigo-300 border border-indigo-500/30 shadow-xs"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        active
                          ? "text-indigo-400"
                          : "text-slate-500 group-hover:text-slate-300"
                      }`}
                      strokeWidth={active ? 2.2 : 1.8}
                    />
                    <span>{item.name}</span>
                  </div>
                  {active && (
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-sm shadow-indigo-400/50" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Logout Footer */}
      <div className="p-3.5 border-t border-[#1E293B] bg-[#090D16]">
        <form action="/api/v1/auth/logout" method="POST">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 border border-transparent transition-all text-xs font-semibold cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-slate-500 group-hover:text-red-400" />
            <span>Sign Out</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export function EmployeeSidebar({ isOpen, onClose }: EmployeeSidebarProps) {
  const pathname = usePathname();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Desktop: always visible static sidebar */}
      <div className="hidden lg:flex h-full shrink-0">
        <SidebarInner pathname={pathname} onClose={onClose} />
      </div>

      {/* Mobile/Tablet: slide-in drawer using framer-motion */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 240 }}
            className="fixed inset-y-0 left-0 z-50 lg:hidden shadow-2xl"
          >
            <SidebarInner pathname={pathname} onClose={onClose} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
