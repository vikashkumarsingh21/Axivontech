"use client";

import React from "react";
import Image from "next/image";
import { 
  Activity, 
  Users, 
  Layers, 
  HeartHandshake, 
  Building, 
  ShieldCheck, 
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";

const PILLARS = [
  {
    icon: Activity,
    title: "Patient-Centred Communication",
    description: "Every interaction prioritizes clarity, empathy, and active listening — ensuring patients and families understand their care roadmap without anxiety.",
  },
  {
    icon: Users,
    title: "Coordinated Specialty Integration",
    description: "Seamless cross-referrals between medical departments prevent fragmented care, ensuring every specialist has full access to your clinical background.",
  },
  {
    icon: Layers,
    title: "Evidence-Based Clinical Governance",
    description: "Adherence to peer-reviewed international protocols ensures diagnostics and prescriptions remain precise, ethical, and free from over-investigation.",
  },
  {
    icon: HeartHandshake,
    title: "Inclusive & Accessible Architecture",
    description: "Barrier-free access, acoustic dampening, multilingual staff, and intuitive navigation support patients across all physical mobility needs.",
  },
];

const HOSPITAL_STATS = [
  { metric: "250+", label: "Daily Outpatient Consultations" },
  { metric: "100%", label: "Digital Health Records (EHR)" },
  { metric: "<0.1%", label: "Hospital-Acquired Infection Index" },
  { metric: "99.2%", label: "Positive Patient Feedback Index" },
];

export default function MediCareAbout() {
  return (
    <section
      id="about"
      aria-label="About MediCare Health Centre"
      className="bg-white py-18 sm:py-28 border-t border-[#D4E8E0]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D4E8E0] bg-[#EAF6F2] px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#147D78]">
            <span>About Our Centre</span>
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-[#263746] sm:text-4xl">
            A Welcoming Healthcare Environment
          </h2>
          <p className="mt-4 text-base text-[#4A6577] sm:text-lg leading-relaxed">
            MediCare Health Centre is structured around compassionate communication, clinical excellence, and a peaceful patient journey — where every department reflects a modern vision of healthcare.
          </p>
        </div>

        {/* Two-Column Editorial Layout */}
        <div className="mt-14 grid grid-cols-1 items-start gap-12 lg:grid-cols-2">
          {/* Left: Pillars */}
          <div className="space-y-5">
            {PILLARS.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={pillar.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: idx * 0.08 }}
                  className="flex items-start gap-4 rounded-2xl border border-[#D4E8E0] bg-[#F0F7F4]/40 p-5 transition-all hover:border-[#147D78] hover:bg-white hover:shadow-[0_8px_24px_rgba(20,125,120,0.08)]"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF6F2] text-[#147D78] border border-[#D4E8E0]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#263746]">
                      {pillar.title}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-[#4A6577]">
                      {pillar.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Right: Visual and Hospital Highlights */}
          <div>
            <div className="overflow-hidden rounded-3xl border border-[#D4E8E0] bg-white p-3 shadow-xs">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#EAF6F2]">
                <Image
                  src="/images/demo-projects/medicare/about-facility.jpg"
                  alt="Modern healthcare facility corridors at MediCare Health Centre"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 hover:scale-102"
                />

                <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-[#147D78] shadow-sm backdrop-blur-xs border border-[#D4E8E0]">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#147D78]" />
                  <span>Clinical Governance Board</span>
                </div>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="mt-6 grid grid-cols-2 gap-3.5">
              {HOSPITAL_STATS.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-[#D4E8E0] bg-[#F0F7F4] p-4 text-center sm:text-left"
                >
                  <span className="font-mono text-2xl font-extrabold text-[#147D78]">
                    {item.metric}
                  </span>
                  <p className="mt-1 text-[11px] font-semibold text-[#263746]">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Portfolio Demonstration Notice */}
            <div className="mt-6 rounded-2xl border border-[#D4E8E0] bg-[#EAF6F2] p-4.5 text-xs">
              <h4 className="font-bold text-[#147D78] flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Axivon Showcase Note</span>
              </h4>
              <p className="mt-1.5 text-[11px] text-[#4A6577] leading-relaxed">
                MediCare Health Centre is a demonstration healthcare brand designed by Axivon Technologies to illustrate thoughtful medical information architecture, calm visual hierarchy, and accessible patient booking workflows.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
