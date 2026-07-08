import { Mail, Clock, type LucideIcon } from "lucide-react";
import Card from "@/components/ui/Card";

type LeadStatus = "New" | "In Progress" | "Closed";

interface ContactLead {
  name: string;
  email: string;
  subject: string;
  time: string;
  status: LeadStatus;
}

const STATUS_STYLES: Record<LeadStatus, string> = {
  New: "bg-[#C08457]/15 text-[#C08457] border-[#C08457]/30",
  "In Progress": "bg-[#B7BDC7]/10 text-[#B7BDC7] border-[#2B323D]",
  Closed: "bg-[#1B212A] text-[#6B7280] border-[#2B323D]",
};

const CONTACT_LEADS: ContactLead[] = [
  {
    name: "Ritika Sharma",
    email: "ritika.sharma@example.com",
    subject: "Website Redesign Inquiry",
    time: "12 minutes ago",
    status: "New",
  },
  {
    name: "Arjun Mehta",
    email: "arjun.mehta@example.com",
    subject: "Mobile App Development",
    time: "1 hour ago",
    status: "In Progress",
  },
  {
    name: "Sophia Williams",
    email: "sophia.williams@example.com",
    subject: "SEO & Marketing Services",
    time: "3 hours ago",
    status: "New",
  },
  {
    name: "Karan Verma",
    email: "karan.verma@example.com",
    subject: "Enterprise Partnership",
    time: "Yesterday",
    status: "Closed",
  },
];

const MailIcon: LucideIcon = Mail;

export default function LatestContactLeads() {
  return (
    <Card
      header="Latest Contact Leads"
      description="Recent website inquiries"
    >
      <ul className="flex flex-col divide-y divide-[#2B323D]">
        {CONTACT_LEADS.map(({ name, email, subject, time, status }) => (
          <li
            key={email}
            className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#2B323D] bg-[#0F1115]">
                <MailIcon size={16} className="text-[#C08457]" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-white">
                  {name}
                </span>
                <span className="text-xs text-[#B7BDC7]">{email}</span>
                <span className="text-xs text-[#B7BDC7]">{subject}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-2">
              <span
                className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${STATUS_STYLES[status]}`}
              >
                {status}
              </span>
              <span className="flex items-center gap-1 text-xs text-[#B7BDC7]">
                <Clock size={12} />
                {time}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}