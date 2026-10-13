"use client";

import React from "react";
import { ShieldCheck, Truck, RefreshCw, Feather } from "lucide-react";

const PILLARS = [
  {
    icon: Feather,
    title: "Conscious Materiality",
    description: "Surgical-grade steel, vegetable-tanned leather, organic cotton, and recycled ripstop nylon.",
  },
  {
    icon: Truck,
    title: "Pan-India Express Shipping",
    description: "Complimentary express courier delivery across India on all orders exceeding ₹2,000.",
  },
  {
    icon: RefreshCw,
    title: "30-Day Effortless Trial",
    description: "Illustrative return window allowing customers to inspect tactile craft with total peace of mind.",
  },
  {
    icon: ShieldCheck,
    title: "2-Year Craft Guarantee",
    description: "Heirloom construction backed by honest product warranties against hardware flaws.",
  },
];

export default function NovaCartValuePillars() {
  return (
    <section className="border-t border-b border-[#DCDDD5] bg-[#E8EBE3]/50 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.title} className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white border border-[#DCDDD5] text-[#1C1D1A] shadow-xs">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#1C1D1A]">{p.title}</h4>
                  <p className="mt-1 text-xs text-[#696D66] leading-relaxed">
                    {p.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
