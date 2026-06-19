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
  AnimatePresence,
} from "framer-motion";
import {
  HeartPulse,
  GraduationCap,
  ShoppingCart,
  Building2,
  Landmark,
  Factory,
  Truck,
  Rocket,
} from "lucide-react";
const EASE_INDUSTRY = [0.22, 1, 0.36, 1] as const;

// ─── Types ────────────────────────────────────────────────────────────────────

interface Industry {
  id: number;
  title: string;
  Icon: React.ElementType;
  description: string;
  stat: string;
  statLabel: string;
  tags: string[];
  color: string;
  glow: string;
  glowRgba: string;
  gradient: string;
  /** Bento span on desktop: "normal" | "wide" | "tall" */
  span: "normal" | "wide" | "tall";
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

const INDUSTRIES: Industry[] = [
  {
    id: 1,
    title: "Healthcare",
    Icon: HeartPulse,
    description:
      "Secure patient portals, telemedicine platforms, and HIPAA-compliant digital infrastructure for modern healthcare providers.",
    stat: "40+",
    statLabel: "Health Projects",
    tags: ["Telemedicine", "EHR Systems", "Patient Portals"],
    color: "#2563EB",
    glow: "#2563EB",
    glowRgba: "rgba(37,99,235,0.42)",
    gradient: "from-[#2563EB] to-[#00D4FF]",
    span: "wide",
  },
  {
    id: 2,
    title: "Education",
    Icon: GraduationCap,
    description:
      "Interactive LMS platforms and e-learning experiences that engage students and scale with institutions.",
    stat: "25+",
    statLabel: "EdTech Products",
    tags: ["LMS", "E-Learning", "EdTech"],
    color: "#7C3AED",
    glow: "#7C3AED",
    glowRgba: "rgba(124,58,237,0.42)",
    gradient: "from-[#7C3AED] to-[#2563EB]",
    span: "normal",
  },
  {
    id: 3,
    title: "E-Commerce",
    Icon: ShoppingCart,
    description:
      "High-conversion storefronts and headless commerce architectures built for speed and scale.",
    stat: "60+",
    statLabel: "Stores Launched",
    tags: ["Shopify", "Headless", "Payments"],
    color: "#00D4FF",
    glow: "#00D4FF",
    glowRgba: "rgba(0,212,255,0.42)",
    gradient: "from-[#00D4FF] to-[#7C3AED]",
    span: "normal",
  },
  {
    id: 4,
    title: "Real Estate",
    Icon: Building2,
    description:
      "Property listing portals, virtual tours, and CRM platforms that modernize how agents and buyers connect.",
    stat: "30+",
    statLabel: "PropTech Builds",
    tags: ["Listing Portals", "Virtual Tours", "CRM"],
    color: "#2563EB",
    glow: "#2563EB",
    glowRgba: "rgba(37,99,235,0.42)",
    gradient: "from-[#2563EB] to-[#7C3AED]",
    span: "normal",
  },
  {
    id: 5,
    title: "Finance",
    Icon: Landmark,
    description:
      "Secure fintech solutions — dashboards, payment flows, and compliance-ready banking interfaces.",
    stat: "20+",
    statLabel: "FinTech Products",
    tags: ["Banking", "Payments", "Compliance"],
    color: "#7C3AED",
    glow: "#7C3AED",
    glowRgba: "rgba(124,58,237,0.42)",
    gradient: "from-[#7C3AED] to-[#00D4FF]",
    span: "normal",
  },
  {
    id: 6,
    title: "Manufacturing",
    Icon: Factory,
    description:
      "Industrial IoT dashboards, ERP integrations, and automation tools that optimize production lines.",
    stat: "15+",
    statLabel: "MFG Systems",
    tags: ["IoT", "ERP", "Automation"],
    color: "#00D4FF",
    glow: "#00D4FF",
    glowRgba: "rgba(0,212,255,0.42)",
    gradient: "from-[#00D4FF] to-[#2563EB]",
    span: "normal",
  },
  {
    id: 7,
    title: "Logistics",
    Icon: Truck,
    description:
      "Real-time tracking systems, route optimization tools, and supply chain visibility platforms.",
    stat: "18+",
    statLabel: "Logistics Platforms",
    tags: ["Tracking", "Route Optimization", "Supply Chain"],
    color: "#2563EB",
    glow: "#2563EB",
    glowRgba: "rgba(37,99,235,0.42)",
    gradient: "from-[#2563EB] to-[#00D4FF]",
    span: "normal",
  },
  {
    id: 8,
    title: "Startups",
    Icon: Rocket,
    description:
      "From idea to funded — rapid MVP builds, pitch decks, and scalable foundations that attract investors and early adopters.",
    stat: "50+",
    statLabel: "Startups Launched",
    tags: ["MVP", "Product Strategy", "Fundraising Ready"],
    color: "#7C3AED",
    glow: "#7C3AED",
    glowRgba: "rgba(124,58,237,0.42)",
    gradient: "from-[#7C3AED] to-[#2563EB]",
    span: "wide",
  },
];

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
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 rounded-[28px] overflow-hidden"
    >
      <motion.div
        className={`absolute h-[2px] w-28 bg-gradient-to-r ${gradient} blur-[1px] opacity-90`}
        animate={{ offsetDistance: ["0%", "100%"] }}
        style={{
          offsetPath: `path('M 28 0 L calc(100% - 28px) 0 Q 100% 0 100% 28px L 100% calc(100% - 28px) Q 100% 100% calc(100% - 28px) 100% L 28px 100% Q 0 100% 0 calc(100% - 28px) L 0 28px Q 0 0 28px 0 Z')`,
        }}
        transition={{ duration: 3.8, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
});

// ─── Stat Counter ─────────────────────────────────────────────────────────────

function StatCounter({
  stat,
  active,
  reduced,
  color,
}: {
  stat: string;
  active: boolean;
  reduced: boolean;
  color: string;
}) {
  const numeric = parseInt(stat, 10);
  const suffix = stat.replace(String(numeric), "");
  const [count, setCount] = useState(reduced ? numeric : 0);

  useEffect(() => {
    if (!active || reduced) return;
    let start: number | null = null;
    let raf: number;
    const duration = 1400;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.floor(eased * numeric));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [active, numeric, reduced]);

  return (
    <span
      className="text-3xl font-extrabold tabular-nums tracking-tight"
      style={{ color }}
    >
      {count}
      {suffix}
    </span>
  );
}

// ─── Industry Card ────────────────────────────────────────────────────────────

const IndustryCard = memo(function IndustryCard({
  industry,
  index,
  visible,
  reduced,
}: {
  industry: Industry;
  index: number;
  visible: boolean;
  reduced: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 180, damping: 24 });
  const springY = useSpring(rotateY, { stiffness: 180, damping: 24 });

  // Magnetic effect values
  const magX = useMotionValue(0);
  const magY = useMotionValue(0);
  const magSX = useSpring(magX, { stiffness: 120, damping: 18 });
  const magSY = useSpring(magY, { stiffness: 120, damping: 18 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current || reduced) return;
      const rect = cardRef.current.getBoundingClientRect();
      const cx = e.clientX - rect.left - rect.width / 2;
      const cy = e.clientY - rect.top - rect.height / 2;
      rotateX.set((-cy / (rect.height / 2)) * 5.5);
      rotateY.set((cx / (rect.width / 2)) * 5.5);
      // Gentle magnetic card nudge
      magX.set((cx / (rect.width / 2)) * 5);
      magY.set((cy / (rect.height / 2)) * 5);
    },
    [reduced, rotateX, rotateY, magX, magY]
  );

