"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/employee/PageHeader";
import { EpButton } from "@/components/employee/EpButton";
import { StatusBadge } from "@/components/employee/StatusBadge";
import { SkeletonCard } from "@/components/employee/SkeletonCard";
import {
  HelpCircle,
  Mail,
  ShieldAlert,
  Send,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Laptop,
  Users,
  CreditCard,
  FileQuestion,
  Headphones,
  PlusCircle,
  MessageSquare,
  Clock,
  RotateCcw,
  Check,
  XCircle,
} from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
  category: "ATTENDANCE" | "REPORTS" | "LEAVE" | "IT";
}

const FAQS: FAQItem[] = [
  {
    category: "ATTENDANCE",
    question: "What is the daily attendance check-in window?",
    answer:
      "Core working hours at Axivon Technologies begin between 09:00 AM and 10:00 AM. Check-ins after 10:00 AM are recorded with a late flag. If an unexpected commute delay occurs, submit an Attendance Regularization request with your manager's knowledge.",
  },
  {
    category: "ATTENDANCE",
    question: "How do attendance regularization requests work?",
    answer:
      "Regularization requests can be submitted via the Attendance page for past dates where check-in was missed due to client visits, technical issues, or authorized offsite work. Employees may submit up to 3 regularization requests per calendar month.",
  },
  {
    category: "REPORTS",
    question: "When are daily work reports expected?",
    answer:
      "Work reports must be submitted before logging out or by 08:30 PM daily. Reports can be updated at any point during the day if new milestones are achieved. Unsubmitted reports are flagged in weekly performance logs.",
  },
  {
    category: "LEAVE",
    question: "How far in advance should planned leaves be applied?",
    answer:
      "Planned casual leaves and PTO of 2 or more days should be submitted at least 48 hours in advance to allow workload handover. Emergency or sick leaves can be submitted on the day of absence.",
  },
  {
    category: "LEAVE",
    question: "Can I cancel a leave request after submitting it?",
    answer:
      "Yes, any leave request in 'PENDING' status can be cancelled directly with one click from the Leave Management page. Once approved, cancellations require HR coordination.",
  },
  {
    category: "IT",
    question: "How do I request software licenses or VPN access?",
    answer:
      "Submit a support ticket below selecting 'Technical Support & Access'. Specify the repository or license key required. IT will provision credentials within 4 business hours.",
  },
  {
    category: "IT",
    question: "How do I update my account password?",
    answer:
      "Navigate to Employee Profile -> Security section, or use Settings to change your password securely. Ensure passwords are at least 8 characters with numbers and special symbols.",
  },
];

interface TicketReply {
  id: string;
  message: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  };
}

