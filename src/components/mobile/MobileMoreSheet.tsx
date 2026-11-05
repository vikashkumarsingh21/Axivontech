"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, ChevronRight, LogOut, Info, ShieldCheck } from "lucide-react";
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
  const config = ROLE_CONFIGS[role] || ROLE_CONFIGS.EMPLOYEE;
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
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet Container */}
      <div
        ref={sheetRef}
        className="relative z-10 w-full max-w-lg mx-auto max-h-[85vh] rounded-t-3xl bg-white border-t border-slate-200 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-200 ease-out"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-more-title"
      >
        {/* Drag Handle Indicator */}
        <div className="flex justify-center pt-3 pb-1" onClick={onClose}>
          <div className="h-1.5 w-12 rounded-full bg-slate-300" />
        </div>

        {/* Sheet Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
          <div className="min-w-0 pr-3">
            <div className="flex items-center gap-2">
              <h2 id="mobile-more-title" className="text-base font-bold text-slate-900 truncate">
                {userName}
              </h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200/60">
                {role.replace(/_/g, " ")}
              </span>
            </div>
            {Boolean(userEmail) && (
              <p className="text-xs text-slate-500 truncate mt-0.5">{userEmail}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 active:scale-95 transition-transform"
            aria-label="Close sheet"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Navigation Items */}
        <div className="overflow-y-auto px-4 py-3 divide-y divide-slate-100">
          <div className="space-y-1 pb-3">
            {config.moreItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 active:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 border border-slate-200 text-teal-700">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="truncate">
                      <div className="text-sm font-semibold text-slate-800">{item.label}</div>
                      {Boolean(item.description) && (
                        <div className="text-xs text-slate-500 truncate">{item.description}</div>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
                </Link>
              );
            })}
          </div>

          {/* App Info & About Tile */}
          <div className="py-2 space-y-1">
            <Link
              href="/app/profile"
              onClick={onClose}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 active:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 border border-slate-200 text-slate-700">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-800">Security & App Profile</div>
                  <div className="text-xs text-slate-500">Biometrics, password & settings</div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
            </Link>
          </div>

          {/* Destructive Action: Logout */}
          <div className="pt-3">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-between px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 border border-red-200/60 text-red-600">
                  <LogOut className="h-4 w-4" />
                </div>
                <span className="text-sm font-bold">Sign Out of Workspace</span>
              </div>
              <ChevronRight className="h-4 w-4 text-red-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
