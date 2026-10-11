"use client";

import React from "react";
import { CheckSquare, AlertCircle, FileSpreadsheet, MapPin } from "lucide-react";

export default function MediCarePatientInfo() {
  return (
    <section
      id="patient-info"
      aria-label="Patient Preparation Information"
      className="bg-[#EAF6F2]/30 py-16 sm:py-24 border-t border-[#C9DED6]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#C9DED6] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#147D78]">
            <span>Patient Guidance</span>
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-[#263746] sm:text-4xl">
            Preparing for Your Consultation
          </h2>
          <p className="mt-3 text-base text-[#263746]/80 sm:text-lg">
            Practical, general advice to help ensure your outpatient visit is calm, well-organized, and productive.
          </p>
        </div>

        {/* Editorial Information Panels */}
        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Panel 1: What to Bring */}
          <div className="rounded-2xl border border-[#C9DED6] bg-white p-7 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF6F2] text-[#147D78]">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-[#263746]">
              Items to Bring With You
            </h3>
            <p className="mt-1.5 text-xs text-[#263746]/75">
              Having these ready assists the clinical team in formulating an accurate health record:
            </p>

            <ul className="mt-4 space-y-2.5 text-xs text-[#263746]/85">
              <li className="flex items-start gap-2">
                <CheckSquare className="h-4 w-4 shrink-0 text-[#147D78] mt-0.5" />
                <span>Government-issued identification card</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckSquare className="h-4 w-4 shrink-0 text-[#147D78] mt-0.5" />
                <span>List of current medications and daily dosages</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckSquare className="h-4 w-4 shrink-0 text-[#147D78] mt-0.5" />
                <span>Recent laboratory test results or imaging scans</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckSquare className="h-4 w-4 shrink-0 text-[#147D78] mt-0.5" />
                <span>Any prior referral letters from your family doctor</span>
              </li>
            </ul>
          </div>

          {/* Panel 2: Arrival & Timings */}
          <div className="rounded-2xl border border-[#C9DED6] bg-white p-7 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF6F2] text-[#147D78]">
              <MapPin className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-[#263746]">
              Arrival & Clinic Navigation
            </h3>
            <p className="mt-1.5 text-xs text-[#263746]/75">
              To minimize stress and allow for necessary verification:
            </p>

            <ul className="mt-4 space-y-2.5 text-xs text-[#263746]/85">
              <li className="flex items-start gap-2">
                <CheckSquare className="h-4 w-4 shrink-0 text-[#147D78] mt-0.5" />
                <span>Arrive approximately 15 minutes before scheduled OPD</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckSquare className="h-4 w-4 shrink-0 text-[#147D78] mt-0.5" />
                <span>Check in at the central reception desk for queue tokens</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckSquare className="h-4 w-4 shrink-0 text-[#147D78] mt-0.5" />
                <span>Wheelchair accessibility and escort support available upon arrival</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckSquare className="h-4 w-4 shrink-0 text-[#147D78] mt-0.5" />
                <span>Clear signage guides patients to each department floor</span>
              </li>
            </ul>
          </div>

          {/* Panel 3: During Your Visit */}
          <div className="rounded-2xl border border-[#C9DED6] bg-white p-7 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF6F2] text-[#147D78]">
              <AlertCircle className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-[#263746]">
              During Your Consultation
            </h3>
            <p className="mt-1.5 text-xs text-[#263746]/75">
              Your comfort and understanding are paramount throughout:
            </p>

            <ul className="mt-4 space-y-2.5 text-xs text-[#263746]/85">
              <li className="flex items-start gap-2">
                <CheckSquare className="h-4 w-4 shrink-0 text-[#147D78] mt-0.5" />
                <span>Feel completely empowered to ask clarifying questions</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckSquare className="h-4 w-4 shrink-0 text-[#147D78] mt-0.5" />
                <span>Request written summaries of your lifestyle guidelines</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckSquare className="h-4 w-4 shrink-0 text-[#147D78] mt-0.5" />
                <span>Clarify follow-up timing before concluding your visit</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckSquare className="h-4 w-4 shrink-0 text-[#147D78] mt-0.5" />
                <span>A family member or caregiver is always welcome to join you</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer Note */}
        <div className="mt-8 rounded-xl bg-white p-4 border border-[#C9DED6] text-xs text-[#263746]/70 leading-relaxed text-center sm:text-left">
          <span className="font-semibold text-[#147D78]">Informational Note: </span>
          The guidelines above represent general healthcare visit best practices for demonstration in this Axivon Technologies portfolio project. This content is non-diagnostic and does not replace medical counsel from a certified physician.
        </div>
      </div>
    </section>
  );
}
