"use client";

import React from "react";
import Image from "next/image";
import { Utensils, Sparkles, Sprout, Wine, Coffee } from "lucide-react";

export default function SolaraDining() {
  const venues = [
    {
      name: "The Harvest Table",
      type: "Main Restaurant · Farm-to-Table Organic",
      timings: "Breakfast: 7:30 – 10:30 AM | Dinner: 7:00 – 10:30 PM",
      description:
        "Every dish begins in our certified organic kitchen gardens. Featuring slow-cooked heritage grains, wood-fired sourdough, cold-pressed oils, and artisanal cheeses crafted by local Nilgiri cheesemakers.",
      signature: "Smoked Beetroot & Jackfruit Carpaccio with Wild Thyme Dressing",
    },
    {
      name: "Twilight Botanical Lounge",
      type: "Open-Air Pavilion · Herbal Infusions & Artisanal Brews",
      timings: "4:00 PM – 11:00 PM (Sunset Hours)",
      description:
        "Watch the twilight settle over the mountain peaks while sipping on adaptogenic herbal teas, single-origin Nilgiri estate coffees, and handcrafted zero-proof botanical tonics.",
      signature: "Elderflower & Mountain Honey Spritzer with Fresh Rosemary",
    },
    {
      name: "In-Villa Starlit Dining",
      type: "Private Dining Experience",
      timings: "Upon Advance Reservation (7:30 PM onwards)",
      description:
        "A private chef and butler create a tailored 5-course degustation menu on your villa's private timber deck, illuminated by brass lanterns and mountain constellations.",
      signature: "Clay-Pot Braised Forest Mushrooms with Heirloom Black Rice",
    },
  ];

  return (
    <section id="dining" className="py-20 bg-[#faf8f5] text-[#1b1916] border-b border-[#dfd7cc]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Visual Culinary Atmosphere */}
          <div className="lg:col-span-5">
            <div className="relative aspect-[4/3] w-full rounded-3xl overflow-hidden border-4 border-[#faf8f5] shadow-xl bg-[#1f2e23]">
              <Image
                src="/demo-assets/hospitality/solara/harvest-dining.webp"
                alt="The Harvest Table Farm-to-Table Restaurant at Solara"
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </div>

            <div className="mt-6 rounded-2xl border border-[#dfd7cc] bg-[#f5efeb] p-6 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#b57a42] mb-1">
                <Sprout className="h-4 w-4" />
                <span>Zero Kilometre Agriculture</span>
              </div>
              <h4 className="font-serif text-lg font-bold text-[#1f2e23]">
                Estate Kitchen Gardens
              </h4>
              <p className="mt-2 text-xs leading-relaxed text-[#6b665f]">
                Over 85% of greens, root vegetables, edible flowers, and herbs served at Solara are harvested fresh each morning within 300 meters of the dining room.
              </p>
            </div>
          </div>

          {/* Right Column: Dining Venues */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#1f2e23]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-[#1f2e23] mb-3">
              <Utensils className="h-3.5 w-3.5 text-[#b57a42]" />
              <span>Conscious Gastronomy</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1f2e23]">
              A Celebration of Nilgiri Earth, Soil &amp; Seasonality
            </h2>

            <p className="mt-4 text-xs sm:text-sm leading-relaxed text-[#6b665f]">
              Dining at Solara is deeply nourishing and unhurried. Our culinary philosophy marries centuries-old regional cooking traditions with modern wellness nutrition.
            </p>

            <div className="mt-8 space-y-6">
              {venues.map((venue, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-[#dfd7cc] bg-[#f5efeb] p-6 transition-all hover:border-[#b57a42]/40"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                    <h3 className="font-serif text-xl font-bold text-[#1f2e23]">
                      {venue.name}
                    </h3>
                    <span className="text-[11px] font-medium text-[#b57a42]">
                      {venue.timings}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-[#1f2e23] mb-2">
                    {venue.type}
                  </p>

                  <p className="text-xs leading-relaxed text-[#6b665f]">
                    {venue.description}
                  </p>

                  <div className="mt-3 pt-3 border-t border-[#dfd7cc] text-[11px] text-[#3b3630]">
                    <strong className="text-[#b57a42]">Chef&apos;s Signature:</strong> {venue.signature}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
