"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Sparkles, HeartHandshake, Flame, Compass, Moon, Wine } from "lucide-react";
import { motion } from "framer-motion";

export default function FoodieHubExperience() {
  const [img1Error, setImg1Error] = useState(false);
  const [img2Error, setImg2Error] = useState(false);

  const pillars = [
    {
      icon: Flame,
      title: "The Architecture of Warmth",
      description:
        "Hand-turned terracotta tableware, unlacquered brass cutlery, and gentle amber candlelight create an atmosphere of immediate calm.",
    },
    {
      icon: Compass,
      title: "Shared Culinary Rhythms",
      description:
        "Every plate is calibrated for communal table sharing, restoring the leisurely fellowship of traditional Indian celebratory feasts.",
    },
    {
      icon: Wine,
      title: "Botanical Harmonisation",
      description:
        "Our in-house beverage atelier pairs each course with cold-steeped hill tisanes, house-fermented shrubs, or single-origin infusions.",
    },
    {
      icon: HeartHandshake,
      title: "Attentive, Discreet Care",
      description:
        "Our dining stewards narrate regional culinary lineages and spice profiles without disrupting your table’s intimate conversation.",
    },
  ];

  return (
    <section
      id="experience"
      aria-labelledby="experience-heading"
      className="relative bg-[#F8F3EA] py-20 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-16">
          {/* Left Column: Atmospheric Storytelling */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-6"
          >
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-[#6B6560]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#B85C38]" />
              <span>Atmospheric Dining</span>
            </div>

            <h2
              id="experience-heading"
              className="mt-4 font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#24221F] leading-[1.12]"
            >
              More Than Dinner. <br />
              <span className="italic font-normal text-[#B85C38]">An Unhurried Sanctuary.</span>
            </h2>

            <p className="mt-6 text-base sm:text-lg text-[#6B6560] leading-relaxed">
              Stepping inside Saffron & Stone is designed to feel like an escape from the city’s
              frenetic cadence. The acoustic quietude, natural lime-plastered walls, and the subtle
              aroma of wood smoke and crushed cardamom invite you to let time slip away.
            </p>

            <div className="mt-10 space-y-6">
              {pillars.map((pillar) => {
                const IconComponent = pillar.icon;
                return (
                  <div
                    key={pillar.title}
                    className="flex items-start gap-4 rounded-xl border border-[#D4C9B9]/70 bg-[#F0E8DA]/50 p-4 transition-colors hover:border-[#B85C38]/40"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#B85C38] shadow-sm border border-[#D4C9B9]">
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-serif text-base font-bold text-[#24221F]">
                        {pillar.title}
                      </h3>
                      <p className="mt-1 text-xs sm:text-sm text-[#6B6560] leading-relaxed">
                        {pillar.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Right Column: Layered Atmospheric Imagery */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative lg:col-span-6"
          >
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Frame 1: Interior architectural mood */}
              <div className="relative overflow-hidden rounded-2xl border border-[#D4C9B9] bg-[#F0E8DA] shadow-lg">
                {!img1Error ? (
                  <Image
                    src="/images/demo-projects/foodiehub/ambience-interior.jpg"
                    alt="Warm, ambient interior of Saffron & Stone dining room"
                    width={600}
                    height={750}
                    onError={() => setImg1Error(true)}
                    className="h-[340px] sm:h-[420px] w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-[340px] sm:h-[420px] w-full flex-col items-center justify-center bg-[#F0E8DA] p-6 text-center">
                    <Moon className="h-10 w-10 text-[#B85C38] mb-2" />
                    <span className="font-serif text-base font-bold text-[#24221F]">Dining Room Ambience</span>
                  </div>
                )}
                <div className="absolute bottom-4 left-4 rounded-full bg-[#24221F]/80 px-3 py-1 text-[10px] uppercase tracking-wider text-[#F8F3EA] backdrop-blur-sm">
                  The Salon Quarter
                </div>
              </div>

              {/* Frame 2: Offset Table Setting */}
              <div className="relative sm:mt-12 overflow-hidden rounded-2xl border border-[#D4C9B9] bg-[#F0E8DA] shadow-lg">
                {!img2Error ? (
                  <Image
                    src="/images/demo-projects/foodiehub/ambience-table.jpg"
                    alt="Intimate candlelit table setting with handmade glassware"
                    width={600}
                    height={750}
                    onError={() => setImg2Error(true)}
                    className="h-[340px] sm:h-[420px] w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-[340px] sm:h-[420px] w-full flex-col items-center justify-center bg-[#F0E8DA] p-6 text-center">
                    <Sparkles className="h-10 w-10 text-[#C4964C] mb-2" />
                    <span className="font-serif text-base font-bold text-[#24221F]">Candlelit Tablescape</span>
                  </div>
                )}
                <div className="absolute bottom-4 left-4 rounded-full bg-[#24221F]/80 px-3 py-1 text-[10px] uppercase tracking-wider text-[#F8F3EA] backdrop-blur-sm">
                  Evening Tablescape
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
