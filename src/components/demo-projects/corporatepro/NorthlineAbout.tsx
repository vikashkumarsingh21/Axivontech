"use client";

import React from "react";
import Image from "next/image";
import { Compass, Target, Users, BookOpen, Quote, Shield } from "lucide-react";

const VALUES = [
  {
    roman: "I",
    title: "Pragmatism Over Pretense",
    desc: "We prioritize solutions that work within your real-world budget, team capability, and operational constraints over abstract theoretical frameworks.",
    icon: Compass,
  },
  {
    roman: "II",
    title: "Respect for Institutional Knowledge",
    desc: "Your leadership and frontline staff understand their operational nuances better than any external third party. We listen deeply before prescribing changes.",
    icon: BookOpen,
  },
  {
    roman: "III",
    title: "Direct Partner Accountability",
    desc: "Every advisory engagement is personally led by experienced senior partners. We never hand off client mandates to junior analysts or proxies.",
    icon: Users,
  },
  {
    roman: "IV",
    title: "Absolute Commercial Independence",
    desc: "We reject commissions, vendor kickbacks, and technology reseller incentives. Our counsel is solely aligned with what creates value for your business.",
    icon: Target,
  },
];

export default function NorthlineAbout() {
  return (
    <section
      id="about"
      aria-label="About Northline Advisory"
      className="relative bg-[#F7F5EF] py-20 sm:py-28 border-b border-[#29483B]/10 overflow-hidden"
    >
      {/* Subtle Architectural Grid Lines */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(#29483B 1px, transparent 1px), linear-gradient(90deg, #29483B 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Visual Column with Large Editorial Pull Quote */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Backing matting frame */}
              <div className="absolute -bottom-3 -left-3 h-full w-full rounded-xs border border-[#B87352]/25 bg-[#E2E9E0]/50 pointer-events-none" />

              {/* Main Image */}
              <div className="relative overflow-hidden rounded-xs border border-[#29483B]/15 bg-[#E2E9E0] shadow-xl aspect-[4/5] group">
                <Image
                  src="/images/demo-projects/corporatepro/about-philosophy.jpg"
                  alt="Senior advisory partners collaborating during an in-depth strategic review"
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />

                {/* Editorial Scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#252925]/75 via-[#252925]/20 to-transparent pointer-events-none" />

                {/* Overlaid Editorial Pull Quote Plaque */}
                <div className="absolute bottom-6 left-6 right-6 rounded-xs bg-[#F7F5EF]/95 p-5 sm:p-6 border border-[#29483B]/15 shadow-xl backdrop-blur-md">
                  <Quote className="h-6 w-6 text-[#B87352] mb-2" />
                  <blockquote className="font-serif italic text-sm sm:text-base text-[#252925] leading-snug mb-3">
                    &ldquo;In an advisory sector too often intoxicated by abstract frameworks, bespoke pragmatism is the ultimate competitive advantage.&rdquo;
                  </blockquote>
                  <div className="flex items-center justify-between border-t border-[#29483B]/10 pt-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#29483B]">
                      Northline Senior Partners
                    </span>
                    <span className="text-[10px] font-mono text-[#77796F]">
                      Est. 2011
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Narrative, Ethos & Values Grid */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {/* Kicker */}
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="h-px w-7 bg-[#B87352]" />
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.24em] text-[#B87352]">
                PHILOSOPHY & ETHOS
              </span>
            </div>

            {/* Editorial Heading */}
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#252925] leading-tight mb-6">
              Strategic counsel designed for organizations that value substance over ceremony.
            </h2>

            {/* Narrative text */}
            <div className="space-y-4 text-sm sm:text-base text-[#252925]/80 leading-relaxed mb-10 font-normal">
              <p>
                Northline Advisory was founded to address a persistent failure in corporate consulting: too many engagements produce bloated slide decks filled with impenetrable jargon, only to leave client teams with the burden of deciphering how to execute.
              </p>
              <p>
                We do not operate from ivory towers. We spend time on your operational floor, listen carefully to frontline technicians and division heads, analyze empirical performance data, and work shoulder-to-shoulder with your leadership to construct durable solutions.
              </p>
            </div>

            {/* 4 Core Principles — Editorial 2x2 Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-6 border-t border-[#29483B]/10 mb-8">
              {VALUES.map((val) => {
                const Icon = val.icon;
                return (
                  <div
                    key={val.title}
                    className="group rounded-xs bg-white p-6 border border-[#29483B]/12 shadow-xs transition-all duration-200 hover:border-[#29483B]/30 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xs bg-[#E2E9E0]/70 text-[#29483B] group-hover:bg-[#29483B] group-hover:text-[#F7F5EF] transition-colors">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="font-serif text-xs font-semibold text-[#B87352]">
                        {val.roman}
                      </span>
                    </div>

                    <h3 className="font-serif text-base font-normal text-[#252925] mb-2 group-hover:text-[#29483B] transition-colors">
                      {val.title}
                    </h3>

                    <p className="text-xs text-[#252925]/75 leading-relaxed font-normal">
                      {val.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Direct Partner Assurance Plaque */}
            <div className="rounded-xs bg-[#E2E9E0]/50 p-5 border border-[#29483B]/12 flex items-start gap-3.5">
              <Shield className="h-5 w-5 text-[#29483B] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-xs font-bold uppercase tracking-[0.14em] text-[#29483B] mb-1">
                  Direct Partner Guarantee
                </strong>
                <p className="text-xs text-[#252925]/80 leading-relaxed font-normal">
                  Every advisory mandate is directed exclusively by seasoned senior partners. We never deploy junior analysts to lead strategic diagnostics or manage executive stakeholder sessions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
