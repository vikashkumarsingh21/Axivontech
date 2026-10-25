"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { EpButton } from "@/components/employee/EpButton";
import { PageHeader } from "@/components/employee/PageHeader";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  ExternalLink,
  Filter,
  X,
  Sun,
  CalendarCheck,
} from "lucide-react";
import {
  CalendarScheduleSettings,
  DEFAULT_CALENDAR_SETTINGS,
  generateMonthMatrix,
  generateWeekMatrix,
  checkWeeklyOff,
  toDateString,
  parseDateString,
  getRelativeDateLabel,
} from "@/lib/calendar/calendar-dates";

type CalendarView = "MONTH" | "WEEK" | "DAY" | "AGENDA";

interface CalendarEventItem {
  id: string;
  type:
    | "WEEKLY_OFF"
    | "COMPANY_HOLIDAY"
    | "PUBLIC_HOLIDAY"
    | "FESTIVAL_OR_OBSERVANCE"
    | "OPTIONAL_HOLIDAY"
    | "LEAVE"
    | "TASK"
    | "ANNOUNCEMENT";
  title: string;
  date: string; // YYYY-MM-DD
  endDate?: string;
  subtitle?: string | null;
  priority?: string | null;
  status?: string | null;
  isOfficialOff?: boolean;
}

