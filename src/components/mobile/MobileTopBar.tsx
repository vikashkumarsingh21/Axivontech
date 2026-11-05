"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Bell } from "lucide-react";
import type { MobileRole } from "./types";
import { ROLE_CONFIGS } from "./roleConfig";

interface MobileTopBarProps {
  role: MobileRole;
  userName?: string;
  unreadCount?: number;
  customTitle?: string;
}

const TITLE_MAP: Record<string, string> = {
  "/employee/dashboard": "Employee Portal",
  "/employee/attendance": "Attendance",
  "/employee/tasks": "My Tasks",
  "/employee/leave": "Leave Management",
  "/employee/work-reports": "Work Reports",
  "/employee/announcements": "Announcements",
  "/employee/calendar": "Company Calendar",
  "/employee/documents": "My Documents",
  "/employee/projects": "Projects",
  "/employee/profile": "Profile & Settings",
  "/employee/settings": "App Settings",
  "/employee/support": "Help & Support",
  "/employee/notifications": "Notifications",

  "/admin/dashboard": "Admin Operations",
  "/admin/approvals": "Pending Approvals",
  "/admin/employees": "Employee Management",
  "/admin/leads": "CRM & Leads",
  "/admin/attendance": "Attendance Manager",
  "/admin/tasks": "Tasks Board",
  "/admin/projects": "Project Portfolio",
  "/admin/export": "Export Center",
  "/admin/settings/app": "App Settings",
  "/admin/notifications": "Notifications",

  "/broker/dashboard": "Broker Network",
  "/broker/leads": "My Client Leads",
  "/broker/projects": "Partner Projects",
  "/broker/commissions": "Earnings & Payouts",
  "/broker/documents": "Contracts",
  "/broker/notifications": "Notifications",
  "/broker/profile": "Partner Profile",

  "/client/dashboard": "Client Workspace",
  "/client/projects": "Active Projects",
  "/client/documents": "Project Documents",
  "/client/invoices": "Billing & Invoices",
  "/client/support": "Client Support",
  "/client/profile": "Account Profile",

  "/executive/dashboard": "Executive Overview",
  "/executive/approvals": "Executive Approvals",
  "/executive/people": "Leadership & People",
  "/executive/reports": "Business Reports",
  "/executive/settings": "Organization Settings",
  "/executive/profile": "Executive Profile",

  "/manager/dashboard": "Department Operations",
  "/manager/employees": "Team Members",
  "/manager/tasks": "Tasks & Workload",
  "/manager/work-reports": "Team Reports",
  "/manager/attendance": "Department Attendance",
  "/manager/leave": "Leave Approvals",
};

export function MobileTopBar({
  role,
  userName = "User",
  unreadCount = 0,
  customTitle,
}: MobileTopBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const config = ROLE_CONFIGS[role] || ROLE_CONFIGS.EMPLOYEE;

  const isRootPage = pathname === config.rootPath;
  const pageTitle = customTitle || TITLE_MAP[pathname] || "AxivonTech";

  const initials =
    userName
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "AX";

  const notificationPath =
    role === "EMPLOYEE"
      ? "/employee/notifications"
      : role === "ADMIN"
      ? "/admin/notifications"
      : role === "BROKER"
      ? "/broker/notifications"
      : `${config.rootPath}`;

  const profilePath =
    role === "EMPLOYEE"
      ? "/employee/profile"
      : role === "ADMIN"
      ? "/admin/employees"
      : role === "BROKER"
      ? "/broker/profile"
      : role === "CLIENT"
      ? "/client/profile"
      : "/executive/profile";

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] pt-[env(safe-area-inset-top)]">
      <div className="flex h-14 items-center justify-between px-4 max-w-lg mx-auto">
        {/* Left: Back button or Logo + Title */}
        <div className="flex items-center gap-3 min-w-0">
          {!isRootPage ? (
            <button
              type="button"
              onClick={() => router.back()}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 active:scale-95 transition-transform"
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          ) : (
            <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 border border-slate-200/80 p-1 shrink-0 overflow-hidden shadow-xs">
              <Image
                src="/assets/logo/logo-icon.png"
                alt="AxivonTech"
                width={26}
                height={26}
                className="object-contain"
                priority
              />
            </div>
          )}

          <div className="truncate">
            <h1 className="text-[16px] sm:text-[17px] font-bold text-slate-900 truncate leading-tight tracking-tight">
              {pageTitle}
            </h1>
          </div>
        </div>

        {/* Right: Notification Bell & Profile Avatar */}
        <div className="flex items-center gap-2">
          <Link
            href={notificationPath}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 hover:text-slate-900 active:scale-95 transition-transform"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-600" />
              </span>
            )}
          </Link>

          <Link
            href={profilePath}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-xs font-bold text-teal-800 active:scale-95 transition-transform shadow-xs"
            aria-label="User Profile"
          >
            {initials}
          </Link>
        </div>
      </div>
    </header>
  );
}
