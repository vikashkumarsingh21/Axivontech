"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Compass, Map, Wand2, Code2, Gauge, Rocket, type LucideIcon } from "lucide-react";

interface Step {
  number: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

const STEPS: Step[] = [
  {
    number: "01",
    title: "Discovery & Consultation",
    description: "Understanding business goals and requirements.",
    icon: Compass,
  },
  {
    number: "02",
    title: "Planning & Strategy",
    description: "Creating roadmap, architecture and execution plan.",
    icon: Map,
  },
  {
    number: "03",
    title: "Design & Prototyping",
    description: "Creating UI/UX and interactive prototypes.",
    icon: Wand2,
  },
  {
    number: "04",
    title: "Development",
    description: "Building scalable and secure solutions.",
    icon: Code2,
  },
  {
    number: "05",
    title: "Testing & Optimization",
    description: "Quality assurance, performance and security testing.",
    icon: Gauge,
  },
  {
    number: "06",
    title: "Launch & Support",
    description: "Deployment, maintenance and continuous improvements.",
    icon: Rocket,
  },
];

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const lineVariants: Variants = {
  hidden: { scaleY: 0 },
  visible: { scaleY: 1, transition: { duration: 1.4, ease: "easeInOut" } },
};

const mobileRowVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const leftRowVariants: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const rightRowVariants: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

function StepCard({ step }: { step: Step }) {
  const Icon = step.icon;
  return (
    <div className="group relative">
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-[#2563EB] via-[#7C3AED] to-[#00D4FF] opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-70" />
      <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl transition-colors duration-500 group-hover:border-transparent sm:p-7">
        <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#2563EB]/20 via-[#7C3AED]/20 to-[#00D4FF]/20 ring-1 ring-white/10 transition-transform duration-500 group-hover:scale-110">
          <Icon className="h-6 w-6 text-[#00D4FF]" strokeWidth={1.75} />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-white">{step.title}</h3>
        <p className="text-sm leading-relaxed text-slate-400">{step.description}</p>
      </div>
    </div>
  );
}

export default function Process() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-[#050816] py-24 sm:py-32">
      {/* Floating gradient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          aria-hidden
          className="absolute left-0 top-1/4 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-[#2563EB]/20 blur-[120px]"
          animate={shouldReduceMotion ? undefined : { x: [0, 25, 0], y: [0, 25, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="absolute right-0 bottom-1/4 h-[28rem] w-[28rem] translate-x-1/2 rounded-full bg-[#7C3AED]/20 blur-[130px]"
          animate={shouldReduceMotion ? undefined : { x: [0, -25, 0], y: [0, -25, 0] }}
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
          className="mx-auto mb-16 max-w-2xl text-center sm:mb-24"
        >
          <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-[0.25em] text-[#00D4FF]">
            How We Work
          </span>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Our Development{" "}
            <span className="bg-gradient-to-r from-[#2563EB] via-[#7C3AED] to-[#00D4FF] bg-clip-text text-transparent">
              Process
            </span>
          </h2>
          <p className="mt-5 text-balance text-base leading-relaxed text-slate-400 sm:text-lg">
            A proven workflow that transforms ideas into successful digital
            products.
          </p>
        </motion.div>

        {/* Mobile / tablet timeline */}
        <div className="relative lg:hidden">
          <div className="absolute left-6 top-2 bottom-2 w-px bg-gradient-to-b from-[#2563EB] via-[#7C3AED] to-[#00D4FF]" />
          <div className="flex flex-col gap-10">
            {STEPS.map((step) => (
              <motion.div
                key={step.number}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={mobileRowVariants}
                className="relative flex gap-6"
              >
                <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#050816] text-sm font-bold shadow-[0_0_0_4px_#050816]">
                  <span className="bg-gradient-to-br from-[#2563EB] via-[#7C3AED] to-[#00D4FF] bg-clip-text text-transparent">
                    {step.number}
                  </span>
                </div>
                <div className="flex-1 pt-1">
                  <StepCard step={step} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Desktop alternating timeline */}
        <div className="relative hidden lg:block">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.05 }}
            variants={lineVariants}
            style={{ transformOrigin: "top" }}
            className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-gradient-to-b from-[#2563EB] via-[#7C3AED] to-[#00D4FF]"
          />
          <div className="flex flex-col gap-16">
            {STEPS.map((step, index) => {
              const isLeft = index % 2 === 0;
              return (
                <motion.div
                  key={step.number}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                  variants={isLeft ? leftRowVariants : rightRowVariants}
                  className="relative grid grid-cols-2 items-center gap-12"
                >
                  {isLeft ? (
                    <>
                      <div className="flex justify-end">
                        <div className="w-full max-w-md">
                          <StepCard step={step} />
                        </div>
                      </div>
                      <div />
                    </>
                  ) : (
                    <>
                      <div />
                      <div className="flex justify-start">
                        <div className="w-full max-w-md">
                          <StepCard step={step} />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="absolute left-1/2 top-1/2 z-10 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-[#050816] text-sm font-bold shadow-[0_0_0_4px_#050816]">
                    <span className="bg-gradient-to-br from-[#2563EB] via-[#7C3AED] to-[#00D4FF] bg-clip-text text-transparent">
                      {step.number}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}