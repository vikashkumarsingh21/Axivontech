"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  ArrowRight, 
  Calendar, 
  ShieldCheck, 
  Clock, 
  Users, 
  Sparkles, 
  CheckCircle2,
  HeartHandshake
} from "lucide-react";
import { motion } from "framer-motion";

export default function MediCareHero() {
  return (
    <section
      id="hero"
      aria-label="Welcome to MediCare Health Centre"
      className="relative overflow-hidden bg-gradient-to-b from-[#EAF6F2]/70 via-white to-white py-14 md:py-20 lg:py-28"
    >
      {/* Subtle Ambient Decorative Orbs */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-gradient-to-tr from-[#147D78]/10 to-[#EAF6F2] blur-3xl"
      />
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute top-1/3 -right-24 -z-10 h-80 w-80 rounded-full bg-[#E8735A]/5 blur-3xl"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-10">
          {/* Left Column: Editorial Headline & Copy */}
          <motion.div 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="lg:col-span-7"
          >
            {/* Pill Eyebrow */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D4E8E0] bg-white/90 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#147D78] shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#147D78] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#147D78]" />
              </span>
              <span>Compassionate Care · Evidence-Based Medicine</span>
            </div>

            {/* Main Headline */}
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-[#263746] sm:text-5xl lg:text-6xl lg:leading-[1.12]">
              Better Care Begins With <span className="text-[#147D78]">Understanding</span>.
            </h1>

            {/* Supporting Copy */}
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#4A6577] sm:text-lg sm:leading-relaxed">
              Experience thoughtful healthcare, distinguished clinical faculty, and an unhurried, patient-first philosophy. From preventive consultations to advanced multispeciality diagnostics, we accompany your wellness journey with dignity and clinical precision.
            </p>

            {/* Action Buttons: Prominent Warm Coral CTA */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="#appointment"
                className="group inline-flex items-center gap-2.5 rounded-xl bg-[#E8735A] px-7 py-4 text-sm font-bold text-white shadow-[0_6px_20px_rgba(232,115,90,0.32)] transition-all duration-200 hover:bg-[#D96047] hover:shadow-[0_8px_25px_rgba(232,115,90,0.42)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8735A] focus-visible:ring-offset-2 active:scale-[0.98]"
              >
                <Calendar className="h-4 w-4 transition-transform group-hover:scale-110" />
                <span>Book an Appointment</span>
              </Link>

              <Link
                href="#departments"
                className="group inline-flex items-center gap-2 rounded-xl border border-[#D4E8E0] bg-white px-6 py-4 text-sm font-semibold text-[#263746] shadow-xs transition-all duration-200 hover:border-[#147D78] hover:bg-[#F0F7F4] hover:text-[#147D78] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#147D78] focus-visible:ring-offset-2 active:scale-[0.98]"
              >
                <span>Explore Departments</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 text-[#147D78]" />
              </Link>
            </div>

            {/* Trust Highlights Strip */}
            <div className="mt-12 grid grid-cols-1 gap-4 border-t border-[#D4E8E0] pt-8 sm:grid-cols-3">
              <div className="flex items-start gap-3 rounded-xl p-2 transition-colors hover:bg-[#F0F7F4]/60">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF6F2] text-[#147D78] border border-[#D4E8E0]">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#263746]">Multidisciplinary</h2>
                  <p className="text-xs text-[#4A6577] mt-0.5">45+ Board-certified specialists</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl p-2 transition-colors hover:bg-[#F0F7F4]/60">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF6F2] text-[#147D78] border border-[#D4E8E0]">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#263746]">Zero-Wait OPD</h2>
                  <p className="text-xs text-[#4A6577] mt-0.5">Calm, pre-scheduled slots</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl p-2 transition-colors hover:bg-[#F0F7F4]/60">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF6F2] text-[#147D78] border border-[#D4E8E0]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#263746]">NABH &amp; JCI Quality</h2>
                  <p className="text-xs text-[#4A6577] mt-0.5">Highest patient safety index</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Hero Visual Photography */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="lg:col-span-5"
          >
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Photo Card Container */}
              <div className="relative overflow-hidden rounded-3xl border border-[#D4E8E0] bg-white p-2.5 shadow-[0_12px_40px_rgba(20,125,120,0.1)] transition-all duration-300 hover:shadow-[0_20px_50px_rgba(20,125,120,0.15)]">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-[#EAF6F2]">
                  <Image
                    src="/images/demo-projects/medicare/hero-consultation.jpg"
                    alt="Attentive clinical doctor listening and consulting with patient at MediCare Health Centre"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover object-center transition-transform duration-700 hover:scale-102"
                  />

                  {/* Gradient bottom overlay */}
                  <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#263746]/80 via-transparent to-transparent pointer-events-none" />

                  {/* Floating Top Badge: Clinical Status */}
                  <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-[#147D78] shadow-md backdrop-blur-sm border border-[#D4E8E0]">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#147D78]" />
                    <span>Accredited Clinical Suites</span>
                  </div>

                  {/* Floating Bottom Left Card: Patient Rating */}
                  <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-white/95 p-3.5 shadow-lg backdrop-blur-md border border-[#D4E8E0]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EAF6F2] text-[#147D78]">
                          <HeartHandshake className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#263746]">98.6% Patient Satisfaction</p>
                          <p className="text-[11px] text-[#4A6577]">Independent annual clinical audit</p>
                        </div>
                      </div>
                      <span className="rounded-md bg-[#EAF6F2] px-2 py-0.5 text-[10px] font-bold text-[#147D78]">
                        Mayo-Inspired Care
                      </span>
                    </div>
                  </div>
                </div>

                {/* Consultation Environment Editorial Note */}
                <div className="mt-3 rounded-xl bg-[#F0F7F4] p-3.5 border border-[#D4E8E0]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#147D78] uppercase tracking-wider text-[11px]">
                      Consultation Environment
                    </span>
                    <span className="text-[11px] text-[#8A9BAA] font-medium">Demonstration Showcase</span>
                  </div>
                  <p className="mt-1 text-xs text-[#4A6577] leading-relaxed">
                    Designed for acoustic calm, natural light, patient privacy, and uninterrupted doctor-patient dialogue.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
