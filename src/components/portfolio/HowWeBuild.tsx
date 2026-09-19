"use client";

import React, { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Search, Code2, Rocket } from "lucide-react";

const STEPS = [
  {
    number: "01",
    title: "Discover",
    icon: Search,
    description:
      "We start by understanding your problem, users, and business goals through research and discovery workshops.",
  },
  {
    number: "02",
    title: "Build",
    icon: Code2,
    description:
      "We design and develop your product iteratively, using modern technologies and clean architecture.",
  },
  {
    number: "03",
    title: "Deliver",
    icon: Rocket,
    description:
      "We deploy, test, and hand over a production-ready product with documentation and ongoing support.",
  },
];

export default function HowWeBuild() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });
  const shouldReduceMotion = useReducedMotion();

  const fadeUp = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] },
    },
  };

  return (
    <section
      ref={sectionRef}
      id="how-we-build"
      className="bg-[#111111] py-20 sm:py-24 lg:py-32"
      aria-labelledby="how-we-build-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } },
          }}
          className="mb-14 lg:mb-20"
        >
          <motion.h2
            id="how-we-build-heading"
            variants={fadeUp}
            className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#f4f4f5]"
          >
            How We Build
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-[#a1a1aa] text-lg max-w-xl">
            Our approach to turning ideas into production-ready products.
          </motion.p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                variants={fadeUp}
                transition={{ delay: index * 0.12 }}
                className="relative"
              >
                {/* Step number watermark */}
                <span className="text-5xl font-bold text-[#1e1e1e] select-none" aria-hidden>
                  {step.number}
                </span>

                {/* Icon */}
                <div className="mt-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#1a1a1a] border border-[#2a2a2a]">
                  <Icon className="h-5 w-5 text-[#e8a064]" strokeWidth={1.8} aria-hidden />
                </div>

                {/* Title */}
                <h3 className="mt-4 text-lg font-semibold text-[#f4f4f5]">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="mt-2 text-sm text-[#a1a1aa] leading-relaxed">
                  {step.description}
                </p>

                {/* Connector line (visible on desktop between cards) */}
                {index < STEPS.length - 1 && (
                  <div
                    className="hidden md:block absolute top-[2.5rem] -right-6 lg:-right-6 w-[calc(50%)] border-t border-[#1e1e1e]"
                    aria-hidden
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
