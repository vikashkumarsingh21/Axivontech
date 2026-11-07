"use client";

import React, { useState } from "react";
import { AcademicWing } from "./types";
import { BookOpen, Clock, Users, CheckCircle2, ChevronRight, FileText, X } from "lucide-react";

export default function OakfieldAcademics() {
  const wings: AcademicWing[] = [
    {
      id: "eyfs",
      name: "Early Years Wing",
      grades: "Nursery, LKG & UKG (Ages 3 to 5)",
      tagline: "Play-Way Foundation, Sensory Literacy & Joyful Wonder",
      description:
        "The early childhood learning journey at Oakfield focuses on motor skills, phonics, socio-emotional development, curiosity-driven storytelling, and nature observation in dedicated kindergarten pods.",
      features: [
        "Jolly Phonics multi-sensory reading framework",
        "Concrete-to-abstract sensory mathematics",
        "Reggio Emilia inspired outdoor play garden",
        "No homework; 100% joyful active discovery",
        "Full-time pediatric nursing and trained nanny support",
      ],
      timing: "8:30 AM – 12:30 PM",
      ratio: "1:10 (Teacher to Child)",
      subjects: ["Early Literacy & Phonics", "Sensory Numeracy", "Environmental Awareness", "Rhythm & Music", "Motor Skills Gym"],
    },
    {
      id: "primary",
      name: "Primary Wing",
      grades: "Grades I to V (Ages 6 to 10)",
      tagline: "Foundational Competence, Experiential Science & Creativity",
      description:
        "In primary school, learners build strong language foundations in English, Hindi, and regional languages while developing mathematical thinking, environmental responsibility, and creative expression.",
      features: [
        "Singapore Math heuristic problem-solving model",
        "Hands-on science kits & daily observation journals",
        "Weekly public speaking, elocution & theater sessions",
        "Introduction to computational logic & Scratch block coding",
        "Compulsory swimming & athletics rotation",
      ],
      timing: "8:00 AM – 2:30 PM",
      ratio: "1:15 (Teacher to Child)",
      subjects: ["English Language & Literature", "Mathematics", "Science & Discovery", "Hindi / Sanskrit / French", "Social Studies", "Art & Craft", "Physical Education"],
    },
    {
      id: "middle",
      name: "Middle School Wing",
      grades: "Grades VI to VIII (Ages 11 to 13)",
      tagline: "Disciplinary Depth, Analytical Inquiry & STEM Innovation",
      description:
        "Middle school bridges general curiosity with deep subject inquiry. Students work in advanced physics, chemistry, and biology laboratories and engage with robotics and Model United Nations (MUN).",
      features: [
        "Dedicated physics, chemistry, and biology laboratories",
        "Lego Mindstorms robotics & micro-controller coding",
        "Debating society, MUN training, and editorial club",
        "Third language options: Sanskrit, French, or German",
        "Inter-house sports leagues and leadership councils",
      ],
      timing: "7:45 AM – 3:00 PM",
      ratio: "1:18 (Teacher to Student)",
      subjects: ["Advanced Physics", "Chemistry", "Biology", "Algebra & Geometry", "World History & Civics", "Geography", "Computer Science (Python)", "Third Language", "Visual & Performing Arts"],
    },
    {
      id: "senior",
      name: "Senior Secondary Wing",
      grades: "Grades IX to XII (Ages 14 to 18)",
      tagline: "CBSE Board Mastery, Career Pathways & Research Rigor",
      description:
        "Our Senior Secondary program prepares students for top CBSE board examination percentiles and competitive university entrances worldwide. Choose between Science, Commerce, and Humanities streams with integrated career coaching.",
      features: [
        "Three specialized academic streams: Science, Commerce, and Humanities",
        "Dedicated career counseling & university admissions desk (India & Abroad)",
        "JEE / NEET / CLAT / CUET integrated academic support",
        "Senior capstone research paper under mentor faculty",
        "Consistent 100% CBSE board pass rate with 42% scoring >90%",
      ],
      timing: "7:30 AM – 3:30 PM",
      ratio: "1:20 (Teacher to Student)",
      subjects: [
        "Stream A (Science): Physics, Chemistry, Mathematics, Biology, Computer Science (Python/SQL)",
        "Stream B (Commerce): Accountancy, Business Studies, Economics, Applied Mathematics, Informatics",
        "Stream C (Humanities): Psychology, Political Science, Economics, History, Sociology, English Core",
      ],
    },
  ];

  const [selectedWingId, setSelectedWingId] = useState("senior");
  const [syllabusModal, setSyllabusModal] = useState<AcademicWing | null>(null);

  const activeWing = wings.find((w) => w.id === selectedWingId) || wings[3];

  return (
    <section id="academics" className="py-20 bg-[#faf8f4] text-[#18231d] border-b border-[#e2d9c8]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-[#c8a24d]">
            Curriculum &amp; Pedagogical Architecture
          </span>
          <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-bold text-[#143d30]">
            Four Progressive Academic Wings
          </h2>
          <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#4f5e55]">
            From early sensory play to advanced CBSE Board and university preparation, Oakfield provides an unbroken continuum of academic excellence.
          </p>
        </div>

        {/* Wing Tabs */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10">
          {wings.map((wing) => {
            const isSelected = wing.id === selectedWingId;
            return (
              <button
                key={wing.id}
                onClick={() => setSelectedWingId(wing.id)}
                className={`rounded-full px-5 py-2.5 text-xs sm:text-sm font-semibold transition-all focus:outline-none ${
                  isSelected
                    ? "bg-[#143d30] text-[#faf8f4] shadow-md border border-[#c8a24d]/40 scale-105"
                    : "bg-[#f4efe4] text-[#4f5e55] hover:bg-[#ece4d5] hover:text-[#143d30] border border-[#e2d9c8]"
                }`}
              >
                <span>{wing.name}</span>
              </button>
            );
          })}
        </div>

        {/* Active Wing Content Card */}
        <div className="rounded-3xl border border-[#e2d9c8] bg-[#f4efe4] p-8 sm:p-12 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 7 cols: Overview & Features */}
            <div className="lg:col-span-7">
              <div className="flex items-center gap-3 mb-3">
                <span className="rounded-md bg-[#143d30] px-3 py-1 text-xs font-bold text-[#c8a24d]">
                  {activeWing.grades}
                </span>
                <span className="text-xs text-[#718278]">•</span>
                <span className="text-xs text-[#143d30] font-semibold">CBSE Aligned &amp; Enriched</span>
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#143d30]">
                {activeWing.name}
              </h3>
              <p className="text-sm font-semibold text-[#c8a24d] mt-1">
                {activeWing.tagline}
              </p>

              <p className="mt-4 text-xs sm:text-sm leading-relaxed text-[#4f5e55]">
                {activeWing.description}
              </p>

              {/* Distinctive Features */}
              <div className="mt-6 space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#143d30]">
                  Wing Highlights &amp; Methodology:
                </h4>
                {activeWing.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#2c3d33]">
                    <CheckCircle2 className="h-4 w-4 text-[#c8a24d] shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              {/* Quick Action */}
              <div className="mt-8 pt-6 border-t border-[#dfd4c0] flex flex-wrap items-center gap-4">
                <button
                  onClick={() => setSyllabusModal(activeWing)}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#143d30] px-5 py-2.5 text-xs font-bold text-[#faf8f4] hover:bg-[#1a4e3e] transition-colors"
                >
                  <FileText className="h-3.5 w-3.5 text-[#c8a24d]" />
                  <span>View Full Curriculum Outline</span>
                </button>
              </div>
            </div>

            {/* Right 5 cols: Key Telemetry & Subjects Box */}
            <div className="lg:col-span-5 space-y-6">
              {/* Telemetry card */}
              <div className="rounded-2xl border border-[#dfd4c0] bg-[#faf8f4] p-6 shadow-sm">
                <h4 className="font-serif text-base font-bold text-[#143d30] mb-4">
                  Operational Parameters
                </h4>
                <div className="space-y-4 text-xs text-[#4f5e55]">
                  <div className="flex items-center justify-between pb-3 border-b border-[#ece4d5]">
                    <span className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-[#c8a24d]" />
                      <span>School Hours:</span>
                    </span>
                    <span className="font-bold text-[#18231d]">{activeWing.timing}</span>
                  </div>

                  <div className="flex items-center justify-between pb-3 border-b border-[#ece4d5]">
                    <span className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-[#c8a24d]" />
                      <span>Classroom Ratio:</span>
                    </span>
                    <span className="font-bold text-[#18231d]">{activeWing.ratio}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-[#c8a24d]" />
                      <span>Pedagogy Model:</span>
                    </span>
                    <span className="font-bold text-[#143d30]">Inquiry-Based CBSE</span>
                  </div>
                </div>
              </div>

              {/* Subjects Preview */}
              <div className="rounded-2xl border border-[#dfd4c0] bg-[#faf8f4] p-6 shadow-sm">
                <h4 className="font-serif text-base font-bold text-[#143d30] mb-3">
                  Disciplines &amp; Key Subjects
                </h4>
                <div className="flex flex-wrap gap-2">
                  {activeWing.subjects.map((subj, i) => (
                    <span
                      key={i}
                      className="rounded-lg border border-[#e2d9c8] bg-[#f4efe4] px-3 py-1 text-[11px] font-medium text-[#2c3d33]"
                    >
                      {subj}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Curriculum Modal */}
      {syllabusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-[#c8a24d]/40 bg-[#faf8f4] p-6 sm:p-8 shadow-2xl text-[#18231d]">
            <div className="flex items-center justify-between border-b border-[#e2d9c8] pb-4 mb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#c8a24d]">
                  Curriculum Dossier
                </span>
                <h3 className="font-serif text-xl font-bold text-[#143d30]">
                  {syllabusModal.name} — Academic Blueprint
                </h3>
              </div>
              <button
                onClick={() => setSyllabusModal(null)}
                className="rounded-lg p-1.5 text-[#718278] hover:bg-[#f4efe4] hover:text-[#18231d]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-[#4f5e55]">
              <p>
                <strong className="text-[#143d30]">Grade Levels:</strong> {syllabusModal.grades}
              </p>
              <p>
                <strong className="text-[#143d30]">Learning Objectives:</strong> {syllabusModal.description}
              </p>
              <div>
                <strong className="text-[#143d30] block mb-2">Prescribed Core Subjects:</strong>
                <ul className="list-disc pl-5 space-y-1">
                  {syllabusModal.subjects.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl bg-[#f4efe4] border border-[#e2d9c8] p-4 text-xs text-[#2c3d33]">
                <strong className="text-[#143d30] block mb-1">Assessment &amp; Evaluation:</strong>
                Formative assessments (projects, lab work, presentations, debates) account for 40% of evaluation, with summative CBSE term evaluations accounting for 60%. Remedial enrichment sessions are provided without commercial tuition.
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#e2d9c8] flex justify-end">
              <button
                onClick={() => setSyllabusModal(null)}
                className="rounded-full bg-[#143d30] px-6 py-2 text-xs font-bold text-[#faf8f4]"
              >
                Close Blueprint
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
