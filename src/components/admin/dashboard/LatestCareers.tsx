"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Briefcase, ChevronRight, Loader2, Users } from "lucide-react";
import Card from "@/components/ui/Card";

interface ApplicationItem {
  id: string;
  fullName: string;
  jobTitle: string;
  experience?: string | null;
  createdAt: string;
  status: string;
}

const STATUS_STYLES: Record<string, string> = {
  NEW: "bg-[#D6B779]/15 text-[#D6B779] border-[#D6B779]/30",
  UNDER_REVIEW: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  SHORTLISTED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  INTERVIEW: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  SELECTED: "bg-green-500/15 text-green-400 border-green-500/30",
  REJECTED: "bg-rose-500/15 text-rose-400 border-rose-500/30",
};

export default function LatestCareers() {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecent() {
      try {
        const res = await fetch("/api/v1/admin/careers/applications?limit=5");
        if (res.ok) {
          const data = await res.json();
          setApplications(data.applications || []);
        }
      } catch (e) {
        // Fallback
      } finally {
        setLoading(false);
      }
    }
    loadRecent();
  }, []);

  return (
    <Card
      header="Latest Career Applications"
      description="Recent candidates who applied through the website."
    >
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
        </div>
      ) : applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Users className="w-8 h-8 text-[#566171] mb-2" />
          <p className="text-xs text-[#7E8997]">No candidate applications received yet.</p>
          <Link
            href="/admin/careers"
            className="text-[11px] text-emerald-400 hover:underline mt-2 font-medium"
          >
            Manage Open Positions →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <ul className="flex flex-col divide-y divide-[#2B323D]">
            {applications.map((app) => (
              <li
                key={app.id}
                className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#2B323D] bg-[#0F1115]">
                    <Briefcase size={15} className="text-emerald-400" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-semibold text-white">{app.fullName}</span>
                    <span className="text-xs text-[#B7BDC7]">{app.jobTitle}</span>
                    {app.experience && (
                      <span className="text-[10px] text-[#7E8997]">{app.experience}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1.5">
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${
                      STATUS_STYLES[app.status] || STATUS_STYLES.NEW
                    }`}
                  >
                    {app.status}
                  </span>
                  <span className="text-[10px] text-[#7E8997]">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <div className="pt-2 border-t border-[#2B323D] flex justify-end">
            <Link
              href="/admin/careers/applications"
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              View All Applications <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </Card>
  );
}
