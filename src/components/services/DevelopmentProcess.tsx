"use client";

import {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
  memo,
} from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  useMotionValue,
  useSpring,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import {
  Compass,
  Map,
  PenTool,
  Code2,
  ShieldCheck,
  Rocket,
  TrendingUp,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Step {
  id: number;
  number: string;
  title: string;
  description: string;
  Icon: React.ElementType;
  color: string;
  glow: string;
  glowRgba: string;
  gradient: string;
  detail: string[];
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  dur: number;
  delay: number;
  color: string;
  opacity: number;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const STEPS: Step[] = [
  {
    id: 1,
    number: "01",
    title: "Discovery",
    description: "Deep-dive into your vision, goals, and market landscape.",
    Icon: Compass,
    color: "#2563EB",
    glow: "#2563EB",
    glowRgba: "rgba(37,99,235,0.45)",
    gradient: "from-[#2563EB] to-[#00D4FF]",
    detail: ["Stakeholder interviews", "Market analysis", "Goal alignment"],
  },
  {
    id: 2,
    number: "02",
    title: "Strategy",
    description: "Craft a clear roadmap with milestones, tech stack, and priorities.",
    Icon: Map,
    color: "#3B5BDB",
    glow: "#3B5BDB",
    glowRgba: "rgba(59,91,219,0.45)",
    gradient: "from-[#3B5BDB] to-[#7C3AED]",
    detail: ["Tech architecture", "Sprint planning", "Risk mapping"],
  },
  {
    id: 3,
    number: "03",
    title: "Design",
    description: "Pixel-perfect UI/UX that balances beauty with conversion.",
    Icon: PenTool,
    color: "#7C3AED",
    glow: "#7C3AED",
    glowRgba: "rgba(124,58,237,0.45)",
    gradient: "from-[#7C3AED] to-[#9333EA]",
    detail: ["Wireframes & prototypes", "Design systems", "User testing"],
  },
  {
    id: 4,
    number: "04",
    title: "Development",
    description: "Scalable, clean code built with the right technologies.",
    Icon: Code2,
    color: "#9333EA",
    glow: "#9333EA",
    glowRgba: "rgba(147,51,234,0.45)",
    gradient: "from-[#9333EA] to-[#00D4FF]",
    detail: ["Agile sprints", "Code reviews", "CI/CD pipelines"],
  },
  {
    id: 5,
    number: "05",
    title: "Testing",
    description: "Rigorous QA across devices, browsers, and edge cases.",
    Icon: ShieldCheck,
    color: "#06B6D4",
    glow: "#06B6D4",
    glowRgba: "rgba(6,182,212,0.45)",
    gradient: "from-[#06B6D4] to-[#00D4FF]",
    detail: ["Automated testing", "Performance audits", "Security checks"],
  },
  {
    id: 6,
    number: "06",
    title: "Launch",
    description: "Smooth deployment with zero downtime and full monitoring.",
    Icon: Rocket,
    color: "#00D4FF",
    glow: "#00D4FF",
    glowRgba: "rgba(0,212,255,0.45)",
    gradient: "from-[#00D4FF] to-[#2563EB]",
    detail: ["Cloud deployment", "DNS & CDN setup", "Launch checklist"],
  },
  {
    id: 7,
    number: "07",
    title: "Growth Support",
    description: "Ongoing optimization, analytics, and feature iteration.",
    Icon: TrendingUp,
    color: "#2563EB",
    glow: "#2563EB",
    glowRgba: "rgba(37,99,235,0.45)",
    gradient: "from-[#2563EB] to-[#7C3AED]",
    detail: ["Analytics & insights", "Feature roadmap", "24/7 support"],
  },
];

// ─── Particles ────────────────────────────────────────────────────────────────

const BackgroundParticles = memo(function BackgroundParticles() {
  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 1.8 + 0.6,
        dur: Math.random() * 14 + 9,
        delay: Math.random() * 9,
        color: ["#2563EB", "#7C3AED", "#00D4FF"][i % 3],
        opacity: Math.random() * 0.18 + 0.07,
      })),
    []
  );

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size * 2,
            height: p.size * 2,
            background: p.color,
            opacity: p.opacity,
            boxShadow: `0 0 ${p.size * 5}px ${p.color}`,
          }}
          animate={{
            y: [0, -22, 0],
            x: [0, Math.sin(p.id * 1.4) * 10, 0],
            opacity: [p.opacity, p.opacity * 2.2, p.opacity],
          }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
});

