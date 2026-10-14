// src/app/demo-projects/saas/leadpilot/activities/page.tsx
"use client";

import React, { useState, useMemo } from "react";
import {
  Activity as ActivityIcon,
  Search,
  Filter,
  Phone,
  Calendar,
  FileText,
  Clock,
  CheckCircle2,
  Sparkles,
  Plus,
} from "lucide-react";
import { useLeadPilot } from "@/context/LeadPilotContext";
import { ActivityType } from "@/data/leadpilot-data";

export default function LeadPilotActivitiesPage() {
  const { activities, addActivity } = useLeadPilot();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  const [newLogOpen, setNewLogOpen] = useState(false);
  const [logForm, setLogForm] = useState({
    title: "",
    description: "",
    type: "Call" as ActivityType,
    performedBy: "Alex Rivera (Account Exec)",
  });

  const filteredActivities = useMemo(() => {
    let result = [...activities];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          (a.relatedCompanyName && a.relatedCompanyName.toLowerCase().includes(q))
      );
    }

    if (typeFilter !== "All") {
      result = result.filter((a) => a.type === typeFilter);
    }

    return result;
  }, [activities, searchQuery, typeFilter]);

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logForm.title.trim()) return;

    const todayIso = new Date().toISOString().split("T")[0];
    const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });

    addActivity({
      title: logForm.title.trim(),
      description: logForm.description.trim() || "Manual call/meeting logged by representative.",
      type: logForm.type,
      performedBy: logForm.performedBy,
      date: todayIso,
      time: currentTime,
    });

    setNewLogOpen(false);
    setLogForm({ title: "", description: "", type: "Call", performedBy: "Alex Rivera (Account Exec)" });
  };

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case "Call":
        return <Phone className="h-4 w-4 text-[#2F806A]" />;
      case "Meeting":
        return <Calendar className="h-4 w-4 text-[#2F806A]" />;
      case "Note":
        return <FileText className="h-4 w-4 text-[#DDA34B]" />;
      case "Status Change":
        return <CheckCircle2 className="h-4 w-4 text-[#2F806A]" />;
      default:
        return <Clock className="h-4 w-4 text-[#747A75]" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#252925]">
            Sales Activities & Audit Log
          </h1>
          <p className="mt-0.5 text-xs text-[#747A75]">
            Chronological audit trail of customer interactions, sales calls, meetings, and stage changes.
          </p>
        </div>

        <button
          onClick={() => setNewLogOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#2F806A] hover:bg-[#266b58] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Log Activity</span>
        </button>
      </div>

      {/* Manual Activity Log Modal */}
      {newLogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-[#E3E6E1]">
            <h3 className="text-sm font-bold text-[#252925] mb-3">Log Team Activity</h3>
            <form onSubmit={handleLogSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold mb-1">Activity Type</label>
                <select
                  value={logForm.type}
                  onChange={(e) => setLogForm({ ...logForm, type: e.target.value as ActivityType })}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  <option value="Call">Phone Call</option>
                  <option value="Meeting">Client Meeting</option>
                  <option value="Note">Internal Note</option>
                  <option value="Follow-up">Follow-up Communication</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Summary Title *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Discussed pricing tiers with client"
                  value={logForm.title}
                  onChange={(e) => setLogForm({ ...logForm, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Details & Outcomes</label>
                <textarea
                  rows={3}
                  placeholder="Key discussion points, customer blockers, agreed next steps..."
                  value={logForm.description}
                  onChange={(e) => setLogForm({ ...logForm, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setNewLogOpen(false)}
                  className="px-3 py-1.5 text-gray-500 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#2F806A] text-white rounded-lg font-semibold"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E3E6E1] shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#747A75]" />
          <input
            type="text"
            placeholder="Search activity records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#F6F7F4] border border-[#E3E6E1] rounded-lg text-xs text-[#252925] focus:outline-none focus:ring-1 focus:ring-[#2F806A]"
          />
        </div>

        <div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-3 py-2 bg-[#F6F7F4] border border-[#E3E6E1] rounded-lg text-xs text-[#252925] focus:outline-none focus:ring-1 focus:ring-[#2F806A]"
          >
            <option value="All">All Types</option>
            <option value="Call">Calls</option>
            <option value="Meeting">Meetings</option>
            <option value="Note">Notes</option>
            <option value="Status Change">Status Changes</option>
            <option value="Task Update">Task Updates</option>
          </select>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-2xl border border-[#E3E6E1] shadow-xs p-6">
        <div className="relative border-l-2 border-[#E3E6E1] ml-4 space-y-8">
          {filteredActivities.map((act) => (
            <div key={act.id} className="relative pl-6">
              {/* Timeline marker */}
              <div className="absolute -left-[17px] top-0.5 h-8 w-8 rounded-full bg-white border-2 border-[#2F806A] flex items-center justify-center">
                {getActivityIcon(act.type)}
              </div>

              <div>
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#252925]">{act.title}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#E5F0EB] text-[#2F806A]">
                      {act.type}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#747A75]">
                    {act.date} at {act.time}
                  </span>
                </div>

                <p className="mt-1 text-xs text-[#555C56] leading-relaxed">
                  {act.description}
                </p>

                <div className="mt-2 flex items-center gap-3 text-[10px] text-[#747A75]">
                  <span>Logged by: {act.performedBy}</span>
                  {act.relatedCompanyName && (
                    <span>Account: {act.relatedCompanyName}</span>
                  )}
                  {act.relatedLeadName && (
                    <span>Lead: {act.relatedLeadName}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
