"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  HelpCircle,
  Mail,
  Phone,
  ShieldAlert,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Laptop,
  Users,
  CreditCard,
  FileQuestion,
  Headphones,
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

export default function SupportPage() {
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Form State
  const [category, setCategory] = useState("Technical Support");
  const [priority, setPriority] = useState("NORMAL");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
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

      setSuccessMsg("Your inquiry has been registered with HR & the IT Helpdesk.");
      setSubject("");
      setMessage("");
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredFaqs =
    activeCategory === "ALL"
      ? FAQS
      : FAQS.filter((f) => f.category === activeCategory);

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#F3F5F7] tracking-tight">
          Help & Support Center
        </h1>
        <p className="text-sm text-[#A7B0BC] mt-1">
          Direct contact channels, verified company FAQ guidelines, and internal ticket submission.
        </p>
      </div>

      {/* Contact Channels Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-[#151A21] border-[#29313B] rounded-xl space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Users className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-[#F3F5F7]">HR & People Operations</h3>
          <p className="text-xs text-[#7E8997]">Policy, onboarding, and workplace queries</p>
          <div className="text-xs font-mono text-emerald-400 pt-1">hr@axivontech.in</div>
        </Card>

        <Card className="p-4 bg-[#151A21] border-[#29313B] rounded-xl space-y-2">
          <div className="w-9 h-9 rounded-xl bg-[#67C5D8]/10 border border-[#67C5D8]/20 flex items-center justify-center text-[#67C5D8]">
            <Laptop className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-[#F3F5F7]">IT & Technical Desk</h3>
          <p className="text-xs text-[#7E8997]">VPN, email accounts, repository & laptop</p>
          <div className="text-xs font-mono text-[#67C5D8] pt-1">it-support@axivontech.in</div>
        </Card>

        <Card className="p-4 bg-[#151A21] border-[#29313B] rounded-xl space-y-2">
          <div className="w-9 h-9 rounded-xl bg-[#D6B779]/10 border border-[#D6B779]/20 flex items-center justify-center text-[#D6B779]">
            <CreditCard className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-[#F3F5F7]">Payroll & Finance</h3>
          <p className="text-xs text-[#7E8997]">Salaries, tax receipts, and expense claims</p>
          <div className="text-xs font-mono text-[#D6B779] pt-1">finance@axivontech.in</div>
        </Card>

        <Card className="p-4 bg-[#151A21] border-[#29313B] rounded-xl space-y-2">
          <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-[#F3F5F7]">Emergency Escalation</h3>
          <p className="text-xs text-[#7E8997]">Immediate executive or security alerts</p>
          <div className="text-xs font-mono text-rose-400 pt-1">+91 (800) AXIVON-SOS</div>
        </Card>
      </div>

      {/* Split section: Support Form (Left) & FAQs (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Support Ticket Submission */}
        <Card className="p-5 sm:p-6 bg-[#151A21] border-[#29313B] rounded-2xl space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-[#1E2530]">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#F3F5F7]">Submit an Internal Request</h2>
              <p className="text-xs text-[#7E8997]">
                Logged in administrative queues with automatic ticket acknowledgment.
              </p>
            </div>
          </div>

          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#A7B0BC] mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 px-3 bg-[#10151B] border border-[#29313B] rounded-lg text-xs text-[#F3F5F7] focus:outline-none focus:border-emerald-500"
                >
                  <option value="Technical Support">Technical Support & Access</option>
                  <option value="HR & Attendance">HR & Attendance Policies</option>
                  <option value="Payroll & Expenses">Payroll & Reimbursements</option>
                  <option value="General Inquiry">General Workplace Inquiry</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A7B0BC] mb-1.5">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full h-10 px-3 bg-[#10151B] border border-[#29313B] rounded-lg text-xs text-[#F3F5F7] focus:outline-none focus:border-emerald-500"
                >
                  <option value="NORMAL">Normal Priority</option>
                  <option value="HIGH">High Priority</option>
                  <option value="URGENT">Urgent Block</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A7B0BC] mb-1.5">
                Subject <span className="text-rose-400">*</span>
              </label>
              <Input
                placeholder="e.g. Need AWS Cloud Sandbox credentials for development"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="bg-[#10151B] border-[#29313B] text-[#F3F5F7] placeholder:text-[#566171] focus-visible:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A7B0BC] mb-1.5">
                Detailed Message <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={4}
                className="w-full bg-[#10151B] border border-[#29313B] rounded-xl p-3 text-xs text-[#F3F5F7] placeholder:text-[#566171] focus:outline-none focus:border-emerald-500"
                placeholder="Explain the issue, error logs, or specific requirement in detail..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-[#04130E] font-semibold flex items-center justify-center gap-2"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>Submit Ticket</span>
            </Button>
          </form>
        </Card>

        {/* FAQs */}
        <Card className="p-5 sm:p-6 bg-[#151A21] border-[#29313B] rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1E2530]">
            <div className="flex items-center gap-2">
              <FileQuestion className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-[#F3F5F7]">Frequently Asked Questions</h2>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1 text-[11px]">
              {["ALL", "ATTENDANCE", "REPORTS", "LEAVE", "IT"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2 py-1 rounded transition-colors ${
                    activeCategory === cat
                      ? "bg-emerald-500/15 text-emerald-400 font-semibold"
                      : "text-[#7E8997] hover:text-[#F3F5F7]"
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
                  className="border border-[#29313B] rounded-xl bg-[#10151B] overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-3.5 flex items-center justify-between text-left text-xs sm:text-sm font-semibold text-[#F3F5F7] hover:text-emerald-400"
                  >
                    <span>{faq.question}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-[#A7B0BC] shrink-0 ml-2" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#A7B0BC] shrink-0 ml-2" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="p-3.5 pt-1 text-xs text-[#A7B0BC] border-t border-[#1E2530] leading-relaxed bg-[#151A21]/40">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
