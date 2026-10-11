"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, X, Calendar, CheckCircle2 } from "lucide-react";

interface Doctor {
  id: string;
  name: string;
  department: string;
  role: string;
  image: string;
  intro: string;
  consultationDays: string;
  clinicalInterests: string[];
  languages: string[];
}

const DOCTORS: Doctor[] = [
  {
    id: "dr-aanya-mehta",
    name: "Dr. Aanya Mehta",
    department: "Cardiology",
    role: "Consultant Cardiologist (Sample)",
    image: "/images/demo-projects/medicare/doctor-aanya.jpg",
    intro: "Focuses on preventive cardiovascular wellness, non-invasive cardiac evaluation, and long-term arterial health management.",
    consultationDays: "Mon, Wed, Fri · 9:00 AM – 1:00 PM",
    clinicalInterests: [
      "Preventive cardiology & vascular health",
      "Hypertension optimization",
      "Non-invasive diagnostic review",
    ],
    languages: ["English", "Hindi", "Gujarati"],
  },
  {
    id: "dr-rohan-shah",
    name: "Dr. Rohan Shah",
    department: "Orthopaedics",
    role: "Orthopaedic Specialist (Sample)",
    image: "/images/demo-projects/medicare/doctor-rohan.jpg",
    intro: "Specializes in joint care, mobility rehabilitation, sports biomechanics, and evidence-based non-surgical musculoskeletal recovery.",
    consultationDays: "Tue, Thu, Sat · 10:00 AM – 3:00 PM",
    clinicalInterests: [
      "Joint preservation & cartilage health",
      "Ergonomics and postural recovery",
      "Mobility restoration programmes",
    ],
    languages: ["English", "Hindi"],
  },
  {
    id: "dr-nisha-kapoor",
    name: "Dr. Nisha Kapoor",
    department: "Dermatology",
    role: "Dermatologist (Sample)",
    image: "/images/demo-projects/medicare/doctor-nisha.jpg",
    intro: "Dedicated to clinical dermatology, managing chronic skin sensitivities, barrier restoration, and preventative skin screenings.",
    consultationDays: "Mon – Thu · 11:00 AM – 4:00 PM",
    clinicalInterests: [
      "Dermatological allergy evaluations",
      "Barrier repair and therapeutic care",
      "Photodamage skin wellness",
    ],
    languages: ["English", "Hindi"],
  },
  {
    id: "dr-arjun-patel",
    name: "Dr. Arjun Patel",
    department: "General Medicine",
    role: "Family Physician (Sample)",
    image: "/images/demo-projects/medicare/doctor-arjun.jpg",
    intro: "Emphasizes holistic primary care, metabolic health, preventive screenings, and coordinated multidisciplinary referrals.",
    consultationDays: "Mon – Sat · 8:00 AM – 2:00 PM",
    clinicalInterests: [
      "Routine preventive wellness checkups",
      "Metabolic & diabetic lifestyle care",
      "Comprehensive family healthcare",
    ],
    languages: ["English", "Hindi", "Gujarati"],
  },
];

