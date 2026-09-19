"use client";

import React, { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

const TECH_CATEGORIES = [
  {
    title: "Frontend & Mobile",
    technologies: ["React", "Next.js", "TypeScript", "Tailwind CSS", "React Native", "Flutter"],
  },
  {
    title: "Backend & APIs",
    technologies: ["Node.js", "Python", "GraphQL", "REST", "Express", "FastAPI"],
  },
  {
    title: "Database & Cloud",
    technologies: ["PostgreSQL", "MongoDB", "Redis", "AWS", "Google Cloud", "Firebase"],
  },
  {
    title: "AI & IoT",
    technologies: ["OpenAI", "PyTorch", "LangChain", "Arduino", "Raspberry Pi", "MQTT"],
  },
];

export default function TechnologyCapabilities() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-50px" });
  const shouldReduceMotion = useReducedMotion();

  const fadeUp = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <section ref={sectionRef} className="bg-[#0f0f0f] py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } },
          }}
        >
          <div className="mb-16">
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-4">
              Technology Capabilities
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[#a1a1aa] text-lg max-w-2xl">
              We select the right tools for the job. Our engineers are proficient in modern, enterprise-grade technologies that ensure performance, security, and scale.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {TECH_CATEGORIES.map((category) => (
              <motion.div key={category.title} variants={fadeUp} className="flex flex-col">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-[#e8a064] mb-6 border-b border-[#1e1e1e] pb-4">
                  {category.title}
                </h3>
                <ul className="flex flex-col gap-3">
                  {category.technologies.map((tech) => (
                    <li key={tech} className="text-[#d4d4d4] font-medium text-base">
                      {tech}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
