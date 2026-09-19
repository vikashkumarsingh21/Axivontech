"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";

export default function ContactHero() {
  const shouldReduceMotion = useReducedMotion();

  const fadeUp = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] } 
    },
  };

  const container = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.15 },
    },
  };

  return (
    <section className="relative flex min-h-[75vh] w-full flex-col items-center justify-center bg-[#0f0f0f] px-6 py-24 text-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/assets/contact/hero/contact-hero-collaboration.jpg"
          alt="Professional team collaborating on a digital product"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* Subtle Overlay to ensure readability and brand alignment */}
        <div className="absolute inset-0 bg-[#0f0f0f]/80 backdrop-blur-sm" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0f0f0f] to-transparent" />
      </div>

      {/* Content */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex max-w-4xl flex-col items-center gap-6"
      >
        <motion.div 
          variants={fadeUp}
          className="rounded-full border border-[rgba(255,255,255,0.12)] px-4 py-1.5 bg-[#0f0f0f]/50 backdrop-blur-md"
        >
          <span className="text-sm font-semibold uppercase tracking-[0.15em] text-[#e8a064]">
            Get In Touch
          </span>
        </motion.div>

        <motion.h1 
          variants={fadeUp}
          className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-[#f4f4f5] max-w-3xl"
        >
          Let's Build Something That Matters.
        </motion.h1>

        <motion.p 
          variants={fadeUp}
          className="mt-2 max-w-2xl text-lg sm:text-xl text-[#a1a1aa] leading-relaxed drop-shadow-md"
        >
          We work with businesses, organizations, and teams to build digital products, software, AI systems, automation, and powerful technology solutions.
        </motion.p>
      </motion.div>
    </section>
  );
}
