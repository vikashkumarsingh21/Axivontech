"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
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
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui";

const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const;

interface BentoCardData {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  from: string;
  via: string;
  to: string;
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

const CARDS: BentoCardData[] = [
  {
    id: "fast-delivery",
    icon: Rocket,
    title: "Fast Delivery",
    description:
      "Launch projects faster with streamlined development processes.",
    from: "#c47a3a",
    via: "#e8a064",
    to: "#f0b07a",
    gridClassName: "sm:col-span-2 lg:col-span-2",
    size: "lg",
  },
  {
    id: "ai-solutions",
    icon: BrainCircuit,
    title: "AI Powered Solutions",
    description:
      "Intelligent automation and AI integrations built for modern businesses.",
    from: "#e8a064",
    via: "#f0b07a",
    to: "#c47a3a",
    gridClassName: "sm:col-span-2 lg:col-span-2",
    size: "lg",
  },
  {
    id: "seo-growth",
    icon: TrendingUp,
    title: "SEO & Growth Focused",
    description: "Websites designed to rank higher and generate more leads.",
    from: "#f0b07a",
    via: "#c47a3a",
    to: "#e8a064",
    gridClassName: "sm:col-span-1 lg:col-span-1",
    size: "md",
  },
  {
    id: "dedicated-support",
    icon: Headphones,
    title: "Dedicated Support",
    description: "Continuous assistance and maintenance after deployment.",
    from: "#c47a3a",
    via: "#e8a064",
    to: "#f0b07a",
    gridClassName: "sm:col-span-1 lg:col-span-1",
    size: "md",
  },
  {
    id: "secure-scalable",
    icon: ShieldCheck,
    title: "Secure & Scalable",
    description: "Enterprise-grade security and future-proof architecture.",
    from: "#e8a064",
    via: "#f0b07a",
    to: "#c47a3a",
    gridClassName: "sm:col-span-2 lg:col-span-2",
    size: "lg",
  },
  {
    id: "tech-stack",
    icon: Layers3,
    title: "Modern Technology Stack",
    description:
      "Built with Next.js, React, TypeScript, Cloud and AI technologies.",
    from: "#c47a3a",
    via: "#e8a064",
    to: "#f0b07a",
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

const containerStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE_PREMIUM },
  },
};

const cardGridStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: EASE_PREMIUM },
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

function useCountUp(target: number, duration = 1.8, start: boolean, reduced: boolean) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!start) return;
    if (reduced) { setValue(target); return; }

    let startTime: number | null = null;
    let raf = 0;

    const step = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) {
        raf = requestAnimationFrame(step);
      } else {
        setValue(target);
      }
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [start, target, duration, reduced]);

  return value;
}

function StatItem({ stat, sectionInView, reduced }: { stat: StatData; sectionInView: boolean; reduced: boolean }) {
  const value = useCountUp(stat.target ?? 0, 1.8, sectionInView, reduced);

  return (
    <div className="flex flex-col gap-1 text-center sm:text-left">
      <span className="text-3xl font-extrabold text-[#f4f4f5] sm:text-4xl tabular-nums">
        {stat.countUp ? `${value}${stat.suffix ?? ""}` : stat.display}
      </span>
      <span className="text-xs text-[#71717a] font-medium uppercase tracking-[0.14em]">{stat.label}</span>
    </div>
  );
}

