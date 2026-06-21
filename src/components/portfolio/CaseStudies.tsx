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
  useScroll,
  useReducedMotion,
  animate,
} from "framer-motion";
import {
  Sprout,
  Waves,
  BrainCircuit,
  ArrowRight,
  ArrowDown,
  CheckCircle2,
  Droplets,
  Activity,
  Sparkles,
  Clock,
  TrendingUp,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface NumericResult {
  type: "numeric";
  value: number;
  prefix?: string;
  suffix: string;
  label: string;
}

interface TextResult {
  type: "text";
  label: string;
}

type ResultItem = NumericResult | TextResult;

interface CaseStudy {
  id: string;
  title: string;
  category: string;
  icon: React.ElementType;
  accentPrimary: string;
  accentSecondary: string;
  challenge: string;
  solution: string;
  technologies: string[];
  results: ResultItem[];
}

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

// ─── Case Study Data ────────────────────────────────────────────────────────────

const CASE_STUDIES: CaseStudy[] = [
  {
    id: "krishi-drishti",
    title: "Krishi Drishti",
    category: "Smart Agriculture",
    icon: Sprout,
    accentPrimary: "#2563EB",
    accentSecondary: "#00D4FF",
    challenge:
      "Farmers struggle with inefficient irrigation and lack of real-time crop insights.",
    solution:
      "Developed an IoT-powered smart irrigation platform with sensor monitoring and AI-driven analytics.",
    technologies: ["Next.js", "Firebase", "Arduino", "AI"],
    results: [
      { type: "numeric", value: 40, suffix: "%", label: "Water Saving" },
      { type: "text", label: "Real-Time Monitoring" },
      { type: "text", label: "Improved Crop Management" },
    ],
  },
  {
    id: "jalmitra",
    title: "JalMitra",
    category: "Environmental Innovation",
    icon: Waves,
    accentPrimary: "#00D4FF",
    accentSecondary: "#2563EB",
    challenge:
      "Water bodies suffer from increasing floating waste and pollution.",
    solution:
      "Designed an autonomous AI-powered water cleaning system using computer vision and IoT.",
    technologies: ["Computer Vision", "AI", "IoT"],
    results: [
      { type: "text", label: "Automated Waste Detection" },
      { type: "text", label: "Improved Water Quality" },
      { type: "text", label: "Scalable Solution" },
    ],
  },
  {
    id: "ai-business-assistant",
    title: "AI Business Assistant",
    category: "Artificial Intelligence",
    icon: BrainCircuit,
    accentPrimary: "#7C3AED",
    accentSecondary: "#00D4FF",
    challenge:
      "Businesses spend significant time on repetitive operational tasks.",
    solution:
      "Built an AI-powered assistant capable of automating workflows and generating insights.",
    technologies: ["Generative AI", "Next.js", "Python"],
    results: [
      { type: "text", label: "Process Automation" },
      { type: "text", label: "Time Savings" },
      { type: "text", label: "Better Decision Making" },
    ],
  },
];

// ─── Animation Variants ────────────────────────────────────────────────────────

const fadeUpVariants = {
  hidden: { opacity: 0, y: 28, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

// ─── Background Layers ─────────────────────────────────────────────────────────

function AuroraBackground({ reduced }: { reduced: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <motion.div
        className="absolute -top-52 -left-36 w-[640px] h-[640px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(37,99,235,0.16) 0%, transparent 65%)",
          filter: "blur(50px)",
        }}
        animate={reduced ? {} : { x: [0, 70, -35, 0], y: [0, 55, -25, 0], scale: [1, 1.12, 0.93, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 -right-44 w-[560px] h-[560px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(124,58,237,0.14) 0%, transparent 65%)",
          filter: "blur(50px)",
        }}
        animate={reduced ? {} : { x: [0, -55, 35, 0], y: [0, -65, 40, 0], scale: [1, 0.9, 1.1, 1] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      />
      <motion.div
        className="absolute -bottom-28 left-1/3 w-[480px] h-[380px] rounded-full"
        style={{
          background: "radial-gradient(ellipse, rgba(0,212,255,0.1) 0%, transparent 65%)",
          filter: "blur(60px)",
        }}
        animate={reduced ? {} : { scaleX: [1, 1.15, 0.92, 1], scaleY: [1, 0.85, 1.08, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 8 }}
      />
    </div>
  );
}

function PerspectiveGrid() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(37,99,235,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(37,99,235,0.035) 1px, transparent 1px)
          `,
          backgroundSize: "68px 68px",
          maskImage: "radial-gradient(ellipse 75% 60% at 50% 20%, black 25%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 75% 60% at 50% 20%, black 25%, transparent 75%)",
        }}
        animate={{ opacity: [0.4, 0.85, 0.4] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

function NoiseTexture() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-[0.022] pointer-events-none mix-blend-overlay"
      aria-hidden
    >
      <filter id="caseStudiesNoise">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#caseStudiesNoise)" />
    </svg>
  );
}

function BackgroundParticles({ reduced }: { reduced: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([]);
  useEffect(() => {
    if (reduced) return;
    setParticles(
      Array.from({ length: 22 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2.2 + 0.6,
        opacity: Math.random() * 0.3 + 0.08,
        duration: Math.random() * 13 + 9,
        delay: Math.random() * 7,
        drift: (Math.random() - 0.5) * 50,
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
            background: `radial-gradient(circle, rgba(0,212,255,${p.opacity}) 0%, rgba(124,58,237,${p.opacity * 0.5}) 100%)`,
          }}
          animate={{ y: [0, -100, 0], x: [0, p.drift, 0], opacity: [0, p.opacity, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

// ─── Timeline Spine (scroll-driven draw) ───────────────────────────────────────

function TimelineSpine({ reduced }: { reduced: boolean }) {
  const spineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: spineRef,
    offset: ["start 75%", "end 25%"],
  });
  const scaleY = useSpring(scrollYProgress, { stiffness: 80, damping: 25 });

  return (
    <div
      ref={spineRef}
      className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px] hidden lg:block"
      aria-hidden
    >
      <div className="absolute inset-0" style={{ background: "rgba(255,255,255,0.05)" }} />
      <motion.div
        className="absolute top-0 left-0 right-0 origin-top"
        style={{
          scaleY: reduced ? 1 : scaleY,
          background: "linear-gradient(to bottom, #2563EB 0%, #00D4FF 35%, #7C3AED 70%, #2563EB 100%)",
          backgroundSize: "100% 300%",
        }}
        animate={reduced ? {} : { backgroundPositionY: ["0%", "100%", "0%"] }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      >
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

// ─── Connector Dot ─────────────────────────────────────────────────────────────

function ConnectorDot({ color, reduced, inView }: { color: string; reduced: boolean; inView: boolean }) {
  return (
    <div className="relative flex items-center justify-center flex-shrink-0">
      {!reduced && inView && (
        <motion.div
          className="absolute w-12 h-12 rounded-full"
          style={{ border: `1px solid ${color}`, opacity: 0 }}
          animate={{ scale: [1, 1.9], opacity: [0.6, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
          aria-hidden
        />
      )}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center"
        style={{ background: `${color}18`, border: `1px solid ${color}55` }}
      >
        <motion.div
          className="w-3.5 h-3.5 rounded-full"
          style={{ background: color, boxShadow: `0 0 10px ${color}` }}
          animate={reduced ? {} : { scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}

// ─── Animated Result Chip ──────────────────────────────────────────────────────

function ResultChip({
  result,
  index,
  accentPrimary,
  isInView,
  reduced,
}: {
  result: ResultItem;
  index: number;
  accentPrimary: string;
  isInView: boolean;
  reduced: boolean;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (result.type !== "numeric" || !isInView) return;
    if (reduced) {
      setDisplayValue(result.value);
      return;
    }
    const controls = animate(0, result.value, {
      duration: 1.4,
      delay: 0.3 + index * 0.12,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => setDisplayValue(Math.round(latest)),
    });
    return () => controls.stop();
  }, [isInView, result, index, reduced]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.94 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.5, delay: 0.2 + index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl"
      style={{
        background: "rgba(255,255,255,0.035)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {result.type === "numeric" ? (
        <>
          <div
            className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
            style={{ background: `${accentPrimary}18`, border: `1px solid ${accentPrimary}35` }}
          >
            <TrendingUp size={14} style={{ color: accentPrimary }} aria-hidden />
          </div>
          <div>
            <div className="text-base font-bold tabular-nums" style={{ color: accentPrimary }}>
              {result.prefix ?? ""}
              {displayValue}
              {result.suffix}
            </div>
            <div className="text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>
              {result.label}
            </div>
          </div>
        </>
      ) : (
        <>
          <div
            className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
            style={{ background: `${accentPrimary}18`, border: `1px solid ${accentPrimary}35` }}
          >
            <CheckCircle2 size={14} style={{ color: accentPrimary }} aria-hidden />
          </div>
          <div className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.78)" }}>
            {result.label}
          </div>
        </>
      )}
    </motion.div>
  );
}

// ─── Transformation Arc (Challenge → Solution) ────────────────────────────────

function TransformationArc({
  challenge,
  solution,
  accentPrimary,
  accentSecondary,
  isInView,
  reduced,
}: {
  challenge: string;
  solution: string;
  accentPrimary: string;
  accentSecondary: string;
  isInView: boolean;
  reduced: boolean;
}) {
  return (
    <div className="flex flex-col gap-3">
      {/* Challenge */}
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-xl p-4"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="flex items-center gap-2 mb-1.5">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "rgba(255,255,255,0.35)" }}
            aria-hidden
          />
          <span
            className="text-[11px] font-semibold uppercase tracking-widest"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            The Challenge
          </span>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
          {challenge}
        </p>
      </motion.div>

      {/* Connector arrow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.4, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="flex justify-center -my-1"
        aria-hidden
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${accentPrimary}22, ${accentSecondary}18)`,
            border: `1px solid ${accentPrimary}40`,
          }}
        >
          <motion.div
            animate={reduced ? {} : { y: [0, 2, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowDown size={14} style={{ color: accentPrimary }} />
          </motion.div>
        </div>
      </motion.div>

      {/* Solution */}
      <motion.div
        initial={{ opacity: 0, x: 16 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-xl p-4"
        style={{
          background: `linear-gradient(135deg, ${accentPrimary}10 0%, ${accentSecondary}08 100%)`,
          border: `1px solid ${accentPrimary}30`,
        }}
      >
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles size={11} style={{ color: accentSecondary }} aria-hidden />
          <span
            className="text-[11px] font-semibold uppercase tracking-widest"
            style={{ color: accentSecondary }}
          >
            Our Solution
          </span>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.85)" }}>
          {solution}
        </p>
      </motion.div>
    </div>
  );
}

// ─── Case Study Card ───────────────────────────────────────────────────────────

function CaseStudyCard({
  study,
  index,
  align,
  reduced,
}: {
  study: CaseStudy;
  index: number;
  align: "left" | "right";
  reduced: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: "-80px" });
  const [hovered, setHovered] = useState(false);
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50 });

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-120, 120], [3, -3]), { stiffness: 160, damping: 24 });
  const rotateY = useSpring(useTransform(mouseX, [-120, 120], [-3, 3]), { stiffness: 160, damping: 24 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (reduced) return;
      const rect = cardRef.current?.getBoundingClientRect();
      if (!rect) return;
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      mouseX.set(cx - rect.width / 2);
      mouseY.set(cy - rect.height / 2);
      setSpotlight({ x: (cx / rect.width) * 100, y: (cy / rect.height) * 100 });
    },
    [mouseX, mouseY, reduced]
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
    setHovered(false);
  }, [mouseX, mouseY]);

  const Icon = study.icon;
  const slideDir = align === "left" ? -1 : 1;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, x: reduced ? 0 : slideDir * 56, y: 24, filter: "blur(12px)" }}
      animate={isInView ? { opacity: 1, x: 0, y: 0, filter: "blur(0px)" } : {}}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      style={reduced ? {} : { rotateX, rotateY, transformStyle: "preserve-3d", perspective: 1200 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      className="relative group w-full"
      role="article"
      aria-label={`Case study: ${study.title} — ${study.category}`}
    >
      {/* Outer glow */}
      <motion.div
        className="absolute -inset-5 rounded-3xl pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 40%, ${study.accentPrimary}22 0%, transparent 70%)`,
          filter: "blur(24px)",
        }}
        animate={{ opacity: hovered ? 1 : 0.4 }}
        transition={{ duration: 0.4 }}
        aria-hidden
      />

      {/* Card surface */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: hovered ? "rgba(255,255,255,0.045)" : "rgba(255,255,255,0.026)",
          backdropFilter: "blur(22px)",
          border: `1px solid ${hovered ? `${study.accentPrimary}40` : "rgba(255,255,255,0.08)"}`,
          boxShadow: hovered
            ? `0 32px 64px rgba(0,0,0,0.5), 0 0 0 1px ${study.accentPrimary}22`
            : "0 16px 40px rgba(0,0,0,0.35)",
          transition: "background 0.3s, border 0.3s, box-shadow 0.3s",
        }}
      >
        {/* Spotlight */}
        {hovered && (
          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              background: `radial-gradient(ellipse 60% 50% at ${spotlight.x}% ${spotlight.y}%, ${study.accentPrimary}12 0%, transparent 70%)`,
            }}
            aria-hidden
          />
        )}

        {/* Border beam on hover */}
        {hovered && !reduced && (
          <motion.div
            className="absolute top-0 left-0 right-0 h-[1.5px] pointer-events-none z-10"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${study.accentPrimary} 35%, ${study.accentSecondary} 65%, transparent 100%)`,
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5 }}
            aria-hidden
          />
        )}

        <div className="p-6 sm:p-8">
          {/* Header row */}
          <div className="flex items-start justify-between mb-6 gap-4">
            <div className="flex items-center gap-3">
              <motion.div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 relative"
                style={{
                  background: `linear-gradient(135deg, ${study.accentPrimary}22 0%, ${study.accentSecondary}16 100%)`,
                  border: `1px solid ${study.accentPrimary}38`,
                }}
                animate={reduced ? {} : { y: [0, -3, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <div
                  className="absolute inset-0 rounded-xl"
                  style={{ background: `radial-gradient(circle at 35% 35%, ${study.accentPrimary}28 0%, transparent 65%)` }}
                  aria-hidden
                />
                <Icon size={20} style={{ color: study.accentPrimary }} strokeWidth={1.8} aria-hidden />
              </motion.div>
              <div>
                <div
                  className="text-[11px] font-semibold uppercase tracking-widest mb-0.5"
                  style={{ color: study.accentPrimary }}
                >
                  {study.category}
                </div>
                <h3 className="text-xl font-bold leading-snug" style={{ color: "rgba(255,255,255,0.95)" }}>
                  {study.title}
                </h3>
              </div>
            </div>

            {/* Index badge */}
            <div
              className="flex items-center justify-center w-9 h-9 rounded-lg text-xs font-bold flex-shrink-0"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.3)",
              }}
              aria-hidden
            >
              {String(index + 1).padStart(2, "0")}
            </div>
          </div>

          {/* Challenge → Solution arc */}
          <TransformationArc
            challenge={study.challenge}
            solution={study.solution}
            accentPrimary={study.accentPrimary}
            accentSecondary={study.accentSecondary}
            isInView={isInView}
            reduced={reduced}
          />

          {/* Tech stack */}
          <div className="flex flex-wrap gap-1.5 mt-5 mb-6">
            {study.technologies.map((tech, i) => (
              <motion.span
                key={tech}
                initial={{ opacity: 0, y: 6 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.55 + i * 0.06 }}
                className="text-[11px] font-medium px-2.5 py-1 rounded-md"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                {tech}
              </motion.span>
            ))}
          </div>

          {/* Results */}
          <div>
            <div
              className="text-[11px] font-semibold uppercase tracking-widest mb-3"
              style={{ color: "rgba(255,255,255,0.32)" }}
            >
              Results
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {study.results.map((result, i) => (
                <ResultChip
                  key={result.label}
                  result={result}
                  index={i}
                  accentPrimary={study.accentPrimary}
                  isInView={isInView}
                  reduced={reduced}
                />
              ))}
            </div>
          </div>

          {/* CTA */}
          <motion.a
            href={`/portfolio/${study.id}`}
            aria-label={`Read the full case study for ${study.title}`}
            whileHover={reduced ? {} : { x: 4 }}
            className="inline-flex items-center gap-1.5 mt-6 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050816] rounded-md"
            style={{ color: study.accentPrimary }}
          >
            Read Full Case Study
            <ArrowRight size={15} aria-hidden />
          </motion.a>
        </div>
      </div>
    </motion.div>
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

// ─── Section Header ────────────────────────────────────────────────────────────

function SectionHeader({ inView }: { inView: boolean }) {
  return (
    <motion.div
      className="text-center mb-20 max-w-3xl mx-auto"
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
    >
      <motion.div variants={fadeUpVariants} className="flex justify-center mb-5">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest"
          style={{
            background: "linear-gradient(90deg, rgba(37,99,235,0.12), rgba(124,58,237,0.12))",
            border: "1px solid rgba(124,58,237,0.3)",
            color: "#a78bfa",
          }}
        >
          <motion.div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "#7C3AED" }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            aria-hidden
          />
          Case Studies
        </div>
      </motion.div>

      <motion.h2
        variants={fadeUpVariants}
        id="case-studies-heading"
        className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-5"
      >
        <span style={{ color: "rgba(255,255,255,0.92)" }}>Transforming </span>
        <GradientWord>Challenges</GradientWord>
        <span style={{ color: "rgba(255,255,255,0.92)" }}> Into </span>
        <GradientWord>Digital Success Stories</GradientWord>
      </motion.h2>

      <motion.p
        variants={fadeUpVariants}
        className="text-base sm:text-lg leading-relaxed"
        style={{ color: "rgba(255,255,255,0.45)" }}
      >
        Explore how Axivon Technologies solves real business problems through innovative technology solutions.
      </motion.p>
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function CaseStudies() {
  const reduced = useReducedMotion() ?? false;
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-80px" });

  // Parallax background motion on scroll
  const scrollY = useMotionValue(0);
  useEffect(() => {
    if (reduced) return;
    const handler = () => scrollY.set(window.scrollY);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [scrollY, reduced]);
  const parallaxY = useTransform(scrollY, [0, 1200], [0, -45]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden py-24 lg:py-32"
      style={{ background: "#050816" }}
      aria-labelledby="case-studies-heading"
    >
      {/* Background */}
      <motion.div className="absolute inset-0" style={reduced ? {} : { y: parallaxY }} aria-hidden>
        <AuroraBackground reduced={reduced} />
        <PerspectiveGrid />
        <BackgroundParticles reduced={reduced} />
      </motion.div>
      <NoiseTexture />

      {/* Content */}
      <div className="relative z-10 max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={headerRef}>
          <SectionHeader inView={isHeaderInView} />
        </div>

        {/* Alternating timeline layout */}
        <div className="relative">
          <TimelineSpine reduced={reduced} />

          <div className="relative space-y-14 lg:space-y-20">
            {CASE_STUDIES.map((study, i) => {
              const isLeft = i % 2 === 0;
              const dotRef = useRefSafe();
              return (
                <CaseStudyRow
                  key={study.id}
                  study={study}
                  index={i}
                  isLeft={isLeft}
                  reduced={reduced}
                />
              );
            })}
          </div>
        </div>
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

// ─── Helper: safe ref creator (avoids calling useRef conditionally inline) ────

function useRefSafe() {
  return useRef<HTMLDivElement>(null);
}

// ─── Case Study Row (desktop zigzag / mobile stacked) ─────────────────────────

function CaseStudyRow({
  study,
  index,
  isLeft,
  reduced,
}: {
  study: CaseStudy;
  index: number;
  isLeft: boolean;
  reduced: boolean;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(rowRef, { once: true, margin: "-100px" });

  return (
    <div ref={rowRef} className="relative">
      {/* Desktop: zigzag with center dot */}
      <div className="hidden lg:grid grid-cols-2 gap-0 items-start">
        <div className="pr-12 flex justify-end">
          {isLeft && (
            <div className="w-full max-w-[560px]">
              <CaseStudyCard study={study} index={index} align="left" reduced={reduced} />
            </div>
          )}
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 top-10 z-10">
          <ConnectorDot color={study.accentPrimary} reduced={reduced} inView={isInView} />
        </div>

        <div className="pl-12 flex justify-start">
          {!isLeft && (
            <div className="w-full max-w-[560px]">
              <CaseStudyCard study={study} index={index} align="right" reduced={reduced} />
            </div>
          )}
        </div>
      </div>

      {/* Mobile / tablet: stacked single column */}
      <div className="lg:hidden">
        <CaseStudyCard study={study} index={index} align="left" reduced={reduced} />
      </div>
    </div>
  );
}