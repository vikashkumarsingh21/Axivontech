"use client";

import { useState, useEffect } from "react";
import { APP_USER_AGENT_TOKEN, extractAppVersion, APP_DEV_COOKIE } from "./flags";

export interface UseAppModeResult {
  isAppMode: boolean;
  version: string | null;
  isLoading: boolean;
}

function detectSynchronously(): { isApp: boolean; version: string | null } {
  if (typeof document !== "undefined") {
    if (document.documentElement.getAttribute("data-app") === "true") {
      const ver =
        typeof navigator !== "undefined"
          ? extractAppVersion(navigator.userAgent)
          : null;
      return { isApp: true, version: ver };
    }
  }

  if (typeof navigator !== "undefined") {
    const ua = navigator.userAgent || "";
    if (ua.includes(APP_USER_AGENT_TOKEN)) {
      if (typeof document !== "undefined") {
        document.documentElement.setAttribute("data-app", "true");
      }
      return { isApp: true, version: extractAppVersion(ua) };
    }
  }

  if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const queryApp = urlParams.get("app");
      const cookieMatch = document.cookie.match(
        new RegExp(`(?:^|; )${APP_DEV_COOKIE}=([^;]*)`)
      );
      const cookieVal = cookieMatch ? decodeURIComponent(cookieMatch[1]) : null;

      if (
        queryApp === "1" ||
        queryApp === "true" ||
        cookieVal === "1" ||
        cookieVal === "true"
      ) {
        if (typeof document !== "undefined") {
          document.documentElement.setAttribute("data-app", "true");
        }
        return { isApp: true, version: "dev" };
      }
    } catch {
      // Ignore
    }
  }

  return { isApp: false, version: null };
}

/**
 * Client-side React hook to detect and manage Mobile App Mode.
 *
 * Capabilities:
 * - Synchronously detects AxivonApp token in navigator.userAgent
 * - Synchronously detects server-injected data-app="true" on <html>
 * - Enables dev override via ?app=1 or cookie axivon_app_dev=1 when NODE_ENV !== "production"
 * - Synchronously updates document.documentElement with data-app="true"
 */
export function useAppMode(): UseAppModeResult {
  const initial = detectSynchronously();
  const [isAppMode, setIsAppMode] = useState<boolean>(initial.isApp);
  const [version, setVersion] = useState<string | null>(initial.version);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const detected = detectSynchronously();
    setIsAppMode(detected.isApp);
    setVersion(detected.version);
    setIsLoading(false);

    if (detected.isApp) {
      document.documentElement.setAttribute("data-app", "true");
    } else {
      document.documentElement.removeAttribute("data-app");
    }
  }, []);

  return { isAppMode, version, isLoading };
}
