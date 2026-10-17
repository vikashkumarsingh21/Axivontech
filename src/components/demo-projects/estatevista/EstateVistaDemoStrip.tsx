"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, ArrowUpRight } from "lucide-react";

export default function EstateVistaDemoStrip() {
  return (
    <aside
      aria-label="Axivon Demo Showcase Context"
      className="relative z-50 border-b border-[#123C32]/20 bg-[#0A1612] text-xs text-[#E4EDE8]/85 antialiased"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-10">
        {/* Left: Axivon Demo Identifier */}
        <div className="flex items-center gap-3">
          <Link
            href="/demo-projects"
            className="group inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-[#E4EDE8] transition-all hover:border-[#C59B63]/60 hover:bg-[#C59B63]/15 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C59B63]"
          >
            <ArrowLeft className="h-3 w-3 text-[#C59B63] transition-transform group-hover:-translate-x-0.5" />
            <span>Back to All Demo Projects</span>
          </Link>

          <span className="hidden sm:inline-block h-3.5 w-px bg-white/10" />

          <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#C59B63]">
            <Sparkles className="h-3 w-3 text-[#C59B63]" />
            <span>Axivon Showcase &middot; EstateVista Real Estate Platform</span>
          </div>
        </div>

        {/* Right: Contextual CTA */}
        <div className="flex items-center gap-3">
          <span className="hidden md:inline text-[11px] text-[#E4EDE8]/60">
            Need an enterprise real estate brokerage or prop-tech portal?
          </span>
          <Link
            href="/contact?project=EstateVista#contact-form"
            className="group inline-flex items-center gap-1.5 rounded-full bg-[#123C32] px-3.5 py-1 text-[11px] font-semibold text-white border border-[#23584B] shadow-xs transition-all hover:bg-[#184E41] hover:border-[#C59B63]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C59B63]/60"
          >
            <span>Commission This Platform</span>
            <ArrowUpRight className="h-3 w-3 text-[#C59B63] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
