"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sun, Menu, X, Phone, Compass, Calendar, ChevronRight } from "lucide-react";

interface HeaderProps {
  onReserveClick: () => void;
}

export default function SolaraHeader({ onReserveClick }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-[42px] z-40 border-b border-[#dfd7cc] bg-[#f5efeb]/95 backdrop-blur-md text-[#1b1916]">
      {/* ── Top Auxiliary Bar ─────────────────────────────────────────── */}
      <div className="border-b border-[#e5ded4] bg-[#ede5db] px-4 py-1.5 text-[11px] text-[#6b665f]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-[#1f2e23]">
              Nilgiri Biosphere Foothills · Eco-Certified Luxury Sanctuary
            </span>
            <span className="hidden sm:inline-block h-2.5 w-px bg-[#d5cab5]" />
            <span className="hidden sm:inline">Altitude: 1,850m · Pure Mountain Spring Air</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="tel:+918049129900"
              className="inline-flex items-center gap-1 font-medium hover:text-[#1f2e23] transition-colors"
            >
              <Phone className="h-2.5 w-2.5 text-[#b57a42]" />
              <span>Concierge Desk: +91 80 4912 9900</span>
            </a>
            <span className="hidden sm:inline-block h-2.5 w-px bg-[#d5cab5]" />
            <button
              onClick={() => scrollTo("location")}
              className="inline-flex items-center gap-1 hover:text-[#1f2e23] transition-colors"
            >
              <Compass className="h-2.5 w-2.5 text-[#b57a42]" />
              <span>Private Chauffeur &amp; Helipad</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Navigation Bar ──────────────────────────────────────── */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Brand Crest */}
        <button
          onClick={() => scrollTo("hero")}
          className="flex items-center gap-3 text-left focus:outline-none"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1f2e23] text-[#c48b56] shadow-inner border border-[#b57a42]/30">
            <Sun className="h-6 w-6" />
          </div>
          <div>
            <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-[#1f2e23]">
              Solara Retreat &amp; Resort
            </span>
            <p className="text-[10px] uppercase tracking-widest text-[#b57a42] font-semibold">
              Where Nature Embraces Serenity
            </p>
          </div>
        </button>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold tracking-wide text-[#3b3630]">
          <button
            onClick={() => scrollTo("accommodations")}
            className="hover:text-[#b57a42] transition-colors py-1"
          >
            Villas &amp; Suites
          </button>
          <button
            onClick={() => scrollTo("dining")}
            className="hover:text-[#b57a42] transition-colors py-1"
          >
            Organic Dining
          </button>
          <button
            onClick={() => scrollTo("wellness")}
            className="hover:text-[#b57a42] transition-colors py-1"
          >
            Ayurvedic Spa
          </button>
          <button
            onClick={() => scrollTo("experiences")}
            className="hover:text-[#b57a42] transition-colors py-1"
          >
            Experiences
          </button>
          <button
            onClick={() => scrollTo("gallery")}
            className="hover:text-[#b57a42] transition-colors py-1"
          >
            Gallery
          </button>
          <button
            onClick={() => scrollTo("location")}
            className="hover:text-[#b57a42] transition-colors py-1"
          >
            Location
          </button>
          <button
            onClick={() => scrollTo("faq")}
            className="hover:text-[#b57a42] transition-colors py-1"
          >
            Resort FAQ
          </button>
        </nav>

        {/* Action Button & Mobile Hamburger */}
        <div className="flex items-center gap-3">
          <button
            onClick={onReserveClick}
            className="hidden sm:inline-flex items-center gap-2 rounded-full bg-[#1f2e23] px-5 py-2.5 text-xs font-bold text-[#f5efeb] shadow-sm transition-all hover:bg-[#283d2e] active:scale-95 border border-[#b57a42]/30"
          >
            <Calendar className="h-3.5 w-3.5 text-[#c48b56]" />
            <span>Check Availability</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex lg:hidden h-9 w-9 items-center justify-center rounded-lg border border-[#d5cab5] bg-[#ede5db] text-[#1f2e23]"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile Navigation Drawer ─────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-[#dfd7cc] bg-[#f5efeb] px-4 py-4 space-y-2 shadow-lg">
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-[#1f2e23]">
            <button
              onClick={() => scrollTo("accommodations")}
              className="p-2.5 text-left rounded bg-[#ede5db] hover:bg-[#e2d8cb]"
            >
              Villas &amp; Suites
            </button>
            <button
              onClick={() => scrollTo("dining")}
              className="p-2.5 text-left rounded bg-[#ede5db] hover:bg-[#e2d8cb]"
            >
              Farm-to-Table Dining
            </button>
            <button
              onClick={() => scrollTo("wellness")}
              className="p-2.5 text-left rounded bg-[#ede5db] hover:bg-[#e2d8cb]"
            >
              Ayurvedic Wellness Spa
            </button>
            <button
              onClick={() => scrollTo("experiences")}
              className="p-2.5 text-left rounded bg-[#ede5db] hover:bg-[#e2d8cb]"
            >
              Curated Escapes
            </button>
            <button
              onClick={() => scrollTo("gallery")}
              className="p-2.5 text-left rounded bg-[#ede5db] hover:bg-[#e2d8cb]"
            >
              Photo Sanctuary
            </button>
            <button
              onClick={() => scrollTo("location")}
              className="p-2.5 text-left rounded bg-[#ede5db] hover:bg-[#e2d8cb]"
            >
              Getting to Solara
            </button>
            <button
              onClick={() => scrollTo("faq")}
              className="p-2.5 text-left rounded bg-[#ede5db] hover:bg-[#e2d8cb]"
            >
              Guest Policies &amp; FAQ
            </button>
            <button
              onClick={() => scrollTo("contact")}
              className="p-2.5 text-left rounded bg-[#ede5db] hover:bg-[#e2d8cb]"
            >
              Concierge Contact
            </button>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onReserveClick();
              }}
              className="w-full text-center rounded-xl bg-[#b57a42] py-2.5 text-xs font-bold text-[#faf8f5]"
            >
              Reservation Enquiry Desk
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
