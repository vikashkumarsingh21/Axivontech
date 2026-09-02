"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronDown,
  FolderKanban,
  Headphones,
  type LucideIcon,
  Rocket,
  Sparkles,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui";

const EASE_ABOUT = [0.22, 1, 0.36, 1] as const;

interface StatItem {
  label: string;
  value: string;
  icon: LucideIcon;
}

interface ChecklistItem {
  label: string;
}

const STATS: StatItem[] = [
  { label: "Projects", value: "10+", icon: FolderKanban },
  { label: "Clients", value: "8+", icon: Users },
  { label: "Support", value: "24/7", icon: Headphones },
];

const CHECKLIST: ChecklistItem[] = [
  { label: "Website Development" },
  { label: "Mobile Apps" },
  { label: "AI Solutions" },
  { label: "Digital Marketing" },
];

const TECH_STACK: string[] = ["Next.js", "React", "Node.js", "AI", "TypeScript"];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: EASE_ABOUT,
    },
  },
};

export default function AboutHero() {
  return (
    <section
      aria-label="About Axivon Technologies"
      className="relative flex min-h-screen w-full items-center overflow-hidden bg-[#0f0f0f] px-4 py-28 sm:px-6 lg:px-8"
    >
      {/* Subtle grid pattern */}
      <div
        aria-hidden={true}
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:56px_56px]"
        style={{
          maskImage:
            "radial-gradient(ellipse at center, black 0%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 0%, transparent 70%)",
        }}
      />

      {/* Floating ambient glow */}
      <motion.div
        aria-hidden={true}
        className="pointer-events-none absolute -left-44 top-10 h-[460px] w-[460px] rounded-full bg-[radial-gradient(circle,_rgba(232,160,100,0.05),_transparent_70%)] blur-[120px]"
        animate={{ x: [0, 40, 0], y: [0, 35, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden={true}
        className="pointer-events-none absolute -right-44 top-1/3 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,_rgba(232,160,100,0.04),_transparent_70%)] blur-[120px]"
        animate={{ x: [0, -35, 0], y: [0, 45, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-16 lg:grid-cols-2 lg:gap-12">
        {/* Left column — text content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-left"
        >
          <motion.div variants={itemVariants} className="mb-6">
            <Badge>
              <Sparkles className="h-3.5 w-3.5 text-[#e8a064]" strokeWidth={2.5} />
              <span className="ml-1.5">About Axivon Technologies</span>
            </Badge>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-4xl font-bold leading-tight tracking-tight text-[#f4f4f5] sm:text-5xl md:text-6xl"
          >
            Building <span className="text-gradient-amber">Future-Ready</span>
            <br />
            <span className="text-gradient-amber">Technology Solutions</span>
            <br />
            For Modern Businesses
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mt-6 max-w-xl text-base leading-relaxed text-[#a1a1aa] sm:text-lg"
          >
            Axivon Technologies helps startups, businesses, and organizations
            build modern websites, mobile applications, AI-powered solutions,
            cloud systems, and digital growth strategies.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="mt-9 flex flex-col gap-4 sm:flex-row"
          >
            <motion.a
              href="/services"
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-[#e8a064] px-7 py-3.5 text-sm font-semibold text-[#0f0f0f] shadow-[0_4px_16px_rgba(232,160,100,0.25)] outline-none transition-shadow duration-300 hover:bg-[#f0b07a] focus-visible:ring-2 focus-visible:ring-[#e8a064]/60 sm:w-auto"
            >
              <span className="relative">Explore Services</span>
              <ArrowRight
                className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                strokeWidth={2.5}
              />
            </motion.a>

            <motion.a
              href="/contact#contact-form"
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-[#303030] bg-[#1c1c1e] px-7 py-3.5 text-sm font-semibold text-[#d4d4d4] outline-none transition-colors duration-300 hover:border-[rgba(232,160,100,0.4)] hover:text-[#e8a064] focus-visible:ring-2 focus-visible:ring-[#e8a064]/60 sm:w-auto"
            >
              <Calendar className="h-4 w-4 text-[#e8a064]" strokeWidth={2.5} />
              <span>Book Free Consultation</span>
            </motion.a>
          </motion.div>

          <motion.ul
            variants={itemVariants}
            className="mt-9 grid max-w-md grid-cols-2 gap-x-6 gap-y-3"
          >
            {CHECKLIST.map((item) => (
              <li
                key={item.label}
                className="flex items-center gap-2 text-sm text-[#a1a1aa]"
              >
                <CheckCircle2
                  className="h-4 w-4 shrink-0 text-[#e8a064]"
                  strokeWidth={2.5}
                  aria-hidden={true}
                />
                {item.label}
              </li>
            ))}
          </motion.ul>
        </motion.div>

        {/* Right column — glass stat card */}
        <motion.div
          initial={{ opacity: 0, y: 48, scale: 0.94 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: EASE_ABOUT }}
          className="relative mx-auto w-full max-w-md"
        >
          {/* Floating glow behind card */}
          <motion.div
            aria-hidden={true}
            className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-[radial-gradient(circle,_rgba(232,160,100,0.04),_transparent_70%)] blur-[90px]"
            animate={{ x: [0, 18, 0], y: [0, -14, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Card body */}
          <div className="relative rounded-3xl border border-[#262626] bg-[#141414] p-8 shadow-[0_16px_40px_rgba(0,0,0,0.5)] backdrop-blur-2xl sm:p-10">
            <div className="mb-8 flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#2a1f14] border border-[#e8a064]/20 text-[#e8a064]">
                <Rocket className="h-5 w-5" strokeWidth={2.5} />
              </span>
              <div>
                <p className="text-base font-bold text-[#f4f4f5] sm:text-lg">
                  Axivon Technologies
                </p>
                <p className="text-xs text-[#71717a] sm:text-sm">
                  Technology Partner For Growth
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {STATS.map((stat) => (
                <motion.div
                  key={stat.label}
                  whileHover={{ y: -4, scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-[#262626] bg-[#1c1c1e] px-2 py-4 text-center"
                >
                  <stat.icon
                    className="h-4 w-4 text-[#e8a064]"
                    strokeWidth={2.25}
                    aria-hidden={true}
                  />
                  <span className="text-lg font-bold text-[#f4f4f5] sm:text-xl">
                    {stat.value}
                  </span>
                  <span className="text-[11px] uppercase tracking-wide text-[#71717a]">
                    {stat.label}
                  </span>
                </motion.div>
              ))}
            </div>

            <div className="my-7 h-px w-full bg-[#262626]" />

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#71717a]">
                Technology Stack
              </p>
              <div className="flex flex-wrap gap-2">
                {TECH_STACK.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full border border-[#262626] bg-[#1c1c1e] px-3.5 py-1.5 text-xs font-medium text-[#d4d4d4] transition-colors duration-300 hover:border-[#e8a064]/40 hover:text-[#f4f4f5]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        aria-hidden={true}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 sm:flex"
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#52525b]">
          Scroll
        </span>
        <div className="flex h-9 w-6 items-start justify-center rounded-full border border-[#262626] p-1.5">
          <motion.span
            className="h-1.5 w-1.5 rounded-full bg-[#e8a064]"
            animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <ChevronDown className="h-3 w-3 text-[#52525b]" strokeWidth={2} />
      </motion.div>
    </section>
  );
}