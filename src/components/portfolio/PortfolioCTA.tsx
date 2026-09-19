"use client";

import React, { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";

export default function PortfolioCTA() {
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
      className="bg-[#0f0f0f] py-20 sm:py-14 sm:py-20 lg:py-32"
      aria-labelledby="portfolio-cta-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.12 } },
          }}
          className="mx-auto max-w-4xl rounded-2xl bg-[#141414] border border-[#1e1e1e] p-8 sm:p-12 lg:p-16 text-center"
        >
          <motion.h2
            id="portfolio-cta-heading"
            variants={fadeUp}
            className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#f4f4f5]"
          >
            Have a project in mind?
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="mt-4 text-[#a1a1aa] text-base sm:text-lg max-w-xl mx-auto leading-relaxed"
          >
            Let&apos;s discuss how Axivon Technologies can help you build
            something meaningful.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#e8a064] px-8 py-4 font-semibold text-[#0f0f0f] transition-colors hover:bg-[#f0b07a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a064] focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414]"
            >
              Start a Conversation
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#303030] px-8 py-4 font-semibold text-[#d4d4d4] transition-colors hover:border-[rgba(232,160,100,0.4)] hover:text-[#e8a064] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a064] focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414]"
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              View Our Services
            </Link>
          </motion.div>

          <motion.p
            variants={fadeUp}
            className="mt-6 text-xs text-[#555]"
          >
            No commitment required · Response within 24 hours
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
