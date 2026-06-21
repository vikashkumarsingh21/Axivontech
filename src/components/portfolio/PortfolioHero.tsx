"use client";

import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useInView,
  useReducedMotion,
  animate,
} from "framer-motion";
import {
  Globe,
  Smartphone,
  BrainCircuit,
  Cloud,
  Palette,
  Code2,
  ArrowRight,
  Sparkles,
  Activity,
  Cpu,
  Layers,
  Zap,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  drift: number;
}

interface NeuralNode {
  id: number;
  x: number;
  y: number;
  delay: number;
}

interface ProjectCardSpec {
  id: string;
  label: string;
  icon: React.ElementType;
  metric: string;
  metricLabel: string;
  accentPrimary: string;
  accentSecondary: string;
  top: string;
  left?: string;
  right?: string;
  depth: number;
  floatDuration: number;
  floatDelay: number;
}

interface StatItem {
  value: number;
  suffix: string;
  label: string;
  color: string;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const PROJECT_CARDS: ProjectCardSpec[] = [
  {
    id: "web",
    label: "Web Development",
    icon: Globe,
    metric: "98",
    metricLabel: "Performance Score",
    accentPrimary: "#2563EB",
    accentSecondary: "#00D4FF",
    top: "4%",
    left: "-4%",
    depth: 1.1,
    floatDuration: 7,
    floatDelay: 0,
  },
  {
    id: "mobile",
    label: "Mobile Apps",
    icon: Smartphone,
    metric: "4.9★",
    metricLabel: "App Store Rating",
    accentPrimary: "#7C3AED",
    accentSecondary: "#2563EB",
    top: "16%",
    right: "-6%",
    depth: 0.9,
    floatDuration: 8.5,
    floatDelay: 1.2,
  },
  {
    id: "ai",
    label: "AI Solutions",
    icon: BrainCircuit,
    metric: "10x",
    metricLabel: "Faster Insights",
    accentPrimary: "#00D4FF",
    accentSecondary: "#7C3AED",
    top: "46%",
    left: "-10%",
    depth: 1.25,
    floatDuration: 6.5,
    floatDelay: 0.6,
  },
  {
    id: "cloud",
    label: "Cloud Solutions",
    icon: Cloud,
    metric: "99.9%",
    metricLabel: "Uptime SLA",
    accentPrimary: "#2563EB",
    accentSecondary: "#7C3AED",
    top: "60%",
    right: "-2%",
    depth: 1.0,
    floatDuration: 9,
    floatDelay: 2,
  },
  {
    id: "design",
    label: "UI/UX Design",
    icon: Palette,
    metric: "+42%",
    metricLabel: "Conversion Lift",
    accentPrimary: "#7C3AED",
    accentSecondary: "#00D4FF",
    top: "78%",
    left: "2%",
    depth: 0.85,
    floatDuration: 7.5,
    floatDelay: 1.6,
  },
  {
    id: "software",
    label: "Custom Software",
    icon: Code2,
    metric: "200+",
    metricLabel: "Systems Shipped",
    accentPrimary: "#00D4FF",
    accentSecondary: "#2563EB",
    top: "32%",
    right: "20%",
    depth: 1.15,
    floatDuration: 8,
    floatDelay: 2.6,
  },
];

const STATS: StatItem[] = [
  { value: 10, suffix: "+", label: "Projects Delivered", color: "#2563EB" },
  { value: 100, suffix: "%", label: "Client Satisfaction", color: "#00D4FF" },
  { value: 5, suffix: "+", label: "Technology Domains", color: "#7C3AED" },
  { value: 24, suffix: "/7", label: "Support & Innovation", color: "#00D4FF" },
];

// ─── Animation Variants ────────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const fadeUpVariants = {
  hidden: { opacity: 0, y: 32, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
  },
};

// ─── Aurora Background ─────────────────────────────────────────────────────────

