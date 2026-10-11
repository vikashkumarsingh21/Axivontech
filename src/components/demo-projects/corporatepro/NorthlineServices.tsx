"use client";

import React, { useState } from "react";
import { ArrowRight, Check, X, Clock, Layers, FileCheck } from "lucide-react";
import { ServiceDetail } from "./types";

const SERVICES_DATA: ServiceDetail[] = [
  {
    id: "strategy-growth",
    number: "01",
    title: "Strategy & Growth",
    shortDescription: "Clarify business priorities, evaluate opportunities, and develop a practical direction for the next stage of growth.",
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
    shortDescription: "Improve workflows, simplify processes, and help teams work with greater consistency and purpose.",
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
    shortDescription: "Connect business goals with thoughtful digital tools and more effective ways of working.",
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
  const [activeModalService, setActiveModalService] = useState<ServiceDetail | null>(null);

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
      aria-label="Advisory Services"
      className="relative bg-white py-20 sm:py-28 border-b border-[#29483B]/10"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        {/* Section Header */}
        <div className="max-w-3xl mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="h-px w-6 bg-[#B87352]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#B87352]">
              AREAS OF PRACTICE
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[#252925] leading-tight mb-6">
            Focused advisory disciplines tailored to complex business realities.
          </h2>

          <p className="text-base sm:text-lg text-[#252925]/75 leading-relaxed">
            We concentrate on three interrelated domains where thoughtful strategy and disciplined execution create the greatest enterprise value.
          </p>
        </div>

        {/* 3 Services Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {SERVICES_DATA.map((service) => (
            <div
              key={service.id}
              className="group flex flex-col justify-between rounded-sm border border-[#29483B]/15 bg-[#F7F5EF]/60 p-8 sm:p-10 transition-all duration-300 hover:border-[#29483B]/40 hover:bg-[#F7F5EF] hover:shadow-[0_12px_36px_rgba(41,72,59,0.06)]"
            >
              <div>
                {/* Service Number & Category */}
                <div className="flex items-center justify-between border-b border-[#29483B]/10 pb-6 mb-6">
                  <span className="font-serif text-2xl font-semibold text-[#B87352]">
                    {service.number}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#77796F]">
                    PRACTICE PILLAR
                  </span>
                </div>

                {/* Service Title */}
                <h3 className="font-serif text-2xl font-medium text-[#252925] mb-4 group-hover:text-[#29483B] transition-colors">
                  {service.title}
                </h3>

                {/* Short Description */}
                <p className="text-sm text-[#252925]/80 leading-relaxed mb-8">
                  {service.shortDescription}
                </p>

                {/* Core Focus Tags */}
                <div className="space-y-2 mb-8">
                  {service.focusAreas.slice(0, 3).map((focus, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-[#77796F]">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#29483B]" />
                      <span>{focus}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive Detail Trigger */}
              <div className="pt-6 border-t border-[#29483B]/10">
                <button
                  type="button"
                  onClick={() => setActiveModalService(service)}
                  className="inline-flex w-full items-center justify-between text-xs font-semibold uppercase tracking-[0.12em] text-[#29483B] hover:text-[#1f372d] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#29483B] rounded-sm py-1"
                  aria-haspopup="dialog"
                >
                  <span>Explore Service Scope</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Modal Drawer for Service Scope */}
      {activeModalService && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-service-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#252925]/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setActiveModalService(null)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-sm border border-[#29483B]/20 bg-[#F7F5EF] p-6 sm:p-10 shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setActiveModalService(null)}
              className="absolute top-5 right-5 p-2 rounded-sm text-[#77796F] hover:text-[#252925] hover:bg-[#E2E9E0] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#29483B]"
              aria-label="Close service details"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-3">
              <span className="font-serif text-lg font-bold text-[#B87352]">
                {activeModalService.number}
              </span>
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#77796F]">
                SERVICE SPECIFICATION
              </span>
            </div>

            <h3 id="modal-service-title" className="font-serif text-3xl font-medium text-[#252925] mb-4">
              {activeModalService.title}
            </h3>

            <p className="text-sm sm:text-base text-[#252925]/85 leading-relaxed mb-6">
              {activeModalService.detailedOverview}
            </p>

            {/* Engagement Timeline */}
            <div className="mb-6 rounded-sm bg-[#E2E9E0]/60 p-4 border border-[#29483B]/10 flex items-center gap-3">
              <Clock className="h-5 w-5 text-[#29483B] shrink-0" />
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-[#77796F]">
                  Typical Engagement Cadence
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
                  Concrete Deliverables & Artefacts
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

            {/* Advisory Focus Areas */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <Layers className="h-4 w-4 text-[#B87352]" />
                <h4 className="text-xs font-bold uppercase tracking-[0.14em] text-[#252925]">
                  Key Focus Areas
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

            {/* CTA in Modal */}
            <div className="flex items-center justify-between pt-6 border-t border-[#29483B]/10">
              <button
                type="button"
                onClick={() => setActiveModalService(null)}
                className="text-xs font-medium text-[#77796F] hover:text-[#252925] uppercase tracking-wider"
              >
                Close Window
              </button>

              <a
                href="#contact"
                onClick={handleScrollToContact}
                className="inline-flex items-center gap-2 rounded-sm bg-[#29483B] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#F7F5EF] hover:bg-[#1f372d] transition-colors"
              >
                <span>Discuss {activeModalService.title}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
