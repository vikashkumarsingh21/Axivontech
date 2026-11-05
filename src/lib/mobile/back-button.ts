"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "@/lib/notifications/toast";

let lastBackPressTime = 0;

/**
 * Android Hardware Back Button Hook
 * Intercepts Android back key navigation to guarantee:
 * - Nested screens go back within the app stack
 * - Modals / Sheets close safely
 * - Root dashboards require double-tap to minimize/exit, preventing accidental app exits
 * - NEVER leaks or redirects to the public marketing website
 */
export function useAndroidBackButton(onCloseModal?: () => boolean) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleBackButton = () => {
      // 1. If an active modal/sheet callback returns true, it handled the back press
      if (onCloseModal && onCloseModal()) {
        return;
      }

      // 2. If at root dashboard or login, handle double-tap exit prevention
      const isRoot =
        pathname === "/app" ||
        pathname === "/app/login" ||
        pathname === "/admin/dashboard" ||
        pathname === "/executive/dashboard" ||
        pathname === "/employee/dashboard" ||
        pathname === "/broker/dashboard" ||
        pathname === "/manager/dashboard" ||
        pathname === "/client/dashboard";

      if (isRoot) {
        const now = Date.now();
        if (now - lastBackPressTime < 2000) {
          // Double tap detected - allow Capacitor or browser to minimize/exit
          try {
            const capApp = (window as any).Capacitor?.Plugins?.App;
            if (capApp?.exitApp) {
              capApp.exitApp();
              return;
            }
          } catch {}
        } else {
          lastBackPressTime = now;
          toast.info("Press back again to exit application");
          return;
        }
      }

      // 3. Otherwise navigate back in history safely
      if (window.history.length > 1) {
        router.back();
      }
    };

    // Listen for Capacitor App backButton event if running natively
    try {
      const capApp = (window as any).Capacitor?.Plugins?.App;
      if (capApp?.addListener) {
        const listener = capApp.addListener("backButton", handleBackButton);
        return () => {
          listener.then((l: any) => l.remove()).catch(() => {});
        };
      }
    } catch {}

    // Web fallback for browser popstate
    const handlePopState = (e: PopStateEvent) => {
      // Keep inside the application
      if (document.referrer && !document.referrer.includes("/app")) {
        e.preventDefault();
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [router, pathname, onCloseModal]);
}
