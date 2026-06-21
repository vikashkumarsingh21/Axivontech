"use client";

import { useRef, useCallback, useMemo, type ReactNode } from "react";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import {
  ArrowRight,
  Home,
  Compass,
  MessageSquare,
  Cpu,
  Code2,
  Boxes,
  Radar,
  Terminal,
  Braces,
  Wifi,
  AlertTriangle,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

interface NavButtonProps {
  href: string;
  children: ReactNode;
  variant: "primary" | "secondary" | "ghost";
  icon: ReactNode;
  ariaLabel: string;
}

interface FloatingPanel {
  id: string;
  Icon: typeof Cpu;
  top: string;
  left: string;
  rotate: number;
  duration: number;
  delay: number;
  depth: number;
  label: string;
}

interface CodeSnippet {
  id: string;
  text: string;
  top: string;
  left: string;
  duration: number;
  delay: number;
}

/* -------------------------------------------------------------------------- */
/*  Static content                                                           */
/* -------------------------------------------------------------------------- */

const FLOATING_PANELS: FloatingPanel[] = [
  { id: "cpu", Icon: Cpu, top: "14%", left: "10%", rotate: -8, duration: 8, delay: 0, depth: 18, label: "core.sys" },
  { id: "code", Icon: Code2, top: "18%", left: "84%", rotate: 6, duration: 9, delay: 0.4, depth: 22, label: "render.tsx" },
  { id: "boxes", Icon: Boxes, top: "72%", left: "8%", rotate: 5, duration: 7.5, delay: 0.8, depth: 16, label: "modules" },
  { id: "radar", Icon: Radar, top: "78%", left: "86%", rotate: -6, duration: 8.5, delay: 1.1, depth: 20, label: "scan.exe" },
  { id: "wifi", Icon: Wifi, top: "8%", left: "50%", rotate: 0, duration: 6.5, delay: 0.2, depth: 14, label: "signal" },
];

const CODE_SNIPPETS: CodeSnippet[] = [
  { id: "s1", text: "GET /page → 404", top: "26%", left: "4%", duration: 10, delay: 0 },
  { id: "s2", text: "route.not.found", top: "62%", left: "82%", duration: 12, delay: 1.4 },
  { id: "s3", text: "{ status: 404 }", top: "44%", left: "88%", duration: 9, delay: 0.6 },
  { id: "s4", text: "<Page missing />", top: "84%", left: "20%", duration: 11, delay: 2 },
];

/* -------------------------------------------------------------------------- */
/*  Animation variants                                                       */
/* -------------------------------------------------------------------------- */

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 26, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

/* -------------------------------------------------------------------------- */
/*  Magnetic / glowing navigation button                                     */
/* -------------------------------------------------------------------------- */

function NavButton({ href, children, variant, icon, ariaLabel }: NavButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 18, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 200, damping: 18, mass: 0.4 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (prefersReducedMotion || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      x.set((e.clientX - rect.left - rect.width / 2) * 0.26);
      y.set((e.clientY - rect.top - rect.height / 2) * 0.3);
    },
    [prefersReducedMotion, x, y]
  );

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  const isPrimary = variant === "primary";
  const isSecondary = variant === "secondary";

  return (
    <motion.div
      style={{ x: springX, y: springY }}
      whileTap={{ scale: 0.96 }}
      whileHover={{ scale: 1.035 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="relative"
    >
      <Link
        ref={ref}
        href={href}
        aria-label={ariaLabel}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={[
          "group relative isolate inline-flex items-center justify-center gap-2.5",
          "rounded-full px-7 py-3.5 text-sm sm:text-base font-semibold tracking-wide",
          "outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050816]",
          "transition-colors duration-300 select-none",
          isPrimary && "text-white focus-visible:ring-cyan-400",
          isSecondary &&
            "text-white/90 border border-white/15 bg-white/[0.04] backdrop-blur-md hover:bg-white/[0.08] hover:border-white/25 focus-visible:ring-white/60",
          !isPrimary &&
            !isSecondary &&
            "text-white/65 hover:text-white border border-transparent hover:border-white/10 focus-visible:ring-white/40",
        ].join(" ")}
      >
        {isPrimary && (
          <>
            <span
              aria-hidden
              className="absolute inset-0 -z-10 rounded-full bg-[linear-gradient(110deg,#2563EB,45%,#7C3AED,75%,#00D4FF)] transition-transform duration-500 group-hover:scale-[1.04]"
            />
            <motion.span
              aria-hidden
              className="absolute -inset-1 -z-20 rounded-full bg-[linear-gradient(110deg,#2563EB,#7C3AED,#00D4FF)] opacity-60 blur-xl"
              animate={
                prefersReducedMotion ? undefined : { opacity: [0.45, 0.75, 0.45], scale: [1, 1.06, 1] }
              }
              transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
            />
            <span className="absolute inset-0 -z-10 rounded-full overflow-hidden">
              <motion.span
                aria-hidden
                className="absolute inset-[-40%] bg-[conic-gradient(from_0deg,transparent,rgba(255,255,255,0.85),transparent_30%)]"
                animate={prefersReducedMotion ? undefined : { rotate: 360 }}
                transition={{ duration: 3.2, repeat: Infinity, ease: "linear" }}
                style={{ mixBlendMode: "overlay" }}
              />
            </span>
          </>
        )}

        <span className="relative z-10">{children}</span>
        <motion.span
          className="relative z-10 flex items-center"
          animate={prefersReducedMotion ? undefined : { x: [0, 4, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          {icon}
        </motion.span>
      </Link>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Decorative: holographic 404 numeral                                      */
/* -------------------------------------------------------------------------- */

function Holographic404({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <motion.div
      className="relative select-none"
      style={{ perspective: 1200 }}
      initial={{ opacity: 0, scale: 0.85, rotateX: 22 }}
      animate={{ opacity: 1, scale: 1, rotateX: 0 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        animate={
          reduceMotion
            ? undefined
            : { y: [0, -10, 0], rotateX: [0, 3, 0], rotateY: [0, -2, 0] }
        }
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d" }}
        className="relative"
      >
        {/* Back glow layer */}
        <span
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(120deg,#2563EB,#7C3AED,#00D4FF)] bg-clip-text text-transparent blur-2xl opacity-70 text-[5.5rem] font-black leading-none tracking-tighter sm:text-[9rem] lg:text-[12rem]"
        >
          404
        </span>

        {/* Main gradient numeral */}
        <motion.h1
          className="relative bg-[linear-gradient(120deg,#2563EB,#7C3AED,#00D4FF,#2563EB)] bg-clip-text text-[5.5rem] font-black leading-none tracking-tighter text-transparent sm:text-[9rem] lg:text-[12rem]"
          style={{
            backgroundSize: "300% 100%",
            WebkitTextStroke: "1px rgba(255,255,255,0.08)",
          }}
          animate={
            reduceMotion
              ? undefined
              : { backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }
          }
          transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
        >
          404
        </motion.h1>

        {/* Glass sheen overlay */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center text-[5.5rem] font-black leading-none tracking-tighter text-white/10 sm:text-[9rem] lg:text-[12rem]"
          style={{
            WebkitMaskImage: "linear-gradient(115deg, transparent 30%, white 50%, transparent 70%)",
            maskImage: "linear-gradient(115deg, transparent 30%, white 50%, transparent 70%)",
          }}
        >
          404
        </span>

        {/* Scanline */}
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 h-px bg-cyan-300/70 blur-[1px]"
          animate={reduceMotion ? undefined : { top: ["0%", "100%", "0%"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Decorative: neon rings                                                   */
/* -------------------------------------------------------------------------- */

function NeonRings({ reduceMotion }: { reduceMotion: boolean }) {
  const rings = [
    { size: 380, color: "rgba(37,99,235,0.35)", duration: 24, reverse: false },
    { size: 540, color: "rgba(124,58,237,0.28)", duration: 32, reverse: true },
    { size: 700, color: "rgba(0,212,255,0.2)", duration: 40, reverse: false },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {rings.map((ring, i) => (
        <motion.div
          key={ring.size}
          aria-hidden="true"
          className="absolute rounded-full border"
          style={{
            width: ring.size,
            height: ring.size,
            borderColor: ring.color,
            borderWidth: 1,
            boxShadow: `0 0 70px ${ring.color}`,
          }}
          animate={
            reduceMotion
              ? undefined
              : { rotate: ring.reverse ? -360 : 360, scale: [1, 1.04, 1] }
          }
          transition={{
            rotate: { duration: ring.duration, repeat: Infinity, ease: "linear" },
            scale: { duration: 6 + i, repeat: Infinity, ease: "easeInOut" },
          }}
        />
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Decorative: floating holographic panels (tech cubes)                     */
/* -------------------------------------------------------------------------- */

function FloatingPanels({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 hidden sm:block" aria-hidden="true">
      {FLOATING_PANELS.map(({ id, Icon, top, left, rotate, duration, delay, depth, label }) => (
        <motion.div
          key={id}
          className="absolute"
          style={{ top, left, rotate }}
          animate={
            reduceMotion
              ? undefined
              : { y: [0, -depth, 0], opacity: [0.35, 0.9, 0.35] }
          }
          transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 py-3 backdrop-blur-sm shadow-[0_0_30px_-10px_rgba(0,212,255,0.5)]">
            <Icon size={20} className="text-cyan-300/80" strokeWidth={1.5} />
            <span className="text-[10px] font-mono tracking-wide text-white/40">{label}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Decorative: floating code snippets / data fragments                      */
/* -------------------------------------------------------------------------- */

function FloatingCodeSnippets({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden="true">
      {CODE_SNIPPETS.map(({ id, text, top, left, duration, delay }) => (
        <motion.div
          key={id}
          className="absolute font-mono text-[11px] text-cyan-200/50"
          style={{ top, left }}
          animate={
            reduceMotion
              ? undefined
              : { y: [0, -16, 0], opacity: [0.2, 0.6, 0.2] }
          }
          transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 backdrop-blur-sm">
            {text}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Decorative: ambient particles                                            */
/* -------------------------------------------------------------------------- */

function AmbientParticles({ reduceMotion }: { reduceMotion: boolean }) {
  const particles = useMemo(
    () =>
      Array.from({ length: 34 }, (_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: Math.random() * 2.4 + 1,
        duration: Math.random() * 10 + 10,
        delay: Math.random() * 6,
      })),
    []
  );

  if (reduceMotion) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full bg-cyan-200/70"
          style={{
            top: `${p.top}%`,
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            boxShadow: "0 0 6px 1px rgba(0,212,255,0.6)",
          }}
          animate={{ y: [0, -44, 0], opacity: [0, 0.9, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Decorative: perspective grid floor                                       */
/* -------------------------------------------------------------------------- */

function PerspectiveGrid() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_30%,black_75%,transparent)]"
    >
      <div
        className="absolute inset-x-0 bottom-0 h-[140%] origin-bottom opacity-[0.16]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(124,58,237,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.5) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          transform: "perspective(600px) rotateX(58deg)",
        }}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Decorative: broken digital portal ring (signature element)               */
/* -------------------------------------------------------------------------- */

function BrokenPortal({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 400 400"
      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[120%] w-[120%] max-w-[820px] opacity-60"
    >
      <defs>
        <linearGradient id="portalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="50%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#00D4FF" />
        </linearGradient>
      </defs>
      <motion.circle
        cx="200"
        cy="200"
        r="170"
        fill="none"
        stroke="url(#portalGrad)"
        strokeWidth="1.5"
        strokeDasharray="280 120 40 60"
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "200px 200px" }}
      />
      <motion.circle
        cx="200"
        cy="200"
        r="150"
        fill="none"
        stroke="url(#portalGrad)"
        strokeWidth="1"
        strokeDasharray="60 30 200 40"
        opacity={0.5}
        animate={reduceMotion ? undefined : { rotate: -360 }}
        transition={{ duration: 34, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "200px 200px" }}
      />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main page                                                                 */
/* -------------------------------------------------------------------------- */

export default function NotFound() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const reduceMotion = Boolean(prefersReducedMotion);

  // Mouse-follow spotlight
  const spotlightX = useMotionValue(50);
  const spotlightY = useMotionValue(50);
  const smoothX = useSpring(spotlightX, { stiffness: 60, damping: 20 });
  const smoothY = useSpring(spotlightY, { stiffness: 60, damping: 20 });
  const spotlightBackground = useTransform(
    [smoothX, smoothY],
    ([sx, sy]) =>
      `radial-gradient(620px circle at ${sx}% ${sy}%, rgba(0,212,255,0.14), transparent 60%)`
  );

  const handlePointerMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (reduceMotion || !sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      spotlightX.set(((e.clientX - rect.left) / rect.width) * 100);
      spotlightY.set(((e.clientY - rect.top) / rect.height) * 100);
    },
    [reduceMotion, spotlightX, spotlightY]
  );

  return (
    <main
      ref={sectionRef}
      onMouseMove={handlePointerMove}
      role="main"
      aria-labelledby="not-found-heading"
      className="relative isolate flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#050816] px-4 py-24 sm:px-6"
    >
      {/* ---------------------------------------------------------------- */}
      {/* Background layers                                                */}
      {/* ---------------------------------------------------------------- */}

      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <motion.div
          className="absolute -top-1/3 left-1/2 h-[60vw] w-[60vw] max-w-[900px] max-h-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.35),transparent_65%)] blur-3xl"
          animate={reduceMotion ? undefined : { x: [-40, 40, -40], y: [0, 30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/4 -right-1/4 h-[50vw] w-[50vw] max-w-[760px] max-h-[760px] rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.3),transparent_65%)] blur-3xl"
          animate={reduceMotion ? undefined : { x: [20, -30, 20], y: [-20, 20, -20] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 left-0 h-[45vw] w-[45vw] max-w-[640px] max-h-[640px] -translate-x-1/4 translate-y-1/4 rounded-full bg-[radial-gradient(circle,rgba(0,212,255,0.25),transparent_65%)] blur-3xl"
          animate={reduceMotion ? undefined : { x: [0, 40, 0], y: [0, -20, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <PerspectiveGrid />
      <AmbientParticles reduceMotion={reduceMotion} />

      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{ background: spotlightBackground }}
        aria-hidden="true"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* ---------------------------------------------------------------- */}
      {/* 3D scene: portal, rings, panels, snippets                        */}
      {/* ---------------------------------------------------------------- */}

      <div className="pointer-events-none absolute inset-0">
        <BrokenPortal reduceMotion={reduceMotion} />
        <NeonRings reduceMotion={reduceMotion} />
        <FloatingPanels reduceMotion={reduceMotion} />
        <FloatingCodeSnippets reduceMotion={reduceMotion} />
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Content                                                          */}
      {/* ---------------------------------------------------------------- */}

      <motion.div
        className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Holographic 404 */}
        <motion.div variants={fadeUpVariants} className="mb-4">
          <Holographic404 reduceMotion={reduceMotion} />
        </motion.div>

        {/* Badge */}
        <motion.div
          variants={fadeUpVariants}
          className="relative mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 backdrop-blur-md"
        >
          <motion.span
            animate={reduceMotion ? undefined : { rotate: [0, 14, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <AlertTriangle className="h-3.5 w-3.5 text-cyan-300" aria-hidden="true" />
          </motion.span>
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-white/80">
            Error 404
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h2
          id="not-found-heading"
          variants={fadeUpVariants}
          className="max-w-2xl text-[1.85rem] font-bold leading-[1.2] tracking-tight text-white sm:text-4xl lg:text-[2.75rem]"
        >
          <span className="relative inline-block">
            <motion.span
              className="bg-[linear-gradient(110deg,#2563EB,#7C3AED,#00D4FF,#2563EB)] bg-clip-text text-transparent"
              style={{ backgroundSize: "300% 100%" }}
              animate={
                reduceMotion ? undefined : { backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }
              }
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            >
              Oops!
            </motion.span>
          </span>{" "}
          This Page{" "}
          <span className="relative inline-block">
            <motion.span
              className="bg-[linear-gradient(110deg,#00D4FF,#2563EB,#7C3AED,#00D4FF)] bg-clip-text text-transparent"
              style={{ backgroundSize: "300% 100%" }}
              animate={
                reduceMotion ? undefined : { backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }
              }
              transition={{ duration: 6, repeat: Infinity, ease: "linear", delay: 0.4 }}
            >
              Doesn&rsquo;t Exist
            </motion.span>
          </span>
        </motion.h2>

        {/* Description */}
        <motion.p
          variants={fadeUpVariants}
          className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg"
        >
          The page you are looking for may have been moved, deleted, or never existed.
          Let&rsquo;s get you back on track.
        </motion.p>

        {/* Buttons */}
        <motion.div
          variants={fadeUpVariants}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <NavButton
            href="/"
            variant="primary"
            ariaLabel="Go to the Axivon Technologies homepage"
            icon={<Home className="h-4 w-4" aria-hidden="true" />}
          >
            Go To Homepage
          </NavButton>
          <NavButton
            href="/services"
            variant="secondary"
            ariaLabel="Explore Axivon Technologies services"
            icon={<Compass className="h-4 w-4" aria-hidden="true" />}
          >
            Explore Services
          </NavButton>
          <NavButton
            href="/contact"
            variant="ghost"
            ariaLabel="Contact Axivon Technologies"
            icon={<MessageSquare className="h-4 w-4" aria-hidden="true" />}
          >
            Contact Us
          </NavButton>
        </motion.div>

        {/* Bottom system readout */}
        <motion.div
          variants={fadeUpVariants}
          className="mt-12 flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-white/35"
        >
          <Terminal className="h-3.5 w-3.5" aria-hidden="true" />
          <span>axivon://system · route_not_found</span>
          <Braces className="h-3.5 w-3.5" aria-hidden="true" />
        </motion.div>
      </motion.div>
    </main>
  );
}