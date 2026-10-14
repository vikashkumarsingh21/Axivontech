"use client";

import React from "react";
import { 
  HeartPulse, 
  Award, 
  Clock, 
  Users, 
  ShieldCheck, 
  Building2, 
  Stethoscope,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";

const STATS = [
  {
    icon: Award,
    stat: "25+",
    label: "Years of Care",
    description: "Dedicated to clinical excellence & continuous patient wellness",
  },
  {
    icon: HeartPulse,
    stat: "99.2%",
    label: "Patient Satisfaction",
    description: "Evaluated through third-party clinical experience audits",
  },
  {
    icon: Users,
    stat: "45+",
    label: "Board Specialists",
    description: "Multidisciplinary consultants across 6 integrated wings",
  },
  {
    icon: Clock,
    stat: "< 15 min",
    label: "Average Wait Time",
    description: "Protected consultation windows respecting patient time",
  },
];

const CERTIFICATIONS = [
  { label: "NABH Accredited Hospital" },
  { label: "JCI International Quality Standards" },
  { label: "ISO 9001:2015 Clinical Safety" },
  { label: "24/7 Emergency & Acute Trauma Care" },
];

export default function MediCareTrustStrip() {
  return (
    <section
      aria-label="Clinical Metrics and Trust Indicators"
      className="border-y border-[#D4E8E0] bg-[#F0F7F4] py-12"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-[#D4E8E0]">
          {STATS.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={`flex flex-col ${index > 0 ? "lg:pl-8" : ""}`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#147D78] shadow-xs border border-[#D4E8E0]">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="font-mono text-3xl font-extrabold tracking-tight text-[#147D78]">
                    {item.stat}
                  </span>
                </div>
                <h3 className="mt-2.5 text-sm font-bold text-[#263746]">
                  {item.label}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-[#4A6577]">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Accreditations Row */}
        <div className="mt-10 pt-8 border-t border-[#D4E8E0]/70 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#147D78]">
            <ShieldCheck className="h-4 w-4" />
            <span>Clinical Trust Benchmarks</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-4">
            {CERTIFICATIONS.map((cert) => (
              <span
                key={cert.label}
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-[#263746] shadow-xs border border-[#D4E8E0]"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#147D78]" />
                {cert.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
