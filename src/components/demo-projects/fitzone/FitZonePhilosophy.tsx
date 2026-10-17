"use client";

import React from "react";
import { Dumbbell, Flame, HeartPulse, Target, Shield, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function FitZonePhilosophy() {
  const pillars = [
    {
      number: "01",
      title: "Progressive Overload",
      subtitle: "Structural Strength & Hypertrophy",
      icon: Dumbbell,
      description:
        "No randomized workouts. We program every compound lift through structured linear and undulating periodization, guaranteeing structural muscle density, tendon health, and measurable PR progress.",
      points: [
        "Eleiko competition calibrated plates & bars",
        "Strict eccentric tempo and mechanical tension",
        "CNS restoration cycles and scheduled deloads",
      ],
      accentColor: "#FF7138",
      gradient: "from-[#2A1810] via-[#1E130E] to-[#120C09]",
    },
    {
      number: "02",
      title: "Metabolic Velocity",
      subtitle: "Anaerobic Capacity & EPOC Afterburn",
      icon: Flame,
      description:
        "Elevate your VO2 max and burn calories for up to 36 hours post-training. Combining Woodway non-motorized treadmills, Concept2 SkiErgs, and heavy sled prowlers to build tireless conditioning.",
      points: [
        "Elevated lactate threshold & cardiac efficiency",
        "Zero-impact high-cadence interval options",
        "Team sprint gauntlets and turf relays",
      ],
      accentColor: "#FF934D",
      gradient: "from-[#2F1A10] via-[#21130C] to-[#130B07]",
    },
    {
      number: "03",
      title: "Bio-Mechanical Recovery",
      subtitle: "Thermal Contrast & Fascial Release",
      icon: HeartPulse,
      description:
        "You grow when you recover. FitZone integrates twin 38°F cold plunges with 195°F dry cedar saunas and NormaTec compression to accelerate lymphatic drainage and eradicate muscular stiffness.",
      points: [
        "Instant reduction of delayed onset muscle soreness (DOMS)",
        "Dopamine & parasympathetic nervous system reset",
        "Dedicated mobility loft with guided breathwork",
      ],
      accentColor: "#48D597",
      gradient: "from-[#14231E] via-[#0E1A16] to-[#0A120F]",
    },
    {
      number: "04",
      title: "Biometric Precision",
      subtitle: "Data-Driven Periodization",
      icon: Target,
      description:
        "We remove guesswork. Every athlete benefits from initial 3D movement screening, InBody 770 segmental lean analysis, and ongoing nutritional titration matching your metabolic rate.",
      points: [
        "InBody 770 visceral fat & skeletal muscle audit",
        "Macro nutrient timing tailored to training windows",
        "Continuous coach milestone tracking via Member App",
      ],
      accentColor: "#FF7138",
      gradient: "from-[#241712] via-[#1A120E] to-[#110C0A]",
    },
  ];

  return (
    <section
      id="philosophy"
      className="relative w-full border-t border-[#2B3137] bg-[#0B0D0F] py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#FF7138]/30 bg-[#FF7138]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-[#FF7138] mb-4">
            <Shield className="h-3.5 w-3.5" />
            <span>The FitZone Manifesto</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-[#F6F4F0] leading-tight">
            ENGINEERED WITHOUT COMPROMISE. <br />
            <span className="text-[#FF7138]">THE 4 CORE PILLARS.</span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[#B5BBC2] leading-relaxed">
            Most commercial gyms are built to sell memberships you never use.
            FitZone is built to deliver quantifiable human performance, peak
            physique aesthetics, and lifelong joint integrity.
          </p>
        </div>

        {/* Pillars 4-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.number}
                className="group relative flex flex-col justify-between rounded-2xl border border-[#2B3137] bg-[#171B1F] p-7 sm:p-8 transition-all duration-300 hover:border-[#FF7138]/60 hover:bg-[#20252A] hover:shadow-2xl hover:shadow-[#FF7138]/10"
              >
                {/* Top Row: Number & Icon */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-3xl font-black text-[#858D96]/40 group-hover:text-[#FF7138] transition-colors font-mono">
                      {pillar.number}
                    </span>
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition-transform duration-300 group-hover:scale-110"
                      style={{ color: pillar.accentColor }}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#F6F4F0] group-hover:text-[#FF7138] transition-colors">
                    {pillar.title}
                  </h3>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#858D96] mt-1">
                    {pillar.subtitle}
                  </p>

                  {/* Description */}
                  <p className="mt-4 text-sm text-[#B5BBC2] leading-relaxed">
                    {pillar.description}
                  </p>
                </div>

                {/* Checklist Points */}
                <div className="mt-6 pt-6 border-t border-[#2B3137] space-y-2.5">
                  {pillar.points.map((pt, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-[#F6F4F0]">
                      <CheckCircle2
                        className="h-4 w-4 shrink-0 mt-0.5"
                        style={{ color: pillar.accentColor }}
                      />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
