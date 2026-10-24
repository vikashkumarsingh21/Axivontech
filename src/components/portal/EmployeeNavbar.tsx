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

  const initials =
    userName
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "E";

  return (
    <>
      <header className="h-16 bg-[#090D16]/90 backdrop-blur-md border-b border-[#1E293B] flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 shrink-0 select-none">
        {/* Left: Hamburger (mobile only) + Search */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search Trigger Button */}
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/40 text-slate-400 text-xs transition-all cursor-pointer shadow-xs group"
          >
            <Search className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
            <span>Search tasks, announcements, docs...</span>
            <kbd className="ml-3 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700/80 text-[10px] font-mono text-slate-400 shadow-2xs">Ctrl+K</kbd>
          </button>

          {/* Page title area on mobile */}
          <span className="text-sm font-semibold text-slate-200 sm:hidden">
            Employee Workspace
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => setSearchOpen(true)}
            className="sm:hidden p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800 cursor-pointer"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Notification Bell */}
          <Link
            href="/employee/notifications"
            className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-xl hover:bg-slate-800/60"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full ring-2 ring-[#090D16] shadow-sm shadow-indigo-500/80 animate-pulse" />
            )}
          </Link>

          {/* User Avatar + Name */}
          <Link
            href="/employee/profile"
            className="flex items-center gap-2.5 pl-3 sm:pl-4 border-l border-slate-800 hover:opacity-90 transition-opacity"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm shadow-indigo-500/25">
              {initials}
            </div>
            <div className="hidden sm:block text-xs leading-tight">
              <p className="text-slate-100 font-semibold truncate max-w-[120px]">{userName}</p>
              <p className="text-indigo-400 text-[11px] font-medium">Employee</p>
            </div>
          </Link>
        </div>
      </header>

      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
