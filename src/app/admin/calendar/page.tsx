"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
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
} from "lucide-react";

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

interface CalendarSettings {
  weeklyOffDays: number[];
  workingDays: number[];
  saturdayRule: "ALL_WORKING" | "ALL_OFF" | "SECOND_FOURTH_OFF" | "FIRST_THIRD_OFF";
  timezone: string;
  country: string;
  state: string;
  holidaySource: string;
  autoSyncEnabled?: boolean;
  lastSyncAt?: string | null;
  lastSyncResult?: {
    added: number;
    updated: number;
    unchanged: number;
    total: number;
    timestamp: string;
    source: string;
  } | null;
}

interface HolidayStats {
  totalHolidays: number;
  companyHolidays: number;
  festivalsObservances: number;
  optionalHolidays: number;
  upcomingCount: number;
}

const DEFAULT_SETTINGS: CalendarSettings = {
  weeklyOffDays: [0],
  workingDays: [1, 2, 3, 4, 5, 6],
  saturdayRule: "ALL_WORKING",
  timezone: "Asia/Kolkata",
  country: "India",
  state: "Gujarat",
  holidaySource: "GOOGLE_CALENDAR",
};

export default function AdminCalendarPage() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [holidays, setHolidays] = useState<HolidayItem[]>([]);
  const [stats, setStats] = useState<HolidayStats>({
    totalHolidays: 0,
    companyHolidays: 0,
    festivalsObservances: 0,
    optionalHolidays: 0,
    upcomingCount: 0,
  });
  const [settings, setSettings] = useState<CalendarSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedApproval, setSelectedApproval] = useState<string>("ALL");

  // Notifications
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<HolidayItem | null>(null);
  const [formName, setFormName] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formCategory, setFormCategory] = useState<string>("COMPANY_HOLIDAY");
  const [formIsCompanyHoliday, setFormIsCompanyHoliday] = useState(true);
  const [formIsOptional, setFormIsOptional] = useState(false);
  const [formDescription, setFormDescription] = useState("");
  const [submittingModal, setSubmittingModal] = useState(false);

  // Active Settings Tab
  const [activeTab, setActiveTab] = useState<"HOLIDAYS" | "SCHEDULE">("HOLIDAYS");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setActionError(null);
      const res = await fetch(`/api/v1/admin/calendar?year=${selectedYear}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load calendar management data");
      }

      setHolidays(data.holidays || []);
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
  }, [selectedYear]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
        throw new Error(data.error || "Synchronization failed");
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

  // Toggle Holiday Approval Status (Official Day-Off vs Observance)
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
        throw new Error(data.error || "Failed to toggle status");
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
        throw new Error(data.error || "Failed to save settings");
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
        throw new Error(data.error || "Failed to save holiday");
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
  const handleDeleteHoliday = async (h: HolidayItem) => {
    if (!confirm(`Are you sure you want to permanently delete "${h.name}"?`)) return;

    try {
      const res = await fetch(`/api/v1/admin/calendar/holidays/${h.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete holiday");
      }

      setActionSuccess(`Deleted "${h.name}" from holiday calendar.`);
      setTimeout(() => setActionSuccess(null), 3000);
      loadData();
    } catch (err: any) {
      setActionError(err.message || "Could not delete holiday");
    }
  };

  // Filtered Holiday List
  const filteredHolidays = useMemo(() => {
    return holidays.filter((h) => {
      const matchesSearch =
        searchQuery === "" ||
        h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (h.description && h.description.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (selectedCategory !== "ALL" && h.category !== selectedCategory) {
        return false;
      }

      if (selectedApproval === "APPROVED" && !h.isCompanyHoliday) return false;
      if (selectedApproval === "OBSERVANCE" && h.isCompanyHoliday) return false;

      return true;
    });
  }, [holidays, searchQuery, selectedCategory, selectedApproval]);

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#F3F5F7] tracking-tight">
                Calendar & Holiday Management
              </h1>
              <p className="text-xs sm:text-sm text-[#A7B0BC] mt-0.5">
                Configure weekly off rules, manage Indian public holidays & festivals, and review company days off.
              </p>
            </div>
          </div>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            size="sm"
            variant="outline"
            onClick={handleSyncHolidays}
            disabled={syncing || loading}
            className="border-[#29313B] bg-[#151A21] hover:bg-[#1B222B] text-[#A7B0BC] hover:text-[#F3F5F7] text-xs flex items-center gap-1.5"
          >
            {syncing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span>{syncing ? "Syncing Feed..." : "Sync Indian Holidays"}</span>
          </Button>

          <Button
            size="sm"
            onClick={openCreateModal}
            className="bg-emerald-500 hover:bg-emerald-600 text-[#04130E] font-semibold text-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Holiday</span>
          </Button>
        </div>
      </div>

      {/* Action Notifications */}
      {actionSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Year Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="p-4 bg-[#151A21] border border-[#29313B] rounded-xl space-y-1">
          <div className="text-xs text-[#7E8997] font-medium">Holidays in {selectedYear}</div>
          <div className="text-2xl font-bold text-[#F3F5F7]">{stats.totalHolidays}</div>
          <div className="text-[11px] text-[#A7B0BC]">Total calendar entries</div>
        </div>

        <div className="p-4 bg-[#151A21] border border-[#29313B] rounded-xl space-y-1">
          <div className="text-xs text-emerald-400 font-medium">Company Days Off</div>
          <div className="text-2xl font-bold text-emerald-400">{stats.companyHolidays}</div>
          <div className="text-[11px] text-[#A7B0BC]">Official company holidays</div>
        </div>

        <div className="p-4 bg-[#151A21] border border-[#29313B] rounded-xl space-y-1">
          <div className="text-xs text-amber-400 font-medium">Festivals / Observances</div>
          <div className="text-2xl font-bold text-amber-400">{stats.festivalsObservances}</div>
          <div className="text-[11px] text-[#A7B0BC]">Working observances</div>
        </div>

        <div className="p-4 bg-[#151A21] border border-[#29313B] rounded-xl space-y-1">
          <div className="text-xs text-[#67C5D8] font-medium">Optional Holidays</div>
          <div className="text-2xl font-bold text-[#67C5D8]">{stats.optionalHolidays}</div>
          <div className="text-[11px] text-[#A7B0BC]">Restricted leave choice</div>
        </div>

        <div className="p-4 bg-[#151A21] border border-[#29313B] rounded-xl space-y-1">
          <div className="text-xs text-[#D6B779] font-medium">Upcoming Holidays</div>
          <div className="text-2xl font-bold text-[#D6B779]">{stats.upcomingCount}</div>
          <div className="text-[11px] text-[#A7B0BC]">Scheduled rest of year</div>
        </div>
      </div>

      {/* Sync Status Banner */}
      {settings.lastSyncResult && (
        <div className="p-3.5 bg-[#1B222B] border border-[#29313B] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#A7B0BC]">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Last synchronized:{" "}
              <strong className="text-[#F3F5F7]">
                {new Date(settings.lastSyncResult.timestamp).toLocaleString()}
              </strong>{" "}
              via {settings.lastSyncResult.source}. Added: {settings.lastSyncResult.added}, Updated:{" "}
              {settings.lastSyncResult.updated}, Unchanged: {settings.lastSyncResult.unchanged}.
            </span>
          </div>

          <span className="text-[11px] text-[#7E8997] shrink-0">
            Source: Google Indian Holidays & Gazette Feed
          </span>
        </div>
      )}

      {/* Tab Switcher: Holidays List vs Weekly Schedule Settings */}
      <div className="flex items-center gap-2 border-b border-[#1E2530] pb-2 text-xs">
        <button
          onClick={() => setActiveTab("HOLIDAYS")}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            activeTab === "HOLIDAYS"
              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
              : "text-[#7E8997] hover:text-[#F3F5F7]"
          }`}
        >
          Holiday & Festival Master List
        </button>
        <button
          onClick={() => setActiveTab("SCHEDULE")}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            activeTab === "SCHEDULE"
              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
              : "text-[#7E8997] hover:text-[#F3F5F7]"
          }`}
        >
          Weekly Schedule & Regional Rules
        </button>
      </div>

      {activeTab === "HOLIDAYS" && (
        <div className="space-y-4">
          {/* Toolbar: Search, Category, Year Selector */}
          <Card className="p-4 bg-[#151A21] border-[#29313B] rounded-xl space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#566171] absolute left-3 top-3 pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Search holiday name, festival, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-[#10151B] border-[#29313B] text-[#F3F5F7] placeholder:text-[#566171] focus-visible:border-emerald-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-2.5 text-[#7E8997] hover:text-[#F3F5F7]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Year Selector */}
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="h-10 px-3 bg-[#10151B] border border-[#29313B] rounded-lg text-xs text-[#F3F5F7] focus:outline-none focus:border-emerald-500 font-semibold"
                >
                  <option value={currentYear - 1}>{currentYear - 1}</option>
                  <option value={currentYear}>{currentYear}</option>
                  <option value={currentYear + 1}>{currentYear + 1}</option>
                </select>

                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="h-10 px-3 bg-[#10151B] border border-[#29313B] rounded-lg text-xs text-[#A7B0BC] focus:outline-none focus:border-emerald-500"
                >
                  <option value="ALL">All Categories</option>
                  <option value="PUBLIC_HOLIDAY">Public Holidays</option>
                  <option value="FESTIVAL_OR_OBSERVANCE">Festivals & Observances</option>
                  <option value="COMPANY_HOLIDAY">Company Holidays</option>
                  <option value="OPTIONAL_HOLIDAY">Optional Holidays</option>
                </select>

                {/* Approval Filter */}
                <select
                  value={selectedApproval}
                  onChange={(e) => setSelectedApproval(e.target.value)}
                  className="h-10 px-3 bg-[#10151B] border border-[#29313B] rounded-lg text-xs text-[#A7B0BC] focus:outline-none focus:border-emerald-500"
                >
                  <option value="ALL">All Classifications</option>
                  <option value="APPROVED">Company Day-Off Only</option>
                  <option value="OBSERVANCE">Observance (Working)</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center p-20 text-[#7E8997] gap-3">
              <Loader2 className="animate-spin w-5 h-5 text-emerald-500" />
              <span>Loading holidays...</span>
            </div>
          ) : filteredHolidays.length === 0 ? (
            <Card className="p-12 text-center bg-[#151A21] border-[#29313B] rounded-xl space-y-3">
              <CalendarIcon className="w-10 h-10 text-[#566171] mx-auto" />
              <h3 className="text-base font-semibold text-[#F3F5F7]">No holidays found</h3>
              <p className="text-xs text-[#7E8997] max-w-sm mx-auto">
                No holidays recorded for {selectedYear} matching your filters. You can sync the
                authoritative Indian holiday catalog or add a custom holiday.
              </p>
              <div className="pt-2 flex justify-center gap-2">
                <Button size="sm" onClick={handleSyncHolidays} className="text-xs">
                  Sync {selectedYear} Holidays
                </Button>
                <Button size="sm" variant="outline" onClick={openCreateModal} className="text-xs">
                  Add Custom Holiday
                </Button>
              </div>
            </Card>
          ) : (
            <div className="border border-[#29313B] rounded-2xl bg-[#151A21] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#10151B] border-b border-[#1E2530] text-[#7E8997] font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Date & Day</th>
                      <th className="px-4 py-3">Holiday / Festival Name</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Company Policy</th>
                      <th className="px-4 py-3">Source</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E2530] text-[#F3F5F7]">
                    {filteredHolidays.map((h) => {
                      const dateObj = new Date(`${h.date}T00:00:00`);
                      const weekday = dateObj.toLocaleDateString(undefined, { weekday: "short" });
                      const formattedDate = dateObj.toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      });

                      return (
                        <tr key={h.id} className="hover:bg-[#1B222B]/50 transition-colors">
                          {/* Date */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <div className="font-semibold">{formattedDate}</div>
                            <span className="text-[11px] text-[#7E8997]">{weekday}</span>
                          </td>

                          {/* Name & Desc */}
                          <td className="px-4 py-3.5 max-w-xs">
                            <div className="font-bold text-sm text-[#F3F5F7]">{h.name}</div>
                            {h.description && (
                              <p className="text-[11px] text-[#A7B0BC] line-clamp-1 mt-0.5">
                                {h.description}
                              </p>
                            )}
                          </td>

                          {/* Category Badge */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                                h.category === "PUBLIC_HOLIDAY"
                                  ? "bg-[#D6B779]/10 text-[#D6B779] border-[#D6B779]/20"
                                  : h.category === "COMPANY_HOLIDAY"
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                  : h.category === "OPTIONAL_HOLIDAY"
                                  ? "bg-[#67C5D8]/10 text-[#67C5D8] border-[#67C5D8]/20"
                                  : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              }`}
                            >
                              {h.category.replace(/_/g, " ")}
                            </span>
                          </td>

                          {/* Company Approval Toggle */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <button
                              onClick={() => handleToggleApproval(h)}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all ${
                                h.isCompanyHoliday
                                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25"
                                  : "bg-[#10151B] text-[#7E8997] border-[#29313B] hover:text-[#F3F5F7]"
                              }`}
                              title={
                                h.isCompanyHoliday
                                  ? "Click to revert to working observance"
                                  : "Click to approve as an official company day-off"
                              }
                            >
                              {h.isCompanyHoliday ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Official Day Off</span>
                                </>
                              ) : (
                                <>
                                  <Clock className="w-3.5 h-3.5 text-[#566171]" />
                                  <span>Observance Only</span>
                                </>
                              )}
                            </button>
                          </td>

                          {/* Source */}
                          <td className="px-4 py-3.5 whitespace-nowrap text-[11px] text-[#7E8997]">
                            <span className="bg-[#10151B] border border-[#1E2530] px-2 py-0.5 rounded">
                              {h.source.replace(/_/g, " ")}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEditModal(h)}
                                className="p-1.5 rounded-lg text-[#7E8997] hover:text-[#F3F5F7] hover:bg-[#1B222B]"
                                title="Edit Details"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteHoliday(h)}
                                className="p-1.5 rounded-lg text-[#7E8997] hover:text-rose-400 hover:bg-rose-500/10"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Settings Tab: Weekly Schedule & Regional Rules */}
      {activeTab === "SCHEDULE" && (
        <Card className="p-6 bg-[#151A21] border-[#29313B] rounded-2xl space-y-6">
          <div className="pb-3 border-b border-[#1E2530]">
            <h2 className="text-base sm:text-lg font-bold text-[#F3F5F7] flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-400" />
              <span>Weekly Schedule & Regional Calendar Policy</span>
            </h2>
            <p className="text-xs text-[#7E8997] mt-0.5">
              Configured rules persistently apply to all employee calendars across the company.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
            {/* Weekly Off Days Selection */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A7B0BC]">
                Weekly Off Days
              </label>
              <p className="text-[11px] text-[#7E8997]">
                Days marked off will be automatically recognized as Weekly Off on employee calendars.
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1">
                {[
                  { day: 0, label: "Sunday (Default Off)" },
                  { day: 1, label: "Monday" },
                  { day: 2, label: "Tuesday" },
                  { day: 3, label: "Wednesday" },
                  { day: 4, label: "Thursday" },
                  { day: 5, label: "Friday" },
                  { day: 6, label: "Saturday" },
                ].map((item) => {
                  const isChecked = settings.weeklyOffDays.includes(item.day);
                  return (
                    <label
                      key={item.day}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-colors ${
                        isChecked
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-semibold"
                          : "bg-[#10151B] border-[#1E2530] text-[#A7B0BC] hover:border-[#29313B]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          const updated = e.target.checked
                            ? [...settings.weeklyOffDays, item.day]
                            : settings.weeklyOffDays.filter((d) => d !== item.day);
                          setSettings({ ...settings, weeklyOffDays: updated });
                        }}
                        className="w-4 h-4 accent-emerald-500 rounded"
                      />
                      <span>{item.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Saturday Alternate Rules */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#A7B0BC] mb-1.5">
                  Saturday Working / Off Policy
                </label>
                <select
                  value={settings.saturdayRule}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      saturdayRule: e.target.value as any,
                    })
                  }
                  className="w-full h-10 px-3 bg-[#10151B] border border-[#29313B] rounded-lg text-xs text-[#F3F5F7] focus:outline-none focus:border-emerald-500"
                >
                  <option value="ALL_WORKING">All Saturdays Working (Normal Workday)</option>
                  <option value="ALL_OFF">All Saturdays Off (Full 5-Day Work Week)</option>
                  <option value="SECOND_FOURTH_OFF">
                    2nd and 4th Saturday Off (1st, 3rd, 5th Working)
                  </option>
                  <option value="FIRST_THIRD_OFF">
                    1st and 3rd Saturday Off (2nd, 4th Working)
                  </option>
                </select>
                <p className="text-[11px] text-[#7E8997] mt-1">
                  Dates will automatically calculate whether a Saturday is 1st, 2nd, 3rd, 4th, or 5th.
                </p>
              </div>

              {/* Timezone & State */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#A7B0BC] mb-1.5">
                    Company Timezone
                  </label>
                  <Input
                    value={settings.timezone}
                    onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                    className="bg-[#10151B] border-[#29313B] text-[#F3F5F7] text-xs"
                  />
                  <p className="text-[11px] text-[#7E8997] mt-1">Default: Asia/Kolkata (UTC+5:30)</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#A7B0BC] mb-1.5">
                    Operating State / Region
                  </label>
                  <select
                    value={settings.state}
                    onChange={(e) => setSettings({ ...settings, state: e.target.value })}
                    className="w-full h-10 px-3 bg-[#10151B] border border-[#29313B] rounded-lg text-xs text-[#F3F5F7] focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Gujarat">Gujarat (Ahmedabad/Surat/Vadodara)</option>
                    <option value="Maharashtra">Maharashtra (Mumbai/Pune)</option>
                    <option value="Delhi">Delhi (NCR)</option>
                    <option value="Karnataka">Karnataka (Bengaluru)</option>
                    <option value="Telangana">Telangana (Hyderabad)</option>
                    <option value="Tamil Nadu">Tamil Nadu (Chennai)</option>
                    <option value="All India">All India / Multi-State</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#1E2530] flex justify-end">
            <Button
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className="bg-emerald-500 hover:bg-emerald-600 text-[#04130E] font-semibold text-xs flex items-center gap-2"
            >
              {savingSettings ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>Save Schedule Settings</span>
            </Button>
          </div>
        </Card>
      )}

      {/* Create / Edit Holiday Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#151A21] border border-[#29313B] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-[#1E2530] flex items-center justify-between">
              <h3 className="text-base font-bold text-[#F3F5F7]">
                {editingHoliday ? "Edit Holiday / Observance" : "Add Custom Company Holiday"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-[#7E8997] hover:text-[#F3F5F7]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="p-5 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-medium text-[#A7B0BC] mb-1.5">
                  Holiday / Event Name <span className="text-rose-400">*</span>
                </label>
                <Input
                  placeholder="e.g. Axivon Annual Foundation Day"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  className="bg-[#10151B] border-[#29313B] text-[#F3F5F7] placeholder:text-[#566171] focus-visible:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#A7B0BC] mb-1.5">
                    Date <span className="text-rose-400">*</span>
                  </label>
                  <Input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    required
                    className="bg-[#10151B] border-[#29313B] text-[#F3F5F7] focus-visible:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#A7B0BC] mb-1.5">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full h-10 px-3 bg-[#10151B] border border-[#29313B] rounded-lg text-xs text-[#F3F5F7] focus:outline-none focus:border-emerald-500"
                  >
                    <option value="COMPANY_HOLIDAY">Company Holiday</option>
                    <option value="PUBLIC_HOLIDAY">Public Holiday</option>
                    <option value="FESTIVAL_OR_OBSERVANCE">Festival / Observance</option>
                    <option value="OPTIONAL_HOLIDAY">Optional Holiday</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A7B0BC] mb-1.5">
                  Description / Significance (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief note about the occasion..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-[#10151B] border border-[#29313B] rounded-xl p-3 text-xs text-[#F3F5F7] placeholder:text-[#566171] focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-3 bg-[#10151B] border border-[#1E2530] rounded-xl space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsCompanyHoliday}
                    onChange={(e) => setFormIsCompanyHoliday(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 rounded"
                  />
                  <div>
                    <span className="font-semibold text-[#F3F5F7] text-xs">
                      Approve as Official Company Day-Off
                    </span>
                    <p className="text-[11px] text-[#7E8997]">
                      When checked, office is recognized as closed and employees get paid holiday.
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={formIsOptional}
                    onChange={(e) => setFormIsOptional(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 rounded"
                  />
                  <div>
                    <span className="font-semibold text-[#A7B0BC] text-xs">
                      Mark as Optional / Restricted Holiday
                    </span>
                  </div>
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-[#1E2530]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowModal(false)}
                  className="border-[#29313B] text-[#A7B0BC]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={submittingModal}
                  className="bg-emerald-500 hover:bg-emerald-600 text-[#04130E] font-semibold text-xs"
                >
                  {submittingModal ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    "Save Holiday"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
