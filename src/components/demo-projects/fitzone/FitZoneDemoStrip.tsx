"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, ArrowUpRight } from "lucide-react";

export default function FitZoneDemoStrip() {
  return (
    <aside
      aria-label="Axivon Demo Showcase Context"
      className="relative z-50 border-b border-[#2B3137] bg-[#0B0D0F] text-xs text-[#B5BBC2] antialiased"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-10">
        {/* Left: Axivon Demo Identifier */}
        <div className="flex items-center gap-3">
          <Link
            href="/demo-projects"
            className="group inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-[#F6F4F0] transition-all hover:border-[#FF7138]/60 hover:bg-[#FF7138]/15 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FF7138]"
          >
            <ArrowLeft className="h-3 w-3 text-[#FF7138] transition-transform group-hover:-translate-x-0.5" />
            <span>Back to All Demo Projects</span>
          </Link>

          <span className="hidden sm:inline-block h-3.5 w-px bg-white/10" />

          <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#FF7138]">
            <Sparkles className="h-3 w-3 text-[#FF7138]" />
            <span>Axivon Showcase &middot; FitZone 3D Athletic Platform</span>
          </div>
        </div>

        {/* Right: Contextual CTA */}
        <div className="flex items-center gap-3">
          <span className="hidden md:inline text-[11px] text-[#B5BBC2]/70">
            Need an immersive gym, fitness, or wellness platform?
          </span>
          <Link
            href="/contact?project=FitZone#contact-form"
            className="group inline-flex items-center gap-1.5 rounded-full bg-[#FF7138] hover:bg-[#e65d26] px-3.5 py-1 text-[11px] font-bold text-white shadow-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7138]/60 active:scale-[0.98]"
          >
            <span>Commission This Platform</span>
            <ArrowUpRight className="h-3 w-3 text-white transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
