"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";

export default function NovaCartHero() {
  return (
    <section className="relative overflow-hidden bg-[#F7F7F2] py-8 sm:py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Editorial Headline & Actions */}
          <div className="lg:col-span-6 xl:col-span-5">
            {/* Editorial overline */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#DCDDD5] bg-white px-3 py-1 text-xs font-semibold tracking-wide text-[#1C1D1A]">
              <Sparkles className="h-3 w-3 text-[#1C1D1A]" />
              <span className="uppercase tracking-wider text-[11px]">New 2026 Collection</span>
            </div>

            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-[#1C1D1A] sm:text-5xl lg:text-6xl xl:leading-[1.1]">
              Everyday essentials. <br />
              <span className="font-light italic text-[#696D66]">Extraordinary</span> design.
            </h1>

            <p className="mt-5 text-base sm:text-lg text-[#696D66] max-w-xl leading-relaxed">
              Explore thoughtfully selected products for the way you live, work, and express yourself. Engineered with timeless materials and purposeful minimalism.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
              <Link
                href="/demo-projects/ecommerce/novacart/shop"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-[#D8F16A] px-6 py-3.5 text-sm font-bold text-[#1C1D1A] shadow-xs transition-all hover:bg-[#c9e355] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1D1A] focus-visible:ring-offset-2"
              >
                <span>Shop Collection</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/demo-projects/ecommerce/novacart/shop?filter=new"
                className="inline-flex items-center justify-center rounded-md border border-[#DCDDD5] bg-white px-6 py-3.5 text-sm font-semibold text-[#1C1D1A] transition-colors hover:bg-[#E8EBE3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1D1A]"
              >
                Explore New Arrivals
              </Link>
            </div>

            {/* Micro value badges */}
            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-[#DCDDD5] pt-6 text-left">
              <div>
                <p className="text-xl font-extrabold text-[#1C1D1A]">24</p>
                <p className="text-xs text-[#696D66]">Curated Products</p>
              </div>
              <div>
                <p className="text-xl font-extrabold text-[#1C1D1A]">100%</p>
                <p className="text-xs text-[#696D66]">Ethical Sourcing</p>
              </div>
              <div>
                <p className="text-xl font-extrabold text-[#1C1D1A]">Fast</p>
                <p className="text-xs text-[#696D66]">Pan-India Shipping</p>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual composition */}
          <div className="lg:col-span-6 xl:col-span-7">
            <div className="relative aspect-4/3 sm:aspect-16/10 w-full overflow-hidden rounded-2xl border border-[#DCDDD5] bg-white shadow-xl">
              <Image
                src="/images/demo-projects/novacart/hero-lifestyle.jpg"
                alt="NovaCart curated modern lifestyle accessories flatlay"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover object-center"
              />

              {/* Floating editorial caption pill */}
              <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-xs rounded-xl border border-white/40 bg-white/95 p-3.5 shadow-lg backdrop-blur-md">
                <p className="text-[11px] font-semibold tracking-wider text-[#696D66] uppercase">
                  Featured Focus
                </p>
                <p className="text-xs font-bold text-[#1C1D1A] mt-0.5">
                  The Daily Commute & Workspace Edit
                </p>
                <p className="text-[11px] text-[#696D66] mt-0.5">
                  Precision gear designed for flow, quiet focus, and effortless movement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
