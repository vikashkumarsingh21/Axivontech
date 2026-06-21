"use client";

import { useRef, useState, useCallback, useMemo, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  CalendarCheck,
  Zap,
  Cpu,
  Code2,
  Boxes,
  Rocket,
  ShieldCheck,
  Infinity as InfinityIcon,
  Check,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

interface TrustIndicator {
  id: string;
  label: string;
}

interface FloatingIcon {
  id: string;
  Icon: typeof Cpu;
  top: string;
  left: string;
  size: number;
  duration: number;
  delay: number;
  depth: number;
}

interface CTAButtonProps {
  children: ReactNode;
  href?: string;
  variant: "primary" | "secondary";
  icon?: ReactNode;
  ariaLabel: string;
}

/* -------------------------------------------------------------------------- */
/*  Static content                                                           */
/* -------------------------------------------------------------------------- */

const TRUST_INDICATORS: TrustIndicator[] = [
  { id: "fast-response", label: "Fast Response" },
  { id: "modern-stack", label: "Modern Technology Stack" },
  { id: "scalable-architecture", label: "Scalable Architecture" },
  { id: "long-term-partnership", label: "Long-Term Partnership" },
];

const FLOATING_ICONS: FloatingIcon[] = [
  { id: "cpu", Icon: Cpu, top: "12%", left: "8%", size: 22, duration: 7, delay: 0, depth: 18 },
  { id: "code", Icon: Code2, top: "22%", left: "88%", size: 20, duration: 8.5, delay: 0.6, depth: 24 },
  { id: "boxes", Icon: Boxes, top: "78%", left: "10%", size: 24, duration: 9, delay: 1.1, depth: 16 },
  { id: "rocket", Icon: Rocket, top: "70%", left: "90%", size: 22, duration: 7.5, delay: 0.3, depth: 22 },
  { id: "shield", Icon: ShieldCheck, top: "8%", left: "48%", size: 18, duration: 6.5, delay: 0.9, depth: 14 },
  { id: "infinity", Icon: InfinityIcon, top: "88%", left: "52%", size: 20, duration: 8, delay: 1.4, depth: 20 },
];

/* -------------------------------------------------------------------------- */
/*  Animation variants                                                       */
/* -------------------------------------------------------------------------- */

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
};

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

/* -------------------------------------------------------------------------- */
/*  Magnetic / glowing CTA button                                            */
/* -------------------------------------------------------------------------- */

