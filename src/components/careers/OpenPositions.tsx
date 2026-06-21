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
  Sparkles,
  Code2,
  ServerCog,
  BrainCircuit,
  PenTool,
  Layers,
  Laptop,
  Clock,
  ArrowRight,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";

/**
 * OpenPositions.tsx — Axivon Technologies
 * Next.js 15 / TypeScript / Tailwind CSS / Framer Motion / Lucide React
 *
 * A premium, hiring-platform-grade open roles section designed to sit
 * visually alongside CareersHero.tsx and WhyWorkWithUs.tsx.
 */

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

interface Position {
  id: string;
  title: string;
  type: string;
  workMode: string;
  experience: string;
  skills: string[];
  icon: LucideIcon;
  accent: string;
  applyHref: string;
  learnMoreHref: string;
}

/* -------------------------------------------------------------------------- */
/*  Static data — confirmed roles only                                       */
/* -------------------------------------------------------------------------- */

const POSITIONS: Position[] = [
  {
    id: "frontend-intern",
    title: "Frontend Developer Intern",
    type: "Internship",
    workMode: "Remote",
    experience: "0–1 Years",
    skills: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
    icon: Code2,
    accent: "#00D4FF",
    applyHref:
  "mailto:info@axivontech.in?subject=Application%20for%20Frontend%20Developer%20Intern&body=Hello%20Axivon%20Technologies,%0A%0AI%20would%20like%20to%20apply%20for%20the%20Frontend%20Developer%20Intern%20position.%0A%0AName:%20%0APhone:%20%0ALinkedIn:%20%0AGitHub:%20%0APortfolio:%20%0A%0AThank%20You.",
    learnMoreHref: "#position-frontend-developer-intern",
  },
  {
    id: "backend-intern",
    title: "Backend Developer Intern",
    type: "Internship",
    workMode: "Remote",
    experience: "0–1 Years",
    skills: ["Node.js", "Express.js", "PostgreSQL", "REST APIs"],
    icon: ServerCog,
    accent: "#2563EB",
    applyHref:
  "mailto:info@axivontech.in?subject=Application%20for%20Backend%20Developer%20Intern&body=Hello%20Axivon%20Technologies,%0A%0AI%20would%20like%20to%20apply%20for%20the%20Backend%20Developer%20Intern%20position.%0A%0AName:%20%0APhone:%20%0ALinkedIn:%20%0AGitHub:%20%0APortfolio:%20%0A%0AThank%20You.",
    learnMoreHref: "#position-backend-developer-intern",
  },
  {
    id: "aiml-intern",
    title: "AI/ML Intern",
    type: "Internship",
    workMode: "Remote",
    experience: "0–1 Years",
    skills: ["Python", "Machine Learning", "TensorFlow", "Data Analysis"],
    icon: BrainCircuit,
    accent: "#7C3AED",
    applyHref:
  "mailto:info@axivontech.in?subject=Application%20for%20AI/ML%20Intern&body=Hello%20Axivon%20Technologies,%0A%0AI%20would%20like%20to%20apply%20for%20the%20AI/ML%20Intern%20position.%0A%0AName:%20%0APhone:%20%0ALinkedIn:%20%0AGitHub:%20%0APortfolio:%20%0A%0AThank%20You.",
    learnMoreHref: "#position-ai-ml-intern",
  },
  {
    id: "uiux-intern",
    title: "UI/UX Design Intern",
    type: "Internship",
    workMode: "Remote",
    experience: "0–1 Years",
    skills: ["Figma", "Wireframing", "Prototyping", "Design Systems"],
    icon: PenTool,
    accent: "#00D4FF",
    applyHref:
  "mailto:info@axivontech.in?subject=Application%20for%20UI/UX%20Design%20Intern&body=Hello%20Axivon%20Technologies,%0A%0AI%20would%20like%20to%20apply%20for%20the%20UI/UX%20Design%20Intern%20position.%0A%0AName:%20%0APhone:%20%0ALinkedIn:%20%0AGitHub:%20%0APortfolio:%20%0A%0AThank%20You.",
    learnMoreHref: "#position-ui-ux-design-intern",
  },
  {
    id: "fullstack-intern",
    title: "Full Stack Developer Intern",
    type: "Internship",
    workMode: "Remote",
    experience: "0–1 Years",
    skills: ["Next.js", "Node.js", "PostgreSQL", "TypeScript"],
    icon: Layers,
    accent: "#7C3AED",
    applyHref:
  "mailto:info@axivontech.in?subject=Application%20for%20Full%20Stack%20Developer%20Intern&body=Hello%20Axivon%20Technologies,%0A%0AI%20would%20like%20to%20apply%20for%20the%20Full%20Stack%20Developer%20Intern%20position.%0A%0AName:%20%0APhone:%20%0ALinkedIn:%20%0AGitHub:%20%0APortfolio:%20%0A%0AThank%20You.",
    learnMoreHref: "#position-full-stack-developer-intern",
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
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.12 } },
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
        className="absolute -top-44 -left-36 h-[38rem] w-[38rem] rounded-full blur-[130px]"
        style={{ background: "radial-gradient(circle, rgba(37,99,235,0.36), transparent 70%)" }}
        animate={reduceMotion ? undefined : { x: [0, 60, 0], y: [0, 40, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 -right-40 h-[34rem] w-[34rem] rounded-full blur-[130px]"
        style={{ background: "radial-gradient(circle, rgba(124,58,237,0.34), transparent 70%)" }}
        animate={reduceMotion ? undefined : { x: [0, -55, 0], y: [0, -30, 0] }}
        transition={{ duration: 27, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-12rem] left-1/3 h-[32rem] w-[32rem] rounded-full blur-[130px]"
        style={{ background: "radial-gradient(circle, rgba(0,212,255,0.26), transparent 70%)" }}
        animate={reduceMotion ? undefined : { x: [0, 45, 0], y: [0, -25, 0] }}
        transition={{ duration: 23, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

function PerspectiveGrid() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden" style={{ perspective: 900 }}>
      <div
        className="absolute inset-x-[-20%] top-[6%] h-[55%] opacity-[0.08]"
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
      <filter id="op-noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#op-noise)" />
    </svg>
  );
}

function FloatingParticles({ reduceMotion }: { reduceMotion: boolean }) {
  const particles = [
    { left: 6, top: 16, size: 3, hue: "#00D4FF", dur: 13 },
    { left: 16, top: 66, size: 2, hue: "#2563EB", dur: 17 },
    { left: 28, top: 38, size: 2.5, hue: "#7C3AED", dur: 15 },
    { left: 42, top: 82, size: 2, hue: "#00D4FF", dur: 19 },
    { left: 54, top: 12, size: 3, hue: "#2563EB", dur: 14 },
    { left: 66, top: 56, size: 2, hue: "#7C3AED", dur: 16 },
    { left: 78, top: 24, size: 2.5, hue: "#00D4FF", dur: 18 },
    { left: 90, top: 64, size: 3, hue: "#2563EB", dur: 20 },
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

/* -------------------------------------------------------------------------- */
/*  Animated gradient heading phrase                                         */
/* -------------------------------------------------------------------------- */

function GradientPhrase({ children }: { children: ReactNode }) {
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
/*  Small badge chip                                                         */
/* -------------------------------------------------------------------------- */

function Badge({ icon: Icon, label, tone }: { icon?: LucideIcon; label: string; tone: "blue" | "purple" | "cyan" }) {
  const toneMap: Record<typeof tone, string> = {
    blue: "border-[#2563EB]/30 bg-[#2563EB]/10 text-[#7fa8ff]",
    purple: "border-[#7C3AED]/30 bg-[#7C3AED]/10 text-[#c4a4ff]",
    cyan: "border-[#00D4FF]/30 bg-[#00D4FF]/10 text-[#7fe9ff]",
  };
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium",
        toneMap[tone],
      ].join(" ")}
    >
      {Icon && <Icon className="h-3 w-3" aria-hidden />}
      {label}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Magnetic button (used for Apply Now)                                    */
/* -------------------------------------------------------------------------- */

function MagneticLink({
  children,
  href,
  variant = "primary",
  ariaLabel,
  className,
}: {
  children: ReactNode;
  href: string;
  variant?: "primary" | "secondary";
  ariaLabel: string;
  className?: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 240, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 240, damping: 18, mass: 0.4 });

  const handleMove = useCallback(
    (e: ReactMouseEvent<HTMLAnchorElement>) => {
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;
      x.set((e.clientX - (rect.left + rect.width / 2)) * 0.2);
      y.set((e.clientY - (rect.top + rect.height / 2)) * 0.3);
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
        "group relative inline-flex flex-1 items-center justify-center gap-1.5 overflow-hidden rounded-full px-4 py-2.5 text-[13px] font-semibold outline-none transition-shadow duration-300",
        "focus-visible:ring-2 focus-visible:ring-[#00D4FF]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050816]",
        isPrimary
          ? "text-white shadow-[0_8px_28px_-8px_rgba(37,99,235,0.65)] hover:shadow-[0_12px_38px_-8px_rgba(124,58,237,0.75)]"
          : "border border-white/15 bg-white/[0.04] text-white/85 backdrop-blur-md hover:border-[#00D4FF]/40 hover:bg-white/[0.08]",
        className,
      ].join(" ")}
    >
      {isPrimary && (
        <span aria-hidden className="absolute inset-0 -z-10" style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }} />
      )}
      {isPrimary && (
        <span
          aria-hidden
          className="absolute inset-0 -z-10 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full"
        />
      )}
      {children}
    </motion.a>
  );
}

/* -------------------------------------------------------------------------- */
/*  Position card — 3D tilt + mouse spotlight + glow + glass + border beam  */
/* -------------------------------------------------------------------------- */

function PositionCard({ position }: { position: Position }) {
  const Icon = position.icon;
  const reduceMotion = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);

  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 200, damping: 18 });
  const sry = useSpring(ry, { stiffness: 200, damping: 18 });

  const spotX = useMotionValue(50);
  const spotY = useMotionValue(50);
  const sSpotX = useSpring(spotX, { stiffness: 150, damping: 20 });
  const sSpotY = useSpring(spotY, { stiffness: 150, damping: 20 });
  const spotlightBg = useTransform(
    [sSpotX, sSpotY],
    ([x, y]: number[]) => `radial-gradient(280px circle at ${x}% ${y}%, ${position.accent}26, transparent 70%)`
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
        rx.set((relY - 0.5) * -8);
        ry.set((relX - 0.5) * 10);
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
    <motion.div variants={cardReveal} style={{ perspective: 1200 }} className="relative h-full">
      <motion.div
        ref={cardRef}
        onMouseMove={handleMove}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        style={{ rotateX: srx, rotateY: sry, transformStyle: "preserve-3d" }}
        whileHover={{ scale: 1.02, y: -6 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className="group relative flex h-full flex-col rounded-2xl"
      >
        {/* animated border beam */}
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
            animation: "op-spin 3s linear infinite",
          }}
        />
        <div className="absolute inset-0 rounded-2xl border border-white/10" />

        {/* glass body */}
        <div
          className={[
            "relative flex h-full flex-col overflow-hidden rounded-2xl bg-white/[0.045] p-6 backdrop-blur-xl transition-shadow duration-300 sm:p-7",
            "shadow-[0_10px_40px_-12px_rgba(0,0,0,0.45)] group-hover:shadow-[0_24px_70px_-18px_var(--axv-glow)]",
          ].join(" ")}
          style={{ ["--axv-glow" as string]: `${position.accent}66` }}
        >
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{ background: spotlightBg }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{ backgroundImage: `linear-gradient(to right, transparent, ${position.accent}aa, transparent)` }}
          />

          {/* icon + title */}
          <div className="relative z-10 flex items-start gap-4">
            <span
              className="flex h-12 w-12 flex-none items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
              style={{ background: `${position.accent}1f`, color: position.accent }}
            >
              <Icon className="h-6 w-6" strokeWidth={1.8} aria-hidden />
            </span>
            <h3 className="mt-1 text-[17px] font-semibold leading-snug tracking-tight text-white">
              {position.title}
            </h3>
          </div>

          {/* badges */}
          <div className="relative z-10 mt-4 flex flex-wrap gap-2">
            <Badge label={position.type} tone="purple" />
            <Badge icon={Laptop} label={position.workMode} tone="cyan" />
            <Badge icon={Clock} label={position.experience} tone="blue" />
          </div>

          {/* skills chips */}
          <ul className="relative z-10 mt-5 flex flex-wrap gap-2" aria-label={`Skills for ${position.title}`}>
            {position.skills.map((skill) => (
              <li
                key={skill}
                className="rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-white/65"
              >
                {skill}
              </li>
            ))}
          </ul>

          {/* spacer pushes actions to the bottom for equal-height cards */}
          <div className="relative z-10 mt-auto" />

          {/* actions */}
          <div className="relative z-10 mt-6 flex items-center gap-3">
            <MagneticLink
              href={position.applyHref}
              variant="primary"
              ariaLabel={`Apply now for ${position.title}`}
            >
              Apply Now
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />
            </MagneticLink>
            <MagneticLink
              href={position.learnMoreHref}
              variant="secondary"
              ariaLabel={`Learn more about ${position.title}`}
            >
              Learn More
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </MagneticLink>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main component                                                           */
/* -------------------------------------------------------------------------- */

