"use client";

import { useEffect, useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

// ─── Reusable Aurora Background ───────────────────────────────────────────────
function AuroraBackground() {
  const prefersReduced = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* Deep base */}
      <div className="absolute inset-0 bg-[#050816]" />

      {/* Aurora blob — blue */}
      <motion.div
        className="absolute -top-32 left-1/4 h-[520px] w-[520px] rounded-full"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(37,99,235,0.18) 0%, transparent 70%)",
          filter: "blur(72px)",
        }}
        animate={
          prefersReduced
            ? {}
            : {
                x: [0, 28, -18, 0],
                y: [0, -20, 14, 0],
              }
        }
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Aurora blob — purple */}
      <motion.div
        className="absolute -top-16 right-1/4 h-[480px] w-[480px] rounded-full"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(124,58,237,0.14) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
        animate={
          prefersReduced
            ? {}
            : {
                x: [0, -22, 16, 0],
                y: [0, 18, -12, 0],
              }
        }
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3,
        }}
      />

      {/* Aurora blob — cyan accent */}
      <motion.div
        className="absolute bottom-0 left-1/2 h-[360px] w-[360px] -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,212,255,0.08) 0%, transparent 65%)",
          filter: "blur(64px)",
        }}
        animate={
          prefersReduced
            ? {}
            : {
                scale: [1, 1.08, 0.96, 1],
              }
        }
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 6,
        }}
      />

      {/* Cinematic vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, transparent 40%, rgba(5,8,22,0.7) 100%)",
        }}
      />
    </div>
  );
}

// ─── Premium Grid Overlay ──────────────────────────────────────────────────────
function PremiumGrid() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.028]"
    >
      <svg
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0"
      >
        <defs>
          <pattern
            id="cookie-grid"
            width="72"
            height="72"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 72 0 L 0 0 0 72"
              fill="none"
              stroke="rgba(255,255,255,1)"
              strokeWidth="0.6"
            />
          </pattern>
          {/* Fade grid toward bottom */}
          <linearGradient
            id="grid-fade"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
            gradientUnits="objectBoundingBox"
          >
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="70%" stopColor="white" stopOpacity="0.4" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <mask id="grid-mask">
            <rect width="100%" height="100%" fill="url(#grid-fade)" />
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="url(#cookie-grid)"
          mask="url(#grid-mask)"
        />
      </svg>
    </div>
  );
}

// ─── Subtle horizontal light streak ───────────────────────────────────────────
function CinematicStreak() {
  const prefersReduced = useReducedMotion();
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute left-0 right-0 top-[38%] h-px"
      style={{
        background:
          "linear-gradient(90deg, transparent 0%, rgba(37,99,235,0.22) 30%, rgba(0,212,255,0.28) 50%, rgba(124,58,237,0.22) 70%, transparent 100%)",
      }}
      initial={{ opacity: 0, scaleX: 0.4 }}
      animate={prefersReduced ? {} : { opacity: [0, 1, 0], scaleX: [0.4, 1, 0.4] }}
      transition={{ duration: 6, repeat: Infinity, repeatDelay: 8, ease: "easeInOut" }}
    />
  );
}

// ─── Animated Badge ────────────────────────────────────────────────────────────
function LegalBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="inline-flex items-center gap-2"
      role="img"
      aria-label="Legal Information badge"
    >
      {/* Glassmorphism pill */}
      <div
        className="relative flex items-center gap-2 rounded-full border px-4 py-1.5"
        style={{
          background: "rgba(255,255,255,0.04)",
          borderColor: "rgba(255,255,255,0.1)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          boxShadow:
            "0 1px 0 0 rgba(255,255,255,0.06) inset, 0 4px 24px rgba(37,99,235,0.08)",
        }}
      >
        {/* Pulse dot */}
        <span className="relative flex h-1.5 w-1.5 items-center justify-center" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00D4FF] opacity-40" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#00D4FF]" />
        </span>

        <span
          className="text-[10px] font-semibold uppercase tracking-[0.22em]"
          style={{ color: "rgba(255,255,255,0.55)" }}
        >
          Legal Information
        </span>
      </div>
    </motion.div>
  );
}

