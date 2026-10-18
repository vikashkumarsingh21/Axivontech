"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, ExternalLink, LayoutDashboard, Download } from "lucide-react";

export default function NovaCartDemoStrip() {
  return (
    <aside
      aria-label="Axivon Demo Showcase Context"
      className="sticky top-0 z-50 w-full border-b border-[#DCDDD5] bg-[#E8EBE3]/90 text-[#1C1D1A] shadow-xs backdrop-blur-md transition-all"
    >
      <div className="mx-auto flex h-9.5 max-w-7xl items-center justify-between gap-3 px-4 text-xs sm:px-6 lg:px-8">
        {/* Left: Return to catalogue */}
        <Link
          href="/demo-projects"
          className="group inline-flex items-center gap-1.5 font-medium text-[#1C1D1A] transition-colors hover:text-[#696D66] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C1D1A]"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-1" />
          <span className="tracking-tight">Back to All Demos</span>
        </Link>

        {/* Center: Showcase identifier */}
        <div className="hidden items-center gap-3 font-mono text-[11px] font-semibold tracking-wider uppercase lg:flex">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#1C1D1A] opacity-40" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#1C1D1A]" />
          </span>
          <span className="text-[#1C1D1A]/80">
            SPECIMEN 05 <span className="text-[#696D66]">/</span> AXIVON COMMERCE
          </span>
        </div>

        {/* Right: Quick Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <Link
            href="/demo-projects/ecommerce/novacart/admin"
            className="group inline-flex items-center gap-1.5 rounded-full border border-[#DCDDD5] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#1C1D1A] shadow-xs transition-all hover:bg-[#F7F7F2]"
            title="Open isolated demo store administration dashboard"
          >
            <LayoutDashboard className="h-3 w-3 text-[#1C1D1A]" />
            <span className="hidden sm:inline">Demo Admin</span>
          </Link>

          <Link
            href="/application-demos/ecommerce"
            className="group inline-flex items-center gap-1.5 rounded-full border border-[#DCDDD5] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#1C1D1A] shadow-xs transition-all hover:bg-[#F7F7F2]"
            title="Download complete standalone E-commerce application package"
          >
            <Download className="h-3 w-3 text-[#1C1D1A]" />
            <span className="hidden sm:inline">Download Package</span>
          </Link>

          <Link
            href="/contact?demo=NovaCart&industry=E-Commerce%20%26%20Retail&service=web-development#contact-form"
            className="group inline-flex items-center gap-1.5 rounded-full bg-[#1C1D1A] px-3 py-1 text-[11px] font-semibold text-white shadow-xs transition-all duration-200 hover:bg-[#343630] hover:shadow-sm"
          >
            <Sparkles className="h-3 w-3 text-[#D8F16A]" />
            <span>Build a Similar Website</span>
            <ExternalLink className="h-3 w-3 opacity-60" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
