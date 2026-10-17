"use client";

import React from "react";
import Link from "next/link";
import { Dumbbell, Sparkles, ArrowRight, PhoneCall } from "lucide-react";

interface FitZoneClosingCTAProps {
  onBookTrialClick?: () => void;
}

export default function FitZoneClosingCTA({
  onBookTrialClick,
}: FitZoneClosingCTAProps) {
  return (
    <section className="relative w-full overflow-hidden border-t border-[#2B3137] bg-gradient-to-b from-[#0B0D0F] via-[#171B1F] to-[#0B0D0F] py-24 sm:py-32">
      {/* Background Glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] sm:h-[700px] sm:w-[700px] rounded-full bg-[#FF7138]/15 blur-[140px]" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#FF7138]/30 bg-[#FF7138]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#FF7138] mb-6">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Your Transformation Starts Today</span>
        </div>

        <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-[#F6F4F0] leading-tight">
          READY TO ELEVATE <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF7138] via-[#FF934D] to-[#F6F4F0]">
            YOUR STANDARD?
          </span>
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-[#B5BBC2] leading-relaxed">
          Step into a compound designed for athletes who demand more. No
          crowds, no compromised equipment, no excuses.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={onBookTrialClick}
            className="group flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#FF7138] to-[#FF934D] px-8 py-4 text-sm font-extrabold uppercase tracking-wider text-[#0B0D0F] shadow-xl shadow-[#FF7138]/25 hover:shadow-2xl hover:shadow-[#FF7138]/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Sparkles className="h-4 w-4" />
            <span>Claim Free 1-Day Pass</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>

          <Link
            href="#membership"
            className="group flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl border border-[#2B3137] bg-[#171B1F] px-8 py-4 text-sm font-bold uppercase tracking-wider text-[#F6F4F0] hover:border-[#FF7138] hover:bg-[#20252A] active:scale-[0.98] transition-all"
          >
            <Dumbbell className="h-4 w-4 text-[#FF7138]" />
            <span>View Membership Tiers</span>
          </Link>
        </div>

        <div className="mt-8 flex items-center justify-center gap-3 text-xs text-[#858D96]">
          <PhoneCall className="h-3.5 w-3.5 text-[#FF7138]" />
          <span>Front Desk & Concierge: +1 (800) 555-FITZ (Open 5:00 AM – 11:00 PM)</span>
        </div>
      </div>
    </section>
  );
}
