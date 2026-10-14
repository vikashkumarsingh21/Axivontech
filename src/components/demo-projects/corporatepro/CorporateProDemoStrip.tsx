"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, ArrowUpRight } from "lucide-react";

export default function CorporateProDemoStrip() {
  return (
    <aside
      aria-label="Axivon Demo Showcase Context"
      className="relative z-50 border-b border-[#29483B]/20 bg-[#141F19] text-xs text-[#E2E9E0]/80 antialiased"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-10">
        {/* Left: Axivon Demo Identifier */}
        <div className="flex items-center gap-3">
          <Link
            href="/demo-projects"
            className="group inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-[#E2E9E0] transition-all hover:border-[#B87352]/50 hover:bg-[#B87352]/10 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#B87352]"
          >
            <ArrowLeft className="h-3 w-3 text-[#B87352] transition-transform group-hover:-translate-x-0.5" />
            <span>Back to All Demo Projects</span>
          </Link>

          <span className="hidden sm:inline-block h-3.5 w-px bg-white/10" />

          <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#B87352]">
            <Sparkles className="h-3 w-3 text-[#B87352]" />
            <span>Axivon Showcase · CorporatePro</span>
          </div>
        </div>

        {/* Right: Contextual CTA */}
        <div className="flex items-center gap-3">
          <span className="hidden md:inline text-[11px] text-[#E2E9E0]/60">
            Need an editorial corporate presence?
          </span>
          <Link
            href="/contact?project=CorporatePro#contact-form"
            className="group inline-flex items-center gap-1.5 rounded-full bg-[#B87352] px-3.5 py-1 text-[11px] font-semibold text-white shadow-xs transition-all hover:bg-[#a66444] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B87352]/60"
          >
            <span>Commission This Platform</span>
            <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
