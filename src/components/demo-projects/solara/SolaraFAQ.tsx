"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function SolaraFAQ() {
  const faqs = [
    {
      q: "What are Solara's arrival and departure timings?",
      a: "Standard check-in begins at 2:00 PM to allow complete botanical sanitization and preparation of your villa. Check-out is at 11:00 AM. Early arrivals and late departures are accommodated subject to prior villa availability.",
    },
    {
      q: "Is Solara suitable for families with young children?",
      a: "To protect the deep auditory silence and meditative sanctuary our guests seek, our Forest Plunge Pool Villas and Ayurvedic Spa are reserved exclusively for adults (16+). The Heritage Courtyard Cottages warmly welcome families with children aged 6 and above.",
    },
    {
      q: "What is your environmental and plastic-free policy?",
      a: "Solara is 100% single-use plastic-free. Drinking water is filtered through volcanic ceramic filters and served in sterilised glass bottles. 70% of estate electricity is solar-generated, and all wastewater is bio-recycled for our organic orchards.",
    },
    {
      q: "Can executive guests work remotely during extended stays?",
      a: "Yes. Every villa features dedicated Starlink satellite Wi-Fi with reliable 150+ Mbps speeds, ergonomic reading desks, and multiple international power outlets.",
    },
    {
      q: "What culinary accommodations are available for dietary restrictions?",
      a: "Our culinary brigade easily accommodates gluten-free, vegan, Jain, ketogenic, and personalized Ayurvedic dosha-specific dietary requirements. Please notify us during your reservation.",
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 bg-[#faf8f5] text-[#1b1916] border-b border-[#dfd7cc]">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#b57a42]">
            Guest Information
          </span>
          <h2 className="mt-2 font-serif text-3xl font-bold text-[#1f2e23]">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-[#dfd7cc] bg-[#f5efeb] overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left text-xs sm:text-sm font-semibold text-[#1f2e23] focus:outline-none"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-[#b57a42] shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#6b665f] leading-relaxed border-t border-[#dfd7cc]/50">
                    {faq.a}
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
