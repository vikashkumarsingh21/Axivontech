"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
  type Variants,
} from "framer-motion";
import {
  ArrowRight,
  Brain,
  Cloud,
  Code2,
  Rocket,
  Zap,
  type LucideIcon,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Theme tokens — shared across the Axivon careers & insights system  */
/* ------------------------------------------------------------------ */

const COLORS = {
  bg: "#050816",
  blue: "#2563EB",
  purple: "#7C3AED",
  cyan: "#00D4FF",
} as const;

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface BlogHeroProps {
  exploreHref?: string;
  latestHref?: string;
}

interface Topic {
  label: string;
  icon: LucideIcon;
  accent: string;
}

const TOPICS: Topic[] = [
  { label: "AI", icon: Brain, accent: COLORS.cyan },
  { label: "Web Development", icon: Code2, accent: COLORS.blue },
  { label: "Cloud", icon: Cloud, accent: COLORS.purple },
  { label: "Startups", icon: Rocket, accent: COLORS.blue },
  { label: "Automation", icon: Zap, accent: COLORS.cyan },
];

/* ------------------------------------------------------------------ */
/*  Motion variants                                                    */
/* ------------------------------------------------------------------ */

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] },
  },
};

const stageVariants: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 },
  },
};

/* ------------------------------------------------------------------ */
/*  Decorative: animated gradient text                                 */
/* ------------------------------------------------------------------ */

function GradientText({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.span
      className={`bg-[length:200%_auto] bg-clip-text text-transparent ${className}`}
      style={{
        backgroundImage: `linear-gradient(90deg, ${COLORS.blue}, ${COLORS.purple}, ${COLORS.cyan}, ${COLORS.purple}, ${COLORS.blue})`,
      }}
      animate={
        reduceMotion
          ? undefined
          : { backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }
      }
      transition={
        reduceMotion
          ? undefined
          : { duration: 8, repeat: Infinity, ease: "linear" }
      }
    >
      {children}
    </motion.span>
  );
}

/* ------------------------------------------------------------------ */
/*  Decorative: aurora + volumetric lighting                           */
/* ------------------------------------------------------------------ */

