"use client";

import React from "react";
import { ShieldCheck, Truck, RefreshCw, Feather } from "lucide-react";

const PILLARS = [
  {
    index: "01",
    icon: Feather,
    title: "Conscious Materiality",
    description: "Surgical-grade steel, vegetable-tanned leather, organic cotton, and recycled ripstop nylon.",
  },
  {
    index: "02",
    icon: Truck,
    title: "Pan-India Express Shipping",
    description: "Complimentary express courier delivery across India on all orders exceeding ₹2,000.",
  },
  {
    index: "03",
    icon: RefreshCw,
    title: "30-Day Effortless Trial",
    description: "Illustrative return window allowing customers to inspect tactile craft with total peace of mind.",
  },
  {
    index: "04",
    icon: ShieldCheck,
    title: "2-Year Craft Guarantee",
    description: "Heirloom construction backed by honest product warranties against hardware flaws.",
  },
];

export default function NovaCartValuePillars() {
  return (
    <section className="border-y border-[#DCDDD5] bg-[#E8EBE3]/45 py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className="group flex flex-col justify-between rounded-xl border border-[#DCDDD5] bg-white p-6 shadow-2xs transition-all duration-200 hover:border-[#1C1D1A] hover:shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#1C1D1A] text-[#D8F16A] shadow-2xs transition-transform duration-200 group-hover:scale-105">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-mono text-xs font-bold text-[#696D66]">
                      {p.index}
                    </span>
                  </div>
                  <h4 className="mt-4 text-sm font-black tracking-tight text-[#1C1D1A]">
                    {p.title}
                  </h4>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#696D66]">
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
