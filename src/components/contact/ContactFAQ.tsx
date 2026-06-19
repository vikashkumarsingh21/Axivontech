"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HelpCircle, Minus, Plus } from "lucide-react";
const EASE_FAQ = [0.22, 1, 0.36, 1] as const;
const EASE_ACCORDION = [0.04, 0.62, 0.23, 0.98] as const;

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    question: "How quickly do you respond?",
    answer:
      "We typically respond to all inquiries within 24 hours.",
  },
  {
    question: "Do you work with startups?",
    answer:
      "Yes. We work with startups, small businesses, enterprises, educational institutions, healthcare organizations, and many other industries.",
  },
  {
    question: "Can you redesign my existing website?",
    answer:
      "Absolutely. We can redesign, optimize, and modernize your existing website for better performance and user experience.",
  },
  {
    question: "Do you provide support after project completion?",
    answer:
      "Yes. We offer maintenance, updates, technical support, and long-term assistance after launch.",
  },
  {
    question: "Can you build mobile applications?",
    answer:
      "Yes. We develop Android, iOS, and cross-platform mobile applications.",
  },
  {
    question: "Do you provide AI solutions?",
    answer:
      "Yes. We build AI-powered chatbots, automation systems, and intelligent business solutions.",
  },
  {
    question: "What industries do you serve?",
    answer:
      "We serve schools, colleges, universities, hospitals, healthcare providers, hotels, restaurants, startups, retailers, and enterprises.",
  },
  {
    question: "How can I request a quotation?",
    answer:
      "Simply fill out our contact form or contact us via email or WhatsApp, and we will provide a customized quotation.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_FAQ },
  },
};

interface AccordionRowProps {
  item: FAQItem;
  index: number;
  isOpen: boolean;
  onToggle: (index: number) => void;
  registerRef: (el: HTMLButtonElement | null, index: number) => void;
  onKeyNav: (e: React.KeyboardEvent, index: number) => void;
}

function AccordionRow({
  item,
  index,
  isOpen,
  onToggle,
  registerRef,
  onKeyNav,
}: AccordionRowProps) {
  const panelId = `faq-panel-${index}`;
  const buttonId = `faq-button-${index}`;

  return (
    <motion.div variants={itemVariants} className="relative">
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        className="group relative rounded-2xl"
      >
        {/* Gradient hover / active border */}
        <div
          className={`absolute -inset-px rounded-2xl bg-gradient-to-r from-[#2563EB] via-[#7C3AED] to-[#00D4FF] blur-sm transition-opacity duration-500 ${
            isOpen ? "opacity-70" : "opacity-0 group-hover:opacity-50"
          }`}
          aria-hidden="true"
        />
        <div
          className={`absolute -inset-px rounded-2xl bg-gradient-to-r from-[#2563EB]/60 via-[#7C3AED]/60 to-[#00D4FF]/60 transition-opacity duration-500 ${
            isOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
          aria-hidden="true"
        />

        {/* Card body */}
        <div
          className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl transition-shadow duration-500 ${
            isOpen ? "shadow-[0_0_50px_-12px_rgba(124,58,237,0.45)]" : ""
          }`}
        >
          <h3 className="m-0">
            <button
              ref={(el) => registerRef(el, index)}
              id={buttonId}
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => onToggle(index)}
              onKeyDown={(e) => onKeyNav(e, index)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF]/60 sm:px-7 sm:py-6"
            >
              <span
                className={`text-base font-medium transition-colors duration-300 sm:text-lg ${
                  isOpen ? "text-white" : "text-slate-200 group-hover:text-white"
                }`}
              >
                {item.question}
              </span>

              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors duration-300 ${
                  isOpen
                    ? "border-transparent bg-gradient-to-br from-[#2563EB] to-[#7C3AED] text-white"
                    : "border-white/15 bg-white/5 text-slate-300 group-hover:border-white/30 group-hover:text-white"
                }`}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={isOpen ? "minus" : "plus"}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="flex items-center justify-center"
                  >
                    {isOpen ? (
                      <Minus className="h-4 w-4" strokeWidth={2.5} />
                    ) : (
                      <Plus className="h-4 w-4" strokeWidth={2.5} />
                    )}
                  </motion.span>
                </AnimatePresence>
              </span>
            </button>
          </h3>

          <AnimatePresence initial={false}>
            {isOpen && (
              <motion.div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                key="content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{
                  height: { duration: 0.4, ease: EASE_ACCORDION },
                  opacity: { duration: 0.3, ease: "easeInOut" },
                }}
                style={{ overflow: "hidden" }}
              >
                <div className="px-6 pb-6 pr-14 text-sm leading-relaxed text-slate-400 sm:px-7 sm:pb-7 sm:pr-16 sm:text-base">
                  {item.answer}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ContactFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleToggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  const registerRef = (el: HTMLButtonElement | null, index: number) => {
    buttonRefs.current[index] = el;
  };

  const handleKeyNav = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = (index + 1) % FAQ_DATA.length;
      buttonRefs.current[next]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = (index - 1 + FAQ_DATA.length) % FAQ_DATA.length;
      buttonRefs.current[prev]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      buttonRefs.current[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      buttonRefs.current[FAQ_DATA.length - 1]?.focus();
    }
  };

  return (
    <section
      id="faq"
      className="relative w-full overflow-hidden bg-[#050816] px-4 py-24 sm:px-6 sm:py-32 lg:px-8"
    >
      {/* Floating gradient blobs */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 -top-40 h-[480px] w-[480px] rounded-full bg-[#2563EB]/25 blur-[120px]"
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 top-10 h-[420px] w-[420px] rounded-full bg-[#7C3AED]/25 blur-[120px]"
        animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-160px] left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[#00D4FF]/20 blur-[130px]"
        animate={{ x: [0, 20, -20, 0], y: [0, -20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative mx-auto max-w-3xl">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: EASE_FAQ }}
          className="mb-14 text-center sm:mb-16"
        >
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#00D4FF] backdrop-blur-md">
            <HelpCircle className="h-3.5 w-3.5" strokeWidth={2.5} />
            Common Questions
          </span>

          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            Frequently Asked{" "}
            <span className="bg-gradient-to-r from-[#2563EB] via-[#7C3AED] to-[#00D4FF] bg-clip-text text-transparent">
              Questions
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg">
            Everything you need to know before starting your project with
            Axivon Technologies.
          </p>
        </motion.div>

        {/* Accordion list */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="flex flex-col gap-4"
        >
          {FAQ_DATA.map((item, index) => (
            <AccordionRow
              key={item.question}
              item={item}
              index={index}
              isOpen={openIndex === index}
              onToggle={handleToggle}
              registerRef={registerRef}
              onKeyNav={handleKeyNav}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}