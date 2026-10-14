"use client";

import React from "react";
import { Search, Compass, CheckCircle, ArrowRight, ShieldCheck } from "lucide-react";

const STAGES = [
  {
    step: "01",
    phase: "PHASE 01 · DIAGNOSTIC",
    name: "Discover",
    tagline: "Uncover institutional friction and evaluate root constraints.",
    duration: "Weeks 1 — 4",
    icon: Search,
    description: "We conduct confidential, structured interviews across leadership and operational frontline teams. We examine workflows, financial baselines, and cross-facility handovers to isolate root causes rather than treating surface symptoms.",
    activities: [
      "Key stakeholder discovery interviews",
      "Operational friction & capacity audits",
      "Data & workflow baseline mapping",
      "Executive alignment diagnostic report"
    ],
    primaryOutput: "Executive Diagnostic Dossier"
  },
  {
    step: "02",
    phase: "PHASE 02 · BLUEPRINT",
    name: "Define",
    tagline: "Architect an actionable roadmap with clear operational ownership.",
    duration: "Weeks 5 — 8",
    icon: Compass,
    description: "With an objective assessment established, we collaboratively define a pragmatic target operating model. We stress-test strategic assumptions against team bandwidth, capital constraints, and commercial milestones to eliminate ambiguity.",
    activities: [
      "Strategic priority trade-off analysis",
      "Sequenced 90-day milestone architecture",
      "Resource & operational ownership alignment",
      "Governance & measurement criteria definition"
    ],
    primaryOutput: "Sequenced 90-Day Execution Roadmap"
  },
  {
    step: "03",
    phase: "PHASE 03 · GOVERNANCE",
    name: "Deliver",
    tagline: "Embed beside leadership to turn intent into measurable results.",
    duration: "Weeks 9 — 16+",
    icon: CheckCircle,
    description: "Strategy without execution is merely intent. We remain embedded alongside leadership to orchestrate rollout, guide management through change friction, track milestone progress, and build self-sustaining internal capability.",
    activities: [
      "Sprint-based milestone orchestration",
      "Management coaching & change governance",
      "KPI tracking & cadence reviews",
      "Capability transfer & operational handover"
    ],
    primaryOutput: "Self-Sustaining Internal Cadence"
  }
];

export default function NorthlineApproach() {
  const handleScrollToContact = (e: React.MouseEvent) => {
    e.preventDefault();
    const contactElem = document.querySelector("#contact");
    if (contactElem) {
      contactElem.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section
      id="approach"
      aria-label="Advisory Methodology"
      className="relative bg-[#F7F5EF] py-20 sm:py-28 border-b border-[#29483B]/10"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        {/* Section Heading */}
        <div className="max-w-3xl mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="h-px w-7 bg-[#B87352]" />
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.24em] text-[#B87352]">
              ENGAGEMENT METHODOLOGY
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#252925] leading-tight mb-6">
            A disciplined, three-stage advisory process built around clarity.
          </h2>

          <p className="text-base sm:text-lg text-[#252925]/75 leading-relaxed font-normal">
            We reject convoluted consulting frameworks in favour of structured, transparent collaboration that respects your team&apos;s institutional knowledge and delivers permanent capability.
          </p>
        </div>

        {/* Infographic Visual Pipeline Bar (Desktop) */}
        <div className="hidden lg:grid grid-cols-3 gap-8 mb-10 pb-6 border-b border-[#29483B]/10">
          {STAGES.map((s, idx) => (
            <div key={s.step} className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-xs bg-[#29483B] text-xs font-serif font-bold text-[#F7F5EF]">
                {s.step}
              </span>
              <div className="flex-1">
                <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-[#B87352]">
                  {s.phase}
                </span>
                <span className="text-xs font-semibold text-[#252925]">{s.duration}</span>
              </div>
              {idx < 2 && (
                <div className="text-[#29483B]/30 pr-2">
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 3-Stage Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {STAGES.map((stage) => {
            const Icon = stage.icon;
            return (
              <div
                key={stage.step}
                className="group relative flex flex-col justify-between rounded-xs border border-[#29483B]/15 bg-white p-8 sm:p-9 shadow-xs transition-all duration-300 hover:border-[#29483B]/40 hover:shadow-lg"
              >
                {/* Decorative Top Accent line */}
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#29483B] opacity-0 group-hover:opacity-100 transition-opacity" />

                <div>
                  {/* Step Header */}
                  <div className="flex items-center justify-between mb-6 pb-5 border-b border-[#29483B]/10">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xs bg-[#29483B] text-base font-serif font-semibold text-[#F7F5EF] shadow-xs">
                        {stage.step}
                      </span>
                      <div>
                        <span className="block text-[9px] font-bold uppercase tracking-[0.2em] text-[#B87352]">
                          {stage.phase.split("·")[0]}
                        </span>
                        <span className="text-[11px] font-medium text-[#77796F]">
                          {stage.duration}
                        </span>
                      </div>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xs bg-[#E2E9E0]/60 text-[#29483B]">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>

                  {/* Stage Name */}
                  <h3 className="font-serif text-3xl font-normal text-[#252925] mb-2 group-hover:text-[#29483B] transition-colors">
                    {stage.name}
                  </h3>

                  {/* Tagline */}
                  <p className="text-xs font-semibold text-[#B87352] mb-4 leading-snug">
                    {stage.tagline}
                  </p>

                  {/* Detailed Description */}
                  <p className="text-sm text-[#252925]/75 leading-relaxed mb-6 font-normal">
                    {stage.description}
                  </p>

                  {/* Tangible Activities Checklist */}
                  <div className="pt-5 border-t border-[#29483B]/10 mb-6">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#77796F] mb-3">
                      Core Activities & Milestones
                    </h4>
                    <ul className="space-y-2.5">
                      {stage.activities.map((act, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-[#252925]/85">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#B87352] shrink-0" />
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Primary Output Deliverable Pill */}
                <div className="rounded-xs bg-[#E2E9E0]/50 p-3 border border-[#29483B]/10">
                  <span className="block text-[9px] font-bold uppercase tracking-[0.16em] text-[#77796F]">
                    Tangible Milestone Output
                  </span>
                  <span className="text-xs font-semibold text-[#29483B] mt-0.5 block">
                    {stage.primaryOutput}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Infographic Engagement Creed Box */}
        <div className="mt-16 sm:mt-20 rounded-xs border border-[#29483B]/15 bg-white p-7 sm:p-9 shadow-xs flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl flex items-start gap-4">
            <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-xs bg-[#29483B] text-[#F7F5EF]">
              <ShieldCheck className="h-5 w-5 text-[#B87352]" />
            </div>
            <div>
              <h4 className="font-serif text-xl font-normal text-[#252925] mb-1.5">
                Engagements designed to leave your leadership capable and independent.
              </h4>
              <p className="text-xs sm:text-sm text-[#252925]/75 leading-relaxed font-normal">
                Our definition of consulting excellence is not how long an engagement extends, but how quickly your internal management can confidently sustain and evolve the operating cadence without us.
              </p>
            </div>
          </div>

          <a
            href="#contact"
            onClick={handleScrollToContact}
            className="group shrink-0 inline-flex items-center gap-2 rounded-xs bg-[#29483B] px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#F7F5EF] shadow-xs hover:bg-[#1e352b] transition-all"
          >
            <span>Initiate Discovery Sprint</span>
            <ArrowRight className="h-3.5 w-3.5 text-[#B87352] transition-transform duration-200 group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </section>
  );
}
