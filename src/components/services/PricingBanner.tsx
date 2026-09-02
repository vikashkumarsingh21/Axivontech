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
import { Badge } from "@/components/ui";

const EASE_PRICING = [0.22, 1, 0.36, 1] as const;

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
    gradient: "from-[#c47a3a] to-[#e8a064]",
    color: "#c47a3a",
    glow: "#c47a3a",
    glowRgba: "rgba(196,122,58,0.3)",
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
    gradient: "from-[#e8a064] to-[#f0b07a]",
    color: "#e8a064",
    glow: "#e8a064",
    glowRgba: "rgba(232,160,100,0.3)",
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
    gradient: "from-[#f0b07a] to-[#c47a3a]",
    color: "#f0b07a",
    glow: "#f0b07a",
    glowRgba: "rgba(240,176,122,0.3)",
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
    gradient: "from-[#c47a3a] to-[#f0b07a]",
    color: "#c47a3a",
    glow: "#c47a3a",
    glowRgba: "rgba(196,122,58,0.3)",
    cta: "Talk to Us",
  },
];

const TRUST: TrustItem[] = [
  { Icon: MessageCircle, label: "Free Consultation" },
  { Icon: Shield, label: "No Hidden Charges" },
  { Icon: BadgeCheck, label: "Transparent Pricing" },
  { Icon: Headphones, label: "Dedicated Support" },
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
    <div aria-hidden={true} className="pointer-events-none absolute inset-0 rounded-[28px] overflow-hidden">
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

const Shimmer = memo(function Shimmer({ active, reduced }: { active: boolean; reduced: boolean }) {
  if (!active || reduced) return null;
  return (
    <motion.div
      aria-hidden={true}
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
        animate={{ left: ["-100%", "200%"] }}
        transition={{ duration: 1.4, ease: "easeInOut" }}
      />
    </motion.div>
  );
});

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

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 180, damping: 24 });
  const springY = useSpring(rotateY, { stiffness: 180, damping: 24 });

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
      <AnimatePresence>
        {card.popular && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: delay + 0.25, duration: 0.4, ease: EASE_PRICING }}
            className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-bold tracking-widest uppercase bg-gradient-to-r from-[#c47a3a] to-[#e8a064] shadow-[0_0_20px_rgba(232,160,100,0.3)] text-[#0f0f0f]"
            aria-label="Most Popular plan"
          >
            <Sparkles className="w-3 h-3 text-[#0f0f0f]" strokeWidth={2.5} aria-hidden={true} />
            Most Popular
          </motion.div>
        )}
      </AnimatePresence>

      <div
        ref={cardRef}
        className={`relative h-full flex flex-col gap-6 rounded-[28px] border bg-[#141414]/95 border-[#262626] backdrop-blur-xl p-7 overflow-hidden transition-colors duration-400 focus-within:ring-2 focus-within:ring-[#e8a064]/50 ${card.popular ? "mt-4" : ""}`}
        style={{
          boxShadow: hovered
            ? `0 0 0 1px ${card.glowRgba}, 0 8px 60px -8px ${card.glowRgba}, 0 28px 72px -18px ${card.glowRgba}55`
            : card.popular
            ? `0 0 0 1px rgba(232,160,100,0.2), 0 4px 32px -4px rgba(232,160,100,0.15)`
            : "inset 0 1px 0 rgba(255,255,255,0.04)",
          borderColor: hovered
            ? `${card.glow}55`
            : card.popular
            ? "rgba(232,160,100,0.25)"
            : "rgba(255,255,255,0.08)",
          transition: "box-shadow 0.4s ease, border-color 0.4s ease",
        }}
      >
        <div
          aria-hidden={true}
          className="pointer-events-none absolute -top-14 -left-14 w-44 h-44 rounded-full blur-3xl transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle, ${card.glowRgba}, transparent)`,
            opacity: hovered ? 0.4 : 0.1,
          }}
        />
        <div
          aria-hidden={true}
          className="pointer-events-none absolute inset-0 rounded-[28px] transition-opacity duration-500"
          style={{
            background: `radial-gradient(ellipse 65% 45% at 50% 0%, ${card.glow}18, transparent)`,
            opacity: hovered ? 1 : 0,
          }}
        />

        <BorderBeam gradient={card.gradient} active={hovered} reduced={reduced} />
        <Shimmer active={hovered} reduced={reduced} />

        <div className="flex-shrink-0">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-md`}>
            <card.Icon className="w-5 h-5 text-[#0f0f0f]" strokeWidth={1.8} />
          </div>
        </div>

        <div>
          <h3 className="text-white font-bold text-xl tracking-tight leading-none mb-4">
            {card.title}
          </h3>
          <div className="flex items-baseline gap-1">
            {card.currency && (
              <span className="text-white/45 text-lg font-semibold">{card.currency}</span>
            )}
            <span className="text-white text-3xl sm:text-4xl font-extrabold tracking-tight">
              {card.price}
            </span>
            {!isCustom && (
              <span className="text-white/45 text-sm ml-1">/{card.priceNote.toLowerCase()}</span>
            )}
          </div>
          {isCustom && (
            <p className="text-white/45 text-xs mt-1">{card.priceNote}</p>
          )}
        </div>

        <ul className="flex flex-col gap-3 flex-grow" role="list" aria-label={`${card.title} plan features`}>
          {card.features.map((feat) => (
            <li key={feat} className="flex items-center gap-3">
              <span className={`w-4 h-4 rounded-full bg-gradient-to-br ${card.gradient} flex items-center justify-center`} aria-hidden={true}>
                <Check className="w-2.5 h-2.5 text-[#0f0f0f]" strokeWidth={3.5} />
              </span>
              <span className="text-white/60 text-sm leading-none">{feat}</span>
            </li>
          ))}
        </ul>

        <Link
          href="/contact#contact-form"
          className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 focus:outline-none ${
            card.popular
              ? "bg-[#e8a064] text-[#0f0f0f] hover:bg-[#f0b07a] shadow-md shadow-[#e8a064]/10"
              : "border border-[#303030] bg-[#1c1c1e] text-[#d4d4d4] hover:text-[#f4f4f5] hover:border-[rgba(232,160,100,0.4)]"
          }`}
          aria-label={`${card.cta} for ${card.title} plan`}
        >
          {card.cta}
          <ArrowRight className="w-4 h-4" strokeWidth={2.2} />
        </Link>
      </div>
    </motion.article>
  );
});

