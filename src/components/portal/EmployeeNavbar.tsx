"use client";

import { useEffect, useState } from "react";
import { Bell, Menu, Search } from "lucide-react";
import Link from "next/link";
import GlobalSearchModal from "@/components/shared/GlobalSearchModal";

interface EmployeeNavbarProps {
  onToggleSidebar: () => void;
}

export function EmployeeNavbar({ onToggleSidebar }: EmployeeNavbarProps) {
  const [userName, setUserName] = useState("Employee");
  const [unread, setUnread] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    fetch("/api/v1/employee/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user?.name) setUserName(data.user.name);
      })
      .catch(() => {});

    fetch("/api/v1/employee/notifications?unreadOnly=true")
      .then((res) => res.json())
      .then((data) => {
        if (data?.total) setUnread(data.total);
      })
      .catch(() => {});
  }, []);

  const initials = userName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "E";

  return (
    <>
      <header className="h-16 bg-[#0B0D10]/95 backdrop-blur-md border-b border-[#1E2530] flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 shrink-0 select-none">
        {/* Left: Hamburger (mobile only) + Search */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-[#8B94A1] hover:text-[#E6E8EB] hover:bg-[#171A1F] transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search Trigger Button */}
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111317] hover:bg-[#171A1F] border border-[#1E2530] hover:border-[#5FA8A0]/40 text-[#8B94A1] text-xs transition-all cursor-pointer focus:outline-hidden focus:border-[#5FA8A0]"
          >
            <Search className="w-3.5 h-3.5 text-[#566171]" />
            <span>Search tasks, announcements, docs...</span>
            <kbd className="ml-2 px-1.5 py-0.5 rounded bg-[#171A1F] border border-[#22262D] text-[10px] font-mono text-[#8B94A1] shadow-2xs">Ctrl+K</kbd>
          </button>

          {/* Page title area on mobile */}
          <span className="text-sm font-semibold text-[#E6E8EB] sm:hidden">
            Employee Workspace
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => setSearchOpen(true)}
            className="sm:hidden p-2 text-[#8B94A1] hover:text-[#E6E8EB] transition-colors rounded-lg hover:bg-[#171A1F]"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Notification Bell */}
          <Link
            href="/employee/notifications"
            className="relative p-2 text-[#8B94A1] hover:text-[#E6E8EB] transition-colors rounded-lg hover:bg-[#171A1F]"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#5FA8A0] rounded-full ring-2 ring-[#0B0D10]" />
            )}
          </Link>

          {/* User Avatar + Name */}
          <Link
            href="/employee/profile"
            className="flex items-center gap-2.5 pl-3 sm:pl-4 border-l border-[#1E2530] hover:opacity-85 transition-opacity"
          >
            <div className="w-8 h-8 rounded-full bg-[var(--ep-accent-soft)] border border-[var(--ep-accent-border)] text-[#5FA8A0] flex items-center justify-center font-bold text-xs shrink-0">
              {initials}
            </div>
            <div className="hidden sm:block text-xs leading-tight">
              <p className="text-[#E6E8EB] font-semibold truncate max-w-[120px]">{userName}</p>
              <p className="text-[#8B94A1] text-[11px]">Employee</p>
            </div>
          </Link>
        </div>
      </header>

      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
