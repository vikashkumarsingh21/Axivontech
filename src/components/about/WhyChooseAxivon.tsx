"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
  type Variants,
} from "framer-motion";
import {
  Rocket,
  BrainCircuit,
  TrendingUp,
  Headphones,
  ShieldCheck,
  Layers3,
  BadgeCheck,
  type LucideIcon,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface BentoCardData {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  from: string;
  via: string;
  to: string;
  /** Literal Tailwind classes controlling the card's footprint in the bento grid. */
  gridClassName: string;
  size: "md" | "lg" | "xl";
  techStack?: string[];
}

interface StatData {
  id: string;
  label: string;
  countUp: boolean;
  target?: number;
  suffix?: string;
  display?: string;
}

interface Particle {
  top: string;
  left: string;
  size: number;
  duration: number;
  delay: number;
}

/* -------------------------------------------------------------------------- */
/*  Static content                                                            */
/* -------------------------------------------------------------------------- */

const CARDS: BentoCardData[] = [
  {
    id: "fast-delivery",
    icon: Rocket,
    title: "Fast Delivery",
    description:
      "Launch projects faster with streamlined development processes.",
    from: "#2563EB",
    via: "#7C3AED",
    to: "#00D4FF",
    gridClassName: "sm:col-span-2 lg:col-span-2",
    size: "lg",
  },
  {
    id: "ai-solutions",
    icon: BrainCircuit,
    title: "AI Powered Solutions",
    description:
      "Intelligent automation and AI integrations built for modern businesses.",
    from: "#7C3AED",
    via: "#00D4FF",
    to: "#2563EB",
    gridClassName: "sm:col-span-2 lg:col-span-2",
    size: "lg",
  },
  {
    id: "seo-growth",
    icon: TrendingUp,
    title: "SEO & Growth Focused",
    description: "Websites designed to rank higher and generate more leads.",
    from: "#00D4FF",
    via: "#2563EB",
    to: "#7C3AED",
    gridClassName: "sm:col-span-1 lg:col-span-1",
    size: "md",
  },
  {
    id: "dedicated-support",
    icon: Headphones,
    title: "Dedicated Support",
    description: "Continuous assistance and maintenance after deployment.",
    from: "#2563EB",
    via: "#00D4FF",
    to: "#7C3AED",
    gridClassName: "sm:col-span-1 lg:col-span-1",
    size: "md",
  },
  {
    id: "secure-scalable",
    icon: ShieldCheck,
    title: "Secure & Scalable",
    description: "Enterprise-grade security and future-proof architecture.",
    from: "#7C3AED",
    via: "#2563EB",
    to: "#00D4FF",
    gridClassName: "sm:col-span-2 lg:col-span-2",
    size: "lg",
  },
  {
    id: "tech-stack",
    icon: Layers3,
    title: "Modern Technology Stack",
    description:
      "Built with Next.js, React, TypeScript, Cloud and AI technologies.",
    from: "#2563EB",
    via: "#7C3AED",
    to: "#00D4FF",
    gridClassName: "sm:col-span-2 lg:col-span-4",
    size: "xl",
    techStack: ["Next.js", "React", "TypeScript", "Cloud", "AI"],
  },
];

const STATS: StatData[] = [
  {
    id: "projects",
    label: "Projects Delivered",
    countUp: true,
    target: 10,
    suffix: "+",
  },
  {
    id: "focus",
    label: "Client Focus",
    countUp: true,
    target: 100,
    suffix: "%",
  },
  {
    id: "support",
    label: "Support",
    countUp: false,
    display: "24/7",
  },
  {
    id: "team",
    label: "Core Team Members",
    countUp: true,
    target: 2,
    suffix: "+",
  },
];

const PARTICLES: Particle[] = [
  { top: "10%", left: "8%", size: 3, duration: 7.5, delay: 0 },
  { top: "18%", left: "84%", size: 2, duration: 9, delay: 1 },
  { top: "34%", left: "20%", size: 2.5, duration: 8.2, delay: 0.5 },
  { top: "46%", left: "92%", size: 2, duration: 10.5, delay: 1.8 },
  { top: "58%", left: "12%", size: 3, duration: 7, delay: 2.2 },
  { top: "70%", left: "72%", size: 2.5, duration: 9.5, delay: 0.8 },
  { top: "6%", left: "55%", size: 2, duration: 6.5, delay: 1.4 },
  { top: "84%", left: "38%", size: 3, duration: 8.8, delay: 0.2 },
  { top: "28%", left: "62%", size: 2, duration: 7.8, delay: 1.1 },
  { top: "92%", left: "82%", size: 2.5, duration: 9.2, delay: 0.6 },
];

const GLASS =
  "rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl";

const NOISE_TEXTURE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

const SIZE_STYLES: Record<
  BentoCardData["size"],
  {
    padding: string;
    iconWrap: string;
    iconSize: string;
    title: string;
    desc: string;
  }
> = {
  md: {
    padding: "p-6 sm:p-7",
    iconWrap: "h-12 w-12",
    iconSize: "h-5 w-5",
    title: "text-lg sm:text-xl",
    desc: "text-sm",
  },
  lg: {
    padding: "p-7 sm:p-8",
    iconWrap: "h-14 w-14",
    iconSize: "h-6 w-6",
    title: "text-xl sm:text-2xl",
    desc: "text-sm sm:text-base",
  },
  xl: {
    padding: "p-8 sm:p-10",
    iconWrap: "h-14 w-14",
    iconSize: "h-6 w-6",
    title: "text-2xl sm:text-3xl",
    desc: "text-base sm:text-lg",
  },
};

/* -------------------------------------------------------------------------- */
/*  Animation variants                                                        */
/* -------------------------------------------------------------------------- */

const containerStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const cardGridStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function hexToRgbChannels(hex: string): string {
  const sanitized = hex.replace("#", "");
  const value = parseInt(sanitized, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `${r}, ${g}, ${b}`;
}

function useCountUp(
  target: number,
  shouldAnimate: boolean,
  duration = 1.6
): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!shouldAnimate) return;

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = (now - start) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [shouldAnimate, target, duration]);

  return value;
}

