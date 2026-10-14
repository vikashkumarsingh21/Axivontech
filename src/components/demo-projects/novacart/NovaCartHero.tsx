"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, Compass } from "lucide-react";
import { motion } from "framer-motion";

export default function NovaCartHero() {
  return (
    <section className="relative overflow-hidden bg-[#F7F7F2] py-10 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-14">
          {/* Left Column: Editorial Headline & Actions */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 xl:col-span-5"
          >
            {/* Editorial overline badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#DCDDD5] bg-white px-3.5 py-1 text-xs font-semibold tracking-wide text-[#1C1D1A] shadow-2xs">
              <span className="flex h-1.5 w-1.5 rounded-full bg-[#1C1D1A]" />
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#696D66]">
                EDITION 2026
              </span>
              <span className="text-[#DCDDD5]">|</span>
              <span className="text-[11px] font-bold text-[#1C1D1A]">
                Disciplined Everyday Objects
              </span>
            </div>

            {/* Impactful Typography */}
            <h1 className="mt-6 text-4xl font-black tracking-[-0.035em] text-[#1C1D1A] sm:text-5xl lg:text-6xl xl:text-[64px] xl:leading-[1.08]">
              Everyday objects. <br />
              <span className="font-light italic text-[#696D66]">Extraordinary</span> form.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-[#696D66] sm:text-lg">
              A curated catalog of twenty-four intentional essentials for the way you live, create, and travel. Engineered with tactile materiality, durable mechanics, and zero unnecessary noise.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-3.5 sm:gap-4">
              <Link
                href="/demo-projects/ecommerce/novacart/shop"
                className="group inline-flex items-center justify-center gap-2 rounded-lg bg-[#D8F16A] px-6 py-3.5 text-xs font-black uppercase tracking-wider text-[#1C1D1A] shadow-xs transition-all duration-200 hover:bg-[#c9e355] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1D1A] focus-visible:ring-offset-2"
              >
                <span>Explore Complete Index</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>

              <Link
                href="/demo-projects/ecommerce/novacart/shop?filter=new"
                className="inline-flex items-center justify-center rounded-lg border border-[#DCDDD5] bg-white px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-[#1C1D1A] shadow-2xs transition-all duration-200 hover:border-[#1C1D1A] hover:bg-[#E8EBE3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1D1A]"
              >
                New 2026 Arrivals
              </Link>
            </div>

            {/* Micro curated metrics */}
            <div className="mt-12 grid grid-cols-3 gap-6 border-t border-[#DCDDD5] pt-7 text-left">
              <div>
                <p className="font-mono text-2xl font-black tracking-tight text-[#1C1D1A]">
                  24
                </p>
                <p className="mt-0.5 text-xs font-medium text-[#696D66]">
                  Curated Essentials
                </p>
              </div>
              <div>
                <p className="font-mono text-2xl font-black tracking-tight text-[#1C1D1A]">
                  100%
                </p>
                <p className="mt-0.5 text-xs font-medium text-[#696D66]">
                  Ethical Provenance
                </p>
              </div>
              <div>
                <p className="font-mono text-2xl font-black tracking-tight text-[#1C1D1A]">
                  ₹0
                </p>
                <p className="mt-0.5 text-xs font-medium text-[#696D66]">
                  Free Ship on ₹2k+
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Hero Visual Composition */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 xl:col-span-7"
          >
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl border border-[#DCDDD5] bg-white shadow-xl sm:aspect-16/11">
              <Image
                src="/images/demo-projects/novacart/hero-lifestyle.jpg"
                alt="NovaCart curated modern lifestyle accessories flatlay"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover object-center transition-transform duration-700 ease-out hover:scale-103"
              />

              {/* Top Studio Stamp */}
              <div className="absolute top-4 right-4 hidden items-center gap-1.5 rounded-full border border-white/40 bg-white/90 px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-[#1C1D1A] shadow-xs backdrop-blur-md sm:flex">
                <Compass className="h-3 w-3 text-[#1C1D1A]" />
                <span>STUDIO DISPATCH · BANGALORE</span>
              </div>

              {/* Floating editorial caption pill */}
              <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/60 bg-white/95 p-4 shadow-xl backdrop-blur-md sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-sm">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#696D66]">
                    SPECIMEN FOCUS / 01
                  </span>
                  <span className="rounded bg-[#D8F16A] px-1.5 py-0.5 text-[9px] font-black uppercase text-[#1C1D1A]">
                    IN STOCK
                  </span>
                </div>
                <h3 className="mt-1 text-sm font-bold text-[#1C1D1A]">
                  The Daily Commute & Workspace Edit
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-[#696D66]">
                  Aerospace-grade aluminum, vegetable-tanned leather, and matte mechanical hardware.
                </p>
                <div className="mt-3 flex items-center justify-between border-t border-[#DCDDD5]/60 pt-2 text-[11px]">
                  <span className="font-semibold text-[#1C1D1A]">Tactile Minimalism</span>
                  <Link
                    href="/demo-projects/ecommerce/novacart/shop"
                    className="font-bold text-[#1C1D1A] underline underline-offset-2 hover:text-[#696D66]"
                  >
                    View Selection →
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
