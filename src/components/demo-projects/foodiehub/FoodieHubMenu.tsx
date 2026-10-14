"use client";

import React, { useState } from "react";
import { MENU_CATEGORIES, MENU_ITEMS, MenuItem } from "@/data/foodiehub-data";
import { Sparkles, Utensils, Star, Leaf } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FoodieHubMenu() {
  const [activeCategory, setActiveCategory] = useState<string>("small-plates");

  const currentCategoryObj =
    MENU_CATEGORIES.find((c) => c.id === activeCategory) || MENU_CATEGORIES[0];
  const items = MENU_ITEMS.filter((item) => item.category === activeCategory);

  return (
    <section
      id="menu"
      aria-labelledby="menu-heading"
      className="relative bg-[#F8F3EA] py-20 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-[#6B6560]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#B85C38]" />
            <span>The Seasonal Repertoire</span>
          </div>

          <h2
            id="menu-heading"
            className="mt-4 font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#24221F]"
          >
            A Menu Crafted to be Savoured
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[#6B6560]">
            Every recipe is rooted in seasonal micro-harvests, single-estate botanicals, and
            unhurried kitchen preparations.
          </p>

          <p className="mt-2 font-mono text-[11px] text-[#9E9790]">
            *Prices in INR (₹) are presented for this Axivon Technologies digital portfolio showcase.
          </p>
        </div>

        {/* Category Navigation Pills */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {MENU_CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                aria-pressed={isSelected}
                className={`relative rounded-full px-5 py-2.5 text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B85C38] ${
                  isSelected
                    ? "bg-[#B85C38] text-white shadow-md"
                    : "border border-[#D4C9B9] bg-[#F0E8DA]/80 text-[#6B6560] hover:border-[#B85C38]/50 hover:bg-white hover:text-[#24221F]"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Category Narrative Banner */}
        <div className="mx-auto mt-8 max-w-xl text-center">
          <p className="font-serif italic text-base sm:text-lg text-[#6B6560]">
            “{currentCategoryObj.description}”
          </p>
        </div>

        {/* Menu Items Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-2"
          >
            {items.map((item) => (
              <article
                key={item.id}
                className={`group relative flex flex-col justify-between rounded-2xl border p-6 sm:p-7 shadow-sm transition-all duration-300 hover:shadow-md ${
                  item.isSignature
                    ? "border-[#C4964C]/60 bg-gradient-to-br from-[#F8F3EA] to-[#F0E8DA]"
                    : "border-[#D4C9B9] bg-white hover:border-[#B85C38]/40"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif text-lg sm:text-xl font-bold text-[#24221F] transition-colors group-hover:text-[#B85C38]">
                          {item.name}
                        </h3>
                      </div>

                      {item.dietary && (
                        <span className="mt-1.5 inline-flex items-center gap-1 rounded-md border border-[#D4C9B9] bg-[#F0E8DA] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#6B6560]">
                          <Leaf className="h-2.5 w-2.5 text-[#B85C38]" />
                          <span>{item.dietary}</span>
                        </span>
                      )}
                    </div>

                    {/* Price with editorial dot leader */}
                    <div className="shrink-0 text-right">
                      <span className="font-serif text-xl font-bold text-[#B85C38]">
                        ₹{item.price}
                      </span>
                    </div>
                  </div>

                  <p className="mt-3 text-sm text-[#6B6560] leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {item.isSignature && (
                  <div className="mt-5 flex items-center justify-between border-t border-[#D4C9B9]/50 pt-3">
                    <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#C4964C]">
                      <Star className="h-3.5 w-3.5 fill-[#C4964C]" />
                      <span>Chef's Signature Selection</span>
                    </div>
                    <span className="text-[10px] uppercase tracking-widest text-[#9E9790]">
                      Crafted In-House
                    </span>
                  </div>
                )}
              </article>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Bottom Reservation Callout */}
        <div className="mt-16 rounded-2xl border border-[#D4C9B9] bg-[#F0E8DA] p-8 text-center sm:p-10">
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#24221F]">
            Joining Us for Dinner?
          </h3>
          <p className="mt-2 text-sm text-[#6B6560] max-w-lg mx-auto">
            Our evening tasting menus require careful preparation. We recommend reserving
            at least 24 hours in advance to guarantee an unhurried table.
          </p>
          <div className="mt-6">
            <a
              href="#reservations"
              className="inline-flex items-center gap-2 rounded-full bg-[#B85C38] px-7 py-3 text-xs uppercase tracking-wider font-semibold text-white shadow-sm transition-all hover:bg-[#9E4826] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B85C38]"
            >
              <Utensils className="h-4 w-4" />
              <span>Book Table for Dining</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
