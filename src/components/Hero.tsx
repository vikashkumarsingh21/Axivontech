"use client";

import React, { useEffect, useState } from "react";
import {
  motion,
  AnimatePresence,
  MotionConfig,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
const EASE_HERO = [0.16, 1, 0.3, 1] as const;

/**
 * Fonts
 * NOTE: For a production app these would typically live in app/layout.tsx
 * and be applied globally. They're instantiated here so this file is a
 * fully self-contained, drop-in Hero section.
 */
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

/** Brand tokens */
const COLORS = {
  bg: "#050816",
  primary: "#7C3AED",
  secondary: "#2563EB",
  accent: "#00D4FF",
  text: "#FFFFFF",
};

const STATUS_LINES = [
  "Initializing core infrastructure...",
  "Provisioning cloud architecture across 3 regions...",
  "Running automated security audits...",
  "Deploying scalable, future-ready systems...",
  "Status: all systems operational.",
];

const KPI_CHIPS = [
  { label: "Uptime", value: "99.9%" },
  { label: "Avg. Response", value: "< 2h" },
  { label: "Stack", value: "Next.js · AI" },
];

/** Subtle film-grain texture, generated inline so no image asset is needed */
const NOISE_SVG = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>`;

/** ---------- Small presentational helpers ---------- */

function PulseDot({ color }: { color: string }) {
  return (
    <span className="relative flex h-2 w-2 shrink-0">
      <span
        className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
        style={{ backgroundColor: color }}
      />
      <span
        className="relative inline-flex h-2 w-2 rounded-full"
        style={{ backgroundColor: color }}
      />
    </span>
  );
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M7 17 17 7M9 7h8v8"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** ---------- Animation variants ---------- */

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE_HERO },
  },
};

const panelVariants = {
  hidden: { opacity: 0, y: 32, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.8, ease: EASE_HERO, delay: 0.4 },
  },
};

/** ---------- Hero Section ---------- */

function Hero() {
  const shouldReduceMotion = useReducedMotion();

  // Pointer-driven parallax for the floating console + ambient glows
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 60, damping: 20, mass: 0.5 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 20, mass: 0.5 });

  const tiltX = useTransform(springY, [-0.5, 0.5], [6, -6]);
  const tiltY = useTransform(springX, [-0.5, 0.5], [-6, 6]);

  const blobOneX = useTransform(springX, [-0.5, 0.5], [-24, 24]);
  const blobOneY = useTransform(springY, [-0.5, 0.5], [-24, 24]);
  const blobTwoX = useTransform(springX, [-0.5, 0.5], [20, -20]);
  const blobTwoY = useTransform(springY, [-0.5, 0.5], [16, -16]);

  function handlePointerMove(e: React.PointerEvent<HTMLElement>) {
    if (shouldReduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  // Cycles the "live status" console lines
  const [lineIndex, setLineIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setLineIndex((i) => (i + 1) % STATUS_LINES.length);
    }, 2600);
    return () => clearInterval(id);
  }, []);

  return (
    <section
      onPointerMove={handlePointerMove}
      className={`relative min-h-[100svh] w-full overflow-hidden bg-[#050816] ${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}
      style={{ fontFamily: "var(--font-body)" }}
    >
      {/* ---------- Background layers ---------- */}

      {/* Grain texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,${NOISE_SVG}")`,
        }}
      />

      {/* HUD-style perspective grid floor */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] opacity-[0.18] [mask-image:linear-gradient(to_top,black,transparent)]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(124,58,237,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.5) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          transform: "perspective(600px) rotateX(60deg) scale(1.6)",
          transformOrigin: "bottom",
        }}
      />

      {/* Ambient gradient glows */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-0 h-72 w-72 rounded-full opacity-30 blur-3xl sm:h-96 sm:w-96"
        style={{ backgroundColor: COLORS.primary, x: blobOneX, y: blobOneY }}
        animate={shouldReduceMotion ? undefined : { scale: [1, 1.12, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-6rem] top-1/4 h-80 w-80 rounded-full opacity-25 blur-3xl sm:h-[28rem] sm:w-[28rem]"
        style={{ backgroundColor: COLORS.secondary, x: blobTwoX, y: blobTwoY }}
        animate={shouldReduceMotion ? undefined : { scale: [1, 1.15, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-4rem] left-1/3 h-64 w-64 rounded-full opacity-20 blur-3xl"
        style={{ backgroundColor: COLORS.accent }}
        animate={shouldReduceMotion ? undefined : { scale: [1, 1.2, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />

      {/* ---------- Foreground content ---------- */}

      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-6 py-28 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12 lg:py-20">
        {/* Left column: copy + CTAs */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center text-center lg:items-start lg:text-left"
        >
          {/* Trust badge */}
          <motion.div
            variants={itemVariants}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-xl"
          >
            <PulseDot color={COLORS.accent} />
            <span
              className="text-xs uppercase tracking-wider text-white/70"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Trusted by Innovative Businesses
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <span className="block">Future-Ready Technology</span>
            <span
              className="block bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.secondary}, ${COLORS.accent})`,
              }}
            >
              For Modern Businesses
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={itemVariants}
            className="mt-6 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg"
          >
            Axivon Technologies helps businesses grow through websites, mobile applications, AI-powered solutions, cloud technologies, and digital marketing services.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={itemVariants}
            className="mt-10 flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row"
          >
            <motion.a
              href="/contact#contact-form"
              whileHover={shouldReduceMotion ? undefined : { scale: 1.03 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
              className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-full px-8 py-4 text-sm font-semibold text-white shadow-[0_0_40px_-10px_rgba(124,58,237,0.7)] transition-shadow duration-300 hover:shadow-[0_0_55px_-8px_rgba(0,212,255,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050816] sm:w-auto"
              style={{
                backgroundImage: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 55%, ${COLORS.accent} 130%)`,
              }}
            >
              <span
                aria-hidden="true"
                className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
              />
              <span className="relative z-10">Book Free Consultation</span>
              <ArrowIcon className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </motion.a>

            <motion.a
              href="/portfolio/page.tsx"
              whileHover={shouldReduceMotion ? undefined : { scale: 1.03 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-8 py-4 text-sm font-semibold text-white backdrop-blur-xl transition-colors duration-300 hover:border-[#00D4FF]/50 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050816] sm:w-auto"
            >
              <span>View Portfolio</span>
              <ArrowIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </motion.a>
          </motion.div>

          {/* Mono stats row */}``
          <motion.div
            variants={itemVariants}
            className="mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] uppercase tracking-wider text-white/40 lg:justify-start"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <span>Web Development</span>
            <span className="h-1 w-1 rounded-full bg-white/20" />
            <span>Mobile Apps</span>
            <span className="h-1 w-1 rounded-full bg-white/20" />
            <span>AI Solutions</span>
          </motion.div>
        </motion.div>

        {/* Right column: signature "live systems" console */}
        <div className="flex justify-center lg:justify-end">
          <motion.div
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-sm"
          >
            <div
              className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/40"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <PulseDot color={COLORS.accent} />
              Live System Status
            </div>

            <motion.div
              style={{
                rotateX: tiltX,
                rotateY: tiltY,
                transformPerspective: 800,
              }}
              className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-2xl backdrop-blur-2xl"
            >
              {/* Console header */}
              <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]/70" />
                <span
                  className="ml-2 text-[11px] text-white/40"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  axivon@systems — status
                </span>
              </div>

              {/* Typing status line */}
              <div className="min-h-[88px] px-5 py-5">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={lineIndex}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.4 }}
                    className="text-[13px] leading-relaxed"
                    style={{ fontFamily: "var(--font-mono)", color: COLORS.accent }}
                  >
                    <span className="text-white/30">{">"}</span>{" "}
                    {STATUS_LINES[lineIndex]}
                    <span className="ml-0.5 motion-safe:animate-pulse">_</span>
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* KPI chips */}
              <div className="grid grid-cols-3 gap-px border-t border-white/10 bg-white/5">
                {KPI_CHIPS.map((chip) => (
                  <div key={chip.label} className="bg-[#050816]/40 px-3 py-3 text-center">
                    <p
                      className="text-sm font-semibold text-white"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {chip.value}
                    </p>
                    <p className="mt-0.5 text-[10px] uppercase tracking-wider text-white/40">
                      {chip.label}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 sm:flex"
      >
        <span
          className="text-[10px] uppercase tracking-[0.3em] text-white/30"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Scroll
        </span>
        <span className="flex h-9 w-5 items-start justify-center rounded-full border border-white/15 p-1">
          <motion.span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: COLORS.accent }}
            animate={shouldReduceMotion ? undefined : { y: [0, 14, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
      </motion.div>
    </section>
  );
}

export default function Home() {
  return (
    <MotionConfig reducedMotion="user">
      <main className={inter.className}>
        <Hero />
      </main>
    </MotionConfig>
  );
}