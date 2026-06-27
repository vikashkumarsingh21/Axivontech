"use client";

import { useState, useRef, useId, useMemo, type MouseEvent } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useInView,
} from "framer-motion";
import { Plus, MessageCircle, CalendarCheck, Sparkles } from "lucide-react";
const EASE_FAQ = [0.16, 1, 0.3, 1] as const;

/**
 * ServiceFAQ.tsx
 * Axivon Technologies — ultra-premium reusable FAQ section.
 *
 * Stack: Next.js 15 / TypeScript / Tailwind CSS / Framer Motion / Lucide React
 *
 * Drop into any service page:
 *   <ServiceFAQ service={service} />
 */

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export interface ServiceFAQItem {
  /** Optional stable id. Falls back to array index if omitted. */
  id?: string;
  question: string;
  answer: string;
}

export interface ServiceData {
  title: string;
  faqs: ServiceFAQItem[];
  /** Optional overrides — safe to omit entirely. */
  consultationHref?: string;
  whatsappHref?: string;
}

export interface ServiceFAQProps {
  service: ServiceData;
}

/* -------------------------------------------------------------------------- */
/*  Static motion variants                                                    */
/* -------------------------------------------------------------------------- */

const headerVariants = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: EASE_FAQ },
  },
};

const gridVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.09, delayChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 28, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.55, ease: EASE_FAQ },
  },
};

/* -------------------------------------------------------------------------- */
/*  Floating particle field (ambient, decorative, aria-hidden)                */
/* -------------------------------------------------------------------------- */

function FloatingParticles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 1.5 + Math.random() * 2.5,
        duration: 10 + Math.random() * 14,
        delay: Math.random() * 6,
        hue: i % 3 === 0 ? "#00D4FF" : i % 3 === 1 ? "#2563EB" : "#7C3AED",
      })),
    []
  );

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            background: p.hue,
            boxShadow: `0 0 8px 2px ${p.hue}`,
          }}
          animate={{
            y: [0, -26, 0],
            opacity: [0.15, 0.85, 0.15],
          }}
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

/* -------------------------------------------------------------------------- */
/*  Aurora backdrop (animated gradient blobs)                                 */
/* -------------------------------------------------------------------------- */

function AuroraBackground() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -top-40 -left-32 h-[34rem] w-[34rem] rounded-full blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, rgba(37,99,235,0.35), transparent 70%)",
        }}
        animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 -right-32 h-[30rem] w-[30rem] rounded-full blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, rgba(124,58,237,0.32), transparent 70%)",
        }}
        animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-1/3 h-[28rem] w-[28rem] rounded-full blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, rgba(0,212,255,0.22), transparent 70%)",
        }}
        animate={{ x: [0, 40, 0], y: [0, -20, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 30%, black, transparent)",
        }}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Animated border beam wrapper                                              */
/* -------------------------------------------------------------------------- */

