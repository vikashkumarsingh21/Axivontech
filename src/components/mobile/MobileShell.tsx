"use client";

import { useState, type ReactNode } from "react";
import { useAppMode } from "@/features/app-mode/useAppMode";
import type { MobileRole } from "./types";
import { MobileTopBar } from "./MobileTopBar";
import { MobileTabBar } from "./MobileTabBar";
import { MobileMoreSheet } from "./MobileMoreSheet";
import { MobilePullToRefresh } from "./MobilePullToRefresh";

interface MobileShellProps {
  role: MobileRole;
  userName?: string;
  userEmail?: string;
  unreadCount?: number;
  customTitle?: string;
  onRefresh?: () => Promise<void>;
  children: ReactNode;
}

export function MobileShell({
  role,
  userName = "User",
  userEmail = "",
  unreadCount = 0,
  customTitle,
  onRefresh,
  children,
}: MobileShellProps) {
  const { isAppMode } = useAppMode();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  // ZERO modification when not in app mode (desktop or normal mobile browser)
  if (!isAppMode) {
    return <>{children}</>;
  }

  return (
    <div
      className="mobile-app-shell flex flex-col min-h-screen w-full bg-[#121212] text-[#EDEBE6] antialiased selection:bg-[#4F9D83]/20"
      data-mobile-shell="true"
    >
      {/* Top App Bar */}
      <MobileTopBar
        role={role}
        userName={userName}
        unreadCount={unreadCount}
        customTitle={customTitle}
      />

      {/* Main Scrollable Content Area with Pull-To-Refresh */}
      <MobilePullToRefresh
        onRefresh={onRefresh}
        className="flex-1 w-full max-w-lg mx-auto px-4 py-4 pb-28 space-y-4"
      >
        {children}
      </MobilePullToRefresh>

      {/* Fixed Bottom Tab Bar */}
      <MobileTabBar
        role={role}
        onOpenMore={() => setIsMoreOpen(true)}
        isMoreOpen={isMoreOpen}
      />

      {/* Slide-Up More Navigation Sheet */}
      <MobileMoreSheet
        role={role}
        isOpen={isMoreOpen}
        onClose={() => setIsMoreOpen(false)}
        userName={userName}
        userEmail={userEmail}
      />
    </div>
  );
}
