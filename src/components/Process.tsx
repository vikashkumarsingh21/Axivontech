"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  Compass,
  Map,
  Wand2,
  Code2,
  Gauge,
  Rocket,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import { SectionHeader } from "@/components/ui";

interface Step {
  number: string;
  title: string;
  description: string;
  icon: LucideIcon;
  outcome: string;
  deliverables: string[];
}

const STEPS: Step[] = [
  {
    number: "01",
    title: "Discovery & Consultation",
    description:
      "We start by listening — understanding your business goals, audience, competitive landscape, and real constraints before a single line of code is written.",
    icon: Compass,
    outcome: "Shared clarity on what to build and why",
    deliverables: ["Requirements brief", "Scope document", "Initial timeline"],
  },
  {
    number: "02",
    title: "Planning & Strategy",
    description:
      "A concrete roadmap, technical architecture, and delivery plan aligned with your operational goals and budget. No guesswork — just clear milestones.",
    icon: Map,
    outcome: "Detailed project roadmap with milestones",
    deliverables: ["Tech stack decision", "Sprint plan", "Risk assessment"],
  },
  {
    number: "03",
    title: "Design & Prototyping",
    description:
      "Interactive wireframes and high-fidelity designs that prioritise clear user journeys, fast load experience, and brand alignment — before development begins.",
    icon: Wand2,
    outcome: "Approved designs ready for development",
    deliverables: ["UI/UX wireframes", "Prototype", "Brand alignment check"],
  },
  {
    number: "04",
    title: "Development",
    description:
      "Robust, scalable implementation using modern tech stacks. Clean code, documented, and built for maintainability — not just the launch day.",
    icon: Code2,
    outcome: "Working, tested codebase at every sprint",
    deliverables: ["Feature builds", "API integrations", "Version control"],
  },
  {
    number: "05",
    title: "Testing & Optimization",
    description:
      "Thorough quality checks — functionality, performance, cross-device responsiveness, and accessibility — so the product works in real-world conditions.",
    icon: Gauge,
    outcome: "Zero critical bugs at launch",
    deliverables: ["QA testing", "Performance audit", "Accessibility check"],
  },
  {
    number: "06",
    title: "Launch & Support",
    description:
      "Smooth deployment, post-launch monitoring, and ongoing support. We stay with you — so the product improves with your business, not just at delivery.",
    icon: Rocket,
    outcome: "Stable launch with ongoing improvement",
    deliverables: ["Deployment", "Monitoring setup", "Support plan"],
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
  hidden: { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

const rightRowVariants: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

function StepCard({ step }: { step: Step }) {
  const Icon = step.icon;
  return (
    <div className="group rounded-[1.5rem] border border-[#262626] bg-[#141414] p-6 shadow-lg transition-all duration-200 hover:border-[rgba(232,160,100,0.25)] hover:bg-[#1c1c1e]">
      {/* Header row */}
      <div className="flex items-start gap-4 mb-4">
        <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1c1c1e] text-[#71717a] transition-all duration-200 group-hover:bg-[#2a1f14] group-hover:text-[#e8a064]">
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold tracking-[-0.02em] text-[#f4f4f5] group-hover:text-[#e8a064] transition-colors leading-snug">
            {step.title}
          </h3>
          <p className="mt-1 text-sm leading-6 text-[#a1a1aa]">{step.description}</p>
        </div>
      </div>

      {/* Outcome callout */}
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-[#e8a064]/15 bg-[#2a1f14]/60 px-3.5 py-2">
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#e8a064]" strokeWidth={2} aria-hidden />
        <p className="text-xs font-medium text-[#e8a064]">{step.outcome}</p>
      </div>

      {/* Deliverables */}
      <div className="flex flex-wrap gap-2">
        {step.deliverables.map((d) => (
          <span
            key={d}
            className="rounded-full border border-[#303030] bg-[#1c1c1e] px-2.5 py-1 text-[11px] font-medium text-[#71717a]"
          >
            {d}
          </span>
        ))}
      </div>
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
            body="We keep the process practical, transparent, and focused on delivering real, usable outcomes — not just deliverables."
          />
        </motion.div>

        {/* Mobile vertical line layout */}
        <div className="relative lg:hidden">
          <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-[#262626]" />
          <div className="flex flex-col gap-8">
            {STEPS.map((step) => (
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
            ))}
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
                  variants={
                    shouldReduceMotion
                      ? undefined
                      : isLeft
                      ? leftRowVariants
                      : rightRowVariants
                  }
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
}