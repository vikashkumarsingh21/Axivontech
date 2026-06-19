"use client";

import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useInView,
  useReducedMotion,
  AnimatePresence,
} from "framer-motion";
import {
  Zap,
  Shield,
  TrendingUp,
  Layers,
  Globe,
  Lock,
  Cpu,
  BarChart3,
  Rocket,
  RefreshCw,
  Star,
  Clock,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";
import type { ServiceData } from "@/data/services";

const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const;
import type { Variants } from "framer-motion";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface ServiceBenefitsProps {
  service: ServiceData;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
}

// ─── Icon Pool ─────────────────────────────────────────────────────────────────
// Cycles through a pool of semantically appropriate icons per benefit index

const ICON_POOL = [
  Zap,
  Shield,
  TrendingUp,
  Layers,
  Globe,
  Lock,
  Cpu,
  BarChart3,
  Rocket,
  RefreshCw,
  Star,
  Clock,
];

// ─── Dynamic Description ───────────────────────────────────────────────────────

function getDynamicDescription(title: string): string {
  const map: Record<string, string> = {
    "Web Development":
      "We engineer web platforms that are fast by default, scalable by design, and built to convert — giving your business a digital foundation competitors can't easily replicate.",
    "Mobile App Development":
      "From concept to App Store, we craft mobile experiences users return to daily — combining platform-native performance with product thinking that drives retention.",
    "AI Solutions":
      "We turn your data and workflows into intelligent systems that reason, automate, and improve over time — making AI a genuine business advantage, not a buzzword.",
    "Cloud Solutions":
      "Reliable, secure, cost-optimised cloud infrastructure that scales effortlessly with your growth — engineered to stay up when it matters most.",
    "SEO Services":
      "We build organic growth engines that compound over time — combining technical rigour, content depth, and authority acquisition to make your site the dominant voice in your category.",
    "Digital Marketing":
      "Full-funnel campaigns grounded in data, tested relentlessly, and optimised to maximise return on every dollar of marketing spend.",
    "UI/UX Design":
      "Interfaces that feel inevitable — where every interaction is intuitive, every screen earns its place, and the whole product feels effortlessly right.",
    "Custom Software Development":
      "Purpose-built software that fits your business precisely — automating what slows you down and giving you capabilities your competitors simply can't buy off the shelf.",
  };
  return (
    map[title] ??
    "Our solutions are engineered to help businesses grow faster, operate smarter, and deliver exceptional experiences that create lasting competitive advantage."
  );
}

// ─── Animation Variants ────────────────────────────────────────────────────────

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const fadeUpVariants = {
  hidden: { opacity: 0, y: 28, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.65, ease: EASE_PREMIUM },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.96, filter: "blur(10px)" },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.7,
      delay: i * 0.09,
      ease: EASE_PREMIUM,
    },
  }),
};

// ─── Floating Particles ────────────────────────────────────────────────────────

function BackgroundParticles({ prefersReducedMotion }: { prefersReducedMotion: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 22 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 0.8,
        opacity: Math.random() * 0.35 + 0.08,
        duration: Math.random() * 14 + 10,
        delay: Math.random() * 8,
      }))
    );
  }, []);

  if (prefersReducedMotion || particles.length === 0) return null;

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
            background: `radial-gradient(circle, rgba(37,99,235,${p.opacity}) 0%, rgba(124,58,237,${p.opacity * 0.5}) 100%)`,
          }}
          animate={{ y: [0, -90, 0], opacity: [0, p.opacity, 0] }}
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

// ─── Aurora Background ─────────────────────────────────────────────────────────

