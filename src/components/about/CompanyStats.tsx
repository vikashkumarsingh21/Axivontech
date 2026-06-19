"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useInView, useReducedMotion, useMotionValue, useSpring } from "framer-motion";
import { Briefcase, Cpu, Clock3, HeartHandshake } from "lucide-react";
import type { TargetAndTransition } from "framer-motion";
const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const;

// ─── Types ───────────────────────────────────────────────────────────────────

interface Stat {
  id: number;
  number: number;
  suffix: string;
  title: string;
  description: string;
  Icon: React.ElementType;
  gradient: string;
  glowColor: string;
  ariaLabel: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const STATS: Stat[] = [
  {
    id: 1,
    number: 20,
    suffix: "+",
    title: "Projects Delivered",
    description:
      "Successfully delivered modern websites, applications, and digital solutions.",
    Icon: Briefcase,
    gradient: "from-[#2563EB] to-[#00D4FF]",
    glowColor: "rgba(37,99,235,0.35)",
    ariaLabel: "20 plus projects delivered",
  },
  {
    id: 2,
    number: 10,
    suffix: "+",
    title: "Technologies Used",
    description:
      "Modern technologies powering scalable and future-ready solutions.",
    Icon: Cpu,
    gradient: "from-[#7C3AED] to-[#2563EB]",
    glowColor: "rgba(124,58,237,0.35)",
    ariaLabel: "10 plus technologies used",
  },
  {
    id: 3,
    number: 24,
    suffix: " Hours",
    title: "Response Time",
    description:
      "Fast communication and dedicated support for every client.",
    Icon: Clock3,
    gradient: "from-[#00D4FF] to-[#7C3AED]",
    glowColor: "rgba(0,212,255,0.35)",
    ariaLabel: "24 hour response time",
  },
  {
    id: 4,
    number: 100,
    suffix: "%",
    title: "Client Focus",
    description:
      "Every decision is made to maximize business growth and user experience.",
    Icon: HeartHandshake,
    gradient: "from-[#2563EB] to-[#7C3AED]",
    glowColor: "rgba(37,99,235,0.35)",
    ariaLabel: "100 percent client focus",
  },
];

// ─── Count-Up Hook ────────────────────────────────────────────────────────────

function useCountUp(target: number, duration: number, start: boolean, reduced: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;
    if (reduced) { setCount(target); return; }

    let startTime: number | null = null;
    let raf: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [start, target, duration, reduced]);

  return count;
}

// ─── Animated Number ──────────────────────────────────────────────────────────

function AnimatedNumber({
  stat,
  started,
  reduced,
}: {
  stat: Stat;
  started: boolean;
  reduced: boolean;
}) {
  const count = useCountUp(stat.number, 1800, started, reduced);

  return (
    <span
      className={`text-5xl font-extrabold tracking-tight bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent tabular-nums`}
      aria-label={stat.ariaLabel}
    >
      {count}
      {stat.suffix}
    </span>
  );
}

// ─── Border Beam ─────────────────────────────────────────────────────────────

