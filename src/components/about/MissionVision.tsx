"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Compass, Rocket, Globe, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui";

const EASE_MISSION = [0.22, 1, 0.36, 1] as const;

interface MissionVisionCardData {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  from: string;
  via: string;
  to: string;
}

const CARDS: MissionVisionCardData[] = [
  {
    id: "mission",
    icon: Rocket,
    title: "Our Mission",
    description:
      "To empower businesses with innovative, scalable, and future-ready technology solutions that drive growth, efficiency, and long-term success.",
    from: "#c47a3a",
    via: "#e8a064",
    to: "#f0b07a",
  },
  {
    id: "vision",
    icon: Globe,
    title: "Our Vision",
    description:
      "To become a globally trusted technology partner delivering cutting-edge digital experiences, intelligent solutions, and transformative innovations.",
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

      {/* aurora streaks using warm amber colors */}
      <motion.div
        className="absolute left-1/2 top-[-10%] h-[34rem] w-[150%] -translate-x-1/2 rotate-[-6deg] opacity-[0.12] mix-blend-screen blur-[110px]"
        style={{
          background:
            "linear-gradient(90deg, transparent, #c47a3a, #e8a064, #f0b07a, transparent)",
        }}
        animate={shouldReduceMotion ? undefined : { x: ["-4%", "4%", "-4%"] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* floating gradient orbs */}
      <motion.div
        className="absolute -left-24 top-10 h-[24rem] w-[24rem] rounded-full bg-[#e8a064]/5 blur-[120px]"
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
        whileHover={{ scale: 1.08, rotate: -4 }}
        transition={{ type: "spring", stiffness: 300, damping: 18 }}
        className="relative flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg shadow-black/30"
        style={{ background: gradient }}
      >
        <Icon className="h-6 w-6 text-[#0f0f0f]" aria-hidden={true} />
      </motion.div>
    </div>
  );
}

function MissionVisionCard({ card }: { card: MissionVisionCardData }) {
  const Icon = card.icon;
  const shouldReduceMotion = useReducedMotion();
  const conicGradient = `conic-gradient(from 0deg, ${card.from}, ${card.via}, ${card.to}, ${card.from})`;
  const glowGradient = `linear-gradient(135deg, ${card.from}, ${card.via}, ${card.to})`;

  return (
    <motion.div variants={cardVariants} className="group relative h-full">
      {/* ambient glow, intensifies on hover */}
      <div
        className="absolute -inset-4 rounded-[2rem] opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-40"
        style={{ background: glowGradient }}
        aria-hidden={true}
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
            aria-hidden={true}
          />
        </div>

        {/* glass surface */}
        <div className="relative z-10 flex h-full flex-col overflow-hidden rounded-[1.45rem] bg-[#141414]/95 p-8 backdrop-blur-2xl sm:p-10 border border-[#262626]">
          {/* subtle moving inner glow */}
          <motion.div
            className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-10 blur-3xl"
            style={{ background: card.via }}
            animate={
              shouldReduceMotion ? undefined : { x: [0, 14, 0], y: [0, 10, 0] }
            }
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="relative">
            <CardIcon Icon={Icon} from={card.from} to={card.to} />

            <h3 className="mt-6 text-2xl font-bold text-[#f4f4f5] sm:text-3xl">
              {card.title}
            </h3>
            <p className="mt-4 text-base leading-relaxed text-[#a1a1aa] sm:text-lg">
              {card.description}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function MissionVision() {
  return (
    <section
      id="mission-vision"
      aria-labelledby="mission-vision-heading"
      className="relative isolate overflow-hidden bg-[#0f0f0f] px-6 py-24 sm:px-8 md:py-32 lg:px-12"
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
          <motion.div variants={fadeUp} className="mb-6 flex justify-center">
            <Badge>
              <Compass className="h-3.5 w-3.5 text-[#e8a064]" aria-hidden={true} />
              <span className="ml-1.5">Our Purpose</span>
            </Badge>
          </motion.div>

          <motion.h2
            id="mission-vision-heading"
            variants={fadeUp}
            className="mt-6 text-4xl font-bold leading-[1.15] tracking-tight text-[#f4f4f5] sm:text-5xl lg:text-6xl"
          >
            <span className="block">
              Driven By <span className="text-gradient-amber">Mission.</span>
            </span>
            <span className="block">
              Focused On <span className="text-gradient-amber">Vision.</span>
            </span>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[#a1a1aa] sm:text-lg"
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