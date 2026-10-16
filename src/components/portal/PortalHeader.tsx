"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Bell, 
  Menu, 
  Search, 
  ChevronRight, 
  User as UserIcon, 
  LogOut, 
  ShieldCheck 
} from "lucide-react";
import GlobalSearchModal from "@/components/shared/GlobalSearchModal";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PortalHeaderProps {
  portalName: string;
  roleName: string;
  userName?: string;
  userEmail?: string;
  notificationHref?: string;
  unreadNotificationsCount?: number;
  profileHref?: string;
  onToggleSidebar?: () => void;
  showSearch?: boolean;
  searchPlaceholder?: string;
  breadcrumbs?: BreadcrumbItem[];
}

export function PortalHeader({
  portalName,
  roleName,
  userName = "User",
  userEmail,
  notificationHref = "/notifications",
  unreadNotificationsCount = 0,
  profileHref = "/profile",
  onToggleSidebar,
  showSearch = true,
  searchPlaceholder = "Search...",
  breadcrumbs,
}: PortalHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const initials = userName
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  return (
    <>
      <header className="h-16 bg-[#0B0D10]/95 backdrop-blur-md border-b border-[#1E2530] flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 shrink-0 select-none">
        {/* Left Section: Mobile Menu + Portal Identity / Breadcrumbs */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden h-10 w-10 flex items-center justify-center rounded-lg text-[#7E8997] hover:text-[#F3F5F7] hover:bg-[#202833] transition-colors touch-manipulation active:scale-95"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {breadcrumbs && breadcrumbs.length > 0 ? (
            <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-xs">
              <span className="font-semibold text-[#F3F5F7]">{portalName}</span>
              {breadcrumbs.map((crumb, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-[#566171]">
                  <ChevronRight className="w-3.5 h-3.5 text-[#566171]" />
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      className="hover:text-[#F3F5F7] transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="font-medium text-[#A7B0BC]">{crumb.label}</span>
                  )}
                </div>
              ))}
            </nav>
          ) : (
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-semibold text-[#7E8997] hidden sm:inline">
                {portalName}
              </span>
              <span className="hidden sm:inline text-[#29313B]">/</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                {roleName}
              </span>
            </div>
          )}

          {/* Mobile Title */}
          <span className="text-sm font-semibold text-[#F3F5F7] truncate sm:hidden">
            {portalName}
          </span>
        </div>

        {/* Center / Search Button */}
        {showSearch && (
          <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-lg bg-[#151A21] hover:bg-[#1B222B] border border-[#29313B] text-xs text-[#7E8997] transition-all text-left"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-[#566171]" />
                <span>{searchPlaceholder}</span>
              </div>
              <kbd className="px-1.5 py-0.5 rounded bg-[#1B222B] border border-[#29313B] text-[10px] font-mono text-[#566171] shadow-2xs">
                Ctrl+K
              </kbd>
            </button>
          </div>
        )}

        {/* Right Section: Mobile Search + Notifications + User Avatar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {showSearch && (
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="md:hidden h-10 w-10 flex items-center justify-center rounded-lg text-[#7E8997] hover:text-[#F3F5F7] hover:bg-[#202833] transition-colors touch-manipulation active:scale-95"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          {/* Notifications */}
          <Link
            href={notificationHref}
            className="relative h-10 w-10 flex items-center justify-center rounded-lg text-[#7E8997] hover:text-[#F3F5F7] hover:bg-[#202833] transition-colors touch-manipulation active:scale-95"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-2 right-2 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
              </span>
            )}
          </Link>

          {/* User Profile Dropdown */}
          <div className="relative pl-2 sm:pl-3 border-l border-[#29313B]">
            <button
              type="button"
              onClick={() => setUserMenuOpen((prev) => !prev)}
              className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-[#202833] transition-colors text-left touch-manipulation active:scale-95 min-h-[40px]"
              aria-label="User profile menu"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0">
                {initials}
              </div>
              <div className="hidden lg:block text-xs leading-tight">
                <p className="font-semibold text-[#F3F5F7] truncate max-w-[120px]">
                  {userName}
                </p>
                <p className="text-[11px] text-[#7E8997] truncate max-w-[120px]">
                  {roleName}
                </p>
              </div>
            </button>

            {/* Dropdown Menu */}
            {userMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setUserMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-[#1B222B] border border-[#29313B] rounded-xl shadow-xl py-1.5 z-50 text-xs">
                  <div className="px-4 py-2.5 border-b border-[#1E2530]">
                    <p className="font-semibold text-[#F3F5F7] truncate">{userName}</p>
                    {userEmail && (
                      <p className="text-[#7E8997] text-[11px] truncate mt-0.5">{userEmail}</p>
                    )}
                    <span className="mt-1.5 inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-[#202833] text-[#A7B0BC]">
                      {roleName}
                    </span>
                  </div>

                  {profileHref && (
                    <Link
                      href={profileHref}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-[#A7B0BC] hover:bg-[#202833] hover:text-[#F3F5F7] transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-[#566171]" />
                      <span>My Profile & Settings</span>
                    </Link>
                  )}

                  <div className="border-t border-[#1E2530] mt-1 pt-1">
                    <form action="/api/v1/auth/logout" method="POST">
                      <button
                        type="submit"
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-red-400 hover:bg-red-500/10 transition-colors text-left font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </form>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
