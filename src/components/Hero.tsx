"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.11, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 22 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

const fadeIn = (delay = 0) => ({
  hidden: { opacity: 0, y: 18 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE, delay } },
});

// ── Stat item ─────────────────────────────────────────────────────
function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-2xl font-bold text-[#f4f4f5]">{value}</span>
      <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#71717a]">
        {label}
      </span>
    </div>
  );
}

// ── Service pill ──────────────────────────────────────────────────
function ServicePill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[#262626] bg-[#1c1c1e] px-3.5 py-1.5 text-[11px] font-medium text-[#a1a1aa]">
      {label}
    </span>
  );
}

// ── Hero dashboard mockup ─────────────────────────────────────────
function DashboardMockup() {
  return (
    <div
      aria-hidden
      className="relative w-full"
      style={{ perspective: "900px" }}
    >
      {/* Outer glow */}
      <div className="pointer-events-none absolute -inset-10 rounded-3xl bg-[radial-gradient(ellipse_at_center,_rgba(232,160,100,0.10),_transparent_65%)]" />

      {/* Browser frame */}
      <div
        className="relative overflow-hidden rounded-2xl border border-[#2a2a2a] bg-[#141414] shadow-[0_32px_80px_rgba(0,0,0,0.6)]"
        style={{ transform: "rotateX(4deg) rotateY(-2deg)" }}
      >
        {/* Browser chrome bar */}
        <div className="flex items-center gap-2 border-b border-[#1c1c1e] bg-[#0f0f0f] px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          <div className="mx-auto flex w-48 items-center gap-1.5 rounded-md bg-[#1c1c1e] px-3 py-1">
            <span className="h-2 w-2 rounded-full border border-[#303030]" />
            <span className="text-[9px] text-[#52525b]">axivontech.in</span>
          </div>
        </div>

        {/* Page preview */}
        <div className="flex h-64 gap-0 sm:h-72">
          {/* Sidebar */}
          <div className="hidden w-36 shrink-0 flex-col gap-1 border-r border-[#1c1c1e] bg-[#0f0f0f] p-3 sm:flex">
            <div className="mb-2 h-5 w-16 rounded bg-[#1c1c1e]" />
            {["Web Dev", "Mobile", "AI", "SEO", "Design"].map((s) => (
              <div
                key={s}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[9px] text-[#52525b] first:bg-[#2a1f14] first:text-[#e8a064]"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
                {s}
              </div>
            ))}
          </div>

          {/* Main content area */}
          <div className="flex-1 overflow-hidden p-4">
            <div className="mb-4 grid grid-cols-3 gap-2">
              {[
                { label: "Projects", val: "10+", color: "text-[#e8a064]" },
                { label: "Clients", val: "8+", color: "text-[#4ade80]" },
                { label: "Services", val: "11", color: "text-[#60a5fa]" },
              ].map((c) => (
                <div key={c.label} className="rounded-lg border border-[#1c1c1e] bg-[#0f0f0f] p-2">
                  <div className={`text-sm font-bold ${c.color}`}>{c.val}</div>
                  <div className="mt-0.5 text-[8px] text-[#52525b]">{c.label}</div>
                </div>
              ))}
            </div>
            {/* Graph bars */}
            <div className="rounded-lg border border-[#1c1c1e] bg-[#0f0f0f] p-3">
              <div className="mb-2 text-[9px] text-[#52525b]">Delivery Performance</div>
              <div className="flex items-end gap-1 h-16">
                {[40, 65, 50, 80, 60, 90, 75, 95].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm"
                    style={{
                      height: `${h}%`,
                      background: i === 7
                        ? "linear-gradient(to top, #e8a064, #f0b07a)"
                        : "#1c1c1e",
                    }}
                  />
                ))}
              </div>
            </div>
            {/* Project rows */}
            <div className="mt-3 space-y-1.5">
              {["Krishi Drishti", "JalMitra", "Nani Tathagat"].map((p) => (
                <div key={p} className="flex items-center gap-2 rounded-md border border-[#1c1c1e] bg-[#0f0f0f] px-2 py-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#4ade80]" />
                  <span className="text-[9px] text-[#52525b]">{p}</span>
                  <span className="ml-auto rounded bg-[#242424] px-1 py-0.5 text-[8px] text-[#71717a]">
                    Live
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Hero ──────────────────────────────────────────────────────────

export default function Hero() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-[#0f0f0f] pt-20 pb-16 sm:pt-28 sm:pb-20 lg:pt-32 lg:pb-28">
      {/* Ambient glow top-left */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-32 h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(circle,_rgba(232,160,100,0.08),_transparent_65%)]"
      />
      {/* Subtle grid overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(var(--border-1) 1px, transparent 1px), linear-gradient(90deg, var(--border-1) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">

          {/* ── Left: Copy ───────────────────────────── */}
          <motion.div
            variants={container}
            initial={shouldReduceMotion ? false : "hidden"}
            animate="show"
            className="flex flex-col items-center text-center lg:items-start lg:text-left"
          >
            {/* Overline badge */}
            <motion.div variants={item}>
              <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-[rgba(232,160,100,0.25)] bg-[#2a1f14] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#e8a064]">
                Technology Company · India
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={item}
              className="max-w-2xl text-[2.6rem] font-bold leading-[1.05] tracking-tight text-[#f4f4f5] sm:text-5xl lg:text-[3.5rem]"
            >
              We build digital products that{" "}
              <span className="text-gradient-amber">
                move businesses forward.
              </span>
            </motion.h1>

            {/* Sub-copy */}
            <motion.p
              variants={item}
              className="mt-6 max-w-lg text-base leading-7 text-[#a1a1aa] sm:text-lg"
            >
              Axivon Technologies designs and engineers websites, mobile apps, AI
              systems, and custom software for startups, schools, healthcare teams,
              and growing businesses.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={item}
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <a
                href="/contact#contact-form"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#e8a064] px-7 py-3.5 text-sm font-semibold text-[#0f0f0f] shadow-[0_4px_20px_rgba(232,160,100,0.30)] transition-all hover:bg-[#f0b07a] hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#e8a064]"
              >
                Start a Project
                <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
              </a>
              <a
                href="/portfolio"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#303030] bg-transparent px-7 py-3.5 text-sm font-semibold text-[#f4f4f5] transition-all hover:border-[rgba(232,160,100,0.4)] hover:text-[#e8a064] hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#e8a064]"
              >
                Explore Our Work
              </a>
            </motion.div>

            {/* Service pills */}
            <motion.div
              variants={item}
              className="mt-8 flex flex-wrap items-center justify-center gap-2 lg:justify-start"
            >
              {[
                "Web Development",
                "Mobile Apps",
                "AI Solutions",
                "UI/UX Design",
                "SEO",
              ].map((s) => (
                <ServicePill key={s} label={s} />
              ))}
            </motion.div>

            {/* Stats row */}
            <motion.div
              variants={item}
              className="mt-10 flex flex-wrap items-center justify-center gap-8 border-t border-[#1c1c1e] pt-8 lg:justify-start"
            >
              <Stat value="10+" label="Projects Delivered" />
              <div className="hidden h-8 w-px bg-[#262626] sm:block" />
              <Stat value="8" label="Services" />
              <div className="hidden h-8 w-px bg-[#262626] sm:block" />
              <Stat value="24/7" label="Support" />
              <div className="hidden h-8 w-px bg-[#262626] sm:block" />
              <Stat value="100%" label="Quality Focus" />
            </motion.div>
          </motion.div>

          {/* ── Right: Dashboard mockup ───────────────── */}
          <motion.div
            variants={fadeIn(0.25)}
            initial={shouldReduceMotion ? false : "hidden"}
            animate="show"
            className="relative hidden lg:block"
          >
            <DashboardMockup />
          </motion.div>
        </div>
      </div>
    </section>
  );
}