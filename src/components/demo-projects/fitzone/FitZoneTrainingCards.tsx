"use client";

import React, { useState, useRef, MouseEvent } from "react";
import {
  Dumbbell,
  Flame,
  HeartPulse,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Layers,
} from "lucide-react";
import { useReducedMotion } from "framer-motion";

interface ArenaCardData {
  id: string;
  badge: string;
  title: string;
  tagline: string;
  metric: string;
  subMetric: string;
  specList: string[];
  gradientClass: string;
  accent: string;
}

const ARENAS: ArenaCardData[] = [
  {
    id: "barbell-pit",
    badge: "Maximum Hypertrophy",
    title: "The Iron Pit",
    tagline: "12 Eleiko Power Racks & Competition Deadlift Platforms",
    metric: "150 LBS",
    subMetric: "Max Dumbbell Spec",
    specList: [
      "IPF-certified Olympic calibrated steel",
      "Vibration-isolated 50mm rubber flooring",
      "Specialty safety squat & trap bars",
    ],
    gradientClass: "from-[#2A1810] via-[#1E130E] to-[#120C09]",
    accent: "#FF7138",
  },
  {
    id: "metabolic-turf",
    badge: "EPOC Anaerobic Zone",
    title: "Sprint Turf & Rig",
    tagline: "60-Yard Prowler Turf & 40ft Multi-Grip Monkey Rig",
    metric: "850 KCAL",
    subMetric: "Peak Hourly Burn",
    specList: [
      "Non-motorized Woodway Curve treadmills",
      "Concept2 SkiErgs & Rogue Assault bikes",
      "Custom gymnastics wood ring stations",
    ],
    gradientClass: "from-[#331A10] via-[#24130C] to-[#140B07]",
    accent: "#FF934D",
  },
  {
    id: "recovery-sanctuary",
    badge: "Contrast Bio-Therapy",
    title: "Cryo & Sauna Spa",
    tagline: "Accelerated Lymphatic Drainage & Muscular Decompression",
    metric: "38°F",
    subMetric: "Sub-Zero Titanium Plunge",
    specList: [
      "Twin continuous filtration cold plunge tubs",
      "195°F Nordic cedar dry sauna",
      "NormaTec dynamic compression boot lounge",
    ],
    gradientClass: "from-[#14231E] via-[#0E1A16] to-[#0A120F]",
    accent: "#48D597",
  },
];

function Interactive3DCard({ arena }: { arena: ArenaCardData }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const percentX = (x / rect.width) * 100;
    const percentY = (y / rect.height) * 100;

    // Calculate -12 to 12 deg tilt
    const rotX = (0.5 - y / rect.height) * 18;
    const rotY = (x / rect.width - 0.5) * 18;

    setTilt({ x: rotX, y: rotY });
    setGlarePos({ x: percentX, y: percentY });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
    setGlarePos({ x: 50, y: 50 });
  };

  return (
    <div
      style={{ perspective: 1000 }}
      className="w-full"
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: shouldReduceMotion
            ? "none"
            : `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transformStyle: "preserve-3d",
          transition: isHovered
            ? "transform 0.08s ease-out"
            : "transform 0.5s ease-out",
        }}
        className={`group relative overflow-hidden rounded-2xl border border-[#2B3137] bg-gradient-to-b ${arena.gradientClass} p-7 sm:p-8 shadow-2xl transition-all duration-300 hover:border-[#FF7138] hover:shadow-[#FF7138]/20 flex flex-col justify-between min-h-[440px]`}
      >
        {/* Dynamic Interactive Mouse-Follow Glare Sheen */}
        {isHovered && !shouldReduceMotion && (
          <div
            className="pointer-events-none absolute inset-0 z-0 opacity-40 transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle 280px at ${glarePos.x}% ${glarePos.y}%, rgba(255, 113, 56, 0.35), transparent 70%)`,
            }}
          />
        )}

        {/* Card Header */}
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <span
              className="rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest border"
              style={{
                backgroundColor: `${arena.accent}15`,
                borderColor: `${arena.accent}40`,
                color: arena.accent,
              }}
            >
              {arena.badge}
            </span>

            {/* Depth Popping Metric Indicator */}
            <div
              style={{
                transform: shouldReduceMotion
                  ? "none"
                  : `translateZ(35px)`,
              }}
              className="rounded-xl border border-white/10 bg-[#0B0D0F]/90 px-3 py-1.5 text-right shadow-lg backdrop-blur-md"
            >
              <p
                className="text-base font-black font-mono tracking-tight"
                style={{ color: arena.accent }}
              >
                {arena.metric}
              </p>
              <p className="text-[9px] font-semibold uppercase text-[#858D96]">
                {arena.subMetric}
              </p>
            </div>
          </div>

          <h3 className="text-2xl font-black uppercase tracking-tight text-[#F6F4F0] group-hover:text-[#FF7138] transition-colors">
            {arena.title}
          </h3>
          <p className="mt-2 text-xs text-[#B5BBC2] font-medium leading-relaxed">
            {arena.tagline}
          </p>
        </div>

        {/* Specs List with Depth Separation */}
        <div
          style={{
            transform: shouldReduceMotion
              ? "none"
              : `translateZ(25px)`,
          }}
          className="relative z-10 my-6 space-y-3 pt-6 border-t border-white/10"
        >
          {arena.specList.map((spec, i) => (
            <div key={i} className="flex items-start gap-2.5 text-xs text-[#F6F4F0]">
              <span
                className="h-1.5 w-1.5 rounded-full mt-1.5 shrink-0"
                style={{ backgroundColor: arena.accent }}
              />
              <span>{spec}</span>
            </div>
          ))}
        </div>

        {/* Bottom CTA / Action */}
        <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-[#858D96] uppercase tracking-wider">
            Interactive 3D Arena
          </span>
          <span
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider group-hover:translate-x-1 transition-transform"
            style={{ color: arena.accent }}
          >
            <span>Explore Zone</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
}

export default function FitZoneTrainingCards() {
  return (
    <section
      id="experience"
      className="relative w-full border-t border-[#2B3137] bg-[#0B0D0F] py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#FF7138]/30 bg-[#FF7138]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-[#FF7138] mb-4">
            <Layers className="h-3.5 w-3.5" />
            <span>Interactive 3D Environments</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-[#F6F4F0] leading-tight">
            CUSTOMIZED SPACES. <br />
            <span className="text-[#FF7138]">ZERO RESTRAINT.</span>
          </h2>

          <p className="mt-4 text-sm sm:text-base text-[#B5BBC2] leading-relaxed">
            Move your cursor across each arena card to inspect the equipment
            layering, acoustic engineering, and biomechanical specs.
          </p>
        </div>

        {/* 3D Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {ARENAS.map((arena) => (
            <Interactive3DCard key={arena.id} arena={arena} />
          ))}
        </div>
      </div>
    </section>
  );
}
