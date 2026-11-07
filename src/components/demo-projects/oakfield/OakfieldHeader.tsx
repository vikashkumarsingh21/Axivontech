"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Menu,
  X,
  Phone,
  Mail,
  Calendar,
  BookOpen,
  Award,
  ChevronDown,
} from "lucide-react";

interface HeaderProps {
  onApplyClick: () => void;
}

export default function OakfieldHeader({ onApplyClick }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-[42px] z-40 border-b border-[#e2d9c8] bg-[#faf8f4]/95 backdrop-blur-md text-[#18231d]">
      {/* ── Top Auxiliary Bar ─────────────────────────────────────────── */}
      <div className="border-b border-[#ece4d5] bg-[#f4efe4] px-4 py-1.5 text-[11px] text-[#4f5e55]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-[#143d30]">
              CBSE Affiliation No: 1930284
            </span>
            <span className="hidden sm:inline-block h-2.5 w-px bg-[#d5cab5]" />
            <span className="hidden sm:inline">School Code: 41082</span>
            <span className="hidden md:inline-block h-2.5 w-px bg-[#d5cab5]" />
            <span className="hidden md:inline">
              Co-Educational · Day &amp; Extended Day Boarding
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="tel:+918049128800"
              className="inline-flex items-center gap-1 font-medium hover:text-[#143d30] transition-colors"
            >
              <Phone className="h-2.5 w-2.5 text-[#c8a24d]" />
              <span>Admissions: +91 80 4912 8800</span>
            </a>
            <span className="hidden sm:inline-block h-2.5 w-px bg-[#d5cab5]" />
            <button
              onClick={() => scrollTo("notice-board")}
              className="inline-flex items-center gap-1 hover:text-[#143d30] transition-colors"
            >
              <Calendar className="h-2.5 w-2.5 text-[#c8a24d]" />
              <span>Academic Calendar 2026-27</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Navigation Bar ──────────────────────────────────────── */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand Crest & Title */}
        <button
          onClick={() => scrollTo("hero")}
          className="flex items-center gap-3 text-left focus:outline-none"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#143d30] text-[#c8a24d] shadow-inner border border-[#c8a24d]/40">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-[#143d30]">
                Oakfield International School
              </span>
            </div>
            <p className="text-[10px] uppercase tracking-wider text-[#c8a24d] font-semibold">
              Inspiring Excellence · Nurturing Character
            </p>
          </div>
        </button>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-[#2c3d33]">
          <button
            onClick={() => scrollTo("about")}
            className="hover:text-[#143d30] transition-colors py-1"
          >
            About
          </button>
          <button
            onClick={() => scrollTo("principal")}
            className="hover:text-[#143d30] transition-colors py-1"
          >
            Principal&apos;s Desk
          </button>
          <button
            onClick={() => scrollTo("academics")}
            className="hover:text-[#143d30] transition-colors py-1"
          >
            Academics
          </button>
          <button
            onClick={() => scrollTo("admissions")}
            className="hover:text-[#143d30] transition-colors py-1 text-[#143d30] font-bold"
          >
            Admissions
          </button>
          <button
            onClick={() => scrollTo("faculty")}
            className="hover:text-[#143d30] transition-colors py-1"
          >
            Faculty
          </button>
          <button
            onClick={() => scrollTo("campus")}
            className="hover:text-[#143d30] transition-colors py-1"
          >
            Campus &amp; Labs
          </button>
          <button
            onClick={() => scrollTo("gallery")}
            className="hover:text-[#143d30] transition-colors py-1"
          >
            Gallery
          </button>
          <button
            onClick={() => scrollTo("notice-board")}
            className="hover:text-[#143d30] transition-colors py-1"
          >
            Notices
          </button>
          <button
            onClick={() => scrollTo("contact")}
            className="hover:text-[#143d30] transition-colors py-1"
          >
            Contact
          </button>
        </nav>

        {/* Action Button & Mobile Hamburger */}
        <div className="flex items-center gap-3">
          <button
            onClick={onApplyClick}
            className="hidden sm:inline-flex items-center gap-2 rounded-full bg-[#143d30] px-5 py-2 text-xs font-bold text-[#faf8f4] shadow-sm transition-all hover:bg-[#1a4e3e] active:scale-95 border border-[#c8a24d]/30"
          >
            <span>Apply for 2026-27</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex lg:hidden h-9 w-9 items-center justify-center rounded-lg border border-[#d5cab5] bg-[#f4efe4] text-[#143d30]"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile Navigation Drawer ─────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-[#e2d9c8] bg-[#faf8f4] px-4 py-4 space-y-2 shadow-lg">
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-[#143d30]">
            <button
              onClick={() => scrollTo("about")}
              className="p-2 text-left rounded bg-[#f4efe4] hover:bg-[#eae1d0]"
            >
              About School
            </button>
            <button
              onClick={() => scrollTo("principal")}
              className="p-2 text-left rounded bg-[#f4efe4] hover:bg-[#eae1d0]"
            >
              Principal&apos;s Desk
            </button>
            <button
              onClick={() => scrollTo("academics")}
              className="p-2 text-left rounded bg-[#f4efe4] hover:bg-[#eae1d0]"
            >
              Academics &amp; Wings
            </button>
            <button
              onClick={() => scrollTo("admissions")}
              className="p-2 text-left rounded bg-[#143d30] text-[#faf8f4] font-bold"
            >
              Admissions 2026-27
            </button>
            <button
              onClick={() => scrollTo("faculty")}
              className="p-2 text-left rounded bg-[#f4efe4] hover:bg-[#eae1d0]"
            >
              Faculty Roster
            </button>
            <button
              onClick={() => scrollTo("campus")}
              className="p-2 text-left rounded bg-[#f4efe4] hover:bg-[#eae1d0]"
            >
              Campus &amp; Facilities
            </button>
            <button
              onClick={() => scrollTo("gallery")}
              className="p-2 text-left rounded bg-[#f4efe4] hover:bg-[#eae1d0]"
            >
              Photo Gallery
            </button>
            <button
              onClick={() => scrollTo("notice-board")}
              className="p-2 text-left rounded bg-[#f4efe4] hover:bg-[#eae1d0]"
            >
              Notice Board
            </button>
            <button
              onClick={() => scrollTo("achievements")}
              className="p-2 text-left rounded bg-[#f4efe4] hover:bg-[#eae1d0]"
            >
              Achievements
            </button>
            <button
              onClick={() => scrollTo("contact")}
              className="p-2 text-left rounded bg-[#f4efe4] hover:bg-[#eae1d0]"
            >
              Contact &amp; Map
            </button>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onApplyClick();
              }}
              className="w-full text-center rounded-xl bg-[#c8a24d] py-2.5 text-xs font-bold text-[#143d30]"
            >
              Online Admission Enquiry Form
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
