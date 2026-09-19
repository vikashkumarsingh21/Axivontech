"use client";

import React, { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function PortfolioHero() {
  const containerRef = useRef<HTMLElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: shouldReduceMotion ? 0 : 20 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.21, 0.47, 0.32, 0.98],
      }
    },
  };

  return (
    <section 
      ref={containerRef}
      className="relative flex min-h-[85vh] w-full flex-col items-center justify-center bg-[#0f0f0f] px-6 py-24 text-center selection:bg-[#e8a064] selection:text-[#0f0f0f] overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/assets/portfolio/hero/portfolio-hero-technology-workspace.jpg"
          alt="Technology workspace representing digital product engineering"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* Subtle Dark / Brand Overlay */}
        <div className="absolute inset-0 bg-[#0f0f0f]/85 backdrop-blur-[2px]" />
        {/* Gradient fade into the next section */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0f0f0f] to-transparent" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="relative z-10 flex max-w-4xl flex-col items-center gap-8"
      >
        <motion.div 
          variants={itemVariants}
          className="rounded-full border border-[rgba(255,255,255,0.12)] px-4 py-1.5 bg-[#0f0f0f]/50 backdrop-blur-sm"
        >
          <span className="text-sm font-medium tracking-wider text-[#e8a064] uppercase">
            Our Work
          </span>
        </motion.div>

        <motion.h1 
          variants={itemVariants}
          className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-semibold tracking-tight text-[#f4f4f5] max-w-3xl"
        >
          Projects that solve real problems.
        </motion.h1>

        <motion.p 
          variants={itemVariants}
          className="max-w-2xl text-lg sm:text-xl text-[#a1a1aa] leading-relaxed drop-shadow-sm"
        >
          We design, build, and ship digital products — from smart agriculture platforms to autonomous environmental systems.
        </motion.p>

        <motion.div variants={itemVariants} className="pt-4">
          <Link 
            href="#featured-work"
            className="inline-flex items-center justify-center rounded-full bg-[#e8a064] px-8 py-4 font-semibold text-[#0f0f0f] transition-colors hover:bg-[#f0b07a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a064] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f0f]"
          >
            Explore Our Work
          </Link>
        </motion.div>
      </motion.div>

      <motion.div 
        className="absolute bottom-12 left-1/2 -translate-x-1/2 text-[#a1a1aa] z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
      >
        <motion.div
          animate={
            shouldReduceMotion
              ? {}
              : { y: [0, 8, 0] }
          }
          transition={
            shouldReduceMotion
              ? {}
              : { repeat: Infinity, duration: 2, ease: "easeInOut" }
          }
        >
          <ArrowDown className="h-5 w-5 opacity-50" />
        </motion.div>
      </motion.div>
    </section>
  );
}