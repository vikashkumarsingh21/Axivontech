"use client";

import React from "react";
import Image from "next/image";
import { SPECIAL_EXPERIENCES } from "@/data/foodiehub-data";
import { Sparkles, CalendarCheck, ArrowRight } from "lucide-react";

export default function FoodieHubSpecialExperiences() {
  return (
    <section
      id="experiences"
      aria-labelledby="experiences-heading"
      className="relative bg-[#F8F3EA] py-16 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
          {/* Left Column: Image of private dining setup */}
          <div className="relative lg:col-span-5">
            <div className="overflow-hidden rounded-3xl border border-[#E0D4BE] shadow-xl">
              <Image
                src="/images/demo-projects/foodiehub/private-dining.jpg"
                alt="Private dining table setup decorated with ambient warm lighting for celebratory gatherings"
                width={700}
                height={850}
                className="h-[380px] sm:h-[460px] w-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
          </div>

          {/* Right Column: Experiences List */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-[#68735A]">
              <Sparkles className="h-3.5 w-3.5 text-[#B85C38]" />
              <span>Tailored Gatherings</span>
            </div>

            <h2
              id="experiences-heading"
              className="mt-3 font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#24221F]"
            >
              Special Experiences
            </h2>

            <p className="mt-4 text-base text-[#24221F]/80 leading-relaxed">
              Whether celebrating milestones with close friends or curating a private
              family feast, we offer bespoke culinary arrangements designed with warmth.
            </p>

            <div className="mt-8 space-y-6">
              {SPECIAL_EXPERIENCES.map((exp) => (
                <div
                  key={exp.id}
                  className="rounded-2xl border border-[#E8DFC9] bg-white p-6 shadow-sm transition-all hover:border-[#B85C38]/40 hover:shadow-md"
                >
                  <span className="text-xs font-bold uppercase tracking-widest text-[#B85C38]">
                    {exp.eyebrow}
                  </span>
                  <h3 className="mt-1 font-serif text-xl font-bold text-[#24221F]">
                    {exp.title}
                  </h3>
                  <p className="mt-2 text-sm text-[#24221F]/70 leading-relaxed">
                    {exp.description}
                  </p>
                  <p className="mt-3 text-xs font-medium text-[#68735A]">
                    {exp.detail}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <a
                href="#reservations"
                className="inline-flex items-center gap-2 rounded-full bg-[#B85C38] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#9E4A28] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B85C38]"
              >
                <CalendarCheck className="h-4 w-4" />
                <span>Enquire for Private Table</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
