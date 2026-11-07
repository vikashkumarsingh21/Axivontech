"use client";

import React from "react";
import { MapPin, Navigation, Plane, Car, Compass } from "lucide-react";

export default function SolaraLocation() {
  return (
    <section id="location" className="py-20 bg-[#f5efeb] text-[#1b1916] border-b border-[#dfd7cc]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-[#b57a42]">
            The Journey &amp; Seclusion
          </span>
          <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-bold text-[#1f2e23]">
            Getting to Solara Retreat &amp; Resort
          </h2>
          <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#6b665f]">
            Located at an elevation of 1,850 meters in the Nilgiri Biosphere, the ascent to Solara transitions through fragrant coffee estates, tea terracing, and tropical rainforest.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-3xl border border-[#dfd7cc] bg-[#faf8f5] p-8 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1f2e23] text-[#c48b56] mb-5">
              <Plane className="h-5 w-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#1f2e23]">
              From Coimbatore Airport (CJB)
            </h3>
            <p className="text-xs font-semibold text-[#b57a42] mt-0.5">
              2 Hours 30 Minutes (92 km)
            </p>
            <p className="mt-3 text-xs leading-relaxed text-[#6b665f]">
              The most convenient flight connection. Solara’s private luxury chauffeur team meets all guests at arrivals with air-conditioned executive SUVs.
            </p>
          </div>

          <div className="rounded-3xl border border-[#dfd7cc] bg-[#faf8f4] p-8 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1f2e23] text-[#c48b56] mb-5">
              <Car className="h-5 w-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#1f2e23]">
              From Bangalore (Kempegowda / City)
            </h3>
            <p className="text-xs font-semibold text-[#b57a42] mt-0.5">
              4 Hours 45 Minutes (245 km)
            </p>
            <p className="mt-3 text-xs leading-relaxed text-[#6b665f]">
              A scenic road expedition through the Mysore heritage corridor and the Bandipur forest route, ascending through 36 hairpin mountain bends.
            </p>
          </div>

          <div className="rounded-3xl border border-[#dfd7cc] bg-[#faf8f4] p-8 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1f2e23] text-[#c48b56] mb-5">
              <Compass className="h-5 w-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#1f2e23]">
              Private Helipad Charter (VOSR)
            </h3>
            <p className="text-xs font-semibold text-[#b57a42] mt-0.5">
              35 Minutes from Bengaluru / 20 Mins CJB
            </p>
            <p className="mt-3 text-xs leading-relaxed text-[#6b665f]">
              Direct twin-engine helicopter charters land on Solara’s private mountain helipad with seamless luxury buggy transfer directly to your villa.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
