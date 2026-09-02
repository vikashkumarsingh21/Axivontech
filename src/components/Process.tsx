"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Compass, Map, Wand2, Code2, Gauge, Rocket, type LucideIcon } from "lucide-react";
import { SectionHeader } from "@/components/ui";

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
    description: "Understanding business goals, audience needs, and constraints before any build work begins.",
    icon: Compass,
  },
  {
    number: "02",
    title: "Planning & Strategy",
    description: "Creating a roadmap, technical direction, and delivery plan that aligns with real operational goals.",
    icon: Map,
  },
  {
    number: "03",
    title: "Design & Prototyping",
    description: "Building clear user journeys and interaction patterns that are easy to understand and trust.",
    icon: Wand2,
  },
  {
    number: "04",
    title: "Development",
    description: "Implementing robust, scalable solutions with a focus on reliability and maintainability.",
    icon: Code2,
  },
  {
    number: "05",
    title: "Testing & Optimization",
    description: "Checking quality, performance, and responsiveness so the product works across real usage scenarios.",
    icon: Gauge,
  },
  {
    number: "06",
    title: "Launch & Support",
    description: "Deploying the product and supporting the business with ongoing improvements and assistance.",
    icon: Rocket,
  },
];

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const lineVariants: Variants = {
  hidden: { scaleY: 0 },
  visible: { scaleY: 1, transition: { duration: 1, ease: "easeInOut" } },
};

const mobileRowVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const leftRowVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

const rightRowVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

function StepCard({ step }: { step: Step }) {
  const Icon = step.icon;
  return (
    <div className="group rounded-[1.5rem] border border-[#262626] bg-[#141414] p-6 shadow-lg transition-all duration-200 hover:border-[rgba(232,160,100,0.25)] hover:bg-[#1c1c1e]">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1c1c1e] text-[#71717a] transition-all duration-200 group-hover:bg-[#2a1f14] group-hover:text-[#e8a064]">
        <Icon className="h-5 w-5" strokeWidth={2} />
      </div>
      <h3 className="mb-2 text-xl font-semibold tracking-[-0.03em] text-[#f4f4f5] group-hover:text-[#e8a064] transition-colors">{step.title}</h3>
      <p className="text-base leading-7 text-[#a1a1aa]">{step.description}</p>
    </div>
  );
}

export default function Process() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="bg-[#0f0f0f] py-24 sm:py-28 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={headerVariants}
          className="mx-auto mb-16 max-w-2xl text-center sm:mb-20"
        >
          <SectionHeader
            overline="How We Work"
            heading={
              <>
                A clear process <span className="text-gradient-amber">from idea to launch.</span>
              </>
            }
            body="We keep the process practical, transparent, and focused on delivering usable outcomes."
          />
        </motion.div>

        {/* Mobile vertical line layout */}
        <div className="relative lg:hidden">
          <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-[#262626]" />
          <div className="flex flex-col gap-8">
            {GRID_STEPS()}
          </div>
        </div>

        {/* Desktop timeline layout */}
        <div className="relative hidden lg:block">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.05 }}
            variants={shouldReduceMotion ? undefined : lineVariants}
            style={{ transformOrigin: "top" }}
            className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-[#262626]"
          />
          <div className="flex flex-col gap-12">
            {STEPS.map((step, index) => {
              const isLeft = index % 2 === 0;
              return (
                <motion.div
                  key={step.number}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                  variants={shouldReduceMotion ? undefined : (isLeft ? leftRowVariants : rightRowVariants)}
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

                  <div className="absolute left-1/2 top-1/2 z-10 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#262626] bg-[#141414] text-sm font-bold text-[#e8a064] shadow-sm ring-4 ring-[#0f0f0f]">
                    {step.number}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );

  function GRID_STEPS() {
    return STEPS.map((step) => (
      <motion.div
        key={step.number}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={mobileRowVariants}
        className="relative flex gap-6"
      >
        <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#262626] bg-[#141414] text-sm font-bold text-[#e8a064] shadow-sm">
          {step.number}
        </div>
        <div className="flex-1 pt-0.5">
          <StepCard step={step} />
        </div>
      </motion.div>
    ));
  }
}