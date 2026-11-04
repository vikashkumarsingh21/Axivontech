"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, ChevronRight, LogOut } from "lucide-react";
import type { MobileRole } from "./types";
import { ROLE_CONFIGS } from "./roleConfig";

interface MobileMoreSheetProps {
  role: MobileRole;
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  userEmail?: string;
}

export function MobileMoreSheet({
  role,
  isOpen,
  onClose,
  userName = "User",
  userEmail = "",
}: MobileMoreSheetProps) {
  const router = useRouter();
  const config = ROLE_CONFIGS[role];
  const sheetRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogout = async () => {
    try {
      await fetch("/api/v1/auth/logout", { method: "POST" });
    } catch (e) {
      // Ignore network errors on logout
    }
    onClose();
    const isApp = typeof navigator !== "undefined" && navigator.userAgent.includes("AxivonApp");
    window.location.href = isApp ? "/app/login?logged_out=1" : "/login?logged_out=1";
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet Container */}
      <div
        ref={sheetRef}
        className="relative z-10 w-full max-h-[85vh] rounded-t-2xl bg-[#1A1A1B] border-t border-[#2E2E30] pb-[calc(env(safe-area-inset-bottom)+1.5rem)] shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-200 ease-out"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-more-title"
      >
        {/* Drag Handle Indicator */}
        <div className="flex justify-center pt-3 pb-1" onClick={onClose}>
          <div className="h-1.5 w-10 rounded-full bg-[#38383A]" />
        </div>

        {/* Sheet Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#2E2E30]">
          <div>
            <h2 id="mobile-more-title" className="text-base font-semibold text-[#EDEBE6]">
              {userName}
            </h2>
            {Boolean(userEmail) && (
              <p className="text-xs text-[#B3AFA6] truncate max-w-[240px]">{userEmail}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#232324] text-[#B3AFA6] hover:text-[#EDEBE6] active:scale-95 transition-transform"
            aria-label="Close sheet"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Navigation Items */}
        <div className="overflow-y-auto px-4 py-3 divide-y divide-[#242426]">
          <div className="space-y-1 pb-3">
            {config.moreItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-[#232324] active:bg-[#232324] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#232324] border border-[#2E2E30] text-[#4F9D83]">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="truncate">
                      <div className="text-sm font-medium text-[#EDEBE6]">{item.label}</div>
                      {Boolean(item.description) && (
                        <div className="text-xs text-[#B3AFA6] truncate">{item.description}</div>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#827E76] shrink-0" />
                </Link>
              );
            })}
          </div>

          {/* Destructive Action: Logout */}
          <div className="pt-3">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-between px-3 py-3 rounded-xl text-[#C85555] hover:bg-[#C85555]/10 active:bg-[#C85555]/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#C85555]/10 border border-[#C85555]/20 text-[#C85555]">
                  <LogOut className="h-4 w-4" />
                </div>
                <span className="text-sm font-semibold">Log Out</span>
              </div>
              <ChevronRight className="h-4 w-4 text-[#C85555]/70" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
