"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import { Plus, Minus } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "How long does it take to build a website?",
    answer:
      "Most business websites take between 1–4 weeks depending on complexity and requirements.",
  },
  {
    question: "Do you provide SEO services?",
    answer:
      "Yes, we provide SEO optimization, keyword research, technical SEO, and digital marketing services.",
  },
  {
    question: "Can you build mobile applications?",
    answer:
      "Yes, we develop Android, iOS, and cross-platform mobile applications.",
  },
  {
    question: "Do you provide website maintenance?",
    answer:
      "Yes, we offer ongoing maintenance, security updates, backups, and technical support.",
  },
  {
    question: "Can you redesign an existing website?",
    answer:
      "Absolutely. We can modernize and improve your existing website's design, performance, and user experience.",
  },
  {
    question: "What technologies do you use?",
    answer:
      "We work with Next.js, React, Node.js, TypeScript, Tailwind CSS, MongoDB, AI tools, and modern cloud technologies.",
  },
  {
    question: "Do you provide AI solutions?",
    answer:
      "Yes, we build AI-powered chatbots, automation systems, and intelligent business solutions.",
  },
  {
    question: "How can I get a quotation?",
    answer:
      "Simply contact us through our website, email, or consultation form and we will provide a customized quotation.",
  },
];

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const listVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

function FAQRow({
  item,
  index,
  isOpen,
  onToggle,
}: {
  item: FAQItem;
  index: number;
  isOpen: boolean;
  onToggle: (index: number) => void;
}) {
  const shouldReduceMotion = useReducedMotion();
  const questionId = `faq-question-${index}`;
  const panelId = `faq-panel-${index}`;

  return (
    <motion.div variants={itemVariants} className="group relative">
      <div
        className={`absolute -inset-px rounded-2xl bg-gradient-to-br from-[#2563EB] via-[#7C3AED] to-[#00D4FF] blur-md transition-opacity duration-500 ${
          isOpen ? "opacity-50" : "opacity-0 group-hover:opacity-40"
        }`}
      />
      <div
        className={`relative overflow-hidden rounded-2xl border bg-white/[0.03] backdrop-blur-xl transition-colors duration-500 ${
          isOpen ? "border-transparent" : "border-white/10 group-hover:border-white/20"
        }`}
      >
        <h3>
          <button
            type="button"
            id={questionId}
            aria-expanded={isOpen}
            aria-controls={panelId}
            onClick={() => onToggle(index)}
            className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050816] sm:px-7 sm:py-6"
          >
            <span
              className={`text-base font-semibold transition-colors duration-300 sm:text-lg ${
                isOpen ? "text-white" : "text-slate-200 group-hover:text-white"
              }`}
            >
              {item.question}
            </span>
            <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-[#2563EB]/20 via-[#7C3AED]/20 to-[#00D4FF]/20">
              <Plus
                className={`absolute h-4 w-4 text-[#00D4FF] transition-all duration-300 ${
                  isOpen ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
                }`}
              />
              <Minus
                className={`absolute h-4 w-4 text-[#00D4FF] transition-all duration-300 ${
                  isOpen ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
                }`}
              />
            </span>
          </button>
        </h3>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              key="content"
              id={panelId}
              role="region"
              aria-labelledby={questionId}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.35, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <p className="px-6 pb-6 text-sm leading-relaxed text-slate-400 sm:px-7 sm:pb-7 sm:text-[0.95rem]">
                {item.answer}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function FAQ() {
  const shouldReduceMotion = useReducedMotion();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const handleToggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="relative overflow-hidden bg-[#050816] py-24 sm:py-32">
      {/* Floating gradient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          aria-hidden
          className="absolute -left-32 top-10 h-[26rem] w-[26rem] rounded-full bg-[#2563EB]/20 blur-[120px]"
          animate={shouldReduceMotion ? undefined : { x: [0, 30, 0], y: [0, 25, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="absolute -right-24 bottom-10 h-[26rem] w-[26rem] rounded-full bg-[#7C3AED]/20 blur-[130px]"
          animate={shouldReduceMotion ? undefined : { x: [0, -25, 0], y: [0, -20, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        {/* Section header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={headerVariants}
          className="mx-auto mb-16 max-w-2xl text-center sm:mb-20"
        >
          <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-[0.25em] text-[#00D4FF]">
            Got Questions?
          </span>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Frequently Asked{" "}
            <span className="bg-gradient-to-r from-[#2563EB] via-[#7C3AED] to-[#00D4FF] bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          <p className="mt-5 text-balance text-base leading-relaxed text-slate-400 sm:text-lg">
            Everything you need to know about working with Axivon
            Technologies.
          </p>
        </motion.div>

        {/* FAQ accordion */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={listVariants}
          className="mx-auto flex max-w-3xl flex-col gap-4"
        >
          {FAQ_ITEMS.map((item, index) => (
            <FAQRow
              key={item.question}
              item={item}
              index={index}
              isOpen={openIndex === index}
              onToggle={handleToggle}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}