function CTAButton({ children, href = "#contact", variant, icon, ariaLabel }: CTAButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 18, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 200, damping: 18, mass: 0.4 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (prefersReducedMotion || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const relX = e.clientX - rect.left - rect.width / 2;
      const relY = e.clientY - rect.top - rect.height / 2;
      x.set(relX * 0.28);
      y.set(relY * 0.32);
    },
    [prefersReducedMotion, x, y]
  );

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  const isPrimary = variant === "primary";

  return (
    <motion.a
      ref={ref}
      href={href}
      aria-label={ariaLabel}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      whileTap={{ scale: 0.96 }}
      whileHover={{ scale: 1.035 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className={[
        "group relative isolate inline-flex items-center justify-center gap-2.5",
        "rounded-full px-8 py-4 text-sm sm:text-base font-semibold tracking-wide",
        "outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050816]",
        "transition-colors duration-300 select-none",
        isPrimary
          ? "text-white focus-visible:ring-cyan-400"
          : "text-white/90 focus-visible:ring-white/60 border border-white/15 bg-white/[0.04] backdrop-blur-md hover:bg-white/[0.08] hover:border-white/25",
      ].join(" ")}
    >
      {isPrimary && (
        <>
          {/* Gradient fill */}
          <span
            aria-hidden
            className="absolute inset-0 -z-10 rounded-full bg-[linear-gradient(110deg,#2563EB,45%,#7C3AED,75%,#00D4FF)] opacity-100 transition-transform duration-500 group-hover:scale-[1.04]"
          />
          {/* Animated glow halo */}
          <motion.span
            aria-hidden
            className="absolute -inset-1 -z-20 rounded-full bg-[linear-gradient(110deg,#2563EB,#7C3AED,#00D4FF)] opacity-60 blur-xl"
            animate={
              prefersReducedMotion
                ? undefined
                : { opacity: [0.45, 0.75, 0.45], scale: [1, 1.06, 1] }
            }
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Border beam */}
          <span className="absolute inset-0 -z-10 rounded-full overflow-hidden">
            <motion.span
              aria-hidden
              className="absolute inset-[-40%] bg-[conic-gradient(from_0deg,transparent,rgba(255,255,255,0.85),transparent_30%)]"
              animate={prefersReducedMotion ? undefined : { rotate: 360 }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "linear" }}
              style={{ mixBlendMode: "overlay" }}
            />
          </span>
          {/* Sheen sweep */}
          <span className="absolute inset-0 -z-10 overflow-hidden rounded-full">
            <span className="absolute -inset-y-4 -left-1/2 w-1/3 -skew-x-12 bg-white/30 blur-md opacity-0 transition-all duration-700 group-hover:opacity-100 group-hover:translate-x-[280%]" />
          </span>
        </>
      )}

      <span className="relative z-10">{children}</span>
      <motion.span
        className="relative z-10 flex items-center"
        animate={
          prefersReducedMotion
            ? undefined
            : { x: [0, 4, 0] }
        }
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      >
        {icon ?? (
          <ArrowRight
            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden="true"
          />
        )}
      </motion.span>
    </motion.a>
  );
}

/* -------------------------------------------------------------------------- */
/*  Decorative: holographic rings                                            */
/* -------------------------------------------------------------------------- */

