"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { NOVACART_CATEGORIES } from "@/data/novacart-data";

export default function NovaCartCategoryGrid() {
  return (
    <section className="border-y border-[#DCDDD5] bg-white py-14 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-[#DCDDD5] pb-8 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#696D66]">
                DISCOVERY MATRIX / 01
              </span>
              <span className="h-1 w-1 rounded-full bg-[#1C1D1A]" />
              <span className="text-[11px] font-medium text-[#696D66]">
                4 Curated Spheres
              </span>
            </div>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-[#1C1D1A] sm:text-3xl lg:text-4xl">
              Shop by Category
            </h2>
          </div>
          <Link
            href="/demo-projects/ecommerce/novacart/shop"
            className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1C1D1A] hover:text-[#696D66]"
          >
            <span>Complete 24-Piece Catalogue</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
                  className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-106"
                />
                
                {/* Index tag */}
                <div className="absolute top-3.5 left-3.5 rounded-md bg-[#1C1D1A]/85 px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider text-white backdrop-blur-xs">
                  0{idx + 1}
                </div>

                {/* Arrow Badge with Citrus Lime Accent */}
                <div className="absolute top-3.5 right-3.5 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#1C1D1A] shadow-md transition-all duration-300 group-hover:bg-[#1C1D1A] group-hover:text-[#D8F16A]">
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>

              {/* Text Info */}
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#696D66]">
                    {cat.shortTag}
                  </span>
                  <span className="rounded-full bg-[#E8EBE3] px-2 py-0.5 text-[10px] font-bold text-[#1C1D1A] transition-colors group-hover:bg-[#D8F16A]">
                    {cat.itemCount} items
                  </span>
                </div>

                <h3 className="mt-2.5 text-base font-bold tracking-tight text-[#1C1D1A] transition-colors group-hover:text-[#1C1D1A]">
                  {cat.name}
                </h3>

                <p className="mt-1.5 text-xs leading-relaxed text-[#696D66] line-clamp-2">
                  {cat.description}
                </p>

                <div className="mt-5 flex items-center justify-between border-t border-[#DCDDD5]/80 pt-3 text-xs font-bold text-[#1C1D1A] transition-colors group-hover:text-[#696D66]">
                  <span>Explore Collection</span>
                  <span className="text-sm font-mono transition-transform duration-200 group-hover:translate-x-1">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
