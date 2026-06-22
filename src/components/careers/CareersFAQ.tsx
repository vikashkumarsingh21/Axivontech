"use client";

import { useId, useMemo, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";

/* ------------------------------------------------------------------ */
/*  Theme tokens — shared with CareersHero / OpenPositions /            */
/*  HiringProcess / EmployeeBenefits.                                   */
/* ------------------------------------------------------------------ */

const COLORS = {
  bg: "#050816",
  blue: "#2563EB",
  purple: "#7C3AED",
  cyan: "#00D4FF",
} as const;

/* ------------------------------------------------------------------ */
/*  Content                                                            */
/* ------------------------------------------------------------------ */

interface FaqItem {
  question: string;
  answer: string;
  accent: string;
}

const FAQS: FaqItem[] = [
  {
    question: "Who can apply for internships at Axivon Technologies?",
    answer:
      "Students, fresh graduates, and passionate learners who want to gain real-world experience in software development, AI, design, and digital technologies are encouraged to apply.",
    accent: COLORS.blue,
  },
  {
    question: "Are internships remote?",
    answer:
      "Yes. Current internship opportunities are remote, allowing candidates to collaborate from anywhere while gaining practical industry experience.",
    accent: COLORS.purple,
  },
  {
    question: "Do interns work on real projects?",
    answer:
      "Yes. Interns contribute to real-world projects, products, and client solutions while working closely with experienced team members.",
    accent: COLORS.cyan,
  },
  {
    question: "Will I receive mentorship?",
    answer:
      "Absolutely. Interns receive guidance, feedback, and support throughout their learning journey.",
    accent: COLORS.blue,
  },
  {
    question: "How long is the internship?",
    answer:
      "Internship duration may vary depending on the role and project requirements.",
    accent: COLORS.purple,
  },
  {
    question: "Can internships lead to full-time opportunities?",
    answer:
      "Outstanding performers may be considered for future opportunities as the company continues to grow.",
    accent: COLORS.cyan,
  },
  {
    question: "What is the selection process?",
    answer:
      "Application review, skill evaluation, and a short interaction with the team to understand your interests and strengths.",
    accent: COLORS.blue,
  },
  {
    question: "Do I need professional experience?",
    answer:
      "No. We value curiosity, learning ability, commitment, and problem-solving skills more than prior experience.",
    accent: COLORS.purple,
  },
];

/* ------------------------------------------------------------------ */
/*  Motion variants                                                    */
/* ------------------------------------------------------------------ */

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
};

/* ------------------------------------------------------------------ */
/*  Decorative: animated gradient text                                 */
/* ------------------------------------------------------------------ */

function GradientText({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.span
      className={`bg-[length:200%_auto] bg-clip-text text-transparent ${className}`}
      style={{
        backgroundImage: `linear-gradient(90deg, ${COLORS.blue}, ${COLORS.purple}, ${COLORS.cyan}, ${COLORS.purple}, ${COLORS.blue})`,
      }}
      animate={
        reduceMotion
          ? undefined
          : { backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }
      }
      transition={
        reduceMotion
          ? undefined
          : { duration: 8, repeat: Infinity, ease: "linear" }
      }
    >
      {children}
    </motion.span>
  );
}

/* ------------------------------------------------------------------ */
/*  Decorative: aurora glow orbs                                       */
/* ------------------------------------------------------------------ */

