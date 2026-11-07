"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, ShieldCheck } from "lucide-react";

export default function SolaraDemoStrip() {
  return (
    <aside
      aria-label="Demo Project Showcase Notice"
      className="sticky top-0 z-50 border-b border-[#b57a42]/30 bg-[#1b1916] px-4 py-2.5 text-xs text-[#f5efeb] shadow-md backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
        {/* Left: Identifier */}
        <div className="flex items-center gap-2">
          <Link
            href="/demo-projects"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 font-medium text-white transition-colors hover:bg-white/20"
          >
            <ArrowLeft className="h-3 w-3" />
            <span>All Demos</span>
          </Link>

          <span className="hidden sm:inline-block h-3 w-px bg-white/20" />

          <div className="flex items-center gap-1.5">
            <span className="flex h-2 w-2 rounded-full bg-[#b57a42] animate-pulse" />
            <span className="font-semibold text-[#c48b56]">AxivonTech Demo Showcase:</span>
            <span className="hidden md:inline text-white/90">
              Solara Retreat &amp; Resort · Luxury Hospitality &amp; Eco-Wellness Haven
            </span>
          </div>
        </div>

        {/* Center: Demo Disclaimer Tag */}
        <div className="hidden lg:flex items-center gap-1.5 text-white/70">
          <ShieldCheck className="h-3.5 w-3.5 text-[#c48b56]" />
          <span>Fictional luxury retreat demonstration. No real charges are made.</span>
        </div>

        {/* Right: CTA */}
        <div className="flex items-center gap-2">
          <Link
            href="/contact?demo=Solara%20Retreat%20%26%20Resort&industry=Hotels%20%26%20Travel&service=web-development#contact-form"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#b57a42] px-3.5 py-1 text-xs font-bold text-[#faf8f5] transition-all hover:bg-[#c98b56] shadow-sm"
          >
            <Sparkles className="h-3 w-3" />
            <span>Request Similar Resort Website</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
