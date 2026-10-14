"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Calendar, Activity, Phone, Clock, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  { name: "Home", href: "#hero" },
  { name: "Departments", href: "#departments" },
  { name: "Our Doctors", href: "#doctors" },
  { name: "Services", href: "#services" },
  { name: "Philosophy", href: "#philosophy" },
  { name: "Patient Info", href: "#patient-info" },
  { name: "About", href: "#about" },
  { name: "FAQ", href: "#faq" },
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
      className={`sticky top-[38px] z-40 w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-[#D4E8E0] bg-white/95 shadow-[0_4px_20px_rgba(20,125,120,0.06)] backdrop-blur-md"
          : "border-b border-[#EAF6F2] bg-white"
      }`}
    >
      {/* Top Clinic Info Bar (Desktop) */}
      <div className="hidden border-b border-[#EAF6F2] bg-[#F0F7F4]/80 py-1.5 text-xs text-[#4A6577] lg:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-[#147D78]" />
              NABH &amp; JCI Accredited Medical Facility
            </span>
            <span className="text-[#D4E8E0]">|</span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-[#147D78]" />
              Outpatient OPD: 7:30 AM – 7:30 PM (Mon – Sat)
            </span>
          </div>
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1.5 font-medium text-[#263746]">
              <Phone className="h-3.5 w-3.5 text-[#E8735A]" />
              <span>24/7 Careline:</span>
              <a
                href="tel:18004202273"
                className="font-semibold text-[#147D78] hover:text-[#0F5C55] transition-colors"
              >
                1800-420-CARE (2273)
              </a>
            </div>
            <span className="text-[#D4E8E0]">|</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0F5C55] bg-[#EAF6F2] px-2 py-0.5 rounded-full border border-[#D4E8E0]">
              <ShieldCheck className="h-3 w-3 text-[#147D78]" />
              Emergency Open 24/7
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Brand Wordmark & Emblem */}
        <Link
          href="#hero"
          className="group flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#147D78]"
          aria-label="MediCare Health Centre Home"
        >
          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#147D78] to-[#0F5C55] text-white shadow-[0_4px_12px_rgba(20,125,120,0.25)] transition-transform duration-300 group-hover:scale-105">
            <Activity className="h-5 w-5" />
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-[#E8735A]" />
          </div>
          <div className="flex flex-col">
            <span className="font-sans text-xl font-bold tracking-tight text-[#263746]">
              MediCare
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#147D78]">
              Health Centre
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          className="hidden items-center gap-1 xl:gap-2 lg:flex"
          aria-label="Primary Navigation"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#4A6577] transition-all duration-200 hover:bg-[#EAF6F2] hover:text-[#147D78] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#147D78]"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Right CTA: Coral Button */}
        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="#appointment"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-[#E8735A] px-5 py-2.5 text-xs font-bold text-white shadow-[0_4px_14px_rgba(232,115,90,0.3)] transition-all duration-200 hover:bg-[#D96047] hover:shadow-[0_6px_20px_rgba(232,115,90,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8735A] focus-visible:ring-offset-2 active:scale-[0.98]"
          >
            <Calendar className="h-4 w-4 transition-transform group-hover:scale-110" />
            <span>Book Appointment</span>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="inline-flex items-center justify-center rounded-xl border border-[#D4E8E0] bg-[#F0F7F4] p-2.5 text-[#263746] transition-colors hover:bg-[#EAF6F2] hover:text-[#147D78] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#147D78] lg:hidden"
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

      {/* Mobile Slide-down Navigation with AnimatePresence */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            id="mobile-navigation"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden border-b border-[#D4E8E0] bg-white px-4 py-5 shadow-xl lg:hidden"
          >
            <div className="mb-4 rounded-xl bg-[#F0F7F4] p-3 text-xs border border-[#D4E8E0]">
              <div className="flex items-center justify-between text-[#263746] font-semibold">
                <span>Emergency Hotline (24/7)</span>
                <span className="text-[#E8735A]">1800-420-CARE</span>
              </div>
              <p className="mt-1 text-[11px] text-[#4A6577]">
                NABH &amp; JCI Accredited Multispeciality Health Centre
              </p>
            </div>

            <nav className="flex flex-col space-y-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-semibold text-[#263746] transition-colors hover:bg-[#EAF6F2] hover:text-[#147D78] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#147D78]"
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-3">
                <Link
                  href="#appointment"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#E8735A] px-4 py-3 text-center text-sm font-bold text-white shadow-md hover:bg-[#D96047]"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Book an Appointment</span>
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
