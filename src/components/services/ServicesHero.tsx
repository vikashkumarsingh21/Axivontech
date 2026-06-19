"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import Link from "next/link";
import {
  motion,
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
  ArrowRight,
  ChevronDown,
  Sparkles,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ServiceCard {
  id: number;
  label: string;
  Icon: React.ElementType;
  color: string;
  glow: string;
  angleDeg: number;
  orbitRadius: number;
}

interface Particle {
  id: number;
  cx: number;
  cy: number;
  r: number;
  dur: number;
  delay: number;
  color: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const SERVICES: ServiceCard[] = [
  { id: 1,  label: "Web Development",    Icon: Globe,       color: "#2563EB", glow: "rgba(37,99,235,0.5)",   angleDeg: 0,    orbitRadius: 200 },
  { id: 2,  label: "Mobile Apps",        Icon: Smartphone,  color: "#7C3AED", glow: "rgba(124,58,237,0.5)",  angleDeg: 45,   orbitRadius: 200 },
  { id: 3,  label: "AI Solutions",       Icon: Bot,         color: "#00D4FF", glow: "rgba(0,212,255,0.5)",   angleDeg: 90,   orbitRadius: 200 },
  { id: 4,  label: "SEO Services",       Icon: TrendingUp,  color: "#2563EB", glow: "rgba(37,99,235,0.5)",   angleDeg: 135,  orbitRadius: 200 },
  { id: 5,  label: "Digital Marketing",  Icon: Megaphone,   color: "#7C3AED", glow: "rgba(124,58,237,0.5)",  angleDeg: 180,  orbitRadius: 200 },
  { id: 6,  label: "UI/UX Design",       Icon: Palette,     color: "#00D4FF", glow: "rgba(0,212,255,0.5)",   angleDeg: 225,  orbitRadius: 200 },
  { id: 7,  label: "Cloud Solutions",    Icon: Cloud,       color: "#2563EB", glow: "rgba(37,99,235,0.5)",   angleDeg: 270,  orbitRadius: 200 },
  { id: 8,  label: "Custom Software",    Icon: Settings2,   color: "#7C3AED", glow: "rgba(124,58,237,0.5)",  angleDeg: 315,  orbitRadius: 200 },
];

// ─── Utilities ────────────────────────────────────────────────────────────────

function polarToXY(angleDeg: number, radius: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: Math.cos(rad) * radius, y: Math.sin(rad) * radius };
}

// ─── Background Blobs ─────────────────────────────────────────────────────────

function BackgroundBlobs({ reduced }: { reduced: boolean }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Aurora sweep */}
      {!reduced && (
        <>
          <motion.div
            className="absolute rounded-full blur-[180px]"
            style={{
              width: 900, height: 500,
              background: "linear-gradient(135deg, rgba(37,99,235,0.14) 0%, rgba(124,58,237,0.10) 50%, rgba(0,212,255,0.07) 100%)",
              top: "-20%", left: "-10%",
            }}
            animate={{ x: [0, 80, 0], y: [0, 50, 0], rotate: [0, 8, 0] }}
            transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute rounded-full blur-[160px]"
            style={{
              width: 700, height: 400,
              background: "radial-gradient(ellipse, rgba(124,58,237,0.12), transparent 70%)",
              bottom: "-5%", right: "-5%",
            }}
            animate={{ x: [0, -60, 0], y: [0, -40, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 5 }}
          />
          <motion.div
            className="absolute rounded-full blur-[120px]"
            style={{
              width: 500, height: 500,
              background: "radial-gradient(circle, rgba(0,212,255,0.08), transparent 70%)",
              top: "30%", left: "40%",
            }}
            animate={{ x: [0, 40, -30, 0], y: [0, -30, 30, 0] }}
            transition={{ duration: 30, repeat: Infinity, ease: "easeInOut", delay: 10 }}
          />
        </>
      )}

      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  );
}

// ─── Particles ────────────────────────────────────────────────────────────────

