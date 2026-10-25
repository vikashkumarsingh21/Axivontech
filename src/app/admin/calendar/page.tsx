"use client";

import { getErrorMessage, parseApiResponse } from "@/lib/errors/client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Calendar as CalendarIcon,
  Search,
  Filter,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Settings,
  Trash2,
  Edit2,
  Check,
  X,
  Loader2,
  Sliders,
  Globe,
  Sun,
  Moon,
  Sparkles,
  Info,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Coffee,
  CheckSquare,
  Megaphone,
  UserCheck,
  Award,
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

type AdminCalendarTab = "CALENDAR" | "HOLIDAYS" | "SCHEDULE";
type CalendarView = "MONTH" | "WEEK" | "DAY" | "AGENDA";

interface HolidayItem {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  category: "PUBLIC_HOLIDAY" | "COMPANY_HOLIDAY" | "OPTIONAL_HOLIDAY" | "FESTIVAL_OR_OBSERVANCE";
  isCompanyHoliday: boolean;
  isOptional: boolean;
  description?: string | null;
  source: string;
  state?: string | null;
  lastSyncAt?: string | null;
}

interface HolidayStats {
  totalHolidays: number;
  companyHolidays: number;
  festivalsObservances: number;
  optionalHolidays: number;
  upcomingCount: number;
}

interface UnifiedEventItem {
  id: string;
  type:
    | "WEEKLY_OFF"
    | "COMPANY_HOLIDAY"
    | "PUBLIC_HOLIDAY"
    | "FESTIVAL_OR_OBSERVANCE"
    | "OPTIONAL_HOLIDAY"
    | "LEAVE"
    | "TASK"
    | "MILESTONE"
    | "ANNOUNCEMENT";
  title: string;
  date: string; // YYYY-MM-DD
  endDate?: string;
  subtitle?: string | null;
  priority?: string | null;
  status?: string | null;
  isOfficialOff?: boolean;
  meta?: any;
}

