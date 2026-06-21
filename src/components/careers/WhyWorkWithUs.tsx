"use client";

import { useRef, useCallback, type ReactNode, type MouseEvent as ReactMouseEvent } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import {
  Rocket,
  TrendingUp,
  Globe,
  Users,
  BrainCircuit,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

/**
 * WhyWorkWithUs.tsx — Axivon Technologies
 * Next.js 15 / TypeScript / Tailwind CSS / Framer Motion / Lucide React
 *
 * A premium culture / benefits showcase designed to sit visually alongside
 * CareersHero.tsx, PortfolioHero.tsx and AboutHero.tsx.
 */

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

interface Benefit {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  accent: string;
}

/* -------------------------------------------------------------------------- */
/*  Static data                                                               */
/* -------------------------------------------------------------------------- */

const BENEFITS: Benefit[] = [
  {
    id: "innovation",
    icon: Rocket,
    title: "Innovation First",
    description:
      "Work on cutting-edge AI, cloud, web, and automation technologies that solve real-world problems.",
    accent: "#00D4FF",
  },
  {
    id: "growth",
    icon: TrendingUp,
    title: "Career Growth",
    description:
      "Learn, experiment, and grow with continuous opportunities for personal and professional development.",
    accent: "#2563EB",
  },
  {
    id: "remote",
    icon: Globe,
    title: "Remote Flexibility",
    description:
      "Enjoy a modern work culture focused on outcomes, flexibility, and productivity.",
    accent: "#7C3AED",
  },
  {
    id: "culture",
    icon: Users,
    title: "Collaborative Culture",
    description:
      "Work alongside passionate engineers, designers, and innovators who love building exceptional products.",
    accent: "#00D4FF",
  },
  {
    id: "learning",
    icon: BrainCircuit,
    title: "Learning & Development",
    description:
      "Stay ahead with access to modern technologies, workshops, mentorship, and innovation-driven projects.",
    accent: "#2563EB",
  },
  {
    id: "impact",
    icon: Sparkles,
    title: "Meaningful Impact",
    description:
      "Build products and solutions that create measurable value for businesses and communities.",
    accent: "#7C3AED",
  },
];

/* -------------------------------------------------------------------------- */
/*  Motion variants                                                          */
/* -------------------------------------------------------------------------- */

const EASE = [0.16, 1, 0.3, 1] as const;

const sectionContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 26, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: EASE },
  },
};

const gridContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};

const cardReveal = {
  hidden: { opacity: 0, y: 32, scale: 0.96, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.65, ease: EASE },
  },
};

/* -------------------------------------------------------------------------- */
/*  Decorative background layers                                             */
/* -------------------------------------------------------------------------- */

function AuroraLayer({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -top-44 -right-36 h-[38rem] w-[38rem] rounded-full blur-[130px]"
        style={{ background: "radial-gradient(circle, rgba(124,58,237,0.36), transparent 70%)" }}
        animate={reduceMotion ? undefined : { x: [0, -60, 0], y: [0, 40, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 -left-40 h-[34rem] w-[34rem] rounded-full blur-[130px]"
        style={{ background: "radial-gradient(circle, rgba(37,99,235,0.36), transparent 70%)" }}
        animate={reduceMotion ? undefined : { x: [0, 55, 0], y: [0, -35, 0] }}
        transition={{ duration: 27, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-12rem] right-1/3 h-[32rem] w-[32rem] rounded-full blur-[130px]"
        style={{ background: "radial-gradient(circle, rgba(0,212,255,0.26), transparent 70%)" }}
        animate={reduceMotion ? undefined : { x: [0, -45, 0], y: [0, 25, 0] }}
        transition={{ duration: 23, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

function PerspectiveGrid() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden" style={{ perspective: 900 }}>
      <div
        className="absolute inset-x-[-20%] top-[8%] h-[60%] opacity-[0.09]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          transform: "rotateX(58deg)",
          maskImage: "linear-gradient(to bottom, black, transparent 85%)",
        }}
      />
    </div>
  );
}

function NoiseTexture() {
  return (
    <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.045] mix-blend-overlay">
      <filter id="wwu-noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#wwu-noise)" />
    </svg>
  );
}

function FloatingParticles({ reduceMotion }: { reduceMotion: boolean }) {
  const particles = [
    { left: 8, top: 14, size: 3, hue: "#00D4FF", dur: 13 },
    { left: 18, top: 70, size: 2, hue: "#7C3AED", dur: 17 },
    { left: 30, top: 40, size: 2.5, hue: "#2563EB", dur: 15 },
    { left: 44, top: 84, size: 2, hue: "#00D4FF", dur: 19 },
    { left: 56, top: 10, size: 3, hue: "#7C3AED", dur: 14 },
    { left: 68, top: 58, size: 2, hue: "#2563EB", dur: 16 },
    { left: 80, top: 22, size: 2.5, hue: "#00D4FF", dur: 18 },
    { left: 90, top: 66, size: 3, hue: "#7C3AED", dur: 20 },
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
          animate={reduceMotion ? undefined : { y: [0, -28, 0], opacity: [0.2, 0.9, 0.2] }}
          transition={{ duration: p.dur, repeat: Infinity, ease: "easeInOut", delay: i * 0.45 }}
        />
      ))}
    </div>
  );
}

