"use client";

import React from "react";
import Image from "next/image";
import { Sparkles, ArrowRight } from "lucide-react";

export default function EduSmartApproach() {
  const steps = [
    {
      step: "01",
      title: "Explore",
      tagline: "Cultivate Inquisitiveness",
      description:
        "Students begin each topic by examining open-ended questions, historical paradigms, and foundational scholarship that encourage personal inquiry.",
    },
    {
      step: "02",
      title: "Develop",
      tagline: "Structured Critical Inquiry",
      description:
        "Through seminar discussions and computational labs, learners build rigorous methodology, analytical depth, and clear conceptual models.",
    },
    {
      step: "03",
      title: "Apply",
      tagline: "Collaborative Realization",
      description:
        "Academic discoveries culminate in tangible capstones, multidisciplinary design showcases, and peer-reviewed syntheses with community relevance.",
    },
  ];

  return (
    <section
      id="approach"
      aria-labelledby="approach-heading"
      className="relative border-t border-[#E8E1EB] bg-white py-16 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-[#B89557]">
            <Sparkles className="h-3.5 w-3.5 text-[#33243B]" />
            <span>Learning Methodology</span>
          </div>

          <h2
            id="approach-heading"
            className="mt-3 font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#27232A]"
          >
            Learning Beyond the Classroom
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[#27232A]/80 leading-relaxed">
            Our instructional philosophy is organised as a progressive cycle that transforms
            raw curiosity into grounded scholarship and creative contribution.
          </p>
        </div>

        {/* 3 Steps in connected editorial sequence */}
        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {steps.map((st) => (
            <div
              key={st.step}
              className="relative rounded-3xl border border-[#E8E1EB] bg-[#F7F3EB]/60 p-8 transition-all hover:border-[#33243B]/40 hover:bg-[#F7F3EB] shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-[#E8E1EB] pb-4">
                <span className="font-serif text-3xl sm:text-4xl font-bold text-[#B89557]">
                  {st.step}
                </span>
                <span className="text-xs font-semibold uppercase tracking-widest text-[#33243B]">
                  {st.tagline}
                </span>
              </div>

              <h3 className="mt-6 font-serif text-2xl font-bold text-[#27232A]">
                {st.title}
              </h3>

              <p className="mt-3 text-sm text-[#27232A]/75 leading-relaxed">
                {st.description}
              </p>
            </div>
          ))}
        </div>

        {/* Supporting seminar image strip */}
        <div className="mt-14 overflow-hidden rounded-3xl border border-[#E8E1EB] shadow-lg">
          <div className="grid lg:grid-cols-12 items-center bg-[#F7F3EB]">
            <div className="p-8 lg:p-12 lg:col-span-6">
              <span className="text-xs font-bold uppercase tracking-widest text-[#B89557]">
                Seminar Inquiries
              </span>
              <h3 className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-[#33243B]">
                Intimate Cohorts & Peer Exchange
              </h3>
              <p className="mt-4 text-sm text-[#27232A]/80 leading-relaxed">
                Lectures are complemented by round-table seminar discussions where every
                voice participates in rigorous debate, critical commentary, and collaborative problem-solving.
              </p>
            </div>
            <div className="lg:col-span-6 h-64 lg:h-80 relative">
              <Image
                src="/images/demo-projects/edusmart/academic-seminar.jpg"
                alt="Students and faculty participating in an interactive academic seminar"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
