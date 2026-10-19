"use client";

import { useState, useEffect } from "react";
import { X, ShieldCheck, Check, Info, Lock } from "lucide-react";
import {
  CookieConsentPreferences,
  getStoredConsent,
  saveConsent,
  acceptAllCookies,
  rejectOptionalCookies,
} from "@/lib/legal/cookie-consent";

interface CookiePreferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CookiePreferenceModal({ isOpen, onClose }: CookiePreferenceModalProps) {
  const [preferences, setPreferences] = useState({
    necessary: true,
    preferences: false,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    if (isOpen) {
      const stored = getStoredConsent();
      if (stored) {
        setPreferences({
          necessary: true,
          preferences: Boolean(stored.preferences),
          analytics: Boolean(stored.analytics),
          marketing: Boolean(stored.marketing),
        });
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    saveConsent(preferences);
    onClose();
  };

  const handleAcceptAll = () => {
    acceptAllCookies();
    onClose();
  };

  const handleRejectAll = () => {
    rejectOptionalCookies();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-modal-title"
        className="w-full max-w-2xl bg-[#10151B] border border-[#1E2530] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#1E2530] bg-[#151A21]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 id="cookie-modal-title" className="text-base font-bold text-[#F3F5F7]">
                Privacy & Cookie Preferences
              </h2>
              <p className="text-xs text-[#7E8997]">
                Manage how cookies and tracking technologies are utilized across Axivon ONE.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#7E8997] hover:text-[#F3F5F7] hover:bg-[#1B222B] transition-colors"
            aria-label="Close preferences"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Categories */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Strictly Necessary */}
          <div className="p-4 rounded-xl bg-[#151A21]/60 border border-[#1E2530] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1 pr-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#F3F5F7]">Strictly Necessary Cookies</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  Always Active
                </span>
              </div>
              <p className="text-xs text-[#7E8997] leading-relaxed">
                Essential for core navigation, authentication tokens, CSRF protection, and Cloudflare Turnstile anti-bot security. These cannot be switched off.
              </p>
            </div>
            <div className="shrink-0 flex items-center">
              <span className="text-xs font-mono text-[#566171] flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-emerald-500" />
                Required
              </span>
            </div>
          </div>

          {/* Preferences */}
          <div className="p-4 rounded-xl bg-[#151A21]/60 border border-[#1E2530] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1 pr-4">
              <span className="text-sm font-semibold text-[#F3F5F7]">Preferences & Functional</span>
              <p className="text-xs text-[#7E8997] leading-relaxed">
                Enables the website to remember choices you make (such as dismissed banners, layout filters, and localized UI settings).
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={preferences.preferences}
                onChange={(e) => setPreferences({ ...preferences, preferences: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#1E2530] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#566171] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
            </label>
          </div>

          {/* Analytics */}
          <div className="p-4 rounded-xl bg-[#151A21]/60 border border-[#1E2530] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1 pr-4">
              <span className="text-sm font-semibold text-[#F3F5F7]">Performance & Analytics (Google Analytics)</span>
              <p className="text-xs text-[#7E8997] leading-relaxed">
                Collects aggregated, anonymous telemetry to help us understand which pages are visited most and how users interact with our platform.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={preferences.analytics}
                onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#1E2530] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#566171] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
            </label>
          </div>

          {/* Marketing */}
          <div className="p-4 rounded-xl bg-[#151A21]/60 border border-[#1E2530] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1 pr-4">
              <span className="text-sm font-semibold text-[#F3F5F7]">Marketing & Referral Attribution</span>
              <p className="text-xs text-[#7E8997] leading-relaxed">
                Used strictly to attribute partner and broker referrals when clients start projects through unique partner codes. We do not engage in third-party ad profiling.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={preferences.marketing}
                onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#1E2530] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#566171] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#1E2530] bg-[#151A21] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleRejectAll}
              className="px-3.5 py-2 text-xs font-semibold text-[#A7B0BC] hover:text-[#F3F5F7] bg-[#10151B] border border-[#29313B] rounded-lg transition-colors cursor-pointer"
            >
              Reject Optional
            </button>
            <button
              onClick={handleAcceptAll}
              className="px-3.5 py-2 text-xs font-semibold text-[#A7B0BC] hover:text-[#F3F5F7] bg-[#10151B] border border-[#29313B] rounded-lg transition-colors cursor-pointer"
            >
              Accept All
            </button>
          </div>

          <button
            onClick={handleSave}
            className="px-5 py-2 text-xs font-bold text-[#04130E] bg-emerald-500 hover:bg-emerald-400 rounded-lg transition-colors shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
