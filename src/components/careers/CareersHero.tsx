"use client";

import { useRef, useState, useCallback, type ReactNode, type MouseEvent as ReactMouseEvent } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import {
  Rocket,
  ArrowRight,
  PlayCircle,
  Activity,
  Briefcase,
  Users,
  Sparkles,
  Globe2,
  TrendingUp,
  Code2,
  ServerCog,
  BrainCircuit,
  PenTool,
  CloudCog,
  type LucideIcon,
} from "lucide-react";

/**
 * CareersHero.tsx — Axivon Technologies
 * Next.js 15 / TypeScript / Tailwind CSS / Framer Motion / Lucide React
 *
 * A cinematic, futuristic careers hero matching the visual bar set by
 * Hero.tsx, AboutHero.tsx and PortfolioHero.tsx.
 */

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

interface DashboardMetric {
  id: string;
  label: string;
  value: string;
  delta?: string;
  icon: LucideIcon;
  accent: string;
}

interface OpenPosition {
  id: string;
  title: string;
  type: string;
  icon: LucideIcon;
}

/* -------------------------------------------------------------------------- */
/*  Static data                                                               */
/* -------------------------------------------------------------------------- */

const DASHBOARD_METRICS: DashboardMetric[] = [
  { id: "pipeline", label: "Active Hiring Pipeline", value: "32", delta: "+8 this week", icon: Activity, accent: "#00D4FF" },
  { id: "openings", label: "Open Positions", value: "14", delta: "5 new", icon: Briefcase, accent: "#2563EB" },
  { id: "applications", label: "Applications Received", value: "2,481", delta: "+312 today", icon: Users, accent: "#7C3AED" },
  { id: "matching", label: "AI Talent Matching", value: "97.2%", delta: "accuracy", icon: Sparkles, accent: "#00D4FF" },
  { id: "locations", label: "Global Team Locations", value: "18", delta: "countries", icon: Globe2, accent: "#2563EB" },
  { id: "growth", label: "Team Growth Metrics", value: "+64%", delta: "YoY", icon: TrendingUp, accent: "#7C3AED" },
];

const OPEN_POSITIONS: OpenPosition[] = [
  { id: "frontend", title: "Frontend Developer", type: "Full-time · Remote", icon: Code2 },
  { id: "backend", title: "Backend Developer", type: "Full-time · Remote", icon: ServerCog },
  { id: "ai", title: "AI Engineer", type: "Full-time · Hybrid", icon: BrainCircuit },
  { id: "design", title: "UI/UX Designer", type: "Full-time · Remote", icon: PenTool },
  { id: "cloud", title: "Cloud Engineer", type: "Full-time · Hybrid", icon: CloudCog },
];

/* -------------------------------------------------------------------------- */
/*  Motion variants                                                          */
/* -------------------------------------------------------------------------- */

const EASE = [0.16, 1, 0.3, 1] as const;

const heroContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 28, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.75, ease: EASE },
  },
};

/* -------------------------------------------------------------------------- */
/*  Decorative background layers                                             */
/* -------------------------------------------------------------------------- */

