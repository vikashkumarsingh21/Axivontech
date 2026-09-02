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
import { SectionHeader } from "@/components/ui";

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
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const gridVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export default function IndustriesWeServe() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="bg-[#0f0f0f] py-24 sm:py-28 relative">
      {/* Ambient soft glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,_rgba(232,160,100,0.04),_transparent_70%)]"
      />
      
      <div className="mx-auto max-w-7xl px-6 lg:px-10 relative">
        {/* Section header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={headerVariants}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <SectionHeader
            overline="Where We Work"
            heading={
              <>
                Industries We <span className="text-gradient-amber">Serve</span>
              </>
            }
            body="Delivering future-ready digital solutions across key sectors to build growth, trust, and operational efficiency."
          />
        </motion.div>

        {/* Industry cards */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={gridVariants}
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6"
        >
          {INDUSTRIES.map((industry) => {
            const Icon = industry.icon;
            return (
              <motion.div
                key={industry.label}
                variants={cardVariants}
                whileHover={shouldReduceMotion ? undefined : { y: -3 }}
                transition={{ duration: 0.2 }}
                className="group flex flex-col items-center justify-center gap-4 rounded-xl border border-[#262626] bg-[#141414] p-6 text-center transition-all duration-200 hover:border-[rgba(232,160,100,0.25)] hover:bg-[#1c1c1e] hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#1c1c1e] text-[#71717a] transition-all duration-200 group-hover:scale-110 group-hover:bg-[#2a1f14] group-hover:text-[#e8a064]">
                  <Icon className="h-6 w-6" strokeWidth={1.75} />
                </div>
                <span className="text-sm font-semibold text-[#a1a1aa] group-hover:text-[#f4f4f5] transition-colors">
                  {industry.label}
                </span>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}