"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Compass, Rocket, Globe, type LucideIcon } from "lucide-react";
const EASE_MISSION = [0.22, 1, 0.36, 1] as const;

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface MissionVisionCardData {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  from: string;
  via: string;
  to: string;
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

const CARDS: MissionVisionCardData[] = [
  {
    id: "mission",
    icon: Rocket,
    title: "Our Mission",
    description:
      "To empower businesses with innovative, scalable, and future-ready technology solutions that drive growth, efficiency, and long-term success.",
    from: "#2563EB",
    via: "#7C3AED",
    to: "#00D4FF",
  },
  {
    id: "vision",
    icon: Globe,
    title: "Our Vision",
    description:
      "To become a globally trusted technology partner delivering cutting-edge digital experiences, intelligent solutions, and transformative innovations.",
    from: "#7C3AED",
    via: "#00D4FF",
    to: "#2563EB",
  },
];

const PARTICLES: Particle[] = [
  { top: "14%", left: "12%", size: 3, duration: 7.5, delay: 0 },
  { top: "24%", left: "78%", size: 2, duration: 9, delay: 1 },
  { top: "44%", left: "22%", size: 2.5, duration: 8.2, delay: 0.5 },
  { top: "58%", left: "86%", size: 3, duration: 10.5, delay: 1.8 },
  { top: "70%", left: "34%", size: 2, duration: 7, delay: 2.2 },
  { top: "82%", left: "64%", size: 2.5, duration: 9.5, delay: 0.8 },
  { top: "10%", left: "50%", size: 2, duration: 6.5, delay: 1.4 },
  { top: "92%", left: "16%", size: 3, duration: 8.8, delay: 0.2 },
];

const GLASS =
  "rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl";

/* -------------------------------------------------------------------------- */
/*  Animation variants                                                        */
/* -------------------------------------------------------------------------- */

const containerStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE_MISSION },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: EASE_MISSION },
  },
};

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
/*  Background: grid, aurora streaks, orbs, particles                         */
/* -------------------------------------------------------------------------- */

