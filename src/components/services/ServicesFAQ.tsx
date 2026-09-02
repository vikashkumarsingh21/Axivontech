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
import { Badge } from "@/components/ui";

const EASE_FAQ = [0.22, 1, 0.36, 1] as const;

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

const FAQS: FAQItem[] = [
  {
    id: 1,
    question: "How much does a website cost?",
    answer:
      "Pricing depends on project scope, features, design complexity, and integrations. We provide custom quotations tailored to your specific requirements and business goals.",
    color: "#c47a3a",
    glow: "#c47a3a",
    glowRgba: "rgba(196,122,58,0.3)",
    gradient: "from-[#c47a3a] to-[#e8a064]",
  },
  {
    id: 2,
    question: "How long does development take?",
    answer:
      "Most business websites are delivered within 1–4 weeks, while larger platforms and applications may require additional development time depending on complexity and features.",
    color: "#e8a064",
    glow: "#e8a064",
    glowRgba: "rgba(232,160,100,0.3)",
    gradient: "from-[#e8a064] to-[#f0b07a]",
  },
  {
    id: 3,
    question: "Do you provide SEO services?",
    answer:
      "Yes. We offer technical SEO, on-page SEO, keyword research, local SEO, and performance optimization — all designed to increase your organic visibility and rankings.",
    color: "#f0b07a",
    glow: "#f0b07a",
    glowRgba: "rgba(240,176,122,0.3)",
    gradient: "from-[#f0b07a] to-[#c47a3a]",
  },
  {
    id: 4,
    question: "Can you redesign my existing website?",
    answer:
      "Absolutely. We can modernize your website, improve performance, enhance user experience, and optimize conversion rates while preserving your brand identity.",
    color: "#c47a3a",
    glow: "#c47a3a",
    glowRgba: "rgba(196,122,58,0.3)",
    gradient: "from-[#c47a3a] to-[#e8a064]",
  },
  {
    id: 5,
    question: "Do you build mobile applications?",
    answer:
      "Yes. We build native iOS and Android apps, as well as cross-platform solutions like React Native and Flutter, fully integrated with your APIs and backend systems.",
    color: "#e8a064",
    glow: "#e8a064",
    glowRgba: "rgba(232,160,100,0.3)",
    gradient: "from-[#e8a064] to-[#f0b07a]",
  },
  {
    id: 6,
    question: "What is your development stack?",
    answer:
      "We work primarily with Next.js, React, Node.js, TypeScript, Tailwind CSS, MongoDB, and AWS to build fast, secure, and easily scalable digital products.",
    color: "#f0b07a",
    glow: "#f0b07a",
    glowRgba: "rgba(240,176,122,0.3)",
    gradient: "from-[#f0b07a] to-[#c47a3a]",
  },
];

const TRUST_BADGES: TrustBadge[] = [
  { label: "Expert Support", Icon: Headphones },
  { label: "Transparent Work", Icon: BadgeCheck },
  { label: "Consultation Free", Icon: MessageCircle },
];

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
    <div aria-hidden={true} className="pointer-events-none absolute inset-0 rounded-[22px] overflow-hidden">
      <motion.div
        className={`absolute h-[2px] w-24 bg-gradient-to-r ${gradient} blur-[0.5px] opacity-90`}
        animate={{ offsetDistance: ["0%", "100%"] }}
        style={{
          offsetPath: `path('M 22 0 L calc(100% - 22px) 0 Q 100% 0 100% 22px L 100% calc(100% - 22px) Q 100% 100% calc(100% - 22px) 100% L 22px 100% Q 0 100% 0 calc(100% - 22px) L 0 22px Q 0 0 22px 0 Z')`,
        }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
});

