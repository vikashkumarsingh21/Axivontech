"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  Bell, 
  Menu, 
  User, 
  LogOut, 
  Check, 
  ChevronDown, 
  ArrowRight,
  ShieldCheck,
  FileText,
  HelpCircle,
  ExternalLink
} from "lucide-react";
import { formatDateIN } from "./BrokerFormatters";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export interface BrokerPortalHeaderProps {
  onToggleMobileMenu: () => void;
  brokerName?: string;
  brokerEmail?: string;
  partnerId?: string;
  referralCode?: string;
}

export function BrokerPortalHeader({
  onToggleMobileMenu,
  brokerName = "Partner",
  brokerEmail = "",
  partnerId,
  referralCode,
}: BrokerPortalHeaderProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const res = await fetch("/api/v1/notifications/unread-count");
      if (res.ok) {
        const json = await res.json();
        setUnreadCount(json.data?.unreadCount || 0);
      }
    } catch {}
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Load notifications preview when opened
  const handleToggleNotif = async () => {
    const nextState = !notifOpen;
    setNotifOpen(nextState);
    if (nextState) {
      setUserMenuOpen(false);
      setLoadingNotifs(true);
      try {
        const res = await fetch("/api/v1/notifications?limit=5");
        if (res.ok) {
          const json = await res.json();
          setNotifications(json.data?.notifications || (Array.isArray(json.data) ? json.data : []));
        }
      } catch {} finally {
        setLoadingNotifs(false);
      }
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch("/api/v1/notifications/read-all", { method: "POST" });
      if (res.ok) {
        setUnreadCount(0);
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    } catch {}
  };

  const initials =
    brokerName
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "P";

  return (
    <header className="h-16 bg-[#0B0D10]/95 backdrop-blur-md border-b border-[#22262D] sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 select-none">
      
      {/* Left: Hamburger (mobile) + Workspace Label */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-lg text-[#8B94A1] hover:text-[#E6E8EB] hover:bg-[#171A1F] active:scale-95 transition-all"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono tracking-wider uppercase text-[#8B94A1] hidden sm:inline">
              Broker Workspace
            </span>
            {partnerId && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-[#22262D] bg-[#111317] text-[#C2A878]">
                {partnerId}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right Controls: Notifications + Avatar Menu */}
      <div className="flex items-center gap-2.5 sm:gap-3">

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={handleToggleNotif}
            className="relative p-2 rounded-lg text-[#8B94A1] hover:text-[#E6E8EB] hover:bg-[#171A1F] transition-colors cursor-pointer"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#C2A878] ring-2 ring-[#0A0B0D]" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-[#22262D] bg-[#111317] shadow-xl py-2 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between px-4 py-2 border-b border-[#1E232B]">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#E6E8EB]">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[#C2A878]/10 text-[#C2A878] border border-[#C2A878]/25">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-[#8B94A1] hover:text-[#C2A878] transition-colors flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notification Items List */}
              <div className="max-h-72 overflow-y-auto divide-y divide-[#1A1F26]">
                {loadingNotifs ? (
                  <div className="p-6 text-center text-[#8B94A1] space-y-2">
                    <div className="w-4 h-4 border-2 border-[#C2A878] border-t-transparent rounded-full animate-spin mx-auto" />
                    <span className="text-[11px]">Loading notifications...</span>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-6 text-center text-[#8B94A1]">
                    <Bell className="w-6 h-6 mx-auto mb-2 text-[#566171]" />
                    <p className="text-xs text-[#E6E8EB] font-medium">No new notifications</p>
                    <p className="text-[11px] text-[#566171] mt-0.5">Project and payment alerts will show here</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <Link
                      key={notif.id}
                      href={notif.link || "/broker/notifications"}
                      onClick={() => setNotifOpen(false)}
                      className={`block px-4 py-3 hover:bg-[#171A1F] transition-colors ${
                        !notif.isRead ? "bg-[#C2A878]/5" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-medium text-[#E6E8EB] truncate">{notif.title}</span>
                        <span className="text-[10px] text-[#566171] font-mono shrink-0">
                          {formatDateIN(notif.createdAt)}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8B94A1] line-clamp-2 mt-0.5 leading-relaxed">
                        {notif.message}
                      </p>
                    </Link>
                  ))
                )}
              </div>

              {/* View All Footer */}
              <div className="p-2 border-t border-[#1E232B] text-center bg-[#0E1013] rounded-b-xl">
                <Link
                  href="/broker/notifications"
                  onClick={() => setNotifOpen(false)}
                  className="inline-flex items-center gap-1.5 text-xs text-[#C2A878] hover:text-[#D4BE92] font-medium transition-colors py-1"
                >
                  <span>View all notifications</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setUserMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 p-1.5 rounded-lg border border-[#22262D] hover:border-[#2C313A] bg-[#111317] hover:bg-[#171A1F] transition-all cursor-pointer"
            aria-label="User account menu"
          >
            <div className="w-7 h-7 rounded-md bg-[#C2A878]/15 border border-[#C2A878]/30 flex items-center justify-center text-[#C2A878] font-bold text-xs">
              {initials}
            </div>
            <div className="text-left hidden md:block pr-1">
              <div className="text-xs font-semibold text-[#E6E8EB] leading-tight truncate max-w-[120px]">
                {brokerName}
              </div>
              <div className="text-[10px] text-[#8B94A1] font-mono leading-tight">
                {referralCode || "Partner"}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#8B94A1]" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-[#22262D] bg-[#111317] shadow-xl py-2 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150 divide-y divide-[#1E232B]">
              <div className="px-4 py-2.5">
                <div className="font-semibold text-[#E6E8EB] truncate">{brokerName}</div>
                {brokerEmail && (
                  <div className="text-[11px] text-[#8B94A1] truncate mt-0.5">{brokerEmail}</div>
                )}
                {partnerId && (
                  <div className="text-[10px] text-[#C2A878] font-mono mt-1">ID: {partnerId}</div>
                )}
              </div>

              <div className="py-1">
                <Link
                  href="/broker/profile"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-[#8B94A1] hover:text-[#E6E8EB] hover:bg-[#171A1F] transition-colors"
                >
                  <User className="w-4 h-4 text-[#C2A878]" />
                  <span>Partner Profile & KYC</span>
                </Link>
                <Link
                  href="/broker/support"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-[#8B94A1] hover:text-[#E6E8EB] hover:bg-[#171A1F] transition-colors"
                >
                  <HelpCircle className="w-4 h-4 text-[#8B94A1]" />
                  <span>Help & Support</span>
                </Link>
                <Link
                  href="/business-partner/policy"
                  target="_blank"
                  className="flex items-center justify-between px-4 py-2 text-[#8B94A1] hover:text-[#E6E8EB] hover:bg-[#171A1F] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-[#8B94A1]" />
                    <span>Partner Policy</span>
                  </div>
                  <ExternalLink className="w-3 h-3 text-[#566171]" />
                </Link>
              </div>

              <div className="pt-1">
                <form action="/api/v1/auth/logout" method="POST">
                  <button
                    type="submit"
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-red-400 hover:bg-red-500/10 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
