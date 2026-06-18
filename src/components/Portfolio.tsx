"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Globe, Sprout, Waves, Radar, ArrowUpRight, type LucideIcon } from "lucide-react";

interface Project {
  title: string;
  category: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
}

const PROJECTS: Project[] = [
  {
    title: "Nanitagath Website",
    category: "Business Website",
    description:
      "Professional website designed for business growth and online presence.",
    icon: Globe,
    gradient: "from-[#2563EB] via-[#1d4ed8] to-[#00D4FF]",
  },
  {
    title: "Krishi Drishti",
    category: "Smart Agriculture Platform",
    description:
      "AI-powered irrigation and agriculture monitoring solution.",
    icon: Sprout,
    gradient: "from-emerald-500/70 via-[#2563EB]/60 to-[#7C3AED]/70",
  },
  {
    title: "JalMitra",
    category: "Environmental Innovation",
    description:
      "Autonomous water-cleaning system for rivers and lakes.",
    icon: Waves,
    gradient: "from-cyan-400/80 via-[#2563EB]/70 to-[#7C3AED]/60",
  },
  {
    title: "IoT Monitoring System",
    category: "IoT Dashboard",
    description:
      "Real-time monitoring and analytics platform for smart devices.",
    icon: Radar,
    gradient: "from-[#7C3AED] via-[#6d28d9] to-[#2563EB]",
  },
];

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const gridVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

export default function Portfolio() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-[#050816] py-24 sm:py-32">
      {/* Floating gradient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          aria-hidden
          className="absolute -left-32 top-20 h-[28rem] w-[28rem] rounded-full bg-[#2563EB]/20 blur-[120px]"
          animate={shouldReduceMotion ? undefined : { x: [0, 30, 0], y: [0, 25, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="absolute -right-24 bottom-10 h-[26rem] w-[26rem] rounded-full bg-[#7C3AED]/20 blur-[130px]"
          animate={shouldReduceMotion ? undefined : { x: [0, -25, 0], y: [0, -20, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        {/* Section header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={headerVariants}
          className="mx-auto mb-16 max-w-2xl text-center sm:mb-20"
        >
          <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-[0.25em] text-[#00D4FF]">
            Our Work
          </span>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Featured{" "}
            <span className="bg-gradient-to-r from-[#2563EB] via-[#7C3AED] to-[#00D4FF] bg-clip-text text-transparent">
              Projects
            </span>
          </h2>
          <p className="mt-5 text-balance text-base leading-relaxed text-slate-400 sm:text-lg">
            A showcase of innovative digital solutions built by Axivon
            Technologies.
          </p>
        </motion.div>

        {/* Project cards */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={gridVariants}
          className="grid grid-cols-1 gap-8 lg:grid-cols-2"
        >
          {PROJECTS.map((project) => {
            const Icon = project.icon;
            return (
              <motion.div
                key={project.title}
                variants={cardVariants}
                whileHover={shouldReduceMotion ? undefined : { y: -6 }}
                transition={{ type: "spring", stiffness: 280, damping: 22 }}
                className="group relative"
              >
                {/* Glow / gradient border layer */}
                <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-[#2563EB] via-[#7C3AED] to-[#00D4FF] opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-70" />

                {/* Card body */}
                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl transition-colors duration-500 group-hover:border-transparent">
                  {/* Image placeholder area */}
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${project.gradient} transition-transform duration-700 ease-out group-hover:scale-110`}
                    />
                    <div className="absolute inset-0 bg-[#050816]/35" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Icon
                        className="h-16 w-16 text-white/40 transition-transform duration-700 ease-out group-hover:scale-110 group-hover:text-white/60"
                        strokeWidth={1.2}
                      />
                    </div>
                    <span className="absolute left-4 top-4 rounded-full border border-white/20 bg-[#050816]/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#00D4FF] backdrop-blur-md">
                      {project.category}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-7 sm:p-8">
                    <h3 className="mb-3 text-xl font-semibold text-white">
                      {project.title}
                    </h3>
                    <p className="mb-6 text-sm leading-relaxed text-slate-400">
                      {project.description}
                    </p>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 text-sm font-medium text-[#00D4FF] transition-all duration-300 hover:gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050816] rounded-sm"
                    >
                      View Project
                      <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}