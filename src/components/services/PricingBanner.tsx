"use client";

import {
  useRef,
  useState,
  useEffect,
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
  ShoppingCart,
  Smartphone,
  Settings2,
  ArrowRight,
  Check,
  Sparkles,
  BadgeCheck,
  MessageCircle,
  Shield,
  Headphones,
} from "lucide-react";

const EASE_PRICING = [0.22, 1, 0.36, 1] as const;

// ─── Types ────────────────────────────────────────────────────────────────────

interface PricingCard {
  id: number;
  title: string;
  price: string;
  priceNote: string;
  currency?: string;
  Icon: React.ElementType;
  features: string[];
  gradient: string;
  color: string;
  glow: string;
  glowRgba: string;
  popular?: boolean;
  cta: string;
}

interface TrustItem {
  Icon: React.ElementType;
  label: string;
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

const CARDS: PricingCard[] = [
  {
    id: 1,
    title: "Business Website",
    price: "9,999",
    priceNote: "Starting From",
    currency: "₹",
    Icon: Globe,
    features: [
      "Responsive Design",
      "SEO Ready",
      "Contact Form",
      "Fast Loading",
    ],
    gradient: "from-[#2563EB] to-[#00D4FF]",
    color: "#2563EB",
    glow: "#2563EB",
    glowRgba: "rgba(37,99,235,0.42)",
    cta: "Get Started",
  },
  {
    id: 2,
    title: "E-Commerce Website",
    price: "19,999",
    priceNote: "Starting From",
    currency: "₹",
    Icon: ShoppingCart,
    features: [
      "Product Catalog",
      "Payment Gateway",
      "Order Management",
      "Admin Panel",
    ],
    gradient: "from-[#7C3AED] to-[#2563EB]",
    color: "#7C3AED",
    glow: "#7C3AED",
    glowRgba: "rgba(124,58,237,0.42)",
    cta: "Get Started",
  },
  {
    id: 3,
    title: "Mobile App",
    price: "29,999",
    priceNote: "Starting From",
    currency: "₹",
    Icon: Smartphone,
    features: [
      "Android App",
      "iOS App",
      "API Integration",
      "App Deployment",
    ],
    gradient: "from-[#00D4FF] to-[#7C3AED]",
    color: "#00D4FF",
    glow: "#00D4FF",
    glowRgba: "rgba(0,212,255,0.42)",
    popular: true,
    cta: "Get Started",
  },
  {
    id: 4,
    title: "Custom Software",
    price: "Custom",
    priceNote: "Quote",
    Icon: Settings2,
    features: [
      "CRM Systems",
      "ERP Solutions",
      "Automation",
      "Enterprise Platforms",
    ],
    gradient: "from-[#2563EB] to-[#7C3AED]",
    color: "#2563EB",
    glow: "#2563EB",
    glowRgba: "rgba(37,99,235,0.42)",
    cta: "Talk to Us",
  },
];

const TRUST: TrustItem[] = [
  { Icon: MessageCircle, label: "Free Consultation" },
  { Icon: Shield, label: "No Hidden Charges" },
  { Icon: BadgeCheck, label: "Transparent Pricing" },
  { Icon: Headphones, label: "Dedicated Support" },
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

// ─── Shimmer Effect ───────────────────────────────────────────────────────────

const Shimmer = memo(function Shimmer({ active, reduced }: { active: boolean; reduced: boolean }) {
  if (!active || reduced) return null;
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 rounded-[28px] overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="absolute top-0 -left-full h-full w-1/2"
        style={{
          background:
            "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.06) 50%, transparent 60%)",
        }}
        animate={{ left: ["−100%", "200%"] }}
        transition={{ duration: 1.4, ease: "easeInOut" }}
      />
    </motion.div>
  );
});

// ─── Pricing Card ─────────────────────────────────────────────────────────────

const PricingCard = memo(function PricingCard({
  card,
  index,
  visible,
  reduced,
}: {
  card: PricingCard;
  index: number;
  visible: boolean;
  reduced: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // 3D tilt
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 180, damping: 24 });
  const springY = useSpring(rotateY, { stiffness: 180, damping: 24 });

  // Magnetic nudge
  const magX = useMotionValue(0);
  const magY = useMotionValue(0);
  const magSX = useSpring(magX, { stiffness: 110, damping: 18 });
  const magSY = useSpring(magY, { stiffness: 110, damping: 18 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current || reduced) return;
      const rect = cardRef.current.getBoundingClientRect();
      const cx = e.clientX - rect.left - rect.width / 2;
      const cy = e.clientY - rect.top - rect.height / 2;
      rotateX.set((-cy / (rect.height / 2)) * 5.5);
      rotateY.set((cx / (rect.width / 2)) * 5.5);
      magX.set((cx / (rect.width / 2)) * 6);
      magY.set((cy / (rect.height / 2)) * 6);
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

  const delay = reduced ? 0 : index * 0.11 + 0.3;
  const isCustom = card.price === "Custom";

  return (
    <motion.article
      initial={reduced ? undefined : { opacity: 0, y: 48, scale: 0.93 }}
      animate={
        visible
          ? { opacity: 1, y: 0, scale: 1, transition: { duration: 0.62, delay, ease: EASE_PRICING } }
          : { opacity: 0, y: 48, scale: 0.93 }
      }
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
      className="group relative outline-none"
      role="article"
      aria-label={`${card.title} pricing plan`}
      tabIndex={0}
      onFocus={() => setHovered(true)}
      onBlur={handleMouseLeave}
    >
      {/* Popular badge */}
      <AnimatePresence>
        {card.popular && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: delay + 0.25, duration: 0.4, ease: EASE_PRICING }}
            className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-bold tracking-widest uppercase"
            style={{
              background: "linear-gradient(90deg, #00D4FF, #7C3AED)",
              boxShadow: "0 0 20px rgba(0,212,255,0.5), 0 0 40px rgba(124,58,237,0.3)",
              color: "#fff",
            }}
            aria-label="Most Popular plan"
          >
            <Sparkles className="w-3 h-3" strokeWidth={2.5} aria-hidden="true" />
            Most Popular
          </motion.div>
        )}
      </AnimatePresence>

