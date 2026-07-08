"use client";

import { Plus } from "lucide-react";

export default function DashboardHeader() {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <section className="flex flex-col gap-5 rounded-[18px] border border-[#2B323D] bg-[#1B212A] p-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium uppercase tracking-wide text-[#B7BDC7]">
          Dashboard
        </span>
        <h1 className="text-2xl font-semibold text-white">
          Good Morning, Vikas 👋
        </h1>
        <p className="text-sm text-[#B7BDC7]">
          Welcome back to Axivon Technologies Admin Panel.
        </p>
        <span className="text-xs text-[#B7BDC7]">{currentDate}</span>
      </div>

      <div className="flex shrink-0">
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg bg-[#C08457] px-4 py-2.5 text-sm font-medium text-[#0F1115] transition-colors duration-200 hover:bg-[#C08457]/90"
        >
          <Plus size={16} />
          New Project
        </button>
      </div>
    </section>
  );
}