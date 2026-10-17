"use client";

import React from "react";
import { Dumbbell, ShieldCheck, Flame, Trophy, CheckCircle2 } from "lucide-react";

export default function FitZoneAbout() {
  const highlights = [
    {
      title: "100% Eleiko Certified",
      desc: "Competition power racks, calibrated steel disc plates, and Olympic weightlifting barbells.",
    },
    {
      title: "Sub-Zero Recovery Hydrotherapy",
      desc: "Twin 38°F continuous circulation cold plunges paired with a 195°F Nordic cedar sauna.",
    },
    {
      title: "Science-Backed Periodization",
      desc: "Every program is designed by master exercise physiologists with 10+ years coaching experience.",
    },
    {
      title: "Zero Crowding Guarantee",
      desc: "Capped membership rosters and real-time station reservation system ensure no waiting for racks.",
    },
  ];

  return (
    <section
      id="about"
      className="relative w-full border-t border-[#2B3137] bg-[#0B0D0F] py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Brand Story */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#FF7138]/30 bg-[#FF7138]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-[#FF7138]">
              <Trophy className="h-3.5 w-3.5" />
              <span>The FitZone Standard</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-[#F6F4F0] leading-tight">
              WE ARE NOT A GYM. <br />
              <span className="text-[#FF7138]">WE ARE AN ATHLETIC SANCTUARY.</span>
            </h2>

            <p className="text-sm sm:text-base text-[#B5BBC2] leading-relaxed">
              Founded on the belief that human potential requires an environment
              unencumbered by broken machines, loud pop music, or crowded
              waiting lines. FitZone was engineered from the ground up as a
              serious, high-output training compound.
            </p>

            <p className="text-sm text-[#858D96] leading-relaxed">
              Whether you are an executive rebuilding your physical resilience, a
              powerlifter preparing for a sanctioned meet, or an athlete looking
              to elevate your lactate threshold—our coaching staff and calibrated
              equipment remove every single barrier between you and victory.
            </p>

            {/* Checklist */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#FF7138] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold uppercase text-[#F6F4F0]">
                      {h.title}
                    </h4>
                    <p className="text-[11px] text-[#858D96] mt-0.5">
                      {h.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Visual 3D Showcase Card */}
          <div className="lg:col-span-6">
            <div className="relative rounded-3xl border border-[#2B3137] bg-gradient-to-br from-[#171B1F] via-[#20252A] to-[#111417] p-8 sm:p-10 shadow-2xl overflow-hidden">
              {/* Background Glow */}
              <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-[#FF7138]/10 blur-3xl" />

              <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between border-b border-[#2B3137] pb-4">
                  <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#FF7138]">
                    FACILITY BLUEPRINT // 2026
                  </span>
                  <span className="text-xs font-bold text-[#48D597]">
                    Active & Operational
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-white/5 bg-[#0B0D0F]/80 p-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#FF7138]">
                      Acoustic Isolation Flooring
                    </p>
                    <p className="mt-1 text-xs text-[#B5BBC2]">
                      50mm vulcanized recycled rubber dampens sub-frequency bar drops,
                      ensuring a focused, rhythm-driven sonic atmosphere.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/5 bg-[#0B0D0F]/80 p-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#FF934D]">
                      Hospital-Grade HVAC Air Exchange
                    </p>
                    <p className="mt-1 text-xs text-[#B5BBC2]">
                      Full room air exchange every 7 minutes with dual MERV-16 and
                      HEPA filtration, keeping oxygen saturation peak during sprints.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/5 bg-[#0B0D0F]/80 p-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#48D597]">
                      Biometric Segmental Scans
                    </p>
                    <p className="mt-1 text-xs text-[#B5BBC2]">
                      Direct clinical InBody 770 multi-frequency impedance audits
                      measuring lean muscle mass imbalances in each limb.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-[#858D96]">
                  <span>480 Olympic Way &bull; Open 24/7</span>
                  <span className="font-bold text-[#F6F4F0]">Elevate Your Standard</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
