"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  Atom,
  Bot,
  BrainCircuit,
  Cloud,
  CloudCog,
  Code2,
  Cpu,
  FileType2,
  Flame,
  GitBranch,
  Hexagon,
  Layers,
  Leaf,
  MonitorSmartphone,
  Network,
  Server,
  Sparkles,
  Triangle,
  Wind,
  Workflow,
  Zap,
} from "lucide-react";
import type { ComponentType } from "react";
import { FaGithub } from "react-icons/fa";
import { Badge } from "@/components/ui";

interface TechEntry {
  name: string;
  icon: ComponentType<any>;
}

interface CategoryEntry {
  id: string;
  title: string;
  description: string;
  icon: ComponentType<any>;
  gradient: string;
  glow: string;
  spotlight: string;
  techs: TechEntry[];
  colSpan: string;
}

const TECH_ICONS: Record<string, ComponentType<any>> = {
  "Next.js": Layers,
  React: Atom,
  TypeScript: FileType2,
  "Tailwind CSS": Wind,
  "Framer Motion": Sparkles,
  "Node.js": Hexagon,
  "Express.js": Zap,
  Express: Zap,
  MongoDB: Leaf,
  Firebase: Flame,
  "REST APIs": Network,
  Python: Code2,
  TensorFlow: Cpu,
  OpenAI: Bot,
  "Machine Learning": BrainCircuit,
  "AI Automation": Workflow,
  AWS: Cloud,
  Vercel: Triangle,
  GitHub: FaGithub,
  "Cloud Hosting": CloudCog,
  "CI/CD": GitBranch,
};

function iconFor(name: string): ComponentType<any> {
  return TECH_ICONS[name] ?? Code2;
}

function toTechEntries(names: string[]): TechEntry[] {
  return names.map((name) => ({ name, icon: iconFor(name) }));
}

const CATEGORIES: CategoryEntry[] = [
  {
    id: "frontend",
    title: "Frontend Engineering",
    description:
      "Fluid, high-performance interfaces crafted with the modern React ecosystem.",
    icon: MonitorSmartphone,
    gradient: "from-[#c47a3a] via-[#e8a064] to-[#f0b07a]",
    glow: "shadow-[0_0_60px_-20px_rgba(232,160,100,0.3)]",
    spotlight: "rgba(232,160,100,0.08)",
    techs: toTechEntries([
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Framer Motion",
    ]),
    colSpan: "lg:col-span-7",
  },
  {
    id: "backend",
    title: "Backend Systems",
    description: "Resilient, scalable services powering every product we ship.",
    icon: Server,
    gradient: "from-[#e8a064] via-[#f0b07a] to-[#c47a3a]",
    glow: "shadow-[0_0_60px_-20px_rgba(232,160,100,0.3)]",
    spotlight: "rgba(232,160,100,0.08)",
    techs: toTechEntries([
      "Node.js",
      "Express.js",
      "MongoDB",
      "Firebase",
      "REST APIs",
    ]),
    colSpan: "lg:col-span-5",
  },
  {
    id: "ai",
    title: "AI & Automation",
    description:
      "Intelligent systems that learn, adapt, and automate the busywork.",
    icon: BrainCircuit,
    gradient: "from-[#f0b07a] via-[#c47a3a] to-[#e8a064]",
    glow: "shadow-[0_0_60px_-20px_rgba(232,160,100,0.3)]",
    spotlight: "rgba(232,160,100,0.08)",
    techs: toTechEntries([
      "Python",
      "TensorFlow",
      "OpenAI",
      "Machine Learning",
      "AI Automation",
    ]),
    colSpan: "lg:col-span-5",
  },
  {
    id: "cloud",
    title: "Cloud & Infrastructure",
    description:
      "Infrastructure that scales quietly in the background and never goes down.",
    icon: CloudCog,
    gradient: "from-[#c47a3a] via-[#e8a064] to-[#c47a3a]",
    glow: "shadow-[0_0_60px_-20px_rgba(232,160,100,0.3)]",
    spotlight: "rgba(232,160,100,0.08)",
    techs: toTechEntries(["AWS", "Vercel", "GitHub", "Cloud Hosting", "CI/CD"]),
    colSpan: "lg:col-span-7",
  },
];

const EASE_PREMIUM = [0.16, 1, 0.3, 1] as const;

