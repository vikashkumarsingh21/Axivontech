"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FACULTY_MEMBERS, FacultyMember } from "@/data/edusmart-data";
import { Sparkles, ArrowRight, X, GraduationCap } from "lucide-react";

export default function EduSmartFaculty() {
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyMember | null>(null);

  return (
    <section
      id="faculty"
      aria-labelledby="faculty-heading"
      className="relative border-t border-[#E8E1EB] bg-white py-16 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-[#B89557]">
            <Sparkles className="h-3.5 w-3.5 text-[#33243B]" />
            <span>Academic Mentorship</span>
          </div>

          <h2
            id="faculty-heading"
            className="mt-3 font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#27232A]"
          >
            Distinguished Faculty
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[#27232A]/80 leading-relaxed">
            Our educators are dedicated scholars, practitioners, and mentors who guide students
            through rigorous academic inquiry and practical scholarship.
          </p>
        </div>

        {/* 4 Faculty Profiles Grid */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FACULTY_MEMBERS.map((fac) => (
            <article
              key={fac.id}
              className="group flex flex-col justify-between rounded-3xl border border-[#E8E1EB] bg-[#F7F3EB]/50 p-6 shadow-sm transition-all hover:border-[#33243B]/40 hover:bg-[#F7F3EB]"
            >
              <div>
                <div className="relative h-64 w-full overflow-hidden rounded-2xl border border-[#E8E1EB]">
                  <Image
                    src={fac.imageSrc}
                    alt={fac.name}
                    fill
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="mt-5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#B89557]">
                    {fac.department}
                  </span>
                  <h3 className="font-serif text-xl font-bold text-[#27232A]">
                    {fac.name}
                  </h3>
                  <p className="text-xs text-[#33243B] font-medium">
                    {fac.title}
                  </p>
                  <p className="mt-2 text-xs text-[#27232A]/70 leading-relaxed line-clamp-2">
                    {fac.bio}
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-[#E8E1EB]">
                <button
                  type="button"
                  onClick={() => setSelectedFaculty(fac)}
                  className="inline-flex w-full items-center justify-between text-xs font-semibold text-[#33243B] hover:text-[#523A5E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#33243B]"
                >
                  <span>View Full Profile</span>
                  <ArrowRight className="h-3.5 w-3.5 text-[#B89557]" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Accessible Profile Modal */}
      {selectedFaculty && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-fac-name"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 sm:p-6 backdrop-blur-sm"
        >
          <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-[#D9D1DE] bg-white p-6 sm:p-8 shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedFaculty(null)}
              aria-label="Close modal"
              className="absolute top-5 right-5 rounded-full p-2 text-[#27232A]/70 hover:bg-[#E8E1EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#33243B]"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="relative h-44 w-36 shrink-0 overflow-hidden rounded-2xl border border-[#E8E1EB]">
                <Image
                  src={selectedFaculty.imageSrc}
                  alt={selectedFaculty.name}
                  fill
                  className="object-cover object-top"
                />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#B89557]">
                  {selectedFaculty.department}
                </span>
                <h3 id="modal-fac-name" className="font-serif text-2xl font-bold text-[#33243B]">
                  {selectedFaculty.name}
                </h3>
                <p className="text-sm font-medium text-[#27232A]/80">
                  {selectedFaculty.title}
                </p>

                <div className="mt-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#33243B]">
                    Primary Research Focus
                  </h4>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {selectedFaculty.expertise.map((exp) => (
                      <span
                        key={exp}
                        className="rounded-full bg-[#E8E1EB] px-2.5 py-0.5 text-[11px] font-medium text-[#33243B]"
                      >
                        {exp}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-6 text-sm text-[#27232A]/80 leading-relaxed border-t border-[#E8E1EB] pt-4">
              {selectedFaculty.bio}
            </p>

            <p className="mt-4 text-[11px] italic text-[#27232A]/60">
              *Fictional academic faculty profile for demonstration purposes.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
