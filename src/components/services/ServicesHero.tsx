"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function ServicesHero() {
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
    <section className="relative flex min-h-[80vh] w-full flex-col items-center justify-center bg-[#0f0f0f] px-6 py-32 text-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/assets/services/hero/services-hero-engineering.jpg"
          alt="Professional software engineering environment"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* Overlay to ensure readability and brand alignment */}
        <div className="absolute inset-0 bg-[#0f0f0f]/85 backdrop-blur-[2px]" />
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
          className="rounded-full border border-white/10 px-4 py-1.5 bg-white/5 backdrop-blur-md"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e8a064]">
            Our Services
          </span>
        </motion.div>

        <motion.h1 
          variants={fadeUp}
          className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-white max-w-4xl leading-[1.1]"
        >
          Technology Built Around Your Business.
        </motion.h1>

        <motion.p 
          variants={fadeUp}
          className="mt-4 max-w-2xl text-lg sm:text-xl text-[#a1a1aa] leading-relaxed"
        >
          We build digital products, scalable software systems, AI solutions, and intelligent automation designed to solve real business challenges.
        </motion.p>

        <motion.div variants={fadeUp} className="mt-8 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link 
            href="#explore-services"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#e8a064] px-8 py-4 text-sm font-semibold text-[#0f0f0f] transition-colors hover:bg-[#d4915c] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a064] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f0f] w-full sm:w-auto"
          >
            Explore Services
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link 
            href="/contact"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white/5 border border-white/10 px-8 py-4 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f0f] w-full sm:w-auto backdrop-blur-sm"
          >
            Discuss a Project
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}