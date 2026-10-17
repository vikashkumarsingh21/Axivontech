"use client";

import React, { useState } from "react";
import { FacilityArea } from "./types";
import { FITZONE_FACILITIES } from "@/data/fitzone-data";
import {
  Building2,
  CheckCircle2,
  Maximize2,
  Dumbbell,
  Sparkles,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

export default function FitZoneGallery() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeFacility, setActiveFacility] = useState<FacilityArea | null>(null);

  const categories = ["All", "Weights", "Functional", "Recovery", "Combat"];

  const filteredFacilities =
    selectedCategory === "All"
      ? FITZONE_FACILITIES
      : FITZONE_FACILITIES.filter((f) => f.category === selectedCategory);

  return (
    <section
      id="facilities"
      className="relative w-full border-t border-[#2B3137] bg-[#0B0D0F] py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#FF7138]/30 bg-[#FF7138]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-[#FF7138] mb-3">
              <Building2 className="h-3.5 w-3.5" />
              <span>Campus & Pavilion Architecture</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-[#F6F4F0] leading-tight">
              21,900 SQ FT OF PURE <br />
              <span className="text-[#FF7138]">ATHLETIC ARCHITECTURE.</span>
            </h2>
          </div>

          <p className="max-w-md text-sm text-[#B5BBC2] leading-relaxed">
            Acoustically isolated lifting platforms, high-airflow HVAC systems,
            sub-zero titanium chillers, and zero crowding bottlenecks.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2.5 mb-10">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                  isActive
                    ? "bg-[#FF7138] text-[#0B0D0F] shadow-lg shadow-[#FF7138]/25 scale-105"
                    : "border border-[#2B3137] bg-[#171B1F] text-[#B5BBC2] hover:border-[#FF7138]/50 hover:text-white"
                }`}
              >
                {cat === "All" ? "All Pavilions" : cat}
              </button>
            );
          })}
        </div>

        {/* Facilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredFacilities.map((facility) => (
            <div
              key={facility.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#2B3137] bg-[#171B1F] p-7 sm:p-8 transition-all duration-300 hover:border-[#FF7138] hover:bg-[#20252A] hover:shadow-2xl hover:shadow-[#FF7138]/10"
            >
              <div>
                {/* Top Meta */}
                <div className="flex items-center justify-between mb-4">
                  <span className="rounded-full bg-[#FF7138]/15 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#FF7138] border border-[#FF7138]/30">
                    {facility.category} Pavilion
                  </span>
                  <span className="font-mono text-xs font-bold text-[#F6F4F0] bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                    {facility.sqFt.toLocaleString()} SQ FT
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#F6F4F0] group-hover:text-[#FF7138] transition-colors">
                  {facility.title}
                </h3>

                {/* Description */}
                <p className="mt-3 text-xs sm:text-sm text-[#B5BBC2] leading-relaxed">
                  {facility.description}
                </p>

                {/* Highlights */}
                <div className="mt-6 space-y-2 pt-6 border-t border-[#2B3137]">
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#858D96]">
                    Architectural Highlights:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {facility.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-[#F6F4F0]">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#FF7138] shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Equipment List */}
                <div className="mt-5 space-y-2">
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#858D96]">
                    Equipment Deployed:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {facility.equipmentList.map((eq, i) => (
                      <span
                        key={i}
                        className="rounded-lg bg-[#0B0D0F] border border-white/5 px-2.5 py-1 text-[11px] text-[#B5BBC2]"
                      >
                        {eq}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Strip */}
              <div className="mt-6 pt-4 border-t border-[#2B3137] flex items-center justify-between text-xs text-[#858D96]">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#48D597]" />
                  <span>Sanitized Hourly &bull; HEPA Filtered</span>
                </span>
                <span className="font-semibold text-[#FF7138]">Open 24/7 for Pro Tiers</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
