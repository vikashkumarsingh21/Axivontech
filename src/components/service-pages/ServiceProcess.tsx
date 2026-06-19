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
  useScroll,
  useReducedMotion,
  AnimatePresence,
} from "framer-motion";
import {
  Search,
  Map,
  Code2,
  Rocket,
  HeartHandshake,
  Layers,
  Cpu,
  BarChart3,
  Shield,
  Zap,
  RefreshCw,
  Globe,
  Clock,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import type { ServiceData } from "@/data/services";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface ServiceProcessProps {
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
  xDrift: number;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const STEP_ICONS = [
  Search, Map, Code2, Rocket, HeartHandshake,
  Layers, Cpu, BarChart3, Shield, Zap, RefreshCw, Globe,
];

const STEP_TIMES = [
  "Week 1", "Week 1–2", "Week 2–4", "Week 3–6",
  "Week 4–8", "Ongoing", "Week 2–3", "Week 5–6",
];

const ACCENT_CYCLE = [
  { primary: "#2563EB", secondary: "#00D4FF", glow: "rgba(37,99,235,0.25)" },
  { primary: "#7C3AED", secondary: "#2563EB", glow: "rgba(124,58,237,0.25)" },
  { primary: "#00D4FF", secondary: "#7C3AED", glow: "rgba(0,212,255,0.2)" },
];

const PHASE_LABELS = ["Discovery", "Planning", "Development", "Launch", "Support"];

// ─── Dynamic Description ───────────────────────────────────────────────────────

function getDynamicDescription(title: string): string {
  const map: Record<string, string> = {
    "Web Development":
      "Every project follows a disciplined, transparent process — from discovery through deployment — so you always know where you stand and what comes next.",
    "Mobile App Development":
      "We take your app from raw idea to live on the App Store through a structured process that eliminates guesswork and keeps every sprint focused on user value.",
    "AI Solutions":
      "Building AI that works in production demands rigour. Our process moves from opportunity assessment through model deployment with continuous evaluation at every stage.",
    "Cloud Solutions":
      "Cloud transformations succeed with the right sequence. Our process ensures your infrastructure is designed, migrated, and hardened before any production traffic moves.",
    "SEO Services":
      "Sustainable organic growth doesn't happen by accident. Our process builds the technical foundation, content authority, and link equity that search engines reward.",
    "Digital Marketing":
      "We don't guess and hope. Every campaign runs through a proven process of strategy, creative, launch, and data-driven optimisation to maximise your return.",
    "UI/UX Design":
      "Great design is a process of discovery and reduction. We research, prototype, test, and refine until every interaction feels inevitable and every screen earns its place.",
    "Custom Software Development":
      "Complex software demands a structured approach. We move from business analysis through architecture, development, and handover with complete transparency at every phase.",
  };
  return (
    map[title] ??
    "A clear, repeatable process built on transparency, expertise, and a relentless focus on delivering outcomes that move your business forward."
  );
}

// ─── Animation Variants ────────────────────────────────────────────────────────

const fadeUpVariants = {
  hidden: { opacity: 0, y: 28, filter: "blur(8px)" },
  visible: {
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

// ─── Background Particles ──────────────────────────────────────────────────────

function BackgroundParticles({ reduced }: { reduced: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([]);
  useEffect(() => {
    if (reduced) return;
    setParticles(
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 0.6,
        opacity: Math.random() * 0.3 + 0.08,
        duration: Math.random() * 14 + 10,
        delay: Math.random() * 8,
        xDrift: (Math.random() - 0.5) * 50,
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
            left: `${p.x}%`, top: `${p.y}%`,
            width: p.size, height: p.size,
            background: `radial-gradient(circle, rgba(37,99,235,${p.opacity}) 0%, rgba(124,58,237,${p.opacity * 0.5}) 100%)`,
          }}
          animate={{ y: [0, -100, 0], x: [0, p.xDrift, 0], opacity: [0, p.opacity, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

// ─── Aurora Orbs ──────────────────────────────────────────────────────────────

function AuroraOrbs({ reduced }: { reduced: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {[
        { color: "37,99,235", top: "-20%", left: "-10%", w: 600, delay: 0, dur: 20 },
        { color: "124,58,237", top: "40%", right: "-15%", w: 500, delay: 5, dur: 25 },
        { color: "0,212,255", bottom: "-15%", left: "30%", w: 450, delay: 10, dur: 22 },
      ].map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            top: orb.top, left: (orb as { left?: string }).left,
            right: (orb as { right?: string }).right,
            bottom: (orb as { bottom?: string }).bottom,
            width: orb.w, height: orb.w,
            background: `radial-gradient(circle, rgba(${orb.color},0.12) 0%, transparent 65%)`,
            filter: "blur(48px)",
          }}
          animate={reduced ? {} : {
            x: [0, 50, -30, 0], y: [0, -40, 30, 0], scale: [1, 1.1, 0.93, 1],
          }}
          transition={{ duration: orb.dur, delay: orb.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

// ─── Animated Grid ─────────────────────────────────────────────────────────────

function GridOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden>
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(37,99,235,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(37,99,235,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "72px 72px",
        }}
        animate={{ opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

// ─── Animated Timeline Beam ────────────────────────────────────────────────────

function TimelineBeam({ reduced }: { reduced: boolean }) {
  const beamRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: beamRef,
    offset: ["start 80%", "end 20%"],
  });
  const scaleY = useSpring(scrollYProgress, { stiffness: 80, damping: 25 });

  return (
    <div
      ref={beamRef}
      className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px] hidden lg:block"
      aria-hidden
    >
      {/* Static track */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(255,255,255,0.05)" }}
      />
      {/* Scroll-driven fill */}
      <motion.div
        className="absolute top-0 left-0 right-0 origin-top"
        style={{
          scaleY: reduced ? 1 : scaleY,
          background: "linear-gradient(to bottom, #2563EB 0%, #00D4FF 40%, #7C3AED 80%, #2563EB 100%)",
          backgroundSize: "100% 300%",
        }}
        animate={reduced ? {} : { backgroundPositionY: ["0%", "100%", "0%"] }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      >
        {/* Travelling beam head */}
        {!reduced && (
          <motion.div
            className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full"
            style={{
              background: "radial-gradient(circle, #00D4FF 0%, rgba(0,212,255,0) 80%)",
              filter: "blur(4px)",
            }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </motion.div>
    </div>
  );
}

// ─── Mobile Timeline ───────────────────────────────────────────────────────────

function MobileTimelineLine({ reduced }: { reduced: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 80%", "end 20%"],
  });
  const scaleY = useSpring(scrollYProgress, { stiffness: 80, damping: 25 });

  return (
    <div
      ref={ref}
      className="absolute left-6 top-0 bottom-0 w-[2px] lg:hidden"
      aria-hidden
    >
      <div className="absolute inset-0" style={{ background: "rgba(255,255,255,0.05)" }} />
      <motion.div
        className="absolute top-0 left-0 right-0 origin-top"
        style={{
          scaleY: reduced ? 1 : scaleY,
          background: "linear-gradient(to bottom, #2563EB, #00D4FF, #7C3AED)",
        }}
      />
    </div>
  );
}

// ─── Connector Dot ─────────────────────────────────────────────────────────────

function ConnectorDot({
  color,
  reduced,
  inView,
}: {
  color: string;
  reduced: boolean;
  inView: boolean;
}) {
  return (
    <div className="relative flex items-center justify-center flex-shrink-0">
      {/* Outer ring pulse */}
      {!reduced && inView && (
        <motion.div
          className="absolute w-10 h-10 rounded-full"
          style={{ border: `1px solid ${color}`, opacity: 0 }}
          animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          aria-hidden
        />
      )}
      {/* Middle ring */}
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center"
        style={{
          background: `${color}18`,
          border: `1px solid ${color}55`,
        }}
      >
        {/* Core dot */}
        <motion.div
          className="w-3 h-3 rounded-full"
          style={{ background: color, boxShadow: `0 0 8px ${color}` }}
          animate={reduced ? {} : { scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}

// ─── Step Card ─────────────────────────────────────────────────────────────────

function StepCard({
  step,
  index,
  side,
  reduced,
}: {
  step: { title: string; description: string };
  index: number;
  side: "left" | "right";
  reduced: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: "-80px" });
  const [hovered, setHovered] = useState(false);
  const accent = ACCENT_CYCLE[index % 3];
  const IconComponent = STEP_ICONS[index % STEP_ICONS.length];
  const timeLabel = STEP_TIMES[index % STEP_TIMES.length];

  // Tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-60, 60], [5, -5]), { stiffness: 160, damping: 22 });
  const rotateY = useSpring(useTransform(mouseX, [-60, 60], [-5, 5]), { stiffness: 160, damping: 22 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (reduced) return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  }, [mouseX, mouseY, reduced]);

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
    setHovered(false);
  }, [mouseX, mouseY]);

  const slideDir = side === "left" ? -1 : 1;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, x: reduced ? 0 : slideDir * 48, filter: "blur(10px)" }}
      animate={isInView ? { opacity: 1, x: 0, filter: "blur(0px)" } : {}}
      transition={{ duration: 0.75, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      style={reduced ? {} : { rotateX, rotateY, transformStyle: "preserve-3d", perspective: 900 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      whileHover={reduced ? {} : { y: -5 }}
      className="relative group w-full"
      tabIndex={0}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      role="article"
      aria-label={`Step ${index + 1}: ${step.title}`}
    >
      {/* Outer glow */}
      <motion.div
        className="absolute -inset-3 rounded-3xl pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 50%, ${accent.primary}20 0%, transparent 70%)`,
          filter: "blur(18px)",
        }}
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        aria-hidden
      />

      {/* Card */}
      <div
        className="relative rounded-2xl overflow-hidden transition-all duration-300"
        style={{
          background: hovered ? "rgba(255,255,255,0.045)" : "rgba(255,255,255,0.025)",
          backdropFilter: "blur(20px)",
          border: `1px solid ${hovered ? `${accent.primary}40` : "rgba(255,255,255,0.07)"}`,
          boxShadow: hovered
            ? `0 24px 48px rgba(0,0,0,0.4), 0 0 0 1px ${accent.primary}25`
            : "0 8px 24px rgba(0,0,0,0.3)",
        }}
      >
        {/* Spotlight */}
        {hovered && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse 70% 50% at 50% 0%, ${accent.primary}14 0%, transparent 70%)`,
            }}
            aria-hidden
          />
        )}

        {/* Shimmer */}
        {hovered && !reduced && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.04) 50%, transparent 70%)",
            }}
            initial={{ x: "-100%" }}
            animate={{ x: "160%" }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            aria-hidden
          />
        )}

        {/* Border beam */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              className="absolute top-0 left-0 right-0 h-[1.5px] pointer-events-none"
              style={{
                background: `linear-gradient(90deg, transparent 0%, ${accent.primary} 30%, ${accent.secondary} 60%, transparent 100%)`,
              }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              exit={{ scaleX: 0 }}
              transition={{ duration: 0.5 }}
              aria-hidden
            />
          )}
        </AnimatePresence>

        <div className="p-6">
          {/* Top row: step number + time badge */}
          <div className="flex items-center justify-between mb-5">
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold tracking-widest uppercase"
              style={{
                background: `${accent.primary}18`,
                border: `1px solid ${accent.primary}30`,
                color: accent.primary,
              }}
            >
              {String(index + 1).padStart(2, "0")}
            </div>
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.35)",
              }}
            >
              <Clock size={10} aria-hidden />
              {timeLabel}
            </div>
          </div>

          {/* Icon */}
          <motion.div
            className="mb-4 w-11 h-11 rounded-xl flex items-center justify-center relative"
            style={{
              background: `linear-gradient(135deg, ${accent.primary}20 0%, ${accent.secondary}15 100%)`,
              border: `1px solid ${accent.primary}30`,
            }}
            animate={reduced ? {} : { y: [0, -3, 0] }}
            transition={{ duration: 3.5 + index * 0.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <div
              className="absolute inset-0 rounded-xl"
              style={{ background: `radial-gradient(circle at 35% 35%, ${accent.primary}28 0%, transparent 65%)` }}
              aria-hidden
            />
            <IconComponent size={18} style={{ color: accent.primary }} strokeWidth={1.8} aria-hidden />
          </motion.div>

          {/* Text */}
          <h3 className="text-base font-semibold mb-2 leading-snug" style={{ color: "rgba(255,255,255,0.9)" }}>
            {step.title}
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.42)" }}>
            {step.description}
          </p>
        </div>

        {/* Bottom accent line */}
        <div className="mx-6 mb-0">
          <motion.div
            className="h-[1px]"
            style={{
              background: `linear-gradient(90deg, ${accent.primary}, ${accent.secondary}, transparent)`,
              originX: 0,
            }}
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
        <div className="h-4" />
      </div>
    </motion.div>
  );
}

// ─── Desktop Zigzag Layout ─────────────────────────────────────────────────────

function DesktopTimeline({
  steps,
  reduced,
}: {
  steps: { title: string; description: string }[];
  reduced: boolean;
}) {
  return (
    <div className="hidden lg:block relative">
      <TimelineBeam reduced={reduced} />

      <div className="relative space-y-16">
        {steps.map((step, i) => {
          const isLeft = i % 2 === 0;
          const accent = ACCENT_CYCLE[i % 3];
          const cardRef = useRef<HTMLDivElement>(null);
          const isInView = useInView(cardRef, { once: true, margin: "-60px" });

          return (
            <div key={step.title} ref={cardRef} className="relative grid grid-cols-2 gap-0 items-center">
              {/* Left slot */}
              <div className="pr-12 flex justify-end">
                {isLeft ? (
                  <div className="w-full max-w-[420px]">
                    <StepCard step={step} index={i} side="left" reduced={reduced} />
                  </div>
                ) : (
                  /* Connector line from center to left card area */
                  <div className="flex-1 flex items-center justify-end pr-0">
                    <motion.div
                      className="h-[1px] flex-1 max-w-[80px]"
                      style={{
                        background: `linear-gradient(to left, ${accent.primary}00, ${accent.primary}60)`,
                        originX: 1,
                      }}
                      initial={{ scaleX: 0 }}
                      animate={isInView ? { scaleX: 1 } : {}}
                      transition={{ duration: 0.6, delay: 0.2 }}
                    />
                  </div>
                )}
              </div>

              {/* Center connector */}
              <div className="absolute left-1/2 -translate-x-1/2 z-10">
                <ConnectorDot color={accent.primary} reduced={reduced} inView={isInView} />
              </div>

              {/* Right slot */}
              <div className="pl-12 flex justify-start">
                {!isLeft ? (
                  <div className="w-full max-w-[420px]">
                    <StepCard step={step} index={i} side="right" reduced={reduced} />
                  </div>
                ) : (
                  <div className="flex-1 flex items-center pl-0">
                    <motion.div
                      className="h-[1px] flex-1 max-w-[80px]"
                      style={{
                        background: `linear-gradient(to right, ${accent.primary}00, ${accent.primary}60)`,
                        originX: 0,
                      }}
                      initial={{ scaleX: 0 }}
                      animate={isInView ? { scaleX: 1 } : {}}
                      transition={{ duration: 0.6, delay: 0.2 }}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Mobile / Tablet Single Column ────────────────────────────────────────────

function MobileTimeline({
  steps,
  reduced,
}: {
  steps: { title: string; description: string }[];
  reduced: boolean;
}) {
  return (
    <div className="lg:hidden relative pl-14">
      <MobileTimelineLine reduced={reduced} />

      <div className="space-y-10">
        {steps.map((step, i) => {
          const accent = ACCENT_CYCLE[i % 3];
          const dotRef = useRef<HTMLDivElement>(null);
          const isInView = useInView(dotRef, { once: true, margin: "-60px" });

          return (
            <div key={step.title} className="relative">
              {/* Dot on left rail */}
              <div ref={dotRef} className="absolute -left-14 top-6 z-10">
                <ConnectorDot color={accent.primary} reduced={reduced} inView={isInView} />
              </div>
              <StepCard step={step} index={i} side="right" reduced={reduced} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Process Summary Panel ─────────────────────────────────────────────────────

function ProcessSummaryPanel({ reduced }: { reduced: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      className="relative mt-20 rounded-2xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.025)",
        backdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 16px 48px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
      aria-label="Process summary"
    >
      {/* Top glow line */}
      {!reduced && (
        <motion.div
          className="absolute top-0 left-0 right-0 h-[1px] pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, #2563EB 25%, #00D4FF 50%, #7C3AED 75%, transparent 100%)",
          }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 4, repeat: Infinity }}
          aria-hidden
        />
      )}

      {/* Floating bg glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 100%, rgba(37,99,235,0.06) 0%, transparent 70%)",
        }}
        aria-hidden
      />

      <div className="relative p-6 sm:p-8">
        <div className="text-xs font-semibold uppercase tracking-widest mb-6" style={{ color: "rgba(255,255,255,0.3)" }}>
          Full Engagement Lifecycle
        </div>

        {/* Phase flow */}
        <div className="flex flex-wrap items-center gap-3">
          {PHASE_LABELS.map((phase, i) => {
            const accent = ACCENT_CYCLE[i % 3];
            return (
              <React.Fragment key={phase}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
                  style={{
                    background: `${accent.primary}12`,
                    border: `1px solid ${accent.primary}28`,
                  }}
                >
                  <motion.div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: accent.primary }}
                    animate={reduced ? {} : { scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2 + i * 0.3, repeat: Infinity }}
                    aria-hidden
                  />
                  <span className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.7)" }}>
                    {phase}
                  </span>
                </motion.div>

                {i < PHASE_LABELS.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4, delay: i * 0.1 + 0.15 }}
                  >
                    <ArrowRight size={14} style={{ color: "rgba(255,255,255,0.2)" }} aria-hidden />
                  </motion.div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Bottom trust row */}
        <div
          className="mt-6 pt-6 flex flex-wrap gap-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          {[
            "Transparent milestones",
            "Weekly progress updates",
            "Staged delivery",
            "Full documentation",
          ].map((item, i) => (
            <motion.div
              key={item}
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.4, delay: 0.4 + i * 0.08 }}
              className="flex items-center gap-1.5 text-xs font-medium"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              <CheckCircle2 size={12} style={{ color: "#00D4FF" }} aria-hidden />
              {item}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Section Header ────────────────────────────────────────────────────────────

function SectionHeader({ service, inView }: { service: ServiceData; inView: boolean }) {
  return (
    <motion.div
      className="text-center mb-20"
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
    >
      {/* Badge */}
      <motion.div variants={fadeUpVariants} className="flex justify-center mb-5">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest"
          style={{
            background: "rgba(124,58,237,0.1)",
            border: "1px solid rgba(124,58,237,0.25)",
            color: "#c4b5fd",
          }}
        >
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-purple-400"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            aria-hidden
          />
          Our Process
        </div>
      </motion.div>

      {/* Heading */}
      <motion.h2
        variants={fadeUpVariants}
        id="process-heading"
        className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-5"
      >
        <span style={{ color: "rgba(255,255,255,0.92)" }}>How We Deliver</span>
        <br />
        <span
          style={{
            background: "linear-gradient(135deg, #2563EB 0%, #00D4FF 45%, #7C3AED 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {service.title}
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

export default function ServiceProcess({ service }: ServiceProcessProps) {
  const reduced = useReducedMotion() ?? false;
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-80px" });

  // Parallax on background
  const scrollY = useMotionValue(0);
  useEffect(() => {
    if (reduced) return;
    const handler = () => scrollY.set(window.scrollY);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [scrollY, reduced]);
  const parallaxY = useTransform(scrollY, [0, 1000], [0, -50]);

  const steps = useMemo(() => service.process, [service.process]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden py-24 lg:py-32"
      style={{ background: "#050816" }}
      aria-labelledby="process-heading"
    >
      {/* Background */}
      <motion.div
        className="absolute inset-0"
        style={reduced ? {} : { y: parallaxY }}
        aria-hidden
      >
        <AuroraOrbs reduced={reduced} />
        <GridOverlay />
        <BackgroundParticles reduced={reduced} />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={headerRef}>
          <SectionHeader service={service} inView={isHeaderInView} />
        </div>

        {/* Desktop zigzag */}
        <DesktopTimeline steps={steps} reduced={reduced} />

        {/* Mobile single column */}
        <MobileTimeline steps={steps} reduced={reduced} />

        {/* Summary panel */}
        <ProcessSummaryPanel reduced={reduced} />
      </div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{ background: "linear-gradient(to top, #050816 0%, transparent 100%)" }}
        aria-hidden
      />
    </section>
  );
}