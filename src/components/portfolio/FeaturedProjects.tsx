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
  AnimatePresence,
} from "framer-motion";
import {
  Sprout,
  Waves,
  BrainCircuit,
  Cloud,
  ShoppingCart,
  HeartPulse,
  ArrowUpRight,
  ExternalLink,
  CheckCircle2,
  Clock,
  FlaskConical,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

type ProjectStatus = "Live" | "In Development" | "Beta";

interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  technologies: string[];
  status: ProjectStatus;
  icon: React.ElementType;
  accentPrimary: string;
  accentSecondary: string;
  visual: "agriculture" | "water" | "ai" | "cloud" | "ecommerce" | "healthcare";
  caseStudyHref: string;
  liveDemoHref: string;
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

// ─── Project Data ───────────────────────────────────────────────────────────────

const PROJECTS: Project[] = [
  {
    id: "krishi-drishti",
    title: "Krishi Drishti",
    category: "Smart Agriculture",
    description:
      "AI-powered irrigation and crop monitoring platform with IoT integration and real-time analytics.",
    technologies: ["Next.js", "Firebase", "Arduino", "AI"],
    status: "Live",
    icon: Sprout,
    accentPrimary: "#2563EB",
    accentSecondary: "#00D4FF",
    visual: "agriculture",
    caseStudyHref: "/portfolio/krishi-drishti",
    liveDemoHref: "#",
  },
  {
    id: "jalmitra",
    title: "JalMitra",
    category: "Environmental Innovation",
    description:
      "Autonomous waste collection system for rivers and water bodies using AI and IoT.",
    technologies: ["Computer Vision", "IoT", "AI"],
    status: "In Development",
    icon: Waves,
    accentPrimary: "#00D4FF",
    accentSecondary: "#2563EB",
    visual: "water",
    caseStudyHref: "/portfolio/jalmitra",
    liveDemoHref: "#",
  },
  {
    id: "ai-business-assistant",
    title: "AI Business Assistant",
    category: "Artificial Intelligence",
    description:
      "Business automation platform powered by generative AI and smart workflows.",
    technologies: ["GPT-4o", "LangChain", "Node.js"],
    status: "Beta",
    icon: BrainCircuit,
    accentPrimary: "#7C3AED",
    accentSecondary: "#00D4FF",
    visual: "ai",
    caseStudyHref: "/portfolio/ai-business-assistant",
    liveDemoHref: "#",
  },
  {
    id: "enterprise-cloud-platform",
    title: "Enterprise Cloud Platform",
    category: "Cloud Solutions",
    description:
      "Scalable enterprise infrastructure with cloud-native architecture.",
    technologies: ["AWS", "Kubernetes", "Terraform"],
    status: "Live",
    icon: Cloud,
    accentPrimary: "#2563EB",
    accentSecondary: "#7C3AED",
    visual: "cloud",
    caseStudyHref: "/portfolio/enterprise-cloud-platform",
    liveDemoHref: "#",
  },
  {
    id: "ecommerce-platform",
    title: "E-Commerce Platform",
    category: "Web Development",
    description:
      "Modern high-performance online shopping platform optimized for conversions.",
    technologies: ["Next.js", "Stripe", "PostgreSQL"],
    status: "Live",
    icon: ShoppingCart,
    accentPrimary: "#00D4FF",
    accentSecondary: "#7C3AED",
    visual: "ecommerce",
    caseStudyHref: "/portfolio/ecommerce-platform",
    liveDemoHref: "#",
  },
  {
    id: "healthcare-mobile-app",
    title: "Healthcare Mobile App",
    category: "Mobile Application",
    description:
      "Cross-platform healthcare management solution with real-time monitoring.",
    technologies: ["React Native", "Firebase", "HealthKit"],
    status: "Beta",
    icon: HeartPulse,
    accentPrimary: "#7C3AED",
    accentSecondary: "#2563EB",
    visual: "healthcare",
    caseStudyHref: "/portfolio/healthcare-mobile-app",
    liveDemoHref: "#",
  },
];

const STATUS_STYLES: Record<ProjectStatus, { bg: string; border: string; color: string; icon: React.ElementType }> = {
  Live: { bg: "rgba(0,212,255,0.1)", border: "rgba(0,212,255,0.28)", color: "#67e8f9", icon: CheckCircle2 },
  "In Development": { bg: "rgba(124,58,237,0.1)", border: "rgba(124,58,237,0.28)", color: "#c4b5fd", icon: Clock },
  Beta: { bg: "rgba(37,99,235,0.1)", border: "rgba(37,99,235,0.28)", color: "#93c5fd", icon: FlaskConical },
};

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

const cardReveal = {
  hidden: { opacity: 0, y: 40, scale: 0.95, filter: "blur(10px)" },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
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
      <filter id="featuredProjectsNoise">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#featuredProjectsNoise)" />
    </svg>
  );
}

