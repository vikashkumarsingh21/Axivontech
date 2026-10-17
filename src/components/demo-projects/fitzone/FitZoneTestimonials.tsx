"use client";

import React from "react";
import { FITZONE_TESTIMONIALS } from "@/data/fitzone-data";
import { Quote, Star, Sparkles, TrendingUp } from "lucide-react";

export default function FitZoneTestimonials() {
  return (
    <section
      id="testimonials"
      className="relative w-full border-t border-[#2B3137] bg-[#0B0D0F] py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#FF7138]/30 bg-[#FF7138]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-[#FF7138] mb-4">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Proven Transformation Metrics</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-[#F6F4F0] leading-tight">
            RESULTS DOCUMENTED <br />
            <span className="text-[#FF7138]">BY BIOMETRIC DATA.</span>
          </h2>

          <p className="mt-4 text-sm sm:text-base text-[#B5BBC2] leading-relaxed">
            Real progress is measured in pounds of lean mass gained, seconds
            shaved off split times, and chronic joint tension eliminated.
          </p>
        </div>

        {/* Testimonials 3-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {FITZONE_TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              className="group relative flex flex-col justify-between rounded-2xl border border-[#2B3137] bg-[#171B1F] p-8 transition-all duration-300 hover:border-[#FF7138] hover:bg-[#20252A] hover:shadow-2xl hover:shadow-[#FF7138]/10"
            >
              <div>
                {/* Metric Badge */}
                <div className="flex items-center justify-between mb-6">
                  <span className="rounded-full bg-[#48D597]/15 border border-[#48D597]/30 px-3 py-1 text-xs font-black uppercase tracking-wide text-[#48D597]">
                    {t.metric}
                  </span>
                  <div className="flex text-[#FF7138]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-[#FF7138]" />
                    ))}
                  </div>
                </div>

                {/* Quote */}
                <Quote className="h-6 w-6 text-[#FF7138]/40 mb-3" />
                <p className="text-sm text-[#F6F4F0] leading-relaxed italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              {/* Author Meta */}
              <div className="mt-8 pt-6 border-t border-[#2B3137]">
                <h4 className="text-base font-black uppercase tracking-tight text-[#F6F4F0] group-hover:text-[#FF7138] transition-colors">
                  {t.athleteName}
                </h4>
                <p className="text-xs text-[#FF934D] font-medium mt-0.5">
                  {t.program}
                </p>
                <p className="text-[11px] text-[#858D96] mt-0.5">
                  {t.memberType}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
