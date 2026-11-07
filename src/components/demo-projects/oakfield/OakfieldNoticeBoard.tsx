"use client";

import React, { useState } from "react";
import { SchoolNotice } from "./types";
import { Bell, Calendar, ChevronRight, FileDown, Pin } from "lucide-react";

export default function OakfieldNoticeBoard() {
  const notices: SchoolNotice[] = [
    {
      id: "not-1",
      title: "Schedule for CBSE Class X & XII Pre-Board Examination II (Academic Session 2025–26)",
      category: "Academic",
      date: "02 November 2026",
      summary:
        "The detailed subject-wise timetable and examination guidelines for Pre-Board II have been released. Revision practicals will run from 8:00 AM to 11:30 AM in the senior laboratories.",
      urgent: true,
    },
    {
      id: "not-2",
      title: "Admissions 2026–27: First Round Campus Interaction Dates Announced for Nursery to Grade V",
      category: "Admissions",
      date: "28 October 2026",
      summary:
        "Parents who registered before October 25 have been allocated interaction slots. Please carry original birth certificates and immunization records.",
      urgent: true,
    },
    {
      id: "not-3",
      title: "Oakfield Annual Cultural Festival & Interschool Conclave 'Aethelgard 2026'",
      category: "Events",
      date: "20 October 2026",
      summary:
        "Auditions for the student drama production 'Antigone' and western choir are scheduled for Wednesday at the Central Auditorium.",
    },
    {
      id: "not-4",
      title: "CBSE South Zone Athletics Meet: Oakfield Contingent Clinches 6 Gold & 4 Silver Medals",
      category: "Sports",
      date: "14 October 2026",
      summary:
        "Congratulations to the Under-17 4x100m relay team and Master Devansh Roy for setting a new regional meet record in the 800m sprint.",
    },
    {
      id: "not-5",
      title: "School Transport Winter Route Optimization & Parent Mobile App Update",
      category: "Circular",
      date: "05 October 2026",
      summary:
        "Morning pickup schedules for Routes 12, 14, and 18 have been adjusted by 10 minutes to accommodate winter morning road visibility conditions.",
    },
  ];

  const [activeFilter, setActiveFilter] = useState<string>("All");

  const filtered = activeFilter === "All" ? notices : notices.filter((n) => n.category === activeFilter);

  return (
    <section id="notice-board" className="py-20 bg-[#f4efe4] text-[#18231d] border-b border-[#e2d9c8]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#143d30]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#143d30] mb-2">
              <Bell className="h-3.5 w-3.5 text-[#c8a24d]" />
              <span>Official Communications</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#143d30]">
              Digital Notice Board &amp; Circulars
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#4f5e55]">
              Real-time circulars, examination timetables, and academic bulletins for parents and students.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {["All", "Academic", "Admissions", "Events", "Sports", "Circular"].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  activeFilter === cat
                    ? "bg-[#143d30] text-[#faf8f4]"
                    : "bg-[#faf8f4] border border-[#dfd4c0] text-[#4f5e55] hover:bg-[#eae1d0]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Notice List */}
        <div className="space-y-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-[#dfd4c0] bg-[#faf8f4] p-6 transition-all hover:border-[#143d30]/40 hover:shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-3">
                  {item.urgent && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-rose-100 border border-rose-200 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                      <Pin className="h-2.5 w-2.5" />
                      Important
                    </span>
                  )}
                  <span className="rounded-md bg-[#f4efe4] border border-[#dfd4c0] px-2.5 py-0.5 text-[10px] font-bold text-[#143d30]">
                    {item.category}
                  </span>
                  <span className="text-xs font-medium text-[#718278] flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-[#c8a24d]" />
                    {item.date}
                  </span>
                </div>
              </div>

              <h3 className="font-serif text-base sm:text-lg font-bold text-[#143d30] mt-1">
                {item.title}
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-[#4f5e55] leading-relaxed">
                {item.summary}
              </p>

              <div className="mt-4 pt-3 border-t border-[#ece4d5] flex items-center justify-between text-xs text-[#143d30]">
                <span className="font-medium text-[11px] text-[#718278]">
                  Ref: {item.id.toUpperCase()} · Office of the Controller of Examinations
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#143d30] hover:text-[#c8a24d] cursor-pointer">
                  <FileDown className="h-3 w-3" />
                  <span>Download Circular PDF</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