function AuroraLayer({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -top-48 -left-40 h-[40rem] w-[40rem] rounded-full blur-[130px]"
        style={{ background: "radial-gradient(circle, rgba(37,99,235,0.4), transparent 70%)" }}
        animate={reduceMotion ? undefined : { x: [0, 70, 0], y: [0, 50, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/4 -right-40 h-[36rem] w-[36rem] rounded-full blur-[130px]"
        style={{ background: "radial-gradient(circle, rgba(124,58,237,0.38), transparent 70%)" }}
        animate={reduceMotion ? undefined : { x: [0, -60, 0], y: [0, -40, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-10rem] left-1/3 h-[34rem] w-[34rem] rounded-full blur-[130px]"
        style={{ background: "radial-gradient(circle, rgba(0,212,255,0.28), transparent 70%)" }}
        animate={reduceMotion ? undefined : { x: [0, 50, 0], y: [0, -30, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

function DynamicGrid() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 opacity-[0.08]"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)",
        backgroundSize: "58px 58px",
        maskImage: "radial-gradient(ellipse 75% 65% at 50% 25%, black, transparent)",
      }}
    />
  );
}

function NoiseTexture() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.05] mix-blend-overlay"
    >
      <filter id="axv-noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#axv-noise)" />
    </svg>
  );
}

function FloatingParticles({ reduceMotion }: { reduceMotion: boolean }) {
  const particles = [
    { left: 6, top: 18, size: 3, hue: "#00D4FF", dur: 12 },
    { left: 14, top: 62, size: 2, hue: "#2563EB", dur: 16 },
    { left: 22, top: 36, size: 2.5, hue: "#7C3AED", dur: 14 },
    { left: 38, top: 80, size: 2, hue: "#00D4FF", dur: 18 },
    { left: 48, top: 12, size: 3, hue: "#7C3AED", dur: 13 },
    { left: 62, top: 54, size: 2, hue: "#2563EB", dur: 17 },
    { left: 74, top: 28, size: 2.5, hue: "#00D4FF", dur: 15 },
    { left: 84, top: 70, size: 3, hue: "#7C3AED", dur: 19 },
    { left: 92, top: 40, size: 2, hue: "#2563EB", dur: 14 },
    { left: 58, top: 88, size: 2, hue: "#00D4FF", dur: 16 },
  ];

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      {particles.map((p, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            background: p.hue,
            boxShadow: `0 0 10px 2px ${p.hue}`,
          }}
          animate={reduceMotion ? undefined : { y: [0, -30, 0], opacity: [0.2, 0.9, 0.2] }}
          transition={{ duration: p.dur, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
        />
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Animated gradient heading text                                           */
/* -------------------------------------------------------------------------- */

function GradientWord({ children }: { children: ReactNode }) {
  return (
    <motion.span
      className="relative inline-block bg-clip-text text-transparent"
      style={{
        backgroundImage: "linear-gradient(110deg, #00D4FF, #2563EB 35%, #7C3AED 65%, #00D4FF)",
        backgroundSize: "300% 100%",
      }}
      animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
    >
      {children}
    </motion.span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Magnetic button                                                          */
/* -------------------------------------------------------------------------- */

function MagneticButton({
  children,
  href,
  variant = "primary",
  ariaLabel,
}: {
  children: ReactNode;
  href: string;
  variant?: "primary" | "secondary";
  ariaLabel: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });

  const handleMove = useCallback(
    (e: ReactMouseEvent<HTMLAnchorElement>) => {
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;
      const relX = e.clientX - (rect.left + rect.width / 2);
      const relY = e.clientY - (rect.top + rect.height / 2);
      x.set(relX * 0.25);
      y.set(relY * 0.35);
    },
    [x, y]
  );

  const handleLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  const isPrimary = variant === "primary";

  return (
    <motion.a
      ref={ref}
      href={href}
      aria-label={ariaLabel}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ x: sx, y: sy }}
      whileTap={{ scale: 0.96 }}
      className={[
        "group relative inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold outline-none transition-shadow duration-300",
        "focus-visible:ring-2 focus-visible:ring-[#00D4FF]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050816]",
        isPrimary
          ? "text-white shadow-[0_10px_40px_-8px_rgba(37,99,235,0.65)] hover:shadow-[0_16px_55px_-8px_rgba(124,58,237,0.75)]"
          : "border border-white/15 bg-white/[0.04] text-white/90 backdrop-blur-md hover:border-[#00D4FF]/40 hover:bg-white/[0.08]",
      ].join(" ")}
    >
      {isPrimary && (
        <span
          aria-hidden
          className="absolute inset-0 -z-10 rounded-full"
          style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}
        />
      )}
      {isPrimary && (
        <span
          aria-hidden
          className="absolute inset-0 -z-10 -translate-x-full rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full"
        />
      )}
      {children}
    </motion.a>
  );
}

/* -------------------------------------------------------------------------- */
/*  Border beam (animated conic ring used on cards / panels)                 */
/* -------------------------------------------------------------------------- */

function BorderBeam({ active, speed = 3.5 }: { active: boolean; speed?: number }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 rounded-2xl"
      style={{
        background: "conic-gradient(from 0deg, #00D4FF, #2563EB, #7C3AED, #00D4FF)",
        opacity: active ? 0.85 : 0,
        padding: 1.5,
        WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
        WebkitMaskComposite: "xor",
        maskComposite: "exclude",
        animation: active ? `axv-careers-spin ${speed}s linear infinite` : undefined,
        transition: "opacity 0.4s ease",
      }}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  Floating job mini-card                                                   */
/* -------------------------------------------------------------------------- */

function JobCard({ position, className, floatDelay }: { position: OpenPosition; className?: string; floatDelay: number }) {
  const [hovered, setHovered] = useState(false);
  const Icon = position.icon;
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={["relative w-[208px] flex-none rounded-xl", className].filter(Boolean).join(" ")}
      animate={reduceMotion ? undefined : { y: [0, -10, 0] }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: floatDelay }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ scale: 1.04 }}
    >
      <BorderBeam active={hovered} speed={2.6} />
      <div className="absolute inset-0 rounded-xl border border-white/10" />
      <div
        className={[
          "relative flex items-center gap-3 rounded-xl bg-white/[0.05] px-4 py-3.5 backdrop-blur-xl transition-shadow duration-300",
          hovered ? "shadow-[0_0_30px_-4px_rgba(0,212,255,0.55)]" : "shadow-[0_8px_24px_rgba(0,0,0,0.3)]",
        ].join(" ")}
      >
        <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-gradient-to-br from-[#2563EB]/30 to-[#7C3AED]/30 text-[#00D4FF]">
          <Icon className="h-4.5 w-4.5" strokeWidth={2} aria-hidden />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[13px] font-semibold text-white/90">{position.title}</span>
          <span className="block truncate text-[11px] text-white/45">{position.type}</span>
        </span>
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Dashboard metric card                                                    */
/* -------------------------------------------------------------------------- */

function MetricCard({ metric, index }: { metric: DashboardMetric; index: number }) {
  const Icon = metric.icon;
  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      className="relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full blur-2xl"
        style={{ background: metric.accent, opacity: 0.18 }}
      />
      <div className="flex items-center justify-between">
        <span
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ background: `${metric.accent}22`, color: metric.accent }}
        >
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        {metric.delta && (
          <span className="text-[10px] font-medium text-white/40">{metric.delta}</span>
        )}
      </div>
      <p className="mt-3 text-xl font-semibold tracking-tight text-white">{metric.value}</p>
      <p className="mt-1 text-[11px] leading-snug text-white/50">{metric.label}</p>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Recruitment dashboard (right-side hero visual)                           */
/* -------------------------------------------------------------------------- */

function RecruitmentDashboard() {
  const reduceMotion = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);

  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 120, damping: 16 });
  const sry = useSpring(ry, { stiffness: 120, damping: 16 });

  const handleMove = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      if (reduceMotion) return;
      const rect = wrapRef.current?.getBoundingClientRect();
      if (!rect) return;
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      rx.set(py * -8);
      ry.set(px * 10);
    },
    [reduceMotion, rx, ry]
  );

  const handleLeave = useCallback(() => {
    rx.set(0);
    ry.set(0);
  }, [rx, ry]);

  return (
    <div className="relative mx-auto w-full max-w-[560px]" style={{ perspective: 1600 }}>
      <motion.div
        ref={wrapRef}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        style={{ rotateX: srx, rotateY: sry, transformStyle: "preserve-3d" }}
        animate={reduceMotion ? undefined : { y: [0, -12, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="relative"
      >
        <BorderBeam active speed={6} />
        <div className="absolute inset-0 rounded-2xl border border-white/10" />

        <div className="relative overflow-hidden rounded-2xl bg-white/[0.045] p-5 shadow-[0_30px_90px_-20px_rgba(37,99,235,0.55)] backdrop-blur-2xl sm:p-6">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00D4FF]/70 to-transparent"
          />

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Talent Intelligence</p>
              <p className="text-[11px] text-white/45">Recruitment dashboard · Live</p>
            </div>
            <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-medium text-[#00D4FF]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00D4FF] opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#00D4FF]" />
              </span>
              Live
            </span>
          </div>

          {/* Metrics grid */}
          <motion.div
            variants={heroContainer}
            initial="hidden"
            animate="visible"
            className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3"
          >
            {DASHBOARD_METRICS.map((metric, i) => (
              <MetricCard key={metric.id} metric={metric} index={i} />
            ))}
          </motion.div>

          {/* Mini growth bars */}
          <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium text-white/55">Team growth — last 6 months</p>
              <span className="text-[11px] font-semibold text-[#00D4FF]">+64%</span>
            </div>
            <div className="mt-3 flex items-end gap-2">
              {[38, 52, 46, 64, 78, 92].map((h, i) => (
                <motion.span
                  key={i}
                  className="flex-1 rounded-t-md"
                  style={{
                    background: "linear-gradient(180deg, #00D4FF, #2563EB 60%, #7C3AED)",
                    height: `${h * 0.55}px`,
                  }}
                  initial={{ scaleY: 0, opacity: 0 }}
                  animate={{ scaleY: 1, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 + i * 0.08, ease: EASE }}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main component                                                           */
/* -------------------------------------------------------------------------- */

export default function CareersHero() {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  // Parallax driven by pointer position across the whole hero.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const parallaxX = useSpring(px, { stiffness: 60, damping: 20 });
  const parallaxY = useSpring(py, { stiffness: 60, damping: 20 });
  const orbX = useTransform(parallaxX, (v) => v * 24);
  const orbY = useTransform(parallaxY, (v) => v * 24);
  const orbXInverse = useTransform(parallaxX, (v) => v * -18);
  const orbYInverse = useTransform(parallaxY, (v) => v * -18);

  const handleSectionMove = useCallback(
    (e: ReactMouseEvent<HTMLElement>) => {
      if (reduceMotion) return;
      const rect = sectionRef.current?.getBoundingClientRect();
      if (!rect) return;
      px.set((e.clientX - rect.left) / rect.width - 0.5);
      py.set((e.clientY - rect.top) / rect.height - 0.5);
    },
    [reduceMotion, px, py]
  );

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleSectionMove}
      aria-label="Careers at Axivon Technologies — hero"
      className="relative isolate w-full overflow-hidden px-4 py-24 sm:px-6 sm:py-28 lg:px-10 lg:py-32 2xl:px-20"
      style={{ background: "#050816" }}
    >
      <style>{`
        @keyframes axv-careers-spin { to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) {
          .axv-careers-hero * { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; }
        }
      `}</style>

      <AuroraLayer reduceMotion={!!reduceMotion} />
      <DynamicGrid />
      <FloatingParticles reduceMotion={!!reduceMotion} />
      <NoiseTexture />

      {/* Parallax gradient orbs */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-[6%] top-[18%] h-72 w-72 rounded-full blur-[100px] sm:h-96 sm:w-96"
        style={{ background: "radial-gradient(circle, rgba(0,212,255,0.3), transparent 70%)", x: orbX, y: orbY }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute bottom-[12%] right-[8%] h-80 w-80 rounded-full blur-[110px] sm:h-[26rem] sm:w-[26rem]"
        style={{ background: "radial-gradient(circle, rgba(124,58,237,0.28), transparent 70%)", x: orbXInverse, y: orbYInverse }}
      />

      <div className="relative mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-12 2xl:max-w-[1600px]">
        {/* LEFT — content */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={heroContainer}
          className="relative z-10 mx-auto max-w-xl text-center lg:mx-0 lg:text-left"
        >
          <motion.span
            variants={fadeUp}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#00D4FF] backdrop-blur-md"
          >
            <Rocket className="h-3.5 w-3.5" aria-hidden />
            We Are Hiring
          </motion.span>

          <motion.h1
            variants={fadeUp}
            className="mt-6 text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.4rem]"
          >
            Build The <GradientWord>Future</GradientWord>
            <br />
            With <GradientWord>Axivon Technologies</GradientWord>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-white/60 sm:text-lg lg:mx-0"
          >
            Join a team of innovators, engineers, designers, and problem solvers
            building next-generation digital products, AI solutions, and
            scalable technology platforms for businesses worldwide.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-9 flex flex-col items-center gap-4 sm:flex-row lg:justify-start"
          >
            <MagneticButton href="#open-positions" variant="primary" ariaLabel="Explore open opportunities at Axivon Technologies">
              Explore Opportunities
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
            </MagneticButton>
            <MagneticButton href="#life-at-axivon" variant="secondary" ariaLabel="See life at Axivon Technologies">
              <PlayCircle className="h-4 w-4 text-[#00D4FF]" aria-hidden />
              Life At Axivon
            </MagneticButton>
          </motion.div>

          {/* Floating job cards row (mobile / tablet) */}
          <motion.div
            variants={fadeUp}
            className="mt-12 flex gap-3 overflow-x-auto pb-2 lg:hidden"
            role="list"
            aria-label="Featured open positions"
          >
            {OPEN_POSITIONS.map((p, i) => (
              <div role="listitem" key={p.id}>
                <JobCard position={p} floatDelay={i * 0.4} />
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* RIGHT — dashboard visual */}
        <div className="relative z-10 mt-4 lg:mt-0">
          <RecruitmentDashboard />

          {/* Floating job cards anchored around the dashboard (desktop only) */}
          <div
            className="pointer-events-none absolute inset-0 hidden lg:block"
            role="list"
            aria-label="Featured open positions"
          >
            <div className="pointer-events-auto absolute -left-16 top-6" role="listitem">
              <JobCard position={OPEN_POSITIONS[0]} floatDelay={0} />
            </div>
            <div className="pointer-events-auto absolute -right-12 top-24" role="listitem">
              <JobCard position={OPEN_POSITIONS[1]} floatDelay={0.6} />
            </div>
            <div className="pointer-events-auto absolute -left-10 bottom-16" role="listitem">
              <JobCard position={OPEN_POSITIONS[2]} floatDelay={1.2} />
            </div>
            <div className="pointer-events-auto absolute -right-16 bottom-4" role="listitem">
              <JobCard position={OPEN_POSITIONS[3]} floatDelay={1.8} />
            </div>
            <div className="pointer-events-auto absolute left-1/2 -bottom-10 -translate-x-1/2" role="listitem">
              <JobCard position={OPEN_POSITIONS[4]} floatDelay={2.4} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}