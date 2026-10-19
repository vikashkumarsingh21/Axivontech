"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, ShieldCheck, Check, Lock, ChevronRight, Sliders, ArrowLeft } from "lucide-react";
import {
  CookieConsentPreferences,
  getStoredConsent,
  saveConsent,
  acceptAllCookies,
  rejectOptionalCookies,
} from "@/lib/legal/cookie-consent";

export default function CookiePreferencesPageClient() {
  const [preferences, setPreferences] = useState({
    necessary: true,
    preferences: false,
    analytics: false,
    marketing: false,
  });
  const [savedNotification, setSavedNotification] = useState(false);

  useEffect(() => {
    const stored = getStoredConsent();
    if (stored) {
      setPreferences({
        necessary: true,
        preferences: Boolean(stored.preferences),
        analytics: Boolean(stored.analytics),
        marketing: Boolean(stored.marketing),
      });
    }
  }, []);

  const handleSave = () => {
    saveConsent(preferences);
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3500);
  };

  const handleAcceptAll = () => {
    acceptAllCookies();
    setPreferences({ necessary: true, preferences: true, analytics: true, marketing: true });
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3500);
  };

  const handleRejectOptional = () => {
    rejectOptionalCookies();
    setPreferences({ necessary: true, preferences: false, analytics: false, marketing: false });
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Navigation */}
      <div className="mb-6 flex items-center gap-2 text-xs text-[#7E8997]">
        <Link href="/legal" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Legal & Privacy Center
        </Link>
      </div>

      {/* Header */}
      <div className="bg-[#10151B] border border-[#1E2530] rounded-2xl p-6 sm:p-10 mb-8 shadow-xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Cookie className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F3F5F7] tracking-tight">
              Cookie Preferences Manager
            </h1>
            <p className="text-xs text-[#7E8997] mt-0.5">
              Control which categories of cookies and telemetry are permitted on your device.
            </p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[#A7B0BC] leading-relaxed mt-4">
          Axivon Technologies strictly complies with India&apos;s Digital Personal Data Protection Act 2023. Non-essential cookies such as Google Analytics are blocked by default until you grant affirmative consent. You can modify or withdraw your consent below at any time. For more information, read our full{" "}
          <Link href="/cookie-policy" className="text-emerald-400 hover:underline">
            Cookie Policy
          </Link>.
        </p>

        {savedNotification && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs sm:text-sm text-emerald-400 flex items-center gap-2 animate-in fade-in duration-200">
            <Check className="w-4 h-4 shrink-0" />
            <span>Your preferences have been saved and applied across this session.</span>
          </div>
        )}
      </div>

      {/* Categories */}
      <div className="space-y-4 mb-8">
        {/* Strictly Necessary */}
        <div className="bg-[#10151B] border border-[#1E2530] rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 pr-4">
              <div className="flex items-center gap-2.5">
                <h3 className="text-sm font-bold text-[#F3F5F7]">Strictly Necessary Cookies</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  Always Active
                </span>
              </div>
              <p className="text-xs text-[#A7B0BC] leading-relaxed">
                Required for core website security, server load balancing, session persistence for authenticated portals, and Cloudflare Turnstile anti-bot verification.
              </p>
            </div>
            <span className="text-xs font-mono text-[#566171] flex items-center gap-1 shrink-0">
              <Lock className="w-3.5 h-3.5 text-emerald-500" />
              Statutory Exemption
            </span>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-[#10151B] border border-[#1E2530] rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 pr-4">
              <h3 className="text-sm font-bold text-[#F3F5F7]">Preferences & Functional</h3>
              <p className="text-xs text-[#A7B0BC] leading-relaxed">
                Remembers your UI settings, dismissed notices, and saved filters between visits for a seamless experience.
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
        </div>

        {/* Analytics */}
        <div className="bg-[#10151B] border border-[#1E2530] rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 pr-4">
              <h3 className="text-sm font-bold text-[#F3F5F7]">Performance & Analytics (Google Analytics)</h3>
              <p className="text-xs text-[#A7B0BC] leading-relaxed">
                Allows us to count aggregate visits, traffic sources, and popular content. All IP addresses are anonymized and scripts do not load until this toggle is enabled.
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
        </div>

        {/* Marketing */}
        <div className="bg-[#10151B] border border-[#1E2530] rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 pr-4">
              <h3 className="text-sm font-bold text-[#F3F5F7]">Marketing & Referral Attribution</h3>
              <p className="text-xs text-[#A7B0BC] leading-relaxed">
                Tracks qualifying referral links for registered Business Partners and Brokers. We do not participate in cross-site behavioral retargeting.
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
      </div>

      {/* Action Bar */}
      <div className="bg-[#10151B] border border-[#1E2530] rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleRejectOptional}
            className="px-4 py-2 text-xs font-semibold text-[#A7B0BC] hover:text-[#F3F5F7] bg-[#151A21] border border-[#29313B] rounded-xl transition-colors cursor-pointer"
          >
            Reject Optional
          </button>
          <button
            onClick={handleAcceptAll}
            className="px-4 py-2 text-xs font-semibold text-[#A7B0BC] hover:text-[#F3F5F7] bg-[#151A21] border border-[#29313B] rounded-xl transition-colors cursor-pointer"
          >
            Accept All
          </button>
        </div>

        <button
          onClick={handleSave}
          className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-[#04130E] text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-2"
        >
          <Check className="w-4 h-4" />
          Save Preferences
        </button>
      </div>
    </div>
  );
}