function BentoCard({ category, index }: { category: CategoryEntry; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springRotateX = useSpring(rotateX, { stiffness: 150, damping: 20 });
  const springRotateY = useSpring(rotateY, { stiffness: 150, damping: 20 });

  const spotX = useMotionValue(50);
  const spotY = useMotionValue(50);
  const spotlightBackground = useMotionTemplate`radial-gradient(420px circle at ${spotX}% ${spotY}%, ${category.spotlight}, transparent 70%)`;

  const handleMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (reduceMotion || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      rotateY.set((px - 0.5) * 10);
      rotateX.set((0.5 - py) * 10);
      spotX.set(px * 100);
      spotY.set(py * 100);
    },
    [reduceMotion, rotateX, rotateY, spotX, spotY]
  );

  const handleLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
  }, [rotateX, rotateY]);

  const Icon = category.icon;

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      initial={reduceMotion ? false : { opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay: index * 0.12, ease: "easeOut" }}
      whileHover={reduceMotion ? undefined : { y: -6 }}
      style={{
        rotateX: reduceMotion ? 0 : springRotateX,
        rotateY: reduceMotion ? 0 : springRotateY,
        transformPerspective: 1000,
      }}
      className={`group relative min-h-[320px] ${category.colSpan} rounded-3xl border border-[#262626] bg-[#141414] p-[1px] ${category.glow} transition-shadow duration-500 hover:border-[rgba(232,160,100,0.25)]`}
    >
      <div
        aria-hidden={true}
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl"
      >
        <div className="absolute inset-[-50%] animate-[spin-cw_6s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0deg,rgba(232,160,100,0.25)_15deg,transparent_55deg)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>

      <motion.div
        aria-hidden={true}
        style={{ background: spotlightBackground }}
        className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />

      <div className="relative z-10 flex h-full flex-col overflow-hidden rounded-[23px] bg-[#141414]/95 p-7 backdrop-blur-2xl sm:p-9">
        <div className="flex items-center gap-4">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${category.gradient}`}>
            <Icon className="h-6 w-6 text-[#0f0f0f]" />
          </div>
          <div>
            <h3 className="text-xl font-semibold tracking-tight text-[#f4f4f5]">
              {category.title}
            </h3>
            <p className="text-xs text-[#71717a]">{category.description}</p>
          </div>
        </div>

        <div className="my-6 h-px w-full bg-[#262626]" />

        <div className="flex flex-wrap gap-2.5">
          {category.techs.map((tech) => {
            const TechIcon = tech.icon;
            return (
              <div
                key={tech.name}
                className="flex items-center gap-2 rounded-full border border-[#262626] bg-[#1c1c1e] px-4 py-2 text-sm text-[#a1a1aa] transition-colors duration-300 hover:border-[rgba(232,160,100,0.25)] hover:text-[#f4f4f5]"
              >
                <TechIcon className="h-4 w-4 text-[#e8a064]" />
                <span className="font-medium">{tech.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

export default function TechnologyStack() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const backgroundParallaxY = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? [0, 0] : [-50, 50]
  );

  return (
    <section
      ref={sectionRef}
      id="tech-stack"
      aria-labelledby="tech-stack-heading"
      className="relative isolate overflow-hidden bg-[#0f0f0f] py-24 sm:py-32"
    >
      <motion.div aria-hidden={true} style={{ y: backgroundParallaxY }} className="absolute inset-0" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: EASE_PREMIUM }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mb-6 flex justify-center">
            <Badge>
              <span aria-hidden={true} className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#e8a064]" />
              <span className="ml-1.5">OUR TOOLS</span>
            </Badge>
          </div>

          <h2
            id="tech-stack-heading"
            className="mt-6 text-4xl font-bold tracking-tight text-[#f4f4f5] sm:text-5xl lg:text-6xl"
          >
            Engineering With a
            <br />
            <span className="text-gradient-amber">Modern Tech Stack</span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[#a1a1aa] sm:text-lg">
            We use reliable, fast, and scalable tools to ensure your product remains future-proof and highly optimized.
          </p>
        </motion.div>

        <div
          className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8"
          role="list"
          aria-label="Axivon Technologies technology stack categories"
        >
          {CATEGORIES.map((category, i) => (
            <BentoCard key={category.id} category={category} index={i} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes spin-cw {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
}