"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

export default function EduSmartDemoStrip() {
  return (
    <aside
      aria-label="Axivon Demo Showcase Context"
      className="sticky top-0 z-50 w-full border-b border-[#D6CDBF] bg-[#EDE8E0]/95 text-[#27232A] backdrop-blur-md transition-all shadow-[0_1px_3px_rgba(39,35,42,0.05)]"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2 text-xs sm:px-6 lg:px-8">
        {/* Left: Back to catalogue */}
        <Link
          href="/demo-projects"
          className="group inline-flex items-center gap-1.5 font-medium text-[#3B2A43] transition-colors hover:text-[#5A5260] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B2A43]"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5 text-[#3B2A43]" />
          <span className="tracking-wide">Back to All Projects</span>
        </Link>

        {/* Center: Demo Indicator */}
        <div className="hidden items-center gap-2.5 font-mono text-[11px] font-medium tracking-wider uppercase sm:flex text-[#5A5260]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#C4964C] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#C4964C]" />
          </span>
          <span>Axivon Showcase · Higher Education Web Architecture</span>
        </div>

        {/* Right: Contextual CTA */}
        <div className="flex items-center gap-3">
          <Link
            href="/contact?demo=EduSmart&industry=Education%20%26%20EdTech&service=web-development#contact-form"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#3B2A43] px-3.5 py-1 text-xs font-medium text-[#F7F3EB] shadow-xs transition-all hover:bg-[#4D3857] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B2A43] focus-visible:ring-offset-1"
          >
            <Sparkles className="h-3 w-3 text-[#C4964C]" />
            <span>Build a Similar Website</span>
            <ExternalLink className="h-3 w-3 ml-0.5 text-[#E8DDD0] opacity-80" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
