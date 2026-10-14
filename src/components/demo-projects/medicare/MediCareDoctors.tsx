"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  ArrowUpRight, 
  X, 
  Calendar, 
  CheckCircle2, 
  GraduationCap, 
  Languages, 
  Clock, 
  ShieldCheck,
  Award
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Doctor {
  id: string;
  name: string;
  department: string;
  role: string;
  credentials: string;
  experience: string;
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
    role: "Consultant Cardiologist",
    credentials: "MD, DM Cardiology (AIIMS), FESC",
    experience: "14+ Years Experience",
    image: "/images/demo-projects/medicare/doctor-aanya.jpg",
    intro: "Focuses on preventive cardiovascular wellness, non-invasive cardiac evaluation, lipid management, and arterial longevity.",
    consultationDays: "Mon, Wed, Fri · 9:00 AM – 1:00 PM",
    clinicalInterests: [
      "Preventive cardiology & vascular health",
      "Hypertension optimization",
      "Non-invasive diagnostic review",
      "Lipid & metabolic heart management",
    ],
    languages: ["English", "Hindi", "Gujarati"],
  },
  {
    id: "dr-rohan-shah",
    name: "Dr. Rohan Shah",
    department: "Orthopaedics",
    role: "Orthopaedic Specialist",
    credentials: "MS Ortho, MCh (Dundee), Fellowship Joint Care",
    experience: "12+ Years Experience",
    image: "/images/demo-projects/medicare/doctor-rohan.jpg",
    intro: "Specializes in joint preservation, sports biomechanics, posture rehabilitation, and evidence-informed non-surgical musculoskeletal recovery.",
    consultationDays: "Tue, Thu, Sat · 10:00 AM – 3:00 PM",
    clinicalInterests: [
      "Joint preservation & cartilage health",
      "Ergonomics and postural recovery",
      "Mobility restoration programmes",
      "Sports injury rehabilitative guidance",
    ],
    languages: ["English", "Hindi"],
  },
  {
    id: "dr-nisha-kapoor",
    name: "Dr. Nisha Kapoor",
    department: "Dermatology",
    role: "Clinical Dermatologist",
    credentials: "MD Dermatology, DNB (Derm), Trichology Fellow",
    experience: "10+ Years Experience",
    image: "/images/demo-projects/medicare/doctor-nisha.jpg",
    intro: "Dedicated to clinical dermatology, managing chronic skin sensitivities, epidermal barrier restoration, and preventative skin screenings.",
    consultationDays: "Mon – Thu · 11:00 AM – 4:00 PM",
    clinicalInterests: [
      "Dermatological allergy evaluations",
      "Barrier repair and therapeutic care",
      "Photodamage skin wellness",
      "Chronic eczema & inflammatory skin",
    ],
    languages: ["English", "Hindi"],
  },
  {
    id: "dr-arjun-patel",
    name: "Dr. Arjun Patel",
    department: "General Medicine",
    role: "Senior Family Physician",
    credentials: "MD Internal Medicine, Postgrad Diabetology (UK)",
    experience: "18+ Years Experience",
    image: "/images/demo-projects/medicare/doctor-arjun.jpg",
    intro: "Emphasizes holistic primary care, cardiometabolic wellness, preventive health screening protocols, and coordinated specialty referrals.",
    consultationDays: "Mon – Sat · 8:00 AM – 2:00 PM",
    clinicalInterests: [
      "Routine preventive wellness checkups",
      "Metabolic & diabetic lifestyle care",
      "Comprehensive family healthcare",
      "Longevity & biomarker surveillance",
    ],
    languages: ["English", "Hindi", "Gujarati"],
  },
];

