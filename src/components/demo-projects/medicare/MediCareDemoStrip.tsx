"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, ExternalLink } from "lucide-react";

export default function MediCareDemoStrip() {
  return (
    <aside
      aria-label="Axivon Demo Showcase Context"
      className="sticky top-0 z-50 w-full border-b border-[#C9DED6] bg-[#EAF6F2] text-[#263746] shadow-sm backdrop-blur-md transition-all"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2 text-xs sm:px-6 lg:px-8">
        {/* Left: Back to catalogue */}
        <Link
          href="/demo-projects"
          className="group inline-flex items-center gap-1.5 font-medium text-[#147D78] transition-colors hover:text-[#0e5854] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#147D78]"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to All Projects</span>
        </Link>

        {/* Center: Demo Indicator */}
        <div className="hidden items-center gap-2 font-mono font-medium tracking-wide uppercase sm:flex">
          <span className="inline-block h-2 w-2 rounded-full bg-[#147D78] animate-pulse" />
          <span className="text-[#263746]/80">AXIVON TECHNOLOGIES · HEALTHCARE WEBSITE DEMO</span>
        </div>

        {/* Right: Direct inquiry CTA */}
        <div className="flex items-center gap-3">
          <Link
            href="/contact?project=MediCare#contact-form"
            className="inline-flex items-center gap-1 rounded-full bg-[#147D78] px-3 py-1 font-medium text-white shadow-sm transition-all hover:bg-[#0f605c] hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#147D78] focus-visible:ring-offset-1"
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
