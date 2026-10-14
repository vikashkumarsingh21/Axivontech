"use client";

import React, { useState, useEffect } from "react";
import { ArrowRight, Check, X, Clock, Layers, FileCheck, Compass, Sliders, Cpu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ServiceDetail } from "./types";

const SERVICES_DATA: (ServiceDetail & { icon: React.ElementType })[] = [
  {
    id: "strategy-growth",
    number: "01",
    title: "Strategy & Growth",
    icon: Compass,
    shortDescription: "Clarify business priorities, evaluate economic engines, and develop a pragmatic direction for the next stage of compounding growth.",
    detailedOverview: "We partner directly with executive teams to cut through internal noise and establish an actionable strategic mandate. Rather than producing shelf-ware strategy decks, we focus on identifying your core economic engines, evaluating commercial viability, and architecting an execution plan that your teams can actually deliver.",
    deliverables: [
      "Executive Strategic Baseline & Opportunity Map",
      "Market Positioning & Competitive Moat Assessment",
      "Prioritized Capital & Resource Allocation Model",
      "12-to-24 Month Sequenced Strategic Execution Roadmap"
    ],
    durationEstimate: "4 to 8 weeks initial diagnostic & strategy sprint",
    focusAreas: [
      "Growth vector prioritization",
      "Portfolio & product rationalization",
      "B2B go-to-market structure",
      "Executive decision governance"
    ]
  },
  {
    id: "operational-excellence",
    number: "02",
    title: "Operational Excellence",
    icon: Sliders,
    shortDescription: "Streamline cross-functional workflows, eliminate throughput bottlenecks, and install dependable operating cadences.",
    detailedOverview: "Growth often outpaces internal operating procedures, creating hidden friction, redundant handoffs, and communication breakdowns. We conduct rigorous operational analysis to streamline core business processes, eliminate throughput bottlenecks, and install dependable operating cadences.",
    deliverables: [
      "End-to-End Workflow & Bottleneck Diagnostics",
      "Standard Operating Procedures (SOP) Framework",
      "Cross-Functional Handover & Responsibility Matrices (RACI)",
      "Operational KPI Dashboard & Leadership Review Rhythms"
    ],
    durationEstimate: "6 to 12 weeks operational restructuring & coaching",
    focusAreas: [
      "Throughput cycle-time reduction",
      "Supply chain & procurement coordination",
      "Quality assurance governance",
      "Middle-management leadership enablement"
    ]
  },
  {
    id: "digital-transformation",
    number: "03",
    title: "Digital Transformation",
    icon: Cpu,
    shortDescription: "Bridge the gap between strategic intent and modern digital tooling without falling into expensive, high-risk software traps.",
    detailedOverview: "Technology should serve the business, not dictate it. We help non-technical and traditional B2B leaders evaluate, select, and integrate modern digital architectures without falling into high-risk, expensive software traps. We bridge the gap between strategic intent and technical execution.",
    deliverables: [
      "Current-State Technology & Tooling Audit",
      "Enterprise Architecture & Vendor Evaluation Matrix",
      "Iterative Phased Modernization Blueprint",
      "Team Adoption, Training & Change Management Plan"
    ],
    durationEstimate: "8 to 16 weeks architecture design & rollout governance",
    focusAreas: [
      "Legacy systems migration strategy",
      "Data pipeline & reporting visibility",
      "Internal tooling automation",
      "Vendor selection & negotiation oversight"
    ]
  }
];

