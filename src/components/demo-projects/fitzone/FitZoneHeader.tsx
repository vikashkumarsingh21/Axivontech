"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Dumbbell,
  Menu,
  X,
  Flame,
  ArrowRight,
  Sparkles,
  PhoneCall,
  Calendar,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FitZoneHeaderProps {
  onBookTrialClick?: () => void;
}

export default function FitZoneHeader({ onBookTrialClick }: FitZoneHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Programs", href: "#programs" },
    { name: "Pillars", href: "#philosophy" },
    { name: "Trainers", href: "#trainers" },
    { name: "Class Schedule", href: "#schedule" },
    { name: "Memberships", href: "#membership" },
    { name: "Facilities", href: "#facilities" },
    { name: "Workout Planner", href: "#planner" },
    { name: "FAQs", href: "#faqs" },
  ];

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isScrolled
          ? "border-b border-[#2B3137] bg-[#0B0D0F]/90 backdrop-blur-md shadow-2xl shadow-black/50"
          : "border-b border-white/5 bg-[#0B0D0F]/70 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link
          href="#hero"
          className="group flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7138]"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF7138] to-[#FF934D] text-black shadow-lg shadow-[#FF7138]/20 transition-transform group-hover:scale-105">
            <Dumbbell className="h-5 w-5 text-[#0B0D0F] transition-transform group-hover:rotate-12" />
            <div className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#171B1F] border border-[#FF7138]">
              <Flame className="h-2 w-2 text-[#FF7138]" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-xl font-black tracking-wider text-[#F6F4F0] uppercase">
                FIT<span className="text-[#FF7138]">ZONE</span>
              </span>
              <span className="rounded bg-[#FF7138]/15 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-widest text-[#FF7138] border border-[#FF7138]/30">
                PRO
              </span>
            </div>
            <span className="text-[9px] font-semibold tracking-widest text-[#858D96] uppercase">
              Athletic Club & 3D Lab
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav
          aria-label="Main Navigation"
          className="hidden lg:flex items-center gap-6 xl:gap-7"
        >
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-xs font-semibold tracking-wide text-[#B5BBC2] transition-colors hover:text-[#FF7138] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FF7138]"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="#schedule"
            className="hidden xl:inline-flex items-center gap-1.5 text-xs font-semibold text-[#B5BBC2] hover:text-[#F6F4F0] px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all"
          >
            <Calendar className="h-3.5 w-3.5 text-[#FF7138]" />
            <span>Schedule</span>
          </Link>

          <button
            type="button"
            onClick={onBookTrialClick}
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#FF7138] to-[#FF934D] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#0B0D0F] shadow-lg shadow-[#FF7138]/25 transition-all duration-300 hover:shadow-xl hover:shadow-[#FF7138]/40 hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7138]"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Free 1-Day Pass</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 sm:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#2B3137] bg-[#171B1F] text-[#F6F4F0] transition-colors hover:border-[#FF7138] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7138]"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-b border-[#2B3137] bg-[#111417] px-4 pt-3 pb-6 sm:px-6 lg:hidden"
          >
            <div className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={handleNavClick}
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-[#B5BBC2] hover:bg-[#171B1F] hover:text-[#FF7138] transition-colors"
                >
                  {link.name}
                </Link>
              ))}

              <div className="mt-4 pt-4 border-t border-[#2B3137] flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => {
                    handleNavClick();
                    if (onBookTrialClick) onBookTrialClick();
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7138] to-[#FF934D] py-3 text-sm font-bold uppercase tracking-wider text-[#0B0D0F] shadow-lg shadow-[#FF7138]/20"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Claim Free 1-Day Pass</span>
                </button>

                <div className="flex items-center justify-center gap-2 text-xs text-[#858D96] pt-1">
                  <PhoneCall className="h-3 w-3 text-[#FF7138]" />
                  <span>Call Front Desk: +1 (800) 555-FITZ</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