export default function EmployeeCalendarPage() {
  const now = new Date();
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [activeView, setActiveView] = useState<CalendarView>("MONTH");
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");

  const [settings, setSettings] = useState<CalendarScheduleSettings>(DEFAULT_CALENDAR_SETTINGS);
  const [rawHolidays, setRawHolidays] = useState<any[]>([]);
  const [rawLeaves, setRawLeaves] = useState<any[]>([]);
  const [rawTasks, setRawTasks] = useState<any[]>([]);
  const [rawAnnouncements, setRawAnnouncements] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-11

  const loadCalendarData = useCallback(async () => {
    try {
      setLoading(true);
      const queryYear = currentDate.getFullYear();
      const queryMonth = currentDate.getMonth() + 1;

      const res = await fetch(`/api/v1/employee/calendar?year=${queryYear}&month=${queryMonth}`);
      const data = await res.json();

      if (data.success) {
        if (data.settings) setSettings(data.settings);
        setRawHolidays(data.holidays || []);
        setRawLeaves(data.leaves || []);
        setRawTasks(data.tasks || []);
        setRawAnnouncements(data.announcements || []);
        setSummary(data.summary || null);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [currentDate]);

  useEffect(() => {
    loadCalendarData();
  }, [loadCalendarData]);

  // Aggregate all events into a unified list
  const allEvents = useMemo(() => {
    const list: CalendarEventItem[] = [];

    // 1. Process Holidays & Observances
    rawHolidays.forEach((h: any) => {
      let type: CalendarEventItem["type"] = "PUBLIC_HOLIDAY";
      if (h.isCompanyHoliday) {
        type = "COMPANY_HOLIDAY";
      } else if (h.category === "FESTIVAL_OR_OBSERVANCE") {
        type = "FESTIVAL_OR_OBSERVANCE";
      } else if (h.isOptional) {
        type = "OPTIONAL_HOLIDAY";
      }

      list.push({
        id: `holiday-${h.id}`,
        type,
        title: h.name,
        date: h.date,
        subtitle: h.isCompanyHoliday
          ? "Official Company Day Off (Office Closed)"
          : "Festival / Observance (Working Day)",
        isOfficialOff: h.isCompanyHoliday,
      });
    });

    // 2. Process Employee Leaves (Own isolated leaves)
    rawLeaves.forEach((l: any) => {
      const start = parseDateString(l.startDate);
      const end = parseDateString(l.endDate);

      const cur = new Date(start);
      while (cur <= end) {
        const dStr = toDateString(cur);
        list.push({
          id: `leave-${l.id}-${dStr}`,
          type: "LEAVE",
          title: `My ${l.leaveType} Leave`,
          date: dStr,
          status: l.status,
          subtitle: l.reason || `${l.leaveType} Leave Application`,
          isOfficialOff: l.status === "APPROVED",
        });
        cur.setDate(cur.getDate() + 1);
      }
    });

    // 3. Process Task Deadlines
    rawTasks.forEach((t: any) => {
      if (t.dueDate) {
        list.push({
          id: `task-${t.id}`,
          type: "TASK",
          title: t.title,
          date: t.dueDate,
          priority: t.priority,
          status: t.status,
          subtitle: t.projectName ? `Project: ${t.projectName}` : "Sprint Deliverable",
          isOfficialOff: false,
        });
      }
    });

    // 4. Process Announcements
    rawAnnouncements.forEach((a: any) => {
      if (a.publishAt) {
        list.push({
          id: `ann-${a.id}`,
          type: "ANNOUNCEMENT",
          title: a.title,
          date: a.publishAt,
          priority: a.priority,
          subtitle: a.category ? `Category: ${a.category}` : "Company Broadcast",
          isOfficialOff: false,
        });
      }
    });

    return list;
  }, [rawHolidays, rawLeaves, rawTasks, rawAnnouncements]);

  // Compute month matrix (Sunday through Saturday columns)
  const monthDays = useMemo(() => {
    return generateMonthMatrix(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  // Compute week matrix for Week View
  const weekDays = useMemo(() => {
    return generateWeekMatrix(selectedDate);
  }, [selectedDate]);

  // Filter events based on selected category
  const filteredEvents = useMemo(() => {
    if (selectedFilter === "ALL") return allEvents;
    return allEvents.filter((e) => e.type === selectedFilter);
  }, [allEvents, selectedFilter]);

  // Events for selected date
  const selectedDateStr = toDateString(selectedDate);
  const selectedDayWeeklyOff = checkWeeklyOff(selectedDate, settings);
  const selectedDateEvents = useMemo(() => {
    return filteredEvents.filter((e) => e.date === selectedDateStr);
  }, [filteredEvents, selectedDateStr]);

  // Navigation handlers
  const handlePrev = () => {
    if (activeView === "MONTH") {
      setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    } else if (activeView === "WEEK") {
      const prev = new Date(selectedDate);
      prev.setDate(prev.getDate() - 7);
      setSelectedDate(prev);
      setCurrentDate(prev);
    } else {
      const prev = new Date(selectedDate);
      prev.setDate(prev.getDate() - 1);
      setSelectedDate(prev);
      setCurrentDate(prev);
    }
  };

  const handleNext = () => {
    if (activeView === "MONTH") {
      setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    } else if (activeView === "WEEK") {
      const next = new Date(selectedDate);
      next.setDate(next.getDate() + 7);
      setSelectedDate(next);
      setCurrentDate(next);
    } else {
      const next = new Date(selectedDate);
      next.setDate(next.getDate() + 1);
      setSelectedDate(next);
      setCurrentDate(next);
    }
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  // Helper badge style
  const getEventBadgeClass = (type: CalendarEventItem["type"]) => {
    switch (type) {
      case "COMPANY_HOLIDAY":
        return "bg-[#4F9D83]/15 text-[#4F9D83] border border-[#4F9D83]/30";
      case "PUBLIC_HOLIDAY":
        return "bg-[#C9A15B]/15 text-[#C9A15B] border border-[#C9A15B]/30";
      case "FESTIVAL_OR_OBSERVANCE":
        return "bg-[#C9A15B]/10 text-[#C9A15B] border border-[#C9A15B]/20";
      case "OPTIONAL_HOLIDAY":
        return "bg-[#8E9AAF]/10 text-[#8E9AAF] border border-[#8E9AAF]/25";
      case "LEAVE":
        return "bg-[#8E9AAF]/15 text-[#8E9AAF] border border-[#8E9AAF]/30";
      case "TASK":
        return "bg-[#C46A62]/10 text-[#C46A62] border border-[#C46A62]/25";
      case "ANNOUNCEMENT":
        return "bg-[#4F9D83]/10 text-[#4F9D83] border border-[#4F9D83]/25";
      default:
        return "bg-[#232324] text-[#8A867E] border border-[#2E2E30]";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6 max-w-7xl pb-12"
    >
      {/* Page Header */}
      <PageHeader
        title="Company Calendar & Schedule"
        subtitle="Organization-wide weekly offs, Indian public holidays, festival observances, and personal sprint deadlines."
        icon={CalendarCheck}
        action={
          <div className="flex items-center gap-1.5 p-1 bg-[#1A1A1B] border border-[#2E2E30] rounded-xl text-xs">
            {(["MONTH", "WEEK", "DAY", "AGENDA"] as CalendarView[]).map((v) => (
              <button
                key={v}
                onClick={() => setActiveView(v)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  activeView === v
                    ? "bg-[#4F9D83] text-[#0F1A16] font-semibold shadow-xs"
                    : "text-[#8A867E] hover:text-[#EDEBE6]"
                }`}
              >
                {v.charAt(0) + v.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        }
      />

      {/* Navigation & Filter Bar */}
      <div className="p-4 bg-[#1A1A1B] border border-[#2E2E30] rounded-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Month / Period Controls */}
          <div className="flex items-center gap-2">
            <EpButton
              size="sm"
              variant="outline"
              onClick={handleToday}
              className="text-xs h-8 px-2.5"
            >
              Today
            </EpButton>

            <div className="flex items-center gap-1">
              <button
                onClick={handlePrev}
                className="p-1.5 rounded-lg border border-[#2E2E30] bg-[#232324] text-[#8A867E] hover:text-[#EDEBE6] hover:bg-[#2E2E30] transition-colors cursor-pointer"
                aria-label="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="p-1.5 rounded-lg border border-[#2E2E30] bg-[#232324] text-[#8A867E] hover:text-[#EDEBE6] hover:bg-[#2E2E30] transition-colors cursor-pointer"
                aria-label="Next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <h2 className="text-base sm:text-lg font-semibold text-[#EDEBE6] ml-2">
              {activeView === "MONTH" && `${monthNames[currentMonth]} ${currentYear}`}
              {activeView === "WEEK" &&
                `Week of ${weekDays[0].date.toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })} - ${weekDays[6].date.toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}`}
              {activeView === "DAY" &&
                selectedDate.toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              {activeView === "AGENDA" && `Upcoming Schedule (${currentYear})`}
            </h2>
          </div>

          {/* Filter Dropdown */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Filter className="w-3.5 h-3.5 text-[#8A867E]" />
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="h-8 px-2.5 bg-[#232324] border border-[#2E2E30] rounded-lg text-xs text-[#B3AFA6] focus:outline-hidden focus:border-[#4F9D83] cursor-pointer"
            >
              <option value="ALL">All Events & Deadlines</option>
              <option value="COMPANY_HOLIDAY">Company Holidays (Offices Closed)</option>
              <option value="FESTIVAL_OR_OBSERVANCE">Festivals & Observances</option>
              <option value="PUBLIC_HOLIDAY">Public Holidays</option>
              <option value="LEAVE">My Leaves</option>
              <option value="TASK">Task Deadlines</option>
              <option value="ANNOUNCEMENT">Announcements</option>
            </select>

            {selectedFilter !== "ALL" && (
              <button
                onClick={() => setSelectedFilter("ALL")}
                className="p-1.5 rounded-lg text-[#8A867E] hover:text-[#EDEBE6] cursor-pointer"
                title="Clear Filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Legend strip */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#2E2E30] text-[11px] text-[#8A867E]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#8A867E]" />
            <strong className="text-[#EDEBE6]">Weekly Off:</strong> Sundays & Saturdays
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#4F9D83]" />
            <strong className="text-[#4F9D83]">Company Holiday:</strong> Office Closed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#C9A15B]" />
            <strong className="text-[#C9A15B]">Observance:</strong> Festival / Event
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#8E9AAF]" />
            <strong className="text-[#8E9AAF]">Leave:</strong> My Time Off
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#C46A62]" />
            <strong className="text-[#C46A62]">Task:</strong> Sprint Due Date
          </span>
        </div>
      </div>

      {/* Main Grid + Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View Area (2 cols on desktop) */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="p-5 bg-[#1A1A1B] border border-[#2E2E30] rounded-xl space-y-4">
              <div className="grid grid-cols-7 gap-2 pb-2">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="h-4 bg-[#232324] rounded-md animate-pulse" />
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 35 }).map((_, i) => (
                  <div key={i} className="h-20 bg-[#121212] rounded-xl border border-[#2E2E30] animate-pulse" />
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* VIEW A: MONTH VIEW */}
              {activeView === "MONTH" && (
                <div className="p-3 sm:p-5 bg-[#1A1A1B] border border-[#2E2E30] rounded-xl space-y-2">
                  {/* Weekday Column Headers (Sun to Sat) */}
                  <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-[#8A867E] pb-2 border-b border-[#2E2E30]">
                    <span className="text-[#C46A62] font-semibold">Sun</span>
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span className="text-[#8A867E]">Sat</span>
                  </div>

                  {/* Month Grid Cells */}
                  <div className="grid grid-cols-7 gap-1.5">
                    {monthDays.map((cell) => {
                      const dayEvents = filteredEvents.filter((e) => e.date === cell.dateString);
                      const isSelected = cell.dateString === selectedDateStr;
                      const isToday = cell.dateString === toDateString(now);

                      // Check Weekly Off
                      const weeklyOffInfo = checkWeeklyOff(cell.date, settings);
                      const isWeeklyOff = weeklyOffInfo.isOff;

                      return (
                        <div
                          key={cell.dateString}
                          onClick={() => setSelectedDate(cell.date)}
                          className={`min-h-[85px] sm:min-h-[105px] p-1.5 sm:p-2 rounded-xl border transition-colors cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? "bg-[#232324] border-[#4F9D83] shadow-md ring-1 ring-[#4F9D83]/30"
                              : isToday
                              ? "bg-[#121212] border-[#4F9D83]/50"
                              : cell.isCurrentMonth
                              ? "bg-[#121212]/60 border-[#2E2E30] hover:border-[#3A3A3D]"
                              : "bg-[#121212]/20 border-transparent opacity-30 hover:opacity-60"
                          }`}
                        >
                          {/* Top Row: Date Number and Off Indicator */}
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-xs font-semibold ${
                                isToday
                                  ? "w-6 h-6 rounded-full bg-[#4F9D83] text-[#0F1A16] flex items-center justify-center font-bold"
                                  : isSelected
                                  ? "text-[#4F9D83]"
                                  : cell.dayOfWeek === 0
                                  ? "text-[#C46A62]"
                                  : cell.isCurrentMonth
                                  ? "text-[#EDEBE6]"
                                  : "text-[#8A867E]"
                              }`}
                            >
                              {cell.dayNumber}
                            </span>

                            {isWeeklyOff && (
                              <span
                                className="text-[9px] font-medium text-[#8A867E] bg-[#232324] border border-[#2E2E30] px-1 py-0.2 rounded"
                                title={weeklyOffInfo.reason}
                              >
                                Off
                              </span>
                            )}
                          </div>

                          {/* Event Badges (Up to 2 chips, then +N more) */}
                          <div className="space-y-1 mt-1">
                            {dayEvents.slice(0, 2).map((ev) => (
                              <div
                                key={ev.id}
                                className={`text-[10px] px-1.5 py-0.5 rounded truncate font-medium ${getEventBadgeClass(
                                  ev.type
                                )}`}
                                title={`${ev.title} — ${ev.subtitle || ""}`}
                              >
                                {ev.title}
                              </div>
                            ))}

                            {dayEvents.length > 2 && (
                              <div className="text-[10px] font-semibold text-[#4F9D83] pl-1">
                                +{dayEvents.length - 2} more
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* VIEW B: WEEK VIEW */}
              {activeView === "WEEK" && (
                <div className="p-4 sm:p-5 bg-[#1A1A1B] border border-[#2E2E30] rounded-xl space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-7 gap-2">
                    {weekDays.map((day) => {
                      const dayEvents = filteredEvents.filter((e) => e.date === day.dateString);
                      const weeklyOffInfo = checkWeeklyOff(day.date, settings);
                      const isSelected = day.dateString === selectedDateStr;
                      const isToday = day.dateString === toDateString(now);

                      return (
                        <div
                          key={day.dateString}
                          onClick={() => setSelectedDate(day.date)}
                          className={`p-3 rounded-xl border cursor-pointer transition-colors space-y-2 ${
                            isSelected
                              ? "bg-[#232324] border-[#4F9D83] ring-1 ring-[#4F9D83]/30"
                              : isToday
                              ? "bg-[#121212] border-[#4F9D83]/40"
                              : "bg-[#121212]/60 border-[#2E2E30] hover:border-[#3A3A3D]"
                          }`}
                        >
                          <div className="border-b border-[#2E2E30] pb-1.5 flex items-center justify-between">
                            <div>
                              <div className="text-[11px] font-semibold text-[#8A867E]">
                                {day.date.toLocaleDateString(undefined, { weekday: "short" })}
                              </div>
                              <div className="text-sm font-semibold text-[#EDEBE6]">
                                {day.dayNumber}
                              </div>
                            </div>
                            {weeklyOffInfo.isOff && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#232324] text-[#8A867E] border border-[#2E2E30]">
                                Off
                              </span>
                            )}
                          </div>

                          <div className="space-y-1.5 min-h-[90px]">
                            {dayEvents.length === 0 ? (
                              <span className="text-[11px] text-[#8A867E] italic block pt-2">
                                No events
                              </span>
                            ) : (
                              dayEvents.map((ev) => (
                                <div
                                  key={ev.id}
                                  className={`p-1.5 rounded text-[11px] font-medium leading-tight ${getEventBadgeClass(
                                    ev.type
                                  )}`}
                                >
                                  {ev.title}
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* VIEW C: DAY VIEW */}
              {activeView === "DAY" && (
                <div className="p-5 sm:p-6 bg-[#1A1A1B] border border-[#2E2E30] rounded-xl space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-[#2E2E30]">
                    <div>
                      <h3 className="text-lg font-semibold text-[#EDEBE6]">
                        {selectedDate.toLocaleDateString(undefined, {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </h3>
                      <p className="text-xs text-[#8A867E] mt-0.5">
                        {selectedDayWeeklyOff.isOff
                          ? selectedDayWeeklyOff.reason
                          : "Regular Company Workday"}
                      </p>
                    </div>

                    {selectedDayWeeklyOff.isOff && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#232324] border border-[#2E2E30] text-[#8A867E]">
                        {selectedDayWeeklyOff.reason}
                      </span>
                    )}
                  </div>

                  {selectedDateEvents.length === 0 && !selectedDayWeeklyOff.isOff ? (
                    <div className="py-12 text-center text-[#8A867E] text-xs">
                      No specific holidays, leaves, or deadlines scheduled for this date.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedDayWeeklyOff.isOff && (
                        <div className="p-4 rounded-xl bg-[#121212]/60 border border-[#2E2E30] flex items-center gap-3">
                          <Sun className="w-5 h-5 text-[#C9A15B]" />
                          <div>
                            <div className="font-semibold text-sm text-[#EDEBE6]">
                              {selectedDayWeeklyOff.reason}
                            </div>
                            <div className="text-xs text-[#8A867E]">
                              Configured weekly off day per calendar schedule settings.
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedDateEvents.map((ev) => (
                        <div
                          key={ev.id}
                          className="p-4 rounded-xl bg-[#121212]/60 border border-[#2E2E30] space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${getEventBadgeClass(
                                ev.type
                              )}`}
                            >
                              {ev.type.replace(/_/g, " ")}
                            </span>
                            {ev.status && (
                              <span className="text-xs font-mono text-[#4F9D83]">{ev.status}</span>
                            )}
                          </div>
                          <h4 className="text-base font-semibold text-[#EDEBE6] mt-1">{ev.title}</h4>
                          {ev.subtitle && (
                            <p className="text-xs text-[#8A867E] leading-relaxed">{ev.subtitle}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* VIEW D: AGENDA VIEW */}
              {activeView === "AGENDA" && (
                <div className="p-5 sm:p-6 bg-[#1A1A1B] border border-[#2E2E30] rounded-xl space-y-4">
                  <div className="pb-3 border-b border-[#2E2E30]">
                    <h3 className="text-base font-semibold text-[#EDEBE6]">
                      Upcoming Calendar Agenda ({currentYear})
                    </h3>
                    <p className="text-xs text-[#8A867E]">
                      Chronological upcoming holidays, festival observances, approved leaves, and deadlines.
                    </p>
                  </div>

                  {filteredEvents.length === 0 ? (
                    <div className="py-12 text-center text-[#8A867E] text-xs">
                      No calendar events recorded for this period.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {filteredEvents
                        .filter((e) => e.date >= toDateString(now))
                        .slice(0, 20)
                        .map((ev) => {
                          const dateObj = parseDateString(ev.date);
                          const countdown = getRelativeDateLabel(ev.date);

                          return (
                            <div
                              key={ev.id}
                              onClick={() => {
                                setSelectedDate(dateObj);
                                setActiveView("DAY");
                              }}
                              className="p-3.5 rounded-xl border border-[#2E2E30] bg-[#121212]/60 hover:border-[#3A3A3D] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-12 h-12 rounded-xl bg-[#1A1A1B] border border-[#2E2E30] flex flex-col items-center justify-center shrink-0">
                                  <span className="text-[10px] text-[#8A867E] font-semibold uppercase">
                                    {dateObj.toLocaleDateString(undefined, { month: "short" })}
                                  </span>
                                  <span className="text-base font-semibold text-[#EDEBE6]">
                                    {dateObj.getDate()}
                                  </span>
                                </div>

                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${getEventBadgeClass(
                                        ev.type
                                      )}`}
                                    >
                                      {ev.type.replace(/_/g, " ")}
                                    </span>
                                    <span className="text-xs font-semibold text-[#4F9D83]">
                                      {countdown}
                                    </span>
                                  </div>
                                  <h4 className="text-sm font-semibold text-[#EDEBE6]">{ev.title}</h4>
                                  {ev.subtitle && (
                                    <p className="text-xs text-[#8A867E]">{ev.subtitle}</p>
                                  )}
                                </div>
                              </div>

                              <div className="text-xs text-[#8A867E] self-end sm:self-center">
                                {dateObj.toLocaleDateString(undefined, { weekday: "long" })}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Selected Day Agenda Side Drawer (1 col) */}
        <div className="space-y-4">
          <div className="p-5 bg-[#1A1A1B] border border-[#2E2E30] rounded-xl space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-[#2E2E30]">
              <div className="w-9 h-9 rounded-lg bg-[#232324] border border-[#2E2E30] flex items-center justify-center text-[#4F9D83]">
                <CalendarIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#EDEBE6]">
                  {selectedDate.toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </h3>
                <p className="text-xs text-[#8A867E]">Day agenda & scheduled items</p>
              </div>
            </div>

            {/* Weekly Off Notice for Selected Day */}
            {selectedDayWeeklyOff.isOff && (
              <div className="p-3 bg-[#232324] border border-[#2E2E30] rounded-xl flex items-center gap-2.5 text-xs text-[#8A867E]">
                <Sun className="w-4 h-4 text-[#C9A15B] shrink-0" />
                <span>
                  <strong className="text-[#EDEBE6]">{selectedDayWeeklyOff.reason}</strong> (Company
                  Non-Working Day)
                </span>
              </div>
            )}

            {/* Day Events List */}
            {selectedDateEvents.length === 0 ? (
              <div className="py-8 text-center text-[#8A867E] text-xs space-y-1">
                <Clock className="w-6 h-6 text-[#8A867E] mx-auto mb-2" />
                <p>No specific holidays or deadlines for this day.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {selectedDateEvents.map((e) => (
                  <div
                    key={e.id}
                    className="p-3 rounded-xl border border-[#2E2E30] bg-[#121212]/60 space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${getEventBadgeClass(
                          e.type
                        )}`}
                      >
                        {e.type.replace(/_/g, " ")}
                      </span>
                      {e.status && (
                        <span className="text-[10px] text-[#8A867E] font-mono">{e.status}</span>
                      )}
                    </div>

                    <h4 className="text-xs sm:text-sm font-semibold text-[#EDEBE6]">{e.title}</h4>

                    {e.subtitle && <p className="text-[11px] text-[#8A867E]">{e.subtitle}</p>}

                    {e.type === "TASK" && (
                      <div className="pt-1">
                        <Link
                          href="/employee/tasks"
                          className="text-[11px] text-[#4F9D83] hover:text-[#5BB094] flex items-center gap-1 font-medium"
                        >
                          <span>Open in Tasks</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Holidays & Long Weekends Card */}
          <div className="p-5 bg-[#1A1A1B] border border-[#2E2E30] rounded-xl space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8A867E] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C9A15B]" />
              <span>Upcoming Holidays & Festivals</span>
            </h3>

            {summary?.upcomingHolidays?.length === 0 ? (
              <p className="text-xs text-[#8A867E]">No upcoming holidays this month.</p>
            ) : (
              <div className="space-y-2">
                {summary?.upcomingHolidays?.slice(0, 4).map((h: any) => (
                  <div
                    key={h.id}
                    className="p-2.5 rounded-lg bg-[#121212]/60 border border-[#2E2E30] flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-medium text-[#EDEBE6]">{h.name}</div>
                      <div className="text-[11px] text-[#8A867E]">
                        {new Date(`${h.date}T00:00:00`).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        • {h.isCompanyHoliday ? "Day Off" : "Observance"}
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-[#4F9D83]">
                      {h.relativeTime}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
