"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Quote } from "lucide-react";

export default function NovaCartEditorialStory() {
  return (
    <section id="about-story" className="border-t border-[#DCDDD5] bg-white py-16 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left: Image Pair with floating quote */}
          <div className="lg:col-span-6">
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl border border-[#DCDDD5] bg-[#F7F7F2] shadow-lg sm:aspect-16/11">
              <Image
                src="/images/demo-projects/novacart/hero-lifestyle.jpg"
                alt="NovaCart studio workshop design philosophy and materials"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 ease-out hover:scale-103"
              />

              {/* Floating quote card */}
              <div className="absolute bottom-5 left-5 right-5 sm:right-auto sm:max-w-sm rounded-xl border border-white/60 bg-white/95 p-4 shadow-xl backdrop-blur-md">
                <Quote className="h-4 w-4 text-[#1C1D1A]" />
                <p className="mt-2 font-serif italic text-xs leading-relaxed text-[#1C1D1A]">
                  &ldquo;We don&apos;t engineer fleeting seasonal novelties. We obsess over twenty-four foundational objects that improve daily life through touch, durability, and quiet restraint.&rdquo;
                </p>
                <p className="mt-2 font-mono text-[10px] font-bold uppercase tracking-wider text-[#696D66]">
                  — NOVACART DESIGN ATELIER
                </p>
              </div>
            </div>
          </div>

          {/* Right: Editorial Narrative */}
          <div className="lg:col-span-6 lg:pl-4">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#696D66]">
                ETHOS & PHILOSOPHY / 03
              </span>
              <span className="h-1 w-1 rounded-full bg-[#1C1D1A]" />
              <span className="text-[11px] font-medium text-[#696D66]">
                Tactile Restraint
              </span>
            </div>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#1C1D1A] sm:text-4xl lg:text-5xl leading-[1.12]">
              Quiet utility. <br />
              <span className="font-light italic text-[#696D66]">Zero unnecessary</span> noise.
            </h2>

            <div className="mt-6 space-y-4 text-sm leading-relaxed text-[#696D66]">
              <p>
                NovaCart was conceptualized as a deliberate antidote to mass digital consumer churn. Rather than cycling through hundreds of ephemeral products, our studio curates a focused registry of twenty-four enduring items engineered to age with grace.
              </p>
              <p>
                From the thermal retention of a hand-cast ceramic pourover to the bead-blasted 316L stainless steel on your wrist, every edge and proportion is intentional. We work directly with specialized craft mills and ethical workshops across India and Japan.
              </p>
            </div>

            {/* Three key pillars */}
            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-[#DCDDD5] pt-6">
              <div>
                <p className="font-mono text-2xl font-black tracking-tight text-[#1C1D1A]">
                  100%
                </p>
                <p className="mt-0.5 text-xs text-[#696D66]">
                  Recycled Packaging
                </p>
              </div>
              <div className="border-l border-[#DCDDD5] pl-4">
                <p className="font-mono text-2xl font-black tracking-tight text-[#1C1D1A]">
                  24
                </p>
                <p className="mt-0.5 text-xs text-[#696D66]">
                  Curated Essentials
                </p>
              </div>
              <div className="border-l border-[#DCDDD5] pl-4">
                <p className="font-mono text-2xl font-black tracking-tight text-[#1C1D1A]">
                  ₹0
                </p>
                <p className="mt-0.5 text-xs text-[#696D66]">
                  Free Pan-India Delivery
                </p>
              </div>
            </div>

            <div className="mt-8">
              <Link
                href="/demo-projects/ecommerce/novacart/shop"
                className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1C1D1A] hover:text-[#696D66]"
              >
                <span>Explore the Complete Living Collection</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
