"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Home,
  BedDouble,
  ArrowRight,
  Sparkles,
  ChevronDown,
  Building2,
  Calendar,
  Layers,
  MapPin,
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
      aria-label="EstateVista Hero & Architectural Showcase"
      className="relative overflow-hidden bg-[#F0EDE5] pt-10 pb-16 sm:pt-14 sm:pb-20 border-b border-[#D5CEC1]"
    >
      {/* Subtle Architectural Cadence Grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(#153D32 1px, transparent 1px), linear-gradient(90deg, #153D32 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Atmospheric Warm Ambient Light */}
      <div className="pointer-events-none absolute -top-24 right-1/4 h-96 w-96 rounded-full bg-[#B89A63]/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-10 h-80 w-80 rounded-full bg-[#153D32]/5 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Eyebrow Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#153D32]/20 bg-[#FAF8F2]/90 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#153D32] shadow-2xs backdrop-blur-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-[#B89A63] animate-pulse" />
            Curated Architectural Residences &bull; Interactive Demonstration
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-[#626B63]">
            <Sparkles className="h-3.5 w-3.5 text-[#B89A63]" />
            <span>Axivon Real Estate Technology Portfolio Showcase</span>
          </div>
        </div>

        {/* ── Main Editorial Two-Column Hero Composition ──────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center mb-14">
          {/* Left Column (7 Cols): Typography & Narrative */}
          <div className="lg:col-span-7 space-y-6">
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#222A25] leading-[1.12]">
              Exceptional Residences <br />
              <span className="italic font-serif text-[#153D32] font-medium">
                Crafted for Generations.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#626B63] leading-relaxed max-w-xl">
              A discreet portfolio of contemporary villas, horizon sky penthouses,
              and private estates curated for design collectors and institutional owners.
              Explore interactive floor plans, carrying costs, and bespoke viewing workflows.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="#residences"
                className="inline-flex items-center gap-2.5 rounded-xl bg-[#153D32] hover:bg-[#102C25] text-white px-7 py-3.5 text-xs font-bold uppercase tracking-wider shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
              >
                <span>Explore Residences</span>
                <ArrowRight className="h-4 w-4 text-[#B89A63]" />
              </Link>

              <Link
                href="#tour"
                className="inline-flex items-center gap-2 rounded-xl border border-[#D5CEC1] bg-[#FAF8F2] hover:bg-[#DCD5C8] text-[#222A25] px-6 py-3.5 text-xs font-bold uppercase tracking-wider transition-all"
              >
                <Calendar className="h-4 w-4 text-[#153D32]" />
                <span>Book Private Tour</span>
              </Link>
            </div>
          </div>

          {/* Right Column (5 Cols): Prominent Hero Property Photography */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="relative group rounded-3xl overflow-hidden border border-[#D5CEC1] bg-[#FAF8F2] shadow-2xl shadow-[#153D32]/10"
            >
              {/* Image Aspect Box */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#102C25]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/demo-projects/estatevista/hero-villa.svg"
                  alt="The Glass Pavilion Villa - Contemporary Luxury Architectural Villa at Twilight"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="eager"
                />

                {/* Ambient Bottom Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#102C25]/90 via-[#102C25]/20 to-transparent" />

                {/* Floating Architectural Badge */}
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#153D32]/90 border border-white/20 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#FAF8F2] backdrop-blur-md">
                    <Sparkles className="h-3 w-3 text-[#B89A63]" />
                    Featured Residence
                  </span>
                </div>

                {/* Bottom Property Info Strip */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#B89A63]">
                    Beverly Ridge Enclave, CA
                  </p>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-[#FAF8F2] leading-tight">
                    The Glass Pavilion Villa
                  </h3>
                  <div className="flex items-center justify-between text-xs text-[#FAF8F2]/90 mt-1">
                    <span>5 Beds &bull; 7 Baths &bull; 8,200 SQ FT</span>
                    <span className="font-serif font-bold text-[#B89A63] text-sm">
                      $8,450,000
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── Integrated Interactive Quick Search Bar ─────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="rounded-2xl border border-[#D5CEC1] bg-[#FAF8F2] p-4 sm:p-5 shadow-[0_12px_40px_-8px_rgba(21,61,50,0.08)] mb-12"
        >
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-center">
            {/* 1. Keyword / Location Search */}
            <div className="lg:col-span-4 relative">
              <label htmlFor="search-input" className="block text-[10px] font-bold uppercase tracking-wider text-[#7B817A] mb-1">
                Location or Keyword
              </label>
              <div className="relative flex items-center">
                <Search className="absolute left-3.5 h-4 w-4 text-[#7B817A]" />
                <input
                  id="search-input"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. Beverly, Penthouse, Waterfront..."
                  className="w-full rounded-xl border border-[#D5CEC1] bg-white py-2.5 pl-10 pr-3 text-xs text-[#222A25] placeholder:text-[#7B817A] focus:border-[#153D32] focus:outline-none focus:ring-1 focus:ring-[#153D32]"
                />
              </div>
            </div>

            {/* 2. Property Type */}
            <div className="lg:col-span-3 relative">
              <label htmlFor="type-select" className="block text-[10px] font-bold uppercase tracking-wider text-[#7B817A] mb-1">
                Property Category
              </label>
              <div className="relative">
                <select
                  id="type-select"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-[#D5CEC1] bg-white py-2.5 pl-3.5 pr-8 text-xs font-medium text-[#222A25] focus:border-[#153D32] focus:outline-none focus:ring-1 focus:ring-[#153D32] cursor-pointer"
                >
                  <option value="ALL">All Categories</option>
                  <option value="Luxury Villa">Luxury Villas</option>
                  <option value="Penthouse">Sky Penthouses</option>
                  <option value="Modern Residence">Modern Residences</option>
                  <option value="Commercial Estate">Commercial Estates</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7B817A]" />
              </div>
            </div>

            {/* 3. Price Tier */}
            <div className="lg:col-span-2 relative">
              <label htmlFor="price-select" className="block text-[10px] font-bold uppercase tracking-wider text-[#7B817A] mb-1">
                Price Budget
              </label>
              <div className="relative">
                <select
                  id="price-select"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-[#D5CEC1] bg-white py-2.5 pl-3.5 pr-8 text-xs font-medium text-[#222A25] focus:border-[#153D32] focus:outline-none focus:ring-1 focus:ring-[#153D32] cursor-pointer"
                >
                  <option value="ALL">Any Budget</option>
                  <option value="UNDER_4M">Under $4,000,000</option>
                  <option value="4M_8M">$4M &ndash; $8,000,000</option>
                  <option value="OVER_8M">$8,000,000+</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7B817A]" />
              </div>
            </div>

            {/* 4. Bedrooms */}
            <div className="lg:col-span-1 relative">
              <label htmlFor="beds-select" className="block text-[10px] font-bold uppercase tracking-wider text-[#7B817A] mb-1">
                Beds
              </label>
              <div className="relative">
                <select
                  id="beds-select"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-[#D5CEC1] bg-white py-2.5 pl-2.5 pr-6 text-xs font-medium text-[#222A25] focus:border-[#153D32] focus:outline-none focus:ring-1 focus:ring-[#153D32] cursor-pointer"
                >
                  <option value="ALL">Any</option>
                  <option value="3">3+ Beds</option>
                  <option value="4">4+ Beds</option>
                  <option value="5">5+ Beds</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#7B817A]" />
              </div>
            </div>

            {/* 5. Submit Button */}
            <div className="lg:col-span-2 pt-1 lg:pt-5">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#153D32] hover:bg-[#102C25] text-white py-2.5 px-4 text-xs font-bold shadow-sm transition-all hover:shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#153D32]"
              >
                <span>Find Residences</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#B89A63]" />
              </button>
            </div>
          </form>
        </motion.div>

        {/* ── Transparent Portfolio Metrics Strip ─────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 border-t border-[#D5CEC1] pt-8">
          <div>
            <div className="font-serif text-2xl sm:text-3xl font-medium text-[#153D32]">
              8 Estates
            </div>
            <div className="text-[11px] font-semibold text-[#626B63] uppercase tracking-wider mt-0.5">
              Curated Showcase Portfolio
            </div>
          </div>
          <div>
            <div className="font-serif text-2xl sm:text-3xl font-medium text-[#153D32]">
              4 Enclaves
            </div>
            <div className="text-[11px] font-semibold text-[#626B63] uppercase tracking-wider mt-0.5">
              Beverly, Tribeca, Malibu, Aspen
            </div>
          </div>
          <div>
            <div className="font-serif text-2xl sm:text-3xl font-medium text-[#153D32]">
              100% CAD
            </div>
            <div className="text-[11px] font-semibold text-[#626B63] uppercase tracking-wider mt-0.5">
              Interactive Room Floor Plans
            </div>
          </div>
          <div>
            <div className="font-serif text-2xl sm:text-3xl font-medium text-[#153D32]">
              Front-End Demo
            </div>
            <div className="text-[11px] font-semibold text-[#626B63] uppercase tracking-wider mt-0.5">
              Axivon Client Demonstration
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
