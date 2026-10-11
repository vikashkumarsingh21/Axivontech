"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, ShieldCheck, Clock, Users } from "lucide-react";

export default function MediCareHero() {
  return (
    <section
      id="hero"
      aria-label="Welcome to MediCare Health Centre"
      className="relative overflow-hidden bg-white py-12 md:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Left Column: Editorial Headline & Copy */}
          <div className="lg:col-span-7">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#C9DED6] bg-[#EAF6F2] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#147D78]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#147D78]" />
              <span>Compassionate Care · Modern Medicine</span>
            </div>

            {/* Main Headline */}
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-[#263746] sm:text-5xl lg:text-6xl lg:leading-[1.12]">
              Better Care Begins With Understanding.
            </h1>

            {/* Supporting Copy */}
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#263746]/80 sm:text-xl">
              Discover thoughtful healthcare, experienced clinical teams, and a patient-first approach designed around your needs. Explore specialized departments, connect with dedicated physicians, and experience a supportive healthcare journey.
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="#departments"
                className="inline-flex items-center gap-2 rounded-lg bg-[#147D78] px-6 py-3.5 text-base font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#0f605c] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#147D78] focus-visible:ring-offset-2 active:scale-[0.99]"
              >
                <span>Explore Our Departments</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="#appointment"
                className="inline-flex items-center gap-2 rounded-lg border border-[#C9DED6] bg-white px-6 py-3.5 text-base font-semibold text-[#263746] transition-all duration-200 hover:border-[#147D78] hover:bg-[#EAF6F2] hover:text-[#147D78] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#147D78] focus-visible:ring-offset-2 active:scale-[0.99]"
              >
                <Calendar className="h-4 w-4 text-[#147D78]" />
                <span>Book an Appointment</span>
              </Link>
            </div>

            {/* Trust Highlights Strip */}
            <div className="mt-10 grid grid-cols-1 gap-4 border-t border-[#C9DED6]/70 pt-8 sm:grid-cols-3">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EAF6F2] text-[#147D78]">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-[#263746]">Multidisciplinary</h2>
                  <p className="text-xs text-[#263746]/70">Integrated clinical specialists</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EAF6F2] text-[#147D78]">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-[#263746]">Transparent Scheduling</h2>
                  <p className="text-xs text-[#263746]/70">Organized OPD consultation hours</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EAF6F2] text-[#147D78]">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-[#263746]">Patient-Centred</h2>
                  <p className="text-xs text-[#263746]/70">Dignified, attentive care focus</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Photography */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Photo Card Container */}
              <div className="relative overflow-hidden rounded-2xl border border-[#C9DED6] bg-[#EAF6F2] p-2 shadow-sm transition-all duration-300 hover:shadow-md">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-gray-100">
                  <Image
                    src="/images/demo-projects/medicare/hero-consultation.jpg"
                    alt="Attentive clinical doctor listening and consulting with patient at MediCare Health Centre"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover object-center"
                  />
                </div>

                {/* Patient Care Editorial Note */}
                <div className="p-4 bg-white rounded-lg mt-2 border border-[#C9DED6]/60">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#147D78] uppercase tracking-wider">
                      Consultation Environment
                    </span>
                    <span className="text-[#263746]/60">Demonstration Showcase</span>
                  </div>
                  <p className="mt-1 text-xs text-[#263746]/80 leading-relaxed">
                    Designed for empathy, privacy, and unhurried doctor-patient dialogue.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
