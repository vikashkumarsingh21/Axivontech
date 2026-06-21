"use client";

/**
 * PortfolioStats.tsx
 * Axivon Technologies — "Our Impact" statistics section.
 *
 * Premium, motion-rich impact section built to sit alongside
 * PortfolioHero / FeaturedProjects / CaseStudies / ClientTestimonials.
 *
 * Stack: Next.js 15 (App Router) · TypeScript · Tailwind CSS · Framer Motion · Lucide React
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import {
  animate,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";
import {
  BadgeCheck,
  Code2,
  Cpu,
  Headphones,
  Rocket,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

interface StatDefinition {
  id: string;
  icon: LucideIcon;
  label: string;
  target: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  /** For ratio-style stats, e.g. 24/7 */
  secondaryTarget?: number;
  divider?: string;
  /** Two-stop gradient used for this card's icon, beam and glow accents */
  accent: readonly [string, string];
}

interface ParticleConfig {
  id: number;
  left: number;
  top: number;
  size: number;
  duration: number;
  delay: number;
}

/* -------------------------------------------------------------------------- */
/*  Static data                                                               */
/* -------------------------------------------------------------------------- */

const STATS: readonly StatDefinition[] = [
  {
    id: "projects",
    icon: Rocket,
    label: "Projects Delivered",
    target: 15,
    suffix: "+",
    accent: ["#2563EB", "#00D4FF"],
  },
  {
    id: "domains",
    icon: Cpu,
    label: "Technology Domains",
    target: 8,
    suffix: "+",
    accent: ["#7C3AED", "#2563EB"],
  },
  {
    id: "satisfaction",
    icon: BadgeCheck,
    label: "Client Satisfaction",
    target: 99,
    suffix: "%",
    accent: ["#00D4FF", "#2563EB"],
  },
  {
    id: "support",
    icon: Headphones,
    label: "Support & Innovation",
    target: 24,
    secondaryTarget: 7,
    divider: "/",
    accent: ["#7C3AED", "#00D4FF"],
  },
  {
    id: "code",
    icon: Code2,
    label: "Lines Of Code",
    target: 50,
    suffix: "K+",
    accent: ["#2563EB", "#7C3AED"],
  },
  {
    id: "quality",
    icon: ShieldCheck,
    label: "Commitment To Quality",
    target: 100,
    suffix: "%",
    accent: ["#00D4FF", "#7C3AED"],
  },
];

const NOISE_BACKGROUND =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/* -------------------------------------------------------------------------- */
/*  Hooks                                                                     */
/* -------------------------------------------------------------------------- */

/** Tracks the user's `prefers-reduced-motion` setting reactively. */
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);

    const handleChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  return reduced;
}

/** Animates a number from 0 to `target` once `shouldStart` becomes true. */
function useCountUp(
  target: number,
  shouldStart: boolean,
  options?: { duration?: number; decimals?: number; reduceMotion?: boolean }
): number {
  const { duration = 2, decimals = 0, reduceMotion = false } = options ?? {};
  const [value, setValue] = useState(0);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!shouldStart || hasStarted.current) return;
    hasStarted.current = true;

    if (reduceMotion) {
      setValue(target);
      return;
    }

    const controls = animate(0, target, {
      duration,
      ease: EASE_OUT,
      onUpdate: (latest) => setValue(Number(latest.toFixed(decimals))),
    });

    return () => controls.stop();
  }, [shouldStart, target, duration, decimals, reduceMotion]);

  return value;
}

/* -------------------------------------------------------------------------- */
/*  Background decoration                                                    */
/* -------------------------------------------------------------------------- */

