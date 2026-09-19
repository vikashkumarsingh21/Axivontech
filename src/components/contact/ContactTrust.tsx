"use client";

import React, { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Target, Lightbulb, MessageSquare, ShieldCheck } from "lucide-react";

const TRUST_POINTS = [
  {
    icon: Target,
    title: "Clear Requirements",
    description: "We understand the problem and define clear specifications before proposing a solution.",
  },
  {
    icon: Lightbulb,
    title: "Tailored Solutions",
    description: "Our solutions are designed around your actual business requirement and context.",
  },
  {
    icon: MessageSquare,
    title: "Direct Communication",
    description: "We keep communication transparent and clear throughout the entire project lifecycle.",
  },
  {
    icon: ShieldCheck,
    title: "Scalable Technology",
    description: "We build systems using modern architectures that can evolve with your business.",
  },
];

export default function ContactTrust() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-50px" });
  const shouldReduceMotion = useReducedMotion();

  const fadeUp = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.5, ease: "easeOut" } 
    },
  };

  return (
    <section ref={sectionRef} className="bg-[#111111] py-20 sm:py-14 sm:py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } },
          }}
        >
          <div className="text-center max-w-2xl mx-auto mb-16">
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#f4f4f5]">
              Why Work With Axivon
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-4 text-[#a1a1aa] text-lg">
              Our process is built on clarity, technical excellence, and genuine partnership.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {TRUST_POINTS.map((point) => {
              const Icon = point.icon;
              return (
                <motion.div key={point.title} variants={fadeUp} className="flex flex-col items-center text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] mb-6">
                    <Icon className="h-6 w-6 text-[#e8a064]" strokeWidth={1.5} aria-hidden />
                  </div>
                  <h3 className="text-lg font-semibold text-[#f4f4f5] mb-3">{point.title}</h3>
                  <p className="text-sm text-[#a1a1aa] leading-relaxed">{point.description}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

