"use client";

import { useRef, useCallback, type ReactNode, type MouseEvent as ReactMouseEvent } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useScroll,
  useReducedMotion,
} from "framer-motion";
import {
  Sparkles,
  FileText,
  Search,
  MessageCircle,
  BadgeCheck,
  Rocket,
  type LucideIcon,
} from "lucide-react";

/**
 * HiringProcess.tsx — Axivon Technologies
 * Next.js 15 / TypeScript / Tailwind CSS / Framer Motion / Lucide React
 *
 * A premium, scroll-driven recruitment-journey timeline designed to sit
 * visually alongside CareersHero.tsx, WhyWorkWithUs.tsx and
 * OpenPositions.tsx.
 */

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

interface ProcessStep {
  id: string;
  step: string;
  icon: LucideIcon;
  title: string;
  description: string;
  accent: string;
}

/* -------------------------------------------------------------------------- */
/*  Static data                                                               */
/* -------------------------------------------------------------------------- */

const STEPS: ProcessStep[] = [
  {
    id: "application",
    step: "01",
    icon: FileText,
    title: "Application",
    description:
      "Submit your application and share your skills, experience, projects, and interests.",
    accent: "#00D4FF",
  },
  {
    id: "review",
    step: "02",
    icon: Search,
    title: "Review",
    description:
      "Our team carefully reviews your profile, projects, and technical background.",
    accent: "#2563EB",
  },
  {
    id: "interview",
    step: "03",
    icon: MessageCircle,
    title: "Interview",
    description:
      "A friendly discussion to understand your technical knowledge, communication skills, and career goals.",
    accent: "#7C3AED",
  },
  {
    id: "selection",
    step: "04",
    icon: BadgeCheck,
    title: "Selection",
    description:
      "Qualified candidates move forward based on skills, potential, and alignment with our culture.",
    accent: "#00D4FF",
  },
  {
    id: "onboarding",
    step: "05",
    icon: Rocket,
    title: "Onboarding",
    description:
      "Start your journey with Axivon Technologies and begin building meaningful products.",
    accent: "#7C3AED",
  },
];

/* -------------------------------------------------------------------------- */
/*  Motion variants                                                          */
/* -------------------------------------------------------------------------- */

const EASE = [0.16, 1, 0.3, 1] as const;

const sectionContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 26, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: EASE },
  },
};

/* -------------------------------------------------------------------------- */
/*  Decorative background layers                                             */
/* -------------------------------------------------------------------------- */

