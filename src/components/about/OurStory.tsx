"use client";

import React, { useRef } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

import {
  Sparkles,
  Building2,
  Handshake,
  Globe,
  Cpu,
  Target,
  Rocket,
  Users2,
  Headphones,
  Quote,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui";

const EASE_STORY = [0.22, 1, 0.36, 1] as const;

interface TimelineEntry {
  id: string;
  year: string;
  title: string;
  description: string;
  icon: LucideIcon;
  status: "done" | "active" | "future";
}

interface AchievementStat {
  id: string;
  icon: LucideIcon;
  value: string;
  label: string;
}

const TIMELINE: TimelineEntry[] = [
  {
    id: "founded",
    year: "2026",
    title: "Company Founded",
    description:
      "Axivon Technologies launched with a mission to make modern, future-ready technology accessible to every business.",
    icon: Building2,
    status: "done",
  },
  {
    id: "first-client",
    year: "2026",
    title: "First Client Project",
    description:
      "Delivered our first client engagement, turning an early vision into a real, measurable result.",
    icon: Handshake,
    status: "done",
  },
  {
    id: "website-launch",
    year: "2026",
    title: "Website Launch",
    description:
      "Shipped a brand-new digital presence built for speed, clarity, and growth.",
    icon: Globe,
    status: "done",
  },
  {
    id: "ai-expansion",
    year: "2027",
    title: "AI & Automation Expansion",
    description:
      "Expanding into AI-driven solutions and intelligent automation to help clients work smarter.",
    icon: Cpu,
    status: "active",
  },
  {
    id: "global-partner",
    year: "Future",
    title: "Global Technology Partner",
    description:
      "Working toward becoming a trusted technology partner for businesses around the world.",
    icon: Target,
    status: "future",
  },
];

const ACHIEVEMENTS: AchievementStat[] = [
  { id: "projects", icon: Rocket, value: "10+", label: "Projects Completed" },
  { id: "clients", icon: Users2, value: "8+", label: "Happy Clients" },
  { id: "support", icon: Headphones, value: "24/7", label: "Support" },
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
    transition: { duration: 0.7, ease: EASE_STORY },
  },
};

const timelineListVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.18, delayChildren: 0.2 } },
};

const timelineItemVariants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: EASE_STORY },
  },
};

const nodeVariants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 260,
      damping: 18,
    },
  },
};

const lineVariants = {
  hidden: { scaleY: 0 },
  visible: {
    scaleY: 1,
    transition: { duration: 1.4, ease: EASE_STORY },
  },
};