interface SupportTicket {
  id: string;
  ticketNumber: string;
  category: string;
  priority: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
  assignedTo?: { id: string; name: string; email: string } | null;
  replies?: TicketReply[];
}

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState<"TICKETS" | "NEW_TICKET" | "FAQS">("TICKETS");
  const [activeFaqCategory, setActiveFaqCategory] = useState<string>("ALL");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Tickets data
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketCounts, setTicketCounts] = useState({ total: 0, open: 0, resolved: 0 });

  // Reply form state
  const [replyMessage, setReplyMessage] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  // New ticket form state
  const [category, setCategory] = useState("Technical Support");
  const [priority, setPriority] = useState<"LOW" | "NORMAL" | "HIGH" | "URGENT">("NORMAL");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadTickets = useCallback(async () => {
    try {
      setLoadingTickets(true);
      const res = await fetch("/api/v1/employee/support");
      const data = await res.json();
      if (data.success && Array.isArray(data.tickets)) {
        setTickets(data.tickets);
        if (data.meta?.counts) {
          setTicketCounts({
            total: data.meta.counts.total || 0,
            open: (data.meta.counts.open || 0) + (data.meta.counts.inProgress || 0),
            resolved: (data.meta.counts.resolved || 0) + (data.meta.counts.closed || 0),
          });
        }
      }
    } catch {
      // ignore
    } finally {
      setLoadingTickets(false);
    }
  }, []);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setErrorMsg("Subject and message are required.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const res = await fetch("/api/v1/employee/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim(),
          category,
          priority,
          message: message.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to log support ticket.");
      }

      setSuccessMsg(`Your inquiry has been registered as ${data.ticket?.ticketNumber || "ticket"}.`);
      setSubject("");
      setMessage("");
      loadTickets();
      setTimeout(() => {
        setActiveTab("TICKETS");
        setSuccessMsg(null);
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendReply = async (ticketId: string) => {
    if (!replyMessage.trim()) return;

    try {
      setSendingReply(true);
      const res = await fetch("/api/v1/employee/support/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId,
          message: replyMessage.trim(),
        }),
      });

      const data = await res.json();
      if (data.success && data.reply) {
        setReplyMessage("");
        setTickets((prev) =>
          prev.map((t) =>
            t.id === ticketId
              ? { ...t, replies: [...(t.replies || []), data.reply] }
              : t
          )
        );
        if (selectedTicket?.id === ticketId) {
          setSelectedTicket((prev) =>
            prev ? { ...prev, replies: [...(prev.replies || []), data.reply] } : null
          );
        }
      }
    } catch {
      // ignore
    } finally {
      setSendingReply(false);
    }
  };

  const handleToggleCloseTicket = async (ticketId: string, currentStatus: string) => {
    try {
      const action = currentStatus === "CLOSED" ? "REOPEN" : "CLOSE";
      const res = await fetch("/api/v1/employee/support", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, action }),
      });
      const data = await res.json();
      if (data.success && data.ticket) {
        setTickets((prev) =>
          prev.map((t) => (t.id === ticketId ? { ...t, status: data.ticket.status } : t))
        );
        if (selectedTicket?.id === ticketId) {
          setSelectedTicket((prev) => (prev ? { ...prev, status: data.ticket.status } : null));
        }
      }
    } catch {
      // ignore
    }
  };

  const filteredFaqs =
    activeFaqCategory === "ALL"
      ? FAQS
      : FAQS.filter((f) => f.category === activeFaqCategory);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6 max-w-7xl"
    >
      {/* Page Header */}
      <PageHeader
        title="Help & Support Center"
        subtitle="Track your support inquiries, contact administrative desks, and review company FAQs."
        icon={HelpCircle}
        action={
          <div className="flex items-center gap-2">
            <EpButton
              size="sm"
              variant={activeTab === "NEW_TICKET" ? "primary" : "outline"}
              onClick={() => setActiveTab("NEW_TICKET")}
              className="text-xs h-8 px-3"
            >
              <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
              <span>Create Ticket</span>
            </EpButton>
          </div>
        }
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-[#111317] border-[#1E2530] rounded-xl flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#5FA8A0]/10 border border-[#5FA8A0]/20 flex items-center justify-center text-[#5FA8A0] shrink-0">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-[#8B94A1]">Total Inquiries</div>
            <div className="text-xl font-bold text-[#E6E8EB]">{ticketCounts.total}</div>
          </div>
        </Card>

        <Card className="p-4 bg-[#111317] border-[#1E2530] rounded-xl flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-[#8B94A1]">Open / In Review</div>
            <div className="text-xl font-bold text-[#E6E8EB]">{ticketCounts.open}</div>
          </div>
        </Card>

        <Card className="p-4 bg-[#111317] border-[#1E2530] rounded-xl flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#34D399]/10 border border-[#34D399]/20 flex items-center justify-center text-[#34D399] shrink-0">
            <Check className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-[#8B94A1]">Resolved</div>
            <div className="text-xl font-bold text-[#E6E8EB]">{ticketCounts.resolved}</div>
          </div>
        </Card>

        <Card className="p-4 bg-[#111317] border-[#1E2530] rounded-xl flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#F87171]/10 border border-[#F87171]/20 flex items-center justify-center text-[#F87171] shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-[#8B94A1]">Emergency Helpline</div>
            <div className="text-xs font-mono font-bold text-[#F87171] mt-0.5">
              +91 (800) AXIVON-SOS
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1E2530] pb-2 text-xs">
        <button
          onClick={() => setActiveTab("TICKETS")}
          className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors ${
            activeTab === "TICKETS"
              ? "bg-[#5FA8A0]/15 text-[#5FA8A0] border border-[#5FA8A0]/30 font-semibold"
              : "text-[#8B94A1] hover:text-[#E6E8EB]"
          }`}
        >
          My Tickets ({tickets.length})
        </button>
        <button
          onClick={() => setActiveTab("NEW_TICKET")}
          className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors ${
            activeTab === "NEW_TICKET"
              ? "bg-[#5FA8A0]/15 text-[#5FA8A0] border border-[#5FA8A0]/30 font-semibold"
              : "text-[#8B94A1] hover:text-[#E6E8EB]"
          }`}
        >
          Submit Inquiries
        </button>
        <button
          onClick={() => setActiveTab("FAQS")}
          className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors ${
            activeTab === "FAQS"
              ? "bg-[#5FA8A0]/15 text-[#5FA8A0] border border-[#5FA8A0]/30 font-semibold"
              : "text-[#8B94A1] hover:text-[#E6E8EB]"
          }`}
        >
          Desk Channels & FAQs
        </button>
      </div>

      {/* TAB 1: TICKETS LIST & DETAIL */}
      {activeTab === "TICKETS" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ticket list */}
          <div className="lg:col-span-1 space-y-3">
            <div className="text-xs font-semibold text-[#8B94A1] uppercase tracking-wider px-1">
              Active & Past Tickets
            </div>
            {loadingTickets ? (
              <div className="space-y-3">
                <SkeletonCard rows={2} />
                <SkeletonCard rows={2} />
              </div>
            ) : tickets.length === 0 ? (
              <Card className="p-8 text-center bg-[#111317] border-[#1E2530] rounded-xl space-y-2">
                <Headphones className="w-8 h-8 text-[#566171] mx-auto" />
                <h4 className="text-sm font-semibold text-[#E6E8EB]">No tickets yet</h4>
                <p className="text-xs text-[#8B94A1]">
                  You have not raised any support inquiries yet.
                </p>
                <EpButton
                  size="sm"
                  variant="primary"
                  onClick={() => setActiveTab("NEW_TICKET")}
                  className="mt-2 text-xs"
                >
                  Create Your First Ticket
                </EpButton>
              </Card>
            ) : (
              tickets.map((t) => {
                const isSelected = selectedTicket?.id === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicket(t)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all space-y-2 ${
                      isSelected
                        ? "bg-[#171A1F] border-[#5FA8A0] shadow-sm ring-1 ring-[#5FA8A0]/30"
                        : "bg-[#111317] border-[#1E2530] hover:border-[#22262D]"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-[11px] text-[#5FA8A0] font-semibold">
                        {t.ticketNumber}
                      </span>
                      <StatusBadge status={t.status} />
                    </div>
                    <h4 className="text-xs sm:text-sm font-semibold text-[#E6E8EB] line-clamp-1">
                      {t.subject}
                    </h4>
                    <div className="flex items-center justify-between text-[11px] text-[#566171] pt-1">
                      <span>{t.category}</span>
                      <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Ticket Detail */}
          <div className="lg:col-span-2">
            {selectedTicket ? (
              <Card className="p-5 sm:p-6 bg-[#111317] border-[#1E2530] rounded-2xl space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1E2530]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#5FA8A0]">
                        {selectedTicket.ticketNumber}
                      </span>
                      <StatusBadge status={selectedTicket.status} />
                      <span className="text-xs px-2 py-0.5 rounded bg-[#171A1F] border border-[#22262D] text-[#8B94A1]">
                        {selectedTicket.priority}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-[#E6E8EB] mt-1.5">
                      {selectedTicket.subject}
                    </h3>
                  </div>

                  <EpButton
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleToggleCloseTicket(selectedTicket.id, selectedTicket.status)
                    }
                    className="text-xs h-8 px-3 shrink-0 self-start sm:self-auto"
                  >
                    {selectedTicket.status === "CLOSED" ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-[#5FA8A0]" />
                        <span>Reopen Ticket</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 mr-1.5 text-rose-400" />
                        <span>Close Ticket</span>
                      </>
                    )}
                  </EpButton>
                </div>

                {/* Original Message */}
                <div className="p-4 rounded-xl bg-[#0B0D10] border border-[#1E2530] space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#8B94A1]">
                    <span className="font-semibold text-[#E6E8EB]">Initial Request:</span>
                    <span>{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-[#8B94A1] whitespace-pre-wrap leading-relaxed">
                    {selectedTicket.message}
                  </p>
                </div>

                {/* Replies Thread */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#8B94A1] flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5 text-[#5FA8A0]" />
                    <span>Conversation ({selectedTicket.replies?.length || 0})</span>
                  </h4>

                  {selectedTicket.replies && selectedTicket.replies.length > 0 ? (
                    <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                      {selectedTicket.replies.map((r) => (
                        <div
                          key={r.id}
                          className="p-3 rounded-xl bg-[#171A1F] border border-[#22262D] space-y-1.5 text-xs"
                        >
                          <div className="flex items-center justify-between text-[11px] text-[#8B94A1]">
                            <span className="font-semibold text-[#5FA8A0]">
                              {r.user?.name || "Support Agent"}
                            </span>
                            <span>{new Date(r.createdAt).toLocaleString()}</span>
                          </div>
                          <p className="text-[#E6E8EB] leading-relaxed">{r.message}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#566171] italic">
                      No replies logged yet. Helpdesk team will acknowledge shortly.
                    </p>
                  )}

                  {/* Send Reply Box */}
                  {selectedTicket.status !== "CLOSED" && (
                    <div className="pt-2 flex gap-2">
                      <Input
                        placeholder="Type a message or response..."
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        className="bg-[#0B0D10] border-[#1E2530] text-[#E6E8EB] placeholder:text-[#566171] text-xs h-9"
                      />
                      <EpButton
                        size="sm"
                        variant="primary"
                        onClick={() => handleSendReply(selectedTicket.id)}
                        isLoading={sendingReply}
                        className="h-9 px-3 shrink-0 text-xs"
                      >
                        <Send className="w-3.5 h-3.5 mr-1.5" />
                        <span>Reply</span>
                      </EpButton>
                    </div>
                  )}
                </div>
              </Card>
            ) : (
              <Card className="p-12 text-center bg-[#111317] border-[#1E2530] rounded-2xl space-y-2">
                <MessageSquare className="w-8 h-8 text-[#566171] mx-auto" />
                <h4 className="text-sm font-semibold text-[#E6E8EB]">Select a ticket</h4>
                <p className="text-xs text-[#8B94A1]">
                  Click any ticket from the left column to view message thread and status updates.
                </p>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SUBMIT INQUIRY */}
      {activeTab === "NEW_TICKET" && (
        <div className="max-w-2xl mx-auto">
          <Card className="p-6 bg-[#111317] border-[#1E2530] rounded-2xl space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-[#1E2530]">
              <div className="w-9 h-9 rounded-xl bg-[#5FA8A0]/10 border border-[#5FA8A0]/20 flex items-center justify-center text-[#5FA8A0]">
                <Headphones className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#E6E8EB]">Submit an Internal Request</h2>
                <p className="text-xs text-[#8B94A1]">
                  Logged in administrative queues with automatic ticket acknowledgment.
                </p>
              </div>
            </div>

            {successMsg && (
              <div className="p-3 bg-[#34D399]/10 border border-[#34D399]/20 rounded-xl text-[#34D399] text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 bg-[#F87171]/10 border border-[#F87171]/20 rounded-xl text-[#F87171] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmitTicket} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#8B94A1] mb-1.5">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-10 px-3 bg-[#0B0D10] border border-[#1E2530] rounded-xl text-xs text-[#E6E8EB] focus:outline-none focus:border-[#5FA8A0]"
                  >
                    <option value="Technical Support">Technical Support & Access</option>
                    <option value="HR & Attendance">HR & Attendance Policies</option>
                    <option value="Payroll & Expenses">Payroll & Reimbursements</option>
                    <option value="General Inquiry">General Workplace Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#8B94A1] mb-1.5">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full h-10 px-3 bg-[#0B0D10] border border-[#1E2530] rounded-xl text-xs text-[#E6E8EB] focus:outline-none focus:border-[#5FA8A0]"
                  >
                    <option value="NORMAL">Normal Priority</option>
                    <option value="HIGH">High Priority</option>
                    <option value="URGENT">Urgent Block</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8B94A1] mb-1.5">
                  Subject <span className="text-[#F87171]">*</span>
                </label>
                <Input
                  placeholder="e.g. Need AWS Cloud Sandbox credentials for development"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className="bg-[#0B0D10] border-[#1E2530] text-[#E6E8EB] placeholder:text-[#566171] focus-visible:border-[#5FA8A0]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8B94A1] mb-1.5">
                  Detailed Message <span className="text-[#F87171]">*</span>
                </label>
                <textarea
                  rows={4}
                  className="w-full bg-[#0B0D10] border border-[#1E2530] rounded-xl p-3 text-xs text-[#E6E8EB] placeholder:text-[#566171] focus:outline-none focus:border-[#5FA8A0]"
                  placeholder="Explain the issue, error logs, or specific requirement in detail..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>

              <EpButton
                type="submit"
                variant="primary"
                isLoading={submitting}
                className="w-full text-xs h-10 font-semibold"
              >
                <Send className="w-4 h-4 mr-2" />
                <span>Submit Ticket</span>
              </EpButton>
            </form>
          </Card>
        </div>
      )}

      {/* TAB 3: CONTACT CHANNELS & FAQS */}
      {activeTab === "FAQS" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 bg-[#111317] border-[#1E2530] rounded-xl space-y-2">
              <div className="w-9 h-9 rounded-xl bg-[#5FA8A0]/10 border border-[#5FA8A0]/20 flex items-center justify-center text-[#5FA8A0]">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-[#E6E8EB]">HR & People Operations</h3>
              <p className="text-xs text-[#8B94A1]">Policy, onboarding, and workplace queries</p>
              <div className="text-xs font-mono text-[#5FA8A0] pt-1">hr@axivontech.in</div>
            </Card>

            <Card className="p-4 bg-[#111317] border-[#1E2530] rounded-xl space-y-2">
              <div className="w-9 h-9 rounded-xl bg-[#67C5D8]/10 border border-[#67C5D8]/20 flex items-center justify-center text-[#67C5D8]">
                <Laptop className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-[#E6E8EB]">IT & Technical Desk</h3>
              <p className="text-xs text-[#8B94A1]">VPN, email accounts, repository & laptop</p>
              <div className="text-xs font-mono text-[#67C5D8] pt-1">it-support@axivontech.in</div>
            </Card>

            <Card className="p-4 bg-[#111317] border-[#1E2530] rounded-xl space-y-2">
              <div className="w-9 h-9 rounded-xl bg-[#D6B779]/10 border border-[#D6B779]/20 flex items-center justify-center text-[#D6B779]">
                <CreditCard className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-[#E6E8EB]">Payroll & Finance</h3>
              <p className="text-xs text-[#8B94A1]">Salaries, tax receipts, and expense claims</p>
              <div className="text-xs font-mono text-[#D6B779] pt-1">finance@axivontech.in</div>
            </Card>

            <Card className="p-4 bg-[#111317] border-[#1E2530] rounded-xl space-y-2">
              <div className="w-9 h-9 rounded-xl bg-[#F87171]/10 border border-[#F87171]/20 flex items-center justify-center text-[#F87171]">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-[#E6E8EB]">Emergency Escalation</h3>
              <p className="text-xs text-[#8B94A1]">Immediate executive or security alerts</p>
              <div className="text-xs font-mono text-[#F87171] pt-1">+91 (800) AXIVON-SOS</div>
            </Card>
          </div>

          <Card className="p-5 sm:p-6 bg-[#111317] border-[#1E2530] rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1E2530]">
              <div className="flex items-center gap-2">
                <FileQuestion className="w-5 h-5 text-[#5FA8A0]" />
                <h2 className="text-base font-bold text-[#E6E8EB]">Frequently Asked Questions</h2>
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-1 text-[11px]">
                {["ALL", "ATTENDANCE", "REPORTS", "LEAVE", "IT"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveFaqCategory(cat)}
                    className={`px-2 py-1 rounded transition-colors ${
                      activeFaqCategory === cat
                        ? "bg-[#5FA8A0]/15 text-[#5FA8A0] font-semibold"
                        : "text-[#8B94A1] hover:text-[#E6E8EB]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5">
              {filteredFaqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="border border-[#1E2530] rounded-xl bg-[#0B0D10] overflow-hidden transition-all"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full p-3.5 flex items-center justify-between text-left text-xs sm:text-sm font-semibold text-[#E6E8EB] hover:text-[#5FA8A0] transition-colors"
                    >
                      <span>{faq.question}</span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-[#8B94A1] shrink-0 ml-2" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#8B94A1] shrink-0 ml-2" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="p-3.5 pt-1 text-xs text-[#8B94A1] border-t border-[#1E2530] leading-relaxed bg-[#111317]">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}
    </motion.div>
  );
}