/* -------------------------------------------------------------------------- */
/*  Animated gradient text                                                    */
/* -------------------------------------------------------------------------- */

function GradientText({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.span
      className={`inline-block bg-gradient-to-r from-[#2563EB] via-[#7C3AED] to-[#00D4FF] bg-[length:200%_auto] bg-clip-text text-transparent ${className}`}
      animate={
        shouldReduceMotion
          ? undefined
          : { backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }
      }
      transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
    >
      {children}
    </motion.span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Background: grid, aurora, parallax blobs, particles, noise                */
/* -------------------------------------------------------------------------- */

function AuroraBackground() {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const parallaxBlue = useTransform(scrollYProgress, [0, 1], [-50, 50]);
  const parallaxPurple = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const parallaxCyan = useTransform(scrollYProgress, [0, 1], [-30, 30]);

  return (
    <div
      ref={ref}
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-[#050816]" />

      {/* grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.7) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage:
            "radial-gradient(ellipse 75% 65% at 50% 10%, black 35%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 75% 65% at 50% 10%, black 35%, transparent 100%)",
        }}
      />

      {/* large aurora light streaks */}
      <motion.div
        className="absolute left-1/2 top-[-12%] h-[36rem] w-[150%] -translate-x-1/2 rotate-[-6deg] opacity-25 mix-blend-screen blur-[110px]"
        style={{
          background:
            "linear-gradient(90deg, transparent, #2563EB, #7C3AED, #00D4FF, transparent)",
        }}
        animate={shouldReduceMotion ? undefined : { x: ["-4%", "4%", "-4%"] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-1/2 top-[10%] h-[24rem] w-[140%] -translate-x-1/2 rotate-[5deg] opacity-15 mix-blend-screen blur-[100px]"
        style={{
          background:
            "linear-gradient(90deg, transparent, #00D4FF, #2563EB, transparent)",
        }}
        animate={shouldReduceMotion ? undefined : { x: ["3%", "-3%", "3%"] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      {/* blue blob — parallax + ambient float */}
      <motion.div
        style={{ y: shouldReduceMotion ? 0 : parallaxBlue }}
        className="absolute -left-24 top-16 h-[26rem] w-[26rem]"
      >
        <motion.div
          className="h-full w-full rounded-full bg-[#2563EB]/25 blur-[120px]"
          animate={
            shouldReduceMotion ? undefined : { x: [0, 25, 0], y: [0, 15, 0] }
          }
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* purple blob — parallax + ambient float */}
      <motion.div
        style={{ y: shouldReduceMotion ? 0 : parallaxPurple }}
        className="absolute -right-20 bottom-0 h-[28rem] w-[28rem]"
      >
        <motion.div
          className="h-full w-full rounded-full bg-[#7C3AED]/25 blur-[130px]"
          animate={
            shouldReduceMotion ? undefined : { x: [0, -20, 0], y: [0, -20, 0] }
          }
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </motion.div>

      {/* cyan blob — parallax + ambient pulse */}
      <motion.div
        style={{ y: shouldReduceMotion ? 0 : parallaxCyan }}
        className="absolute left-1/2 top-1/3 h-[20rem] w-[20rem] -translate-x-1/2"
      >
        <motion.div
          className="h-full w-full rounded-full bg-[#00D4FF]/20 blur-[110px]"
          animate={
            shouldReduceMotion
              ? undefined
              : { scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }
          }
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </motion.div>

      {/* floating particles */}
      {!shouldReduceMotion &&
        PARTICLES.map((p, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full bg-white/40"
            style={{ top: p.top, left: p.left, width: p.size, height: p.size }}
            animate={{ opacity: [0, 1, 0], y: [0, -24, 0] }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

      {/* subtle noise texture for a cinematic atmosphere */}
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
        style={{ backgroundImage: `url("${NOISE_TEXTURE}")` }}
      />

      {/* fade into surrounding sections */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#050816] to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#050816] to-transparent" />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Icon badge — pulse ring + magnetic pull toward cursor                     */
/* -------------------------------------------------------------------------- */

function CardIcon({
  Icon,
  from,
  to,
  magneticX,
  magneticY,
  sizeClass,
  iconClass,
}: {
  Icon: LucideIcon;
  from: string;
  to: string;
  magneticX: MotionValue<number>;
  magneticY: MotionValue<number>;
  sizeClass: string;
  iconClass: string;
}) {
  const shouldReduceMotion = useReducedMotion();
  const gradient = `linear-gradient(135deg, ${from}, ${to})`;

  return (
    <motion.div
      style={{ x: shouldReduceMotion ? 0 : magneticX, y: shouldReduceMotion ? 0 : magneticY }}
      className={`relative ${sizeClass}`}
    >
      {!shouldReduceMotion && (
        <motion.span
          className="absolute inset-0 rounded-2xl"
          style={{ background: gradient }}
          animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      <motion.div
        whileHover={{ scale: 1.1, rotate: -6 }}
        transition={{ type: "spring", stiffness: 300, damping: 18 }}
        className="relative flex h-full w-full items-center justify-center rounded-2xl shadow-lg shadow-black/30"
        style={{ background: gradient }}
      >
        <Icon className={`${iconClass} text-white`} aria-hidden="true" />
      </motion.div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Bento card — 3D tilt, mouse spotlight, animated border beam, magnetism    */
/* -------------------------------------------------------------------------- */

function BentoCard({ card }: { card: BentoCardData }) {
  const Icon = card.icon;
  const shouldReduceMotion = useReducedMotion();
  const sizeStyles = SIZE_STYLES[card.size];

  // Normalized 0–1 pointer position within the card, centered by default.
  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);

  const tiltSpring = { stiffness: 200, damping: 22, mass: 0.4 };
  const rotateX = useSpring(useTransform(pointerY, [0, 1], [8, -8]), tiltSpring);
  const rotateY = useSpring(useTransform(pointerX, [0, 1], [-8, 8]), tiltSpring);

  const magnetSpring = { stiffness: 200, damping: 15 };
  const magneticX = useSpring(useTransform(pointerX, [0, 1], [-8, 8]), magnetSpring);
  const magneticY = useSpring(useTransform(pointerY, [0, 1], [-8, 8]), magnetSpring);

  const spotlightX = useTransform(pointerX, (v) => `${v * 100}%`);
  const spotlightY = useTransform(pointerY, (v) => `${v * 100}%`);
  const spotlightColor = hexToRgbChannels(card.via);
  const spotlightBackground = useMotionTemplate`radial-gradient(240px circle at ${spotlightX} ${spotlightY}, rgba(${spotlightColor}, 0.28), transparent 70%)`;

  const glowGradient = `linear-gradient(135deg, ${card.from}, ${card.via}, ${card.to})`;
  const beamGradient = `conic-gradient(from 0deg, transparent 0%, ${card.via} 8%, transparent 20%, transparent 80%, ${card.to} 92%, transparent 100%)`;

  function handlePointerMove(event: React.MouseEvent<HTMLDivElement>) {
    if (shouldReduceMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - rect.left) / rect.width);
    pointerY.set((event.clientY - rect.top) / rect.height);
  }

  function handlePointerLeave() {
    pointerX.set(0.5);
    pointerY.set(0.5);
  }

  return (
    <motion.li
      variants={cardVariants}
      className={`group relative h-full list-none ${card.gridClassName}`}
    >
      {/* ambient glow, intensifies on hover */}
      <div
        className="absolute -inset-4 rounded-[2rem] opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-50"
        style={{ background: glowGradient }}
        aria-hidden="true"
      />

      <div
        onMouseMove={handlePointerMove}
        onMouseLeave={handlePointerLeave}
        style={{ perspective: 1000 }}
        className="relative h-full"
      >
        <motion.div
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          whileHover={shouldReduceMotion ? undefined : { y: -10, scale: 1.015 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="relative h-full rounded-3xl p-px shadow-2xl shadow-black/40"
        >
          {/* animated border beam */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl">
            <motion.div
              className="absolute -inset-[60%]"
              style={{ background: beamGradient }}
              animate={shouldReduceMotion ? undefined : { rotate: 360 }}
              transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
              aria-hidden="true"
            />
          </div>

          {/* glass surface */}
          <div
            className={`relative z-10 flex h-full flex-col overflow-hidden rounded-[1.45rem] bg-[#0a0f23]/90 backdrop-blur-2xl ${sizeStyles.padding}`}
          >
            {/* top edge highlight */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

            {/* mouse-follow spotlight */}
            <motion.div
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{ background: spotlightBackground }}
            />

            <div className="relative flex h-full flex-col">
              <CardIcon
                Icon={Icon}
                from={card.from}
                to={card.to}
                magneticX={magneticX}
                magneticY={magneticY}
                sizeClass={sizeStyles.iconWrap}
                iconClass={sizeStyles.iconSize}
              />

              <h3 className={`mt-6 font-bold text-white ${sizeStyles.title}`}>
                {card.title}
              </h3>
              <p className={`mt-3 leading-relaxed text-white/65 ${sizeStyles.desc}`}>
                {card.description}
              </p>

              {card.techStack && (
                <div className="relative mt-6 flex flex-wrap gap-2">
                  {card.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/70"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.li>
  );
}

/* -------------------------------------------------------------------------- */
/*  Stat item — count-up on scroll into view                                  */
/* -------------------------------------------------------------------------- */

function StatItem({ stat }: { stat: StatData }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const shouldReduceMotion = useReducedMotion();

  const animatedValue = useCountUp(
    stat.target ?? 0,
    Boolean(stat.countUp && isInView && !shouldReduceMotion)
  );

  const numericDisplay = shouldReduceMotion
    ? isInView
      ? stat.target ?? 0
      : 0
    : animatedValue;

  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      className={`relative overflow-hidden ${GLASS} px-6 py-8 text-center`}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      <p className="bg-gradient-to-r from-[#2563EB] via-[#7C3AED] to-[#00D4FF] bg-clip-text text-4xl font-bold text-transparent sm:text-5xl">
        {stat.countUp ? `${numericDisplay}${stat.suffix ?? ""}` : stat.display}
      </p>
      <p className="mt-2 text-sm font-medium text-white/60 sm:text-base">
        {stat.label}
      </p>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main export                                                               */
/* -------------------------------------------------------------------------- */

export default function WhyChooseAxivon() {
  return (
    <section
      id="why-choose-axivon"
      aria-labelledby="why-choose-heading"
      className="relative isolate overflow-hidden bg-[#050816] px-6 py-24 sm:px-8 md:py-32 lg:px-12"
    >
      <AuroraBackground />

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* intro */}
        <motion.div
          variants={containerStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.div
            variants={fadeUp}
            className={`inline-flex items-center gap-2 ${GLASS} px-4 py-1.5`}
          >
            <BadgeCheck className="h-3.5 w-3.5 text-[#00D4FF]" aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
              Why Choose Axivon
            </span>
          </motion.div>

          <motion.h2
            id="why-choose-heading"
            variants={fadeUp}
            className="mt-6 text-4xl font-bold leading-[1.15] tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            <span className="block">
              Why Businesses <GradientText>Trust</GradientText>
            </span>
            <span className="block">
              <GradientText>Axivon Technologies</GradientText>
            </span>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/65 sm:text-lg"
          >
            We combine innovation, engineering excellence, and strategic
            thinking to deliver digital solutions that help businesses scale
            faster.
          </motion.p>
        </motion.div>

        {/* bento grid */}
        <motion.ul
          variants={cardGridStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          aria-label="Reasons businesses choose Axivon Technologies"
          className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4 lg:gap-6"
        >
          {CARDS.map((card) => (
            <BentoCard key={card.id} card={card} />
          ))}
        </motion.ul>

        {/* stats */}
        <motion.div
          variants={containerStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-16 grid grid-cols-2 gap-4 sm:gap-6 lg:mt-20 lg:grid-cols-4"
        >
          {STATS.map((stat) => (
            <StatItem key={stat.id} stat={stat} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}