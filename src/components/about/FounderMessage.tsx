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
import { BadgeCheck, CheckCircle2, Quote, Rocket } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Data                                                                      */
/* -------------------------------------------------------------------------- */

const MESSAGE_PARAGRAPHS: string[] = [
  "Axivon Technologies was founded with a simple vision: to help businesses embrace modern technology and unlock their full potential.",
  "We believe technology should not be complicated. It should empower businesses, create opportunities, and drive meaningful growth.",
  "Every project we build reflects our commitment to innovation, quality, transparency, and long-term success. This is just the beginning of our journey, and we are excited to build the future together.",
];

const TRUST_INDICATORS: string[] = [
  "Innovation Driven",
  "Client Focused",
  "Future Ready",
  "Transparent Process",
];

const EASE_PREMIUM = [0.16, 1, 0.3, 1] as const;

/* -------------------------------------------------------------------------- */
/*  Animated text primitives                                                  */
/* -------------------------------------------------------------------------- */

function CharReveal({ text, className }: { text: string; className?: string }) {
  const reduceMotion = useReducedMotion();
  const letters = useMemo(() => Array.from(text), [text]);

  if (reduceMotion) {
    return <span className={className}>{text}</span>;
  }

  return (
    <motion.span
      aria-label={text}
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.025 } } }}
    >
      {letters.map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          aria-hidden="true"
          className="inline-block"
          variants={{
            hidden: { opacity: 0, y: 18, rotateX: -40 },
            visible: {
              opacity: 1,
              y: 0,
              rotateX: 0,
              transition: { duration: 0.45, ease: EASE_PREMIUM },
            },
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.span>
  );
}

function GradientText({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`bg-[length:200%_auto] bg-gradient-to-r from-[#2563EB] via-[#00D4FF] to-[#7C3AED] bg-clip-text text-transparent [animation:gradient-shift_5s_ease_infinite] ${
        className ?? ""
      }`}
    >
      {children}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Floating quote mark                                                       */
/* -------------------------------------------------------------------------- */

function FloatingQuoteMark() {
  const reduceMotion = useReducedMotion();
  return (
    <Quote
      aria-hidden="true"
      strokeWidth={1}
      className={`pointer-events-none absolute -left-3 -top-12 h-28 w-28 text-white/[0.05] sm:-left-6 sm:-top-14 sm:h-36 sm:w-36 ${
        reduceMotion ? "" : "[animation:float_7s_ease-in-out_infinite]"
      }`}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  Founder message + trust indicators                                       */
/* -------------------------------------------------------------------------- */

function MessageParagraphs() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.blockquote
      initial={reduceMotion ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.18 } } }}
      className="relative space-y-5 border-l-2 border-[#2563EB]/40 pl-6 sm:pl-8"
    >
      <FloatingQuoteMark />
      {MESSAGE_PARAGRAPHS.map((paragraph, i) => (
        <motion.p
          key={paragraph.slice(0, 16)}
          variants={{
            hidden: { opacity: 0, y: 22 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE_PREMIUM } },
          }}
          className={
            i === 0
              ? "relative text-xl font-medium leading-relaxed text-white/90 sm:text-2xl"
              : "relative text-base leading-relaxed text-white/55 sm:text-lg"
          }
        >
          {paragraph}
        </motion.p>
      ))}
    </motion.blockquote>
  );
}

function TrustIndicators() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.ul
      role="list"
      aria-label="Axivon Technologies trust indicators"
      initial={reduceMotion ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } } }}
      className="mt-9 flex list-none flex-wrap gap-3"
    >
      {TRUST_INDICATORS.map((label) => (
        <motion.li
          key={label}
          variants={{
            hidden: { opacity: 0, y: 14 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_PREMIUM } },
          }}
          whileHover={reduceMotion ? undefined : { y: -3 }}
          className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/70 backdrop-blur-md transition-all duration-300 hover:border-[#00D4FF]/40 hover:bg-[#00D4FF]/[0.06] hover:text-white hover:shadow-[0_0_22px_-6px_rgba(0,212,255,0.55)]"
        >
          <CheckCircle2 className="h-4 w-4 text-[#00D4FF]" strokeWidth={1.75} aria-hidden="true" />
          {label}
        </motion.li>
      ))}
    </motion.ul>
  );
}

/* -------------------------------------------------------------------------- */
/*  Premium founder card                                                      */
/* -------------------------------------------------------------------------- */

