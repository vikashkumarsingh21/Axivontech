"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { REAL_ESTATE_FAQS } from "@/data/estatevista-properties";

export default function EstateVistaFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faqs" className="py-16 sm:py-24 bg-white border-b border-[#E4E0D7] relative">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-10">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[#C59B63] mb-2">
            <HelpCircle className="h-3 w-3" />
            <span>Buyer Advisory & Governance</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-[#1A211E]">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-[#5C6661] mt-2 leading-relaxed">
            Essential guidance regarding title verification, cross-border escrow, discrete off-market
            acquisitions, and private viewing protocols.
          </p>
        </div>

        {/* ── FAQ Accordion Stack ─────────────────────────────────────── */}
        <div className="space-y-3">
          {REAL_ESTATE_FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-[#E4E0D7] bg-[#F9F8F5] overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between p-5 text-left text-sm font-serif font-bold text-[#1A211E] hover:text-[#123C32] transition-colors"
                >
                  <span className="pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-[#C59B63] shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-[#E4E0D7]/60 px-5 pb-5 pt-3"
                    >
                      <p className="text-xs sm:text-sm text-[#5C6661] leading-relaxed">
                        {faq.answer}
                      </p>
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
