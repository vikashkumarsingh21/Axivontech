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
    <section id="faqs" className="py-16 sm:py-24 bg-[#E6E0D4] border-b border-[#D5CEC1] relative">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-10">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[#B89A63] mb-2">
            <HelpCircle className="h-3 w-3" />
            <span>Buyer Advisory & Governance</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight text-[#222A25]">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-[#626B63] mt-2 leading-relaxed">
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
                className="rounded-xl border border-[#D5CEC1] bg-[#FAF8F2] overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between p-5 text-left text-sm font-serif font-bold text-[#222A25] hover:text-[#153D32] transition-colors"
                >
                  <span className="pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-[#B89A63] shrink-0 transition-transform duration-200 ${
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
                      className="border-t border-[#D5CEC1]/60 px-5 pb-5 pt-3"
                    >
                      <p className="text-xs sm:text-sm text-[#626B63] leading-relaxed">
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
