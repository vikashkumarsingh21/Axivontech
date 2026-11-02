"use client";

import { useState, useEffect } from "react";
import { APP_USER_AGENT_TOKEN, extractAppVersion, APP_DEV_COOKIE } from "./flags";

export interface UseAppModeResult {
  isAppMode: boolean;
  version: string | null;
  isLoading: boolean;
}

/**
 * Client-side React hook to detect and manage Mobile App Mode.
 *
 * Capabilities:
 * - Detects AxivonApp token in navigator.userAgent
 * - Detects server-injected data-app="true" on <html>
 * - Enables dev override via ?app=1 or cookie axivon_app_dev=1 when NODE_ENV !== "production"
 * - Synchronously updates document.documentElement with data-app="true"
 */
export function useAppMode(): UseAppModeResult {
  const [isAppMode, setIsAppMode] = useState<boolean>(() => {
    if (typeof document !== "undefined") {
      return document.documentElement.getAttribute("data-app") === "true";
    }
    return false;
  });

  const [version, setVersion] = useState<string | null>(() => {
    if (typeof navigator !== "undefined") {
      return extractAppVersion(navigator.userAgent);
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ua = navigator.userAgent || "";
    const isUaApp = ua.includes(APP_USER_AGENT_TOKEN);
    const parsedVersion = extractAppVersion(ua);

    let devOverride = false;
    if (process.env.NODE_ENV !== "production") {
      const urlParams = new URLSearchParams(window.location.search);
      const queryApp = urlParams.get("app");
      const cookieMatch = document.cookie.match(new RegExp(`(?:^|; )${APP_DEV_COOKIE}=([^;]*)`));
      const cookieVal = cookieMatch ? decodeURIComponent(cookieMatch[1]) : null;

      if (queryApp === "1" || queryApp === "true" || cookieVal === "1" || cookieVal === "true") {
        devOverride = true;
      }
    }

    const active = isUaApp || devOverride;

    setIsAppMode(active);
    setVersion(parsedVersion || (devOverride ? "dev" : null));
    setIsLoading(false);

    if (active) {
      document.documentElement.setAttribute("data-app", "true");
    } else {
      document.documentElement.removeAttribute("data-app");
    }
  }, []);

  return { isAppMode, version, isLoading };
}