// ─── Gradient Heading ──────────────────────────────────────────────────────────
function HeroHeading() {
  const ref = useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.h1
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
      className="relative text-center font-extrabold leading-[1.08] tracking-tight"
      style={{ fontSize: "clamp(2.6rem, 6vw, 4.25rem)" }}
    >
      {/* Subtle 3-D depth layer */}
      <span
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center select-none"
        style={{
          backgroundImage:
            "linear-gradient(135deg, #2563EB 0%, #7C3AED 50%, #00D4FF 100%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          filter: "blur(18px)",
          opacity: 0.3,
          transform: "translateY(3px)",
        }}
      >
        Cookie Policy
      </span>

      {/* Main animated gradient text */}
      <motion.span
        className="relative inline-block"
        style={{
          backgroundImage:
            "linear-gradient(120deg, #E2E8F0 0%, #CBD5E1 20%, #2563EB 42%, #7C3AED 60%, #00D4FF 78%, #CBD5E1 92%, #E2E8F0 100%)",
          backgroundSize: "220% auto",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }}
        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
      >
        Cookie Policy
      </motion.span>
    </motion.h1>
  );
}

// ─── Description ──────────────────────────────────────────────────────────────
function HeroDescription() {
  const ref = useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.p
      ref={ref}
      initial={{ opacity: 0, y: 18 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.24 }}
      className="mx-auto max-w-[580px] text-center text-base font-normal leading-relaxed sm:text-lg"
      style={{ color: "rgba(203,213,225,0.65)" }}
    >
      Learn how{" "}
      <span style={{ color: "rgba(203,213,225,0.9)", fontWeight: 500 }}>
        Axivon Technologies
      </span>{" "}
      uses cookies and similar technologies to improve website performance, user
      experience, analytics, and security.
    </motion.p>
  );
}

// ─── Meta Strip ───────────────────────────────────────────────────────────────
const metaItems = [
  { label: "Effective", value: "June 2026" },
  { label: "Applies to", value: "axivontech.in" },
  { label: "Version", value: "1.0" },
];

function MetaStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.36 }}
      className="flex flex-wrap items-center justify-center gap-px"
      role="list"
      aria-label="Document metadata"
    >
      {metaItems.map((item, i) => (
        <div key={item.label} className="flex items-center" role="listitem">
          {/* Glassmorphism chip */}
          <div
            className="flex flex-col items-center px-5 py-2.5 sm:flex-row sm:gap-2"
            style={{
              background: i === 1 ? "rgba(37,99,235,0.07)" : "rgba(255,255,255,0.03)",
              borderRadius: "0",
              ...(i === 0 && { borderRadius: "999px 0 0 999px", paddingLeft: "1.25rem" }),
              ...(i === metaItems.length - 1 && {
                borderRadius: "0 999px 999px 0",
                paddingRight: "1.25rem",
              }),
              border: "1px solid rgba(255,255,255,0.07)",
              borderRight: i < metaItems.length - 1 ? "none" : "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <span
              className="text-[10px] font-medium uppercase tracking-[0.15em]"
              style={{ color: "rgba(148,163,184,0.6)" }}
            >
              {item.label}
            </span>
            <span
              className="text-xs font-semibold sm:text-sm"
              style={{ color: "rgba(226,232,240,0.88)" }}
            >
              {item.value}
            </span>
          </div>
        </div>
      ))}
    </motion.div>
  );
}

// ─── Bottom Divider ────────────────────────────────────────────────────────────
function BottomDivider() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scaleX: 0.5 }}
      animate={inView ? { opacity: 1, scaleX: 1 } : {}}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
      aria-hidden="true"
      className="mx-auto h-px w-full max-w-2xl origin-center"
      style={{
        background:
          "linear-gradient(90deg, transparent 0%, rgba(37,99,235,0.35) 25%, rgba(0,212,255,0.45) 50%, rgba(124,58,237,0.35) 75%, transparent 100%)",
      }}
    />
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function CookieHero() {
  // Scroll-reveal: nudge document up slightly on mount for cinematic feel
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    el.style.opacity = "0";
    const raf = requestAnimationFrame(() => {
      el.style.transition = "opacity 0.4s ease";
      el.style.opacity = "1";
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="cookie-hero-heading"
      className="relative flex min-h-[52vh] flex-col items-center justify-center overflow-hidden px-4 pb-16 pt-28 sm:px-6 lg:px-8"
      style={{ background: "#050816" }}
    >
      {/* ── Atmosphere layers ── */}
      <AuroraBackground />
      <PremiumGrid />
      <CinematicStreak />

      {/* ── Content stack ── */}
      <div className="relative z-10 flex w-full flex-col items-center gap-6">
        {/* Badge */}
        <LegalBadge />

        {/* Heading */}
        <div id="cookie-hero-heading">
          <HeroHeading />
        </div>

        {/* Description */}
        <HeroDescription />

        {/* Meta strip */}
        <MetaStrip />

        {/* Divider */}
        <div className="mt-2 w-full">
          <BottomDivider />
        </div>
      </div>

      {/* Bottom fade into page content */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-20"
        style={{
          background:
            "linear-gradient(to bottom, transparent, rgba(5,8,22,0.85))",
        }}
      />
    </section>
  );
}