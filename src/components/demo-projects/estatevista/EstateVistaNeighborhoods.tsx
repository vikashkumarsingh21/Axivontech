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

const NEIGHBORHOOD_IMAGES: Record<string, string> = {
  "hillside-enclave": "/images/demo-projects/estatevista/neighborhood-hillside.svg",
  "metropolitan-tech-core": "/images/demo-projects/estatevista/neighborhood-metropolitan.svg",
  "waterfront-promenade": "/images/demo-projects/estatevista/neighborhood-waterfront.svg",
  "diplomatic-quarter": "/images/demo-projects/estatevista/neighborhood-diplomatic.svg",
};

export default function EstateVistaNeighborhoods({
  onSelectNeighborhoodFilter,
}: EstateVistaNeighborhoodsProps) {
  const [selectedId, setSelectedId] = useState(NEIGHBORHOOD_GUIDES[0].id);

  const selectedGuide =
    NEIGHBORHOOD_GUIDES.find((g) => g.id === selectedId) || NEIGHBORHOOD_GUIDES[0];

  return (
    <section
      id="neighborhoods"
      className="py-16 sm:py-24 bg-[#E6E0D4] border-b border-[#D5CEC1] relative"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[#B89A63] mb-2">
            <Compass className="h-3 w-3" />
            <span>Curated Enclave Explorer</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-[#222A25]">
            Prime Enclaves & Micro-Markets
          </h2>
          <p className="text-sm text-[#626B63] mt-2 leading-relaxed">
            Examine privacy ratings, architectural zoning guidelines, walkability indices, and
            market valuations across premier coastal, metropolitan, and hillside sanctuaries.
          </p>
        </div>

        {/* ── Neighborhood Selector Cards Grid with Photography ─────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {NEIGHBORHOOD_GUIDES.map((guide) => {
            const isSelected = selectedId === guide.id;
            const imgSrc = NEIGHBORHOOD_IMAGES[guide.id] || "/images/demo-projects/estatevista/neighborhood-hillside.svg";

            return (
              <button
                key={guide.id}
                type="button"
                onClick={() => setSelectedId(guide.id)}
                className={`group relative flex flex-col overflow-hidden text-left rounded-2xl border transition-all ${
                  isSelected
                    ? "border-[#153D32] bg-[#FAF8F2] shadow-md ring-2 ring-[#153D32]"
                    : "border-[#D5CEC1] bg-[#FAF8F2]/70 hover:bg-[#FAF8F2] hover:border-[#153D32]/40"
                }`}
              >
                {/* Photo Thumbnail */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#102C25]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imgSrc}
                    alt={guide.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#102C25]/80 via-transparent to-black/20" />
                  <div className="absolute bottom-2 left-3 right-3 text-white">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#B89A63]">
                      {guide.city.split("/")[0]}
                    </span>
                    <h4 className="font-serif text-sm font-bold text-[#FAF8F2] truncate">
                      {guide.name}
                    </h4>
                  </div>
                </div>

                <div className="p-3.5">
                  <div className="flex items-center justify-between text-[11px] font-medium text-[#7B817A]">
                    <span>Avg. Price / SQ FT</span>
                    <span className="font-bold text-[#153D32]">
                      ${guide.avgPricePerSqFt.toLocaleString()}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* ── Detailed Neighborhood Dossier Card ────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 rounded-3xl border border-[#D5CEC1] bg-[#FAF8F2] p-6 sm:p-8 lg:p-10 shadow-sm">
          {/* Left Column (7 Cols): Narrative, Photo & Scorecard */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#B89A63] mb-1">
                {selectedGuide.city}
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#222A25]">
                {selectedGuide.name}
              </h3>
              <p className="text-sm font-serif italic text-[#153D32] mt-1">
                &ldquo;{selectedGuide.vibe}&rdquo;
              </p>
            </div>

            {/* Large Enclave Landscape Photo */}
            <div className="relative aspect-[21/9] w-full rounded-2xl overflow-hidden bg-[#102C25] border border-[#D5CEC1]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={NEIGHBORHOOD_IMAGES[selectedGuide.id] || "/images/demo-projects/estatevista/neighborhood-hillside.svg"}
                alt={selectedGuide.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#102C25]/75 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-4 text-white text-xs font-serif italic">
                Enclave Atmosphere &bull; {selectedGuide.name}
              </div>
            </div>

            <p className="text-sm text-[#626B63] leading-relaxed">
              {selectedGuide.description}
            </p>

            {/* Scorecard Strip */}
            <div className="grid grid-cols-3 gap-3 rounded-xl border border-[#D5CEC1] bg-[#F0EDE5] p-4 text-center">
              <div>
                <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-bold text-[#7B817A] mb-1">
                  <Footprints className="h-3 w-3 text-[#153D32]" />
                  <span>WalkScore</span>
                </div>
                <div className="font-serif text-2xl font-bold text-[#153D32]">
                  {selectedGuide.walkScore}
                  <span className="text-xs text-[#7B817A] font-normal"> / 100</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-bold text-[#7B817A] mb-1">
                  <Train className="h-3 w-3 text-[#153D32]" />
                  <span>TransitScore</span>
                </div>
                <div className="font-serif text-2xl font-bold text-[#153D32]">
                  {selectedGuide.transitScore}
                  <span className="text-xs text-[#7B817A] font-normal"> / 100</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-bold text-[#7B817A] mb-1">
                  <Trees className="h-3 w-3 text-[#153D32]" />
                  <span>Greenery</span>
                </div>
                <div className="font-serif text-2xl font-bold text-[#153D32]">
                  {selectedGuide.greeneryScore}
                  <span className="text-xs text-[#7B817A] font-normal"> / 100</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => onSelectNeighborhoodFilter(selectedGuide.name)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#153D32] hover:bg-[#102C25] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-xs hover:shadow-md transition-all active:scale-[0.98]"
              >
                <span>View Available Residences in {selectedGuide.name}</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#B89A63]" />
              </button>
            </div>
          </div>

          {/* Right Column (5 Cols): Highlights & Key Attractions */}
          <div className="lg:col-span-5 space-y-6 lg:border-l lg:border-[#D5CEC1] lg:pl-8">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#153D32] mb-3">
                Signature District Highlights
              </h4>
              <div className="space-y-2.5">
                {selectedGuide.highlights.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs text-[#626B63]">
                    <CheckCircle2 className="h-4 w-4 text-[#153D32] shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#153D32] mb-3">
                Landmarks & Private Clubs
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedGuide.keyAttractions.map((attraction, idx) => (
                  <span
                    key={idx}
                    className="rounded-lg bg-[#F0EDE5] border border-[#D5CEC1] px-3 py-1.5 text-xs font-medium text-[#222A25]"
                  >
                    {attraction}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[#B89A63]/30 bg-[#F0EDE5] p-5 text-xs text-[#222A25] space-y-1.5">
              <span className="font-bold block text-[#153D32] uppercase tracking-wider">
                Executive Advisory Concierge:
              </span>
              <p className="text-[#626B63] leading-relaxed">
                Our district managing partners provide private helicopter and maritime charters
                for qualified prospective buyers visiting {selectedGuide.name}.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
