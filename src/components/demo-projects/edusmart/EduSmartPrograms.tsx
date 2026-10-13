"use client";

import React, { useState } from "react";
import { ACADEMIC_PROGRAMS, AcademicProgram } from "@/data/edusmart-data";
import { Sparkles, ArrowRight, CheckCircle2, BookOpen, Clock, X } from "lucide-react";

export default function EduSmartPrograms() {
  const [filter, setFilter] = useState<"all" | "undergraduate" | "postgraduate" | "executive">("all");
  const [selectedProgram, setSelectedProgram] = useState<AcademicProgram | null>(null);

  const filteredPrograms =
    filter === "all"
      ? ACADEMIC_PROGRAMS
      : ACADEMIC_PROGRAMS.filter((p) => p.category === filter);

  return (
    <section
      id="programs"
      aria-labelledby="programs-heading"
      className="relative bg-[#F7F3EB] py-16 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-[#B89557]">
            <Sparkles className="h-3.5 w-3.5 text-[#33243B]" />
            <span>Academic Pathways</span>
          </div>

          <h2
            id="programs-heading"
            className="mt-4 font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#27232A]"
          >
            Explore Your Areas of Interest
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[#27232A]/80">
            Discover a selection of sample academic pathways offered as part of this
            educational website demonstration. Each curriculum blends theoretical depth
            with collaborative inquiry.
          </p>
        </div>

        {/* Filter Navigation */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
          {[
            { id: "all", label: "All Pathways" },
            { id: "undergraduate", label: "Undergraduate Studies" },
            { id: "postgraduate", label: "Postgraduate Studies" },
            { id: "executive", label: "Foundation & Executive" },
          ].map((tab) => {
            const isSelected = filter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id as typeof filter)}
                aria-pressed={isSelected}
                className={`rounded-full px-5 py-2.5 text-xs sm:text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#33243B] focus-visible:ring-offset-2 ${
                  isSelected
                    ? "bg-[#33243B] text-white shadow-md"
                    : "border border-[#E8E1EB] bg-white text-[#27232A]/80 hover:border-[#33243B]/40 hover:bg-[#E8E1EB]/50"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Programs Grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPrograms.map((prog) => (
            <article
              key={prog.id}
              className="group flex flex-col justify-between rounded-2xl border border-[#E8E1EB] bg-white p-7 shadow-sm transition-all hover:border-[#33243B]/40 hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-[#B89557] font-semibold uppercase tracking-wider">
                  <span>{prog.categoryLabel}</span>
                  <span className="flex items-center gap-1 text-[#27232A]/60 lowercase text-[11px]">
                    <Clock className="h-3 w-3" />
                    {prog.duration}
                  </span>
                </div>

                <h3 className="mt-3 font-serif text-xl sm:text-2xl font-bold text-[#27232A] transition-colors group-hover:text-[#33243B]">
                  {prog.name}
                </h3>

                <p className="mt-3 text-sm text-[#27232A]/75 leading-relaxed line-clamp-3">
                  {prog.overview}
                </p>

                <div className="mt-5 border-t border-[#F0EBE5] pt-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#33243B]">
                    Core Study Focus:
                  </p>
                  <p className="mt-1 text-xs text-[#27232A]/80 font-medium">
                    {prog.keyFocus}
                  </p>
                </div>
              </div>

              <div className="mt-7 pt-4 border-t border-[#F0EBE5]">
                <button
                  type="button"
                  onClick={() => setSelectedProgram(prog)}
                  className="inline-flex w-full items-center justify-between rounded-xl bg-[#F7F3EB] px-4 py-2.5 text-xs font-semibold text-[#33243B] transition-colors hover:bg-[#E8E1EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#33243B]"
                >
                  <span>View Curriculum Blueprint</span>
                  <ArrowRight className="h-3.5 w-3.5 text-[#B89557]" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Program Details Modal */}
      {selectedProgram && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-prog-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 sm:p-6 backdrop-blur-sm"
        >
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-[#D9D1DE] bg-white p-6 sm:p-10 shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedProgram(null)}
              aria-label="Close modal"
              className="absolute top-5 right-5 rounded-full p-2 text-[#27232A]/70 hover:bg-[#E8E1EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#33243B]"
            >
              <X className="h-5 w-5" />
            </button>

            <span className="text-xs font-bold uppercase tracking-widest text-[#B89557]">
              {selectedProgram.categoryLabel} · {selectedProgram.duration}
            </span>

            <h3
              id="modal-prog-title"
              className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-[#33243B]"
            >
              {selectedProgram.name}
            </h3>

            <p className="mt-4 text-base text-[#27232A]/80 leading-relaxed">
              {selectedProgram.overview}
            </p>

            <div className="mt-6 rounded-2xl bg-[#F7F3EB] p-5 border border-[#E8E1EB]">
              <h4 className="font-serif text-base font-bold text-[#33243B]">
                Curriculum Highlights & Modules
              </h4>
              <ul className="mt-3 space-y-2">
                {selectedProgram.curriculumHighlights.map((mod) => (
                  <li key={mod} className="flex items-center gap-2 text-xs sm:text-sm text-[#27232A]/85">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[#B89557]" />
                    <span>{mod}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[#E8E1EB] pt-6">
              <span className="text-xs text-[#27232A]/60">
                Sample academic structure for showcase demonstration.
              </span>
              <a
                href="#admissions"
                onClick={() => setSelectedProgram(null)}
                className="inline-flex items-center gap-2 rounded-full bg-[#33243B] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#483353]"
              >
                <span>Enquire about this program</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#B89557]" />
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
