"use client";

import React, { useState } from "react";
import Image from "next/image";
import { CheckCircle2, ChevronRight, Info, TrendingUp, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CaseStudy } from "./types";

const CASE_STUDIES: (CaseStudy & { highlightStat: string; statLabel: string })[] = [
  {
    id: "operational-harmonization",
    category: "Operational Restructuring & Supply Chain",
    title: "Multi-facility Operational Harmonization",
    highlightStat: "78%",
    statLabel: "Decision Latency Reduction",
    briefDescription: "Unifying divergent operational workflows and inventory coordination across three distributed regional production hubs.",
    challenge: "A mid-market manufacturing enterprise operating three separate regional facilities suffered from divergent local operating procedures. Each plant relied on localized spreadsheets and custom reporting cadences, resulting in delayed inventory transfers, unpredictable buffer stocks, and recurrent executive decision bottlenecks.",
    approach: "Northline conducted a four-week operational discovery across facility plant managers and central logistics. We synthesized standard operating guidelines, restructured the weekly inter-facility scheduling rhythm, and trained operational leads on unified throughput dashboards.",
    illustrativeOutcome: "Standardized operating cadences across all three plants, reduced cross-facility decision latency from days to hours, and established a unified executive operational dashboard.",
    imageSrc: "/images/demo-projects/corporatepro/operations-case-study.jpg",
    imageAlt: "Industrial logistics and supply operations facility during workflow modernization",
    tags: ["Operations", "Process Governance", "Multi-site Alignment"]
  },
  {
    id: "systems-modernization",
    category: "Digital Transformation & Enterprise Systems",
    title: "Core Systems Modernization & Data Visibility",
    highlightStat: "14 to 1",
    statLabel: "Reporting Systems Unified",
    briefDescription: "Transitioning fragile spreadsheet-driven tracking into unified, transparent reporting infrastructure without business interruption.",
    challenge: "A commercial logistics group struggled with fragmented operational visibility. Key sales, inventory, and fulfillment records were siloed across legacy departmental databases and ad-hoc spreadsheets, preventing leadership from reviewing consolidated margin and delivery telemetry.",
    approach: "Rather than initiating a high-risk full enterprise ERP replacement, Northline engineered a phased modernization blueprint. We defined core API integration standards, selected an agile reporting layer, and coached internal management leads through hands-on pilot sprints.",
    illustrativeOutcome: "Replaced 14 disconnected manual spreadsheets with automated daily executive dashboards, improved order fulfillment visibility, and successfully upskilled internal operations leads.",
    imageSrc: "/images/demo-projects/corporatepro/digital-transformation.jpg",
    imageAlt: "Enterprise executive reviewing real-time data architecture and analytics display",
    tags: ["Digital Roadmap", "Systems Integration", "Executive Analytics"]
  }
];

