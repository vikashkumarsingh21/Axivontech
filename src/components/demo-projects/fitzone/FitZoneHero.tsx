"use client";

import React, { useState, useRef, useEffect, MouseEvent } from "react";
import Link from "next/link";
import {
  Flame,
  Dumbbell,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  Award,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

interface FitZoneHeroProps {
  onBookTrialClick?: () => void;
}

export default function FitZoneHero({ onBookTrialClick }: FitZoneHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // 3D Perspective Rotation Values
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [isHovered, setIsHovered] = useState(false);

  // Mouse move handler for 3D tilt tracking
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    setMousePos({ x, y });

    // Subtle natural tilt ranges (-8 to +8 degrees)
    const rotX = (0.5 - y) * 16;
    const rotY = (x - 0.5) * 16;
    setRotateX(rotX);
    setRotateY(rotY);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  return (
    <section
      id="hero"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-[92vh] w-full overflow-hidden bg-[#0B0D0F] pt-8 pb-16 lg:py-20 flex flex-col justify-between"
    >
      {/* 3D Dynamic Ambient Glow Orbs */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[500px] sm:h-[700px] sm:w-[700px] rounded-full bg-gradient-to-tr from-[#FF7138]/20 via-[#FF934D]/10 to-transparent blur-[120px] transition-transform duration-700 ease-out"
        style={{
          transform: `translate(${mousePos.x * 40 - 20}px, ${mousePos.y * 40 - 20}px)`,
        }}
      />
      <div className="pointer-events-none absolute top-1/3 -left-32 h-80 w-80 rounded-full bg-[#FF7138]/10 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-10 -right-32 h-96 w-96 rounded-full bg-[#FF934D]/10 blur-[120px]" />

      {/* Subtle Athletic Grid Backdrop */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#171B1F_1px,transparent_1px),linear-gradient(to_bottom,#171B1F_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_35%,#000_70%,transparent_100%)] opacity-35" />

      {/* Main Container */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex-1 flex flex-col justify-center">
        {/* Top Live Pill */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2.5 rounded-full border border-[#FF7138]/40 bg-[#171B1F]/90 px-3.5 py-1.5 backdrop-blur-md shadow-lg shadow-[#FF7138]/10"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF7138] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF7138]"></span>
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#F6F4F0]">
              Elite Athletic Protocol &bull; 42 Athletes Active Right Now
            </span>
          </motion.div>
        </div>

        {/* 3D Perspective Canvas Container */}
        <div
          style={{ perspective: 1200 }}
          className="relative mx-auto max-w-5xl text-center"
        >
          {/* Main 3D Tilted Card Wrapper */}
          <div
            style={{
              transform: shouldReduceMotion
                ? "none"
                : `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
              transformStyle: "preserve-3d",
              transition: isHovered
                ? "transform 0.1s ease-out"
                : "transform 0.5s ease-out",
            }}
            className="relative"
          >
            {/* Athletic Headline */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight text-[#F6F4F0] leading-[1.02]">
              BUILT BY <br className="hidden sm:inline" />
              <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#FF7138] via-[#FF934D] to-[#F6F4F0]">
                DISCIPLINE.
                {/* Underline Flare */}
                <span className="absolute -bottom-2 left-0 right-0 h-1 sm:h-1.5 rounded-full bg-gradient-to-r from-transparent via-[#FF7138] to-transparent opacity-80" />
              </span>
            </h1>

            {/* Subheading */}
            <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg lg:text-xl font-normal text-[#B5BBC2] leading-relaxed">
              Engineered for progressive overload, metabolic conditioning, and
              uncompromising physical supremacy. Calibrated Eleiko platforms,
              sub-zero cold plunges, and master-level coaching.
            </p>

            {/* CTA Buttons Row */}
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="#membership"
                className="group relative flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#FF7138] to-[#FF934D] px-8 py-4 text-sm font-extrabold uppercase tracking-wider text-[#0B0D0F] shadow-xl shadow-[#FF7138]/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#FF7138]/40 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7138]"
              >
                <Dumbbell className="h-4 w-4" />
                <span>Explore Memberships</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <button
                type="button"
                onClick={onBookTrialClick}
                className="group flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl border border-[#2B3137] bg-[#171B1F] px-8 py-4 text-sm font-bold uppercase tracking-wider text-[#F6F4F0] transition-all duration-300 hover:border-[#FF7138] hover:bg-[#20252A] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7138]"
              >
                <Sparkles className="h-4 w-4 text-[#FF7138]" />
                <span>Book Free Trial Pass</span>
              </button>
            </div>

            {/* 3D Floating Feature Pills (Desktop) */}
            <div
              style={{
                transform: shouldReduceMotion
                  ? "none"
                  : `translateZ(45px)`,
              }}
              className="hidden lg:block pointer-events-none"
            >
              {/* Floating Pill Left */}
              <div className="absolute -left-12 top-10 flex items-center gap-3 rounded-2xl border border-[#2B3137] bg-[#171B1F]/95 p-3.5 shadow-2xl backdrop-blur-md">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF7138]/15 border border-[#FF7138]/30 text-[#FF7138]">
                  <Flame className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-[#F6F4F0] uppercase tracking-wide">
                    VelocityX™ Burn
                  </p>
                  <p className="text-[11px] font-semibold text-[#FF7138]">
                    850 kcal / Session
                  </p>
                </div>
              </div>

              {/* Floating Pill Right */}
              <div className="absolute -right-12 top-14 flex items-center gap-3 rounded-2xl border border-[#2B3137] bg-[#171B1F]/95 p-3.5 shadow-2xl backdrop-blur-md">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#48D597]/15 border border-[#48D597]/30 text-[#48D597]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-[#F6F4F0] uppercase tracking-wide">
                    Olympic Standard
                  </p>
                  <p className="text-[11px] font-semibold text-[#48D597]">
                    100% Eleiko Certified
                  </p>
                </div>
              </div>

              {/* Floating Pill Bottom Left */}
              <div className="absolute -left-6 bottom-4 flex items-center gap-3 rounded-2xl border border-[#2B3137] bg-[#171B1F]/95 p-3.5 shadow-2xl backdrop-blur-md">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF934D]/15 border border-[#FF934D]/30 text-[#FF934D]">
                  <Activity className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-[#F6F4F0] uppercase tracking-wide">
                    Recovery Cryo Spa
                  </p>
                  <p className="text-[11px] font-semibold text-[#FF934D]">
                    38°F Sub-Zero Plunges
                  </p>
                </div>
              </div>

              {/* Floating Pill Bottom Right */}
              <div className="absolute -right-8 bottom-0 flex items-center gap-3 rounded-2xl border border-[#2B3137] bg-[#171B1F]/95 p-3.5 shadow-2xl backdrop-blur-md">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF7138]/15 border border-[#FF7138]/30 text-[#FF7138]">
                  <Award className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-[#F6F4F0] uppercase tracking-wide">
                    Master Roster
                  </p>
                  <p className="text-[11px] font-semibold text-[#FF7138]">
                    14+ Elite Coaches
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Athletic Metric Ticker / Strip */}
      <div className="relative z-10 mt-12 sm:mt-16 border-y border-[#2B3137] bg-[#111417]/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center">
            {/* Metric 1 */}
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#F6F4F0] tracking-tight">
                8,500 <span className="text-[#FF7138]">SQ FT</span>
              </span>
              <span className="mt-1 text-xs font-semibold uppercase tracking-wider text-[#858D96]">
                Olympic Strength Floor
              </span>
            </div>

            {/* Metric 2 */}
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#F6F4F0] tracking-tight">
                14+ <span className="text-[#FF934D]">COACHES</span>
              </span>
              <span className="mt-1 text-xs font-semibold uppercase tracking-wider text-[#858D96]">
                CSCS & Biomechanists
              </span>
            </div>

            {/* Metric 3 */}
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#F6F4F0] tracking-tight">
                38°F <span className="text-[#48D597]">CRYO</span>
              </span>
              <span className="mt-1 text-xs font-semibold uppercase tracking-wider text-[#858D96]">
                Sub-Zero Recovery Suite
              </span>
            </div>

            {/* Metric 4 */}
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#F6F4F0] tracking-tight">
                24/7 <span className="text-[#FF7138]">ACCESS</span>
              </span>
              <span className="mt-1 text-xs font-semibold uppercase tracking-wider text-[#858D96]">
                Member App Keyless Entry
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