function FounderCard() {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springRotateX = useSpring(rotateX, { stiffness: 150, damping: 20 });
  const springRotateY = useSpring(rotateY, { stiffness: 150, damping: 20 });

  const spotX = useMotionValue(50);
  const spotY = useMotionValue(50);
  const spotlightBackground = useMotionTemplate`radial-gradient(460px circle at ${spotX}% ${spotY}%, rgba(124,58,237,0.18), transparent 70%)`;

  const handleMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (reduceMotion || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      rotateY.set((px - 0.5) * 12);
      rotateX.set((0.5 - py) * 12);
      spotX.set(px * 100);
      spotY.set(py * 100);
    },
    [reduceMotion, rotateX, rotateY, spotX, spotY]
  );

  const handleLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
    setHovered(false);
  }, [rotateX, rotateY]);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleLeave}
      initial={reduceMotion ? false : { opacity: 0, y: 40, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: EASE_PREMIUM }}
      style={{
        rotateX: reduceMotion ? 0 : springRotateX,
        rotateY: reduceMotion ? 0 : springRotateY,
        transformPerspective: 1200,
      }}
      className="group relative mx-auto w-full max-w-md rounded-[28px] border border-white/[0.08] bg-white/[0.02] p-[1px] shadow-[0_0_80px_-20px_rgba(124,58,237,0.5)] transition-shadow duration-500 hover:shadow-[0_0_110px_-15px_rgba(0,212,255,0.45)]"
    >
      {/* dual-speed gradient border beam: accelerates on hover */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px]">
        <div className="absolute inset-[-50%] [animation:spin-cw_9s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0deg,rgba(37,99,235,0.55)_18deg,transparent_60deg)] opacity-60 transition-opacity duration-500 group-hover:opacity-0" />
        <div className="absolute inset-[-50%] [animation:spin-cw_2.5s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0deg,rgba(0,212,255,0.85)_12deg,transparent_45deg)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>

      {/* mouse-follow spotlight */}
      <motion.div
        aria-hidden="true"
        style={{ background: spotlightBackground }}
        className="pointer-events-none absolute inset-0 rounded-[28px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />

      <div className="relative z-10 flex flex-col items-center overflow-hidden rounded-[27px] bg-[#070b1c]/90 px-8 py-10 text-center backdrop-blur-xl sm:px-10 sm:py-12">
        {/* light reflection sheen */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.05] to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-full"
        />

        {/* avatar */}
        <div className="relative mb-6">
          <div
            aria-hidden="true"
            className={`absolute inset-[-14px] rounded-full bg-gradient-to-br from-[#2563EB] via-[#7C3AED] to-[#00D4FF] opacity-40 blur-2xl transition-all duration-700 ${
              hovered ? "scale-125 opacity-70" : ""
            }`}
          />
          <motion.div
            animate={reduceMotion ? undefined : { scale: hovered ? [1, 1.06, 1] : 1 }}
            transition={{ duration: 1.6, repeat: hovered && !reduceMotion ? Infinity : 0, ease: "easeInOut" }}
            className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-[#2563EB] via-[#7C3AED] to-[#00D4FF] p-[3px] sm:h-32 sm:w-32"
          >
            <div className="flex h-full w-full items-center justify-center rounded-full bg-[#0a1024] text-3xl font-semibold tracking-wide text-white sm:text-4xl">
              VK
            </div>
          </motion.div>

          {/* floating verified founder badge */}
          <motion.div
            animate={reduceMotion ? undefined : { y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className={`absolute -bottom-1 -right-1 flex items-center gap-1 rounded-full border border-white/10 bg-[#0a1024] px-2.5 py-1 shadow-[0_0_20px_-4px_rgba(0,212,255,0.6)] transition-shadow duration-500 ${
              hovered ? "shadow-[0_0_32px_-2px_rgba(0,212,255,0.9)]" : ""
            }`}
          >
            <BadgeCheck className="h-3.5 w-3.5 text-[#00D4FF]" strokeWidth={2} aria-hidden="true" />
            <span className="text-[10px] font-medium tracking-wide text-white/80">Verified</span>
          </motion.div>
        </div>

        {/* animated status indicator */}
        <div className="mb-2 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1">
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00D4FF] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00D4FF]" />
          </span>
          <span className="text-[11px] font-medium tracking-wide text-white/60">Actively Building</span>
        </div>

        <h3 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Vikas Kumar</h3>
        <p className="mt-1 text-sm font-medium text-[#00D4FF]">Founder &amp; CEO</p>
        <p className="mt-0.5 text-sm text-white/45">Axivon Technologies</p>

        <div aria-hidden="true" className="my-6 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="flex items-center gap-2 text-white/70">
          <motion.span
            animate={reduceMotion ? undefined : { scale: [1, 1.18, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Rocket className="h-4 w-4 text-[#7C3AED]" strokeWidth={1.75} aria-hidden="true" />
          </motion.span>
          <span className="text-sm font-medium tracking-wide">Building The Future</span>
        </div>
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Ambient background layers                                                 */
/* -------------------------------------------------------------------------- */

function AuroraBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute left-[-5%] top-[-10%] h-[560px] w-[560px] rounded-full bg-[#2563EB]/20 blur-[120px] [animation:aurora-drift_19s_ease-in-out_infinite]" />
      <div className="absolute right-[-5%] top-[15%] h-[460px] w-[460px] rounded-full bg-[#7C3AED]/22 blur-[120px] [animation:aurora-drift_23s_ease-in-out_infinite_reverse]" />
      <div className="absolute bottom-[-15%] left-[25%] h-[480px] w-[480px] rounded-full bg-[#00D4FF]/14 blur-[130px] [animation:aurora-drift_27s_ease-in-out_infinite]" />
    </div>
  );
}

function GridPattern() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_35%,black,transparent)]"
    >
      <defs>
        <pattern id="founder-grid" width="48" height="48" patternUnits="userSpaceOnUse">
          <path d="M 48 0 L 0 0 0 48" fill="none" stroke="white" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#founder-grid)" />
    </svg>
  );
}

