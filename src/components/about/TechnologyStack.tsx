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

/* -------------------------------------------------------------------------- */
/*  Data                                                                      */
/* -------------------------------------------------------------------------- */

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
    gradient: "from-[#2563EB] via-[#3B82F6] to-[#00D4FF]",
    glow: "shadow-[0_0_60px_-20px_rgba(37,99,235,0.55)]",
    spotlight: "rgba(37,99,235,0.16)",
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
    gradient: "from-[#7C3AED] via-[#8B5CF6] to-[#2563EB]",
    glow: "shadow-[0_0_60px_-20px_rgba(124,58,237,0.55)]",
    spotlight: "rgba(124,58,237,0.16)",
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
    gradient: "from-[#00D4FF] via-[#38BDF8] to-[#7C3AED]",
    glow: "shadow-[0_0_60px_-20px_rgba(0,212,255,0.45)]",
    spotlight: "rgba(0,212,255,0.16)",
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
    gradient: "from-[#2563EB] via-[#00D4FF] to-[#2563EB]",
    glow: "shadow-[0_0_60px_-20px_rgba(37,99,235,0.55)]",
    spotlight: "rgba(0,212,255,0.14)",
    techs: toTechEntries(["AWS", "Vercel", "GitHub", "Cloud Hosting", "CI/CD"]),
    colSpan: "lg:col-span-7",
  },
];

const ORBIT_INNER = ["Next.js", "React", "TypeScript", "Node.js", "MongoDB"];
const ORBIT_OUTER = ["Python", "OpenAI", "AWS", "Firebase", "GitHub", "Vercel"];

const CLOUD_TECHS = [
  "Next.js",
  "React",
  "TypeScript",
  "Node.js",
  "Express",
  "MongoDB",
  "Firebase",
  "Python",
  "TensorFlow",
  "OpenAI",
  "AWS",
  "GitHub",
  "Vercel",
  "Tailwind CSS",
  "Framer Motion",
];

const EASE_PREMIUM = [0.16, 1, 0.3, 1] as const;

/* -------------------------------------------------------------------------- */
/*  Magnetic hover wrapper                                                    */
/* -------------------------------------------------------------------------- */

