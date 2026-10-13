"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, UtensilsCrossed, ArrowUpRight } from "lucide-react";

export default function FoodieHubFooter() {
  return (
    <footer
      aria-label="Saffron & Stone Restaurant Footer"
      className="border-t border-[#E8DFC9] bg-[#24221F] text-[#F8F3EA] pt-14 pb-10"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-5">
            <span className="font-serif text-2xl font-bold tracking-wider text-[#F8F3EA]">
              SAFFRON & STONE
            </span>
            <p className="mt-1 text-xs uppercase tracking-[0.25em] text-[#C9A86A]">
              Contemporary Indian Dining
            </p>
            <p className="mt-4 max-w-sm text-sm text-[#F8F3EA]/70 leading-relaxed">
              Thoughtful food presentation, slow-simmered regional gravies, artisanal
              clay-oven craftsmanship, and warm hospitality gathered around the table.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <a
                href="#reservations"
                className="inline-flex items-center gap-2 rounded-full bg-[#B85C38] px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-sm hover:bg-[#9E4A28] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B85C38]"
              >
                <UtensilsCrossed className="h-3.5 w-3.5" />
                <span>Book a Table</span>
              </a>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#C9A86A]">
              Restaurant
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-[#F8F3EA]/80">
              <li>
                <a href="#hero" className="transition-colors hover:text-[#B85C38]">
                  Home
                </a>
              </li>
              <li>
                <a href="#story" className="transition-colors hover:text-[#B85C38]">
                  Our Story
                </a>
              </li>
              <li>
                <a href="#menu" className="transition-colors hover:text-[#B85C38]">
                  Our Menu & Specials
                </a>
              </li>
              <li>
                <a href="#signatures" className="transition-colors hover:text-[#B85C38]">
                  Signature Dishes
                </a>
              </li>
              <li>
                <a href="#experience" className="transition-colors hover:text-[#B85C38]">
                  Dining Atmosphere
                </a>
              </li>
              <li>
                <a href="#gallery" className="transition-colors hover:text-[#B85C38]">
                  Photo Gallery
                </a>
              </li>
            </ul>
          </div>

          {/* Demonstration Notice & Axivon Showcase Links */}
          <div className="lg:col-span-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#C9A86A]">
              Portfolio Demonstration
            </h4>
            <p className="mt-4 text-xs text-[#F8F3EA]/70 leading-relaxed">
              Saffron & Stone is a fictional restaurant demonstration engineered by{" "}
              <strong className="text-white">Axivon Technologies</strong> to showcase
              interactive restaurant web development, typography hierarchy, and UI/UX design.
            </p>

            <div className="mt-6 space-y-3">
              <Link
                href="/demo-projects"
                className="inline-flex items-center gap-1.5 text-xs text-[#C9A86A] transition-colors hover:text-[#E8DFC9]"
              >
                <span>Browse All Axivon Demo Projects</span>
                <ArrowUpRight className="h-3 w-3" />
              </Link>
              <br />
              <Link
                href="/contact?project=FoodieHub#contact-form"
                className="inline-flex items-center gap-1.5 text-xs text-[#B85C38] font-medium transition-colors hover:text-[#D97D5B]"
              >
                <span>Request a Custom Restaurant Web Solution</span>
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-[#383531] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#F8F3EA]/50">
          <p>
            © {new Date().getFullYear()} Saffron & Stone (Fictional Demonstration). All rights reserved.
          </p>
          <p className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-[#B85C38]" />
            <span>Built by Axivon Technologies</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