export default function NorthlineServices() {
  const [activeModalService, setActiveModalService] = useState<(ServiceDetail & { icon: React.ElementType }) | null>(null);

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && activeModalService) {
        setActiveModalService(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeModalService]);

  const handleScrollToContact = (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveModalService(null);
    const contactElem = document.querySelector("#contact");
    if (contactElem) {
      contactElem.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section
      id="services"
      aria-label="Advisory Practices"
      className="relative bg-white py-20 sm:py-28 border-b border-[#29483B]/10"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        {/* Section Header */}
        <div className="max-w-3xl mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="h-px w-7 bg-[#B87352]" />
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.24em] text-[#B87352]">
              AREAS OF PRACTICE
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#252925] leading-tight mb-6">
            Focused advisory disciplines tailored to complex enterprise realities.
          </h2>

          <p className="text-base sm:text-lg text-[#252925]/75 leading-relaxed font-normal">
            We concentrate on three interrelated domains where rigorous strategy and hands-on operational governance produce quantifiable, compounding enterprise value.
          </p>
        </div>

        {/* 3 Services Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {SERVICES_DATA.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.id}
                className="group relative flex flex-col justify-between rounded-xs border border-[#29483B]/15 bg-[#F7F5EF]/50 p-8 sm:p-10 transition-all duration-300 hover:border-[#29483B]/40 hover:bg-[#F7F5EF] hover:shadow-[0_16px_40px_rgba(41,72,59,0.06)]"
              >
                {/* Subtle Top Copper Accent Border on Hover */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#B87352] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div>
                  {/* Top Bar: Number & Icon */}
                  <div className="flex items-center justify-between border-b border-[#29483B]/10 pb-5 mb-6">
                    <span className="font-serif text-2xl font-light text-[#B87352]">
                      {service.number}
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xs bg-[#E2E9E0]/80 text-[#29483B] transition-colors group-hover:bg-[#29483B] group-hover:text-[#F7F5EF]">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>

                  {/* Service Title */}
                  <h3 className="font-serif text-2xl font-normal text-[#252925] mb-3 group-hover:text-[#29483B] transition-colors">
                    {service.title}
                  </h3>

                  {/* Short Description */}
                  <p className="text-sm text-[#252925]/75 leading-relaxed mb-6 font-normal">
                    {service.shortDescription}
                  </p>

                  {/* Key Focus Points */}
                  <div className="space-y-2 mb-8 pt-4 border-t border-[#29483B]/8">
                    <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-[#77796F] mb-3">
                      Focus Vectors
                    </span>
                    {service.focusAreas.slice(0, 3).map((focus, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-[#252925]/85">
                        <span className="mt-1.5 h-1 w-1 rounded-full bg-[#B87352] shrink-0" />
                        <span>{focus}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Action & Timeline */}
                <div className="pt-6 border-t border-[#29483B]/10">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#77796F] mb-3">
                    <Clock className="h-3.5 w-3.5 text-[#B87352]" />
                    <span>{service.durationEstimate.split(" ")[0]} to {service.durationEstimate.split(" ")[2]} weeks typical scope</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveModalService(service)}
                    className="group/btn inline-flex w-full items-center justify-between text-xs font-semibold uppercase tracking-[0.14em] text-[#29483B] hover:text-[#1e352b] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#29483B] py-1"
                    aria-haspopup="dialog"
                  >
                    <span>Examine Practice Scope</span>
                    <ArrowRight className="h-3.5 w-3.5 text-[#B87352] transition-transform duration-200 group-hover/btn:translate-x-1" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Modal Drawer for Service Scope */}
      <AnimatePresence>
        {activeModalService && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-service-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#252925]/70 backdrop-blur-sm"
            onClick={() => setActiveModalService(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xs border border-[#29483B]/20 bg-[#F7F5EF] p-6 sm:p-10 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setActiveModalService(null)}
                className="absolute top-5 right-5 p-2 rounded-xs text-[#77796F] hover:text-[#252925] hover:bg-[#E2E9E0] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#29483B]"
                aria-label="Close service details"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Modal Header */}
              <div className="flex items-center gap-3 mb-3">
                <span className="font-serif text-lg font-light text-[#B87352]">
                  {activeModalService.number}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#77796F]">
                  ADVISORY SPECIFICATION
                </span>
              </div>

              <h3 id="modal-service-title" className="font-serif text-3xl font-normal text-[#252925] mb-4">
                {activeModalService.title}
              </h3>

              <p className="text-sm sm:text-base text-[#252925]/85 leading-relaxed mb-6 font-normal">
                {activeModalService.detailedOverview}
              </p>

              {/* Cadence callout */}
              <div className="mb-6 rounded-xs bg-[#E2E9E0]/70 p-4 border border-[#29483B]/10 flex items-center gap-3">
                <Clock className="h-5 w-5 text-[#29483B] shrink-0" />
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-[#77796F]">
                    Expected Engagement Cadence
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-[#252925]">
                    {activeModalService.durationEstimate}
                  </span>
                </div>
              </div>

              {/* Key Deliverables */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <FileCheck className="h-4 w-4 text-[#29483B]" />
                  <h4 className="text-xs font-bold uppercase tracking-[0.14em] text-[#252925]">
                    Tangible Artefacts & Deliverables
                  </h4>
                </div>
                <ul className="space-y-2.5">
                  {activeModalService.deliverables.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#252925]/90">
                      <Check className="h-4 w-4 text-[#29483B] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Focus Areas */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <Layers className="h-4 w-4 text-[#B87352]" />
                  <h4 className="text-xs font-bold uppercase tracking-[0.14em] text-[#252925]">
                    Core Focus Dimensions
                  </h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {activeModalService.focusAreas.map((area, idx) => (
                    <span
                      key={idx}
                      className="inline-block rounded-xs bg-white px-3 py-1.5 text-xs text-[#252925] border border-[#29483B]/15"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between pt-6 border-t border-[#29483B]/10">
                <button
                  type="button"
                  onClick={() => setActiveModalService(null)}
                  className="text-xs font-medium text-[#77796F] hover:text-[#252925] uppercase tracking-wider"
                >
                  Close Specification
                </button>

                <a
                  href="#contact"
                  onClick={handleScrollToContact}
                  className="inline-flex items-center gap-2 rounded-xs bg-[#29483B] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#F7F5EF] hover:bg-[#1e352b] transition-colors"
                >
                  <span>Discuss {activeModalService.title}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-[#B87352]" />
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
