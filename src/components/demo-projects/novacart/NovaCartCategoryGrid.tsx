"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { NOVACART_CATEGORIES } from "@/data/novacart-data";

export default function NovaCartCategoryGrid() {
  return (
    <section className="bg-white py-12 sm:py-16 lg:py-20 border-t border-b border-[#DCDDD5]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#696D66]">
              Curated Collections
            </p>
            <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1C1D1A]">
              Shop by Category
            </h2>
          </div>
          <Link
            href="/demo-projects/ecommerce/novacart/shop"
            className="group inline-flex items-center gap-1.5 text-xs font-semibold text-[#1C1D1A] hover:underline underline-offset-4"
          >
            <span>Browse Complete Catalogue (24 Products)</span>
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {NOVACART_CATEGORIES.map((cat, idx) => (
            <Link
              key={cat.id}
              href={`/demo-projects/ecommerce/novacart/category/${cat.slug}`}
              className="group relative flex flex-col overflow-hidden rounded-xl border border-[#DCDDD5] bg-[#F7F7F2] transition-all duration-300 hover:border-[#1C1D1A] hover:shadow-lg"
            >
              {/* Category Image Box */}
              <div className="relative aspect-4/3 w-full overflow-hidden bg-[#E8EBE3]">
                <Image
                  src={cat.image}
                  alt={`${cat.name} collection category photography`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-108"
                />
                {/* Index tag */}
                <div className="absolute top-3 left-3 rounded-sm bg-[#1C1D1A]/80 px-2 py-0.5 text-[10px] font-mono font-semibold text-white backdrop-blur-xs">
                  0{idx + 1}
                </div>
                {/* Arrow Badge */}
                <div className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#1C1D1A] opacity-0 transition-all duration-200 group-hover:opacity-100 shadow-sm">
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </div>

              {/* Text Info */}
              <div className="flex flex-1 flex-col p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold tracking-wider text-[#696D66] uppercase">
                    {cat.shortTag}
                  </span>
                  <span className="rounded-full bg-[#E8EBE3] px-2 py-0.5 text-[10px] font-semibold text-[#1C1D1A]">
                    {cat.itemCount} items
                  </span>
                </div>

                <h3 className="mt-2 text-base font-bold text-[#1C1D1A] group-hover:underline underline-offset-2">
                  {cat.name}
                </h3>

                <p className="mt-1.5 text-xs text-[#696D66] line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>

                <div className="mt-4 pt-3 border-t border-[#DCDDD5]/60 flex items-center text-xs font-semibold text-[#1C1D1A] group-hover:text-[#696D66] transition-colors">
                  <span>Explore Collection</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