function AuroraBackground({ prefersReducedMotion }: { prefersReducedMotion: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <motion.div
        className="absolute -top-64 -left-40 w-[700px] h-[700px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(37,99,235,0.13) 0%, transparent 65%)",
          filter: "blur(48px)",
        }}
        animate={
          prefersReducedMotion
            ? {}
            : { x: [0, 60, -30, 0], y: [0, 50, -20, 0], scale: [1, 1.1, 0.95, 1] }
        }
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/2 -right-40 w-[550px] h-[550px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 65%)",
          filter: "blur(48px)",
        }}
        animate={
          prefersReducedMotion
            ? {}
            : { x: [0, -50, 30, 0], y: [0, -60, 40, 0], scale: [1, 0.9, 1.1, 1] }
        }
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      />
      <motion.div
        className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[500px] h-[400px] rounded-full"
        style={{
          background:
            "radial-gradient(ellipse, rgba(0,212,255,0.07) 0%, transparent 65%)",
          filter: "blur(60px)",
        }}
        animate={
          prefersReducedMotion
            ? {}
            : { scaleX: [1, 1.2, 0.9, 1], scaleY: [1, 0.8, 1.1, 1] }
        }
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 8 }}
      />
    </div>
  );
}

// ─── Animated Grid Overlay ─────────────────────────────────────────────────────

function GridOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden>
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(37,99,235,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(37,99,235,0.035) 1px, transparent 1px)
          `,
          backgroundSize: "72px 72px",
        }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

// ─── Border Beam ───────────────────────────────────────────────────────────────

function BorderBeam({ active }: { active: boolean }) {
  return (
    <div
      className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none"
      aria-hidden
    >
      <AnimatePresence>
        {active && (
          <>
            <motion.div
              key="top"
              className="absolute top-0 left-0 h-[1.5px] w-full"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(37,99,235,0.9) 30%, rgba(0,212,255,1) 50%, rgba(124,58,237,0.9) 70%, transparent 100%)",
              }}
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.4, ease: "easeInOut" }}
            />
            <motion.div
              key="right"
              className="absolute top-0 right-0 w-[1.5px] h-full"
              style={{
                background:
                  "linear-gradient(180deg, transparent 0%, rgba(124,58,237,0.9) 30%, rgba(0,212,255,1) 50%, rgba(37,99,235,0.9) 70%, transparent 100%)",
              }}
              initial={{ y: "-100%" }}
              animate={{ y: "100%" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.4, ease: "easeInOut", delay: 0.2 }}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Signal Line ───────────────────────────────────────────────────────────────
// The signature element — draws on scroll-enter, stays when hovered

function SignalLine({ inView, hovered }: { inView: boolean; hovered: boolean }) {
  return (
    <div className="absolute bottom-0 left-6 right-6 h-[1px] overflow-hidden" aria-hidden>
      <motion.div
        className="absolute inset-0 h-full"
        style={{
          background:
            "linear-gradient(90deg, #2563EB 0%, #00D4FF 50%, #7C3AED 100%)",
          originX: 0,
        }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: inView ? 1 : 0 }}
        transition={{ duration: 0.9, ease: EASE_PREMIUM, delay: 0.2 }}
      />
      {hovered && (
        <motion.div
          className="absolute inset-0 h-full"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(0,212,255,0.8) 50%, transparent 100%)",
          }}
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />
      )}
    </div>
  );
}

// ─── Benefit Card ──────────────────────────────────────────────────────────────

function BenefitCard({
  title,
  description,
  index,
  prefersReducedMotion,
}: {
  title: string;
  description: string;
  index: number;
  prefersReducedMotion: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: "-60px" });
  const [hovered, setHovered] = useState(false);

  // Mouse position for tilt + spotlight
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-80, 80], [6, -6]), {
    stiffness: 180,
    damping: 24,
  });
  const rotateY = useSpring(useTransform(mouseX, [-80, 80], [-6, 6]), {
    stiffness: 180,
    damping: 24,
  });

  // Magnetic drift
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 120, damping: 18 });
  const smy = useSpring(my, { stiffness: 120, damping: 18 });

  // Spotlight
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = cardRef.current?.getBoundingClientRect();
      if (!rect) return;
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const halfW = rect.width / 2;
      const halfH = rect.height / 2;
      if (!prefersReducedMotion) {
        mouseX.set(cx - halfW);
        mouseY.set(cy - halfH);
        mx.set((cx - halfW) * 0.18);
        my.set((cy - halfH) * 0.18);
      }
      setSpotlight({
        x: (cx / rect.width) * 100,
        y: (cy / rect.height) * 100,
      });
    },
    [mouseX, mouseY, mx, my, prefersReducedMotion]
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
    mx.set(0);
    my.set(0);
    setHovered(false);
  }, [mouseX, mouseY, mx, my]);

  const IconComponent = ICON_POOL[index % ICON_POOL.length];

  // Per-card accent colour cycling
  const accentColors = [
    { primary: "#2563EB", secondary: "#00D4FF" },
    { primary: "#7C3AED", secondary: "#2563EB" },
    { primary: "#00D4FF", secondary: "#7C3AED" },
  ];
  const accent = accentColors[index % 3];

  return (
    <motion.div
      ref={cardRef}
      custom={index}
      variants={cardVariants}
      style={
        prefersReducedMotion
          ? {}
          : {
              rotateX,
              rotateY,
              transformStyle: "preserve-3d",
              perspective: 900,
              x: smx,
              y: smy,
            }
      }
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      whileHover={prefersReducedMotion ? {} : { y: -6 }}
      transition={{ duration: 0.35 }}
      className="relative group"
      role="article"
      aria-label={title}
      tabIndex={0}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      {/* Outer glow */}
      <motion.div
        className="absolute -inset-3 rounded-3xl pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 50%, ${accent.primary}22 0%, transparent 70%)`,
          filter: "blur(16px)",
        }}
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        aria-hidden
      />

      {/* Card surface */}
      <div
        className="relative h-full rounded-2xl overflow-hidden"
        style={{
          background: hovered
            ? "rgba(255,255,255,0.045)"
            : "rgba(255,255,255,0.025)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: hovered
            ? `0 24px 48px rgba(0,0,0,0.45), 0 0 0 1px ${accent.primary}33`
            : "0 8px 24px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.04)",
          transition: "background 0.3s, box-shadow 0.3s",
        }}
      >
        {/* Spotlight */}
        {hovered && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse 60% 50% at ${spotlight.x}% ${spotlight.y}%, ${accent.primary}12 0%, transparent 70%)`,
            }}
            aria-hidden
          />
        )}

        {/* Shimmer sweep */}
        {hovered && !prefersReducedMotion && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.045) 50%, transparent 70%)",
            }}
            initial={{ x: "-100%" }}
            animate={{ x: "160%" }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            aria-hidden
          />
        )}

        <BorderBeam active={hovered} />

        <div className="relative p-7 pb-10 h-full flex flex-col">
          {/* Icon container */}
          <motion.div
            className="mb-5 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 relative"
            style={{
              background: `linear-gradient(135deg, ${accent.primary}22 0%, ${accent.secondary}18 100%)`,
              border: `1px solid ${accent.primary}33`,
            }}
            animate={
              prefersReducedMotion
                ? {}
                : { y: [0, -3, 0], rotate: [0, 1, -1, 0] }
            }
            transition={{ duration: 4 + index * 0.5, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Icon inner glow */}
            <div
              className="absolute inset-0 rounded-xl"
              style={{
                background: `radial-gradient(circle at 40% 40%, ${accent.primary}30 0%, transparent 70%)`,
              }}
              aria-hidden
            />
            <IconComponent
              size={20}
              style={{ color: accent.primary }}
              strokeWidth={1.8}
              aria-hidden
            />
          </motion.div>

          {/* Content */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-start justify-between mb-2 gap-3">
              <h3
                className="text-base font-semibold leading-snug"
                style={{ color: "rgba(255,255,255,0.9)" }}
              >
                {title}
              </h3>
              <ArrowUpRight
                size={14}
                className="flex-shrink-0 mt-0.5 transition-all duration-300"
                style={{
                  color: hovered ? accent.primary : "rgba(255,255,255,0.15)",
                  transform: hovered ? "translate(2px, -2px)" : "none",
                }}
                aria-hidden
              />
            </div>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "rgba(255,255,255,0.42)" }}
            >
              {description}
            </p>
          </div>
        </div>

        {/* Signal line — the signature element */}
        <SignalLine inView={isInView} hovered={hovered} />
      </div>
    </motion.div>
  );
}

// ─── Animated Counter ──────────────────────────────────────────────────────────

function AnimatedStat({
  value,
  label,
  color,
  prefersReducedMotion,
}: {
  value: string;
  label: string;
  color: string;
  prefersReducedMotion: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="flex flex-col items-center gap-1 px-4 py-5">
      <motion.div
        className="text-2xl sm:text-3xl font-bold tracking-tight"
        style={{ color }}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.6, ease: EASE_PREMIUM }}
      >
        {!prefersReducedMotion && (
          <motion.span
            animate={isInView ? { opacity: [0, 1] } : {}}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {value}
          </motion.span>
        )}
        {prefersReducedMotion && value}
      </motion.div>
      <motion.div
        className="text-xs font-medium tracking-widest uppercase"
        style={{ color: "rgba(255,255,255,0.35)" }}
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {label}
      </motion.div>
      {/* Pulse dot */}
      {!prefersReducedMotion && (
        <motion.div
          className="w-1 h-1 rounded-full mt-1"
          style={{ background: color }}
          animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.3, 0.8] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          aria-hidden
        />
      )}
    </div>
  );
}

// ─── Stats Panel ───────────────────────────────────────────────────────────────

function StatsPanel({ prefersReducedMotion }: { prefersReducedMotion: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  const stats = [
    { value: "99.9%", label: "Reliability", color: "#00D4FF" },
    { value: "24/7", label: "Support", color: "#2563EB" },
    { value: "100%", label: "Client Focus", color: "#7C3AED" },
    { value: "Fast", label: "Delivery", color: "#00D4FF" },
  ];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75, ease: EASE_PREMIUM }}
      className="relative mt-16 rounded-2xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.025)",
        backdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 16px 48px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
      aria-label="Key performance statistics"
    >
      {/* Ambient glow behind panel */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(37,99,235,0.07) 0%, transparent 70%)",
        }}
        aria-hidden
      />

      {/* Glow border top */}
      {!prefersReducedMotion && (
        <motion.div
          className="absolute top-0 left-0 right-0 h-[1px]"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(37,99,235,0.7) 25%, rgba(0,212,255,0.9) 50%, rgba(124,58,237,0.7) 75%, transparent 100%)",
          }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden
        />
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4">
        {stats.map((stat, i) => (
          <React.Fragment key={stat.label}>
            <AnimatedStat {...stat} prefersReducedMotion={prefersReducedMotion} />
            {i < stats.length - 1 && (
              <div
                className="hidden sm:block absolute"
                style={{
                  top: "20%",
                  bottom: "20%",
                  left: `${(i + 1) * 25}%`,
                  width: "1px",
                  background:
                    "linear-gradient(to bottom, transparent, rgba(255,255,255,0.08), transparent)",
                }}
                aria-hidden
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Trust Badges ──────────────────────────────────────────────────────────────

function TrustBadges({ prefersReducedMotion }: { prefersReducedMotion: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  const badges = [
    "Transparent Process",
    "Dedicated Support",
    "Scalable Solutions",
    "Future-Ready Technology",
  ];

  return (
    <motion.div
      ref={ref}
      className="mt-10 flex flex-wrap justify-center gap-3"
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.08 } },
      }}
      role="list"
      aria-label="Service guarantees"
    >
      {badges.map((badge) => (
        <motion.div
          key={badge}
          role="listitem"
          variants={{
            hidden: { opacity: 0, scale: 0.9, y: 10 },
            visible: {
              opacity: 1,
              scale: 1,
              y: 0,
              transition: { duration: 0.45, ease: EASE_PREMIUM },
            },
          }}
          whileHover={prefersReducedMotion ? {} : { scale: 1.04, y: -2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold cursor-default"
          style={{
            background:
              "linear-gradient(135deg, rgba(37,99,235,0.1) 0%, rgba(124,58,237,0.08) 100%)",
            border: "1px solid rgba(124,58,237,0.2)",
            color: "rgba(255,255,255,0.6)",
            backdropFilter: "blur(8px)",
          }}
        >
          <CheckCircle2 size={12} style={{ color: "#00D4FF" }} aria-hidden />
          {badge}
        </motion.div>
      ))}
    </motion.div>
  );
}

// ─── Section Header ────────────────────────────────────────────────────────────

function SectionHeader({
  service,
  isInView,
}: {
  service: ServiceData;
  isInView: boolean;
}) {
  return (
    <motion.div
      className="text-center mb-16"
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={sectionVariants}
    >
      {/* Section badge */}
      <motion.div variants={fadeUpVariants} className="mb-5 flex justify-center">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest"
          style={{
            background: "rgba(37,99,235,0.1)",
            border: "1px solid rgba(37,99,235,0.25)",
            color: "#93c5fd",
          }}
        >
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-blue-400"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            aria-hidden
          />
          Key Benefits
        </div>
      </motion.div>

      {/* Heading */}
      <motion.h2
        variants={fadeUpVariants}
        className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-5"
      >
        <span style={{ color: "rgba(255,255,255,0.92)" }}>
          Why Businesses Choose Our{" "}
        </span>
        <br className="hidden sm:block" />
        <span
          style={{
            background:
              "linear-gradient(135deg, #2563EB 0%, #00D4FF 45%, #7C3AED 100%)",
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
            {service.title}
          </motion.span>
        </span>
      </motion.h2>

      {/* Description */}
      <motion.p
        variants={fadeUpVariants}
        className="text-base sm:text-lg max-w-2xl mx-auto leading-relaxed"
        style={{ color: "rgba(255,255,255,0.45)" }}
      >
        {getDynamicDescription(service.title)}
      </motion.p>
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function ServiceBenefits({ service }: ServiceBenefitsProps) {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-80px" });
  const isGridInView = useInView(sectionRef, { once: true, margin: "-60px" });

  // Parallax background motion on scroll
  const scrollY = useMotionValue(0);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const handler = () => scrollY.set(window.scrollY);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [scrollY, prefersReducedMotion]);

  const parallaxY = useTransform(scrollY, [0, 800], [0, -40]);

  const benefits = useMemo(() => service.benefits, [service.benefits]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden py-24 lg:py-32"
      style={{ background: "#050816" }}
      aria-labelledby="benefits-heading"
    >
      {/* Background layers */}
      <motion.div
        className="absolute inset-0"
        style={prefersReducedMotion ? {} : { y: parallaxY }}
        aria-hidden
      >
        <AuroraBackground prefersReducedMotion={prefersReducedMotion} />
        <GridOverlay />
        <BackgroundParticles prefersReducedMotion={prefersReducedMotion} />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div ref={headerRef}>
          <SectionHeader service={service} isInView={isHeaderInView} />
        </div>

        {/* Benefits Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6"
          initial="hidden"
          animate={isGridInView ? "visible" : "hidden"}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08 } },
          }}
          role="list"
          aria-label={`${service.title} benefits`}
        >
          {benefits.map((benefit, i) => (
            <motion.div key={benefit.title} role="listitem" variants={cardVariants} custom={i}>
              <BenefitCard
                title={benefit.title}
                description={benefit.description}
                index={i}
                prefersReducedMotion={prefersReducedMotion}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Panel */}
        <StatsPanel prefersReducedMotion={prefersReducedMotion} />

        {/* Trust Badges */}
        <TrustBadges prefersReducedMotion={prefersReducedMotion} />
      </div>

      {/* Bottom gradient fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{
          background: "linear-gradient(to top, #050816 0%, transparent 100%)",
        }}
        aria-hidden
      />
    </section>
  );
}