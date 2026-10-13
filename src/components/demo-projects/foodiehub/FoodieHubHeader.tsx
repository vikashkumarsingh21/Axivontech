"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X, UtensilsCrossed } from "lucide-react";

export default function FoodieHubHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Home", href: "#hero" },
    { label: "Our Story", href: "#story" },
    { label: "Our Menu", href: "#menu" },
    { label: "Signature Dishes", href: "#signatures" },
    { label: "Experience", href: "#experience" },
    { label: "Gallery", href: "#gallery" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <header className="sticky top-[37px] z-40 w-full border-b border-[#E8DFC9] bg-[#F8F3EA]/95 backdrop-blur-md transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand Wordmark */}
        <Link
          href="#hero"
          className="group flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B85C38]"
        >
          <span className="font-serif text-xl sm:text-2xl font-bold tracking-wider text-[#24221F] transition-colors group-hover:text-[#B85C38]">
            SAFFRON & STONE
          </span>
          <span className="text-[10px] tracking-[0.25em] uppercase text-[#68735A] font-medium">
            Contemporary Indian Dining
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
              className="text-sm font-medium tracking-wide text-[#24221F]/80 transition-colors hover:text-[#B85C38] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B85C38]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-4 lg:flex">
          <a
            href="#reservations"
            className="inline-flex items-center gap-2 rounded-full bg-[#B85C38] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#9E4A28] hover:shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B85C38] focus-visible:ring-offset-2"
          >
            <UtensilsCrossed className="h-4 w-4" />
            <span>Reserve a Table</span>
          </a>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <a
            href="#reservations"
            className="inline-flex items-center rounded-full bg-[#B85C38] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#9E4A28]"
          >
            Reserve
          </a>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            className="inline-flex items-center justify-center rounded-lg p-2 text-[#24221F] hover:bg-[#EAE2D2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B85C38]"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-[#E8DFC9] bg-[#F8F3EA] px-4 py-6 shadow-xl lg:hidden">
          <nav className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-[#24221F] transition-colors hover:text-[#B85C38]"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-2">
              <a
                href="#reservations"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#B85C38] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#9E4A28]"
              >
                <UtensilsCrossed className="h-4 w-4" />
                <span>Reserve a Table</span>
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
