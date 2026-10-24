"use client";

import React from "react";
import Link from "next/link";
import { Check, ArrowRight, Clock, RefreshCw, ShieldCheck, Sparkles } from "lucide-react";
import { PRICING_PACKAGES, PricingPackage } from "@/config/pricing";

export default function PricingCards() {
  return (
    <section id="packages" className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#e8a064]/20 bg-[#e8a064]/10 px-3.5 py-1 text-xs font-mono font-semibold tracking-wider text-[#e8a064] mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Curated Development Packages</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-[#F3F5F7]">
            Transparent engagement models tailored to your scale.
          </h2>
          <p className="mt-4 text-[#A7B0BC] text-sm sm:text-base leading-relaxed">
            Every build is delivered with clean semantic code, mobile responsiveness, fast performance, and direct engineer support.
          </p>
        </div>

        {/* 4-Card Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-5 items-stretch">
          {PRICING_PACKAGES.map((pkg: PricingPackage) => {
            const isPopular = pkg.popular;
            const contactHref = `/contact?service=${encodeURIComponent(pkg.serviceSlug)}&package=${encodeURIComponent(pkg.packageSlug)}#contact-form`;

            return (
              <div
                key={pkg.id}
                className={`relative flex flex-col justify-between rounded-2xl p-6 sm:p-7 transition-all duration-300 ${
                  isPopular
                    ? "bg-[#161a22] border-2 border-[#e8a064] shadow-[0_8px_32px_rgba(232,160,100,0.15)] ring-1 ring-[#e8a064]/20 -translate-y-1 lg:-translate-y-2"
                    : "bg-[#141414] border border-[#222730] hover:border-[#384252] hover:bg-[#16171b]"
                }`}
              >
                {/* Popular / Feature Badge */}
                {pkg.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-gradient-to-r from-[#e8a064] to-[#f0b07a] text-[#0f0f0f] shadow-md">
                      <Sparkles className="h-3 w-3" />
                      {pkg.badge}
                    </span>
                  </div>
                )}

                <div>
                  {/* Card Title & Tagline */}
                  <div className="mb-4">
                    <h3 className="font-heading text-xl font-bold text-[#F3F5F7]">
                      {pkg.name}
                    </h3>
                    <p className="text-xs text-[#7E8997] mt-1 line-clamp-2 min-h-[32px]">
                      {pkg.tagline}
                    </p>
                  </div>

                  {/* Price Block: Null figures render "Get a quote" */}
                  <div className="mb-6 pb-6 border-b border-white/5">
                    <div className="flex items-baseline gap-1.5">
                      {pkg.price === null ? (
                        <div className="flex flex-col">
                          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F3F5F7] font-heading">
                            Get a quote
                          </span>
                          <span className="text-[11px] text-[#A7B0BC] mt-0.5 font-mono">
                            {pkg.priceNote || "Custom tailored written estimate"}
                          </span>
                        </div>
                      ) : (
                        <>
                          <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F3F5F7] font-heading">
                            ₹{pkg.price.toLocaleString("en-IN")}
                          </span>
                          <span className="text-xs text-[#7E8997]">/{pkg.billingPeriod}</span>
                        </>
                      )}
                    </div>
                    <p className="mt-3 text-xs text-[#A7B0BC] leading-relaxed">
                      {pkg.summary}
                    </p>
                  </div>

                  {/* Turnaround & Warranty Highlights */}
                  <div className="space-y-2 mb-6 rounded-xl bg-white/[0.02] border border-white/5 p-3 text-[11px] text-[#A7B0BC]">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-[#e8a064] shrink-0" />
                      <span>{pkg.inclusions.deliveryTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                      <span>{pkg.inclusions.revisions}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span>{pkg.inclusions.support}</span>
                    </div>
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-2.5 mb-8">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#7E8997] block">
                      Core Inclusions
                    </span>
                    {pkg.features.map((feature: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-[#D1D5DB]">
                        <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card CTA Button */}
                <div className="pt-4 border-t border-white/5">
                  <Link
                    href={contactHref}
                    className={`w-full inline-flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-xs font-semibold tracking-wide transition-all ${
                      isPopular
                        ? "bg-[#e8a064] text-[#0f0f0f] hover:bg-[#d4915c] shadow-[0_4px_16px_rgba(232,160,100,0.2)]"
                        : "bg-white/5 text-[#F3F5F7] border border-white/10 hover:bg-white/10 hover:border-white/20"
                    }`}
                  >
                    <span>Request Package Quote</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <p className="mt-2 text-[10px] text-center text-[#7E8997]">
                    Includes 24-hour reply SLA
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footnote on custom scopes */}
        <div className="mt-8 text-center text-xs text-[#7E8997]">
          <span>Need a specific combination of features or enterprise infrastructure? </span>
          <Link href="/contact" className="text-[#e8a064] hover:underline font-medium">
            Contact us for a custom functional specification.
          </Link>
        </div>

      </div>
    </section>
  );
}
