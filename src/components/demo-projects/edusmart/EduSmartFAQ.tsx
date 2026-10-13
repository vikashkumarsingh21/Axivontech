"use client";

import React, { useState } from "react";
import { FAQ_ITEMS } from "@/data/edusmart-data";
import { Sparkles, ChevronDown } from "lucide-react";

export default function EduSmartFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  function toggleFAQ(idx: number) {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  }

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="relative bg-[#F7F3EB] py-16 md:py-24"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-[#B89557]">
            <Sparkles className="h-3.5 w-3.5 text-[#33243B]" />
            <span>Demonstration Clarifications</span>
          </div>

          <h2
            id="faq-heading"
            className="mt-3 font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#27232A]"
          >
            Frequently Asked Questions
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[#27232A]/80">
            Learn more about the purpose, technical architecture, and design principles
            behind this educational institution showcase.
          </p>
        </div>

        {/* Accordion List */}
        <div className="mt-12 space-y-4">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={item.question}
                className="overflow-hidden rounded-2xl border border-[#E8E1EB] bg-white shadow-sm transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(idx)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between p-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#33243B]"
                >
                  <span className="font-serif text-base sm:text-lg font-bold text-[#27232A]">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 text-[#B89557] shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="border-t border-[#F0EBE5] px-6 pb-6 pt-4 text-sm text-[#27232A]/80 leading-relaxed">
                    {item.answer}
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