export default function MediCareDoctors() {
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [activeDept, setActiveDept] = useState<string>("All");

  const depts = ["All", "Cardiology", "Orthopaedics", "Dermatology", "General Medicine"];

  const filteredDoctors = DOCTORS.filter((doc) => {
    if (activeDept === "All") return true;
    return doc.department === activeDept;
  });

  // Modal ESC handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedDoctor(null);
    };
    if (selectedDoctor) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedDoctor]);

  return (
    <section
      id="doctors"
      aria-label="Clinical Faculty Directory"
      className="bg-[#F0F7F4]/60 py-18 sm:py-28 border-t border-[#D4E8E0]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D4E8E0] bg-white px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#147D78]">
              <span>Sample Clinical Faculty</span>
            </div>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-[#263746] sm:text-4xl">
              Meet Our Sample Medical Professionals
            </h2>
            <p className="mt-3 text-base text-[#4A6577] sm:text-lg">
              Illustrative clinician directory highlighting departmental integration, verified credentials, and unhurried consultation pathways.
            </p>
          </div>

          {/* Department Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-white p-1 rounded-2xl border border-[#D4E8E0] shadow-2xs">
            {depts.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setActiveDept(d)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeDept === d
                    ? "bg-[#147D78] text-white shadow-xs"
                    : "text-[#4A6577] hover:text-[#147D78] hover:bg-[#F0F7F4]"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Doctors Grid */}
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {filteredDoctors.map((doc, idx) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#D4E8E0] bg-white shadow-xs transition-all duration-300 hover:border-[#147D78] hover:shadow-[0_12px_32px_rgba(20,125,120,0.12)]"
            >
              <div>
                {/* Doctor Portrait Container */}
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#EAF6F2]">
                  <Image
                    src={doc.image}
                    alt={`${doc.name} profile portrait at MediCare`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Gradient shadow overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70" />

                  {/* Department Badge */}
                  <div className="absolute top-3.5 left-3.5 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold text-[#147D78] shadow-xs backdrop-blur-xs border border-[#D4E8E0]">
                    {doc.department}
                  </div>

                  {/* Experience Badge */}
                  <div className="absolute bottom-3.5 left-3.5 inline-flex items-center gap-1 rounded-md bg-[#263746]/85 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-xs">
                    <Award className="h-3 w-3 text-[#E8735A]" />
                    <span>{doc.experience}</span>
                  </div>
                </div>

                {/* Profile Details */}
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-[#263746] group-hover:text-[#147D78] transition-colors">
                      {doc.name}
                    </h3>
                    <span title="Board Certified">
                      <ShieldCheck className="h-4 w-4 text-[#147D78]" />
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-[#147D78]">
                    {doc.role}
                  </p>

                  <p className="mt-1 text-[11px] font-medium text-[#8A9BAA]">
                    {doc.credentials}
                  </p>

                  <p className="mt-3 text-xs leading-relaxed text-[#4A6577] line-clamp-2">
                    {doc.intro}
                  </p>

                  {/* Consultation Timings */}
                  <div className="mt-4 border-t border-[#D4E8E0]/70 pt-3 text-[11px] text-[#4A6577]">
                    <div className="flex items-center gap-1.5 text-[#263746]">
                      <Clock className="h-3.5 w-3.5 text-[#147D78]" />
                      <span className="font-semibold">OPD:</span>
                      <span className="truncate">{doc.consultationDays.split("·")[0]}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-5 pt-0">
                <button
                  type="button"
                  onClick={() => setSelectedDoctor(doc)}
                  className="inline-flex w-full items-center justify-between rounded-xl border border-[#D4E8E0] bg-[#F0F7F4] px-4 py-2.5 text-xs font-bold text-[#147D78] transition-all hover:border-[#147D78] hover:bg-[#147D78] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#147D78]"
                >
                  <span>View Clinical Profile</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Accessible Doctor Details Modal */}
      <AnimatePresence>
        {selectedDoctor && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="doctor-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#263746]/60 backdrop-blur-sm"
            onClick={() => setSelectedDoctor(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-[#D4E8E0]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-[#D4E8E0] pb-5">
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 border-[#147D78] bg-[#EAF6F2] shadow-sm">
                    <Image
                      src={selectedDoctor.image}
                      alt={selectedDoctor.name}
                      fill
                      className="object-cover object-top"
                    />
                  </div>
                  <div>
                    <h3
                      id="doctor-modal-title"
                      className="text-xl font-bold tracking-tight text-[#263746]"
                    >
                      {selectedDoctor.name}
                    </h3>
                    <p className="text-xs font-semibold text-[#147D78]">
                      {selectedDoctor.department} · {selectedDoctor.role}
                    </p>
                    <p className="text-[11px] text-[#4A6577]">
                      {selectedDoctor.credentials}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedDoctor(null)}
                  className="rounded-xl p-2 text-[#4A6577] transition-colors hover:bg-[#F0F7F4] hover:text-[#263746] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#147D78]"
                  aria-label="Close doctor profile"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="mt-5 space-y-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#8A9BAA]">
                    Consultation Philosophy
                  </h4>
                  <p className="mt-1 text-xs leading-relaxed text-[#4A6577]">
                    {selectedDoctor.intro}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#263746]">
                    Clinical Focus &amp; Subspecialties
                  </h4>
                  <ul className="mt-2 space-y-1.5">
                    {selectedDoctor.clinicalInterests.map((interest) => (
                      <li key={interest} className="flex items-center gap-2 text-xs text-[#263746] bg-[#F0F7F4] px-3 py-2 rounded-xl border border-[#D4E8E0]/70">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#147D78] shrink-0" />
                        <span>{interest}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Timings and Languages */}
                <div className="rounded-2xl bg-[#EAF6F2] p-4 border border-[#D4E8E0] text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#263746]">Outpatient Consultation Hours:</span>
                    <span className="font-semibold text-[#147D78]">{selectedDoctor.consultationDays}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#4A6577] pt-2 border-t border-[#D4E8E0]/70">
                    <span className="flex items-center gap-1 font-medium">
                      <Languages className="h-3.5 w-3.5 text-[#147D78]" /> Languages:
                    </span>
                    <span>{selectedDoctor.languages.join(", ")}</span>
                  </div>
                </div>

                <p className="text-[11px] text-[#8A9BAA] leading-relaxed italic">
                  Demonstration Showcase: Illustrative clinical persona created for Axivon Technologies healthcare frontend portfolio.
                </p>
              </div>

              {/* Modal Actions */}
              <div className="mt-6 flex items-center justify-end gap-3 border-t border-[#D4E8E0] pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedDoctor(null)}
                  className="rounded-xl border border-[#D4E8E0] px-4 py-2.5 text-xs font-semibold text-[#4A6577] hover:bg-[#F0F7F4]"
                >
                  Close
                </button>
                <Link
                  href="#appointment"
                  onClick={() => setSelectedDoctor(null)}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#E8735A] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#D96047] transition-all"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Book with {selectedDoctor.name.split(" ")[1]}</span>
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
