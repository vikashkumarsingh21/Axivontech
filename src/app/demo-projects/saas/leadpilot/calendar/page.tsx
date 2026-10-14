// src/app/demo-projects/saas/leadpilot/calendar/page.tsx
"use client";

import React, { useState, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckSquare,
  AlertCircle,
  Plus,
} from "lucide-react";
import { useLeadPilot } from "@/context/LeadPilotContext";

export default function LeadPilotCalendarPage() {
  const { tasks, leads, deals } = useLeadPilot();

  // Current viewed month (Default October 2026 based on scenario data)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(9); // 0-indexed: 9 = October

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Build calendar matrix (days in month, day offsets)
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Selected date events drawer/list
  const [selectedDate, setSelectedDate] = useState<string>("2026-10-15");

  // Map events by date (YYYY-MM-DD)
  const eventsByDate = useMemo(() => {
    const map: Record<string, { type: "task" | "deal" | "lead"; title: string; subtitle?: string }[]> = {};

    tasks.forEach((t) => {
      if (!map[t.dueDate]) map[t.dueDate] = [];
      map[t.dueDate].push({
        type: "task",
        title: t.title,
        subtitle: `Task · Due (${t.priority})`,
      });
    });

    leads.forEach((l) => {
      if (l.nextFollowUpAt) {
        if (!map[l.nextFollowUpAt]) map[l.nextFollowUpAt] = [];
        map[l.nextFollowUpAt].push({
          type: "lead",
          title: `Follow-up: ${l.fullName}`,
          subtitle: `${l.companyName} (${l.status})`,
        });
      }
    });

    deals.forEach((d) => {
      if (d.expectedCloseDate) {
        if (!map[d.expectedCloseDate]) map[d.expectedCloseDate] = [];
        map[d.expectedCloseDate].push({
          type: "deal",
          title: `Close Target: ${d.name}`,
          subtitle: `$${d.estimatedValue.toLocaleString()} · ${d.stage}`,
        });
      }
    });

    return map;
  }, [tasks, leads, deals]);

  const selectedDateEvents = eventsByDate[selectedDate] || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#252925]">
            Sales Calendar & Follow-up Schedule
          </h1>
          <p className="mt-0.5 text-xs text-[#747A75]">
            Monthly pipeline agenda mapping task deadlines, client meetings, and projected deal closing dates.
          </p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center p-1 bg-white rounded-xl border border-[#E3E6E1] shadow-2xs">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-[#747A75] hover:text-[#252925] hover:bg-[#F6F7F4] transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3 text-xs font-bold text-[#252925]">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-[#747A75] hover:text-[#252925] hover:bg-[#F6F7F4] transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid & Selected Date Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Matrix */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E3E6E1] shadow-xs p-5">
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px] text-[#747A75] pb-3 border-b border-[#E3E6E1]">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          <div className="grid grid-cols-7 gap-1.5 pt-3">
            {/* Empty slots for month start offset */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-20 sm:h-24 rounded-xl bg-[#F6F7F4]/40" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const monthStr = String(currentMonth + 1).padStart(2, "0");
              const dayStr = String(day).padStart(2, "0");
              const dateIso = `${currentYear}-${monthStr}-${dayStr}`;
              const dayEvents = eventsByDate[dateIso] || [];
              const isSelected = selectedDate === dateIso;

              return (
                <div
                  key={dateIso}
                  onClick={() => setSelectedDate(dateIso)}
                  className={`h-20 sm:h-24 p-1.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                    isSelected
                      ? "border-[#2F806A] bg-[#E5F0EB]/30 ring-1 ring-[#2F806A]"
                      : "border-[#E3E6E1] hover:border-[#2F806A]/40 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[11px] font-bold h-5 w-5 rounded-full flex items-center justify-center ${
                        isSelected ? "bg-[#2F806A] text-white" : "text-[#252925]"
                      }`}
                    >
                      {day}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[9px] font-bold px-1.5 rounded-full bg-[#E5F0EB] text-[#2F806A]">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Tiny chips */}
                  <div className="space-y-0.5 overflow-hidden">
                    {dayEvents.slice(0, 2).map((ev, idx) => (
                      <div
                        key={idx}
                        className={`text-[9px] truncate px-1 py-0.2 rounded font-medium ${
                          ev.type === "deal"
                            ? "bg-[#E5F0EB] text-[#2F806A]"
                            : ev.type === "task"
                            ? "bg-[#FFF4E5] text-[#DDA34B]"
                            : "bg-[#F0F2F0] text-[#555C56]"
                        }`}
                      >
                        {ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[8px] text-[#747A75] pl-0.5 font-semibold">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Agenda / Details */}
        <div className="bg-white rounded-2xl border border-[#E3E6E1] shadow-xs p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E3E6E1]">
              <div>
                <h3 className="text-sm font-bold text-[#252925]">Agenda for {selectedDate}</h3>
                <p className="text-[11px] text-[#747A75]">
                  {selectedDateEvents.length} scheduled sales items
                </p>
              </div>
              <CalendarIcon className="h-4 w-4 text-[#2F806A]" />
            </div>

            <div className="mt-4 space-y-3">
              {selectedDateEvents.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#747A75]">
                  No tasks or deal milestones scheduled on this date.
                </div>
              ) : (
                selectedDateEvents.map((ev, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-[#E3E6E1] bg-[#F6F7F4] space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#252925]">{ev.title}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                          ev.type === "deal"
                            ? "bg-[#E5F0EB] text-[#2F806A]"
                            : ev.type === "task"
                            ? "bg-[#FFF4E5] text-[#DDA34B]"
                            : "bg-white text-[#555C56] border"
                        }`}
                      >
                        {ev.type}
                      </span>
                    </div>
                    {ev.subtitle && (
                      <p className="text-[11px] text-[#747A75]">{ev.subtitle}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#E3E6E1] text-[11px] text-[#747A75] leading-relaxed">
            Calendar schedule automatically synchronizes with tasks, deals, and lead follow-up dates configured in LeadPilot.
          </div>
        </div>
      </div>
    </div>
  );
}
