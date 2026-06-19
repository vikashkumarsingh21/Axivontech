"use client";

import {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
  memo,
} from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import {
  Plus,
  Minus,
  MessageCircle,
  BadgeCheck,
  Headphones,
  Sparkles,
} from "lucide-react";
const EASE_FAQ = [0.22, 1, 0.36, 1] as const;

// ─── Types ────────────────────────────────────────────────────────────────────

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  color: string;
  glow: string;
  glowRgba: string;
  gradient: string;
}

interface TrustBadge {
  label: string;
  Icon: React.ElementType;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  dur: number;
  delay: number;
  color: string;
  opacity: number;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const FAQS: FAQItem[] = [
  {
    id: 1,
    question: "How much does a website cost?",
    answer:
      "Pricing depends on project scope, features, design complexity, and integrations. We provide custom quotations tailored to your specific requirements and business goals.",
    color: "#2563EB",
    glow: "#2563EB",
    glowRgba: "rgba(37,99,235,0.42)",
    gradient: "from-[#2563EB] to-[#00D4FF]",
  },
  {
    id: 2,
    question: "How long does development take?",
    answer:
      "Most business websites are delivered within 1–4 weeks, while larger platforms and applications may require additional development time depending on complexity and features.",
    color: "#7C3AED",
    glow: "#7C3AED",
    glowRgba: "rgba(124,58,237,0.42)",
    gradient: "from-[#7C3AED] to-[#2563EB]",
  },
  {
    id: 3,
    question: "Do you provide SEO services?",
    answer:
      "Yes. We offer technical SEO, on-page SEO, keyword research, local SEO, and performance optimization — all designed to increase your organic visibility and rankings.",
    color: "#00D4FF",
    glow: "#00D4FF",
    glowRgba: "rgba(0,212,255,0.42)",
    gradient: "from-[#00D4FF] to-[#7C3AED]",
  },
  {
    id: 4,
    question: "Can you redesign my existing website?",
    answer:
      "Absolutely. We can modernize your website, improve performance, enhance user experience, and optimize conversion rates while preserving your brand identity.",
    color: "#2563EB",
    glow: "#2563EB",
    glowRgba: "rgba(37,99,235,0.42)",
    gradient: "from-[#2563EB] to-[#7C3AED]",
  },
  {
    id: 5,
    question: "Do you build mobile applications?",
    answer:
      "Yes. We develop Android, iOS, and cross-platform applications using modern technologies like React Native and Flutter, with full API integration and deployment support.",
    color: "#7C3AED",
    glow: "#7C3AED",
    glowRgba: "rgba(124,58,237,0.42)",
    gradient: "from-[#7C3AED] to-[#00D4FF]",
  },
  {
    id: 6,
    question: "Do you provide support after launch?",
    answer:
      "Yes. We provide ongoing maintenance, monitoring, security updates, feature additions, and long-term support packages tailored to your business needs.",
    color: "#00D4FF",
    glow: "#00D4FF",
    glowRgba: "rgba(0,212,255,0.42)",
    gradient: "from-[#00D4FF] to-[#2563EB]",
  },
  {
    id: 7,
    question: "Can you develop AI solutions?",
    answer:
      "Yes. We build AI-powered automation systems, intelligent chatbots, business intelligence dashboards, and custom machine learning solutions for modern enterprises.",
    color: "#2563EB",
    glow: "#2563EB",
    glowRgba: "rgba(37,99,235,0.42)",
    gradient: "from-[#2563EB] to-[#00D4FF]",
  },
  {
    id: 8,
    question: "How can I get a quotation?",
    answer:
      "Simply contact us through the contact page, WhatsApp, or email. Our team will review your requirements and prepare a detailed custom proposal within 24 hours.",
    color: "#7C3AED",
    glow: "#7C3AED",
    glowRgba: "rgba(124,58,237,0.42)",
    gradient: "from-[#7C3AED] to-[#2563EB]",
  },
];

const TRUST_BADGES: TrustBadge[] = [
  { label: "Free Consultation", Icon: MessageCircle },
  { label: "Transparent Pricing", Icon: BadgeCheck },
  { label: "Dedicated Support", Icon: Headphones },
  { label: "Custom Solutions", Icon: Sparkles },
];

// ─── Border Beam ──────────────────────────────────────────────────────────────

const BorderBeam = memo(function BorderBeam({
  gradient,
  active,
  reduced,
}: {
  gradient: string;
  active: boolean;
  reduced: boolean;
}) {
  if (!active || reduced) return null;
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 rounded-[20px] overflow-hidden"
    >
      <motion.div
        className={`absolute h-[2px] w-24 bg-gradient-to-r ${gradient} blur-[1px] opacity-90`}
        animate={{ offsetDistance: ["0%", "100%"] }}
        style={{
          offsetPath: `path('M 20 0 L calc(100% - 20px) 0 Q 100% 0 100% 20px L 100% calc(100% - 20px) Q 100% 100% calc(100% - 20px) 100% L 20px 100% Q 0 100% 0 calc(100% - 20px) L 0 20px Q 0 0 20px 0 Z')`,
        }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
});

// ─── FAQ Accordion Item ───────────────────────────────────────────────────────

const FAQAccordionItem = memo(function FAQAccordionItem({
  faq,
  index,
  isOpen,
  onToggle,
  visible,
  reduced,
}: {
  faq: FAQItem;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  visible: boolean;
  reduced: boolean;
}) {
  const itemRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  // Magnetic effect
  const magX = useMotionValue(0);
  const magY = useMotionValue(0);
  const magSX = useSpring(magX, { stiffness: 130, damping: 20 });
  const magSY = useSpring(magY, { stiffness: 130, damping: 20 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!itemRef.current || reduced) return;
      const rect = itemRef.current.getBoundingClientRect();
      const cx = e.clientX - rect.left - rect.width / 2;
      const cy = e.clientY - rect.top - rect.height / 2;
      magX.set((cx / (rect.width / 2)) * 5);
      magY.set((cy / (rect.height / 2)) * 3);
    },
    [reduced, magX, magY]
  );

  const handleMouseLeave = useCallback(() => {
    setHovered(false);
    magX.set(0);
    magY.set(0);
  }, [magX, magY]);

  const delay = reduced ? 0 : index * 0.08 + 0.4;
  const active = isOpen || hovered;

  return (
    <motion.div
      initial={reduced ? undefined : { opacity: 0, x: 30 }}
      animate={
        visible
          ? {
              opacity: 1,
              x: 0,
              transition: { duration: 0.58, delay, ease: EASE_FAQ },
            }
          : { opacity: 0, x: 30 }
      }
      style={reduced ? undefined : { x: magSX, y: magSY }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="relative"
    >
      <div
        ref={itemRef}
        className="relative rounded-[20px] border overflow-hidden transition-all duration-400"
        style={{
          background: isOpen
            ? "rgba(255,255,255,0.055)"
            : hovered
            ? "rgba(255,255,255,0.04)"
            : "rgba(255,255,255,0.025)",
          borderColor: isOpen
            ? `${faq.glow}55`
            : hovered
            ? `${faq.glow}30`
            : "rgba(255,255,255,0.07)",
          backdropFilter: "blur(20px)",
          boxShadow: isOpen
            ? `0 0 0 1px ${faq.glowRgba}, 0 8px 48px -8px ${faq.glowRgba}, 0 20px 56px -14px ${faq.glowRgba}44`
            : hovered
            ? `0 4px 32px -4px ${faq.glowRgba}50`
            : "inset 0 1px 0 rgba(255,255,255,0.04)",
          transition:
            "background 0.3s ease, border-color 0.3s ease, box-shadow 0.4s ease",
        }}
      >
        {/* Inner top glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-8 -left-8 w-32 h-32 rounded-full blur-3xl transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle, ${faq.glowRgba}, transparent)`,
            opacity: active ? 0.35 : 0.08,
          }}
        />

        {/* Sweep gradient */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[20px] transition-opacity duration-500"
          style={{
            background: `radial-gradient(ellipse 70% 40% at 50% 0%, ${faq.glow}15, transparent)`,
            opacity: active ? 1 : 0,
          }}
        />

        {/* Pulse glow ring when open */}
        {isOpen && !reduced && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[20px]"
            animate={{ opacity: [0.3, 0.1, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ boxShadow: `inset 0 0 30px ${faq.glowRgba}40` }}
          />
        )}

        <BorderBeam gradient={faq.gradient} active={active} reduced={reduced} />

        {/* Question button */}
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050816] group"
          style={{ focusRingColor: faq.color } as React.CSSProperties}
          aria-expanded={isOpen}
          aria-controls={`faq-answer-${faq.id}`}
          id={`faq-question-${faq.id}`}
        >
          <span
            className="text-sm sm:text-[15px] font-semibold leading-snug tracking-tight transition-colors duration-300"
            style={{ color: isOpen ? "#fff" : "rgba(255,255,255,0.75)" }}
          >
            {faq.question}
          </span>

          {/* Icon */}
          <motion.div
            className={`flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br ${faq.gradient} flex items-center justify-center shadow-md`}
            animate={
              reduced
                ? {}
                : isOpen
                ? { rotate: 180, scale: 1.1 }
                : { rotate: 0, scale: 1 }
            }
            transition={{ duration: 0.35, ease: EASE_FAQ }}
            aria-hidden="true"
          >
            {isOpen ? (
              <Minus className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            ) : (
              <Plus className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            )}
          </motion.div>
        </button>

        {/* Answer */}
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              id={`faq-answer-${faq.id}`}
              role="region"
              aria-labelledby={`faq-question-${faq.id}`}
              initial={{ height: 0, opacity: 0 }}
              animate={{
                height: "auto",
                opacity: 1,
                transition: {
                  height: { duration: reduced ? 0 : 0.38, ease: EASE_FAQ },
                  opacity: { duration: reduced ? 0 : 0.28, delay: 0.08 },
                },
              }}
              exit={{
                height: 0,
                opacity: 0,
                transition: {
                  height: { duration: reduced ? 0 : 0.3, ease: EASE_FAQ },
                  opacity: { duration: reduced ? 0 : 0.18 },
                },
              }}
              className="overflow-hidden"
            >
              {/* Gradient divider */}
              <div
                aria-hidden="true"
                className="mx-6 h-px mb-5"
                style={{
                  background: `linear-gradient(to right, transparent, ${faq.color}50, transparent)`,
                }}
              />
              <p className="px-6 pb-6 text-sm leading-relaxed text-white/50">
                {faq.answer}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
});

// ─── Left Panel ───────────────────────────────────────────────────────────────

const LeftPanel = memo(function LeftPanel({
  visible,
  reduced,
}: {
  visible: boolean;
  reduced: boolean;
}) {
  const v = (i: number) => ({
    hidden: { opacity: 0, x: -32, filter: "blur(6px)" },
    visible: {
      opacity: 1,
      x: 0,
      filter: "blur(0px)",
      transition: { duration: 0.7, delay: i * 0.13, ease: EASE_FAQ },
    },
  });

  return (
    <div className="flex flex-col gap-8 lg:sticky lg:top-32">
      {/* Badge */}
      <motion.div
        variants={reduced ? undefined : v(0)}
        initial={reduced ? undefined : "hidden"}
        animate={visible ? "visible" : "hidden"}
      >
        <span
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-sm text-xs font-semibold tracking-[0.18em] uppercase text-[#00D4FF]"
          aria-label="Section: Frequently Asked Questions"
        >
          <span aria-hidden="true" className="relative flex">
            <span className="absolute inline-flex h-2 w-2 rounded-full bg-[#00D4FF] opacity-70 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00D4FF]" />
          </span>
          Frequently Asked Questions
        </span>
      </motion.div>

      {/* Heading */}
      <motion.h2
        variants={reduced ? undefined : v(1)}
        initial={reduced ? undefined : "hidden"}
        animate={visible ? "visible" : "hidden"}
        className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.08]"
        id="faq-heading"
      >
        Everything You Need
        <br />
        <span
          className="bg-gradient-to-r from-[#2563EB] via-[#7C3AED] to-[#00D4FF] bg-clip-text text-transparent"
          style={{
            backgroundSize: "200% 100%",
            animation: reduced ? "none" : "gradientShift 5s ease infinite",
          }}
        >
          To Know
        </span>
      </motion.h2>

      {/* Description */}
      <motion.p
        variants={reduced ? undefined : v(2)}
        initial={reduced ? undefined : "hidden"}
        animate={visible ? "visible" : "hidden"}
        className="text-white/45 text-base leading-relaxed max-w-sm"
      >
        Have questions about our services, pricing, timelines, or development
        process? Find answers to the most common questions below.
      </motion.p>

      {/* Trust badges */}
      <motion.div
        variants={reduced ? undefined : v(3)}
        initial={reduced ? undefined : "hidden"}
        animate={visible ? "visible" : "hidden"}
        className="flex flex-col gap-3"
        role="list"
        aria-label="Trust indicators"
      >
        {TRUST_BADGES.map((badge, i) => (
          <motion.div
            key={badge.label}
            initial={reduced ? undefined : { opacity: 0, x: -16 }}
            animate={
              visible
                ? {
                    opacity: 1,
                    x: 0,
                    transition: {
                      delay: 0.55 + i * 0.09,
                      duration: 0.45,
                      ease: EASE_FAQ,
                    },
                  }
                : { opacity: 0, x: -16 }
            }
            className="inline-flex items-center gap-3 px-4 py-3 rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-sm w-fit"
            role="listitem"
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${["#2563EB", "#7C3AED", "#00D4FF", "#2563EB"][i]}30, ${["#00D4FF", "#2563EB", "#7C3AED", "#7C3AED"][i]}20)`,
                border: `1px solid ${["#2563EB", "#7C3AED", "#00D4FF", "#2563EB"][i]}35`,
              }}
              aria-hidden="true"
            >
              <badge.Icon
                className="w-4 h-4"
                strokeWidth={1.8}
                style={{ color: ["#2563EB", "#7C3AED", "#00D4FF", "#2563EB"][i] }}
              />
            </div>
            <span className="text-white/60 text-sm font-medium">{badge.label}</span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
});

// ─── Background ───────────────────────────────────────────────────────────────

const Background = memo(function Background({ reduced }: { reduced: boolean }) {
  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 1.8 + 0.6,
        dur: Math.random() * 14 + 8,
        delay: Math.random() * 9,
        color: ["#2563EB", "#7C3AED", "#00D4FF"][i % 3],
        opacity: Math.random() * 0.17 + 0.07,
      })),
    []
  );

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Noise */}
      <div
        className="absolute inset-0 opacity-[0.016]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px",
        }}
      />

      {!reduced && (
        <>
          <motion.div
            className="absolute rounded-full blur-[160px]"
            style={{
              width: 650, height: 400,
              background: "radial-gradient(ellipse, rgba(37,99,235,0.12), transparent 70%)",
              top: "5%", left: "-6%",
            }}
            animate={{ x: [0, 65, 0], y: [0, 40, 0] }}
            transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute rounded-full blur-[180px]"
            style={{
              width: 560, height: 480,
              background: "radial-gradient(ellipse, rgba(124,58,237,0.10), transparent 70%)",
              bottom: "0%", right: "-4%",
            }}
            animate={{ x: [0, -50, 0], y: [0, -32, 0] }}
            transition={{ duration: 28, repeat: Infinity, ease: "easeInOut", delay: 5 }}
          />
          <motion.div
            className="absolute rounded-full blur-[120px]"
            style={{
              width: 460, height: 460,
              background: "radial-gradient(circle, rgba(0,212,255,0.07), transparent 70%)",
              top: "45%", left: "50%", translateX: "-50%",
            }}
            animate={{ x: [0, 36, -28, 0], y: [0, -24, 24, 0] }}
            transition={{ duration: 32, repeat: Infinity, ease: "easeInOut", delay: 9 }}
          />

          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full"
              style={{
                left: `${p.x}%`, top: `${p.y}%`,
                width: p.size * 2, height: p.size * 2,
                background: p.color,
                opacity: p.opacity,
                boxShadow: `0 0 ${p.size * 5}px ${p.color}`,
              }}
              animate={{
                y: [0, -20, 0],
                x: [0, Math.sin(p.id * 1.4) * 10, 0],
                opacity: [p.opacity, p.opacity * 2.2, p.opacity],
              }}
              transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
        </>
      )}
    </div>
  );
});

// ─── Mouse Spotlight ──────────────────────────────────────────────────────────

function MouseSpotlight({ sectionRef }: { sectionRef: React.RefObject<HTMLElement | null> }) {
  const mx = useMotionValue(-1000);
  const my = useMotionValue(-1000);
  const sx = useSpring(mx, { stiffness: 55, damping: 20 });
  const sy = useSpring(my, { stiffness: 55, damping: 20 });

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      mx.set(e.clientX - rect.left);
      my.set(e.clientY - rect.top);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [mx, my, sectionRef]);

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0"
      style={{
        background: `radial-gradient(420px circle at ${sx}px ${sy}px, rgba(37,99,235,0.05), transparent 55%)`,
      }}
    />
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function ServicesFAQ() {
  const reduced = useReducedMotion() ?? false;
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });
  const [openId, setOpenId] = useState<number | null>(1);

  const toggle = useCallback((id: number) => {
    setOpenId((prev) => (prev === id ? null : id));
  }, []);

  return (
    <>
      <style>{`
        @keyframes gradientShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      <section
        ref={sectionRef}
        id="faq"
        aria-labelledby="faq-heading"
        className="relative w-full overflow-hidden py-24 sm:py-32"
        style={{ background: "#050816" }}
      >
        <Background reduced={reduced} />
        {!reduced && <MouseSpotlight sectionRef={sectionRef} />}

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.35fr] gap-12 lg:gap-20 items-start">

            {/* ── Left panel ── */}
            <LeftPanel visible={isInView} reduced={reduced} />

            {/* ── Right: FAQ accordion ── */}
            <div
              className="flex flex-col gap-3"
              role="list"
              aria-label="Frequently asked questions"
            >
              {FAQS.map((faq, i) => (
                <FAQAccordionItem
                  key={faq.id}
                  faq={faq}
                  index={i}
                  isOpen={openId === faq.id}
                  onToggle={() => toggle(faq.id)}
                  visible={isInView}
                  reduced={reduced}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-24"
          style={{ background: "linear-gradient(to bottom, transparent, #050816)" }}
        />
      </section>
    </>
  );
}