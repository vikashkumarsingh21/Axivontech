"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  Globe,
  Smartphone,
  BrainCircuit,
  Cloud,
  TrendingUp,
  Megaphone,
  Palette,
  Code2,
  ArrowRight,
  MessageCircle,
  Zap,
  Shield,
  Activity,
} from "lucide-react";
import type { ServiceData } from "@/data/services";
import type { Variants } from "framer-motion";

const EASE_PREMIUM = [0.25, 0.46, 0.45, 0.94] as const;

// ─── Icon Map ──────────────────────────────────────────────────────────────────

const iconMap: Record<string, React.ElementType> = {
  Globe,
  Smartphone,
  BrainCircuit,
  Cloud,
  TrendingUp,
  Megaphone,
  Palette,
  Code2,
};

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ServiceHeroProps {
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

// ─── Stagger Variants ─────────────────────────────────────────────────────────

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 32, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: EASE_PREMIUM },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, x: 48, scale: 0.94, filter: "blur(12px)" },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: EASE_PREMIUM, delay: 0.3 },
  },
};

// ─── Floating Particles ───────────────────────────────────────────────────────

function Particles() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2.5 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
        duration: Math.random() * 12 + 8,
        delay: Math.random() * 6,
        xDrift: (Math.random() - 0.5) * 60,
      }))
    );
  }, []);

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
            background: `radial-gradient(circle, rgba(37,99,235,${p.opacity}) 0%, rgba(124,58,237,${p.opacity * 0.6}) 100%)`,
          }}
          animate={{
            y: [0, -120, 0],
            x: [0, p.xDrift, 0],
            opacity: [0, p.opacity, 0],
            scale: [0.5, 1.2, 0.5],
          }}
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

// ─── Animated Grid ────────────────────────────────────────────────────────────