      <div
        ref={cardRef}
        className={`relative h-full flex flex-col gap-6 rounded-[28px] border bg-white/[0.03] backdrop-blur-xl p-7 overflow-hidden transition-colors duration-400 focus-within:ring-2 focus-within:ring-[#2563EB]/50 ${card.popular ? "mt-4" : ""}`}
        style={{
          boxShadow: hovered
            ? `0 0 0 1px ${card.glowRgba}, 0 8px 60px -8px ${card.glowRgba}, 0 28px 72px -18px ${card.glowRgba}55`
            : card.popular
            ? `0 0 0 1px rgba(0,212,255,0.2), 0 4px 32px -4px rgba(0,212,255,0.15)`
            : "inset 0 1px 0 rgba(255,255,255,0.04)",
          borderColor: hovered
            ? `${card.glow}55`
            : card.popular
            ? "rgba(0,212,255,0.25)"
            : "rgba(255,255,255,0.08)",
          transition: "box-shadow 0.4s ease, border-color 0.4s ease",
        }}
      >
        {/* Inner corner glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-14 -left-14 w-44 h-44 rounded-full blur-3xl transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle, ${card.glowRgba}, transparent)`,
            opacity: hovered ? 0.4 : 0.1,
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[28px] transition-opacity duration-500"
          style={{
            background: `radial-gradient(ellipse 65% 45% at 50% 0%, ${card.glow}18, transparent)`,
            opacity: hovered ? 1 : 0,
          }}
        />

        <BorderBeam gradient={card.gradient} active={hovered} reduced={reduced} />
        <Shimmer active={hovered} reduced={reduced} />

        {/* Icon */}
        <motion.div
          className={`w-[52px] h-[52px] rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg flex-shrink-0`}
          animate={
            reduced
              ? {}
              : hovered
              ? { scale: 1.12, rotate: 9, y: -4 }
              : { scale: 1, rotate: 0, y: [0, -5, 0] }
          }
          transition={
            hovered
              ? { duration: 0.35, ease: "easeOut" }
              : { y: { duration: 3.2, repeat: Infinity, ease: "easeInOut" } }
          }
          aria-hidden="true"
        >
          <card.Icon className="w-6 h-6 text-white" strokeWidth={1.8} />
        </motion.div>

        {/* Title */}
        <div className="flex flex-col gap-1">
          <h3 className="text-white font-bold text-lg tracking-tight">{card.title}</h3>
          <p className="text-white/35 text-xs font-medium tracking-wide uppercase">
            {card.priceNote}
          </p>
        </div>