function AuroraBackground({ reduced }: { reduced: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <motion.div
        className="absolute -top-56 -left-40 w-[720px] h-[720px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(37,99,235,0.2) 0%, rgba(37,99,235,0.05) 55%, transparent 70%)",
          filter: "blur(50px)",
        }}
        animate={reduced ? {} : { x: [0, 90, -40, 0], y: [0, 60, -30, 0], scale: [1, 1.15, 0.92, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/4 -right-48 w-[640px] h-[640px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(124,58,237,0.18) 0%, rgba(124,58,237,0.05) 55%, transparent 70%)",
          filter: "blur(50px)",
        }}
        animate={reduced ? {} : { x: [0, -70, 45, 0], y: [0, -80, 50, 0], scale: [1, 0.88, 1.12, 1] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />
      <motion.div
        className="absolute -bottom-32 left-1/3 w-[520px] h-[420px] rounded-full"
        style={{
          background: "radial-gradient(ellipse, rgba(0,212,255,0.12) 0%, rgba(0,212,255,0.03) 55%, transparent 70%)",
          filter: "blur(60px)",
        }}
        animate={reduced ? {} : { x: [0, 60, -80, 0], y: [0, -40, 30, 0], scale: [1, 1.1, 0.95, 1] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut", delay: 7 }}
      />
    </div>
  );
}

// ─── Perspective Grid ──────────────────────────────────────────────────────────

function PerspectiveGrid() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(37,99,235,0.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(37,99,235,0.045) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 30%, black 30%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 30%, black 30%, transparent 75%)",
        }}
        animate={{ opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

// ─── Noise Texture ─────────────────────────────────────────────────────────────

function NoiseTexture() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-[0.025] pointer-events-none mix-blend-overlay"
      aria-hidden
    >
      <filter id="portfolioHeroNoise">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#portfolioHeroNoise)" />
    </svg>
  );
}

// ─── Floating Particles ────────────────────────────────────────────────────────

function FloatingParticles({ reduced }: { reduced: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (reduced) return;
    setParticles(
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2.4 + 0.6,
        opacity: Math.random() * 0.45 + 0.1,
        duration: Math.random() * 13 + 9,
        delay: Math.random() * 7,
        drift: (Math.random() - 0.5) * 60,
      }))
    );
  }, [reduced]);

  if (reduced || !particles.length) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: `radial-gradient(circle, rgba(0,212,255,${p.opacity}) 0%, rgba(124,58,237,${p.opacity * 0.6}) 100%)`,
          }}
          animate={{ y: [0, -130, 0], x: [0, p.drift, 0], opacity: [0, p.opacity, 0], scale: [0.5, 1.2, 0.5] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

// ─── Neural Network Particle Field (for the AI representation) ───────────────

function NeuralField({ reduced }: { reduced: boolean }) {
  const [nodes, setNodes] = useState<NeuralNode[]>([]);

  useEffect(() => {
    if (reduced) return;
    setNodes(
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        x: 15 + Math.random() * 70,
        y: 15 + Math.random() * 70,
        delay: Math.random() * 4,
      }))
    );
  }, [reduced]);

  if (reduced || !nodes.length) return null;

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      {nodes.map((node, i) =>
        nodes.slice(i + 1, i + 3).map((target) => (
          <motion.line
            key={`${node.id}-${target.id}`}
            x1={node.x}
            y1={node.y}
            x2={target.x}
            y2={target.y}
            stroke="rgba(0,212,255,0.15)"
            strokeWidth="0.15"
            animate={{ opacity: [0.1, 0.4, 0.1] }}
            transition={{ duration: 4, repeat: Infinity, delay: node.delay, ease: "easeInOut" }}
          />
        ))
      )}
      {nodes.map((node) => (
        <motion.circle
          key={node.id}
          cx={node.x}
          cy={node.y}
          r="0.5"
          fill="#00D4FF"
          animate={{ opacity: [0.3, 1, 0.3], r: [0.4, 0.7, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, delay: node.delay, ease: "easeInOut" }}
        />
      ))}
    </svg>
  );
}

