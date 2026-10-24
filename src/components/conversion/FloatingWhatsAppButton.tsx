"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { FaWhatsapp } from "react-icons/fa";
import { motion, useReducedMotion } from "framer-motion";
import { isPortalOrStandaloneRoute } from "@/lib/utils";
import { getWhatsAppUrl } from "@/config/contact";
import { trackWhatsAppClick } from "@/lib/analytics";

/**
 * FloatingWhatsAppButton
 * 
 * Sits in the bottom-right corner docked cleanly ABOVE the "Axivon AI" chatbot launcher.
 * Chatbot launcher: bottom-4 right-4 sm:bottom-6 sm:right-6 (height ~48px, top edge at ~64px/72px).
 * WhatsApp button: bottom-20 right-4 sm:bottom-24 sm:right-6 (top edge at ~128px/144px).
 * This guarantees zero physical overlap on mobile (360px) and desktop.
 * Automatically hidden on auth/login, partner portals, and standalone demo pages.
 */
export default function FloatingWhatsAppButton() {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);

  // Hide on /login and partner/broker/admin dashboard portals
  if (isPortalOrStandaloneRoute(pathname)) {
    return null;
  }

  const whatsappHref = getWhatsAppUrl("Hi Axivon, I'd like to discuss a project");

  const handleClick = () => {
    trackWhatsAppClick("floating_whatsapp_button");
  };

  return (
    <aside
      className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-[9998] flex items-center print:hidden"
      aria-label="Direct WhatsApp Consultation"
    >
      <motion.a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        whileHover={shouldReduceMotion ? undefined : { scale: 1.05 }}
        whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
        aria-label="Chat with Axivon Technologies on WhatsApp"
        className="group relative flex h-12 w-12 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_6px_24px_rgba(37,211,102,0.4)] transition-all duration-200 hover:bg-[#22bf5b] hover:shadow-[0_8px_28px_rgba(37,211,102,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0D10]"
      >
        {/* Subtle pulsing background ring */}
        <span
          className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-[#25D366] opacity-30 animate-ping"
          style={{ animationDuration: "2.8s" }}
          aria-hidden="true"
        />

        {/* WhatsApp Icon */}
        <FaWhatsapp className="h-6 w-6 text-white transition-transform duration-200 group-hover:scale-110" />

        {/* Desktop Tooltip (Visible on hover) */}
        <span
          role="tooltip"
          className={`pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-lg border border-[#262626] bg-[#141414] px-3 py-1.5 text-xs font-semibold text-[#F3F5F7] shadow-xl backdrop-blur-md transition-all duration-200 hidden sm:inline-block ${
            isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"
          }`}
        >
          Chat on WhatsApp
          <span className="ml-1 text-[#25D366] font-mono">• Direct</span>
        </span>
      </motion.a>
    </aside>
  );
}
