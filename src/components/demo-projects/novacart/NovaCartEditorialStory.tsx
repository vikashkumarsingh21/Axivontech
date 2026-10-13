"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function NovaCartEditorialStory() {
  return (
    <section id="about-story" className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          {/* Left: Image Pair */}
          <div className="lg:col-span-6">
            <div className="relative aspect-4/3 overflow-hidden rounded-2xl border border-[#DCDDD5] bg-[#F7F7F2] shadow-md">
              <Image
                src="/images/demo-projects/novacart/hero-lifestyle.jpg"
                alt="NovaCart studio workshop design philosophy"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>

          {/* Right: Editorial Narrative */}
          <div className="lg:col-span-6 lg:pl-6">
            <span className="text-xs font-bold uppercase tracking-wider text-[#696D66]">
              Design Ethos & Brand Philosophy
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1C1D1A] leading-tight">
              Quiet utility. <br />
              Zero unnecessary noise.
            </h2>
            <div className="mt-6 space-y-4 text-sm text-[#696D66] leading-relaxed">
              <p>
                NovaCart was conceptualized as a response to mass consumer clutter. Rather than producing hundreds of fleeting seasonal trends, we obsess over twenty-four foundational objects that improve daily life through touch, durability, and understated elegance.
              </p>
              <p>
                From the curvature of a ceramic coffee carafe that retains morning temperature to the weight of bead-blasted 316L stainless steel on your wrist, every proportion is intentional. We partner with specialized craft mills and ethical workshops across the globe.
              </p>
            </div>

            <div className="mt-8 flex items-center gap-6">
              <div>
                <p className="text-2xl font-black text-[#1C1D1A]">100%</p>
                <p className="text-xs text-[#696D66]">Plastic-free packaging</p>
              </div>
              <div className="h-8 w-px bg-[#DCDDD5]" />
              <div>
                <p className="text-2xl font-black text-[#1C1D1A]">24</p>
                <p className="text-xs text-[#696D66]">Disciplined essentials</p>
              </div>
              <div className="h-8 w-px bg-[#DCDDD5]" />
              <div>
                <p className="text-2xl font-black text-[#1C1D1A]">₹0</p>
                <p className="text-xs text-[#696D66]">Shipping on ₹2k+</p>
              </div>
            </div>

            <div className="mt-8">
              <Link
                href="/demo-projects/ecommerce/novacart/shop"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#1C1D1A] hover:underline underline-offset-4"
              >
                <span>Explore the Complete Living Collection</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
