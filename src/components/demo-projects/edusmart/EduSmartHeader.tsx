"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X, GraduationCap, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function EduSmartHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Home", href: "#hero" },
    { label: "Philosophy", href: "#about" },
    { label: "Programs", href: "#programs" },
    { label: "Methodology", href: "#approach" },
    { label: "Campus", href: "#campus-life" },
    { label: "Faculty", href: "#faculty" },
    { label: "Admissions", href: "#admissions" },
    { label: "Events", href: "#events" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <header className="sticky top-[37px] z-40 w-full border-b border-[#D6CDBF] bg-[#F7F3EB]/95 backdrop-blur-md transition-all shadow-[0_2px_12px_rgba(39,35,42,0.03)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Typographic Academic Brand Wordmark */}
        <Link
          href="#hero"
          className="group flex items-center gap-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B2A43] rounded-lg p-1"
        >
          {/* Institutional Monogram Shield */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#3B2A43] text-[#F7F3EB] shadow-xs border border-[#C4964C]/30 transition-transform group-hover:scale-105">
            <span className="font-serif text-lg font-bold tracking-widest text-[#C4964C]">
              AA
            </span>
          </div>

          <div className="flex flex-col">
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#3B2A43] transition-colors group-hover:text-[#5A5260] leading-tight">
              AUREVIA ACADEMY
            </span>
            <span className="text-[10px] font-semibold tracking-[0.24em] uppercase text-[#C4964C]">
              Centre for Higher Learning · Est. 1928
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav
          aria-label="Aurevia Academy Primary Navigation"
          className="hidden items-center gap-6 xl:gap-7 lg:flex"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-xs xl:text-sm font-medium tracking-wide text-[#5A5260] transition-colors hover:text-[#3B2A43] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B2A43] rounded px-1.5 py-1"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Primary CTA */}
        <div className="hidden items-center gap-3 lg:flex">
          <a
            href="#admissions"
            className="group inline-flex items-center gap-2 rounded-full bg-[#3B2A43] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#F7F3EB] shadow-sm transition-all hover:bg-[#4D3857] hover:shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B2A43] focus-visible:ring-offset-2"
          >
            <GraduationCap className="h-4 w-4 text-[#C4964C] transition-transform group-hover:rotate-6" />
            <span>Admissions 2025–26</span>
          </a>
        </div>

        {/* Mobile Menu Controls */}
        <div className="flex items-center gap-2 lg:hidden">
          <a
            href="#admissions"
            className="inline-flex items-center rounded-full bg-[#3B2A43] px-3.5 py-1.5 text-xs font-semibold text-[#F7F3EB] shadow-xs hover:bg-[#4D3857]"
          >
            Apply
          </a>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
            className="inline-flex items-center justify-center rounded-lg p-2 text-[#3B2A43] hover:bg-[#EDE8E0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B2A43]"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-[#D6CDBF] bg-[#F7F3EB] px-5 py-6 shadow-xl lg:hidden"
          >
            <nav className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-[#27232A] transition-colors hover:bg-[#EDE8E0] hover:text-[#3B2A43]"
                >
                  <span>{link.label}</span>
                  <ChevronRight className="h-4 w-4 text-[#8E8694]" />
                </a>
              ))}
              <div className="pt-3 border-t border-[#D6CDBF]">
                <a
                  href="#admissions"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#3B2A43] px-5 py-3 text-sm font-semibold uppercase tracking-wider text-[#F7F3EB] shadow-sm hover:bg-[#4D3857]"
                >
                  <GraduationCap className="h-4 w-4 text-[#C4964C]" />
                  <span>Explore Admissions</span>
                </a>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
