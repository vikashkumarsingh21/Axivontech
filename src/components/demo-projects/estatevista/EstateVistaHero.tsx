"use client";

import React, { useState } from "react";
import {
  Search,
  Home,
  DollarSign,
  BedDouble,
  ArrowRight,
  ShieldCheck,
  Award,
  Sparkles,
  ChevronDown,
  Building2,
} from "lucide-react";
import { motion } from "framer-motion";

interface EstateVistaHeroProps {
  onSearch: (filters: {
    query: string;
    type: string;
    price: string;
    bedrooms: string;
  }) => void;
}

export default function EstateVistaHero({ onSearch }: EstateVistaHeroProps) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("ALL");
  const [price, setPrice] = useState("ALL");
  const [bedrooms, setBedrooms] = useState("ALL");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ query, type, price, bedrooms });

    const el = document.querySelector("#residences");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section
      id="search"
      aria-label="EstateVista Hero & Quick Search"
      className="relative overflow-hidden bg-[#F9F8F5] pt-12 pb-16 sm:pt-16 sm:pb-24 border-b border-[#E4E0D7]"
    >
      {/* Architectural Subtle Cadence Grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(#123C32 1px, transparent 1px), linear-gradient(90deg, #123C32 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Atmospheric Ambient Warm Lights */}
      <div className="pointer-events-none absolute -top-20 right-1/4 h-80 w-80 rounded-full bg-[#C59B63]/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-10 h-72 w-72 rounded-full bg-[#123C32]/5 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        {/* Top Badges & Eyebrow */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#123C32]/15 bg-white/80 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#123C32] shadow-2xs backdrop-blur-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-[#C59B63] animate-pulse" />
            Curated Architectural Residences &bull; Q4 Collection
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-[#5C6661]">
            <ShieldCheck className="h-3.5 w-3.5 text-[#2E6B56]" />
            <span>Fiduciary Escrow &middot; RERA Registered Brokerage</span>
          </div>
        </div>

        {/* Main Headline & Description */}
        <div className="max-w-3xl mb-10">
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#1A211E] leading-[1.12] mb-5">
            Exceptional Residences <br />
            <span className="italic font-serif text-[#123C32] font-medium">
              Crafted for Generations.
            </span>
          </h1>
          <p className="text-base sm:text-lg text-[#5C6661] leading-relaxed max-w-2xl">
            A discreet portfolio of contemporary villas, horizon sky penthouses, and commercial
            architectural headquarters curated for collectors and institutional owners.
          </p>
        </div>

        {/* Interactive Quick Search Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-2xl border border-[#E4E0D7] bg-white p-3 sm:p-4 shadow-[0_12px_40px_-8px_rgba(18,60,50,0.08)] mb-12"
        >
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
            {/* 1. Keyword / Location Search */}
            <div className="lg:col-span-4 relative">
              <label htmlFor="search-input" className="block text-[10px] font-bold uppercase tracking-wider text-[#7C8882] mb-1">
                Location or Keyword
              </label>
              <div className="relative flex items-center">
                <Search className="absolute left-3 h-4 w-4 text-[#8FA097]" />
                <input
                  id="search-input"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. Beverly, Penthouse, Waterfront..."
                  className="w-full rounded-xl border border-[#E4E0D7] bg-[#F9F8F5] py-2.5 pl-9 pr-3 text-xs text-[#1A211E] placeholder:text-[#8FA097] focus:border-[#123C32] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#123C32]"
                />
              </div>
            </div>

            {/* 2. Property Type */}
            <div className="lg:col-span-3 relative">
              <label htmlFor="type-select" className="block text-[10px] font-bold uppercase tracking-wider text-[#7C8882] mb-1">
                Property Category
              </label>
              <div className="relative">
                <select
                  id="type-select"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-[#E4E0D7] bg-[#F9F8F5] py-2.5 pl-3 pr-8 text-xs font-medium text-[#1A211E] focus:border-[#123C32] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#123C32] cursor-pointer"
                >
                  <option value="ALL">All Categories</option>
                  <option value="Luxury Villa">Luxury Villas</option>
                  <option value="Penthouse">Sky Penthouses</option>
                  <option value="Modern Residence">Modern Residences</option>
                  <option value="Commercial Estate">Commercial Estates</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8FA097]" />
              </div>
            </div>

            {/* 3. Price Tier */}
            <div className="lg:col-span-2 relative">
              <label htmlFor="price-select" className="block text-[10px] font-bold uppercase tracking-wider text-[#7C8882] mb-1">
                Price Budget
              </label>
              <div className="relative">
                <select
                  id="price-select"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-[#E4E0D7] bg-[#F9F8F5] py-2.5 pl-3 pr-8 text-xs font-medium text-[#1A211E] focus:border-[#123C32] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#123C32] cursor-pointer"
                >
                  <option value="ALL">Any Budget</option>
                  <option value="UNDER_4M">Under $4,000,000</option>
                  <option value="4M_8M">$4M &ndash; $8,000,000</option>
                  <option value="OVER_8M">$8,000,000+</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8FA097]" />
              </div>
            </div>

            {/* 4. Bedrooms */}
            <div className="lg:col-span-1 relative">
              <label htmlFor="beds-select" className="block text-[10px] font-bold uppercase tracking-wider text-[#7C8882] mb-1">
                Beds
              </label>
              <div className="relative">
                <select
                  id="beds-select"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-[#E4E0D7] bg-[#F9F8F5] py-2.5 pl-2.5 pr-6 text-xs font-medium text-[#1A211E] focus:border-[#123C32] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#123C32] cursor-pointer"
                >
                  <option value="ALL">Any</option>
                  <option value="3">3+ Beds</option>
                  <option value="4">4+ Beds</option>
                  <option value="5">5+ Beds</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8FA097]" />
              </div>
            </div>

            {/* 5. Submit Button */}
            <div className="lg:col-span-2 pt-1 lg:pt-5">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#123C32] hover:bg-[#0D2D25] text-white py-2.5 px-4 text-xs font-bold shadow-sm transition-all hover:shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123C32]"
              >
                <span>Find Residences</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#C59B63]" />
              </button>
            </div>
          </form>
        </motion.div>

        {/* Value Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 border-t border-[#E4E0D7] pt-8">
          <div>
            <div className="font-serif text-2xl sm:text-3xl font-medium text-[#123C32]">
              $420M+
            </div>
            <div className="text-[11px] font-semibold text-[#5C6661] uppercase tracking-wider mt-0.5">
              Curated Asset Volume
            </div>
          </div>
          <div>
            <div className="font-serif text-2xl sm:text-3xl font-medium text-[#123C32]">
              100%
            </div>
            <div className="text-[11px] font-semibold text-[#5C6661] uppercase tracking-wider mt-0.5">
              Verified Title Due Diligence
            </div>
          </div>
          <div>
            <div className="font-serif text-2xl sm:text-3xl font-medium text-[#123C32]">
              35%
            </div>
            <div className="text-[11px] font-semibold text-[#5C6661] uppercase tracking-wider mt-0.5">
              Private Pocket Listings
            </div>
          </div>
          <div>
            <div className="font-serif text-2xl sm:text-3xl font-medium text-[#123C32]">
              4.9 / 5.0
            </div>
            <div className="text-[11px] font-semibold text-[#5C6661] uppercase tracking-wider mt-0.5">
              Client Advisory Score
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
