"use client";

import React from "react";
import Link from "next/link";
import { GraduationCap, Award, ShieldCheck, Heart } from "lucide-react";

export default function OakfieldFooter() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="bg-[#0f2e24] text-[#faf8f4] border-t border-[#c8a24d]/30 pt-16 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Brand Col */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#c8a24d] text-[#0f2e24]">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <span className="font-serif text-lg font-bold text-[#faf8f4]">
                  Oakfield International School
                </span>
                <p className="text-[10px] uppercase tracking-wider text-[#c8a24d] font-semibold">
                  Inspiring Excellence · Nurturing Character
                </p>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-[#c1d1c7] max-w-sm font-light">
              A premier CBSE-affiliated co-educational senior secondary institution dedicated to holistic character development, STEM innovation, and global scholarship across a 15-acre green campus.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-[#c8a24d]">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#c8a24d]/30 bg-black/20 px-3 py-1">
                <Award className="h-3.5 w-3.5" />
                <span>CBSE Affiliation: 1930284</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#c8a24d]/30 bg-black/20 px-3 py-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>School Code: 41082</span>
              </span>
            </div>
          </div>

          {/* Academic Wings */}
          <div>
            <h4 className="font-serif text-sm font-bold text-[#faf8f4] mb-3">
              Academic Wings
            </h4>
            <ul className="space-y-2 text-xs text-[#c1d1c7]">
              <li>
                <button onClick={() => scrollTo("academics")} className="hover:text-[#c8a24d] transition-colors">
                  Early Years / EYFS
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo("academics")} className="hover:text-[#c8a24d] transition-colors">
                  Primary Wing (Grades I–V)
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo("academics")} className="hover:text-[#c8a24d] transition-colors">
                  Middle School (Grades VI–VIII)
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo("academics")} className="hover:text-[#c8a24d] transition-colors">
                  Senior Secondary (Grades IX–XII)
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo("academics")} className="hover:text-[#c8a24d] transition-colors">
                  Career Counseling &amp; Olympiads
                </button>
              </li>
            </ul>
          </div>

          {/* Admissions & Governance */}
          <div>
            <h4 className="font-serif text-sm font-bold text-[#faf8f4] mb-3">
              Admissions &amp; Policy
            </h4>
            <ul className="space-y-2 text-xs text-[#c1d1c7]">
              <li>
                <button onClick={() => scrollTo("admissions")} className="hover:text-[#c8a24d] transition-colors font-medium text-[#c8a24d]">
                  Admissions Open 2026–27
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo("admissions")} className="hover:text-[#c8a24d] transition-colors">
                  Age Eligibility Guidelines
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo("admissions")} className="hover:text-[#c8a24d] transition-colors">
                  Fee Schedule &amp; Transparency
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo("principal")} className="hover:text-[#c8a24d] transition-colors">
                  Principal&apos;s Welcome Address
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo("notice-board")} className="hover:text-[#c8a24d] transition-colors">
                  Mandatory CBSE Disclosures
                </button>
              </li>
            </ul>
          </div>

          {/* Campus & Visit */}
          <div>
            <h4 className="font-serif text-sm font-bold text-[#faf8f4] mb-3">
              Campus &amp; Facilities
            </h4>
            <ul className="space-y-2 text-xs text-[#c1d1c7]">
              <li>
                <button onClick={() => scrollTo("campus")} className="hover:text-[#c8a24d] transition-colors">
                  Smart Digital Studios
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo("campus")} className="hover:text-[#c8a24d] transition-colors">
                  STEM Robotics &amp; AI Lab
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo("campus")} className="hover:text-[#c8a24d] transition-colors">
                  Ashoka Central Library
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo("campus")} className="hover:text-[#c8a24d] transition-colors">
                  Olympic Athletics Complex
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo("contact")} className="hover:text-[#c8a24d] transition-colors">
                  Book Guided Campus Walk
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits & Disclaimer */}
        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#9bb0a4]">
          <div>
            © 2026 Oakfield International School. All Rights Reserved.
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <span>Crafted as a realistic institutional website demonstration by</span>
            <Link
              href="/"
              className="text-[#c8a24d] font-bold hover:underline"
            >
              Axivon Technologies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
