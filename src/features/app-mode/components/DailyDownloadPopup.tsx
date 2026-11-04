"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { X, Smartphone, Download, Share2, Copy, Check, ChevronDown, ChevronUp, Globe } from "lucide-react";
import { QrCodeSvg } from "./QrCodeSvg";
import { useAppMode } from "../useAppMode";

export interface DailyDownloadPopupProps {
  apkConfigured?: boolean;
  downloadUrl?: string;
  isMasterEnabled?: boolean;
  isPopupEnabled?: boolean;
}

const STORAGE_KEY = "axivon_app_prompt_last_date";
const DOWNLOAD_PAGE_URL = "https://axivontech.in/download";

/**
 * Returns today's calendar date in Asia/Kolkata timezone (YYYY-MM-DD).
 */
export function getKolkataDateString(): string {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  } catch {
    return new Date().toISOString().split("T")[0];
  }
}

export function DailyDownloadPopup({
  apkConfigured = true,
  downloadUrl = "/download/axivon-app",
  isMasterEnabled = true,
  isPopupEnabled = true,
}: DailyDownloadPopupProps) {
  const { isAppMode } = useAppMode();
  const [isOpen, setIsOpen] = useState(false);
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [copied, setCopied] = useState(false);
  const [showInstallSteps, setShowInstallSteps] = useState(false);
  const [platform, setPlatform] = useState<"android" | "ios" | "desktop">("desktop");

  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Platform detection
  useEffect(() => {
    if (typeof navigator === "undefined") return;
    const ua = navigator.userAgent || "";
    if (/android/i.test(ua)) {
      setPlatform("android");
    } else if (/iphone|ipad|ipod/i.test(ua)) {
      setPlatform("ios");
    } else {
      setPlatform("desktop");
    }
  }, []);

  // Determine if popup should display
  useEffect(() => {
    // 1. Hard kill switch guards
    if (!isMasterEnabled || !isPopupEnabled || !apkConfigured) return;

    // 2. Never show inside app mode
    if (isAppMode) return;

    // 3. Check triggers: show every time anyone logs in, or on fresh browser session
    let shouldShow = false;
    let delay = 1200;

    try {
      const justLoggedIn = sessionStorage.getItem("axivon_app_prompt_pending") === "true";
      const dismissedInSession = sessionStorage.getItem("axivon_app_prompt_dismissed") === "true";

      if (justLoggedIn) {
        shouldShow = true;
        delay = 600;
      } else if (!dismissedInSession) {
        shouldShow = true;
        delay = 1200;
      }
    } catch {
      // Fallback if sessionStorage is restricted
      shouldShow = true;
    }

    if (!shouldShow) return;

    // 4. Trigger modal smoothly after dashboard renders
    const timer = setTimeout(() => {
      previousFocusRef.current = document.activeElement as HTMLElement;
      setIsOpen(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [isMasterEnabled, isPopupEnabled, apkConfigured, isAppMode]);

  const handleClose = useCallback(() => {
    try {
      sessionStorage.setItem("axivon_app_prompt_dismissed", "true");
      sessionStorage.removeItem("axivon_app_prompt_pending");
    } catch {
      // Storage might be restricted in private mode
    }
    setIsOpen(false);

    // Return focus to previous element for accessibility
    if (previousFocusRef.current && typeof previousFocusRef.current.focus === "function") {
      previousFocusRef.current.focus();
    }
  }, []);

  const handleDownloadAction = useCallback(() => {
    try {
      sessionStorage.setItem("axivon_app_prompt_dismissed", "true");
      sessionStorage.removeItem("axivon_app_prompt_pending");
    } catch {
      // Storage might be restricted in private mode
    }
  }, []);

  // Keyboard navigation & Focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
        return;
      }

      if (e.key === "Tab" && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(DOWNLOAD_PAGE_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  const content = {
    en: {
      title: "Get the Axivon app",
      body: "Mark your attendance and manage everything from your phone with the Axivon app.",
      downloadBtn: "Download App",
      downloadApkDirectly: "Download APK for Android",
      howToInstall: "How to install APK?",
      step1: "1. Tap 'Download App' and confirm the APK file download.",
      step2: "2. If prompted, allow 'Install unknown apps' for your browser.",
      step3: "3. Open the downloaded file and tap Install to launch.",
      iosTitle: "Add Axivon to Home Screen",
      iosStep1: "1. Tap the Share icon at the bottom of Safari.",
      iosStep2: "2. Scroll down and select 'Add to Home Screen'.",
      iosStep3: "3. Tap 'Add' in the top right corner.",
      desktopTitle: "Scan with your Android phone",
      desktopDesc: "Point your phone camera at the QR code to open on mobile:",
      copyLink: "Copy Link",
      copied: "Link Copied!",
      close: "Close dialog",
    },
    hi: {
      title: "Axivon app download karein",
      body: "Axivon app se apni attendance lagayein aur sab kuch apne phone se manage karein.",
      downloadBtn: "App Download Karein",
      downloadApkDirectly: "Android ke liye APK Download Karein",
      howToInstall: "APK kaise install karein?",
      step1: "1. 'App Download Karein' par tap karein aur APK download confirm karein.",
      step2: "2. Browser settings mein 'Install unknown apps' allow karein.",
      step3: "3. Downloaded file ko open karke Install par tap karein.",
      iosTitle: "Axivon ko Home Screen par jodein",
      iosStep1: "1. Safari mein neeche diye Share icon par tap karein.",
      iosStep2: "2. Neeche scroll karke 'Add to Home Screen' chunein.",
      iosStep3: "3. Upar right corner mein 'Add' par tap karein.",
      desktopTitle: "Apne phone se scan karein",
      desktopDesc: "Mobile par kholne ke liye camera se QR code scan karein:",
      copyLink: "Link Copy Karein",
      copied: "Link Copy Ho Gaya!",
      close: "Band karein",
    },
  }[lang];

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm transition-opacity duration-200"
      onClick={handleClose}
      aria-hidden="false"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-download-title"
        className="relative w-full max-w-md bg-[#0E1116] border border-white/10 rounded-2xl p-6 sm:p-7 shadow-2xl text-[#F3F5F7] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Language Switcher and Close Button */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => setLang(lang === "en" ? "hi" : "en")}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-neutral-300 transition-colors"
            aria-label="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>{lang === "en" ? "हिन्दी" : "English"}</span>
          </button>

          <button
            type="button"
            onClick={handleClose}
            className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label={content.close}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Icon & Title */}
        <div className="flex items-start gap-3.5 mb-3">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h2 id="app-download-title" className="text-xl font-bold tracking-tight text-white">
              {content.title}
            </h2>
            <p className="mt-1 text-sm text-neutral-400 leading-relaxed">
              {content.body}
            </p>
          </div>
        </div>

        {/* Dynamic Platform Section */}
        <div className="mt-5 pt-4 border-t border-white/10">
          {platform === "android" && (
            <div className="space-y-3">
              <a
                href={downloadUrl}
                download="axivon-app.apk"
                onClick={handleDownloadAction}
                className="w-full min-h-[44px] px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-[#04130E] font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-500/20"
              >
                <Download className="w-4 h-4" />
                <span>{content.downloadBtn}</span>
              </a>

              {/* Expander: How to install */}
              <div className="rounded-lg bg-white/5 border border-white/5 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowInstallSteps(!showInstallSteps)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 flex items-center justify-between text-xs text-neutral-300 hover:text-white transition-colors"
                >
                  <span className="font-medium">{content.howToInstall}</span>
                  {showInstallSteps ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {showInstallSteps && (
                  <div className="p-3.5 pt-1 text-xs text-neutral-400 space-y-1.5 border-t border-white/5">
                    <p>{content.step1}</p>
                    <p>{content.step2}</p>
                    <p>{content.step3}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {platform === "ios" && (
            <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2 text-xs text-neutral-300">
              <div className="flex items-center gap-2 font-semibold text-emerald-400 text-sm">
                <Share2 className="w-4 h-4" />
                <span>{content.iosTitle}</span>
              </div>
              <p>{content.iosStep1}</p>
              <p>{content.iosStep2}</p>
              <p>{content.iosStep3}</p>
            </div>
          )}

          {platform === "desktop" && (
            <div className="space-y-4">
              <a
                href={downloadUrl}
                download="axivon-app.apk"
                onClick={handleDownloadAction}
                className="w-full min-h-[44px] px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-[#04130E] font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-500/20"
              >
                <Download className="w-4 h-4" />
                <span>{content.downloadApkDirectly}</span>
              </a>

              <div className="flex flex-col items-center text-center space-y-3 pt-3 border-t border-white/5">
                <p className="text-xs text-neutral-400">{content.desktopDesc}</p>
                <div className="p-2 bg-white rounded-xl shadow-inner">
                  <QrCodeSvg value={DOWNLOAD_PAGE_URL} size={135} />
                </div>
                <div className="flex items-center gap-2 w-full pt-1">
                  <input
                    type="text"
                    readOnly
                    value={DOWNLOAD_PAGE_URL}
                    className="flex-1 min-h-[40px] px-3 text-xs bg-black/40 border border-white/10 rounded-lg text-neutral-300 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="min-h-[40px] px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-white inline-flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? content.copied : content.copyLink}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
