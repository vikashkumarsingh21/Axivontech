"use client";

import React from "react";
import Image from "next/image";
import { Sparkles, Compass, Lightbulb, Users } from "lucide-react";

export default function EduSmartAbout() {
  const values = [
    {
      icon: Compass,
      title: "Intellectual Curiosity",
      description: "Encouraging learners to question assumptions, challenge conventions, and seek multi-layered perspectives.",
    },
    {
      icon: Lightbulb,
      title: "Critical Synthesis",
      description: "Developing sound reasoning, analytical deduction, and ethical insight across modern scientific and social domains.",
    },
    {
      icon: Users,
      title: "Shared Community",
      description: "Cultivating empathetic collaboration, peer mentoring, and a vibrant community of diverse scholars.",
    },
  ];

  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="relative border-y border-[#E8E1EB] bg-white py-16 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left Column: Image of students in modern library */}
          <div className="relative lg:col-span-5">
            <div className="relative overflow-hidden rounded-2xl border border-[#E8E1EB] shadow-xl">
              <Image
                src="/images/demo-projects/edusmart/about-learning.jpg"
                alt="Students collaborating thoughtfully around a study table in an open, modern university library"
                width={800}
                height={600}
                className="h-[360px] sm:h-[440px] w-full object-cover transition-transform duration-700 hover:scale-[1.02]"
              />
            </div>
            {/* Pill accent */}
            <div className="absolute -bottom-4 right-6 rounded-full bg-[#E8E1EB] px-4 py-2 text-xs font-semibold uppercase tracking-widest text-[#33243B] shadow-md border border-[#D9D1DE]">
              Collaborative Learning
            </div>
          </div>

          {/* Right Column: Editorial narrative */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-[#B89557]">
              <Sparkles className="h-3.5 w-3.5 text-[#33243B]" />
              <span>Academic Philosophy</span>
            </div>

            <h2
              id="about-heading"
              className="mt-4 font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#27232A] leading-tight"
            >
              An Education Shaped Around Possibility
            </h2>

            <p className="mt-6 text-base sm:text-lg text-[#27232A]/80 leading-relaxed">
              At Aurevia Academy, we believe education flourishes when students are empowered
              to connect disciplinary theory with practical creative exploration. Our academic
              culture fosters fearless inquiry, ethical accountability, and personal growth.
            </p>

            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {values.map((val) => {
                const IconComponent = val.icon;
                return (
                  <div
                    key={val.title}
                    className="rounded-2xl border border-[#E8E1EB] bg-[#F7F3EB]/40 p-5 transition-all hover:border-[#33243B]/40 hover:bg-[#F7F3EB]"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#33243B] shadow-sm border border-[#E8E1EB]">
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 font-serif text-base font-bold text-[#27232A]">
                      {val.title}
                    </h3>
                    <p className="mt-2 text-xs text-[#27232A]/70 leading-relaxed">
                      {val.description}
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
