"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, ArrowUpRight } from "lucide-react";

export default function CorporateProDemoStrip() {
  return (
    <aside
      aria-label="Axivon Demo Showcase Context"
      className="relative z-50 border-b border-[#262626] bg-[#0c0c0d] text-xs text-[#a1a1aa]"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-10">
        {/* Left: Axivon Demo Identifier */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/demo-projects"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#2a2a2e] bg-[#141416] px-2.5 py-1 text-[11px] font-medium text-[#d4d4d8] transition-colors hover:border-[#e8a064]/40 hover:bg-[#1a1a1e] hover:text-[#f4f4f5] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#e8a064]"
          >
            <ArrowLeft className="h-3 w-3 text-[#e8a064]" />
            <span>Back to All Demo Projects</span>
          </Link>

          <span className="hidden sm:inline-block h-3 w-px bg-[#262626]" />

          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#e8a064]">
            <Sparkles className="h-3 w-3 text-[#e8a064]" />
            <span>AXIVON PORTFOLIO PREVIEW · CORPORATEPRO</span>
          </div>
        </div>

        {/* Right: Contextual CTA */}
        <div className="flex items-center gap-2">
          <span className="hidden md:inline text-[11px] text-[#71717a]">
            Looking for a corporate presence?
          </span>
          <Link
            href="/contact?project=CorporatePro#contact-form"
            className="inline-flex items-center gap-1 rounded-full bg-[#e8a064] px-3 py-1 text-[11px] font-semibold text-[#0f0f0f] shadow-sm transition-all hover:bg-[#f0b07a] hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a064]/60"
          >
            <span>Build a Website Like This</span>
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
