"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Camera, X, Maximize2 } from "lucide-react";

export default function SolaraGallery() {
  const photos = [
    {
      id: "sol-1",
      title: "Solara Main Mountain Pavilion & Reflection Pool",
      category: "Landscape",
      src: "/demo-assets/hospitality/solara/hero-resort.webp",
      desc: "Morning mist rising above the Shola valley and eco-villas.",
    },
    {
      id: "sol-2",
      title: "The Forest Villa Infinity Plunge Pool",
      category: "Villas",
      src: "/demo-assets/hospitality/solara/villa-plunge-pool.webp",
      desc: "Private heated pool deck looking directly into pristine rainforest.",
    },
    {
      id: "sol-3",
      title: "Canopy Valley Suite Teak Interior",
      category: "Villas",
      src: "/demo-assets/hospitality/solara/canopy-suite.webp",
      desc: "Spacious master bedroom with California king bed and mountain balcony.",
    },
    {
      id: "sol-4",
      title: "The Harvest Table Organic Dining Terrace",
      category: "Dining",
      src: "/demo-assets/hospitality/solara/harvest-dining.webp",
      desc: "Warm ambient rattan lanterns and communal solid teak tables.",
    },
    {
      id: "sol-5",
      title: "Ayurvedic Lotus Sanctuary & Soak Basins",
      category: "Wellness",
      src: "/demo-assets/hospitality/solara/ayurvedic-spa.webp",
      desc: "Traditional brass oil urns, fresh lotus blossoms, and aromatic steam.",
    },
    {
      id: "sol-6",
      title: "Midnight Stargazing Observatory Deck",
      category: "Experiences",
      src: "/demo-assets/hospitality/solara/stargazing-deck.webp",
      desc: "Deep dark skies and high-powered astronomical telescope viewing.",
    },
  ];

  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedPhoto, setSelectedPhoto] = useState<typeof photos[0] | null>(null);

  const filtered = activeCategory === "All" ? photos : photos.filter((p) => p.category === activeCategory);

  return (
    <section id="gallery" className="py-20 bg-[#f5efeb] text-[#1b1916] border-b border-[#dfd7cc]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#b57a42]">
            Visual Sanctuary
          </span>
          <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-bold text-[#1f2e23]">
            Moments Captured in the Nilgiri Highlands
          </h2>
          <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#6b665f]">
            Explore the tranquil architecture, misty sunrises, and botanical details that define everyday life at Solara.
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {["All", "Villas", "Landscape", "Dining", "Wellness", "Experiences"].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                activeCategory === cat
                  ? "bg-[#1f2e23] text-[#faf8f5]"
                  : "bg-[#faf8f5] border border-[#dfd7cc] text-[#6b665f] hover:bg-[#ede5db]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Photo Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setSelectedPhoto(photo)}
              className="group relative cursor-pointer overflow-hidden rounded-3xl border border-[#dfd7cc] bg-[#faf8f5] shadow-sm"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#1f2e23]">
                <Image
                  src={photo.src}
                  alt={photo.title}
                  fill
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-3 right-3 rounded-full bg-black/60 p-1.5 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="h-4 w-4" />
                </div>
              </div>

              <div className="p-4 bg-[#faf8f5]">
                <span className="text-[10px] text-[#b57a42] font-bold uppercase tracking-wider block mb-1">
                  {photo.category}
                </span>
                <h3 className="font-serif text-sm font-bold text-[#1f2e23] line-clamp-1">
                  {photo.title}
                </h3>
                <p className="text-xs text-[#6b665f] mt-1 line-clamp-2">
                  {photo.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="relative max-w-4xl w-full overflow-hidden rounded-3xl bg-[#faf8f5] border border-[#b57a42]/40 shadow-2xl">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 rounded-full bg-black/60 p-2 text-white hover:bg-black/90"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="relative aspect-[16/10] w-full bg-[#1f2e23]">
              <Image
                src={selectedPhoto.src}
                alt={selectedPhoto.title}
                fill
                className="object-contain"
              />
            </div>
            <div className="p-6 bg-[#faf8f5]">
              <span className="text-xs font-bold text-[#b57a42] uppercase tracking-wider">
                {selectedPhoto.category}
              </span>
              <h3 className="font-serif text-xl font-bold text-[#1f2e23] mt-1">
                {selectedPhoto.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#6b665f] mt-2">
                {selectedPhoto.desc}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