function BackgroundParticles({ reduced }: { reduced: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([]);
  useEffect(() => {
    if (reduced) return;
    setParticles(
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2.2 + 0.6,
        opacity: Math.random() * 0.32 + 0.08,
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

// ─── Project Visual Preview (per-category animated abstraction) ──────────────

function ProjectVisual({
  visual,
  accentPrimary,
  accentSecondary,
  reduced,
  hovered,
}: {
  visual: Project["visual"];
  accentPrimary: string;
  accentSecondary: string;
  reduced: boolean;
  hovered: boolean;
}) {
  // Each category gets a unique abstract animated motif so the "preview"
  // area feels alive and specific rather than a generic placeholder block.
  const renderMotif = () => {
    switch (visual) {
      case "agriculture":
        return (
          <svg viewBox="0 0 200 120" className="w-full h-full" aria-hidden>
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.path
                key={i}
                d={`M ${20 + i * 30} 100 Q ${30 + i * 30} ${60 - i * 3} ${20 + i * 30} 20`}
                stroke={i % 2 === 0 ? accentPrimary : accentSecondary}
                strokeWidth="1.4"
                fill="none"
                strokeLinecap="round"
                opacity="0.5"
                animate={reduced ? {} : { pathLength: [0.3, 1, 0.3], opacity: [0.25, 0.6, 0.25] }}
                transition={{ duration: 4 + i * 0.3, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
              />
            ))}
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.circle
                key={`dot-${i}`}
                cx={20 + i * 30}
                cy="20"
                r="2.5"
                fill={accentSecondary}
                animate={reduced ? {} : { opacity: [0.4, 1, 0.4], r: [2, 3, 2] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.25 }}
              />
            ))}
          </svg>
        );
      case "water":
        return (
          <svg viewBox="0 0 200 120" className="w-full h-full" aria-hidden>
            {[0, 1, 2].map((i) => (
              <motion.circle
                key={i}
                cx="100"
                cy="60"
                r="10"
                stroke={i % 2 === 0 ? accentPrimary : accentSecondary}
                strokeWidth="1.2"
                fill="none"
                opacity="0.5"
                animate={reduced ? {} : { r: [10, 55], opacity: [0.55, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeOut", delay: i * 1.15 }}
              />
            ))}
            <motion.circle
              cx="100"
              cy="60"
              r="4"
              fill={accentSecondary}
              animate={reduced ? {} : { scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </svg>
        );
      case "ai":
        return (
          <svg viewBox="0 0 200 120" className="w-full h-full" aria-hidden>
            {Array.from({ length: 8 }).map((_, i) => {
              const angle = (i / 8) * Math.PI * 2;
              const x = 100 + Math.cos(angle) * 42;
              const y = 60 + Math.sin(angle) * 36;
              return (
                <g key={i}>
                  <motion.line
                    x1="100" y1="60" x2={x} y2={y}
                    stroke={i % 2 === 0 ? accentPrimary : accentSecondary}
                    strokeWidth="0.8"
                    opacity="0.3"
                    animate={reduced ? {} : { opacity: [0.15, 0.45, 0.15] }}
                    transition={{ duration: 3, repeat: Infinity, delay: i * 0.15 }}
                  />
                  <motion.circle
                    cx={x} cy={y} r="2.5"
                    fill={accentSecondary}
                    animate={reduced ? {} : { opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.2 }}
                  />
                </g>
              );
            })}
            <motion.circle
              cx="100" cy="60" r="6"
              fill={accentPrimary}
              animate={reduced ? {} : { scale: [1, 1.25, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            />
          </svg>
        );
      case "cloud":
        return (
          <svg viewBox="0 0 200 120" className="w-full h-full" aria-hidden>
            {[
              { x: 50, y: 30 }, { x: 120, y: 25 }, { x: 160, y: 55 },
              { x: 100, y: 70 }, { x: 40, y: 80 }, { x: 150, y: 90 },
            ].map((node, i, arr) => (
              <React.Fragment key={i}>
                {i < arr.length - 1 && (
                  <motion.line
                    x1={node.x} y1={node.y} x2={arr[(i + 1) % arr.length].x} y2={arr[(i + 1) % arr.length].y}
                    stroke={accentPrimary}
                    strokeWidth="0.7"
                    opacity="0.25"
                    animate={reduced ? {} : { opacity: [0.1, 0.35, 0.1] }}
                    transition={{ duration: 3.5, repeat: Infinity, delay: i * 0.2 }}
                  />
                )}
                <motion.rect
                  x={node.x - 5} y={node.y - 5} width="10" height="10" rx="2.5"
                  fill={i % 2 === 0 ? accentPrimary : accentSecondary}
                  opacity="0.7"
                  animate={reduced ? {} : { opacity: [0.5, 0.9, 0.5], y: [node.y - 5, node.y - 7, node.y - 5] }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.25 }}
                />
              </React.Fragment>
            ))}
          </svg>
        );
      case "ecommerce":
        return (
          <svg viewBox="0 0 200 120" className="w-full h-full" aria-hidden>
            {Array.from({ length: 3 }).map((_, row) =>
              Array.from({ length: 4 }).map((_, col) => (
                <motion.rect
                  key={`${row}-${col}`}
                  x={30 + col * 38}
                  y={20 + row * 32}
                  width="26"
                  height="22"
                  rx="3"
                  fill={(row + col) % 2 === 0 ? accentPrimary : accentSecondary}
                  opacity="0.45"
                  animate={reduced ? {} : { opacity: [0.25, 0.55, 0.25], scale: [0.96, 1, 0.96] }}
                  transition={{ duration: 3, repeat: Infinity, delay: (row * 4 + col) * 0.12 }}
                />
              ))
            )}
          </svg>
        );
      case "healthcare":
        return (
          <svg viewBox="0 0 200 120" className="w-full h-full" aria-hidden>
            <motion.path
              d="M 10 60 L 50 60 L 60 30 L 75 90 L 90 45 L 100 60 L 190 60"
              stroke={accentPrimary}
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.7"
              animate={reduced ? {} : { pathLength: [0, 1], opacity: [0, 0.8, 0.7] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.circle
              cx="100" cy="60" r="3"
              fill={accentSecondary}
              animate={reduced ? {} : { opacity: [0.4, 1, 0.4], scale: [1, 1.4, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <motion.div
        className="w-full h-full"
        animate={hovered && !reduced ? { scale: 1.06 } : { scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {renderMotif()}
      </motion.div>
    </div>
  );
}

// ─── Technology Chip ───────────────────────────────────────────────────────────

function TechChip({ name, index, isInView }: { name: string; index: number; isInView: boolean }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 6, scale: 0.92 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.4, delay: 0.3 + index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.06, y: -1 }}
      className="text-[11px] font-medium px-2.5 py-1 rounded-md"
      style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        color: "rgba(255,255,255,0.55)",
      }}
    >
      {name}
    </motion.span>
  );
}

// ─── Project Card ──────────────────────────────────────────────────────────────

function ProjectCard({ project, index, reduced }: { project: Project; index: number; reduced: boolean }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: "-60px" });
  const [hovered, setHovered] = useState(false);
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50 });

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-100, 100], [4, -4]), { stiffness: 180, damping: 24 });
  const rotateY = useSpring(useTransform(mouseX, [-100, 100], [-4, 4]), { stiffness: 180, damping: 24 });

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

  const Icon = project.icon;
  const statusStyle = STATUS_STYLES[project.status];
  const StatusIcon = statusStyle.icon;

  return (
    <motion.div
      ref={cardRef}
      custom={index}
      variants={cardReveal}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      style={reduced ? {} : { rotateX, rotateY, transformStyle: "preserve-3d", perspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      whileHover={reduced ? {} : { y: -8 }}
      transition={{ duration: 0.35 }}
      className="relative group h-full"
      role="article"
      aria-label={`${project.title} — ${project.category}`}
    >
      {/* Outer glow */}
      <motion.div
        className="absolute -inset-4 rounded-3xl pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 40%, ${project.accentPrimary}26 0%, transparent 70%)`,
          filter: "blur(20px)",
        }}
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        aria-hidden
      />

      {/* Card surface */}
      <div
        className="relative rounded-2xl overflow-hidden h-full flex flex-col"
        style={{
          background: hovered ? "rgba(255,255,255,0.045)" : "rgba(255,255,255,0.025)",
          backdropFilter: "blur(20px)",
          border: `1px solid ${hovered ? `${project.accentPrimary}40` : "rgba(255,255,255,0.08)"}`,
          boxShadow: hovered
            ? `0 28px 56px rgba(0,0,0,0.5), 0 0 0 1px ${project.accentPrimary}25`
            : "0 10px 28px rgba(0,0,0,0.32)",
          transition: "background 0.3s, border 0.3s, box-shadow 0.3s",
        }}
      >
        {/* Spotlight */}
        {hovered && (
          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              background: `radial-gradient(ellipse 60% 50% at ${spotlight.x}% ${spotlight.y}%, ${project.accentPrimary}14 0%, transparent 70%)`,
            }}
            aria-hidden
          />
        )}

        {/* Shimmer sweep */}
        <AnimatePresence>
          {hovered && !reduced && (
            <motion.div
              className="absolute inset-0 pointer-events-none z-10"
              style={{
                background: "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.045) 50%, transparent 70%)",
              }}
              initial={{ x: "-100%" }}
              animate={{ x: "160%" }}
              exit={{}}
              transition={{ duration: 0.95, ease: "easeOut" }}
              aria-hidden
            />
          )}
        </AnimatePresence>

        {/* Border beam */}
        <AnimatePresence>
          {hovered && (
            <>
              <motion.div
                className="absolute top-0 left-0 right-0 h-[1.5px] pointer-events-none z-10"
                style={{
                  background: `linear-gradient(90deg, transparent 0%, ${project.accentPrimary} 35%, ${project.accentSecondary} 65%, transparent 100%)`,
                }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                exit={{ scaleX: 0 }}
                transition={{ duration: 0.5 }}
                aria-hidden
              />
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-[1px] pointer-events-none z-10"
                style={{
                  background: `linear-gradient(90deg, transparent 0%, ${project.accentSecondary}80 50%, transparent 100%)`,
                }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                exit={{ scaleX: 0 }}
                transition={{ duration: 0.5, delay: 0.08 }}
                aria-hidden
              />
            </>
          )}
        </AnimatePresence>

        {/* ── Preview / image placeholder area ── */}
        <div
          className="relative h-44 flex-shrink-0 overflow-hidden"
          style={{
            background: `linear-gradient(160deg, ${project.accentPrimary}14 0%, rgba(255,255,255,0.02) 60%, transparent 100%)`,
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {/* Animated category motif */}
          <ProjectVisual
            visual={project.visual}
            accentPrimary={project.accentPrimary}
            accentSecondary={project.accentSecondary}
            reduced={reduced}
            hovered={hovered}
          />

          {/* Status badge — top left */}
          <div
            className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold z-20"
            style={{
              background: statusStyle.bg,
              border: `1px solid ${statusStyle.border}`,
              color: statusStyle.color,
              backdropFilter: "blur(8px)",
            }}
          >
            <StatusIcon size={10} aria-hidden />
            {project.status}
          </div>

          {/* Floating icon badge — top right */}
          <motion.div
            className="absolute top-3 right-3 w-9 h-9 rounded-xl flex items-center justify-center z-20"
            style={{
              background: `linear-gradient(135deg, ${project.accentPrimary}28 0%, ${project.accentSecondary}1c 100%)`,
              border: `1px solid ${project.accentPrimary}40`,
              backdropFilter: "blur(10px)",
            }}
            animate={reduced ? {} : { y: [0, -3, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: index * 0.3 }}
          >
            <Icon size={16} style={{ color: project.accentPrimary }} strokeWidth={1.8} aria-hidden />
          </motion.div>

          {/* Bottom fade into card body */}
          <div
            className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none"
            style={{ background: "linear-gradient(to top, rgba(5,8,22,0.5), transparent)" }}
            aria-hidden
          />
        </div>

        {/* ── Card body ── */}
        <div className="relative p-5 flex flex-col flex-1">
          {/* Category */}
          <div
            className="text-[11px] font-semibold uppercase tracking-widest mb-1.5"
            style={{ color: project.accentPrimary }}
          >
            {project.category}
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold mb-2 leading-snug" style={{ color: "rgba(255,255,255,0.94)" }}>
            {project.title}
          </h3>

          {/* Description */}
          <p className="text-sm leading-relaxed mb-4 flex-1" style={{ color: "rgba(255,255,255,0.45)" }}>
            {project.description}
          </p>

          {/* Tech chips */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {project.technologies.map((tech, i) => (
              <TechChip key={tech} name={tech} index={i} isInView={isInView} />
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 mt-auto">
            <motion.a
              href={project.caseStudyHref}
              aria-label={`View case study for ${project.title}`}
              whileHover={reduced ? {} : { scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050816] transition-colors"
              style={{
                background: `linear-gradient(135deg, ${project.accentPrimary} 0%, ${project.accentSecondary} 100%)`,
                color: "#050816",
              }}
            >
              View Case Study
              <ArrowUpRight size={13} aria-hidden />
            </motion.a>
            <motion.a
              href={project.liveDemoHref}
              aria-label={`View live demo for ${project.title}`}
              whileHover={reduced ? {} : { scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050816] transition-colors"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.8)",
              }}
            >
              <ExternalLink size={13} aria-hidden />
              <span className="sr-only sm:not-sr-only">Live Demo</span>
            </motion.a>
          </div>
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
      className="text-center mb-16 max-w-3xl mx-auto"
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
    >
      {/* Badge */}
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
          Featured Projects
        </div>
      </motion.div>

      {/* Heading */}
      <motion.h2
        variants={fadeUpVariants}
        id="featured-projects-heading"
        className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-5"
      >
        <GradientWord>Projects</GradientWord>
        <span style={{ color: "rgba(255,255,255,0.92)" }}> That Turn </span>
        <GradientWord>Ideas Into Impact</GradientWord>
      </motion.h2>

      {/* Description */}
      <motion.p
        variants={fadeUpVariants}
        className="text-base sm:text-lg leading-relaxed"
        style={{ color: "rgba(255,255,255,0.45)" }}
      >
        Discover some of the innovative solutions built by Axivon Technologies across AI, Web Development, Mobile Applications, Cloud Platforms, and IoT Systems.
      </motion.p>
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function FeaturedProjects() {
  const reduced = useReducedMotion() ?? false;
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-80px" });
  const isGridInView = useInView(gridRef, { once: true, margin: "-60px" });

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
      aria-labelledby="featured-projects-heading"
    >
      {/* Background */}
      <motion.div className="absolute inset-0" style={reduced ? {} : { y: parallaxY }} aria-hidden>
        <AuroraBackground reduced={reduced} />
        <PerspectiveGrid />
        <BackgroundParticles reduced={reduced} />
      </motion.div>
      <NoiseTexture />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={headerRef}>
          <SectionHeader inView={isHeaderInView} />
        </div>

        {/* Project grid */}
        <motion.div
          ref={gridRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7 xl:gap-8"
          initial="hidden"
          animate={isGridInView ? "visible" : "hidden"}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
          role="list"
          aria-label="Featured projects by Axivon Technologies"
        >
          {PROJECTS.map((project, i) => (
            <div key={project.id} role="listitem" className="h-full">
              <ProjectCard project={project} index={i} reduced={reduced} />
            </div>
          ))}
        </motion.div>
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