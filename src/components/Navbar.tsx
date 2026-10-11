"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { ChevronDown, Briefcase, Sparkles, ArrowRight } from "lucide-react";

const EASE_NAV = [0.22, 1, 0.36, 1] as const;

interface NavLink {
  label: string;
  href: string;
  hasDropdown?: boolean;
}

const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Industries", href: "/industries" },
  { label: "Portfolio", href: "/portfolio", hasDropdown: true },
  { label: "Blog", href: "/blog" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact" },
];

const EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];

/* ── Mobile full-screen overlay variants ─────────────────────── */
const overlayVariants: Variants = {
  closed: {
    opacity: 0,
    transition: { duration: 0.3, ease: EASE },
  },
  open: {
    opacity: 1,
    transition: { duration: 0.35, ease: EASE },
  },
};

const mobileLinkListVariants: Variants = {
  closed: {},
  open: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
};

const mobileLinkItemVariants: Variants = {
  closed: { opacity: 0, y: 12 },
  open: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE_NAV } },
};

const mobileActionsVariants: Variants = {
  closed: { opacity: 0, y: 16 },
  open: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_NAV, delay: 0.35 } },
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [portfolioOpen, setPortfolioOpen] = useState(false);
  const [mobilePortfolioOpen, setMobilePortfolioOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const pathname = usePathname();
  const portfolioContainerRef = useRef<HTMLLIElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [isOpen]);

  // Close menus on route change
  useEffect(() => {
    setIsOpen(false);
    setPortfolioOpen(false);
    setMobilePortfolioOpen(false);
  }, [pathname]);

  // Close on Escape or click outside
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (portfolioOpen) setPortfolioOpen(false);
        if (isOpen) setIsOpen(false);
      }
    },
    [isOpen, portfolioOpen]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Click outside to close desktop dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        portfolioContainerRef.current &&
        !portfolioContainerRef.current.contains(e.target as Node)
      ) {
        setPortfolioOpen(false);
      }
    };

    if (portfolioOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [portfolioOpen]);

  const handleMouseEnterPortfolio = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setPortfolioOpen(true);
    setHovered("/portfolio");
  };

  const handleMouseLeavePortfolio = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setPortfolioOpen(false);
      setHovered(null);
    }, 150);
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "/portfolio") {
      return pathname.startsWith("/portfolio") || pathname.startsWith("/demo-projects");
    }
    return pathname.startsWith(href);
  };

  // Do not render global Axivon navbar on individual demo projects (which have their own dedicated preview strip and navigation)
  if (pathname?.startsWith("/demo-projects/") && pathname !== "/demo-projects") {
    return null;
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-[#262626] bg-[#0f0f0f]/95 backdrop-blur-xl shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
          : "border-b border-transparent bg-[#0f0f0f]/90 backdrop-blur-xl"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-10">
        {/* ── Logo ──────────────────────────────────────────────── */}
        <Link
          href="/"
          className="group relative z-[60] flex items-center rounded-md transition-opacity hover:opacity-90"
          aria-label="Axivon Technologies Home"
        >
          <Image
            src="/assets/logo/logo-full.png"
            alt="Axivon Technologies Logo"
            width={220}
            height={60}
            priority
            className="h-10 w-auto sm:h-12 lg:h-14 brightness-0 invert"
          />
        </Link>

        {/* ── Desktop Navigation ─────────────────────────────────── */}
        <ul
          className="hidden items-center gap-1 lg:flex"
          onMouseLeave={() => {
            if (!portfolioOpen) setHovered(null);
          }}
        >
          {NAV_LINKS.map((link) => {
            if (link.hasDropdown) {
              return (
                <li
                  key={link.href}
                  ref={portfolioContainerRef}
                  className="relative"
                  onMouseEnter={handleMouseEnterPortfolio}
                  onMouseLeave={handleMouseLeavePortfolio}
                >
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => setPortfolioOpen((v) => !v)}
                      aria-expanded={portfolioOpen}
                      aria-haspopup="true"
                      aria-label="Portfolio menu options"
                      className={`relative z-10 flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a064]/40 ${
                        isActive(link.href)
                          ? "text-[#f4f4f5]"
                          : "text-[#a1a1aa] hover:text-[#f4f4f5]"
                      }`}
                    >
                      <span>{link.label}</span>
                      <ChevronDown
                        className={`h-3.5 w-3.5 transition-transform duration-200 ${
                          portfolioOpen ? "rotate-180 text-[#e8a064]" : "text-[#71717a]"
                        }`}
                      />
                    </button>
                  </div>

                  {hovered === link.href && !portfolioOpen && (
                    <motion.span
                      layoutId="nav-hover-pill"
                      className="absolute inset-0 rounded-full bg-[#1c1c1e]"
                      transition={
                        shouldReduceMotion
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 380, damping: 30 }
                      }
                    />
                  )}

                  {/* ── Portfolio Dropdown Card ── */}
                  <AnimatePresence>
                    {portfolioOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.98 }}
                        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute left-0 top-full mt-2 w-80 rounded-2xl border border-[#262626] bg-[#141414] p-2.5 shadow-[0_16px_36px_rgba(0,0,0,0.6)] backdrop-blur-2xl z-50"
                        role="menu"
                        aria-orientation="vertical"
                        aria-label="Portfolio submenu"
                      >
                        <div className="space-y-1">
                          {/* Option 1: Selected Work */}
                          <Link
                            href="/portfolio"
                            role="menuitem"
                            onClick={() => setPortfolioOpen(false)}
                            className={`group flex items-start gap-3 rounded-xl p-3 transition-colors ${
                              pathname === "/portfolio"
                                ? "bg-[#1c1c1e] text-[#f4f4f5]"
                                : "hover:bg-[#1a1a1c] text-[#d4d4d8]"
                            }`}
                          >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#262626] bg-[#0f0f0f] text-[#e8a064] group-hover:border-[#e8a064]/40 group-hover:bg-[#2a1f14] transition-colors">
                              <Briefcase className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-[#f4f4f5] group-hover:text-[#e8a064] transition-colors">
                                  Selected Work
                                </span>
                                <ArrowRight className="h-3 w-3 text-[#52525b] group-hover:text-[#e8a064] group-hover:translate-x-0.5 transition-all opacity-0 group-hover:opacity-100" />
                              </div>
                              <p className="mt-0.5 text-xs text-[#71717a] leading-relaxed">
                                Explore our selected projects and work.
                              </p>
                            </div>
                          </Link>

                          {/* Option 2: Demo Projects */}
                          <Link
                            href="/demo-projects"
                            role="menuitem"
                            onClick={() => setPortfolioOpen(false)}
                            className={`group flex items-start gap-3 rounded-xl p-3 transition-colors ${
                              pathname === "/demo-projects"
                                ? "bg-[#1c1c1e] text-[#f4f4f5]"
                                : "hover:bg-[#1a1a1c] text-[#d4d4d8]"
                            }`}
                          >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#262626] bg-[#0f0f0f] text-[#e8a064] group-hover:border-[#e8a064]/40 group-hover:bg-[#2a1f14] transition-colors">
                              <Sparkles className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-[#f4f4f5] group-hover:text-[#e8a064] transition-colors flex items-center gap-1.5">
                                  Demo Projects
                                  <span className="rounded-full bg-[#e8a064]/10 border border-[#e8a064]/30 px-1.5 py-0.2 text-[9px] font-semibold text-[#e8a064]">
                                    New
                                  </span>
                                </span>
                                <ArrowRight className="h-3 w-3 text-[#52525b] group-hover:text-[#e8a064] group-hover:translate-x-0.5 transition-all opacity-0 group-hover:opacity-100" />
                              </div>
                              <p className="mt-0.5 text-xs text-[#71717a] leading-relaxed">
                                Explore interactive website and software demonstrations.
                              </p>
                            </div>
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            }

            return (
              <li
                key={link.href}
                className="relative"
                onMouseEnter={() => setHovered(link.href)}
              >
                <Link
                  href={link.href}
                  className={`relative z-10 block rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a064]/40 ${
                    isActive(link.href)
                      ? "text-[#f4f4f5]"
                      : "text-[#a1a1aa] hover:text-[#f4f4f5]"
                  }`}
                >
                  {link.label}
                </Link>
                {hovered === link.href && (
                  <motion.span
                    layoutId="nav-hover-pill"
                    className="absolute inset-0 rounded-full bg-[#1c1c1e]"
                    transition={
                      shouldReduceMotion
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 380, damping: 30 }
                    }
                  />
                )}
              </li>
            );
          })}
        </ul>

        {/* ── Desktop Actions ────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden items-center gap-1.5 rounded-full border border-transparent px-3.5 py-2 text-xs font-medium uppercase tracking-[0.12em] text-[#a1a1aa] transition-all hover:border-[#262626] hover:bg-[#141414] hover:text-[#f4f4f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a064]/40 lg:inline-flex"
          >
            Login
          </Link>

          <motion.a
            href="/contact#contact-form"
            whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
            className="hidden rounded-full bg-[#e8a064] px-5 py-2.5 text-sm font-semibold text-[#0f0f0f] shadow-[0_4px_16px_rgba(232,160,100,0.25)] transition-colors hover:bg-[#f0b07a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a064]/40 lg:inline-flex"
          >
            Book Consultation
          </motion.a>

          {/* ── Hamburger Button (mobile / tablet) ───────────────── */}
          <button
            type="button"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            onClick={() => setIsOpen((v) => !v)}
            className="relative z-[60] flex h-11 w-11 items-center justify-center rounded-full border border-[#262626] bg-[#141414] text-[#a1a1aa] shadow-sm hover:bg-[#1c1c1e] hover:text-[#f4f4f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a064]/40 lg:hidden"
          >
            <span className="relative flex h-3.5 w-4 flex-col justify-between">
              <motion.span
                className="h-[2px] w-full bg-current"
                animate={isOpen ? { rotate: 45, y: 5.5 } : { rotate: 0, y: 0 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
              />
              <motion.span
                className="h-[2px] w-full bg-current"
                animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
              />
              <motion.span
                className="h-[2px] w-full bg-current"
                animate={isOpen ? { rotate: -45, y: -5.5 } : { rotate: 0, y: 0 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
              />
            </span>
          </button>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════
          MOBILE FULL-SCREEN NAVIGATION OVERLAY
          ═══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="mobile-menu"
            id="mobile-menu"
            role="navigation"
            aria-label="Mobile navigation"
            initial="closed"
            animate="open"
            exit="closed"
            variants={overlayVariants}
            className="fixed inset-0 top-0 z-50 flex flex-col bg-[#0f0f0f] lg:hidden overflow-y-auto"
            style={{ height: "100dvh" }}
          >
            {/* Subtle ambient glow */}
            <div
              aria-hidden
              className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-[radial-gradient(ellipse,_rgba(232,160,100,0.06),_transparent_70%)]"
            />

            {/* Top bar inside overlay (matches header) */}
            <div className="flex items-center justify-between px-4 py-3 sm:px-6 shrink-0">
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className="flex items-center"
                aria-label="Axivon Technologies Home"
              >
                <Image
                  src="/assets/logo/logo-full.png"
                  alt="Axivon Technologies Logo"
                  width={180}
                  height={48}
                  className="h-10 w-auto sm:h-12 brightness-0 invert"
                />
              </Link>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setIsOpen(false)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[#262626] bg-[#141414] text-[#a1a1aa] hover:bg-[#1c1c1e] hover:text-[#f4f4f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a064]/40"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="4" y1="4" x2="14" y2="14" />
                  <line x1="14" y1="4" x2="4" y2="14" />
                </svg>
              </button>
            </div>

            {/* Navigation links */}
            <motion.ul
              variants={mobileLinkListVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="flex flex-1 flex-col justify-center gap-1 px-6 sm:px-10 py-6"
            >
              {NAV_LINKS.map((link) => {
                if (link.hasDropdown) {
                  return (
                    <motion.li key={link.href} variants={mobileLinkItemVariants} className="flex flex-col">
                      <button
                        type="button"
                        onClick={() => setMobilePortfolioOpen((prev) => !prev)}
                        aria-expanded={mobilePortfolioOpen}
                        className={`group flex items-center justify-between rounded-2xl px-4 py-3 text-2xl font-medium transition-colors sm:text-3xl ${
                          isActive(link.href)
                            ? "text-[#e8a064]"
                            : "text-[#d4d4d8] hover:text-[#f4f4f5]"
                        }`}
                      >
                        <span>{link.label}</span>
                        <ChevronDown
                          className={`h-6 w-6 text-[#71717a] transition-transform duration-200 ${
                            mobilePortfolioOpen ? "rotate-180 text-[#e8a064]" : ""
                          }`}
                        />
                      </button>

                      {/* Collapsible Mobile Submenu */}
                      <AnimatePresence>
                        {mobilePortfolioOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden pl-4 pr-2 pt-1 pb-3 space-y-2 border-l border-[#262626] ml-4 mt-1"
                          >
                            <Link
                              href="/portfolio"
                              onClick={() => setIsOpen(false)}
                              className="block rounded-xl bg-[#141414] p-3 text-base text-[#f4f4f5] hover:bg-[#1c1c1e] border border-[#262626]"
                            >
                              <div className="font-semibold text-[#f4f4f5]">Selected Work</div>
                              <p className="text-xs text-[#71717a] mt-0.5">
                                Explore our selected projects and work.
                              </p>
                            </Link>
                            <Link
                              href="/demo-projects"
                              onClick={() => setIsOpen(false)}
                              className="block rounded-xl bg-[#141414] p-3 text-base text-[#f4f4f5] hover:bg-[#1c1c1e] border border-[#262626]"
                            >
                              <div className="flex items-center gap-2 font-semibold text-[#f4f4f5]">
                                <span>Demo Projects</span>
                                <span className="rounded-full bg-[#e8a064]/10 border border-[#e8a064]/30 px-1.5 py-0.2 text-[9px] text-[#e8a064]">
                                  New
                                </span>
                              </div>
                              <p className="text-xs text-[#71717a] mt-0.5">
                                Explore interactive website and software demonstrations.
                              </p>
                            </Link>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.li>
                  );
                }

                return (
                  <motion.li key={link.href} variants={mobileLinkItemVariants}>
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`group flex items-center justify-between rounded-2xl px-4 py-3 text-2xl font-medium transition-colors sm:text-3xl ${
                        isActive(link.href)
                          ? "text-[#e8a064]"
                          : "text-[#d4d4d8] hover:text-[#f4f4f5] hover:bg-[#1c1c1e]/40"
                      }`}
                    >
                      <span>{link.label}</span>
                      {isActive(link.href) && (
                        <span className="h-1.5 w-1.5 rounded-full bg-[#e8a064]" />
                      )}
                    </Link>
                  </motion.li>
                );
              })}
            </motion.ul>

            {/* Bottom actions */}
            <motion.div
              variants={mobileActionsVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="border-t border-[#262626] px-6 py-6 sm:px-10 shrink-0"
            >
              <div className="flex flex-col gap-3">
                <Link
                  href="/contact#contact-form"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-full bg-[#e8a064] px-6 py-4 text-base font-semibold text-[#0f0f0f] shadow-[0_4px_16px_rgba(232,160,100,0.25)] transition-colors hover:bg-[#f0b07a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a064]/40"
                >
                  Book Consultation
                </Link>
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center rounded-full border border-[#262626] bg-[#141414] px-6 py-3.5 text-sm font-medium text-[#a1a1aa] transition-colors hover:bg-[#1c1c1e] hover:text-[#f4f4f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a064]/40"
                >
                  Portal Login
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
