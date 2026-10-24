"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { PRICING_FAQS } from "@/config/pricing";

export default function PricingFAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="pricing-faq" className="py-16 sm:py-20 border-t border-[#1e1e1e]">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-mono font-medium text-[#A7B0BC] mb-3">
            <HelpCircle className="h-3.5 w-3.5 text-[#e8a064]" />
            <span>Clear Engagement Terms</span>
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[#F3F5F7]">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-[#A7B0BC] leading-relaxed">
            Straightforward answers about our deliverables, intellectual property ownership, and technical processes.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3.5">
          {PRICING_FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={idx}
                className="rounded-2xl border border-[#222730] bg-[#141414] overflow-hidden transition-colors hover:border-[#2d3440]"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full flex items-center justify-between p-5 sm:p-6 text-left focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="font-heading text-sm sm:text-base font-semibold text-[#F3F5F7] pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-[#e8a064] shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-xs sm:text-sm text-[#A7B0BC] leading-relaxed border-t border-white/5 pt-4">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
