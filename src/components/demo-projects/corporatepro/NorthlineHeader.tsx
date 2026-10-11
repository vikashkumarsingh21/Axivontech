"use client";

import React, { useState, useEffect } from "react";
import { Menu, X, ArrowRight } from "lucide-react";

const NAV_ITEMS = [
  { label: "Approach", href: "#approach" },
  { label: "Services", href: "#services" },
  { label: "Our Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export default function NorthlineHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const targetElement = document.querySelector(href);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-200 ${
        isScrolled
          ? "bg-[#F7F5EF]/95 backdrop-blur-md shadow-[0_4px_20px_rgba(41,72,59,0.06)] border-b border-[#29483B]/10"
          : "bg-[#F7F5EF] border-b border-[#29483B]/5"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-10">
        {/* Brand Wordmark */}
        <a
          href="#top"
          onClick={(e) => handleNavClick(e, "#top")}
          className="group flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#29483B] rounded-sm"
          aria-label="Northline Advisory — Home"
        >
          {/* Subtle Custom Geometric Monogram */}
          <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-[#29483B] text-[#F7F5EF] shadow-sm transition-transform duration-200 group-hover:scale-[1.03]">
            <span className="font-serif text-base font-semibold tracking-wider">N</span>
          </div>

          <div className="flex flex-col">
            <span className="font-serif text-lg font-bold tracking-tight text-[#252925] sm:text-xl">
              NORTHLINE
            </span>
            <span className="text-[9px] font-semibold tracking-[0.28em] text-[#77796F] uppercase">
              ADVISORY
            </span>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav aria-label="Northline Advisory Navigation" className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href)}
              className="text-xs font-medium uppercase tracking-[0.14em] text-[#252925]/80 hover:text-[#29483B] transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-[#29483B] after:transition-all after:duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#29483B]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Desktop Action CTA */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="#contact"
            onClick={(e) => handleNavClick(e, "#contact")}
            className="inline-flex items-center justify-center gap-2 rounded-sm bg-[#29483B] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#F7F5EF] shadow-sm transition-all hover:bg-[#1f372d] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#29483B]/50"
          >
            <span>Book a Conversation</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center rounded-sm p-2 text-[#252925] hover:bg-[#E2E9E0]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#29483B]"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#29483B]/10 bg-[#F7F5EF] px-5 py-6 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <nav aria-label="Mobile Navigation" className="flex flex-col space-y-4">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="block text-base font-medium text-[#252925] hover:text-[#29483B] py-2 border-b border-[#29483B]/5 transition-colors"
              >
                {item.label}
              </a>
            ))}

            <div className="pt-4">
              <a
                href="#contact"
                onClick={(e) => handleNavClick(e, "#contact")}
                className="flex w-full items-center justify-center gap-2 rounded-sm bg-[#29483B] px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#F7F5EF] shadow-sm transition-all hover:bg-[#1f372d]"
              >
                <span>Book a Conversation</span>
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