function AuroraBackground() {
  const reduceMotion = useReducedMotion();

  const orbs = [
    {
      color: COLORS.blue,
      size: 620,
      top: "-15%",
      left: "0%",
      animate: { x: [0, 50, -20, 0], y: [0, 36, -12, 0] },
      duration: 24,
    },
    {
      color: COLORS.purple,
      size: 720,
      top: "10%",
      left: "55%",
      animate: { x: [0, -60, 24, 0], y: [0, -24, 32, 0] },
      duration: 28,
    },
    {
      color: COLORS.cyan,
      size: 520,
      top: "55%",
      left: "20%",
      animate: { x: [0, 36, -36, 0], y: [0, -28, 18, 0] },
      duration: 21,
    },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden={true}>
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-[140px]"
          style={{
            width: orb.size,
            height: orb.size,
            top: orb.top,
            left: orb.left,
            background: `radial-gradient(circle, ${orb.color}55 0%, ${orb.color}00 70%)`,
          }}
          animate={reduceMotion ? undefined : orb.animate}
          transition={
            reduceMotion
              ? undefined
              : { duration: orb.duration, repeat: Infinity, ease: "easeInOut" }
          }
        />
      ))}

      <div
        className="absolute inset-x-0 top-0 h-[70%] opacity-50 mix-blend-screen"
        style={{
          background: `radial-gradient(55% 60% at 50% 0%, ${COLORS.purple}33 0%, transparent 70%)`,
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Decorative: dynamic perspective grid (parallax-linked)             */
/* ------------------------------------------------------------------ */

function PerspectiveGrid({
  smx,
  smy,
}: {
  smx: MotionValue<number>;
  smy: MotionValue<number>;
}) {
  const reduceMotion = useReducedMotion();
  const gx = useTransform(smx, [-0.5, 0.5], [-10, 10]);
  const gy = useTransform(smy, [-0.5, 0.5], [-6, 6]);

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] overflow-hidden opacity-[0.18]"
      style={{ perspective: "700px" }}
      aria-hidden={true}
    >
      <motion.div
        className="absolute inset-x-[-50%] bottom-0 h-[220%] origin-bottom"
        style={{
          backgroundImage: `linear-gradient(${COLORS.cyan}33 1px, transparent 1px), linear-gradient(90deg, ${COLORS.cyan}33 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
          rotateX: 62,
          x: reduceMotion ? 0 : gx,
          y: reduceMotion ? 0 : gy,
          maskImage: "linear-gradient(to top, black 0%, transparent 85%)",
          WebkitMaskImage: "linear-gradient(to top, black 0%, transparent 85%)",
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Decorative: ambient AI particles (deterministic, SSR-safe)         */
/* ------------------------------------------------------------------ */

function FloatingParticles({ count = 30 }: { count?: number }) {
  const reduceMotion = useReducedMotion();

  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: (i * 31) % 100,
        top: (i * 47) % 100,
        size: 1 + (i % 3),
        duration: 6 + (i % 5),
        delay: (i % 7) * 0.35,
        color: [COLORS.blue, COLORS.purple, COLORS.cyan][i % 3],
      })),
    [count]
  );

  if (reduceMotion) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden={true}>
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 6px ${p.color}`,
          }}
          animate={{ y: [0, -20, 0], opacity: [0.15, 0.85, 0.15] }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Decorative: noise texture overlay                                  */
/* ------------------------------------------------------------------ */

function NoiseOverlay() {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.035]" aria-hidden={true}>
      <filter id="blog-hero-noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#blog-hero-noise)" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Decorative: cursor-follow cinematic spotlight                      */
/* ------------------------------------------------------------------ */

function CursorSpotlight({
  spotX,
  spotY,
}: {
  spotX: MotionValue<number>;
  spotY: MotionValue<number>;
}) {
  const background = useMotionTemplate`radial-gradient(620px circle at ${spotX}px ${spotY}px, ${COLORS.cyan}14, transparent 60%)`;

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-10"
      style={{ background }}
      aria-hidden={true}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Decorative: magnetic button wrapper                                */
/* ------------------------------------------------------------------ */

function MagneticWrap({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 16, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 200, damping: 16, mass: 0.4 });

  const handleMove = useCallback(
    (e: React.MouseEvent<HTMLSpanElement>) => {
      if (reduceMotion || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      x.set((e.clientX - (rect.left + rect.width / 2)) * 0.3);
      y.set((e.clientY - (rect.top + rect.height / 2)) * 0.3);
    },
    [reduceMotion, x, y]
  );

  const handleLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.span
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={reduceMotion ? undefined : { x: springX, y: springY }}
      className="inline-block"
    >
      {children}
    </motion.span>
  );
}

/* ------------------------------------------------------------------ */
/*  Knowledge hub sub-pieces                                           */
/* ------------------------------------------------------------------ */

interface ParallaxLayer {
  x: MotionValue<number>;
  y: MotionValue<number>;
}

function OrbitRing({
  size,
  duration,
  reverse = false,
  dashed = false,
  color,
}: {
  size: number;
  duration: number;
  reverse?: boolean;
  dashed?: boolean;
  color: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        left: "50%",
        top: "50%",
        marginLeft: -size / 2,
        marginTop: -size / 2,
        border: `1px ${dashed ? "dashed" : "solid"} ${color}40`,
      }}
      animate={reduceMotion ? undefined : { rotate: reverse ? -360 : 360 }}
      transition={
        reduceMotion ? undefined : { duration, repeat: Infinity, ease: "linear" }
      }
      aria-hidden={true}
    >
      <span
        className="absolute h-2 w-2 rounded-full"
        style={{
          top: -4,
          left: "50%",
          marginLeft: -4,
          backgroundColor: color,
          boxShadow: `0 0 10px 2px ${color}`,
        }}
      />
    </motion.div>
  );
}

function KnowledgeSphere() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
      {/* outer halo */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{
          width: 260,
          height: 260,
          background: `radial-gradient(circle, ${COLORS.purple}55, transparent 70%)`,
        }}
        animate={reduceMotion ? undefined : { opacity: [0.5, 0.9, 0.5], scale: [1, 1.08, 1] }}
        transition={reduceMotion ? undefined : { duration: 5, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden={true}
      />

      {/* core */}
      <div
        className="relative h-32 w-32 rounded-full border border-white/15 backdrop-blur-md"
        style={{
          background: `radial-gradient(circle at 35% 30%, ${COLORS.cyan}66, ${COLORS.blue}33 45%, transparent 75%)`,
          boxShadow: `0 0 60px -8px ${COLORS.cyan}80, inset 0 0 30px ${COLORS.purple}40`,
        }}
        aria-hidden={true}
      />

      <OrbitRing size={210} duration={18} color={COLORS.cyan} />
      <OrbitRing size={280} duration={26} reverse dashed color={COLORS.blue} />
      <OrbitRing size={350} duration={34} color={COLORS.purple} dashed />
    </div>
  );
}

function HoloCard({
  layer,
  className,
  width,
  accent,
  delay,
}: {
  layer: ParallaxLayer;
  className: string;
  width: number;
  accent: string;
  delay: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={`absolute ${className}`}
      style={reduceMotion ? undefined : { x: layer.x, y: layer.y }}
      aria-hidden={true}
    >
      <motion.div
        animate={reduceMotion ? undefined : { y: [0, -12, 0] }}
        transition={
          reduceMotion ? undefined : { duration: 5 + delay, repeat: Infinity, ease: "easeInOut", delay }
        }
        className="relative rounded-xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur-xl"
        style={{ width, boxShadow: "0 18px 40px -16px rgba(0,0,0,0.6)" }}
      >
        <div
          className="absolute -inset-px -z-10 rounded-xl opacity-60 blur-md"
          style={{ background: `radial-gradient(circle, ${accent}30, transparent 70%)` }}
        />
        <div className="mb-2 flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: accent, boxShadow: `0 0 8px ${accent}` }}
          />
          <span className="h-1.5 w-10 rounded-full bg-white/20" />
        </div>
        <span className="block h-1.5 w-full rounded-full bg-white/10" />
        <span className="mt-1.5 block h-1.5 w-2/3 rounded-full bg-white/10" />
      </motion.div>
    </motion.div>
  );
}

function GlassCube({
  className,
  size,
  duration,
  accent,
}: {
  className: string;
  size: number;
  duration: number;
  accent: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <div className={`absolute ${className}`} style={{ perspective: 400 }} aria-hidden={true}>
      <motion.div
        className="rounded-lg border border-white/10 bg-white/[0.03] backdrop-blur-md"
        style={{
          width: size,
          height: size,
          boxShadow: `0 0 24px -6px ${accent}60`,
          transformStyle: "preserve-3d",
        }}
        animate={
          reduceMotion ? undefined : { rotateX: [0, 360], rotateY: [0, 360] }
        }
        transition={
          reduceMotion ? undefined : { duration, repeat: Infinity, ease: "linear" }
        }
      />
    </div>
  );
}

function TopicPill({
  topic,
  className,
  layer,
  delay,
}: {
  topic: Topic;
  className: string;
  layer: ParallaxLayer;
  delay: number;
}) {
  const reduceMotion = useReducedMotion();
  const Icon = topic.icon;

  return (
    <motion.div
      className={`absolute ${className}`}
      style={reduceMotion ? undefined : { x: layer.x, y: layer.y }}
      aria-hidden={true}
    >
      <motion.div
        animate={reduceMotion ? undefined : { y: [0, -10, 0] }}
        transition={
          reduceMotion ? undefined : { duration: 4.5 + delay, repeat: Infinity, ease: "easeInOut", delay }
        }
        className="flex items-center gap-1.5 whitespace-nowrap rounded-full border bg-white/[0.04] px-3 py-1.5 backdrop-blur-xl"
        style={{ borderColor: `${topic.accent}55`, boxShadow: `0 0 20px -10px ${topic.accent}` }}
      >
        <Icon className="h-3.5 w-3.5" style={{ color: topic.accent }} strokeWidth={1.75} />
        <span className="text-xs font-medium text-white/85">{topic.label}</span>
      </motion.div>
    </motion.div>
  );
}

function NeuralConnections() {
  const reduceMotion = useReducedMotion();

  const lines = [
    "M 60,80 C 150,140 220,170 320,260",
    "M 480,60 C 400,130 360,180 320,260",
    "M 60,420 C 160,360 230,320 320,260",
    "M 470,440 C 390,380 350,320 320,260",
    "M 320,40 C 320,120 320,180 320,260",
  ];

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full opacity-50"
      viewBox="0 0 560 500"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden={true}
    >
      <defs>
        <linearGradient id="neural-line" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={COLORS.blue} stopOpacity="0" />
          <stop offset="50%" stopColor={COLORS.cyan} stopOpacity="0.7" />
          <stop offset="100%" stopColor={COLORS.purple} stopOpacity="0" />
        </linearGradient>
      </defs>
      {lines.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          fill="none"
          stroke="url(#neural-line)"
          strokeWidth={1}
          strokeDasharray="6 10"
          animate={reduceMotion ? undefined : { strokeDashoffset: [0, -64] }}
          transition={
            reduceMotion ? undefined : { duration: 5, repeat: Infinity, ease: "linear", delay: i * 0.3 }
          }
        />
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Knowledge hub — full right-side visual                             */
/* ------------------------------------------------------------------ */

function KnowledgeHub({ smx, smy }: { smx: MotionValue<number>; smy: MotionValue<number> }) {
  const layerFar: ParallaxLayer = {
    x: useTransform(smx, [-0.5, 0.5], [-10, 10]),
    y: useTransform(smy, [-0.5, 0.5], [-8, 8]),
  };
  const layerMid: ParallaxLayer = {
    x: useTransform(smx, [-0.5, 0.5], [-22, 22]),
    y: useTransform(smy, [-0.5, 0.5], [-16, 16]),
  };
  const layerNear: ParallaxLayer = {
    x: useTransform(smx, [-0.5, 0.5], [-34, 34]),
    y: useTransform(smy, [-0.5, 0.5], [-26, 26]),
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stageVariants}
      className="relative mx-auto h-[420px] w-full max-w-md sm:h-[480px] sm:max-w-lg lg:h-[560px] lg:max-w-none xl:h-[620px]"
      style={{ perspective: "1400px" }}
      role="img"
      aria-label="A futuristic visualization of an Axivon technology knowledge hub, with floating article panels, a glowing AI sphere, and a connected network of insight nodes."
    >
      <NeuralConnections />

      <GlassCube className="left-[8%] top-[14%]" size={46} duration={14} accent={COLORS.blue} />
      <GlassCube className="bottom-[16%] right-[10%]" size={36} duration={18} accent={COLORS.cyan} />
      <GlassCube className="bottom-[8%] left-[18%]" size={28} duration={12} accent={COLORS.purple} />

      <KnowledgeSphere />

      <HoloCard
        layer={layerNear}
        className="left-[2%] top-[6%]"
        width={148}
        accent={COLORS.blue}
        delay={0.1}
      />
      <HoloCard
        layer={layerMid}
        className="right-[0%] top-[20%]"
        width={132}
        accent={COLORS.cyan}
        delay={0.6}
      />
      <HoloCard
        layer={layerNear}
        className="bottom-[4%] left-[6%]"
        width={140}
        accent={COLORS.purple}
        delay={1.1}
      />

      <TopicPill topic={TOPICS[0]} layer={layerFar} className="left-[20%] top-[2%]" delay={0} />
      <TopicPill topic={TOPICS[1]} layer={layerMid} className="right-[14%] top-[4%]" delay={0.5} />
      <TopicPill topic={TOPICS[2]} layer={layerFar} className="-right-[2%] bottom-[28%]" delay={1} />
      <TopicPill topic={TOPICS[3]} layer={layerMid} className="bottom-[0%] right-[24%]" delay={1.5} />
      <TopicPill topic={TOPICS[4]} layer={layerFar} className="left-[0%] bottom-[14%]" delay={2} />

      <FloatingParticles count={18} />
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main export                                                        */
/* ------------------------------------------------------------------ */

export default function BlogHero({
  exploreHref = "/blog",
  latestHref = "/blog#latest",
}: BlogHeroProps) {
  const reduceMotion = useReducedMotion();

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 60, damping: 20, mass: 0.4 });
  const smy = useSpring(my, { stiffness: 60, damping: 20, mass: 0.4 });

  const spotX = useMotionValue(0);
  const spotY = useMotionValue(0);
  const [spotlightReady, setSpotlightReady] = useState(false);

  const handlePointerMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (reduceMotion) return;
      const rect = e.currentTarget.getBoundingClientRect();
      mx.set((e.clientX - rect.left) / rect.width - 0.5);
      my.set((e.clientY - rect.top) / rect.height - 0.5);
      spotX.set(e.clientX - rect.left);
      spotY.set(e.clientY - rect.top);
      if (!spotlightReady) setSpotlightReady(true);
    },
    [reduceMotion, mx, my, spotX, spotY, spotlightReady]
  );

  const handlePointerLeave = useCallback(() => {
    mx.set(0);
    my.set(0);
  }, [mx, my]);

  return (
    <section
      aria-label="Axivon Insights — technology blog hero"
      onMouseMove={handlePointerMove}
      onMouseLeave={handlePointerLeave}
      className="relative isolate overflow-hidden bg-[#050816] px-6 py-28 sm:py-32 lg:px-8"
    >
      <AuroraBackground />
      <PerspectiveGrid smx={smx} smy={smy} />
      <FloatingParticles />
      <NoiseOverlay />
      {!reduceMotion && spotlightReady && <CursorSpotlight spotX={spotX} spotY={spotY} />}

      <div className="relative mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2 lg:gap-12 xl:gap-20">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="text-center lg:text-left"
        >
          <motion.span
            variants={fadeUpVariants}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-white/70 backdrop-blur-sm"
          >
            <motion.span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: COLORS.cyan, boxShadow: `0 0 8px ${COLORS.cyan}` }}
              animate={reduceMotion ? undefined : { opacity: [0.4, 1, 0.4] }}
              transition={reduceMotion ? undefined : { duration: 2, repeat: Infinity, ease: "easeInOut" }}
              aria-hidden={true}
            />
            Axivon Insights
          </motion.span>

          <motion.h1
            variants={fadeUpVariants}
            className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            <span className="block">Ideas,</span>
            <span className="block">
              <GradientText>Innovation</GradientText> &amp;
            </span>
            <GradientText className="block">Technology Insights</GradientText>
          </motion.h1>

          <motion.p
            variants={fadeUpVariants}
            className="mx-auto mt-6 max-w-xl text-balance text-base leading-relaxed text-white/60 sm:text-lg lg:mx-0"
          >
            Explore expert insights, technology trends, development guides, AI
            innovations, startup strategies, and digital transformation ideas
            from Axivon Technologies.
          </motion.p>

          <motion.div
            variants={fadeUpVariants}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start"
          >
            <MagneticWrap>
              <Link
                href={exploreHref}
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full px-7 py-3.5 text-sm font-semibold text-white outline-none transition-transform duration-300 focus-visible:ring-2 focus-visible:ring-[#00D4FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050816]"
                style={{
                  background: `linear-gradient(135deg, ${COLORS.blue}, ${COLORS.purple})`,
                  boxShadow: `0 8px 30px -8px ${COLORS.purple}90`,
                }}
              >
                <span
                  className="absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{ background: `linear-gradient(135deg, ${COLORS.purple}, ${COLORS.cyan})` }}
                  aria-hidden={true}
                />
                Explore Articles
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden={true}
                />
              </Link>
            </MagneticWrap>

            <MagneticWrap>
              <Link
                href={latestHref}
                className="group relative inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-7 py-3.5 text-sm font-semibold text-white/90 outline-none backdrop-blur-sm transition-colors duration-300 hover:border-white/30 hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-[#00D4FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050816]"
              >
                Latest Insights
              </Link>
            </MagneticWrap>
          </motion.div>

          <p className="sr-only">
            Featured topics: AI, Web Development, Cloud, Startups, and Automation.
          </p>
        </motion.div>

        <KnowledgeHub smx={smx} smy={smy} />
      </div>
    </section>
  );
}