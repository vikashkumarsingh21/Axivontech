"use client";

import React, { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const BUSINESS_NEEDS = [
  {
    statement: "I need to build a new digital product or platform.",
    solution: "Web & Mobile Development",
    href: "/services/web-development",
  },
  {
    statement: "I want to leverage data and automation in my business.",
    solution: "AI & Machine Learning Solutions",
    href: "/services/ai-solutions",
  },
  {
    statement: "I need to eliminate manual data entry and connect systems.",
    solution: "Business Automation",
    href: "/services/automation",
  },
  {
    statement: "I need custom tools to manage my internal operations.",
    solution: "Custom Software Development",
    href: "/services/custom-software-development",
  },
  {
    statement: "I need to connect physical hardware to a digital dashboard.",
    solution: "Robotics & IoT",
    href: "/services/robotics-iot",
  },
  {
    statement: "I want to drive more organic traffic and leads.",
    solution: "SEO & Digital Marketing",
    href: "/services/seo-services",
  },
];

export default function ServicesByNeed() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-50px" });
  const shouldReduceMotion = useReducedMotion();

  const fadeUp = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <section ref={sectionRef} className="bg-[#0f0f0f] py-20 sm:py-32">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } },
          }}
          className="text-center mb-16"
        >
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-4">
            Not sure what you need?
          </motion.h2>
          <motion.p variants={fadeUp} className="text-[#a1a1aa] text-lg">
            Find the right technical approach based on the business problem you're trying to solve.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } },
          }}
          className="flex flex-col gap-4"
        >
          {BUSINESS_NEEDS.map((need, index) => (
            <motion.div key={index} variants={fadeUp}>
              <Link 
                href={need.href}
                className="group flex flex-col sm:flex-row sm:items-center justify-between p-6 sm:p-8 rounded-2xl bg-[#141414] border border-[#2a2a2a] hover:border-[#e8a064] hover:bg-[#1a1a1a] transition-all duration-300"
              >
                <div className="mb-4 sm:mb-0">
                  <p className="text-lg font-medium text-white mb-1">"{need.statement}"</p>
                </div>
                <div className="flex items-center gap-3 text-[#e8a064] font-semibold text-sm shrink-0">
                  {need.solution}
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
