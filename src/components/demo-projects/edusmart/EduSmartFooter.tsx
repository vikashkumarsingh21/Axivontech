"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, GraduationCap, ArrowUpRight } from "lucide-react";

export default function EduSmartFooter() {
  return (
    <footer
      aria-label="Aurevia Academy Footer"
      className="border-t border-[#33243B] bg-[#27232A] text-[#F7F3EB] pt-14 pb-10"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-12">
          {/* Brand Info */}
          <div className="lg:col-span-5">
            <span className="font-serif text-2xl font-bold tracking-tight text-[#F7F3EB]">
              AUREVIA ACADEMY
            </span>
            <p className="mt-1 text-xs uppercase tracking-[0.25em] text-[#B89557]">
              Centre for Higher Learning
            </p>
            <p className="mt-4 max-w-sm text-sm text-[#F7F3EB]/70 leading-relaxed">
              Fostering fearless intellectual inquiry, interdisciplinary research, modern
              studio collaboration, and an inclusive campus community.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <a
                href="#admissions"
                className="inline-flex items-center gap-2 rounded-full bg-[#33243B] border border-[#B89557]/40 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-sm hover:bg-[#483353] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B89557]"
              >
                <GraduationCap className="h-3.5 w-3.5 text-[#B89557]" />
                <span>Admissions Info</span>
              </a>
            </div>
          </div>

          {/* Academy Links */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#B89557]">
              Navigation
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-[#F7F3EB]/80">
              <li>
                <a href="#hero" className="transition-colors hover:text-[#B89557]">
                  Home
                </a>
              </li>
              <li>
                <a href="#about" className="transition-colors hover:text-[#B89557]">
                  About & Philosophy
                </a>
              </li>
              <li>
                <a href="#programs" className="transition-colors hover:text-[#B89557]">
                  Academic Pathways
                </a>
              </li>
              <li>
                <a href="#approach" className="transition-colors hover:text-[#B89557]">
                  Learning Methodology
                </a>
              </li>
              <li>
                <a href="#campus-life" className="transition-colors hover:text-[#B89557]">
                  Campus Environment
                </a>
              </li>
              <li>
                <a href="#faculty" className="transition-colors hover:text-[#B89557]">
                  Faculty Directory
                </a>
              </li>
              <li>
                <a href="#admissions" className="transition-colors hover:text-[#B89557]">
                  Admissions Journey
                </a>
              </li>
            </ul>
          </div>

          {/* Demonstration Notice */}
          <div className="lg:col-span-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#B89557]">
              Portfolio Demonstration
            </h4>
            <p className="mt-4 text-xs text-[#F7F3EB]/70 leading-relaxed">
              Aurevia Academy is a fictional educational demonstration created by{" "}
              <strong className="text-white">Axivon Technologies</strong> to showcase academic portal
              architecture, accessible form design, and responsive typography.
            </p>

            <div className="mt-6 space-y-3">
              <Link
                href="/demo-projects"
                className="inline-flex items-center gap-1.5 text-xs text-[#B89557] transition-colors hover:text-[#E8E1EB]"
              >
                <span>Browse All Axivon Demo Projects</span>
                <ArrowUpRight className="h-3 w-3" />
              </Link>
              <br />
              <Link
                href="/contact?project=EduSmart#contact-form"
                className="inline-flex items-center gap-1.5 text-xs text-[#E8E1EB] font-medium transition-colors hover:text-white"
              >
                <span>Request a Custom Education Web Solution</span>
                <ArrowUpRight className="h-3 w-3 text-[#B89557]" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-[#3B353F] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#F7F3EB]/50">
          <p>
            © {new Date().getFullYear()} Aurevia Academy (Fictional Demonstration). All rights reserved.
          </p>
          <p className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-[#B89557]" />
            <span>Built by Axivon Technologies</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
