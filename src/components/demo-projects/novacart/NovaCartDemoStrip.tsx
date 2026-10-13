"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, ExternalLink } from "lucide-react";

export default function NovaCartDemoStrip() {
  return (
    <aside
      aria-label="Axivon Demo Showcase Context"
      className="sticky top-0 z-50 w-full border-b border-[#DCDDD5] bg-[#E8EBE3]/95 text-[#1C1D1A] shadow-xs backdrop-blur-md transition-all"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2 text-xs sm:px-6 lg:px-8">
        {/* Left: Return to catalogue */}
        <Link
          href="/demo-projects"
          className="group inline-flex items-center gap-1.5 font-medium text-[#1C1D1A] transition-colors hover:text-[#696D66] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1D1A]"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to All Demo Projects</span>
        </Link>

        {/* Center: Showcase identifier */}
        <div className="hidden items-center gap-2 font-mono font-medium tracking-wide uppercase sm:flex text-[11px]">
          <span className="inline-block h-2 w-2 rounded-full bg-[#1C1D1A] animate-pulse" />
          <span className="text-[#1C1D1A]/85">AXIVON TECHNOLOGIES · E-COMMERCE WEBSITE DEMO</span>
        </div>

        {/* Right: Lead CTA */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/contact?project=NovaCart#contact-form"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#1C1D1A] px-3.5 py-1 text-xs font-medium text-white shadow-xs transition-all hover:bg-[#343630] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1D1A] focus-visible:ring-offset-1"
          >
            <Sparkles className="h-3 w-3 text-[#D8F16A]" />
            <span>Build a Store Like This</span>
            <ExternalLink className="h-3 w-3 opacity-70" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
