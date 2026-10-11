"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, X, CheckCircle, Calendar, Sparkles } from "lucide-react";

interface Department {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  scopeSummary: string;
  clinicalFocus: string[];
  sampleProcedures: string[];
  opdDays: string;
}

const DEPARTMENTS: Department[] = [
  {
    id: "cardiology",
    name: "Cardiology",
    category: "Cardiovascular Care",
    description: "Comprehensive heart health consultations, preventive cardiac risk assessments, and non-invasive cardiovascular diagnostics.",
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
  },
  {
    id: "orthopaedics",
    name: "Orthopaedics",
    category: "Bone & Joint Health",
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
  },
  {
    id: "dermatology",
    name: "Dermatology",
    category: "Skin & Hair Health",
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
  },
  {
    id: "paediatrics",
    name: "Paediatrics",
    category: "Child Health & Wellness",
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
  },
  {
    id: "neurology",
    name: "Neurology",
    category: "Brain & Nervous System",
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
  },
  {
    id: "general-medicine",
    name: "General Medicine",
    category: "Primary & Family Care",
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
  },
];

export default function MediCareDepartments() {
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);

  return (
    <section
      id="departments"
      aria-label="Medical Departments"
      className="bg-white py-16 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#C9DED6] bg-[#EAF6F2] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#147D78]">
            <span>Specialized Clinical Scope</span>
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-[#263746] sm:text-4xl">
            Care Across Every Stage of Life
          </h2>
          <p className="mt-3 text-base text-[#263746]/80 sm:text-lg">
            Explore our sample medical departments and the services they represent. Each unit is structured to offer compassionate, evidence-informed consultations.
          </p>
        </div>

        {/* Departments Grid */}
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {DEPARTMENTS.map((dept) => (
            <div
              key={dept.id}
              className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#C9DED6] bg-white transition-all duration-300 hover:border-[#147D78] hover:shadow-lg"
            >
              <div>
                {/* Department Image */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
                  <Image
                    src={dept.image}
                    alt={`${dept.name} clinical practice at MediCare`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 rounded-md bg-[#263746]/90 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                    {dept.category}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#263746] group-hover:text-[#147D78] transition-colors">
                    {dept.name}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-[#263746]/75">
                    {dept.description}
                  </p>

                  <div className="mt-4 flex items-center text-xs text-[#263746]/60">
                    <span className="font-semibold text-[#147D78]">OPD Schedule:</span>
                    <span className="ml-1.5">{dept.opdDays}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="border-t border-[#C9DED6]/60 p-6 pt-4 bg-[#EAF6F2]/30">
                <button
                  type="button"
                  onClick={() => setSelectedDept(dept)}
                  className="inline-flex w-full items-center justify-between rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-[#147D78] border border-[#C9DED6] shadow-sm transition-all duration-200 hover:bg-[#147D78] hover:text-white hover:border-[#147D78] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#147D78]"
                >
                  <span>Explore Department Services</span>
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Accessible Department Details Modal */}
      {selectedDept && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="dept-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedDept(null)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 sm:p-8 shadow-2xl border border-[#C9DED6]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#C9DED6] pb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#147D78]">
                  {selectedDept.category}
                </span>
                <h3
                  id="dept-modal-title"
                  className="mt-1 text-2xl font-bold text-[#263746]"
                >
                  {selectedDept.name} Department
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDept(null)}
                className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#147D78]"
                aria-label="Close department details"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="mt-5 space-y-6">
              <p className="text-sm leading-relaxed text-[#263746]/80">
                {selectedDept.scopeSummary}
              </p>

              <div>
                <h4 className="text-sm font-bold text-[#263746] uppercase tracking-wider">
                  Key Clinical Focus Areas
                </h4>
                <ul className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {selectedDept.clinicalFocus.map((focus) => (
                    <li key={focus} className="flex items-start gap-2 text-xs text-[#263746]/85">
                      <CheckCircle className="h-4 w-4 shrink-0 text-[#147D78] mt-0.5" />
                      <span>{focus}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-bold text-[#263746] uppercase tracking-wider">
                  Diagnostic & Assessment Procedures (Sample)
                </h4>
                <ul className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {selectedDept.sampleProcedures.map((proc) => (
                    <li key={proc} className="flex items-start gap-2 text-xs text-[#263746]/85">
                      <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#147D78] mt-0.5" />
                      <span>{proc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl bg-[#EAF6F2] p-4 border border-[#C9DED6]">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#263746]">Consultation Hours:</span>
                  <span className="font-mono text-[#147D78] font-medium">{selectedDept.opdDays}</span>
                </div>
                <p className="mt-2 text-[11px] text-[#263746]/70 leading-relaxed">
                  Demonstration Note: This is an illustrative clinical scope profile created for the Axivon Technologies MediCare demo.
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-[#C9DED6] pt-4">
              <button
                type="button"
                onClick={() => setSelectedDept(null)}
                className="rounded-lg border border-[#C9DED6] px-4 py-2 text-xs font-semibold text-[#263746] hover:bg-gray-50"
              >
                Close
              </button>
              <Link
                href="#appointment"
                onClick={() => setSelectedDept(null)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#147D78] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#0f605c]"
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>Book Appointment in {selectedDept.name}</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
