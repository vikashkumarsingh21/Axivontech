"use client";

import React from "react";
import Link from "next/link";
import { Activity, ArrowUp, ExternalLink } from "lucide-react";

const DEPT_LINKS = [
  { name: "Cardiology", href: "#departments" },
  { name: "Orthopaedics", href: "#departments" },
  { name: "Dermatology", href: "#departments" },
  { name: "Paediatrics", href: "#departments" },
  { name: "Neurology", href: "#departments" },
  { name: "General Medicine", href: "#departments" },
];

const NAV_LINKS = [
  { name: "Home", href: "#hero" },
  { name: "Departments", href: "#departments" },
  { name: "Our Doctors", href: "#doctors" },
  { name: "Services", href: "#services" },
  { name: "About Us", href: "#about" },
  { name: "Patient Info", href: "#patient-info" },
  { name: "Contact", href: "#contact" },
];

const PATIENT_LINKS = [
  { name: "Book Appointment", href: "#appointment" },
  { name: "Patient Preparation", href: "#patient-info" },
  { name: "FAQ", href: "#faq" },
  { name: "Contact Us", href: "#contact" },
];

export default function MediCareFooter() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-[#263746] text-white pt-14 pb-8 border-t-4 border-[#147D78]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Row: Brand + Navigation Columns */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div>
            <Link
              href="#hero"
              className="group inline-flex items-center gap-2.5"
              aria-label="MediCare Health Centre Home"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#147D78] text-white transition-transform group-hover:scale-105">
                <Activity className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight">MediCare</span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-[#C9DED6]">Health Centre</span>
              </div>
            </Link>
            <p className="mt-4 text-xs leading-relaxed text-white/70 max-w-[260px]">
              A fictional multispeciality healthcare brand designed to showcase thoughtful patient-facing web experiences.
            </p>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#C9DED6]">
              Navigation
            </h4>
            <ul className="mt-4 space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-xs text-white/70 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#147D78] rounded"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Department Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#C9DED6]">
              Departments
            </h4>
            <ul className="mt-4 space-y-2.5">
              {DEPT_LINKS.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-xs text-white/70 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#147D78] rounded"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Patient Resources */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#C9DED6]">
              Patient Resources
            </h4>
            <ul className="mt-4 space-y-2.5">
              {PATIENT_LINKS.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-xs text-white/70 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#147D78] rounded"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Axivon CTA */}
            <div className="mt-6 pt-4 border-t border-white/10">
              <Link
                href="/contact?project=MediCare#contact-form"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C9DED6] hover:text-white transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                <span>Build a Similar Website</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-12 border-t border-white/10 pt-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            {/* Demo Disclaimer */}
            <div className="text-center sm:text-left">
              <p className="text-[11px] text-white/50 leading-relaxed max-w-md">
                MediCare Health Centre is a fictional healthcare brand. This website is a frontend demonstration created by{" "}
                <Link
                  href="/"
                  className="text-[#C9DED6] hover:text-white underline underline-offset-2"
                >
                  Axivon Technologies
                </Link>
                {" "}to showcase professional healthcare web design. No real clinical services, medical staff, or patient records are represented.
              </p>
            </div>

            {/* Back to top */}
            <button
              type="button"
              onClick={scrollToTop}
              aria-label="Back to top"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/20 text-white/60 transition-all hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#147D78]"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>

          {/* Bottom Attribution */}
          <div className="mt-4 text-center">
            <p className="text-[10px] text-white/40">
              © {new Date().getFullYear()} MediCare Demo · Designed &amp; Developed by Axivon Technologies
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
