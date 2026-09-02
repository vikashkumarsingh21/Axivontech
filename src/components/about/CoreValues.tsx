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
import { Badge } from "@/components/ui";

const EASE_VALUES = [0.22, 1, 0.36, 1] as const;

interface ValueCardData {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  from: string;
  via: string;
  to: string;
}

const VALUES: ValueCardData[] = [
  {
    id: "innovation",
    icon: Sparkles,
    title: "Innovation",
    description:
      "We constantly explore new technologies and creative solutions to help businesses stay ahead in a rapidly changing digital world.",
    from: "#c47a3a",
    via: "#e8a064",
    to: "#f0b07a",
  },
  {
    id: "transparency",
    icon: Eye,
    title: "Transparency",
    description:
      "Open communication, honesty, and trust are at the core of every client relationship we build.",
    from: "#f0b07a",
    via: "#e8a064",
    to: "#c47a3a",
  },
  {
    id: "quality",
    icon: Award,
    title: "Quality",
    description:
      "We focus on delivering reliable, scalable, and high-performance solutions that exceed expectations.",
    from: "#c47a3a",
    via: "#e8a064",
    to: "#f0b07a",
  },
  {
    id: "customer-success",
    icon: HeartHandshake,
    title: "Customer Success",
    description:
      "Your success is our success. We are committed to helping our clients achieve measurable growth and long-term value.",
    from: "#f0b07a",
    via: "#e8a064",
    to: "#c47a3a",
  },
];

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

function hexToRgbChannels(hex: string): string {
  const sanitized = hex.replace("#", "");
  const value = parseInt(sanitized, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `${r}, ${g}, ${b}`;
}

function AuroraBackground() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden={true}
    >
      <div className="absolute inset-0 bg-[#0f0f0f]" />

      {/* animated grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.025]"
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

      {/* aurora streaks using warm ambers */}
      <motion.div
        className="absolute left-1/2 top-[-12%] h-[36rem] w-[150%] -translate-x-1/2 rotate-[-6deg] opacity-[0.12] mix-blend-screen blur-[110px]"
        style={{
          background:
            "linear-gradient(90deg, transparent, #c47a3a, #e8a064, #f0b07a, transparent)",
        }}
        animate={shouldReduceMotion ? undefined : { x: ["-4%", "4%", "-4%"] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* floating gradient orbs */}
      <motion.div
        className="absolute -left-24 top-16 h-[24rem] w-[24rem] rounded-full bg-[#e8a064]/5 blur-[120px]"
        animate={shouldReduceMotion ? undefined : { x: [0, 25, 0], y: [0, 15, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-20 bottom-0 h-[26rem] w-[26rem] rounded-full bg-[#c47a3a]/4 blur-[130px]"
        animate={shouldReduceMotion ? undefined : { x: [0, -20, 0], y: [0, -20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      {/* fade into surrounding sections */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#0f0f0f] to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0f0f0f] to-transparent" />
    </div>
  );
}

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
        <Icon className="h-6 w-6 text-[#0f0f0f]" aria-hidden={true} />
      </motion.div>
    </div>
  );
}

function ValueCard({ value }: { value: ValueCardData }) {
  const Icon = value.icon;
  const shouldReduceMotion = useReducedMotion();

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
        className="absolute -inset-4 rounded-[2rem] opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-40"
        style={{ background: glowGradient }}
        aria-hidden={true}
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
              aria-hidden={true}
            />
          </div>

          {/* glass surface */}
          <div className="relative z-10 flex h-full flex-col overflow-hidden rounded-[1.45rem] bg-[#141414]/95 p-7 backdrop-blur-2xl sm:p-8 border border-[#262626]">
            {/* spotlight */}
            <motion.div
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{ background: spotlightBackground }}
            />

            <div className="relative">
              <CardIcon Icon={Icon} from={value.from} to={value.to} />

              <h3 className="mt-6 text-xl font-bold text-[#f4f4f5] sm:text-2xl">
                {value.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[#a1a1aa] sm:text-base">
                {value.description}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.li>
  );
}

export default function CoreValues() {
  return (
    <section
      id="core-values"
      aria-labelledby="core-values-heading"
      className="relative isolate overflow-hidden bg-[#0f0f0f] px-6 py-24 sm:px-8 md:py-32 lg:px-12"
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
          <motion.div variants={fadeUp} className="mb-6 flex justify-center">
            <Badge>
              <Gem className="h-3.5 w-3.5 text-[#e8a064]" aria-hidden={true} />
              <span className="ml-1.5">Our Values</span>
            </Badge>
          </motion.div>

          <motion.h2
            id="core-values-heading"
            variants={fadeUp}
            className="mt-6 text-4xl font-bold leading-[1.15] tracking-tight text-[#f4f4f5] sm:text-5xl lg:text-6xl"
          >
            <span className="block">
              The <span className="text-gradient-amber">Principles</span>
            </span>
            <span className="block">
              Behind <span className="text-gradient-amber">Everything We Build</span>
            </span>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[#a1a1aa] sm:text-lg"
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