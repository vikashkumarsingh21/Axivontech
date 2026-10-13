"use client";

import React from "react";
import Image from "next/image";
import { Sparkles, HeartHandshake, Flame, Compass } from "lucide-react";

export default function FoodieHubExperience() {
  const pillars = [
    {
      icon: Flame,
      title: "Warm Dining Atmosphere",
      description: "Gentle acoustic tones, ambient candlelight, and custom earthenware crafted for intimate conversations.",
    },
    {
      icon: Compass,
      title: "Shared Culinary Journey",
      description: "Our courses are intentionally proportioned for table sharing, reviving traditional Indian feast camaraderie.",
    },
    {
      icon: HeartHandshake,
      title: "Mindful Hospitality",
      description: "Our dining stewards guide your table through flavor profiles, regional heritage stories, and botanical pairings.",
    },
  ];

  return (
    <section
      id="experience"
      aria-labelledby="experience-heading"
      className="relative bg-[#F8F3EA] py-16 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left Column: Narrative & Experience Pillars */}
          <div className="lg:col-span-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-[#68735A]">
              <Sparkles className="h-3.5 w-3.5 text-[#B85C38]" />
              <span>The Dining Atmosphere</span>
            </div>

            <h2
              id="experience-heading"
              className="mt-4 font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#24221F] leading-tight"
            >
              More Than a Meal. Time Well Spent.
            </h2>

            <p className="mt-6 text-base sm:text-lg text-[#24221F]/80 leading-relaxed">
              Dining at Saffron & Stone is created to be an unhurried pause in your day.
              Every corner of our space—from the low ambient lighting to the gentle scent of
              steaming basmati and roasted spices—invites you to settle in and savour every moment.
            </p>

            <div className="mt-10 space-y-6">
              {pillars.map((pillar) => {
                const IconComponent = pillar.icon;
                return (
                  <div key={pillar.title} className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#B85C38] shadow-sm border border-[#E8DFC9]">
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-[#24221F]">
                        {pillar.title}
                      </h3>
                      <p className="mt-1 text-sm text-[#24221F]/70 leading-relaxed">
                        {pillar.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Dynamic dual-image composition */}
          <div className="relative lg:col-span-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="overflow-hidden rounded-2xl border border-[#E0D4BE] shadow-md">
                <Image
                  src="/images/demo-projects/foodiehub/ambience-interior.jpg"
                  alt="Warm, softly lit dining room with elegant architectural timber features"
                  width={600}
                  height={750}
                  className="h-[320px] sm:h-[400px] w-full object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>

              <div className="sm:mt-10 overflow-hidden rounded-2xl border border-[#E0D4BE] shadow-md">
                <Image
                  src="/images/demo-projects/foodiehub/ambience-table.jpg"
                  alt="Intimate dining table with ambient glassware and artisanal ceramic plates"
                  width={600}
                  height={750}
                  className="h-[320px] sm:h-[400px] w-full object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