function BackgroundLayer() {
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
            "radial-gradient(ellipse 75% 65% at 50% 20%, black 35%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 75% 65% at 50% 20%, black 35%, transparent 100%)",
        }}
      />

      {/* floating gradient blobs */}
      <motion.div
        className="absolute -left-24 -top-32 h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,_rgba(232,160,100,0.04),_transparent_70%)] blur-[120px]"
        animate={shouldReduceMotion ? undefined : { x: [0, 30, 0], y: [0, 20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-40 -right-24 h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle,_rgba(232,160,100,0.03),_transparent_70%)] blur-[130px]"
        animate={shouldReduceMotion ? undefined : { x: [0, -25, 0], y: [0, -25, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      {/* fade into next section */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0f0f0f] to-transparent" />
    </div>
  );
}

function AchievementCard({ stat }: { stat: AchievementStat }) {
  const Icon = stat.icon;

  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group relative rounded-2xl border border-[#262626] bg-[#141414] p-5 transition-colors duration-300 hover:border-[rgba(232,160,100,0.25)]"
    >
      <div className="relative flex items-center gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#2a1f14] text-[#e8a064] border border-[#e8a064]/20 shadow-lg">
          <Icon className="h-5 w-5" aria-hidden={true} />
        </div>
        <div>
          <p className="text-2xl font-bold text-[#f4f4f5]">{stat.value}</p>
          <p className="text-sm text-[#71717a]">{stat.label}</p>
        </div>
      </div>
    </motion.div>
  );
}

function TimelineNode({
  status,
  Icon,
}: {
  status: TimelineEntry["status"];
  Icon: LucideIcon;
}) {
  const isFuture = status === "future";
  const isActive = status === "active";

  return (
    <motion.div
      variants={nodeVariants}
      className="absolute left-0 top-0 z-10 h-10 w-10"
    >
      {isActive && (
        <motion.span
          className="absolute inset-0 rounded-full bg-[#e8a064]/30"
          animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
        />
      )}
      <div
        className={`relative flex h-10 w-10 items-center justify-center rounded-full border ${
          isFuture
            ? "border-dashed border-[#e8a064]/40 bg-[#0f0f0f] text-[#e8a064]"
            : "border-transparent bg-[#e8a064] text-[#0f0f0f] shadow-lg shadow-[#e8a064]/20"
        }`}
      >
        <Icon
          className="h-4 w-4"
          aria-hidden={true}
        />
      </div>
    </motion.div>
  );
}

function TimelineRow({ entry }: { entry: TimelineEntry }) {
  const Icon = entry.icon;

  return (
    <motion.li variants={timelineItemVariants} className="relative pl-16">
      <TimelineNode status={entry.status} Icon={Icon} />

      <motion.div
        whileHover={{ y: -4, scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        className="group relative rounded-2xl border border-[#262626] bg-[#141414] p-5 transition-colors duration-300 hover:border-[rgba(232,160,100,0.25)]"
      >
        <div className="relative">
          <span className="inline-block rounded-full border border-[#262626] bg-[#1c1c1e] px-2.5 py-0.5 text-xs font-semibold tracking-wide text-[#e8a064]">
            {entry.year}
          </span>
          <h3 className="mt-2 text-base font-semibold text-[#f4f4f5] sm:text-lg">
            {entry.title}
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-[#a1a1aa]">
            {entry.description}
          </p>
        </div>
      </motion.div>
    </motion.li>
  );
}

function Timeline() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="relative"
      role="group"
      aria-label="Axivon Technologies company timeline"
    >
      {/* static track */}
      <div
        className="absolute bottom-2 left-5 top-2 w-px bg-[#262626]"
        aria-hidden={true}
      />
      {/* animated gradient line that grows on scroll */}
      <motion.div
        className="absolute bottom-2 left-5 top-2 w-px origin-top bg-gradient-to-b from-[#e8a064] via-[#f0b07a] to-[#c47a3a]"
        variants={lineVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        aria-hidden={true}
      />

      <motion.ol
        className="relative space-y-7"
        variants={timelineListVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        {TIMELINE.map((entry) => (
          <TimelineRow key={entry.id} entry={entry} />
        ))}
      </motion.ol>
    </div>
  );
}

export default function OurStory() {
  return (
    <section
      id="our-story"
      aria-labelledby="our-story-heading"
      className="relative isolate overflow-hidden bg-[#0f0f0f] px-6 py-24 sm:px-8 md:py-32 lg:px-12"
    >
      <BackgroundLayer />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-12 xl:gap-20">
          {/* LEFT: story content */}
          <motion.div
            variants={containerStagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {/* badge */}
            <motion.div variants={fadeUp} className="mb-6">
              <Badge>
                <Sparkles className="h-3.5 w-3.5 text-[#e8a064]" aria-hidden={true} />
                <span className="ml-1.5">Our Journey</span>
              </Badge>
            </motion.div>

            {/* heading */}
            <motion.h2
              id="our-story-heading"
              variants={fadeUp}
              className="mt-6 text-4xl font-bold leading-[1.12] tracking-tight text-[#f4f4f5] sm:text-5xl lg:text-[3.25rem]"
            >
              The <span className="text-gradient-amber">Story</span> Behind{" "}
              <span className="text-gradient-amber">Axivon Technologies</span>
            </motion.h2>

            {/* description */}
            <motion.p
              variants={fadeUp}
              className="mt-6 text-base leading-relaxed text-[#a1a1aa] sm:text-lg"
            >
              Axivon Technologies was founded in 2026 with a vision to help
              businesses embrace digital transformation through modern
              technology solutions. We believe every business deserves access
              to innovative websites, AI solutions, cloud technologies, mobile
              applications, and digital growth strategies.
            </motion.p>

            {/* mission paragraph */}
            <motion.p
              variants={fadeUp}
              className="mt-4 text-base leading-relaxed text-[#a1a1aa] sm:text-lg"
            >
              Our mission is to empower startups, businesses, educational
              institutions, healthcare organizations, and enterprises with
              future-ready technology that drives growth, efficiency, and
              innovation.
            </motion.p>

            {/* founder vision */}
            <motion.blockquote
              variants={fadeUp}
              className="relative mt-8 rounded-2xl border border-[#262626] bg-[#141414] p-6"
            >
              <Quote className="h-6 w-6 text-[#e8a064]/50" aria-hidden={true} />
              <p className="mt-3 text-base italic leading-relaxed text-[#d4d4d4]">
                We started Axivon with a simple belief: technology should be a
                growth partner, not a hurdle. Every solution we build is
                designed to move our clients forward, faster.
              </p>
              <footer className="mt-4 text-sm font-medium text-[#71717a]">
                — The Axivon Founding Team
              </footer>
            </motion.blockquote>

            {/* CTA */}
            <motion.div variants={fadeUp} className="mt-8">
              <a
                href="/services"
                className="group inline-flex items-center gap-2 rounded-full border border-[#303030] bg-[#1c1c1e] px-5 py-2.5 text-sm font-semibold text-[#d4d4d4] backdrop-blur-md transition-colors duration-300 hover:border-[rgba(232,160,100,0.4)] hover:text-[#e8a064] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a064]"
              >
                See what we&apos;re building next
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden={true}
                />
              </a>
            </motion.div>

            {/* achievement cards */}
            <motion.div
              variants={containerStagger}
              className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3"
            >
              {ACHIEVEMENTS.map((stat) => (
                <AchievementCard key={stat.id} stat={stat} />
              ))}
            </motion.div>
          </motion.div>

          {/* RIGHT: timeline */}
          <div className="relative">
            <Timeline />
          </div>
        </div>
      </div>
    </section>
  );
}