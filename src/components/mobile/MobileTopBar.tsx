"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
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
  "/employee/profile": "Profile",
  "/employee/settings": "Settings",
  "/employee/support": "Help & Support",
  "/employee/notifications": "Notifications",

  "/admin/dashboard": "Admin Console",
  "/admin/approvals": "Approvals",
  "/admin/employees": "Employees",
  "/admin/leads": "CRM & Leads",
  "/admin/attendance": "Attendance Manager",
  "/admin/tasks": "Tasks Board",
  "/admin/projects": "Project Portfolio",
  "/admin/export": "Export Center",
  "/admin/settings/app": "App Settings",
  "/admin/notifications": "System Notifications",

  "/broker/dashboard": "Partner Portal",
  "/broker/leads": "Lead Management",
  "/broker/projects": "Partner Projects",
  "/broker/commissions": "Earnings & Payouts",
  "/broker/documents": "Contracts",
  "/broker/notifications": "Notifications",
  "/broker/profile": "Partner Profile",

  "/client/dashboard": "Client Portal",
  "/client/projects": "Active Projects",
  "/client/documents": "Documents & Assets",
  "/client/invoices": "Invoices & Billing",
  "/client/support": "Client Support",
  "/client/profile": "Account Profile",

  "/executive/dashboard": "Executive Overview",
  "/executive/approvals": "Executive Approvals",
  "/executive/people": "Leadership & People",
  "/executive/reports": "Business Reports",
  "/executive/settings": "Organization Settings",
  "/executive/profile": "Executive Profile",
};

export function MobileTopBar({
  role,
  userName = "User",
  unreadCount = 0,
  customTitle,
}: MobileTopBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const config = ROLE_CONFIGS[role];

  const isRootPage = pathname === config.rootPath;
  const pageTitle = customTitle || TITLE_MAP[pathname] || "Axivon Portal";

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
    <header className="sticky top-0 z-40 w-full bg-[#121212]/95 backdrop-blur-md border-b border-[#2E2E30] pt-[env(safe-area-inset-top)]">
      <div className="flex h-14 items-center justify-between px-4">
        {/* Left: Back button or Logo + Title */}
        <div className="flex items-center gap-3 min-w-0">
          {!isRootPage ? (
            <button
              type="button"
              onClick={() => router.back()}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1A1A1B] border border-[#2E2E30] text-[#EDEBE6] active:scale-95 transition-transform"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#4F9D83] to-[#438770] text-[#121212] font-bold text-sm shadow-sm">
              A
            </div>
          )}

          <div className="truncate">
            <h1 className="text-[17px] font-semibold text-[#EDEBE6] truncate leading-tight tracking-tight">
              {pageTitle}
            </h1>
          </div>
        </div>

        {/* Right: Notification Bell & Avatar */}
        <div className="flex items-center gap-2.5">
          <Link
            href={notificationPath}
            className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-[#1A1A1B] border border-[#2E2E30] text-[#B3AFA6] hover:text-[#EDEBE6] active:scale-95 transition-transform"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#4F9D83] ring-2 ring-[#121212]" />
            )}
          </Link>

          <Link
            href={profilePath}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#232324] border border-[#2E2E30] text-xs font-semibold text-[#EDEBE6] active:scale-95 transition-transform"
            aria-label="User Profile"
          >
            {initials}
          </Link>
        </div>
      </div>
    </header>
  );
}
