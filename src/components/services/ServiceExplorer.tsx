"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { servicesData } from "@/data/services";

const CATEGORIES = ["All", "Engineering", "Design", "Marketing", "Cloud & IoT"];

const CATEGORY_MAP: Record<string, string[]> = {
  "All": servicesData.map(s => s.slug),
  "Engineering": ["web-development", "mobile-app-development", "ai-solutions", "custom-software-development", "automation"],
  "Design": ["ui-ux-design"],
  "Marketing": ["digital-marketing", "seo-services"],
  "Cloud & IoT": ["cloud-solutions", "robotics-iot"],
};

export default function ServiceExplorer() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredSlugs = CATEGORY_MAP[activeCategory] || CATEGORY_MAP["All"];
  const filteredServices = servicesData.filter(s => filteredSlugs.includes(s.slug));

  return (
    <section id="explore-services" className="bg-[#111111] py-20 sm:py-32 border-y border-[#1e1e1e]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-4">
            Explore All Services
          </h2>
          <p className="text-[#a1a1aa] text-lg">
            A comprehensive view of our technical capabilities and professional services.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-12" role="tablist">
          {CATEGORIES.map((category) => {
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveCategory(category)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a064] ${
                  isActive 
                    ? "bg-[#e8a064] text-[#0f0f0f]" 
                    : "bg-[#1a1a1a] text-[#a1a1aa] border border-[#2a2a2a] hover:bg-[#222] hover:text-white"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <motion.div
              key={service.slug}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="group flex flex-col rounded-2xl border border-[#2a2a2a] bg-[#141414] p-6 sm:p-8 hover:border-[#3f3f46] transition-colors"
            >
              <div className="mb-6">
                <span className="inline-block px-3 py-1 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] text-xs font-medium text-[#d4d4d4]">
                  {service.badge}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-[#e8a064] transition-colors">
                {service.title}
              </h3>
              <p className="text-[#a1a1aa] text-sm leading-relaxed mb-8 flex-grow">
                {service.shortDescription}
              </p>
              
              <Link
                href={`/services/${service.slug}`}
                className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-white transition-all duration-300 group-hover:text-[#e8a064]"
                aria-label={`Learn more about ${service.title}`}
              >
                View Details
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
