"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getFeaturedProducts, getNewArrivals } from "@/data/novacart-data";
import ProductCard from "./ProductCard";

export default function NovaCartFeaturedSection() {
  const [activeTab, setActiveTab] = useState<"featured" | "new">("featured");

  const featured = getFeaturedProducts().slice(0, 8);
  const newArrivals = getNewArrivals().slice(0, 8);
  const displayedProducts = activeTab === "featured" ? featured : newArrivals;

  return (
    <section className="bg-[#F7F7F2] py-14 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header with Switcher Tabs */}
        <div className="flex flex-col justify-between gap-6 border-b border-[#DCDDD5] pb-8 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#696D66]">
                CURATED CATALOGUE / 02
              </span>
              <span className="h-1 w-1 rounded-full bg-[#1C1D1A]" />
              <span className="text-[11px] font-medium text-[#696D66]">
                Selective Edition
              </span>
            </div>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-[#1C1D1A] sm:text-3xl lg:text-4xl">
              Thoughtful Everyday Gear
            </h2>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center rounded-xl border border-[#DCDDD5] bg-[#E8EBE3]/70 p-1 backdrop-blur-xs">
            <button
              type="button"
              onClick={() => setActiveTab("featured")}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1D1A] ${
                activeTab === "featured"
                  ? "bg-[#1C1D1A] text-white shadow-xs"
                  : "text-[#696D66] hover:text-[#1C1D1A]"
              }`}
            >
              <Sparkles className={`h-3.5 w-3.5 ${activeTab === "featured" ? "text-[#D8F16A]" : "text-[#696D66]"}`} />
              <span>Featured Highlights</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("new")}
              className={`rounded-lg px-4 py-2 text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1D1A] ${
                activeTab === "new"
                  ? "bg-[#1C1D1A] text-white shadow-xs"
                  : "text-[#696D66] hover:text-[#1C1D1A]"
              }`}
            >
              <span>New Arrivals</span>
            </button>
          </div>
        </div>

        {/* Product Grid with AnimatePresence */}
        <div className="mt-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
            >
              {displayedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom CTA to shop all */}
        <div className="mt-14 flex flex-col items-center justify-center text-center">
          <Link
            href="/demo-projects/ecommerce/novacart/shop"
            className="group inline-flex items-center gap-2 rounded-lg border border-[#1C1D1A] bg-white px-7 py-3.5 text-xs font-black uppercase tracking-wider text-[#1C1D1A] shadow-xs transition-all duration-200 hover:bg-[#1C1D1A] hover:text-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1D1A]"
          >
            <span>View All 24 Catalogue Items</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
          <p className="mt-2.5 text-xs text-[#696D66]">
            Every product supports interactive cart, wishlist, and simulated checkout flow
          </p>
        </div>
      </div>
    </section>
  );
}