  const handleMouseLeave = useCallback(() => {
    setHovered(false);
    rotateX.set(0);
    rotateY.set(0);
    magX.set(0);
    magY.set(0);
  }, [rotateX, rotateY, magX, magY]);

  const delay = reduced ? 0 : index * 0.09 + 0.3;

  const cardVariants = {
    hidden: { opacity: 0, y: 44, scale: 0.93 },
    visible: {
      opacity: 1, y: 0, scale: 1,
      transition: { duration: 0.62, delay, ease: EASE_INDUSTRY },
    },
  };

  const isWide = industry.span === "wide";

  return (
    <motion.article
      variants={reduced ? undefined : cardVariants}
      initial={reduced ? undefined : "hidden"}
      animate={visible ? "visible" : "hidden"}
      style={
        reduced
          ? undefined
          : {
              rotateX: springX,
              rotateY: springY,
              x: magSX,
              y: magSY,
              transformPerspective: 900,
            }
      }
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      className={`group relative outline-none ${isWide ? "sm:col-span-2" : ""}`}
      role="article"
      aria-label={`${industry.title} industry solutions`}
      tabIndex={0}
      onFocus={() => setHovered(true)}
      onBlur={handleMouseLeave}
    >
      <div
        ref={cardRef}
        className="relative h-full flex flex-col gap-5 rounded-[28px] border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-7 overflow-hidden transition-colors duration-400 focus-within:ring-2 focus-within:ring-[#2563EB]/50"
        style={{
          boxShadow: hovered
            ? `0 0 0 1px ${industry.glowRgba}, 0 8px 56px -8px ${industry.glowRgba}, 0 24px 70px -16px ${industry.glowRgba}50`
            : "inset 0 1px 0 rgba(255,255,255,0.04)",
          borderColor: hovered
            ? `${industry.glow}50`
            : "rgba(255,255,255,0.08)",
          transition: "box-shadow 0.4s ease, border-color 0.4s ease",
          minHeight: 220,
        }}
      >
        {/* Inner glow splash */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-14 -left-14 w-44 h-44 rounded-full blur-3xl transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle, ${industry.glowRgba}, transparent)`,
            opacity: hovered ? 0.38 : 0.1,
          }}
        />

        {/* Sweep gradient on hover */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[28px] transition-opacity duration-500"
          style={{
            background: `radial-gradient(ellipse 65% 45% at 50% 0%, ${industry.glow}18, transparent)`,
            opacity: hovered ? 1 : 0,
          }}
        />

        {/* Corner accent */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 right-0 w-32 h-32 rounded-full blur-2xl transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle, ${industry.glowRgba}, transparent)`,
            opacity: hovered ? 0.22 : 0,
          }}
        />

        <BorderBeam gradient={industry.gradient} active={hovered} reduced={reduced} />

        {/* Top row: icon + stat */}
        <div className="flex items-start justify-between gap-4">
          {/* Icon */}
          <motion.div
            className={`w-13 h-13 w-[52px] h-[52px] rounded-2xl bg-gradient-to-br ${industry.gradient} flex items-center justify-center shadow-lg flex-shrink-0`}
            animate={
              reduced
                ? {}
                : hovered
                ? { scale: 1.13, rotate: 8, y: -4 }
                : { scale: 1, rotate: 0, y: 0 }
            }
            transition={{ duration: 0.35, ease: "easeOut" }}
            aria-hidden="true"
          >
            <industry.Icon className="w-6 h-6 text-white" strokeWidth={1.8} />
          </motion.div>

          {/* Stat */}
          <div className="text-right flex-shrink-0">
            <StatCounter
              stat={industry.stat}
              active={visible}
              reduced={reduced}
              color={industry.color}
            />
            <p className="text-white/35 text-[11px] font-medium tracking-wide mt-0.5">
              {industry.statLabel}
            </p>
          </div>
        </div>

        {/* Title */}
        <div className="flex flex-col gap-2">
          <h3 className="text-white font-bold text-xl tracking-tight leading-snug">
            {industry.title}
          </h3>
          <p className="text-white/45 text-sm leading-relaxed">{industry.description}</p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-auto pt-1">
          {industry.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide border transition-all duration-300"
              style={{
                color: hovered ? industry.color : "rgba(255,255,255,0.4)",
                borderColor: hovered
                  ? `${industry.color}50`
                  : "rgba(255,255,255,0.08)",
                background: hovered ? `${industry.color}12` : "rgba(255,255,255,0.02)",
                transition: "color 0.3s, border-color 0.3s, background 0.3s",
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Pulse dot indicator */}
        <div className="absolute top-5 right-5 flex" aria-hidden="true">
          <AnimatePresence>
            {hovered && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="relative flex"
              >
                <span
                  className="absolute inline-flex h-2 w-2 rounded-full opacity-60 animate-ping"
                  style={{ background: industry.color }}
                />
                <span
                  className="relative inline-flex rounded-full h-2 w-2"
                  style={{ background: industry.color }}
                />
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.article>
  );
});