function BentoCard({ card }: { card: BentoCardData }) {
  const Icon = card.icon;
  const shouldReduceMotion = useReducedMotion();

  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);
  const springX = useSpring(pointerX, { stiffness: 150, damping: 20 });
  const springY = useSpring(pointerY, { stiffness: 150, damping: 20 });

  const spotlightX = useTransform(springX, (v) => `${v * 100}%`);
  const spotlightY = useTransform(springY, (v) => `${v * 100}%`);
  const spotlightColor = hexToRgbChannels(card.via);
  const spotlightBackground = useMotionTemplate`radial-gradient(320px circle at ${spotlightX} ${spotlightY}, rgba(${spotlightColor}, 0.2), transparent 70%)`;

  const glowGradient = `linear-gradient(135deg, ${card.from}, ${card.via}, ${card.to})`;
  const beamGradient = `conic-gradient(from 0deg, transparent 0%, ${card.via} 8%, transparent 20%, transparent 80%, ${card.to} 92%, transparent 100%)`;

  const styles = SIZE_STYLES[card.size];

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    if (shouldReduceMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - rect.left) / rect.width);
    pointerY.set((event.clientY - rect.top) / rect.height);
  }

  function handleMouseLeave() {
    pointerX.set(0.5);
    pointerY.set(0.5);
  }

  return (
    <motion.div
      variants={cardVariants}
      whileHover={shouldReduceMotion ? undefined : { y: -6, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[#262626] bg-[#141414] p-px ${card.gridClassName}`}
    >
      <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
        <motion.div
          className="absolute -inset-[60%]"
          style={{ background: beamGradient }}
          animate={shouldReduceMotion ? undefined : { rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          aria-hidden={true}
        />
      </div>

      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`relative z-10 flex h-full flex-col justify-between rounded-[23px] bg-[#141414]/95 backdrop-blur-xl border border-[#262626] ${styles.padding}`}
      >
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: spotlightBackground }}
        />

        <div className="relative">
          <div className={`mb-6 flex items-center justify-center rounded-2xl bg-[#2a1f14] text-[#e8a064] border border-[#e8a064]/20 ${styles.iconWrap}`}>
            <Icon className={styles.iconSize} />
          </div>

          <h3 className={`font-bold tracking-tight text-[#f4f4f5] ${styles.title}`}>
            {card.title}
          </h3>
          <p className={`mt-3 leading-relaxed text-[#a1a1aa] ${styles.desc}`}>
            {card.description}
          </p>
        </div>

        {card.techStack && (
          <div className="mt-6 flex flex-wrap gap-2">
            {card.techStack.map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-[#262626] bg-[#1c1c1e] px-3.5 py-1 text-xs font-medium text-[#d4d4d4]"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function WhyChooseAxivon() {
  const sectionRef = useRef<HTMLElement>(null);
  const isSectionInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const reduced = useReducedMotion() ?? false;

  return (
    <section
      ref={sectionRef}
      id="why-choose-axivon"
      aria-labelledby="why-choose-heading"
      className="relative isolate overflow-hidden bg-[#0f0f0f] py-24 sm:py-32"
    >
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-8">
          
          <motion.div
            variants={containerStagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="flex flex-col justify-between lg:col-span-4"
          >
            <div>
              <motion.div variants={fadeUp} className="mb-6 flex justify-start">
                <Badge>
                  <span aria-hidden={true} className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#e8a064]" />
                  <span className="ml-1.5">WHY CHOOSE US</span>
                </Badge>
              </motion.div>

              <motion.h2
                id="why-choose-heading"
                variants={fadeUp}
                className="mt-6 text-4xl font-bold tracking-tight text-[#f4f4f5] sm:text-5xl leading-[1.1]"
              >
                Why Choose
                <br />
                <span className="text-gradient-amber">Axivon</span>
              </motion.h2>

              <motion.p
                variants={fadeUp}
                className="mt-6 text-base leading-relaxed text-[#a1a1aa] sm:text-lg"
              >
                We are dedicated to delivering reliable, scalable, and secure technology solutions that move businesses forward.
              </motion.p>
            </div>

            <motion.div
              variants={fadeUp}
              className="mt-10 grid grid-cols-2 gap-6 border-t border-[#262626] pt-8"
            >
              {STATS.map((stat) => (
                <StatItem
                  key={stat.id}
                  stat={stat}
                  sectionInView={isSectionInView}
                  reduced={reduced}
                />
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            variants={cardGridStagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-8 lg:gap-6"
          >
            {CARDS.map((card) => (
              <BentoCard key={card.id} card={card} />
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  );
}