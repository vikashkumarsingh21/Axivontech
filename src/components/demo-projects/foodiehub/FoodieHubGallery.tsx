"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { GALLERY_IMAGES } from "@/data/foodiehub-data";
import { Sparkles, X, ChevronLeft, ChevronRight, Eye } from "lucide-react";

export default function FoodieHubGallery() {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  // Close modal on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setSelectedImageIndex(null);
      } else if (e.key === "ArrowLeft" && selectedImageIndex !== null) {
        setSelectedImageIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : GALLERY_IMAGES.length - 1));
      } else if (e.key === "ArrowRight" && selectedImageIndex !== null) {
        setSelectedImageIndex((prev) => (prev !== null && prev < GALLERY_IMAGES.length - 1 ? prev + 1 : 0));
      }
    }
    if (selectedImageIndex !== null) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [selectedImageIndex]);

  const currentModalImage = selectedImageIndex !== null ? GALLERY_IMAGES[selectedImageIndex] : null;

  return (
    <section
      id="gallery"
      aria-labelledby="gallery-heading"
      className="relative border-t border-[#E8DFC9] bg-white py-16 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-[#68735A]">
            <Sparkles className="h-3.5 w-3.5 text-[#B85C38]" />
            <span>Visual Narratives</span>
          </div>

          <h2
            id="gallery-heading"
            className="mt-3 font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#24221F]"
          >
            Moments at Saffron & Stone
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[#24221F]/80">
            A glimpse into our kitchen's craft, dining atmosphere, and handpicked
            spices. Click any image to view in detail.
          </p>
        </div>

        {/* Responsive Editorial Gallery Grid */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {GALLERY_IMAGES.map((img, idx) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setSelectedImageIndex(idx)}
              className="group relative overflow-hidden rounded-2xl border border-[#E0D4BE] bg-[#F8F3EA] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B85C38]"
              aria-label={`View enlarged photo of ${img.title}`}
            >
              <div className="relative h-64 sm:h-72 w-full overflow-hidden">
                <Image
                  src={img.src}
                  alt={img.title}
                  width={600}
                  height={600}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#C9A86A]">
                  {img.tag}
                </span>
                <p className="font-serif text-base font-semibold text-white">
                  {img.title}
                </p>
                <div className="mt-1 flex items-center gap-1 text-xs text-white/80">
                  <Eye className="h-3 w-3" />
                  <span>Click to expand</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Accessible Lightbox Modal */}
      {currentModalImage && selectedImageIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={currentModalImage.title}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 sm:p-6 backdrop-blur-md"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={() => setSelectedImageIndex(null)}
            className="absolute top-4 right-4 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B85C38]"
            aria-label="Close photo preview"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Previous Button */}
          <button
            type="button"
            onClick={() =>
              setSelectedImageIndex(
                selectedImageIndex > 0 ? selectedImageIndex - 1 : GALLERY_IMAGES.length - 1
              )
            }
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/10 p-2.5 text-white hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B85C38]"
            aria-label="Previous photo"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          {/* Next Button */}
          <button
            type="button"
            onClick={() =>
              setSelectedImageIndex(
                selectedImageIndex < GALLERY_IMAGES.length - 1 ? selectedImageIndex + 1 : 0
              )
            }
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/10 p-2.5 text-white hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B85C38]"
            aria-label="Next photo"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Modal Content */}
          <div className="relative max-h-[85vh] max-w-4xl overflow-hidden rounded-2xl bg-[#141416] p-2 text-center shadow-2xl">
            <Image
              src={currentModalImage.src}
              alt={currentModalImage.title}
              width={1000}
              height={750}
              className="max-h-[70vh] w-auto max-w-full rounded-xl object-contain mx-auto"
            />
            <div className="p-4 text-white">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#C9A86A]">
                {currentModalImage.tag}
              </span>
              <p className="font-serif text-lg font-bold">{currentModalImage.title}</p>
              <p className="text-xs text-white/60 mt-1">
                Image {selectedImageIndex + 1} of {GALLERY_IMAGES.length} · Press Esc to close
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
