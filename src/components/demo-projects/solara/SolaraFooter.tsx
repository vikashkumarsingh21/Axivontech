"use client";

import React from "react";
import Link from "next/link";
import { Sun, Award, Trees, Heart } from "lucide-react";

export default function SolaraFooter() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="bg-[#121c15] text-[#f5efeb] border-t border-[#b57a42]/30 pt-16 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Brand Col */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#b57a42] text-[#121c15]">
                <Sun className="h-6 w-6" />
              </div>
              <div>
                <span className="font-serif text-lg font-bold text-[#f5efeb]">
                  Solara Retreat &amp; Resort
                </span>
                <p className="text-[10px] uppercase tracking-widest text-[#c48b56] font-semibold">
                  Where Nature Embraces Serenity
                </p>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-[#b8b0a7] max-w-sm font-light">
              An intimate eco-luxury nature sanctuary set within 45 acres of protected rainforest in the Nilgiri Biosphere, dedicated to slow hospitality, farm-to-table cuisine, and classical Ayurvedic wellness.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-[#c48b56]">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#b57a42]/30 bg-black/30 px-3 py-1">
                <Trees className="h-3.5 w-3.5" />
                <span>Green Globe Certified</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#b57a42]/30 bg-black/30 px-3 py-1">
                <Award className="h-3.5 w-3.5" />
                <span>Zero Single-Use Plastic</span>
              </span>
            </div>
          </div>

          {/* Villas & Suites */}
          <div>
            <h4 className="font-serif text-sm font-bold text-[#f5efeb] mb-3">
              Sanctuaries
            </h4>
            <ul className="space-y-2 text-xs text-[#b8b0a7]">
              <li>
                <button onClick={() => scrollTo("accommodations")} className="hover:text-[#c48b56] transition-colors">
                  The Forest Plunge Pool Villa
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo("accommodations")} className="hover:text-[#c48b56] transition-colors">
                  The Canopy Valley Suite
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo("accommodations")} className="hover:text-[#c48b56] transition-colors">
                  The Heritage Courtyard Cottage
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo("accommodations")} className="hover:text-[#c48b56] transition-colors">
                  Riverside Glamping Pavilion
                </button>
              </li>
            </ul>
          </div>

          {/* Experiences & Spa */}
          <div>
            <h4 className="font-serif text-sm font-bold text-[#f5efeb] mb-3">
              Holistic Living
            </h4>
            <ul className="space-y-2 text-xs text-[#b8b0a7]">
              <li>
                <button onClick={() => scrollTo("wellness")} className="hover:text-[#c48b56] transition-colors">
                  Ayurvedic Abhyanga &amp; Shirodhara
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo("dining")} className="hover:text-[#c48b56] transition-colors">
                  The Harvest Table Organic Dining
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo("experiences")} className="hover:text-[#c48b56] transition-colors">
                  Dark Sky Stargazing Observatory
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo("experiences")} className="hover:text-[#c48b56] transition-colors">
                  Guided Rainforest Biodiversity Walks
                </button>
              </li>
            </ul>
          </div>

          {/* Concierge & Booking */}
          <div>
            <h4 className="font-serif text-sm font-bold text-[#f5efeb] mb-3">
              Concierge
            </h4>
            <ul className="space-y-2 text-xs text-[#b8b0a7]">
              <li>
                <button onClick={() => scrollTo("reservation")} className="hover:text-[#c48b56] transition-colors font-medium text-[#c48b56]">
                  Check Stay Availability
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo("location")} className="hover:text-[#c48b56] transition-colors">
                  Airport Chauffeur Transfer
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo("location")} className="hover:text-[#c48b56] transition-colors">
                  Helipad Coordinates (VOSR)
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo("faq")} className="hover:text-[#c48b56] transition-colors">
                  Guest Policies &amp; Sanctuary Etiquette
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#8c857d]">
          <div>
            © 2026 Solara Retreat &amp; Resort. All Rights Reserved.
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <span>Crafted as a realistic luxury hospitality website demo by</span>
            <Link
              href="/"
              className="text-[#c48b56] font-bold hover:underline"
            >
              Axivon Technologies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
