// src/app/demo-projects/saas/leadpilot/leads/page.tsx
"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  Search,
  Filter,
  Plus,
  Download,
  LayoutGrid,
  List,
  ChevronRight,
  Eye,
  Trash2,
  Edit2,
  X,
  Phone,
  Mail,
  Building2,
  Calendar,
  Sparkles,
  ArrowUpDown,
  Tag,
} from "lucide-react";
import { useLeadPilot } from "@/context/LeadPilotContext";
import { Lead, LeadStatus, LeadPriority } from "@/data/leadpilot-data";

export default function LeadPilotLeadsPage() {
  const {
    leads,
    addLead,
    updateLead,
    deleteLead,
    updateLeadStatus,
    companies,
  } = useLeadPilot();

  // View mode: Table or Pipeline (Kanban)
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");
  const [sourceFilter, setSourceFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"created" | "value" | "name">("created");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selected Lead Details Drawer / Edit modal
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Lead>>({});

  // Filter & Sort Logic
  const filteredLeads = useMemo(() => {
    let result = [...leads];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (l) =>
          l.fullName.toLowerCase().includes(q) ||
          l.companyName.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          l.interestedService.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "All") {
      result = result.filter((l) => l.status === statusFilter);
    }

    if (priorityFilter !== "All") {
      result = result.filter((l) => l.priority === priorityFilter);
    }

    if (sourceFilter !== "All") {
      result = result.filter((l) => l.source === sourceFilter);
    }

    result.sort((a, b) => {
      if (sortBy === "value") {
        return sortOrder === "desc"
          ? b.estimatedValue - a.estimatedValue
          : a.estimatedValue - b.estimatedValue;
      }
      if (sortBy === "name") {
        return sortOrder === "asc"
          ? a.fullName.localeCompare(b.fullName)
          : b.fullName.localeCompare(a.fullName);
      }
      return sortOrder === "desc"
        ? b.createdAt.localeCompare(a.createdAt)
        : a.createdAt.localeCompare(b.createdAt);
    });

    return result;
  }, [leads, searchQuery, statusFilter, priorityFilter, sourceFilter, sortBy, sortOrder]);

  // Paginated leads for table
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage) || 1;
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLeads.slice(start, start + itemsPerPage);
  }, [filteredLeads, currentPage]);

  // Export to CSV function (Working implementation as requested in spec)
  const handleExportCSV = () => {
    const headers = [
      "ID",
      "Full Name",
      "Email",
      "Phone",
      "Company",
      "Service",
      "Status",
      "Priority",
      "Estimated Value",
      "Owner",
      "Created Date",
    ];
    const rows = filteredLeads.map((l) => [
      l.id,
      `"${l.fullName}"`,
      `"${l.email}"`,
      `"${l.phone}"`,
      `"${l.companyName}"`,
      `"${l.interestedService}"`,
      l.status,
      l.priority,
      l.estimatedValue,
      `"${l.assignedOwner}"`,
      l.createdAt,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `leadpilot_leads_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Kanban stages
  const KANBAN_STAGES: LeadStatus[] = ["New", "Contacted", "Qualified", "Proposal", "Won", "Lost"];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* 1. Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#252925]">
            Leads Management
          </h1>
          <p className="mt-0.5 text-xs text-[#747A75]">
            Track, qualify, and transition prospective clients across your sales cycle.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 bg-white rounded-xl border border-[#E3E6E1] shadow-2xs">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === "table"
                  ? "bg-[#252925] text-white"
                  : "text-[#747A75] hover:text-[#252925]"
              }`}
              aria-label="Table View"
            >
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === "kanban"
                  ? "bg-[#252925] text-white"
                  : "text-[#747A75] hover:text-[#252925]"
              }`}
              aria-label="Kanban View"
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline">Pipeline</span>
            </button>
          </div>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-[#F6F7F4] text-[#252925] border border-[#E3E6E1] rounded-xl text-xs font-semibold shadow-2xs transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-[#747A75]" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Filters bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E3E6E1] shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#747A75]" />
            <input
              type="text"
              placeholder="Search by name, company, email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 bg-[#F6F7F4] border border-[#E3E6E1] rounded-lg text-xs text-[#252925] focus:outline-none focus:ring-1 focus:ring-[#2F806A]"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-[#F6F7F4] border border-[#E3E6E1] rounded-lg text-xs text-[#252925] focus:outline-none focus:ring-1 focus:ring-[#2F806A]"
            >
              <option value="All">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Proposal">Proposal</option>
              <option value="Won">Won</option>
              <option value="Lost">Lost</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-[#F6F7F4] border border-[#E3E6E1] rounded-lg text-xs text-[#252925] focus:outline-none focus:ring-1 focus:ring-[#2F806A]"
            >
              <option value="All">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>

          {/* Source Filter */}
          <div>
            <select
              value={sourceFilter}
              onChange={(e) => {
                setSourceFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-[#F6F7F4] border border-[#E3E6E1] rounded-lg text-xs text-[#252925] focus:outline-none focus:ring-1 focus:ring-[#2F806A]"
            >
              <option value="All">All Sources</option>
              <option value="Website Form">Website Form</option>
              <option value="Demo Request">Demo Request</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Inbound Referral">Inbound Referral</option>
              <option value="Industry Event">Industry Event</option>
              <option value="Outbound Campaign">Outbound Campaign</option>
            </select>
          </div>
        </div>

        {/* Results Counter & Sort Toggle */}
        <div className="flex items-center justify-between text-xs text-[#747A75] pt-1">
          <div>
            Showing <span className="font-semibold text-[#252925]">{filteredLeads.length}</span>{" "}
            sample leads
          </div>
          <div className="flex items-center gap-2">
            <span>Sort by:</span>
            <button
              onClick={() => {
                if (sortBy === "value") setSortOrder(sortOrder === "desc" ? "asc" : "desc");
                else {
                  setSortBy("value");
                  setSortOrder("desc");
                }
              }}
              className={`px-2 py-1 rounded text-xs font-semibold ${
                sortBy === "value" ? "bg-[#E5F0EB] text-[#2F806A]" : "hover:text-[#252925]"
              }`}
            >
              Value {sortBy === "value" && (sortOrder === "desc" ? "↓" : "↑")}
            </button>
            <button
              onClick={() => {
                if (sortBy === "created") setSortOrder(sortOrder === "desc" ? "asc" : "desc");
                else {
                  setSortBy("created");
                  setSortOrder("desc");
                }
              }}
              className={`px-2 py-1 rounded text-xs font-semibold ${
                sortBy === "created" ? "bg-[#E5F0EB] text-[#2F806A]" : "hover:text-[#252925]"
              }`}
            >
              Date {sortBy === "created" && (sortOrder === "desc" ? "↓" : "↑")}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Table View */}
      {viewMode === "table" && (
        <div className="bg-white rounded-2xl border border-[#E3E6E1] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F6F7F4] border-b border-[#E3E6E1] text-[#747A75] font-semibold">
                  <th className="py-3.5 px-4">Lead Contact</th>
                  <th className="py-3.5 px-4">Company & Interest</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4 text-right">Est. Value</th>
                  <th className="py-3.5 px-4">Owner</th>
                  <th className="py-3.5 px-4">Next Step</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E6E1]">
                {paginatedLeads.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-xs text-[#747A75]">
                      No sample leads found matching the selected filters.
                    </td>
                  </tr>
                ) : (
                  paginatedLeads.map((lead) => (
                    <tr
                      key={lead.id}
                      className="hover:bg-[#F6F7F4]/60 transition-colors group cursor-pointer"
                      onClick={() => setSelectedLead(lead)}
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#252925]">{lead.fullName}</div>
                        <div className="text-[11px] text-[#747A75]">{lead.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-[#252925]">{lead.companyName}</div>
                        <div className="text-[11px] text-[#747A75] max-w-[200px] truncate">
                          {lead.interestedService}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={lead.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => updateLeadStatus(lead.id, e.target.value as LeadStatus)}
                          className="px-2 py-1 rounded-md text-[11px] font-semibold bg-[#E5F0EB] text-[#2F806A] border border-[#2F806A]/20 cursor-pointer focus:outline-none"
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Qualified">Qualified</option>
                          <option value="Proposal">Proposal</option>
                          <option value="Won">Won</option>
                          <option value="Lost">Lost</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            lead.priority === "High"
                              ? "bg-[#FFF0E6] text-[#D9534F]"
                              : lead.priority === "Medium"
                              ? "bg-[#FFF8E6] text-[#DDA34B]"
                              : "bg-[#F0F2F0] text-[#747A75]"
                          }`}
                        >
                          {lead.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-[#2F806A]">
                        ${lead.estimatedValue.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-[#252925] text-[11px]">
                        {lead.assignedOwner.split(" ")[0]}
                      </td>
                      <td className="py-3 px-4 text-[#747A75] text-[11px]">
                        {lead.nextFollowUpAt}
                      </td>
                      <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedLead(lead)}
                            className="p-1 text-[#747A75] hover:text-[#252925] rounded transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedLead(lead);
                              setIsEditing(true);
                              setEditForm(lead);
                            }}
                            className="p-1 text-[#747A75] hover:text-[#2F806A] rounded transition-colors"
                            title="Edit Lead"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete lead ${lead.fullName}?`)) {
                                deleteLead(lead.id);
                              }
                            }}
                            className="p-1 text-[#747A75] hover:text-red-600 rounded transition-colors"
                            title="Delete Lead"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="px-4 py-3 bg-[#F6F7F4] border-t border-[#E3E6E1] flex items-center justify-between text-xs text-[#747A75]">
              <div>
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1 rounded-md bg-white border border-[#E3E6E1] disabled:opacity-40 font-semibold"
                >
                  Previous
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-2.5 py-1 rounded-md bg-white border border-[#E3E6E1] disabled:opacity-40 font-semibold"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Kanban Pipeline View */}
      {viewMode === "kanban" && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto pb-4">
          {KANBAN_STAGES.map((stage) => {
            const stageLeads = filteredLeads.filter((l) => l.status === stage);
            const stageValue = stageLeads.reduce((s, l) => s + l.estimatedValue, 0);

            return (
              <div
                key={stage}
                className="bg-[#F6F7F4] rounded-2xl p-3 border border-[#E3E6E1] flex flex-col min-w-[220px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#E3E6E1]">
                  <div>
                    <h3 className="text-xs font-bold text-[#252925]">{stage}</h3>
                    <div className="text-[10px] text-[#747A75]">
                      ${stageValue >= 1000 ? `${(stageValue / 1000).toFixed(0)}k` : stageValue}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-[#252925] border border-[#E3E6E1]">
                    {stageLeads.length}
                  </span>
                </div>

                {/* Cards List */}
                <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[650px] pr-1">
                  {stageLeads.length === 0 ? (
                    <div className="py-8 text-center text-[11px] text-[#747A75] border border-dashed border-[#E3E6E1] rounded-xl">
                      Empty stage
                    </div>
                  ) : (
                    stageLeads.map((lead) => (
                      <div
                        key={lead.id}
                        onClick={() => setSelectedLead(lead)}
                        className="bg-white p-3 rounded-xl border border-[#E3E6E1] shadow-2xs hover:shadow-sm hover:border-[#2F806A]/40 transition-all cursor-pointer group"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-xs font-bold text-[#252925] group-hover:text-[#2F806A] transition-colors line-clamp-1">
                            {lead.fullName}
                          </span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-bold shrink-0 ${
                              lead.priority === "High"
                                ? "bg-[#FFF0E6] text-[#D9534F]"
                                : "bg-[#F0F2F0] text-[#747A75]"
                            }`}
                          >
                            {lead.priority}
                          </span>
                        </div>

                        <div className="text-[11px] text-[#747A75] truncate mt-0.5">
                          {lead.companyName}
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-[#E3E6E1]/60 flex items-center justify-between text-[11px]">
                          <span className="font-extrabold text-[#2F806A]">
                            ${lead.estimatedValue.toLocaleString()}
                          </span>

                          {/* Quick stage advance control for accessibility */}
                          <select
                            value={lead.status}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => updateLeadStatus(lead.id, e.target.value as LeadStatus)}
                            className="text-[10px] bg-[#F6F7F4] border border-[#E3E6E1] rounded px-1.5 py-0.5 text-[#252925] focus:outline-none"
                            aria-label="Change lead stage"
                          >
                            {KANBAN_STAGES.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Lead Details & Activity Timeline Drawer */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white h-full shadow-2xl border-l border-[#E3E6E1] flex flex-col animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="px-6 py-4 bg-[#F6F7F4] border-b border-[#E3E6E1] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#252925]">{selectedLead.fullName}</h3>
                <div className="text-[11px] text-[#747A75]">
                  {selectedLead.jobTitle} · {selectedLead.companyName}
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedLead(null);
                  setIsEditing(false);
                }}
                className="p-1 rounded-md text-[#747A75] hover:text-[#252925]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              {/* Status and Priority badges */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#F6F7F4] border border-[#E3E6E1]">
                <div>
                  <div className="text-[10px] text-[#747A75] uppercase font-semibold">Stage</div>
                  <span className="font-bold text-[#2F806A]">{selectedLead.status}</span>
                </div>
                <div>
                  <div className="text-[10px] text-[#747A75] uppercase font-semibold">Priority</div>
                  <span className="font-bold text-[#DDA34B]">{selectedLead.priority}</span>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-[#747A75] uppercase font-semibold">Est. Deal</div>
                  <span className="font-bold text-[#252925]">${selectedLead.estimatedValue.toLocaleString()}</span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2">
                <div className="font-bold text-[#252925]">Contact Information</div>
                <div className="space-y-1.5 text-[#555C56]">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-[#747A75]" />
                    <span>{selectedLead.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-[#747A75]" />
                    <span>{selectedLead.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5 text-[#747A75]" />
                    <span>{selectedLead.companyName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-[#747A75]" />
                    <span>Next Follow-up: {selectedLead.nextFollowUpAt}</span>
                  </div>
                </div>
              </div>

              {/* Requirement Notes */}
              <div>
                <div className="font-bold text-[#252925] mb-1">Scope & Discovery Notes</div>
                <p className="p-3 bg-[#F6F7F4] rounded-xl text-[#555C56] leading-relaxed border border-[#E3E6E1]">
                  {selectedLead.notes}
                </p>
              </div>

              {/* Quick Status Update Selector */}
              <div>
                <label className="block text-xs font-semibold text-[#252925] mb-1.5">
                  Update Lead Stage:
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {KANBAN_STAGES.map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        updateLeadStatus(selectedLead.id, s);
                        setSelectedLead({ ...selectedLead, status: s });
                      }}
                      className={`py-1.5 px-2 rounded-lg text-center font-semibold text-[11px] border transition-colors ${
                        selectedLead.status === s
                          ? "bg-[#2F806A] text-white border-[#2F806A]"
                          : "bg-white text-[#252925] border-[#E3E6E1] hover:bg-[#F6F7F4]"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-[#E3E6E1] bg-[#F6F7F4] flex items-center justify-between">
              <button
                onClick={() => {
                  if (window.confirm(`Delete lead ${selectedLead.fullName}?`)) {
                    deleteLead(selectedLead.id);
                    setSelectedLead(null);
                  }
                }}
                className="text-xs font-semibold text-red-600 hover:underline"
              >
                Delete Lead
              </button>
              <button
                onClick={() => setSelectedLead(null)}
                className="px-4 py-2 bg-[#252925] hover:bg-black text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
