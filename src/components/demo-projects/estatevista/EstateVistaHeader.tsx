"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  Heart,
  Scale,
  Menu,
  X,
  Calendar,
  Phone,
  Compass,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface EstateVistaHeaderProps {
  savedCount: number;
  compareCount: number;
  onOpenFavorites: () => void;
  onOpenComparison: () => void;
}

export default function EstateVistaHeader({
  savedCount,
  compareCount,
  onOpenFavorites,
  onOpenComparison,
}: EstateVistaHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.querySelector(targetId);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-[#F0EDE5]/95 backdrop-blur-md shadow-xs border-b border-[#D5CEC1]"
          : "bg-[#F0EDE5] border-b border-[#D5CEC1]/60"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-10">
        {/* Brand Logo */}
        <Link
          href="/demo-projects/real-estate/estatevista"
          className="group flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#153D32]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#153D32] text-[#B89A63] shadow-xs transition-transform duration-300 group-hover:scale-105 border border-[#102C25]">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-lg font-bold tracking-tight text-[#222A25] group-hover:text-[#153D32] transition-colors">
              ESTATEVISTA
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-[0.24em] text-[#B89A63]">
              Prime Realty & Architecture
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          aria-label="EstateVista Main Navigation"
          className="hidden md:flex items-center gap-7 text-xs font-semibold uppercase tracking-wider text-[#626B63]"
        >
          <a
            href="#residences"
            onClick={(e) => handleNavClick(e, "#residences")}
            className="hover:text-[#153D32] transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-[#B89A63] after:transition-all"
          >
            Residences
          </a>
          <a
            href="#neighborhoods"
            onClick={(e) => handleNavClick(e, "#neighborhoods")}
            className="hover:text-[#153D32] transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-[#B89A63] after:transition-all"
          >
            Neighborhoods
          </a>
          <a
            href="#calculator"
            onClick={(e) => handleNavClick(e, "#calculator")}
            className="hover:text-[#153D32] transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-[#B89A63] after:transition-all"
          >
            Financing
          </a>
          <a
            href="#tour"
            onClick={(e) => handleNavClick(e, "#tour")}
            className="hover:text-[#153D32] transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-[#B89A63] after:transition-all"
          >
            Private Tour
          </a>
          <a
            href="#faqs"
            onClick={(e) => handleNavClick(e, "#faqs")}
            className="hover:text-[#153D32] transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-[#B89A63] after:transition-all"
          >
            FAQ
          </a>
        </nav>

        {/* Right Action Icons & Primary CTA */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Compare Button */}
          <button
            type="button"
            onClick={onOpenComparison}
            aria-label={`View Property Comparison (${compareCount} selected)`}
            className={`relative flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
              compareCount > 0
                ? "border-[#153D32] bg-[#153D32]/10 text-[#153D32]"
                : "border-[#D5CEC1] bg-[#FAF8F2] text-[#626B63] hover:border-[#153D32]/40 hover:text-[#222A25]"
            }`}
          >
            <Scale className="h-3.5 w-3.5 text-[#B89A63]" />
            <span className="hidden sm:inline">Compare</span>
            {compareCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#153D32] text-[10px] font-bold text-white">
                {compareCount}
              </span>
            )}
          </button>

          {/* Favorites Button */}
          <button
            type="button"
            onClick={onOpenFavorites}
            aria-label={`View Saved Properties (${savedCount} saved)`}
            className={`relative flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
              savedCount > 0
                ? "border-[#B89A63] bg-[#B89A63]/10 text-[#153D32]"
                : "border-[#D5CEC1] bg-[#FAF8F2] text-[#626B63] hover:border-[#153D32]/40 hover:text-[#222A25]"
            }`}
          >
            <Heart
              className={`h-3.5 w-3.5 ${
                savedCount > 0 ? "fill-[#B89A63] text-[#B89A63]" : "text-[#626B63]"
              }`}
            />
            <span className="hidden sm:inline">Saved</span>
            {savedCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#B89A63] text-[10px] font-bold text-white">
                {savedCount}
              </span>
            )}
          </button>

          {/* Primary CTA */}
          <a
            href="#tour"
            onClick={(e) => handleNavClick(e, "#tour")}
            className="hidden sm:inline-flex items-center gap-2 rounded-full bg-[#153D32] px-4 py-2 text-xs font-bold text-white shadow-xs transition-all hover:bg-[#102C25] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#153D32]"
          >
            <Calendar className="h-3.5 w-3.5 text-[#B89A63]" />
            <span>Book Private Tour</span>
          </a>

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            className="flex md:hidden h-9 w-9 items-center justify-center rounded-lg border border-[#D5CEC1] bg-[#FAF8F2] text-[#222A25] hover:bg-[#DCD5C8] transition-colors"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-b border-[#D5CEC1] bg-[#F0EDE5] px-4 py-5 shadow-lg"
          >
            <nav className="flex flex-col gap-3 text-sm font-semibold text-[#222A25]">
              <a
                href="#residences"
                onClick={(e) => handleNavClick(e, "#residences")}
                className="flex items-center justify-between py-2 border-b border-[#D5CEC1]/60"
              >
                <span>Curated Residences</span>
                <ArrowRight className="h-4 w-4 text-[#B89A63]" />
              </a>
              <a
                href="#neighborhoods"
                onClick={(e) => handleNavClick(e, "#neighborhoods")}
                className="flex items-center justify-between py-2 border-b border-[#D5CEC1]/60"
              >
                <span>Prime Neighborhoods</span>
                <ArrowRight className="h-4 w-4 text-[#B89A63]" />
              </a>
              <a
                href="#calculator"
                onClick={(e) => handleNavClick(e, "#calculator")}
                className="flex items-center justify-between py-2 border-b border-[#D5CEC1]/60"
              >
                <span>Financing & Mortgage</span>
                <ArrowRight className="h-4 w-4 text-[#B89A63]" />
              </a>
              <a
                href="#tour"
                onClick={(e) => handleNavClick(e, "#tour")}
                className="flex items-center justify-between py-2 border-b border-[#D5CEC1]/60"
              >
                <span>Schedule Private Viewing</span>
                <ArrowRight className="h-4 w-4 text-[#B89A63]" />
              </a>
              <a
                href="#faqs"
                onClick={(e) => handleNavClick(e, "#faqs")}
                className="flex items-center justify-between py-2"
              >
                <span>Client Advisory & FAQ</span>
                <ArrowRight className="h-4 w-4 text-[#B89A63]" />
              </a>
            </nav>

            <div className="mt-5 pt-4 border-t border-[#D5CEC1] flex flex-col gap-2.5">
              <a
                href="#tour"
                onClick={(e) => handleNavClick(e, "#tour")}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#153D32] py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#102C25] transition-all"
              >
                <Calendar className="h-4 w-4 text-[#B89A63]" />
                <span>Book Private Viewing</span>
              </a>
              <div className="flex items-center justify-center gap-2 text-[11px] text-[#626B63]">
                <ShieldCheck className="h-3.5 w-3.5 text-[#153D32]" />
                <span>100% Verified Architectural Ownership</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
