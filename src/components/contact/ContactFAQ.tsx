"use client";

import React, { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    question: "How do I start a project with Axivon?",
    answer: "Simply fill out the inquiry form above with your basic requirements, or reach out to us via email or WhatsApp. We'll schedule an initial discovery call to understand your needs and discuss how we can help.",
  },
  {
    question: "What information should I include in my inquiry?",
    answer: "The more context you can provide, the better. Briefly describe the problem you're trying to solve, any specific technologies you prefer, your estimated timeline, and your budget if you have one.",
  },
  {
    question: "What type of projects does Axivon work on?",
    answer: "We specialize in modern web applications, mobile app development, custom business software, AI/ML integrations, and IoT platforms.",
  },
  {
    question: "Can Axivon work with startups and established businesses?",
    answer: "Yes. We work with early-stage startups to build MVPs, as well as established enterprises looking to automate processes or scale their existing technology infrastructure.",
  },
  {
    question: "How does the initial discussion work?",
    answer: "Our first meeting is a free, no-obligation technical consultation. We listen to your requirements, ask clarifying questions, and outline a high-level approach to solving your technical challenges.",
  },
];

export default function ContactFAQ() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-50px" });
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section ref={sectionRef} className="bg-[#111111] py-20 sm:py-24 lg:py-32 border-b border-[#1e1e1e]">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
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
                  className="flex w-full items-center justify-between p-5 text-left focus:outline-none focus-visible:bg-[#1a1a1a]"
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
                      <div className="px-5 pb-5 text-sm text-[#a1a1aa] leading-relaxed border-t border-[#2a2a2a] pt-4">
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