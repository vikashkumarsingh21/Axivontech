"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight, UtensilsCrossed, Sparkles } from "lucide-react";

export default function FoodieHubHero() {
  return (
    <section
      id="hero"
      aria-label="Contemporary Indian Dining Hero"
      className="relative overflow-hidden bg-[#F8F3EA] pt-8 pb-16 md:pt-14 md:pb-24 lg:pt-20 lg:pb-32"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Left Column: Editorial Headline & Actions */}
          <div className="lg:col-span-6 xl:col-span-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#68735A]/30 bg-[#68735A]/10 px-3.5 py-1 text-xs font-semibold tracking-[0.2em] uppercase text-[#68735A]">
              <Sparkles className="h-3.5 w-3.5 text-[#B85C38]" />
              <span>Contemporary Indian Dining</span>
            </div>

            <h1 className="mt-5 font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#24221F] leading-[1.12]">
              A Taste Worth Taking Your Time For.
            </h1>

            <p className="mt-6 max-w-xl text-base sm:text-lg text-[#24221F]/80 leading-relaxed">
              Discover thoughtful flavours, seasonal inspiration, and a dining
              experience made for gathering around the table. Crafted with handpicked
              spices, slow culinary traditions, and modern warmth.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#menu"
                className="inline-flex items-center gap-2 rounded-full bg-[#B85C38] px-7 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#9E4A28] hover:shadow-lg active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B85C38] focus-visible:ring-offset-2"
              >
                <span>Explore Our Menu</span>
                <ArrowRight className="h-4 w-4" />
              </a>

              <a
                href="#reservations"
                className="inline-flex items-center gap-2 rounded-full border border-[#24221F]/20 bg-white/60 px-6 py-3.5 text-sm font-semibold text-[#24221F] backdrop-blur-sm transition-all hover:border-[#B85C38] hover:bg-white hover:text-[#B85C38] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B85C38]"
              >
                <UtensilsCrossed className="h-4 w-4 text-[#B85C38]" />
                <span>Reserve a Table</span>
              </a>
            </div>

            {/* Context Notice / Fictional Demonstration Badge */}
            <div className="mt-10 border-t border-[#E8DFC9] pt-6">
              <div className="grid grid-cols-3 gap-4 text-left">
                <div>
                  <span className="block font-serif text-lg font-bold text-[#24221F]">Woodfire & Clay</span>
                  <span className="text-xs text-[#68735A] uppercase tracking-wider">Traditional Tandoor</span>
                </div>
                <div>
                  <span className="block font-serif text-lg font-bold text-[#24221F]">Pure Saffron</span>
                  <span className="text-xs text-[#68735A] uppercase tracking-wider">Kashmiri Botanicals</span>
                </div>
                <div>
                  <span className="block font-serif text-lg font-bold text-[#24221F]">Seasonal Plate</span>
                  <span className="text-xs text-[#68735A] uppercase tracking-wider">Fresh Micro-Harvest</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Hero Composition */}
          <div className="relative lg:col-span-6 xl:col-span-6">
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              {/* Soft decorative backdrop element */}
              <div
                aria-hidden="true"
                className="absolute -top-6 -right-6 -bottom-6 -left-6 rounded-3xl bg-[#EAE1D0]/60 -rotate-1 pointer-events-none"
              />

              {/* Main Food Photograph */}
              <div className="relative overflow-hidden rounded-2xl border border-[#E0D4BE] bg-white shadow-2xl">
                <Image
                  src="/images/demo-projects/foodiehub/hero-dish.jpg"
                  alt="Contemporary plated Indian dining specialty garnished with saffron and microgreens"
                  width={900}
                  height={650}
                  priority
                  className="h-[360px] sm:h-[440px] lg:h-[480px] w-full object-cover object-center transition-transform duration-700 hover:scale-[1.02]"
                />
                
                {/* Visual Card Accent */}
                <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-auto rounded-xl bg-white/95 p-4 shadow-lg backdrop-blur-md border border-[#E8DFC9]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F8F3EA] text-[#B85C38]">
                      <UtensilsCrossed className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[#68735A]">Signature Experience</p>
                      <p className="font-serif text-sm font-semibold text-[#24221F]">Contemporary Indian Tasting Menu</p>
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
