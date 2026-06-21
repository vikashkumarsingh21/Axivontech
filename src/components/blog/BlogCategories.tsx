"use client";

import { useMemo, useRef, useState, type ComponentType } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import {
  Code2,
  Smartphone,
  Brain,
  Cloud,
  Palette,
  TrendingUp,
  Rocket,
  Bot,
  Sparkles,
  Clock,
  ArrowUpRight,
  Database,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

/**
 * Shape of a single blog category.
 * Designed to map 1:1 onto the future Axivon CMS "BlogCategory" model
 * (id, slug, name, description, icon key) so this component can be
 * swapped from static data to a CMS fetch with no markup changes.
 */
interface BlogCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number; "aria-hidden"?: boolean }>;
}

/* ------------------------------------------------------------------ */
/*  Static placeholder data                                            */
/*  NOTE: No article counts, reader counts, or popularity metrics.     */
/*  These will be sourced live from the Axivon CMS once content exists.*/
/* ------------------------------------------------------------------ */

const BLOG_CATEGORIES: BlogCategory[] = [
  {
    id: "web-development",
    slug: "web-development",
    name: "Web Development",
    description:
      "Modern frameworks, performance patterns, and the engineering behind fast, scalable web experiences.",
    icon: Code2,
  },
  {
    id: "mobile-development",
    slug: "mobile-development",
    name: "Mobile Development",
    description:
      "Native and cross-platform strategies for building mobile products people love to use.",
    icon: Smartphone,
  },
  {
    id: "artificial-intelligence",
    slug: "artificial-intelligence",
    name: "Artificial Intelligence",
    description:
      "Practical AI, machine learning, and intelligent automation shaping the next era of software.",
    icon: Brain,
  },
  {
    id: "cloud-computing",
    slug: "cloud-computing",
    name: "Cloud Computing",
    description:
      "Infrastructure, scalability, and architecture patterns for resilient cloud-native systems.",
    icon: Cloud,
  },
  {
    id: "ui-ux-design",
    slug: "ui-ux-design",
    name: "UI/UX Design",
    description:
      "Design systems, interaction patterns, and the craft behind intuitive digital products.",
    icon: Palette,
  },
  {
    id: "seo-marketing",
    slug: "seo-marketing",
    name: "SEO & Marketing",
    description:
      "Search visibility, growth strategy, and digital marketing built for technology brands.",
    icon: TrendingUp,
  },
  {
    id: "startups-business",
    slug: "startups-business",
    name: "Startups & Business",
    description:
      "Founder insights, product strategy, and lessons from building technology ventures.",
    icon: Rocket,
  },
  {
    id: "automation-productivity",
    slug: "automation-productivity",
    name: "Automation & Productivity",
    description:
      "Workflows, tooling, and automation that help teams build and ship faster.",
    icon: Bot,
  },
];

/* ------------------------------------------------------------------ */
/*  Deterministic pseudo-random helper                                 */
/*  (avoids Math.random hydration mismatches between server/client)    */
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
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

/* ------------------------------------------------------------------ */
/*  Category card                                                      */
/* ------------------------------------------------------------------ */

