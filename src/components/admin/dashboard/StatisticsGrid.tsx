import {
  Briefcase,
  Wrench,
  GraduationCap,
  Mail,
  type LucideIcon,
} from "lucide-react";
import Card from "@/components/ui/Card";

interface StatisticItem {
  label: string;
  value: string;
  trend: string;
  icon: LucideIcon;
}

const STATISTICS: StatisticItem[] = [
  {
    label: "Projects",
    value: "42",
    trend: "+12% this month",
    icon: Briefcase,
  },
  {
    label: "Services",
    value: "18",
    trend: "+4% this month",
    icon: Wrench,
  },
  {
    label: "Career Applications",
    value: "126",
    trend: "+21% this month",
    icon: GraduationCap,
  },
  {
    label: "Contact Leads",
    value: "87",
    trend: "+9% this month",
    icon: Mail,
  },
];

export default function StatisticsGrid() {
  return (
    <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {STATISTICS.map(({ label, value, trend, icon: Icon }) => (
        <Card key={label}>
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-[#B7BDC7]">{label}</span>
              <span className="text-3xl font-semibold text-white">
                {value}
              </span>
              <span className="text-xs text-[#C08457]">{trend}</span>
            </div>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#2B323D] bg-[#0F1115]">
              <Icon size={20} className="text-[#C08457]" />
            </div>
          </div>
        </Card>
      ))}
    </section>
  );
}