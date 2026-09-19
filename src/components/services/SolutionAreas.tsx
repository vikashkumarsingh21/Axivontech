"use client";

import React, { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Globe, BrainCircuit, Zap, Cpu, Code2 } from "lucide-react";

const SOLUTION_AREAS = [
  {
    title: "Digital Products",
    description: "Websites, mobile applications, and digital experiences that delight users and drive conversions.",
    icon: Globe,
  },
  {
    title: "Intelligent Systems",
    description: "AI and ML-powered applications that automate decision-making and surface hidden insights.",
    icon: BrainCircuit,
  },
  {
    title: "Business Automation",
    description: "Workflow, chatbot, and process automation to eliminate manual tasks and reduce operational friction.",
    icon: Zap,
  },
  {
    title: "Connected Technology",
    description: "IoT, hardware integration, and smart solutions bridging the physical and digital worlds.",
    icon: Cpu,
  },
  {
    title: "Custom Software",
    description: "Bespoke business platforms, ERPs, and APIs engineered precisely for your operational workflows.",
    icon: Code2,
  },
];

export default function SolutionAreas() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-50px" });
  const shouldReduceMotion = useReducedMotion();

  const fadeUp = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <section ref={sectionRef} className="bg-[#0f0f0f] py-20 sm:py-32 border-b border-[#1e1e1e]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } },
          }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8"
        >
          {/* Header Column */}
          <div className="lg:col-span-4 flex flex-col justify-start">
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-6">
              What We Help Businesses Build
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[#a1a1aa] text-lg leading-relaxed max-w-md">
              Before we talk about specific technologies, we focus on outcomes. Our engineering teams specialize in five core solution areas designed to modernize and scale your operations.
            </motion.p>
          </div>

          {/* Solutions Column */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
            {SOLUTION_AREAS.map((area, idx) => {
              const Icon = area.icon;
              return (
                <motion.div 
                  key={area.title} 
                  variants={fadeUp} 
                  className={`flex flex-col rounded-2xl border border-[#2a2a2a] bg-[#141414] p-8 transition-colors hover:border-[#3f3f46] ${
                    idx === SOLUTION_AREAS.length - 1 && SOLUTION_AREAS.length % 2 !== 0 ? "sm:col-span-2" : ""
                  }`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0f0f0f] border border-[#2a2a2a] mb-6">
                    <Icon className="h-5 w-5 text-[#e8a064]" aria-hidden />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{area.title}</h3>
                  <p className="text-[#a1a1aa] leading-relaxed">{area.description}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