function AuroraBackground() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-[#050816]" />

      {/* animated grid pattern */}
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

      {/* aurora streaks */}
      <motion.div
        className="absolute left-1/2 top-[-10%] h-[34rem] w-[150%] -translate-x-1/2 rotate-[-6deg] opacity-25 mix-blend-screen blur-[110px]"
        style={{
          background:
            "linear-gradient(90deg, transparent, #2563EB, #7C3AED, #00D4FF, transparent)",
        }}
        animate={shouldReduceMotion ? undefined : { x: ["-4%", "4%", "-4%"] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-1/2 top-[8%] h-[24rem] w-[140%] -translate-x-1/2 rotate-[5deg] opacity-15 mix-blend-screen blur-[100px]"
        style={{
          background:
            "linear-gradient(90deg, transparent, #00D4FF, #2563EB, transparent)",
        }}
        animate={shouldReduceMotion ? undefined : { x: ["3%", "-3%", "3%"] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      {/* floating gradient orbs */}
      <motion.div
        className="absolute -left-24 top-10 h-[24rem] w-[24rem] rounded-full bg-[#2563EB]/25 blur-[120px]"
        animate={shouldReduceMotion ? undefined : { x: [0, 25, 0], y: [0, 15, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-20 bottom-0 h-[26rem] w-[26rem] rounded-full bg-[#7C3AED]/25 blur-[130px]"
        animate={shouldReduceMotion ? undefined : { x: [0, -20, 0], y: [0, -20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

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

      {/* fade into surrounding sections */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#050816] to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#050816] to-transparent" />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Icon badge with pulse ring                                                */
/* -------------------------------------------------------------------------- */

function CardIcon({
  Icon,
  from,
  to,
}: {
  Icon: LucideIcon;
  from: string;
  to: string;
}) {
  const shouldReduceMotion = useReducedMotion();
  const gradient = `linear-gradient(135deg, ${from}, ${to})`;

  return (
    <div className="relative flex h-14 w-14 items-center justify-center">
      {!shouldReduceMotion && (
        <motion.span
          className="absolute inset-0 rounded-2xl"
          style={{ background: gradient }}
          animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      <motion.div
        whileHover={{ scale: 1.08, rotate: -4 }}
        transition={{ type: "spring", stiffness: 300, damping: 18 }}
        className="relative flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg shadow-black/30"
        style={{ background: gradient }}
      >
        <Icon className="h-6 w-6 text-white" aria-hidden="true" />
      </motion.div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Mission / Vision card                                                     */
/* -------------------------------------------------------------------------- */

function MissionVisionCard({ card }: { card: MissionVisionCardData }) {
  const Icon = card.icon;
  const shouldReduceMotion = useReducedMotion();
  const conicGradient = `conic-gradient(from 0deg, ${card.from}, ${card.via}, ${card.to}, ${card.from})`;
  const glowGradient = `linear-gradient(135deg, ${card.from}, ${card.via}, ${card.to})`;

  return (
    <motion.div variants={cardVariants} className="group relative h-full">
      {/* ambient glow, intensifies on hover */}
      <div
        className="absolute -inset-4 rounded-[2rem] opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-50"
        style={{ background: glowGradient }}
        aria-hidden="true"
      />

      <motion.div
        whileHover={shouldReduceMotion ? undefined : { y: -8 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className="relative h-full rounded-3xl p-px shadow-2xl shadow-black/40"
      >
        {/* animated glowing border */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl">
          <motion.div
            className="absolute -inset-[60%]"
            style={{ background: conicGradient }}
            animate={shouldReduceMotion ? undefined : { rotate: 360 }}
            transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
            aria-hidden="true"
          />
        </div>

        {/* glass surface */}
        <div className="relative z-10 flex h-full flex-col overflow-hidden rounded-[1.45rem] bg-[#0a0f23]/90 p-8 backdrop-blur-2xl sm:p-10">
          {/* subtle moving inner glow */}
          <motion.div
            className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-20 blur-3xl"
            style={{ background: card.via }}
            animate={
              shouldReduceMotion ? undefined : { x: [0, 14, 0], y: [0, 10, 0] }
            }
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="relative">
            <CardIcon Icon={Icon} from={card.from} to={card.to} />

            <h3 className="mt-6 text-2xl font-bold text-white sm:text-3xl">
              {card.title}
            </h3>
            <p className="mt-4 text-base leading-relaxed text-white/65 sm:text-lg">
              {card.description}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main export                                                               */
/* -------------------------------------------------------------------------- */

export default function MissionVision() {
  return (
    <section
      id="mission-vision"
      aria-labelledby="mission-vision-heading"
      className="relative isolate overflow-hidden bg-[#050816] px-6 py-24 sm:px-8 md:py-32 lg:px-12"
    >
      <AuroraBackground />

      <div className="relative z-10 mx-auto max-w-6xl">
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
            <Compass className="h-3.5 w-3.5 text-[#00D4FF]" aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
              Our Purpose
            </span>
          </motion.div>

          <motion.h2
            id="mission-vision-heading"
            variants={fadeUp}
            className="mt-6 text-4xl font-bold leading-[1.15] tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            <span className="block">
              Driven By <GradientText>Mission.</GradientText>
            </span>
            <span className="block">
              Focused On <GradientText>Vision.</GradientText>
            </span>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/65 sm:text-lg"
          >
            At Axivon Technologies, our mission and vision guide every
            solution we create. We help businesses embrace innovation,
            technology, and digital transformation.
          </motion.p>
        </motion.div>

        {/* cards */}
        <motion.div
          variants={containerStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-10"
        >
          {CARDS.map((card) => (
            <MissionVisionCard key={card.id} card={card} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}