"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  Gem,
  Sparkles,
  Eye,
  Award,
  HeartHandshake,
  type LucideIcon,
} from "lucide-react";
const EASE_VALUES = [0.22, 1, 0.36, 1] as const;
/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface ValueCardData {
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

const VALUES: ValueCardData[] = [
  {
    id: "innovation",
    icon: Sparkles,
    title: "Innovation",
    description:
      "We constantly explore new technologies and creative solutions to help businesses stay ahead in a rapidly changing digital world.",
    from: "#2563EB",
    via: "#7C3AED",
    to: "#00D4FF",
  },
  {
    id: "transparency",
    icon: Eye,
    title: "Transparency",
    description:
      "Open communication, honesty, and trust are at the core of every client relationship we build.",
    from: "#00D4FF",
    via: "#2563EB",
    to: "#7C3AED",
  },
  {
    id: "quality",
    icon: Award,
    title: "Quality",
    description:
      "We focus on delivering reliable, scalable, and high-performance solutions that exceed expectations.",
    from: "#7C3AED",
    via: "#00D4FF",
    to: "#2563EB",
  },
  {
    id: "customer-success",
    icon: HeartHandshake,
    title: "Customer Success",
    description:
      "Your success is our success. We are committed to helping our clients achieve measurable growth and long-term value.",
    from: "#2563EB",
    via: "#00D4FF",
    to: "#7C3AED",
  },
];

const PARTICLES: Particle[] = [
  { top: "12%", left: "10%", size: 3, duration: 7.5, delay: 0 },
  { top: "20%", left: "82%", size: 2, duration: 9, delay: 1 },
  { top: "38%", left: "30%", size: 2.5, duration: 8.2, delay: 0.5 },
  { top: "48%", left: "92%", size: 2, duration: 10.5, delay: 1.8 },
  { top: "62%", left: "18%", size: 3, duration: 7, delay: 2.2 },
  { top: "74%", left: "70%", size: 2.5, duration: 9.5, delay: 0.8 },
  { top: "8%", left: "55%", size: 2, duration: 6.5, delay: 1.4 },
  { top: "88%", left: "42%", size: 3, duration: 8.8, delay: 0.2 },
  { top: "30%", left: "6%", size: 2, duration: 7.8, delay: 1.1 },
  { top: "94%", left: "78%", size: 2.5, duration: 9.2, delay: 0.6 },
];

const GLASS =
  "rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl";

const NOISE_TEXTURE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

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
    transition: { duration: 0.7, ease: EASE_VALUES },
  },
};

const cardGridStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: EASE_VALUES },
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
/*  Background: grid, aurora, orbs, particles, noise                          */
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

      {/* floating gradient orbs */}
      <motion.div
        className="absolute -left-24 top-16 h-[24rem] w-[24rem] rounded-full bg-[#2563EB]/25 blur-[120px]"
        animate={shouldReduceMotion ? undefined : { x: [0, 25, 0], y: [0, 15, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-20 bottom-0 h-[26rem] w-[26rem] rounded-full bg-[#7C3AED]/25 blur-[130px]"
        animate={shouldReduceMotion ? undefined : { x: [0, -20, 0], y: [0, -20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div
        className="absolute left-1/2 top-1/2 h-[18rem] w-[18rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00D4FF]/15 blur-[110px]"
        animate={
          shouldReduceMotion
            ? undefined
            : { scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }
        }
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
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

      {/* subtle noise texture for a cinematic, filmic atmosphere */}
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
        whileHover={{ scale: 1.1, rotate: -6 }}
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
/*  Value card — 3D tilt, mouse spotlight, animated border beam               */
/* -------------------------------------------------------------------------- */

function ValueCard({ value }: { value: ValueCardData }) {
  const Icon = value.icon;
  const shouldReduceMotion = useReducedMotion();

  // Normalized 0–1 pointer position within the card, centered by default.
  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);

  const springConfig = { stiffness: 200, damping: 22, mass: 0.4 };
  const rotateX = useSpring(
    useTransform(pointerY, [0, 1], [9, -9]),
    springConfig
  );
  const rotateY = useSpring(
    useTransform(pointerX, [0, 1], [-9, 9]),
    springConfig
  );

  const spotlightX = useTransform(pointerX, (v) => `${v * 100}%`);
  const spotlightY = useTransform(pointerY, (v) => `${v * 100}%`);
  const spotlightColor = hexToRgbChannels(value.via);
  const spotlightBackground = useMotionTemplate`radial-gradient(220px circle at ${spotlightX} ${spotlightY}, rgba(${spotlightColor}, 0.28), transparent 70%)`;

  const glowGradient = `linear-gradient(135deg, ${value.from}, ${value.via}, ${value.to})`;
  const beamGradient = `conic-gradient(from 0deg, transparent 0%, ${value.via} 8%, transparent 20%, transparent 80%, ${value.to} 92%, transparent 100%)`;

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
    <motion.li variants={cardVariants} className="group relative h-full list-none">
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
          whileHover={shouldReduceMotion ? undefined : { y: -8, scale: 1.02 }}
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
          <div className="relative z-10 flex h-full flex-col overflow-hidden rounded-[1.45rem] bg-[#0a0f23]/90 p-7 backdrop-blur-2xl sm:p-8">
            {/* top edge highlight */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

            {/* mouse-follow spotlight */}
            <motion.div
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{ background: spotlightBackground }}
            />

            <div className="relative">
              <CardIcon Icon={Icon} from={value.from} to={value.to} />

              <h3 className="mt-6 text-xl font-bold text-white sm:text-2xl">
                {value.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-white/65 sm:text-base">
                {value.description}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.li>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main export                                                               */
/* -------------------------------------------------------------------------- */

export default function CoreValues() {
  return (
    <section
      id="core-values"
      aria-labelledby="core-values-heading"
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
            <Gem className="h-3.5 w-3.5 text-[#00D4FF]" aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
              Our Values
            </span>
          </motion.div>

          <motion.h2
            id="core-values-heading"
            variants={fadeUp}
            className="mt-6 text-4xl font-bold leading-[1.15] tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            <span className="block">
              The <GradientText>Principles</GradientText>
            </span>
            <span className="block">
              Behind <GradientText>Everything We Build</GradientText>
            </span>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/65 sm:text-lg"
          >
            At Axivon Technologies, our values guide every decision, project,
            and relationship we build. They define how we work, collaborate,
            innovate, and deliver meaningful results for our clients.
          </motion.p>
        </motion.div>

        {/* values grid */}
        <motion.ul
          variants={cardGridStagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          aria-label="Axivon Technologies core values"
          className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8 xl:grid-cols-4"
        >
          {VALUES.map((value) => (
            <ValueCard key={value.id} value={value} />
          ))}
        </motion.ul>
      </div>
    </section>
  );
}