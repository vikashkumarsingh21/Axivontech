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
import { Badge } from "@/components/ui";

const EASE_INDUSTRY = [0.22, 1, 0.36, 1] as const;

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

const INDUSTRIES: Industry[] = [
  {
    id: 1,
    title: "Healthcare",
    Icon: HeartPulse,
    description:
      "Secure patient portals, telemedicine platforms, and HIPAA-compliant digital infrastructure for modern healthcare providers.",
    stat: "10+",
    statLabel: "Health Projects",
    tags: ["Telemedicine", "EHR Systems", "Patient Portals"],
    color: "#c47a3a",
    glow: "#c47a3a",
    glowRgba: "rgba(196,122,58,0.3)",
    gradient: "from-[#c47a3a] to-[#e8a064]",
    span: "wide",
  },
  {
    id: 2,
    title: "Education",
    Icon: GraduationCap,
    description:
      "Interactive LMS platforms and e-learning experiences that engage students and scale with institutions.",
    stat: "5+",
    statLabel: "EdTech Products",
    tags: ["LMS", "E-Learning", "EdTech"],
    color: "#e8a064",
    glow: "#e8a064",
    glowRgba: "rgba(232,160,100,0.3)",
    gradient: "from-[#e8a064] to-[#f0b07a]",
    span: "normal",
  },
  {
    id: 3,
    title: "E-Commerce",
    Icon: ShoppingCart,
    description:
      "High-conversion storefronts and headless commerce architectures built for speed and scale.",
    stat: "15+",
    statLabel: "Stores Launched",
    tags: ["Shopify", "Headless", "Payments"],
    color: "#f0b07a",
    glow: "#f0b07a",
    glowRgba: "rgba(240,176,122,0.3)",
    gradient: "from-[#f0b07a] to-[#c47a3a]",
    span: "normal",
  },
  {
    id: 4,
    title: "Real Estate",
    Icon: Building2,
    description:
      "Property listing portals, virtual tours, and CRM platforms that modernize how agents and buyers connect.",
    stat: "8+",
    statLabel: "PropTech Builds",
    tags: ["Listing Portals", "Virtual Tours", "CRM"],
    color: "#c47a3a",
    glow: "#c47a3a",
    glowRgba: "rgba(196,122,58,0.3)",
    gradient: "from-[#c47a3a] to-[#f0b07a]",
    span: "normal",
  },
  {
    id: 5,
    title: "Finance",
    Icon: Landmark,
    description:
      "Secure fintech solutions — dashboards, payment flows, and compliance-ready banking interfaces.",
    stat: "5+",
    statLabel: "FinTech Products",
    tags: ["Banking", "Payments", "Compliance"],
    color: "#e8a064",
    glow: "#e8a064",
    glowRgba: "rgba(232,160,100,0.3)",
    gradient: "from-[#e8a064] to-[#c47a3a]",
    span: "normal",
  },
  {
    id: 6,
    title: "Manufacturing",
    Icon: Factory,
    description:
      "Industrial IoT dashboards, ERP integrations, and automation tools that optimize production lines.",
    stat: "4+",
    statLabel: "MFG Systems",
    tags: ["IoT", "ERP", "Automation"],
    color: "#f0b07a",
    glow: "#f0b07a",
    glowRgba: "rgba(240,176,122,0.3)",
    gradient: "from-[#f0b07a] to-[#e8a064]",
    span: "normal",
  },
  {
    id: 7,
    title: "Logistics",
    Icon: Truck,
    description:
      "Real-time tracking systems, route optimization tools, and supply chain visibility platforms.",
    stat: "6+",
    statLabel: "Logistics Platforms",
    tags: ["Tracking", "Route Optimization", "Supply Chain"],
    color: "#c47a3a",
    glow: "#c47a3a",
    glowRgba: "rgba(196,122,58,0.3)",
    gradient: "from-[#c47a3a] to-[#e8a064]",
    span: "normal",
  },
  {
    id: 8,
    title: "Startups",
    Icon: Rocket,
    description:
      "From idea to funded — rapid MVP builds, pitch decks, and scalable foundations that attract investors and early adopters.",
    stat: "12+",
    statLabel: "Startups Launched",
    tags: ["MVP", "Product Strategy", "Fundraising Ready"],
    color: "#e8a064",
    glow: "#e8a064",
    glowRgba: "rgba(232,160,100,0.3)",
    gradient: "from-[#e8a064] to-[#f0b07a]",
    span: "wide",
  },
];

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
      aria-hidden={true}
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

