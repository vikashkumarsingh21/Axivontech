"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
  Calendar,
  ImageIcon,
  Lock,
  Sparkles,
  Tag,
  User,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Theme tokens — shared across the Axivon design system              */
/* ------------------------------------------------------------------ */

const COLORS = {
  bg: "#050816",
  blue: "#2563EB",
  purple: "#7C3AED",
  cyan: "#00D4FF",
} as const;

/* ------------------------------------------------------------------ */
/*  Future CMS data contract                                           */
/*  When the Axivon Admin Panel ships, pass a populated `article`      */
/*  prop matching this shape and the placeholder is replaced           */
/*  automatically — no markup changes required.                        */
/* ------------------------------------------------------------------ */

export interface FeaturedArticleData {
  title: string;
  excerpt: string;
  image: string;
  author: string;
  publishedDate: string;
  slug: string;
  category: string;
  featured: boolean;
}

interface FeaturedArticleProps {
  article?: FeaturedArticleData;
}

/* ------------------------------------------------------------------ */
/*  Motion variants                                                    */
/* ------------------------------------------------------------------ */

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

const stageVariants: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 },
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
      size: 560,
      top: "-12%",
      left: "2%",
      animate: { x: [0, 44, -18, 0], y: [0, 30, -10, 0] },
      duration: 23,
    },
    {
      color: COLORS.purple,
      size: 640,
      top: "20%",
      left: "58%",
      animate: { x: [0, -52, 20, 0], y: [0, -20, 28, 0] },
      duration: 27,
    },
    {
      color: COLORS.cyan,
      size: 460,
      top: "60%",
      left: "12%",
      animate: { x: [0, 30, -30, 0], y: [0, -24, 16, 0] },
      duration: 20,
    },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden={true}>
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-[130px]"
          style={{
            width: orb.size,
            height: orb.size,
            top: orb.top,
            left: orb.left,
            background: `radial-gradient(circle, ${orb.color}50 0%, ${orb.color}00 70%)`,
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
        className="absolute inset-x-0 top-0 h-[60%] opacity-40 mix-blend-screen"
        style={{
          background: `radial-gradient(55% 55% at 50% 0%, ${COLORS.blue}30 0%, transparent 70%)`,
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Decorative: dynamic perspective grid (parallax-linked)             */
/* ------------------------------------------------------------------ */

function PerspectiveGrid({ smx, smy }: { smx: MotionValue<number>; smy: MotionValue<number> }) {
  const reduceMotion = useReducedMotion();
  const gx = useTransform(smx, [-0.5, 0.5], [-10, 10]);
  const gy = useTransform(smy, [-0.5, 0.5], [-6, 6]);

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 h-[50%] overflow-hidden opacity-[0.16]"
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
/*  Decorative: ambient particles (deterministic, SSR-safe)            */
/* ------------------------------------------------------------------ */

function FloatingParticles({ count = 26 }: { count?: number }) {
  const reduceMotion = useReducedMotion();

  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: (i * 33) % 100,
        top: (i * 49) % 100,
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
          animate={{ y: [0, -18, 0], opacity: [0.15, 0.8, 0.15] }}
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
      <filter id="featured-article-noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#featured-article-noise)" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Decorative: cursor-follow cinematic spotlight                      */
/* ------------------------------------------------------------------ */

function CursorSpotlight({ spotX, spotY }: { spotX: MotionValue<number>; spotY: MotionValue<number> }) {
  const background = useMotionTemplate`radial-gradient(560px circle at ${spotX}px ${spotY}px, ${COLORS.cyan}12, transparent 60%)`;

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-10"
      style={{ background }}
      aria-hidden={true}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Knowledge-network sub-pieces (right side)                          */
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
      transition={reduceMotion ? undefined : { duration, repeat: Infinity, ease: "linear" }}
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
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{
          width: 230,
          height: 230,
          background: `radial-gradient(circle, ${COLORS.purple}55, transparent 70%)`,
        }}
        animate={reduceMotion ? undefined : { opacity: [0.5, 0.9, 0.5], scale: [1, 1.08, 1] }}
        transition={reduceMotion ? undefined : { duration: 5, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden={true}
      />

      <div
        className="relative h-28 w-28 rounded-full border border-white/15 backdrop-blur-md"
        style={{
          background: `radial-gradient(circle at 35% 30%, ${COLORS.cyan}66, ${COLORS.blue}33 45%, transparent 75%)`,
          boxShadow: `0 0 55px -8px ${COLORS.cyan}80, inset 0 0 28px ${COLORS.purple}40`,
        }}
        aria-hidden={true}
      />

      <OrbitRing size={185} duration={17} color={COLORS.cyan} />
      <OrbitRing size={245} duration={25} reverse dashed color={COLORS.blue} />
      <OrbitRing size={305} duration={32} color={COLORS.purple} dashed />
    </div>
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
          boxShadow: `0 0 22px -6px ${accent}60`,
          transformStyle: "preserve-3d",
        }}
        animate={reduceMotion ? undefined : { rotateX: [0, 360], rotateY: [0, 360] }}
        transition={reduceMotion ? undefined : { duration, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

function FloatingContentPanel({
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
        transition={reduceMotion ? undefined : { duration: 5 + delay, repeat: Infinity, ease: "easeInOut", delay }}
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

function KnowledgeNetworkLines() {
  const reduceMotion = useReducedMotion();

  const lines = [
    "M 40,60 C 120,110 180,140 260,210",
    "M 420,50 C 350,110 310,150 260,210",
    "M 40,360 C 130,310 190,270 260,210",
    "M 410,370 C 340,320 300,260 260,210",
  ];

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full opacity-50"
      viewBox="0 0 460 420"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden={true}
    >
      <defs>
        <linearGradient id="featured-neural-line" x1="0%" y1="0%" x2="100%" y2="100%">
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
          stroke="url(#featured-neural-line)"
          strokeWidth={1}
          strokeDasharray="6 10"
          animate={reduceMotion ? undefined : { strokeDashoffset: [0, -64] }}
          transition={reduceMotion ? undefined : { duration: 5, repeat: Infinity, ease: "linear", delay: i * 0.3 }}
        />
      ))}
    </svg>
  );
}

function ContentNetwork({ smx, smy }: { smx: MotionValue<number>; smy: MotionValue<number> }) {
  const layerFar: ParallaxLayer = {
    x: useTransform(smx, [-0.5, 0.5], [-9, 9]),
    y: useTransform(smy, [-0.5, 0.5], [-7, 7]),
  };
  const layerNear: ParallaxLayer = {
    x: useTransform(smx, [-0.5, 0.5], [-20, 20]),
    y: useTransform(smy, [-0.5, 0.5], [-15, 15]),
  };

  return (
    <motion.div
      variants={stageVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      className="relative mx-auto h-[360px] w-full max-w-sm sm:h-[420px] lg:h-[480px]"
      style={{ perspective: "1300px" }}
      role="img"
      aria-label="An abstract visualization of Axivon's connected content network — a glowing knowledge sphere linked to floating placeholder content panels, representing where future articles will appear."
    >
      <KnowledgeNetworkLines />

      <GlassCube className="left-[6%] top-[10%]" size={38} duration={14} accent={COLORS.blue} />
      <GlassCube className="bottom-[12%] right-[8%]" size={30} duration={18} accent={COLORS.cyan} />

      <KnowledgeSphere />

      <FloatingContentPanel layer={layerNear} className="left-[0%] top-[4%]" width={132} accent={COLORS.blue} delay={0.1} />
      <FloatingContentPanel layer={layerFar} className="right-[0%] top-[24%]" width={118} accent={COLORS.cyan} delay={0.7} />
      <FloatingContentPanel layer={layerNear} className="bottom-[2%] left-[10%]" width={126} accent={COLORS.purple} delay={1.2} />

      <FloatingParticles count={14} />
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main featured card                                                 */
/* ------------------------------------------------------------------ */

function MainFeaturedCard({ article }: { article?: FeaturedArticleData }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const spotX = useMotionValue(50);
  const spotY = useMotionValue(50);

  const rotateX = useSpring(useTransform(py, [0, 1], [5, -5]), { stiffness: 220, damping: 24 });
  const rotateY = useSpring(useTransform(px, [0, 1], [-5, 5]), { stiffness: 220, damping: 24 });

  const spotlightBackground = useMotionTemplate`radial-gradient(480px circle at ${spotX}% ${spotY}%, ${COLORS.purple}22, transparent 70%)`;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (reduceMotion || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      px.set(x);
      py.set(y);
      spotX.set(x * 100);
      spotY.set(y * 100);
    },
    [px, py, spotX, spotY, reduceMotion]
  );

  const handleLeave = useCallback(() => {
    px.set(0.5);
    py.set(0.5);
  }, [px, py]);

  const isLive = Boolean(article);

  return (
    <motion.div
      ref={ref}
      variants={fadeUpVariants}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleLeave}
      whileHover={reduceMotion ? undefined : { y: -6, scale: 1.008 }}
      style={reduceMotion ? undefined : { rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="group relative rounded-[28px]"
    >
      {/* rotating border beam */}
      <div
        className="pointer-events-none absolute -inset-px overflow-hidden rounded-[28px] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        aria-hidden={true}
      >
        <motion.div
          className="absolute inset-[-50%]"
          style={{
            background: `conic-gradient(from 0deg, transparent 0deg, ${COLORS.cyan} 30deg, transparent 90deg)`,
          }}
          animate={reduceMotion ? undefined : { rotate: 360 }}
          transition={reduceMotion ? undefined : { duration: 5, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <article className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-white/[0.025] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-shadow duration-500 group-hover:shadow-[0_10px_55px_rgba(0,0,0,0.65)] sm:p-8">
        <div className="pointer-events-none absolute inset-[1px] -z-10 rounded-[27px] bg-[#070b1a]" aria-hidden={true} />

        <motion.div
          className="pointer-events-none absolute inset-0 rounded-[28px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: spotlightBackground }}
          aria-hidden={true}
        />

        {/* media / placeholder area */}
        <div className="relative mb-6 aspect-[16/9] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          {isLive && article ? (
            <Image
              src={article.image}
              alt={article.title}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          ) : (
            <div
              className="relative flex h-full w-full items-center justify-center"
              style={{
                backgroundImage: `linear-gradient(135deg, ${COLORS.blue}22, ${COLORS.purple}22, ${COLORS.cyan}22)`,
              }}
            >
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: `linear-gradient(${COLORS.cyan}26 1px, transparent 1px), linear-gradient(90deg, ${COLORS.cyan}26 1px, transparent 1px)`,
                  backgroundSize: "28px 28px",
                }}
                aria-hidden={true}
              />
              <motion.div
                className="absolute inset-y-0 w-1/3 opacity-40"
                style={{ background: `linear-gradient(90deg, transparent, ${COLORS.cyan}33, transparent)` }}
                animate={reduceMotion ? undefined : { x: ["-120%", "220%"] }}
                transition={reduceMotion ? undefined : { duration: 4, repeat: Infinity, ease: "easeInOut" }}
                aria-hidden={true}
              />
              <div className="relative flex flex-col items-center gap-2 text-white/40">
                <ImageIcon className="h-9 w-9" strokeWidth={1.5} aria-hidden={true} />
                <span className="text-xs font-medium uppercase tracking-[0.16em]">Image reserved for future content</span>
              </div>
            </div>
          )}

          <span
            className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-[#050816]/80 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-white/80 backdrop-blur-md"
            style={isLive ? undefined : { borderColor: `${COLORS.cyan}55`, color: COLORS.cyan }}
          >
            {isLive ? (
              <Tag className="h-3 w-3" aria-hidden={true} />
            ) : (
              <motion.span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: COLORS.cyan, boxShadow: `0 0 8px ${COLORS.cyan}` }}
                animate={reduceMotion ? undefined : { opacity: [0.4, 1, 0.4] }}
                transition={reduceMotion ? undefined : { duration: 2, repeat: Infinity, ease: "easeInOut" }}
                aria-hidden={true}
              />
            )}
            {isLive ? article!.category : "Coming Soon"}
          </span>
        </div>

        <h3 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {isLive ? article!.title : "Future Featured Article"}
        </h3>

        <p className="mt-4 text-[15px] leading-relaxed text-white/60 sm:text-base">
          {isLive
            ? article!.excerpt
            : "This space is reserved for future featured content that will be managed dynamically through the Axivon Technologies Admin Panel."}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/[0.06] pt-6 text-xs text-white/45">
          <span className="inline-flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" aria-hidden={true} />
            {isLive ? (
              article!.author
            ) : (
              <span className="h-1.5 w-16 rounded-full bg-white/10" aria-hidden={true} />
            )}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" aria-hidden={true} />
            {isLive ? (
              article!.publishedDate
            ) : (
              <span className="h-1.5 w-20 rounded-full bg-white/10" aria-hidden={true} />
            )}
          </span>
        </div>

        <div className="mt-7">
          {isLive && article ? (
            <Link
              href={`/blog/${article.slug}`}
              className="group/cta inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white outline-none transition-transform duration-300 focus-visible:ring-2 focus-visible:ring-[#00D4FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050816]"
              style={{
                background: `linear-gradient(135deg, ${COLORS.blue}, ${COLORS.purple})`,
                boxShadow: `0 8px 26px -8px ${COLORS.purple}90`,
              }}
            >
              Read Article
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-1" aria-hidden={true} />
            </Link>
          ) : (
            <span
              aria-disabled="true"
              className="inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-6 py-3 text-sm font-medium text-white/40"
            >
              <Lock className="h-3.5 w-3.5" aria-hidden={true} />
              Available Soon
            </span>
          )}
        </div>
      </article>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main export                                                        */
/* ------------------------------------------------------------------ */

export default function FeaturedArticle({ article }: FeaturedArticleProps) {
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
      aria-labelledby="featured-article-heading"
      onMouseMove={handlePointerMove}
      onMouseLeave={handlePointerLeave}
      className="relative isolate overflow-hidden bg-[#050816] px-6 py-28 sm:py-32 lg:px-8"
    >
      <AuroraBackground />
      <PerspectiveGrid smx={smx} smy={smy} />
      <FloatingParticles />
      <NoiseOverlay />
      {!reduceMotion && spotlightReady && <CursorSpotlight spotX={spotX} spotY={spotY} />}

      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={containerVariants}
          className="mx-auto mb-16 max-w-2xl text-center sm:mb-20"
        >
          <motion.span
            variants={fadeUpVariants}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-white/70 backdrop-blur-sm"
          >
            <Sparkles className="h-3.5 w-3.5" style={{ color: COLORS.cyan }} aria-hidden={true} />
            Featured Insight
          </motion.span>

          <motion.h2
            id="featured-article-heading"
            variants={fadeUpVariants}
            className="text-4xl font-semibold tracking-tight text-white sm:text-5xl"
          >
            <GradientText className="block">Featured Content</GradientText>
            <GradientText className="block">Coming Soon</GradientText>
          </motion.h2>

          <motion.p
            variants={fadeUpVariants}
            className="mx-auto mt-6 text-balance text-base leading-relaxed text-white/60 sm:text-lg"
          >
            Premium articles, technology insights, development guides, startup
            strategies, AI innovations, and digital transformation content
            will be published here soon. This section is being prepared for
            future content management through the Axivon Technologies Admin
            Dashboard.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={containerVariants}
          className="grid grid-cols-1 items-center gap-14 lg:grid-cols-5 lg:gap-10 xl:gap-16"
        >
          <div className="lg:col-span-3">
            <MainFeaturedCard article={article} />
          </div>
          <div className="lg:col-span-2">
            <ContentNetwork smx={smx} smy={smy} />
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={fadeUpVariants}
          className="mx-auto mt-16 flex max-w-xl items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 text-center text-xs text-white/50 backdrop-blur-sm sm:mt-20"
        >
          <Sparkles className="h-3.5 w-3.5 shrink-0" style={{ color: COLORS.purple }} aria-hidden={true} />
          Future articles will be published through the Axivon CMS.
        </motion.div>
      </div>
    </section>
  );
}