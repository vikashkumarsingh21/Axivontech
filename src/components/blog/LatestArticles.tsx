"use client";

import { useMemo, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import {
  Sparkles,
  Image as ImageIcon,
  ArrowUpRight,
  Database,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

/**
 * A single reserved article slot.
 * Mirrors the future Axivon CMS "Article" model (id, slot order, title,
 * excerpt) closely enough that swapping this static list for a CMS fetch
 * later requires no markup changes — only a different data source.
 */
interface ArticleSlot {
  id: string;
  slot: number;
  title: string;
  description: string;
}

/* ------------------------------------------------------------------ */
/*  Placeholder data                                                    */
/*  NOTE: no fake authors, dates, view counts, or comments — every card */
/*  is an honest, identical "reserved slot" until the CMS goes live.    */
/* ------------------------------------------------------------------ */

const ARTICLE_SLOTS: ArticleSlot[] = Array.from({ length: 6 }, (_, i) => ({
  id: `article-slot-${i + 1}`,
  slot: i + 1,
  title: "Future Article",
  description:
    "This content area is reserved for future articles managed through the Axivon CMS.",
}));

/** Small, deterministic vertical offsets so the grid reads as gently
 *  "floating" rather than a rigid checkerboard — applied only at the
 *  desktop breakpoint, cycling by column. */
const FLOAT_OFFSET_CLASS = ["", "lg:-translate-y-2.5", ""];

/* ------------------------------------------------------------------ */
/*  Deterministic pseudo-random helper                                 */
/*  (keeps particle layout identical between server and client render) */
/* ------------------------------------------------------------------ */

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.09, delayChildren: 0.1 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 26 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

/* ------------------------------------------------------------------ */
/*  Article card                                                       */
/* ------------------------------------------------------------------ */

function ArticleCard({ article, index }: { article: ArticleSlot; index: number }) {
  const prefersReducedMotion = useReducedMotion();
  const cardRef = useRef<HTMLElement>(null);

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springRotateX = useSpring(rotateX, { stiffness: 170, damping: 22, mass: 0.6 });
  const springRotateY = useSpring(rotateY, { stiffness: 170, damping: 22, mass: 0.6 });

  function handleMouseMove(event: React.MouseEvent<HTMLElement>) {
    if (prefersReducedMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const relX = event.clientX - rect.left;
    const relY = event.clientY - rect.top;
    const px = relX / rect.width - 0.5;
    const py = relY / rect.height - 0.5;

    // Deliberately gentle — a hint of depth, not a gimmick.
    rotateY.set(px * 7);
    rotateX.set(py * -7);
    cardRef.current.style.setProperty("--mx", `${relX}px`);
    cardRef.current.style.setProperty("--my", `${relY}px`);
  }

  function handleMouseLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <motion.div
      variants={cardVariants}
      role="listitem"
      className={`group relative [perspective:1100px] ${FLOAT_OFFSET_CLASS[index % 3]}`}
    >
      <motion.article
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        animate={prefersReducedMotion ? undefined : { y: [0, -5, 0] }}
        transition={
          prefersReducedMotion
            ? undefined
            : {
                y: {
                  duration: 7 + (index % 4) * 0.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.35,
                },
              }
        }
        whileHover={
          prefersReducedMotion
            ? undefined
            : { y: -10, transition: { type: "spring", stiffness: 260, damping: 22 } }
        }
        style={{
          rotateX: springRotateX,
          rotateY: springRotateY,
          transformStyle: "preserve-3d",
        }}
        aria-label={`Article slot ${article.slot}`}
        className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-[0_10px_40px_-22px_rgba(0,0,0,0.7)] backdrop-blur-xl transition-all duration-300 hover:border-white/15 hover:shadow-[0_24px_55px_-18px_rgba(0,0,0,0.75),0_0_0_1px_rgba(37,99,235,0.12)] focus-within:border-white/15"
      >
        {/* top edge highlight — light "catching" the card, no spin, no glow ring */}
        <span className="card-edge-highlight" aria-hidden="true" />

        {/* quiet mouse-follow sheen */}
        <span
          className="card-glow"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(140px circle at var(--mx, 50%) var(--my, 50%), rgba(96,165,250,0.07), transparent 75%)",
          }}
        />

        {/* placeholder image area */}
        <div
          className="relative aspect-[16/10] shrink-0 overflow-hidden border-b border-white/[0.06]"
          style={{ transform: "translateZ(18px)" }}
        >
          <div className="image-placeholder absolute inset-0" />
          <ImageIcon
            className="absolute inset-0 m-auto h-7 w-7 text-white/15"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-[#050816]/70 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-white/60 backdrop-blur-md">
            <span className="status-dot h-1.5 w-1.5 rounded-full bg-[#00D4FF]" aria-hidden="true" />
            Coming Soon
          </span>
        </div>

        <div
          className="relative z-10 flex flex-1 flex-col p-6"
          style={{ transform: "translateZ(18px)" }}
        >
          <span className="mb-3 text-[11px] font-medium uppercase tracking-[0.18em] text-white/35">
            Article Slot {String(article.slot).padStart(2, "0")}
          </span>

          <h3 className="mb-2 text-lg font-semibold tracking-tight text-white">
            {article.title}
          </h3>

          <p className="mb-6 flex-1 text-sm leading-relaxed text-white/55">
            {article.description}
          </p>

          <button
            type="button"
            aria-disabled="true"
            aria-label={`Article slot ${article.slot} — available soon`}
            onClick={(event) => event.preventDefault()}
            className="inline-flex w-fit cursor-not-allowed items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium text-white/60 outline-none transition-colors duration-300 hover:border-white/20 hover:text-white/80 focus-visible:ring-2 focus-visible:ring-[#00D4FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050816]"
          >
            Available Soon
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </motion.article>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Background atmosphere — quiet by design                            */
/* ------------------------------------------------------------------ */

function BackgroundAtmosphere() {
  const particles = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => ({
        id: i,
        left: seededRandom(i + 1) * 100,
        top: seededRandom(i + 50) * 100,
        size: 1.5 + seededRandom(i + 100) * 1.5,
        duration: 19 + seededRandom(i + 200) * 12,
        delay: seededRandom(i + 300) * 10,
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* base tonal gradient — depth without brightness */}
      <div className="depth-gradient absolute inset-0" />

      {/* aurora — corner-only, barely visible, never a centerpiece */}
      <div
        className="aurora-blob"
        style={{
          top: "-26%",
          left: "-18%",
          width: 520,
          height: 520,
          background: "radial-gradient(circle, #2563EB, transparent 70%)",
          animationDuration: "32s",
        }}
      />
      <div
        className="aurora-blob"
        style={{
          bottom: "-30%",
          right: "-18%",
          width: 560,
          height: 560,
          background: "radial-gradient(circle, #7C3AED, transparent 70%)",
          animationDuration: "36s",
          animationDelay: "-14s",
        }}
      />

      {/* professional lighting */}
      <div className="top-spotlight absolute inset-0" />
      <div className="side-light side-light-left absolute inset-y-0 left-0" />
      <div className="side-light side-light-right absolute inset-y-0 right-0" />

      {/* tiny drifting particles */}
      {particles.map((p) => (
        <span
          key={p.id}
          className="drift-particle"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      {/* perspective grid floor, opacity baked under 10% */}
      <div className="perspective-grid absolute inset-x-0 bottom-0 h-[300px]" />

      {/* dark cinematic vignette */}
      <div className="vignette absolute inset-0" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main export                                                        */
/* ------------------------------------------------------------------ */

export default function LatestArticles() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  function handleSectionMouseMove(event: React.MouseEvent<HTMLElement>) {
    if (prefersReducedMotion || !sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    sectionRef.current.style.setProperty("--spotlight-x", `${x}%`);
    sectionRef.current.style.setProperty("--spotlight-y", `${y}%`);
  }

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleSectionMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      aria-labelledby="latest-articles-heading"
      className="relative isolate overflow-hidden bg-[#050816] py-24 sm:py-28 lg:py-32"
    >
      <BackgroundAtmosphere />

      {/* mouse-follow spotlight, intentionally faint */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          opacity: isHovering ? 1 : 0,
          background:
            "radial-gradient(560px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), rgba(37,99,235,0.045), transparent 45%)",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#00D4FF] backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Latest Articles
          </span>

          <h2
            id="latest-articles-heading"
            className="gradient-text mt-6 text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl"
          >
            <span className="block">Insights Worth</span>
            <span className="block">Reading</span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/55 sm:text-lg">
            Technology insights, development guides, startup lessons, AI innovations,
            cloud computing strategies, and digital transformation content will be
            published here soon.
          </p>
        </motion.div>

        {/* article grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={containerVariants}
          role="list"
          aria-label="Latest articles"
          className="mt-16 grid grid-cols-1 gap-6 sm:gap-7 md:grid-cols-2 lg:grid-cols-3 lg:gap-8"
        >
          {ARTICLE_SLOTS.map((article, index) => (
            <ArticleCard key={article.id} article={article} index={index} />
          ))}
        </motion.div>

        {/* CMS footer note */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mt-16 flex justify-center"
        >
          <div className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 backdrop-blur-md">
            <Database className="h-4 w-4 text-[#7C3AED]" aria-hidden="true" />
            <p className="text-xs text-white/50 sm:text-sm">
              Latest articles will be managed dynamically through the{" "}
              <span className="font-medium text-white/75">Axivon CMS</span>.
            </p>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        .gradient-text {
          background-image: linear-gradient(
            90deg,
            #ffffff 0%,
            #93c5fd 18%,
            #2563eb 38%,
            #7c3aed 58%,
            #00d4ff 78%,
            #ffffff 100%
          );
          background-size: 220% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: gradient-shift 9s ease-in-out infinite alternate;
        }

        .depth-gradient {
          background: linear-gradient(180deg, #070b1d 0%, #050816 45%, #04060f 100%);
        }

        .aurora-blob {
          position: absolute;
          border-radius: 9999px;
          filter: blur(130px);
          opacity: 0.09;
          animation-name: aurora-float;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }

        .top-spotlight {
          background: radial-gradient(60% 45% at 50% -5%, rgba(148, 178, 255, 0.05), transparent 70%);
        }

        .side-light {
          width: 24%;
        }

        .side-light-left {
          background: linear-gradient(90deg, rgba(124, 58, 237, 0.04), transparent);
        }

        .side-light-right {
          background: linear-gradient(270deg, rgba(0, 212, 255, 0.04), transparent);
        }

        .drift-particle {
          position: absolute;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.2);
          animation-name: particle-rise;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        .perspective-grid {
          background-image: linear-gradient(rgba(120, 140, 190, 0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(120, 140, 190, 0.07) 1px, transparent 1px);
          background-size: 46px 46px;
          transform: perspective(500px) rotateX(60deg);
          transform-origin: bottom;
          -webkit-mask-image: linear-gradient(to top, black, transparent 75%);
          mask-image: linear-gradient(to top, black, transparent 75%);
        }

        .vignette {
          background: radial-gradient(120% 100% at 50% 45%, transparent 50%, rgba(4, 6, 15, 0.92) 100%);
        }

        .card-edge-highlight {
          position: absolute;
          top: 0;
          left: 8%;
          right: 8%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.45), transparent);
          opacity: 0;
          transition: opacity 0.4s ease;
          pointer-events: none;
        }

        .group:hover .card-edge-highlight,
        .group:focus-within .card-edge-highlight {
          opacity: 1;
        }

        .card-glow {
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 0.4s ease;
          pointer-events: none;
        }

        .group:hover .card-glow,
        .group:focus-within .card-glow {
          opacity: 1;
        }

        .image-placeholder {
          background-color: rgba(255, 255, 255, 0.015);
          background-image: repeating-linear-gradient(
              135deg,
              rgba(255, 255, 255, 0.025) 0px,
              rgba(255, 255, 255, 0.025) 1px,
              transparent 1px,
              transparent 14px
            ),
            radial-gradient(120% 120% at 50% 0%, rgba(37, 99, 235, 0.08), transparent 60%);
        }

        .status-dot {
          animation: pulse-dot 2.4s ease-in-out infinite alternate;
        }

        @keyframes gradient-shift {
          to {
            background-position: 100% center;
          }
        }

        @keyframes aurora-float {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(36px, -26px) scale(1.08);
          }
          66% {
            transform: translate(-26px, 18px) scale(0.96);
          }
        }

        @keyframes particle-rise {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.7;
          }
          90% {
            opacity: 0.7;
          }
          100% {
            transform: translateY(-120px) translateX(16px);
            opacity: 0;
          }
        }

        @keyframes pulse-dot {
          from {
            opacity: 0.45;
          }
          to {
            opacity: 1;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .gradient-text,
          .aurora-blob,
          .drift-particle,
          .status-dot {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}