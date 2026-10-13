"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getFeaturedProducts, getNewArrivals } from "@/data/novacart-data";
import ProductCard from "./ProductCard";

export default function NovaCartFeaturedSection() {
  const [activeTab, setActiveTab] = useState<"featured" | "new">("featured");

  const featured = getFeaturedProducts().slice(0, 8);
  const newArrivals = getNewArrivals().slice(0, 8);
  const displayedProducts = activeTab === "featured" ? featured : newArrivals;

  return (
    <section className="bg-[#F7F7F2] py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header with Switcher Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-[#DCDDD5]">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#696D66]">
              Selected Highlights
            </p>
            <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1C1D1A]">
              Thoughtful Everyday Gear
            </h2>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-2 rounded-lg bg-[#E8EBE3] p-1">
            <button
              type="button"
              onClick={() => setActiveTab("featured")}
              className={`rounded-md px-4 py-1.5 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1D1A] ${
                activeTab === "featured"
                  ? "bg-[#1C1D1A] text-white shadow-xs"
                  : "text-[#696D66] hover:text-[#1C1D1A]"
              }`}
            >
              Featured Essentials
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("new")}
              className={`rounded-md px-4 py-1.5 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1D1A] ${
                activeTab === "new"
                  ? "bg-[#1C1D1A] text-white shadow-xs"
                  : "text-[#696D66] hover:text-[#1C1D1A]"
              }`}
            >
              New Arrivals
            </button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {displayedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Bottom CTA to shop all */}
        <div className="mt-12 text-center">
          <Link
            href="/demo-projects/ecommerce/novacart/shop"
            className="inline-flex items-center gap-2 rounded-md border border-[#1C1D1A] bg-white px-6 py-3 text-sm font-semibold text-[#1C1D1A] transition-colors hover:bg-[#1C1D1A] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1D1A]"
          >
            <span>View All 24 Products</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
