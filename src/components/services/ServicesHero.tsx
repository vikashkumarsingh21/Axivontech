"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  motion,
  useReducedMotion,
  useMotionValue,
  useSpring,
  AnimatePresence,
  type Variants,
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
import { Badge } from "@/components/ui";

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

const SERVICES: ServiceCard[] = [
  { id: 1, label: "Web Development", Icon: Globe, color: "#c47a3a", glow: "rgba(196,122,58,0.4)", angleDeg: 0, orbitRadius: 200 },
  { id: 2, label: "Mobile Apps", Icon: Smartphone, color: "#e8a064", glow: "rgba(232,160,100,0.4)", angleDeg: 45, orbitRadius: 200 },
  { id: 3, label: "AI Solutions", Icon: Bot, color: "#f0b07a", glow: "rgba(240,176,122,0.4)", angleDeg: 90, orbitRadius: 200 },
  { id: 4, label: "SEO Services", Icon: TrendingUp, color: "#c47a3a", glow: "rgba(196,122,58,0.4)", angleDeg: 135, orbitRadius: 200 },
  { id: 5, label: "Digital Marketing", Icon: Megaphone, color: "#e8a064", glow: "rgba(232,160,100,0.4)", angleDeg: 180, orbitRadius: 200 },
  { id: 6, label: "UI/UX Design", Icon: Palette, color: "#f0b07a", glow: "rgba(240,176,122,0.4)", angleDeg: 225, orbitRadius: 200 },
  { id: 7, label: "Cloud Solutions", Icon: Cloud, color: "#c47a3a", glow: "rgba(196,122,58,0.4)", angleDeg: 270, orbitRadius: 200 },
  { id: 8, label: "Custom Software", Icon: Settings2, color: "#e8a064", glow: "rgba(232,160,100,0.4)", angleDeg: 315, orbitRadius: 200 },
];

function polarToXY(angleDeg: number, radius: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: Math.cos(rad) * radius, y: Math.sin(rad) * radius };
}

