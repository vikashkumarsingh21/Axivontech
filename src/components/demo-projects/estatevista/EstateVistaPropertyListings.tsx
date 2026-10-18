"use client";

import React, { useState, useMemo } from "react";
import {
  SlidersHorizontal,
  Search,
  RotateCcw,
  Building2,
  Check,
  ChevronDown,
  Sparkles,
  ArrowUpDown,
  Home,
  LayoutGrid,
} from "lucide-react";
import { Property, PropertyType } from "./types";
import EstateVistaPropertyCard from "./EstateVistaPropertyCard";

interface EstateVistaPropertyListingsProps {
  properties: Property[];
  savedIds: string[];
  compareIds: string[];
  onToggleSave: (id: string) => void;
  onToggleCompare: (id: string) => void;
  onViewDetails: (property: Property) => void;
  onBookTour: (property: Property) => void;
  initialFilters?: {
    query: string;
    type: string;
    price: string;
    bedrooms: string;
  };
}

const CATEGORIES: { label: string; value: string }[] = [
  { label: "All Residences", value: "ALL" },
  { label: "Luxury Villas", value: "Luxury Villa" },
  { label: "Sky Penthouses", value: "Penthouse" },
  { label: "Modern Residences", value: "Modern Residence" },
  { label: "Commercial Estates", value: "Commercial Estate" },
];