// ─── Bento Grid ───────────────────────────────────────────────────────────────

function BentoGrid({
  visible,
  reduced,
}: {
  visible: boolean;
  reduced: boolean;
}) {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6"
      role="list"
      aria-label="Industries served by Axivon Technologies"
    >
      {/*
        Bento layout (lg, 4 cols):
        Row 1: Healthcare (wide=2), Education (1), E-Commerce (1)
        Row 2: Real Estate (1), Finance (1), Manufacturing (1), Logistics (1)
        Row 3: Startups (wide=2) centered via col-start
      */}
      {INDUSTRIES.map((industry, i) => (
        <div
          key={industry.id}
          className={
            industry.span === "wide"
              ? // Healthcare: first wide — cols 1-2
                i === 0
                ? "lg:col-span-2"
                : // Startups: last wide — cols 3-4 (col-start-3)
                  "lg:col-span-2 lg:col-start-3"
              : "lg:col-span-1"
          }
        >
          <IndustryCard
            industry={industry}
            index={i}
            visible={visible}
            reduced={reduced}
          />
        </div>
      ))}
    </div>
  );
}

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
      transition: { duration: 0.72, delay: i * 0.13, ease: EASE_INDUSTRY },
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
          aria-label="Section: Industries We Serve"
        >
          <span aria-hidden="true" className="relative flex">
            <span className="absolute inline-flex h-2 w-2 rounded-full bg-[#00D4FF] opacity-70 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00D4FF]" />
          </span>
          Industries We Serve
        </span>
      </motion.div>

      <motion.h2
        variants={reduced ? undefined : v(1)}
        initial={reduced ? undefined : "hidden"}
        animate={visible ? "visible" : "hidden"}
        className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.1]"
        id="industries-heading"
      >
        Building Solutions For
        <br />
        <span
          className="bg-gradient-to-r from-[#2563EB] via-[#7C3AED] to-[#00D4FF] bg-clip-text text-transparent"
          style={{
            backgroundSize: "200% 100%",
            animation: reduced ? "none" : "gradientShift 5s ease infinite",
          }}
        >
          Every Industry
        </span>
      </motion.h2>

      <motion.p
        variants={reduced ? undefined : v(2)}
        initial={reduced ? undefined : "hidden"}
        animate={visible ? "visible" : "hidden"}
        className="text-white/45 text-base sm:text-lg leading-relaxed max-w-xl"
      >
        From startups to enterprises, we create technology solutions tailored
        for diverse industries worldwide.
      </motion.p>
    </div>
  );
});

