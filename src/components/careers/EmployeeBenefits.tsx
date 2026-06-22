"use client";

import { useCallback, useMemo, useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";
import {
  GraduationCap,
  Laptop,
  Lightbulb,
  Rocket,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Theme tokens — kept in one place so every effect below pulls from  */
/*  the same source of truth as the rest of the careers section.       */
/* ------------------------------------------------------------------ */

const COLORS = {
  bg: "#050816",
  blue: "#2563EB",
  purple: "#7C3AED",
  cyan: "#00D4FF",
} as const;

/* ------------------------------------------------------------------ */
/*  Content                                                            */
/* ------------------------------------------------------------------ */

interface Benefit {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  accent: string;
}

const BENEFITS: Benefit[] = [
  {
    id: "remote-first",
    icon: Laptop,
    title: "Remote First Culture",
    description:
      "Work from anywhere while collaborating with passionate team members and building impactful technology solutions.",
    accent: COLORS.blue,
  },
  {
    id: "real-world-projects",
    icon: Rocket,
    title: "Real World Projects",
    description:
      "Gain practical experience by contributing to real products, client solutions, and innovative digital platforms.",
    accent: COLORS.purple,
  },
  {
    id: "continuous-learning",
    icon: GraduationCap,
    title: "Continuous Learning",
    description:
      "Expand your knowledge through hands-on development, emerging technologies, and problem-solving challenges.",
    accent: COLORS.cyan,
  },
  {
    id: "mentorship",
    icon: Users,
    title: "Mentorship & Guidance",
    description:
      "Learn directly from experienced developers and receive support throughout your growth journey.",
    accent: COLORS.blue,
  },
  {
    id: "career-growth",
    icon: TrendingUp,
    title: "Career Growth",
    description:
      "Develop valuable technical and professional skills that help accelerate your future career opportunities.",
    accent: COLORS.purple,
  },
  {
    id: "innovation-driven",
    icon: Lightbulb,
    title: "Innovation Driven",
    description:
      "Experiment with new ideas, modern technologies, and creative solutions that push boundaries.",
    accent: COLORS.cyan,
  },
];

/* ------------------------------------------------------------------ */
/*  Motion variants                                                    */
/* ------------------------------------------------------------------ */

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
};

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
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
/*  Decorative: aurora glow orbs                                       */
/* ------------------------------------------------------------------ */

function AuroraBackground() {
  const reduceMotion = useReducedMotion();

  const orbs = [
    {
      color: COLORS.blue,
      size: 520,
      top: "-10%",
      left: "5%",
      animate: { x: [0, 40, -20, 0], y: [0, 30, -10, 0] },
      duration: 22,
    },
    {
      color: COLORS.purple,
      size: 600,
      top: "30%",
      left: "60%",
      animate: { x: [0, -50, 20, 0], y: [0, -20, 30, 0] },
      duration: 26,
    },
    {
      color: COLORS.cyan,
      size: 420,
      top: "55%",
      left: "15%",
      animate: { x: [0, 30, -30, 0], y: [0, -25, 15, 0] },
      duration: 20,
    },
  ];

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden={true}
    >
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-[120px]"
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
              : {
                  duration: orb.duration,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
          }
        />
      ))}

      {/* volumetric light beam from the top of the section */}
      <div
        className="absolute inset-x-0 top-0 h-[60%] opacity-40 mix-blend-screen"
        style={{
          background: `radial-gradient(60% 50% at 50% 0%, ${COLORS.purple}33 0%, transparent 70%)`,
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Decorative: perspective grid floor                                 */
/* ------------------------------------------------------------------ */

function PerspectiveGrid() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] overflow-hidden opacity-[0.15]"
      style={{ perspective: "600px" }}
      aria-hidden={true}
    >
      <div
        className="absolute inset-x-[-50%] bottom-0 h-[200%] origin-bottom"
        style={{
          backgroundImage: `linear-gradient(${COLORS.cyan}33 1px, transparent 1px), linear-gradient(90deg, ${COLORS.cyan}33 1px, transparent 1px)`,
          backgroundSize: "56px 56px",
          transform: "rotateX(60deg)",
          maskImage:
            "linear-gradient(to top, black 0%, transparent 85%)",
          WebkitMaskImage:
            "linear-gradient(to top, black 0%, transparent 85%)",
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Decorative: floating particles (deterministic, SSR-safe)           */
/* ------------------------------------------------------------------ */

function FloatingParticles() {
  const reduceMotion = useReducedMotion();

  const particles = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        left: (i * 37) % 100,
        top: (i * 53) % 100,
        size: 1 + (i % 3),
        duration: 6 + (i % 5),
        delay: (i % 7) * 0.4,
        color: [COLORS.blue, COLORS.purple, COLORS.cyan][i % 3],
      })),
    []
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
          animate={{
            y: [0, -18, 0],
            opacity: [0.15, 0.8, 0.15],
          }}
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
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.035]"
      aria-hidden={true}
    >
      <filter id="employee-benefits-noise">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.9"
          numOctaves="2"
          stitchTiles="stitch"
        />
      </filter>
      <rect width="100%" height="100%" filter="url(#employee-benefits-noise)" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Benefit card — 3D tilt, spotlight, glow, border beam               */
