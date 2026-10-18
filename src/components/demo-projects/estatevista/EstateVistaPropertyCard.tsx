"use client";

import React, { useState } from "react";
import {
  Heart,
  Scale,
  BedDouble,
  Bath,
  Maximize2,
  MapPin,
  Sparkles,
  ArrowRight,
  Eye,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Property } from "./types";

interface EstateVistaPropertyCardProps {
  property: Property;
  isSaved: boolean;
  isCompared: boolean;
  onToggleSave: (propertyId: string) => void;
  onToggleCompare: (propertyId: string) => void;
  onViewDetails: (property: Property) => void;
  onBookTour: (property: Property) => void;
}

export default function EstateVistaPropertyCard({
  property,
  isSaved,
  isCompared,
  onToggleSave,
  onToggleCompare,
  onViewDetails,
  onBookTour,
}: EstateVistaPropertyCardProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const images = property.images && property.images.length > 0 ? property.images : [
    {
      url: "/images/demo-projects/estatevista/prop-1-exterior.svg",
      alt: property.title,
      caption: property.tagline,
      gradientClass: "from-[#153D32] to-[#102C25]",
    },
  ];

  const currentImage = images[activeImageIndex] || images[0];

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <article
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#D5CEC1] bg-[#FAF8F2] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#153D32]/40 hover:shadow-xl hover:shadow-[#153D32]/8"
    >
      {/* ── Card Image Container ───────────────────────────────────── */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#102C25]">
        {/* Real Architectural Property Photography */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={currentImage.url}
          alt={currentImage.alt || property.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />

        {/* Ambient Overlay for Typography Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#102C25]/85 via-transparent to-black/25 pointer-events-none" />

        {/* Top Badges & Actions Overlay */}
        <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between">
          {/* Status Tag Pill */}
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-xs backdrop-blur-md ${
              property.statusTag === "Under Contract"
                ? "bg-[#222A25]/90 text-stone-300 border border-stone-600"
                : property.statusTag === "Price Improvement"
                ? "bg-[#B89A63]/95 text-[#102C25] font-extrabold border border-amber-300/40"
                : "bg-[#153D32]/95 text-white border border-[#153D32]/40"
            }`}
          >
            {property.statusTag}
          </span>

          {/* Top Right Action Icons: Save & Compare */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onToggleCompare(property.id)}
              aria-label={isCompared ? "Remove from comparison" : "Add to comparison"}
              className={`flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-all ${
                isCompared
                  ? "bg-[#153D32] text-white shadow-xs"
                  : "bg-[#FAF8F2]/90 text-[#222A25] hover:bg-white"
              }`}
              title={isCompared ? "Remove from comparison" : "Add to side-by-side comparison"}
            >
              <Scale className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={() => onToggleSave(property.id)}
              aria-label={isSaved ? "Remove from saved residences" : "Save this residence"}
              className={`flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-all ${
                isSaved
                  ? "bg-[#B89A63] text-white shadow-xs"
                  : "bg-[#FAF8F2]/90 text-[#222A25] hover:bg-white"
              }`}
              title={isSaved ? "Saved to your portfolio" : "Save property"}
            >
              <Heart className={`h-3.5 w-3.5 ${isSaved ? "fill-white" : ""}`} />
            </button>
          </div>
        </div>

        {/* Gallery Image Navigation Arrows (If multiple images) */}
        {images.length > 1 && (
          <div className="absolute inset-y-0 left-2 right-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <button
              type="button"
              onClick={handlePrevImage}
              aria-label="Previous image"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleNextImage}
              aria-label="Next image"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Bottom Image Caption & Dots */}
        <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between text-white text-[11px]">
          <span className="truncate max-w-[200px] text-[#FAF8F2]/90 font-medium">
            {currentImage.caption}
          </span>
          {images.length > 1 && (
            <div className="flex items-center gap-1 shrink-0">
              {images.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === activeImageIndex
                      ? "w-3 bg-[#B89A63]"
                      : "w-1.5 bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Card Content Body ───────────────────────────────────────── */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          {/* Location & Architectural Style */}
          <div className="flex items-center justify-between text-[11px] font-semibold text-[#626B63] mb-1.5">
            <span className="flex items-center gap-1 truncate text-[#153D32]">
              <MapPin className="h-3.5 w-3.5 text-[#B89A63] shrink-0" />
              <span className="truncate">{property.location}</span>
            </span>
            <span className="shrink-0 text-[10px] uppercase font-bold tracking-wider text-[#7B817A]">
              {property.propertyType}
            </span>
          </div>

          {/* Title */}
          <h3
            onClick={() => onViewDetails(property)}
            className="font-serif text-xl font-bold tracking-tight text-[#222A25] hover:text-[#153D32] transition-colors cursor-pointer line-clamp-1"
          >
            {property.title}
          </h3>

          {/* Tagline / Subtitle */}
          <p className="mt-1 text-xs text-[#626B63] line-clamp-2 leading-relaxed">
            {property.tagline}
          </p>

          {/* Specifications Matrix */}
          <div className="mt-4 grid grid-cols-3 gap-2 border-y border-[#D5CEC1]/70 py-3 text-xs text-[#222A25]">
            <div className="flex items-center gap-1.5">
              <BedDouble className="h-3.5 w-3.5 text-[#153D32]" />
              <span className="font-semibold">{property.bedrooms} Beds</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bath className="h-3.5 w-3.5 text-[#153D32]" />
              <span className="font-semibold">{property.bathrooms} Baths</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Maximize2 className="h-3.5 w-3.5 text-[#153D32]" />
              <span className="font-semibold">{property.areaSqFt.toLocaleString()} SQ FT</span>
            </div>
          </div>
        </div>

        {/* ── Card Footer & Action Buttons ───────────────────────────── */}
        <div className="mt-5 flex items-center justify-between gap-3 pt-1">
          {/* Price */}
          <div>
            <div className="font-serif text-xl font-bold text-[#153D32]">
              {property.formattedPrice}
            </div>
            <div className="text-[10px] text-[#7B817A] font-medium">
              ${property.pricePerSqFt.toLocaleString()} / SQ FT
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onBookTour(property)}
              className="inline-flex items-center gap-1 rounded-xl border border-[#D5CEC1] bg-white px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[#222A25] hover:bg-[#DCD5C8] transition-colors"
              title="Schedule private viewing"
            >
              <Calendar className="h-3.5 w-3.5 text-[#153D32]" />
              <span>Tour</span>
            </button>

            <button
              type="button"
              onClick={() => onViewDetails(property)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#153D32] hover:bg-[#102C25] text-white px-4 py-2 text-[11px] font-bold uppercase tracking-wider shadow-2xs hover:shadow-sm transition-all active:scale-[0.98]"
            >
              <span>Dossier</span>
              <ArrowRight className="h-3 w-3 text-[#B89A63]" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
