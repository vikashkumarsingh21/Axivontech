"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, ExternalLink, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function MediCareDemoStrip() {
  return (
    <aside
      aria-label="Axivon Demo Showcase Context"
      className="sticky top-0 z-50 w-full border-b border-[#D4E8E0] bg-[#EAF6F2]/95 text-[#263746] shadow-[0_1px_3px_rgba(20,125,120,0.06)] backdrop-blur-md transition-all"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 text-xs sm:px-6 lg:px-8">
        {/* Left: Back to catalogue */}
        <Link
          href="/demo-projects"
          className="group inline-flex items-center gap-1.5 font-medium text-[#147D78] transition-colors hover:text-[#0F5C55] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#147D78] rounded-md px-1.5 py-0.5"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
          <span>Back to All Demos</span>
        </Link>

        {/* Center: Demo Indicator */}
        <div className="hidden items-center gap-2 font-mono text-[11px] font-semibold tracking-wider uppercase md:flex text-[#4A6577]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#147D78] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#147D78]" />
          </span>
          <span className="flex items-center gap-1.5">
            <span>AXIVON TECHNOLOGIES</span>
            <span className="text-[#8A9BAA]">/</span>
            <span className="text-[#147D78]">MEDICARE HEALTH CENTRE DEMO</span>
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#F0F7F4] px-2 py-0.5 text-[10px] font-medium text-[#147D78] border border-[#D4E8E0]">
            <ShieldCheck className="h-3 w-3" />
            Interactive Preview
          </span>
        </div>

        {/* Right: Direct inquiry CTA */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/contact?demo=MediCare&industry=Healthcare%20%26%20Medical&service=web-development#contact-form"
            className="group inline-flex items-center gap-1.5 rounded-full bg-[#147D78] px-3.5 py-1 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#0F5C55] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#147D78] focus-visible:ring-offset-1 active:scale-[0.98]"
          >
            <Sparkles className="h-3 w-3 transition-transform group-hover:rotate-12" />
            <span>Build a Similar Website</span>
            <ExternalLink className="h-3 w-3 opacity-70 transition-opacity group-hover:opacity-100" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