/* ------------------------------------------------------------------ */

function BenefitCard({ benefit }: { benefit: Benefit }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const spotX = useMotionValue(50);
  const spotY = useMotionValue(50);

  const rotateX = useSpring(useTransform(py, [0, 1], [9, -9]), {
    stiffness: 260,
    damping: 24,
  });
  const rotateY = useSpring(useTransform(px, [0, 1], [-9, 9]), {
    stiffness: 260,
    damping: 24,
  });

  const spotlightBackground = useMotionTemplate`radial-gradient(280px circle at ${spotX}% ${spotY}%, ${benefit.accent}26, transparent 70%)`;

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

  const Icon = benefit.icon;

  return (
    <motion.div
      ref={ref}
      role="listitem"
      tabIndex={0}
      aria-label={`${benefit.title}. ${benefit.description}`}
      variants={cardVariants}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleLeave}
      whileHover={reduceMotion ? undefined : { y: -8, scale: 1.015 }}
      whileFocus={reduceMotion ? undefined : { y: -8, scale: 1.015 }}
      style={
        reduceMotion
          ? undefined
          : { rotateX, rotateY, transformStyle: "preserve-3d" }
      }
      className="group relative rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050816]"
    >
      {/* rotating border beam, visible on hover/focus */}
      <div
        className="absolute -inset-px overflow-hidden rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-within:opacity-100"
        aria-hidden={true}
      >
        <motion.div
          className="absolute inset-[-60%]"
          style={{
            background: `conic-gradient(from 0deg, transparent 0deg, ${benefit.accent} 40deg, transparent 100deg)`,
          }}
          animate={reduceMotion ? undefined : { rotate: 360 }}
          transition={
            reduceMotion
              ? undefined
              : { duration: 4, repeat: Infinity, ease: "linear" }
          }
        />
      </div>

      {/* glass body */}
      <div className="relative h-full rounded-2xl border border-white/[0.08] bg-white/[0.025] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-shadow duration-500 group-hover:shadow-[0_8px_40px_rgba(0,0,0,0.6)]">
        {/* inset card to sit just inside the rotating beam */}
        <div
          className="absolute inset-[1px] -z-10 rounded-[15px] bg-[#070b1a]"
          aria-hidden={true}
        />

        {/* mouse-follow spotlight */}
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: spotlightBackground }}
          aria-hidden={true}
        />

        {/* ambient glow that intensifies on hover */}
        <div
          className="pointer-events-none absolute -inset-6 -z-10 rounded-[28px] opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-60"
          style={{ background: `radial-gradient(circle, ${benefit.accent}40, transparent 70%)` }}
          aria-hidden={true}
        />

        <div style={{ transform: "translateZ(40px)" }} className="relative">
          <div
            className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] transition-transform duration-500 group-hover:scale-110"
            style={{ boxShadow: `0 0 24px -8px ${benefit.accent}80` }}
          >
            <Icon
              className="h-6 w-6"
              style={{ color: benefit.accent }}
              strokeWidth={1.75}
              aria-hidden={true}
            />
          </div>

          <h3 className="mb-3 text-lg font-semibold tracking-tight text-white">
            {benefit.title}
          </h3>

          <p className="text-[15px] leading-relaxed text-white/60">
            {benefit.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main export                                                        */
/* ------------------------------------------------------------------ */

export default function EmployeeBenefits() {
  return (
    <section
      aria-labelledby="employee-benefits-heading"
      className="relative isolate overflow-hidden bg-[#050816] px-6 py-28 sm:py-32 lg:px-8"
    >
      <AuroraBackground />
      <PerspectiveGrid />
      <FloatingParticles />
      <NoiseOverlay />

      <div className="relative mx-auto max-w-6xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={containerVariants}
          className="mx-auto mb-16 max-w-2xl text-center sm:mb-20"
        >
          <motion.span
            variants={fadeUpVariants}
            className="mb-6 inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-white/70 backdrop-blur-sm"
          >
            Employee Benefits
          </motion.span>

          <motion.h2
            id="employee-benefits-heading"
            variants={fadeUpVariants}
            className="text-4xl font-semibold tracking-tight text-white sm:text-5xl"
          >
            <span className="block">
              Why You&apos;ll <GradientText>Love</GradientText>
            </span>
            <GradientText className="block">Working With Us</GradientText>
          </motion.h2>

          <motion.p
            variants={fadeUpVariants}
            className="mx-auto mt-6 text-balance text-base leading-relaxed text-white/60 sm:text-lg"
          >
            At Axivon Technologies, we believe growth happens when talented
            people are given opportunities, ownership, mentorship, and the
            freedom to innovate. We are building an environment where
            learning, collaboration, and creativity thrive.
          </motion.p>
        </motion.div>

        <motion.div
          role="list"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={containerVariants}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8 xl:gap-10"
          style={{ perspective: "1200px" }}
        >
          {BENEFITS.map((benefit) => (
            <BenefitCard key={benefit.id} benefit={benefit} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}