function BackgroundBlobs({ reduced }: { reduced: boolean }) {
  return (
    <div aria-hidden={true} className="pointer-events-none absolute inset-0 overflow-hidden">
      {!reduced && (
        <>
          <motion.div
            className="absolute rounded-full blur-[180px]"
            style={{
              width: 900, height: 500,
              background: "linear-gradient(135deg, rgba(232,160,100,0.08) 0%, rgba(196,122,58,0.05) 50%, rgba(240,176,122,0.03) 100%)",
              top: "-20%", left: "-10%",
            }}
            animate={{ x: [0, 80, 0], y: [0, 50, 0], rotate: [0, 8, 0] }}
            transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute rounded-full blur-[160px]"
            style={{
              width: 700, height: 400,
              background: "radial-gradient(ellipse, rgba(232,160,100,0.05), transparent 70%)",
              bottom: "-5%", right: "-5%",
            }}
            animate={{ x: [0, -60, 0], y: [0, -40, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 5 }}
          />
        </>
      )}

      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.025]"
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

function Particles({ reduced }: { reduced: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const generated = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      cx: Math.random() * 100,
      cy: Math.random() * 100,
      r: Math.random() * 1.8 + 0.6,
      dur: Math.random() * 14 + 8,
      delay: Math.random() * 8,
      color: ["#c47a3a", "#e8a064", "#f0b07a"][i % 3],
    }));

    setParticles(generated);
  }, []);

  if (reduced) return null;

  return (
    <div
      aria-hidden={true}
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.cx}%`,
            top: `${p.cy}%`,
            width: p.r * 2,
            height: p.r * 2,
            background: p.color,
            opacity: 0.12,
            boxShadow: `0 0 ${p.r * 4}px ${p.color}`,
          }}
          animate={{
            y: [0, -28, 0],
            x: [0, Math.sin(p.id) * 12, 0],
            opacity: [0.08, 0.22, 0.08],
          }}
          transition={{
            duration: p.dur,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function MouseSpotlight() {
  const x = useMotionValue(-1000);
  const y = useMotionValue(-1000);
  const sx = useSpring(x, { stiffness: 60, damping: 18 });
  const sy = useSpring(y, { stiffness: 60, damping: 18 });

  useEffect(() => {
    let frameId: number | null = null;
    const move = (e: MouseEvent) => {
      if (frameId) return;
      frameId = requestAnimationFrame(() => {
        frameId = null;
        x.set(e.clientX);
        y.set(e.clientY);
      });
    };
    window.addEventListener("mousemove", move, { passive: true });
    return () => {
      window.removeEventListener("mousemove", move);
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [x, y]);

  return (
    <motion.div
      aria-hidden={true}
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        background: `radial-gradient(380px circle at ${sx}px ${sy}px, rgba(232,160,100,0.05), transparent 60%)`,
      }}
    />
  );
}

function OrbitDashboard({ reduced }: { reduced: boolean }) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: 480, height: 480 }}
      aria-label="Axivon Services orbit diagram"
      role="img"
    >
      {[460, 420, 390].map((size) => (
        <div
          key={size}
          aria-hidden={true}
          className="absolute rounded-full border border-white/[0.03]"
          style={{ width: size, height: size }}
        />
      ))}

      <motion.div
        aria-hidden={true}
        className="absolute rounded-full border border-white/[0.05]"
        style={{ width: 410, height: 410 }}
        animate={reduced ? {} : { rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      />

      <motion.div
        aria-hidden={true}
        className="absolute"
        style={{ width: 410, height: 410 }}
        animate={reduced ? {} : { rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      >
        {[0, 90, 180, 270].map((a) => {
          const pos = polarToXY(a, 205);
          return (
            <div
              key={a}
              className="absolute w-1 h-1 rounded-full bg-white/10"
              style={{ left: `calc(50% + ${pos.x}px - 2px)`, top: `calc(50% + ${pos.y}px - 2px)` }}
            />
          );
        })}
      </motion.div>

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
            transition={{
              delay: 0.8 + i * 0.08,
              duration: 0.5,
              ease: "easeOut"
            }}
            whileHover={reduced ? {} : { scale: 1.18, zIndex: 10 }}
            onHoverStart={() => setHovered(svc.id)}
            onHoverEnd={() => setHovered(null)}
          >
            <div className="relative flex flex-col items-center gap-1.5 cursor-default" aria-label={svc.label}>
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center border border-white/10 backdrop-blur-md transition-all duration-300"
                style={{
                  background: isHov
                    ? `linear-gradient(135deg, ${svc.color}20, ${svc.color}10)`
                    : "rgba(255,255,255,0.03)",
                  boxShadow: isHov
                    ? `0 0 24px ${svc.glow}, 0 0 48px ${svc.glow}40`
                    : "none",
                  borderColor: isHov ? `${svc.color}40` : "rgba(255,255,255,0.08)",
                }}
              >
                <svc.Icon
                  className="w-5 h-5 transition-colors duration-300"
                  style={{ color: isHov ? svc.color : "rgba(255,255,255,0.65)" }}
                  strokeWidth={1.7}
                />
              </div>

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
                      background: `${svc.color}15`,
                      borderColor: `${svc.color}30`,
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

      <motion.div
        className="relative z-10 flex flex-col items-center justify-center gap-3 rounded-[28px] border backdrop-blur-2xl"
        style={{
          width: 168,
          height: 168,
          background: "rgba(255,255,255,0.04)",
          borderColor: "rgba(255,255,255,0.08)",
          boxShadow: "0 0 60px rgba(232,160,100,0.1), 0 0 120px rgba(196,122,58,0.05), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
        initial={reduced ? {} : { scale: 0.7, opacity: 0 }}
        animate={reduced ? {} : { scale: 1, opacity: 1 }}
        transition={{
          delay: 0.5,
          duration: 0.7,
          ease: [0.22, 1, 0.36, 1],
        }}
        aria-label="Axivon Services center hub"
      >
        {!reduced && [1, 2].map((n) => (
          <motion.div
            key={n}
            aria-hidden={true}
            className="absolute rounded-[28px] border border-[#e8a064]/10"
            style={{ inset: -n * 14 }}
            animate={{ opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 3, delay: n * 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}

        <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[#c47a3a] to-[#e8a064] shadow-md shadow-[#e8a064]/20">
          <Sparkles className="w-5 h-5 text-[#0f0f0f]" strokeWidth={1.8} />
        </div>

        <div className="text-center px-3">
          <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-white/40 leading-none mb-1">
            Axivon
          </p>
          <p className="text-sm font-bold text-white leading-tight tracking-tight">
            Services
          </p>
        </div>

        <div className="flex gap-1" aria-hidden={true}>
          {[0, 1, 2].map((d) => (
            <motion.div
              key={d}
              className="w-1 h-1 rounded-full bg-[#e8a064]"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.4, delay: d * 0.28, repeat: Infinity }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function CTAButtons({ reduced }: { reduced: boolean }) {
  const handleExplore = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.getElementById("services-grid");
    if (target) target.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  }, [reduced]);

  return (
    <div className="flex flex-wrap gap-4 items-center">
      <Link
        href="/contact#contact-form"
        className="group relative inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-sm font-semibold text-[#0f0f0f] bg-[#e8a064] shadow-[0_4px_16px_rgba(232,160,100,0.25)] transition-all hover:bg-[#f0b07a] focus:outline-none focus:ring-2 focus:ring-[#e8a064]/60"
        aria-label="Book a free consultation"
      >
        <span className="relative">Book Free Consultation</span>
        <ArrowRight
          className="relative w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
          strokeWidth={2.2}
        />
      </Link>

      <button
        onClick={handleExplore}
        className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-sm font-semibold border border-[#303030] bg-[#1c1c1e] text-[#d4d4d4] hover:text-[#f4f4f5] hover:border-[rgba(232,160,100,0.4)] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#e8a064]/20"
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

function HeroContent({ reduced }: { reduced: boolean }) {
  const stagger = (i: number): Variants => ({
    hidden: {
      opacity: 0,
      y: 28,
      filter: "blur(8px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.75,
        delay: i * 0.14,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  });

  return (
    <motion.div
      className="flex flex-col gap-8 max-w-xl"
      initial={reduced ? undefined : "hidden"}
      animate="visible"
    >
      <motion.div variants={reduced ? undefined : stagger(0)}>
        <Badge>
          <span aria-hidden={true} className="relative flex">
            <span className="absolute inline-flex h-2 w-2 rounded-full bg-[#e8a064] opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#e8a064]" />
          </span>
          <span className="ml-2">Our Services</span>
        </Badge>
      </motion.div>

      <motion.h1
        variants={reduced ? undefined : stagger(1)}
        className="text-5xl sm:text-6xl lg:text-7.5xl font-extrabold tracking-tight text-white leading-[1.05]"
      >
        Future-Ready
        <br />
        <span className="text-gradient-amber">Digital Services</span>
        <br />
        <span className="text-white/80">For Modern Businesses</span>
      </motion.h1>

      <motion.p
        variants={reduced ? undefined : stagger(2)}
        className="text-[#a1a1aa] text-lg leading-relaxed"
      >
        We help startups, businesses, and enterprises build powerful websites,
        mobile applications, AI solutions, cloud systems, and growth-focused
        digital experiences.
      </motion.p>

      <motion.div variants={reduced ? undefined : stagger(3)}>
        <CTAButtons reduced={reduced} />
      </motion.div>

      <motion.div
        variants={reduced ? undefined : stagger(4)}
        className="flex items-center gap-3 pt-2"
        aria-label="8 services available"
      >
        <div className="flex -space-x-2" aria-hidden={true}>
          {["#c47a3a", "#e8a064", "#f0b07a", "#c47a3a"].map((c, i) => (
            <div
              key={i}
              className="w-7 h-7 rounded-full border-2 border-[#0f0f0f] flex items-center justify-center"
              style={{ background: `${c}30`, borderColor: "#0f0f0f" }}
            >
              <div className="w-2 h-2 rounded-full" style={{ background: c }} />
            </div>
          ))}
        </div>
        <p className="text-[#71717a] text-sm">
          <span className="text-[#a1a1aa] font-semibold">8 specialized services</span> — web to AI
        </p>
      </motion.div>
    </motion.div>
  );
}

export default function ServicesHero() {
  const reduced = useReducedMotion() ?? false;

  return (
    <>
      {!reduced && (
        <div className="hidden lg:block">
          <MouseSpotlight />
        </div>
      )}

      <section
        className="relative w-full min-h-screen flex items-center overflow-hidden bg-[#0f0f0f]"
        aria-label="Axivon Technologies Services Hero"
      >
        <BackgroundBlobs reduced={reduced} />
        <Particles reduced={reduced} />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-12">
            <div className="w-full lg:w-1/2 text-center lg:text-left flex flex-col items-center lg:items-start">
              <HeroContent reduced={reduced} />
            </div>

            <motion.div
              className="w-full lg:w-1/2 flex items-center justify-center"
              initial={reduced ? undefined : { opacity: 0, x: 40 }}
              animate={reduced ? undefined : { opacity: 1, x: 0 }}
              transition={{
                duration: 0.9,
                delay: 0.3,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <div
                className="relative"
                style={{
                  filter: "drop-shadow(0 0 80px rgba(232,160,100,0.1)) drop-shadow(0 0 160px rgba(196,122,58,0.05))",
                }}
              >
                <OrbitDashboard reduced={reduced} />
              </div>
            </motion.div>
          </div>
        </div>

        <div
          aria-hidden={true}
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0f0f0f] to-transparent"
        />
      </section>
    </>
  );
}