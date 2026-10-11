"use client";

import React, { useState } from "react";
import Image from "next/image";
import { CheckCircle2, ChevronRight, Info } from "lucide-react";
import { CaseStudy } from "./types";

const CASE_STUDIES: CaseStudy[] = [
  {
    id: "operational-harmonization",
    category: "Operational Restructuring & Supply Chain",
    title: "Multi-facility Operational Harmonization",
    briefDescription: "Clarifying operational workflows and inventory coordination across distributed regional hubs.",
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
    briefDescription: "Transitioning legacy spreadsheet-driven tracking into unified, transparent reporting infrastructure.",
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
              <span className="h-px w-6 bg-[#B87352]" />
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#B87352]">
                SELECTED ENGAGEMENTS
              </span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[#252925] leading-tight mb-4">
              Illustrative engagements demonstrating practical execution.
            </h2>

            <p className="text-base sm:text-lg text-[#252925]/75 leading-relaxed">
              Real business transformations occur at the intersection of clear strategy, process redesign, and cross-functional leadership alignment.
            </p>
          </div>

          {/* Demonstration Notice */}
          <div className="shrink-0 rounded-sm border border-[#29483B]/15 bg-[#F7F5EF] p-4 max-w-sm">
            <div className="flex items-start gap-2.5">
              <Info className="h-4 w-4 text-[#29483B] shrink-0 mt-0.5" />
              <p className="text-xs text-[#77796F] leading-relaxed">
                <span className="font-semibold text-[#252925]">Demonstration Case Models:</span> Prepared for the Axivon CorporatePro showcase to illustrate advisory problem-solving structure.
              </p>
            </div>
          </div>
        </div>

        {/* Case Studies Grid */}
        <div className="space-y-16 sm:space-y-24">
          {CASE_STUDIES.map((item, index) => {
            const isExpanded = selectedCase === item.id;
            const isReversed = index % 2 === 1;

            return (
              <div
                key={item.id}
                className="rounded-sm border border-[#29483B]/15 bg-[#F7F5EF]/40 p-6 sm:p-10 lg:p-12 transition-all duration-300 hover:border-[#29483B]/30 hover:bg-[#F7F5EF]/70 shadow-sm"
              >
                <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center ${isReversed ? "lg:grid-flow-dense" : ""}`}>
                  {/* Visual Column */}
                  <div className={`lg:col-span-5 relative ${isReversed ? "lg:col-start-8" : ""}`}>
                    <div className="relative aspect-[16/10] sm:aspect-[4/3] w-full overflow-hidden rounded-sm border border-[#29483B]/15 bg-white shadow-md">
                      <Image
                        src={item.imageSrc}
                        alt={item.imageAlt}
                        fill
                        sizes="(max-width: 768px) 100vw, 45vw"
                        className="object-cover object-center transition-transform duration-500 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#252925]/30 to-transparent pointer-events-none" />
                      <div className="absolute top-3 left-3 bg-[#F7F5EF]/95 backdrop-blur-md px-3 py-1 rounded-xs border border-[#29483B]/10 text-[10px] font-bold uppercase tracking-[0.16em] text-[#29483B]">
                        Case 0{index + 1}
                      </div>
                    </div>
                  </div>

                  {/* Narrative Column */}
                  <div className={`lg:col-span-7 flex flex-col justify-center ${isReversed ? "lg:col-start-1" : ""}`}>
                    {/* Category */}
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#B87352] mb-3">
                      {item.category}
                    </span>

                    {/* Title */}
                    <h3 className="font-serif text-2xl sm:text-3xl font-medium text-[#252925] mb-4">
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
                          className="rounded-xs bg-[#E2E9E0]/70 px-2.5 py-1 text-xs font-medium text-[#29483B]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Expandable Case Diagnostics */}
                    <div className="space-y-4 pt-4 border-t border-[#29483B]/10">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#77796F]">
                          The Situation & Friction
                        </span>
                        <p className="mt-1 text-xs sm:text-sm text-[#252925]/85 leading-relaxed">
                          {item.challenge}
                        </p>
                      </div>

                      {isExpanded && (
                        <div className="space-y-4 pt-2 animate-in fade-in duration-300">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#29483B]">
                              Advisory Intervention
                            </span>
                            <p className="mt-1 text-xs sm:text-sm text-[#252925]/85 leading-relaxed">
                              {item.approach}
                            </p>
                          </div>

                          <div className="rounded-sm bg-white p-4 border border-[#29483B]/15">
                            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#B87352]">
                              Illustrative Business Outcome
                            </span>
                            <div className="mt-1 flex items-start gap-2 text-xs sm:text-sm font-medium text-[#252925]">
                              <CheckCircle2 className="h-4 w-4 text-[#29483B] shrink-0 mt-0.5" />
                              <span>{item.illustrativeOutcome}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => setSelectedCase(isExpanded ? null : item.id)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#29483B] hover:text-[#1f372d] transition-colors py-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#29483B]"
                      >
                        <span>{isExpanded ? "Collapse Case Details" : "Read Full Engagement Profile"}</span>
                        <ChevronRight className={`h-3.5 w-3.5 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
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
