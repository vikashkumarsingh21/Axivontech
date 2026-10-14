"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ArrowRight, Sparkles, Flame, Clock, HeartHandshake } from "lucide-react";
import { motion } from "framer-motion";

export default function FoodieHubStory() {
  const [imgError, setImgError] = useState(false);

  const commitments = [
    {
      icon: Flame,
      title: "Woodfire & Earthenware",
      description: "Clay tandoors seasoned with mustard oil, cooking over reclaimed mango wood charcoal.",
    },
    {
      icon: Clock,
      title: "Unhurried Simmers",
      description: "Dal Bukhara and slow Awadhi gravies simmered undisturbed across 18 overnight hours.",
    },
    {
      icon: HeartHandshake,
      title: "Direct-Estate Botanicals",
      description: "Grade-A saffron from Pampore, Tellicherry black pepper, and hand-pounded cardamom.",
    },
  ];

  return (
    <section
      id="story"
      aria-labelledby="story-heading"
      className="relative border-y border-[#D4C9B9] bg-[#F0E8DA]/40 py-20 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-16">
          {/* Left Column: Editorial Photo Spread */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative lg:col-span-6"
          >
            {/* Background frame */}
            <div
              aria-hidden="true"
              className="absolute -top-3 -left-3 -bottom-3 -right-3 rounded-3xl border border-[#D4C9B9] bg-[#F0E8DA] -rotate-1 pointer-events-none"
            />

            <div className="relative overflow-hidden rounded-2xl border border-[#D4C9B9] bg-[#F8F3EA] shadow-xl">
              {!imgError ? (
                <Image
                  src="/images/demo-projects/foodiehub/story-kitchen.jpg"
                  alt="Chefs in an artisan kitchen carefully assembling fine dining dishes"
                  width={800}
                  height={600}
                  onError={() => setImgError(true)}
                  className="h-[380px] sm:h-[450px] w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                />
              ) : (
                <div className="flex h-[380px] sm:h-[450px] w-full flex-col items-center justify-center bg-[#F0E8DA] p-8 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F8F3EA] text-[#B85C38] shadow-sm mb-3">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <span className="font-serif text-xl font-bold text-[#24221F]">The Kitchen Atelier</span>
                  <span className="text-xs uppercase tracking-widest text-[#6B6560] mt-1">Artisanal Preparation</span>
                </div>
              )}
            </div>

            {/* Overlaid Chef's Quote Card */}
            <div className="absolute -bottom-8 right-4 sm:right-6 max-w-xs sm:max-w-sm rounded-2xl border border-[#D4C9B9] bg-[#F8F3EA] p-5 shadow-xl backdrop-blur-md">
              <span className="font-serif text-3xl font-bold text-[#C4964C] leading-none">“</span>
              <p className="mt-1 font-serif italic text-xs sm:text-sm text-[#24221F] leading-relaxed">
                We do not cook to reinvent memory; we cook to suspend time and return to the generosity of the open hearth.
              </p>
              <div className="mt-3 flex items-center justify-between border-t border-[#D4C9B9]/60 pt-2 text-[10px] uppercase tracking-wider text-[#6B6560]">
                <span className="font-semibold text-[#24221F]">Kabir Sengupta</span>
                <span className="text-[#B85C38]">Executive Chef</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Editorial Narrative */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-6 pt-4 lg:pt-0"
          >
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-[#6B6560]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#B85C38]" />
              <span>Our Culinary Philosophy</span>
            </div>

            <h2
              id="story-heading"
              className="mt-4 font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#24221F] leading-[1.14]"
            >
              Rooted in Tradition. <br />
              <span className="italic font-normal text-[#B85C38]">Crafted for Today.</span>
            </h2>

            <p className="mt-6 text-base sm:text-lg text-[#6B6560] leading-relaxed">
              At Saffron & Stone, every recipe begins where haste ends. We honour the quiet
              intelligence of age-old culinary rituals—the gentle sizzle of mustard seeds in
              cast iron, the fragrant steam released from a dough-sealed clay pot, and the patient
              simmer of whole spices over dying charcoal embers.
            </p>

            <p className="mt-4 text-sm sm:text-base text-[#6B6560] leading-relaxed">
              Our tasting menus bring together the distinct micro-climates of India—from the
              wild morels of Jammu to the cold-pressed coconut gravies of the Malabar coast.
              Each dish is served in bespoke hand-spun pottery, inviting guests to slow down,
              reconnect, and celebrate the unhurried dinner.
            </p>

            {/* Three Pillar Cards */}
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {commitments.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="rounded-xl border border-[#D4C9B9] bg-[#F8F3EA] p-4 shadow-sm"
                  >
                    <Icon className="h-5 w-5 text-[#B85C38]" />
                    <h3 className="mt-2.5 font-serif text-sm font-bold text-[#24221F]">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-xs text-[#6B6560] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Read tasting menu link */}
            <div className="mt-9">
              <a
                href="#menu"
                className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#B85C38] transition-colors hover:text-[#9E4826]"
              >
                <span>View Autumn & Winter Menu</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
