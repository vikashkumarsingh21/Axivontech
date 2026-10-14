"use client";

import React from "react";
import { 
  CheckSquare, 
  AlertCircle, 
  FileSpreadsheet, 
  MapPin, 
  FileText, 
  CreditCard, 
  Smartphone,
  CheckCircle2,
  HelpCircle,
  Clock
} from "lucide-react";
import { motion } from "framer-motion";

const GUIDES = [
  {
    icon: FileSpreadsheet,
    title: "Items to Bring With You",
    subtitle: "Essential documents that assist our clinicians in formulating an accurate health record:",
    items: [
      "Government-issued photo identification card",
      "Comprehensive list of current medications & daily dosages",
      "Recent diagnostic lab reports and radiological scans",
      "Prior physician referral letters or discharge summaries",
      "Insurance / TPA healthcare cards (if applicable)",
    ],
  },
  {
    icon: MapPin,
    title: "Arrival & Clinic Navigation",
    subtitle: "Designed to minimize friction and ensure a relaxed check-in transition:",
    items: [
      "Arrive 15 minutes before your scheduled OPD consultation slot",
      "Check in at the Central Atrium Reception for queue tokens",
      "Complimentary wheelchair assistance & caregiver escorts on-site",
      "Clear bilingual directional signage on every department wing",
      "Acoustically dampened waiting lounges with filtered air",
    ],
  },
  {
    icon: AlertCircle,
    title: "During Your Consultation",
    subtitle: "Your comfort and absolute understanding remain our core priorities:",
    items: [
      "Feel fully empowered to ask clarifying questions about your diagnosis",
      "A family member or designated caregiver is always warmly welcomed",
      "Request written summaries of your personalized lifestyle guidelines",
      "Receive a clear explanation of any proposed medications or tests",
      "Clarify next review intervals before concluding your consultation",
    ],
  },
];

const DOWNLOADABLE_RESOURCES = [
  {
    icon: FileText,
    title: "New Patient Intake Checklist",
    desc: "Printable 1-page health history guide",
    size: "PDF (180 KB)",
  },
  {
    icon: CreditCard,
    title: "Insurance & Empanelled TPAs",
    desc: "Cashless hospitalization partner list",
    size: "Directory (240 KB)",
  },
  {
    icon: Smartphone,
    title: "Patient Tele-Consult Guidelines",
    desc: "Preparing for video consultations",
    size: "Guide (120 KB)",
  },
];

export default function MediCarePatientInfo() {
  return (
    <section
      id="patient-info"
      aria-label="Patient Preparation Information"
      className="bg-[#F0F7F4]/40 py-18 sm:py-28 border-t border-[#D4E8E0]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D4E8E0] bg-white px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#147D78]">
            <span>Patient Preparation</span>
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-[#263746] sm:text-4xl">
            Preparing for Your Consultation
          </h2>
          <p className="mt-3 text-base text-[#4A6577] sm:text-lg">
            Practical, patient-centred guidance designed to make your outpatient visit quiet, well-organized, and clinically productive.
          </p>
        </div>

        {/* Informational Cards */}
        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {GUIDES.map((guide, idx) => {
            const Icon = guide.icon;
            return (
              <motion.div
                key={guide.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="flex flex-col justify-between rounded-3xl border border-[#D4E8E0] bg-white p-7 shadow-xs transition-all duration-300 hover:border-[#147D78] hover:shadow-[0_10px_30px_rgba(20,125,120,0.08)]"
              >
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF6F2] text-[#147D78] border border-[#D4E8E0]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-[#263746]">
                    {guide.title}
                  </h3>
                  <p className="mt-1 text-xs text-[#4A6577] leading-relaxed">
                    {guide.subtitle}
                  </p>

                  <ul className="mt-5 space-y-2.5 text-xs text-[#263746]">
                    {guide.items.map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <CheckSquare className="h-4 w-4 shrink-0 text-[#147D78] mt-0.5" />
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Downloadable Patient Toolkits & Support Strip */}
        <div className="mt-12 rounded-3xl border border-[#D4E8E0] bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#147D78]">
            <HelpCircle className="h-4 w-4" />
            <span>Sample Patient Resource Toolkits</span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {DOWNLOADABLE_RESOURCES.map((res) => {
              const Icon = res.icon;
              return (
                <div
                  key={res.title}
                  className="flex items-center gap-3.5 rounded-2xl border border-[#D4E8E0] bg-[#F0F7F4]/60 p-4 transition-all hover:bg-white hover:border-[#147D78]"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#147D78] border border-[#D4E8E0] shadow-2xs">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-[#263746] truncate">
                      {res.title}
                    </h4>
                    <p className="text-[11px] text-[#4A6577] truncate">
                      {res.desc}
                    </p>
                    <span className="text-[10px] text-[#147D78] font-mono font-semibold">
                      {res.size} (Sample)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Disclaimer Note */}
        <div className="mt-8 rounded-2xl bg-[#EAF6F2] p-4 border border-[#D4E8E0] text-xs text-[#4A6577] leading-relaxed text-center sm:text-left">
          <span className="font-bold text-[#147D78]">Demonstration Advisory: </span>
          The guidance provided above represents healthcare visit best practices created for this Axivon Technologies showcase. It is illustrative and does not replace medical advice from your certified healthcare provider.
        </div>
      </div>
    </section>
  );
}
