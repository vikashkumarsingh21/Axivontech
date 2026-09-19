"use client";

import React, { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { featuredProjects } from "@/data/portfolio";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";

export default function FeaturedWork() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });
  const shouldReduceMotion = useReducedMotion();

  const fadeUp = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] },
    },
  };

  // Pick the first 2 featured projects for the asymmetric showcase
  const showcased = featuredProjects.slice(0, 2);

  return (
    <section
      ref={sectionRef}
      id="featured-work"
      className="bg-[#0f0f0f] py-20 sm:py-14 sm:py-20 lg:py-32"
      aria-labelledby="featured-work-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
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
            id="featured-work-heading"
            variants={fadeUp}
            className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#f4f4f5]"
          >
            Featured Work
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mt-4 text-[#a1a1aa] text-lg max-w-xl"
          >
            Selected projects that demonstrate our capabilities.
          </motion.p>
        </motion.div>

        {/* Asymmetric grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {showcased.map((project, index) => {
            const isLarge = index === 0;
            return (
              <motion.article
                key={project.slug}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                variants={fadeUp}
                transition={{ delay: index * 0.15 }}
                className={`${isLarge ? "lg:col-span-3" : "lg:col-span-2"}`}
              >
                {/* Project image */}
                {project.thumbnail && !project.thumbnail.includes("thumbnail.webp") ? (
                  <div className={`relative mb-6 w-full rounded-lg overflow-hidden ${isLarge ? "aspect-[16/10]" : "aspect-[4/3]"}`}>
                    <Image
                      src={project.thumbnail}
                      alt={`${project.title} - representative industry imagery`}
                      fill
                      className="object-cover transition-transform duration-500 hover:scale-105"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                ) : (
                  <ImagePlaceholder
                    alt={`${project.title} project screenshot`}
                    aspectRatio={isLarge ? "16/10" : "4/3"}
                    label="Project Hero Image"
                    className="mb-6"
                  />
                )}

                {/* Category */}
                <span className="uppercase text-[11px] font-medium tracking-widest text-[#e8a064]">
                  {project.category}
                </span>

                {/* Title */}
                <h3
                  className={`mt-2 font-semibold text-[#f4f4f5] ${
                    isLarge ? "text-2xl sm:text-3xl" : "text-xl"
                  }`}
                >
                  {project.title}
                </h3>

                {/* Description */}
                <p className="mt-3 text-[#a1a1aa] text-sm sm:text-base leading-relaxed max-w-lg">
                  {project.shortDescription}
                </p>

                {/* Tech chips */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {project.technologies.slice(0, 5).map((tech) => (
                    <span
                      key={tech}
                      className="bg-[#1a1a1a] border border-[#2a2a2a] text-[#a1a1aa] text-xs px-3 py-1 rounded-md"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Link */}
                <Link
                  href={`/portfolio/${project.slug}`}
                  className="mt-5 inline-flex items-center gap-1.5 text-[#e8a064] hover:text-[#f0b07a] text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a064] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f0f] rounded-sm"
                >
                  View Case Study
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

