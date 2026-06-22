"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

export default function TermsHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // ── Soft particle system (identical density/speed to PrivacyPolicyHero) ──
  useEffect(() => {
    if (prefersReducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles: {
      x: number;
      y: number;
      r: number;
      vx: number;
      vy: number;
      alpha: number;
    }[] = Array.from({ length: 38 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.4,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      alpha: Math.random() * 0.25 + 0.06,
    }));

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(37,99,235,${p.alpha})`;
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [prefersReducedMotion]);

  // ── Shared staggered fade-up variant ──
  const fadeUp = {
    hidden: { opacity: 0, y: 22 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.13,
        duration: 0.62,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      },
    }),
  };

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        background: "#050816",
        minHeight: "min(540px, 72vh)",
        display: "flex",
        alignItems: "center",
      }}
      aria-label="Terms and Conditions hero"
    >
      {/* ── Professional grid ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(37,99,235,0.055) 1px, transparent 1px),
            linear-gradient(90deg, rgba(37,99,235,0.055) 1px, transparent 1px)
          `,
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 80% 80% at 50% 40%, black 30%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 80% at 50% 40%, black 30%, transparent 100%)",
        }}
      />

      {/* ── Aurora glow ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {/* Left aurora – blue */}
        <div
          className="absolute"
          style={{
            top: "-10%",
            left: "-8%",
            width: "52%",
            height: "70%",
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse, rgba(37,99,235,0.12) 0%, transparent 70%)",
            filter: "blur(56px)",
          }}
        />
        {/* Right aurora – purple */}
        <div
          className="absolute"
          style={{
            bottom: "-12%",
            right: "-6%",
            width: "46%",
            height: "65%",
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse, rgba(124,58,237,0.10) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        {/* Center cinematic crown light */}
        <div
          className="absolute left-1/2 top-0 -translate-x-1/2"
          style={{
            width: "60%",
            height: "55%",
            background:
              "radial-gradient(ellipse, rgba(0,212,255,0.055) 0%, transparent 72%)",
            filter: "blur(40px)",
          }}
        />
      </div>

      {/* ── Soft particles canvas ── */}
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full"
      />

      {/* ── Cinematic top vignette ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-28"
        style={{
          background:
            "linear-gradient(to bottom, rgba(5,8,22,0.72) 0%, transparent 100%)",
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 mx-auto w-full max-w-5xl px-6 py-24 sm:px-10 lg:px-16 lg:py-32">

        {/* Badge */}
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mb-7 flex justify-center"
        >
          <span
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.2em]"
            style={{
              background: "rgba(37,99,235,0.08)",
              border: "1px solid rgba(37,99,235,0.22)",
              color: "#93BBFD",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
          >
            {/* Scroll / document icon */}
            <ScrollIcon />
            Legal Information
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-center text-4xl font-bold sm:text-5xl lg:text-6xl"
          style={{ letterSpacing: "-0.02em", lineHeight: 1.1 }}
        >
          <span
            style={{
              backgroundImage:
                "linear-gradient(135deg, #E2E8F0 0%, #CBD5E1 28%, #93C5FD 58%, #A5B4FC 80%, #C4B5FD 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              backgroundSize: "200% 200%",
              animation: prefersReducedMotion
                ? "none"
                : "termsGradientShift 7s ease infinite",
            }}
          >
            Terms &amp; Conditions
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mx-auto mt-6 max-w-2xl text-center text-base leading-relaxed sm:text-lg"
          style={{ color: "rgba(203,213,225,0.7)", letterSpacing: "0.005em" }}
        >
          Review the terms and conditions governing the use of Axivon
          Technologies services, website, products, and digital platforms.
        </motion.p>

        {/* Glass info strip */}
        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mx-auto mt-12 flex max-w-2xl flex-wrap items-center justify-center gap-4"
        >
          {INFO_CHIPS.map(({ Icon, label, value }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-xl px-5 py-3"
              style={{
                background: "rgba(255,255,255,0.035)",
                border: "1px solid rgba(255,255,255,0.07)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
              }}
            >
              <Icon />
              <div>
                <p
                  className="text-[10px] font-medium uppercase tracking-widest"
                  style={{ color: "rgba(148,163,184,0.6)" }}
                >
                  {label}
                </p>
                <p
                  className="mt-0.5 text-sm font-semibold"
                  style={{ color: "#E2E8F0" }}
                >
                  {value}
                </p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Thin gradient divider */}
        <motion.div
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mx-auto mt-12"
          style={{
            height: "1px",
            maxWidth: "480px",
            background:
              "linear-gradient(90deg, transparent, rgba(37,99,235,0.35) 30%, rgba(124,58,237,0.35) 70%, transparent)",
          }}
        />
      </div>

      {/* ── Bottom fade to content ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-20"
        style={{
          background:
            "linear-gradient(to top, rgba(5,8,22,0.65) 0%, transparent 100%)",
        }}
      />

      {/* Keyframe scoped to this component's animation name */}
      <style jsx global>{`
        @keyframes termsGradientShift {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>
    </section>
  );
}

// ─────────────────────────────────────────────
// Info chip data
// ─────────────────────────────────────────────
const INFO_CHIPS: {
  Icon: () => ReactNode;
  label: string;
  value: string;
}[] =
  [
    { Icon: CalendarIcon, label: "Effective Date", value: "May 1, 2026" },
    { Icon: RefreshIcon, label: "Last Updated", value: "June 2026" },
    { Icon: ScopeIcon, label: "Applies To", value: "All Users" },
  ];

// ─────────────────────────────────────────────
// Inline SVG icons (no external dependency)
// ─────────────────────────────────────────────

/** Badge icon — document/scroll, matches the legal theme */
function ScrollIcon() {
  return (
    <svg
      width="12"
      height="13"
      viewBox="0 0 12 13"
      fill="none"
      aria-hidden={true}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="1"
        y="1"
        width="10"
        height="11"
        rx="2"
        stroke="#93BBFD"
        strokeWidth="1"
      />
      <path
        d="M3.5 4.5h5M3.5 6.5h5M3.5 8.5h3"
        stroke="#93BBFD"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden={true}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="1.5"
        y="2.5"
        width="13"
        height="12"
        rx="2"
        stroke="#60A5FA"
        strokeWidth="1"
      />
      <path d="M1.5 6.5h13" stroke="#60A5FA" strokeWidth="1" />
      <path
        d="M5 1v3M11 1v3"
        stroke="#60A5FA"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden={true}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M13.5 8A5.5 5.5 0 1 1 8 2.5c1.6 0 3.04.68 4.06 1.77"
        stroke="#A78BFA"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <path
        d="M11.5 1.5v3H14.5"
        stroke="#A78BFA"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** "Applies To" chip — users/people icon */
function ScopeIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden={true}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="8" cy="5.5" r="2.5" stroke="#67E8F9" strokeWidth="1" />
      <path
        d="M2.5 13.5C2.5 11.015 5.015 9 8 9s5.5 2.015 5.5 4.5"
        stroke="#67E8F9"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  );
}