function BorderBeam({ active }: { active: boolean }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 rounded-2xl"
      style={{
        background:
          "conic-gradient(from 0deg, #00D4FF, #2563EB, #7C3AED, #00D4FF)",
        opacity: active ? 0.9 : 0,
        padding: 1.5,
        WebkitMask:
          "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
        WebkitMaskComposite: "xor",
        maskComposite: "exclude",
        animation: active ? "axv-spin 3.2s linear infinite" : undefined,
        transition: "opacity 0.4s ease",
      }}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  FAQ Card                                                                  */
/* -------------------------------------------------------------------------- */

interface FAQCardProps {
  item: ServiceFAQItem;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}

function FAQCard({ item, index, isOpen, onToggle }: FAQCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  // Mouse-follow glow
  const mx = useMotionValue(50);
  const my = useMotionValue(50);
  const glowX = useSpring(mx, { stiffness: 150, damping: 20 });
  const glowY = useSpring(my, { stiffness: 150, damping: 20 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set(((e.clientX - rect.left) / rect.width) * 100);
    my.set(((e.clientY - rect.top) / rect.height) * 100);
  };

  const panelId = useId();

  return (
    <motion.div
      variants={cardVariants}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="group relative rounded-2xl"
    >
      {/* animated conic border beam */}
      <BorderBeam active={hovered || isOpen} />

      {/* static hairline border */}
      <div className="absolute inset-0 rounded-2xl border border-white/10" />

      {/* mouse-follow glow */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(280px circle at ${glowX.get()}% ${glowY.get()}%, rgba(0,212,255,0.18), transparent 70%)`,
        }}
        animate={{
          background: `radial-gradient(280px circle at ${glowX.get()}% ${glowY.get()}%, rgba(0,212,255,0.18), transparent 70%)`,
        }}
      />

      {/* glass card body */}
      <div
        className={[
          "relative overflow-hidden rounded-2xl backdrop-blur-xl transition-all duration-300",
          "bg-white/[0.035] shadow-[0_8px_30px_rgba(0,0,0,0.35)]",
          isOpen
            ? "shadow-[0_0_0_1px_rgba(0,212,255,0.25),0_20px_60px_-15px_rgba(37,99,235,0.45)]"
            : "group-hover:shadow-[0_20px_50px_-20px_rgba(124,58,237,0.35)]",
        ].join(" ")}
      >
        {/* top gradient overlay sheen */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00D4FF]/70 to-transparent" />

        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF]/60 sm:px-7 sm:py-6"
        >
          <span className="flex items-start gap-3">
            <span
              className="mt-0.5 select-none font-mono text-[11px] font-semibold tracking-wider text-[#00D4FF]/70"
              aria-hidden
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="text-[15px] font-medium leading-relaxed text-white/90 sm:text-base">
              {item.question}
            </span>
          </span>

          <motion.span
            animate={{
              rotate: isOpen ? 45 : 0,
              backgroundColor: isOpen
                ? "rgba(0,212,255,0.16)"
                : "rgba(255,255,255,0.06)",
            }}
            transition={{ duration: 0.35, ease: EASE_FAQ  }}
            className="flex h-8 w-8 flex-none items-center justify-center rounded-full border border-white/10"
          >
            <Plus
              className={[
                "h-4 w-4 transition-colors duration-300",
                isOpen ? "text-[#00D4FF]" : "text-white/60",
              ].join(" ")}
              strokeWidth={2.25}
            />
          </motion.span>
        </button>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              id={panelId}
              key="panel"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.38, ease: EASE_FAQ  }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-6 pl-[3.1rem] pr-7 sm:pl-[3.4rem]">
                <motion.div
                  initial={{ y: -6, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.05 }}
                  className="h-px w-full bg-gradient-to-r from-white/15 via-white/5 to-transparent"
                />
                <p className="mt-4 text-sm leading-relaxed text-white/60 sm:text-[15px]">
                  {item.answer}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Bottom CTA strip                                                          */
/* -------------------------------------------------------------------------- */

function CTAStrip({
  consultationHref,
  whatsappHref,
}: {
  consultationHref: string;
  whatsappHref: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6, ease: EASE_FAQ  }}
      className="relative mt-16 overflow-hidden rounded-3xl border border-white/10 px-6 py-10 text-center sm:px-12 sm:py-14"
    >
      {/* glassmorphism + gradient overlay */}
      <div className="absolute inset-0 bg-white/[0.04] backdrop-blur-xl" />
      <div
        className="absolute inset-0 opacity-90"
        style={{
          background:
            "linear-gradient(135deg, rgba(37,99,235,0.18), rgba(124,58,237,0.16) 45%, rgba(0,212,255,0.12))",
        }}
      />
      {/* glow pulse */}
      <motion.div
        aria-hidden
        className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{ background: "rgba(0,212,255,0.25)" }}
        animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.9, 1.05, 0.9] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-[#00D4FF]">
          <Sparkles className="h-3 w-3" />
          Let&apos;s talk
        </span>

        <h3 className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Still Have Questions?
        </h3>
        <p className="mt-2 text-sm text-white/60 sm:text-base">
          Talk with our experts.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <motion.a
            href={consultationHref}
            whileHover={{ y: -3, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-[0_10px_40px_-10px_rgba(37,99,235,0.7)] sm:w-auto"
            style={{
              background: "linear-gradient(135deg, #2563EB, #7C3AED)",
            }}
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            <CalendarCheck className="h-4 w-4" />
            Book Consultation
          </motion.a>

          <motion.a
            href={whatsappHref}
            whileHover={{ y: -3, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white/90 backdrop-blur-md transition-colors duration-300 hover:border-[#00D4FF]/40 hover:bg-white/10 sm:w-auto"
          >
            <MessageCircle className="h-4 w-4 text-[#00D4FF]" />
            WhatsApp Chat
          </motion.a>
        </div>
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main component                                                            */
/* -------------------------------------------------------------------------- */

export default function ServiceFAQ({ service }: ServiceFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.15 });

  const faqs = service?.faqs ?? [];
  const consultationHref = service.consultationHref ?? "/contact";
  const whatsappHref = service.whatsappHref ?? "https://wa.me/919473263768";

  const handleToggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  if (faqs.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden px-4 py-24 sm:px-6 sm:py-28 lg:px-8"
      style={{ background: "#050816" }}
    >
      <style>{`
        @keyframes axv-spin {
          to { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .axv-respect-motion * {
            animation-duration: 0.001ms !important;
            transition-duration: 0.001ms !important;
          }
        }
      `}</style>

      <AuroraBackground />
      <FloatingParticles />

      <div className="relative mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={headerVariants}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#00D4FF] backdrop-blur-md">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00D4FF] opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#00D4FF]" />
            </span>
            FAQ
          </span>

          <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-[2.75rem]">
            Frequently Asked{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #00D4FF, #2563EB 55%, #7C3AED)",
              }}
            >
              Questions
            </span>
          </h2>

          <p className="mt-4 text-sm leading-relaxed text-white/55 sm:text-base">
            Everything you need to know about our {service.title} services.
          </p>
        </motion.div>

        {/* FAQ Grid */}
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={gridVariants}
          className="mt-14 grid grid-cols-1 gap-5 lg:grid-cols-2"
        >
          {faqs.map((item, idx) => (
            <FAQCard
              key={item.id ?? idx}
              item={item}
              index={idx}
              isOpen={openIndex === idx}
              onToggle={() => handleToggle(idx)}
            />
          ))}
        </motion.div>

        {/* CTA Strip */}
        <CTAStrip
          consultationHref={consultationHref}
          whatsappHref={whatsappHref}
        />
      </div>
    </section>
  );
}