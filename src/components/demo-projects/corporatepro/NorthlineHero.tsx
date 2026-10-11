"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight, Compass, ShieldCheck, CheckCircle2 } from "lucide-react";

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
      className="relative overflow-hidden bg-[#F7F5EF] pt-12 pb-20 md:pt-20 md:pb-28 border-b border-[#29483B]/10"
    >
      {/* Subtle Architectural Grid Lines */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-[0.03]" 
        style={{
          backgroundImage: "linear-gradient(#29483B 1px, transparent 1px), linear-gradient(90deg, #29483B 1px, transparent 1px)",
          backgroundSize: "64px 64px"
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left Column: Editorial Content */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {/* Category Eyebrow */}
            <div className="inline-flex items-center gap-2 mb-6">
              <span className="h-px w-6 bg-[#B87352]" />
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#B87352]">
                STRATEGY · OPERATIONS · TRANSFORMATION
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-[#252925] leading-[1.12] mb-6">
              Clarity for your business. <br className="hidden sm:inline" />
              <span className="italic text-[#29483B]">Confidence</span> for what&apos;s next.
            </h1>

            {/* Body Copy */}
            <p className="text-base sm:text-lg text-[#252925]/80 leading-relaxed max-w-2xl mb-8 font-normal">
              We help ambitious businesses improve operations, navigate change, and build a stronger foundation for sustainable growth through rigorous, hands-on advisory.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 mb-10">
              <a
                href="#approach"
                onClick={(e) => handleScroll(e, "#approach")}
                className="inline-flex items-center justify-center gap-2.5 rounded-sm bg-[#29483B] px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#F7F5EF] shadow-sm transition-all hover:bg-[#1f372d] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#29483B]"
              >
                <span>Explore Our Approach</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>

              <a
                href="#contact"
                onClick={(e) => handleScroll(e, "#contact")}
                className="inline-flex items-center justify-center gap-2 rounded-sm border border-[#29483B]/30 bg-transparent px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#252925] transition-all hover:bg-[#E2E9E0]/60 hover:border-[#29483B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#29483B]"
              >
                <span>Discuss Your Business</span>
              </a>
            </div>

            {/* Credibility Badges */}
            <div className="pt-6 border-t border-[#29483B]/10 flex flex-wrap items-center gap-6 text-xs text-[#77796F]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#29483B]" />
                <span className="font-medium text-[#252925]/90">Direct Partner Involvement</span>
              </div>
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-[#B87352]" />
                <span className="font-medium text-[#252925]/90">Unbiased Strategic Counsel</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#29483B]" />
                <span className="font-medium text-[#252925]/90">Pragmatic Implementation Focus</span>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Hero Image */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Backing decorative frame */}
              <div className="absolute -inset-3 rounded-sm bg-[#E2E9E0]/70 -rotate-1 transition-transform group-hover:rotate-0" />

              {/* Main Image Container */}
              <div className="relative overflow-hidden rounded-sm border border-[#29483B]/15 bg-white shadow-xl aspect-[4/3] sm:aspect-[5/4] lg:aspect-[4/5]">
                <Image
                  src="/images/demo-projects/corporatepro/hero-advisory.jpg"
                  alt="Executive consulting team analyzing corporate strategy in an architectural office setting"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 45vw, 40vw"
                  className="object-cover object-center"
                />

                {/* Subtle vignette overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#252925]/40 via-transparent to-transparent pointer-events-none" />

                {/* Floating Editorial Quote / Badge */}
                <div className="absolute bottom-4 left-4 right-4 bg-[#F7F5EF]/95 backdrop-blur-md p-4 rounded-sm border border-[#29483B]/15 shadow-sm">
                  <p className="text-xs font-serif italic text-[#252925] leading-snug">
                    &ldquo;Real change is built on disciplined execution, not abstract slides.&rdquo;
                  </p>
                  <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#77796F]">
                    Northline Advisory Principle
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Advisory Trust Metrics Strip */}
        <div className="mt-16 sm:mt-24 pt-8 border-t border-[#29483B]/10 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          <div>
            <span className="font-serif text-2xl sm:text-3xl font-bold text-[#29483B]">15+ Yrs</span>
            <p className="mt-1 text-xs text-[#77796F] leading-tight font-medium">
              Senior corporate advisory & transformation leadership
            </p>
          </div>
          <div>
            <span className="font-serif text-2xl sm:text-3xl font-bold text-[#29483B]">40+</span>
            <p className="mt-1 text-xs text-[#77796F] leading-tight font-medium">
              Completed strategic & operational engagements
            </p>
          </div>
          <div>
            <span className="font-serif text-2xl sm:text-3xl font-bold text-[#29483B]">B2B</span>
            <p className="mt-1 text-xs text-[#77796F] leading-tight font-medium">
              Specialized in manufacturing, technology & professional services
            </p>
          </div>
          <div>
            <span className="font-serif text-2xl sm:text-3xl font-bold text-[#29483B]">100%</span>
            <p className="mt-1 text-xs text-[#77796F] leading-tight font-medium">
              Partner-led engagements with zero delegation to junior proxies
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