// ─── Animated Counter Stat ─────────────────────────────────────────────────────

function CounterStat({ stat, index }: { stat: StatItem; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const [displayValue, setDisplayValue] = useState(0);
  const reduced = useReducedMotion() ?? false;

  useEffect(() => {
    if (!isInView) return;
    if (reduced) {
      setDisplayValue(stat.value);
      return;
    }
    const controls = animate(0, stat.value, {
      duration: 1.6,
      delay: index * 0.12,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => setDisplayValue(Math.round(latest)),
    });
    return () => controls.stop();
  }, [isInView, stat.value, index, reduced]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-1"
    >
      <div className="flex items-baseline gap-0.5">
        <span
          className="text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums"
          style={{ color: stat.color }}
        >
          {displayValue}
        </span>
        <span className="text-xl sm:text-2xl font-extrabold" style={{ color: stat.color }}>
          {stat.suffix}
        </span>
      </div>
      <div className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>
        {stat.label}
      </div>
    </motion.div>
  );
}

// ─── Magnetic Button ──────────────────────────────────────────────────────────

function MagneticButton({
  children,
  href,
  variant = "primary",
  ariaLabel,
}: {
  children: React.ReactNode;
  href: string;
  variant?: "primary" | "secondary";
  ariaLabel: string;
}) {
  const btnRef = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 20 });
  const springY = useSpring(y, { stiffness: 200, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = btnRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * 0.25);
    y.set((e.clientY - cy) * 0.25);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const isPrimary = variant === "primary";

  return (
    <motion.a
      ref={btnRef}
      href={href}
      aria-label={ariaLabel}
      style={{
        x: springX,
        y: springY,
        ...(isPrimary
          ? {
              background: "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)",
              boxShadow: "0 0 0 1px rgba(37,99,235,0.4), 0 10px 30px rgba(37,99,235,0.35)",
              color: "#ffffff",
            }
          : {
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.12)",
              backdropFilter: "blur(12px)",
              color: "rgba(255,255,255,0.85)",
            }),
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      className="relative inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050816]"
    >
      {isPrimary && (
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%)" }}
          aria-hidden
        />
      )}
      {children}
    </motion.a>
  );
}

// ─── Floating Glass Project Card ───────────────────────────────────────────────

