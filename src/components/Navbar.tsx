"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
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
  open: { opacity: 1, x: 0, transition: { duration: 0.3, ease: EASE_NAV } },
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

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-[#262626] bg-[#0f0f0f]/95 backdrop-blur-xl shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
          : "border-b border-transparent bg-[#0f0f0f]/90 backdrop-blur-xl"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-10">
        <Link
          href="/"
          className="group flex items-center rounded-md transition-opacity hover:opacity-90"
          aria-label="Axivon Technologies Home"
        >
          <Image
            src="/assets/logo/logo-full.png"
            alt="Axivon Technologies Logo"
            width={220}
            height={60}
            priority
            className="h-12 w-auto sm:h-14 brightness-0 invert"
          />
        </Link>

        <ul
          className="hidden items-center gap-1 lg:flex"
          onMouseLeave={() => setHovered(null)}
        >
          {NAV_LINKS.map((link) => (
            <li key={link.href} className="relative">
              <a
                href={link.href}
                onMouseEnter={() => setHovered(link.href)}
                className="relative z-10 block rounded-full px-4 py-2 text-sm font-medium text-[#a1a1aa] transition-colors duration-200 hover:text-[#f4f4f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a064]/40"
              >
                {link.label}
              </a>
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

        <div className="flex items-center gap-3">
          <motion.a
            href="/contact#contact-form"
            whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
            className="hidden rounded-full bg-[#e8a064] px-5 py-2.5 text-sm font-semibold text-[#0f0f0f] shadow-[0_4px_16px_rgba(232,160,100,0.25)] transition-colors hover:bg-[#f0b07a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a064]/40 lg:inline-flex"
          >
            Book Consultation
          </motion.a>

          <button
            type="button"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            onClick={() => setIsOpen((v) => !v)}
            className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[#262626] bg-[#141414] text-[#a1a1aa] shadow-sm hover:bg-[#1c1c1e] hover:text-[#f4f4f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a064]/40 lg:hidden"
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
            className="overflow-hidden border-t border-[#262626] bg-[#141414] shadow-[0_16px_40px_rgba(0,0,0,0.5)] lg:hidden"
          >
            <motion.ul
              variants={linkListVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="flex flex-col gap-1 px-5 py-5"
            >
              {NAV_LINKS.map((link) => (
                <motion.li key={link.href} variants={linkItemVariants}>
                  <a
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="block rounded-2xl px-3 py-3 text-sm font-medium text-[#a1a1aa] transition-colors hover:bg-[#1c1c1e] hover:text-[#f4f4f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a064]/40"
                  >
                    {link.label}
                  </a>
                </motion.li>
              ))}
              <motion.li variants={linkItemVariants} className="mt-2">
                <a
                  href="/contact#contact-form"
                  onClick={() => setIsOpen(false)}
                  className="block rounded-full bg-[#e8a064] px-5 py-3 text-center text-sm font-semibold text-[#0f0f0f] transition-colors hover:bg-[#f0b07a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a064]/40"
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