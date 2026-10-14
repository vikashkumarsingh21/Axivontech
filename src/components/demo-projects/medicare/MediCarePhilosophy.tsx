"use client";

import React from "react";
import Image from "next/image";
import { 
  MessageSquareText, 
  ShieldCheck, 
  FileText, 
  Clock3, 
  Sparkles,
  HeartHandshake,
  CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";

const PRINCIPLES = [
  {
    icon: MessageSquareText,
    title: "Clear, Jargon-Free Communication",
    description: "Every diagnosis, clinical review, and treatment option is explained in lucid, reassuring language so you are always in complete control of your care.",
  },
  {
    icon: Clock3,
    title: "Unhurried Consultation Windows",
    description: "We schedule generous appointment times. Clinicians never rush through your symptoms, allowing thorough physical examinations and attentive listening.",
  },
  {
    icon: ShieldCheck,
    title: "Multidisciplinary Clinical Synergy",
    description: "Our specialist departments coordinate seamlessly. When complex cases arise, doctors collaborate together rather than sending you across different clinics.",
  },
  {
    icon: FileText,
    title: "Transparent & Evidence-Led Pathways",
    description: "Diagnostic investigations and prescriptions adhere strictly to peer-reviewed clinical guidelines, eliminating redundant tests or aggressive polypharmacy.",
  },
];

export default function MediCarePhilosophy() {
  return (
    <section
      id="philosophy"
      aria-label="Our Care Philosophy"
      className="bg-[#F0F7F4]/40 py-18 sm:py-28 border-t border-[#D4E8E0]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Visual Architectural Showcase */}
          <motion.div 
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="lg:col-span-5 order-2 lg:order-1"
          >
            <div className="relative overflow-hidden rounded-3xl border border-[#D4E8E0] bg-white p-3 shadow-[0_10px_35px_rgba(20,125,120,0.08)]">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#EAF6F2]">
                <Image
                  src="/images/demo-projects/medicare/about-facility.jpg"
                  alt="Modern, bright and hygienic clinical corridors at MediCare Health Centre"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover transition-transform duration-700 hover:scale-102"
                />

                {/* Floating Badge */}
                <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-[#147D78] shadow-sm backdrop-blur-xs border border-[#D4E8E0]">
                  <Sparkles className="h-3.5 w-3.5 text-[#147D78]" />
                  <span>Scandinavian Healing Architecture</span>
                </div>
              </div>

              {/* Facility Note */}
              <div className="mt-3 rounded-2xl bg-[#EAF6F2] p-4 border border-[#D4E8E0]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#147D78]">
                  Tranquil Sensory Environment
                </span>
                <p className="mt-1 text-xs text-[#4A6577] leading-relaxed">
                  Engineered with diffused natural daylight, sound-absorbing acoustic ceiling baffles, and non-intimidating consultation spaces designed to reduce clinical anxiety.
                </p>
                <div className="mt-3 flex items-center gap-4 text-[11px] text-[#263746] font-semibold pt-2 border-t border-[#D4E8E0]/70">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#147D78]" /> HEPA Filtered
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#147D78]" /> Sound Dampened
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#147D78]" /> Wheelchair Accessible
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Principles & Values */}
          <motion.div 
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="lg:col-span-7 order-1 lg:order-2"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D4E8E0] bg-white px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#147D78]">
              <span>Patient-First Philosophy</span>
            </div>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-[#263746] sm:text-4xl">
              Why Patients Place Their Trust in MediCare
            </h2>
            <p className="mt-3.5 text-base text-[#4A6577] sm:text-lg">
              We believe exceptional healthcare requires not only diagnostic precision, but also a culture where each patient is heard, respected, and guided with profound empathy.
            </p>

            {/* Principles Grid */}
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {PRINCIPLES.map((principle) => {
                const Icon = principle.icon;
                return (
                  <div
                    key={principle.title}
                    className="flex flex-col justify-between rounded-2xl border border-[#D4E8E0] bg-white p-5 shadow-xs transition-all duration-200 hover:border-[#147D78] hover:shadow-[0_8px_24px_rgba(20,125,120,0.08)]"
                  >
                    <div>
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF6F2] text-[#147D78] border border-[#D4E8E0]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-4 text-base font-bold text-[#263746]">
                        {principle.title}
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-[#4A6577]">
                        {principle.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reassuring note */}
            <div className="mt-8 flex items-center gap-3 rounded-2xl bg-white p-4 border border-[#D4E8E0] text-xs text-[#4A6577]">
              <HeartHandshake className="h-5 w-5 text-[#147D78] shrink-0" />
              <span>
                <strong className="text-[#263746]">The MediCare Promise: </strong>
                Zero commercial quotas, zero unnecessary hospital admissions, and full transparency over clinical options.
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
