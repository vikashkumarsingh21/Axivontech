"use client";

import React, { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    question: "What services does Axivon provide?",
    answer: "We specialize in Web Development, Mobile App Development, AI Solutions, Custom Software Engineering, Cloud Infrastructure, IoT/Robotics, UI/UX Design, and full-funnel Digital Marketing. We act as a full-stack digital product agency.",
  },
  {
    question: "Can Axivon build a custom solution from scratch?",
    answer: "Yes. Custom software engineering is one of our core capabilities. We build bespoke applications, internal tools, ERPs, and automation systems tailored precisely to your operational workflows.",
  },
  {
    question: "Can I combine multiple services into one project?",
    answer: "Absolutely. Most of our enterprise engagements are cross-disciplinary. For example, a project might combine UI/UX Design, Web Development, and AI Solutions to deliver a comprehensive product.",
  },
  {
    question: "Does Axivon work with startups and established businesses?",
    answer: "We partner with early-stage startups to build scalable MVPs, as well as established enterprises seeking to modernize their legacy infrastructure, automate workflows, or scale their marketing.",
  },
  {
    question: "Can Axivon work on an existing application?",
    answer: "Yes. We frequently conduct code audits and take over existing projects. We can modernize legacy architectures, migrate workloads to the cloud, or step in to maintain and expand current platforms.",
  },
  {
    question: "How do I choose the right service?",
    answer: "You don't need to know the exact technical requirements upfront. Contact us with the business problem you are trying to solve, and our solutions architects will recommend the most effective technical approach during our discovery call.",
  },
];

export default function ServicesFAQ() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-50px" });
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section ref={sectionRef} className="bg-[#111111] py-20 sm:py-32">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#f4f4f5]">
            Frequently Asked Questions
          </h2>
        </motion.div>

        <div className="space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={{ delay: index * 0.1 }}
                className="border border-[#2a2a2a] bg-[#141414] rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between p-6 text-left focus:outline-none focus-visible:bg-[#1a1a1a]"
                  aria-expanded={isOpen}
                >
                  <span className="text-base font-medium text-[#f4f4f5] pr-8">{faq.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-[#a1a1aa] transition-transform duration-300 shrink-0 ${isOpen ? "rotate-180 text-[#e8a064]" : ""}`}
                    aria-hidden
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-6 text-sm text-[#a1a1aa] leading-relaxed border-t border-[#2a2a2a] pt-4">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}