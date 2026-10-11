"use client";

import React from "react";
import Image from "next/image";
import { MessageSquareText, ShieldCheck, FileText, Clock3 } from "lucide-react";

const PRINCIPLES = [
  {
    icon: MessageSquareText,
    title: "Clear Communication",
    description: "Every diagnosis, recommendation, and question is discussed in accessible, reassuring language without unnecessary jargon.",
  },
  {
    icon: ShieldCheck,
    title: "Thoughtful Patient Support",
    description: "From reception to examination, our teams prioritize patient comfort, personal privacy, and unhurried consultations.",
  },
  {
    icon: FileText,
    title: "Easy-to-Understand Information",
    description: "Pre-consultation guidance, follow-up notes, and lifestyle recommendations are provided with complete clarity.",
  },
  {
    icon: Clock3,
    title: "Organised Appointment Experience",
    description: "Structured outpatient scheduling aimed at respecting your time and minimizing unnecessary lobby wait times.",
  },
];

export default function MediCarePhilosophy() {
  return (
    <section
      aria-label="Our Care Philosophy"
      className="bg-[#EAF6F2]/30 py-16 sm:py-24 border-t border-[#C9DED6]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-10">
          {/* Left Column: Photo Presentation */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div className="relative overflow-hidden rounded-2xl border border-[#C9DED6] bg-white p-2 shadow-sm">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gray-100">
                <Image
                  src="/images/demo-projects/medicare/about-facility.jpg"
                  alt="Modern, bright and hygienic clinical corridors at MediCare Health Centre"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                />
              </div>

              <div className="p-4 bg-[#EAF6F2]/60 rounded-lg mt-2 border border-[#C9DED6]/60">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#147D78]">
                  Clinical Ambience
                </span>
                <p className="mt-1 text-xs text-[#263746]/80 leading-relaxed">
                  Tranquil architectural design focused on natural light, cleanliness, and acoustic calmness.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Principles */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#C9DED6] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#147D78]">
              <span>Patient-First Philosophy</span>
            </div>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-[#263746] sm:text-4xl">
              Why Patients Place Their Trust in MediCare
            </h2>
            <p className="mt-3.5 text-base text-[#263746]/80 sm:text-lg">
              We believe quality healthcare is defined not only by clinical expertise, but also by how patients are heard, respected, and guided.
            </p>

            {/* Principles List */}
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {PRINCIPLES.map((principle) => {
                const Icon = principle.icon;
                return (
                  <div
                    key={principle.title}
                    className="flex flex-col rounded-xl border border-[#C9DED6] bg-white p-5 shadow-sm transition-all hover:border-[#147D78]"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EAF6F2] text-[#147D78]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-3 text-base font-bold text-[#263746]">
                      {principle.title}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-[#263746]/75">
                      {principle.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
