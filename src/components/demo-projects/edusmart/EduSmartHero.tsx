"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight, Sparkles, BookOpen, Users } from "lucide-react";

export default function EduSmartHero() {
  return (
    <section
      id="hero"
      aria-label="Aurevia Academy Hero"
      className="relative overflow-hidden bg-[#F7F3EB] pt-8 pb-16 md:pt-14 md:pb-24 lg:pt-18 lg:pb-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Left Column: Editorial Headline & Primary Actions */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#B89557]/40 bg-[#B89557]/10 px-3.5 py-1 text-xs font-semibold tracking-[0.2em] uppercase text-[#33243B]">
              <Sparkles className="h-3.5 w-3.5 text-[#B89557]" />
              <span>Learning with Purpose</span>
            </div>

            <h1 className="mt-5 font-serif text-4xl sm:text-5xl md:text-6xl lg:text-[64px] font-bold tracking-tight text-[#27232A] leading-[1.12]">
              Discover Your Potential.
              <br />
              <span className="text-[#33243B]">Define Your Future.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base sm:text-lg text-[#27232A]/80 leading-relaxed">
              Explore a thoughtful approach to learning, academic discovery, and the
              opportunities that help students move forward with confidence. At Aurevia Academy,
              interdisciplinary scholarship meets modern campus community.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#programs"
                className="inline-flex items-center gap-2 rounded-full bg-[#33243B] px-7 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#483353] hover:shadow-lg active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#33243B] focus-visible:ring-offset-2"
              >
                <span>Explore Academic Programs</span>
                <ArrowRight className="h-4 w-4 text-[#B89557]" />
              </a>

              <a
                href="#campus-life"
                className="inline-flex items-center gap-2 rounded-full border border-[#27232A]/25 bg-white/70 px-6 py-3.5 text-sm font-semibold text-[#27232A] backdrop-blur-sm transition-all hover:border-[#33243B] hover:bg-white hover:text-[#33243B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#33243B]"
              >
                <span>Discover Campus Life</span>
              </a>
            </div>

            {/* Academic Highlights */}
            <div className="mt-12 border-t border-[#E8E1EB] pt-6">
              <div className="grid grid-cols-3 gap-4 text-left">
                <div>
                  <span className="block font-serif text-lg sm:text-xl font-bold text-[#33243B]">6 Pathways</span>
                  <span className="text-xs text-[#27232A]/65 uppercase tracking-wider">Multidisciplinary</span>
                </div>
                <div>
                  <span className="block font-serif text-lg sm:text-xl font-bold text-[#33243B]">Studio Labs</span>
                  <span className="text-xs text-[#27232A]/65 uppercase tracking-wider">Collaborative Spaces</span>
                </div>
                <div>
                  <span className="block font-serif text-lg sm:text-xl font-bold text-[#33243B]">Research First</span>
                  <span className="text-xs text-[#27232A]/65 uppercase tracking-wider">Critical Inquiries</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Campus Photography Composition */}
          <div className="relative lg:col-span-5">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Soft decorative backdrop */}
              <div
                aria-hidden="true"
                className="absolute -top-5 -right-5 -bottom-5 -left-5 rounded-3xl bg-[#E8E1EB]/60 rotate-1 pointer-events-none"
              />

              {/* Main Image */}
              <div className="relative overflow-hidden rounded-2xl border border-[#D9D1DE] bg-white shadow-2xl">
                <Image
                  src="/images/demo-projects/edusmart/hero-campus.jpg"
                  alt="Aurevia Academy campus grounds and modern university architecture"
                  width={800}
                  height={650}
                  priority
                  className="h-[360px] sm:h-[440px] lg:h-[490px] w-full object-cover object-center transition-transform duration-700 hover:scale-[1.02]"
                />

                {/* Floating academic caption badge */}
                <div className="absolute bottom-4 left-4 right-4 sm:left-5 sm:right-auto rounded-xl bg-white/95 p-4 shadow-lg backdrop-blur-md border border-[#E8E1EB]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E8E1EB] text-[#33243B]">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[#B89557]">Academic Excellence</p>
                      <p className="font-serif text-sm font-semibold text-[#27232A]">Modern University Environment</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