// ─── Background ───────────────────────────────────────────────────────────────

const Background = memo(function Background({ reduced }: { reduced: boolean }) {
  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 1.8 + 0.6,
        dur: Math.random() * 14 + 8,
        delay: Math.random() * 9,
        color: ["#2563EB", "#7C3AED", "#00D4FF"][i % 3],
        opacity: Math.random() * 0.18 + 0.07,
      })),
    []
  );

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Animated grid */}
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

      {!reduced && (
        <>
          {/* Aurora blobs */}
          <motion.div
            className="absolute rounded-full blur-[170px]"
            style={{
              width: 700, height: 420,
              background: "radial-gradient(ellipse, rgba(37,99,235,0.13), transparent 70%)",
              top: "0%", left: "-8%",
            }}
            animate={{ x: [0, 70, 0], y: [0, 45, 0] }}
            transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute rounded-full blur-[180px]"
            style={{
              width: 600, height: 500,
              background: "radial-gradient(ellipse, rgba(124,58,237,0.11), transparent 70%)",
              bottom: "0%", right: "-5%",
            }}
            animate={{ x: [0, -55, 0], y: [0, -35, 0] }}
            transition={{ duration: 28, repeat: Infinity, ease: "easeInOut", delay: 5 }}
          />
          <motion.div
            className="absolute rounded-full blur-[130px]"
            style={{
              width: 500, height: 500,
              background: "radial-gradient(circle, rgba(0,212,255,0.07), transparent 70%)",
              top: "45%", left: "50%",
              translateX: "-50%",
            }}
            animate={{ x: [0, 38, -30, 0], y: [0, -26, 26, 0] }}
            transition={{ duration: 32, repeat: Infinity, ease: "easeInOut", delay: 9 }}
          />

          {/* Particles */}
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full"
              style={{
                left: `${p.x}%`, top: `${p.y}%`,
                width: p.size * 2, height: p.size * 2,
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
        </>
      )}
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
        background: `radial-gradient(420px circle at ${sx}px ${sy}px, rgba(37,99,235,0.055), transparent 55%)`,
      }}
    />
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function IndustriesWeServe() {
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
        id="industries-we-serve"
        aria-labelledby="industries-heading"
        className="relative w-full overflow-hidden py-24 sm:py-32"
        style={{ background: "#050816" }}
      >
        <Background reduced={reduced} />
        {!reduced && <MouseSpotlight sectionRef={sectionRef} />}

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader visible={isInView} reduced={reduced} />
          <BentoGrid visible={isInView} reduced={reduced} />
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