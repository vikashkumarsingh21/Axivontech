"use client";

import React from "react";
import Link from "next/link";
import { Building2, ArrowUpRight, ArrowUp, Sparkles, ShieldCheck } from "lucide-react";

export default function EstateVistaFooter() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-[#0A1612] text-[#E4EDE8] border-t border-[#123C32]/40 relative">
      {/* ── Axivon Conversion Callout Banner ───────────────────────── */}
      <div className="border-b border-[#123C32]/40 bg-[#0E1F1A]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 rounded-2xl border border-[#23584B]/40 bg-[#122A23] p-8 sm:p-10 shadow-lg">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#C59B63]/40 bg-[#C59B63]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C59B63] mb-3">
                <Sparkles className="h-3 w-3" />
                <span>Build with Axivon Technologies</span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Commission a Custom Real Estate or Prop-Tech Platform
              </h3>
              <p className="text-xs sm:text-sm text-[#A3B8AF] mt-2 leading-relaxed">
                Whether you need interactive CAD floor plan viewers, multi-facet filtering, automated
                mortgage calculators, or private client viewing scheduling, Axivon Technologies
                engineers production-ready web platforms for luxury brokerages and property developers.
              </p>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row gap-3">
              <Link
                href="/contact?project=EstateVista#contact-form"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#C59B63] hover:bg-[#B58B53] text-[#0A1612] px-6 py-3 text-xs font-bold shadow-md transition-all active:scale-[0.98]"
              >
                <span>Discuss Your Real Estate Project</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                href="/demo-projects"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white px-5 py-3 text-xs font-semibold transition-all"
              >
                <span>Browse All 20+ Demos</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Footer Links & Directory ───────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#123C32] text-[#C59B63] border border-[#23584B]">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <span className="font-serif text-xl font-bold tracking-tight text-white block">
                  ESTATEVISTA
                </span>
                <span className="text-[9px] font-semibold uppercase tracking-[0.24em] text-[#C59B63]">
                  Prime Realty & Architecture
                </span>
              </div>
            </div>

            <p className="text-xs text-[#8FA59A] leading-relaxed max-w-sm">
              Curating exceptional architectural residences, sky penthouses, and institutional
              commercial campuses across world-class sanctuaries.
            </p>

            <div className="flex items-center gap-2 text-xs text-[#A3B8AF]">
              <ShieldCheck className="h-4 w-4 text-[#2E6B56]" />
              <span>Full Fiduciary Escrow & Title Verification Protocols</span>
            </div>
          </div>

          {/* Typologies */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#C59B63] mb-4">
              Typologies
            </h4>
            <ul className="space-y-2.5 text-xs text-[#8FA59A]">
              <li>
                <a href="#residences" className="hover:text-white transition-colors">
                  Luxury Ridge Villas
                </a>
              </li>
              <li>
                <a href="#residences" className="hover:text-white transition-colors">
                  Horizon Sky Penthouses
                </a>
              </li>
              <li>
                <a href="#residences" className="hover:text-white transition-colors">
                  Biophilic Courtyard Estates
                </a>
              </li>
              <li>
                <a href="#residences" className="hover:text-white transition-colors">
                  Deep-Water Waterfront Compounds
                </a>
              </li>
              <li>
                <a href="#residences" className="hover:text-white transition-colors">
                  Commercial Tech Pavilions
                </a>
              </li>
            </ul>
          </div>

          {/* Micro-Markets */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#C59B63] mb-4">
              Enclaves
            </h4>
            <ul className="space-y-2.5 text-xs text-[#8FA59A]">
              <li>
                <a href="#neighborhoods" className="hover:text-white transition-colors">
                  Hillside Enclave, CA
                </a>
              </li>
              <li>
                <a href="#neighborhoods" className="hover:text-white transition-colors">
                  Metropolitan Tech Core, NY/TX
                </a>
              </li>
              <li>
                <a href="#neighborhoods" className="hover:text-white transition-colors">
                  Waterfront Promenade, FL
                </a>
              </li>
              <li>
                <a href="#neighborhoods" className="hover:text-white transition-colors">
                  Diplomatic Quarter, DC
                </a>
              </li>
              <li>
                <a href="#calculator" className="hover:text-white transition-colors">
                  Carrying Cost Modeler
                </a>
              </li>
            </ul>
          </div>

          {/* Platform & Portfolio */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#C59B63] mb-4">
              Demo Platform
            </h4>
            <ul className="space-y-2.5 text-xs text-[#8FA59A]">
              <li>
                <Link href="/demo-projects" className="hover:text-white transition-colors">
                  All 20+ Demo Projects
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="hover:text-white transition-colors">
                  Axivon Client Work
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  Engineering Capabilities
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Axivon
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Bottom Regulatory & Demonstration Disclaimer ───────────── */}
        <div className="mt-12 pt-8 border-t border-[#123C32]/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#6E8278]">
          <p className="max-w-3xl leading-relaxed">
            &copy; {new Date().getFullYear()} EstateVista Realty &middot; A digital demonstration
            created by Axivon Technologies. Property names, specifications, valuations, and
            architectural blueprints are simulated sample models created to demonstrate frontend
            platform capabilities.
          </p>

          <button
            type="button"
            onClick={scrollToTop}
            aria-label="Scroll back to top"
            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-[#A3B8AF] hover:text-white hover:border-[#C59B63]/60 transition-all shrink-0"
          >
            <span>Top</span>
            <ArrowUp className="h-3 w-3 text-[#C59B63]" />
          </button>
        </div>
      </div>
    </footer>
  );
}
