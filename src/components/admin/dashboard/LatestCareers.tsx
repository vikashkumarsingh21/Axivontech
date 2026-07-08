import { Briefcase } from "lucide-react";
import Card from "@/components/ui/Card";

type ApplicationStatus = "New" | "Shortlisted" | "Interview" | "Rejected";

interface CareerApplication {
  name: string;
  position: string;
  experience: string;
  time: string;
  status: ApplicationStatus;
}

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  New: "bg-[#C08457]/15 text-[#C08457] border-[#C08457]/30",
  Shortlisted: "bg-[#3B9B6D]/15 text-[#3B9B6D] border-[#3B9B6D]/30",
  Interview: "bg-[#B7BDC7]/10 text-[#B7BDC7] border-[#2B323D]",
  Rejected: "bg-[#B34747]/15 text-[#B34747] border-[#B34747]/30",
};

const CAREER_APPLICATIONS: CareerApplication[] = [
  {
    name: "Ananya Iyer",
    position: "Frontend Developer",
    experience: "3 years",
    time: "20 minutes ago",
    status: "New",
  },
  {
    name: "Rohan Kapoor",
    position: "UI/UX Designer",
    experience: "5 years",
    time: "2 hours ago",
    status: "Shortlisted",
  },
  {
    name: "Meera Nair",
    position: "Backend Engineer",
    experience: "4 years",
    time: "6 hours ago",
    status: "Interview",
  },
  {
    name: "Devansh Rao",
    position: "Product Manager",
    experience: "6 years",
    time: "Yesterday",
    status: "Rejected",
  },
];

export default function LatestCareers() {
  return (
    <Card
      header="Latest Career Applications"
      description="Recent candidates who applied through the website."
    >
      <ul className="flex flex-col divide-y divide-[#2B323D]">
        {CAREER_APPLICATIONS.map(
          ({ name, position, experience, time, status }) => (
            <li
              key={name}
              className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#2B323D] bg-[#0F1115]">
                  <Briefcase size={16} className="text-[#C08457]" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-white">
                    {name}
                  </span>
                  <span className="text-xs text-[#B7BDC7]">{position}</span>
                  <span className="text-xs text-[#B7BDC7]">
                    {experience} experience
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-2">
                <span
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${STATUS_STYLES[status]}`}
                >
                  {status}
                </span>
                <span className="text-xs text-[#B7BDC7]">{time}</span>
              </div>
            </li>
          )
        )}
      </ul>
    </Card>
  );
}