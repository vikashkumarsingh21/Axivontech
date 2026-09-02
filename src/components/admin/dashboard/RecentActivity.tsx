import {
  Briefcase,
  FileText,
  Mail,
  GraduationCap,
  Settings,
  type LucideIcon,
} from "lucide-react";
import Card from "@/components/ui/Card";

type ActivityStatus = "success" | "pending" | "info";

interface ActivityItem {
  title: string;
  description: string;
  time: string;
  icon: LucideIcon;
  status: ActivityStatus;
}

const STATUS_DOT: Record<ActivityStatus, string> = {
  success: "bg-[#C08457]",
  pending: "bg-[#B7BDC7]",
  info: "bg-[#6B7280]",
};

const ACTIVITY_ITEMS: ActivityItem[] = [
  {
    title: "New Portfolio Project Added",
    description: "A new project was added to the portfolio showcase.",
    time: "15 minutes ago",
    icon: Briefcase,
    status: "success",
  },
  {
    title: "Blog Published",
    description: "A new article was published on the website blog.",
    time: "1 hour ago",
    icon: FileText,
    status: "success",
  },
  {
    title: "Contact Lead Received",
    description: "A new inquiry was submitted through the contact form.",
    time: "3 hours ago",
    icon: Mail,
    status: "info",
  },
  {
    title: "Career Application Submitted",
    description: "A candidate applied for an open position.",
    time: "5 hours ago",
    icon: GraduationCap,
    status: "pending",
  },
  {
    title: "Website Settings Updated",
    description: "Global site configuration was modified.",
    time: "Yesterday",
    icon: Settings,
    status: "info",
  },
];

export default function RecentActivity() {
  return (
    <Card
      header="Recent Activity"
      description="Latest activities across the platform."
    >
      <ul className="flex flex-col divide-y divide-[#2B323D]">
        {ACTIVITY_ITEMS.map(({ title, description, time, icon: Icon, status }) => (
          <li
            key={title}
            className="flex items-start gap-3 py-4 first:pt-0 last:pb-0"
          >
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#2B323D] bg-[#0F1115]">
              <Icon size={16} className="text-[#C08457]" />
              <span
                className={`absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#1B212A] ${STATUS_DOT[status]}`}
              />
            </div>

            <div className="flex flex-1 flex-col gap-0.5">
              <span className="text-sm font-medium text-white">{title}</span>
              <span className="text-xs text-[#B7BDC7]">{description}</span>
              <span className="text-xs text-[#B7BDC7]">{time}</span>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

