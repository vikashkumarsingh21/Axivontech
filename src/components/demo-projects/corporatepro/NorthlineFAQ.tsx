"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FAQItem } from "./types";

const FAQ_ITEMS: FAQItem[] = [
  {
    id: "faq-1",
    question: "What types of businesses does Northline Advisory typically partner with?",
    answer: "Northline Advisory works primarily with established mid-market enterprises and B2B organisations across industrial manufacturing, technical logistics, professional services, and high-growth B2B technology. We are typically retained during pivotal transitions—such as cross-facility expansion, operational friction, or leadership transitions requiring objective external counsel."
  },
  {
    id: "faq-2",
    question: "What does an advisory engagement typically look like in practice?",
    answer: "Every engagement begins with an objective discovery sprint (4 to 8 weeks) to evaluate baseline operations, data integrity, and leadership alignment. Following discovery, we produce a sequenced roadmap with clearly demarcated milestones. Depending on client requirements, we then serve as embedded advisory counsel to govern implementation and build internal capacity."
  },
  {
    id: "faq-3",
    question: "Can an engagement begin with a focused diagnostic assessment?",
    answer: "Yes. Many client relationships begin with a targeted diagnostic assessment. This allows your executive team to experience our working style, test our analytical rigor, and receive an actionable assessment before committing to broader multi-quarter advisory programs."
  },
  {
    id: "faq-4",
    question: "How do your advisors interact with our internal leadership and staff?",
    answer: "We operate with total discretion and respect for your team's institutional expertise. Rather than imposing rigid textbook mandates, our senior partners work alongside your managers and operational leads, facilitating alignment and coaching internal champions to ensure changes stick permanently."
  },
  {
    id: "faq-5",
    question: "How does this demonstration reflect Axivon Technologies' development capabilities?",
    answer: "This CorporatePro website is a fully interactive, production-ready frontend showcase engineered by Axivon Technologies. It demonstrates our capability to design bespoke B2B corporate platforms with editorial typography, strict accessibility compliance, responsive precision, and tailored design systems."
  }
];

export default function NorthlineFAQ() {
  const [openId, setOpenId] = useState<string | null>("faq-1");

  const toggleItem = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  const handleScrollToContact = (e: React.MouseEvent) => {
    e.preventDefault();
    const contactElem = document.querySelector("#contact");
    if (contactElem) {
      contactElem.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section
      id="faq"
      aria-label="Frequently Asked Questions"
      className="relative bg-white py-20 sm:py-28 border-b border-[#29483B]/10"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 mb-4 justify-center">
            <span className="h-px w-7 bg-[#B87352]" />
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.24em] text-[#B87352]">
              CLARIFICATIONS & FAQ
            </span>
            <span className="h-px w-7 bg-[#B87352]" />
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#252925] leading-tight mb-4">
            Frequently Asked Questions
          </h2>

          <p className="text-sm sm:text-base text-[#252925]/75 leading-relaxed font-normal">
            Essential clarifications regarding our advisory philosophy, engagement structures, and operational governance.
          </p>
        </div>

        {/* Accordion Container */}
        <div className="space-y-4">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className={`rounded-xs border transition-all duration-300 ${
                  isOpen
                    ? "border-[#29483B]/35 bg-[#F7F5EF] shadow-sm"
                    : "border-[#29483B]/15 bg-white hover:border-[#29483B]/30 hover:bg-[#F7F5EF]/30"
                }`}
              >
                <h3>
                  <button
                    type="button"
                    id={`accordion-btn-${item.id}`}
                    aria-expanded={isOpen}
                    aria-controls={`accordion-panel-${item.id}`}
                    onClick={() => toggleItem(item.id)}
                    className="flex w-full items-center justify-between gap-4 p-5 sm:p-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#29483B] rounded-xs"
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-serif text-sm font-semibold text-[#B87352] shrink-0">
                        0{idx + 1}
                      </span>
                      <span className="font-serif text-base sm:text-lg font-normal text-[#252925] leading-snug">
                        {item.question}
                      </span>
                    </div>

                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xs transition-colors duration-200 ${
                        isOpen ? "bg-[#29483B] text-[#F7F5EF]" : "bg-[#E2E9E0]/60 text-[#29483B]"
                      }`}
                    >
                      <motion.span
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </motion.span>
                    </span>
                  </button>
                </h3>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`accordion-panel-${item.id}`}
                      role="region"
                      aria-labelledby={`accordion-btn-${item.id}`}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-6 sm:px-6 sm:pb-6 pt-0 text-xs sm:text-sm text-[#252925]/80 leading-relaxed border-t border-[#29483B]/10 mt-2 pl-12 sm:pl-14 font-normal">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Bottom Contact Note */}
        <div className="mt-12 rounded-xs border border-[#29483B]/15 bg-[#F7F5EF] p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <HelpCircle className="h-5 w-5 text-[#B87352] shrink-0" />
            <p className="text-xs sm:text-sm text-[#252925]/80 font-normal">
              Have a specific governance question not addressed here?
            </p>
          </div>
          <a
            href="#contact"
            onClick={handleScrollToContact}
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#29483B] hover:text-[#1e352b]"
          >
            <span>Inquire Directly</span>
            <ArrowRight className="h-3.5 w-3.5 text-[#B87352]" />
          </a>
        </div>
      </div>
    </section>
  );
}