function FloatingProjectCard({
  spec,
  parallaxX,
  parallaxY,
  reduced,
}: {
  spec: ProjectCardSpec;
  parallaxX: ReturnType<typeof useTransform<number, number>>;
  parallaxY: ReturnType<typeof useTransform<number, number>>;
  reduced: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50 });

  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const rotateX = useSpring(useTransform(tiltY, [-40, 40], [8, -8]), { stiffness: 200, damping: 22 });
  const rotateY = useSpring(useTransform(tiltX, [-40, 40], [-8, 8]), { stiffness: 200, damping: 22 });

  // Always call useTransform unconditionally (rules-of-hooks); zero out the
  // depth multiplier instead of skipping the hook when motion is reduced.
  const depthMultiplier = reduced ? 0 : spec.depth;
  const cardX = useTransform(parallaxX, (v) => v * depthMultiplier);
  const cardY = useTransform(parallaxY, (v) => v * depthMultiplier);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (reduced) return;
      const rect = cardRef.current?.getBoundingClientRect();
      if (!rect) return;
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      tiltX.set(cx - rect.width / 2);
      tiltY.set(cy - rect.height / 2);
      setSpotlight({ x: (cx / rect.width) * 100, y: (cy / rect.height) * 100 });
    },
    [tiltX, tiltY, reduced]
  );

  const handleMouseLeave = useCallback(() => {
    tiltX.set(0);
    tiltY.set(0);
    setHovered(false);
  }, [tiltX, tiltY]);

  const Icon = spec.icon;

  return (
    <motion.div
      ref={cardRef}
      className="absolute hidden sm:block"
      style={{
        top: spec.top,
        left: spec.left,
        right: spec.right,
        x: cardX,
        y: cardY,
        zIndex: Math.round(spec.depth * 10),
      }}
      initial={{ opacity: 0, scale: 0.85, y: 24 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.5 + spec.floatDelay * 0.15, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        animate={reduced ? {} : { y: [0, -14, 0] }}
        transition={{ duration: spec.floatDuration, repeat: Infinity, ease: "easeInOut", delay: spec.floatDelay }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={handleMouseLeave}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        tabIndex={0}
        role="img"
        aria-label={`${spec.label}: ${spec.metric} ${spec.metricLabel}`}
        style={reduced ? {} : { rotateX, rotateY, transformStyle: "preserve-3d", perspective: 800 }}
        className="relative w-[168px] sm:w-[180px] cursor-default select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-2xl"
      >
        {/* Glow halo */}
        <motion.div
          className="absolute -inset-4 rounded-3xl pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 50% 50%, ${spec.accentPrimary}30 0%, transparent 70%)`,
            filter: "blur(18px)",
          }}
          animate={{ opacity: hovered ? 1 : 0.45 }}
          transition={{ duration: 0.4 }}
          aria-hidden
        />

        {/* Card surface */}
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.045)",
            backdropFilter: "blur(20px)",
            border: `1px solid ${hovered ? `${spec.accentPrimary}55` : "rgba(255,255,255,0.1)"}`,
            boxShadow: hovered
              ? `0 24px 48px rgba(0,0,0,0.5), 0 0 0 1px ${spec.accentPrimary}30`
              : "0 16px 36px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
            transition: "border 0.3s, box-shadow 0.3s",
          }}
        >
          {/* Spotlight */}
          {hovered && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(ellipse 70% 60% at ${spotlight.x}% ${spotlight.y}%, ${spec.accentPrimary}1a 0%, transparent 70%)`,
              }}
              aria-hidden
            />
          )}

          {/* Border beam on hover */}
          {hovered && !reduced && (
            <motion.div
              className="absolute top-0 left-0 h-[1.5px] pointer-events-none"
              style={{
                width: "100%",
                background: `linear-gradient(90deg, transparent, ${spec.accentPrimary}, ${spec.accentSecondary}, transparent)`,
              }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.45 }}
              aria-hidden
            />
          )}

          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${spec.accentPrimary}28 0%, ${spec.accentSecondary}1c 100%)`,
                  border: `1px solid ${spec.accentPrimary}40`,
                }}
              >
                <Icon size={16} style={{ color: spec.accentPrimary }} strokeWidth={1.8} aria-hidden />
              </div>
              <motion.div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: spec.accentSecondary }}
                animate={reduced ? {} : { opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2.4, repeat: Infinity }}
                aria-hidden
              />
            </div>

            <div className="text-xs font-semibold mb-2" style={{ color: "rgba(255,255,255,0.65)" }}>
              {spec.label}
            </div>

            <div className="flex items-end justify-between">
              <div>
                <div className="text-lg font-extrabold tracking-tight" style={{ color: spec.accentPrimary }}>
                  {spec.metric}
                </div>
                <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.32)" }}>
                  {spec.metricLabel}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Holographic Tech Sphere ───────────────────────────────────────────────────

