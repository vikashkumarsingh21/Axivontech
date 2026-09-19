"use client";

import React, { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Search, PenTool, LayoutTemplate, Terminal, TestTube2, Rocket } from "lucide-react";

const PROCESS_STEPS = [
  {
    icon: Search,
    title: "Discover",
    description: "We understand the business problem and define success metrics.",
  },
  {
    icon: PenTool,
    title: "Define",
    description: "We clarify requirements, architecture, and solution scope.",
  },
  {
    icon: LayoutTemplate,
    title: "Design",
    description: "We create the user experience and technical direction.",
  },
  {
    icon: Terminal,
    title: "Build",
    description: "We engineer and integrate the solution in agile sprints.",
  },
  {
    icon: TestTube2,
    title: "Validate",
    description: "We rigorously test functionality, security, and performance.",
  },
  {
    icon: Rocket,
    title: "Launch & Evolve",
    description: "We deploy the system and monitor for continuous improvement.",
  },
];

export default function HowWeWork() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-50px" });
  const shouldReduceMotion = useReducedMotion();

  const fadeUp = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <section ref={sectionRef} className="bg-[#111111] py-20 sm:py-32 border-y border-[#1e1e1e]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } },
          }}
          className="text-center max-w-2xl mx-auto mb-16 md:mb-24"
        >
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-4">
            How We Work
          </motion.h2>
          <motion.p variants={fadeUp} className="text-[#a1a1aa] text-lg">
            A structured, transparent engineering process designed to eliminate risk and deliver predictable outcomes.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 relative"
        >
          {PROCESS_STEPS.map((step, index) => {
            const Icon = step.icon;
            const stepNumber = String(index + 1).padStart(2, "0");
            
            return (
              <motion.div key={step.title} variants={fadeUp} className="relative flex flex-col items-center text-center">
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 text-[120px] font-bold text-white/5 select-none z-0">
                  {stepNumber}
                </span>
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] mb-6 shadow-xl">
                  <Icon className="h-7 w-7 text-[#e8a064]" aria-hidden />
                </div>
                <h3 className="relative z-10 text-xl font-semibold text-white mb-3">{step.title}</h3>
                <p className="relative z-10 text-sm text-[#a1a1aa] max-w-xs leading-relaxed">{step.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
