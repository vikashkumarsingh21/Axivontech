"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X, UtensilsCrossed, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FoodieHubHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "The Story", href: "#story" },
    { label: "Tasting Menu", href: "#menu" },
    { label: "Signatures", href: "#signatures" },
    { label: "Atmosphere", href: "#experience" },
    { label: "Gallery", href: "#gallery" },
    { label: "Private Salons", href: "#experiences" },
    { label: "Hours & Visit", href: "#contact" },
  ];

  return (
    <header className="sticky top-[33px] z-40 w-full border-b border-[#D4C9B9] bg-[#F8F3EA]/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Brand Wordmark */}
        <Link
          href="#hero"
          className="group flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B85C38] focus-visible:ring-offset-2"
        >
          <span className="font-serif text-xl sm:text-2xl font-bold tracking-[0.18em] text-[#24221F] transition-colors group-hover:text-[#B85C38]">
            SAFFRON & STONE
          </span>
          <span className="flex items-center gap-1.5 text-[9px] tracking-[0.28em] uppercase text-[#6B6560]">
            <span>Contemporary Indian Dining</span>
            <span className="text-[#C4964C]">·</span>
            <span>Est. 2024</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav
          aria-label="Restaurant Primary Navigation"
          className="hidden items-center gap-7 lg:flex"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="group relative text-xs uppercase tracking-[0.18em] font-medium text-[#6B6560] transition-colors hover:text-[#24221F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B85C38]"
            >
              <span>{link.label}</span>
              <span className="absolute -bottom-1 left-0 h-[1.5px] w-0 bg-[#B85C38] transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-4 lg:flex">
          <a
            href="#reservations"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-[#B85C38] bg-[#B85C38] px-5 py-2.5 text-xs uppercase tracking-wider font-semibold text-white shadow-sm transition-all duration-300 hover:border-[#9E4826] hover:bg-[#9E4826] hover:shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B85C38] focus-visible:ring-offset-2"
          >
            <UtensilsCrossed className="h-3.5 w-3.5 transition-transform group-hover:rotate-12" />
            <span>Reserve Table</span>
          </a>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2.5 lg:hidden">
          <a
            href="#reservations"
            className="inline-flex items-center rounded-full bg-[#B85C38] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-white shadow-sm transition-all hover:bg-[#9E4826]"
          >
            Reserve
          </a>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            className="inline-flex items-center justify-center rounded-lg p-2 text-[#24221F] transition-colors hover:bg-[#F0E8DA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B85C38]"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="border-t border-[#D4C9B9] bg-[#F8F3EA] px-6 py-6 shadow-xl lg:hidden"
          >
            <nav className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="border-b border-[#D4C9B9]/40 pb-2 text-sm font-medium tracking-wide text-[#24221F] transition-colors hover:text-[#B85C38]"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-2">
                <a
                  href="#reservations"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#B85C38] px-5 py-3 text-xs uppercase tracking-wider font-semibold text-white shadow-sm hover:bg-[#9E4826]"
                >
                  <UtensilsCrossed className="h-4 w-4" />
                  <span>Reserve a Table</span>
                </a>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
