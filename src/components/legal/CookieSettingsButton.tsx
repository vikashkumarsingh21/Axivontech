"use client";

import { useState } from "react";
import { Cookie } from "lucide-react";
import CookiePreferenceModal from "./CookiePreferenceModal";

export default function CookieSettingsButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-40 p-2.5 rounded-full bg-[#10151B]/90 hover:bg-[#151A21] text-[#7E8997] hover:text-emerald-400 border border-[#1E2530] shadow-lg backdrop-blur-md transition-all group print:hidden"
        aria-label="Cookie Preferences"
        title="Privacy & Cookie Preferences"
      >
        <Cookie className="w-4 h-4 transition-transform group-hover:scale-110" />
      </button>

      <CookiePreferenceModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
