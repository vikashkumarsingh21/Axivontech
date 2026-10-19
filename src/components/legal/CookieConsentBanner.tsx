"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, ShieldCheck, X, Sliders } from "lucide-react";
import {
  getStoredConsent,
  acceptAllCookies,
  rejectOptionalCookies,
  CONSENT_EVENT_NAME,
} from "@/lib/legal/cookie-consent";
import CookiePreferenceModal from "./CookiePreferenceModal";

export default function CookieConsentBanner() {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = getStoredConsent();
    if (!stored) {
      // Delay slightly for smooth entrance
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const handleConsentUpdate = () => {
      setIsVisible(false);
    };
    window.addEventListener(CONSENT_EVENT_NAME, handleConsentUpdate);
    return () => window.removeEventListener(CONSENT_EVENT_NAME, handleConsentUpdate);
  }, []);

  if (!mounted) return null;

  const handleAcceptAll = () => {
    acceptAllCookies();
    setIsVisible(false);
  };

  const handleRejectOptional = () => {
    rejectOptionalCookies();
    setIsVisible(false);
  };

  return (
    <>
      {isVisible && (
        <aside
          aria-label="Cookie consent banner"
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in slide-in-from-bottom-5 duration-300"
        >
          <div className="bg-[#10151B] border border-[#1E2530] rounded-2xl p-5 shadow-2xl backdrop-blur-xl relative">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                <Cookie className="w-5 h-5" />
              </div>
              <div className="flex-1 pr-6">
                <h3 className="text-sm font-bold text-[#F3F5F7] mb-1">
                  We Respect Your Privacy
                </h3>
                <p className="text-xs text-[#A7B0BC] leading-relaxed">
                  We use cookies to maintain secure sessions, verify anti-bot protection, and understand how our services are used in compliance with the DPDP Act 2023. Read our{" "}
                  <Link href="/cookie-policy" className="text-emerald-400 hover:underline">
                    Cookie Policy
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy-policy" className="text-emerald-400 hover:underline">
                    Privacy Policy
                  </Link>.
                </p>
              </div>
              <button
                onClick={handleRejectOptional}
                className="absolute top-4 right-4 p-1 text-[#7E8997] hover:text-[#F3F5F7] transition-colors"
                aria-label="Dismiss banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#1E2530]">
              <button
                onClick={handleAcceptAll}
                className="flex-1 min-w-[120px] py-2 px-3 text-xs font-bold text-[#04130E] bg-emerald-500 hover:bg-emerald-400 rounded-lg transition-colors shadow-sm cursor-pointer text-center"
              >
                Accept All
              </button>
              <button
                onClick={handleRejectOptional}
                className="flex-1 min-w-[120px] py-2 px-3 text-xs font-semibold text-[#A7B0BC] hover:text-[#F3F5F7] bg-[#151A21] border border-[#29313B] rounded-lg transition-colors cursor-pointer text-center"
              >
                Reject Non-Essential
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full py-1.5 text-[11px] font-medium text-[#7E8997] hover:text-emerald-400 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sliders className="w-3 h-3" />
                Customize Preferences
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Preferences Modal */}
      <CookiePreferenceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