export default function MediCareDoctors() {
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  return (
    <section
      id="doctors"
      aria-label="Clinical Faculty Directory"
      className="bg-[#EAF6F2]/40 py-16 sm:py-24 border-t border-[#C9DED6]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#C9DED6] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#147D78]">
              <span>Sample Clinical Directory</span>
            </div>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-[#263746] sm:text-4xl">
              Meet Our Sample Medical Professionals
            </h2>
            <p className="mt-3 text-base text-[#263746]/80 sm:text-lg">
              Illustrative clinician directory highlighting departmental integration, consultation focus areas, and accessible appointment pathways.
            </p>
          </div>

          <div className="text-xs text-[#263746]/60 bg-white px-3.5 py-2 rounded-lg border border-[#C9DED6] inline-block md:text-right">
            Demonstration Note: Fictional sample profiles for portfolio display.
          </div>
        </div>

        {/* Doctors Grid */}
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {DOCTORS.map((doc) => (
            <div
              key={doc.id}
              className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#C9DED6] bg-white transition-all duration-300 hover:border-[#147D78] hover:shadow-lg"
            >
              <div>
                {/* Doctor Portrait */}
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-gray-100">
                  <Image
                    src={doc.image}
                    alt={`${doc.name} profile portrait at MediCare`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 rounded-md bg-[#147D78] px-2.5 py-0.5 text-xs font-medium text-white shadow-sm">
                    {doc.department}
                  </div>
                </div>

                {/* Profile Details */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-[#263746] group-hover:text-[#147D78] transition-colors">
                    {doc.name}
                  </h3>
                  <p className="text-xs font-medium text-[#147D78]">
                    {doc.role}
                  </p>
                  <p className="mt-3 text-xs leading-relaxed text-[#263746]/75 line-clamp-3">
                    {doc.intro}
                  </p>

                  <div className="mt-4 pt-3 border-t border-[#C9DED6]/50 text-[11px] text-[#263746]/70">
                    <span className="font-semibold text-[#263746]">OPD: </span>
                    <span>{doc.consultationDays}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-5 pt-0">
                <button
                  type="button"
                  onClick={() => setSelectedDoctor(doc)}
                  className="inline-flex w-full items-center justify-between rounded-lg border border-[#C9DED6] bg-[#EAF6F2]/40 px-3.5 py-2 text-xs font-semibold text-[#147D78] transition-all hover:bg-[#147D78] hover:text-white hover:border-[#147D78] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#147D78]"
                >
                  <span>View Sample Profile</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Accessible Doctor Details Modal */}
      {selectedDoctor && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="doctor-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedDoctor(null)}
        >
          <div
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 sm:p-8 shadow-2xl border border-[#C9DED6]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#C9DED6] pb-4">
              <div className="flex items-center gap-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-[#147D78]">
                  <Image
                    src={selectedDoctor.image}
                    alt={selectedDoctor.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3
                    id="doctor-modal-title"
                    className="text-xl font-bold text-[#263746]"
                  >
                    {selectedDoctor.name}
                  </h3>
                  <p className="text-xs font-medium text-[#147D78]">
                    {selectedDoctor.department} · {selectedDoctor.role}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDoctor(null)}
                className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#147D78]"
                aria-label="Close doctor profile"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="mt-5 space-y-4">
              <div>
                <h4 className="text-xs font-bold text-[#263746] uppercase tracking-wider">
                  Consultation Philosophy
                </h4>
                <p className="mt-1.5 text-xs leading-relaxed text-[#263746]/80">
                  {selectedDoctor.intro}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-[#263746] uppercase tracking-wider">
                  Clinical Focus Areas
                </h4>
                <ul className="mt-2 space-y-1.5">
                  {selectedDoctor.clinicalInterests.map((interest) => (
                    <li key={interest} className="flex items-center gap-2 text-xs text-[#263746]/85">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#147D78] shrink-0" />
                      <span>{interest}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl bg-[#EAF6F2] p-3.5 border border-[#C9DED6] text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#263746]">Sample OPD Hours:</span>
                  <span className="font-mono text-[#147D78]">{selectedDoctor.consultationDays}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-[#263746]/70">
                  <span>Consultation Languages:</span>
                  <span>{selectedDoctor.languages.join(", ")}</span>
                </div>
              </div>

              <p className="text-[11px] text-[#263746]/60 leading-relaxed italic">
                Demonstration Disclaimer: Dr. {selectedDoctor.name.replace("Dr. ", "")} is an illustrative fictional persona created for this healthcare frontend showcase. No clinical advice or actual services are offered.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex items-center justify-end gap-3 border-t border-[#C9DED6] pt-4">
              <button
                type="button"
                onClick={() => setSelectedDoctor(null)}
                className="rounded-lg border border-[#C9DED6] px-4 py-2 text-xs font-semibold text-[#263746] hover:bg-gray-50"
              >
                Close
              </button>
              <Link
                href="#appointment"
                onClick={() => setSelectedDoctor(null)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#147D78] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#0f605c]"
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>Book Consultation</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
