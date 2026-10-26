"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  X,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Calendar,
  Lock,
  ShieldAlert,
  Search,
  Check,
  RefreshCw,
  Clock,
  Layers,
  ChevronDown,
} from "lucide-react";
import { toast } from "@/lib/notifications/toast";
import { getErrorMessage } from "@/lib/errors/client";
import {
  APPLICATION_COLUMNS,
  CONFIRMED_PARTNER_COLUMNS,
} from "@/lib/export/export-definitions";

export interface ExportPartnersModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: "APPLICATIONS" | "CONFIRMED_PARTNERS" | "SINGLE_PARTNER";
  singlePartnerIdOrUserId?: string;
  selectedRowIds?: string[];
  totalTableRowsCount?: number;
}

export function ExportPartnersModal({
  isOpen,
  onClose,
  initialType = "APPLICATIONS",
  singlePartnerIdOrUserId,
  selectedRowIds = [],
  totalTableRowsCount = 0,
}: ExportPartnersModalProps) {
  const [activeType, setActiveType] = useState<"APPLICATIONS" | "CONFIRMED_PARTNERS" | "SINGLE_PARTNER">(
    initialType
  );
  const [activeTab, setActiveTab] = useState<"export" | "history">("export");

  // Record Scope
  const [exportScope, setExportScope] = useState<"ALL_MATCHING" | "SELECTED_IDS" | "LATEST_N">(
    selectedRowIds.length > 0 ? "SELECTED_IDS" : "ALL_MATCHING"
  );
  const [latestNCount, setLatestNCount] = useState<number>(100);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [onboardingState, setOnboardingState] = useState<"ALL" | "COMPLETED" | "IN_PROGRESS">("ALL");
  const [kycStatus, setKycStatus] = useState<"ALL" | "VERIFIED" | "PENDING_REVIEW" | "NOT_UPLOADED">("ALL");

  // Options
  const [exportFormat, setExportFormat] = useState<"xlsx" | "csv">("xlsx");
  const [includeRelatedData, setIncludeRelatedData] = useState(false);
  const [sensitiveUnmasked, setSensitiveUnmasked] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");

  // Column Picker
  const defaultCols = activeType === "APPLICATIONS"
    ? APPLICATION_COLUMNS.map((c) => c.key)
    : CONFIRMED_PARTNER_COLUMNS.map((c) => c.key);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(defaultCols);

  // Live Preview State
  const [matchingCount, setMatchingCount] = useState<number | null>(null);
  const [previewRows, setPreviewRows] = useState<Array<Record<string, any>>>([]);
  const [previewLoading, setPreviewLoading] = useState(false);

  // History State
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Download State
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    setActiveType(initialType);
    const cols = initialType === "APPLICATIONS"
      ? APPLICATION_COLUMNS.map((c) => c.key)
      : CONFIRMED_PARTNER_COLUMNS.map((c) => c.key);
    setSelectedColumns(cols);
    if (selectedRowIds.length > 0) {
      setExportScope("SELECTED_IDS");
    }
  }, [initialType, selectedRowIds.length]);

  // Fetch Live Preview Debounced
  useEffect(() => {
    if (!isOpen || activeTab !== "export" || activeType === "SINGLE_PARTNER") return;

    const timer = setTimeout(async () => {
      setPreviewLoading(true);
      try {
        const payload: any = {
          type: activeType,
          exportScope,
          selectedIds: selectedRowIds,
          latestNCount: Number(latestNCount) || 100,
          filters: {
            statuses: statusFilter.length > 0 ? statusFilter : undefined,
            search: searchTerm || undefined,
            country: countryFilter || undefined,
            city: cityFilter || undefined,
            dateFrom: dateFrom || undefined,
            dateTo: dateTo || undefined,
            onboardingState: activeType === "CONFIRMED_PARTNERS" ? onboardingState : undefined,
            kycStatus: activeType === "CONFIRMED_PARTNERS" ? kycStatus : undefined,
          },
        };

        const res = await fetch("/api/v1/admin/export/partners/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const json = await res.json();
          setMatchingCount(json.data.totalMatching);
          setPreviewRows(json.data.previewRows || []);
        } else {
          setMatchingCount(0);
          setPreviewRows([]);
        }
      } catch {
        setMatchingCount(0);
        setPreviewRows([]);
      } finally {
        setPreviewLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [
    isOpen,
    activeType,
    activeTab,
    exportScope,
    latestNCount,
    statusFilter,
    searchTerm,
    countryFilter,
    cityFilter,
    dateFrom,
    dateTo,
    onboardingState,
    kycStatus,
    selectedRowIds,
  ]);

  // Load History
  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch("/api/v1/admin/export/history");
      if (res.ok) {
        const json = await res.json();
        setHistoryLogs(json.data || []);
      }
    } catch {
      toast.error("Failed to load export history.");
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && activeTab === "history") {
      fetchHistory();
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  // Toggle single status in multi-select
  const handleToggleStatus = (st: string) => {
    setStatusFilter((prev) =>
      prev.includes(st) ? prev.filter((s) => s !== st) : [...prev, st]
    );
  };

  // Column Select All / Clear
  const handleSelectAllColumns = () => {
    const all = activeType === "APPLICATIONS"
      ? APPLICATION_COLUMNS.map((c) => c.key)
      : CONFIRMED_PARTNER_COLUMNS.map((c) => c.key);
    setSelectedColumns(all);
  };

  const handleSelectDefaultColumns = () => {
    const defaults = activeType === "APPLICATIONS"
      ? ["applicationId", "status", "fullName", "email", "phone", "city", "occupation", "createdAt"]
      : ["partnerId", "referralCode", "name", "email", "phone", "companyName", "status", "totalLeads", "createdAt"];
    setSelectedColumns(defaults);
  };

  const handleToggleColumn = (key: string) => {
    setSelectedColumns((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // Perform Export
  const handleDownload = async () => {
    if (sensitiveUnmasked && !adminPassword) {
      toast.error("Admin password is required to export unmasked financial records.");
      return;
    }

    setIsExporting(true);
    try {
      const payload: any = {
        type: activeType,
        partnerIdOrUserId: singlePartnerIdOrUserId,
        format: exportFormat,
        exportScope,
        selectedIds: selectedRowIds,
        latestNCount: Number(latestNCount) || 100,
        columns: selectedColumns,
        includeRelatedData,
        sensitiveUnmasked,
        adminPassword: sensitiveUnmasked ? adminPassword : undefined,
        filters: {
          statuses: statusFilter.length > 0 ? statusFilter : undefined,
          search: searchTerm || undefined,
          country: countryFilter || undefined,
          city: cityFilter || undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
          onboardingState: activeType === "CONFIRMED_PARTNERS" ? onboardingState : undefined,
          kycStatus: activeType === "CONFIRMED_PARTNERS" ? kycStatus : undefined,
        },
      };

      const res = await fetch("/api/v1/admin/export/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorJson = await res.json().catch(() => null);
        throw new Error(getErrorMessage(errorJson) || "Export failed.");
      }

      // Download file via blob
      const blob = await res.blob();
      const contentDisposition = res.headers.get("content-disposition");
      let filename = `axivon-export.${exportFormat}`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) filename = match[1];
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`Successfully exported ${filename}`);
      onClose();
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsExporting(false);
    }
  };

  const appStatusOptions = ["SUBMITTED", "UNDER_REVIEW", "MEETING_SCHEDULED", "APPROVED", "REJECTED"];
  const partnerStatusOptions = ["ACTIVE", "INACTIVE", "SUSPENDED"];
  const currentColumnsList = activeType === "APPLICATIONS" ? APPLICATION_COLUMNS : CONFIRMED_PARTNER_COLUMNS;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#121214] border border-white/10 rounded-xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl text-white">
        {/* Modal Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Partner Data Export Center</h2>
              <p className="text-xs text-gray-400">
                Generate high-performance Excel (.xlsx) and CSV reports with granular filters and security audits.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab & Type Selector */}
        <div className="px-5 pt-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 bg-[#0d0d0f]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("export")}
              className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 ${
                activeTab === "export"
                  ? "border-emerald-500 text-white bg-white/5"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              Export Report
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 flex items-center gap-1.5 ${
                activeTab === "history"
                  ? "border-emerald-500 text-white bg-white/5"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              <Clock className="w-3.5 h-3.5" /> Export Audit History
            </button>
          </div>

          {activeTab === "export" && activeType !== "SINGLE_PARTNER" && (
            <div className="flex items-center bg-white/5 p-1 rounded-lg border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => {
                  setActiveType("APPLICATIONS");
                  setSelectedColumns(APPLICATION_COLUMNS.map((c) => c.key));
                  setStatusFilter([]);
                }}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  activeType === "APPLICATIONS"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Applications
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveType("CONFIRMED_PARTNERS");
                  setSelectedColumns(CONFIRMED_PARTNER_COLUMNS.map((c) => c.key));
                  setStatusFilter([]);
                }}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  activeType === "CONFIRMED_PARTNERS"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Confirmed Partners
              </button>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {activeTab === "history" ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  Recent 20 export transactions recorded in system audit logs.
                </span>
                <button
                  onClick={fetchHistory}
                  disabled={historyLoading}
                  className="px-3 py-1 text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded flex items-center gap-1.5 text-gray-300"
                >
                  <RefreshCw className={`w-3 h-3 ${historyLoading ? "animate-spin" : ""}`} /> Refresh
                </button>
              </div>

              {historyLoading ? (
                <div className="py-12 text-center text-gray-500">Loading export audit logs...</div>
              ) : historyLogs.length === 0 ? (
                <div className="py-12 text-center text-gray-500">No exports logged yet.</div>
              ) : (
                <div className="border border-white/10 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs text-gray-300">
                    <thead className="bg-white/5 uppercase text-gray-500 text-[10px]">
                      <tr>
                        <th className="px-4 py-2.5">Date / Time</th>
                        <th className="px-4 py-2.5">Admin</th>
                        <th className="px-4 py-2.5">Export Type</th>
                        <th className="px-4 py-2.5">Format</th>
                        <th className="px-4 py-2.5">Rows</th>
                        <th className="px-4 py-2.5">Sensitive Data</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {historyLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-white/[0.02]">
                          <td className="px-4 py-2 text-gray-400 font-mono text-[11px]">
                            {new Date(log.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                          </td>
                          <td className="px-4 py-2 font-medium text-white">{log.adminName}</td>
                          <td className="px-4 py-2">{log.exportType}</td>
                          <td className="px-4 py-2 uppercase font-mono">{log.format}</td>
                          <td className="px-4 py-2 font-mono">{log.rowCount}</td>
                          <td className="px-4 py-2">
                            {log.sensitiveUnmasked ? (
                              <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 text-[10px]">
                                UNMASKED
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                                MASKED
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* SECTION 1: RECORD SCOPE */}
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-2 uppercase tracking-wide">
                  1. How Many Records
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label
                    className={`border p-3 rounded-lg flex items-start gap-3 cursor-pointer transition-colors ${
                      exportScope === "ALL_MATCHING"
                        ? "border-emerald-500/50 bg-emerald-500/5"
                        : "border-white/10 hover:border-white/20 bg-white/[0.02]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="scope"
                      value="ALL_MATCHING"
                      checked={exportScope === "ALL_MATCHING"}
                      onChange={() => setExportScope("ALL_MATCHING")}
                      className="mt-0.5 accent-emerald-500"
                    />
                    <div>
                      <div className="font-semibold text-xs text-white">All Matching Records</div>
                      <div className="text-[11px] text-gray-400">Export every row meeting the filters below</div>
                    </div>
                  </label>

                  <label
                    className={`border p-3 rounded-lg flex items-start gap-3 cursor-pointer transition-colors ${
                      exportScope === "SELECTED_IDS"
                        ? "border-emerald-500/50 bg-emerald-500/5"
                        : "border-white/10 hover:border-white/20 bg-white/[0.02]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="scope"
                      value="SELECTED_IDS"
                      checked={exportScope === "SELECTED_IDS"}
                      onChange={() => setExportScope("SELECTED_IDS")}
                      className="mt-0.5 accent-emerald-500"
                    />
                    <div>
                      <div className="font-semibold text-xs text-white">Selected Rows Only</div>
                      <div className="text-[11px] text-gray-400">
                        {selectedRowIds.length} row(s) checked in table
                      </div>
                    </div>
                  </label>

                  <label
                    className={`border p-3 rounded-lg flex items-start gap-3 cursor-pointer transition-colors ${
                      exportScope === "LATEST_N"
                        ? "border-emerald-500/50 bg-emerald-500/5"
                        : "border-white/10 hover:border-white/20 bg-white/[0.02]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="scope"
                      value="LATEST_N"
                      checked={exportScope === "LATEST_N"}
                      onChange={() => setExportScope("LATEST_N")}
                      className="mt-0.5 accent-emerald-500"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-xs text-white">Latest N Records</div>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="number"
                          min="1"
                          max="20000"
                          value={latestNCount}
                          onChange={(e) => setLatestNCount(Number(e.target.value))}
                          disabled={exportScope !== "LATEST_N"}
                          className="w-20 bg-black/50 border border-white/20 rounded px-2 py-0.5 text-xs text-white"
                        />
                        <span className="text-[10px] text-gray-400">Max 20,000</span>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* SECTION 2: FILTERS */}
              {activeType !== "SINGLE_PARTNER" && (
                <div className="bg-white/[0.02] border border-white/10 p-4 rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-gray-300 uppercase tracking-wide flex items-center gap-1.5">
                      <Filter className="w-3.5 h-3.5 text-emerald-400" /> 2. Filter Parameters
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setStatusFilter([]);
                        setSearchTerm("");
                        setCountryFilter("");
                        setCityFilter("");
                        setDateFrom("");
                        setDateTo("");
                        setOnboardingState("ALL");
                        setKycStatus("ALL");
                      }}
                      className="text-[11px] text-gray-400 hover:text-white underline"
                    >
                      Reset Filters
                    </button>
                  </div>

                  {/* Status Pills */}
                  <div>
                    <span className="text-[11px] text-gray-400 block mb-1.5">Status Filter (Multi-Select)</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(activeType === "APPLICATIONS" ? appStatusOptions : partnerStatusOptions).map((st) => {
                        const isSelected = statusFilter.includes(st);
                        return (
                          <button
                            key={st}
                            type="button"
                            onClick={() => handleToggleStatus(st)}
                            className={`px-2.5 py-1 rounded text-xs transition-colors flex items-center gap-1 ${
                              isSelected
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : "bg-white/5 text-gray-400 border border-white/10 hover:border-white/20"
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 text-emerald-400" />} {st}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Search and Location */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="text-[11px] text-gray-400 block mb-1">Search Keywords</span>
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-2.5" />
                        <input
                          type="text"
                          placeholder="Name, email, phone, ID..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full bg-[#18181b] border border-white/10 rounded px-2.5 py-1.5 pl-8 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                    <div>
                      <span className="text-[11px] text-gray-400 block mb-1">Country</span>
                      <input
                        type="text"
                        placeholder="e.g. India, United States"
                        value={countryFilter}
                        onChange={(e) => setCountryFilter(e.target.value)}
                        className="w-full bg-[#18181b] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-gray-400 block mb-1">City</span>
                      <input
                        type="text"
                        placeholder="e.g. Mumbai, Bangalore"
                        value={cityFilter}
                        onChange={(e) => setCityFilter(e.target.value)}
                        className="w-full bg-[#18181b] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Date Range */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <span className="text-[11px] text-gray-400 block mb-1">Date From</span>
                      <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="w-full bg-[#18181b] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-gray-400 block mb-1">Date To</span>
                      <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="w-full bg-[#18181b] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Confirmed Partner Specific Filters */}
                  {activeType === "CONFIRMED_PARTNERS" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <span className="text-[11px] text-gray-400 block mb-1">Onboarding State</span>
                        <select
                          value={onboardingState}
                          onChange={(e: any) => setOnboardingState(e.target.value)}
                          className="w-full bg-[#18181b] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                        >
                          <option value="ALL">All Onboarding States</option>
                          <option value="COMPLETED">Completed (100%)</option>
                          <option value="IN_PROGRESS">In Progress</option>
                        </select>
                      </div>
                      <div>
                        <span className="text-[11px] text-gray-400 block mb-1">KYC Status</span>
                        <select
                          value={kycStatus}
                          onChange={(e: any) => setKycStatus(e.target.value)}
                          className="w-full bg-[#18181b] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                        >
                          <option value="ALL">All KYC States</option>
                          <option value="VERIFIED">Verified</option>
                          <option value="PENDING_REVIEW">Pending Review</option>
                          <option value="NOT_UPLOADED">Not Uploaded</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 3: COLUMN PICKER */}
              <div className="bg-white/[0.02] border border-white/10 p-4 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-300 uppercase tracking-wide flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-400" /> 3. Column Selection ({selectedColumns.length} of {currentColumnsList.length})
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSelectDefaultColumns}
                      className="text-[11px] text-gray-400 hover:text-white underline"
                    >
                      Default Set
                    </button>
                    <span className="text-gray-600">·</span>
                    <button
                      type="button"
                      onClick={handleSelectAllColumns}
                      className="text-[11px] text-emerald-400 hover:text-emerald-300 underline"
                    >
                      Select All
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-2 bg-black/40 rounded border border-white/5">
                  {currentColumnsList.map((col) => {
                    const isChecked = selectedColumns.includes(col.key);
                    return (
                      <label
                        key={col.key}
                        className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer hover:text-white"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleColumn(col.key)}
                          className="rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-0"
                        />
                        <span className="truncate">{col.header}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 4: RELATED DATA & SECURITY */}
              <div className="space-y-3">
                {activeType === "CONFIRMED_PARTNERS" && (
                  <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer hover:text-white bg-white/[0.02] p-3 rounded-lg border border-white/10">
                    <input
                      type="checkbox"
                      checked={includeRelatedData}
                      onChange={(e) => setIncludeRelatedData(e.target.checked)}
                      className="rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-0"
                    />
                    <div>
                      <span className="font-semibold text-white block">
                        Include Related Data Sheets (Leads, Projects, Commissions, Payouts)
                      </span>
                      <span className="text-[11px] text-gray-400">
                        Appends 4 additional linked workbooks for comprehensive partner audits.
                      </span>
                    </div>
                  </label>
                )}

                {/* SENSITIVE DATA UNMASKING */}
                <div
                  className={`p-3 rounded-lg border transition-all ${
                    sensitiveUnmasked
                      ? "border-red-500/40 bg-red-500/10"
                      : "border-white/10 bg-white/[0.02]"
                  }`}
                >
                  <label className="flex items-start gap-2.5 text-xs text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sensitiveUnmasked}
                      onChange={(e) => setSensitiveUnmasked(e.target.checked)}
                      className="mt-0.5 rounded border-white/20 text-red-500 focus:ring-0"
                    />
                    <div>
                      <span className="font-semibold text-red-400 flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5" /> Export Unmasked Financial & Tax Identifiers
                      </span>
                      <span className="text-[11px] text-gray-400 block mt-0.5">
                        Default exports mask bank accounts, UPI handles, and PAN numbers (••••5678). Checking this releases full unmasked values and requires admin re-authentication.
                      </span>
                    </div>
                  </label>

                  {sensitiveUnmasked && (
                    <div className="mt-3 pt-3 border-t border-red-500/20 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                      <Lock className="w-4 h-4 text-red-400 shrink-0" />
                      <input
                        type="password"
                        placeholder="Re-enter Admin Password..."
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        className="bg-black/60 border border-red-500/30 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-red-500 w-full sm:w-64"
                      />
                      <span className="text-[10px] text-red-300/80">
                        Password required to release unmasked records.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 5: LIVE COUNT & PREVIEW */}
              {activeType !== "SINGLE_PARTNER" && (
                <div className="bg-[#0e0e11] border border-white/10 p-3.5 rounded-lg space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400 font-medium">Live Query Preview:</span>
                    <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                      {previewLoading ? (
                        <RefreshCw className="w-3 h-3 animate-spin text-gray-400" />
                      ) : (
                        `${matchingCount ?? 0} matching record(s) found`
                      )}
                    </span>
                  </div>

                  {previewRows.length > 0 && (
                    <div className="overflow-x-auto border border-white/5 rounded max-h-32">
                      <table className="w-full text-left text-[11px] text-gray-400">
                        <thead className="bg-white/5 uppercase text-gray-500 text-[9px]">
                          <tr>
                            <th className="px-2.5 py-1">ID</th>
                            <th className="px-2.5 py-1">Name</th>
                            <th className="px-2.5 py-1">Email</th>
                            <th className="px-2.5 py-1">City</th>
                            <th className="px-2.5 py-1">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {previewRows.map((r, i) => (
                            <tr key={i}>
                              <td className="px-2.5 py-1 font-mono text-gray-300">
                                {r.applicationId || r.partnerId || "—"}
                              </td>
                              <td className="px-2.5 py-1 text-white">{r.fullName || r.name || "—"}</td>
                              <td className="px-2.5 py-1">{r.email || "—"}</td>
                              <td className="px-2.5 py-1">{r.city || "—"}</td>
                              <td className="px-2.5 py-1">{r.status || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        {activeTab === "export" && (
          <div className="p-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0d0d0f]">
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400 font-medium">Format:</span>
              <div className="flex items-center bg-white/5 p-1 rounded border border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => setExportFormat("xlsx")}
                  className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 ${
                    exportFormat === "xlsx"
                      ? "bg-emerald-600 text-white font-medium"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" /> Excel (.xlsx)
                </button>
                <button
                  type="button"
                  onClick={() => setExportFormat("csv")}
                  className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 ${
                    exportFormat === "csv"
                      ? "bg-emerald-600 text-white font-medium"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" /> CSV (.csv)
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2 border border-white/10 hover:bg-white/5 rounded-lg text-xs font-semibold text-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDownload}
                disabled={isExporting || (matchingCount === 0 && activeType !== "SINGLE_PARTNER")}
                className="flex-1 sm:flex-none px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30"
              >
                {isExporting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" /> Download Export
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
