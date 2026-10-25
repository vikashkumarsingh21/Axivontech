"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  LifeBuoy,
  Search,
  Filter,
  RefreshCw,
  Send,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  ArrowLeft,
  ChevronRight,
  Shield,
} from "lucide-react";
import { format } from "date-fns";

export default function AdminPartnerSupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);

  // Reply state
  const [replyText, setReplyText] = useState("");
  const [replyStatus, setReplyStatus] = useState<string>("");
  const [submittingReply, setSubmittingReply] = useState(false);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (priorityFilter !== "ALL") params.set("priority", priorityFilter);
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/v1/admin/support/brokers?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets || []);
        // If a ticket is currently selected, update it
        if (selectedTicket) {
          const updated = (data.tickets || []).find((t: any) => t.id === selectedTicket.id);
          if (updated) setSelectedTicket(updated);
        }
      }
    } catch (e) {
      console.error("Failed to load tickets:", e);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, priorityFilter, search, selectedTicket?.id]);

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, priorityFilter]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || (!replyText.trim() && !replyStatus)) return;
    try {
      setSubmittingReply(true);
      const res = await fetch(`/api/v1/admin/support/brokers/${selectedTicket.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: replyText.trim() || undefined,
          status: replyStatus || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit reply");

      setReplyText("");
      setReplyStatus("");
      setSelectedTicket(data.ticket);
      fetchTickets();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmittingReply(false);
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "HIGH":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      case "LOW":
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
      default:
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "RESOLVED":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "CLOSED":
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
      case "IN_PROGRESS":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      default:
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <LifeBuoy className="w-6 h-6 text-red-500" /> Partner Support Desk
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            Resolve broker inquiries, payout queries, and partnership tickets.
          </p>
        </div>
        <button
          onClick={fetchTickets}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-white/10 bg-[#111] hover:bg-white/5 text-xs text-gray-300 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh Queue
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search tickets by ID, subject, or broker..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchTickets()}
            className="w-full bg-[#111] border border-white/10 rounded-lg p-2.5 pl-9 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#111] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500 w-full sm:w-40"
        >
          <option value="ALL">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="bg-[#111] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500 w-full sm:w-40"
        >
          <option value="ALL">All Priorities</option>
          <option value="URGENT">Urgent</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ticket List (Left Column) */}
        <div className="lg:col-span-5 space-y-3">
          {loading && tickets.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-xs">Loading support tickets...</div>
          ) : tickets.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-xs bg-[#111] border border-white/5 rounded-xl">
              No tickets found matching your filters.
            </div>
          ) : (
            tickets.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedTicket(t)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedTicket?.id === t.id
                    ? "bg-white/[0.06] border-red-500/50 shadow-lg"
                    : "bg-[#111] border-white/5 hover:border-white/15"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-red-400 font-bold">{t.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getPriorityBadge(t.priority)}`}>
                      {t.priority}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getStatusBadge(t.status)}`}>
                    {t.status.replace(/_/g, " ")}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-white mb-1 line-clamp-1">{t.subject}</h3>
                <p className="text-xs text-gray-400 line-clamp-2 mb-3">{t.message}</p>

                <div className="flex items-center justify-between text-[11px] text-gray-500 pt-2 border-t border-white/5">
                  <span className="text-gray-300 font-medium">{t.brokerName}</span>
                  <span>{format(new Date(t.updatedAt || t.createdAt), "MMM d, HH:mm")}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Ticket Thread & Reply Panel (Right Column) */}
        <div className="lg:col-span-7">
          {selectedTicket ? (
            <div className="bg-[#111] border border-white/10 rounded-xl p-6 space-y-6">
              {/* Ticket Meta Header */}
              <div className="pb-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-red-400 font-bold">{selectedTicket.id}</span>
                    <span className="text-xs text-gray-400">• {selectedTicket.category}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getPriorityBadge(selectedTicket.priority)}`}>
                      {selectedTicket.priority}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white mb-1">{selectedTicket.subject}</h2>
                  <p className="text-xs text-gray-400">
                    From: <span className="text-gray-200 font-medium">{selectedTicket.brokerName}</span> ({selectedTicket.brokerEmail})
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded text-xs font-bold border uppercase tracking-wider ${getStatusBadge(selectedTicket.status)}`}>
                    {selectedTicket.status}
                  </span>
                </div>
              </div>

              {/* Message History Thread */}
              <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                {(selectedTicket.replies || []).map((rep: any) => {
                  const isAdmin = rep.senderRole === "ADMIN";
                  return (
                    <div
                      key={rep.id}
                      className={`p-4 rounded-xl text-xs space-y-1.5 ${
                        isAdmin
                          ? "bg-red-500/10 border border-red-500/20 ml-6"
                          : "bg-[#0a0a0a] border border-white/5 mr-6"
                      }`}
                    >
                      <div className="flex items-center justify-between text-gray-400 mb-1">
                        <span className={`font-semibold ${isAdmin ? "text-red-300" : "text-white"}`}>
                          {rep.senderName} {isAdmin && " (Support Staff)"}
                        </span>
                        <span className="font-mono text-[10px] text-gray-500">
                          {rep.createdAt ? format(new Date(rep.createdAt), "MMM d, yyyy HH:mm") : ""}
                        </span>
                      </div>
                      <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">{rep.message}</p>
                    </div>
                  );
                })}
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="space-y-3 pt-3 border-t border-white/10">
                <textarea
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type official reply to partner..."
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500 resize-none"
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Update Status:</span>
                    <select
                      value={replyStatus}
                      onChange={(e) => setReplyStatus(e.target.value)}
                      className="bg-[#0a0a0a] border border-white/10 rounded p-1.5 text-xs text-white focus:outline-none"
                    >
                      <option value="">Keep {selectedTicket.status}</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReply || (!replyText.trim() && !replyStatus)}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold disabled:opacity-50 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {submittingReply ? "Submitting..." : "Send Reply"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-[#111] border border-white/5 rounded-xl p-12 text-center text-gray-500 text-xs">
              <MessageSquare className="w-10 h-10 mx-auto mb-3 text-gray-600" />
              Select a ticket from the left queue to view the thread and respond.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
