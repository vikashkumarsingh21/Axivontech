"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight, Award, ShieldCheck, Users, BookOpen, Sparkles } from "lucide-react";

interface HeroProps {
  onApplyClick: () => void;
  onExploreAcademics: () => void;
}

export default function OakfieldHero({ onApplyClick, onExploreAcademics }: HeroProps) {
  return (
    <section id="hero" className="relative overflow-hidden bg-[#143d30] text-[#faf8f4] py-16 sm:py-24 lg:py-32">
      {/* Background Campus Image with Deep Forest Vignette */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/demo-assets/education/oakfield/hero-campus.webp"
          alt="Oakfield International School Sprawling 15-Acre Green Campus"
          fill
          priority
          className="object-cover object-center opacity-30 mix-blend-luminosity scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d2820] via-[#143d30]/90 to-[#143d30]/75" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          {/* Accreditation & Board Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#c8a24d]/40 bg-[#0f2e24]/90 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#c8a24d] shadow-sm mb-6">
            <Award className="h-3.5 w-3.5" />
            <span>CBSE Affiliated Senior Secondary School · Estd. 1998</span>
          </div>

          {/* Grand Heading */}
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#faf8f4] leading-[1.15]">
            Where Curiosity Thrives, <br />
            <span className="text-[#c8a24d] italic">Excellence Becomes Second Nature.</span>
          </h1>

          {/* Subtext */}
          <p className="mt-6 text-base sm:text-lg leading-relaxed text-[#d1dfd8] max-w-2xl font-light">
            Welcome to Oakfield International School. We blend rigorous CBSE academics with experiential STEM learning, world-class athletic infrastructure, and character-building values on a lush 15-acre campus.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={onApplyClick}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#c8a24d] px-7 py-3.5 text-sm font-bold text-[#0f2e24] shadow-lg shadow-[#c8a24d]/20 transition-all hover:bg-[#d8b560] hover:scale-105 active:scale-95"
            >
              <span>Admissions Open (2026–27)</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={onExploreAcademics}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/20"
            >
              <span>Explore Curriculum Wings</span>
            </button>
          </div>

          {/* Quick Pillars Row */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-white/15 pt-8 text-xs text-[#d1dfd8]">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#c8a24d]/20 text-[#c8a24d]">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <span className="block font-bold text-[#faf8f4] text-sm">15-Acre</span>
                <span>Green Campus</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#c8a24d]/20 text-[#c8a24d]">
                <Award className="h-4 w-4" />
              </div>
              <div>
                <span className="block font-bold text-[#faf8f4] text-sm">100%</span>
                <span>Board Pass Rate</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#c8a24d]/20 text-[#c8a24d]">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <span className="block font-bold text-[#faf8f4] text-sm">1:18</span>
                <span>Teacher-Student Ratio</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#c8a24d]/20 text-[#c8a24d]">
                <BookOpen className="h-4 w-4" />
              </div>
              <div>
                <span className="block font-bold text-[#faf8f4] text-sm">35+</span>
                <span>Clubs &amp; Sports</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
