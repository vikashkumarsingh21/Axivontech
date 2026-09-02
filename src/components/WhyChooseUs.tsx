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
import { SectionHeader } from "@/components/ui";

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
    title: "Experienced Development Team",
    description:
      "Senior engineers and designers who've shipped products for startups and enterprises — not junior hires learning on your budget.",
  },
  {
    icon: Layers,
    title: "Modern Technology Stack",
    description:
      "Built on Next.js, TypeScript, and cloud-native tooling — architecture that stays fast and maintainable as you scale.",
  },
  {
    icon: Rocket,
    title: "Agile & Fast Delivery",
    description:
      "Clear milestones and parallel workstreams get your product live in weeks, not quarters, without cutting corners.",
  },
  {
    icon: TrendingUp,
    title: "SEO & Growth Focused",
    description:
      "Every website and application is built with SEO best practices, performance optimisation, and scalable architecture.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Scalable Solutions",
    description:
      "Infrastructure designed to handle growth and protect data, with security reviewed at every layer of the stack.",
  },
  {
    icon: Headset,
    title: "Dedicated Technical Support",
    description:
      "A direct line to your team after launch — real responses, not ticket queues, whenever something needs attention.",
  },
];

const STATS: Stat[] = [
  { end: 10,  suffix: "+",  label: "Projects Completed" },
  { end: 8,   suffix: "+",  label: "Services Offered" },
  { end: 24,  suffix: "/7", label: "Technical Support" },
  { end: 100, suffix: "%",  label: "Commitment to Quality" },
];

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const gridVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.08 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.42, ease: "easeOut" } },
};

// ── Count-up ──────────────────────────────────────────────────────

function useCountUp(end: number, startWhen: boolean, duration = 1.6) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!startWhen) return;
    let startTime: number | null = null;
    let raf = 0;
    const step = (ts: number) => {
      if (startTime === null) startTime = ts;
      const progress = Math.min((ts - startTime) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * end));
      if (progress < 1) { raf = requestAnimationFrame(step); }
      else { setValue(end); }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [startWhen, end, duration]);
  return value;
}

function StatItem({ end, suffix, label, isInView }: Stat & { isInView: boolean }) {
  const count = useCountUp(end, isInView);
  return (
    <div className="flex flex-col items-center justify-center gap-1 px-6 py-8 text-center">
      <span className="text-3xl font-bold text-[#e8a064]">
        {count}{suffix}
      </span>
      <span className="text-xs font-medium uppercase tracking-[0.14em] text-[#71717a]">
        {label}
      </span>
    </div>
  );
}

// ── Feature card ──────────────────────────────────────────────────

function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = feature.icon;
  return (
    <div className="group flex h-full flex-col rounded-2xl border border-[#262626] bg-[#141414] p-6 transition-all duration-200 hover:border-[rgba(232,160,100,0.25)] hover:bg-[#1c1c1e]">
      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[#1c1c1e] text-[#71717a] transition-colors duration-200 group-hover:bg-[#2a1f14] group-hover:text-[#e8a064]">
        <Icon className="h-5 w-5" strokeWidth={1.8} />
      </div>
      <h3 className="mb-2 text-base font-semibold text-[#d4d4d4] group-hover:text-[#f4f4f5] transition-colors">
        {feature.title}
      </h3>
      <p className="text-sm leading-6 text-[#71717a]">{feature.description}</p>
    </div>
  );
}

export default function WhyChooseUs() {
  const shouldReduceMotion = useReducedMotion();
  const statsRef = useRef<HTMLDivElement>(null);
  const isStatsInView = useInView(statsRef, { once: true, amount: 0.4 });

  return (
    <section className="bg-[#0f0f0f] py-24 sm:py-28">
      {/* Horizontal rule */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="mb-24 h-px w-full bg-gradient-to-r from-transparent via-[#262626] to-transparent" />

        {/* Two-column layout: left heading, right features */}
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-[0.85fr_1.15fr]">
          {/* Left: sticky header */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            variants={headerVariants}
            className="flex flex-col items-start"
          >
            <SectionHeader
              overline="Why Axivon"
              heading={
                <>
                  Built for businesses that
                  {" "}
                  <span className="text-gradient-amber">demand results.</span>
                </>
              }
              body="We combine modern engineering with business clarity — so every product we ship is fast, usable, and built to grow."
              align="left"
              maxWidthClass="max-w-sm"
            />

            {/* Stats panel */}
            <motion.div
              ref={statsRef}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
              className="mt-12 w-full overflow-hidden rounded-2xl border border-[#262626] bg-[#141414]"
            >
              <div className="grid grid-cols-2 divide-x divide-y divide-[#262626]">
                {STATS.map((stat) => (
                  <StatItem key={stat.label} {...stat} isInView={isStatsInView} />
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Right: feature grid */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.08 }}
            variants={gridVariants}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            {FEATURES.map((feature) => (
              <motion.div
                key={feature.title}
                variants={cardVariants}
                whileHover={shouldReduceMotion ? undefined : { y: -3 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <FeatureCard feature={feature} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}