"use client";

import React from "react";
import Link from "next/link";
import { ArrowUp, Sparkles, ExternalLink, ArrowRight } from "lucide-react";

export default function NorthlineFooter() {
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <footer
      aria-label="Northline Advisory Footer"
      className="bg-[#131F19] text-[#F7F5EF] pt-16 sm:pt-20 pb-12 border-t border-[#29483B]/40 antialiased"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-white/10">
          {/* Brand & Mission Statement Column */}
          <div className="md:col-span-5 flex flex-col justify-between">
            <div>
              {/* Wordmark */}
              <div className="flex items-center gap-3.5 mb-5">
                <div className="relative flex h-9 w-9 items-center justify-center rounded-xs bg-[#29483B] text-[#F7F5EF] border border-[#B87352]/30 shadow-xs">
                  <span className="font-serif text-sm font-semibold tracking-wider">N</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-serif text-lg font-medium tracking-[0.06em] text-[#F7F5EF]">
                    NORTHLINE
                  </span>
                  <span className="text-[9px] font-semibold tracking-[0.24em] text-[#E2E9E0]/60 uppercase">
                    ADVISORY &bull; STRATEGY
                  </span>
                </div>
              </div>

              {/* Brand Statement */}
              <p className="text-xs sm:text-sm text-[#E2E9E0]/75 leading-relaxed max-w-sm mb-6 font-normal">
                Independent management advisory and operational transformation for ambitious B2B enterprises. Bringing clarity, rigor, and sustained capability to complex organizations.
              </p>
            </div>

            {/* Axivon Demo Provenance Badge */}
            <div className="inline-flex items-center gap-2 rounded-xs border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs text-[#E2E9E0]/85">
              <Sparkles className="h-3.5 w-3.5 text-[#B87352] shrink-0" />
              <span>Demonstration showcase built by <strong>Axivon Technologies</strong></span>
            </div>
          </div>

          {/* Quick Navigation Column */}
          <div className="md:col-span-3">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#B87352] mb-4">
              PAGES & SECTIONS
            </h4>
            <ul className="space-y-2.5 text-xs text-[#E2E9E0]/75">
              <li>
                <a
                  href="#top"
                  onClick={(e) => handleScroll(e, "#top")}
                  className="hover:text-white transition-colors"
                >
                  Overview & Hero
                </a>
              </li>
              <li>
                <a
                  href="#approach"
                  onClick={(e) => handleScroll(e, "#approach")}
                  className="hover:text-white transition-colors"
                >
                  Advisory Approach
                </a>
              </li>
              <li>
                <a
                  href="#services"
                  onClick={(e) => handleScroll(e, "#services")}
                  className="hover:text-white transition-colors"
                >
                  Practice Areas
                </a>
              </li>
              <li>
                <a
                  href="#work"
                  onClick={(e) => handleScroll(e, "#work")}
                  className="hover:text-white transition-colors"
                >
                  Selected Engagements
                </a>
              </li>
              <li>
                <a
                  href="#about"
                  onClick={(e) => handleScroll(e, "#about")}
                  className="hover:text-white transition-colors"
                >
                  Philosophy & Values
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  onClick={(e) => handleScroll(e, "#faq")}
                  className="hover:text-white transition-colors"
                >
                  FAQ & Clarifications
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  onClick={(e) => handleScroll(e, "#contact")}
                  className="hover:text-white transition-colors"
                >
                  Confidential Inquiry
                </a>
              </li>
            </ul>
          </div>

          {/* Practice Areas & Axivon CTA Column */}
          <div className="md:col-span-4">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#B87352] mb-4">
              PRACTICE DISCIPLINES
            </h4>
            <ul className="space-y-2.5 text-xs text-[#E2E9E0]/75 mb-8">
              <li className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-[#B87352]" />
                <span>Strategy & Growth Architecture</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-[#B87352]" />
                <span>Operational Excellence & RACI</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-[#B87352]" />
                <span>Digital Transformation Governance</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-[#B87352]" />
                <span>Executive Diagnostic Sprints</span>
              </li>
            </ul>

            {/* Back to Axivon Links */}
            <div className="pt-5 border-t border-white/10 space-y-2.5">
              <Link
                href="/demo-projects"
                className="group inline-flex items-center gap-1.5 text-xs text-[#B87352] hover:text-[#d48b68] transition-colors"
              >
                <span>Return to Axivon Showcase Catalogue</span>
                <ExternalLink className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <div>
                <Link
                  href="/contact?project=CorporatePro#contact-form"
                  className="group inline-flex items-center gap-1.5 text-xs text-[#E2E9E0]/70 hover:text-white transition-colors"
                >
                  <span>Build an enterprise site like this</span>
                  <ArrowRight className="h-3 w-3 text-[#B87352] transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Back to Top */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#E2E9E0]/60">
          <p>
            © 2026 Northline Advisory. Fictional corporate demo designed by Axivon Technologies. All rights reserved.
          </p>

          <a
            href="#top"
            onClick={(e) => handleScroll(e, "#top")}
            className="group inline-flex items-center gap-1.5 text-xs text-[#E2E9E0]/80 hover:text-white transition-colors"
          >
            <span>Back to top</span>
            <ArrowUp className="h-3.5 w-3.5 text-[#B87352] transition-transform group-hover:-translate-y-0.5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