/** Slow-drifting holographic ring — purely decorative bonus feature. */
function HolographicCircle({
  size,
  className,
  hue,
  duration,
}: {
  size: number;
  className: string;
  hue: string;
  duration: number;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.span
      aria-hidden
      className={`pointer-events-none absolute rounded-full border ${className}`}
      style={{ width: size, height: size, borderColor: `${hue}33` }}
      animate={reduceMotion ? undefined : { y: [0, -18, 0], rotate: [0, 8, 0], opacity: [0.25, 0.55, 0.25] }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  Animated gradient heading word                                           */
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
/*  Animated border beam                                                     */
/* -------------------------------------------------------------------------- */

function BorderBeam({ active, speed = 3.2 }: { active: boolean; speed?: number }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 rounded-2xl"
      style={{
        background: "conic-gradient(from 0deg, #00D4FF, #2563EB, #7C3AED, #00D4FF)",
        opacity: active ? 0.9 : 0,
        padding: 1.5,
        WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
        WebkitMaskComposite: "xor",
        maskComposite: "exclude",
        animation: active ? `wwu-spin ${speed}s linear infinite` : undefined,
        transition: "opacity 0.4s ease",
      }}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  Benefit card — 3D tilt + mouse spotlight + glow + glass                  */
/* -------------------------------------------------------------------------- */

function BenefitCard({ benefit, index }: { benefit: Benefit; index: number }) {
  const Icon = benefit.icon;
  const reduceMotion = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);

  // 3D tilt
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 200, damping: 18 });
  const sry = useSpring(ry, { stiffness: 200, damping: 18 });

  // Mouse-follow spotlight (percentage of card box)
  const spotX = useMotionValue(50);
  const spotY = useMotionValue(50);
  const sSpotX = useSpring(spotX, { stiffness: 150, damping: 20 });
  const sSpotY = useSpring(spotY, { stiffness: 150, damping: 20 });
  const spotlightBg = useTransform(
    [sSpotX, sSpotY],
    ([x, y]: number[]) => `radial-gradient(280px circle at ${x}% ${y}%, ${benefit.accent}26, transparent 70%)`
  );

  const hover = useMotionValue(0);
  const sHover = useSpring(hover, { stiffness: 220, damping: 22 });

  const handleMove = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      const rect = cardRef.current?.getBoundingClientRect();
      if (!rect) return;
      const relX = (e.clientX - rect.left) / rect.width;
      const relY = (e.clientY - rect.top) / rect.height;
      spotX.set(relX * 100);
      spotY.set(relY * 100);
      if (!reduceMotion) {
        rx.set((relY - 0.5) * -10);
        ry.set((relX - 0.5) * 12);
      }
    },
    [reduceMotion, rx, ry, spotX, spotY]
  );

  const handleEnter = useCallback(() => hover.set(1), [hover]);
  const handleLeave = useCallback(() => {
    hover.set(0);
    rx.set(0);
    ry.set(0);
  }, [hover, rx, ry]);

  return (
    <motion.div
      variants={cardReveal}
      style={{ perspective: 1200 }}
      className="relative"
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMove}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        style={{ rotateX: srx, rotateY: sry, transformStyle: "preserve-3d" }}
        whileHover={{ scale: 1.03, y: -6 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className="group relative h-full rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF]/60"
        tabIndex={0}
        role="article"
        aria-label={benefit.title}
      >
        <BorderBeam active={false} />
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            background: "conic-gradient(from 0deg, #00D4FF, #2563EB, #7C3AED, #00D4FF)",
            padding: 1.5,
            WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
            opacity: sHover,
          }}
        />
        <div className="absolute inset-0 rounded-2xl border border-white/10" />

        {/* glass body */}
        <div
          className={[
            "relative flex h-full flex-col overflow-hidden rounded-2xl bg-white/[0.045] p-7 backdrop-blur-xl transition-shadow duration-300",
            "shadow-[0_10px_40px_-12px_rgba(0,0,0,0.45)] group-hover:shadow-[0_24px_70px_-18px_var(--axv-glow)]",
          ].join(" ")}
          style={{ ["--axv-glow" as string]: `${benefit.accent}66` }}
        >
          {/* mouse-follow spotlight */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{ background: spotlightBg }}
          />

          {/* top sheen */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent"
            style={{ backgroundImage: `linear-gradient(to right, transparent, ${benefit.accent}aa, transparent)` }}
          />

          <span
            className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
            style={{ background: `${benefit.accent}1f`, color: benefit.accent }}
          >
            <Icon className="h-6 w-6" strokeWidth={1.8} aria-hidden />
          </span>

          <h3 className="relative z-10 mt-5 text-lg font-semibold tracking-tight text-white">
            {benefit.title}
          </h3>
          <p className="relative z-10 mt-2.5 text-sm leading-relaxed text-white/55">
            {benefit.description}
          </p>

          <span
            aria-hidden
            className="relative z-10 mt-5 inline-flex items-center text-[11px] font-medium uppercase tracking-wider opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{ color: benefit.accent }}
          >
            {String(index + 1).padStart(2, "0")} — Axivon Culture
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main component                                                           */
/* -------------------------------------------------------------------------- */

export default function WhyWorkWithUs() {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const parallaxX = useSpring(px, { stiffness: 55, damping: 20 });
  const parallaxY = useSpring(py, { stiffness: 55, damping: 20 });
  const orbX = useTransform(parallaxX, (v) => v * 22);
  const orbY = useTransform(parallaxY, (v) => v * 22);
  const orbXInverse = useTransform(parallaxX, (v) => v * -16);
  const orbYInverse = useTransform(parallaxY, (v) => v * -16);

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
      aria-label="Why work with Axivon Technologies"
      className="relative isolate w-full overflow-hidden px-4 py-24 sm:px-6 sm:py-28 lg:px-10 lg:py-32 2xl:px-20"
      style={{ background: "#050816" }}
    >
      <style>{`
        @keyframes wwu-spin { to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) {
          .wwu-respect-motion * { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; }
        }
      `}</style>

      <AuroraLayer reduceMotion={!!reduceMotion} />
      <PerspectiveGrid />
      <FloatingParticles reduceMotion={!!reduceMotion} />
      <NoiseTexture />

      {/* Bonus: floating holographic circles */}
      <HolographicCircle size={220} className="left-[4%] top-[12%]" hue="#00D4FF" duration={11} />
      <HolographicCircle size={160} className="right-[6%] top-[8%]" hue="#7C3AED" duration={14} />
      <HolographicCircle size={260} className="bottom-[6%] right-[10%]" hue="#2563EB" duration={13} />

      {/* Parallax gradient orbs */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-[10%] top-[10%] h-72 w-72 rounded-full blur-[100px] sm:h-96 sm:w-96"
        style={{ background: "radial-gradient(circle, rgba(0,212,255,0.28), transparent 70%)", x: orbX, y: orbY }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute bottom-[8%] right-[6%] h-80 w-80 rounded-full blur-[110px] sm:h-[26rem] sm:w-[26rem]"
        style={{ background: "radial-gradient(circle, rgba(124,58,237,0.3), transparent 70%)", x: orbXInverse, y: orbYInverse }}
      />

      <div className="relative mx-auto max-w-[1400px] 2xl:max-w-[1600px]">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.35 }}
          variants={sectionContainer}
          className="mx-auto max-w-2xl text-center"
        >
          <motion.span
            variants={fadeUp}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#00D4FF] backdrop-blur-md"
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Why Join Axivon
          </motion.span>

          <motion.h2
            variants={fadeUp}
            className="mt-6 text-3xl font-bold leading-[1.15] tracking-tight text-white sm:text-4xl lg:text-[2.75rem]"
          >
            A Workplace Built
            <br />
            For <GradientWord>Innovators</GradientWord> &amp; <GradientWord>Builders</GradientWord>
          </motion.h2>

          <motion.p variants={fadeUp} className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg">
            At Axivon Technologies, we believe great products are built by great
            people. We create an environment where creativity, innovation,
            collaboration, and continuous learning drive meaningful impact.
          </motion.p>
        </motion.div>

        {/* Benefits grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={gridContainer}
          className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          role="list"
          aria-label="Benefits of working at Axivon Technologies"
        >
          {BENEFITS.map((benefit, i) => (
            <div role="listitem" key={benefit.id}>
              <BenefitCard benefit={benefit} index={i} />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}