"use client";

import React, { useState } from "react";
import Image from "next/image";
import { VillaAccommodation } from "./types";
import { CheckCircle2, Maximize, Users, BedDouble, ArrowRight, X, Sparkles } from "lucide-react";

interface AccommodationsProps {
  onSelectVilla: (villaName: string) => void;
}

export default function SolaraAccommodations({ onSelectVilla }: AccommodationsProps) {
  const accommodations: VillaAccommodation[] = [
    {
      id: "forest-villa",
      name: "The Forest Villa with Private Plunge Pool",
      category: "Private Villa",
      area: "1,450 sq.ft (135 sq.m)",
      occupancy: "2 to 3 Guests",
      bedType: "Custom Teak King Bed",
      pricePerNight: "INR 32,000 / Night",
      tagline: "Total Privacy Amid Virgin Forest Canopy",
      description:
        "Tucked into the ancient rainforest, this villa features an expansive hardwood sundeck, a heated volcanic stone infinity plunge pool, open-air rainwater shower, and floor-to-ceiling glass pavilions.",
      image: "/demo-assets/hospitality/solara/villa-plunge-pool.webp",
      features: [
        "Private heated volcanic stone plunge pool overlooking valley",
        "Open-air stone bathtub and dual rainfall showers",
        "Wraparound teak timber sun deck with daybed lounger",
        "Bespoke organic linen and chemical-free hypoallergenic mattresses",
        "Complimentary high-speed Starlink Wi-Fi for remote executive stays",
      ],
      inclusions: [
        "Artisanal farm-to-table breakfast at The Harvest Table",
        "Guided morning bird-watching and biodiversity walk",
        "Afternoon botanical tea and single-origin coffee service",
        "20% courtesy privilege on all Ayurvedic spa rituals",
      ],
    },
    {
      id: "canopy-suite",
      name: "The Canopy Valley Suite",
      category: "Canopy Suite",
      area: "950 sq.ft (88 sq.m)",
      occupancy: "2 Guests",
      bedType: "California King Bed",
      pricePerNight: "INR 24,000 / Night",
      tagline: "Panoramic Nilgiri Mountain Vistas & Sunset Lounge",
      description:
        "Perched high above the valley floor on structural stilts, the Canopy Suite offers birds-eye perspectives of drifting mountain clouds, a sunset-facing cedar balcony, and an en-suite soaking tub.",
      image: "/demo-assets/hospitality/solara/canopy-suite.webp",
      features: [
        "Floor-to-ceiling panoramic glass facade with automated linen curtains",
        "Private sunset cedar balcony with telescope mount",
        "En-suite deep soaking tub with botanical bath infusions",
        "Curated in-room espresso machine and organic leaf tea station",
        "Sonos acoustic sound system with curated ambient forest playlists",
      ],
      inclusions: [
        "Farm-to-table gourmet breakfast for two",
        "Complimentary guided evening astronomy & stargazing session",
        "Daily mineral water and estate botanical infusions",
      ],
    },
    {
      id: "heritage-cottage",
      name: "The Heritage Courtyard Cottage",
      category: "Heritage Cottage",
      area: "820 sq.ft (76 sq.m)",
      occupancy: "2 to 4 Guests (Family Friendly)",
      bedType: "King Bed + Twin Daybeds",
      pricePerNight: "INR 22,000 / Night",
      tagline: "Traditional Malabar Stone Architecture & Frangipani Garden",
      description:
        "Rooted in classical stone and clay-tile craftsmanship, this cottage opens onto a private courtyard garden with brass water basins, exposed teak roof beams, and peaceful indoor-outdoor living.",
      image: "/demo-assets/hospitality/solara/hero-resort.webp",
      features: [
        "Private walled courtyard garden with flowering frangipani",
        "Hand-carved reclaimed teakwood furniture and brass lanterns",
        "Interconnecting option available for families traveling with children",
        "Private reading verandah with cane plantation armchairs",
      ],
      inclusions: [
        "Organic breakfast banquet for all registered guests",
        "Daily tea plantation walk and traditional pottery workshop",
      ],
    },
    {
      id: "glamping-pavilion",
      name: "Riverside Glamping Pavilion",
      category: "Glamping",
      area: "650 sq.ft (60 sq.m)",
      occupancy: "2 Guests",
      bedType: "Luxury Queen Bed",
      pricePerNight: "INR 18,000 / Night",
      tagline: "Immersive Canvas Luxury Beside the Mountain Brook",
      description:
        "Experience the true sound of running river water under heavy triple-layered safari canvas. Features polished rosewood flooring, full en-suite stone bathroom, and a riverfront campfire pit.",
      image: "/demo-assets/hospitality/solara/canopy-suite.webp",
      features: [
        "Weatherproof insulated safari canvas structure on raised platform",
        "Riverside timber deck with private evening firepit setup",
        "Full private bathroom with hot rainfall shower",
        "Heated blanket options for crisp mountain evenings",
      ],
      inclusions: [
        "Riverside sunrise breakfast picnic basket",
        "Complimentary evening bonfire and stargazing setup",
      ],
    },
  ];

  const [activeModal, setActiveModal] = useState<VillaAccommodation | null>(null);

  return (
    <section id="accommodations" className="py-20 bg-[#f5efeb] text-[#1b1916] border-b border-[#dfd7cc]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-[#b57a42]">
            Ecological Luxury Living
          </span>
          <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-bold text-[#1f2e23]">
            Eighteen Private Mountain Sanctuaries
          </h2>
          <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#6b665f]">
            Each residence at Solara has been carefully sited to preserve the natural forest canopy while maximizing seclusion, mountain airflow, and panoramic wilderness views.
          </p>
        </div>

        {/* Villa Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {accommodations.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl border border-[#dfd7cc] bg-[#faf8f5] overflow-hidden shadow-sm transition-all hover:shadow-md hover:border-[#b57a42]/40 flex flex-col justify-between"
            >
              <div>
                {/* Image */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#1f2e23]">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover object-center transition-transform duration-500 hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute top-4 left-4 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-[11px] font-semibold text-[#faf8f5] border border-white/20">
                    {item.category}
                  </div>
                  <div className="absolute bottom-4 right-4 rounded-full bg-[#1f2e23]/90 backdrop-blur-md px-3 py-1 text-xs font-bold text-[#c48b56]">
                    {item.pricePerNight}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 sm:p-8">
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1f2e23]">
                    {item.name}
                  </h3>
                  <p className="text-xs font-semibold text-[#b57a42] mt-1">
                    {item.tagline}
                  </p>

                  <p className="mt-3 text-xs sm:text-sm leading-relaxed text-[#6b665f] line-clamp-2">
                    {item.description}
                  </p>

                  {/* Quick specs */}
                  <div className="mt-5 grid grid-cols-3 gap-2 border-y border-[#ede5db] py-3 text-xs text-[#6b665f]">
                    <div className="flex items-center gap-1.5">
                      <Maximize className="h-3.5 w-3.5 text-[#b57a42]" />
                      <span className="truncate">{item.area}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-[#b57a42]" />
                      <span className="truncate">{item.occupancy}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <BedDouble className="h-3.5 w-3.5 text-[#b57a42]" />
                      <span className="truncate">{item.bedType}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 sm:p-8 pt-0 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => setActiveModal(item)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#1f2e23] hover:text-[#b57a42] transition-colors"
                >
                  <span>View Villa Dossier</span>
                  <ArrowRight className="h-3 w-3" />
                </button>

                <button
                  onClick={() => onSelectVilla(item.name)}
                  className="rounded-full bg-[#1f2e23] px-5 py-2 text-xs font-bold text-[#faf8f5] hover:bg-[#283d2e] transition-colors"
                >
                  Reserve This Stay
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Villa Modal Details */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[#b57a42]/40 bg-[#faf8f5] p-6 sm:p-8 shadow-2xl text-[#1b1916]">
            <div className="flex items-center justify-between border-b border-[#dfd7cc] pb-4 mb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#b57a42]">
                  {activeModal.category}
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#1f2e23]">
                  {activeModal.name}
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="rounded-lg p-1.5 text-[#6b665f] hover:bg-[#ede5db] hover:text-[#1b1916]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-[#6b665f]">
              <p className="leading-relaxed">{activeModal.description}</p>

              <div className="grid grid-cols-2 gap-3 border-y border-[#ede5db] py-3 text-xs">
                <div>
                  <strong className="text-[#1f2e23] block">Floor Area:</strong>
                  <span>{activeModal.area}</span>
                </div>
                <div>
                  <strong className="text-[#1f2e23] block">Sleeping Configuration:</strong>
                  <span>{activeModal.bedType}</span>
                </div>
              </div>

              <div>
                <strong className="text-[#1f2e23] block mb-2 font-serif text-sm">
                  Architectural Features &amp; Finishes:
                </strong>
                <div className="space-y-1.5">
                  {activeModal.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-[#3b3630]">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#b57a42] shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-[#ede5db] p-4 text-xs">
                <strong className="text-[#1f2e23] block mb-1.5 font-serif text-sm flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-[#b57a42]" />
                  <span>Complimentary Curated Inclusions:</span>
                </strong>
                <ul className="list-disc pl-5 space-y-1 text-[#4a443c]">
                  {activeModal.inclusions.map((inc, i) => (
                    <li key={i}>{inc}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#dfd7cc] flex items-center justify-between">
              <span className="font-serif text-base font-bold text-[#1f2e23]">
                {activeModal.pricePerNight}
              </span>
              <button
                onClick={() => {
                  const name = activeModal.name;
                  setActiveModal(null);
                  onSelectVilla(name);
                }}
                className="rounded-full bg-[#b57a42] px-6 py-2.5 text-xs font-bold text-[#faf8f5] hover:bg-[#c98b56]"
              >
                Inquire For This Villa
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
