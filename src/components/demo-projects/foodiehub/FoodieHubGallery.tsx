"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { GALLERY_IMAGES } from "@/data/foodiehub-data";
import { Sparkles, X, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FoodieHubGallery() {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const filterTabs = ["All", "Culinary", "Interiors", "Ingredients", "Drinks"];

  const filteredImages =
    activeFilter === "All"
      ? GALLERY_IMAGES
      : GALLERY_IMAGES.filter((img) => img.tag.toLowerCase() === activeFilter.toLowerCase());

  // Keyboard navigation & body scroll lock
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (selectedImageIndex === null) return;

      if (e.key === "Escape") {
        setSelectedImageIndex(null);
      } else if (e.key === "ArrowLeft") {
        setSelectedImageIndex((prev) =>
          prev !== null && prev > 0 ? prev - 1 : GALLERY_IMAGES.length - 1
        );
      } else if (e.key === "ArrowRight") {
        setSelectedImageIndex((prev) =>
          prev !== null && prev < GALLERY_IMAGES.length - 1 ? prev + 1 : 0
        );
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

  const currentModalImage =
    selectedImageIndex !== null ? GALLERY_IMAGES[selectedImageIndex] : null;

  function handleImageError(id: string) {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  }

  return (
    <section
      id="gallery"
      aria-labelledby="gallery-heading"
      className="relative border-t border-[#D4C9B9] bg-white py-20 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-[#6B6560]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#B85C38]" />
            <span>Visual Narratives</span>
          </div>

          <h2
            id="gallery-heading"
            className="mt-4 font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#24221F]"
          >
            Moments at Saffron & Stone
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[#6B6560]">
            An archive of slow cooking, tactile earthenware, flickering candles, and
            fragrant spices. Select any photograph to expand into fullscreen view.
          </p>

          {/* Filter Pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {filterTabs.map((tab) => {
              const isSelected = activeFilter === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveFilter(tab)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                    isSelected
                      ? "bg-[#24221F] text-white shadow-sm"
                      : "border border-[#D4C9B9] bg-[#F8F3EA] text-[#6B6560] hover:border-[#24221F] hover:text-[#24221F]"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* Gallery Grid */}
        <motion.div
          layout
          className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {filteredImages.map((img) => {
            const originalIndex = GALLERY_IMAGES.findIndex((item) => item.id === img.id);

            return (
              <motion.button
                layout
                key={img.id}
                type="button"
                onClick={() => setSelectedImageIndex(originalIndex)}
                className="group relative overflow-hidden rounded-2xl border border-[#D4C9B9] bg-[#F0E8DA] text-left shadow-sm transition-all duration-300 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B85C38]"
                aria-label={`View enlarged photo of ${img.title}`}
              >
                <div className="relative h-64 sm:h-72 w-full overflow-hidden">
                  {!imageErrors[img.id] ? (
                    <Image
                      src={img.src}
                      alt={img.title}
                      width={600}
                      height={600}
                      onError={() => handleImageError(img.id)}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center bg-[#F0E8DA] p-4 text-center">
                      <Sparkles className="h-8 w-8 text-[#B85C38] mb-2" />
                      <span className="font-serif text-sm font-bold text-[#24221F]">{img.title}</span>
                    </div>
                  )}
                </div>

                {/* Permanent subtle tag pill */}
                <div className="absolute top-3 left-3 rounded-full bg-[#F8F3EA]/90 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#6B6560] backdrop-blur-sm border border-[#D4C9B9]">
                  {img.tag}
                </div>

                {/* Hover Editorial Overlay */}
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-[#24221F]/90 via-[#24221F]/30 to-transparent p-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#C4964C]">
                    {img.tag}
                  </span>
                  <p className="font-serif text-base font-semibold text-[#F8F3EA]">
                    {img.title}
                  </p>
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-[#F8F3EA]/80">
                    <Eye className="h-3.5 w-3.5 text-[#B85C38]" />
                    <span>View fullscreen</span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {currentModalImage && selectedImageIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label={currentModalImage.title}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#24221F]/95 p-4 sm:p-6 backdrop-blur-md"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedImageIndex(null)}
              className="absolute top-5 right-5 z-20 rounded-full bg-white/10 p-2.5 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B85C38]"
              aria-label="Close photo preview"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Prev Button */}
            <button
              type="button"
              onClick={() =>
                setSelectedImageIndex(
                  selectedImageIndex > 0 ? selectedImageIndex - 1 : GALLERY_IMAGES.length - 1
                )
              }
              className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B85C38]"
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
              className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B85C38]"
              aria-label="Next photo"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            {/* Modal Content Frame */}
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative max-h-[85vh] max-w-4xl overflow-hidden rounded-2xl border border-[#D4C9B9]/30 bg-[#1A1917] p-2 text-center shadow-2xl"
            >
              <div className="relative max-h-[70vh] flex items-center justify-center overflow-hidden rounded-xl bg-black/40">
                {!imageErrors[currentModalImage.id] ? (
                  <Image
                    src={currentModalImage.src}
                    alt={currentModalImage.title}
                    width={1100}
                    height={800}
                    onError={() => handleImageError(currentModalImage.id)}
                    className="max-h-[68vh] w-auto max-w-full rounded-lg object-contain"
                  />
                ) : (
                  <div className="flex h-80 w-full flex-col items-center justify-center p-8 text-white">
                    <Sparkles className="h-12 w-12 text-[#C4964C] mb-3" />
                    <span className="font-serif text-2xl font-bold">{currentModalImage.title}</span>
                  </div>
                )}
              </div>

              {/* Caption Bar */}
              <div className="p-4 text-center">
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#C4964C]">
                  {currentModalImage.tag}
                </span>
                <p className="mt-1 font-serif text-lg font-bold text-[#F8F3EA]">
                  {currentModalImage.title}
                </p>
                <p className="mt-1 font-mono text-[11px] text-[#9E9790]">
                  Plate {selectedImageIndex + 1} of {GALLERY_IMAGES.length} · Press Esc to dismiss
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
