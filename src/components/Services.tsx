"use client";

import { useReducedMotion, motion, type Variants } from "framer-motion";
import {
  Code2,
  ShoppingCart,
  Smartphone,
  Search,
  PenTool,
  Megaphone,
  Palette,
  Video,
  Terminal,
  BrainCircuit,
  Bot,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

interface Service {
  icon: LucideIcon;
  title: string;
  description: string;
}

const SERVICES: Service[] = [
  {
    icon: Code2,
    title: "Web Development",
    description:
      "Custom, high-performance websites built with modern frameworks — fast, secure, and engineered to convert visitors into customers.",
  },
  {
    icon: ShoppingCart,
    title: "E-Commerce Development",
    description:
      "Scalable online stores with seamless checkout flows, payment integrations, and inventory systems built for growth.",
  },
  {
    icon: Smartphone,
    title: "Mobile App Development",
    description:
      "Native and cross-platform apps for iOS and Android, designed for speed, stability, and a polished user experience.",
  },
  {
    icon: Search,
    title: "SEO & SEM",
    description:
      "Data-driven search strategies that improve rankings, drive qualified traffic, and maximize return on ad spend.",
  },
  {
    icon: PenTool,
    title: "UI/UX Design",
    description:
      "Intuitive, research-backed interfaces that balance aesthetics with usability across every screen and device.",
  },
  {
    icon: Megaphone,
    title: "Digital Marketing",
    description:
      "Integrated campaigns across search, social, and email that build brand presence and generate measurable demand.",
  },
  {
    icon: Palette,
    title: "Graphic Design",
    description:
      "Distinctive visual identities — from logos to brand systems — that make your business instantly recognizable.",
  },
  {
    icon: Video,
    title: "Video Production",
    description:
      "Cinematic brand films, product demos, and social content produced end-to-end, from concept to final edit.",
  },
  {
    icon: Terminal,
    title: "Custom Software Development",
    description:
      "Tailored software built around your workflows, replacing rigid off-the-shelf tools with systems that fit.",
  },
  {
    icon: BrainCircuit,
    title: "AI & Cloud Solutions",
    description:
      "Intelligent automation and scalable cloud infrastructure that future-proof your operations and cut costs.",
  },
  {
    icon: Bot,
    title: "Chatbot Development",
    description:
      "Conversational AI assistants that handle support, qualify leads, and engage customers around the clock.",
  },
];

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const gridVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

export default function Services() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      id="services"
      className="relative overflow-hidden bg-[#050816] py-24 sm:py-32"
    >
      {/* Floating gradient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          aria-hidden
          className="absolute -left-32 top-10 h-[28rem] w-[28rem] rounded-full bg-[#2563EB]/25 blur-[120px]"
          animate={
            shouldReduceMotion
              ? undefined
              : { x: [0, 40, 0], y: [0, 30, 0] }
          }
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="absolute right-[-10rem] top-1/3 h-[32rem] w-[32rem] rounded-full bg-[#7C3AED]/20 blur-[130px]"
          animate={
            shouldReduceMotion
              ? undefined
              : { x: [0, -30, 0], y: [0, 40, 0] }
          }
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="absolute bottom-[-8rem] left-1/3 h-[26rem] w-[26rem] rounded-full bg-[#00D4FF]/10 blur-[120px]"
          animate={
            shouldReduceMotion
              ? undefined
              : { x: [0, 25, 0], y: [0, -25, 0] }
          }
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
            What We Offer
          </span>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Our{" "}
            <span className="bg-gradient-to-r from-[#2563EB] via-[#7C3AED] to-[#00D4FF] bg-clip-text text-transparent">
              Services
            </span>
          </h2>
          <p className="mt-5 text-balance text-base leading-relaxed text-slate-400 sm:text-lg">
            Helping businesses scale with innovative technology solutions,
            digital transformation, and future-ready systems.
          </p>
        </motion.div>

        {/* Service cards */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={gridVariants}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8"
        >
          {SERVICES.map((service) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.title}
                variants={cardVariants}
                whileHover={shouldReduceMotion ? undefined : { y: -6, scale: 1.015 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="group relative h-full"
              >
                {/* Glow / gradient border layer */}
                <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-[#2563EB] via-[#7C3AED] to-[#00D4FF] opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-70" />

                {/* Card body */}
                <div className="relative flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl transition-colors duration-500 group-hover:border-transparent">
                  <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#2563EB]/20 via-[#7C3AED]/20 to-[#00D4FF]/20 ring-1 ring-white/10 transition-transform duration-500 group-hover:scale-110">
                    <Icon className="h-7 w-7 text-[#00D4FF]" strokeWidth={1.75} />
                  </div>

                  <h3 className="mb-3 text-xl font-semibold text-white">
                    {service.title}
                  </h3>

                  <p className="mb-6 flex-1 text-sm leading-relaxed text-slate-400">
                    {service.description}
                  </p>

                  <button
                    type="button"
                    className="inline-flex w-fit items-center gap-2 text-sm font-medium text-[#00D4FF] transition-all duration-300 hover:gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050816] rounded-sm"
                  >
                    Learn More
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}