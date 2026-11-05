"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { DownloadPopupErrorBoundary } from "./DownloadPopupErrorBoundary";

// Load DailyDownloadPopup lazily without SSR
const DailyDownloadPopup = dynamic(
  () => import("./DailyDownloadPopup").then((m) => m.DailyDownloadPopup),
  { ssr: false }
);

const PORTAL_PREFIXES = [
  "/admin",
  "/executive",
  "/employee",
  "/broker",
  "/client",
  "/manager",
];

export function PortalAppPromptWrapper() {
  const pathname = usePathname();
  const [appConfig, setAppConfig] = useState<{
    enabled: boolean;
    popupEnabled: boolean;
    apkConfigured: boolean;
  }>({
    enabled: false,
    popupEnabled: false,
    apkConfigured: false,
  });

  // Only consider showing if currently navigating inside one of the role portals
  const isPortal = pathname
    ? PORTAL_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
    : false;

  useEffect(() => {
    if (!isPortal) return;

    // Check version and popup toggle status from API
    fetch("/api/v1/app/version", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("App Mode or release not active");
        return res.json();
      })
      .then((data) => {
        const payload = data?.data || data;
        const apkUrl = payload?.apkUrl || data?.apkUrl || payload?.downloadUrl || data?.downloadUrl;
        const popupEnabled = payload?.popupEnabled !== false && data?.popupEnabled !== false;
        const enabled = payload?.enabled !== false && data?.enabled !== false;

        setAppConfig({
          enabled,
          popupEnabled,
          apkConfigured: Boolean(apkUrl),
        });
      })
      .catch(() => {
        // App mode or release info disabled/unavailable
        setAppConfig({
          enabled: false,
          popupEnabled: false,
          apkConfigured: false,
        });
      });
  }, [isPortal, pathname]);

  if (!isPortal) return null;
  if (!appConfig.enabled || !appConfig.popupEnabled || !appConfig.apkConfigured) return null;

  return (
    <DownloadPopupErrorBoundary>
      <DailyDownloadPopup
        isMasterEnabled={appConfig.enabled}
        isPopupEnabled={appConfig.popupEnabled}
        apkConfigured={appConfig.apkConfigured}
      />
    </DownloadPopupErrorBoundary>
  );
}
