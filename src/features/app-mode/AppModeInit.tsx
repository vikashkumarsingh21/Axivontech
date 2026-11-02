"use client";

import { useEffect } from "react";
import { useAppMode } from "./useAppMode";
import "./app-mode.css";

/**
 * AppModeInit mounts in the root layout to:
 * 1. Synchronously set data-app="true" on <html> when App Mode is active.
 * 2. Scope CSS and suppress marketing elements when running in Android WebView.
 * 3. Zero footprint when in standard web browsers.
 */
export function AppModeInit() {
  const { isAppMode } = useAppMode();

  useEffect(() => {
    if (typeof document === "undefined") return;

    if (isAppMode) {
      document.documentElement.setAttribute("data-app", "true");
    } else {
      document.documentElement.removeAttribute("data-app");
    }
  }, [isAppMode]);

  return null;
}
