"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, ExternalLink } from "lucide-react";

export default function EduSmartDemoStrip() {
  return (
    <aside
      aria-label="Axivon Demo Showcase Context"
      className="sticky top-0 z-50 w-full border-b border-[#E8E1EB] bg-[#E8E1EB]/90 text-[#27232A] shadow-sm backdrop-blur-md transition-all"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2 text-xs sm:px-6 lg:px-8">
        {/* Left: Back to catalogue */}
        <Link
          href="/demo-projects"
          className="group inline-flex items-center gap-1.5 font-medium text-[#33243B] transition-colors hover:text-[#523A5E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#33243B]"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to All Projects</span>
        </Link>

        {/* Center: Demo Indicator */}
        <div className="hidden items-center gap-2 font-mono font-medium tracking-wide uppercase sm:flex">
          <span className="inline-block h-2 w-2 rounded-full bg-[#B89557] animate-pulse" />
          <span className="text-[#27232A]/85">AXIVON TECHNOLOGIES · EDUCATION WEBSITE DEMO</span>
        </div>

        {/* Right: Contextual CTA */}
        <div className="flex items-center gap-3">
          <Link
            href="/contact?project=EduSmart#contact-form"
            className="inline-flex items-center gap-1 rounded-full bg-[#33243B] px-3.5 py-1 font-medium text-white shadow-sm transition-all hover:bg-[#483353] hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#33243B] focus-visible:ring-offset-1"
          >
            <Sparkles className="h-3 w-3 text-[#B89557]" />
            <span>Build a Website Like This</span>
            <ExternalLink className="h-3 w-3 ml-0.5 opacity-80" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