// ─── Aurora Background ────────────────────────────────────────────────────────

const AuroraBackground = memo(function AuroraBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />
      <motion.div
        className="absolute rounded-full blur-[170px]"
        style={{
          width: 750, height: 420,
          background: "radial-gradient(ellipse, rgba(37,99,235,0.13), transparent 70%)",
          top: "-5%", left: "-8%",
        }}
        animate={{ x: [0, 80, 0], y: [0, 50, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute rounded-full blur-[180px]"
        style={{
          width: 600, height: 500,
          background: "radial-gradient(ellipse, rgba(124,58,237,0.11), transparent 70%)",
          bottom: "-5%", right: "-5%",
        }}
        animate={{ x: [0, -55, 0], y: [0, -35, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut", delay: 5 }}
      />
      <motion.div
        className="absolute rounded-full blur-[130px]"
        style={{
          width: 500, height: 500,
          background: "radial-gradient(circle, rgba(0,212,255,0.07), transparent 70%)",
          top: "40%", left: "45%",
          translateX: "-50%",
        }}
        animate={{ x: [0, 40, -30, 0], y: [0, -28, 28, 0] }}
        transition={{ duration: 34, repeat: Infinity, ease: "easeInOut", delay: 10 }}
      />
    </div>
  );
});

// ─── Mouse Spotlight ──────────────────────────────────────────────────────────

function MouseSpotlight({ sectionRef }: { sectionRef: React.RefObject<HTMLElement | null> }) {
  const mx = useMotionValue(-1000);
  const my = useMotionValue(-1000);
  const sx = useSpring(mx, { stiffness: 55, damping: 20 });
  const sy = useSpring(my, { stiffness: 55, damping: 20 });

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      mx.set(e.clientX - rect.left);
      my.set(e.clientY - rect.top);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [mx, my, sectionRef]);

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0"
      style={{
        background: `radial-gradient(400px circle at ${sx}px ${sy}px, rgba(37,99,235,0.06), transparent 55%)`,
      }}
    />
  );
}

// ─── Border Beam ──────────────────────────────────────────────────────────────

const BorderBeam = memo(function BorderBeam({
  gradient,
  active,
  reduced,
}: {
  gradient: string;
  active: boolean;
  reduced: boolean;
}) {
  if (!active || reduced) return null;
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[24px] overflow-hidden">
      <motion.div
        className={`absolute h-[2px] w-24 bg-gradient-to-r ${gradient} blur-[1px] opacity-90`}
        animate={{ offsetDistance: ["0%", "100%"] }}
        style={{
          offsetPath: `path('M 24 0 L calc(100% - 24px) 0 Q 100% 0 100% 24px L 100% calc(100% - 24px) Q 100% 100% calc(100% - 24px) 100% L 24px 100% Q 0 100% 0 calc(100% - 24px) L 0 24px Q 0 0 24px 0 Z')`,
        }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
});

// ─── Desktop Timeline Path ─────────────────────────────────────────────────────

function TimelinePath({
  visible,
  reduced,
}: {
  visible: boolean;
  reduced: boolean;
}) {
  // A smooth horizontal SVG path with gentle vertical wave
  const pathD =
    "M 0 40 C 80 40, 100 20, 180 40 C 260 60, 280 20, 360 40 C 440 60, 460 20, 540 40 C 620 60, 640 20, 720 40 C 800 60, 820 20, 900 40 C 980 60, 1000 20, 1080 40 C 1160 60, 1180 20, 1260 40";

  return (
    <div className="relative w-full h-20 hidden lg:block" aria-hidden="true">
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1260 80"
        preserveAspectRatio="none"
        fill="none"
      >
        <defs>
          <linearGradient id="pathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2563EB" stopOpacity="0.3" />
            <stop offset="35%" stopColor="#7C3AED" stopOpacity="0.4" />
            <stop offset="70%" stopColor="#00D4FF" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#2563EB" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="beamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="40%" stopColor="#00D4FF" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#7C3AED" stopOpacity="0.9" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          <filter id="beamBlur">
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>

        {/* Base path */}
        <motion.path
          d={pathD}
          stroke="url(#pathGrad)"
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={visible ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
          transition={{ duration: reduced ? 0 : 2.2, ease: "easeInOut", delay: 0.3 }}
        />

        {/* Dashed overlay */}
        <motion.path
          d={pathD}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1"
          strokeDasharray="4 8"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={visible ? { pathLength: 1 } : { pathLength: 0 }}
          transition={{ duration: reduced ? 0 : 2.2, ease: "easeInOut", delay: 0.5 }}
        />

        {/* Moving beam */}
        {!reduced && visible && (
          <motion.path
            d={pathD}
            stroke="url(#beamGrad)"
            strokeWidth="3"
            strokeLinecap="round"
            filter="url(#beamBlur)"
            style={{ pathLength: 0.12 }}
            animate={{ offsetDistance: ["0%", "100%"] }}
            initial={{ opacity: 0 }}
            transition={{
              offsetDistance: { duration: 4, repeat: Infinity, ease: "easeInOut", repeatType: "loop" },
              opacity: { duration: 0.5, delay: 2 },
            }}
          />
        )}
      </svg>
    </div>
  );
}

// ─── Vertical Timeline Line (Mobile) ──────────────────────────────────────────

function VerticalLine({ visible, reduced }: { visible: boolean; reduced: boolean }) {
  return (
    <div className="absolute left-6 top-0 bottom-0 w-px lg:hidden" aria-hidden="true">
      <motion.div
        className="w-full origin-top"
        style={{
          background: "linear-gradient(to bottom, #2563EB, #7C3AED, #00D4FF, #2563EB)",
          opacity: 0.35,
        }}
        initial={{ scaleY: 0 }}
        animate={visible ? { scaleY: 1 } : { scaleY: 0 }}
        transition={{ duration: reduced ? 0 : 1.8, ease: "easeInOut", delay: 0.2 }}
      />
      {/* Moving bead */}
      {!reduced && visible && (
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 w-2 h-8 rounded-full blur-sm"
          style={{ background: "linear-gradient(to bottom, #00D4FF, #7C3AED)" }}
          animate={{ top: ["0%", "100%", "0%"] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      )}
    </div>
  );
}

// ─── Step Card ────────────────────────────────────────────────────────────────

const StepCard = memo(function StepCard({
  step,
  index,
  visible,
  reduced,
  isHorizontal,
}: {
  step: Step;
  index: number;
  visible: boolean;
  reduced: boolean;
  isHorizontal: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 170, damping: 22 });
  const springY = useSpring(rotateY, { stiffness: 170, damping: 22 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current || reduced) return;
      const rect = cardRef.current.getBoundingClientRect();
      const cx = e.clientX - rect.left - rect.width / 2;
      const cy = e.clientY - rect.top - rect.height / 2;
      rotateX.set((-cy / (rect.height / 2)) * 5);
      rotateY.set((cx / (rect.width / 2)) * 5);
    },
    [reduced, rotateX, rotateY]
  );

  const handleMouseLeave = useCallback(() => {
    setHovered(false);
    rotateX.set(0);
    rotateY.set(0);
  }, [rotateX, rotateY]);

  // Stagger: horizontal staggers left to right; vertical staggers top down
  const delay = reduced ? 0 : index * 0.11 + 0.4;

  const cardVariants = {
    hidden: isHorizontal
      ? { opacity: 0, y: 36, scale: 0.92 }
      : { opacity: 0, x: -28, scale: 0.94 },
    visible: {
      opacity: 1, y: 0, x: 0, scale: 1,
      transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <motion.div
      variants={reduced ? undefined : cardVariants}
      initial={reduced ? undefined : "hidden"}
      animate={visible ? "visible" : "hidden"}
      style={
        reduced
          ? undefined
          : { rotateX: springX, rotateY: springY, transformPerspective: 900 }
      }
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="group relative outline-none"
    >
      <div
        ref={cardRef}
        className="relative flex flex-col gap-4 rounded-[24px] border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-6 overflow-hidden transition-colors duration-400 cursor-default"
        style={{
          boxShadow: hovered
            ? `0 0 0 1px ${step.glowRgba}, 0 8px 50px -8px ${step.glowRgba}, 0 20px 60px -16px ${step.glowRgba}50`
            : "inset 0 1px 0 rgba(255,255,255,0.04)",
          borderColor: hovered ? `${step.glow}50` : "rgba(255,255,255,0.08)",
          transition: "box-shadow 0.4s ease, border-color 0.4s ease",
          minHeight: isHorizontal ? 220 : undefined,
        }}
        role="article"
        aria-label={`Step ${step.number}: ${step.title}`}
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setExpanded((v) => !v)}
        onFocus={() => setHovered(true)}
        onBlur={handleMouseLeave}
      >
        {/* Inner glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-12 -left-12 w-36 h-36 rounded-full blur-3xl transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle, ${step.glowRgba}, transparent)`,
            opacity: hovered ? 0.4 : 0.1,
          }}
        />

        {/* Spotlight sweep */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[24px] transition-opacity duration-500"
          style={{
            background: `radial-gradient(ellipse 65% 45% at 50% 0%, ${step.glow}18, transparent)`,
            opacity: hovered ? 1 : 0,
          }}
        />

        <BorderBeam gradient={step.gradient} active={hovered} reduced={reduced} />

        {/* Step number */}
        <div className="flex items-center justify-between">
          <span
            className="text-[11px] font-bold tracking-[0.2em] uppercase"
            style={{ color: step.color, opacity: 0.7 }}
          >
            {step.number}
          </span>

          {/* Pulse dot */}
          <div className="relative flex" aria-hidden="true">
            <motion.span
              className="absolute inline-flex h-2.5 w-2.5 rounded-full opacity-60"
              style={{ background: step.color }}
              animate={reduced ? {} : { scale: [1, 2.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2.2, repeat: Infinity, delay: index * 0.3 }}
            />
            <span
              className="relative inline-flex rounded-full h-2.5 w-2.5"
              style={{ background: step.color }}
            />
          </div>
        </div>

        {/* Icon */}
        <motion.div
          className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-lg flex-shrink-0`}
          animate={
            reduced
              ? {}
              : hovered
              ? { scale: 1.12, rotate: 10, y: -3 }
              : { scale: 1, rotate: 0, y: 0 }
          }
          transition={{ duration: 0.35, ease: "easeOut" }}
          aria-hidden="true"
        >
          <step.Icon className="w-5 h-5 text-white" strokeWidth={1.9} />
        </motion.div>

        {/* Title */}
        <h3 className="text-white font-bold text-lg tracking-tight leading-tight">
          {step.title}
        </h3>

        {/* Description */}
        <p className="text-white/45 text-sm leading-relaxed">{step.description}</p>

        {/* Detail list — expands on hover or focus */}
        <AnimatePresence>
          {(hovered || expanded) && (
            <motion.ul
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="overflow-hidden flex flex-col gap-1.5"
              role="list"
              aria-label={`${step.title} details`}
            >
              {step.detail.map((d, i) => (
                <motion.li
                  key={d}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.22 }}
                  className="flex items-center gap-2 text-xs"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  <span
                    className="w-1 h-1 rounded-full flex-shrink-0"
                    style={{ background: step.color }}
                    aria-hidden="true"
                  />
                  {d}
                </motion.li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
});

// ─── Section Header ───────────────────────────────────────────────────────────

const SectionHeader = memo(function SectionHeader({
  visible,
  reduced,
}: {
  visible: boolean;
  reduced: boolean;
}) {
  const v = (i: number) => ({
    hidden: { opacity: 0, y: 26, filter: "blur(7px)" },
    visible: {
      opacity: 1, y: 0, filter: "blur(0px)",
      transition: { duration: 0.72, delay: i * 0.13, ease: [0.22, 1, 0.36, 1] },
    },
  });

  return (
    <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col items-center gap-5">
      <motion.div
        variants={reduced ? undefined : v(0)}
        initial={reduced ? undefined : "hidden"}
        animate={visible ? "visible" : "hidden"}
      >
        <span
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-sm text-xs font-semibold tracking-[0.18em] uppercase text-[#00D4FF]"
          aria-label="Section: Our Process"
        >
          <span aria-hidden="true" className="relative flex">
            <span className="absolute inline-flex h-2 w-2 rounded-full bg-[#00D4FF] opacity-70 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00D4FF]" />
          </span>
          Our Process
        </span>
      </motion.div>

      <motion.h2
        variants={reduced ? undefined : v(1)}
        initial={reduced ? undefined : "hidden"}
        animate={visible ? "visible" : "hidden"}
        className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.1]"
        id="process-heading"
      >
        How We Turn Ideas Into
        <br />
        <span
          className="bg-gradient-to-r from-[#2563EB] via-[#7C3AED] to-[#00D4FF] bg-clip-text text-transparent"
          style={{
            backgroundSize: "200% 100%",
            animation: reduced ? "none" : "gradientShift 5s ease infinite",
          }}
        >
          Digital Success
        </span>
      </motion.h2>

      <motion.p
        variants={reduced ? undefined : v(2)}
        initial={reduced ? undefined : "hidden"}
        animate={visible ? "visible" : "hidden"}
        className="text-white/45 text-base sm:text-lg leading-relaxed max-w-xl"
      >
        A proven development methodology that transforms ideas into scalable
        digital products.
      </motion.p>
    </div>
  );
});

// ─── Desktop Horizontal Layout ────────────────────────────────────────────────

function HorizontalTimeline({
  visible,
  reduced,
}: {
  visible: boolean;
  reduced: boolean;
}) {
  return (
    <div className="hidden lg:flex flex-col gap-0">
      {/* Top row: cards 1,3,5,7 (odd indices) */}
      <div className="grid grid-cols-7 gap-4 mb-0">
        {STEPS.map((step, i) =>
          i % 2 === 0 ? (
            <div key={step.id} className="col-span-1">
              <StepCard step={step} index={i} visible={visible} reduced={reduced} isHorizontal />
            </div>
          ) : (
            <div key={step.id} className="col-span-1 invisible pointer-events-none" aria-hidden="true" />
          )
        )}
      </div>

      {/* Animated path */}
      <TimelinePath visible={visible} reduced={reduced} />

      {/* Bottom row: cards 2,4,6 (even indices) */}
      <div className="grid grid-cols-7 gap-4">
        {STEPS.map((step, i) =>
          i % 2 !== 0 ? (
            <div key={step.id} className="col-span-1">
              <StepCard step={step} index={i} visible={visible} reduced={reduced} isHorizontal />
            </div>
          ) : (
            <div key={step.id} className="col-span-1 invisible pointer-events-none" aria-hidden="true" />
          )
        )}
      </div>
    </div>
  );
}

// ─── Mobile Vertical Layout ───────────────────────────────────────────────────

function VerticalTimeline({
  visible,
  reduced,
}: {
  visible: boolean;
  reduced: boolean;
}) {
  return (
    <div className="lg:hidden relative pl-14">
      <VerticalLine visible={visible} reduced={reduced} />

      {/* Node dots on line */}
      {STEPS.map((step, i) => (
        <div
          key={step.id}
          className="relative mb-5 last:mb-0"
          style={{ minHeight: 90 }}
        >
          {/* Timeline node */}
          <div
            className="absolute -left-14 top-6 flex items-center justify-center w-5 h-5 rounded-full border-2 border-[#050816] z-10"
            style={{ background: step.color, boxShadow: `0 0 10px ${step.glowRgba}` }}
            aria-hidden="true"
          >
            <motion.div
              className="w-2 h-2 rounded-full bg-white"
              animate={reduced ? {} : { scale: [1, 1.5, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.25 }}
            />
          </div>

          <StepCard step={step} index={i} visible={visible} reduced={reduced} isHorizontal={false} />
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DevelopmentProcess() {
  const reduced = useReducedMotion() ?? false;
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  return (
    <>
      <style>{`
        @keyframes gradientShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      <section
        ref={sectionRef}
        id="development-process"
        aria-labelledby="process-heading"
        className="relative w-full overflow-hidden py-24 sm:py-32"
        style={{ background: "#050816" }}
      >
        {/* Background layers */}
        <AuroraBackground />
        {!reduced && <BackgroundParticles />}
        {!reduced && <MouseSpotlight sectionRef={sectionRef} />}

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader visible={isInView} reduced={reduced} />

          {/* Layouts */}
          <HorizontalTimeline visible={isInView} reduced={reduced} />
          <VerticalTimeline visible={isInView} reduced={reduced} />
        </div>

        {/* Bottom fade */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-24"
          style={{ background: "linear-gradient(to bottom, transparent, #050816)" }}
        />
      </section>
    </>
  );
}