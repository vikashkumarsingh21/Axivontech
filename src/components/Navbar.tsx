"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";

const EASE_NAV = [0.22, 1, 0.36, 1] as const;

interface NavLink {
  label: string;
  href: string;
}

const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Industries", href: "/industries" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Blog", href: "/blog" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact" },
];

const EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];

/* ── Desktop hover-pill variants ─────────────────────────────── */
const menuVariants: Variants = {
  closed: { opacity: 0, height: 0, transition: { duration: 0.35, ease: EASE } },
  open: { opacity: 1, height: "auto", transition: { duration: 0.4, ease: EASE } },
};

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
  open: { transition: { staggerChildren: 0.06, delayChildren: 0.12 } },
};

const mobileLinkItemVariants: Variants = {
  closed: { opacity: 0, y: 12 },
  open: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE_NAV } },
};

const mobileActionsVariants: Variants = {
  closed: { opacity: 0, y: 16 },
  open: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_NAV, delay: 0.45 } },
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const pathname = usePathname();

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

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Close on Escape
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape" && isOpen) {
      setIsOpen(false);
    }
  }, [isOpen]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

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
          onMouseLeave={() => setHovered(null)}
        >
          {NAV_LINKS.map((link) => (
            <li key={link.href} className="relative">
              <Link
                href={link.href}
                onMouseEnter={() => setHovered(link.href)}
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
          ))}
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
            className="fixed inset-0 top-0 z-50 flex flex-col bg-[#0f0f0f] lg:hidden"
            style={{ height: "100dvh" }}
          >
            {/* Subtle ambient glow */}
            <div
              aria-hidden
              className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-[radial-gradient(ellipse,_rgba(232,160,100,0.06),_transparent_70%)]"
            />

            {/* Top bar inside overlay (matches header) */}
            <div className="flex items-center justify-between px-4 py-3 sm:px-6">
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
              className="flex flex-1 flex-col justify-center gap-1 px-6 sm:px-10 -mt-16"
            >
              {NAV_LINKS.map((link) => (
                <motion.li key={link.href} variants={mobileLinkItemVariants}>
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`group flex items-center justify-between rounded-2xl px-4 py-4 text-2xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a064]/40 sm:text-3xl ${
                      isActive(link.href)
                        ? "text-[#e8a064]"
                        : "text-[#d4d4d8] hover:text-[#f4f4f5] hover:bg-[#1c1c1e]/50"
                    }`}
                  >
                    <span>{link.label}</span>
                    {isActive(link.href) && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#e8a064]" />
                    )}
                  </Link>
                </motion.li>
              ))}
            </motion.ul>

            {/* Bottom actions */}
            <motion.div
              variants={mobileActionsVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="border-t border-[#262626] px-6 py-6 sm:px-10"
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