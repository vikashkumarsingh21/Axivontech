"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronDown,
  FolderKanban,
  Headphones,
  type LucideIcon,
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

        {/* Right column — editorial workspace image + floating stats */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.75, ease: EASE_ABOUT }}
          className="relative mx-auto w-full max-w-lg"
        >
          {/* Glow behind image */}
          <div
            aria-hidden={true}
            className="pointer-events-none absolute -inset-6 rounded-[2.5rem] bg-[radial-gradient(ellipse,_rgba(232,160,100,0.07),_transparent_70%)] blur-2xl"
          />

          {/* Photo card */}
          <div className="relative overflow-hidden rounded-[2rem] border border-[#262626] shadow-[0_24px_60px_rgba(0,0,0,0.5)]">
            <Image
              src="/assets/images/developer-workspace.jpg"
              alt="Developer workspace with code on screens"
              width={640}
              height={420}
              className="w-full object-cover object-center"
              sizes="(max-width: 768px) 100vw, 512px"
              priority={false}
            />
            {/* Dark gradient overlay at bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f]/85 via-[#0f0f0f]/20 to-transparent" />

            {/* Floating stats overlay */}
            <div className="absolute bottom-4 left-4 right-4 flex gap-3">
              {STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-1 flex-col items-center gap-1 rounded-xl border border-[#262626]/80 bg-[#141414]/85 px-2 py-3 text-center backdrop-blur-md"
                >
                  <stat.icon
                    className="h-4 w-4 text-[#e8a064]"
                    strokeWidth={2}
                    aria-hidden={true}
                  />
                  <span className="text-base font-bold text-[#f4f4f5]">
                    {stat.value}
                  </span>
                  <span className="text-[10px] uppercase tracking-wide text-[#71717a]">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tech stack tags below image */}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {TECH_STACK.map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-[#262626] bg-[#141414] px-3 py-1 text-xs font-medium text-[#a1a1aa] transition-colors hover:border-[#e8a064]/30 hover:text-[#f4f4f5]"
              >
                {tech}
              </span>
            ))}
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