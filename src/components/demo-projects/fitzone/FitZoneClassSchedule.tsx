"use client";

import React, { useState } from "react";
import { ScheduleClassSession } from "./types";
import { FITZONE_SCHEDULE } from "@/data/fitzone-data";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Sparkles,
  Filter,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

interface FitZoneClassScheduleProps {
  onSelectClass: (session: ScheduleClassSession) => void;
}

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export default function FitZoneClassSchedule({
  onSelectClass,
}: FitZoneClassScheduleProps) {
  const [selectedDay, setSelectedDay] = useState<string>("Monday");
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = ["all", "Strength", "HIIT", "Functional", "Mobility", "Combat"];
  const timeFilters = [
    { label: "All Times", value: "all" },
    { label: "Morning (<12 PM)", value: "morning" },
    { label: "Afternoon (12-5 PM)", value: "afternoon" },
    { label: "Evening (>5 PM)", value: "evening" },
  ];

  // Filter sessions
  const filteredSessions = FITZONE_SCHEDULE.filter((session) => {
    if (session.dayOfWeek !== selectedDay) return false;
    if (selectedTimeFilter !== "all" && session.timeCategory !== selectedTimeFilter) {
      return false;
    }
    if (selectedCategory !== "all" && session.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  return (
    <section
      id="schedule"
      className="relative w-full border-t border-[#2B3137] bg-[#0B0D0F] py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#FF7138]/30 bg-[#FF7138]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-[#FF7138] mb-3">
              <Calendar className="h-3.5 w-3.5" />
              <span>7-Day Master Timetable</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-[#F6F4F0] leading-tight">
              CLASS TIMETABLE & <br />
              <span className="text-[#FF7138]">LIVE CAPACITY TRACKER.</span>
            </h2>
          </div>

          <p className="max-w-md text-sm text-[#B5BBC2] leading-relaxed">
            Reserve your training station up to 7 days in advance. Real-time
            capacity telemetry guarantees you always have your own rack and
            equipment.
          </p>
        </div>

        {/* Day-of-the-Week Switcher Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none">
          {DAYS_OF_WEEK.map((day) => {
            const isSelected = selectedDay === day;
            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={`shrink-0 rounded-xl px-5 py-3 text-xs font-extrabold uppercase tracking-wider transition-all duration-200 ${
                  isSelected
                    ? "bg-gradient-to-r from-[#FF7138] to-[#FF934D] text-[#0B0D0F] shadow-lg shadow-[#FF7138]/25 scale-105"
                    : "border border-[#2B3137] bg-[#171B1F] text-[#B5BBC2] hover:border-[#FF7138]/50 hover:text-white"
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Secondary Filter Controls: Time & Category */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#2B3137] bg-[#111417] p-4">
          {/* Time Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#858D96] mr-1">
              Time:
            </span>
            {timeFilters.map((tf) => (
              <button
                key={tf.value}
                type="button"
                onClick={() => setSelectedTimeFilter(tf.value)}
                className={`rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                  selectedTimeFilter === tf.value
                    ? "bg-[#20252A] text-[#FF7138] border border-[#FF7138]/50"
                    : "bg-[#171B1F] text-[#858D96] hover:text-[#F6F4F0] border border-transparent"
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#858D96] mr-1">
              Discipline:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                  selectedCategory === cat
                    ? "bg-[#FF7138]/20 text-[#FF7138] border border-[#FF7138]/40"
                    : "text-[#858D96] hover:text-[#F6F4F0]"
                }`}
              >
                {cat === "all" ? "All" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Schedule Grid / List */}
        <div className="mt-8 space-y-3.5">
          {filteredSessions.length > 0 ? (
            filteredSessions.map((session) => {
              const isLowCapacity = session.spotsRemaining <= 2 && session.spotsRemaining > 0;
              const isFull = session.spotsRemaining === 0;

              return (
                <div
                  key={session.id}
                  className="group relative flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-[#2B3137] bg-[#171B1F] p-5 sm:p-6 transition-all duration-300 hover:border-[#FF7138]/60 hover:bg-[#20252A]"
                >
                  {/* Left: Time & Class Meta */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                    {/* Time Slot Block */}
                    <div className="flex sm:flex-col items-baseline sm:items-center justify-between sm:justify-center rounded-xl bg-[#0B0D0F] border border-[#2B3137] px-4 py-2 sm:py-3 sm:w-28 shrink-0">
                      <span className="text-base sm:text-lg font-black font-mono text-[#F6F4F0]">
                        {session.timeSlot}
                      </span>
                      <span className="text-[10px] font-semibold text-[#858D96] uppercase">
                        {session.durationMinutes} Min
                      </span>
                    </div>

                    {/* Title & Zone */}
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="rounded-full bg-[#FF7138]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#FF7138] border border-[#FF7138]/30">
                          {session.category}
                        </span>
                        <span className="text-[10px] font-semibold text-[#858D96] uppercase">
                          {session.intensity}
                        </span>
                      </div>

                      <h3 className="text-lg font-black uppercase tracking-tight text-[#F6F4F0] group-hover:text-[#FF7138] transition-colors">
                        {session.className}
                      </h3>

                      <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-[#858D96]">
                        <span className="flex items-center gap-1.5 text-[#B5BBC2]">
                          <MapPin className="h-3.5 w-3.5 text-[#FF7138]" />
                          <span>{session.zone}</span>
                        </span>
                        <span className="flex items-center gap-1.5 text-[#B5BBC2]">
                          <User className="h-3.5 w-3.5 text-[#FF934D]" />
                          <span>Coach: {session.trainer}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Capacity telemetry & Reserve CTA */}
                  <div className="flex items-center justify-between md:justify-end gap-5 pt-3 md:pt-0 border-t md:border-t-0 border-[#2B3137]">
                    {/* Spot Indicator */}
                    <div className="text-left md:text-right">
                      <div className="flex items-center md:justify-end gap-1.5">
                        {isFull ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#FF6565]">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            <span>Waitlist Only</span>
                          </span>
                        ) : isLowCapacity ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#FF7138]">
                            <span className="h-2 w-2 rounded-full bg-[#FF7138] animate-pulse" />
                            <span>Only {session.spotsRemaining} spots left!</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#48D597]">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>{session.spotsRemaining} spots available</span>
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#858D96] mt-0.5">
                        Capacity: {session.spotsTotal} athletes max
                      </p>
                    </div>

                    {/* Reserve CTA */}
                    <button
                      type="button"
                      onClick={() => onSelectClass(session)}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#FF7138] hover:bg-[#e65d26] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#0B0D0F] shadow-sm shadow-[#FF7138]/20 transition-all active:scale-[0.98] shrink-0"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>{isFull ? "Join Waitlist" : "Reserve Spot"}</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-[#2B3137] bg-[#171B1F]/50 p-12 text-center">
              <Calendar className="mx-auto h-8 w-8 text-[#858D96] mb-3 opacity-60" />
              <p className="text-sm font-semibold text-[#F6F4F0]">
                No classes match the selected filter criteria.
              </p>
              <p className="mt-1 text-xs text-[#858D96]">
                Try selecting &ldquo;All Times&rdquo; or another day of the week.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