function HolographicSphere({ reduced }: { reduced: boolean }) {
  const ringConfigs = [
    { size: 100, color: "rgba(37,99,235,0.35)", duration: 14, dashed: false },
    { size: 140, color: "rgba(124,58,237,0.3)", duration: 20, dashed: true },
    { size: 180, color: "rgba(0,212,255,0.22)", duration: 26, dashed: false },
  ];

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {/* Core glow */}
      <motion.div
        className="absolute w-40 h-40 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(37,99,235,0.45) 0%, rgba(124,58,237,0.25) 45%, transparent 75%)",
          filter: "blur(20px)",
        }}
        animate={reduced ? {} : { scale: [1, 1.15, 1], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Core sphere */}
      <motion.div
        className="absolute w-24 h-24 rounded-full flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, rgba(37,99,235,0.5) 0%, rgba(124,58,237,0.4) 50%, rgba(0,212,255,0.35) 100%)",
          border: "1px solid rgba(255,255,255,0.25)",
          backdropFilter: "blur(8px)",
          boxShadow: "0 0 60px rgba(37,99,235,0.5), inset 0 0 30px rgba(255,255,255,0.15)",
        }}
        animate={reduced ? {} : { scale: [1, 1.06, 1] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <Sparkles size={26} className="text-white/90" aria-hidden />
      </motion.div>

      {/* Orbit rings */}
      {ringConfigs.map((ring, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: ring.size * 2,
            height: ring.size * 2,
            border: `1px ${ring.dashed ? "dashed" : "solid"} ${ring.color}`,
          }}
          animate={
            reduced
              ? {}
              : {
                  rotate: i % 2 === 0 ? 360 : -360,
                  rotateX: 60,
                }
          }
          transition={{ duration: ring.duration, repeat: Infinity, ease: "linear" }}
        />
      ))}

      {/* Orbiting micro-nodes representing tech domains */}
      {!reduced &&
        [Cpu, Layers, Zap, Activity].map((Icon, i) => {
          const angle = (i / 4) * 360;
          const radius = 90;
          const rad = (angle * Math.PI) / 180;
          return (
            <motion.div
              key={i}
              className="absolute w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.15)",
                backdropFilter: "blur(8px)",
              }}
              animate={{
                x: [Math.cos(rad) * radius, Math.cos(rad + Math.PI * 2) * radius],
                y: [Math.sin(rad) * radius, Math.sin(rad + Math.PI * 2) * radius],
              }}
              transition={{ duration: 16, repeat: Infinity, ease: "linear", delay: i * 0.4 }}
            >
              <Icon size={13} className="text-cyan-300/80" aria-hidden />
            </motion.div>
          );
        })}
    </div>
  );
}

// ─── 3D Experience Stage (right side) ──────────────────────────────────────────

function PortfolioStage({ reduced }: { reduced: boolean }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const parallaxX = useSpring(useTransform(mouseX, [0, 1], [-18, 18]), { stiffness: 60, damping: 20 });
  const parallaxY = useSpring(useTransform(mouseY, [0, 1], [-14, 14]), { stiffness: 60, damping: 20 });
  const sphereParallaxX = useSpring(useTransform(mouseX, [0, 1], [10, -10]), { stiffness: 50, damping: 18 });
  const sphereParallaxY = useSpring(useTransform(mouseY, [0, 1], [8, -8]), { stiffness: 50, damping: 18 });

  useEffect(() => {
    if (reduced) return;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = stageRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouseX.set((e.clientX - rect.left) / rect.width);
      mouseY.set((e.clientY - rect.top) / rect.height);
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY, reduced]);

  return (
    <div
      ref={stageRef}
      className="relative w-full h-[560px] sm:h-[620px] lg:h-[680px]"
      role="img"
      aria-label="Visual showcase of Axivon Technologies project domains: web development, mobile apps, AI solutions, cloud infrastructure, UI/UX design, and custom software"
    >
      {/* Ambient depth glow behind everything */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 55% at 50% 45%, rgba(37,99,235,0.1) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
        aria-hidden
      />

      {/* Neural particle field — AI layer (back) */}
      <NeuralField reduced={reduced} />

      {/* Holographic sphere — mid layer, parallaxed opposite the cards for depth */}
      <motion.div
        className="absolute inset-0"
        style={reduced ? {} : { x: sphereParallaxX, y: sphereParallaxY }}
      >
        <HolographicSphere reduced={reduced} />
      </motion.div>

      {/* Floating glass project cards — front layer */}
      {PROJECT_CARDS.map((spec) => (
        <FloatingProjectCard
          key={spec.id}
          spec={spec}
          parallaxX={parallaxX}
          parallaxY={parallaxY}
          reduced={reduced}
        />
      ))}

      {/* Soft vignette to ground the stage */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 70% 70% at 50% 50%, transparent 50%, #050816 100%)",
        }}
        aria-hidden
      />
    </div>
  );
}

