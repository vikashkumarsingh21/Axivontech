"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Camera, X, Maximize2 } from "lucide-react";

export default function OakfieldGallery() {
  const photos = [
    {
      id: "gal-1",
      title: "Sprawling 15-Acre Main Heritage Campus",
      category: "Campus",
      src: "/demo-assets/education/oakfield/hero-campus.webp",
      desc: "Lush gardens, central clock tower, and classical Georgian architecture.",
    },
    {
      id: "gal-2",
      title: "Interactive Smart Classroom",
      category: "Classrooms",
      src: "/demo-assets/education/oakfield/smart-classroom.webp",
      desc: "Digitally enabled collaborative spaces for primary and secondary wings.",
    },
    {
      id: "gal-3",
      title: "Robotics, AI & STEM Prototyping Laboratory",
      category: "Science & Labs",
      src: "/demo-assets/education/oakfield/stem-robotics.webp",
      desc: "Micro-controllers, 3D printing stations, and experiential coding.",
    },
    {
      id: "gal-4",
      title: "The Ashoka Central Library Reading Sanctuary",
      category: "Campus",
      src: "/demo-assets/education/oakfield/school-library.webp",
      desc: "22,000+ print volumes, quiet study carrels, and digital archives.",
    },
    {
      id: "gal-5",
      title: "IAAF Certified 400m Athletic Ground & Turf",
      category: "Athletics",
      src: "/demo-assets/education/oakfield/sports-ground.webp",
      desc: "All-weather synthetic running track and championship football turf.",
    },
    {
      id: "gal-6",
      title: "Principal's Executive Consultation Office",
      category: "Campus",
      src: "/demo-assets/education/oakfield/principal-desk.webp",
      desc: "Heritage teak boardroom for academic governance and parent dialogues.",
    },
  ];

  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedPhoto, setSelectedPhoto] = useState<typeof photos[0] | null>(null);

  const filtered = activeCategory === "All" ? photos : photos.filter((p) => p.category === activeCategory);

  return (
    <section id="gallery" className="py-20 bg-[#faf8f4] text-[#18231d] border-b border-[#e2d9c8]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#c8a24d]">
            Visual Chronicle
          </span>
          <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-bold text-[#143d30]">
            Life and Learning at Oakfield
          </h2>
          <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#4f5e55]">
            Catch a glimpse of the vibrant energy across our classrooms, research laboratories, athletics fields, and cultural spaces.
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {["All", "Campus", "Classrooms", "Science & Labs", "Athletics"].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                activeCategory === cat
                  ? "bg-[#143d30] text-[#faf8f4]"
                  : "bg-[#f4efe4] border border-[#dfd4c0] text-[#4f5e55] hover:bg-[#eae1d0]"
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
              className="group relative cursor-pointer overflow-hidden rounded-2xl border border-[#dfd4c0] bg-[#f4efe4] shadow-sm"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#143d30]">
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

              <div className="p-4 bg-[#faf8f4]">
                <div className="flex items-center justify-between text-[10px] text-[#c8a24d] font-bold uppercase tracking-wider mb-1">
                  <span>{photo.category}</span>
                </div>
                <h3 className="font-serif text-sm font-bold text-[#143d30] line-clamp-1">
                  {photo.title}
                </h3>
                <p className="text-xs text-[#718278] mt-1 line-clamp-2">
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
          <div className="relative max-w-4xl w-full overflow-hidden rounded-2xl bg-[#faf8f4] border border-[#c8a24d]/40 shadow-2xl">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 rounded-full bg-black/60 p-2 text-white hover:bg-black/90"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="relative aspect-[16/10] w-full bg-[#143d30]">
              <Image
                src={selectedPhoto.src}
                alt={selectedPhoto.title}
                fill
                className="object-contain"
              />
            </div>
            <div className="p-6 bg-[#faf8f4]">
              <span className="text-xs font-bold text-[#c8a24d] uppercase tracking-wider">
                {selectedPhoto.category}
              </span>
              <h3 className="font-serif text-xl font-bold text-[#143d30] mt-1">
                {selectedPhoto.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#4f5e55] mt-2">
                {selectedPhoto.desc}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
