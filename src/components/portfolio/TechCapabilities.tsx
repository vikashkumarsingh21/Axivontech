"use client";

import React, { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

const TECH_GROUPS = [
  {
    label: "Frontend",
    items: ["Next.js", "React", "TypeScript", "JavaScript", "HTML", "CSS", "Tailwind CSS", "Bootstrap"],
  },
  {
    label: "Backend & Cloud",
    items: ["Node.js", "Firebase", "Google Apps Script", "Google Sheets", "Vercel"],
  },
  {
    label: "IoT & Hardware",
    items: ["Arduino", "ESP8266", "IoT"],
  },
  {
    label: "AI & Data",
    items: ["Artificial Intelligence"],
  },
];

export default function TechCapabilities() {
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
      id="tech-capabilities"
      className="bg-[#0f0f0f] py-20 sm:py-14 sm:py-20 lg:py-32"
      aria-labelledby="tech-capabilities-heading"
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
            id="tech-capabilities-heading"
            variants={fadeUp}
            className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#f4f4f5]"
          >
            Technology Capabilities
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-[#a1a1aa] text-lg max-w-xl">
            The tools and platforms we use to build real products.
          </motion.p>
        </motion.div>

        {/* Tech groups */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {TECH_GROUPS.map((group, groupIndex) => (
            <motion.div
              key={group.label}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              variants={fadeUp}
              transition={{ delay: groupIndex * 0.1 }}
            >
              <h3 className="text-sm font-medium uppercase tracking-widest text-[#e8a064] mb-5">
                {group.label}
              </h3>
              <div className="flex flex-wrap gap-2">
                {group.items.map((tech) => (
                  <span
                    key={tech}
                    className="bg-[#1a1a1a] border border-[#2a2a2a] text-[#d4d4d4] text-sm px-3 py-2 rounded-lg"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