export default function AdminCalendarPage() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [activeTab, setActiveTab] = useState<AdminCalendarTab>("CALENDAR");
  const [activeView, setActiveView] = useState<CalendarView>("MONTH");
  const [calendarFilter, setCalendarFilter] = useState<string>("ALL");

  const [holidays, setHolidays] = useState<HolidayItem[]>([]);
  const [rawLeaves, setRawLeaves] = useState<any[]>([]);
  const [rawTasks, setRawTasks] = useState<any[]>([]);
  const [rawMilestones, setRawMilestones] = useState<any[]>([]);
  const [rawAnnouncements, setRawAnnouncements] = useState<any[]>([]);

  const [stats, setStats] = useState<HolidayStats>({
    totalHolidays: 0,
    companyHolidays: 0,
    festivalsObservances: 0,
    optionalHolidays: 0,
    upcomingCount: 0,
  });
  const [settings, setSettings] = useState<CalendarScheduleSettings>(DEFAULT_CALENDAR_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  // Holiday Directory Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedApproval, setSelectedApproval] = useState<string>("ALL");

  // Notifications
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editingHoliday, setEditingHoliday] = useState<HolidayItem | null>(null);
  const [formName, setFormName] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formCategory, setFormCategory] = useState<string>("COMPANY_HOLIDAY");
  const [formIsCompanyHoliday, setFormIsCompanyHoliday] = useState(true);
  const [formIsOptional, setFormIsOptional] = useState(false);
  const [formDescription, setFormDescription] = useState("");
  const [submittingModal, setSubmittingModal] = useState(false);

  const currentMonth = currentDate.getMonth(); // 0-11
  const viewYear = currentDate.getFullYear();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setActionError(null);
      const queryMonth = currentDate.getMonth() + 1;
      const res = await fetch(`/api/v1/admin/calendar?year=${selectedYear}&month=${queryMonth}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(getErrorMessage(data) || "Failed to load calendar management data");
      }

      setHolidays(data.holidays || []);
      setRawLeaves(data.leaves || []);
      setRawTasks(data.tasks || []);
      setRawMilestones(data.milestones || []);
      setRawAnnouncements(data.announcements || []);

      setStats(data.stats || {
        totalHolidays: 0,
        companyHolidays: 0,
        festivalsObservances: 0,
        optionalHolidays: 0,
        upcomingCount: 0,
      });
      if (data.settings) {
        setSettings(data.settings);
      }
    } catch (err: any) {
      setActionError(err.message || "Failed to load holiday records");
    } finally {
      setLoading(false);
    }
  }, [selectedYear, currentDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Aggregate all events for calendar views
  const allCalendarEvents = useMemo(() => {
    const list: UnifiedEventItem[] = [];

    // 1. Holidays & Observances
    holidays.forEach((h) => {
      let type: UnifiedEventItem["type"] = "PUBLIC_HOLIDAY";
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
        meta: h,
      });
    });

    // 2. Team Leaves (Admin visibility with employee attribution)
    rawLeaves.forEach((l: any) => {
      const start = parseDateString(l.startDate);
      const end = parseDateString(l.endDate);

      const cur = new Date(start);
      while (cur <= end) {
        const dStr = toDateString(cur);
        list.push({
          id: `leave-${l.id}-${dStr}`,
          type: "LEAVE",
          title: `${l.userName} (${l.leaveType})`,
          date: dStr,
          status: l.status,
          subtitle: l.reason || `${l.leaveType} Leave Application`,
          isOfficialOff: l.status === "APPROVED",
          meta: l,
        });
        cur.setDate(cur.getDate() + 1);
      }
    });

    // 3. Tasks & Deadlines
    rawTasks.forEach((t: any) => {
      if (t.dueDate) {
        list.push({
          id: `task-${t.id}`,
          type: "TASK",
          title: t.title,
          date: t.dueDate,
          priority: t.priority,
          status: t.status,
          subtitle: t.projectName ? `Project: ${t.projectName}` : t.assigneeName ? `Assignee: ${t.assigneeName}` : "Task Due",
          isOfficialOff: false,
          meta: t,
        });
      }
    });

    // 4. Project Milestones
    rawMilestones.forEach((m: any) => {
      if (m.targetDate) {
        list.push({
          id: `milestone-${m.id}`,
          type: "MILESTONE",
          title: `Milestone: ${m.title}`,
          date: m.targetDate,
          status: m.status,
          subtitle: `${m.projectName}${m.clientName ? ` &bull; ${m.clientName}` : ""}`,
          isOfficialOff: false,
          meta: m,
        });
      }
    });

    // 5. Announcements
    rawAnnouncements.forEach((a: any) => {
      if (a.publishAt) {
        list.push({
          id: `announcement-${a.id}`,
          type: "ANNOUNCEMENT",
          title: a.title,
          date: a.publishAt,
          priority: a.priority,
          subtitle: "Company Announcement Published",
          isOfficialOff: false,
          meta: a,
        });
      }
    });

    return list;
  }, [holidays, rawLeaves, rawTasks, rawMilestones, rawAnnouncements]);

  // Compute month matrix
  const monthDays = useMemo(() => {
    return generateMonthMatrix(viewYear, currentMonth);
  }, [viewYear, currentMonth]);

  // Compute week matrix
  const weekDays = useMemo(() => {
    return generateWeekMatrix(selectedDate);
  }, [selectedDate]);

  // Filter events based on selected filter
  const filteredCalendarEvents = useMemo(() => {
    if (calendarFilter === "ALL") return allCalendarEvents;
    return allCalendarEvents.filter((e) => e.type === calendarFilter);
  }, [allCalendarEvents, calendarFilter]);

  // Events for selected date
  const selectedDateStr = toDateString(selectedDate);
  const selectedDayWeeklyOff = checkWeeklyOff(selectedDate, settings);
  const selectedDateEvents = useMemo(() => {
    return filteredCalendarEvents.filter((e) => e.date === selectedDateStr);
  }, [filteredCalendarEvents, selectedDateStr]);

  // Navigation handlers
  const handlePrev = () => {
    if (activeView === "MONTH") {
      setCurrentDate(new Date(viewYear, currentMonth - 1, 1));
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
      setCurrentDate(new Date(viewYear, currentMonth + 1, 1));
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

  // Sync Holidays Action
  const handleSyncHolidays = async () => {
    try {
      setSyncing(true);
      setActionError(null);
      const res = await fetch("/api/v1/admin/calendar/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year: selectedYear }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(getErrorMessage(data) || "Synchronization failed");
      }

      setActionSuccess(data.message || `Holidays synchronized for ${selectedYear}`);
      setTimeout(() => setActionSuccess(null), 5000);
      loadData();
    } catch (err: any) {
      setActionError(err.message || "Could not sync holidays from source");
    } finally {
      setSyncing(false);
    }
  };

  // Toggle Holiday Approval Status
  const handleToggleApproval = async (holiday: HolidayItem) => {
    try {
      const nextStatus = !holiday.isCompanyHoliday;
      const res = await fetch(`/api/v1/admin/calendar/holidays/${holiday.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompanyHoliday: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(getErrorMessage(data) || "Failed to toggle status");
      }

      setHolidays((prev) =>
        prev.map((h) => (h.id === holiday.id ? { ...h, isCompanyHoliday: nextStatus } : h))
      );
      setActionSuccess(
        nextStatus
          ? `Approved "${holiday.name}" as an official company holiday.`
          : `Reverted "${holiday.name}" to observance/working day.`
      );
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setActionError(err.message || "Failed to update holiday status");
    }
  };

  // Save Schedule Settings
  const handleSaveSettings = async () => {
    try {
      setSavingSettings(true);
      setActionError(null);
      const res = await fetch("/api/v1/admin/calendar/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(getErrorMessage(data) || "Failed to save settings");
      }

      setActionSuccess("Weekly schedule and calendar configuration saved successfully.");
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      setActionError(err.message || "Could not save schedule settings");
    } finally {
      setSavingSettings(false);
    }
  };

  // Open Create Modal
  const openCreateModal = () => {
    setEditingHoliday(null);
    setFormName("");
    setFormDate(`${selectedYear}-01-01`);
    setFormCategory("COMPANY_HOLIDAY");
    setFormIsCompanyHoliday(true);
    setFormIsOptional(false);
    setFormDescription("");
    setShowModal(true);
  };

  // Open Edit Modal
  const openEditModal = (h: HolidayItem) => {
    setEditingHoliday(h);
    setFormName(h.name);
    setFormDate(h.date);
    setFormCategory(h.category);
    setFormIsCompanyHoliday(h.isCompanyHoliday);
    setFormIsOptional(h.isOptional);
    setFormDescription(h.description || "");
    setShowModal(true);
  };

  // Submit Modal (Create or Edit)
  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formDate) {
      setActionError("Holiday name and date are required.");
      return;
    }

    try {
      setSubmittingModal(true);
      setActionError(null);

      const url = editingHoliday
        ? `/api/v1/admin/calendar/holidays/${editingHoliday.id}`
        : "/api/v1/admin/calendar/holidays";
      const method = editingHoliday ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName.trim(),
          date: formDate,
          category: formCategory,
          isCompanyHoliday: formIsCompanyHoliday,
          isOptional: formIsOptional,
          description: formDescription.trim(),
          state: settings.state,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(getErrorMessage(data) || "Failed to save holiday");
      }

      setShowModal(false);
      setActionSuccess(
        editingHoliday
          ? `Holiday "${formName}" updated successfully.`
          : `Custom holiday "${formName}" created successfully.`
      );
      setTimeout(() => setActionSuccess(null), 3500);
      loadData();
    } catch (err: any) {
      setActionError(err.message || "Could not save holiday record");
    } finally {
      setSubmittingModal(false);
    }
  };

  // Delete Holiday
  const handleDeleteHoliday = async (id: string) => {
    try {
      setActionError(null);
      const res = await fetch(`/api/v1/admin/calendar/holidays/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(getErrorMessage(data) || "Failed to delete holiday");
      }

      setDeleteConfirmId(null);
      setActionSuccess("Holiday removed from organization records.");
      setTimeout(() => setActionSuccess(null), 3000);
      loadData();
    } catch (err: any) {
      setActionError(err.message || "Could not delete holiday");
    }
  };

  // Filtered Holidays for Holidays Management Tab
  const filteredHolidays = useMemo(() => {
    return holidays
      .filter((h) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
          h.name.toLowerCase().includes(q) ||
          (h.description && h.description.toLowerCase().includes(q))
        );
      })
      .filter((h) => {
        if (selectedCategory === "ALL") return true;
        return h.category === selectedCategory;
      })
      .filter((h) => {
        if (selectedApproval === "ALL") return true;
        if (selectedApproval === "COMPANY_OFF") return h.isCompanyHoliday;
        if (selectedApproval === "OBSERVANCE") return !h.isCompanyHoliday;
        return true;
      });
  }, [holidays, searchQuery, selectedCategory, selectedApproval]);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const getEventBadgeClass = (type: UnifiedEventItem["type"]) => {
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
        return "bg-purple-500/15 text-purple-300 border border-purple-500/30";
      case "TASK":
        return "bg-rose-500/15 text-rose-300 border border-rose-500/30";
      case "MILESTONE":
        return "bg-blue-500/15 text-blue-300 border border-blue-500/30";
      case "ANNOUNCEMENT":
        return "bg-sky-500/10 text-sky-400 border border-sky-500/25";
      default:
        return "bg-[#1B222B] text-[#A7B0BC] border border-[#29313B]";
    }
  };

  return (
    <div className="space-y-6 text-[#F3F5F7] min-h-[90vh] pb-12">
      {/* ── Top Header ────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-[#29313B] pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <CalendarCheck className="w-6 h-6 text-[#10B981]" /> Calendar & Schedule Management
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/25">
              Admin Control
            </span>
          </div>
          <p className="text-[#A7B0BC] text-sm mt-1">
            Official company calendar, gazetted Indian holidays, working days policy, milestones, and employee leaves.
          </p>
        </div>

        {/* Global Calendar Actions */}
        <div className="flex items-center gap-2.5 flex-wrap w-full lg:w-auto">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="bg-[#151A21] border border-[#29313B] text-xs sm:text-sm text-[#F3F5F7] rounded-xl px-3 py-2 focus:outline-none focus:border-[#10B981] cursor-pointer"
          >
            <option value={currentYear - 1}>{currentYear - 1}</option>
            <option value={currentYear}>{currentYear}</option>
            <option value={currentYear + 1}>{currentYear + 1}</option>
          </select>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-xs font-semibold text-[#04130E] transition-colors shadow-lg shadow-[#10B981]/20"
          >
            <Plus className="w-4 h-4" />
            Add Event / Holiday
          </button>

          <button
            onClick={handleSyncHolidays}
            disabled={syncing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1B222B] hover:bg-[#202833] border border-[#29313B] text-xs font-semibold text-[#F3F5F7] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#10B981] ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync Holidays"}
          </button>
        </div>
      </div>

      {/* ── Sub Navigation Tabs ──────────────────────────────────── */}
      <div className="flex items-center gap-1.5 p-1 bg-[#101318] border border-[#29313B] rounded-xl overflow-x-auto text-xs font-semibold">
        {[
          { key: "CALENDAR", label: "Interactive Calendar View", icon: CalendarIcon },
          { key: "HOLIDAYS", label: "Holidays Directory", icon: Award },
          { key: "SCHEDULE", label: "Working Days & Schedule Policy", icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as AdminCalendarTab)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                isActive
                  ? "bg-[#10B981] text-[#04130E] shadow-sm font-bold"
                  : "text-[#A7B0BC] hover:text-[#F3F5F7] hover:bg-[#1B222B]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Action Banners */}
      {actionSuccess && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {actionError && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-red-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── TAB 1: INTERACTIVE CALENDAR ─────────────────────────── */}
      {activeTab === "CALENDAR" && (
        <div className="space-y-4">
          {/* Calendar Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#151A21] border border-[#29313B] p-4 rounded-2xl">
            {/* View Switcher & Month Navigation */}
            <div className="flex items-center gap-2 flex-wrap">
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
                  aria-label="Previous Month or Period"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-1.5 rounded-lg border border-[#29313B] bg-[#10151B] text-[#7E8997] hover:text-[#F3F5F7] hover:bg-[#1B222B]"
                  aria-label="Next Month or Period"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <h2 className="text-base sm:text-lg font-bold text-white ml-2">
                {activeView === "MONTH" && `${monthNames[currentMonth]} ${viewYear}`}
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
                {activeView === "AGENDA" && `Upcoming Schedule & Deadlines (${viewYear})`}
              </h2>
            </div>

            {/* Filter & View Switcher */}
            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              <div className="flex items-center gap-1 bg-[#101318] border border-[#29313B] rounded-lg p-1 text-xs">
                {(["MONTH", "WEEK", "DAY", "AGENDA"] as CalendarView[]).map((v) => (
                  <button
                    key={v}
                    onClick={() => setActiveView(v)}
                    className={`px-2.5 py-1 rounded font-medium transition-colors ${
                      activeView === v
                        ? "bg-[#10B981] text-[#04130E] font-bold"
                        : "text-[#A7B0BC] hover:text-white"
                    }`}
                  >
                    {v.charAt(0) + v.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>

              <select
                value={calendarFilter}
                onChange={(e) => setCalendarFilter(e.target.value)}
                className="h-8 px-2 bg-[#10151B] border border-[#29313B] rounded-lg text-xs text-[#A7B0BC] focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="ALL">All Categories</option>
                <option value="COMPANY_HOLIDAY">Company Holidays (Office Closed)</option>
                <option value="FESTIVAL_OR_OBSERVANCE">Festivals & Observances</option>
                <option value="PUBLIC_HOLIDAY">Public Holidays</option>
                <option value="LEAVE">Team Leaves</option>
                <option value="MILESTONE">Project Milestones</option>
                <option value="TASK">Tasks & Sprints</option>
                <option value="ANNOUNCEMENT">Announcements</option>
              </select>
            </div>
          </div>

          {/* Legend Strip */}
          <div className="flex flex-wrap items-center gap-3 px-3 py-2 bg-[#151A21] border border-[#29313B] rounded-xl text-[11px] text-[#A7B0BC]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <strong className="text-emerald-400">Company Holiday:</strong> Office Closed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
              <strong className="text-purple-300">Team Leave:</strong> Approved Leave
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
              <strong className="text-blue-300">Milestone:</strong> Client Deliverable
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <strong className="text-rose-300">Task Deadline:</strong> Sprint Assignment
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#566171]" />
              <strong className="text-[#F3F5F7]">Weekly Off:</strong> Sundays / Configured Saturdays
            </span>
          </div>

          {/* 1. MONTH VIEW */}
          {activeView === "MONTH" && (
            <div className="bg-[#151A21] border border-[#29313B] rounded-2xl overflow-hidden shadow-xl">
              {/* Day Headers */}
              <div className="grid grid-cols-7 border-b border-[#29313B] bg-[#101318] text-center text-xs font-bold text-[#A7B0BC] py-2.5">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, idx) => (
                  <div key={day} className={idx === 0 ? "text-amber-400" : ""}>
                    {day}
                  </div>
                ))}
              </div>

              {/* Matrix Grid */}
              <div className="grid grid-cols-7 divide-x divide-y divide-[#29313B]">
                {monthDays.map((d) => {
                  const weeklyOff = checkWeeklyOff(d.date, settings);
                  const isToday = d.dateString === toDateString(new Date());
                  const isSelected = d.dateString === selectedDateStr;
                  const dayEvents = filteredCalendarEvents.filter((e) => e.date === d.dateString);

                  return (
                    <div
                      key={d.dateString}
                      onClick={() => setSelectedDate(d.date)}
                      className={`min-h-[105px] p-2 flex flex-col justify-between transition-colors cursor-pointer group ${
                        !d.isCurrentMonth
                          ? "bg-[#0E1116]/60 text-gray-600"
                          : weeklyOff.isOff
                          ? "bg-[#181D24]/50"
                          : "bg-[#151A21] hover:bg-[#1B222B]/70"
                      } ${isSelected ? "ring-2 ring-emerald-500/50" : ""}`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-semibold w-6 h-6 rounded-full flex items-center justify-center ${
                            isToday
                              ? "bg-emerald-500 text-[#04130E] font-bold"
                              : d.isCurrentMonth
                              ? "text-white"
                              : "text-gray-600"
                          }`}
                        >
                          {d.dayNumber}
                        </span>

                        {weeklyOff.isOff && d.isCurrentMonth && (
                          <span className="text-[9px] font-mono text-[#7E8997] bg-white/5 px-1 rounded">
                            Off
                          </span>
                        )}
                      </div>

                      {/* Event Chips */}
                      <div className="space-y-1 mt-1.5 overflow-hidden">
                        {dayEvents.slice(0, 3).map((e) => (
                          <div
                            key={e.id}
                            className={`text-[10px] px-1.5 py-0.5 rounded truncate font-medium ${getEventBadgeClass(
                              e.type
                            )}`}
                            title={`${e.title} - ${e.subtitle || ""}`}
                          >
                            {e.title}
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-[9px] text-[#A7B0BC] font-semibold px-1">
                            +{dayEvents.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. WEEK VIEW */}
          {activeView === "WEEK" && (
            <div className="bg-[#151A21] border border-[#29313B] rounded-2xl overflow-hidden shadow-xl">
              <div className="grid grid-cols-7 divide-x divide-[#29313B]">
                {weekDays.map((w) => {
                  const isToday = w.dateString === toDateString(new Date());
                  const isSelected = w.dateString === selectedDateStr;
                  const weeklyOff = checkWeeklyOff(w.date, settings);
                  const dayEvents = filteredCalendarEvents.filter((e) => e.date === w.dateString);

                  return (
                    <div
                      key={w.dateString}
                      onClick={() => setSelectedDate(w.date)}
                      className={`min-h-[360px] p-3 flex flex-col justify-start transition-colors cursor-pointer ${
                        weeklyOff.isOff ? "bg-[#181D24]/50" : "bg-[#151A21] hover:bg-[#1B222B]/70"
                      } ${isSelected ? "ring-2 ring-emerald-500/50" : ""}`}
                    >
                      <div className="border-b border-[#29313B] pb-2 text-center">
                        <div className="text-[11px] uppercase tracking-wider text-[#A7B0BC]">
                          {w.date.toLocaleDateString(undefined, { weekday: "short" })}
                        </div>
                        <div
                          className={`text-sm font-bold mt-1 inline-block w-7 h-7 rounded-full leading-7 text-center ${
                            isToday ? "bg-emerald-500 text-[#04130E]" : "text-white"
                          }`}
                        >
                          {w.dayNumber}
                        </div>
                        {weeklyOff.isOff && (
                          <div className="text-[9px] text-[#7E8997] font-mono mt-0.5">{weeklyOff.reason}</div>
                        )}
                      </div>

                      <div className="space-y-1.5 mt-3 overflow-y-auto">
                        {dayEvents.length === 0 ? (
                          <p className="text-[10px] text-[#566171] text-center pt-4">No events</p>
                        ) : (
                          dayEvents.map((e) => (
                            <div
                              key={e.id}
                              className={`p-2 rounded-lg text-xs space-y-0.5 ${getEventBadgeClass(e.type)}`}
                            >
                              <p className="font-semibold truncate">{e.title}</p>
                              {e.subtitle && <p className="text-[10px] opacity-80 truncate">{e.subtitle}</p>}
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

          {/* 3. DAY VIEW */}
          {activeView === "DAY" && (
            <div className="bg-[#151A21] border border-[#29313B] rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#29313B] pb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {selectedDate.toLocaleDateString(undefined, {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </h3>
                  <p className="text-xs text-[#A7B0BC] mt-0.5">
                    {selectedDayWeeklyOff.isOff ? selectedDayWeeklyOff.reason : "Standard Working Business Day"}
                  </p>
                </div>
                <button
                  onClick={openCreateModal}
                  className="px-3 py-1.5 rounded-lg bg-[#10B981] text-[#04130E] text-xs font-bold flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Day Event
                </button>
              </div>

              {selectedDateEvents.length === 0 ? (
                <div className="py-12 text-center text-[#A7B0BC] text-sm">
                  <CalendarIcon className="w-10 h-10 text-[#29313B] mx-auto mb-2" />
                  No events or milestone deadlines scheduled for this date.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {selectedDateEvents.map((e) => (
                    <div
                      key={e.id}
                      className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${getEventBadgeClass(
                        e.type
                      )}`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-black/20">
                            {e.type.replace(/_/g, " ")}
                          </span>
                          <span className="font-bold text-sm text-white">{e.title}</span>
                        </div>
                        {e.subtitle && <p className="text-xs text-[#A7B0BC] mt-1">{e.subtitle}</p>}
                      </div>
                      {e.type === "COMPANY_HOLIDAY" || e.type === "PUBLIC_HOLIDAY" ? (
                        <button
                          onClick={() => e.meta && openEditModal(e.meta)}
                          className="text-xs px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white font-medium self-start sm:self-auto"
                        >
                          Edit Holiday
                        </button>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4. AGENDA VIEW */}
          {activeView === "AGENDA" && (
            <div className="bg-[#151A21] border border-[#29313B] rounded-2xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-[#29313B] bg-[#101318] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">Chronological Agenda & Deadlines</h3>
                  <p className="text-xs text-[#A7B0BC]">Consolidated company events, holidays, team leaves, and sprints</p>
                </div>
                <span className="text-xs font-mono text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/25">
                  {filteredCalendarEvents.length} Items Listed
                </span>
              </div>

              <div className="divide-y divide-[#29313B]">
                {filteredCalendarEvents.length === 0 ? (
                  <div className="p-12 text-center text-[#A7B0BC] text-sm">
                    No scheduled items found matching current filters.
                  </div>
                ) : (
                  filteredCalendarEvents
                    .slice()
                    .sort((a, b) => a.date.localeCompare(b.date))
                    .map((item) => (
                      <div
                        key={item.id}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors"
                      >
                        <div className="flex items-start sm:items-center gap-3">
                          <div className="w-14 text-center shrink-0 p-1.5 rounded-lg bg-[#1B222B] border border-[#29313B]">
                            <div className="text-[10px] uppercase font-bold text-emerald-400 font-mono">
                              {new Date(parseDateString(item.date)).toLocaleDateString(undefined, { month: "short" })}
                            </div>
                            <div className="text-base font-bold text-white">
                              {new Date(parseDateString(item.date)).getDate()}
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${getEventBadgeClass(item.type)}`}>
                                {item.type.replace(/_/g, " ")}
                              </span>
                              <span className="font-semibold text-sm text-white">{item.title}</span>
                            </div>
                            {item.subtitle && <p className="text-xs text-[#A7B0BC] mt-0.5">{item.subtitle}</p>}
                          </div>
                        </div>

                        <div className="text-xs text-[#A7B0BC] font-mono shrink-0">
                          {getRelativeDateLabel(item.date, toDateString(new Date()))}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: HOLIDAYS MANAGEMENT ─────────────────────────── */}
      {activeTab === "HOLIDAYS" && (
        <div className="space-y-5">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-[#151A21] border border-[#29313B] rounded-2xl p-4">
              <p className="text-2xl font-bold text-white">{stats.totalHolidays}</p>
              <p className="text-[11px] text-[#A7B0BC] mt-0.5">Total Listed in {selectedYear}</p>
            </div>
            <div className="bg-[#151A21] border border-[#29313B] rounded-2xl p-4">
              <p className="text-2xl font-bold text-emerald-400">{stats.companyHolidays}</p>
              <p className="text-[11px] text-[#A7B0BC] mt-0.5">Official Days-Off</p>
            </div>
            <div className="bg-[#151A21] border border-[#29313B] rounded-2xl p-4">
              <p className="text-2xl font-bold text-amber-400">{stats.festivalsObservances}</p>
              <p className="text-[11px] text-[#A7B0BC] mt-0.5">Festivals / Observances</p>
            </div>
            <div className="bg-[#151A21] border border-[#29313B] rounded-2xl p-4">
              <p className="text-2xl font-bold text-cyan-400">{stats.optionalHolidays}</p>
              <p className="text-[11px] text-[#A7B0BC] mt-0.5">Optional Holidays</p>
            </div>
            <div className="bg-[#151A21] border border-[#29313B] rounded-2xl p-4">
              <p className="text-2xl font-bold text-[#D6B779]">{stats.upcomingCount}</p>
              <p className="text-[11px] text-[#A7B0BC] mt-0.5">Upcoming Holidays</p>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#151A21] border border-[#29313B] p-4 rounded-2xl">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#566171]" />
              <input
                type="text"
                placeholder="Search holiday by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-[#10151B] border border-[#29313B] rounded-xl text-xs text-white placeholder-[#566171] focus:outline-none focus:border-[#10B981]"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-8 px-2.5 bg-[#10151B] border border-[#29313B] rounded-xl text-xs text-[#A7B0BC] focus:outline-none focus:border-[#10B981] cursor-pointer"
              >
                <option value="ALL">All Categories</option>
                <option value="PUBLIC_HOLIDAY">Public Holidays</option>
                <option value="COMPANY_HOLIDAY">Company Holidays</option>
                <option value="FESTIVAL_OR_OBSERVANCE">Festivals & Observances</option>
                <option value="OPTIONAL_HOLIDAY">Optional Holidays</option>
              </select>

              <select
                value={selectedApproval}
                onChange={(e) => setSelectedApproval(e.target.value)}
                className="h-8 px-2.5 bg-[#10151B] border border-[#29313B] rounded-xl text-xs text-[#A7B0BC] focus:outline-none focus:border-[#10B981] cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="COMPANY_OFF">Approved Office Closed</option>
                <option value="OBSERVANCE">Observance (Working Day)</option>
              </select>
            </div>
          </div>

          {/* Holidays Data Table */}
          <div className="bg-[#151A21] border border-[#29313B] rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#A7B0BC]">
                <thead className="bg-[#1B222B] text-[#F3F5F7] text-[11px] uppercase font-semibold border-b border-[#29313B]">
                  <tr>
                    <th className="px-5 py-3">Holiday & Date</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">Official Day-Off</th>
                    <th className="px-5 py-3">Source & Region</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#29313B]/50">
                  {filteredHolidays.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-[#A7B0BC]">
                        No holiday records found matching current query.
                      </td>
                    </tr>
                  ) : (
                    filteredHolidays.map((h) => (
                      <tr key={h.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-white">{h.name}</div>
                          <div className="text-[11px] text-[#A7B0BC] font-mono mt-0.5">
                            {new Date(parseDateString(h.date)).toLocaleDateString(undefined, {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </div>
                          {h.description && (
                            <p className="text-[10px] text-gray-500 mt-0.5 max-w-sm truncate">{h.description}</p>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getEventBadgeClass(h.category as any)}`}>
                            {h.category.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <button
                            onClick={() => handleToggleApproval(h)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors ${
                              h.isCompanyHoliday
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                                : "bg-gray-500/10 text-gray-400 border-gray-500/30 hover:bg-gray-500/20"
                            }`}
                          >
                            {h.isCompanyHoliday ? "✓ Approved Day-Off" : "Observance (Working)"}
                          </button>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="text-[11px] text-[#F3F5F7] font-mono">{h.source}</div>
                          <div className="text-[10px] text-[#A7B0BC]">{h.state || "National"}</div>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(h)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
                              title="Edit Holiday"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(h.id)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                              title="Delete Holiday"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: SCHEDULE & WORKING DAYS POLICY ───────────────── */}
      {activeTab === "SCHEDULE" && (
        <div className="bg-[#151A21] border border-[#29313B] rounded-2xl p-6 space-y-6 max-w-4xl shadow-xl">
          <div className="border-b border-[#29313B] pb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Settings className="w-4 h-4 text-[#10B981]" /> Working Days & Weekly Off Configuration
            </h2>
            <p className="text-xs text-[#A7B0BC] mt-0.5">
              Configure organizational working schedule for Axivon Technologies. Sunday is standard off; alternate Saturday policies apply to attendance & leave.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Saturday Working Rule */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-white block">
                Saturday Working Policy
              </label>
              <select
                value={settings.saturdayRule}
                onChange={(e: any) =>
                  setSettings((prev) => ({ ...prev, saturdayRule: e.target.value }))
                }
                className="w-full bg-[#10151B] border border-[#29313B] rounded-xl px-3 py-2 text-xs text-[#F3F5F7] focus:outline-none focus:border-[#10B981]"
              >
                <option value="ALL_WORKING">All Saturdays Working (Default Tech Agency)</option>
                <option value="ALL_OFF">All Saturdays Off (5-Day Work Week)</option>
                <option value="SECOND_FOURTH_OFF">2nd and 4th Saturdays Off</option>
                <option value="FIRST_THIRD_OFF">1st and 3rd Saturdays Off</option>
              </select>
              <p className="text-[11px] text-[#A7B0BC]">
                Determines whether Saturday attendance requires check-in or counts as a scheduled off-day.
              </p>
            </div>

            {/* 2. Standard Weekly Off Days */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-white block">
                Default Weekly Off Days
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(
                  (dayName, dayIndex) => {
                    const isSelected = settings.weeklyOffDays.includes(dayIndex);
                    return (
                      <button
                        key={dayName}
                        type="button"
                        onClick={() => {
                          const next = isSelected
                            ? settings.weeklyOffDays.filter((i) => i !== dayIndex)
                            : [...settings.weeklyOffDays, dayIndex];
                          setSettings((prev) => ({ ...prev, weeklyOffDays: next }));
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                          isSelected
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-[#10151B] text-[#A7B0BC] border-[#29313B]"
                        }`}
                      >
                        {dayName}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* 3. Timezone */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-white block">
                Official Business Timezone
              </label>
              <input
                type="text"
                value={settings.timezone}
                onChange={(e) => setSettings((prev) => ({ ...prev, timezone: e.target.value }))}
                className="w-full bg-[#10151B] border border-[#29313B] rounded-xl px-3 py-2 text-xs text-[#F3F5F7] focus:outline-none focus:border-[#10B981]"
              />
              <p className="text-[11px] text-[#A7B0BC]">Standard Indian business operations: Asia/Kolkata (UTC+5:30).</p>
            </div>

            {/* 4. Country & State */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-white block">
                Headquarters Region
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={settings.country}
                  onChange={(e) => setSettings((prev) => ({ ...prev, country: e.target.value }))}
                  placeholder="Country"
                  className="bg-[#10151B] border border-[#29313B] rounded-xl px-3 py-2 text-xs text-[#F3F5F7] focus:outline-none focus:border-[#10B981]"
                />
                <input
                  type="text"
                  value={settings.state}
                  onChange={(e) => setSettings((prev) => ({ ...prev, state: e.target.value }))}
                  placeholder="State"
                  className="bg-[#10151B] border border-[#29313B] rounded-xl px-3 py-2 text-xs text-[#F3F5F7] focus:outline-none focus:border-[#10B981]"
                />
              </div>
              <p className="text-[11px] text-[#A7B0BC]">Rajkot, Gujarat gazetted state observances.</p>
            </div>
          </div>

          <div className="pt-4 border-t border-[#29313B] flex items-center justify-end">
            <button
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className="px-5 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-xs font-bold text-[#04130E] transition-colors shadow-lg shadow-[#10B981]/20 flex items-center gap-2"
            >
              {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Save Working Policy
            </button>
          </div>
        </div>
      )}

      {/* ── CREATE / EDIT HOLIDAY MODAL ─────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#151A21] border border-[#29313B] rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#29313B] pb-3">
              <h3 className="text-base font-bold text-white">
                {editingHoliday ? "Edit Organization Holiday" : "Create Custom Holiday"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[#A7B0BC] font-semibold">Holiday / Event Name *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Axivon Founders Day"
                  required
                  className="w-full bg-[#10151B] border border-[#29313B] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#10B981]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#A7B0BC] font-semibold">Date *</label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  required
                  className="w-full bg-[#10151B] border border-[#29313B] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#10B981]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#A7B0BC] font-semibold">Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full bg-[#10151B] border border-[#29313B] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#10B981]"
                >
                  <option value="COMPANY_HOLIDAY">Company Holiday (Official Day Off)</option>
                  <option value="PUBLIC_HOLIDAY">Public Holiday</option>
                  <option value="FESTIVAL_OR_OBSERVANCE">Festival or Observance</option>
                  <option value="OPTIONAL_HOLIDAY">Optional Holiday</option>
                </select>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-white">
                  <input
                    type="checkbox"
                    checked={formIsCompanyHoliday}
                    onChange={(e) => setFormIsCompanyHoliday(e.target.checked)}
                    className="rounded bg-[#10151B] border-[#29313B] text-[#10B981]"
                  />
                  <span>Official Office Closed Day-Off</span>
                </label>
              </div>

              <div className="space-y-1">
                <label className="text-[#A7B0BC] font-semibold">Description (Optional)</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Additional context or employee guidelines..."
                  rows={2}
                  className="w-full bg-[#10151B] border border-[#29313B] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#10B981]"
                />
              </div>

              <div className="pt-2 border-t border-[#29313B] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-2 rounded-xl border border-[#29313B] text-[#A7B0BC] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingModal}
                  className="px-4 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-[#04130E] font-bold"
                >
                  {submittingModal ? "Saving..." : editingHoliday ? "Update Holiday" : "Save Holiday"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRMATION MODAL ──────────────────────────── */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#151A21] border border-red-500/30 rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-bold text-white">Delete Holiday</h3>
            </div>
            <p className="text-xs text-[#A7B0BC] leading-relaxed">
              Are you sure you want to permanently delete this holiday? This will remove the scheduled day-off from company records.
            </p>
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3.5 py-1.5 rounded-xl border border-[#29313B] text-xs text-[#A7B0BC] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteHoliday(deleteConfirmId)}
                className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
