"use client";

import { useMemo, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { Flame, Clock, MessageCircle, Database } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

/**
 * A single trending topic placeholder.
 * Mirrors the future Axivon CMS "TrendingTopic" model (id, order, name,
 * summary) so this static list can later be swapped for a live CMS query
 * with no markup changes.
 */
interface TrendingTopic {
  id: string;
  order: number;
  name: string;
  description: string;
}

/* ------------------------------------------------------------------ */
/*  Placeholder data                                                    */
/*  NOTE: no trending scores, article counts, or engagement numbers —   */
/*  the index below is a display order, not a popularity ranking.      */
/* ------------------------------------------------------------------ */

const TRENDING_TOPICS: TrendingTopic[] = [
  {
    id: "web-development",
    order: 1,
    name: "Web Development",
    description: "Frameworks, performance, and the engineering craft behind modern web products.",
  },
  {
    id: "mobile-development",
    order: 2,
    name: "Mobile Development",
    description: "Native and cross-platform approaches for building polished mobile experiences.",
  },
  {
    id: "artificial-intelligence",
    order: 3,
    name: "Artificial Intelligence",
    description: "Applied AI, machine learning, and the tools reshaping how software gets built.",
  },
  {
    id: "cloud-computing",
    order: 4,
    name: "Cloud Computing",
    description: "Infrastructure, scalability, and the architecture behind resilient systems.",
  },
  {
    id: "ui-ux-design",
    order: 5,
    name: "UI/UX Design",
    description: "Design systems, interaction craft, and the thinking behind intuitive products.",
  },
  {
    id: "seo-marketing",
    order: 6,
    name: "SEO & Marketing",
    description: "Search strategy, content discovery, and growth for technology brands.",
  },
  {
    id: "startups-business",
    order: 7,
    name: "Startups & Business",
    description: "Founder perspectives and the decisions behind building lasting companies.",
  },
  {
    id: "automation",
    order: 8,
    name: "Automation",
    description: "Workflows and tooling that quietly remove friction from everyday work.",
  },
];

/** Tiny vertical stagger applied only at the ultra-wide (4-column) breakpoint,
 *  where the column cycle actually lines the offsets up cleanly. At 3 columns
 *  the same pattern would look accidental, so it's intentionally left flat
 *  there. */
const FLOAT_OFFSET_CLASS = [
  "",
  "2xl:-translate-y-2.5",
  "2xl:translate-y-1",
  "2xl:-translate-y-2.5",
];

/* ------------------------------------------------------------------ */
/*  Deterministic pseudo-random helper                                 */
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
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
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
/*  Topic card                                                         */
/* ------------------------------------------------------------------ */

function TopicCard({ topic, index }: { topic: TrendingTopic; index: number }) {
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
      className={`group relative [perspective:1100px] ${FLOAT_OFFSET_CLASS[index % 4]}`}
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
                  duration: 7.5 + (index % 4) * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.3,
                },
              }
        }
        whileHover={
          prefersReducedMotion
            ? undefined
            : { y: -9, transition: { type: "spring", stiffness: 260, damping: 22 } }
        }
        style={{
          rotateX: springRotateX,
          rotateY: springRotateY,
          transformStyle: "preserve-3d",
        }}
        tabIndex={0}
        role="group"
        aria-label={`${topic.name} — topic coming soon`}
        className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_10px_40px_-22px_rgba(0,0,0,0.7)] backdrop-blur-xl outline-none transition-all duration-300 hover:border-white/15 hover:shadow-[0_24px_55px_-18px_rgba(0,0,0,0.75),0_0_0_1px_rgba(124,58,237,0.10),0_0_30px_-14px_rgba(0,212,255,0.12)] focus-visible:ring-2 focus-visible:ring-[#00D4FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050816] sm:p-7"
      >
        {/* unified mouse-spotlight + subtle holographic sheen — one quiet layer */}
        <span
          className="holo-sheen"
          aria-hidden={true}
          style={{
            background:
              "radial-gradient(220px circle at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,0.14), rgba(0,212,255,0.08) 38%, rgba(124,58,237,0.08) 62%, transparent 78%)",
          }}
        />

        {/* large faint order numeral — a quiet editorial device, not a rank */}
        <span className="numeral-watermark" aria-hidden={true}>
          {String(topic.order).padStart(2, "0")}
        </span>

        <div className="relative z-10 flex h-full flex-col" style={{ transform: "translateZ(18px)" }}>
          <div className="mb-5 flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-white/55">
              <Clock className="h-3 w-3" aria-hidden={true} />
              Coming Soon
            </span>
          </div>

          <h3 className="mb-2 text-lg font-semibold tracking-tight text-white">{topic.name}</h3>

          <p className="mb-6 flex-1 text-sm leading-relaxed text-white/55">{topic.description}</p>

          <div className="flex items-center gap-2 border-t border-white/[0.07] pt-4 text-xs font-medium tracking-wide text-white/40">
            <MessageCircle className="h-3.5 w-3.5" aria-hidden={true} />
            Future Discussions
          </div>
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
      Array.from({ length: 13 }).map((_, i) => ({
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

      {/* aurora — corner-only, barely visible */}
      <div
        className="aurora-blob"
        style={{
          top: "-26%",
          right: "-18%",
          width: 540,
          height: 540,
          background: "radial-gradient(circle, #7C3AED, transparent 70%)",
          animationDuration: "33s",
        }}
      />
      <div
        className="aurora-blob"
        style={{
          bottom: "-30%",
          left: "-18%",
          width: 560,
          height: 560,
          background: "radial-gradient(circle, #00D4FF, transparent 70%)",
          animationDuration: "37s",
          animationDelay: "-15s",
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

export default function TrendingTopics() {
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
      aria-labelledby="trending-topics-heading"
      className="relative isolate overflow-hidden bg-[#050816] py-24 sm:py-28 lg:py-32"
    >
      <BackgroundAtmosphere />

      {/* mouse-follow spotlight, intentionally faint */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          opacity: isHovering ? 1 : 0,
          background:
            "radial-gradient(560px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), rgba(0,212,255,0.045), transparent 45%)",
        }}
        aria-hidden={true}
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
            <Flame className="h-3.5 w-3.5" aria-hidden={true} />
            Trending Topics
          </span>

          <h2
            id="trending-topics-heading"
            className="gradient-text mt-6 text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl"
          >
            <span className="block">Future Topics</span>
            <span className="block">Worth Following</span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/55 sm:text-lg">
            Future technology discussions, software trends, startup insights, cloud
            innovations, AI breakthroughs, and digital transformation topics will appear
            here.
          </p>
        </motion.div>

        {/* topic grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={containerVariants}
          role="list"
          aria-label="Trending topics"
          className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 2xl:grid-cols-4 2xl:gap-7"
        >
          {TRENDING_TOPICS.map((topic, index) => (
            <TopicCard key={topic.id} topic={topic} index={index} />
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
            <Database className="h-4 w-4 text-[#7C3AED]" aria-hidden={true} />
            <p className="text-xs text-white/50 sm:text-sm">
              Trending topics will be managed dynamically through the{" "}
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

        .holo-sheen {
          position: absolute;
          inset: 0;
          opacity: 0;
          mix-blend-mode: overlay;
          transition: opacity 0.5s ease;
          pointer-events: none;
        }

        .group:hover .holo-sheen,
        .group:focus-within .holo-sheen {
          opacity: 1;
        }

        .numeral-watermark {
          position: absolute;
          right: -0.25rem;
          bottom: -1.1rem;
          z-index: 0;
          font-size: 6rem;
          line-height: 1;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: rgba(255, 255, 255, 0.04);
          pointer-events: none;
          user-select: none;
          transition: color 0.4s ease, transform 0.4s ease;
        }

        .group:hover .numeral-watermark,
        .group:focus-within .numeral-watermark {
          color: rgba(255, 255, 255, 0.07);
          transform: translateY(-4px);
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
            transform: translate(-32px, -24px) scale(1.08);
          }
          66% {
            transform: translate(24px, 18px) scale(0.96);
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

        @media (prefers-reduced-motion: reduce) {
          .gradient-text,
          .aurora-blob,
          .drift-particle,
          .numeral-watermark {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </section>
  );
}