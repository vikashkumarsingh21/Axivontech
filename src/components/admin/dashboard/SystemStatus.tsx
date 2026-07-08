import Card from "@/components/ui/Card";

type ServiceStatus = "Online" | "Warning" | "Offline";

interface SystemService {
  name: string;
  status: ServiceStatus;
}

const STATUS_DOT: Record<ServiceStatus, string> = {
  Online: "bg-[#3B9B6D]",
  Warning: "bg-[#C08457]",
  Offline: "bg-[#B34747]",
};

const STATUS_BADGE: Record<ServiceStatus, string> = {
  Online: "bg-[#3B9B6D]/15 text-[#3B9B6D] border-[#3B9B6D]/30",
  Warning: "bg-[#C08457]/15 text-[#C08457] border-[#C08457]/30",
  Offline: "bg-[#B34747]/15 text-[#B34747] border-[#B34747]/30",
};

const SYSTEM_SERVICES: SystemService[] = [
  { name: "Website", status: "Online" },
  { name: "API Server", status: "Online" },
  { name: "Database", status: "Online" },
  { name: "Email Service", status: "Warning" },
  { name: "Storage", status: "Offline" },
];

export default function SystemStatus() {
  return (
    <Card
      header="System Status"
      description="Current health of platform services."
    >
      <ul className="flex flex-col divide-y divide-[#2B323D]">
        {SYSTEM_SERVICES.map(({ name, status }) => (
          <li
            key={name}
            className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0"
          >
            <div className="flex items-center gap-3">
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${STATUS_DOT[status]}`}
              />
              <span className="text-sm text-white">{name}</span>
            </div>

            <span
              className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${STATUS_BADGE[status]}`}
            >
              {status}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}