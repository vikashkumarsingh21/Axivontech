"use client";

import React from "react";
import { Trainer } from "./types";
import {
  X,
  Award,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Sparkles,
  Quote,
  Flame,
  Layers,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FitZoneTrainerModalProps {
  trainer: Trainer | null;
  onClose: () => void;
  onBookTrial: (note?: string) => void;
}

export default function FitZoneTrainerModal({
  trainer,
  onClose,
  onBookTrial,
}: FitZoneTrainerModalProps) {
  if (!trainer) return null;

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
          className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-[#2B3137] bg-[#111417] shadow-2xl shadow-black/80 my-8"
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

            <div className="flex items-center gap-2 mb-2">
              <span className="rounded-full bg-[#FF7138]/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#FF7138] border border-[#FF7138]/30">
                {trainer.experienceYears} Years Master Experience
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#F6F4F0]">
              {trainer.name}
            </h3>
            <p className="mt-1 text-sm text-[#FF934D] font-semibold">
              {trainer.title} &bull; {trainer.specialty}
            </p>
          </div>

          {/* Modal Content Body */}
          <div className="max-h-[70vh] overflow-y-auto p-6 sm:p-8 space-y-6">
            {/* Coaching Philosophy Quote */}
            <div className="relative rounded-xl border border-[#FF7138]/30 bg-[#FF7138]/5 p-5">
              <Quote className="h-5 w-5 text-[#FF7138] mb-2 opacity-60" />
              <p className="text-sm font-semibold italic text-[#F6F4F0] leading-relaxed">
                &ldquo;{trainer.coachingPhilosophy}&rdquo;
              </p>
            </div>

            {/* Biography */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#FF7138] mb-2">
                Coaching Background & Career
              </h4>
              <p className="text-sm text-[#B5BBC2] leading-relaxed">
                {trainer.biography}
              </p>
            </div>

            {/* Certifications & Credentials */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#858D96] mb-3 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[#48D597]" />
                <span>Accredited Certifications</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {trainer.certifications.map((cert, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#2B3137] bg-[#171B1F] px-3 py-1.5 text-xs font-medium text-[#F6F4F0]"
                  >
                    <CheckCircle2 className="h-3 w-3 text-[#48D597]" />
                    <span>{cert}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Career Achievements */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#858D96] mb-3 flex items-center gap-1.5">
                <Award className="h-4 w-4 text-[#FF7138]" />
                <span>Milestones & Coaching Achievements</span>
              </h4>
              <div className="space-y-2">
                {trainer.achievements.map((ach, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-xs text-[#B5BBC2]"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#FF7138]" />
                    <span>{ach}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Programs Led */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#858D96] mb-2 flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-[#FF934D]" />
                <span>FitZone Protocols Led</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {trainer.programsTrained.map((prog, i) => (
                  <span
                    key={i}
                    className="rounded-lg bg-white/5 border border-white/10 px-3 py-1 text-xs text-[#F6F4F0]"
                  >
                    {prog}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="border-t border-[#2B3137] bg-[#171B1F] p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto rounded-xl border border-[#2B3137] bg-transparent px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#B5BBC2] hover:text-white hover:border-white/30 transition-colors"
            >
              Close
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onBookTrial(`Consultation with ${trainer.name}`);
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7138] to-[#FF934D] px-6 py-2.5 text-xs font-extrabold uppercase tracking-wider text-[#0B0D0F] shadow-lg shadow-[#FF7138]/25 hover:brightness-110 active:scale-[0.98] transition-all"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Schedule 1-on-1 Strategy Session</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
