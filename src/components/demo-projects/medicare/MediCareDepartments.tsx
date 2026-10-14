"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  ArrowUpRight, 
  X, 
  CheckCircle, 
  Calendar, 
  Sparkles,
  Heart,
  Bone,
  Smile,
  Brain,
  Stethoscope,
  Activity,
  Clock,
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Department {
  id: string;
  name: string;
  category: string;
  filterTag: "specialty" | "primary" | "all";
  icon: React.ElementType;
  description: string;
  image: string;
  scopeSummary: string;
  clinicalFocus: string[];
  sampleProcedures: string[];
  opdDays: string;
  seniorConsultant: string;
}

const DEPARTMENTS: Department[] = [
  {
    id: "cardiology",
    name: "Cardiology",
    category: "Cardiovascular Care",
    filterTag: "specialty",
    icon: Heart,
    description: "Comprehensive heart health consultations, preventive cardiovascular risk assessments, and non-invasive cardiovascular diagnostics.",
    image: "/images/demo-projects/medicare/dept-cardiology.jpg",
    scopeSummary: "Focused on heart health through evidence-based prevention, accurate diagnostic monitoring, and personalized lifestyle cardiology management.",
    clinicalFocus: [
      "Hypertension and blood pressure optimization",
      "Preventive cardiovascular risk screening",
      "ECG and cardiac echo diagnostic interpretation",
      "Cholesterol & metabolic heart health management",
    ],
    sampleProcedures: [
      "12-Lead Electrocardiogram (ECG)",
      "2D Echocardiography review",
      "Stress telemetry & Holter analysis",
      "Cardiac lifestyle & recovery counselling",
    ],
    opdDays: "Monday – Saturday (8:00 AM – 2:00 PM)",
    seniorConsultant: "Dr. Aanya Mehta",
  },
  {
    id: "orthopaedics",
    name: "Orthopaedics",
    category: "Bone & Joint Health",
    filterTag: "specialty",
    icon: Bone,
    description: "Joint preservation, mobility restoration, sports injury consultations, and comprehensive musculoskeletal care.",
    image: "/images/demo-projects/medicare/dept-orthopaedics.jpg",
    scopeSummary: "Providing attentive evaluations for bone health, chronic joint discomfort, posture correction, and rehabilitation protocols.",
    clinicalFocus: [
      "Arthritis & degenerative joint management",
      "Spine health and ergonomics advice",
      "Sports injury assessments & ligament care",
      "Post-fracture recovery and mobility rehabilitation",
    ],
    sampleProcedures: [
      "Digital musculoskeletal joint evaluation",
      "Bone mineral density assessment",
      "Targeted joint mobility therapy",
      "Ergonomic postural retraining",
    ],
    opdDays: "Monday – Friday (9:00 AM – 4:00 PM)",
    seniorConsultant: "Dr. Rohan Shah",
  },
  {
    id: "dermatology",
    name: "Dermatology",
    category: "Skin & Hair Health",
    filterTag: "specialty",
    icon: Sparkles,
    description: "Clinical skin wellness consultations, acne management, allergy evaluations, and preventive dermatological care.",
    image: "/images/demo-projects/medicare/dept-dermatology.jpg",
    scopeSummary: "Dedicated to holistic skin health, treating persistent dermatological conditions, and offering safe, clinical skin preservation.",
    clinicalFocus: [
      "Chronic eczema, psoriasis & dermatitis management",
      "Clinical acne treatment & barrier repair",
      "Scalp health & hair thinning consultations",
      "Pigmentation & UV photodamage analysis",
    ],
    sampleProcedures: [
      "Digital dermoscopy skin screening",
      "Allergic patch testing evaluation",
      "Therapeutic skin soothing protocols",
      "Personalized topical treatment plans",
    ],
    opdDays: "Tuesday – Saturday (10:00 AM – 5:00 PM)",
    seniorConsultant: "Dr. Nisha Kapoor",
  },
  {
    id: "paediatrics",
    name: "Paediatrics",
    category: "Child Health & Wellness",
    filterTag: "primary",
    icon: Smile,
    description: "Gentle healthcare for infants, children, and adolescents, including developmental milestones and wellness checkups.",
    image: "/images/demo-projects/medicare/dept-paediatrics.jpg",
    scopeSummary: "Creating a reassuring, friendly environment where young patients feel safe and parents receive clear, evidence-based guidance.",
    clinicalFocus: [
      "Infant growth and developmental tracking",
      "Childhood immunization & vaccine scheduling",
      "Paediatric nutrition and allergy care",
      "Seasonal infections & respiratory support",
    ],
    sampleProcedures: [
      "Comprehensive well-child wellness exam",
      "Growth percentile & nutrition assessment",
      "Paediatric vision and hearing screening",
      "Parental health advisory & counselling",
    ],
    opdDays: "Monday – Saturday (8:30 AM – 1:30 PM)",
    seniorConsultant: "Dr. Priya Nair (Visiting)",
  },
  {
    id: "neurology",
    name: "Neurology",
    category: "Brain & Nervous System",
    filterTag: "specialty",
    icon: Brain,
    description: "Specialized clinical consultations for migraine disorders, neuropathy, balance difficulties, and cognitive wellness.",
    image: "/images/demo-projects/medicare/dept-neurology.jpg",
    scopeSummary: "Detailed neurological evaluations utilizing methodical diagnostic assessments to support nervous system health and daily quality of life.",
    clinicalFocus: [
      "Chronic migraine & headache management",
      "Peripheral neuropathy & nerve pain care",
      "Vertigo, dizziness & balance disorders",
      "Sleep hygiene & cognitive wellness advice",
    ],
    sampleProcedures: [
      "Neurological sensory & reflex mapping",
      "Electroencephalogram (EEG) coordination",
      "Cranial nerve clinical assessments",
      "Cognitive baseline evaluations",
    ],
    opdDays: "Monday, Wednesday, Friday (10:00 AM – 3:00 PM)",
    seniorConsultant: "Dr. Vikram Joshi (Visiting)",
  },
  {
    id: "general-medicine",
    name: "General Medicine",
    category: "Primary & Family Care",
    filterTag: "primary",
    icon: Stethoscope,
    description: "Comprehensive primary healthcare, routine physicals, preventive screenings, and management of chronic lifestyle conditions.",
    image: "/images/demo-projects/medicare/dept-general.jpg",
    scopeSummary: "Your first point of contact for family health, preventative wellness strategies, and coordinated referrals across specialities.",
    clinicalFocus: [
      "Annual preventive health checkups",
      "Type 2 diabetes & metabolic syndrome care",
      "Acute infections and viral fevers",
      "Long-term wellness & longevity guidance",
    ],
    sampleProcedures: [
      "Full spectrum clinical physical exam",
      "Routine blood biomarker interpretation",
      "Vaccination booster recommendations",
      "Lifestyle & nutritional prescription",
    ],
    opdDays: "Monday – Sunday (7:30 AM – 7:00 PM)",
    seniorConsultant: "Dr. Arjun Patel",
  },
];

