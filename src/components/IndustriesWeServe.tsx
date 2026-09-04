"use client";

import Image from "next/image";
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
  description: string;
}

const INDUSTRIES: Industry[] = [
  { icon: School, label: "Schools", description: "Digital platforms for K-12 institutions" },
  { icon: GraduationCap, label: "Colleges", description: "Campus portals and learning systems" },
  { icon: Landmark, label: "Universities", description: "Enterprise education infrastructure" },
  { icon: Hospital, label: "Hospitals", description: "Patient portals and health systems" },
  { icon: HeartPulse, label: "Healthcare", description: "Clinic and wellness digital tools" },
  { icon: Hotel, label: "Hotels", description: "Booking and hospitality platforms" },
  { icon: UtensilsCrossed, label: "Restaurants", description: "Online ordering and menus" },
  { icon: BookOpenCheck, label: "Coaching Centers", description: "Batch management and apps" },
  { icon: Store, label: "Retail Shops", description: "E-commerce and inventory tools" },
  { icon: ShoppingBag, label: "Shopping Malls", description: "Digital directories and promotions" },
  { icon: Building2, label: "Real Estate", description: "Property listing and CRM systems" },
  { icon: Lightbulb, label: "Startups", description: "MVPs and growth-ready products" },
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

const imageVariants: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
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
        {/* Two-column layout: industries grid + editorial image */}
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-12 xl:gap-16 items-start">
          {/* Left — section header + industry grid */}
          <div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.4 }}
              variants={headerVariants}
              className="mb-12"
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
              className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3"
            >
              {INDUSTRIES.map((industry) => {
                const Icon = industry.icon;
                return (
                  <motion.div
                    key={industry.label}
                    variants={cardVariants}
                    whileHover={shouldReduceMotion ? undefined : { y: -3 }}
                    transition={{ duration: 0.2 }}
                    className="group flex flex-col gap-3 rounded-xl border border-[#262626] bg-[#141414] p-4 transition-all duration-200 hover:border-[rgba(232,160,100,0.25)] hover:bg-[#1c1c1e] hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)]"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1c1c1e] text-[#71717a] transition-all duration-200 group-hover:scale-110 group-hover:bg-[#2a1f14] group-hover:text-[#e8a064]">
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#f4f4f5] group-hover:text-[#e8a064] transition-colors leading-snug">
                        {industry.label}
                      </p>
                      <p className="mt-0.5 text-xs text-[#71717a] leading-relaxed">
                        {industry.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          {/* Right — editorial workplace image + callout */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={imageVariants}
            className="relative lg:sticky lg:top-28"
          >
            {/* Glow */}
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-4 rounded-[2.5rem] bg-[radial-gradient(ellipse,_rgba(232,160,100,0.06),_transparent_70%)] blur-2xl"
            />

            {/* Image */}
            <div className="relative overflow-hidden rounded-[1.75rem] border border-[#262626] shadow-[0_24px_60px_rgba(0,0,0,0.4)]">
              <Image
                src="/assets/images/agency/team-collaboration.jpg"
                alt="Cross-industry technology collaboration"
                width={640}
                height={520}
                className="w-full object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f]/75 via-transparent to-transparent" />

              {/* Bottom callout on image */}
              <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-[#262626]/80 bg-[#141414]/85 p-4 backdrop-blur-md">
                <p className="text-sm font-semibold text-[#f4f4f5]">
                  12+ Industry Verticals
                </p>
                <p className="mt-1 text-xs text-[#71717a] leading-relaxed">
                  From education to healthcare, retail to real estate — we build digital products that fit your sector.
                </p>
              </div>
            </div>

            {/* Below-image stat strip */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { value: "12+", label: "Industries" },
                { value: "10+", label: "Projects Done" },
                { value: "24/7", label: "Support" },
              ].map(({ value, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-1 rounded-xl border border-[#262626] bg-[#141414] py-4 text-center"
                >
                  <span className="text-xl font-bold text-[#f4f4f5]">{value}</span>
                  <span className="text-[10px] uppercase tracking-wide text-[#71717a]">{label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}