function AuroraBackground() {
  const reduceMotion = useReducedMotion();

  const orbs = [
    {
      color: COLORS.blue,
      size: 480,
      top: "-8%",
      left: "8%",
      animate: { x: [0, 36, -18, 0], y: [0, 26, -10, 0] },
      duration: 22,
    },
    {
      color: COLORS.purple,
      size: 560,
      top: "35%",
      left: "62%",
      animate: { x: [0, -44, 18, 0], y: [0, -18, 26, 0] },
      duration: 26,
    },
    {
      color: COLORS.cyan,
      size: 400,
      top: "65%",
      left: "10%",
      animate: { x: [0, 26, -26, 0], y: [0, -22, 14, 0] },
      duration: 19,
    },
  ];

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden={true}
    >
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-[120px]"
          style={{
            width: orb.size,
            height: orb.size,
            top: orb.top,
            left: orb.left,
            background: `radial-gradient(circle, ${orb.color}50 0%, ${orb.color}00 70%)`,
          }}
          animate={reduceMotion ? undefined : orb.animate}
          transition={
            reduceMotion
              ? undefined
              : { duration: orb.duration, repeat: Infinity, ease: "easeInOut" }
          }
        />
      ))}

      <div
        className="absolute inset-x-0 top-0 h-[55%] opacity-40 mix-blend-screen"
        style={{
          background: `radial-gradient(60% 50% at 50% 0%, ${COLORS.blue}30 0%, transparent 70%)`,
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Decorative: floating particles (deterministic, SSR-safe)           */
/* ------------------------------------------------------------------ */

function FloatingParticles() {
  const reduceMotion = useReducedMotion();

  const particles = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        left: (i * 41) % 100,
        top: (i * 59) % 100,
        size: 1 + (i % 3),
        duration: 6 + (i % 5),
        delay: (i % 6) * 0.4,
        color: [COLORS.blue, COLORS.purple, COLORS.cyan][i % 3],
      })),
    []
  );

  if (reduceMotion) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden={true}
    >
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 6px ${p.color}`,
          }}
          animate={{ y: [0, -18, 0], opacity: [0.15, 0.8, 0.15] }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Decorative: noise texture overlay                                  */
/* ------------------------------------------------------------------ */

function NoiseOverlay() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.035]"
      aria-hidden={true}
    >
      <filter id="careers-faq-noise">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.9"
          numOctaves="2"
          stitchTiles="stitch"
        />
      </filter>
      <rect width="100%" height="100%" filter="url(#careers-faq-noise)" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Decorative: animated plus / minus toggle                           */
/* ------------------------------------------------------------------ */

function ToggleIcon({ open }: { open: boolean }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.span
      className="relative flex h-4 w-4 shrink-0 items-center justify-center text-current"
      animate={reduceMotion ? undefined : { rotate: open ? 180 : 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      aria-hidden={true}
    >
      <span className="absolute h-px w-4 rounded-full bg-current" />
      <motion.span
        className="absolute h-4 w-px rounded-full bg-current"
        animate={{ scaleY: open ? 0 : 1, opacity: open ? 0 : 1 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      />
    </motion.span>
  );
}

/* ------------------------------------------------------------------ */
/*  FAQ accordion item                                                 */
/* ------------------------------------------------------------------ */

function FaqAccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  item: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const uid = useId();
  const buttonId = `faq-button-${uid}`;
  const panelId = `faq-panel-${uid}`;

  return (
    <motion.div variants={itemVariants} className="group relative">
      {/* rotating border beam, visible on hover/focus or while open */}
      <div
        className={`pointer-events-none absolute -inset-px overflow-hidden rounded-2xl transition-opacity duration-500 ${
          isOpen
            ? "opacity-100"
            : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
        }`}
        aria-hidden={true}
      >
        <motion.div
          className="absolute inset-[-60%]"
          style={{
            background: `conic-gradient(from 0deg, transparent 0deg, ${item.accent} 40deg, transparent 100deg)`,
          }}
          animate={reduceMotion ? undefined : { rotate: 360 }}
          transition={
            reduceMotion
              ? undefined
              : { duration: 5, repeat: Infinity, ease: "linear" }
          }
        />
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025] shadow-[0_8px_30px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-shadow duration-500 group-hover:shadow-[0_8px_40px_rgba(0,0,0,0.6)]">
        {/* inset fill so the beam only shows as a thin rim */}
        <div
          className="pointer-events-none absolute inset-[1px] -z-10 rounded-[15px] bg-[#070b1a]"
          aria-hidden={true}
        />

        {/* ambient glow, strongest while open */}
        <div
          className={`pointer-events-none absolute -inset-6 -z-10 rounded-[28px] blur-2xl transition-opacity duration-500 ${
            isOpen ? "opacity-50" : "opacity-0 group-hover:opacity-40"
          }`}
          style={{
            background: `radial-gradient(circle, ${item.accent}40, transparent 70%)`,
          }}
          aria-hidden={true}
        />

        <h3 className="m-0">
          <button
            id={buttonId}
            type="button"
            aria-expanded={isOpen}
            aria-controls={panelId}
            onClick={onToggle}
            className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050816] sm:px-8 sm:py-6"
          >
            <span className="text-[15px] font-medium tracking-tight text-white sm:text-base">
              {item.question}
            </span>
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] transition-colors duration-300"
              style={isOpen ? { borderColor: `${item.accent}80`, color: item.accent } : { color: "rgba(255,255,255,0.7)" }}
            >
              <ToggleIcon open={isOpen} />
            </span>
          </button>
        </h3>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              key="content"
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{
                height: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
                opacity: { duration: 0.25, ease: "easeInOut" },
              }}
              style={{ overflow: "hidden" }}
            >
              <p className="px-6 pb-6 text-[15px] leading-relaxed text-white/60 sm:px-8 sm:pb-7">
                {item.answer}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main export                                                        */
/* ------------------------------------------------------------------ */

export default function CareersFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <section
      aria-labelledby="careers-faq-heading"
      className="relative isolate overflow-hidden bg-[#050816] px-6 py-28 sm:py-32 lg:px-8"
    >
      <AuroraBackground />
      <FloatingParticles />
      <NoiseOverlay />

      <div className="relative mx-auto max-w-6xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={containerVariants}
          className="mx-auto mb-16 max-w-2xl text-center sm:mb-20"
        >
          <motion.span
            variants={fadeUpVariants}
            className="mb-6 inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-white/70 backdrop-blur-sm"
          >
            Careers FAQ
          </motion.span>

          <motion.h2
            id="careers-faq-heading"
            variants={fadeUpVariants}
            className="text-4xl font-semibold tracking-tight text-white sm:text-5xl"
          >
            <span className="block">
              <GradientText>Questions</GradientText> About
            </span>
            <GradientText className="block">Joining Axivon</GradientText>
          </motion.h2>

          <motion.p
            variants={fadeUpVariants}
            className="mx-auto mt-6 text-balance text-base leading-relaxed text-white/60 sm:text-lg"
          >
            Everything you need to know about internships, opportunities,
            applications, and career growth at Axivon Technologies.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={containerVariants}
          className="mx-auto flex max-w-3xl flex-col gap-4 xl:max-w-4xl xl:gap-5"
        >
          {FAQS.map((item, index) => (
            <FaqAccordionItem
              key={item.question}
              item={item}
              isOpen={openIndex === index}
              onToggle={() => toggle(index)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}