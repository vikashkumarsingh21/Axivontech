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
  BarChart3,
  Wrench,
  Globe,
  Cpu,
  Database,
  Cloud,
  Code2,
  Layers,
  Lock,
  Rocket,
  RefreshCw,
  Star,
  Box,
  Terminal,
  GitBranch,
  Wifi,
  CheckCircle2,
} from "lucide-react";
import type { ServiceData } from "@/data/services";
import type { Variants } from "framer-motion";

const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const;

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface ServiceTechStackProps {
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
  drift: number;
}

interface TechItem {
  name: string;
  icon: React.ElementType;
  category: string;
  status: "Production" | "Stable" | "Core" | "Enterprise";
  accent: { primary: string; secondary: string };
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const ACCENT_CYCLE = [
  { primary: "#2563EB", secondary: "#00D4FF" },
  { primary: "#7C3AED", secondary: "#2563EB" },
  { primary: "#00D4FF", secondary: "#7C3AED" },
  { primary: "#2563EB", secondary: "#7C3AED" },
  { primary: "#7C3AED", secondary: "#00D4FF" },
  { primary: "#00D4FF", secondary: "#2563EB" },
];

const ICON_POOL: React.ElementType[] = [
  Code2, Database, Cloud, Globe, Cpu, Layers,
  Lock, Rocket, RefreshCw, Star, Box, Terminal,
  GitBranch, Wifi, Zap, Shield, BarChart3, Wrench,
];

const STATUS_CYCLE: TechItem["status"][] = [
  "Production", "Stable", "Core", "Enterprise",
];

const CATEGORY_MAP: Record<string, string> = {
  // Frontend
  "Next.js 15": "Framework", "React 19": "UI Library", "React Native": "Mobile",
  "Expo": "Mobile", "Flutter": "Cross-Platform", "Tailwind CSS": "Styling",
  "Framer": "Animation", "Radix UI": "Components", "Storybook": "Design System",
  // Backend & APIs
  "Node.js": "Runtime", "Python": "Language", "Go": "Language", "FastAPI": "API",
  "GraphQL": "API", "gRPC": "Protocol", "REST APIs": "API",
  // Databases
  "PostgreSQL": "Database", "Redis": "Cache", "Prisma ORM": "ORM",
  "Elasticsearch": "Search", "Pinecone": "Vector DB", "Weaviate": "Vector DB",
  // Cloud & DevOps
  "AWS": "Cloud", "Google Cloud Platform": "Cloud", "Microsoft Azure": "Cloud",
  "Vercel": "Deployment", "Terraform": "IaC", "AWS CDK": "IaC",
  "Kubernetes": "Orchestration", "Docker": "Container",
  "GitHub Actions": "CI/CD", "Fastlane": "CI/CD",
  // AI & ML
  "OpenAI GPT-4o": "AI Model", "Anthropic Claude": "AI Model",
  "LangChain": "AI Framework", "LlamaIndex": "AI Framework",
  "PyTorch": "ML Library", "Hugging Face": "AI Platform",
  "AWS SageMaker": "MLOps", "Vertex AI": "MLOps",
  // Analytics & Monitoring
  "Datadog": "Monitoring", "Grafana": "Observability",
  "Prometheus": "Metrics", "Sentry": "Error Tracking",
  "Google Analytics 4": "Analytics", "Looker Studio": "BI",
  // Payments & Auth
  "Stripe": "Payments", "Firebase": "Backend", "Supabase": "Backend",
  // Marketing & SEO
  "Ahrefs": "SEO Tool", "SEMrush": "SEO Tool", "Surfer SEO": "Content SEO",
  "Clearscope": "Content SEO", "Hotjar": "UX Analytics",
  "Google Ads": "Paid Ads", "Meta Ads": "Paid Ads",
  "LinkedIn Ads": "Paid Ads", "HubSpot": "CRM", "Klaviyo": "Email",
  // Other
  "Contentful": "CMS", "TypeScript": "Language", "Figma": "Design",
  "FigJam": "Collaboration", "Maze": "User Research", "Lottie": "Animation",
  "Vault by HashiCorp": "Secrets", "Segment": "Data Pipeline",
  "Detox": "Testing", "Zapier": "Automation",
  "Google Search Console": "SEO", "Screaming Frog": "SEO Audit",
  "PageSpeed Insights": "Performance", "Schema Markup": "SEO",
  "Redux Toolkit": "State", "Zustand": "State",
  "Mailchimp": "Email", "Adobe Illustrator": "Design",
};

function getTechCategory(name: string): string {
  return CATEGORY_MAP[name] ?? "Technology";
}

// ─── Dynamic Description ───────────────────────────────────────────────────────

function getDynamicDescription(title: string): string {
  const map: Record<string, string> = {
    "Web Development":
      "We select every tool with intent — battle-tested frameworks and modern runtimes that deliver performance, developer velocity, and zero compromises on reliability.",
    "Mobile App Development":
      "Our mobile stack is chosen for native feel at cross-platform speed, giving your users a seamless experience while keeping your engineering costs sharp.",
    "AI Solutions":
      "From foundation models to vector stores, every layer of our AI stack is chosen for accuracy, latency, and the ability to improve as your data grows.",
    "Cloud Solutions":
      "Cloud-provider agnostic by design, infrastructure-as-code first by default — our stack gives you full control and zero vendor lock-in.",
    "SEO Services":
      "Precision tools for every layer of SEO — from technical auditing to content optimisation — so every decision is backed by data, not guesswork.",
    "Digital Marketing":
      "A curated stack of best-in-class platforms for acquisition, automation, and attribution — unified so you always know what's driving growth.",
    "UI/UX Design":
      "Design tools chosen for fidelity, collaboration, and seamless developer handoff — so what's designed is exactly what gets built.",
    "Custom Software Development":
      "Languages, databases, and infrastructure chosen for longevity, performance, and the ability to evolve with your business over years, not quarters.",
  };
  return (
    map[title] ??
    "Every technology in our stack is selected for performance, security, and long-term maintainability — so your platform stays fast and reliable as it grows."
  );
}

// ─── Build enriched tech list ──────────────────────────────────────────────────

function buildTechItems(technologies: { name: string }[]): TechItem[] {
  return technologies.map((t, i) => ({
    name: t.name,
    icon: ICON_POOL[i % ICON_POOL.length],
    category: getTechCategory(t.name),
    status: STATUS_CYCLE[i % STATUS_CYCLE.length],
    accent: ACCENT_CYCLE[i % ACCENT_CYCLE.length],
  }));
}

// ─── Animation Variants ────────────────────────────────────────────────────────

const fadeUpVariants = {
  hidden: { opacity: 0, y: 28, filter: "blur(8px)" },
  visible: {
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { duration: 0.65, ease: EASE_PREMIUM },
  },
};

const cardReveal: Variants = {
  hidden: { opacity: 0, y: 32, scale: 0.94, filter: "blur(8px)" },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1, filter: "blur(0px)",
    transition: { duration: 0.6, delay: i * 0.07, ease: EASE_PREMIUM },
  }),
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
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.3 + 0.07,
        duration: Math.random() * 14 + 9,
        delay: Math.random() * 7,
        drift: (Math.random() - 0.5) * 48,
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
          animate={{ y: [0, -90, 0], x: [0, p.drift, 0], opacity: [0, p.opacity, 0] }}
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
        { color: "37,99,235", top: "-15%", left: "-8%", w: 580, delay: 0, dur: 22 },
        { color: "124,58,237", top: "45%", right: "-12%", w: 500, delay: 6, dur: 28 },
        { color: "0,212,255", bottom: "-10%", left: "35%", w: 420, delay: 12, dur: 20 },
      ].map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            top: (orb as { top?: string }).top,
            bottom: (orb as { bottom?: string }).bottom,
            left: (orb as { left?: string }).left,
            right: (orb as { right?: string }).right,
            width: orb.w, height: orb.w,
            background: `radial-gradient(circle, rgba(${orb.color},0.11) 0%, transparent 65%)`,
            filter: "blur(52px)",
          }}
          animate={reduced ? {} : { x: [0, 40, -25, 0], y: [0, -35, 28, 0], scale: [1, 1.08, 0.94, 1] }}
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
            linear-gradient(rgba(37,99,235,0.032) 1px, transparent 1px),
            linear-gradient(90deg, rgba(37,99,235,0.032) 1px, transparent 1px)
          `,
          backgroundSize: "72px 72px",
        }}
        animate={{ opacity: [0.4, 0.85, 0.4] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

// ─── Desktop Orbit Visual ─────────────────────────────────────────────────────

function OrbitRing({
  radius,
  duration,
  direction,
  items,
  reduced,
}: {
  radius: number;
  duration: number;
  direction: 1 | -1;
  items: TechItem[];
  reduced: boolean;
}) {
  const count = items.length;
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      style={{ width: radius * 2, height: radius * 2, margin: "auto" }}
      animate={reduced ? {} : { rotate: direction * 360 }}
      transition={{ duration, repeat: Infinity, ease: "linear" }}
    >
      {/* Dashed ring track */}
      <div
        className="absolute inset-0 rounded-full"
        style={{ border: "1px dashed rgba(37,99,235,0.18)" }}
        aria-hidden
      />
      {items.map((tech, i) => {
        const angle = (i / count) * 360;
        const rad = (angle * Math.PI) / 180;
        const x = Math.cos(rad) * radius;
        const y = Math.sin(rad) * radius;
        const Icon = tech.icon;

        return (
          <motion.div
            key={tech.name}
            className="absolute flex items-center justify-center group"
            style={{
              left: "50%",
              top: "50%",
              x: x - 22,
              y: y - 22,
              width: 44,
              height: 44,
            }}
            // Counter-rotate so pills stay upright
            animate={reduced ? {} : { rotate: direction * -360 }}
            transition={{ duration, repeat: Infinity, ease: "linear" }}
          >
            <motion.div
              className="relative w-11 h-11 rounded-xl flex items-center justify-center cursor-default"
              style={{
                background: `linear-gradient(135deg, ${tech.accent.primary}20 0%, ${tech.accent.secondary}14 100%)`,
                border: `1px solid ${tech.accent.primary}35`,
                backdropFilter: "blur(12px)",
              }}
              whileHover={reduced ? {} : { scale: 1.25, zIndex: 20 }}
              transition={{ duration: 0.25 }}
              title={tech.name}
              aria-label={tech.name}
            >
              <div
                className="absolute inset-0 rounded-xl"
                style={{ background: `radial-gradient(circle at 35% 35%, ${tech.accent.primary}25 0%, transparent 65%)` }}
                aria-hidden
              />
              <Icon size={16} style={{ color: tech.accent.primary }} strokeWidth={1.8} aria-hidden />

              {/* Tooltip on hover */}
              <div
                className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-1 rounded-md text-xs font-semibold pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30"
                style={{
                  background: "rgba(5,8,22,0.95)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.85)",
                }}
              >
                {tech.name}
              </div>
            </motion.div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

function CentralOrb({ service }: { service: ServiceData }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <motion.div
        className="relative flex flex-col items-center justify-center w-32 h-32 rounded-2xl text-center"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 0 40px rgba(37,99,235,0.2), inset 0 1px 0 rgba(255,255,255,0.07)",
        }}
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Glow ring */}
        <motion.div
          className="absolute -inset-3 rounded-3xl"
          style={{
            background: "radial-gradient(ellipse, rgba(37,99,235,0.15) 0%, transparent 70%)",
            filter: "blur(10px)",
          }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
          aria-hidden
        />
        <Code2 size={22} className="mb-1.5" style={{ color: "#2563EB" }} aria-hidden />
        <div className="text-[10px] font-bold text-white/70 uppercase tracking-widest leading-tight px-2">
          {service.technologies.length}<br />
          <span className="text-white/35 normal-case tracking-normal font-normal">tools</span>
        </div>
      </motion.div>
    </div>
  );
}

function DesktopOrbit({ techItems, service, reduced }: { techItems: TechItem[]; service: ServiceData; reduced: boolean }) {
  // Split tech into two rings
  const mid = Math.ceil(techItems.length / 2);
  const inner = techItems.slice(0, Math.min(mid, 6));
  const outer = techItems.slice(0, Math.min(techItems.length, 12));

  const containerSize = 480;

  return (
    <div
      className="hidden lg:flex items-center justify-center relative flex-shrink-0"
      style={{ width: containerSize, height: containerSize }}
      aria-label="Technology orbit visualization"
      role="img"
    >
      {/* Outer ambient glow */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: "radial-gradient(ellipse, rgba(37,99,235,0.06) 0%, transparent 65%)",
          filter: "blur(30px)",
        }}
        aria-hidden
      />

      {/* Outer ring */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div style={{ width: containerSize, height: containerSize, position: "relative" }}>
          <OrbitRing radius={220} duration={40} direction={1} items={outer} reduced={reduced} />
        </div>
      </div>

      {/* Inner ring */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div style={{ width: 280, height: 280, position: "relative" }}>
          <OrbitRing radius={130} duration={28} direction={-1} items={inner} reduced={reduced} />
        </div>
      </div>

      {/* Inner dashed track */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 280, height: 280,
          border: "1px dashed rgba(124,58,237,0.15)",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
        }}
        aria-hidden
      />

      {/* Central orb */}
      <CentralOrb service={service} />
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<TechItem["status"], { bg: string; border: string; color: string }> = {
  Production: { bg: "rgba(37,99,235,0.12)", border: "rgba(37,99,235,0.3)", color: "#93c5fd" },
  Stable: { bg: "rgba(0,212,255,0.1)", border: "rgba(0,212,255,0.25)", color: "#67e8f9" },
  Core: { bg: "rgba(124,58,237,0.12)", border: "rgba(124,58,237,0.3)", color: "#c4b5fd" },
  Enterprise: { bg: "rgba(37,99,235,0.1)", border: "rgba(0,212,255,0.2)", color: "#a5b4fc" },
};

// ─── Tech Card ────────────────────────────────────────────────────────────────

function TechCard({ tech, index, reduced }: { tech: TechItem; index: number; reduced: boolean }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: "-50px" });
  const [hovered, setHovered] = useState(false);
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50 });

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-50, 50], [5, -5]), { stiffness: 180, damping: 24 });
  const rotateY = useSpring(useTransform(mouseX, [-50, 50], [-5, 5]), { stiffness: 180, damping: 24 });

  // Magnetic
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 120, damping: 18 });
  const smy = useSpring(my, { stiffness: 120, damping: 18 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (reduced) return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    mouseX.set(cx - rect.width / 2);
    mouseY.set(cy - rect.height / 2);
    mx.set((cx - rect.width / 2) * 0.14);
    my.set((cy - rect.height / 2) * 0.14);
    setSpotlight({ x: (cx / rect.width) * 100, y: (cy / rect.height) * 100 });
  }, [mouseX, mouseY, mx, my, reduced]);

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0); mouseY.set(0); mx.set(0); my.set(0);
    setHovered(false);
  }, [mouseX, mouseY, mx, my]);

  const Icon = tech.icon;
  const statusStyle = STATUS_STYLES[tech.status];

  return (
    <motion.div
      ref={cardRef}
      custom={index}
      variants={cardReveal}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      style={reduced ? {} : { rotateX, rotateY, transformStyle: "preserve-3d", x: smx, y: smy }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      whileHover={reduced ? {} : { y: -5 }}
      className="relative group"
      role="article"
      aria-label={`${tech.name} — ${tech.category}`}
      tabIndex={0}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      {/* Outer glow */}
      <motion.div
        className="absolute -inset-3 rounded-3xl pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 50%, ${tech.accent.primary}1e 0%, transparent 70%)`,
          filter: "blur(14px)",
        }}
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.35 }}
        aria-hidden
      />

      {/* Card */}
      <div
        className="relative rounded-2xl overflow-hidden transition-all duration-300 h-full"
        style={{
          background: hovered ? "rgba(255,255,255,0.048)" : "rgba(255,255,255,0.024)",
          backdropFilter: "blur(20px)",
          border: `1px solid ${hovered ? `${tech.accent.primary}42` : "rgba(255,255,255,0.07)"}`,
          boxShadow: hovered
            ? `0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px ${tech.accent.primary}22`
            : "0 4px 20px rgba(0,0,0,0.3)",
        }}
      >
        {/* Spotlight */}
        {hovered && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse 65% 55% at ${spotlight.x}% ${spotlight.y}%, ${tech.accent.primary}12 0%, transparent 70%)`,
            }}
            aria-hidden
          />
        )}

        {/* Shimmer */}
        <AnimatePresence>
          {hovered && !reduced && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "linear-gradient(110deg, transparent 28%, rgba(255,255,255,0.042) 50%, transparent 72%)",
              }}
              initial={{ x: "-100%" }}
              animate={{ x: "160%" }}
              exit={{}}
              transition={{ duration: 0.85, ease: "easeOut" }}
              aria-hidden
            />
          )}
        </AnimatePresence>

        {/* Top border beam */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              className="absolute top-0 left-0 right-0 h-[1.5px] pointer-events-none"
              style={{
                background: `linear-gradient(90deg, transparent 0%, ${tech.accent.primary} 35%, ${tech.accent.secondary} 65%, transparent 100%)`,
              }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              exit={{ scaleX: 0 }}
              transition={{ duration: 0.45 }}
              aria-hidden
            />
          )}
        </AnimatePresence>

        <div className="p-5 flex flex-col gap-3">
          {/* Icon + status row */}
          <div className="flex items-start justify-between">
            <motion.div
              className="w-10 h-10 rounded-xl flex items-center justify-center relative flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${tech.accent.primary}20 0%, ${tech.accent.secondary}14 100%)`,
                border: `1px solid ${tech.accent.primary}32`,
              }}
              animate={reduced ? {} : { y: [0, -3, 0] }}
              transition={{ duration: 3.5 + (index % 4) * 0.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <div
                className="absolute inset-0 rounded-xl"
                style={{ background: `radial-gradient(circle at 35% 35%, ${tech.accent.primary}28 0%, transparent 65%)` }}
                aria-hidden
              />
              <Icon size={16} style={{ color: tech.accent.primary }} strokeWidth={1.8} aria-hidden />
            </motion.div>

            {/* Status badge */}
            <div
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
              style={{
                background: statusStyle.bg,
                border: `1px solid ${statusStyle.border}`,
                color: statusStyle.color,
              }}
            >
              <motion.div
                className="w-1 h-1 rounded-full flex-shrink-0"
                style={{ background: statusStyle.color }}
                animate={reduced ? {} : { opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2.2, repeat: Infinity }}
                aria-hidden
              />
              {tech.status}
            </div>
          </div>

          {/* Name & category */}
          <div>
            <div className="text-sm font-semibold leading-snug mb-0.5" style={{ color: "rgba(255,255,255,0.88)" }}>
              {tech.name}
            </div>
            <div className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.3)" }}>
              {tech.category}
            </div>
          </div>

          {/* Bottom accent line */}
          <motion.div
            className="h-[1px] mt-1"
            style={{
              background: `linear-gradient(90deg, ${tech.accent.primary} 0%, ${tech.accent.secondary} 60%, transparent 100%)`,
              originX: 0,
            }}
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.8, delay: index * 0.04 + 0.2, ease: EASE_PREMIUM }}
            aria-hidden
          />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Bottom Panel ─────────────────────────────────────────────────────────────

