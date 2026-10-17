"use client";

import React, { useState } from "react";
import { FITZONE_MEMBERSHIPS } from "@/data/fitzone-data";
import {
  Check,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Zap,
} from "lucide-react";

interface FitZoneMembershipProps {
  onSelectPlan: (planName: string) => void;
}

export default function FitZoneMembership({
  onSelectPlan,
}: FitZoneMembershipProps) {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section
      id="membership"
      className="relative w-full border-t border-[#2B3137] bg-[#0B0D0F] py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#FF7138]/30 bg-[#FF7138]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-[#FF7138] mb-4">
            <CreditCard className="h-3.5 w-3.5" />
            <span>Transparent Athletic Passes</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-[#F6F4F0] leading-tight">
            NO HIDDEN FEES. <br />
            <span className="text-[#FF7138]">ZERO UNWANTED CONTRACTS.</span>
          </h2>

          <p className="mt-4 text-sm sm:text-base text-[#B5BBC2] leading-relaxed">
            Choose the tier tailored to your intensity. All memberships include
            frictionless mobile app check-in, chilled towel service, and full
            locker room recovery amenities.
          </p>

          {/* Billing Switcher (Monthly vs Annual) */}
          <div className="mt-8 inline-flex items-center rounded-2xl border border-[#2B3137] bg-[#111417] p-1.5 shadow-xl">
            <button
              type="button"
              onClick={() => setIsAnnual(false)}
              className={`rounded-xl px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                !isAnnual
                  ? "bg-[#20252A] text-[#F6F4F0] shadow-md border border-white/10"
                  : "text-[#858D96] hover:text-[#F6F4F0]"
              }`}
            >
              Monthly Billing
            </button>

            <button
              type="button"
              onClick={() => setIsAnnual(true)}
              className={`relative flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                isAnnual
                  ? "bg-[#FF7138] text-[#0B0D0F] shadow-lg shadow-[#FF7138]/25"
                  : "text-[#858D96] hover:text-[#F6F4F0]"
              }`}
            >
              <span>Annual Pass</span>
              <span className="rounded-full bg-black/20 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-black">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* 3 Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {FITZONE_MEMBERSHIPS.map((plan) => {
            const price = isAnnual ? plan.annualPriceMonthly : plan.monthlyPrice;

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col justify-between rounded-3xl border p-8 sm:p-9 transition-all duration-300 ${
                  plan.isPopular
                    ? "border-[#FF7138] bg-[#171B1F] shadow-2xl shadow-[#FF7138]/15 lg:-translate-y-2 ring-1 ring-[#FF7138]/50"
                    : "border-[#2B3137] bg-[#111417] hover:border-white/20 hover:bg-[#171B1F]"
                }`}
              >
                {/* Popular Pill */}
                {plan.isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#FF7138] to-[#FF934D] px-4 py-1 text-[11px] font-black uppercase tracking-widest text-[#0B0D0F] shadow-lg shadow-[#FF7138]/40">
                      <Sparkles className="h-3 w-3" />
                      <span>{plan.highlight}</span>
                    </span>
                  </div>
                )}

                <div>
                  {/* Plan Name & Tagline */}
                  <div className="mb-6">
                    <h3 className="text-xl font-black uppercase tracking-tight text-[#F6F4F0]">
                      {plan.name}
                    </h3>
                    <p className="mt-1 text-xs text-[#858D96] leading-relaxed">
                      {plan.tagline}
                    </p>
                  </div>

                  {/* Pricing Display */}
                  <div className="mb-8 pb-6 border-b border-[#2B3137]">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl sm:text-5xl font-black text-[#F6F4F0] font-mono tracking-tight">
                        ${price}
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#858D96]">
                        / Month
                      </span>
                    </div>
                    <p className="mt-2 text-[11px] text-[#48D597] font-semibold">
                      {isAnnual
                        ? `Billed annually ($${price * 12}/year)`
                        : "Billed month-to-month, cancel anytime"}
                    </p>
                  </div>

                  {/* Features List */}
                  <div className="space-y-3.5 mb-8">
                    <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#858D96]">
                      Included in this tier:
                    </p>
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-xs text-[#F6F4F0]">
                        <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#FF7138]/20 text-[#FF7138] mt-0.5">
                          <Check className="h-2.5 w-2.5 stroke-[3]" />
                        </div>
                        <span className="leading-snug">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Plan CTA */}
                <div>
                  <button
                    type="button"
                    onClick={() => onSelectPlan(plan.name)}
                    className={`w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-xs font-extrabold uppercase tracking-wider transition-all duration-200 active:scale-[0.98] ${
                      plan.isPopular
                        ? "bg-gradient-to-r from-[#FF7138] to-[#FF934D] text-[#0B0D0F] shadow-lg shadow-[#FF7138]/25 hover:brightness-110"
                        : "border border-[#2B3137] bg-white/5 text-[#F6F4F0] hover:border-[#FF7138] hover:text-[#FF7138]"
                    }`}
                  >
                    <span>Select {plan.name.split("/")[0]}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <p className="mt-3 text-center text-[10px] text-[#858D96]">
                    * Includes 100% Satisfaction Guarantee
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Assurance Strip */}
        <div className="mt-14 rounded-2xl border border-[#2B3137] bg-[#111417] p-6 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#48D597]/15 text-[#48D597] border border-[#48D597]/30">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#F6F4F0]">
                FitZone Athlete Guarantee & Flexibility
              </p>
              <p className="text-xs text-[#858D96] mt-0.5">
                Up to 60 days annual membership freeze &bull; No long-term lock-ins &bull; Free locker and guest privileges
              </p>
            </div>
          </div>

          <span className="shrink-0 text-xs font-bold text-[#FF7138] uppercase tracking-wider">
            Questions? Call Front Desk
          </span>
        </div>
      </div>
    </section>
  );
}