const cardVariants = {
  hidden: { opacity: 0, y: 44, scale: 0.93 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.62, delay: i * 0.09 + 0.3, ease: EASE_INDUSTRY },
  }),
};

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
  const isWide = industry.span === "wide";

  return (
    <motion.article
      custom={index}
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
        className="relative h-full flex flex-col gap-5 rounded-[28px] border border-[#262626] bg-[#141414] p-7 overflow-hidden transition-colors duration-400 focus-within:ring-2 focus-within:ring-[#e8a064]/50"
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
        <div
          aria-hidden={true}
          className="pointer-events-none absolute -top-14 -left-14 w-44 h-44 rounded-full blur-3xl transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle, ${industry.glowRgba}, transparent)`,
            opacity: hovered ? 0.38 : 0.1,
          }}
        />

        <div
          aria-hidden={true}
          className="pointer-events-none absolute inset-0 rounded-[28px] transition-opacity duration-500"
          style={{
            background: `radial-gradient(ellipse 65% 45% at 50% 0%, ${industry.glow}18, transparent)`,
            opacity: hovered ? 1 : 0,
          }}
        />

        <BorderBeam gradient={industry.gradient} active={hovered} reduced={reduced} />

        <div className="flex items-start justify-between gap-4">
          <motion.div
            className="w-[52px] h-[52px] rounded-2xl bg-gradient-to-br from-[#c47a3a] to-[#e8a064] flex items-center justify-center shadow-lg flex-shrink-0"
            animate={
              reduced
                ? {}
                : hovered
                ? { scale: 1.13, rotate: 8, y: -4 }
                : { scale: 1, rotate: 0, y: 0 }
            }
            transition={{ duration: 0.35, ease: "easeOut" }}
            aria-hidden={true}
          >
            <industry.Icon className="w-6 h-6 text-[#0f0f0f]" strokeWidth={1.8} />
          </motion.div>

          <div className="text-right flex-shrink-0">
            <StatCounter
              stat={industry.stat}
              active={visible}
              reduced={reduced}
              color={industry.color}
            />
            <p className="text-[#71717a] text-[11px] font-medium tracking-wide mt-0.5">
              {industry.statLabel}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-white font-bold text-xl tracking-tight leading-snug">
            {industry.title}
          </h3>
          <p className="text-[#a1a1aa] text-sm leading-relaxed">{industry.description}</p>
        </div>

        <div className="flex flex-wrap gap-2 mt-auto pt-1">
          {industry.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide border transition-all duration-300"
              style={{
                color: hovered ? industry.color : "#71717a",
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
      </div>
    </motion.article>
  );
});

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
      {INDUSTRIES.map((industry, i) => (
        <div
          key={industry.id}
          className={
            industry.span === "wide"
              ? i === 0
                ? "lg:col-span-2"
                : "lg:col-span-2 lg:col-start-3"
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
        <Badge>
          <span aria-hidden={true} className="relative flex">
            <span className="absolute inline-flex h-2 w-2 rounded-full bg-[#e8a064] opacity-70 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#e8a064]" />
          </span>
          <span className="ml-2">Industries We Serve</span>
        </Badge>
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
        <span className="text-gradient-amber">Every Industry</span>
      </motion.h2>

      <motion.p
        variants={reduced ? undefined : v(2)}
        initial={reduced ? undefined : "hidden"}
        animate={visible ? "visible" : "hidden"}
        className="text-[#a1a1aa] text-base sm:text-lg leading-relaxed max-w-xl"
      >
        From startups to enterprises, we create technology solutions tailored
        for diverse industries worldwide.
      </motion.p>
    </div>
  );
});

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
        color: ["#c47a3a", "#e8a064", "#f0b07a"][i % 3],
        opacity: Math.random() * 0.12 + 0.05,
      })),
    []
  );

  return (
    <div aria-hidden={true} className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.02]"
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
          <motion.div
            className="absolute rounded-full blur-[170px]"
            style={{
              width: 700, height: 420,
              background: "radial-gradient(ellipse, rgba(232,160,100,0.05), transparent 70%)",
              top: "0%", left: "-8%",
            }}
            animate={{ x: [0, 70, 0], y: [0, 45, 0] }}
            transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute rounded-full blur-[180px]"
            style={{
              width: 600, height: 500,
              background: "radial-gradient(ellipse, rgba(196,122,58,0.04), transparent 70%)",
              bottom: "0%", right: "-5%",
            }}
            animate={{ x: [0, -55, 0], y: [0, -35, 0] }}
            transition={{ duration: 28, repeat: Infinity, ease: "easeInOut", delay: 5 }}
          />

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

function MouseSpotlight({ sectionRef }: { sectionRef: React.RefObject<HTMLElement | null> }) {
  const mx = useMotionValue(-1000);
  const my = useMotionValue(-1000);
  const sx = useSpring(mx, { stiffness: 55, damping: 20 });
  const sy = useSpring(my, { stiffness: 55, damping: 20 });

  useEffect(() => {
    let frameId: number | null = null;
    const move = (e: MouseEvent) => {
      if (frameId) return;
      frameId = requestAnimationFrame(() => {
        frameId = null;
        if (!sectionRef.current) return;
        const rect = sectionRef.current.getBoundingClientRect();
        mx.set(e.clientX - rect.left);
        my.set(e.clientY - rect.top);
      });
    };
    window.addEventListener("mousemove", move, { passive: true });
    return () => {
      window.removeEventListener("mousemove", move);
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [mx, my, sectionRef]);

  return (
    <motion.div
      aria-hidden={true}
      className="pointer-events-none absolute inset-0 z-0"
      style={{
        background: `radial-gradient(420px circle at ${sx}px ${sy}px, rgba(232,160,100,0.04), transparent 55%)`,
      }}
    />
  );
}

export default function IndustriesWeServe() {
  const reduced = useReducedMotion() ?? false;
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  return (
    <section
      ref={sectionRef}
      id="industries-we-serve"
      aria-labelledby="industries-heading"
      className="relative w-full overflow-hidden py-24 sm:py-32 bg-[#0f0f0f]"
    >
      <Background reduced={reduced} />
      {!reduced && <MouseSpotlight sectionRef={sectionRef} />}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader visible={isInView} reduced={reduced} />
        <BentoGrid visible={isInView} reduced={reduced} />
      </div>

      <div
        aria-hidden={true}
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0f0f0f] to-transparent"
      />
    </section>
  );
}