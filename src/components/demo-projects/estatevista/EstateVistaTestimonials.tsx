"use client";

import React from "react";
import { Sparkles, Quote, Award, Building2 } from "lucide-react";
import { ESTATEVISTA_TESTIMONIALS } from "@/data/estatevista-properties";

export default function EstateVistaTestimonials() {
  return (
    <section className="py-16 sm:py-24 bg-[#F0EDE5] border-b border-[#D5CEC1] relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        {/* Section Heading */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[#B89A63] mb-2">
            <Award className="h-3 w-3" />
            <span>Fiduciary Client Advisory</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-[#222A25]">
            Client Experiences & Case Vignettes
          </h2>
          <p className="text-sm text-[#626B63] mt-2 leading-relaxed">
            Excerpts from architectural acquisitions, family office transactions, and corporate
            campus selections represented through the EstateVista platform.
          </p>
        </div>

        {/* ── Testimonial Cards Grid ─────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ESTATEVISTA_TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              className="flex flex-col justify-between rounded-2xl border border-[#D5CEC1] bg-[#FAF8F2] p-6 sm:p-7 shadow-2xs relative"
            >
              <div>
                <Quote className="h-6 w-6 text-[#B89A63]/60 mb-4" />
                <p className="text-xs sm:text-sm text-[#626B63] leading-relaxed italic mb-6">
                  &ldquo;{t.statement}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-[#D5CEC1]">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#B89A63] mb-0.5">
                  {t.clientLabel}
                </div>
                <div className="font-serif text-sm font-bold text-[#222A25]">
                  {t.acquiredProperty}
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#7B817A] mt-1">
                  <span>{t.location}</span>
                  <span className="font-semibold text-[#153D32]">{t.metric}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Clear Demonstration Attribute Notice */}
        <div className="mt-8 text-center text-[10px] text-[#7B817A] italic">
          * Note: Vignettes and client labels shown above are realistic sample profiles prepared for
          demonstration and platform capabilities evaluation.
        </div>
      </div>
    </section>
  );
}