function AuroraBackground({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <motion.div
        className="absolute -left-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-blue-600/30 blur-[120px]"
        animate={reduceMotion ? undefined : { x: [0, 60, -20, 0], y: [0, 40, -30, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-32 top-1/3 h-[30rem] w-[30rem] rounded-full bg-purple-600/25 blur-[120px]"
        animate={reduceMotion ? undefined : { x: [0, -50, 30, 0], y: [0, -30, 40, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-1/3 h-[26rem] w-[26rem] rounded-full bg-cyan-400/20 blur-[110px]"
        animate={reduceMotion ? undefined : { x: [0, 40, -40, 0], y: [0, -20, 20, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

function PerspectiveGrid() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%]"
      aria-hidden="true"
      style={{
        backgroundImage:
          "linear-gradient(rgba(124,58,237,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.18) 1px, transparent 1px)",
        backgroundSize: "56px 56px",
        transform: "perspective(600px) rotateX(55deg) scale(1.4)",
        transformOrigin: "bottom",
        WebkitMaskImage: "linear-gradient(to top, black, transparent)",
        maskImage: "linear-gradient(to top, black, transparent)",
      }}
    />
  );
}

function FloatingParticles({ reduceMotion }: { reduceMotion: boolean }) {
  const [particles, setParticles] = useState<ParticleConfig[]>([]);

  useEffect(() => {
    if (reduceMotion) return;
    setParticles(
      Array.from({ length: 26 }, (_, id) => ({
        id,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 2 + 1,
        duration: Math.random() * 10 + 12,
        delay: Math.random() * 8,
      }))
    );
  }, [reduceMotion]);

  if (reduceMotion || particles.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          className="absolute rounded-full bg-cyan-300/70"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            width: particle.size,
            height: particle.size,
            boxShadow: "0 0 6px 1px rgba(0,212,255,0.55)",
          }}
          animate={{ y: [0, -26, 0], opacity: [0.1, 0.85, 0.1] }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Stat card                                                                 */
/* -------------------------------------------------------------------------- */

interface StatCardProps {
  stat: StatDefinition;
  index: number;
  isSectionInView: boolean;
  reduceMotion: boolean;
}

function StatCard({ stat, index, isSectionInView, reduceMotion }: StatCardProps) {
  const Icon = stat.icon;
  const cardRef = useRef<HTMLDivElement>(null);

  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);
  const springX = useSpring(pointerX, { stiffness: 150, damping: 18, mass: 0.4 });
  const springY = useSpring(pointerY, { stiffness: 150, damping: 18, mass: 0.4 });

  const rotateX = useTransform(springY, [0, 1], [8, -8]);
  const rotateY = useTransform(springX, [0, 1], [-8, 8]);
  const spotlightX = useTransform(springX, (v) => `${v * 100}%`);
  const spotlightY = useTransform(springY, (v) => `${v * 100}%`);
  const spotlightBackground = useMotionTemplate`radial-gradient(420px circle at ${spotlightX} ${spotlightY}, rgba(255,255,255,0.10), transparent 65%)`;

  const handlePointerMove = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if (reduceMotion || !cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      pointerX.set((event.clientX - rect.left) / rect.width);
      pointerY.set((event.clientY - rect.top) / rect.height);
    },
    [pointerX, pointerY, reduceMotion]
  );

  const resetPointer = useCallback(() => {
    pointerX.set(0.5);
    pointerY.set(0.5);
  }, [pointerX, pointerY]);

  const primaryValue = useCountUp(stat.target, isSectionInView, {
    duration: 1.8 + index * 0.1,
    decimals: stat.decimals,
    reduceMotion,
  });
  const secondaryValue = useCountUp(
    stat.secondaryTarget ?? 0,
    isSectionInView && Boolean(stat.secondaryTarget),
    { duration: 1.4, reduceMotion }
  );

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 36, scale: 0.94 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.7, delay: reduceMotion ? 0 : index * 0.08, ease: EASE_OUT },
    },
  };

  const valueLabel = stat.secondaryTarget
    ? `${stat.target}${stat.divider ?? "/"}${stat.secondaryTarget}`
    : `${stat.prefix ?? ""}${stat.target}${stat.suffix ?? ""}`;

  return (
    <motion.article
      variants={cardVariants}
      role="listitem"
      aria-label={`${stat.label}: ${valueLabel}`}
      tabIndex={0}
      ref={cardRef}
      onMouseMove={handlePointerMove}
      onMouseLeave={resetPointer}
      whileHover={reduceMotion ? undefined : { scale: 1.03 }}
      whileFocus={reduceMotion ? undefined : { scale: 1.03 }}
      style={{ perspective: 1000 }}
      className="group relative rounded-[1.75rem] p-px outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050816]"
    >
      {/* ambient hover glow */}
      <div
        aria-hidden="true"
        className="absolute -inset-3 -z-10 rounded-[2rem] opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-60"
        style={{ background: `linear-gradient(135deg, ${stat.accent[0]}55, ${stat.accent[1]}55)` }}
      />

      {/* animated border beam */}
      <div className="absolute inset-0 overflow-hidden rounded-[1.75rem]" aria-hidden="true">
        <motion.div
          className="absolute inset-[-60%] opacity-40 transition-opacity duration-700 group-hover:opacity-100"
          style={{
            background: `conic-gradient(from 0deg, transparent 0deg, ${stat.accent[0]} 25deg, ${stat.accent[1]} 55deg, transparent 95deg)`,
          }}
          animate={reduceMotion ? undefined : { rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* card body */}
      <motion.div
        style={{
          rotateX: reduceMotion ? 0 : rotateX,
          rotateY: reduceMotion ? 0 : rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative h-full overflow-hidden rounded-[1.74rem] border border-white/[0.06] bg-white/[0.04] px-7 py-8 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:px-8 sm:py-9 lg:px-9 lg:py-10"
      >
        {/* mouse-follow spotlight */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: spotlightBackground }}
        />

        {/* diagonal shine sweep */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -translate-x-[150%] -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-[1100ms] ease-out group-hover:translate-x-[500%]"
        />

        {/* floating holographic ring */}
        <motion.span
          aria-hidden="true"
          className="absolute -right-6 -top-6 h-24 w-24 rounded-full border border-dashed opacity-20"
          style={{ borderColor: stat.accent[1] }}
          animate={reduceMotion ? undefined : { rotate: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        />

        {/* icon */}
        <div
          className="relative mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{
            background: `linear-gradient(135deg, ${stat.accent[0]}22, ${stat.accent[1]}22)`,
            boxShadow: `0 0 30px -6px ${stat.accent[1]}55`,
          }}
        >
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 -z-10 rounded-2xl blur-md"
            style={{ background: stat.accent[1] }}
            animate={reduceMotion ? undefined : { opacity: [0.2, 0.45, 0.2] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <Icon className="h-7 w-7" style={{ color: stat.accent[1] }} strokeWidth={1.75} aria-hidden="true" />
        </div>

        {/* count-up value */}
        <div className="relative mb-2 flex items-baseline gap-1">
          <span className="text-4xl font-bold tracking-tight text-white tabular-nums sm:text-5xl">
            {stat.secondaryTarget ? (
              <>
                {primaryValue}
                {stat.divider}
                {secondaryValue}
              </>
            ) : (
              <>
                {stat.prefix}
                {primaryValue}
                {stat.suffix}
              </>
            )}
          </span>
        </div>

        <p className="relative text-sm font-medium text-white/60 sm:text-[15px]">{stat.label}</p>

        {/* bottom glow trail */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-10 left-1/2 h-20 w-3/4 -translate-x-1/2 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-60"
          style={{ background: stat.accent[1] }}
        />
      </motion.div>
    </motion.article>
  );
}

/* -------------------------------------------------------------------------- */
/*  Section                                                                   */
/* -------------------------------------------------------------------------- */

export default function PortfolioStats() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const reduceMotion = usePrefersReducedMotion();

  const sectionPointerX = useMotionValue(0);
  const sectionPointerY = useMotionValue(0);
  const sectionSpotlight = useMotionTemplate`radial-gradient(900px circle at ${sectionPointerX}px ${sectionPointerY}px, rgba(0,212,255,0.06), transparent 70%)`;

  const handleSectionPointerMove = useCallback(
    (event: ReactMouseEvent<HTMLElement>) => {
      if (reduceMotion || !sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      sectionPointerX.set(event.clientX - rect.left);
      sectionPointerY.set(event.clientY - rect.top);
    },
    [reduceMotion, sectionPointerX, sectionPointerY]
  );

  const headerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
  };
  const headerItemVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT } },
  };
  const gridVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
  };

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleSectionPointerMove}
      aria-label="Axivon Technologies impact statistics"
      className="relative isolate overflow-hidden bg-[#050816] py-28 sm:py-32 lg:py-40"
    >
      <style>{`
        .axv-gradient-text {
          background-image: linear-gradient(90deg, #2563EB, #7C3AED, #00D4FF, #7C3AED, #2563EB);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: axv-gradient-shift 7s linear infinite;
        }
        @keyframes axv-gradient-shift {
          to { background-position: -200% center; }
        }
        @media (prefers-reduced-motion: reduce) {
          .axv-gradient-text { animation: none; }
        }
      `}</style>

      {/* background layers */}
      <div className="absolute inset-0 -z-20 bg-[#050816]" aria-hidden="true" />
      <AuroraBackground reduceMotion={reduceMotion} />
      <PerspectiveGrid />
      <FloatingParticles reduceMotion={reduceMotion} />
      <motion.div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: sectionSpotlight }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.035] mix-blend-overlay"
        style={{ backgroundImage: NOISE_BACKGROUND }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-transparent to-[#050816]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8 2xl:max-w-[90rem] 2xl:px-12">
        {/* header */}
        <motion.div
          variants={headerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.div
            variants={headerItemVariants}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 backdrop-blur-sm"
          >
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
            </span>
            <Sparkles className="h-3.5 w-3.5 text-cyan-300" aria-hidden="true" />
            <span className="text-xs font-semibold tracking-[0.2em] text-white/70">OUR IMPACT</span>
          </motion.div>

          <motion.h2
            variants={headerItemVariants}
            className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl"
          >
            <span className="axv-gradient-text">Numbers</span> That Reflect Our{" "}
            <span className="axv-gradient-text">Commitment To Excellence</span>
          </motion.h2>

          <motion.p
            variants={headerItemVariants}
            className="mt-6 text-base leading-relaxed text-white/60 sm:text-lg"
          >
            At Axivon Technologies, every project is driven by innovation, quality, performance, and
            measurable business outcomes. These numbers represent our dedication to building modern
            digital products that create real-world impact.
          </motion.p>
        </motion.div>

        {/* stats grid */}
        <motion.div
          variants={gridVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          role="list"
          aria-label="Company statistics"
          className="mt-16 grid grid-cols-1 gap-6 sm:mt-20 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8"
        >
          {STATS.map((stat, index) => (
            <StatCard
              key={stat.id}
              stat={stat}
              index={index}
              isSectionInView={isInView}
              reduceMotion={reduceMotion}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}