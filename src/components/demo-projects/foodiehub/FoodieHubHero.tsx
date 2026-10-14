"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ArrowRight, UtensilsCrossed, Sparkles, Award } from "lucide-react";
import { motion } from "framer-motion";

export default function FoodieHubHero() {
  const [imageError, setImageError] = useState(false);

  return (
    <section
      id="hero"
      aria-label="Contemporary Indian Dining Hero"
      className="relative overflow-hidden bg-[#F8F3EA] pt-10 pb-20 md:pt-16 md:pb-28 lg:pt-24 lg:pb-36"
    >
      {/* Subtle organic background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 right-0 h-[600px] w-[600px] rounded-full bg-[#F0E8DA] opacity-60 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 -left-40 h-[500px] w-[500px] rounded-full bg-[#B85C38]/5 opacity-60 blur-3xl"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left Column: Editorial Headline & Actions */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 xl:col-span-6"
          >
            {/* Editorial Eyebrow */}
            <div className="inline-flex items-center gap-2.5 rounded-full border border-[#D4C9B9] bg-[#F0E8DA]/80 px-4 py-1.5 text-[11px] font-semibold tracking-[0.25em] uppercase text-[#6B6560]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#B85C38]" />
              <span>Contemporary Indian Gastronomy</span>
              <span className="text-[#C4964C]">◆</span>
              <span className="text-[#B85C38] font-bold">New Delhi</span>
            </div>

            {/* Grand Headline */}
            <h1 className="mt-6 font-serif text-4xl sm:text-5xl md:text-6xl lg:text-[4rem] font-bold tracking-tight text-[#24221F] leading-[1.08]">
              A Taste Worth <br className="hidden sm:inline" />
              <span className="italic font-normal text-[#B85C38]">Taking Your Time</span> For.
            </h1>

            {/* Editorial Subtitle */}
            <p className="mt-6 max-w-xl text-base sm:text-lg text-[#6B6560] leading-relaxed">
              An unhurried celebration of centuries-old Indian culinary heritage,
              reimagined through modern restraint. Slow charcoal embers, freshly ground
              botanicals, and dishes designed for the shared table.
            </p>

            {/* CTAs */}
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a
                href="#menu"
                className="group inline-flex items-center gap-2.5 rounded-full bg-[#B85C38] px-7 py-3.5 text-xs uppercase tracking-wider font-semibold text-white shadow-md transition-all duration-300 hover:bg-[#9E4826] hover:shadow-lg active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B85C38] focus-visible:ring-offset-2"
              >
                <span>Explore Tasting Menu</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>

              <a
                href="#reservations"
                className="group inline-flex items-center gap-2 rounded-full border border-[#D4C9B9] bg-[#F0E8DA]/60 px-6 py-3.5 text-xs uppercase tracking-wider font-semibold text-[#24221F] backdrop-blur-sm transition-all duration-300 hover:border-[#B85C38] hover:bg-white hover:text-[#B85C38] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B85C38]"
              >
                <UtensilsCrossed className="h-4 w-4 text-[#B85C38] transition-transform group-hover:rotate-12" />
                <span>Reserve a Table</span>
              </a>
            </div>

            {/* Signature Credibility Pillars */}
            <div className="mt-12 border-t border-[#D4C9B9] pt-8">
              <div className="grid grid-cols-3 gap-6 text-left">
                <div>
                  <span className="block font-serif text-lg font-bold text-[#24221F]">
                    480°C Clay
                  </span>
                  <span className="mt-0.5 block text-[11px] font-medium uppercase tracking-wider text-[#6B6560]">
                    Woodfire Tandoor
                  </span>
                </div>
                <div className="border-l border-[#D4C9B9]/60 pl-6">
                  <span className="block font-serif text-lg font-bold text-[#24221F]">
                    18-Hour Dum
                  </span>
                  <span className="mt-0.5 block text-[11px] font-medium uppercase tracking-wider text-[#6B6560]">
                    Charcoal Simmer
                  </span>
                </div>
                <div className="border-l border-[#D4C9B9]/60 pl-6">
                  <span className="block font-serif text-lg font-bold text-[#24221F]">
                    Grade-A Saffron
                  </span>
                  <span className="mt-0.5 block text-[11px] font-medium uppercase tracking-wider text-[#6B6560]">
                    Pampore Harvest
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Layered Editorial Photographic Composition */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="relative lg:col-span-6 xl:col-span-6"
          >
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              {/* Kinfolk-style subtle offset backing frame */}
              <div
                aria-hidden="true"
                className="absolute -top-4 -right-4 -bottom-4 -left-4 rounded-3xl border border-[#D4C9B9] bg-[#F0E8DA] rotate-1 shadow-sm pointer-events-none"
              />

              {/* Main Food Photograph Frame */}
              <div className="relative overflow-hidden rounded-2xl border border-[#D4C9B9] bg-[#F0E8DA] shadow-2xl">
                {!imageError ? (
                  <Image
                    src="/images/demo-projects/foodiehub/hero-dish.jpg"
                    alt="Contemporary Indian culinary course garnished with saffron threads and micro-herbs"
                    width={900}
                    height={650}
                    priority
                    onError={() => setImageError(true)}
                    className="h-[380px] sm:h-[460px] lg:h-[500px] w-full object-cover object-center transition-transform duration-1000 hover:scale-[1.03]"
                  />
                ) : (
                  /* Warm Editorial Image Placeholder Fallback */
                  <div className="flex h-[380px] sm:h-[460px] lg:h-[500px] w-full flex-col items-center justify-center bg-gradient-to-br from-[#F0E8DA] via-[#E8DFC9] to-[#D4C9B9] p-8 text-center text-[#24221F]">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F8F3EA] text-[#B85C38] shadow-inner mb-4">
                      <Sparkles className="h-8 w-8" />
                    </div>
                    <span className="font-serif text-2xl font-bold tracking-tight">Artisanal Plating</span>
                    <span className="mt-1 text-xs uppercase tracking-widest text-[#6B6560]">Saffron & Stone Kitchen Pass</span>
                  </div>
                )}

                {/* Editorial Corner Stamp */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-[#24221F]/90 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#F8F3EA] backdrop-blur-md border border-[#C4964C]/30">
                  <Award className="h-3 w-3 text-[#C4964C]" />
                  <span>Degustation Selection</span>
                </div>

                {/* Floating Dish Descriptor Card */}
                <div className="absolute bottom-5 left-5 right-5 sm:left-6 sm:right-6 rounded-xl border border-[#D4C9B9] bg-[#F8F3EA]/95 p-4 shadow-xl backdrop-blur-md">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F0E8DA] text-[#B85C38] border border-[#D4C9B9]">
                        <UtensilsCrossed className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C4964C]">
                          Course 04 of Seven
                        </span>
                        <p className="font-serif text-sm sm:text-base font-semibold text-[#24221F]">
                          Smoked Truffle Kulcha & Malai Paneer
                        </p>
                      </div>
                    </div>
                    <div className="hidden sm:block text-right">
                      <span className="font-serif text-sm font-bold text-[#B85C38]">
                        ₹525
                      </span>
                      <span className="block text-[10px] uppercase tracking-wider text-[#9E9790]">
                        A La Carte
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