export default function EstateVistaPropertyListings({
  properties,
  savedIds,
  compareIds,
  onToggleSave,
  onToggleCompare,
  onViewDetails,
  onBookTour,
  initialFilters,
}: EstateVistaPropertyListingsProps) {
  const [searchQuery, setSearchQuery] = useState(initialFilters?.query || "");
  const [selectedCategory, setSelectedCategory] = useState(initialFilters?.type || "ALL");
  const [priceTier, setPriceTier] = useState(initialFilters?.price || "ALL");
  const [bedroomFilter, setBedroomFilter] = useState(initialFilters?.bedrooms || "ALL");
  const [sortBy, setSortBy] = useState<"curated" | "price-asc" | "price-desc" | "area-desc">("curated");

  // Filtering & Sorting
  const filteredProperties = useMemo(() => {
    let result = [...properties];

    // 1. Category Filter
    if (selectedCategory !== "ALL") {
      result = result.filter((p) => p.propertyType === selectedCategory);
    }

    // 2. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((p) => {
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesLocation = p.location.toLowerCase().includes(q);
        const matchesNeighborhood = p.neighborhood.toLowerCase().includes(q);
        const matchesAddress = p.address.toLowerCase().includes(q);
        const matchesTagline = p.tagline.toLowerCase().includes(q);
        const matchesAmenity = p.keyAmenities.some((a) => a.toLowerCase().includes(q));
        return (
          matchesTitle ||
          matchesLocation ||
          matchesNeighborhood ||
          matchesAddress ||
          matchesTagline ||
          matchesAmenity
        );
      });
    }

    // 3. Price Tier Filter
    if (priceTier === "UNDER_4M") {
      result = result.filter((p) => p.price < 4000000);
    } else if (priceTier === "4M_8M") {
      result = result.filter((p) => p.price >= 4000000 && p.price <= 8000000);
    } else if (priceTier === "OVER_8M") {
      result = result.filter((p) => p.price > 8000000);
    }

    // 4. Bedroom Filter
    if (bedroomFilter !== "ALL") {
      const minBeds = parseInt(bedroomFilter, 10);
      result = result.filter((p) => p.bedrooms >= minBeds);
    }

    // 5. Sorting
    if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "area-desc") {
      result.sort((a, b) => b.areaSqFt - a.areaSqFt);
    } else {
      // Curated: featured first, then by display order
      result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    return result;
  }, [properties, selectedCategory, searchQuery, priceTier, bedroomFilter, sortBy]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    selectedCategory !== "ALL" ||
    priceTier !== "ALL" ||
    bedroomFilter !== "ALL";

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategory("ALL");
    setPriceTier("ALL");
    setBedroomFilter("ALL");
    setSortBy("curated");
  };

  return (
    <section id="residences" className="py-16 sm:py-24 bg-[#F0EDE5] relative border-b border-[#D5CEC1]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10 pb-6 border-b border-[#D5CEC1]">
          <div>
            <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[#B89A63] mb-2">
              <Sparkles className="h-3 w-3" />
              <span>Architectural Showcase Portfolio</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-[#222A25]">
              Curated Architectural Residences
            </h2>
            <p className="text-sm text-[#626B63] mt-1 max-w-xl">
              Filter by property typology, price bracket, and room requirements. Each residence
              features architectural specifications, CAD floor plans, and interactive comparisons.
            </p>
          </div>

          {/* Results count & Clear button */}
          <div className="flex items-center gap-3 self-start sm:self-end">
            <span className="text-xs font-semibold text-[#626B63]">
              Showing <span className="font-bold text-[#153D32]">{filteredProperties.length}</span> of{" "}
              {properties.length} Estates
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="flex items-center gap-1.5 rounded-full border border-[#D5CEC1] bg-[#FAF8F2] px-3.5 py-1 text-xs font-semibold text-[#222A25] hover:bg-[#DCD5C8] transition-colors"
              >
                <RotateCcw className="h-3 w-3 text-[#B89A63]" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* ── Category Filter Tabs ──────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2.5 mb-6">
          {CATEGORIES.map((cat) => {
            const count =
              cat.value === "ALL"
                ? properties.length
                : properties.filter((p) => p.propertyType === cat.value).length;
            const isSelected = selectedCategory === cat.value;

            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => setSelectedCategory(cat.value)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                  isSelected
                    ? "bg-[#153D32] text-white shadow-xs"
                    : "border border-[#D5CEC1] bg-[#FAF8F2] text-[#626B63] hover:border-[#153D32]/50 hover:text-[#222A25]"
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    isSelected ? "bg-white/20 text-white" : "bg-[#DCD5C8] text-[#7B817A]"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Secondary Filter & Sort Toolbar ──────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-10 rounded-2xl border border-[#D5CEC1] bg-[#FAF8F2] p-4 shadow-sm">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#7B817A]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by neighborhood, title..."
              className="w-full rounded-xl border border-[#D5CEC1] bg-white py-2.5 pl-9 pr-3 text-xs text-[#222A25] placeholder:text-[#7B817A] focus:border-[#153D32] focus:outline-none"
            />
          </div>

          {/* Budget Tier */}
          <div className="relative">
            <select
              value={priceTier}
              onChange={(e) => setPriceTier(e.target.value)}
              className="w-full appearance-none rounded-xl border border-[#D5CEC1] bg-white py-2.5 pl-3.5 pr-8 text-xs font-medium text-[#222A25] focus:border-[#153D32] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Price Tiers</option>
              <option value="UNDER_4M">Under $4,000,000</option>
              <option value="4M_8M">$4M &ndash; $8,000,000</option>
              <option value="OVER_8M">$8,000,000 & Up</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#7B817A]" />
          </div>

          {/* Bedrooms */}
          <div className="relative">
            <select
              value={bedroomFilter}
              onChange={(e) => setBedroomFilter(e.target.value)}
              className="w-full appearance-none rounded-xl border border-[#D5CEC1] bg-white py-2.5 pl-3.5 pr-8 text-xs font-medium text-[#222A25] focus:border-[#153D32] focus:outline-none cursor-pointer"
            >
              <option value="ALL">Bedrooms (Any)</option>
              <option value="3">3+ Bedrooms</option>
              <option value="4">4+ Bedrooms</option>
              <option value="5">5+ Bedrooms</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#7B817A]" />
          </div>

          {/* Sort By */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full appearance-none rounded-xl border border-[#D5CEC1] bg-white py-2.5 pl-3.5 pr-8 text-xs font-medium text-[#222A25] focus:border-[#153D32] focus:outline-none cursor-pointer"
            >
              <option value="curated">Sort: Curated Showcase</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="area-desc">Living Area: Largest First</option>
            </select>
            <ArrowUpDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#7B817A]" />
          </div>
        </div>

        {/* ── Property Cards Grid ───────────────────────────────────── */}
        {filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 sm:gap-8">
            {filteredProperties.map((property) => (
              <EstateVistaPropertyCard
                key={property.id}
                property={property}
                isSaved={savedIds.includes(property.id)}
                isCompared={compareIds.includes(property.id)}
                onToggleSave={onToggleSave}
                onToggleCompare={onToggleCompare}
                onViewDetails={onViewDetails}
                onBookTour={onBookTour}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#D5CEC1] bg-[#FAF8F2] p-12 text-center max-w-lg mx-auto">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#153D32]/10 text-[#153D32] mb-4">
              <Building2 className="h-6 w-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#222A25] mb-1">
              No matching residences found
            </h3>
            <p className="text-xs text-[#626B63] mb-6 max-w-sm">
              We could not find any properties matching your current filter criteria. Try adjusting
              your search query, price tier, or property category.
            </p>
            <button
              type="button"
              onClick={clearAllFilters}
              className="flex items-center gap-2 rounded-xl bg-[#153D32] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#102C25] transition-all"
            >
              <RotateCcw className="h-3.5 w-3.5 text-[#B89A63]" />
              <span>Reset All Filters</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
