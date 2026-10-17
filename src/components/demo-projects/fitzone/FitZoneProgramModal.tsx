"use client";

import React from "react";
import { Program } from "./types";
import {
  X,
  Flame,
  Clock,
  Dumbbell,
  User,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FitZoneProgramModalProps {
  program: Program | null;
  onClose: () => void;
  onBookTrial: (programName?: string) => void;
}

export default function FitZoneProgramModal({
  program,
  onClose,
  onBookTrial,
}: FitZoneProgramModalProps) {
  if (!program) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative z-10 w-full max-w-3xl overflow-hidden rounded-2xl border border-[#2B3137] bg-[#111417] shadow-2xl shadow-black/80 my-8"
        >
          {/* Header Banner */}
          <div className="relative border-b border-[#2B3137] bg-gradient-to-r from-[#171B1F] via-[#20252A] to-[#171B1F] p-6 sm:p-8">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="absolute top-5 right-5 flex h-9 w-9 items-center justify-center rounded-lg border border-[#2B3137] bg-[#0B0D0F] text-[#B5BBC2] hover:text-white hover:border-[#FF7138] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="rounded-full bg-[#FF7138]/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#FF7138] border border-[#FF7138]/30">
                {program.category}
              </span>
              <span className="rounded-full bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#F6F4F0] border border-white/10">
                {program.intensity}
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#F6F4F0]">
              {program.name}
            </h3>
            <p className="mt-2 text-sm text-[#FF934D] font-medium">
              {program.tagline}
            </p>
          </div>

          {/* Modal Content Body */}
          <div className="max-h-[70vh] overflow-y-auto p-6 sm:p-8 space-y-8">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 rounded-xl border border-[#2B3137] bg-[#171B1F] p-4 text-center">
              <div>
                <div className="flex items-center justify-center gap-1.5 text-xs text-[#858D96] uppercase font-semibold mb-1">
                  <Clock className="h-3.5 w-3.5 text-[#FF7138]" />
                  <span>Duration</span>
                </div>
                <p className="text-sm sm:text-base font-bold text-[#F6F4F0]">
                  {program.durationMinutes} Min / Session
                </p>
              </div>

              <div>
                <div className="flex items-center justify-center gap-1.5 text-xs text-[#858D96] uppercase font-semibold mb-1">
                  <Flame className="h-3.5 w-3.5 text-[#FF7138]" />
                  <span>Est. Burn</span>
                </div>
                <p className="text-sm sm:text-base font-bold text-[#FF7138]">
                  {program.caloriesBurnEstimate}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-center gap-1.5 text-xs text-[#858D96] uppercase font-semibold mb-1">
                  <Calendar className="h-3.5 w-3.5 text-[#FF7138]" />
                  <span>Frequency</span>
                </div>
                <p className="text-sm sm:text-base font-bold text-[#F6F4F0]">
                  {program.weeklyCommitment}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-center gap-1.5 text-xs text-[#858D96] uppercase font-semibold mb-1">
                  <User className="h-3.5 w-3.5 text-[#FF7138]" />
                  <span>Lead Coach</span>
                </div>
                <p className="text-sm sm:text-base font-bold text-[#F6F4F0] truncate">
                  {program.trainerName}
                </p>
              </div>
            </div>

            {/* Program Overview */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-[#FF7138] mb-2 flex items-center gap-2">
                <Dumbbell className="h-4 w-4" />
                <span>Program Architecture & Science</span>
              </h4>
              <p className="text-sm text-[#B5BBC2] leading-relaxed">
                {program.description}
              </p>
            </div>

            {/* Target Focus Tags */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#858D96] mb-3">
                Key Performance Adaptations:
              </h4>
              <div className="flex flex-wrap gap-2">
                {program.targetFocus.map((focus, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#2B3137] bg-[#171B1F] px-3 py-1.5 text-xs font-medium text-[#F6F4F0]"
                  >
                    <CheckCircle2 className="h-3 w-3 text-[#FF7138]" />
                    <span>{focus}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Equipment Utilized */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#858D96] mb-3">
                Calibrated Equipment Utilized:
              </h4>
              <div className="flex flex-wrap gap-2">
                {program.equipment.map((item, i) => (
                  <span
                    key={i}
                    className="rounded-lg bg-white/5 border border-white/10 px-3 py-1 text-xs text-[#B5BBC2]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Phase-by-Phase Curriculum */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-[#FF7138] mb-4 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                <span>Structured Phase-by-Phase Curriculum</span>
              </h4>
              <div className="space-y-3">
                {program.sampleCurriculum.map((curr, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-[#2B3137] bg-[#171B1F] p-4 text-left"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-xs font-black uppercase text-[#FF7138]">
                        {curr.week}
                      </span>
                      <span className="text-[11px] font-semibold text-[#858D96]">
                        {curr.focus}
                      </span>
                    </div>
                    <p className="text-xs text-[#B5BBC2] leading-relaxed">
                      {curr.details}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Modal Footer CTA */}
          <div className="border-t border-[#2B3137] bg-[#171B1F] p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-[#858D96] text-center sm:text-left">
              <span>Led by {program.trainerName} ({program.trainerRole})</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 sm:w-auto rounded-xl border border-[#2B3137] bg-transparent px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#B5BBC2] hover:text-white hover:border-white/30 transition-colors"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onBookTrial(program.name);
                }}
                className="w-1/2 sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7138] to-[#FF934D] px-6 py-2.5 text-xs font-extrabold uppercase tracking-wider text-[#0B0D0F] shadow-lg shadow-[#FF7138]/25 hover:brightness-110 active:scale-[0.98] transition-all"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Book Free Trial In This Program</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
