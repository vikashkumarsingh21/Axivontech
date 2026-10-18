"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckSquare,
  Coffee,
  Sparkles,
  Megaphone,
  Loader2,
  ExternalLink,
  Filter,
  X,
  Sun,
  AlertCircle,
  HelpCircle,
  CalendarCheck,
  ChevronDown,
  Info,
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
    const list = filteredEvents.filter((e) => e.date === selectedDateStr);
    return list;
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
        return "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30";
      case "PUBLIC_HOLIDAY":
        return "bg-[#D6B779]/15 text-[#D6B779] border border-[#D6B779]/30";
      case "FESTIVAL_OR_OBSERVANCE":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      case "OPTIONAL_HOLIDAY":
        return "bg-[#67C5D8]/10 text-[#67C5D8] border border-[#67C5D8]/25";
      case "LEAVE":
        return "bg-purple-500/10 text-purple-400 border border-purple-500/25";
      case "TASK":
        return "bg-rose-500/10 text-rose-400 border border-rose-500/25";
      case "ANNOUNCEMENT":
        return "bg-blue-500/10 text-blue-400 border border-blue-500/25";
      default:
        return "bg-[#1B222B] text-[#A7B0BC] border border-[#29313B]";
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F3F5F7] tracking-tight flex items-center gap-2.5">
            <CalendarCheck className="w-6 h-6 text-emerald-400" />
            <span>Company Calendar & Schedule</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#A7B0BC] mt-0.5">
            Organization-wide weekly offs, Indian public holidays, festival observances, and personal sprint deadlines.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-[#10151B] border border-[#29313B] rounded-xl self-start sm:self-auto text-xs">
          {(["MONTH", "WEEK", "DAY", "AGENDA"] as CalendarView[]).map((v) => (
            <button
              key={v}
              onClick={() => setActiveView(v)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                activeView === v
                  ? "bg-emerald-500 text-[#04130E] shadow-xs"
                  : "text-[#7E8997] hover:text-[#F3F5F7]"
              }`}
            >
              {v.charAt(0) + v.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation & Filter Bar */}
      <Card className="p-4 bg-[#151A21] border-[#29313B] rounded-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Month / Period Controls */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleToday}
              className="border-[#29313B] bg-[#10151B] text-[#A7B0BC] hover:text-[#F3F5F7] text-xs h-8 px-2.5"
            >
              Today
            </Button>

            <div className="flex items-center gap-1">
              <button
                onClick={handlePrev}
                className="p-1.5 rounded-lg border border-[#29313B] bg-[#10151B] text-[#7E8997] hover:text-[#F3F5F7] hover:bg-[#1B222B]"
                aria-label="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="p-1.5 rounded-lg border border-[#29313B] bg-[#10151B] text-[#7E8997] hover:text-[#F3F5F7] hover:bg-[#1B222B]"
                aria-label="Next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <h2 className="text-base sm:text-lg font-bold text-[#F3F5F7] ml-2">
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
            <Filter className="w-3.5 h-3.5 text-[#566171]" />
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="h-8 px-2.5 bg-[#10151B] border border-[#29313B] rounded-lg text-xs text-[#A7B0BC] focus:outline-none focus:border-emerald-500"
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
                className="p-1.5 rounded-lg text-[#7E8997] hover:text-[#F3F5F7]"
                title="Clear Filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Legend strip */}
        <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-[#1E2530] text-[11px] text-[#A7B0BC]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#566171]" />
            <strong className="text-[#F3F5F7]">Weekly Off:</strong> Sundays (by default) & Configured Saturdays
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <strong className="text-emerald-400">Company Holiday:</strong> Approved Office Closed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <strong className="text-amber-400">Observance:</strong> Indian Festival (Working Day)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
            <strong className="text-purple-400">Leave:</strong> My Time Off
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
            <strong className="text-rose-400">Task:</strong> Sprint Due Date
          </span>
        </div>
      </Card>

      {/* Main Grid + Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View Area (2 cols on desktop) */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center p-24 text-[#7E8997] gap-3 bg-[#151A21] border border-[#29313B] rounded-2xl">
              <Loader2 className="animate-spin w-5 h-5 text-emerald-500" />
              <span>Loading calendar schedule...</span>
            </div>
          ) : (
            <>
              {/* VIEW A: MONTH VIEW */}
              {activeView === "MONTH" && (
                <Card className="p-3 sm:p-5 bg-[#151A21] border-[#29313B] rounded-2xl space-y-2">
                  {/* Weekday Column Headers (Sun to Sat) */}
                  <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-[#7E8997] pb-2 border-b border-[#1E2530]">
                    <span className="text-rose-400 font-bold">Sun</span>
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span className="text-[#A7B0BC]">Sat</span>
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

                      // Distinguish Company Holiday vs Observance
                      const hasCompanyHoliday = dayEvents.some((e) => e.type === "COMPANY_HOLIDAY");
                      const hasObservance = dayEvents.some((e) => e.type === "FESTIVAL_OR_OBSERVANCE");
                      const hasLeave = dayEvents.some((e) => e.type === "LEAVE");
                      const hasTask = dayEvents.some((e) => e.type === "TASK");

                      return (
                        <div
                          key={cell.dateString}
                          onClick={() => setSelectedDate(cell.date)}
                          className={`min-h-[85px] sm:min-h-[105px] p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? "bg-[#1B222B] border-emerald-500 shadow-md ring-1 ring-emerald-500/30"
                              : isToday
                              ? "bg-[#10151B] border-emerald-500/50"
                              : cell.isCurrentMonth
                              ? "bg-[#10151B] border-[#1E2530] hover:border-[#364152]"
                              : "bg-[#0B0D10]/40 border-transparent opacity-40 hover:opacity-75"
                          }`}
                        >
                          {/* Top Row: Date Number and Off Indicator */}
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-xs font-bold ${
                                isToday
                                  ? "w-6 h-6 rounded-full bg-emerald-500 text-[#04130E] flex items-center justify-center"
                                  : isSelected
                                  ? "text-emerald-400"
                                  : cell.dayOfWeek === 0
                                  ? "text-rose-400"
                                  : cell.isCurrentMonth
                                  ? "text-[#F3F5F7]"
                                  : "text-[#566171]"
                              }`}
                            >
                              {cell.dayNumber}
                            </span>

                            {isWeeklyOff && (
                              <span
                                className="text-[9px] font-semibold text-[#7E8997] bg-[#151A21] border border-[#29313B] px-1 py-0.2 rounded"
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
                              <div className="text-[10px] font-semibold text-emerald-400 pl-1">
                                +{dayEvents.length - 2} more
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}

              {/* VIEW B: WEEK VIEW */}
              {activeView === "WEEK" && (
                <Card className="p-4 sm:p-5 bg-[#151A21] border-[#29313B] rounded-2xl space-y-4">
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
                          className={`p-3 rounded-xl border cursor-pointer transition-all space-y-2 ${
                            isSelected
                              ? "bg-[#1B222B] border-emerald-500 ring-1 ring-emerald-500/30"
                              : isToday
                              ? "bg-[#10151B] border-emerald-500/40"
                              : "bg-[#10151B] border-[#1E2530] hover:border-[#364152]"
                          }`}
                        >
                          <div className="border-b border-[#1E2530] pb-1.5 flex items-center justify-between">
                            <div>
                              <div className="text-[11px] font-semibold text-[#7E8997]">
                                {day.date.toLocaleDateString(undefined, { weekday: "short" })}
                              </div>
                              <div className="text-sm font-bold text-[#F3F5F7]">
                                {day.dayNumber}
                              </div>
                            </div>
                            {weeklyOffInfo.isOff && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-[#A7B0BC] border border-white/10">
                                Off
                              </span>
                            )}
                          </div>

                          <div className="space-y-1.5 min-h-[90px]">
                            {dayEvents.length === 0 ? (
                              <span className="text-[11px] text-[#566171] italic block pt-2">
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
                </Card>
              )}

              {/* VIEW C: DAY VIEW */}
              {activeView === "DAY" && (
                <Card className="p-5 sm:p-6 bg-[#151A21] border-[#29313B] rounded-2xl space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-[#1E2530]">
                    <div>
                      <h3 className="text-lg font-bold text-[#F3F5F7]">
                        {selectedDate.toLocaleDateString(undefined, {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </h3>
                      <p className="text-xs text-[#7E8997] mt-0.5">
                        {selectedDayWeeklyOff.isOff
                          ? selectedDayWeeklyOff.reason
                          : "Regular Company Workday"}
                      </p>
                    </div>

                    {selectedDayWeeklyOff.isOff && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-[#A7B0BC]">
                        {selectedDayWeeklyOff.reason}
                      </span>
                    )}
                  </div>

                  {selectedDateEvents.length === 0 && !selectedDayWeeklyOff.isOff ? (
                    <div className="py-12 text-center text-[#7E8997] text-xs">
                      No specific holidays, leaves, or deadlines scheduled for this date.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedDayWeeklyOff.isOff && (
                        <div className="p-4 rounded-xl bg-[#10151B] border border-[#29313B] flex items-center gap-3">
                          <Sun className="w-5 h-5 text-[#D6B779]" />
                          <div>
                            <div className="font-bold text-sm text-[#F3F5F7]">
                              {selectedDayWeeklyOff.reason}
                            </div>
                            <div className="text-xs text-[#7E8997]">
                              Configured weekly off day per Axivon calendar schedule settings.
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedDateEvents.map((ev) => (
                        <div
                          key={ev.id}
                          className="p-4 rounded-xl bg-[#10151B] border border-[#29313B] space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getEventBadgeClass(
                                ev.type
                              )}`}
                            >
                              {ev.type.replace(/_/g, " ")}
                            </span>
                            {ev.status && (
                              <span className="text-xs font-mono text-emerald-400">{ev.status}</span>
                            )}
                          </div>
                          <h4 className="text-base font-bold text-[#F3F5F7] mt-1">{ev.title}</h4>
                          {ev.subtitle && (
                            <p className="text-xs text-[#A7B0BC] leading-relaxed">{ev.subtitle}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              )}

              {/* VIEW D: AGENDA VIEW */}
              {activeView === "AGENDA" && (
                <Card className="p-5 sm:p-6 bg-[#151A21] border-[#29313B] rounded-2xl space-y-4">
                  <div className="pb-3 border-b border-[#1E2530]">
                    <h3 className="text-base font-bold text-[#F3F5F7]">
                      Upcoming Calendar Agenda ({currentYear})
                    </h3>
                    <p className="text-xs text-[#7E8997]">
                      Chronological upcoming holidays, festival observances, approved leaves, and deadlines.
                    </p>
                  </div>

                  {filteredEvents.length === 0 ? (
                    <div className="py-12 text-center text-[#7E8997] text-xs">
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
                              className="p-3.5 rounded-xl border border-[#29313B] bg-[#10151B] hover:border-[#364152] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-12 h-12 rounded-xl bg-[#151A21] border border-[#29313B] flex flex-col items-center justify-center shrink-0">
                                  <span className="text-[10px] text-[#7E8997] font-bold uppercase">
                                    {dateObj.toLocaleDateString(undefined, { month: "short" })}
                                  </span>
                                  <span className="text-base font-bold text-[#F3F5F7]">
                                    {dateObj.getDate()}
                                  </span>
                                </div>

                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${getEventBadgeClass(
                                        ev.type
                                      )}`}
                                    >
                                      {ev.type.replace(/_/g, " ")}
                                    </span>
                                    <span className="text-xs font-semibold text-emerald-400">
                                      {countdown}
                                    </span>
                                  </div>
                                  <h4 className="text-sm font-semibold text-[#F3F5F7]">{ev.title}</h4>
                                  {ev.subtitle && (
                                    <p className="text-xs text-[#7E8997]">{ev.subtitle}</p>
                                  )}
                                </div>
                              </div>

                              <div className="text-xs text-[#7E8997] self-end sm:self-center">
                                {dateObj.toLocaleDateString(undefined, { weekday: "long" })}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </Card>
              )}
            </>
          )}
        </div>

        {/* Selected Day Agenda Side Drawer (1 col) */}
        <div className="space-y-4">
          <Card className="p-5 bg-[#151A21] border-[#29313B] rounded-2xl space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-[#1E2530]">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <CalendarIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#F3F5F7]">
                  {selectedDate.toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </h3>
                <p className="text-xs text-[#7E8997]">Day agenda & scheduled items</p>
              </div>
            </div>

            {/* Weekly Off Notice for Selected Day */}
            {selectedDayWeeklyOff.isOff && (
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2.5 text-xs text-[#A7B0BC]">
                <Sun className="w-4 h-4 text-[#D6B779] shrink-0" />
                <span>
                  <strong className="text-[#F3F5F7]">{selectedDayWeeklyOff.reason}</strong> (Company
                  Non-Working Day)
                </span>
              </div>
            )}

            {/* Day Events List */}
            {selectedDateEvents.length === 0 ? (
              <div className="py-8 text-center text-[#7E8997] text-xs space-y-1">
                <Clock className="w-6 h-6 text-[#566171] mx-auto mb-2" />
                <p>No specific holidays or deadlines for this day.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {selectedDateEvents.map((e) => (
                  <div
                    key={e.id}
                    className="p-3 rounded-xl border border-[#29313B] bg-[#10151B] space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${getEventBadgeClass(
                          e.type
                        )}`}
                      >
                        {e.type.replace(/_/g, " ")}
                      </span>
                      {e.status && (
                        <span className="text-[10px] text-[#A7B0BC] font-mono">{e.status}</span>
                      )}
                    </div>

                    <h4 className="text-xs sm:text-sm font-semibold text-[#F3F5F7]">{e.title}</h4>

                    {e.subtitle && <p className="text-[11px] text-[#7E8997]">{e.subtitle}</p>}

                    {e.type === "TASK" && (
                      <div className="pt-1">
                        <Link
                          href="/employee/tasks"
                          className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
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
          </Card>

          {/* Upcoming Holidays & Long Weekends Card */}
          <Card className="p-5 bg-[#151A21] border-[#29313B] rounded-2xl space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A7B0BC] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D6B779]" />
              <span>Upcoming Holidays & Festivals</span>
            </h3>

            {summary?.upcomingHolidays?.length === 0 ? (
              <p className="text-xs text-[#7E8997]">No upcoming holidays this month.</p>
            ) : (
              <div className="space-y-2">
                {summary?.upcomingHolidays?.slice(0, 4).map((h: any) => (
                  <div
                    key={h.id}
                    className="p-2.5 rounded-lg bg-[#10151B] border border-[#1E2530] flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-[#F3F5F7]">{h.name}</div>
                      <div className="text-[11px] text-[#7E8997]">
                        {new Date(`${h.date}T00:00:00`).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        • {h.isCompanyHoliday ? "Day Off" : "Observance"}
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-400">
                      {h.relativeTime}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
