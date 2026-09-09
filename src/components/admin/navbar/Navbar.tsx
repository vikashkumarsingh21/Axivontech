"use client";

import { useState, useEffect } from "react";
import { Search, Bell, ChevronDown } from "lucide-react";
import Link from "next/link";
import GlobalSearchModal from "@/components/shared/GlobalSearchModal";

interface NavbarProps {
  title?: string;
}

export default function Navbar({ title = "Dashboard" }: NavbarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetch("/api/v1/me/notifications?unread=true&limit=1")
      .then((r) => r.json())
      .then((d) => {
        if (d.meta?.unreadCount !== undefined) {
          setUnreadCount(d.meta.unreadCount);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <div className="flex h-full w-full items-center justify-between gap-4 bg-[#0F1115] px-6">
        <div className="flex min-w-0 shrink-0 flex-col justify-center">
          <h1 className="truncate text-base font-semibold text-white">
            {title}
          </h1>
          <span className="truncate text-xs text-[#B7BDC7]">
            Admin Panel
          </span>
        </div>

        <div className="hidden flex-1 justify-center md:flex">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex w-full max-w-md items-center justify-between rounded-full border border-[#2B323D] bg-[#1B212A] py-2 px-4 text-sm text-[#B7BDC7] transition-colors duration-200 hover:border-[#C08457]"
          >
            <div className="flex items-center gap-2">
              <Search size={16} className="text-[#B7BDC7]" />
              <span>Search anything across platform...</span>
            </div>
            <kbd className="hidden sm:inline-block rounded bg-white/10 px-2 py-0.5 text-[10px] font-mono text-gray-300">
              Ctrl+K
            </kbd>
          </button>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <Link
            href="/admin/notifications"
            className="group relative flex h-9 w-9 items-center justify-center rounded-full border border-[#2B323D] bg-[#1B212A] transition-colors duration-200 hover:border-[#C08457]"
          >
            <Bell
              size={17}
              className="text-[#B7BDC7] transition-colors duration-200 group-hover:text-white"
            />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#C08457] text-[10px] font-bold text-black">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>

          <Link
            href="/admin/settings"
            className="flex items-center gap-2 rounded-full border border-[#2B323D] bg-[#1B212A] py-1.5 pl-1.5 pr-3 transition-colors duration-200 hover:border-[#C08457]"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#C08457] text-xs font-semibold text-[#0F1115]">
              AD
            </div>
            <div className="hidden flex-col items-start leading-tight sm:flex">
              <span className="text-xs font-medium text-white">
                Admin User
              </span>
              <span className="text-[10px] text-[#B7BDC7]">Workspace</span>
            </div>
            <ChevronDown size={14} className="text-[#B7BDC7]" />
          </Link>
        </div>
      </div>

      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}