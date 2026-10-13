"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";

export default function FoodieHubStory() {
  return (
    <section
      id="story"
      aria-labelledby="story-heading"
      className="relative border-y border-[#E8DFC9] bg-white py-16 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left: Imagery of artisan kitchen preparation */}
          <div className="relative lg:col-span-6">
            <div className="relative overflow-hidden rounded-2xl border border-[#E8DFC9] shadow-xl">
              <Image
                src="/images/demo-projects/foodiehub/story-kitchen.jpg"
                alt="Chefs at work in a bright, modern culinary kitchen preparing fresh regional ingredients"
                width={800}
                height={600}
                className="h-[360px] sm:h-[420px] w-full object-cover transition-transform duration-700 hover:scale-[1.02]"
              />
            </div>
            {/* Small decorative pill badge */}
            <div className="absolute -bottom-4 right-6 rounded-full bg-[#F8F3EA] px-4 py-2 text-xs font-semibold uppercase tracking-widest text-[#24221F] shadow-md border border-[#E0D4BE]">
              Culinary Craftsmanship
            </div>
          </div>

          {/* Right: Narrative */}
          <div className="lg:col-span-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-[#68735A]">
              <Sparkles className="h-3.5 w-3.5 text-[#B85C38]" />
              <span>Our Story</span>
            </div>

            <h2
              id="story-heading"
              className="mt-4 font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#24221F] leading-tight"
            >
              Rooted in Tradition. Made for Today.
            </h2>

            <p className="mt-6 text-base sm:text-lg text-[#24221F]/80 leading-relaxed">
              Our kitchen draws inspiration from familiar flavours, thoughtful ingredients,
              and the simple pleasure of sharing a good meal. At Saffron & Stone, every recipe
              reveres centuries-old Indian culinary wisdom while presenting each course with
              contemporary finesse.
            </p>

            <p className="mt-4 text-base text-[#24221F]/70 leading-relaxed">
              From slow charcoal embers to freshly ground stone spices and fragrant Kashmiri
              saffron, we celebrate the purity of real cooking. No shortcuts, no compromises—just
              unhurried moments celebrated around warm plates.
            </p>

            <div className="mt-8 flex items-center gap-6">
              <a
                href="#menu"
                className="group inline-flex items-center gap-2 font-serif text-base font-semibold text-[#B85C38] transition-colors hover:text-[#8E4324]"
              >
                <span>Discover the tasting menu</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
