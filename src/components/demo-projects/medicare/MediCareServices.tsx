"use client";

import React from "react";
import Link from "next/link";
import { 
  Stethoscope, 
  Activity, 
  ClipboardCheck, 
  Users2, 
  HeartHandshake, 
  CalendarClock,
  ArrowRight
} from "lucide-react";

const SERVICES = [
  {
    icon: Stethoscope,
    title: "General Consultations",
    description: "Holistic primary consultations addressing common health concerns, routine assessments, and personalized family medical guidance.",
    badge: "Primary Care",
  },
  {
    icon: Activity,
    title: "Preventive Health Information",
    description: "Proactive lifestyle screenings, biomarker evaluation, and evidence-informed guidance designed to support long-term vitality.",
    badge: "Wellness",
  },
  {
    icon: ClipboardCheck,
    title: "Diagnostic Coordination",
    description: "Methodical coordination of non-invasive diagnostics, resting ECG evaluations, and clinical pathology tests.",
    badge: "Diagnostics",
  },
  {
    icon: Users2,
    title: "Specialist Consultations",
    description: "Seamless referrals and coordinated consultations across Cardiology, Orthopaedics, Dermatology, and Paediatrics.",
    badge: "Multidisciplinary",
  },
  {
    icon: HeartHandshake,
    title: "Patient Support & Advocacy",
    description: "Attentive clinical staff providing assistance with hospital navigation, appointment preparation, and clear explanations.",
    badge: "Care Coordination",
  },
  {
    icon: CalendarClock,
    title: "Follow-up Visit Information",
    description: "Structured follow-up reviews, recovery milestone checks, and continuous clinical reassurance between visits.",
    badge: "Continuity of Care",
  },
];

export default function MediCareServices() {
  return (
    <section
      id="services"
      aria-label="Healthcare Services"
      className="bg-white py-16 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#C9DED6] bg-[#EAF6F2] px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#147D78]">
            <span>Comprehensive Clinical Care</span>
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-[#263746] sm:text-4xl">
            Thoughtful Medical Services Designed for You
          </h2>
          <p className="mt-3.5 text-base text-[#263746]/80 sm:text-lg">
            From routine checkups to specialized clinical evaluations, explore the range of sample healthcare services structured at MediCare Health Centre.
          </p>
        </div>

        {/* Services Editorial Grid */}
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.title}
                className="relative rounded-2xl border border-[#C9DED6] bg-[#EAF6F2]/30 p-7 transition-all duration-300 hover:border-[#147D78] hover:bg-white hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#147D78] shadow-sm border border-[#C9DED6]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-[#147D78] border border-[#C9DED6]">
                    {service.badge}
                  </span>
                </div>

                <h3 className="mt-5 text-lg font-bold text-[#263746]">
                  {service.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#263746]/75">
                  {service.description}
                </p>

                <div className="mt-5 pt-4 border-t border-[#C9DED6]/50">
                  <Link
                    href="#appointment"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#147D78] hover:text-[#0e5854] transition-colors"
                  >
                    <span>Request Service Consultation</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