function AuroraLayer({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -top-44 -right-36 h-[38rem] w-[38rem] rounded-full blur-[130px]"
        style={{ background: "radial-gradient(circle, rgba(124,58,237,0.34), transparent 70%)" }}
        animate={reduceMotion ? undefined : { x: [0, -55, 0], y: [0, 40, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 -left-40 h-[34rem] w-[34rem] rounded-full blur-[130px]"
        style={{ background: "radial-gradient(circle, rgba(37,99,235,0.34), transparent 70%)" }}
        animate={reduceMotion ? undefined : { x: [0, 50, 0], y: [0, -35, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-12rem] right-1/3 h-[32rem] w-[32rem] rounded-full blur-[130px]"
        style={{ background: "radial-gradient(circle, rgba(0,212,255,0.24), transparent 70%)" }}
        animate={reduceMotion ? undefined : { x: [0, -40, 0], y: [0, 25, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

function PerspectiveGrid() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden" style={{ perspective: 900 }}>
      <div
        className="absolute inset-x-[-20%] top-[6%] h-[55%] opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          transform: "rotateX(58deg)",
          maskImage: "linear-gradient(to bottom, black, transparent 85%)",
        }}
      />
    </div>
  );
}

function NoiseTexture() {
  return (
    <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.045] mix-blend-overlay">
      <filter id="hp-noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#hp-noise)" />
    </svg>
  );
}

function FloatingParticles({ reduceMotion }: { reduceMotion: boolean }) {
  const particles = [
    { left: 8, top: 12, size: 3, hue: "#00D4FF", dur: 13 },
    { left: 18, top: 64, size: 2, hue: "#7C3AED", dur: 17 },
    { left: 30, top: 36, size: 2.5, hue: "#2563EB", dur: 15 },
    { left: 44, top: 80, size: 2, hue: "#00D4FF", dur: 19 },
    { left: 60, top: 20, size: 3, hue: "#7C3AED", dur: 14 },
    { left: 74, top: 58, size: 2, hue: "#2563EB", dur: 16 },
    { left: 86, top: 30, size: 2.5, hue: "#00D4FF", dur: 18 },
    { left: 94, top: 70, size: 3, hue: "#7C3AED", dur: 20 },
  ];

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      {particles.map((p, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            background: p.hue,
            boxShadow: `0 0 10px 2px ${p.hue}`,
          }}
          animate={reduceMotion ? undefined : { y: [0, -28, 0], opacity: [0.2, 0.9, 0.2] }}
          transition={{ duration: p.dur, repeat: Infinity, ease: "easeInOut", delay: i * 0.45 }}
        />
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Animated gradient heading phrase                                         */
/* -------------------------------------------------------------------------- */

function GradientPhrase({ children }: { children: ReactNode }) {
  return (
    <motion.span
      className="relative inline-block bg-clip-text text-transparent"
      style={{
        backgroundImage: "linear-gradient(110deg, #00D4FF, #2563EB 35%, #7C3AED 65%, #00D4FF)",
        backgroundSize: "300% 100%",
      }}
      animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
    >
      {children}
    </motion.span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Step card — 3D tilt + spotlight + glow + glass + border beam            */
/* -------------------------------------------------------------------------- */

function StepCard({ step, align }: { step: ProcessStep; align: "left" | "right" }) {
  const Icon = step.icon;
  const reduceMotion = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);

  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 200, damping: 18 });
  const sry = useSpring(ry, { stiffness: 200, damping: 18 });

  const spotX = useMotionValue(50);
  const spotY = useMotionValue(50);
  const sSpotX = useSpring(spotX, { stiffness: 150, damping: 20 });
  const sSpotY = useSpring(spotY, { stiffness: 150, damping: 20 });
  const spotlightBg = useTransform(
    [sSpotX, sSpotY],
    ([x, y]: number[]) => `radial-gradient(280px circle at ${x}% ${y}%, ${step.accent}26, transparent 70%)`
  );

  const hover = useMotionValue(0);
  const sHover = useSpring(hover, { stiffness: 220, damping: 22 });

  const handleMove = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      const rect = cardRef.current?.getBoundingClientRect();
      if (!rect) return;
      const relX = (e.clientX - rect.left) / rect.width;
      const relY = (e.clientY - rect.top) / rect.height;
      spotX.set(relX * 100);
      spotY.set(relY * 100);
      if (!reduceMotion) {
        rx.set((relY - 0.5) * -8);
        ry.set((relX - 0.5) * 10);
      }
    },
    [reduceMotion, rx, ry, spotX, spotY]
  );

  const handleEnter = useCallback(() => hover.set(1), [hover]);
  const handleLeave = useCallback(() => {
    hover.set(0);
    rx.set(0);
    ry.set(0);
  }, [hover, rx, ry]);

  return (
    <motion.div
      style={{ perspective: 1200 }}
      className={["relative w-full", align === "right" ? "lg:text-right" : "lg:text-left"].join(" ")}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMove}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        style={{ rotateX: srx, rotateY: sry, transformStyle: "preserve-3d" }}
        whileHover={{ scale: 1.02, y: -6 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        tabIndex={0}
        role="article"
        aria-label={`Step ${step.step}: ${step.title}`}
        className="group relative rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF]/60"
      >
        {/* animated border beam */}
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            background: "conic-gradient(from 0deg, #00D4FF, #2563EB, #7C3AED, #00D4FF)",
            padding: 1.5,
            WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
            opacity: sHover,
            animation: "hp-spin 3s linear infinite",
          }}
        />
        <div className="absolute inset-0 rounded-2xl border border-white/10" />

        <div
          className={[
            "relative overflow-hidden rounded-2xl bg-white/[0.045] p-6 backdrop-blur-xl transition-shadow duration-300 sm:p-7",
            "shadow-[0_10px_40px_-12px_rgba(0,0,0,0.45)] group-hover:shadow-[0_24px_70px_-18px_var(--axv-glow)]",
          ].join(" ")}
          style={{ ["--axv-glow" as string]: `${step.accent}66` }}
        >
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{ background: spotlightBg }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{ backgroundImage: `linear-gradient(to right, transparent, ${step.accent}aa, transparent)` }}
          />

          <div
            className={[
              "relative z-10 flex items-start gap-4",
              align === "right" ? "lg:flex-row-reverse lg:justify-end" : "",
            ].join(" ")}
          >
            <span
              className="flex h-12 w-12 flex-none items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
              style={{ background: `${step.accent}1f`, color: step.accent }}
            >
              <Icon className="h-6 w-6" strokeWidth={1.8} aria-hidden />
            </span>
            <div className="min-w-0">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-white/35">
                Step {step.step}
              </span>
              <h3 className="mt-0.5 text-lg font-semibold tracking-tight text-white">{step.title}</h3>
            </div>
          </div>

          <p className="relative z-10 mt-4 text-sm leading-relaxed text-white/55">
            {step.description}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Timeline marker (center node, connecting line + icon)                   */
/* -------------------------------------------------------------------------- */

function TimelineMarker({ step, index }: { step: ProcessStep; index: number }) {
  const reduceMotion = useReducedMotion();
  const Icon = step.icon;

  return (
    <div className="relative flex flex-none flex-col items-center">
      <motion.div
        animate={reduceMotion ? undefined : { y: [0, -6, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: index * 0.25 }}
        className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-[#0a0f24] backdrop-blur-xl"
        style={{ boxShadow: `0 0 0 1px ${step.accent}33, 0 0 28px ${step.accent}55` }}
      >
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full"
          style={{ boxShadow: `0 0 0 1px ${step.accent}55` }}
          animate={reduceMotion ? undefined : { opacity: [0.4, 0.9, 0.4], scale: [1, 1.12, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 }}
        />
        <Icon className="h-5 w-5" style={{ color: step.accent }} aria-hidden />
      </motion.div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main component                                                           */
/* -------------------------------------------------------------------------- */

export default function HiringProcess() {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Whole-section parallax (orbs)
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const parallaxX = useSpring(px, { stiffness: 55, damping: 20 });
  const parallaxY = useSpring(py, { stiffness: 55, damping: 20 });
  const orbX = useTransform(parallaxX, (v) => v * 22);
  const orbY = useTransform(parallaxY, (v) => v * 22);
  const orbXInverse = useTransform(parallaxX, (v) => v * -16);
  const orbYInverse = useTransform(parallaxY, (v) => v * -16);

  const handleSectionMove = useCallback(
    (e: ReactMouseEvent<HTMLElement>) => {
      if (reduceMotion) return;
      const rect = sectionRef.current?.getBoundingClientRect();
      if (!rect) return;
      px.set((e.clientX - rect.left) / rect.width - 0.5);
      py.set((e.clientY - rect.top) / rect.height - 0.5);
    },
    [reduceMotion, px, py]
  );

  // Scroll-driven animated progress line along the timeline.
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start 80%", "end 60%"],
  });
  const lineScale = useSpring(scrollYProgress, { stiffness: 80, damping: 24, mass: 0.4 });

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleSectionMove}
      aria-label="Axivon Technologies hiring process"
      className="relative isolate w-full overflow-hidden px-4 py-24 sm:px-6 sm:py-28 lg:px-10 lg:py-32 2xl:px-20"
      style={{ background: "#050816" }}
    >
      <style>{`
        @keyframes hp-spin { to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) {
          .hp-respect-motion * { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; }
        }
      `}</style>

      <AuroraLayer reduceMotion={!!reduceMotion} />
      <PerspectiveGrid />
      <FloatingParticles reduceMotion={!!reduceMotion} />
      <NoiseTexture />

      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-[8%] top-[12%] h-72 w-72 rounded-full blur-[100px] sm:h-96 sm:w-96"
        style={{ background: "radial-gradient(circle, rgba(124,58,237,0.26), transparent 70%)", x: orbX, y: orbY }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute bottom-[8%] right-[6%] h-80 w-80 rounded-full blur-[110px] sm:h-[26rem] sm:w-[26rem]"
        style={{ background: "radial-gradient(circle, rgba(0,212,255,0.26), transparent 70%)", x: orbXInverse, y: orbYInverse }}
      />

      <div className="relative mx-auto max-w-[1400px] 2xl:max-w-[1600px]">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.35 }}
          variants={sectionContainer}
          className="mx-auto max-w-2xl text-center"
        >
          <motion.span
            variants={fadeUp}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#00D4FF] backdrop-blur-md"
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Hiring Process
          </motion.span>

          <motion.h2
            variants={fadeUp}
            className="mt-6 text-3xl font-bold leading-[1.15] tracking-tight text-white sm:text-4xl lg:text-[2.75rem]"
          >
            A Simple And <GradientPhrase>Transparent</GradientPhrase>
            <br />
            Journey To <GradientPhrase>Join Axivon</GradientPhrase>
          </motion.h2>

          <motion.p variants={fadeUp} className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg">
            We believe hiring should be clear, transparent, and focused on
            finding passionate individuals who are excited to learn, grow,
            and contribute.
          </motion.p>
        </motion.div>

        {/* Timeline */}
        <div ref={timelineRef} className="relative mt-20" role="list" aria-label="Hiring process steps">
          {/* base rail */}
          <div
            aria-hidden
            className="absolute left-7 top-0 h-full w-px bg-white/10 lg:left-1/2 lg:-translate-x-1/2"
          />
          {/* animated progress line */}
          <motion.div
            aria-hidden
            style={{ scaleY: lineScale, transformOrigin: "top" }}
            className="absolute left-7 top-0 h-full w-px lg:left-1/2 lg:-translate-x-1/2"
          >
            <div
              className="h-full w-full"
              style={{
                backgroundImage: "linear-gradient(to bottom, #00D4FF, #2563EB, #7C3AED)",
                boxShadow: "0 0 12px 1px rgba(0,212,255,0.6)",
              }}
            />
          </motion.div>

          <div className="flex flex-col gap-10 lg:gap-6">
            {STEPS.map((step, index) => {
              const isRight = index % 2 === 1;
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 36 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.6, ease: EASE, delay: 0.05 }}
                  role="listitem"
                  className="relative grid grid-cols-[3.5rem_1fr] items-center gap-5 lg:grid-cols-[1fr_3.5rem_1fr] lg:gap-10"
                >
                  {/* marker — first column on mobile, center column on desktop */}
                  <div className="order-1 lg:order-2 lg:col-start-2 lg:justify-self-center">
                    <TimelineMarker step={step} index={index} />
                  </div>

                  {/* card: mobile always right of marker; desktop alternates sides */}
                  {!isRight && (
                    <div className="order-2 hidden lg:order-1 lg:col-start-1 lg:block">
                      <StepCard step={step} align="right" />
                    </div>
                  )}

                  <div className={["order-2 lg:order-3 lg:col-start-3", isRight ? "lg:block" : "lg:hidden"].join(" ")}>
                    <StepCard step={step} align="left" />
                  </div>

                  {/* mobile-only card (always to the right of the marker, single column flow) */}
                  <div className="order-2 col-start-2 hidden max-lg:block">
                    <StepCard step={step} align="left" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}