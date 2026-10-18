"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, ExternalLink } from "lucide-react";

export default function FoodieHubDemoStrip() {
  return (
    <aside
      aria-label="Axivon Showcase Header Banner"
      className="sticky top-0 z-50 w-full border-b border-[#D4C9B9] bg-[#F0E8DA]/95 text-[#24221F] backdrop-blur-md transition-all"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2 text-xs sm:px-6 lg:px-8">
        {/* Left: Back to catalogue */}
        <Link
          href="/demo-projects"
          className="group inline-flex items-center gap-1.5 font-medium tracking-wide text-[#6B6560] transition-colors hover:text-[#B85C38] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B85C38]"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
          <span>All Demo Projects</span>
        </Link>

        {/* Center: Editorial Portfolio Marker */}
        <div className="hidden items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[#6B6560] sm:flex">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#B85C38] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#B85C38]" />
          </span>
          <span>Axivon Showcase</span>
          <span className="text-[#C4964C]">◆</span>
          <span className="text-[#24221F] font-semibold">Hospitality & Dining Editorial Concept</span>
        </div>

        {/* Right: Direct inquiry CTA */}
        <div className="flex items-center gap-3">
          <Link
            href="/contact?demo=FoodieHub&industry=Hospitality%20%26%20Dining&service=web-development#contact-form"
            className="group inline-flex items-center gap-1.5 rounded-full bg-[#B85C38] px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white shadow-sm transition-all hover:bg-[#9E4826] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B85C38]"
          >
            <Sparkles className="h-3 w-3 text-[#F8F3EA]" />
            <span>Build a Similar Website</span>
            <ExternalLink className="h-3 w-3 opacity-70 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
