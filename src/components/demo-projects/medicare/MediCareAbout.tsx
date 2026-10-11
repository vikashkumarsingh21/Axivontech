"use client";

import React from "react";
import Image from "next/image";
import { Activity, Users, Layers, HeartHandshake } from "lucide-react";

const PILLARS = [
  {
    icon: Activity,
    title: "Patient-Centred Communication",
    description: "Every interaction prioritizes clarity, empathy, and respect — ensuring patients understand their care journey completely.",
  },
  {
    icon: Users,
    title: "Coordinated Department Care",
    description: "Seamless referrals between specialities ensure continuity and prevent fragmented healthcare experiences.",
  },
  {
    icon: Layers,
    title: "Organised Health Information",
    description: "Structured patient resources, consultation summaries, and follow-up guidelines delivered with complete transparency.",
  },
  {
    icon: HeartHandshake,
    title: "Accessible Service Navigation",
    description: "Clear signage, multilingual support staff, and intuitive appointment pathways designed around real patient needs.",
  },
];

export default function MediCareAbout() {
  return (
    <section
      id="about"
      aria-label="About MediCare Health Centre"
      className="bg-white py-16 sm:py-24 border-t border-[#C9DED6]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#C9DED6] bg-[#EAF6F2] px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#147D78]">
            <span>About Our Centre</span>
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-[#263746] sm:text-4xl">
            A Welcoming Healthcare Environment
          </h2>
          <p className="mt-4 text-base text-[#263746]/80 sm:text-lg leading-relaxed">
            MediCare Health Centre is built around communication, thoughtful service, and a clear patient experience — where every department, every clinician, and every interaction reflects a commitment to dignified, modern healthcare.
          </p>
        </div>

        {/* Two-Column Editorial Layout */}
        <div className="mt-14 grid grid-cols-1 items-start gap-12 lg:grid-cols-2">
          {/* Left: Pillars */}
          <div className="space-y-6">
            {PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="flex items-start gap-4 rounded-xl border border-[#C9DED6] bg-[#EAF6F2]/20 p-5 transition-all hover:border-[#147D78] hover:bg-white hover:shadow-sm"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EAF6F2] text-[#147D78]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#263746]">
                      {pillar.title}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-[#263746]/75">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Visual and Editorial Note */}
          <div>
            <div className="overflow-hidden rounded-2xl border border-[#C9DED6] bg-white p-2 shadow-sm">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gray-100">
                <Image
                  src="/images/demo-projects/medicare/about-facility.jpg"
                  alt="Modern healthcare facility corridors at MediCare Health Centre"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-[#C9DED6] bg-[#EAF6F2]/40 p-5">
              <h4 className="text-sm font-bold text-[#263746]">
                Portfolio Demonstration Context
              </h4>
              <p className="mt-2 text-xs leading-relaxed text-[#263746]/75">
                MediCare Health Centre is a fictional healthcare brand created by Axivon Technologies to showcase premium medical website design. No real clinical services, staff, or facilities are represented. This demo illustrates thoughtful information architecture, accessible design, and professional healthcare branding.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
