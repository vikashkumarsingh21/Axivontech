"use client";

import React, { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Briefcase, Building2, Handshake, Users } from "lucide-react";

const OPTIONS = [
  {
    icon: Briefcase,
    title: "Start a Project",
    description: "Have a project idea or a specific business requirement.",
  },
  {
    icon: Building2,
    title: "Business Inquiry",
    description: "Want to discuss services or a technology requirement.",
  },
  {
    icon: Handshake,
    title: "Partnership",
    description: "Interested in working together with Axivon.",
  },
  {
    icon: Users,
    title: "Careers",
    description: "Interested in joining our engineering team.",
  },
];

export default function ContactOptions() {
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
    <section ref={sectionRef} className="bg-[#0f0f0f] py-16 sm:py-20 border-b border-[#1e1e1e]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } },
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {OPTIONS.map((opt) => {
            const Icon = opt.icon;
            return (
              <motion.div key={opt.title} variants={fadeUp} className="flex flex-col">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] mb-5">
                  <Icon className="h-5 w-5 text-[#e8a064]" strokeWidth={1.5} aria-hidden />
                </div>
                <h3 className="text-lg font-semibold text-[#f4f4f5] mb-2">{opt.title}</h3>
                <p className="text-sm text-[#a1a1aa] leading-relaxed">{opt.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
