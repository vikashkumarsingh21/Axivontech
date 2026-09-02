"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { BadgeCheck, CheckCircle2, Quote, Rocket, Target, Award, Users } from "lucide-react";
import { Badge } from "@/components/ui";

const MESSAGE_PARAGRAPHS: string[] = [
  "Axivon Technologies was founded with a clear mission: to partner with forward-thinking businesses and build scalable, high-performance digital products.",
  "We believe technology should not be overwhelming. It should create competitive advantages, automate processes, and empower businesses to scale sustainably.",
  "Every website, app, and AI solution we craft reflects our joint commitment to engineering excellence, operational transparency, and client growth.",
];

const TRUST_INDICATORS: string[] = [
  "Engineering Excellence",
  "Client Success First",
  "Future-Ready Tech",
  "Transparent Process",
];

const LEADERSHIP_TEAM = [
  {
    name: "Vikash Kumar",
    role: "Founder & CEO",
    initials: "VK",
    badge: "Founder & CEO",
    focus: "Strategic Direction, Software Architecture & AI Innovation",
    status: "Leading Technical Vision",
    gradient: "from-[#c47a3a] via-[#e8a064] to-[#f0b07a]",
    quote: "Building purposeful digital solutions that turn ambitious ideas into market leadership.",
  },
  {
    name: "Pathan Rokhiya Khanam",
    role: "Co-Founder",
    initials: "PRK",
    badge: "Co-Founder",
    focus: "Operational Excellence, Client Experience & Business Growth",
    status: "Driving Operational Scale",
    gradient: "from-[#d4915c] via-[#e8a064] to-[#c9922a]",
    quote: "Ensuring every client engagement achieves real business results and flawless execution.",
  },
];

const EASE_PREMIUM = [0.16, 1, 0.3, 1] as const;

function CharReveal({ text, className }: { text: string; className?: string }) {
  const reduceMotion = useReducedMotion();
  const letters = useMemo(() => Array.from(text), [text]);

  if (reduceMotion) {
    return <span className={className}>{text}</span>;
  }

  return (
    <motion.span
      aria-label={text}
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.025 } } }}
    >
      {letters.map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          aria-hidden={true}
          className="inline-block"
          variants={{
            hidden: { opacity: 0, y: 18, rotateX: -40 },
            visible: {
              opacity: 1,
              y: 0,
              rotateX: 0,
              transition: { duration: 0.45, ease: EASE_PREMIUM },
            },
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.span>
  );
}

function FloatingQuoteMark() {
  const reduceMotion = useReducedMotion();
  return (
    <Quote
      aria-hidden={true}
      strokeWidth={1}
      className={`pointer-events-none absolute -left-3 -top-12 h-28 w-28 text-white/[0.03] sm:-left-6 sm:-top-14 sm:h-36 sm:w-36 ${
        reduceMotion ? "" : "[animation:float_7s_ease-in-out_infinite]"
      }`}
    />
  );
}

function MessageParagraphs() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.blockquote
      initial={reduceMotion ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.18 } } }}
      className="relative space-y-5 border-l-2 border-[#e8a064]/20 pl-6 sm:pl-8"
    >
      <FloatingQuoteMark />
      {MESSAGE_PARAGRAPHS.map((paragraph, i) => (
        <motion.p
          key={paragraph.slice(0, 16)}
          variants={{
            hidden: { opacity: 0, y: 22 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE_PREMIUM } },
          }}
          className={
            i === 0
              ? "relative text-xl font-medium leading-relaxed text-[#f4f4f5] sm:text-2xl"
              : "relative text-base leading-relaxed text-[#a1a1aa] sm:text-lg"
          }
        >
          {paragraph}
        </motion.p>
      ))}
    </motion.blockquote>
  );
}

