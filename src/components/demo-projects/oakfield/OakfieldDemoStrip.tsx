"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, Send, ShieldCheck } from "lucide-react";

export default function OakfieldDemoStrip() {
  return (
    <aside
      aria-label="Demo Project Showcase Notice"
      className="sticky top-0 z-50 border-b border-[#c8a24d]/30 bg-[#0f2e24] px-4 py-2.5 text-xs text-[#faf8f4] shadow-md backdrop-blur-md"
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
            <span className="flex h-2 w-2 rounded-full bg-[#c8a24d] animate-pulse" />
            <span className="font-semibold text-[#c8a24d]">AxivonTech Demo Showcase:</span>
            <span className="hidden md:inline text-white/90">
              Oakfield International School · CBSE K-12 Institutional Platform
            </span>
          </div>
        </div>

        {/* Center: Demo Disclaimer Tag */}
        <div className="hidden lg:flex items-center gap-1.5 text-white/70">
          <ShieldCheck className="h-3.5 w-3.5 text-[#c8a24d]" />
          <span>Fictional demonstration. Submissions are simulated.</span>
        </div>

        {/* Right: CTA */}
        <div className="flex items-center gap-2">
          <Link
            href="/contact?demo=Oakfield%20International%20School&industry=Education&service=web-development#contact-form"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#c8a24d] px-3.5 py-1 text-xs font-bold text-[#0f2e24] transition-all hover:bg-[#d8b560] shadow-sm"
          >
            <Sparkles className="h-3 w-3" />
            <span>Request Similar School Website</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