export default function NorthlineWork() {
  const [selectedCase, setSelectedCase] = useState<string | null>(null);

  return (
    <section
      id="work"
      aria-label="Selected Advisory Engagements"
      className="relative bg-white py-20 sm:py-28 border-b border-[#29483B]/10"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 sm:mb-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="h-px w-7 bg-[#B87352]" />
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.24em] text-[#B87352]">
                SELECTED ENGAGEMENTS · CASE DOSSIERS
              </span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#252925] leading-tight mb-4">
              Empirical case studies from the front lines of corporate transition.
            </h2>

            <p className="text-base sm:text-lg text-[#252925]/75 leading-relaxed font-normal">
              Real business transformations occur at the intersection of clear strategy, process redesign, and cross-functional leadership alignment.
            </p>
          </div>

          {/* Demonstration Notice */}
          <div className="shrink-0 rounded-xs border border-[#29483B]/15 bg-[#F7F5EF] p-4.5 max-w-sm shadow-xs">
            <div className="flex items-start gap-2.5">
              <Info className="h-4 w-4 text-[#29483B] shrink-0 mt-0.5" />
              <p className="text-xs text-[#77796F] leading-relaxed">
                <strong className="text-[#252925] font-semibold">Demonstration Case Models:</strong> Synthesized for the Axivon CorporatePro showcase to illustrate advisory problem-solving structure.
              </p>
            </div>
          </div>
        </div>

        {/* Magazine Editorial Case Studies */}
        <div className="space-y-16 sm:space-y-20">
          {CASE_STUDIES.map((item, index) => {
            const isExpanded = selectedCase === item.id;
            const isReversed = index % 2 === 1;

            return (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-xs border border-[#29483B]/15 bg-[#F7F5EF]/40 shadow-xs transition-all duration-300 hover:border-[#29483B]/35 hover:shadow-xl"
              >
                {/* Magazine Editorial Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
                  {/* Visual Magazine Cover Column */}
                  <div className={`lg:col-span-6 relative overflow-hidden bg-[#252925] min-h-[300px] lg:min-h-full ${isReversed ? "lg:order-2" : "lg:order-1"}`}>
                    <Image
                      src={item.imageSrc}
                      alt={item.imageAlt}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover object-center opacity-85 transition-transform duration-700 group-hover:scale-105 group-hover:opacity-95"
                    />

                    {/* Muted Editorial Scrim */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#252925]/90 via-[#252925]/40 to-transparent pointer-events-none" />

                    {/* Top Issue Badge */}
                    <div className="absolute top-5 left-5 z-10 flex items-center gap-2">
                      <div className="rounded-xs bg-[#F7F5EF]/95 backdrop-blur-md px-3 py-1 border border-[#29483B]/10 text-[10px] font-bold uppercase tracking-[0.2em] text-[#29483B]">
                        DOSSIER 0{index + 1}
                      </div>
                      <div className="hidden sm:inline-block rounded-xs bg-[#29483B]/80 text-[#F7F5EF] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur-md">
                        {item.category.split("&")[0]}
                      </div>
                    </div>

                    {/* Overlaid Editorial Headline on Visual */}
                    <div className="absolute bottom-6 left-6 right-6 z-10">
                      <div className="inline-flex items-center gap-2 mb-2 text-[#B87352]">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-[11px] font-bold uppercase tracking-[0.18em]">
                          Key Quantifiable Impact
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="font-serif text-3xl sm:text-4xl font-normal text-white">
                          {item.highlightStat}
                        </span>
                        <span className="text-xs uppercase tracking-wider text-[#E2E9E0]/80">
                          {item.statLabel}
                        </span>
                      </div>
                      <p className="font-serif italic text-xs sm:text-sm text-[#F7F5EF]/90 line-clamp-2">
                        &ldquo;{item.briefDescription}&rdquo;
                      </p>
                    </div>
                  </div>

                  {/* Editorial Narrative & Analysis Column */}
                  <div className={`lg:col-span-6 flex flex-col justify-between p-8 sm:p-10 lg:p-12 bg-white ${isReversed ? "lg:order-1" : "lg:order-2"}`}>
                    <div>
                      {/* Category & Tags */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B87352]">
                          {item.category}
                        </span>
                        <span className="text-[11px] font-mono text-[#77796F]">
                          REF-0{index + 1}
                        </span>
                      </div>

                      {/* Main Title */}
                      <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#252925] mb-4 group-hover:text-[#29483B] transition-colors leading-snug">
                        {item.title}
                      </h3>

                      {/* Brief description */}
                      <p className="text-sm sm:text-base text-[#252925]/80 leading-relaxed mb-6 font-normal">
                        {item.briefDescription}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-xs bg-[#E2E9E0]/70 px-2.5 py-1 text-xs font-medium text-[#29483B] border border-[#29483B]/10"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Situation Diagnostic */}
                      <div className="space-y-4 pt-5 border-t border-[#29483B]/10">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#77796F] block mb-1">
                            The Institutional Friction
                          </span>
                          <p className="text-xs sm:text-sm text-[#252925]/85 leading-relaxed font-normal">
                            {item.challenge}
                          </p>
                        </div>

                        {/* Expandable Case Details with Framer Motion */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                              className="overflow-hidden space-y-4 pt-2"
                            >
                              <div className="rounded-xs bg-[#F7F5EF] p-4.5 border border-[#29483B]/10">
                                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#29483B] block mb-1">
                                  Northline Advisory Intervention
                                </span>
                                <p className="text-xs sm:text-sm text-[#252925]/85 leading-relaxed font-normal">
                                  {item.approach}
                                </p>
                              </div>

                              <div className="rounded-xs bg-[#29483B] p-4.5 text-[#F7F5EF] shadow-xs">
                                <div className="flex items-center gap-1.5 mb-1.5">
                                  <Sparkles className="h-3.5 w-3.5 text-[#B87352]" />
                                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#B87352]">
                                    Lasting Operational Impact
                                  </span>
                                </div>
                                <div className="flex items-start gap-2.5 text-xs sm:text-sm font-medium">
                                  <CheckCircle2 className="h-4 w-4 text-[#B87352] shrink-0 mt-0.5" />
                                  <span>{item.illustrativeOutcome}</span>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Toggle Button */}
                    <div className="pt-6 border-t border-[#29483B]/10 mt-6">
                      <button
                        type="button"
                        onClick={() => setSelectedCase(isExpanded ? null : item.id)}
                        className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#29483B] hover:text-[#1e352b] transition-colors py-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#29483B]"
                      >
                        <span>{isExpanded ? "Collapse Dossier Summary" : "Examine Full Engagement Dossier"}</span>
                        <ChevronRight className={`h-4 w-4 text-[#B87352] transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