function Particles({ reduced }: { reduced: boolean }) {
  const particles = useMemo<Particle[]>(() =>
    Array.from({ length: 28 }, (_, i) => ({
      id: i,
      cx: Math.random() * 100,
      cy: Math.random() * 100,
      r: Math.random() * 1.8 + 0.6,
      dur: Math.random() * 14 + 8,
      delay: Math.random() * 8,
      color: ["#2563EB", "#7C3AED", "#00D4FF"][i % 3],
    })), []
  );

  if (reduced) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.cx}%`, top: `${p.cy}%`,
            width: p.r * 2, height: p.r * 2,
            background: p.color,
            opacity: 0.18,
            boxShadow: `0 0 ${p.r * 4}px ${p.color}`,
          }}
          animate={{ y: [0, -28, 0], x: [0, Math.sin(p.id) * 12, 0], opacity: [0.12, 0.28, 0.12] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

// ─── Mouse Spotlight ──────────────────────────────────────────────────────────

function MouseSpotlight() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 60, damping: 18 });
  const sy = useSpring(y, { stiffness: 60, damping: 18 });

  useEffect(() => {
    const move = (e: MouseEvent) => { x.set(e.clientX); y.set(e.clientY); };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        background: `radial-gradient(380px circle at ${sx}px ${sy}px, rgba(37,99,235,0.07), transparent 60%)`,
      }}
    />
  );
}

// ─── Orbit Dashboard ──────────────────────────────────────────────────────────

function OrbitDashboard({ reduced }: { reduced: boolean }) {
  const [hovered, setHovered] = useState<number | null>(null);

  // Slow orbit rotation: parent div rotates, children counter-rotate for label readability
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: 480, height: 480 }}
      aria-label="Axivon Services orbit diagram"
      role="img"
    >
      {/* Outer decorative rings */}
      {[460, 420, 390].map((size, i) => (
        <div
          key={size}
          aria-hidden="true"
          className="absolute rounded-full border border-white/[0.05]"
          style={{ width: size, height: size }}
        />
      ))}

      {/* Orbit path ring */}
      <motion.div
        aria-hidden="true"
        className="absolute rounded-full border border-white/[0.08]"
        style={{ width: 410, height: 410 }}
        animate={reduced ? {} : { rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      />

      {/* Spinning orbit group */}
      <motion.div
        aria-hidden="true"
        className="absolute"
        style={{ width: 410, height: 410 }}
        animate={reduced ? {} : { rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      >
        {/* Orbit trail dots */}
        {[0, 90, 180, 270].map((a) => {
          const pos = polarToXY(a, 205);
          return (
            <div
              key={a}
              className="absolute w-1 h-1 rounded-full bg-white/20"
              style={{ left: `calc(50% + ${pos.x}px - 2px)`, top: `calc(50% + ${pos.y}px - 2px)` }}
            />
          );
        })}
      </motion.div>

      {/* Service cards in orbit */}
      {SERVICES.map((svc, i) => {
        const pos = polarToXY(svc.angleDeg, 205);
        const isHov = hovered === svc.id;

        return (
          <motion.div
            key={svc.id}
            className="absolute"
            style={{
              left: `calc(50% + ${pos.x}px)`,
              top: `calc(50% + ${pos.y}px)`,
              translateX: "-50%",
              translateY: "-50%",
              zIndex: isHov ? 10 : 1,
            }}
            initial={reduced ? {} : { opacity: 0, scale: 0.6 }}
            animate={reduced ? {} : { opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 + i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            whileHover={reduced ? {} : { scale: 1.18, zIndex: 10 }}
            onHoverStart={() => setHovered(svc.id)}
            onHoverEnd={() => setHovered(null)}
          >
            <div
              className="relative flex flex-col items-center gap-1.5 cursor-default"
              aria-label={svc.label}
            >
              {/* Card */}
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center border border-white/10 backdrop-blur-md transition-all duration-300"
                style={{
                  background: isHov
                    ? `linear-gradient(135deg, ${svc.color}30, ${svc.color}15)`
                    : "rgba(255,255,255,0.04)",
                  boxShadow: isHov
                    ? `0 0 24px ${svc.glow}, 0 0 48px ${svc.glow}40`
                    : "none",
                  borderColor: isHov ? `${svc.color}60` : "rgba(255,255,255,0.08)",
                }}
              >
                <svc.Icon
                  className="w-5 h-5 transition-colors duration-300"
                  style={{ color: isHov ? svc.color : "rgba(255,255,255,0.65)" }}
                  strokeWidth={1.7}
                />
              </div>

              {/* Label */}
              <AnimatePresence>
                {isHov && (
                  <motion.span
                    initial={{ opacity: 0, y: 4, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.9 }}
                    transition={{ duration: 0.18 }}
                    className="absolute top-full mt-2 whitespace-nowrap text-[10px] font-semibold tracking-wide rounded-full px-2.5 py-1 border"
                    style={{
                      color: svc.color,
                      background: `${svc.color}18`,
                      borderColor: `${svc.color}40`,
                    }}
                  >
                    {svc.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        );
      })}

      {/* Center card */}
      <motion.div
        className="relative z-10 flex flex-col items-center justify-center gap-3 rounded-[28px] border backdrop-blur-2xl"
        style={{
          width: 168,
          height: 168,
          background: "rgba(255,255,255,0.04)",
          borderColor: "rgba(255,255,255,0.12)",
          boxShadow: "0 0 60px rgba(37,99,235,0.2), 0 0 120px rgba(124,58,237,0.12), inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
        initial={reduced ? {} : { scale: 0.7, opacity: 0 }}
        animate={reduced ? {} : { scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        aria-label="Axivon Services center hub"
      >
        {/* Pulsing rings */}
        {!reduced && [1, 2].map((n) => (
          <motion.div
            key={n}
            aria-hidden="true"
            className="absolute rounded-[28px] border border-[#2563EB]/20"
            style={{ inset: -n * 14 }}
            animate={{ opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 3, delay: n * 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}

        {/* Sparkle icon */}
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #2563EB, #7C3AED)",
            boxShadow: "0 4px 24px rgba(37,99,235,0.5)",
          }}
        >
          <Sparkles className="w-5 h-5 text-white" strokeWidth={1.8} />
        </div>

        <div className="text-center px-3">
          <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-white/40 leading-none mb-1">
            Axivon
          </p>
          <p className="text-sm font-bold text-white leading-tight tracking-tight">
            Services
          </p>
        </div>

        {/* Animated dot */}
        <div className="flex gap-1" aria-hidden="true">
          {[0, 1, 2].map((d) => (
            <motion.div
              key={d}
              className="w-1 h-1 rounded-full bg-[#00D4FF]"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.4, delay: d * 0.28, repeat: Infinity }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ─── CTA Buttons ──────────────────────────────────────────────────────────────

function CTAButtons({ reduced }: { reduced: boolean }) {
  const handleExplore = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.getElementById("services-grid");
    if (target) target.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  }, [reduced]);

  return (
    <div className="flex flex-wrap gap-4 items-center">
      {/* Primary */}
      <Link
        href="/contact#contact-form"
        className="group relative inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-sm font-semibold text-white overflow-hidden transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/60 focus:ring-offset-2 focus:ring-offset-[#050816]"
        aria-label="Book a free consultation"
      >
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#2563EB] to-[#7C3AED] transition-all duration-300 group-hover:from-[#1d4ed8] group-hover:to-[#6d28d9]"
        />
        <span
          aria-hidden="true"
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15)" }}
        />
        <span className="relative">Book Free Consultation</span>
        <ArrowRight
          className="relative w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
          strokeWidth={2.2}
        />
      </Link>

      {/* Secondary */}
      <button
        onClick={handleExplore}
        className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-sm font-semibold border border-white/10 bg-white/[0.04] backdrop-blur-sm text-white/80 hover:text-white hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-[#050816]"
        aria-label="Explore our services below"
      >
        Explore Services
        <ChevronDown
          className="w-4 h-4 transition-transform duration-300 group-hover:translate-y-0.5"
          strokeWidth={2.2}
        />
      </button>
    </div>
  );
}

// ─── Left Content ─────────────────────────────────────────────────────────────

function HeroContent({ reduced }: { reduced: boolean }) {
  const stagger = (i: number) => ({
    hidden: { opacity: 0, y: 28, filter: "blur(8px)" },
    visible: {
      opacity: 1, y: 0, filter: "blur(0px)",
      transition: { duration: 0.75, delay: i * 0.14, ease: [0.22, 1, 0.36, 1] },
    },
  });

  return (
    <motion.div
      className="flex flex-col gap-8 max-w-xl"
      initial={reduced ? undefined : "hidden"}
      animate="visible"
    >
      {/* Badge */}
      <motion.div variants={reduced ? undefined : stagger(0)}>
        <span
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-sm text-xs font-semibold tracking-[0.18em] uppercase text-[#00D4FF]"
          aria-label="Section badge: Our Services"
        >
          <span aria-hidden="true" className="relative flex">
            <span className="absolute inline-flex h-2 w-2 rounded-full bg-[#00D4FF] opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00D4FF]" />
          </span>
          Our Services
        </span>
      </motion.div>

      {/* Heading */}
      <motion.h1
        variants={reduced ? undefined : stagger(1)}
        className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.05]"
      >
        Future-Ready
        <br />
        <span
          className="bg-gradient-to-r from-[#2563EB] via-[#7C3AED] to-[#00D4FF] bg-clip-text text-transparent"
          style={{
            backgroundSize: "200% 100%",
            animation: reduced ? "none" : "gradientShift 5s ease infinite",
          }}
        >
          Digital Services
        </span>
        <br />
        <span className="text-white/80">For Modern Businesses</span>
      </motion.h1>

      {/* Description */}
      <motion.p
        variants={reduced ? undefined : stagger(2)}
        className="text-white/50 text-lg leading-relaxed"
      >
        We help startups, businesses, and enterprises build powerful websites,
        mobile applications, AI solutions, cloud systems, and growth-focused
        digital experiences.
      </motion.p>

      {/* CTAs */}
      <motion.div variants={reduced ? undefined : stagger(3)}>
        <CTAButtons reduced={reduced} />
      </motion.div>

      {/* Trust indicator */}
      <motion.div
        variants={reduced ? undefined : stagger(4)}
        className="flex items-center gap-3 pt-2"
        aria-label="8 services available"
      >
        <div className="flex -space-x-2" aria-hidden="true">
          {["#2563EB", "#7C3AED", "#00D4FF", "#2563EB"].map((c, i) => (
            <div
              key={i}
              className="w-7 h-7 rounded-full border-2 border-[#050816] flex items-center justify-center"
              style={{ background: `${c}30`, borderColor: "#050816" }}
            >
              <div className="w-2 h-2 rounded-full" style={{ background: c }} />
            </div>
          ))}
        </div>
        <p className="text-white/35 text-sm">
          <span className="text-white/70 font-semibold">8 specialized services</span> — web to AI
        </p>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function ServicesHero() {
  const reduced = useReducedMotion() ?? false;

  return (
    <>
      <style>{`
        @keyframes gradientShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      {/* Mouse spotlight — desktop only, not reduced */}
      {!reduced && (
        <div className="hidden lg:block">
          <MouseSpotlight />
        </div>
      )}

      <section
        className="relative w-full min-h-screen flex items-center overflow-hidden"
        style={{ background: "#050816" }}
        aria-label="Axivon Technologies Services Hero"
      >
        {/* Background layers */}
        <BackgroundBlobs reduced={reduced} />
        <Particles reduced={reduced} />

        {/* Content wrapper */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-12">

            {/* Left — text */}
            <div className="w-full lg:w-1/2 text-center lg:text-left flex flex-col items-center lg:items-start">
              <HeroContent reduced={reduced} />
            </div>

            {/* Right — orbit dashboard */}
            <motion.div
              className="w-full lg:w-1/2 flex items-center justify-center"
              initial={reduced ? undefined : { opacity: 0, x: 40 }}
              animate={reduced ? undefined : { opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Dashboard container with outer glow */}
              <div
                className="relative"
                style={{
                  filter: "drop-shadow(0 0 80px rgba(37,99,235,0.15)) drop-shadow(0 0 160px rgba(124,58,237,0.10))",
                }}
              >
                <OrbitDashboard reduced={reduced} />
              </div>
            </motion.div>

          </div>
        </div>

        {/* Bottom fade */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-32"
          style={{ background: "linear-gradient(to bottom, transparent, #050816)" }}
        />
      </section>
    </>
  );
}