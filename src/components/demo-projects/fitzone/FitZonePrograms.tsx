"use client";

import React, { useState } from "react";
import { Program } from "./types";
import { FITZONE_PROGRAMS } from "@/data/fitzone-data";
import {
  Flame,
  Clock,
  Dumbbell,
  ArrowRight,
  Sparkles,
  Layers,
  ChevronRight,
  User,
} from "lucide-react";

interface FitZoneProgramsProps {
  onSelectProgram: (program: Program) => void;
  onBookTrial: (programName?: string) => void;
}

export default function FitZonePrograms({
  onSelectProgram,
  onBookTrial,
}: FitZoneProgramsProps) {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = ["All", "Strength", "HIIT", "Functional", "Mobility", "Coaching"];

  const filteredPrograms =
    activeCategory === "All"
      ? FITZONE_PROGRAMS
      : FITZONE_PROGRAMS.filter((p) => p.category === activeCategory);

  return (
    <section
      id="programs"
      className="relative w-full border-t border-[#2B3137] bg-[#0B0D0F] py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#FF7138]/30 bg-[#FF7138]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-[#FF7138] mb-3">
              <Layers className="h-3.5 w-3.5" />
              <span>Athletic Training Protocols</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-[#F6F4F0] leading-tight">
              SCIENTIFICALLY ENGINEERED <br />
              <span className="text-[#FF7138]">TRAINING PROTOCOLS.</span>
            </h2>
          </div>

          <p className="max-w-md text-sm text-[#B5BBC2] leading-relaxed">
            Periodized strength, anaerobic sprint intervals, and joint
            restoration. Every program is coached by accredited sports
            physiologists with zero cookie-cutter routines.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2.5 mb-10">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                  isActive
                    ? "bg-[#FF7138] text-[#0B0D0F] shadow-lg shadow-[#FF7138]/25 scale-105"
                    : "border border-[#2B3137] bg-[#171B1F] text-[#B5BBC2] hover:border-[#FF7138]/50 hover:text-white"
                }`}
              >
                {cat === "All" ? "All Protocols" : cat}
              </button>
            );
          })}
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {filteredPrograms.map((program) => (
            <div
              key={program.id}
              className="group relative flex flex-col justify-between rounded-2xl border border-[#2B3137] bg-[#171B1F] p-6 sm:p-7 transition-all duration-300 hover:border-[#FF7138] hover:bg-[#20252A] hover:shadow-2xl hover:shadow-[#FF7138]/15"
            >
              {/* Top Meta */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="rounded-full bg-[#FF7138]/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#FF7138] border border-[#FF7138]/30">
                    {program.category}
                  </span>
                  <span className="text-[11px] font-semibold text-[#858D96] uppercase">
                    {program.intensity}
                  </span>
                </div>

                {/* Name & Tagline */}
                <h3 className="text-xl font-black uppercase tracking-tight text-[#F6F4F0] group-hover:text-[#FF7138] transition-colors">
                  {program.name}
                </h3>
                <p className="mt-2 text-xs text-[#FF934D] font-medium leading-relaxed">
                  {program.tagline}
                </p>

                {/* Description snippet */}
                <p className="mt-4 text-xs text-[#B5BBC2] leading-relaxed line-clamp-3">
                  {program.description}
                </p>

                {/* Key Metrics Chips */}
                <div className="mt-6 grid grid-cols-2 gap-2 pt-4 border-t border-[#2B3137]">
                  <div className="flex items-center gap-2 text-xs text-[#F6F4F0]">
                    <Clock className="h-3.5 w-3.5 text-[#FF7138]" />
                    <span>{program.durationMinutes} Min Session</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#FF7138] font-bold">
                    <Flame className="h-3.5 w-3.5" />
                    <span>{program.caloriesBurnEstimate}</span>
                  </div>
                  <div className="col-span-2 flex items-center gap-2 text-xs text-[#858D96] mt-1">
                    <User className="h-3.5 w-3.5 text-[#B5BBC2]" />
                    <span className="truncate">Coach: {program.trainerName}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-[#2B3137] flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onSelectProgram(program)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#2B3137] bg-white/5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#F6F4F0] hover:border-[#FF7138] hover:text-[#FF7138] transition-all"
                >
                  <span>Curriculum</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => onBookTrial(program.name)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#FF7138] hover:bg-[#e65d26] py-2.5 text-xs font-bold uppercase tracking-wider text-[#0B0D0F] shadow-sm shadow-[#FF7138]/20 transition-all active:scale-[0.98]"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Free Trial</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