// ─── Gradient Heading Word ─────────────────────────────────────────────────────

function GradientWord({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-block"
      style={{
        background: "linear-gradient(135deg, #2563EB 0%, #00D4FF 45%, #7C3AED 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        backgroundSize: "200% 200%",
      }}
    >
      <motion.span
        style={{ display: "inline-block" }}
        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      >
        {children}
      </motion.span>
    </span>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function PortfolioHero() {
  const reduced = useReducedMotion() ?? false;
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ background: "#050816" }}
      aria-label="Portfolio hero section"
    >
      {/* ── Background Layers ── */}
      <AuroraBackground reduced={reduced} />
      <PerspectiveGrid />
      <FloatingParticles reduced={reduced} />
      <NoiseTexture />

      {/* ── Content ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-16 items-center">
          {/* ── Left Column ── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-6"
          >
            {/* Badge */}
            <motion.div variants={fadeUpVariants}>
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-widest"
                style={{
                  background: "linear-gradient(90deg, rgba(37,99,235,0.12), rgba(124,58,237,0.12))",
                  border: "1px solid rgba(124,58,237,0.3)",
                  color: "#a78bfa",
                }}
              >
                <motion.div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "#7C3AED" }}
                  animate={reduced ? {} : { scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  aria-hidden
                />
                Our Portfolio
              </div>
            </motion.div>

            {/* Heading */}
            <motion.h1
              variants={fadeUpVariants}
              className="font-extrabold leading-[1.08] tracking-tight text-4xl sm:text-5xl xl:text-[3.4rem]"
            >
              <span style={{ color: "rgba(255,255,255,0.95)" }}>Building </span>
              <GradientWord>Digital Experiences</GradientWord>
              <span style={{ color: "rgba(255,255,255,0.95)" }}> That Drive Real </span>
              <GradientWord>Business Growth</GradientWord>
            </motion.h1>

            {/* Description */}
            <motion.div variants={fadeUpVariants} className="flex flex-col gap-3 max-w-xl">
              <p className="text-base sm:text-lg leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
                Explore a collection of innovative websites, AI solutions, mobile applications, cloud platforms, and custom software products built by Axivon Technologies.
              </p>
              <p className="text-sm sm:text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.38)" }}>
                Every project reflects our commitment to performance, scalability, innovation, and exceptional user experience.
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div variants={fadeUpVariants} className="flex flex-wrap gap-3 pt-2">
              <MagneticButton href="/portfolio" variant="primary" ariaLabel="Explore our project portfolio">
                Explore Projects
                <ArrowRight size={16} aria-hidden />
              </MagneticButton>
              <MagneticButton href="/contact" variant="secondary" ariaLabel="Start your project with Axivon Technologies">
                Start Your Project
              </MagneticButton>
            </motion.div>

            {/* Trust Metrics */}
            <motion.div
              variants={fadeUpVariants}
              className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-4 pt-8 mt-2"
              style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
              role="list"
              aria-label="Axivon Technologies key statistics"
            >
              {STATS.map((stat, i) => (
                <div key={stat.label} role="listitem">
                  <CounterStat stat={stat} index={i} />
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* ── Right Column — 3D Experience ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <PortfolioStage reduced={reduced} />
          </motion.div>
        </div>
      </div>

      {/* ── Bottom fade ── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: "linear-gradient(to top, #050816 0%, transparent 100%)" }}
        aria-hidden
      />
    </section>
  );
}