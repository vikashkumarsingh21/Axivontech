"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Calendar, Activity } from "lucide-react";

const NAV_LINKS = [
  { name: "Home", href: "#hero" },
  { name: "Departments", href: "#departments" },
  { name: "Our Doctors", href: "#doctors" },
  { name: "Services", href: "#services" },
  { name: "About Us", href: "#about" },
  { name: "Patient Info", href: "#patient-info" },
  { name: "Contact", href: "#contact" },
];

export default function MediCareHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header
      className={`sticky top-[37px] z-40 w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-[#C9DED6] bg-white/95 shadow-sm backdrop-blur-md"
          : "border-b border-[#EAF6F2] bg-white"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Brand Wordmark */}
        <Link
          href="#hero"
          className="group flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#147D78] rounded-lg p-1"
          aria-label="MediCare Health Centre Home"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#147D78] text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
            <Activity className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-sans text-xl font-bold tracking-tight text-[#263746]">
              MediCare
            </span>
            <span className="text-[11px] font-medium uppercase tracking-wider text-[#147D78]">
              Health Centre
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          className="hidden items-center gap-7 lg:flex"
          aria-label="Primary Navigation"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-[#263746] transition-colors hover:text-[#147D78] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#147D78] rounded py-1 px-1.5"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Right CTA */}
        <div className="hidden items-center gap-4 lg:flex">
          <Link
            href="#appointment"
            className="inline-flex items-center gap-2 rounded-lg bg-[#147D78] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#0f605c] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#147D78] focus-visible:ring-offset-2 active:scale-[0.99]"
          >
            <Calendar className="h-4 w-4" />
            <span>Book an Appointment</span>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="inline-flex items-center justify-center rounded-lg border border-[#C9DED6] p-2 text-[#263746] hover:bg-[#EAF6F2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#147D78] lg:hidden"
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile Slide-down Navigation */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation"
          className="border-b border-[#C9DED6] bg-white px-4 py-5 shadow-lg lg:hidden animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <nav className="flex flex-col space-y-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md px-3 py-2 text-base font-medium text-[#263746] hover:bg-[#EAF6F2] hover:text-[#147D78] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#147D78]"
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-2">
              <Link
                href="#appointment"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#147D78] px-4 py-3 text-center text-sm font-semibold text-white shadow-sm hover:bg-[#0f605c]"
              >
                <Calendar className="h-4 w-4" />
                <span>Book an Appointment</span>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
