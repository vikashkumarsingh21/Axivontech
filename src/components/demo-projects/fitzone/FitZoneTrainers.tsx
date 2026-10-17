"use client";

import React from "react";
import { Trainer } from "./types";
import { FITZONE_TRAINERS } from "@/data/fitzone-data";
import {
  Award,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  Quote,
  Sparkles,
} from "lucide-react";

interface FitZoneTrainersProps {
  onSelectTrainer: (trainer: Trainer) => void;
  onBookTrial: (trainerName?: string) => void;
}

export default function FitZoneTrainers({
  onSelectTrainer,
  onBookTrial,
}: FitZoneTrainersProps) {
  return (
    <section
      id="trainers"
      className="relative w-full border-t border-[#2B3137] bg-[#0B0D0F] py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#FF7138]/30 bg-[#FF7138]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-[#FF7138] mb-3">
              <UserCheck className="h-3.5 w-3.5" />
              <span>World-Class Coaching Staff</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-[#F6F4F0] leading-tight">
              MASTER PHYSIOLOGISTS & <br />
              <span className="text-[#FF7138]">STRENGTH DIRECTORS.</span>
            </h2>
          </div>

          <p className="max-w-md text-sm text-[#B5BBC2] leading-relaxed">
            Our directors hold accredited master degrees, NSCA-CSCS
            credentials, and thousands of hours on the competition platform.
            Zero motivational fluff—only biomechanical precision.
          </p>
        </div>

        {/* Coaches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {FITZONE_TRAINERS.map((trainer) => (
            <div
              key={trainer.id}
              className="group relative flex flex-col justify-between rounded-2xl border border-[#2B3137] bg-[#171B1F] p-7 transition-all duration-300 hover:border-[#FF7138] hover:bg-[#20252A] hover:shadow-2xl hover:shadow-[#FF7138]/15"
            >
              <div>
                {/* Visual Avatar / Emblem Placeholder */}
                <div className="relative mb-6 overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[#20252A] to-[#0B0D0F] p-6 text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#FF7138] bg-[#0B0D0F] shadow-lg shadow-[#FF7138]/20 group-hover:scale-105 transition-transform">
                    <span className="text-2xl font-black uppercase text-[#FF7138]">
                      {trainer.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>

                  <span className="mt-3 inline-block rounded-full bg-white/5 border border-white/10 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#FF934D]">
                    {trainer.experienceYears} Years On-Platform
                  </span>
                </div>

                {/* Name & Title */}
                <h3 className="text-xl font-black uppercase tracking-tight text-[#F6F4F0] group-hover:text-[#FF7138] transition-colors">
                  {trainer.name}
                </h3>
                <p className="mt-1 text-xs font-bold uppercase tracking-wide text-[#FF7138]">
                  {trainer.title}
                </p>

                <p className="mt-2 text-xs font-medium text-[#858D96]">
                  Specialty: <span className="text-[#B5BBC2]">{trainer.specialty}</span>
                </p>

                {/* Philosophy Snippet */}
                <div className="mt-4 rounded-xl border border-white/5 bg-black/20 p-3.5">
                  <p className="text-xs italic text-[#B5BBC2] line-clamp-2">
                    &ldquo;{trainer.coachingPhilosophy}&rdquo;
                  </p>
                </div>

                {/* Certifications preview */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {trainer.certifications.slice(0, 2).map((cert, i) => (
                    <span
                      key={i}
                      className="rounded bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-[#858D96]"
                    >
                      {cert}
                    </span>
                  ))}
                  {trainer.certifications.length > 2 && (
                    <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-[#FF7138]">
                      +{trainer.certifications.length - 2} more
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-[#2B3137] flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onSelectTrainer(trainer)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#2B3137] bg-white/5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#F6F4F0] hover:border-[#FF7138] hover:text-[#FF7138] transition-all"
                >
                  <span>Credentials</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => onBookTrial(`Session with ${trainer.name}`)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#FF7138] hover:bg-[#e65d26] py-2.5 text-xs font-bold uppercase tracking-wider text-[#0B0D0F] shadow-sm shadow-[#FF7138]/20 transition-all active:scale-[0.98]"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Consult</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
