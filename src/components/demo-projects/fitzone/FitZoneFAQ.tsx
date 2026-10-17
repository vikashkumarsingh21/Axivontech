"use client";

import React, { useState } from "react";
import { FITZONE_FAQS } from "@/data/fitzone-data";
import { HelpCircle, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FitZoneFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section
      id="faqs"
      className="relative w-full border-t border-[#2B3137] bg-[#0B0D0F] py-20 lg:py-28"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#FF7138]/30 bg-[#FF7138]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-[#FF7138] mb-4">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Facility Transparency</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-[#F6F4F0] leading-tight">
            FREQUENTLY ASKED <br />
            <span className="text-[#FF7138]">QUESTIONS.</span>
          </h2>

          <p className="mt-4 text-sm sm:text-base text-[#B5BBC2] leading-relaxed">
            Everything you need to know about trial passes, cold plunge
            protocols, locker amenities, and membership terms.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {FITZONE_FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="overflow-hidden rounded-2xl border border-[#2B3137] bg-[#171B1F] transition-all duration-200 hover:border-[#FF7138]/50"
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(idx)}
                  className="flex w-full items-center justify-between p-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7138]"
                >
                  <span className="text-base sm:text-lg font-bold text-[#F6F4F0] pr-4">
                    {faq.question}
                  </span>
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-[#FF7138] border-[#FF7138]/40" : "text-[#B5BBC2]"
                    }`}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden border-t border-[#2B3137] bg-[#111417] px-6 py-5 text-sm text-[#B5BBC2] leading-relaxed"
                    >
                      <p>{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
