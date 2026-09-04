"use client";

import React, { useRef, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, CheckCircle2, Sparkles, Terminal } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const EASE = [0.16, 1, 0.3, 1] as const;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

// ── Stat Item ─────────────────────────────────────────────────────
function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-2xl font-bold tracking-tight text-[#f4f4f5]">{value}</span>
      <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#71717a]">
        {label}
      </span>
    </div>
  );
}

// ── Agency Video Element ──────────────────────────────────────────
function HeroMediaWindow({ shouldReduceMotion }: { shouldReduceMotion: boolean | null }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (shouldReduceMotion) return;
    const video = videoRef.current;
    if (video) {
      video.play().catch(() => {});
    }
  }, [shouldReduceMotion]);

  return (
    <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
      {/* Subtle ambient warm glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-6 rounded-3xl bg-[radial-gradient(ellipse_at_center,_rgba(232,160,100,0.12),_transparent_70%)] blur-2xl"
      />

      {/* Frame Container */}
      <div className="relative overflow-hidden rounded-2xl border border-[#262626] bg-[#141414] shadow-[0_24px_64px_rgba(0,0,0,0.6)]">
        {/* Terminal Header Bar */}
        <div className="flex items-center justify-between border-b border-[#262626] bg-[#0f0f0f] px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            <span className="ml-2 font-mono text-[11px] text-[#71717a]">axivon-technologies / engineering</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-[#1c1c1e] px-2.5 py-1 text-[10px] font-medium text-[#a1a1aa]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#4ade80]" />
            <span>Deployment Active</span>
          </div>
        </div>

        {/* Video / Poster Stage */}
        <div className="relative aspect-video w-full overflow-hidden bg-[#0c0c0c]">
          {!shouldReduceMotion ? (
            <video
              ref={videoRef}
              src="/assets/video/hero-developer.mp4"
              poster="/assets/video/hero-poster.jpg"
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              className="h-full w-full object-cover object-center opacity-85 transition-opacity duration-700 hover:opacity-100"
            />
          ) : (
            <Image
              src="/assets/video/hero-poster.jpg"
              alt="Software developer engineering applications at Axivon Technologies"
              fill
              priority
              className="object-cover object-center opacity-90"
            />
          )}

          {/* Video Gradient Vignette */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-transparent opacity-80" />

          {/* Floating Live Architecture Overlay */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#0f0f0f]/90 p-3 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2a1f14] text-[#e8a064]">
                <Terminal className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#f4f4f5]">Production-Grade Stack</p>
                <p className="text-[11px] text-[#71717a]">Next.js 16 • React 19 • TypeScript • Cloud Native</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-1 text-[11px] text-[#4ade80]">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Reliable Architecture</span>
            </div>
          </div>
        </div>

        {/* Bottom Feature Ticker */}
        <div className="grid grid-cols-3 divide-x divide-[#262626] border-t border-[#262626] bg-[#121212] py-2.5 text-center text-[11px] font-medium text-[#a1a1aa]">
          <div>Agile Sprints</div>
          <div>SEO & Speed First</div>
          <div>Full-Stack Ownership</div>
        </div>
      </div>
    </div>
  );
}

// ── Main Hero Component ───────────────────────────────────────────
export default function Hero() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-[#0f0f0f] pt-14 pb-16 sm:pt-20 sm:pb-20 lg:pt-24 lg:pb-28">
      {/* Ambient ambient background illumination */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-32 h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(circle,_rgba(232,160,100,0.08),_transparent_65%)]"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-12">
          {/* ── Left Column: Editorial Agency Narrative ───────────── */}
          <motion.div
            variants={container}
            initial={shouldReduceMotion ? false : "hidden"}
            animate="show"
            className="flex flex-col items-center text-center lg:col-span-6 lg:items-start lg:text-left"
          >
            {/* Overline badge */}
            <motion.div variants={item}>
              <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-[rgba(232,160,100,0.25)] bg-[#2a1f14] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#e8a064]">
                <Sparkles className="h-3 w-3" />
                Technology & Digital Agency · India
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={item}
              className="max-w-2xl text-[2.4rem] font-bold leading-[1.08] tracking-tight text-[#f4f4f5] sm:text-5xl lg:text-[3.25rem]"
            >
              We build digital products that{" "}
              <span className="text-gradient-amber">
                move businesses forward.
              </span>
            </motion.h1>

            {/* Sub-copy */}
            <motion.p
              variants={item}
              className="mt-6 max-w-xl text-base leading-7 text-[#a1a1aa] sm:text-lg"
            >
              Axivon Technologies designs and engineers high-performance websites,
              mobile apps, AI systems, and custom software for startups, healthcare teams,
              educational platforms, and ambitious businesses.
            </motion.p>

            {/* Primary & Secondary Action CTAs */}
            <motion.div
              variants={item}
              className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center"
            >
              <Link
                href="/contact#contact-form"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#e8a064] px-7 py-3.5 text-sm font-semibold text-[#0f0f0f] shadow-[0_4px_20px_rgba(232,160,100,0.30)] transition-all hover:bg-[#f0b07a] hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#e8a064]"
              >
                <span>Start a Project</span>
                <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
              </Link>
              <Link
                href="/portfolio"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#303030] bg-[#141414] px-7 py-3.5 text-sm font-semibold text-[#f4f4f5] transition-all hover:border-[rgba(232,160,100,0.4)] hover:text-[#e8a064] hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#e8a064]"
              >
                <span>View Selected Work</span>
              </Link>
            </motion.div>

            {/* Capability Badges */}
            <motion.div
              variants={item}
              className="mt-8 flex flex-wrap items-center justify-center gap-2 lg:justify-start"
            >
              {[
                "Web Architecture",
                "Mobile Systems",
                "AI Automation",
                "UI/UX Design",
                "Technical SEO",
              ].map((pill) => (
                <span
                  key={pill}
                  className="inline-flex items-center rounded-full border border-[#262626] bg-[#18181b] px-3 py-1 text-[11px] font-medium text-[#a1a1aa]"
                >
                  {pill}
                </span>
              ))}
            </motion.div>

            {/* Verified Operational Metrics */}
            <motion.div
              variants={item}
              className="mt-10 flex flex-wrap items-center justify-center gap-7 border-t border-[#262626] pt-8 lg:justify-start"
            >
              <Stat value="10+" label="Projects Delivered" />
              <div className="hidden h-7 w-px bg-[#262626] sm:block" />
              <Stat value="8" label="Core Services" />
              <div className="hidden h-7 w-px bg-[#262626] sm:block" />
              <Stat value="24/7" label="Support" />
              <div className="hidden h-7 w-px bg-[#262626] sm:block" />
              <Stat value="100%" label="Code Quality" />
            </motion.div>
          </motion.div>

          {/* ── Right Column: Art-Directed Video & Visual Window ──── */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.65, ease: EASE, delay: 0.15 }}
            className="w-full lg:col-span-6"
          >
            <HeroMediaWindow shouldReduceMotion={shouldReduceMotion} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}