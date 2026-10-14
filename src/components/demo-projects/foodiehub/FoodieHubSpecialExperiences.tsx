"use client";

import React, { useState } from "react";
import Image from "next/image";
import { SPECIAL_EXPERIENCES } from "@/data/foodiehub-data";
import { Sparkles, CalendarCheck, ArrowRight, Users, GlassWater, Crown } from "lucide-react";
import { motion } from "framer-motion";

export default function FoodieHubSpecialExperiences() {
  const [imgError, setImgError] = useState(false);

  const icons = [Crown, Users, GlassWater];

  return (
    <section
      id="experiences"
      aria-labelledby="experiences-heading"
      className="relative bg-[#F8F3EA] py-20 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-16">
          {/* Left Column: Private Salon Imagery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative lg:col-span-5"
          >
            {/* Offset decorative border */}
            <div
              aria-hidden="true"
              className="absolute -top-3 -right-3 -bottom-3 -left-3 rounded-3xl border border-[#D4C9B9] bg-[#F0E8DA] rotate-1 pointer-events-none"
            />

            <div className="relative overflow-hidden rounded-2xl border border-[#D4C9B9] bg-[#F0E8DA] shadow-xl">
              {!imgError ? (
                <Image
                  src="/images/demo-projects/foodiehub/private-dining.jpg"
                  alt="Exclusive private dining room table setting with amber ambient glow"
                  width={700}
                  height={850}
                  onError={() => setImgError(true)}
                  className="h-[380px] sm:h-[480px] w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                />
              ) : (
                <div className="flex h-[380px] sm:h-[480px] w-full flex-col items-center justify-center bg-[#F0E8DA] p-8 text-center">
                  <Users className="h-12 w-12 text-[#B85C38] mb-3" />
                  <span className="font-serif text-xl font-bold text-[#24221F]">The Private Salon</span>
                  <span className="text-xs uppercase tracking-widest text-[#6B6560] mt-1">Intimate Gatherings</span>
                </div>
              )}

              {/* Overlaid Badge */}
              <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-[#D4C9B9] bg-[#F8F3EA]/95 p-3.5 shadow-md backdrop-blur-md">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-serif font-bold text-[#24221F]">Private Salon Buyout</span>
                  <span className="font-mono text-[#B85C38] font-semibold">Up to 16 Guests</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Curated Experiences List */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7"
          >
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-[#6B6560]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#B85C38]" />
              <span>Tailored Gatherings</span>
            </div>

            <h2
              id="experiences-heading"
              className="mt-4 font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#24221F]"
            >
              Special Experiences
            </h2>

            <p className="mt-4 text-base text-[#6B6560] leading-relaxed">
              From bespoke multiversal tasting menus curated alongside our executive chef, to
              reverent celebrations in our timber-clad private salon, we orchestrate memorable,
              warmly hosted gatherings.
            </p>

            <div className="mt-8 space-y-5">
              {SPECIAL_EXPERIENCES.map((exp, idx) => {
                const Icon = icons[idx] || Sparkles;

                return (
                  <div
                    key={exp.id}
                    className="group rounded-2xl border border-[#D4C9B9] bg-white p-6 shadow-sm transition-all duration-300 hover:border-[#B85C38]/40 hover:shadow-md"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F0E8DA] text-[#B85C38] border border-[#D4C9B9]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#C4964C]">
                          {exp.eyebrow}
                        </span>
                        <h3 className="mt-1 font-serif text-lg sm:text-xl font-bold text-[#24221F] transition-colors group-hover:text-[#B85C38]">
                          {exp.title}
                        </h3>
                        <p className="mt-2 text-xs sm:text-sm text-[#6B6560] leading-relaxed">
                          {exp.description}
                        </p>
                        <p className="mt-3 text-xs font-semibold text-[#B85C38]">
                          {exp.detail}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-9">
              <a
                href="#reservations"
                className="group inline-flex items-center gap-2 rounded-full bg-[#B85C38] px-7 py-3.5 text-xs uppercase tracking-wider font-semibold text-white shadow-sm transition-all hover:bg-[#9E4826] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B85C38]"
              >
                <CalendarCheck className="h-4 w-4" />
                <span>Enquire for Private Table</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
