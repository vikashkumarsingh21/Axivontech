"use client";

import React from "react";
import { Search, Compass, CheckCircle } from "lucide-react";

const STAGES = [
  {
    step: "01",
    name: "Discover",
    tagline: "Understand the business, its constraints, and its priorities.",
    icon: Search,
    description: "We begin by conducting confidential, structured interviews across leadership and operational frontline teams. We examine existing operational workflows, financial metrics, and cultural dynamics to uncover the root causes of friction rather than treating surface symptoms.",
    activities: [
      "Key stakeholder discovery interviews",
      "Operational friction & capacity audits",
      "Data & workflow baseline mapping",
      "Executive alignment diagnostic report"
    ]
  },
  {
    step: "02",
    name: "Define",
    tagline: "Establish an appropriate direction and practical plan.",
    icon: Compass,
    description: "With an objective assessment established, we collaboratively define a pragmatic target state. We stress-test strategic assumptions against team bandwidth, capital constraints, and commercial timelines to deliver a sequenced roadmap that eliminates ambiguity.",
    activities: [
      "Strategic priority trade-off analysis",
      "Sequenced 90-day milestone architecture",
      "Resource & operational ownership alignment",
      "Governance & measurement criteria definition"
    ]
  },
  {
    step: "03",
    name: "Deliver",
    tagline: "Turn the agreed plan into coordinated, actionable work.",
    icon: CheckCircle,
    description: "Strategy without execution is merely intent. We remain embedded alongside leadership to orchestrate rollout, guide management through change friction, track milestone progress, and build self-sustaining internal capability that lasts long after we conclude.",
    activities: [
      "Sprint-based milestone orchestration",
      "Management coaching & change governance",
      "KPI tracking & cadence reviews",
      "Capability transfer & operational handover"
    ]
  }
];

export default function NorthlineApproach() {
  return (
    <section
      id="approach"
      aria-label="Advisory Approach"
      className="relative bg-[#F7F5EF] py-20 sm:py-28 border-b border-[#29483B]/10"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        {/* Section Heading */}
        <div className="max-w-3xl mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="h-px w-6 bg-[#B87352]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#B87352]">
              METHODOLOGY & ENGAGEMENT
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[#252925] leading-tight mb-6">
            A disciplined, three-stage advisory process built around clarity.
          </h2>

          <p className="text-base sm:text-lg text-[#252925]/75 leading-relaxed">
            We reject convoluted consulting frameworks in favour of structured, transparent collaboration that respects your team&apos;s time and institutional knowledge.
          </p>
        </div>

        {/* 3-Stage Progression */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Subtle horizontal connecting line on desktop */}
          <div className="hidden md:block absolute top-12 left-10 right-10 h-px bg-[#29483B]/20 pointer-events-none" />

          {STAGES.map((stage) => {
            const Icon = stage.icon;
            return (
              <div
                key={stage.step}
                className="relative flex flex-col justify-between rounded-sm border border-[#29483B]/15 bg-white p-8 sm:p-9 shadow-sm transition-all duration-300 hover:border-[#29483B]/40 hover:shadow-md"
              >
                <div>
                  {/* Step Badge */}
                  <div className="flex items-center justify-between mb-8">
                    <span className="flex h-12 w-12 items-center justify-center rounded-sm bg-[#29483B] text-base font-serif font-bold text-[#F7F5EF] shadow-sm">
                      {stage.step}
                    </span>
                    <Icon className="h-6 w-6 text-[#B87352]" />
                  </div>

                  {/* Stage Name */}
                  <h3 className="font-serif text-2xl font-medium text-[#252925] mb-2">
                    {stage.name}
                  </h3>

                  {/* Tagline */}
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#29483B] mb-4">
                    {stage.tagline}
                  </p>

                  {/* Detailed Description */}
                  <p className="text-sm text-[#252925]/80 leading-relaxed mb-6">
                    {stage.description}
                  </p>
                </div>

                {/* Key Activities List */}
                <div className="pt-6 border-t border-[#29483B]/10">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#77796F] mb-3">
                    Stage Focus & Deliverables
                  </h4>
                  <ul className="space-y-2">
                    {stage.activities.map((act, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs text-[#252925]/85">
                        <span className="h-1 w-1 rounded-full bg-[#B87352]" />
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Advisory Principle Quote Box */}
        <div className="mt-16 sm:mt-20 rounded-sm border border-[#29483B]/15 bg-[#E2E9E0]/40 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="max-w-2xl">
            <h4 className="font-serif text-lg font-medium text-[#252925] mb-1">
              Engagements designed to leave your organization capable and independent.
            </h4>
            <p className="text-xs sm:text-sm text-[#252925]/75 leading-relaxed">
              Our measure of success is not how long an advisory engagement extends, but how quickly your internal leadership can own and sustain the improved operational cadence.
            </p>
          </div>

          <a
            href="#contact"
            className="shrink-0 inline-flex items-center gap-2 rounded-sm bg-[#29483B] px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#F7F5EF] hover:bg-[#1f372d] transition-colors"
          >
            Schedule Initial Discovery
          </a>
        </div>
      </div>
    </section>
  );
}