        {/* Price */}
        <div className="flex items-end gap-1">
          {!isCustom ? (
            <>
              <span
                className="text-[13px] font-semibold self-start mt-1.5"
                style={{ color: card.color, opacity: 0.8 }}
              >
                {card.currency}
              </span>
              <motion.span
                className="text-4xl font-extrabold tracking-tight text-white leading-none"
                animate={reduced ? {} : { opacity: [1, 0.7, 1] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: index * 0.4 }}
                aria-label={`${card.currency}${card.price}`}
              >
                {card.price}
              </motion.span>
            </>
          ) : (
            <span
              className="text-4xl font-extrabold tracking-tight leading-none bg-gradient-to-r from-[#2563EB] via-[#7C3AED] to-[#00D4FF] bg-clip-text text-transparent"
              style={{ backgroundSize: "200% 100%", animation: reduced ? "none" : "gradientShift 5s ease infinite" }}
              aria-label="Custom quote pricing"
            >
              Custom
            </span>
          )}
        </div>

        {/* Divider */}
        <div
          aria-hidden="true"
          className="h-px w-full"
          style={{ background: `linear-gradient(to right, transparent, ${card.color}40, transparent)` }}
        />

        {/* Features */}
        <ul className="flex flex-col gap-3 flex-1" role="list" aria-label={`${card.title} features`}>
          {card.features.map((feat) => (
            <li key={feat} className="flex items-center gap-3">
              <span
                className={`flex-shrink-0 w-[18px] h-[18px] rounded-full bg-gradient-to-br ${card.gradient} flex items-center justify-center`}
                aria-hidden="true"
              >
                <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
              </span>
              <span className="text-white/55 text-sm leading-none">{feat}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Link
          href="/contact#contact-form"
          className="group/cta relative inline-flex items-center justify-center gap-2.5 w-full py-3.5 rounded-2xl text-sm font-semibold text-white overflow-hidden transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#050816] mt-auto"
          style={{ focusRingColor: card.color } as React.CSSProperties}
          aria-label={`${card.cta} — ${card.title}`}
          tabIndex={0}
        >
          <span
            aria-hidden="true"
            className={`absolute inset-0 bg-gradient-to-r ${card.gradient} opacity-90 transition-opacity duration-300 group-hover/cta:opacity-100`}
          />
          <span
            aria-hidden="true"
            className="absolute inset-0 opacity-0 group-hover/cta:opacity-100 transition-opacity duration-300"
            style={{ boxShadow: `inset 0 1px 0 rgba(255,255,255,0.18)` }}
          />
          <span className="relative">{card.cta}</span>
          <motion.span
            className="relative"
            animate={reduced ? {} : hovered ? { x: 5 } : { x: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <ArrowRight className="w-4 h-4" strokeWidth={2.2} aria-hidden="true" />
          </motion.span>
        </Link>
      </div>
    </motion.article>
  );
});

// ─── Trust Bar ────────────────────────────────────────────────────────────────

const TrustBar = memo(function TrustBar({
  visible,
  reduced,
}: {
  visible: boolean;
  reduced: boolean;
}) {
  return (
    <motion.div
      initial={reduced ? undefined : { opacity: 0, y: 24 }}
      animate={
        visible
          ? { opacity: 1, y: 0, transition: { duration: 0.7, delay: 0.9, ease: EASE_PRICING } }
          : { opacity: 0, y: 24 }
      }
      className="flex flex-wrap items-center justify-center gap-3 mt-14"
      role="list"
      aria-label="Trust indicators"
    >
      {TRUST.map((t, i) => (
        <motion.div
          key={t.label}
          initial={reduced ? undefined : { opacity: 0, scale: 0.88 }}
          animate={
            visible
              ? { opacity: 1, scale: 1, transition: { delay: 1.0 + i * 0.08, duration: 0.45, ease: EASE_PRICING } }
              : { opacity: 0, scale: 0.88 }
          }
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm"
          role="listitem"
        >
          <t.Icon className="w-3.5 h-3.5 text-[#00D4FF]" strokeWidth={1.8} aria-hidden="true" />
          <span className="text-white/55 text-xs font-medium">{t.label}</span>
        </motion.div>
      ))}
    </motion.div>
  );
});

// ─── Bottom CTA ───────────────────────────────────────────────────────────────

const BottomCTA = memo(function BottomCTA({
  visible,
  reduced,
}: {
  visible: boolean;
  reduced: boolean;
}) {
  const [hov, setHov] = useState(false);

  return (
    <motion.div
      initial={reduced ? undefined : { opacity: 0, y: 20 }}
      animate={
        visible
          ? { opacity: 1, y: 0, transition: { duration: 0.7, delay: 1.15, ease: EASE_PRICING } }
          : { opacity: 0, y: 20 }
      }
      className="flex justify-center mt-10"
    >
      <Link
        href="/contact#contact-form"
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-sm font-semibold text-white overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#2563EB]/60 focus:ring-offset-2 focus:ring-offset-[#050816]"
        aria-label="Get a custom quote for your project"
      >
        {/* Gradient background */}
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#2563EB] via-[#7C3AED] to-[#00D4FF] transition-all duration-500"
          style={{ backgroundSize: "200% 100%", backgroundPosition: hov ? "100% 0" : "0% 0" }}
        />
        {/* Glow */}
        <span
          aria-hidden="true"
          className="absolute inset-0 transition-opacity duration-400"
          style={{
            boxShadow: hov
              ? "0 0 40px rgba(37,99,235,0.55), 0 0 80px rgba(124,58,237,0.35)"
              : "0 0 0 transparent",
            borderRadius: "inherit",
            opacity: hov ? 1 : 0,
          }}
        />
        <span className="relative font-bold tracking-tight">Get Custom Quote</span>
        <motion.span
          className="relative"
          animate={reduced ? {} : hov ? { x: 6 } : { x: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <ArrowRight className="w-5 h-5" strokeWidth={2.2} aria-hidden="true" />
        </motion.span>
      </Link>
    </motion.div>
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
  const v = (i: number) => ({
    hidden: { opacity: 0, y: 26, filter: "blur(7px)" },
    visible: {
      opacity: 1, y: 0, filter: "blur(0px)",
      transition: { duration: 0.72, delay: i * 0.13, ease: EASE_PRICING },
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
          aria-label="Section: Transparent Pricing"
        >
          <span aria-hidden="true" className="relative flex">
            <span className="absolute inline-flex h-2 w-2 rounded-full bg-[#00D4FF] opacity-70 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00D4FF]" />
          </span>
          Transparent Pricing
        </span>
      </motion.div>

      <motion.h2
        variants={reduced ? undefined : v(1)}
        initial={reduced ? undefined : "hidden"}
        animate={visible ? "visible" : "hidden"}
        className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.1]"
        id="pricing-heading"
      >
        Affordable Solutions
        <br />
        <span
          className="bg-gradient-to-r from-[#2563EB] via-[#7C3AED] to-[#00D4FF] bg-clip-text text-transparent"
          style={{
            backgroundSize: "200% 100%",
            animation: reduced ? "none" : "gradientShift 5s ease infinite",
          }}
        >
          Built For Growth
        </span>
      </motion.h2>

      <motion.div
        variants={reduced ? undefined : v(2)}
        initial={reduced ? undefined : "hidden"}
        animate={visible ? "visible" : "hidden"}
        className="flex flex-col items-center gap-1"
      >
        <p className="text-white/45 text-base sm:text-lg leading-relaxed">
          Every project is unique.
        </p>
        <p className="text-white/35 text-sm sm:text-base leading-relaxed max-w-xl text-center">
          We provide custom pricing based on requirements, features, timelines,
          and business goals.
        </p>
      </motion.div>
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

      {/* Noise overlay */}
      <div
        className="absolute inset-0 opacity-[0.018]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px",
        }}
      />

      {!reduced && (
        <>
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
              top: "45%", left: "50%", translateX: "-50%",
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

export default function PricingBanner() {
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
        id="pricing"
        aria-labelledby="pricing-heading"
        className="relative w-full overflow-hidden py-24 sm:py-32"
        style={{ background: "#050816" }}
      >
        <Background reduced={reduced} />
        {!reduced && <MouseSpotlight sectionRef={sectionRef} />}

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader visible={isInView} reduced={reduced} />

          {/* Pricing grid */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 items-start"
            role="list"
            aria-label="Pricing plans"
          >
            {CARDS.map((card, i) => (
              <PricingCard
                key={card.id}
                card={card}
                index={i}
                visible={isInView}
                reduced={reduced}
              />
            ))}
          </div>

          {/* Trust bar */}
          <TrustBar visible={isInView} reduced={reduced} />

          {/* Bottom CTA */}
          <BottomCTA visible={isInView} reduced={reduced} />
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