function SectionHeader({ visible, reduced }: { visible: boolean; reduced: boolean }) {
  const stagger = (i: number) => ({
    hidden: { opacity: 0, y: 28, filter: "blur(6px)" },
    visible: {
      opacity: 1, y: 0, filter: "blur(0px)",
      transition: { duration: 0.7, delay: i * 0.12, ease: EASE_PRICING },
    },
  });

  return (
    <div className="text-center max-w-2xl mx-auto mb-20 flex flex-col items-center gap-5">
      <motion.div
        variants={reduced ? undefined : stagger(0)}
        initial={reduced ? undefined : "hidden"}
        animate={visible ? "visible" : "hidden"}
      >
        <Badge>
          <span aria-hidden={true} className="relative flex">
            <span className="absolute inline-flex h-2 w-2 rounded-full bg-[#e8a064] opacity-70 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#e8a064]" />
          </span>
          <span className="ml-2">Simple Pricing</span>
        </Badge>
      </motion.div>

      <motion.h2
        variants={reduced ? undefined : stagger(1)}
        initial={reduced ? undefined : "hidden"}
        animate={visible ? "visible" : "hidden"}
        className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.1]"
        id="pricing-heading"
      >
        Clear Plans For
        <br />
        <span className="text-gradient-amber">Every Growth Stage</span>
      </motion.h2>

      <motion.p
        variants={reduced ? undefined : stagger(2)}
        initial={reduced ? undefined : "hidden"}
        animate={visible ? "visible" : "hidden"}
        className="text-[#a1a1aa] text-base sm:text-lg leading-relaxed max-w-xl"
      >
        Choose a transparent starting plan or talk to us for bespoke custom
        software solutions.
      </motion.p>
    </div>
  );
}

function Background({ reduced }: { reduced: boolean }) {
  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 0.8,
        dur: Math.random() * 14 + 8,
        delay: Math.random() * 8,
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
            className="absolute rounded-full blur-[160px]"
            style={{
              width: 700, height: 400,
              background: "radial-gradient(ellipse, rgba(232,160,100,0.05), transparent 70%)",
              top: "5%", left: "-8%",
            }}
            animate={{ x: [0, 70, 0], y: [0, 40, 0] }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute rounded-full blur-[180px]"
            style={{
              width: 600, height: 500,
              background: "radial-gradient(ellipse, rgba(196,122,58,0.04), transparent 70%)",
              bottom: "0%", right: "-5%",
            }}
            animate={{ x: [0, -50, 0], y: [0, -35, 0] }}
            transition={{ duration: 26, repeat: Infinity, ease: "easeInOut", delay: 4 }}
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
}

function SectionSpotlight({ sectionRef }: { sectionRef: React.RefObject<HTMLElement | null> }) {
  const mx = useMotionValue(-1000);
  const my = useMotionValue(-1000);
  const sx = useSpring(mx, { stiffness: 55, damping: 18 });
  const sy = useSpring(my, { stiffness: 55, damping: 18 });

  useEffect(() => {
    let frameId: number | null = null;
    const handleMove = (e: MouseEvent) => {
      if (frameId) return;
      frameId = requestAnimationFrame(() => {
        frameId = null;
        if (!sectionRef.current) return;
        const rect = sectionRef.current.getBoundingClientRect();
        mx.set(e.clientX - rect.left);
        my.set(e.clientY - rect.top);
      });
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMove);
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

export default function PricingBanner() {
  const reduced = useReducedMotion() ?? false;
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      id="pricing-banner"
      ref={sectionRef}
      aria-labelledby="pricing-heading"
      className="relative w-full overflow-hidden py-24 sm:py-32 bg-[#0f0f0f]"
    >
      <Background reduced={reduced} />
      {!reduced && <SectionSpotlight sectionRef={sectionRef} />}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader visible={isInView} reduced={reduced} />

        <div
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 lg:gap-6 items-stretch"
          role="list"
          aria-label="Axivon Technologies pricing plans"
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

        <div className="mt-16 flex flex-wrap justify-center items-center gap-8 sm:gap-12 border-t border-[#262626] pt-8">
          {TRUST.map((t, i) => (
            <div key={i} className="flex items-center gap-2.5 text-[#a1a1aa]">
              <t.Icon className="w-5 h-5 text-[#e8a064]" strokeWidth={1.8} />
              <span className="text-sm font-semibold tracking-wide">{t.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div
        aria-hidden={true}
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0f0f0f] to-transparent"
      />
    </section>
  );
}