function CategoryCard({ category }: { category: BlogCategory }) {
  const prefersReducedMotion = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springRotateX = useSpring(rotateX, { stiffness: 180, damping: 20, mass: 0.5 });
  const springRotateY = useSpring(rotateY, { stiffness: 180, damping: 20, mass: 0.5 });

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    if (prefersReducedMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const relX = event.clientX - rect.left;
    const relY = event.clientY - rect.top;
    const px = relX / rect.width - 0.5;
    const py = relY / rect.height - 0.5;

    rotateY.set(px * 12);
    rotateX.set(py * -12);
    cardRef.current.style.setProperty("--mx", `${relX}px`);
    cardRef.current.style.setProperty("--my", `${relY}px`);
  }

  function handleMouseLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  const Icon = category.icon;

  return (
    <motion.div
      variants={cardVariants}
      role="listitem"
      className="group relative [perspective:1200px]"
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        whileHover={prefersReducedMotion ? undefined : { y: -8 }}
        transition={{ type: "spring", stiffness: 280, damping: 22 }}
        style={{
          rotateX: springRotateX,
          rotateY: springRotateY,
          transformStyle: "preserve-3d",
        }}
        tabIndex={0}
        role="group"
        aria-label={`${category.name} — category coming soon`}
        className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_10px_40px_-22px_rgba(0,0,0,0.7)] backdrop-blur-xl outline-none transition-all duration-300 hover:border-white/20 hover:shadow-[0_24px_60px_-20px_rgba(0,0,0,0.75),0_0_0_1px_rgba(0,212,255,0.07),0_0_36px_-14px_rgba(124,58,237,0.12)] focus-visible:ring-2 focus-visible:ring-[#00D4FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050816] sm:p-7"
      >
        {/* rotating gradient border beam, revealed on hover/focus */}
        <span className="card-beam" aria-hidden="true" />

        {/* mouse-follow glow inside the card */}
        <span
          className="card-glow"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(150px circle at var(--mx, 50%) var(--my, 50%), rgba(0,212,255,0.09), transparent 72%)",
          }}
        />

        <div className="relative z-10 flex h-full flex-col" style={{ transform: "translateZ(28px)" }}>
          <div className="mb-5 flex items-start justify-between gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-[#2563EB]/20 via-[#7C3AED]/20 to-[#00D4FF]/20 transition-transform duration-300 group-hover:scale-110">
              <Icon className="h-6 w-6 text-[#00D4FF]" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-white/55">
              <Clock className="h-3 w-3" aria-hidden="true" />
              Coming Soon
            </span>
          </div>

          <h3 className="mb-2 text-lg font-semibold tracking-tight text-white">
            {category.name}
          </h3>

          <p className="mb-6 flex-grow text-sm leading-relaxed text-white/55">
            {category.description}
          </p>

          <div className="flex items-center justify-between border-t border-white/[0.07] pt-4">
            <span className="text-xs font-medium tracking-wide text-white/40">
              Future Articles
            </span>
            <ArrowUpRight
              className="h-4 w-4 text-white/30 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#00D4FF]"
              aria-hidden="true"
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Background atmosphere (aurora, orbs, particles, grid, noise)       */
/* ------------------------------------------------------------------ */

function BackgroundAtmosphere() {
  const particles = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => ({
        id: i,
        left: seededRandom(i + 1) * 100,
        top: seededRandom(i + 50) * 100,
        size: 1.5 + seededRandom(i + 100) * 1.5,
        duration: 18 + seededRandom(i + 200) * 12,
        delay: seededRandom(i + 300) * 10,
      })),
    []
  );

  const orbs = [
    { top: "14%", left: "9%", size: 4, color: "#00D4FF", duration: 13, delay: 0 },
    { top: "26%", left: "91%", size: 5, color: "#7C3AED", duration: 15, delay: 1.6 },
    { top: "72%", left: "6%", size: 4, color: "#2563EB", duration: 12, delay: 2.8 },
    { top: "82%", left: "93%", size: 4, color: "#00D4FF", duration: 16, delay: 0.9 },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* base tonal gradient — depth without brightness */}
      <div className="depth-gradient absolute inset-0" />

      {/* aurora — pulled into the far corners, barely-there opacity, edge-only bleed */}
      <div
        className="aurora-blob"
        style={{
          top: "-24%",
          left: "-20%",
          width: 560,
          height: 560,
          background: "radial-gradient(circle, #2563EB, transparent 70%)",
          animationDuration: "30s",
        }}
      />
      <div
        className="aurora-blob"
        style={{
          bottom: "-28%",
          right: "-20%",
          width: 600,
          height: 600,
          background: "radial-gradient(circle, #7C3AED, transparent 70%)",
          animationDuration: "34s",
          animationDelay: "-12s",
        }}
      />

      {/* professional lighting: top spotlight + soft side lighting */}
      <div className="top-spotlight absolute inset-0" />
      <div className="side-light side-light-left absolute inset-y-0 left-0" />
      <div className="side-light side-light-right absolute inset-y-0 right-0" />

      {/* tiny floating orbs — restrained, never large or glowing */}
      {orbs.map((orb, i) => (
        <span
          key={i}
          className="floating-orb"
          style={{
            top: orb.top,
            left: orb.left,
            width: orb.size,
            height: orb.size,
            background: orb.color,
            boxShadow: `0 0 8px 1.5px ${orb.color}40`,
            animationDuration: `${orb.duration}s`,
            animationDelay: `${orb.delay}s`,
          }}
        />
      ))}

      {/* drifting particles */}
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

      {/* premium perspective grid floor, kept under 10% opacity */}
      <div className="perspective-grid absolute inset-x-0 bottom-0 h-[320px]" />

      {/* noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* cinematic vignette — darkens the edges, keeps the eye on the cards */}
      <div className="vignette absolute inset-0" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main export                                                        */
