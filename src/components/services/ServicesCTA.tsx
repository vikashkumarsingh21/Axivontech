"use client";

import React, { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function ServicesCTA() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-50px" });
  const shouldReduceMotion = useReducedMotion();

  const fadeUp = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] } 
    },
  };

  return (
    <section ref={sectionRef} className="bg-[#0f0f0f] py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.15 } },
          }}
          className="relative rounded-[2rem] overflow-hidden border border-[#2a2a2a] bg-[#141414]"
        >
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/assets/services/cta/services-collaboration.jpg"
              alt="Professional team collaboration"
              fill
              className="object-cover object-center opacity-40"
              sizes="(max-width: 1280px) 100vw, 1280px"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0f0f0f] via-[#0f0f0f]/90 to-[#0f0f0f]/30" />
          </div>

          {/* Content */}
          <div className="relative z-10 p-10 sm:p-16 lg:p-24 max-w-3xl">
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white leading-tight">
              Not sure what you need yet?
            </motion.h2>
            
            <motion.p variants={fadeUp} className="mt-6 text-lg text-[#a1a1aa] leading-relaxed max-w-xl">
              Tell us about the problem you're trying to solve. We can help define the right technology approach and architecture before you commit.
            </motion.p>
            
            <motion.div variants={fadeUp} className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link 
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#e8a064] px-8 py-4 text-sm font-semibold text-[#0f0f0f] transition-colors hover:bg-[#d4915c] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a064] focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414]"
              >
                Start a Conversation
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link 
                href="/portfolio"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white/5 border border-white/10 px-8 py-4 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414] backdrop-blur-sm"
              >
                View Our Work
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
