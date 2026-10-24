"use client";

import { useEffect, useState } from "react";
import { UserCheck, ShieldCheck, Crown } from "lucide-react";
import { AccountProfileSettings } from "@/components/portal/AccountProfileSettings";

export default function ExecutiveSettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "policies">("profile");
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/executive/settings")
      .then((r) => r.json())
      .then((d) => {
        setSettings(d.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#1E2530] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#D6B779]/10 text-[#D6B779] border border-[#D6B779]/20">
              <Crown className="w-3.5 h-3.5" />
              Executive Governance
            </span>
            <span className="text-xs font-mono text-[#566171]">AXIVON ONE OS</span>
          </div>
          <h1 className="text-2xl font-bold text-[#F3F5F7] tracking-tight">Executive Account &amp; Settings</h1>
          <p className="text-sm text-[#7E8997] mt-0.5">
            Manage your executive leadership profile, primary email verification, and company-wide governance policies.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-2 bg-[#10151B] p-1 rounded-xl border border-[#29313B]">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === "profile"
                ? "bg-[#1B222B] text-[#D6B779] shadow-xs"
                : "text-[#7E8997] hover:text-[#F3F5F7]"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            Executive Profile
          </button>
          <button
            onClick={() => setActiveTab("policies")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === "policies"
                ? "bg-[#1B222B] text-[#D6B779] shadow-xs"
                : "text-[#7E8997] hover:text-[#F3F5F7]"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Governance Policies
          </button>
        </div>
      </div>

      {activeTab === "profile" ? (
        <AccountProfileSettings portalTheme="executive" />
      ) : (
        <div className="bg-[#151A21] border border-[#29313B] rounded-2xl p-6 sm:p-7 space-y-4">
          <h2 className="text-base font-bold text-[#F3F5F7]">Company Policy Settings</h2>
          <p className="text-xs text-[#7E8997]">Organizational attendance windows and privileged session policies.</p>
          {loading ? (
            <p className="text-gray-500 text-xs">Loading organizational settings...</p>
          ) : (
            <div className="space-y-3 pt-2">
              <div className="p-4 bg-[#10151B] border border-[#29313B] rounded-xl flex justify-between items-center text-xs">
                <span className="text-[#F3F5F7] font-medium">Default Attendance Policy</span>
                <span className="text-amber-400 font-mono">Standard (09:00 - 18:00 IST)</span>
              </div>
              <div className="p-4 bg-[#10151B] border border-[#29313B] rounded-xl flex justify-between items-center text-xs">
                <span className="text-[#F3F5F7] font-medium">Privileged Session Timeout</span>
                <span className="text-amber-400 font-mono">30 Minutes</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
