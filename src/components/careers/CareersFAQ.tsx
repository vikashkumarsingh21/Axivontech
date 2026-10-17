"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { CAREERS_FAQS } from "@/data/careers";

interface CareersFAQProps {
  faqs?: { question: string; answer: string }[];
}

export default function CareersFAQ({ faqs }: CareersFAQProps = {}) {
  const faqList = faqs && faqs.length > 0 ? faqs : CAREERS_FAQS;
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-16 sm:py-24 bg-[#0B0D10] border-b border-[#1E2530]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10B981]/10 text-[#10B981] text-xs font-semibold uppercase tracking-wider mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Candidate FAQs</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-[#F3F5F7] tracking-tight mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-[#A7B0BC] leading-relaxed font-light">
            Everything you need to know about applying, remote workflows, and internship expectations.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3.5">
          {faqList.map((faq, idx) => {
            const isOpen = openIndex === idx;
            const contentId = `faq-content-${idx}`;
            const buttonId = `faq-button-${idx}`;

            return (
              <div
                key={idx}
                className="rounded-2xl bg-[#151A21] border border-[#29313B] overflow-hidden transition-colors"
              >
                <button
                  id={buttonId}
                  onClick={() => toggleAccordion(idx)}
                  aria-expanded={isOpen}
                  aria-controls={contentId}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981]/40"
                >
                  <span className="text-sm sm:text-base font-semibold text-[#F3F5F7]">
                    {faq.question}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-lg bg-[#1B222B] border border-[#29313B] flex items-center justify-center text-[#A7B0BC] shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-[#10B981]" : ""
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div
                    id={contentId}
                    role="region"
                    aria-labelledby={buttonId}
                    className="px-5 pb-5 sm:px-6 sm:pb-6 text-xs sm:text-sm text-[#A7B0BC] leading-relaxed font-light border-t border-[#1E2530] pt-4"
                  >
                    {faq.answer}
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
