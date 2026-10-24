"use client";

import React from "react";
import Link from "next/link";
import { PlusCircle, ArrowRight, Layers } from "lucide-react";
import { PRICING_ADD_ONS } from "@/config/pricing";

export default function PricingAddOns() {
  return (
    <section id="add-ons" className="py-16 sm:py-20 border-t border-[#1e1e1e]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-mono font-medium text-[#A7B0BC] mb-3">
            <Layers className="h-3.5 w-3.5 text-[#e8a064]" />
            <span>Modular Enhancements</span>
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[#F3F5F7]">
            Optional Add-ons &amp; Custom Modules
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-[#A7B0BC] leading-relaxed">
            Enhance any base package with targeted functional additions when your business needs them.
          </p>
        </div>

        {/* Add-ons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {PRICING_ADD_ONS.map((addon) => (
            <div
              key={addon.id}
              className="flex flex-col justify-between rounded-xl border border-[#222730] bg-[#141820]/60 p-5 transition-all hover:border-[#384252] hover:bg-[#141820]"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#e8a064] bg-[#e8a064]/10 border border-[#e8a064]/20 px-2 py-0.5 rounded-full">
                    {addon.category}
                  </span>
                  <PlusCircle className="h-4 w-4 text-[#7E8997]" />
                </div>
                <h3 className="font-heading text-sm font-bold text-[#F3F5F7] mb-2">
                  {addon.title}
                </h3>
                <p className="text-xs text-[#A7B0BC] leading-relaxed">
                  {addon.description}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#7E8997]">
                  {addon.priceEstimate}
                </span>
                <Link
                  href={`/contact?service=web-development&message=${encodeURIComponent(`I am interested in adding the "${addon.title}" module.`)}#contact-form`}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#e8a064] hover:underline"
                >
                  <span>Inquire</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Custom Feature Note */}
        <div className="mt-10 rounded-2xl border border-dashed border-[#2a3340] bg-[#101319]/80 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="max-w-xl text-center sm:text-left">
            <h4 className="font-heading text-sm font-bold text-[#F3F5F7]">
              Need a specialized API integration or 3rd-party system?
            </h4>
            <p className="mt-1 text-xs text-[#A7B0BC] leading-relaxed">
              We frequently integrate custom CRMs, ERPs, accounting software, legacy SQL databases, and internal inventory management systems.
            </p>
          </div>
          <Link
            href="/contact?service=custom-software-development#contact-form"
            className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-5 py-2.5 text-xs font-semibold text-[#F3F5F7] hover:bg-white/10 transition-colors"
          >
            <span>Discuss Custom Integration</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

      </div>
    </section>
  );
}
