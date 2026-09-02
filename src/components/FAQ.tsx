"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { SectionHeader } from "@/components/ui";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "How long does it take to build a website?",
    answer:
      "Most business websites take between 1–4 weeks depending on complexity, specifications, and client feedback cycles.",
  },
  {
    question: "Do you provide SEO services?",
    answer:
      "Yes, we provide search engine optimization, keyword research, technical SEO audits, and ongoing digital marketing campaigns.",
  },
  {
    question: "Can you build mobile applications?",
    answer:
      "Yes, we develop native iOS and Android apps, as well as cross-platform React Native and Flutter solutions.",
  },
  {
    question: "Do you provide website maintenance?",
    answer:
      "Yes, we offer monthly maintenance plans including hosting management, security updates, regular backups, and technical support.",
  },
  {
    question: "Can you redesign an existing website?",
    answer:
      "Absolutely. We specialize in modernizing outdated sites, improving user experience, site speeds, and conversion rates without losing search engine credibility.",
  },
  {
    question: "What technologies do you use?",
    answer:
      "Our main stack includes Next.js, React, Node.js, TypeScript, Tailwind CSS, MongoDB, and modern cloud hosting environments like Vercel and AWS.",
  },
  {
    question: "Do you provide AI solutions?",
    answer:
      "Yes, we build custom AI-powered integrations, data-processing automation tools, and smart chatbots based on large language models.",
  },
  {
    question: "How can I get a quotation?",
    answer:
      "Simply contact us through our project form, email, or WhatsApp, and we will schedule a brief consultation to provide a tailored quote.",
  },
];

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const listVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
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
    <motion.div variants={itemVariants}>
      <div
        className={`bg-[#141414] border rounded-xl overflow-hidden transition-all duration-200 ${
          isOpen ? "border-[rgba(232,160,100,0.25)] shadow-md" : "border-[#262626] hover:border-[#303030]"
        }`}
      >
        <h3>
          <button
            type="button"
            id={questionId}
            aria-expanded={isOpen}
            aria-controls={panelId}
            onClick={() => onToggle(index)}
            className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a064] focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414] sm:px-7 sm:py-6"
          >
            <span
              className={`text-base font-semibold transition-colors duration-200 sm:text-lg ${
                isOpen ? "text-[#e8a064]" : "text-[#d4d4d4] hover:text-[#e8a064]"
              }`}
            >
              {item.question}
            </span>
            <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1c1c1e] text-[#a1a1aa] border border-[#262626]">
              <Plus
                className={`absolute h-4 w-4 transition-transform duration-200 ${
                  isOpen ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
                }`}
              />
              <Minus
                className={`absolute h-4 w-4 transition-transform duration-200 ${
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
              transition={{ duration: shouldReduceMotion ? 0 : 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <p className="px-6 pb-6 text-base leading-relaxed text-[#a1a1aa] sm:px-7 sm:pb-7">
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
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const handleToggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="bg-[#0f0f0f] py-24 sm:py-32 relative">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        {/* Section header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={headerVariants}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <SectionHeader
            overline="Got Questions?"
            heading={
              <>
                Frequently Asked <span className="text-gradient-amber">Questions</span>
              </>
            }
            body="Everything you need to know about working with Axivon Technologies."
          />
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