function NoiseOverlay() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.025] mix-blend-overlay [animation:noise-shift_1.4s_steps(4)_infinite]"
    >
      <filter id="founder-noise">
        <feTurbulence type="fractalNoise" baseFrequency={0.85} numOctaves={2} stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#founder-noise)" />
    </svg>
  );
}

function Vignette() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 [background:radial-gradient(ellipse_80%_60%_at_50%_40%,transparent_40%,#050816_100%)]"
    />
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
      Array.from({ length: 18 }, (_, i) => ({
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

/* -------------------------------------------------------------------------- */
/*  Main export                                                               */
/* -------------------------------------------------------------------------- */

export default function FounderMessage() {
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

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const springMouseX = useSpring(mouseX, { stiffness: 40, damping: 18 });
  const springMouseY = useSpring(mouseY, { stiffness: 40, damping: 18 });
  const orbParallaxX = useTransform(springMouseX, [0, 1], [-26, 26]);
  const orbParallaxY = useTransform(springMouseY, [0, 1], [-26, 26]);

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
      id="founder-message"
      aria-labelledby="founder-message-heading"
      onMouseMove={handleSectionMouseMove}
      className="relative isolate overflow-hidden bg-[#050816] py-24 sm:py-32 2xl:py-36"
    >
      <motion.div aria-hidden="true" style={{ y: backgroundParallaxY }} className="absolute inset-0">
        <motion.div style={{ x: reduceMotion ? 0 : orbParallaxX, y: reduceMotion ? 0 : orbParallaxY }}>
          <AuroraBackground />
        </motion.div>
        <GridPattern />
        <NoiseOverlay />
        <Vignette />
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
            FOUNDER&apos;S MESSAGE
          </span>

          <h2
            id="founder-message-heading"
            className="mt-6 [perspective:1000px] text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            <CharReveal text="Building Technology" className="block" />
            <GradientText className="mt-1 block">With Purpose</GradientText>
          </h2>
        </motion.div>

        {/* Message + Founder card */}
        <div className="mt-16 grid grid-cols-1 items-center gap-14 sm:mt-20 lg:grid-cols-2 lg:gap-16">
          <div>
            <MessageParagraphs />
            <TrustIndicators />
          </div>

          <FounderCard />
        </div>
      </div>

      <style>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes spin-cw {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes aurora-drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(40px, -30px) scale(1.1); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes float-particle {
          0%, 100% { transform: translate(0, 0); opacity: 0.2; }
          50% { transform: translate(10px, -30px); opacity: 0.8; }
        }
        @keyframes noise-shift {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-1%, 1%); }
          50% { transform: translate(1%, -1%); }
          75% { transform: translate(-1%, -1%); }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
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