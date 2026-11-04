"use client";

import Link from "next/link";
import {
  User,
  Mail,
  Building,
  Briefcase,
  Calendar,
  Shield,
  FileText,
  Settings,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface MobileEmployeeProfileProps {
  user: any;
}

export function MobileEmployeeProfile({ user }: MobileEmployeeProfileProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/v1/auth/logout", { method: "POST" });
    } catch (e) {
      // Ignore
    }
    router.push("/login");
  };

  const initials =
    user?.name
      ?.split(" ")
      .filter(Boolean)
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "AX";

  return (
    <div className="space-y-4">
      {/* ── Profile Header Card ──────────────────────────────────────── */}
      <section className="rounded-2xl bg-[#1A1A1B] border border-[#2E2E30] p-5 shadow-sm text-center flex flex-col items-center">
        <div className="h-20 w-20 rounded-full bg-[#232324] border-2 border-[#4F9D83] flex items-center justify-center text-xl font-bold text-[#EDEBE6] mb-3 shadow-md">
          {initials}
        </div>
        <h2 className="text-lg font-bold text-[#EDEBE6]">{user?.name || "—"}</h2>
        <span className="text-xs text-[#B3AFA6] mt-0.5">{user?.email || "—"}</span>

        {(Boolean(user?.department) || Boolean(user?.designation)) && (
          <div className="flex items-center gap-2 mt-3">
            {Boolean(user?.department) && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#162721] text-[#A2D9C7] border border-[#27483C]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4F9D83]" />
                <span>{user.department}</span>
              </span>
            )}
            {Boolean(user?.designation) && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#232324] text-[#B3AFA6] border border-[#2E2E30]">
                <span>{user.designation}</span>
              </span>
            )}
          </div>
        )}
      </section>

      {/* ── Key Information List ─────────────────────────────────────── */}
      <section className="rounded-2xl bg-[#1A1A1B] border border-[#2E2E30] divide-y divide-[#242426] shadow-sm">
        <div className="flex items-center justify-between p-3.5">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-[#827E76]" />
            <span className="text-xs text-[#B3AFA6]">Work Email</span>
          </div>
          <span className="text-xs font-semibold text-[#EDEBE6] truncate max-w-[200px]">
            {user?.email || "—"}
          </span>
        </div>

        {Boolean(user?.employeeCode) && (
          <div className="flex items-center justify-between p-3.5">
            <div className="flex items-center gap-3">
              <Building className="h-4 w-4 text-[#827E76]" />
              <span className="text-xs text-[#B3AFA6]">Employee Code</span>
            </div>
            <span className="text-xs font-semibold text-[#EDEBE6] tabular-nums">
              {user.employeeCode}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between p-3.5">
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-[#827E76]" />
            <span className="text-xs text-[#B3AFA6]">Joining Date</span>
          </div>
          <span className="text-xs font-semibold text-[#EDEBE6]">
            {user?.createdAt
              ? new Date(user.createdAt).toLocaleDateString("en-IN", {
                  month: "short",
                  year: "numeric",
                })
              : "—"}
          </span>
        </div>
      </section>

      {/* ── Shortcut Actions ─────────────────────────────────────────── */}
      <section className="rounded-2xl bg-[#1A1A1B] border border-[#2E2E30] divide-y divide-[#242426] shadow-sm">
        <Link
          href="/employee/documents"
          className="flex items-center justify-between p-3.5 hover:bg-[#232324] active:bg-[#232324] transition-colors"
        >
          <div className="flex items-center gap-3">
            <FileText className="h-4 w-4 text-[#4F9D83]" />
            <span className="text-xs font-medium text-[#EDEBE6]">Company Documents & Letters</span>
          </div>
          <ChevronRight className="h-4 w-4 text-[#827E76]" />
        </Link>

        <Link
          href="/employee/settings"
          className="flex items-center justify-between p-3.5 hover:bg-[#232324] active:bg-[#232324] transition-colors"
        >
          <div className="flex items-center gap-3">
            <Settings className="h-4 w-4 text-[#D4A359]" />
            <span className="text-xs font-medium text-[#EDEBE6]">Preferences & Security</span>
          </div>
          <ChevronRight className="h-4 w-4 text-[#827E76]" />
        </Link>
      </section>

      {/* ── Logout Action ────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={handleLogout}
        className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-[#2A1515] border border-[#5A2424] text-[#F5A3A3] font-semibold text-xs hover:bg-[#381B1B] active:scale-98 transition-all"
      >
        <LogOut className="h-4 w-4" />
        <span>Log Out of Workplace App</span>
      </button>
    </div>
  );
}
