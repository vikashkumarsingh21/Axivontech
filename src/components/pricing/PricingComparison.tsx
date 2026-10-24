"use client";

import React from "react";
import Link from "next/link";
import { Check, Minus, HelpCircle } from "lucide-react";
import { PRICING_COMPARISON_MATRIX } from "@/config/pricing";

export default function PricingComparison() {
  const renderCellContent = (val: string | boolean) => {
    if (val === true) {
      return (
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
          <Check className="h-3.5 w-3.5" />
        </span>
      );
    }
    if (val === false) {
      return (
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/5 text-[#52525b]">
          <Minus className="h-3 w-3" />
        </span>
      );
    }
    return <span className="text-xs text-[#D1D5DB] leading-snug">{val}</span>;
  };

  return (
    <section id="comparison" className="py-16 sm:py-20 border-t border-[#1e1e1e]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[#F3F5F7]">
            Side-by-Side Package Comparison
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-[#A7B0BC] leading-relaxed">
            Detailed breakdown of architectural inclusions, capabilities, and delivery parameters.
          </p>
        </div>

        {/* Responsive Table Wrapper */}
        <div className="overflow-x-auto rounded-2xl border border-[#222730] bg-[#141414] shadow-xl">
          <table className="w-full text-left border-collapse min-w-[720px]">
            {/* Table Header */}
            <thead>
              <tr className="border-b border-[#222730] bg-[#101319]">
                <th className="py-5 px-6 text-xs font-semibold uppercase tracking-wider text-[#7E8997] w-[32%]">
                  Feature / Capability
                </th>
                <th className="py-5 px-4 text-xs font-bold text-[#F3F5F7] w-[17%]">
                  Starter
                </th>
                <th className="py-5 px-4 text-xs font-bold text-[#e8a064] w-[17%]">
                  Business
                </th>
                <th className="py-5 px-4 text-xs font-bold text-[#F3F5F7] w-[17%]">
                  Growth
                </th>
                <th className="py-5 px-4 text-xs font-bold text-[#F3F5F7] w-[17%]">
                  Custom / App / AI
                </th>
              </tr>
            </thead>

            {/* Table Body Categorized */}
            <tbody className="divide-y divide-[#1e222a]">
              {PRICING_COMPARISON_MATRIX.map((section, sIdx) => (
                <React.Fragment key={sIdx}>
                  {/* Category Header Row */}
                  <tr className="bg-[#181c24]/70">
                    <td
                      colSpan={5}
                      className="py-3 px-6 text-[11px] font-bold uppercase tracking-widest text-[#e8a064] font-heading"
                    >
                      {section.category}
                    </td>
                  </tr>

                  {/* Feature Rows */}
                  {section.rows.map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-3.5 px-6 text-xs text-[#A7B0BC] font-medium">
                        {row.feature}
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        {renderCellContent(row.starter)}
                      </td>
                      <td className="py-3.5 px-4 text-xs bg-[#e8a064]/[0.02]">
                        {renderCellContent(row.business)}
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        {renderCellContent(row.growth)}
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        {renderCellContent(row.custom)}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>

            {/* Table Footer with Direct Action Buttons */}
            <tfoot>
              <tr className="border-t border-[#222730] bg-[#101319]">
                <td className="py-5 px-6 text-xs text-[#7E8997] font-medium">
                  Ready to proceed?
                </td>
                <td className="py-5 px-4">
                  <Link
                    href="/contact?service=web-development&package=starter#contact-form"
                    className="inline-block text-[11px] font-semibold text-[#A7B0BC] hover:text-white transition-colors"
                  >
                    Select Starter &rarr;
                  </Link>
                </td>
                <td className="py-5 px-4 bg-[#e8a064]/[0.02]">
                  <Link
                    href="/contact?service=web-development&package=business#contact-form"
                    className="inline-block text-[11px] font-semibold text-[#e8a064] hover:underline"
                  >
                    Select Business &rarr;
                  </Link>
                </td>
                <td className="py-5 px-4">
                  <Link
                    href="/contact?service=web-development&package=growth#contact-form"
                    className="inline-block text-[11px] font-semibold text-[#A7B0BC] hover:text-white transition-colors"
                  >
                    Select Growth &rarr;
                  </Link>
                </td>
                <td className="py-5 px-4">
                  <Link
                    href="/contact?service=custom-software-development&package=custom#contact-form"
                    className="inline-block text-[11px] font-semibold text-[#A7B0BC] hover:text-white transition-colors"
                  >
                    Select Custom &rarr;
                  </Link>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

      </div>
    </section>
  );
}
