"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
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
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/employee/dashboard", icon: LayoutDashboard },
  { name: "Attendance", href: "/employee/attendance", icon: CalendarCheck },
  { name: "Projects", href: "/employee/projects", icon: Briefcase },
  { name: "Tasks", href: "/employee/tasks", icon: CheckSquare },
  { name: "Work Reports", href: "/employee/work-reports", icon: FileText },
  { name: "Leave", href: "/employee/leave", icon: Coffee },
  { name: "Notifications", href: "/employee/notifications", icon: Bell },
  { name: "Announcements", href: "/employee/announcements", icon: Megaphone },
  { name: "Documents", href: "/employee/documents", icon: FolderOpen },
  { name: "Profile", href: "/employee/profile", icon: User },
  { name: "Settings", href: "/employee/settings", icon: Settings },
];

interface EmployeeSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EmployeeSidebar({ isOpen, onClose }: EmployeeSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0a0a0a] border-r border-white/5 w-64 pt-6">
      {/* Logo + Close Button (mobile) */}
      <div className="px-6 pb-6 border-b border-white/5 flex items-center justify-between">
        <Image
          src="/assets/logo/logo-full.png"
          alt="Axivon Technologies"
          width={160}
          height={40}
          className="h-8 w-auto brightness-0 invert"
          priority
        />
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
          aria-label="Close sidebar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group ${
                active
                  ? "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon
                className={`w-5 h-5 shrink-0 transition-colors ${
                  active
                    ? "text-blue-400"
                    : "text-gray-500 group-hover:text-blue-400"
                }`}
              />
              <span>{item.name}</span>
              {active && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/5">
        <form action="/api/v1/auth/logout" method="POST">
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop: always visible static sidebar */}
      <div className="hidden lg:flex h-full shrink-0">
        <SidebarContent />
      </div>

      {/* Mobile/Tablet: slide-in drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 lg:hidden transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent />
      </div>
    </>
  );
}
