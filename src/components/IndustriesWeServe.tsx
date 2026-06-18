"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  School,
  GraduationCap,
  Landmark,
  Hospital,
  HeartPulse,
  Hotel,
  UtensilsCrossed,
  BookOpenCheck,
  Store,
  ShoppingBag,
  Building2,
  Lightbulb,
  type LucideIcon,
} from "lucide-react";

interface Industry {
  icon: LucideIcon;
  label: string;
}

const INDUSTRIES: Industry[] = [
  { icon: School, label: "Schools" },
  { icon: GraduationCap, label: "Colleges" },
  { icon: Landmark, label: "Universities" },
  { icon: Hospital, label: "Hospitals" },
  { icon: HeartPulse, label: "Healthcare" },
  { icon: Hotel, label: "Hotels" },
  { icon: UtensilsCrossed, label: "Restaurants" },
  { icon: BookOpenCheck, label: "Coaching Centers" },
  { icon: Store, label: "Retail Shops" },
  { icon: ShoppingBag, label: "Shopping Malls" },
  { icon: Building2, label: "Real Estate" },
  { icon: Lightbulb, label: "Startups" },
];

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const gridVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export default function IndustriesWeServe() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-[#050816] py-24 sm:py-32">
      {/* Floating gradient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          aria-hidden
          className="absolute left-1/4 top-0 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-[#2563EB]/20 blur-[120px]"
          animate={shouldReduceMotion ? undefined : { x: [0, 30, 0], y: [0, 20, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="absolute bottom-0 right-1/4 h-[28rem] w-[28rem] translate-x-1/2 rounded-full bg-[#7C3AED]/20 blur-[130px]"
          animate={shouldReduceMotion ? undefined : { x: [0, -25, 0], y: [0, -25, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
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
            Where We Work
          </span>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Industries{" "}
            <span className="bg-gradient-to-r from-[#2563EB] via-[#7C3AED] to-[#00D4FF] bg-clip-text text-transparent">
              We Serve
            </span>
          </h2>
          <p className="mt-5 text-balance text-base leading-relaxed text-slate-400 sm:text-lg">
            Delivering future-ready digital solutions across multiple
            industries worldwide.
          </p>
        </motion.div>

        {/* Industry cards */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={gridVariants}
          className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6"
        >
          {INDUSTRIES.map((industry) => {
            const Icon = industry.icon;
            return (
              <motion.div
                key={industry.label}
                variants={cardVariants}
                whileHover={shouldReduceMotion ? undefined : { y: -5, scale: 1.03 }}
                transition={{ type: "spring", stiffness: 320, damping: 22 }}
                className="group relative"
              >
                {/* Glow / gradient border layer */}
                <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-[#2563EB] via-[#7C3AED] to-[#00D4FF] opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-70" />

                {/* Card body */}
                <div className="relative flex flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-10 text-center backdrop-blur-xl transition-colors duration-500 group-hover:border-transparent">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#2563EB]/20 via-[#7C3AED]/20 to-[#00D4FF]/20 ring-1 ring-white/10 transition-transform duration-500 group-hover:scale-110">
                    <Icon className="h-7 w-7 text-[#00D4FF]" strokeWidth={1.75} />
                  </div>
                  <span className="text-[0.95rem] font-semibold text-white">
                    {industry.label}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}