function HolographicRings({ reduceMotion }: { reduceMotion: boolean }) {
  const rings = [
    { size: 340, color: "rgba(37,99,235,0.35)", duration: 22, reverse: false },
    { size: 470, color: "rgba(124,58,237,0.28)", duration: 30, reverse: true },
    { size: 600, color: "rgba(0,212,255,0.2)", duration: 38, reverse: false },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {rings.map((ring, i) => (
        <motion.div
          key={ring.size}
          aria-hidden
          className="absolute rounded-full border"
          style={{
            width: ring.size,
            height: ring.size,
            borderColor: ring.color,
            borderWidth: 1,
            boxShadow: `0 0 60px ${ring.color}`,
          }}
          animate={
            reduceMotion
              ? undefined
              : {
                  rotate: ring.reverse ? -360 : 360,
                  scale: [1, 1.04, 1],
                }
          }
          transition={{
            rotate: { duration: ring.duration, repeat: Infinity, ease: "linear" },
            scale: { duration: 6 + i, repeat: Infinity, ease: "easeInOut" },
          }}
        />
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Decorative: floating tech icons                                          */
/* -------------------------------------------------------------------------- */

function FloatingTechIcons({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 hidden sm:block" aria-hidden="true">
      {FLOATING_ICONS.map(({ id, Icon, top, left, size, duration, delay, depth }) => (
        <motion.div
          key={id}
          className="absolute"
          style={{ top, left }}
          animate={
            reduceMotion
              ? undefined
              : {
                  y: [0, -depth, 0],
                  opacity: [0.35, 0.85, 0.35],
                }
          }
          transition={{
            duration,
            delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div
            className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm"
            style={{ width: size * 2, height: size * 2 }}
          >
            <Icon size={size} className="text-cyan-300/70" strokeWidth={1.5} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Decorative: ambient particles                                            */
/* -------------------------------------------------------------------------- */

function AmbientParticles({ reduceMotion }: { reduceMotion: boolean }) {
  const particles = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: Math.random() * 2.4 + 1,
        duration: Math.random() * 10 + 10,
        delay: Math.random() * 6,
      })),
    []
  );

  if (reduceMotion) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full bg-cyan-200/70"
          style={{
            top: `${p.top}%`,
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            boxShadow: "0 0 6px 1px rgba(0,212,255,0.6)",
          }}
          animate={{
            y: [0, -40, 0],
            opacity: [0, 0.9, 0],
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
/*  Decorative: perspective grid                                             */
/* -------------------------------------------------------------------------- */

function PerspectiveGrid() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_30%,black_70%,transparent)]"
    >
      <div
        className="absolute inset-x-0 bottom-0 h-[140%] origin-bottom opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(124,58,237,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.5) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          transform: "perspective(600px) rotateX(58deg)",
        }}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main component                                                           */
/* -------------------------------------------------------------------------- */

export default function PortfolioCTA() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const reduceMotion = Boolean(prefersReducedMotion);

  // Mouse-follow spotlight
  const spotlightX = useMotionValue(50);
  const spotlightY = useMotionValue(50);
  const smoothX = useSpring(spotlightX, { stiffness: 60, damping: 20 });
  const smoothY = useSpring(spotlightY, { stiffness: 60, damping: 20 });
  const spotlightBackground = useTransform(
    [smoothX, smoothY],
    ([sx, sy]) =>
      `radial-gradient(560px circle at ${sx}% ${sy}%, rgba(0,212,255,0.16), transparent 60%)`
  );

  const handlePointerMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (reduceMotion || !sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      spotlightX.set(((e.clientX - rect.left) / rect.width) * 100);
      spotlightY.set(((e.clientY - rect.top) / rect.height) * 100);
    },
    [reduceMotion, spotlightX, spotlightY]
  );

  return (
    <section
      ref={sectionRef}
      onMouseMove={handlePointerMove}
      aria-labelledby="portfolio-cta-heading"
      className="relative isolate w-full overflow-hidden bg-[#050816] px-4 py-24 sm:px-6 sm:py-32 lg:py-40"
    >
      {/* ---------------------------------------------------------------- */}
      {/* Background layers                                                */}
      {/* ---------------------------------------------------------------- */}

      {/* Aurora wash */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <motion.div
          className="absolute -top-1/3 left-1/2 h-[60vw] w-[60vw] max-w-[900px] max-h-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.35),transparent_65%)] blur-3xl"
          animate={reduceMotion ? undefined : { x: [-40, 40, -40], y: [0, 30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/4 -right-1/4 h-[50vw] w-[50vw] max-w-[760px] max-h-[760px] rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.3),transparent_65%)] blur-3xl"
          animate={reduceMotion ? undefined : { x: [20, -30, 20], y: [-20, 20, -20] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 left-0 h-[45vw] w-[45vw] max-w-[640px] max-h-[640px] -translate-x-1/4 translate-y-1/4 rounded-full bg-[radial-gradient(circle,rgba(0,212,255,0.25),transparent_65%)] blur-3xl"
          animate={reduceMotion ? undefined : { x: [0, 40, 0], y: [0, -20, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <PerspectiveGrid />
      <AmbientParticles reduceMotion={reduceMotion} />

      {/* Mouse-follow spotlight */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{ background: spotlightBackground }}
        aria-hidden="true"
      />

      {/* Noise texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* ---------------------------------------------------------------- */}
      {/* Content                                                          */}
      {/* ---------------------------------------------------------------- */}

      <motion.div
        className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        {/* Badge */}
        <motion.div
          variants={fadeUpVariants}
          className="relative mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 backdrop-blur-md"
        >
          <motion.span
            animate={reduceMotion ? undefined : { rotate: [0, 18, -10, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles className="h-3.5 w-3.5 text-cyan-300" aria-hidden="true" />
          </motion.span>
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-white/80">
            Let&rsquo;s Build Something Amazing
          </span>
        </motion.div>

        {/* Glassmorphism card wrapping the core CTA */}
        <motion.div
          variants={fadeUpVariants}
          className="relative w-full rounded-[2rem] border border-white/10 bg-white/[0.03] px-6 py-12 shadow-[0_0_120px_-20px_rgba(37,99,235,0.45)] backdrop-blur-xl sm:px-10 sm:py-16 lg:px-16"
        >
          {/* Border beam around the card */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2rem]">
            <motion.div
              aria-hidden="true"
              className="absolute -inset-[150%]"
              style={{
                background:
                  "conic-gradient(from 0deg, transparent 0%, rgba(0,212,255,0.55) 8%, transparent 18%)",
              }}
              animate={reduceMotion ? undefined : { rotate: 360 }}
              transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
            />
          </div>
          <div className="pointer-events-none absolute inset-[1px] rounded-[calc(2rem-1px)] bg-[#050816]/[0.92]" />

          {/* Holographic rings + floating icons, contained within the card */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2rem]">
            <HolographicRings reduceMotion={reduceMotion} />
            <FloatingTechIcons reduceMotion={reduceMotion} />
          </div>

          {/* Soft top reflection */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-[2rem] bg-gradient-to-r from-transparent via-white/40 to-transparent"
          />

          <div className="relative z-10">
            {/* Heading */}
            <motion.h2
              id="portfolio-cta-heading"
              variants={fadeUpVariants}
              className="mx-auto max-w-3xl text-[2rem] font-bold leading-[1.15] tracking-tight text-white sm:text-5xl lg:text-[3.4rem]"
            >
              Ready To{" "}
              <span className="relative inline-block">
                <motion.span
                  className="bg-[linear-gradient(110deg,#2563EB,#7C3AED,#00D4FF,#2563EB)] bg-clip-text text-transparent"
                  style={{ backgroundSize: "300% 100%" }}
                  animate={reduceMotion ? undefined : { backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                >
                  Transform
                </motion.span>
              </span>{" "}
              Your{" "}
              <span className="relative inline-block">
                <motion.span
                  className="bg-[linear-gradient(110deg,#00D4FF,#2563EB,#7C3AED,#00D4FF)] bg-clip-text text-transparent"
                  style={{ backgroundSize: "300% 100%" }}
                  animate={reduceMotion ? undefined : { backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear", delay: 0.4 }}
                >
                  Next Big Idea
                </motion.span>
              </span>
              ?
            </motion.h2>

            {/* Description */}
            <motion.p
              variants={fadeUpVariants}
              className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg"
            >
              Whether you&rsquo;re building a startup, scaling a business, launching a SaaS
              platform, developing an AI solution, or creating a next-generation digital
              experience, Axivon Technologies is ready to bring your vision to life.
            </motion.p>

            {/* Buttons */}
            <motion.div
              variants={fadeUpVariants}
              className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <CTAButton
                variant="primary"
                href="#start-project"
                ariaLabel="Start your project with Axivon Technologies"
                icon={<Zap className="h-4 w-4" aria-hidden="true" />}
              >
                Start Your Project
              </CTAButton>
              <CTAButton
                variant="secondary"
                href="#consultation"
                ariaLabel="Book a free consultation with Axivon Technologies"
                icon={<CalendarCheck className="h-4 w-4" aria-hidden="true" />}
              >
                Book A Free Consultation
              </CTAButton>
            </motion.div>

            {/* Trust indicators */}
            <motion.ul
              variants={fadeUpVariants}
              className="mt-12 flex flex-wrap items-center justify-center gap-x-7 gap-y-3"
              aria-label="Why partner with Axivon Technologies"
            >
              {TRUST_INDICATORS.map(({ id, label }) => (
                <li
                  key={id}
                  className="flex items-center gap-2 text-sm font-medium text-white/70"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-[#2563EB] to-[#00D4FF]">
                    <Check className="h-3 w-3 text-white" strokeWidth={3} aria-hidden="true" />
                  </span>
                  {label}
                </li>
              ))}
            </motion.ul>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}