export default function MediCareDepartments() {
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [filter, setFilter] = useState<"all" | "specialty" | "primary">("all");

  const filteredDepts = DEPARTMENTS.filter((dept) => {
    if (filter === "all") return true;
    return dept.filterTag === filter;
  });

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedDept(null);
    };
    if (selectedDept) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedDept]);

  return (
    <section
      id="departments"
      aria-label="Medical Departments"
      className="bg-white py-18 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D4E8E0] bg-[#EAF6F2] px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#147D78]">
              <span>Specialized Clinical Scope</span>
            </div>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-[#263746] sm:text-4xl">
              Care Across Every Stage of Life
            </h2>
            <p className="mt-3 text-base text-[#4A6577] sm:text-lg">
              Explore our sample clinical departments. Each wing operates with multidisciplinary coordination, quiet patient suites, and evidence-informed treatment protocols.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                filter === "all"
                  ? "bg-[#147D78] text-white shadow-xs"
                  : "bg-[#F0F7F4] text-[#4A6577] hover:bg-[#EAF6F2] hover:text-[#147D78] border border-[#D4E8E0]"
              }`}
            >
              All Departments ({DEPARTMENTS.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("specialty")}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                filter === "specialty"
                  ? "bg-[#147D78] text-white shadow-xs"
                  : "bg-[#F0F7F4] text-[#4A6577] hover:bg-[#EAF6F2] hover:text-[#147D78] border border-[#D4E8E0]"
              }`}
            >
              Specialist Wings (4)
            </button>
            <button
              type="button"
              onClick={() => setFilter("primary")}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                filter === "primary"
                  ? "bg-[#147D78] text-white shadow-xs"
                  : "bg-[#F0F7F4] text-[#4A6577] hover:bg-[#EAF6F2] hover:text-[#147D78] border border-[#D4E8E0]"
              }`}
            >
              Primary &amp; Family Care (2)
            </button>
          </div>
        </div>

        {/* Departments Grid */}
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredDepts.map((dept, index) => {
            const Icon = dept.icon;
            return (
              <motion.div
                key={dept.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#D4E8E0] bg-white shadow-xs transition-all duration-300 hover:border-[#147D78] hover:shadow-[0_12px_30px_rgba(20,125,120,0.12)]"
              >
                <div>
                  {/* Department Image Container */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#EAF6F2]">
                    <Image
                      src={dept.image}
                      alt={`${dept.name} clinical practice at MediCare`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

                    {/* Category Tag */}
                    <div className="absolute top-3.5 left-3.5 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold text-[#147D78] shadow-xs backdrop-blur-xs border border-[#D4E8E0]">
                      {dept.category}
                    </div>

                    {/* Icon Tile */}
                    <div className="absolute bottom-3.5 right-3.5 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#147D78] shadow-md">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-[#263746] group-hover:text-[#147D78] transition-colors">
                      {dept.name}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-[#4A6577] line-clamp-2">
                      {dept.description}
                    </p>

                    {/* Quick Clinical Scope Highlights */}
                    <div className="mt-4 space-y-1.5 border-t border-[#D4E8E0]/70 pt-3 text-[11px] text-[#4A6577]">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3.5 w-3.5 text-[#147D78] shrink-0" />
                        <span className="truncate">{dept.clinicalFocus[0]}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3.5 w-3.5 text-[#147D78] shrink-0" />
                        <span className="truncate">{dept.clinicalFocus[1]}</span>
                      </div>
                    </div>

                    {/* Schedule Pill */}
                    <div className="mt-4 flex items-center gap-1.5 text-[11px] text-[#8A9BAA]">
                      <Clock className="h-3.5 w-3.5 text-[#147D78]" />
                      <span className="text-[#263746] font-medium truncate">{dept.opdDays}</span>
                    </div>
                  </div>
                </div>

                {/* Card Action */}
                <div className="border-t border-[#D4E8E0] bg-[#F0F7F4]/60 p-4">
                  <button
                    type="button"
                    onClick={() => setSelectedDept(dept)}
                    className="inline-flex w-full items-center justify-between rounded-xl border border-[#D4E8E0] bg-white px-4 py-2.5 text-xs font-bold text-[#147D78] shadow-2xs transition-all duration-200 hover:border-[#147D78] hover:bg-[#147D78] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#147D78]"
                  >
                    <span>View Department Scope &amp; Hours</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Accessible Department Details Modal */}
      <AnimatePresence>
        {selectedDept && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="dept-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#263746]/60 backdrop-blur-sm"
            onClick={() => setSelectedDept(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-[#D4E8E0]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-[#D4E8E0] pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF6F2] text-[#147D78] border border-[#D4E8E0]">
                    {React.createElement(selectedDept.icon, { className: "h-6 w-6" })}
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#147D78]">
                      {selectedDept.category}
                    </span>
                    <h3
                      id="dept-modal-title"
                      className="text-2xl font-bold tracking-tight text-[#263746]"
                    >
                      {selectedDept.name} Department
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedDept(null)}
                  className="rounded-xl p-2 text-[#4A6577] transition-colors hover:bg-[#F0F7F4] hover:text-[#263746] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#147D78]"
                  aria-label="Close department details"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="mt-5 space-y-6">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#8A9BAA]">
                    Department Overview
                  </h4>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#4A6577]">
                    {selectedDept.scopeSummary}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#263746]">
                    Key Clinical Focus Areas
                  </h4>
                  <ul className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {selectedDept.clinicalFocus.map((focus) => (
                      <li key={focus} className="flex items-start gap-2 text-xs text-[#263746] bg-[#F0F7F4] p-2.5 rounded-xl border border-[#D4E8E0]/70">
                        <CheckCircle className="h-4 w-4 shrink-0 text-[#147D78] mt-0.5" />
                        <span>{focus}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#263746]">
                    Diagnostic &amp; Assessment Capabilities
                  </h4>
                  <ul className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {selectedDept.sampleProcedures.map((proc) => (
                      <li key={proc} className="flex items-start gap-2 text-xs text-[#4A6577] bg-white p-2.5 rounded-xl border border-[#D4E8E0]">
                        <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#147D78] mt-0.5" />
                        <span>{proc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Schedule Card */}
                <div className="rounded-2xl bg-[#EAF6F2] p-4 border border-[#D4E8E0]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="font-bold text-[#263746]">Consultation Schedule: </span>
                      <span className="font-semibold text-[#147D78]">{selectedDept.opdDays}</span>
                    </div>
                    <div className="text-[11px] text-[#4A6577]">
                      Senior Consultant: <span className="font-medium text-[#263746]">{selectedDept.seniorConsultant}</span>
                    </div>
                  </div>
                  <p className="mt-2 text-[11px] text-[#4A6577] leading-relaxed">
                    Demonstration Scope: Fictional medical wing illustrative of hospital architecture developed by Axivon Technologies.
                  </p>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-[#D4E8E0] pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedDept(null)}
                  className="rounded-xl border border-[#D4E8E0] px-4 py-2.5 text-xs font-semibold text-[#4A6577] hover:bg-[#F0F7F4] hover:text-[#263746]"
                >
                  Close Window
                </button>
                <Link
                  href="#appointment"
                  onClick={() => setSelectedDept(null)}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#E8735A] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#D96047] transition-all"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Book in {selectedDept.name}</span>
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