const FAQRow = memo(function FAQRow({
  faq,
  index,
  isOpen,
  onToggle,
  reduced,
}: {
  faq: FAQItem;
  index: number;
  isOpen: boolean;
  onToggle: (id: number) => void;
  reduced: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const qId = `faq-q-${faq.id}`;
  const aId = `faq-a-${faq.id}`;

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 180, damping: 24 });
  const springY = useSpring(rotateY, { stiffness: 180, damping: 24 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!triggerRef.current || reduced) return;
      const rect = triggerRef.current.getBoundingClientRect();
      const cx = e.clientX - rect.left - rect.width / 2;
      const cy = e.clientY - rect.top - rect.height / 2;
      rotateX.set((-cy / (rect.height / 2)) * 3.5);
      rotateY.set((cx / (rect.width / 2)) * 3.5);
    },
    [reduced, rotateX, rotateY]
  );

  const handleMouseLeave = useCallback(() => {
    setHovered(false);
    rotateX.set(0);
    rotateY.set(0);
  }, [rotateX, rotateY]);

  return (
    <motion.div
      initial={reduced ? undefined : { opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: index * 0.08, ease: EASE_FAQ }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={
        reduced
          ? undefined
          : { rotateX: springX, rotateY: springY, transformPerspective: 800 }
      }
      className="group relative"
    >
      <div
        className={`relative rounded-[22px] border bg-[#141414]/95 border-[#262626] p-1 overflow-hidden transition-all duration-400 focus-within:ring-2 focus-within:ring-[#e8a064]/40 ${
          isOpen ? "border-[rgba(232,160,100,0.25)] shadow-md" : "hover:border-[#303030]"
        }`}
        style={{
          boxShadow: isOpen
            ? `0 0 0 1px ${faq.glowRgba}, 0 6px 36px -6px ${faq.glowRgba}`
            : hovered
            ? `0 0 0 1px ${faq.glowRgba}40`
            : "inset 0 1px 0 rgba(255,255,255,0.03)",
        }}
      >
        <BorderBeam gradient={faq.gradient} active={hovered || isOpen} reduced={reduced} />

        <div
          aria-hidden={true}
          className="pointer-events-none absolute -top-12 -left-12 w-36 h-36 rounded-full blur-3xl opacity-10"
          style={{ background: faq.color }}
        />

        <h3>
          <button
            ref={triggerRef}
            type="button"
            id={qId}
            aria-expanded={isOpen}
            aria-controls={aId}
            onClick={() => onToggle(faq.id)}
            className="w-full flex items-center justify-between gap-5 text-left px-6 py-5 cursor-pointer focus:outline-none"
          >
            <span
              className={`text-base sm:text-lg font-bold transition-colors duration-300 ${
                isOpen ? "text-[#e8a064]" : "text-[#d4d4d4] group-hover:text-[#e8a064]"
              }`}
            >
              {faq.question}
            </span>

            <span
              className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#262626] bg-[#1c1c1e] text-[#a1a1aa] transition-colors duration-300 ${
                isOpen ? "border-[#e8a064]/30 text-[#e8a064]" : "group-hover:border-[#e8a064]/20 group-hover:text-[#e8a064]"
              }`}
            >
              {isOpen ? (
                <Minus className="w-4 h-4" strokeWidth={2.2} />
              ) : (
                <Plus className="w-4 h-4" strokeWidth={2.2} />
              )}
            </span>
          </button>
        </h3>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              key="content"
              id={aId}
              role="region"
              aria-labelledby={qId}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.28, ease: EASE_FAQ }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-6 pt-1 text-[#a1a1aa] text-sm sm:text-base leading-relaxed border-t border-[#262626]/40 mt-1">
                {faq.answer}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
});

function SectionHeader({ visible, reduced }: { visible: boolean; reduced: boolean }) {
  const stagger = (i: number) => ({
    hidden: { opacity: 0, y: 28, filter: "blur(6px)" },
    visible: {
      opacity: 1, y: 0, filter: "blur(0px)",
      transition: { duration: 0.7, delay: i * 0.12, ease: EASE_FAQ },
    },
  });

  return (
    <div className="text-center max-w-2xl mx-auto mb-20 flex flex-col items-center gap-5">
      <motion.div
        variants={reduced ? undefined : stagger(0)}
        initial={reduced ? undefined : "hidden"}
        animate={visible ? "visible" : "hidden"}
      >
        <Badge>
          <Sparkles className="w-3.5 h-3.5 text-[#e8a064]" strokeWidth={2.2} aria-hidden={true} />
          <span className="ml-1.5">FAQ</span>
        </Badge>
      </motion.div>

      <motion.h2
        variants={reduced ? undefined : stagger(1)}
        initial={reduced ? undefined : "hidden"}
        animate={visible ? "visible" : "hidden"}
        className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.1]"
        id="faq-heading"
      >
        Frequently Asked
        <br />
        <span className="text-gradient-amber">Questions</span>
      </motion.h2>

      <motion.p
        variants={reduced ? undefined : stagger(2)}
        initial={reduced ? undefined : "hidden"}
        animate={visible ? "visible" : "hidden"}
        className="text-[#a1a1aa] text-base sm:text-lg leading-relaxed max-w-xl"
      >
        Find quick answers to common questions about our services, pricing, and
        development process.
      </motion.p>
    </div>
  );
}

function Background({ reduced }: { reduced: boolean }) {
  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 0.8,
        dur: Math.random() * 14 + 8,
        delay: Math.random() * 8,
        color: ["#c47a3a", "#e8a064", "#f0b07a"][i % 3],
        opacity: Math.random() * 0.12 + 0.05,
      })),
    []
  );

  return (
    <div aria-hidden={true} className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {!reduced && (
        <>
          <motion.div
            className="absolute rounded-full blur-[160px]"
            style={{
              width: 700, height: 400,
              background: "radial-gradient(ellipse, rgba(232,160,100,0.05), transparent 70%)",
              top: "5%", left: "-8%",
            }}
            animate={{ x: [0, 70, 0], y: [0, 40, 0] }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute rounded-full blur-[180px]"
            style={{
              width: 600, height: 500,
              background: "radial-gradient(ellipse, rgba(196,122,58,0.04), transparent 70%)",
              bottom: "0%", right: "-5%",
            }}
            animate={{ x: [0, -50, 0], y: [0, -35, 0] }}
            transition={{ duration: 26, repeat: Infinity, ease: "easeInOut", delay: 4 }}
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
                y: [0, -24, 0],
                x: [0, Math.sin(p.id * 1.3) * 12, 0],
                opacity: [p.opacity, p.opacity * 2, p.opacity],
              }}
              transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
        </>
      )}
    </div>
  );
}

function SectionSpotlight({ sectionRef }: { sectionRef: React.RefObject<HTMLElement | null> }) {
  const mx = useMotionValue(-1000);
  const my = useMotionValue(-1000);
  const sx = useSpring(mx, { stiffness: 55, damping: 18 });
  const sy = useSpring(my, { stiffness: 55, damping: 18 });

  useEffect(() => {
    let frameId: number | null = null;
    const handleMove = (e: MouseEvent) => {
      if (frameId) return;
      frameId = requestAnimationFrame(() => {
        frameId = null;
        if (!sectionRef.current) return;
        const rect = sectionRef.current.getBoundingClientRect();
        mx.set(e.clientX - rect.left);
        my.set(e.clientY - rect.top);
      });
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMove);
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [mx, my, sectionRef]);

  return (
    <motion.div
      aria-hidden={true}
      className="pointer-events-none absolute inset-0 z-0"
      style={{
        background: `radial-gradient(420px circle at ${sx}px ${sy}px, rgba(232,160,100,0.04), transparent 55%)`,
      }}
    />
  );
}

export default function ServicesFAQ() {
  const reduced = useReducedMotion() ?? false;
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [openId, setOpenId] = useState<number | null>(1);

  const handleToggle = useCallback((id: number) => {
    setOpenId((prev) => (prev === id ? null : id));
  }, []);

  return (
    <section
      id="services-faq"
      ref={sectionRef}
      aria-labelledby="faq-heading"
      className="relative w-full overflow-hidden py-24 sm:py-32 bg-[#0f0f0f]"
    >
      <Background reduced={reduced} />
      {!reduced && <SectionSpotlight sectionRef={sectionRef} />}

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader visible={isInView} reduced={reduced} />

        <div className="flex flex-col gap-4" role="list" aria-label="Services Frequently Asked Questions">
          {FAQS.map((faq, i) => (
            <FAQRow
              key={faq.id}
              faq={faq}
              index={i}
              isOpen={openId === faq.id}
              onToggle={handleToggle}
              reduced={reduced}
            />
          ))}
        </div>

        <div className="mt-16 flex flex-wrap justify-center items-center gap-6 sm:gap-8 border-t border-[#262626] pt-8">
          {TRUST_BADGES.map((b, i) => (
            <div key={i} className="flex items-center gap-2 text-[#a1a1aa] text-sm">
              <b.Icon className="w-5 h-5 text-[#e8a064]" strokeWidth={1.8} />
              <span className="font-semibold tracking-wide">{b.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div
        aria-hidden={true}
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0f0f0f] to-transparent"
      />
    </section>
  );
}