/* ------------------------------------------------------------------ */

export default function BlogCategories() {
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
      aria-labelledby="blog-categories-heading"
      className="relative isolate overflow-hidden bg-[#050816] py-24 sm:py-28 lg:py-32"
    >
      <BackgroundAtmosphere />

      {/* mouse-follow spotlight */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          opacity: isHovering ? 1 : 0,
          background:
            "radial-gradient(600px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), rgba(0,212,255,0.05), transparent 45%)",
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
            Blog Categories
          </span>

          <h2
            id="blog-categories-heading"
            className="mt-6 text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            <span className="gradient-text block">Explore Topics</span>
            <span className="block">
              That <span className="gradient-text">Matter</span>
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/55 sm:text-lg">
            Browse future content categories covering technology, innovation, software
            development, artificial intelligence, startups, cloud computing, and digital
            growth.
          </p>
        </motion.div>

        {/* category grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={containerVariants}
          role="list"
          aria-label="Blog categories"
          className="mt-16 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 lg:gap-6 xl:gap-8"
        >
          {BLOG_CATEGORIES.map((category) => (
            <CategoryCard key={category.id} category={category} />
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
              Categories will be managed dynamically through the{" "}
              <span className="font-medium text-white/75">Axivon CMS</span>.
            </p>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        .gradient-text {
          background-image: linear-gradient(
            90deg,
            #2563eb,
            #7c3aed,
            #00d4ff,
            #7c3aed,
            #2563eb
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: gradient-shift 6s linear infinite;
        }

        .depth-gradient {
          background: linear-gradient(180deg, #070b1d 0%, #050816 45%, #04060f 100%);
        }

        .aurora-blob {
          position: absolute;
          border-radius: 9999px;
          filter: blur(130px);
          opacity: 0.1;
          animation-name: aurora-float;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }

        .top-spotlight {
          background: radial-gradient(60% 45% at 50% -5%, rgba(148, 178, 255, 0.06), transparent 70%);
        }

        .side-light {
          width: 26%;
        }

        .side-light-left {
          background: linear-gradient(90deg, rgba(124, 58, 237, 0.045), transparent);
        }

        .side-light-right {
          background: linear-gradient(270deg, rgba(0, 212, 255, 0.045), transparent);
        }

        .vignette {
          background: radial-gradient(120% 100% at 50% 45%, transparent 50%, rgba(4, 6, 15, 0.92) 100%);
        }

        .floating-orb {
          position: absolute;
          border-radius: 9999px;
          filter: blur(0.5px);
          animation-name: orb-drift;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }

        .drift-particle {
          position: absolute;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.22);
          animation-name: particle-rise;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        .perspective-grid {
          background-image: linear-gradient(rgba(120, 140, 190, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(120, 140, 190, 0.08) 1px, transparent 1px);
          background-size: 48px 48px;
          transform: perspective(500px) rotateX(60deg);
          transform-origin: bottom;
          -webkit-mask-image: linear-gradient(to top, black, transparent 75%);
          mask-image: linear-gradient(to top, black, transparent 75%);
        }

        .card-beam {
          position: absolute;
          inset: -1px;
          border-radius: inherit;
          padding: 1px;
          background-image: conic-gradient(
            from 0deg,
            transparent 0%,
            rgba(0, 212, 255, 0.6) 7%,
            transparent 18%,
            transparent 100%
          );
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.4s ease;
          pointer-events: none;
        }

        .group:hover .card-beam,
        .group:focus-within .card-beam {
          opacity: 1;
          animation: beam-spin 3.5s linear infinite;
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

        @keyframes gradient-shift {
          to {
            background-position: 200% center;
          }
        }

        @keyframes aurora-float {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(40px, -30px) scale(1.1);
          }
          66% {
            transform: translate(-30px, 20px) scale(0.95);
          }
        }

        @keyframes orb-drift {
          0%,
          100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(14px, -22px);
          }
        }

        @keyframes particle-rise {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          90% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(-130px) translateX(18px);
            opacity: 0;
          }
        }

        @keyframes beam-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .gradient-text,
          .aurora-blob,
          .floating-orb,
          .drift-particle,
          .card-beam {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}