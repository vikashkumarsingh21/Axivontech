"use client";

import React, { useState } from "react";
import {
  Compass,
  MapPin,
  Trees,
  Footprints,
  Train,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Building2,
} from "lucide-react";
import { NEIGHBORHOOD_GUIDES } from "@/data/estatevista-properties";
import { NeighborhoodGuide } from "./types";

interface EstateVistaNeighborhoodsProps {
  onSelectNeighborhoodFilter: (neighborhoodName: string) => void;
}

export default function EstateVistaNeighborhoods({
  onSelectNeighborhoodFilter,
}: EstateVistaNeighborhoodsProps) {
  const [selectedId, setSelectedId] = useState(NEIGHBORHOOD_GUIDES[0].id);

  const selectedGuide =
    NEIGHBORHOOD_GUIDES.find((g) => g.id === selectedId) || NEIGHBORHOOD_GUIDES[0];

  return (
    <section
      id="neighborhoods"
      className="py-16 sm:py-24 bg-[#F9F8F5] border-b border-[#E4E0D7] relative"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        {/* Section Heading */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[#C59B63] mb-2">
            <Compass className="h-3 w-3" />
            <span>Curated Enclave Explorer</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-[#1A211E]">
            Prime Enclaves & Micro-Markets
          </h2>
          <p className="text-sm text-[#5C6661] mt-2 leading-relaxed">
            Examine privacy ratings, architectural zoning guidelines, walkability indices, and
            market valuations across premier coastal, metropolitan, and hillside sanctuaries.
          </p>
        </div>

        {/* ── Neighborhood Selector Buttons ─────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {NEIGHBORHOOD_GUIDES.map((guide) => {
            const isSelected = selectedId === guide.id;
            return (
              <button
                key={guide.id}
                type="button"
                onClick={() => setSelectedId(guide.id)}
                className={`flex flex-col text-left p-4 rounded-xl border transition-all ${
                  isSelected
                    ? "border-[#123C32] bg-white shadow-xs ring-1 ring-[#123C32]"
                    : "border-[#E4E0D7] bg-[#F1EFEA]/60 hover:bg-white hover:border-[#123C32]/30"
                }`}
              >
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#C59B63] mb-1">
                  <MapPin className="h-3 w-3" />
                  <span>{guide.city}</span>
                </div>
                <h4 className="font-serif text-base font-bold text-[#1A211E] tracking-tight">
                  {guide.name}
                </h4>
                <div className="text-[11px] font-medium text-[#7C8882] mt-2">
                  Avg. ${guide.avgPricePerSqFt.toLocaleString()} / sq.ft
                </div>
              </button>
            );
          })}
        </div>

        {/* ── Detailed Neighborhood Dossier Card ────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 rounded-2xl border border-[#E4E0D7] bg-white p-6 sm:p-8 lg:p-10 shadow-sm">
          {/* Left Column: Narrative & Metrics */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#C59B63] mb-1">
                {selectedGuide.city}
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A211E]">
                {selectedGuide.name}
              </h3>
              <p className="text-sm font-serif italic text-[#123C32] mt-1">
                &ldquo;{selectedGuide.vibe}&rdquo;
              </p>
            </div>

            <p className="text-sm text-[#5C6661] leading-relaxed">
              {selectedGuide.description}
            </p>

            {/* Scorecard Strip */}
            <div className="grid grid-cols-3 gap-3 rounded-xl border border-[#E4E0D7] bg-[#F9F8F5] p-4 text-center">
              <div>
                <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-bold text-[#7C8882] mb-1">
                  <Footprints className="h-3 w-3 text-[#123C32]" />
                  <span>WalkScore</span>
                </div>
                <div className="font-serif text-2xl font-bold text-[#123C32]">
                  {selectedGuide.walkScore}
                  <span className="text-xs text-[#7C8882] font-normal"> / 100</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-bold text-[#7C8882] mb-1">
                  <Train className="h-3 w-3 text-[#123C32]" />
                  <span>TransitScore</span>
                </div>
                <div className="font-serif text-2xl font-bold text-[#123C32]">
                  {selectedGuide.transitScore}
                  <span className="text-xs text-[#7C8882] font-normal"> / 100</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-bold text-[#7C8882] mb-1">
                  <Trees className="h-3 w-3 text-[#2E6B56]" />
                  <span>Greenery</span>
                </div>
                <div className="font-serif text-2xl font-bold text-[#2E6B56]">
                  {selectedGuide.greeneryScore}
                  <span className="text-xs text-[#7C8882] font-normal"> / 100</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => onSelectNeighborhoodFilter(selectedGuide.name)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#123C32] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#0D2D25] transition-all"
              >
                <span>View Available Residences in {selectedGuide.name}</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#C59B63]" />
              </button>
            </div>
          </div>

          {/* Right Column: Highlights & Key Attractions */}
          <div className="lg:col-span-5 space-y-6 lg:border-l lg:border-[#E4E0D7] lg:pl-8">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#123C32] mb-3">
                Signature District Highlights
              </h4>
              <div className="space-y-2">
                {selectedGuide.highlights.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-[#5C6661]">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#2E6B56] shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#123C32] mb-3">
                Landmarks & Private Clubs
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedGuide.keyAttractions.map((attraction, idx) => (
                  <span
                    key={idx}
                    className="rounded-lg bg-[#F9F8F5] border border-[#E4E0D7] px-3 py-1.5 text-xs font-medium text-[#1A211E]"
                  >
                    {attraction}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-[#C59B63]/25 bg-[#C59B63]/10 p-4 text-xs text-[#123C32]">
              <span className="font-bold block mb-1">Executive Advisory Concierge:</span>
              <span>
                Our local district managing partners provide private helicopter and maritime tours
                for qualified prospective buyers.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
