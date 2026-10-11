"use client";

import React from "react";
import Image from "next/image";
import { Compass, Target, Users, BookOpen } from "lucide-react";

const VALUES = [
  {
    title: "Pragmatism over Pretense",
    desc: "We prioritize solutions that work within your real-world budget, team capability, and operational constraints over abstract theoretical frameworks.",
    icon: Compass,
  },
  {
    title: "Respect for Institutional Knowledge",
    desc: "Your leadership and frontline staff know their operational nuances better than any external third party. We listen deeply before prescribing changes.",
    icon: BookOpen,
  },
  {
    title: "Direct Partner Accountability",
    desc: "Every advisory engagement is personally led by experienced senior partners. We never hand off client mandates to junior analysts or intermediaries.",
    icon: Users,
  },
  {
    title: "Independence of Mind",
    desc: "We do not accept commissions, vendor kickbacks, or technology reseller incentives. Our counsel is solely aligned with what serves your business.",
    icon: Target,
  },
];

export default function NorthlineAbout() {
  return (
    <section
      id="about"
      aria-label="About Northline Advisory"
      className="relative bg-[#F7F5EF] py-20 sm:py-28 border-b border-[#29483B]/10"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Image & Advisory Manifesto */}
          <div className="lg:col-span-5 relative order-2 lg:order-1">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="relative overflow-hidden rounded-sm border border-[#29483B]/15 bg-white shadow-xl aspect-[4/5]">
                <Image
                  src="/images/demo-projects/corporatepro/about-philosophy.jpg"
                  alt="Senior advisory partners collaborating during an in-depth strategic review"
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#252925]/50 via-transparent to-transparent pointer-events-none" />

                {/* Overlaid Card */}
                <div className="absolute bottom-6 left-6 right-6 rounded-sm bg-[#F7F5EF]/95 backdrop-blur-md p-5 border border-[#29483B]/15 shadow-sm">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B87352] block mb-1">
                    OUR COMMITMENT
                  </span>
                  <p className="font-serif text-sm text-[#252925] leading-snug">
                    Building resilient, self-directed businesses through candid partnership and disciplined operational practice.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Narrative & Values */}
          <div className="lg:col-span-7 flex flex-col justify-center order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="h-px w-6 bg-[#B87352]" />
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#B87352]">
                OUR PERSPECTIVE
              </span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[#252925] leading-tight mb-6">
              Strategic counsel designed for businesses that value substance over ceremony.
            </h2>

            <div className="space-y-4 text-sm sm:text-base text-[#252925]/80 leading-relaxed mb-8">
              <p>
                Northline Advisory was established on a simple premise: mid-market and enterprise businesses need clear, unvarnished guidance to navigate operational friction and strategic transitions.
              </p>
              <p>
                Too often, corporate consulting delivers bloated slide presentations filled with jargon and unrealistic projections. We take the opposite approach. We spend time on your operational floor, scrutinize your actual operational bottlenecks, and partner with your leadership to implement enduring improvements.
              </p>
            </div>

            {/* Core Values Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-6 border-t border-[#29483B]/10">
              {VALUES.map((val) => {
                const Icon = val.icon;
                return (
                  <div key={val.title} className="rounded-sm bg-white p-5 border border-[#29483B]/10 shadow-xs">
                    <div className="flex items-center gap-2.5 mb-2">
                      <Icon className="h-4 w-4 text-[#29483B]" />
                      <h3 className="font-serif text-sm font-semibold text-[#252925]">
                        {val.title}
                      </h3>
                    </div>
                    <p className="text-xs text-[#252925]/75 leading-relaxed">
                      {val.desc}
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