function TrustIndicators() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.ul
      role="list"
      aria-label="Axivon Technologies trust indicators"
      initial={reduceMotion ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } } }}
      className="mt-9 flex list-none flex-wrap gap-3"
    >
      {TRUST_INDICATORS.map((label) => (
        <motion.li
          key={label}
          variants={{
            hidden: { opacity: 0, y: 14 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_PREMIUM } },
          }}
          whileHover={reduceMotion ? undefined : { y: -3 }}
          className="flex items-center gap-2 rounded-full border border-[#262626] bg-[#141414] px-4 py-2 text-sm text-[#a1a1aa] transition-all duration-300 hover:border-[#e8a064]/40 hover:bg-[#2a1f14] hover:text-[#f4f4f5]"
        >
          <CheckCircle2 className="h-4 w-4 text-[#e8a064]" strokeWidth={1.75} aria-hidden={true} />
          {label}
        </motion.li>
      ))}
    </motion.ul>
  );
}

function LeaderCard({ leader, index }: { leader: (typeof LEADERSHIP_TEAM)[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springRotateX = useSpring(rotateX, { stiffness: 150, damping: 20 });
  const springRotateY = useSpring(rotateY, { stiffness: 150, damping: 20 });

  const spotX = useMotionValue(50);
  const spotY = useMotionValue(50);
  const spotlightBackground = useMotionTemplate`radial-gradient(460px circle at ${spotX}% ${spotY}%, rgba(232,160,100,0.12), transparent 70%)`;

  const handleMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (reduceMotion || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      rotateY.set((px - 0.5) * 10);
      rotateX.set((0.5 - py) * 10);
      spotX.set(px * 100);
      spotY.set(py * 100);
    },
    [reduceMotion, rotateX, rotateY, spotX, spotY]
  );

  const handleLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
    setHovered(false);
  }, [rotateX, rotateY]);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleLeave}
      initial={reduceMotion ? false : { opacity: 0, y: 40, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: index * 0.15, ease: EASE_PREMIUM }}
      style={{
        rotateX: reduceMotion ? 0 : springRotateX,
        rotateY: reduceMotion ? 0 : springRotateY,
        transformPerspective: 1200,
      }}
      className="group relative w-full rounded-[28px] border border-[#262626] bg-[#141414] p-[1px] shadow-[0_16px_40px_rgba(0,0,0,0.5)] transition-shadow duration-500 hover:shadow-[0_20px_60px_rgba(232,160,100,0.08)]"
    >
      {/* glowing border beam */}
      <div aria-hidden={true} className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px]">
        <div className="absolute inset-[-50%] [animation:spin-cw_9s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0deg,rgba(232,160,100,0.35)_18deg,transparent_60deg)] opacity-60 transition-opacity duration-500 group-hover:opacity-0" />
        <div className="absolute inset-[-50%] [animation:spin-cw_2.5s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0deg,rgba(232,160,100,0.65)_12deg,transparent_45deg)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>

      {/* spotlight */}
      <motion.div
        aria-hidden={true}
        style={{ background: spotlightBackground }}
        className="pointer-events-none absolute inset-0 rounded-[28px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />

      <div className="relative z-10 flex h-full flex-col items-center overflow-hidden rounded-[27px] bg-[#141414]/95 px-7 py-9 text-center backdrop-blur-xl sm:px-8 sm:py-10 border border-[#262626]">
        {/* Avatar */}
        <div className="relative mb-5">
          <div
            aria-hidden={true}
            className={`absolute inset-[-12px] rounded-full bg-[radial-gradient(circle,_rgba(232,160,100,0.2),_transparent_70%)] opacity-40 blur-2xl transition-all duration-700 ${
              hovered ? "scale-125 opacity-70" : ""
            }`}
          />
          <motion.div
            animate={reduceMotion ? undefined : { scale: hovered ? [1, 1.05, 1] : 1 }}
            transition={{ duration: 1.6, repeat: hovered && !reduceMotion ? Infinity : 0, ease: "easeInOut" }}
            className={`relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br ${leader.gradient} p-[3px] sm:h-28 sm:w-28`}
          >
            <div className="flex h-full w-full items-center justify-center rounded-full bg-[#141414] text-2xl font-bold tracking-wide text-[#f4f4f5] sm:text-3xl">
              {leader.initials}
            </div>
          </motion.div>

          <motion.div
            animate={reduceMotion ? undefined : { y: [0, -4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-1 -right-1 flex items-center gap-1 rounded-full border border-[#262626] bg-[#1c1c1e] px-2 py-0.5 shadow-md"
          >
            <BadgeCheck className="h-3.5 w-3.5 text-[#e8a064]" strokeWidth={2} aria-hidden={true} />
            <span className="text-[10px] font-medium text-[#a1a1aa]">Verified</span>
          </motion.div>
        </div>

        {/* Status indicator */}
        <div className="mb-2 flex items-center gap-2 rounded-full border border-[#262626] bg-[#1c1c1e] px-3 py-1">
          <span className="relative flex h-2 w-2" aria-hidden={true}>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#e8a064] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#e8a064]" />
          </span>
          <span className="text-[11px] font-medium text-[#71717a]">{leader.status}</span>
        </div>

        <h3 className="text-2xl font-bold tracking-tight text-[#f4f4f5] sm:text-3xl">{leader.name}</h3>
        <p className="mt-1 text-sm font-semibold text-[#e8a064]">{leader.role}</p>
        <p className="mt-2 text-xs leading-relaxed text-[#a1a1aa] max-w-xs">{leader.focus}</p>

        <div aria-hidden={true} className="my-5 h-px w-full bg-gradient-to-r from-transparent via-[#262626] to-transparent" />

        <p className="italic text-xs text-[#71717a] leading-relaxed">
          &ldquo;{leader.quote}&rdquo;
        </p>
      </div>
    </motion.div>
  );
}

function AuroraBackground() {
  return (
    <div aria-hidden={true} className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute left-[-5%] top-[-10%] h-[560px] w-[560px] rounded-full bg-[#e8a064]/3 blur-[120px]" />
      <div className="absolute right-[-5%] top-[15%] h-[460px] w-[460px] rounded-full bg-[#c47a3a]/3 blur-[120px]" />
    </div>
  );
}

export default function FounderMessage() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const backgroundParallaxY = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? [0, 0] : [-50, 50]
  );

  return (
    <section
      ref={sectionRef}
      id="founder-message"
      aria-labelledby="founder-message-heading"
      className="relative isolate overflow-hidden bg-[#0f0f0f] py-24 sm:py-32"
    >
      <motion.div aria-hidden={true} style={{ y: backgroundParallaxY }} className="absolute inset-0">
        <AuroraBackground />
      </motion.div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8 2xl:max-w-[1600px]">
        {/* Header */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: EASE_PREMIUM }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mb-6 flex justify-center">
            <Badge>
              <span aria-hidden={true} className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#e8a064]" />
              <span className="ml-1.5">LEADERSHIP &amp; VISION</span>
            </Badge>
          </div>

          <h2
            id="founder-message-heading"
            className="mt-6 [perspective:1000px] text-4xl font-semibold tracking-tight text-[#f4f4f5] sm:text-5xl lg:text-6xl"
          >
            <CharReveal text="Meet The Visionaries Behind" className="block" />
            <span className="text-gradient-amber mt-1 block">Axivon Technologies</span>
          </h2>
        </motion.div>

        {/* Message + Founders cards */}
        <div className="mt-16 grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-14">
          {/* Vision Message Column */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <MessageParagraphs />
            <TrustIndicators />
          </div>

          {/* Founders Grid Column */}
          <div className="lg:col-span-7 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {LEADERSHIP_TEAM.map((leader, i) => (
              <LeaderCard key={leader.name} leader={leader} index={i} />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin-cw {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </section>
  );
}