"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "How can I request an appointment?",
    answer: "You can use the interactive appointment request form on this page. Scroll to the 'Request an Outpatient Consultation' section, select your preferred department, date, and time window, and submit the form. Please note that this demonstration form does not create real appointments — it showcases the booking interface design.",
  },
  {
    question: "Where can I explore the medical departments?",
    answer: "Our Departments section provides an overview of each speciality offered at MediCare Health Centre, including Cardiology, Orthopaedics, Dermatology, Paediatrics, Neurology, and General Medicine. Click 'Explore Department Services' on any department card for detailed sample information about clinical focus areas and consultation schedules.",
  },
  {
    question: "What information is included in a doctor profile?",
    answer: "Each sample doctor profile displays the physician's fictional name, department affiliation, consultation philosophy, key clinical focus areas, OPD consultation hours, and language capabilities. Click 'View Sample Profile' on any doctor card to see the full demonstration profile. All profiles are illustrative and do not represent real medical professionals.",
  },
  {
    question: "Can I use this page to book a real appointment?",
    answer: "No. MediCare Health Centre is a fictional healthcare brand created exclusively for this Axivon Technologies portfolio demonstration. The appointment form is a frontend-only interface that validates your input locally but does not transmit, store, or process any data. No real medical appointments are scheduled through this page.",
  },
  {
    question: "How can I contact Axivon Technologies about a similar website?",
    answer: "If you're interested in having Axivon Technologies design and develop a professional healthcare website for your medical practice, hospital, or clinic, please visit our contact page. You can reach us directly through the Axivon contact form with a pre-filled project enquiry.",
  },
];

export default function MediCareFAQ() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleItem(index);
    }
  };

  return (
    <section
      id="faq"
      aria-label="Frequently Asked Questions"
      className="bg-white py-16 sm:py-24"
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#C9DED6] bg-[#EAF6F2] px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#147D78]">
            <span>Common Questions</span>
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-[#263746] sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-base text-[#263746]/80">
            Clear answers about this MediCare demonstration and how to get started with Axivon Technologies.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="mt-10 space-y-3" role="list">
          {FAQ_ITEMS.map((item, index) => {
            const isExpanded = expandedIndex === index;
            return (
              <div
                key={index}
                role="listitem"
                className={`overflow-hidden rounded-xl border transition-all duration-200 ${
                  isExpanded
                    ? "border-[#147D78] bg-[#EAF6F2]/30 shadow-sm"
                    : "border-[#C9DED6] bg-white hover:border-[#147D78]/40"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleItem(index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  aria-expanded={isExpanded}
                  aria-controls={`faq-answer-${index}`}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#147D78] focus-visible:ring-inset rounded-xl"
                >
                  <span
                    className={`text-sm font-semibold transition-colors ${
                      isExpanded ? "text-[#147D78]" : "text-[#263746]"
                    }`}
                  >
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                      isExpanded ? "rotate-180 text-[#147D78]" : "text-[#263746]/50"
                    }`}
                  />
                </button>

                {isExpanded && (
                  <div
                    id={`faq-answer-${index}`}
                    role="region"
                    aria-labelledby={`faq-question-${index}`}
                    className="border-t border-[#C9DED6]/60 px-5 py-4 animate-in fade-in slide-in-from-top-1 duration-200"
                  >
                    <p className="text-sm leading-relaxed text-[#263746]/80">
                      {item.answer}
                    </p>
                    {/* Link to Axivon contact on last question */}
                    {index === FAQ_ITEMS.length - 1 && (
                      <div className="mt-3">
                        <Link
                          href="/contact?project=MediCare#contact-form"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#147D78] hover:text-[#0e5854] transition-colors underline underline-offset-2"
                        >
                          Visit Axivon Contact Page →
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
