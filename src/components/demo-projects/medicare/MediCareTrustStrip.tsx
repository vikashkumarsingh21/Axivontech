"use client";

import React from "react";
import { HeartPulse, CalendarCheck, Layers, HelpCircle } from "lucide-react";

const TRUST_PILLARS = [
  {
    icon: HeartPulse,
    title: "Patient-Centred Approach",
    description: "Care pathways formulated around your individual wellness needs, medical context, and comfort.",
  },
  {
    icon: CalendarCheck,
    title: "Clear Appointment Process",
    description: "Streamlined consultation guidance designed to reduce unnecessary clinic wait times and uncertainty.",
  },
  {
    icon: Layers,
    title: "Dedicated Departments",
    description: "Multispeciality departments operating in tandem to provide holistic diagnostic and clinical care.",
  },
  {
    icon: HelpCircle,
    title: "Accessible Patient Support",
    description: "Compassionate clinical staff ready to answer preparatory questions and assist your hospital visit.",
  },
];

export default function MediCareTrustStrip() {
  return (
    <section
      aria-label="Core Patient Values"
      className="border-y border-[#C9DED6] bg-[#EAF6F2]/60 py-10"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST_PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="flex items-start gap-3.5 transition-transform duration-200 hover:-translate-y-0.5"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#147D78] shadow-sm border border-[#C9DED6]">
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
      </div>
    </section>
  );
}
