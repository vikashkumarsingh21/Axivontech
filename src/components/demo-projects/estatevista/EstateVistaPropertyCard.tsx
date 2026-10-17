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
} from "lucide-react";
import { motion } from "framer-motion";
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

  const currentImage = property.images[activeImageIndex] || property.images[0];

  return (
    <article
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#E4E0D7] bg-white shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-[#123C32]/30 hover:shadow-[0_16px_36px_-8px_rgba(18,60,50,0.1)]"
    >
      {/* ── Card Image Container ───────────────────────────────────── */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#162822]">
        {/* Dynamic Architectural Gradient Visual Canvas */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${currentImage.gradientClass} transition-all duration-700`}
        >
          {/* Architectural Blueprint Vector Grid Overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-15"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />

          {/* Abstract Architectural Silhouette & Room Composition */}
          <div className="absolute inset-0 flex flex-col justify-end p-5 text-white">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-[#C59B63] font-semibold mb-1">
              <Sparkles className="h-3 w-3" />
              <span>{property.architecturalStyle}</span>
            </div>
            <p className="text-xs text-white/90 font-medium line-clamp-1 italic">
              &ldquo;{currentImage.caption}&rdquo;
            </p>
          </div>
        </div>

        {/* Top Badges & Actions Overlay */}
        <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between">
          {/* Status Tag Pill */}
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-xs backdrop-blur-md ${
              property.statusTag === "Under Contract"
                ? "bg-stone-900/90 text-stone-300 border border-stone-700"
                : property.statusTag === "Price Improvement"
                ? "bg-[#C59B63]/90 text-stone-950 font-extrabold border border-[#E4C594]"
                : "bg-[#123C32]/90 text-white border border-[#23584B]"
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
                  ? "bg-[#123C32] text-white shadow-xs"
                  : "bg-white/85 text-[#1A211E] hover:bg-white"
              }`}
            >
              <Scale className={`h-3.5 w-3.5 ${isCompared ? "text-[#C59B63]" : "text-[#1A211E]"}`} />
            </button>

            <button
              type="button"
              onClick={() => onToggleSave(property.id)}
              aria-label={isSaved ? "Remove from saved properties" : "Save property to favorites"}
              className={`flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-all ${
                isSaved
                  ? "bg-white text-[#C59B63] shadow-xs"
                  : "bg-white/85 text-[#1A211E] hover:bg-white"
              }`}
            >
              <Heart
                className={`h-3.5 w-3.5 ${
                  isSaved ? "fill-[#C59B63] text-[#C59B63]" : "text-[#1A211E]"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Image Gallery Switcher Dots */}
        {property.images.length > 1 && (
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 backdrop-blur-xs">
            {property.images.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImageIndex(idx)}
                aria-label={`View photo ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  activeImageIndex === idx ? "w-4 bg-[#C59B63]" : "w-1.5 bg-white/60 hover:bg-white"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Card Body & Information ─────────────────────────────────── */}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {/* Price & Price Per Sq.Ft */}
        <div className="flex items-baseline justify-between mb-2">
          <div className="font-serif text-2xl font-bold text-[#123C32] tracking-tight">
            {property.formattedPrice}
          </div>
          <div className="text-[11px] font-medium text-[#7C8882]">
            ${property.pricePerSqFt.toLocaleString()}/sq.ft
          </div>
        </div>

        {/* Title & Tagline */}
        <h3 className="font-serif text-lg font-bold text-[#1A211E] tracking-tight group-hover:text-[#123C32] transition-colors mb-1 line-clamp-1">
          {property.title}
        </h3>
        <p className="text-xs text-[#5C6661] line-clamp-1 mb-4 italic">
          {property.tagline}
        </p>

        {/* Location & Neighborhood */}
        <div className="flex items-center gap-1.5 text-xs text-[#5C6661] mb-5">
          <MapPin className="h-3.5 w-3.5 text-[#C59B63] shrink-0" />
          <span className="truncate">{property.location}</span>
        </div>

        {/* Technical Specs Metric Bar */}
        <div className="grid grid-cols-3 divide-x divide-[#E4E0D7] rounded-xl border border-[#E4E0D7] bg-[#F9F8F5] py-2.5 px-2 mb-5 text-center text-xs">
          <div className="flex flex-col items-center px-1">
            <span className="text-[10px] uppercase font-bold text-[#7C8882]">Bedrooms</span>
            <span className="font-semibold text-[#1A211E] mt-0.5">
              {property.bedrooms > 0 ? `${property.bedrooms} Beds` : "Studio"}
            </span>
          </div>
          <div className="flex flex-col items-center px-1">
            <span className="text-[10px] uppercase font-bold text-[#7C8882]">Bathrooms</span>
            <span className="font-semibold text-[#1A211E] mt-0.5">{property.bathrooms} Baths</span>
          </div>
          <div className="flex flex-col items-center px-1">
            <span className="text-[10px] uppercase font-bold text-[#7C8882]">Living Area</span>
            <span className="font-semibold text-[#1A211E] mt-0.5">
              {property.areaSqFt.toLocaleString()} sq.ft
            </span>
          </div>
        </div>

        {/* Key Amenities Tags (top 2 preview) */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {property.keyAmenities.slice(0, 2).map((amenity, idx) => (
            <span
              key={idx}
              className="inline-flex items-center rounded-md bg-[#123C32]/5 border border-[#123C32]/10 px-2 py-0.5 text-[10px] font-medium text-[#123C32] truncate max-w-full"
            >
              {amenity}
            </span>
          ))}
          {property.keyAmenities.length > 2 && (
            <span className="text-[10px] font-medium text-[#7C8882] self-center">
              +{property.keyAmenities.length - 2} more
            </span>
          )}
        </div>

        {/* Card Footer Actions */}
        <div className="mt-auto grid grid-cols-2 gap-2 pt-2 border-t border-[#E4E0D7]">
          <button
            type="button"
            onClick={() => onViewDetails(property)}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-[#E4E0D7] bg-white py-2 text-xs font-semibold text-[#1A211E] hover:border-[#123C32] hover:bg-[#F9F8F5] transition-all"
          >
            <Layers className="h-3.5 w-3.5 text-[#123C32]" />
            <span>Floor Plan</span>
          </button>

          <button
            type="button"
            onClick={() => onBookTour(property)}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-[#123C32] py-2 text-xs font-bold text-white hover:bg-[#0D2D25] shadow-2xs transition-all active:scale-[0.98]"
          >
            <Calendar className="h-3.5 w-3.5 text-[#C59B63]" />
            <span>Book Tour</span>
          </button>
        </div>
      </div>
    </article>
  );
}
