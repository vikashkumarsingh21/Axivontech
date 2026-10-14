// src/components/demo-projects/leadpilot/LeadPilotDemoStrip.tsx
"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, ArrowUpRight, ShieldCheck } from "lucide-react";

export default function LeadPilotDemoStrip() {
  return (
    <aside
      aria-label="Axivon Showcase Context"
      className="relative z-50 border-b border-[#252925]/15 bg-[#1C201C] text-xs text-[#E5F0EB]/90 antialiased"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:px-8">
        {/* Left: Axivon Demo Identifier */}
        <div className="flex items-center gap-3">
          <Link
            href="/demo-projects"
            className="group inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-[#E5F0EB] transition-all hover:border-[#2F806A]/50 hover:bg-[#2F806A]/20 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#2F806A]"
          >
            <ArrowLeft className="h-3 w-3 text-[#2F806A] transition-transform group-hover:-translate-x-0.5" />
            <span>Back to All Demo Projects</span>
          </Link>

          <span className="hidden sm:inline-block h-3.5 w-px bg-white/15" />

          <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#DDA34B]">
            <Sparkles className="h-3 w-3 text-[#DDA34B]" />
            <span>Axivon Showcase · LeadPilot CRM Demo</span>
          </div>

          <div className="hidden lg:flex items-center gap-1 text-[11px] text-[#A2A9A3]">
            <ShieldCheck className="h-3 w-3 text-[#2F806A]" />
            <span>Fictional sample data · Frontend prototype</span>
          </div>
        </div>

        {/* Right: Contextual CTA */}
        <div className="flex items-center gap-3">
          <span className="hidden md:inline text-[11px] text-[#C0C8C2]">
            Need a custom B2B CRM or SaaS platform?
          </span>
          <Link
            href="/contact?project=LeadPilot#contact-form"
            className="group inline-flex items-center gap-1.5 rounded-full bg-[#2F806A] px-3.5 py-1 text-[11px] font-semibold text-white shadow-xs transition-all hover:bg-[#266b58] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F806A]/60"
          >
            <span>Build a CRM Like This</span>
            <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
