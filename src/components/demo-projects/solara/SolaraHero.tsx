"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ArrowRight, Sparkles, Calendar, Users, Home, Award } from "lucide-react";

interface HeroProps {
  onCheckAvailability: (dates: { checkIn: string; checkOut: string; villa: string; guests: string }) => void;
  onExploreVillas: () => void;
}

export default function SolaraHero({ onCheckAvailability, onExploreVillas }: HeroProps) {
  const [checkIn, setCheckIn] = useState("2026-12-10");
  const [checkOut, setCheckOut] = useState("2026-12-14");
  const [villa, setVilla] = useState("The Forest Villa with Private Plunge Pool");
  const [guests, setGuests] = useState("2 Guests");

  const handleBarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCheckAvailability({ checkIn, checkOut, villa, guests });
  };

  return (
    <section id="hero" className="relative overflow-hidden bg-[#1f2e23] text-[#f5efeb] py-20 sm:py-28 lg:py-36">
      {/* Background Resort Landscape */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/demo-assets/hospitality/solara/hero-resort.webp"
          alt="Solara Retreat & Resort Landscape Amid Nilgiri Rainforest"
          fill
          priority
          className="object-cover object-center opacity-35 mix-blend-luminosity scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#121c15] via-[#1f2e23]/85 to-[#1f2e23]/70" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#b57a42]/40 bg-[#142018]/90 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#c48b56] shadow-sm mb-6">
            <Sparkles className="h-3.5 w-3.5 text-[#c48b56]" />
            <span>Luxury Nature Sanctuary · Nilgiri Foothills</span>
          </div>

          {/* Heading */}
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#f5efeb] leading-[1.15]">
            Where Mountain Mist Meets <br />
            <span className="text-[#c48b56] italic">Timeless Ecological Luxury.</span>
          </h1>

          {/* Subheading */}
          <p className="mt-6 text-base sm:text-lg leading-relaxed text-[#d4cdc5] max-w-2xl font-light">
            Solara is an intimate 45-acre mountain sanctuary in the Western Ghats. Reconnect with pristine silence across eighteen private plunge-pool villas, farm-to-table organic dining, and authentic Ayurvedic therapies.
          </p>

          {/* Action Button */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={onExploreVillas}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#b57a42] px-7 py-3.5 text-sm font-bold text-[#faf8f5] shadow-lg shadow-[#b57a42]/20 transition-all hover:bg-[#c98b56] hover:scale-105 active:scale-95"
            >
              <span>Explore Accommodations</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Floating Booking Strip ────────────────────────────────────── */}
        <div className="mt-14 rounded-2xl border border-[#b57a42]/30 bg-[#162219]/95 p-5 sm:p-6 shadow-2xl backdrop-blur-md">
          <form onSubmit={handleBarSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#c48b56] mb-1.5">
                Check-in Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-white/10 px-3.5 py-2.5 text-xs text-[#faf8f5] focus:outline-none focus:ring-1 focus:ring-[#b57a42]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#c48b56] mb-1.5">
                Check-out Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-white/10 px-3.5 py-2.5 text-xs text-[#faf8f5] focus:outline-none focus:ring-1 focus:ring-[#b57a42]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#c48b56] mb-1.5">
                Villa Category
              </label>
              <select
                value={villa}
                onChange={(e) => setVilla(e.target.value)}
                className="w-full rounded-xl border border-white/20 bg-[#162219] px-3.5 py-2.5 text-xs text-[#faf8f5] focus:outline-none focus:ring-1 focus:ring-[#b57a42]"
              >
                <option value="The Forest Villa with Private Plunge Pool">Forest Villa (Pool)</option>
                <option value="The Canopy Valley Suite">Canopy Valley Suite</option>
                <option value="The Heritage Courtyard Cottage">Heritage Cottage</option>
                <option value="Riverside Glamping Pavilion">Glamping Pavilion</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#c48b56] mb-1.5">
                Guests
              </label>
              <select
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="w-full rounded-xl border border-white/20 bg-[#162219] px-3.5 py-2.5 text-xs text-[#faf8f5] focus:outline-none focus:ring-1 focus:ring-[#b57a42]"
              >
                <option value="1 Guest">1 Adult</option>
                <option value="2 Guests">2 Adults (Couple)</option>
                <option value="3 Guests">2 Adults + 1 Child</option>
                <option value="4 Guests">4 Adults (Family)</option>
              </select>
            </div>

            <div>
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#b57a42] py-3 text-xs font-bold text-[#faf8f5] hover:bg-[#c98b56] transition-colors shadow-md"
              >
                <Calendar className="h-4 w-4" />
                <span>Check Availability</span>
              </button>
            </div>
          </form>
        </div>

        {/* Quick Highlights Row */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-white/10 pt-8 text-xs text-[#d4cdc5]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#b57a42]/20 text-[#c48b56]">
              <Home className="h-4 w-4" />
            </div>
            <div>
              <span className="block font-bold text-[#faf8f5] text-sm">45-Acre</span>
              <span>Virgin Rainforest</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#b57a42]/20 text-[#c48b56]">
              <Award className="h-4 w-4" />
            </div>
            <div>
              <span className="block font-bold text-[#faf8f5] text-sm">18 Villas</span>
              <span>Low-Density Luxury</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#b57a42]/20 text-[#c48b56]">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <span className="block font-bold text-[#faf8f5] text-sm">100% Organic</span>
              <span>Farm-to-Table Cuisine</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#b57a42]/20 text-[#c48b56]">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <span className="block font-bold text-[#faf8f5] text-sm">Ayurvedic Spa</span>
              <span>Master Practitioners</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
