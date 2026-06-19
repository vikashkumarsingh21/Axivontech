"use client";

import {
  useRef,
  useState,
  useCallback,
  useMemo,
  memo,
} from "react";
import Link from "next/link";
import {
  motion,
  useInView,
  useReducedMotion,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import {
  Globe,
  Smartphone,
  Bot,
  TrendingUp,
  Megaphone,
  Palette,
  Cloud,
  Settings2,
  Rocket,
  ArrowRight,
  Check,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Service {
  id: number;
  title: string;
  description: string;
  Icon: React.ElementType;
  features: string[];
  gradient: string;
  glow: string;
  glowRgba: string;
  href: string;
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

// ─── Service Data ─────────────────────────────────────────────────────────────

const SERVICES: Service[] = [
  {
    id: 1,
    title: "Web Development",
    description:
      "Crafting performant, conversion-focused websites that represent your brand with precision.",
    Icon: Globe,
    features: ["Business Websites", "Corporate Portals", "Landing Pages", "E-Commerce Solutions"],
    gradient: "from-[#2563EB] to-[#00D4FF]",
    glow: "#2563EB",
    glowRgba: "rgba(37,99,235,0.4)",
    href: "/services/web-development",
  },
  {
    id: 2,
    title: "Mobile App Development",
    description:
      "Native and cross-platform apps engineered for seamless performance across every device.",
    Icon: Smartphone,
    features: ["Android Apps", "iOS Apps", "Cross Platform Apps", "App Maintenance"],
    gradient: "from-[#7C3AED] to-[#2563EB]",
    glow: "#7C3AED",
    glowRgba: "rgba(124,58,237,0.4)",
    href: "/services/mobile-app-development",
  },
  {
    id: 3,
    title: "AI Solutions",
    description:
      "Intelligent systems that automate workflows, enhance decisions, and unlock new efficiencies.",
    Icon: Bot,
    features: ["AI Automation", "Chatbots", "AI Integrations", "Machine Learning"],
    gradient: "from-[#00D4FF] to-[#7C3AED]",
    glow: "#00D4FF",
    glowRgba: "rgba(0,212,255,0.4)",
    href: "/services/ai-solutions",
  },
  {
    id: 4,
    title: "SEO Services",
    description:
      "Data-driven search strategies that grow organic visibility and drive qualified traffic.",
    Icon: TrendingUp,
    features: ["Technical SEO", "On-Page SEO", "Off-Page SEO", "SEO Audits"],
    gradient: "from-[#2563EB] to-[#7C3AED]",
    glow: "#2563EB",
    glowRgba: "rgba(37,99,235,0.4)",
    href: "services/seo-services",
  },
  {
    id: 5,
    title: "Digital Marketing",
    description:
      "Performance marketing campaigns that build awareness, capture leads, and grow revenue.",
    Icon: Megaphone,
    features: ["Social Media Marketing", "PPC Advertising", "Lead Generation", "Brand Awareness"],
    gradient: "from-[#7C3AED] to-[#00D4FF]",
    glow: "#7C3AED",
    glowRgba: "rgba(124,58,237,0.4)",
    href: "/services/digital-marketing",
  },
  {
    id: 6,
    title: "UI/UX Design",
    description:
      "Research-led design systems and interfaces that feel intuitive and leave lasting impressions.",
    Icon: Palette,
    features: ["Wireframing", "Prototyping", "User Research", "Design Systems"],
    gradient: "from-[#00D4FF] to-[#2563EB]",
    glow: "#00D4FF",
    glowRgba: "rgba(0,212,255,0.4)",
    href: "/services/ui-ux-design",
  },
  {
    id: 7,
    title: "Cloud Solutions",
    description:
      "Scalable cloud infrastructure, DevOps pipelines, and managed services built for reliability.",
    Icon: Cloud,
    features: ["Cloud Deployment", "DevOps", "Server Management", "Infrastructure Scaling"],
    gradient: "from-[#2563EB] to-[#00D4FF]",
    glow: "#2563EB",
    glowRgba: "rgba(37,99,235,0.4)",
    href: "/services/cloud-solutions",
  },
  {
    id: 8,
    title: "Custom Software",
    description:
      "Bespoke software platforms that align perfectly with your operations and business logic.",
    Icon: Settings2,
    features: ["CRM Systems", "ERP Solutions", "Business Automation", "Custom Platforms"],
    gradient: "from-[#7C3AED] to-[#2563EB]",
    glow: "#7C3AED",
    glowRgba: "rgba(124,58,237,0.4)",
    href: "services/custom-software-development",
  },
  // {
  //   id: 9,
  //   title: "Startup MVP Development",
  //   description:
  //     "Rapid product launches that validate your vision, attract investors, and reach market fast.",
  //   Icon: Rocket,
  //   features: ["Product Strategy", "MVP Launch", "Startup Consulting", "Rapid Development"],
  //   gradient: "from-[#00D4FF] to-[#7C3AED]",
  //   glow: "#00D4FF",
  //   glowRgba: "rgba(0,212,255,0.4)",
  //   href: "/services/mvp-development",
  // },
];

// ─── Border Beam ──────────────────────────────────────────────────────────────

const BorderBeam = memo(function BorderBeam({ gradient, active }: { gradient: string; active: boolean }) {
  if (!active) return null;
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[28px] overflow-hidden">
      <motion.div
        className={`absolute h-[2px] w-28 bg-gradient-to-r ${gradient} blur-[1px] opacity-90`}
        animate={{ offsetDistance: ["0%", "100%"] }}
        style={{
          offsetPath: `path('M 28 0 L calc(100% - 28px) 0 Q 100% 0 100% 28px L 100% calc(100% - 28px) Q 100% 100% calc(100% - 28px) 100% L 28px 100% Q 0 100% 0 calc(100% - 28px) L 0 28px Q 0 0 28px 0 Z')`,
        }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
});

// ─── Service Card ─────────────────────────────────────────────────────────────

const ServiceCard = memo(function ServiceCard({
  service,
  index,
  visible,
  reduced,
}: {
  service: Service;
  index: number;
  visible: boolean;
  reduced: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 180, damping: 22 });
  const springY = useSpring(rotateY, { stiffness: 180, damping: 22 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current || reduced) return;
      const rect = cardRef.current.getBoundingClientRect();
      const cx = e.clientX - rect.left - rect.width / 2;
      const cy = e.clientY - rect.top - rect.height / 2;
      rotateX.set((-cy / (rect.height / 2)) * 6);
      rotateY.set((cx / (rect.width / 2)) * 6);
    },
    [reduced, rotateX, rotateY]
  );

  const handleMouseLeave = useCallback(() => {
    setHovered(false);
    rotateX.set(0);
    rotateY.set(0);
  }, [rotateX, rotateY]);

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.93 },
    visible: {
      opacity: 1, y: 0, scale: 1,
      transition: {
        duration: 0.65,
        delay: (index % 3) * 0.1 + Math.floor(index / 3) * 0.12,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <motion.article
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
      className="group relative outline-none focus-within:outline-none"
      tabIndex={0}
      role="article"
      aria-label={`${service.title} service`}
      onFocus={() => setHovered(true)}
      onBlur={handleMouseLeave}
    >
      <div
        ref={cardRef}
        className="relative h-full flex flex-col gap-6 rounded-[28px] border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-7 overflow-hidden transition-colors duration-500 group-focus:ring-2 group-focus:ring-[#2563EB]/50"
        style={{
          boxShadow: hovered
            ? `0 0 0 1px ${service.glowRgba}, 0 8px 60px -8px ${service.glowRgba}, 0 32px 80px -20px ${service.glowRgba}40`
            : "0 1px 0 rgba(255,255,255,0.04) inset",
          borderColor: hovered ? `${service.glow}40` : "rgba(255,255,255,0.08)",
          transition: "box-shadow 0.4s ease, border-color 0.4s ease",
        }}
      >
        {/* Inner glow splash */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 -left-16 w-48 h-48 rounded-full blur-3xl transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle, ${service.glowRgba}, transparent)`,
            opacity: hovered ? 0.35 : 0.1,
          }}
        />

        {/* Spotlight radial */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[28px] transition-opacity duration-500"
          style={{
            background: `radial-gradient(ellipse 60% 50% at 50% 0%, ${service.glow}18, transparent)`,
            opacity: hovered ? 1 : 0,
          }}
        />

        {/* Border beam */}
        <BorderBeam gradient={service.gradient} active={hovered && !reduced} />

        {/* Icon */}
        <div className="flex-shrink-0">
          <motion.div
            className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${service.gradient} flex items-center justify-center shadow-lg`}
            animate={
              reduced
                ? {}
                : hovered
                ? { scale: 1.12, rotate: 8 }
                : { scale: 1, rotate: 0 }
            }
            transition={{ duration: 0.35, ease: "easeOut" }}
            aria-hidden="true"
          >
            <service.Icon className="w-6 h-6 text-white" strokeWidth={1.8} />
          </motion.div>
        </div>

        {/* Title + description */}
        <div className="flex flex-col gap-2">
          <h3 className="text-white font-bold text-xl tracking-tight leading-snug">
            {service.title}
          </h3>
          <p className="text-white/45 text-sm leading-relaxed">
            {service.description}
          </p>
        </div>

        {/* Feature list */}
        <ul className="flex flex-col gap-2.5 flex-1" role="list" aria-label={`${service.title} features`}>
          {service.features.map((feat) => (
            <li key={feat} className="flex items-center gap-2.5">
              <span
                className={`flex-shrink-0 w-4 h-4 rounded-full bg-gradient-to-br ${service.gradient} flex items-center justify-center`}
                aria-hidden="true"
              >
                <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
              </span>
              <span className="text-white/55 text-sm leading-none">{feat}</span>
            </li>
          ))}
        </ul>

        {/* Learn more */}
        <Link
          href={service.href}
          className="group/btn mt-auto inline-flex items-center gap-2 text-sm font-semibold transition-colors duration-300 focus:outline-none focus:underline"
          style={{ color: hovered ? service.glow : "rgba(255,255,255,0.45)" }}
          aria-label={`Learn more about ${service.title}`}
          tabIndex={0}
        >
          Learn More
          <motion.span
            animate={reduced ? {} : hovered ? { x: 5 } : { x: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <ArrowRight className="w-4 h-4" strokeWidth={2.2} />
          </motion.span>
        </Link>
      </div>
    </motion.article>
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
  const stagger = (i: number) => ({
    hidden: { opacity: 0, y: 28, filter: "blur(6px)" },
    visible: {
      opacity: 1, y: 0, filter: "blur(0px)",
      transition: { duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
    },
  });

  return (
    <div className="text-center max-w-2xl mx-auto mb-20 flex flex-col items-center gap-5">
      <motion.div
        variants={reduced ? undefined : stagger(0)}
        initial={reduced ? undefined : "hidden"}
        animate={visible ? "visible" : "hidden"}
      >
        <span
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-sm text-xs font-semibold tracking-[0.18em] uppercase text-[#00D4FF]"
          aria-label="Section: Our Expertise"
        >
          <span aria-hidden="true" className="relative flex">
            <span className="absolute inline-flex h-2 w-2 rounded-full bg-[#00D4FF] opacity-70 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00D4FF]" />
          </span>
          Our Expertise
        </span>
      </motion.div>

      <motion.h2
        variants={reduced ? undefined : stagger(1)}
        initial={reduced ? undefined : "hidden"}
        animate={visible ? "visible" : "hidden"}
        className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.1]"
        id="services-grid-heading"
      >
        Solutions Built For
        <br />
        <span
          className="bg-gradient-to-r from-[#2563EB] via-[#7C3AED] to-[#00D4FF] bg-clip-text text-transparent"
          style={{
            backgroundSize: "200% 100%",
            animation: reduced ? "none" : "gradientShift 5s ease infinite",
          }}
        >
          Modern Businesses
        </span>
      </motion.h2>

      <motion.p
        variants={reduced ? undefined : stagger(2)}
        initial={reduced ? undefined : "hidden"}
        animate={visible ? "visible" : "hidden"}
        className="text-white/45 text-base sm:text-lg leading-relaxed max-w-xl"
      >
        We provide end-to-end digital solutions designed to help startups,
        businesses, and enterprises scale faster through technology.
      </motion.p>
    </div>
  );
});

// ─── Background ───────────────────────────────────────────────────────────────

const Background = memo(function Background({ reduced }: { reduced: boolean }) {
  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: 32 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 0.8,
        dur: Math.random() * 14 + 8,
        delay: Math.random() * 8,
        color: ["#2563EB", "#7C3AED", "#00D4FF"][i % 3],
        opacity: Math.random() * 0.2 + 0.08,
      })),
    []
  );

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

      {!reduced && (
        <>
          {/* Aurora blobs */}
          <motion.div
            className="absolute rounded-full blur-[160px]"
            style={{
              width: 700, height: 400,
              background: "radial-gradient(ellipse, rgba(37,99,235,0.13), transparent 70%)",
              top: "5%", left: "-8%",
            }}
            animate={{ x: [0, 70, 0], y: [0, 40, 0] }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute rounded-full blur-[180px]"
            style={{
              width: 600, height: 500,
              background: "radial-gradient(ellipse, rgba(124,58,237,0.11), transparent 70%)",
              bottom: "0%", right: "-5%",
            }}
            animate={{ x: [0, -50, 0], y: [0, -35, 0] }}
            transition={{ duration: 26, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          />
          <motion.div
            className="absolute rounded-full blur-[130px]"
            style={{
              width: 450, height: 450,
              background: "radial-gradient(circle, rgba(0,212,255,0.08), transparent 70%)",
              top: "45%", left: "50%",
              translateX: "-50%",
            }}
            animate={{ x: [0, 35, -35, 0], y: [0, -25, 25, 0] }}
            transition={{ duration: 32, repeat: Infinity, ease: "easeInOut", delay: 8 }}
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
                y: [0, -24, 0],
                x: [0, Math.sin(p.id * 1.3) * 12, 0],
                opacity: [p.opacity, p.opacity * 2, p.opacity],
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

function SectionSpotlight({ sectionRef }: { sectionRef: React.RefObject<HTMLElement | null> }) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 55, damping: 18 });
  const sy = useSpring(my, { stiffness: 55, damping: 18 });

  const handleMove = useCallback(
    (e: MouseEvent) => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      mx.set(e.clientX - rect.left);
      my.set(e.clientY - rect.top);
    },
    [mx, my, sectionRef]
  );

  // Attach on mount
  const ref = useRef(false);
  if (!ref.current) {
    ref.current = true;
    if (typeof window !== "undefined") {
      window.addEventListener("mousemove", handleMove);
    }
  }

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

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ServicesGrid() {
  const reduced = useReducedMotion() ?? false;
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

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
        id="services-grid"
        ref={sectionRef}
        aria-labelledby="services-grid-heading"
        className="relative w-full overflow-hidden py-24 sm:py-32"
        style={{ background: "#050816" }}
      >
        <Background reduced={reduced} />
        {!reduced && <SectionSpotlight sectionRef={sectionRef} />}

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader visible={isInView} reduced={reduced} />

          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6"
            role="list"
            aria-label="Axivon Technologies services"
          >
            {SERVICES.map((svc, i) => (
              <ServiceCard
                key={svc.id}
                service={svc}
                index={i}
                visible={isInView}
                reduced={reduced}
              />
            ))}
          </div>
        </div>

        {/* Bottom section fade */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-24"
          style={{ background: "linear-gradient(to bottom, transparent, #050816)" }}
        />
      </section>
    </>
  );
}