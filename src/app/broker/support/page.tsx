"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  LifeBuoy,
  Plus,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Send,
  User,
  ShieldCheck,
  ChevronRight,
  Filter,
} from "lucide-react";
import { BrokerPageHeader } from "@/components/broker/BrokerPageHeader";
import { BrokerCard } from "@/components/broker/BrokerCard";
import { BrokerButton } from "@/components/broker/BrokerButton";
import { BrokerSkeletonTable } from "@/components/broker/BrokerSkeleton";
import { BrokerEmptyState } from "@/components/broker/BrokerEmptyState";
import { formatDateIN } from "@/components/broker/BrokerFormatters";

interface TicketMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: "BROKER" | "ADMIN" | "SUPPORT";
  message: string;
  createdAt: string;
}

interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  message: string;
  messages?: TicketMessage[];
  createdAt: string;
  updatedAt: string;
}

const CATEGORIES = [
  "Commission Settlement & TDS",
  "Lead Referral & Attribution",
  "Project Scoping & Feasibility",
  "Contract & SLA Execution",
  "Banking & Payout Account",
  "General Partnership Inquiry",
];

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

export default function BrokerSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  // New Ticket Modal
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [creatingTicket, setCreatingTicket] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [newSubject, setNewSubject] = useState("");
  const [newCategory, setNewCategory] = useState(CATEGORIES[0]);
  const [newPriority, setNewPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT">("MEDIUM");
  const [newMessage, setNewMessage] = useState("");

  // Reply state
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/broker/support");
      if (res.ok) {
        const json = await res.json();
        setTickets(json.data?.tickets || []);
      }
    } catch (e) {
      console.error("Failed to load support tickets", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Fetch ticket details with thread
  const handleSelectTicket = async (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    try {
      const res = await fetch(`/api/v1/broker/support/${ticket.id}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data?.ticket) {
          setSelectedTicket(json.data.ticket);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Create Ticket
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newSubject.trim()) {
      setFormError("Please enter a ticket subject.");
      return;
    }
    if (!newMessage.trim() || newMessage.length < 10) {
      setFormError("Please provide details (minimum 10 characters).");
      return;
    }

    try {
      setCreatingTicket(true);
      const res = await fetch("/api/v1/broker/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: newSubject.trim(),
          category: newCategory,
          priority: newPriority,
          message: newMessage.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || "Failed to submit ticket");
      }

      setIsNewModalOpen(false);
      setNewSubject("");
      setNewMessage("");
      fetchTickets();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setCreatingTicket(false);
    }
  };

  // Send Reply in Thread
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;

    try {
      setSendingReply(true);
      const res = await fetch(`/api/v1/broker/support/${selectedTicket.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyText.trim() }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || "Failed to post reply");
      }

      setReplyText("");
      handleSelectTicket(selectedTicket);
      fetchTickets();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <BrokerPageHeader
        title="Partner Support Desk"
        subtitle="Direct channel to Axivon executive partner operations, commercial disputes, and technical scoping."
        badge={
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#C2A878]/15 text-[#C2A878] border border-[#C2A878]/30">
            <LifeBuoy className="w-3.5 h-3.5" />
            Priority Partner Desk
          </span>
        }
        actions={
          <BrokerButton
            variant="primary"
            size="sm"
            onClick={() => {
              setFormError(null);
              setIsNewModalOpen(true);
            }}
            icon={<Plus className="w-4 h-4" />}
          >
            New Support Request
          </BrokerButton>
        }
      />

      {/* Ticket List Table */}
      {loading ? (
        <BrokerSkeletonTable rows={4} cols={5} />
      ) : tickets.length === 0 ? (
        <BrokerEmptyState
          type="notifications"
          title="No Support Tickets"
          description="Need assistance with a client referral, milestone clearance, or commercial policy? Submit a priority ticket."
          actionLabel="Submit First Request"
          onAction={() => setIsNewModalOpen(true)}
        />
      ) : (
        <BrokerCard noPadding className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0E1013] border-b border-[#1E232B] text-[#8B94A1] uppercase font-mono tracking-wider">
                <tr>
                  <th className="px-5 py-3 font-semibold">Ticket ID</th>
                  <th className="px-5 py-3 font-semibold">Subject & Category</th>
                  <th className="px-5 py-3 font-semibold">Priority</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Updated</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E232B] text-[#D0D4DC]">
                {tickets.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => handleSelectTicket(t)}
                    className="hover:bg-[#171A1F]/60 transition-colors cursor-pointer group"
                  >
                    <td className="px-5 py-3.5 font-mono text-[#C2A878] font-bold">{t.id}</td>

                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-[#E6E8EB] group-hover:text-[#C2A878] transition-colors truncate max-w-[260px]">
                        {t.subject}
                      </div>
                      <div className="text-[11px] text-[#8B94A1]">{t.category}</div>
                    </td>

                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          t.priority === "URGENT"
                            ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                            : t.priority === "HIGH"
                            ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                            : "bg-[#171A1F] text-[#8B94A1] border border-[#22262D]"
                        }`}
                      >
                        {t.priority}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          t.status === "RESOLVED" || t.status === "CLOSED"
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : "bg-[#C2A878]/15 text-[#C2A878] border border-[#C2A878]/30"
                        }`}
                      >
                        {t.status.replace(/_/g, " ")}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-[#8B94A1] whitespace-nowrap">
                      {formatDateIN(t.updatedAt || t.createdAt)}
                    </td>

                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <button className="text-xs text-[#C2A878] hover:text-[#D4BC8B] font-medium inline-flex items-center gap-1">
                        <span>Thread</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </BrokerCard>
      )}

      {/* THREAD DETAIL DRAWER */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedTicket(null)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-lg bg-[#111317] border-l border-[#22262D] text-[#E6E8EB] shadow-2xl flex flex-col">
              {/* Header */}
              <div className="px-6 py-5 border-b border-[#1E232B] flex items-center justify-between bg-[#0E1013]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#C2A878]">
                      {selectedTicket.id}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#171A1F] border border-[#22262D] text-[#8B94A1]">
                      {selectedTicket.category}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[#E6E8EB] mt-1">{selectedTicket.subject}</h3>
                </div>

                <button
                  onClick={() => setSelectedTicket(null)}
                  className="p-1 rounded text-[#8B94A1] hover:text-[#E6E8EB]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Messages Thread */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
                {/* Initial Ticket Statement */}
                <div className="p-4 rounded-xl bg-[#0E1013] border border-[#22262D] space-y-2">
                  <div className="flex justify-between text-[#8B94A1]">
                    <span className="font-semibold text-[#E6E8EB]">You (Initial Request)</span>
                    <span className="font-mono">{formatDateIN(selectedTicket.createdAt)}</span>
                  </div>
                  <p className="text-[#D0D4DC] leading-relaxed whitespace-pre-line">
                    {selectedTicket.message}
                  </p>
                </div>

                {/* Additional Thread Messages */}
                {selectedTicket.messages && selectedTicket.messages.length > 0 ? (
                  selectedTicket.messages.map((msg) => {
                    const isAdmin = msg.senderRole === "ADMIN" || msg.senderRole === "SUPPORT";

                    return (
                      <div
                        key={msg.id}
                        className={`p-4 rounded-xl border space-y-1.5 ${
                          isAdmin
                            ? "bg-[#C2A878]/10 border-[#C2A878]/30 ml-4"
                            : "bg-[#171A1F] border-[#22262D] mr-4"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`font-semibold ${
                              isAdmin ? "text-[#C2A878]" : "text-[#E6E8EB]"
                            }`}
                          >
                            {isAdmin ? "Axivon Partner Operations" : "You"}
                          </span>
                          <span className="text-[10px] text-[#566171] font-mono">
                            {formatDateIN(msg.createdAt)}
                          </span>
                        </div>
                        <p className="text-[#D0D4DC] leading-relaxed whitespace-pre-line">
                          {msg.message}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6 text-xs text-[#566171]">
                    Our operations team typically responds within 4 business hours.
                  </div>
                )}
              </div>

              {/* Reply Input Box */}
              <form onSubmit={handleSendReply} className="p-4 border-t border-[#1E232B] bg-[#0E1013] space-y-3">
                <textarea
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your response to partner operations..."
                  className="w-full px-3 py-2 rounded-lg bg-[#171A1F] border border-[#22262D] text-xs text-[#E6E8EB] placeholder-[#566171] focus:outline-none focus:border-[#C2A878] leading-relaxed"
                />

                <div className="flex justify-end">
                  <BrokerButton
                    type="submit"
                    variant="primary"
                    size="sm"
                    loading={sendingReply}
                    disabled={!replyText.trim()}
                    icon={<Send className="w-3.5 h-3.5" />}
                  >
                    Post Reply
                  </BrokerButton>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* CREATE TICKET MODAL */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
              onClick={() => setIsNewModalOpen(false)}
            />

            <div className="relative bg-[#111317] border border-[#22262D] rounded-xl max-w-lg w-full p-6 text-xs text-[#E6E8EB] space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#1E232B] pb-3">
                <div>
                  <h3 className="text-sm font-bold">New Priority Support Request</h3>
                  <p className="text-[11px] text-[#8B94A1]">
                    Assigned directly to executive partner operations.
                  </p>
                </div>
                <button
                  onClick={() => setIsNewModalOpen(false)}
                  className="p-1 rounded text-[#8B94A1] hover:text-[#E6E8EB]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {formError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#8B94A1] mb-1">
                    Subject <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="e.g. UTR inquiry for project PRJ-20261024-0001"
                    className="w-full px-3 py-1.5 rounded-lg bg-[#171A1F] border border-[#22262D] text-xs text-[#E6E8EB] focus:outline-none focus:border-[#C2A878]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#8B94A1] mb-1">
                      Category <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#171A1F] border border-[#22262D] text-xs text-[#E6E8EB] focus:outline-none focus:border-[#C2A878]"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#8B94A1] mb-1">
                      Urgency / Priority
                    </label>
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value as any)}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#171A1F] border border-[#22262D] text-xs text-[#E6E8EB] focus:outline-none focus:border-[#C2A878]"
                    >
                      {PRIORITIES.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#8B94A1] mb-1">
                    Detailed Message <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Provide relevant project codes, client details, or banking queries..."
                    className="w-full px-3 py-2 rounded-lg bg-[#171A1F] border border-[#22262D] text-xs text-[#E6E8EB] placeholder-[#566171] focus:outline-none focus:border-[#C2A878] leading-relaxed"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#1E232B]">
                  <BrokerButton
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsNewModalOpen(false)}
                  >
                    Cancel
                  </BrokerButton>

                  <BrokerButton
                    type="submit"
                    variant="primary"
                    size="sm"
                    loading={creatingTicket}
                  >
                    Submit Ticket
                  </BrokerButton>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
