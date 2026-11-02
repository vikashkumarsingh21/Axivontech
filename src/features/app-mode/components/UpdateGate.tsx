"use client";

import React, { useState, useEffect } from "react";
import { Download, AlertTriangle, Info, X } from "lucide-react";
import { useAppMode } from "../useAppMode";

export interface VersionInfo {
  latestVersion: string;
  minVersion: string;
  apkUrl: string;
  notes?: string;
}

/**
 * Robust Semver comparator.
 * Returns -1 if v1 < v2, 0 if v1 == v2, 1 if v1 > v2.
 */
export function compareVersions(v1: string, v2: string): number {
  const parse = (v: string) => v.replace(/^v/i, "").split(".").map((n) => parseInt(n, 10) || 0);
  const p1 = parse(v1);
  const p2 = parse(v2);

  const len = Math.max(p1.length, p2.length);
  for (let i = 0; i < len; i++) {
    const num1 = p1[i] || 0;
    const num2 = p2[i] || 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
}

export function UpdateGate() {
  const { isAppMode, version } = useAppMode();
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [dismissBanner, setDismissBanner] = useState(false);

  useEffect(() => {
    if (!isAppMode) return;

    fetch("/api/v1/app/version")
      .then((res) => {
        if (!res.ok) throw new Error("Could not fetch version");
        return res.json();
      })
      .then((data: VersionInfo) => {
        setVersionInfo(data);
      })
      .catch(() => {
        // Fallback: don't block if version endpoint fails
      });
  }, [isAppMode]);

  // Only active inside App Mode
  if (!isAppMode || !versionInfo || !version || version === "dev") {
    return null;
  }

  const isBelowMin = compareVersions(version, versionInfo.minVersion) < 0;
  const isBelowLatest = compareVersions(version, versionInfo.latestVersion) < 0;

  // 1. Mandatory Update Required (Blocking Screen)
  if (isBelowMin) {
    return (
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="update-required-title"
        className="fixed inset-0 z-[999999] bg-[#0B0D10] flex flex-col items-center justify-center p-6 text-center text-[#F3F5F7]"
      >
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <h1 id="update-required-title" className="text-2xl font-bold tracking-tight mb-2">
          Update Required
        </h1>

        <p className="max-w-sm text-sm text-neutral-400 mb-6 leading-relaxed">
          Your installed version of Axivon App (v{version}) is no longer supported. Please update to version {versionInfo.latestVersion} to continue using the portal.
        </p>

        {versionInfo.notes && (
          <div className="max-w-sm w-full p-4 mb-6 rounded-xl bg-white/5 border border-white/10 text-xs text-neutral-300 text-left">
            <span className="font-semibold block mb-1 text-white">What&apos;s New:</span>
            {versionInfo.notes}
          </div>
        )}

        <a
          href={versionInfo.apkUrl}
          download="axivon-app.apk"
          className="min-h-[48px] px-8 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-[#04130E] font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-500/20"
        >
          <Download className="w-4 h-4" />
          <span>Download Update (v{versionInfo.latestVersion})</span>
        </a>
      </div>
    );
  }

  // 2. Optional Update Available (Dismissible Top Banner)
  if (isBelowLatest && !dismissBanner) {
    return (
      <div
        role="region"
        aria-label="App update notification"
        className="bg-emerald-950/80 border-b border-emerald-500/30 text-emerald-200 px-4 py-2.5 text-xs flex items-center justify-between gap-3 sticky top-0 z-[99999] backdrop-blur"
      >
        <div className="flex items-center gap-2 truncate">
          <Info className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="truncate">
            A new version (v{versionInfo.latestVersion}) is available.
          </span>
          <a
            href={versionInfo.apkUrl}
            download="axivon-app.apk"
            className="font-bold underline text-white hover:text-emerald-300 ml-1 shrink-0"
          >
            Update Now
          </a>
        </div>

        <button
          type="button"
          onClick={() => setDismissBanner(true)}
          className="p-1 text-emerald-300/70 hover:text-white shrink-0"
          aria-label="Dismiss update banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return null;
}
