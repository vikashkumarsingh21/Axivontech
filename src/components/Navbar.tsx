"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";

interface NavLink {
  label: string;
  href: string;
}

const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Blog", href: "/blog" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact" },
];

const EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];

const menuVariants: Variants = {
  closed: { opacity: 0, height: 0, transition: { duration: 0.35, ease: EASE } },
  open: { opacity: 1, height: "auto", transition: { duration: 0.4, ease: EASE } },
};

const linkListVariants: Variants = {
  closed: {},
  open: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
};

const linkItemVariants: Variants = {
  closed: { opacity: 0, x: -16 },
  open: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    setIsOpen(false);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full backdrop-blur-xl backdrop-saturate-150 transition-all duration-500 ${
        scrolled
          ? "border-b border-white/10 bg-[#07070b]/80 shadow-[0_8px_30px_rgba(0,0,0,0.35)]"
          : "border-b border-white/5 bg-[#07070b]/40"
      }`}
    >
      {/* signature hairline glow */}
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />

      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        {/* Logo */}
        <a
          href="/"
          className="group flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07070b]"
          aria-label="Axivon Technologies home"
        >
          <span className="relative flex h-8 w-8 items-center justify-center transition-transform duration-300 group-hover:scale-105">
            <svg viewBox="0 0 32 32" className="h-8 w-8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="axivon-mark" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#60A5FA" />
                  <stop offset="100%" stopColor="#7C3AED" />
                </linearGradient>
              </defs>
              <path d="M16 2L29 9V23L16 30L3 23V9L16 2Z" stroke="url(#axivon-mark)" strokeWidth="1.6" />
              <path d="M16 9L22.5 12.7V20.1L16 23.8L9.5 20.1V12.7L16 9Z" fill="url(#axivon-mark)" fillOpacity="0.85" />
            </svg>
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-[1.05rem] font-semibold tracking-tight text-white">Axivon</span>
            <span className="text-[0.6rem] font-medium uppercase tracking-[0.2em] text-slate-400">
              Technologies
            </span>
          </span>
        </a>

        {/* Desktop links */}
        <ul
          className="hidden items-center gap-1 lg:flex"
          onMouseLeave={() => setHovered(null)}
        >
          {NAV_LINKS.map((link) => (
            <li key={link.href} className="relative">
              <a
                href={link.href}
                onMouseEnter={() => setHovered(link.href)}
                className="relative z-10 block rounded-full px-4 py-2 text-[0.875rem] font-medium text-slate-300 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60"
              >
                {link.label}
              </a>
              {hovered === link.href && (
                <motion.span
                  layoutId="nav-hover-pill"
                  className="absolute inset-0 rounded-full bg-white/[0.06] ring-1 ring-white/10"
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

        {/* CTA + Hamburger */}
        <div className="flex items-center gap-3">
          <motion.a
            href="/contact"
            whileHover={shouldReduceMotion ? undefined : { scale: 1.035 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
            className="relative hidden overflow-hidden rounded-full bg-gradient-to-r from-blue-500 to-violet-600 px-5 py-2.5 text-[0.85rem] font-semibold text-white shadow-[0_0_0_1px_rgba(255,255,255,0.08)_inset,0_8px_24px_-8px_rgba(99,102,241,0.65)] transition-shadow duration-300 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.12)_inset,0_10px_30px_-6px_rgba(124,58,237,0.75)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07070b] lg:inline-flex"
          >
            Book Consultation
          </motion.a>

          <button
            type="button"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            onClick={() => setIsOpen((v) => !v)}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 lg:hidden"
          >
            <span className="relative flex h-3.5 w-4 flex-col justify-between">
              <motion.span
                className="h-[1.5px] w-full bg-white"
                animate={isOpen ? { rotate: 45, y: 5.5 } : { rotate: 0, y: 0 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
              />
              <motion.span
                className="h-[1.5px] w-full bg-white"
                animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
              />
              <motion.span
                className="h-[1.5px] w-full bg-white"
                animate={isOpen ? { rotate: -45, y: -5.5 } : { rotate: 0, y: 0 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
              />
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="mobile-menu"
            id="mobile-menu"
            role="navigation"
            aria-label="Mobile"
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            className="overflow-hidden border-t border-white/10 bg-[#07070b]/95 backdrop-blur-xl lg:hidden"
          >
            <motion.ul
              variants={linkListVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="flex flex-col gap-1 px-6 py-6"
            >
              {NAV_LINKS.map((link) => (
                <motion.li key={link.href} variants={linkItemVariants}>
                  <a
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="block rounded-lg px-3 py-3 text-[0.95rem] font-medium text-slate-200 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60"
                  >
                    {link.label}
                  </a>
                </motion.li>
              ))}
              <motion.li variants={linkItemVariants} className="mt-2">
                <a
                  href="/contact"
                  onClick={() => setIsOpen(false)}
                  className="block rounded-full bg-gradient-to-r from-blue-500 to-violet-600 px-5 py-3 text-center text-[0.9rem] font-semibold text-white shadow-[0_8px_24px_-8px_rgba(99,102,241,0.65)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
                >
                  Book Consultation
                </a>
              </motion.li>
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}