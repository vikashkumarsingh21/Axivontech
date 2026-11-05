"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import type { MobileRole } from "./types";
import { ROLE_CONFIGS } from "./roleConfig";

interface MobileTabBarProps {
  role: MobileRole;
  onOpenMore: () => void;
  isMoreOpen?: boolean;
}

export function MobileTabBar({ role, onOpenMore, isMoreOpen = false }: MobileTabBarProps) {
  const pathname = usePathname();
  const config = ROLE_CONFIGS[role] || ROLE_CONFIGS.EMPLOYEE;
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  // Reliable keyboard detection via focus events on editable elements
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.getAttribute("contenteditable") === "true")
      ) {
        setIsKeyboardOpen(true);
      }
    };

    const handleFocusOut = () => {
      setIsKeyboardOpen(false);
    };

    window.addEventListener("focusin", handleFocusIn);
    window.addEventListener("focusout", handleFocusOut);

    return () => {
      window.removeEventListener("focusin", handleFocusIn);
      window.removeEventListener("focusout", handleFocusOut);
    };
  }, []);

  if (isKeyboardOpen) {
    return null;
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-2px_10px_rgba(0,0,0,0.04)] pb-[env(safe-area-inset-bottom)]"
      role="navigation"
      aria-label="Mobile Navigation Bar"
    >
      <div className="flex h-15 items-center justify-around px-2 max-w-lg mx-auto">
        {config.tabs.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`relative flex flex-col items-center justify-center w-16 py-1.5 transition-colors ${
                isActive
                  ? "text-teal-700 font-semibold"
                  : "text-slate-500 hover:text-slate-900 font-medium"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <div className="relative flex items-center justify-center">
                <Icon className={`h-5 w-5 ${isActive ? "stroke-[2.25] text-teal-700" : "stroke-[1.75]"}`} />
                {Boolean(tab.badgeCount && tab.badgeCount > 0) && (
                  <span className="absolute -top-1 -right-1.5 h-2 w-2 rounded-full bg-teal-600 ring-2 ring-white" />
                )}
              </div>
              <span className={`text-[11px] mt-1 leading-tight tracking-tight ${isActive ? "font-bold text-teal-800" : ""}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-8 h-0.5 bg-teal-600 rounded-full" />
              )}
            </Link>
          );
        })}

        {/* 5th Tab: "More" Action Button */}
        <button
          type="button"
          onClick={onOpenMore}
          className={`relative flex flex-col items-center justify-center w-16 py-1.5 transition-colors ${
            isMoreOpen
              ? "text-teal-700 font-semibold"
              : "text-slate-500 hover:text-slate-900 font-medium"
          }`}
          aria-label="More navigation items"
        >
          <div className="flex items-center justify-center">
            <MoreHorizontal className={`h-5 w-5 ${isMoreOpen ? "stroke-[2.25] text-teal-700" : "stroke-[1.75]"}`} />
          </div>
          <span className={`text-[11px] mt-1 leading-tight tracking-tight ${isMoreOpen ? "font-bold text-teal-800" : ""}`}>
            More
          </span>
          {isMoreOpen && (
            <span className="absolute bottom-0 w-8 h-0.5 bg-teal-600 rounded-full" />
          )}
        </button>
      </div>
    </nav>
  );
}
