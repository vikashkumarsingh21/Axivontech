"use client";

import React, { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const INSIGHTS = [
  {
    id: "smart-agriculture",
    title: "Building Smart Agriculture Platforms with IoT",
    link: "/blog",
  },
  {
    id: "product-development",
    title: "How We Approach Product Development at Axivon",
    link: "/blog",
  },
  {
    id: "ai-environmental",
    title: "The Role of AI in Environmental Technology",
    link: "/blog",
  },
];

export default function RelatedInsights() {
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
      id="related-insights"
      className="bg-[#111111] py-20 sm:py-14 sm:py-20 lg:py-32"
      aria-labelledby="related-insights-heading"
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
            id="related-insights-heading"
            variants={fadeUp}
            className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#f4f4f5]"
          >
            Related Insights
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-[#a1a1aa] text-lg max-w-xl">
            Read more about our work and approach.
          </motion.p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {INSIGHTS.map((insight, index) => (
            <motion.div
              key={insight.id}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              variants={fadeUp}
              transition={{ delay: index * 0.1 }}
              className="bg-[#141414] border border-[#1e1e1e] rounded-xl p-6 hover:border-[#2a2a2a] transition-colors"
            >
              <span className="uppercase text-[11px] tracking-widest font-medium text-[#e8a064]">
                Blog
              </span>
              <h3 className="text-base font-semibold text-[#f4f4f5] mt-3 leading-snug">
                {insight.title}
              </h3>
              <Link
                href={insight.link}
                className="mt-4 inline-flex items-center gap-1.5 text-sm text-[#e8a064] hover:text-[#f0b07a] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a064] focus-visible:ring-offset-2 focus-visible:ring-offset-[#141414] rounded-sm"
              >
                Read Article
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

