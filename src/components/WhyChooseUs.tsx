"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView, useReducedMotion, type Variants } from "framer-motion";
import {
  Users,
  Layers,
  Rocket,
  TrendingUp,
  ShieldCheck,
  Headset,
  type LucideIcon,
} from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface Stat {
  end: number;
  suffix: string;
  label: string;
}

const FEATURES: Feature[] = [
  {
    icon: Users,
    title: "Expert Development Team",
    description:
      "Senior engineers and designers who've shipped products for startups and enterprises alike, not junior hires learning on your budget.",
  },
  {
    icon: Layers,
    title: "Modern Technology Stack",
    description:
      "Built on Next.js, TypeScript, and cloud-native tooling — architecture that stays fast and maintainable as you scale.",
  },
  {
    icon: Rocket,
    title: "Fast Project Delivery",
    description:
      "Clear milestones and parallel workstreams get your product live in weeks, not quarters, without cutting corners.",
  },
  {
    icon: TrendingUp,
    title: "SEO & Growth Focused",
    description:
      "Every build is structured for search visibility from day one, so your site earns traffic instead of just looking good.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Scalable Solutions",
    description:
      "Infrastructure designed to handle growth and protect data, with security reviewed at every layer of the stack.",
  },
  {
    icon: Headset,
    title: "Dedicated Support",
    description:
      "A direct line to your team after launch — real responses, not ticket queues, whenever something needs attention.",
  },
];

const STATS: Stat[] = [
  { end: 10, suffix: "+", label: "Projects Delivered" },
  { end: 100, suffix: "%", label: "Client Satisfaction" },
  { end: 100, suffix: "%", label: "Client Focus" },
  { end: 24, suffix: "/7", label: "Support" },
];

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const gridVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const panelVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

function useCountUp(end: number, startWhen: boolean, duration = 1.6) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!startWhen) return;
    let startTime: number | null = null;
    let raf = 0;

    const step = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * end));
      if (progress < 1) {
        raf = requestAnimationFrame(step);
      } else {
        setValue(end);
      }
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [startWhen, end, duration]);

  return value;
}

function StatItem({ end, suffix, label, isInView }: Stat & { isInView: boolean }) {
  const count = useCountUp(end, isInView);

  return (
    <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
      <span className="bg-gradient-to-r from-[#2563EB] via-[#7C3AED] to-[#00D4FF] bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
        {count}
        {suffix}
      </span>
      <span className="mt-2 text-sm font-medium text-slate-400">{label}</span>
    </div>
  );
}

export default function WhyChooseUs() {
  const shouldReduceMotion = useReducedMotion();
  const statsRef = useRef<HTMLDivElement>(null);
  const isStatsInView = useInView(statsRef, { once: true, amount: 0.4 });

  return (
    <section className="relative overflow-hidden bg-[#050816] py-24 sm:py-32">
      {/* Floating gradient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          aria-hidden
          className="absolute -right-32 top-0 h-[26rem] w-[26rem] rounded-full bg-[#7C3AED]/20 blur-[120px]"
          animate={shouldReduceMotion ? undefined : { x: [0, -30, 0], y: [0, 30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="absolute -left-24 bottom-0 h-[24rem] w-[24rem] rounded-full bg-[#2563EB]/20 blur-[120px]"
          animate={shouldReduceMotion ? undefined : { x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        {/* Section header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={headerVariants}
          className="mx-auto mb-16 max-w-2xl text-center sm:mb-20"
        >
          <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-[0.25em] text-[#00D4FF]">
            Why Axivon
          </span>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Why Choose{" "}
            <span className="bg-gradient-to-r from-[#2563EB] via-[#7C3AED] to-[#00D4FF] bg-clip-text text-transparent">
              Axivon Technologies
            </span>
          </h2>
          <p className="mt-5 text-balance text-base leading-relaxed text-slate-400 sm:text-lg">
            We combine innovation, design, technology, and business strategy to
            help organizations grow faster.
          </p>
        </motion.div>

        {/* Feature cards */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={gridVariants}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8"
        >
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={cardVariants}
                whileHover={shouldReduceMotion ? undefined : { y: -6, scale: 1.015 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="group relative h-full"
              >
                {/* Glow / gradient border layer */}
                <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-[#2563EB] via-[#7C3AED] to-[#00D4FF] opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-70" />

                {/* Card body */}
                <div className="relative flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl transition-colors duration-500 group-hover:border-transparent">
                  <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#2563EB]/20 via-[#7C3AED]/20 to-[#00D4FF]/20 ring-1 ring-white/10 transition-transform duration-500 group-hover:scale-110">
                    <Icon className="h-7 w-7 text-[#00D4FF]" strokeWidth={1.75} />
                  </div>

                  <h3 className="mb-3 text-xl font-semibold text-white">
                    {feature.title}
                  </h3>

                  <p className="text-sm leading-relaxed text-slate-400">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Statistics panel */}
        <motion.div
          ref={statsRef}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={panelVariants}
          className="relative mt-16 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl sm:mt-20"
        >
          <div className="grid grid-cols-2 divide-y divide-white/10 sm:grid-cols-4 sm:divide-y-0 sm:divide-x">
            {STATS.map((stat) => (
              <StatItem key={stat.label} {...stat} isInView={isStatsInView} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}