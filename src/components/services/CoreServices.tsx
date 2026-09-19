"use client";

import React, { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { servicesData } from "@/data/services";

export default function CoreServices() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const shouldReduceMotion = useReducedMotion();

  // Select the top 4 pillar services for this editorial section
  const PILLAR_SLUGS = ["web-development", "mobile-app-development", "ai-solutions", "custom-software-development"];
  const pillarServices = servicesData.filter(s => PILLAR_SLUGS.includes(s.slug));

  return (
    <section ref={sectionRef} className="bg-[#0f0f0f] py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="mb-16 md:mb-24"
        >
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-4">
            Core Engineering Services
          </h2>
          <p className="text-[#a1a1aa] text-lg max-w-2xl">
            Our primary technology disciplines. We build robust, scalable solutions across these core domains to support ambitious businesses.
          </p>
        </motion.div>

        <div className="flex flex-col gap-12 sm:gap-16">
          {pillarServices.map((service, index) => {
            const number = String(index + 1).padStart(2, "0");
            return (
              <motion.div
                key={service.slug}
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }}
                className="group flex flex-col md:flex-row gap-6 md:gap-12 lg:gap-24 border-t border-[#1e1e1e] pt-12"
              >
                {/* Number & Title */}
                <div className="md:w-1/3 shrink-0">
                  <span className="block text-sm font-bold text-[#e8a064] mb-4 tracking-widest">{number}</span>
                  <h3 className="text-2xl sm:text-3xl font-semibold text-white group-hover:text-[#e8a064] transition-colors duration-300">
                    {service.title}
                  </h3>
                </div>

                {/* Description & Action */}
                <div className="md:w-2/3 flex flex-col items-start">
                  <p className="text-lg text-[#a1a1aa] leading-relaxed mb-8">
                    {service.shortDescription}
                  </p>
                  
                  {/* Key Benefits List */}
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 mb-10 w-full">
                    {service.benefits.slice(0, 4).map((benefit) => (
                      <li key={benefit.title} className="flex items-start gap-3">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#e8a064]" aria-hidden />
                        <span className="text-sm font-medium text-[#d4d4d4]">{benefit.title}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={`/services/${service.slug}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-white transition-all duration-300 hover:text-[#e8a064] hover:gap-3"
                  >
                    Explore {service.title}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
