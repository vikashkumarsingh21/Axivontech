"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight, Compass, ShieldCheck, CheckCircle2, Award } from "lucide-react";
import { motion } from "framer-motion";

export default function NorthlineHero() {
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section
      id="top"
      aria-label="Overview & Mission"
      className="relative overflow-hidden bg-[#F7F5EF] pt-12 pb-20 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-28 border-b border-[#29483B]/10"
    >
      {/* Subtle Architectural Grid Lines */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(#29483B 1px, transparent 1px), linear-gradient(90deg, #29483B 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Ambient Warm Gradient Scrim */}
      <div className="pointer-events-none absolute top-0 right-1/4 -z-0 h-96 w-96 rounded-full bg-[#E2E9E0]/40 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-10 -z-0 h-80 w-80 rounded-full bg-[#B87352]/5 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left Column: Editorial Headline & Mandate */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 flex flex-col justify-center"
          >
            {/* Category Eyebrow with Warm Copper Rule */}
            <div className="inline-flex items-center gap-2.5 mb-6">
              <span className="h-px w-7 bg-[#B87352]" />
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.24em] text-[#B87352]">
                STRATEGY &bull; OPERATIONS &bull; TRANSFORMATION
              </span>
            </div>

            {/* Editorial Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#252925] leading-[1.12] mb-6">
              Clarity for complex business. <br className="hidden sm:inline" />
              <span className="italic font-serif text-[#29483B] font-medium">Confidence</span> for what comes next.
            </h1>

            {/* Body Copy */}
            <p className="text-base sm:text-lg text-[#252925]/80 leading-relaxed max-w-2xl mb-8 font-normal">
              We partner directly with executive leadership and board directors to eliminate operational friction, navigate pivotal transitions, and establish resilient foundations for long-term compounding growth.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 mb-10">
              <a
                href="#approach"
                onClick={(e) => handleScroll(e, "#approach")}
                className="group inline-flex items-center justify-center gap-2.5 rounded-xs bg-[#29483B] px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#F7F5EF] shadow-xs transition-all duration-200 hover:bg-[#1e352b] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#29483B]"
              >
                <span>Explore Advisory Approach</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#B87352] transition-transform duration-200 group-hover:translate-x-1" />
              </a>

              <a
                href="#contact"
                onClick={(e) => handleScroll(e, "#contact")}
                className="inline-flex items-center justify-center gap-2 rounded-xs border border-[#29483B]/25 bg-white/80 px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#252925] backdrop-blur-xs transition-all duration-200 hover:bg-[#E2E9E0]/70 hover:border-[#29483B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#29483B]"
              >
                <span>Discuss Your Mandate</span>
              </a>
            </div>

            {/* Credibility Guarantee Strip */}
            <div className="pt-6 border-t border-[#29483B]/10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#77796F]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#29483B] shrink-0" />
                <span className="font-medium text-[#252925]/90">Direct Partner Direction</span>
              </div>
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-[#B87352] shrink-0" />
                <span className="font-medium text-[#252925]/90">Zero Commercial Bias</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#29483B] shrink-0" />
                <span className="font-medium text-[#252925]/90">Measured Implementation</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Architectural Hero Image Presentation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative"
          >
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Architectural Offset Backing Frame */}
              <div className="absolute -bottom-3 -right-3 h-full w-full rounded-xs border border-[#B87352]/30 bg-[#E2E9E0]/60 pointer-events-none" />

              {/* Architectural Registration Crosshairs */}
              <div className="absolute -top-3 -left-3 text-[#B87352]/60 font-mono text-xs select-none pointer-events-none">+</div>
              <div className="absolute -bottom-5 -right-5 text-[#B87352]/60 font-mono text-xs select-none pointer-events-none">+</div>

              {/* Main Image Container */}
              <div className="relative overflow-hidden rounded-xs border border-[#29483B]/20 bg-[#E2E9E0] shadow-[0_20px_50px_rgba(41,72,59,0.12)] aspect-[4/3] sm:aspect-[5/4] lg:aspect-[4/5] group">
                <Image
                  src="/images/demo-projects/corporatepro/hero-advisory.jpg"
                  alt="Senior executive advisory leadership in an architectural boardroom setting"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 45vw, 40vw"
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
                />

                {/* Subtle Editorial Tone Scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#252925]/60 via-[#252925]/10 to-transparent pointer-events-none" />

                {/* Top Corner Floating Badge */}
                <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 rounded-xs bg-[#F7F5EF]/95 px-3 py-1 border border-[#29483B]/15 shadow-xs backdrop-blur-md">
                  <Award className="h-3.5 w-3.5 text-[#B87352]" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#29483B]">
                    Partner-Led Practice
                  </span>
                </div>

                {/* Floating Editorial Quote Plaque */}
                <div className="absolute bottom-4 left-4 right-4 z-10 rounded-xs border border-[#29483B]/15 bg-[#F7F5EF]/95 p-4 sm:p-5 shadow-lg backdrop-blur-md">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#B87352]" />
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#77796F]">
                      Core Advisory Principle
                    </span>
                  </div>
                  <p className="font-serif italic text-xs sm:text-[13px] text-[#252925] leading-relaxed">
                    &ldquo;Real operational transformation is built on disciplined execution, not abstract slide decks.&rdquo;
                  </p>
                  <span className="mt-2 block text-[9px] font-semibold uppercase tracking-[0.18em] text-[#29483B]">
                    Northline Advisory Engagement Standard
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Advisory Trust Metrics Strip — Editorial Ledger Format */}
        <div className="mt-16 sm:mt-20 pt-10 border-t border-[#29483B]/12 grid grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="relative pr-4">
            <div className="flex items-baseline gap-1">
              <span className="font-serif text-3xl sm:text-4xl font-normal text-[#29483B]">15+</span>
              <span className="text-xs font-serif italic text-[#B87352]">Years</span>
            </div>
            <p className="mt-2 text-xs text-[#252925]/75 leading-relaxed font-medium">
              Senior corporate advisory and executive transformation leadership.
            </p>
          </div>

          <div className="relative pr-4 lg:border-l lg:border-[#29483B]/10 lg:pl-6">
            <div className="flex items-baseline gap-1">
              <span className="font-serif text-3xl sm:text-4xl font-normal text-[#29483B]">40+</span>
              <span className="text-xs font-serif italic text-[#B87352]">Mandates</span>
            </div>
            <p className="mt-2 text-xs text-[#252925]/75 leading-relaxed font-medium">
              Completed strategic, restructuring, and digital operational programs.
            </p>
          </div>

          <div className="relative pr-4 border-t pt-6 sm:border-t-0 sm:pt-0 lg:border-l lg:border-[#29483B]/10 lg:pl-6">
            <div className="flex items-baseline gap-1">
              <span className="font-serif text-3xl sm:text-4xl font-normal text-[#29483B]">94%</span>
              <span className="text-xs font-serif italic text-[#B87352]">Retention</span>
            </div>
            <p className="mt-2 text-xs text-[#252925]/75 leading-relaxed font-medium">
              Clients retained for continuous governance and subsequent expansions.
            </p>
          </div>

          <div className="relative border-t pt-6 sm:border-t-0 sm:pt-0 lg:border-l lg:border-[#29483B]/10 lg:pl-6">
            <div className="flex items-baseline gap-1">
              <span className="font-serif text-3xl sm:text-4xl font-normal text-[#29483B]">100%</span>
              <span className="text-xs font-serif italic text-[#B87352]">Partner-Led</span>
            </div>
            <p className="mt-2 text-xs text-[#252925]/75 leading-relaxed font-medium">
              Direct partner involvement with zero delegation to junior intermediaries.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
