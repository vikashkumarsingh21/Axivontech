"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, HelpCircle, Sparkles, MessageCircleQuestion } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FAQItem {
  question: string;
  answer: string;
  category: "booking" | "demo" | "services";
}

const FAQ_ITEMS: FAQItem[] = [
  {
    category: "booking",
    question: "How can I request an outpatient appointment?",
    answer: "You can use the interactive booking interface on this page. Navigate to 'Request an Outpatient Consultation', select your preferred department, preferred date, and time window (Morning, Afternoon, or Evening), and submit. The form validates all fields in real-time. Please note that this is a demonstration environment — no real patient records are booked or sent.",
  },
  {
    category: "services",
    question: "What medical departments and specialties are featured?",
    answer: "Our showcase includes Cardiology, Orthopaedics, Dermatology, Paediatrics, Neurology, and General Medicine. You can click 'View Department Scope & Hours' on any card to examine detailed focus areas, diagnostic procedures, and OPD consultation schedules.",
  },
  {
    category: "services",
    question: "What clinical details are provided in doctor profiles?",
    answer: "Each sample doctor profile illustrates verified medical credentials, senior fellowships, areas of clinical focus, consultation philosophy, weekly OPD hours, and language capabilities. Profiles are fictional sample personas demonstrating how medical directories can be elegantly structured.",
  },
  {
    category: "demo",
    question: "Can I use this page to book an actual medical appointment?",
    answer: "No. MediCare Health Centre is an illustrative healthcare brand created exclusively for this Axivon Technologies portfolio showcase. The appointment form runs entirely in your browser with zero server data storage. No real appointments are scheduled through this page.",
  },
  {
    category: "booking",
    question: "What should patients prepare before attending a consultation?",
    answer: "Patients are advised to bring government photo identification, an up-to-date medication list with dosages, recent laboratory or imaging reports, and any prior referral letters. Arriving 15 minutes before your time slot ensures an unhurried check-in at the central reception desk.",
  },
  {
    category: "demo",
    question: "How can our healthcare institution commission a website like this?",
    answer: "If you represent a hospital, medical clinic, or healthcare startup, Axivon Technologies designs and engineers high-performance, accessible, and HIPAA-conscious digital platforms. Visit our contact form to discuss your custom branding, patient booking workflows, and electronic medical record integrations.",
  },
];

export default function MediCareFAQ() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [filter, setFilter] = useState<"all" | "booking" | "services" | "demo">("all");

  const filteredItems = FAQ_ITEMS.filter((item) => {
    if (filter === "all") return true;
    return item.category === filter;
  });

  const toggleItem = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <section
      id="faq"
      aria-label="Frequently Asked Questions"
      className="bg-[#F0F7F4]/30 py-18 sm:py-28 border-t border-[#D4E8E0]"
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D4E8E0] bg-[#EAF6F2] px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#147D78]">
            <MessageCircleQuestion className="h-3.5 w-3.5" />
            <span>Common Enquiries</span>
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-[#263746] sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-base text-[#4A6577]">
            Clear answers about the MediCare demonstration and how Axivon Technologies designs modern healthcare web solutions.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
              filter === "all"
                ? "bg-[#147D78] text-white shadow-xs"
                : "bg-white text-[#4A6577] border border-[#D4E8E0] hover:bg-[#EAF6F2]"
            }`}
          >
            All Questions ({FAQ_ITEMS.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("booking")}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
              filter === "booking"
                ? "bg-[#147D78] text-white shadow-xs"
                : "bg-white text-[#4A6577] border border-[#D4E8E0] hover:bg-[#EAF6F2]"
            }`}
          >
            Appointments &amp; Care
          </button>
          <button
            type="button"
            onClick={() => setFilter("services")}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
              filter === "services"
                ? "bg-[#147D78] text-white shadow-xs"
                : "bg-white text-[#4A6577] border border-[#D4E8E0] hover:bg-[#EAF6F2]"
            }`}
          >
            Departments &amp; Clinicians
          </button>
          <button
            type="button"
            onClick={() => setFilter("demo")}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
              filter === "demo"
                ? "bg-[#147D78] text-white shadow-xs"
                : "bg-white text-[#4A6577] border border-[#D4E8E0] hover:bg-[#EAF6F2]"
            }`}
          >
            Portfolio &amp; Technology
          </button>
        </div>

        {/* FAQ Accordion */}
        <div className="mt-8 space-y-3" role="list">
          {filteredItems.map((item, index) => {
            const isExpanded = expandedIndex === index;
            return (
              <div
                key={item.question}
                role="listitem"
                className={`overflow-hidden rounded-2xl border transition-all duration-200 ${
                  isExpanded
                    ? "border-[#147D78] bg-white shadow-sm"
                    : "border-[#D4E8E0] bg-white hover:border-[#147D78]/50"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleItem(index)}
                  aria-expanded={isExpanded}
                  aria-controls={`faq-answer-${index}`}
                  className="flex w-full items-center justify-between gap-4 px-6 py-4.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#147D78] rounded-2xl"
                >
                  <span
                    className={`text-sm font-bold transition-colors ${
                      isExpanded ? "text-[#147D78]" : "text-[#263746]"
                    }`}
                  >
                    {item.question}
                  </span>
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 ${
                      isExpanded ? "rotate-180 bg-[#EAF6F2] text-[#147D78]" : "bg-[#F0F7F4] text-[#8A9BAA]"
                    }`}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      id={`faq-answer-${index}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-[#D4E8E0]/70 px-6 py-4.5 text-sm leading-relaxed text-[#4A6577]">
                        <p>{item.answer}</p>
                        {item.category === "demo" && (
                          <div className="mt-3.5 pt-2 border-t border-[#D4E8E0]/50">
                            <Link
                              href="/contact?project=MediCare#contact-form"
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#147D78] hover:text-[#0F5C55] transition-colors"
                            >
                              <Sparkles className="h-3.5 w-3.5" />
                              <span>Speak with Axivon Technologies →</span>
                            </Link>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
