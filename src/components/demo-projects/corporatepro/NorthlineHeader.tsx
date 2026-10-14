"use client";

import React, { useState, useEffect } from "react";
import { Menu, X, ArrowRight, PhoneCall } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_ITEMS = [
  { label: "Approach", href: "#approach", number: "01" },
  { label: "Services", href: "#services", number: "02" },
  { label: "Selected Work", href: "#work", number: "03" },
  { label: "Philosophy", href: "#about", number: "04" },
  { label: "FAQ", href: "#faq", number: "05" },
];

export default function NorthlineHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const targetElement = document.querySelector(href);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-[#F7F5EF]/92 backdrop-blur-md shadow-[0_4px_24px_rgba(41,72,59,0.06)] border-b border-[#29483B]/10 py-3 sm:py-3.5"
          : "bg-[#F7F5EF] border-b border-[#29483B]/8 py-4 sm:py-5"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-10">
        {/* Brand Wordmark */}
        <a
          href="#top"
          onClick={(e) => handleNavClick(e, "#top")}
          className="group flex items-center gap-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#29483B] rounded-xs"
          aria-label="Northline Advisory — Return to top"
        >
          {/* Architectural Monogram */}
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xs bg-[#29483B] text-[#F7F5EF] shadow-xs transition-transform duration-300 group-hover:scale-[1.03]">
            <div className="absolute inset-[2px] border border-[#B87352]/30 rounded-xs pointer-events-none" />
            <span className="font-serif text-lg font-semibold tracking-wider text-[#F7F5EF]">N</span>
          </div>

          <div className="flex flex-col">
            <span className="font-serif text-lg sm:text-xl font-medium tracking-[0.05em] text-[#252925] leading-tight">
              NORTHLINE
            </span>
            <span className="text-[9px] font-semibold tracking-[0.24em] text-[#77796F] uppercase">
              ADVISORY &bull; STRATEGY
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav aria-label="Northline Advisory Main Navigation" className="hidden md:flex items-center gap-7 lg:gap-8">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href)}
              className="group relative py-1 text-[11px] lg:text-xs font-medium uppercase tracking-[0.16em] text-[#252925]/75 transition-colors hover:text-[#29483B] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#29483B]"
            >
              <span>{item.label}</span>
              <span className="absolute bottom-0 left-0 h-[1.5px] w-0 bg-[#B87352] transition-all duration-200 group-hover:w-full" />
            </a>
          ))}
        </nav>

        {/* Desktop Action CTA */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="#contact"
            onClick={(e) => handleNavClick(e, "#contact")}
            className="group relative inline-flex items-center justify-center gap-2 rounded-xs bg-[#29483B] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#F7F5EF] shadow-xs transition-all duration-200 hover:bg-[#1e352b] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#29483B]/50"
          >
            <span>Consultation</span>
            <ArrowRight className="h-3.5 w-3.5 text-[#B87352] transition-transform duration-200 group-hover:translate-x-0.5" />
          </a>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center rounded-xs p-2 text-[#252925] hover:bg-[#E2E9E0]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#29483B]"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu with Framer Motion */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden md:hidden border-t border-[#29483B]/10 bg-[#F7F5EF] shadow-xl"
          >
            <div className="px-5 py-6 space-y-4">
              <div className="border-b border-[#29483B]/10 pb-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B87352]">
                  NAVIGATION
                </span>
              </div>

              <nav aria-label="Mobile Navigation" className="flex flex-col space-y-2">
                {NAV_ITEMS.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className="flex items-center justify-between py-2 text-sm font-medium text-[#252925] hover:text-[#29483B] transition-colors border-b border-[#29483B]/5"
                  >
                    <span>{item.label}</span>
                    <span className="font-serif text-xs text-[#77796F]">{item.number}</span>
                  </a>
                ))}

                <div className="pt-4 space-y-3">
                  <a
                    href="#contact"
                    onClick={(e) => handleNavClick(e, "#contact")}
                    className="flex w-full items-center justify-center gap-2 rounded-xs bg-[#29483B] px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#F7F5EF] shadow-sm hover:bg-[#1e352b]"
                  >
                    <span>Schedule Partner Consultation</span>
                    <ArrowRight className="h-4 w-4 text-[#B87352]" />
                  </a>

                  <div className="flex items-center justify-center gap-2 text-xs text-[#77796F] pt-2">
                    <PhoneCall className="h-3.5 w-3.5 text-[#B87352]" />
                    <span>Confidential Inquiries · partner@northlineadvisory.com</span>
                  </div>
                </div>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
