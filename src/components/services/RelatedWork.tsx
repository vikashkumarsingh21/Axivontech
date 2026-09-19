"use client";

import React, { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { portfolioProjects } from "@/data/portfolio";

export default function RelatedWork() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-50px" });
  const shouldReduceMotion = useReducedMotion();

  // Select 3 relevant projects from actual portfolio data
  const relatedProjects = portfolioProjects.slice(0, 3);

  const fadeUp = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <section ref={sectionRef} className="bg-[#0f0f0f] py-20 sm:py-32 border-t border-[#1e1e1e]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } },
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16">
            <div className="max-w-2xl">
              <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-4">
                Selected Work
              </motion.h2>
              <motion.p variants={fadeUp} className="text-[#a1a1aa] text-lg">
                See how we've applied our engineering capabilities to solve real business challenges.
              </motion.p>
            </div>
            <motion.div variants={fadeUp} className="shrink-0">
              <Link 
                href="/portfolio"
                className="inline-flex items-center gap-2 text-sm font-semibold text-white transition-colors hover:text-[#e8a064]"
              >
                View Full Portfolio
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedProjects.map((project, index) => (
              <motion.div key={project.slug} variants={fadeUp} className="group flex flex-col">
                <Link href={`/portfolio/${project.slug}`} className="block overflow-hidden rounded-2xl border border-[#2a2a2a] bg-[#141414] aspect-[4/3] relative mb-6">
                  {project.heroImage ? (
                    <Image
                      src={project.heroImage}
                      alt={project.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a1a] text-[#333] font-mono text-sm">
                      [Media Placeholder]
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                </Link>
                <div className="flex flex-col flex-grow">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#e8a064]">{project.category}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    <Link href={`/portfolio/${project.slug}`} className="hover:text-[#e8a064] transition-colors">
                      {project.title}
                    </Link>
                  </h3>
                  <p className="text-sm text-[#a1a1aa] line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
