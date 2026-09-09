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
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <header className="h-16 bg-[#0a0a0a] border-b border-white/5 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 shrink-0">
        {/* Left: Hamburger (mobile only) */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search Trigger Button */}
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:border-white/10 text-xs transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search tasks, announcements, docs...</span>
            <kbd className="ml-2 px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-mono">Ctrl+K</kbd>
          </button>

          {/* Page title area on mobile */}
          <span className="text-sm font-semibold text-white sm:hidden">
            Employee Portal
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => setSearchOpen(true)}
            className="sm:hidden p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Notification Bell */}
          <Link
            href="/employee/notifications"
            className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
          >
            <Bell className="w-5 h-5" />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-[#0a0a0a]" />
            )}
          </Link>

          {/* User Avatar + Name */}
          <Link
            href="/employee/profile"
            className="flex items-center gap-2.5 pl-3 sm:pl-5 border-l border-white/10 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
              {initials}
            </div>
            <div className="hidden sm:block text-sm max-w-[120px]">
              <p className="text-white font-medium truncate">{userName}</p>
              <p className="text-gray-500 text-xs">Employee</p>
            </div>
          </Link>
        </div>
      </header>

      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
