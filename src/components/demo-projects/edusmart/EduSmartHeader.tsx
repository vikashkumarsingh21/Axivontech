"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X, GraduationCap, ArrowRight } from "lucide-react";

export default function EduSmartHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Home", href: "#hero" },
    { label: "About", href: "#about" },
    { label: "Programs", href: "#programs" },
    { label: "Approach", href: "#approach" },
    { label: "Campus Life", href: "#campus-life" },
    { label: "Faculty", href: "#faculty" },
    { label: "Admissions", href: "#admissions" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <header className="sticky top-[37px] z-40 w-full border-b border-[#E8E1EB] bg-[#F7F3EB]/95 backdrop-blur-md transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Typographic Brand Wordmark */}
        <Link
          href="#hero"
          className="group flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#33243B]"
        >
          <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#33243B] transition-colors group-hover:text-[#523A5E]">
            AUREVIA ACADEMY
          </span>
          <span className="text-[10px] tracking-[0.25em] uppercase text-[#B89557] font-semibold">
            Centre for Higher Learning
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav
          aria-label="Aurevia Academy Primary Navigation"
          className="hidden items-center gap-6 xl:gap-8 lg:flex"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium tracking-wide text-[#27232A]/85 transition-colors hover:text-[#33243B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#33243B]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Primary CTA */}
        <div className="hidden items-center gap-4 lg:flex">
          <a
            href="#admissions"
            className="inline-flex items-center gap-2 rounded-full bg-[#33243B] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#483353] hover:shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#33243B] focus-visible:ring-offset-2"
          >
            <GraduationCap className="h-4 w-4 text-[#B89557]" />
            <span>Explore Admissions</span>
          </a>
        </div>

        {/* Mobile Menu Controls */}
        <div className="flex items-center gap-2 lg:hidden">
          <a
            href="#admissions"
            className="inline-flex items-center rounded-full bg-[#33243B] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-[#483353]"
          >
            Admissions
          </a>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
            className="inline-flex items-center justify-center rounded-lg p-2 text-[#33243B] hover:bg-[#E8E1EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#33243B]"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-[#E8E1EB] bg-[#F7F3EB] px-4 py-6 shadow-xl lg:hidden">
          <nav className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-[#27232A] transition-colors hover:text-[#33243B]"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-2">
              <a
                href="#admissions"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#33243B] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#483353]"
              >
                <GraduationCap className="h-4 w-4 text-[#B89557]" />
                <span>Explore Admissions</span>
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
