"use client";

import React, { useState } from "react";
import { MENU_CATEGORIES, MENU_ITEMS, MenuItem } from "@/data/foodiehub-data";
import { Sparkles, Utensils, Star } from "lucide-react";

export default function FoodieHubMenu() {
  const [activeCategory, setActiveCategory] = useState<string>("small-plates");

  const currentCategoryObj = MENU_CATEGORIES.find((c) => c.id === activeCategory) || MENU_CATEGORIES[0];
  const items = MENU_ITEMS.filter((item) => item.category === activeCategory);

  return (
    <section
      id="menu"
      aria-labelledby="menu-heading"
      className="relative bg-[#F8F3EA] py-16 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-[#68735A]">
            <Sparkles className="h-3.5 w-3.5 text-[#B85C38]" />
            <span>Curated Culinary Collection</span>
          </div>

          <h2
            id="menu-heading"
            className="mt-4 font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#24221F]"
          >
            Made to Be Savoured
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[#24221F]/80">
            Explore a sample menu inspired by contemporary Indian dining. Every dish
            highlights seasonal produce, artisanal spices, and heartfelt hospitality.
          </p>

          <p className="mt-1 text-xs text-[#68735A]">
            *Prices shown in INR (₹) are illustrative demonstration figures for this portfolio showcase.
          </p>
        </div>

        {/* Category Navigation Pills */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {MENU_CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                aria-pressed={isSelected}
                className={`rounded-full px-5 py-2.5 text-xs sm:text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B85C38] focus-visible:ring-offset-2 ${
                  isSelected
                    ? "bg-[#B85C38] text-white shadow-md"
                    : "border border-[#E2D8C3] bg-white text-[#24221F]/80 hover:border-[#B85C38]/40 hover:bg-[#F0E8D9] hover:text-[#24221F]"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Active Category Banner Description */}
        <div className="mx-auto mt-8 max-w-xl text-center">
          <p className="font-serif italic text-base sm:text-lg text-[#68735A]">
            "{currentCategoryObj.description}"
          </p>
        </div>

        {/* Menu Items Grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {items.map((item) => (
            <article
              key={item.id}
              className="group relative flex flex-col justify-between rounded-2xl border border-[#E8DFC9] bg-white p-6 sm:p-7 shadow-sm transition-all hover:border-[#B85C38]/40 hover:shadow-md"
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-[#24221F] transition-colors group-hover:text-[#B85C38]">
                      {item.name}
                    </h3>
                    {item.dietary && (
                      <span className="mt-1 inline-block rounded-md bg-[#F4EDE0] px-2 py-0.5 text-[11px] font-medium tracking-wide text-[#68735A]">
                        {item.dietary}
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="shrink-0 text-right">
                    <span className="font-serif text-lg font-bold text-[#B85C38]">
                      ₹{item.price}
                    </span>
                  </div>
                </div>

                <p className="mt-3 text-sm text-[#24221F]/70 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {item.isSignature && (
                <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-[#C9A86A]">
                  <Star className="h-3.5 w-3.5 fill-[#C9A86A]" />
                  <span>Chef's Signature Selection</span>
                </div>
              )}
            </article>
          ))}
        </div>

        {/* Bottom CTA for reservation */}
        <div className="mt-14 text-center">
          <p className="text-sm text-[#24221F]/70">
            Intrigued by our tasting menu? We welcome table reservations in advance.
          </p>
          <div className="mt-4">
            <a
              href="#reservations"
              className="inline-flex items-center gap-2 rounded-full bg-[#B85C38] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#9E4A28] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B85C38]"
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
