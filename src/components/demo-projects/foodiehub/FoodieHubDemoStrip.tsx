"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, ExternalLink } from "lucide-react";

export default function FoodieHubDemoStrip() {
  return (
    <aside
      aria-label="Axivon Demo Showcase Context"
      className="sticky top-0 z-50 w-full border-b border-[#E2D8C3] bg-[#EFE9DC] text-[#24221F] shadow-sm backdrop-blur-md transition-all"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2 text-xs sm:px-6 lg:px-8">
        {/* Left: Back to catalogue */}
        <Link
          href="/demo-projects"
          className="group inline-flex items-center gap-1.5 font-medium text-[#B85C38] transition-colors hover:text-[#8E4324] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B85C38]"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to All Projects</span>
        </Link>

        {/* Center: Demo Indicator */}
        <div className="hidden items-center gap-2 font-mono font-medium tracking-wide uppercase sm:flex">
          <span className="inline-block h-2 w-2 rounded-full bg-[#B85C38] animate-pulse" />
          <span className="text-[#24221F]/80">AXIVON TECHNOLOGIES · RESTAURANT WEBSITE DEMO</span>
        </div>

        {/* Right: Direct inquiry CTA */}
        <div className="flex items-center gap-3">
          <Link
            href="/contact?project=FoodieHub#contact-form"
            className="inline-flex items-center gap-1 rounded-full bg-[#B85C38] px-3.5 py-1 font-medium text-white shadow-sm transition-all hover:bg-[#9E4A28] hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B85C38] focus-visible:ring-offset-1"
          >
            <Sparkles className="h-3 w-3" />
            <span>Build a Website Like This</span>
            <ExternalLink className="h-3 w-3 ml-0.5 opacity-80" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
