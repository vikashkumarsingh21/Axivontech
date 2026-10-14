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
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";

const SERVICES = [
  {
    icon: Stethoscope,
    title: "General & Family Consultations",
    badge: "Primary Care",
    description: "Holistic consultations addressing common health concerns, acute complaints, routine assessments, and personalized family medical guidance.",
    features: ["Comprehensive clinical history", "Vital biometric screening", "Prescription review"],
  },
  {
    icon: Activity,
    title: "Preventive Health & Longevity",
    badge: "Wellness",
    description: "Proactive lifestyle screenings, biomarker evaluation, and evidence-informed nutritional guidance designed to support long-term vitality.",
    features: ["Cardiometabolic risk profile", "Dietary lifestyle plan", "Annual biomarker roadmap"],
  },
  {
    icon: ClipboardCheck,
    title: "Diagnostic & Lab Coordination",
    badge: "Diagnostics",
    description: "Methodical coordination of non-invasive diagnostics, resting 12-lead ECG, imaging reviews, and accredited clinical pathology tests.",
    features: ["Digital reports within 24h", "Doctor consultation review", "Zero diagnostic repetition"],
  },
  {
    icon: Users2,
    title: "Multidisciplinary Specialty Clinics",
    badge: "Specialist Wings",
    description: "Seamless cross-referrals and coordinated consultations across Cardiology, Orthopaedics, Dermatology, Neurology, and Paediatrics.",
    features: ["Same-campus specialist review", "Joint case discussions", "Integrated treatment plans"],
  },
  {
    icon: HeartHandshake,
    title: "Patient Support & Advocacy",
    badge: "Care Coordination",
    description: "Attentive clinical staff providing empathetic assistance with hospital navigation, appointment preparation, and transparent explanations.",
    features: ["Dedicated patient navigators", "Multilingual assistance", "Insurance claim guidance"],
  },
  {
    icon: CalendarClock,
    title: "Continuity & Chronic Care Follow-up",
    badge: "Long-term Care",
    description: "Structured follow-up reviews, recovery milestone checks, and continuous clinical reassurance between visits for hypertension, diabetes, and joint health.",
    features: ["Scheduled recall reminders", "Medication titration", "Digital query triage"],
  },
];

const PACKAGES = [
  {
    name: "Executive Comprehensive Health",
    tests: "62 Laboratory & Clinical Parameters",
    idealFor: "Working professionals (30–55 yrs)",
    tag: "Most Popular",
  },
  {
    name: "Advanced Cardio-Metabolic Screen",
    tests: "ECG, Echo, Lipid Panel, HbA1c",
    idealFor: "Cardiovascular risk surveillance",
    tag: "Cardiac Focus",
  },
  {
    name: "Senior Wellness & Bone Density",
    tests: "Musculoskeletal, Joint mobility, DXA",
    idealFor: "Adults 55+ seeking mobility longevity",
    tag: "Geriatric Care",
  },
];

export default function MediCareServices() {
  return (
    <section
      id="services"
      aria-label="Healthcare Services"
      className="bg-white py-18 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D4E8E0] bg-[#EAF6F2] px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#147D78]">
            <span>Comprehensive Clinical Care</span>
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-[#263746] sm:text-4xl">
            Thoughtful Medical Services Designed for You
          </h2>
          <p className="mt-3.5 text-base text-[#4A6577] sm:text-lg">
            From routine checkups to specialized clinical evaluations, explore the range of outpatient healthcare services structured at MediCare Health Centre.
          </p>
        </div>

        {/* Services Editorial Grid */}
        <div className="mt-14 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="group relative flex flex-col justify-between rounded-2xl border border-[#D4E8E0] bg-[#F0F7F4]/40 p-7 transition-all duration-300 hover:border-[#147D78] hover:bg-white hover:shadow-[0_10px_30px_rgba(20,125,120,0.1)]"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#147D78] shadow-xs border border-[#D4E8E0] transition-colors group-hover:bg-[#147D78] group-hover:text-white">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-[#147D78] border border-[#D4E8E0] shadow-2xs">
                      {service.badge}
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-[#263746] group-hover:text-[#147D78] transition-colors">
                    {service.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#4A6577]">
                    {service.description}
                  </p>

                  {/* Feature checklist */}
                  <ul className="mt-4 space-y-1.5 border-t border-[#D4E8E0]/60 pt-3 text-[11px] text-[#4A6577]">
                    {service.features.map((feat) => (
                      <li key={feat} className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3 w-3 text-[#147D78] shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-[#D4E8E0]">
                  <Link
                    href="#appointment"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#147D78] hover:text-[#0F5C55] transition-colors"
                  >
                    <span>Request Service Consultation</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Preventive Health Packages Spotlight */}
        <div className="mt-16 rounded-3xl border border-[#D4E8E0] bg-[#EAF6F2]/50 p-6 sm:p-10 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b border-[#D4E8E0]">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#147D78]">
                Proactive Health Surveillance
              </span>
              <h3 className="mt-1 text-2xl font-bold text-[#263746]">
                Preventive Health Checkup Programmes
              </h3>
              <p className="mt-1 text-xs text-[#4A6577]">
                Comprehensive clinical screenings designed to detect subtle risk factors before symptoms arise.
              </p>
            </div>
            <Link
              href="#appointment"
              className="inline-flex items-center gap-2 rounded-xl bg-[#147D78] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#0F5C55] transition-all self-start lg:self-auto"
            >
              <span>Enquire About Health Packages</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {PACKAGES.map((pkg) => (
              <div
                key={pkg.name}
                className="rounded-2xl border border-[#D4E8E0] bg-white p-5 shadow-2xs transition-all hover:border-[#147D78]"
              >
                <span className="rounded-full bg-[#EAF6F2] px-2.5 py-0.5 text-[10px] font-bold text-[#147D78] border border-[#D4E8E0]">
                  {pkg.tag}
                </span>
                <h4 className="mt-3 text-sm font-bold text-[#263746]">
                  {pkg.name}
                </h4>
                <p className="mt-1 text-xs text-[#147D78] font-medium">
                  {pkg.tests}
                </p>
                <p className="mt-2 text-[11px] text-[#4A6577]">
                  Targeted for: {pkg.idealFor}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