const PILLARS = [
  {
    icon: Zap,
    label: "Performance",
    description: "Tools chosen for speed and minimal overhead at every layer of the stack.",
    color: "#00D4FF",
  },
  {
    icon: BarChart3,
    label: "Scalability",
    description: "Architectures that handle 10× growth without a rewrite.",
    color: "#2563EB",
  },
  {
    icon: Shield,
    label: "Security",
    description: "Security-first defaults baked into every tool we recommend.",
    color: "#7C3AED",
  },
  {
    icon: Wrench,
    label: "Maintainability",
    description: "Strong typing, documentation, and community support mean longevity.",
    color: "#00D4FF",
  },
];

function BottomPanel({ reduced }: { reduced: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75,  ease: EASE_PREMIUM }}
      className="relative mt-20 rounded-2xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.024)",
        backdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 16px 48px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.055)",
      }}
      aria-label="Why we choose modern technologies"
    >
      {/* Top glow line */}
      {!reduced && (
        <motion.div
          className="absolute top-0 left-0 right-0 h-[1px] pointer-events-none"
          style={{
            background: "linear-gradient(90deg, transparent 0%, #2563EB 25%, #00D4FF 50%, #7C3AED 75%, transparent 100%)",
          }}
          animate={{ opacity: [0.3, 0.9, 0.3] }}
          transition={{ duration: 4.5, repeat: Infinity }}
          aria-hidden
        />
      )}

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 65% 55% at 50% 100%, rgba(37,99,235,0.055) 0%, transparent 70%)",
        }}
        aria-hidden
      />

      <div className="relative p-6 sm:p-8">
        <div className="text-xs font-semibold uppercase tracking-widest mb-8" style={{ color: "rgba(255,255,255,0.28)" }}>
          Why We Choose Modern Technologies
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PILLARS.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.label}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1, ease: EASE_PREMIUM }}
                className="flex flex-col gap-3"
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{
                    background: `${pillar.color}16`,
                    border: `1px solid ${pillar.color}30`,
                  }}
                >
                  <Icon size={16} style={{ color: pillar.color }} strokeWidth={1.8} aria-hidden />
                </div>
                <div>
                  <div className="text-sm font-semibold mb-1" style={{ color: "rgba(255,255,255,0.85)" }}>
                    {pillar.label}
                  </div>
                  <div className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.38)" }}>
                    {pillar.description}
                  </div>
                </div>
                {/* Bottom line */}
                <motion.div
                  className="h-[1px]"
                  style={{
                    background: `linear-gradient(90deg, ${pillar.color} 0%, transparent 100%)`,
                    originX: 0,
                  }}
                  initial={{ scaleX: 0 }}
                  animate={isInView ? { scaleX: 1 } : {}}
                  transition={{ duration: 0.7, delay: i * 0.1 + 0.3 }}
                  aria-hidden
                />
              </motion.div>
            );
          })}
        </div>

        {/* Trust row */}
        <div
          className="mt-8 pt-6 flex flex-wrap gap-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.055)" }}
        >
          {[
            "Open source preferred",
            "Vendor-lock-in avoided",
            "LTS versions only",
            "Security audited",
          ].map((item, i) => (
            <motion.div
              key={item}
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.4, delay: 0.5 + i * 0.07 }}
              className="flex items-center gap-1.5 text-xs font-medium"
              style={{ color: "rgba(255,255,255,0.32)" }}
            >
              <CheckCircle2 size={11} style={{ color: "#00D4FF" }} aria-hidden />
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
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
    >
      {/* Badge */}
      <motion.div variants={fadeUpVariants} className="flex justify-center mb-5">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest"
          style={{
            background: "rgba(0,212,255,0.08)",
            border: "1px solid rgba(0,212,255,0.22)",
            color: "#67e8f9",
          }}
        >
          <motion.div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "#00D4FF" }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            aria-hidden
          />
          Tech Stack
        </div>
      </motion.div>

      {/* Heading */}
      <motion.h2
        variants={fadeUpVariants}
        id="techstack-heading"
        className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-5 text-center"
      >
        <span style={{ color: "rgba(255,255,255,0.92)" }}>Technologies We Use</span>
        <br />
        <span
          style={{
            background: "linear-gradient(135deg, #2563EB 0%, #00D4FF 45%, #7C3AED 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          For {service.title}
        </span>
      </motion.h2>

      {/* Description */}
      <motion.p
        variants={fadeUpVariants}
        className="text-base sm:text-lg max-w-2xl mx-auto leading-relaxed text-center"
        style={{ color: "rgba(255,255,255,0.44)" }}
      >
        {getDynamicDescription(service.title)}
      </motion.p>
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function ServiceTechStack({ service }: ServiceTechStackProps) {
  const reduced = useReducedMotion() ?? false;
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-80px" });
  const isGridInView = useInView(gridRef, { once: true, margin: "-60px" });

  const techItems = useMemo(() => buildTechItems(service.technologies), [service.technologies]);

  // Parallax
  const scrollY = useMotionValue(0);
  useEffect(() => {
    if (reduced) return;
    const h = () => scrollY.set(window.scrollY);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, [scrollY, reduced]);
  const parallaxY = useTransform(scrollY, [0, 1200], [0, -45]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden py-24 lg:py-32"
      style={{ background: "#050816" }}
      aria-labelledby="techstack-heading"
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

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div ref={headerRef} className="mb-16">
          <SectionHeader service={service} inView={isHeaderInView} />
        </div>

        {/* Desktop: orbit + grid side by side */}
        <div className="hidden lg:flex gap-12 xl:gap-16 items-start">
          {/* Orbit */}
          <div className="flex-shrink-0">
            <DesktopOrbit techItems={techItems} service={service} reduced={reduced} />
          </div>

          {/* Grid */}
          <div ref={gridRef} className="flex-1">
            <motion.div
              className="grid grid-cols-2 xl:grid-cols-3 gap-4"
              initial="hidden"
              animate={isGridInView ? "visible" : "hidden"}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
              role="list"
              aria-label={`${service.title} technologies`}
            >
              {techItems.map((tech, i) => (
                <div key={tech.name} role="listitem">
                  <TechCard tech={tech} index={i} reduced={reduced} />
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Tablet + Mobile: grid only */}
        <div ref={gridRef} className="lg:hidden">
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 gap-4"
            initial="hidden"
            animate={isGridInView ? "visible" : "hidden"}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
            role="list"
            aria-label={`${service.title} technologies`}
          >
            {techItems.map((tech, i) => (
              <div key={tech.name} role="listitem">
                <TechCard tech={tech} index={i} reduced={reduced} />
              </div>
            ))}
          </motion.div>
        </div>

        {/* Bottom panel */}
        <BottomPanel reduced={reduced} />
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