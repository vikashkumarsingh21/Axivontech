"use client";

import React, { useCallback, useMemo, useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { BadgeCheck, Quote, Star } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Data                                                                      */
/* -------------------------------------------------------------------------- */

interface TestimonialEntry {
  id: string;
  name: string;
  role: string;
  feedback: string;
  initials: string;
}

const TESTIMONIALS: TestimonialEntry[] = [
  {
    id: "project-mentor",
    name: "Project Mentor",
    role: "Innovation Mentor",
    feedback:
      "Axivon Technologies demonstrated exceptional technical skills, innovative thinking, and a strong commitment to solving real-world problems through technology.",
    initials: "PM",
  },
  {
    id: "hackathon-reviewer",
    name: "Hackathon Reviewer",
    role: "Technical Evaluator",
    feedback:
      "The project showcased impressive execution, attention to detail, and practical application of emerging technologies.",
    initials: "HR",
  },
  {
    id: "startup-founder",
    name: "Startup Founder",
    role: "Business Collaborator",
    feedback:
      "Working with Axivon Technologies was seamless. Their ability to transform ideas into scalable digital products is outstanding.",
    initials: "SF",
  },
  {
    id: "technology-consultant",
    name: "Technology Consultant",
    role: "Industry Expert",
    feedback:
      "Their focus on innovation, performance, and user experience sets them apart from traditional development teams.",
    initials: "TC",
  },
];

const EASE_PREMIUM = [0.16, 1, 0.3, 1] as const;

/* -------------------------------------------------------------------------- */
/*  Text primitives                                                           */
/* -------------------------------------------------------------------------- */

function GradientText({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-[length:200%_auto] bg-gradient-to-r from-[#2563EB] via-[#00D4FF] to-[#7C3AED] bg-clip-text text-transparent [animation:gradient-shift_5s_ease_infinite]">
      {children}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Rating stars                                                              */
/* -------------------------------------------------------------------------- */

function RatingStars({ delayOffset }: { delayOffset: number }) {
  const reduceMotion = useReducedMotion();

  return (
    <div role="img" aria-label="Rated 5 out of 5 stars" className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => i).map((i) => (
        <motion.span
          key={i}
          aria-hidden={true}
          initial={reduceMotion ? false : { opacity: 0, scale: 0.4 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.35, delay: delayOffset + i * 0.06, ease: EASE_PREMIUM }}
        >
          <Star className="h-4 w-4 text-amber-400" fill="currentColor" strokeWidth={0} />
        </motion.span>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Testimonial card                                                          */
/* -------------------------------------------------------------------------- */

function TestimonialCard({ entry, index }: { entry: TestimonialEntry; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springRotateX = useSpring(rotateX, { stiffness: 150, damping: 20 });
  const springRotateY = useSpring(rotateY, { stiffness: 150, damping: 20 });

  const spotX = useMotionValue(50);
  const spotY = useMotionValue(50);
  const spotlightBackground = useMotionTemplate`radial-gradient(380px circle at ${spotX}% ${spotY}%, rgba(0,212,255,0.14), transparent 70%)`;

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

  return (
    <motion.article
      ref={ref}
      tabIndex={0}
      aria-label={`Testimonial from ${entry.name}, ${entry.role}`}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      initial={reduceMotion ? false : { opacity: 0, y: 40, scale: 0.94 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay: index * 0.12, ease: EASE_PREMIUM }}
      whileHover={reduceMotion ? undefined : { y: -8, scale: 1.03 }}
      whileFocus={reduceMotion ? undefined : { y: -8, scale: 1.03 }}
      style={{
        rotateX: reduceMotion ? 0 : springRotateX,
        rotateY: reduceMotion ? 0 : springRotateY,
        transformPerspective: 1000,
      }}
      className="group relative rounded-[32px] border border-white/10 bg-white/[0.03] p-[1px] shadow-[0_0_50px_-20px_rgba(37,99,235,0.5)] outline-none transition-shadow duration-500 hover:shadow-[0_0_90px_-15px_rgba(0,212,255,0.5)] focus-visible:shadow-[0_0_90px_-15px_rgba(0,212,255,0.5)] focus-visible:ring-2 focus-visible:ring-[#00D4FF]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050816]"
    >
      {/* dual-speed gradient border beam */}
      <div aria-hidden={true} className="pointer-events-none absolute inset-0 overflow-hidden rounded-[32px]">
        <div className="absolute inset-[-50%] [animation:spin-cw_10s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0deg,rgba(37,99,235,0.45)_16deg,transparent_55deg)] opacity-50 transition-opacity duration-500 group-hover:opacity-0" />
        <div className="absolute inset-[-50%] [animation:spin-cw_3s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0deg,rgba(0,212,255,0.85)_12deg,transparent_45deg)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>

      {/* mouse-follow spotlight */}
      <motion.div
        aria-hidden={true}
        style={{ background: spotlightBackground }}
        className="pointer-events-none absolute inset-0 rounded-[32px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />

      <div className="relative z-10 flex h-full flex-col gap-5 overflow-hidden rounded-[31px] bg-[#070b1c]/90 p-6 backdrop-blur-xl sm:p-7">
        {/* light reflection sheen */}
        <div
          aria-hidden={true}
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.05] to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-full"
        />

        <div className="flex items-center gap-3">
          <motion.div
            aria-hidden={true}
            animate={reduceMotion ? undefined : { y: [0, -5, 0] }}
            transition={{ duration: 4 + index * 0.3, repeat: Infinity, ease: "easeInOut" }}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2563EB] via-[#7C3AED] to-[#00D4FF] p-[2px]"
          >
            <div className="flex h-full w-full items-center justify-center rounded-full bg-[#0a1024] text-sm font-semibold text-white">
              {entry.initials}
            </div>
          </motion.div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{entry.name}</p>
            <p className="truncate text-xs text-white/45">{entry.role}</p>
          </div>
        </div>

        <span className="inline-flex w-fit items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] font-medium tracking-wide text-white/70">
          <BadgeCheck className="h-3 w-3 text-[#00D4FF]" strokeWidth={2} aria-hidden={true} />
          Verified Feedback
        </span>

        <Quote aria-hidden={true} strokeWidth={1.5} className="h-6 w-6 text-[#00D4FF]/40" />

        <p className="flex-1 text-sm leading-relaxed text-white/65">{entry.feedback}</p>

        <RatingStars delayOffset={index * 0.12} />
      </div>
    </motion.article>
  );
}

/* -------------------------------------------------------------------------- */
/*  Ambient background layers                                                 */
/* -------------------------------------------------------------------------- */

function AuroraBackground() {
  return (
    <div aria-hidden={true} className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute left-[-6%] top-[-10%] h-[560px] w-[560px] rounded-full bg-[#2563EB]/20 blur-[120px] [animation:aurora-drift_19s_ease-in-out_infinite]" />
      <div className="absolute right-[-6%] top-[18%] h-[480px] w-[480px] rounded-full bg-[#7C3AED]/20 blur-[120px] [animation:aurora-drift_24s_ease-in-out_infinite_reverse]" />
      <div className="absolute bottom-[-14%] left-[28%] h-[500px] w-[500px] rounded-full bg-[#00D4FF]/14 blur-[130px] [animation:aurora-drift_28s_ease-in-out_infinite]" />
    </div>
  );
}

function PerspectiveGrid() {
  return (
    <div
      aria-hidden={true}
      className="pointer-events-none absolute inset-x-0 bottom-0 h-[420px] overflow-hidden [mask-image:linear-gradient(to_top,black,transparent)]"
    >
      <div
        className="absolute inset-0 [animation:grid-scroll_12s_linear_infinite] [transform:perspective(600px)_rotateX(62deg)] [transform-origin:bottom]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,212,255,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.16) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
    </div>
  );
}

function NoiseOverlay() {
  return (
    <svg
      aria-hidden={true}
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.025] mix-blend-overlay [animation:noise-shift_1.4s_steps(4)_infinite]"
    >
      <filter id="testimonials-noise">
        <feTurbulence type="fractalNoise" baseFrequency={0.85} numOctaves={2} stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#testimonials-noise)" />
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
      Array.from({ length: 20 }, (_, i) => ({
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
    <div aria-hidden={true} className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((particle) => (
        <span
          key={particle.id}
          className="absolute rounded-full bg-[#00D4FF]/30"
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

export default function ClientTestimonials() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="client-testimonials"
      aria-labelledby="testimonials-heading"
      className="relative isolate overflow-hidden bg-[#050816] py-24 sm:py-32 2xl:py-36"
    >
      <div aria-hidden={true} className="absolute inset-0">
        <AuroraBackground />
        <PerspectiveGrid />
        <NoiseOverlay />
      </div>
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
            <span aria-hidden={true} className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#00D4FF]" />
            TESTIMONIALS
          </span>

          <h2
            id="testimonials-heading"
            className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            <GradientText>Trusted</GradientText> By People Who
            <br className="hidden sm:block" />
            <GradientText>Experienced Our Work</GradientText>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-balance text-base leading-relaxed text-white/55 sm:text-lg">
            Hear what clients, mentors, collaborators, and project stakeholders have to
            say about the quality, innovation, and impact of Axivon Technologies.
          </p>
        </motion.div>

        {/* Testimonial grid */}
        <div className="mt-16 grid grid-cols-1 gap-6 sm:mt-20 sm:grid-cols-2 lg:grid-cols-4 2xl:gap-8">
          {TESTIMONIALS.map((entry, index) => (
            <TestimonialCard key={entry.id} entry={entry} index={index} />
          ))}
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
        @keyframes grid-scroll {
          from { background-position: 0 0; }
          to { background-position: 0 56px; }
        }
        @keyframes float-particle {
          0%, 100% { transform: translate(0, 0); opacity: 0.2; }
          50% { transform: translate(10px, -30px); opacity: 0.7; }
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