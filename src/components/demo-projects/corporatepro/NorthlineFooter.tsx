"use client";

import React from "react";
import Link from "next/link";
import { ArrowUp, Sparkles, ExternalLink } from "lucide-react";

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
      className="bg-[#252925] text-[#F7F5EF] pt-16 pb-12 border-t border-[#29483B]/40"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-white/10">
          {/* Brand & Mission Statement Column */}
          <div className="md:col-span-5 flex flex-col justify-between">
            <div>
              {/* Wordmark */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#29483B] text-[#F7F5EF] border border-[#E2E9E0]/20">
                  <span className="font-serif text-sm font-semibold">N</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-serif text-lg font-bold tracking-tight text-[#F7F5EF]">
                    NORTHLINE
                  </span>
                  <span className="text-[9px] font-semibold tracking-[0.28em] text-[#E2E9E0]/70 uppercase">
                    ADVISORY
                  </span>
                </div>
              </div>

              {/* Brand statement */}
              <p className="text-xs sm:text-sm text-[#E2E9E0]/75 leading-relaxed max-w-sm mb-6">
                Independent management advisory and operational transformation for ambitious B2B enterprises. Bringing clarity, rigor, and sustained capability to complex organizations.
              </p>
            </div>

            {/* Axivon Demo Provenance Badge */}
            <div className="inline-flex items-center gap-2 rounded-sm border border-white/10 bg-white/5 px-3 py-2 text-xs text-[#E2E9E0]/80">
              <Sparkles className="h-3.5 w-3.5 text-[#e8a064]" />
              <span>Demonstration showcase built by <strong>Axivon Technologies</strong></span>
            </div>
          </div>

          {/* Navigation Column */}
          <div className="md:col-span-3">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B87352] mb-4">
              NAVIGATION
            </h4>
            <ul className="space-y-2.5 text-xs text-[#E2E9E0]/80">
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
                  About & Philosophy
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
                  Book a Conversation
                </a>
              </li>
            </ul>
          </div>

          {/* Practice Areas Column */}
          <div className="md:col-span-4">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B87352] mb-4">
              PRACTICE AREAS
            </h4>
            <ul className="space-y-2.5 text-xs text-[#E2E9E0]/80 mb-6">
              <li>Strategy & Growth Architecture</li>
              <li>Operational Excellence & Supply Harmonization</li>
              <li>Digital Transformation & Systems Modernization</li>
              <li>Executive Alignment Diagnostic Sprints</li>
            </ul>

            {/* Back to Axivon Links */}
            <div className="pt-4 border-t border-white/10 space-y-2">
              <Link
                href="/demo-projects"
                className="inline-flex items-center gap-1.5 text-xs text-[#e8a064] hover:text-[#f0b07a] transition-colors"
              >
                <span>Return to Axivon Demo Catalogue</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
              <br />
              <Link
                href="/contact?project=CorporatePro#contact-form"
                className="inline-flex items-center gap-1.5 text-xs text-[#E2E9E0]/60 hover:text-white transition-colors"
              >
                <span>Inquire with Axivon about this template</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Back to Top */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#77796F]">
          <p>
            © 2026 Northline Advisory. Illustrative corporate demo designed by Axivon Technologies. All rights reserved.
          </p>

          <a
            href="#top"
            onClick={(e) => handleScroll(e, "#top")}
            className="inline-flex items-center gap-1.5 text-xs text-[#E2E9E0]/70 hover:text-white transition-colors"
          >
            <span>Back to top</span>
            <ArrowUp className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