function BorderBeam({ gradient }: { gradient: string }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 rounded-[32px] overflow-hidden"
    >
      <motion.div
        className={`absolute h-[2px] w-32 bg-gradient-to-r ${gradient} blur-[1px]`}
        animate={{
          offsetDistance: ["0%", "100%"],
        }}
        style={{
          offsetPath: `path('M 32 0 L calc(100% - 32px) 0 Q 100% 0 100% 32px L 100% calc(100% - 32px) Q 100% 100% calc(100% - 32px) 100% L 32px 100% Q 0 100% 0 calc(100% - 32px) L 0 32px Q 0 0 32px 0 Z')`,
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

// ─── Spotlight ────────────────────────────────────────────────────────────────

function SpotlightCard({
  children,
  glowColor,
}: {
  children: React.ReactNode;
  glowColor: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 150, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 20 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    },
    [mouseX, mouseY]
  );

  const handleMouseLeave = useCallback(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set(rect.width / 2);
    mouseY.set(rect.height / 2);
  }, [mouseX, mouseY]);

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative"
      style={{ position: "relative" }}
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[32px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(280px circle at ${springX}px ${springY}px, ${glowColor}, transparent 70%)`,
        }}
      />
      {children}
    </div>
  );
}

// ─── Floating Particles ───────────────────────────────────────────────────────

function FloatingParticles({ reduced }: { reduced: boolean }) {
  const [particles] = useState<Particle[]>(() =>
    Array.from({ length: 24 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.5 + 1,
      duration: Math.random() * 12 + 8,
      delay: Math.random() * 6,
      opacity: Math.random() * 0.35 + 0.1,
    }))
  );

  if (reduced) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.id % 3 === 0
              ? "#2563EB"
              : p.id % 3 === 1
              ? "#7C3AED"
              : "#00D4FF",
            opacity: p.opacity,
            boxShadow: `0 0 ${p.size * 3}px currentColor`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.sin(p.id) * 15, 0],
            opacity: [p.opacity, p.opacity * 1.6, p.opacity],
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

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  stat,
  index,
  sectionStarted,
  reduced,
}: {
  stat: Stat;
  index: number;
  sectionStarted: boolean;
  reduced: boolean;
}) {
  const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const;

const cardVariants = {
  hidden: { opacity: 0, y: 48, scale: 0.94 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.65,
      delay: index * 0.13,
      ease: EASE_PREMIUM,
    },
  },
};

 const hoverVariants: TargetAndTransition | undefined = reduced
  ? undefined
  : {
      scale: 1.03,
      rotateX: 3,
      rotateY: -3,
      transition: {
        duration: 0.3,
      },
    };
  return (
    <motion.article
      variants={reduced ? undefined : cardVariants}
      initial={reduced ? undefined : "hidden"}
      animate={sectionStarted ? "visible" : "hidden"}
      whileHover={hoverVariants}
      className="group relative focus-within:outline-none"
      tabIndex={0}
      role="article"
      aria-label={`${stat.title}: ${stat.ariaLabel}`}
      style={{ perspective: 800 }}
    >
      <SpotlightCard glowColor={stat.glowColor}>
        {/* Card base */}
        <div
          className={`
            relative overflow-hidden rounded-[32px]
            bg-white/[0.03] border border-white/10
            backdrop-blur-xl
            p-8 flex flex-col gap-6
            transition-all duration-500
            group-hover:border-white/20
            group-hover:bg-white/[0.06]
            group-focus:ring-2 group-focus:ring-[#2563EB]/60
          `}
          style={{
            boxShadow: `0 0 0 0 transparent`,
          }}
        >
          {/* Glow on hover via pseudo-element substitute */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              boxShadow: `0 8px 64px -8px ${stat.glowColor}, 0 0 0 1px ${stat.glowColor}40`,
            }}
          />

          {/* Inner top-left gradient splash */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-12 -left-12 w-40 h-40 rounded-full blur-3xl opacity-20"
            style={{
              background: `radial-gradient(circle, ${stat.glowColor}, transparent)`,
            }}
          />

          {/* Icon */}
          <div
            className={`
              w-14 h-14 rounded-2xl flex items-center justify-center
              bg-gradient-to-br ${stat.gradient}
              shadow-lg flex-shrink-0
            `}
            aria-hidden="true"
          >
            <stat.Icon className="w-7 h-7 text-white" strokeWidth={1.8} />
          </div>

          {/* Number */}
          <AnimatedNumber stat={stat} started={sectionStarted} reduced={reduced} />

          {/* Title & Description */}
          <div className="flex flex-col gap-2">
            <h3 className="text-white font-semibold text-lg leading-snug tracking-tight">
              {stat.title}
            </h3>
            <p className="text-white/45 text-sm leading-relaxed">
              {stat.description}
            </p>
          </div>

          {/* Animated border beam */}
          {!reduced && <BorderBeam gradient={stat.gradient} />}
        </div>
      </SpotlightCard>
    </motion.article>
  );
}

// ─── Floating Blobs ───────────────────────────────────────────────────────────

function FloatingBlobs({ reduced }: { reduced: boolean }) {
  if (reduced) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Blue blob */}
      <motion.div
        className="absolute rounded-full blur-[120px] opacity-[0.12]"
        style={{
          width: 600,
          height: 600,
          background: "radial-gradient(circle, #2563EB, transparent 70%)",
          top: "-15%",
          left: "-10%",
        }}
        animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Purple blob */}
      <motion.div
        className="absolute rounded-full blur-[140px] opacity-[0.10]"
        style={{
          width: 500,
          height: 500,
          background: "radial-gradient(circle, #7C3AED, transparent 70%)",
          bottom: "-10%",
          right: "5%",
        }}
        animate={{ x: [0, -50, 0], y: [0, -35, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />
      {/* Cyan blob */}
      <motion.div
        className="absolute rounded-full blur-[100px] opacity-[0.08]"
        style={{
          width: 400,
          height: 400,
          background: "radial-gradient(circle, #00D4FF, transparent 70%)",
          top: "40%",
          left: "50%",
          translateX: "-50%",
        }}
        animate={{ x: [0, 30, -30, 0], y: [0, -25, 25, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut", delay: 6 }}
      />
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ started, reduced }: { started: boolean; reduced: boolean }) {
  const variants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, delay: i * 0.12, ease: EASE_PREMIUM, },
    }),
  };

  return (
    <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col items-center gap-5">
      {/* Badge */}
      <motion.div
        custom={0}
        variants={reduced ? undefined : variants}
        initial={reduced ? undefined : "hidden"}
        animate={started ? "visible" : "hidden"}
      >
        <span
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-sm text-xs font-semibold tracking-[0.18em] uppercase text-[#00D4FF]"
          aria-label="Section badge: Our Impact"
        >
          <span
            aria-hidden="true"
            className="w-1.5 h-1.5 rounded-full bg-[#00D4FF] animate-pulse"
          />
          OUR IMPACT
        </span>
      </motion.div>

      {/* Heading */}
      <motion.h2
        custom={1}
        variants={reduced ? undefined : variants}
        initial={reduced ? undefined : "hidden"}
        animate={started ? "visible" : "hidden"}
        className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.1]"
      >
        Numbers That{" "}
        <span className="relative inline-block">
          <span
            className="bg-gradient-to-r from-[#2563EB] via-[#7C3AED] to-[#00D4FF] bg-clip-text text-transparent"
            style={{
              backgroundSize: "200% 100%",
              animation: reduced ? "none" : "gradientShift 4s ease infinite",
            }}
          >
            Reflect
          </span>
        </span>
        <br />
        Our Commitment
      </motion.h2>

      {/* Description */}
      <motion.p
        custom={2}
        variants={reduced ? undefined : variants}
        initial={reduced ? undefined : "hidden"}
        animate={started ? "visible" : "hidden"}
        className="text-white/50 text-base sm:text-lg leading-relaxed max-w-xl"
      >
        Every project, innovation, and client interaction helps us grow stronger
        and deliver better solutions.
      </motion.p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CompanyStats() {
  const reduced = useReducedMotion() ?? false;
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (isInView && !started) setStarted(true);
  }, [isInView, started]);

  return (
    <>
      {/* Gradient shift keyframe */}
      <style>{`
        @keyframes gradientShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      <section
        ref={sectionRef}
        aria-labelledby="stats-heading"
        className="relative w-full overflow-hidden py-24 sm:py-32"
        style={{ background: "#050816" }}
      >
        {/* Floating background blobs */}
        <FloatingBlobs reduced={reduced} />

        {/* Particles */}
        <FloatingParticles reduced={reduced} />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div id="stats-heading">
            <SectionHeader started={started} reduced={reduced} />
          </div>

          {/* Cards Grid */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 lg:gap-6"
            role="list"
            aria-label="Company statistics"
          >
            {STATS.map((stat, i) => (
              <StatCard
                key={stat.id}
                stat={stat}
                index={i}
                sectionStarted={started}
                reduced={reduced}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}