export default function OpenPositions() {
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
      aria-label="Open positions at Axivon Technologies"
      className="relative isolate w-full overflow-hidden px-4 py-24 sm:px-6 sm:py-28 lg:px-10 lg:py-32 2xl:px-20"
      style={{ background: "#050816" }}
    >
      <style>{`
        @keyframes op-spin { to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) {
          .op-respect-motion * { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; }
        }
      `}</style>

      <AuroraLayer reduceMotion={!!reduceMotion} />
      <PerspectiveGrid />
      <FloatingParticles reduceMotion={!!reduceMotion} />
      <NoiseTexture />

      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-[8%] top-[14%] h-72 w-72 rounded-full blur-[100px] sm:h-96 sm:w-96"
        style={{ background: "radial-gradient(circle, rgba(0,212,255,0.26), transparent 70%)", x: orbX, y: orbY }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute bottom-[10%] right-[6%] h-80 w-80 rounded-full blur-[110px] sm:h-[26rem] sm:w-[26rem]"
        style={{ background: "radial-gradient(circle, rgba(37,99,235,0.3), transparent 70%)", x: orbXInverse, y: orbYInverse }}
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
            Open Opportunities
          </motion.span>

          <motion.h2
            variants={fadeUp}
            className="mt-6 text-3xl font-bold leading-[1.15] tracking-tight text-white sm:text-4xl lg:text-[2.75rem]"
          >
            <GradientPhrase>Join Our Team</GradientPhrase>
            <br />
            And <GradientPhrase>Build The Future</GradientPhrase>
          </motion.h2>

          <motion.p variants={fadeUp} className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg">
            We are looking for passionate individuals who love technology,
            innovation, problem-solving, and building meaningful digital
            products. Become part of Axivon Technologies and help create the
            next generation of software, AI solutions, and digital
            experiences.
          </motion.p>
        </motion.div>

        {/* Positions grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.12 }}
          variants={gridContainer}
          className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8"
          role="list"
          aria-label="Open internship positions"
        >
          {POSITIONS.map((position) => (
            <div role="listitem" key={position.id}>
              <PositionCard position={position} />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}