function MagneticWrap({
  children,
  strength = 0.35,
}: {
  children: React.ReactNode;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 220, damping: 16, mass: 0.3 });
  const springY = useSpring(y, { stiffness: 220, damping: 16, mass: 0.3 });
  const reduceMotion = useReducedMotion();

  const handleMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (reduceMotion || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const relX = event.clientX - rect.left - rect.width / 2;
      const relY = event.clientY - rect.top - rect.height / 2;
      x.set(relX * strength);
      y.set(relY * strength);
    },
    [reduceMotion, strength, x, y]
  );

  const handleLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ x: springX, y: springY }}
      className="inline-flex"
    >
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Bento card                                                                */
/* -------------------------------------------------------------------------- */

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
      className={`group relative min-h-[320px] ${category.colSpan} rounded-3xl border border-white/[0.08] bg-white/[0.02] p-[1px] ${category.glow} transition-shadow duration-500`}
    >
      {/* gradient border beam */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl"
      >
        <div className="absolute inset-[-50%] animate-[spin-cw_6s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0deg,rgba(0,212,255,0.65)_15deg,transparent_55deg)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>

      {/* mouse-follow spotlight */}
      <motion.div
        aria-hidden="true"
        style={{ background: spotlightBackground }}
        className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />

      <div className="relative z-10 flex h-full flex-col gap-6 overflow-hidden rounded-[23px] bg-[#070b1c]/90 p-6 backdrop-blur-xl sm:p-8">
        {/* light reflection sheen */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.05] to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-full"
        />

        <div className="flex items-center justify-between">
          <MagneticWrap strength={0.4}>
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br p-[1px] ${category.gradient}`}
            >
              <div className="flex h-full w-full items-center justify-center rounded-[15px] bg-[#070b1c] transition-transform duration-500 group-hover:rotate-[8deg]">
                <Icon className="h-6 w-6 text-white" strokeWidth={1.75} aria-hidden="true" />
              </div>
            </div>
          </MagneticWrap>
          <span className="font-mono text-xs tracking-widest text-white/30">
            0{index + 1}
          </span>
        </div>

        <div>
          <h3 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
            {category.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-white/50">
            {category.description}
          </p>
        </div>

        <ul role="list" className="mt-auto flex list-none flex-wrap gap-2">
          {category.techs.map((tech, i) => {
            const TechIcon = tech.icon;
            return (
              <li
                key={tech.name}
                style={{ animationDelay: `${i * 0.3}s` }}
                className="flex animate-[float_4s_ease-in-out_infinite] items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/70 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#00D4FF]/40 hover:bg-[#00D4FF]/[0.07] hover:text-white hover:shadow-[0_0_20px_-6px_rgba(0,212,255,0.6)]"
              >
                <TechIcon className="h-4 w-4" />
                {tech.name}
              </li>
            );
          })}
        </ul>
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Orbiting technology hub                                                   */
/* -------------------------------------------------------------------------- */

function OrbitRing({
  techs,
  radius,
  duration,
  direction = "cw",
  badgeSize="h-14 w-14",
}: {
  techs: string[];
  radius: number;
  duration: number;
  direction?: "cw" | "ccw";
  badgeSize?: string;
}) {
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();
  const ringAnim = direction === "cw" ? "spin-cw" : "spin-ccw";
  const counterAnim = direction === "cw" ? "spin-ccw" : "spin-cw";

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{
        animation: reduceMotion ? "none" : `${ringAnim} ${duration}s linear infinite`,
        animationPlayState: paused ? "paused" : "running",
      }}
    >
      {techs.map((name, i) => {
        const angle = (360 / techs.length) * i;
        const Icon = iconFor(name);
        return (
          <div
            key={name}
            className="absolute left-1/2 top-1/2"
            style={{
              transform: `translate(-50%, -50%) rotate(${angle}deg) translateX(${radius}px)`,
            }}
          >
            <div
              style={{
                animation: reduceMotion
                  ? "none"
                  : `${counterAnim} ${duration}s linear infinite`,
                animationPlayState: paused ? "paused" : "running",
              }}
            >
              <motion.div
                whileHover={reduceMotion ? undefined : { scale: 1.25 }}
                transition={{ type: "spring", stiffness: 320, damping: 15 }}
                title={name}
                className={`flex ${badgeSize} items-center justify-center rounded-xl border border-white/10 bg-[#0a1024]/90 shadow-[0_0_25px_-8px_rgba(0,212,255,0.55)] backdrop-blur-md transition-colors duration-300 hover:border-[#00D4FF]/50 hover:shadow-[0_0_35px_-6px_rgba(0,212,255,0.8)]`}
              >
                <Icon className="h-1/2 w-1/2 text-white/90" strokeWidth={1.5} aria-hidden="true" />
              </motion.div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TechHub() {
  const reduceMotion = useReducedMotion();

  return (
    <div
      role="img"
      aria-label="Axivon technology stack visualized as orbiting tools around a central hub"
      className="relative mx-auto mt-24 flex h-[380px] w-[380px] max-w-full items-center justify-center sm:h-[480px] sm:w-[480px] lg:h-[560px] lg:w-[560px]"
    >
      <div aria-hidden="true" className="absolute inset-[8%] rounded-full border border-white/[0.06]" />
      <div aria-hidden="true" className="absolute inset-[28%] rounded-full border border-white/[0.06]" />

      <OrbitRing techs={ORBIT_OUTER} radius={220} duration={46} direction="ccw" badgeSize="h-12 w-12" />
      <OrbitRing techs={ORBIT_INNER} radius={128} duration={30} direction="cw" badgeSize="h-11 w-11" />

      <motion.div
        initial={reduceMotion ? false : { scale: 0.8, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-[#2563EB] via-[#7C3AED] to-[#00D4FF] p-[2px] shadow-[0_0_80px_-12px_rgba(124,58,237,0.75)] sm:h-40 sm:w-40"
      >
        <div className="flex h-full w-full animate-[pulse-glow_3s_ease-in-out_infinite] flex-col items-center justify-center gap-1 rounded-full bg-[#050816] text-center">
          <BrainCircuit className="h-6 w-6 text-[#00D4FF] sm:h-7 sm:w-7" strokeWidth={1.5} aria-hidden="true" />
          <span className="px-3 text-[10px] font-semibold tracking-[0.15em] text-white sm:text-xs">
            Modern
          </span>
          <span className="px-3 text-[8px] tracking-[0.2em] text-white/50 sm:text-[10px]">
            Development Stack
          </span>
        </div>
      </motion.div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Floating technology cloud                                                 */
/* -------------------------------------------------------------------------- */

function MarqueeCloud() {
  const reduceMotion = useReducedMotion();
  const loopTechs = useMemo(() => [...CLOUD_TECHS, ...CLOUD_TECHS], []);

  return (
    <div className="relative mt-20 overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-[#050816] to-transparent sm:w-32"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-[#050816] to-transparent sm:w-32"
      />
      <ul
        role="list"
        aria-label="Additional technologies used by Axivon Technologies"
        className={`flex w-max list-none gap-3 ${
          reduceMotion ? "" : "animate-[marquee_34s_linear_infinite] hover:[animation-play-state:paused]"
        }`}
      >
        {loopTechs.map((name, i) => {
          const Icon = iconFor(name);
          return (
            <li
              key={`${name}-${i}`}
              className="flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/60 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[#00D4FF]/40 hover:text-white hover:shadow-[0_0_25px_-8px_rgba(0,212,255,0.6)]"
            >
              <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
              {name}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Ambient background layers                                                 */
/* -------------------------------------------------------------------------- */

function AuroraBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute left-1/2 top-[-10%] h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-[#2563EB]/20 blur-[120px] [animation:aurora-drift_18s_ease-in-out_infinite]" />
      <div className="absolute right-[5%] top-[18%] h-[480px] w-[480px] rounded-full bg-[#7C3AED]/20 blur-[120px] [animation:aurora-drift_22s_ease-in-out_infinite_reverse]" />
      <div className="absolute bottom-[-12%] left-[8%] h-[480px] w-[480px] rounded-full bg-[#00D4FF]/15 blur-[130px] [animation:aurora-drift_26s_ease-in-out_infinite]" />
    </div>
  );
}

function GridPattern() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.07] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_30%,black,transparent)]"
    >
      <defs>
        <pattern id="axivon-tech-grid" width="48" height="48" patternUnits="userSpaceOnUse">
          <path d="M 48 0 L 0 0 0 48" fill="none" stroke="white" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#axivon-tech-grid)" />
    </svg>
  );
}

function NoiseOverlay() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.025] mix-blend-overlay [animation:noise-shift_1.4s_steps(4)_infinite]"
    >
      <filter id="axivon-tech-noise">
        <feTurbulence type="fractalNoise" baseFrequency={0.85} numOctaves={2} stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#axivon-tech-noise)" />
    </svg>
  );
}

interface Particle {
  id: number;
  left: number;
  top: number;
  size: number;
  duration: number;
  delay: number;
}

function ParticlesField() {
  const reduceMotion = useReducedMotion();
  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 2 + 1,
        duration: Math.random() * 10 + 10,
        delay: Math.random() * 6,
      })),
    []
  );

  if (reduceMotion) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((particle) => (
        <span
          key={particle.id}
          className="absolute rounded-full bg-[#00D4FF]/40"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            width: particle.size,
            height: particle.size,
            animation: `float-particle ${particle.duration}s ease-in-out infinite`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

function GradientText({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-[length:200%_auto] bg-gradient-to-r from-[#2563EB] via-[#00D4FF] to-[#7C3AED] bg-clip-text text-transparent [animation:gradient-shift_5s_ease_infinite]">
      {children}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main export                                                               */
/* -------------------------------------------------------------------------- */

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
    reduceMotion ? [0, 0] : [-60, 60]
  );

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const springMouseX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springMouseY = useSpring(mouseY, { stiffness: 50, damping: 20 });
  const hubParallaxX = useTransform(springMouseX, [0, 1], [-14, 14]);
  const hubParallaxY = useTransform(springMouseY, [0, 1], [-14, 14]);

  const handleSectionMouseMove = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (reduceMotion) return;
      const rect = event.currentTarget.getBoundingClientRect();
      mouseX.set((event.clientX - rect.left) / rect.width);
      mouseY.set((event.clientY - rect.top) / rect.height);
    },
    [reduceMotion, mouseX, mouseY]
  );

  return (
    <section
      ref={sectionRef}
      id="technology-stack"
      aria-labelledby="tech-stack-heading"
      onMouseMove={handleSectionMouseMove}
      className="relative isolate overflow-hidden bg-[#050816] py-24 sm:py-32 2xl:py-36"
    >
      <motion.div aria-hidden="true" style={{ y: backgroundParallaxY }} className="absolute inset-0">
        <AuroraBackground />
        <GridPattern />
        <NoiseOverlay />
      </motion.div>
      <ParticlesField />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8 2xl:max-w-[1600px]">
        {/* Header */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: EASE_PREMIUM }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-xs font-medium tracking-[0.2em] text-[#00D4FF] backdrop-blur-md">
            <span aria-hidden="true" className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#00D4FF]" />
            TECHNOLOGY ECOSYSTEM
          </span>

          <h2
            id="tech-stack-heading"
            className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            Built With
            <br className="hidden sm:block" />
            <GradientText>Modern Technology</GradientText>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-balance text-base leading-relaxed text-white/55 sm:text-lg">
            At Axivon Technologies, we leverage cutting-edge frameworks, cloud
            infrastructure, AI tools, and modern development practices to build
            scalable, secure, and future-ready digital products.
          </p>
        </motion.div>

        {/* Bento grid */}
        <div className="mt-16 grid grid-cols-1 gap-5 sm:mt-20 sm:gap-6 lg:grid-cols-12">
          {CATEGORIES.map((category, index) => (
            <BentoCard key={category.id} category={category} index={index} />
          ))}
        </div>

        {/* Central technology hub */}
        <motion.div style={{ x: reduceMotion ? 0 : hubParallaxX, y: reduceMotion ? 0 : hubParallaxY }}>
          <TechHub />
        </motion.div>

        {/* Floating technology cloud */}
        <MarqueeCloud />
      </div>

      <style>{`
        @keyframes gradient-shift {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        @keyframes spin-cw {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes spin-ccw {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(-360deg);
          }
        }
        @keyframes aurora-drift {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(40px, -30px) scale(1.1);
          }
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }
        @keyframes float-particle {
          0%,
          100% {
            transform: translate(0, 0);
            opacity: 0.2;
          }
          50% {
            transform: translate(10px, -30px);
            opacity: 0.8;
          }
        }
        @keyframes marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        @keyframes pulse-glow {
          0%,
          100% {
            box-shadow: 0 0 0 0 rgba(0, 212, 255, 0);
          }
          50% {
            box-shadow: 0 0 30px 6px rgba(0, 212, 255, 0.18);
          }
        }
        @keyframes noise-shift {
          0%,
          100% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(-1%, 1%);
          }
          50% {
            transform: translate(1%, -1%);
          }
          75% {
            transform: translate(-1%, -1%);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </section>
  );
}