function AnimatedGrid() {
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden>
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(37,99,235,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(37,99,235,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }}
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Diagonal accent lines */}
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(45deg, rgba(0,212,255,0.02) 25%, transparent 25%)`,
          backgroundSize: "128px 128px",
        }}
        animate={{ backgroundPositionX: ["0px", "128px"] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

// ─── Aurora Background ────────────────────────────────────────────────────────

function AuroraBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {/* Primary orb — blue */}
      <motion.div
        className="absolute -top-48 -left-48 w-[600px] h-[600px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(37,99,235,0.18) 0%, rgba(37,99,235,0.04) 55%, transparent 70%)",
          filter: "blur(40px)",
        }}
        animate={{
          x: [0, 80, -40, 0],
          y: [0, 60, -30, 0],
          scale: [1, 1.15, 0.9, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Secondary orb — purple */}
      <motion.div
        className="absolute top-1/3 -right-32 w-[500px] h-[500px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(124,58,237,0.16) 0%, rgba(124,58,237,0.04) 55%, transparent 70%)",
          filter: "blur(40px)",
        }}
        animate={{
          x: [0, -60, 40, 0],
          y: [0, -80, 50, 0],
          scale: [1, 0.88, 1.12, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />
      {/* Tertiary orb — cyan */}
      <motion.div
        className="absolute -bottom-24 left-1/3 w-[400px] h-[400px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(0,212,255,0.1) 0%, rgba(0,212,255,0.03) 55%, transparent 70%)",
          filter: "blur(60px)",
        }}
        animate={{
          x: [0, 50, -70, 0],
          y: [0, -40, 30, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut", delay: 7 }}
      />
    </div>
  );
}

// ─── Moving Border Beam ───────────────────────────────────────────────────────

function BorderBeam({ className = "" }: { className?: string }) {
  return (
    <div
      className={`absolute inset-0 rounded-2xl overflow-hidden pointer-events-none ${className}`}
      aria-hidden
    >
      <motion.div
        className="absolute w-[200%] h-[2px] top-0 left-0"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(37,99,235,0.8) 30%, rgba(0,212,255,1) 50%, rgba(124,58,237,0.8) 70%, transparent 100%)",
        }}
        animate={{ x: ["-100%", "50%"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 1.5 }}
      />
      <motion.div
        className="absolute w-[2px] h-[200%] top-0 right-0"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(124,58,237,0.8) 30%, rgba(0,212,255,1) 50%, rgba(37,99,235,0.8) 70%, transparent 100%)",
        }}
        animate={{ y: ["-100%", "50%"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 1.5, delay: 1.5 }}
      />
    </div>
  );
}

// ─── Tech Dashboard Card ──────────────────────────────────────────────────────

function TechCard({ service }: { service: ServiceData }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-150, 150], [10, -10]), {
    stiffness: 120,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [-150, 150], [-10, 10]), {
    stiffness: 120,
    damping: 20,
  });
  const glowX = useTransform(mouseX, [-150, 150], [0, 100]);
  const glowY = useTransform(mouseY, [-150, 150], [0, 100]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = cardRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouseX.set(e.clientX - rect.left - rect.width / 2);
      mouseY.set(e.clientY - rect.top - rect.height / 2);
    },
    [mouseX, mouseY]
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  const IconComponent = iconMap[service.icon] ?? Code2;

  // Orbit items
  const orbitItems = [
    { label: "Secure", icon: Shield, color: "#2563EB", angle: 0 },
    { label: "Fast", icon: Zap, color: "#00D4FF", angle: 120 },
    { label: "Live", icon: Activity, color: "#7C3AED", angle: 240 },
  ];

  return (
    <motion.div
      ref={cardRef}
      variants={cardVariants}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 1000 }}
      className="relative w-full max-w-[420px] mx-auto lg:mx-0 cursor-default select-none"
    >
      {/* Outer glow halo */}
      <motion.div
        className="absolute -inset-8 rounded-3xl pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at ${glowX}% ${glowY}%, rgba(37,99,235,0.2) 0%, rgba(124,58,237,0.12) 40%, transparent 70%)`,
          filter: "blur(20px)",
        }}
      />

      {/* Main card */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.03)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow:
            "0 32px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        <BorderBeam />

        {/* Animated shine sweep */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.04) 50%, transparent 60%)",
          }}
          animate={{ backgroundPositionX: ["-200%", "300%"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", repeatDelay: 3 }}
        />

        {/* Card Header */}
        <div className="relative p-6 pb-0">
          <div className="flex items-center justify-between mb-6">
            {/* Icon with orbit */}
            <div className="relative w-16 h-16">
              {/* Orbit ring */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ border: "1px dashed rgba(37,99,235,0.3)" }}
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              />
              {/* Orbit dots */}
              {orbitItems.map((item, i) => {
                const rad = (item.angle * Math.PI) / 180;
                const r = 32;
                const cx = Math.cos(rad) * r;
                const cy = Math.sin(rad) * r;
                return (
                  <motion.div
                    key={i}
                    className="absolute w-4 h-4 rounded-full flex items-center justify-center"
                    style={{
                      top: "50%",
                      left: "50%",
                      background: `${item.color}22`,
                      border: `1px solid ${item.color}66`,
                    }}
                    animate={{
                      x: [cx - 8, cx - 8],
                      y: [cy - 8, cy - 8],
                      rotate: 360,
                    }}
                    transition={{
                      rotate: { duration: 12, repeat: Infinity, ease: "linear" },
                    }}
                  >
                    <item.icon size={8} style={{ color: item.color }} />
                  </motion.div>
                );
              })}
              {/* Central icon */}
              <motion.div
                className="absolute inset-2 rounded-xl flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(37,99,235,0.3) 0%, rgba(124,58,237,0.3) 100%)",
                  border: "1px solid rgba(37,99,235,0.4)",
                  boxShadow: "0 0 20px rgba(37,99,235,0.3)",
                }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <IconComponent size={20} className="text-blue-400" />
              </motion.div>
            </div>

            {/* Status badge */}
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{
                background: "rgba(0,212,255,0.08)",
                border: "1px solid rgba(0,212,255,0.2)",
                color: "#00D4FF",
              }}
            >
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-[#00D4FF]"
                animate={{ opacity: [1, 0.3, 1], scale: [1, 0.8, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              Active
            </div>
          </div>

          {/* Service badge */}
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-3 tracking-wide uppercase"
            style={{
              background: "linear-gradient(90deg, rgba(37,99,235,0.15), rgba(124,58,237,0.15))",
              border: "1px solid rgba(124,58,237,0.25)",
              color: "#a78bfa",
            }}
          >
            {service.badge}
          </div>

          {/* Service title */}
          <h3 className="text-xl font-bold text-white mb-1 leading-tight">{service.title}</h3>
          <p className="text-sm text-white/40 mb-6">Axivon Technologies</p>
        </div>

        {/* Divider */}
        <div
          className="mx-6"
          style={{
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
          }}
        />

        {/* Metrics row */}
        <div className="p-6 grid grid-cols-3 gap-4">
          {[
            { label: "Uptime", value: "99.9%", color: "#00D4FF" },
            { label: "Projects", value: "200+", color: "#2563EB" },
            { label: "Rating", value: "5.0★", color: "#7C3AED" },
          ].map((metric) => (
            <div key={metric.label} className="text-center">
              <motion.div
                className="text-lg font-bold mb-0.5"
                style={{ color: metric.color }}
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                {metric.value}
              </motion.div>
              <div className="text-xs text-white/30 font-medium">{metric.label}</div>
            </div>
          ))}
        </div>

        {/* Bottom tech stack strip */}
        <div
          className="px-6 py-4"
          style={{
            borderTop: "1px solid rgba(255,255,255,0.05)",
            background: "rgba(0,0,0,0.2)",
          }}
        >
          <div className="text-xs text-white/25 font-medium mb-2 uppercase tracking-widest">
            Tech Stack
          </div>
          <div className="flex flex-wrap gap-1.5">
            {service.technologies.slice(0, 5).map((tech) => (
              <span
                key={tech.name}
                className="text-xs px-2 py-0.5 rounded-md font-medium"
                style={{
                  background: "rgba(37,99,235,0.1)",
                  border: "1px solid rgba(37,99,235,0.2)",
                  color: "rgba(147,197,253,0.7)",
                }}
              >
                {tech.name}
              </span>
            ))}
            {service.technologies.length > 5 && (
              <span
                className="text-xs px-2 py-0.5 rounded-md font-medium"
                style={{
                  background: "rgba(124,58,237,0.1)",
                  border: "1px solid rgba(124,58,237,0.2)",
                  color: "rgba(196,181,253,0.7)",
                }}
              >
                +{service.technologies.length - 5} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Floating decorative orb below card */}
      <motion.div
        className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-48 h-12 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse, rgba(37,99,235,0.2) 0%, transparent 70%)",
          filter: "blur(16px)",
        }}
        animate={{ opacity: [0.4, 0.8, 0.4], scaleX: [0.8, 1.1, 0.8] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
}

// ─── Magnetic Button ──────────────────────────────────────────────────────────

function MagneticButton({
  children,
  href,
  variant = "primary",
  className = "",
}: {
  children: React.ReactNode;
  href: string;
  variant?: "primary" | "secondary";
  className?: string;
}) {
  const btnRef = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 20 });
  const springY = useSpring(y, { stiffness: 200, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = btnRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * 0.25);
    y.set((e.clientY - cy) * 0.25);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.a
      ref={btnRef}
      href={href}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      className={`relative inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold text-sm transition-shadow duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050816] ${variant === "primary"
          ? "text-white"
          : "text-white/80 hover:text-white"
        } ${className}`}
      style={{
        x: springX,
        y: springY,
        ...(variant === "primary"
          ? {
            background:
              "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)",
            boxShadow:
              "0 0 0 1px rgba(37,99,235,0.4), 0 8px 24px rgba(37,99,235,0.35)",
          }
          : {
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(12px)",
          }),
      }}
    >
      {variant === "primary" && (
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%)",
          }}
        />
      )}
      {children}
    </motion.a>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ServiceHero({ service }: ServiceHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const parallaxX = useTransform(mouseX, [0, 1], [-12, 12]);
  const parallaxY = useTransform(mouseY, [0, 1], [-8, 8]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth);
      mouseY.set(e.clientY / window.innerHeight);
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  const whatsappHref = `https://wa.me/919999999999?text=${encodeURIComponent(
    `Hi! I'm interested in your ${service.title} services.`
  )}`;

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ background: "#050816" }}
      aria-label={`${service.title} hero section`}
    >
      {/* ── Background Layers ── */}
      <AuroraBackground />
      <AnimatedGrid />
      <Particles />

      {/* Parallax glow that follows cursor */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          x: parallaxX,
          y: parallaxY,
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(37,99,235,0.06) 0%, transparent 70%)",
        }}
        aria-hidden
      />

      {/* ── Content ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 items-center">

          {/* ── Left Column ── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-6"
          >
            {/* Badge */}
            <motion.div variants={fadeUpVariants} className="flex items-center gap-3">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-widest"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(37,99,235,0.12), rgba(124,58,237,0.12))",
                  border: "1px solid rgba(124,58,237,0.3)",
                  color: "#a78bfa",
                }}
              >
                <motion.div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "#7C3AED" }}
                  animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                />
                {service.badge}
              </div>
            </motion.div>

            {/* Heading */}
            <motion.div variants={fadeUpVariants}>
              <h1 className="font-extrabold leading-[1.05] tracking-tight">
                {/* Gradient first word */}
                <span
                  className="block text-5xl sm:text-6xl xl:text-7xl"
                  style={{
                    background:
                      "linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.85) 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {service.title}
                </span>
                <span
                  className="block text-4xl sm:text-5xl xl:text-6xl mt-1"
                  style={{
                    background:
                      "linear-gradient(135deg, #2563EB 0%, #00D4FF 50%, #7C3AED 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Services
                </span>
              </h1>
            </motion.div>

            {/* Hero description */}
            <motion.p
              variants={fadeUpVariants}
              className="text-base sm:text-lg leading-relaxed max-w-lg"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              {service.heroDescription}
            </motion.p>

            {/* Trust indicators */}
            <motion.div
              variants={fadeUpVariants}
              className="flex flex-wrap items-center gap-x-6 gap-y-2"
            >
              {[
                "No commitment required",
                "Response within 24h",
                "Free strategy call",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-1.5 text-xs font-medium"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  <div
                    className="w-3 h-3 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(0,212,255,0.15)", border: "1px solid rgba(0,212,255,0.3)" }}
                  >
                    <svg width="6" height="5" viewBox="0 0 6 5" fill="none">
                      <path d="M1 2.5L2.5 4L5 1" stroke="#00D4FF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  {item}
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeUpVariants}
              className="flex flex-wrap gap-3 pt-2"
            >
              <MagneticButton href="/contact" variant="primary">
                Get Free Consultation
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </MagneticButton>

              <MagneticButton href={whatsappHref} variant="secondary">
                <MessageCircle size={16} style={{ color: "#25D366" }} />
                WhatsApp Chat
              </MagneticButton>
            </motion.div>

            {/* Social proof strip */}
            <motion.div
              variants={fadeUpVariants}
              className="flex items-center gap-3 pt-2"
            >
              {/* Avatar stack */}
              <div className="flex -space-x-2">
                {["2563EB", "7C3AED", "00D4FF", "2563EB"].map((color, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-[#050816]"
                    style={{
                      background: `linear-gradient(135deg, #${color} 0%, #050816 150%)`,
                      border: "2px solid #050816",
                    }}
                  >
                    {["AK", "SR", "MJ", "TL"][i]}
                  </div>
                ))}
              </div>
              <div>
                <div className="text-xs font-semibold text-white/70">
                  Trusted by 200+ businesses
                </div>
                <div className="text-xs text-white/30">
                  Startups · Enterprises · Scale-ups
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* ── Right Column — Tech Card ── */}
          <motion.div
            initial="hidden"
            animate="visible"
            className="flex justify-center lg:justify-end"
          >
            <TechCard service={service} />
          </motion.div>
        </div>
      </div>

      {/* ── Bottom fade ── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, #050816 0%, transparent 100%)",
        }}
        aria-hidden
      />
    </section>
  );
}