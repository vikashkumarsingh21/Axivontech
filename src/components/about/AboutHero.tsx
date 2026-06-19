"use client";

import { motion, Variants } from "framer-motion";
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

interface StatItem {
  label: string;
  value: string;
  icon: LucideIcon;
}

interface ChecklistItem {
  label: string;
}

const STATS: StatItem[] = [
  { label: "Projects", value: "4+", icon: FolderKanban },
  { label: "Clients", value: "2+", icon: Users },
  { label: "Support", value: "24/7", icon: Headphones },
];

const CHECKLIST: ChecklistItem[] = [
  { label: "Website Development" },
  { label: "Mobile Apps" },
  { label: "AI Solutions" },
  { label: "Digital Marketing" },
];

const TECH_STACK: string[] = ["Next.js", "React", "Node.js", "AI"];

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

function GradientWord({ children }: { children: string }) {
  return (
    <motion.span
      className="bg-gradient-to-r from-[#2563EB] via-[#7C3AED] to-[#00D4FF] bg-clip-text text-transparent"
      style={{ backgroundSize: "200% auto" }}
      animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
      transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
    >
      {children}
    </motion.span>
  );
}

export default function AboutHero() {
  return (
    <section
      aria-label="About Axivon Technologies"
      className="relative flex min-h-screen w-full items-center overflow-hidden bg-[#050816] px-4 py-28 sm:px-6 lg:px-8"
    >
      {/* Subtle grid pattern */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:56px_56px]"
        style={{
          maskImage:
            "radial-gradient(ellipse at center, black 0%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 0%, transparent 70%)",
        }}
      />

      {/* Floating gradient orbs */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -left-44 top-10 h-[460px] w-[460px] rounded-full bg-[#2563EB]/25 blur-[130px]"
        animate={{ x: [0, 40, 0], y: [0, 35, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -right-44 top-1/3 h-[420px] w-[420px] rounded-full bg-[#7C3AED]/25 blur-[130px]"
        animate={{ x: [0, -35, 0], y: [0, 45, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-180px] left-1/3 h-[420px] w-[420px] rounded-full bg-[#00D4FF]/20 blur-[140px]"
        animate={{ x: [0, 30, -20, 0], y: [0, -25, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-16 lg:grid-cols-2 lg:gap-12">
        {/* Left column — text content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-left"
        >
          <motion.span
            variants={itemVariants}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#00D4FF] backdrop-blur-md"
          >
            <Sparkles className="h-3.5 w-3.5" strokeWidth={2.5} />
            About Axivon Technologies
          </motion.span>

          <motion.h1
            variants={itemVariants}
            className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl"
          >
            Building <GradientWord>Future-Ready</GradientWord>
            <br />
            <GradientWord>Technology Solutions</GradientWord>
            <br />
            For Modern Businesses
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mt-6 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg"
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
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#2563EB] to-[#7C3AED] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_0_30px_-8px_rgba(37,99,235,0.8)] outline-none transition-shadow duration-300 hover:shadow-[0_0_45px_-6px_rgba(124,58,237,0.9)] focus-visible:ring-2 focus-visible:ring-[#00D4FF]/60 sm:w-auto"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full"
              />
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
              className="flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-3.5 text-sm font-semibold text-slate-200 backdrop-blur-md outline-none transition-colors duration-300 hover:border-[#00D4FF]/50 hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-[#00D4FF]/60 sm:w-auto"
            >
              <Calendar className="h-4 w-4 text-[#00D4FF]" strokeWidth={2.5} />
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
                className="flex items-center gap-2 text-sm text-slate-300"
              >
                <CheckCircle2
                  className="h-4 w-4 shrink-0 text-[#00D4FF]"
                  strokeWidth={2.5}
                  aria-hidden="true"
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
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full max-w-md"
        >
          {/* Floating glow behind card */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-[#7C3AED]/40 blur-[90px]"
            animate={{ x: [0, 18, 0], y: [0, -14, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-10 -left-10 h-56 w-56 rounded-full bg-[#2563EB]/40 blur-[90px]"
            animate={{ x: [0, -18, 0], y: [0, 16, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Gradient border layers */}
          <div
            aria-hidden="true"
            className="absolute -inset-px rounded-3xl bg-gradient-to-br from-[#2563EB] via-[#7C3AED] to-[#00D4FF] opacity-60 blur-sm"
          />
          <div
            aria-hidden="true"
            className="absolute -inset-px rounded-3xl bg-gradient-to-br from-[#2563EB]/70 via-[#7C3AED]/70 to-[#00D4FF]/70"
          />

          {/* Card body */}
          <div className="relative rounded-3xl border border-white/10 bg-[#0A0F24]/90 p-8 shadow-[0_0_70px_-15px_rgba(124,58,237,0.5)] backdrop-blur-2xl sm:p-10">
            <div className="mb-8 flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#2563EB] to-[#7C3AED] text-white">
                <Rocket className="h-5 w-5" strokeWidth={2.5} />
              </span>
              <div>
                <p className="text-base font-bold text-white sm:text-lg">
                  Axivon Technologies
                </p>
                <p className="text-xs text-slate-400 sm:text-sm">
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
                  className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-2 py-4 text-center"
                >
                  <stat.icon
                    className="h-4 w-4 text-[#00D4FF]"
                    strokeWidth={2.25}
                    aria-hidden="true"
                  />
                  <span className="text-lg font-bold text-white sm:text-xl">
                    {stat.value}
                  </span>
                  <span className="text-[11px] uppercase tracking-wide text-slate-400">
                    {stat.label}
                  </span>
                </motion.div>
              ))}
            </div>

            <div className="my-7 h-px w-full bg-white/10" />

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Technology Stack
              </p>
              <div className="flex flex-wrap gap-2">
                {TECH_STACK.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-slate-200 transition-colors duration-300 hover:border-[#00D4FF]/40 hover:text-white"
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
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 sm:flex"
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-slate-500">
          Scroll
        </span>
        <div className="flex h-9 w-6 items-start justify-center rounded-full border border-white/20 p-1.5">
          <motion.span
            className="h-1.5 w-1.5 rounded-full bg-gradient-to-b from-[#2563EB] to-[#00D4FF]"
            animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <ChevronDown className="h-3 w-3 text-slate-500" strokeWidth={2} />
      </motion.div>
    </section>
  );
}