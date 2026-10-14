// src/app/demo-projects/saas/leadpilot/settings/page.tsx
"use client";

import React, { useState } from "react";
import {
  Settings,
  RotateCcw,
  ShieldCheck,
  User,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react";
import { useLeadPilot } from "@/context/LeadPilotContext";

export default function LeadPilotSettingsPage() {
  const { resetDemoData, leads, deals, tasks, contacts, companies } = useLeadPilot();
  const [resetSuccess, setResetSuccess] = useState(false);
  const [profileName, setProfileName] = useState("Alex Rivera");
  const [profileEmail, setProfileEmail] = useState("alex.rivera@leadpilot-demo.com");
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [taskReminders, setTaskReminders] = useState(true);

  const handleReset = () => {
    if (
      window.confirm(
        "Are you sure you want to reset all LeadPilot demonstration records to initial factory data? Any leads, contacts, or deals you created locally will be restored."
      )
    ) {
      resetDemoData();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 4000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-150">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#252925]">
          Workspace Settings & Demo Controls
        </h1>
        <p className="mt-0.5 text-xs text-[#747A75]">
          Simulated user preferences, data controls, and portfolio demonstration disclosures.
        </p>
      </div>

      {resetSuccess && (
        <div className="p-4 rounded-xl bg-[#E5F0EB] border border-[#2F806A]/30 text-xs text-[#2F806A] flex items-center gap-2 font-semibold">
          <CheckCircle2 className="h-4 w-4" />
          <span>Demo dataset successfully reset to initial default records!</span>
        </div>
      )}

      {/* 1. Profile Settings */}
      <div className="bg-white p-6 rounded-2xl border border-[#E3E6E1] shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#E3E6E1]">
          <User className="h-4 w-4 text-[#2F806A]" />
          <h2 className="text-sm font-bold text-[#252925]">Active Demo Representative Profile</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-[#252925] mb-1">Display Name</label>
            <input
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className="w-full px-3 py-2 border border-[#E3E6E1] rounded-lg text-[#252925] focus:outline-none focus:ring-1 focus:ring-[#2F806A]"
            />
          </div>
          <div>
            <label className="block font-semibold text-[#252925] mb-1">Account Email</label>
            <input
              type="email"
              value={profileEmail}
              onChange={(e) => setProfileEmail(e.target.value)}
              className="w-full px-3 py-2 border border-[#E3E6E1] rounded-lg text-[#252925] focus:outline-none focus:ring-1 focus:ring-[#2F806A]"
            />
          </div>
        </div>
        <p className="text-[11px] text-[#747A75]">
          User profile is scoped to this demonstration session.
        </p>
      </div>

      {/* 2. Workspace Preferences */}
      <div className="bg-white p-6 rounded-2xl border border-[#E3E6E1] shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#E3E6E1]">
          <Sliders className="h-4 w-4 text-[#2F806A]" />
          <h2 className="text-sm font-bold text-[#252925]">Interface Preferences</h2>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-[#252925]">Table Row Spacing</div>
              <div className="text-[11px] text-[#747A75]">Controls density of lead and deals data tables</div>
            </div>
            <select
              value={density}
              onChange={(e) => setDensity(e.target.value as any)}
              className="px-3 py-1.5 border border-[#E3E6E1] rounded-lg bg-white"
            >
              <option value="comfortable">Comfortable</option>
              <option value="compact">Compact</option>
            </select>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#E3E6E1]/50">
            <div>
              <div className="font-semibold text-[#252925]">Simulated Notification Badges</div>
              <div className="text-[11px] text-[#747A75]">Display due follow-ups and unread alerts in topbar</div>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="h-4 w-4 accent-[#2F806A]"
            />
          </div>
        </div>
      </div>

      {/* 3. Demo Data Controls */}
      <div className="bg-white p-6 rounded-2xl border border-[#E3E6E1] shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#E3E6E1]">
          <RotateCcw className="h-4 w-4 text-[#DDA34B]" />
          <h2 className="text-sm font-bold text-[#252925]">Reset Demonstration Records</h2>
        </div>

        <p className="text-xs text-[#555C56] leading-relaxed">
          LeadPilot stores your interactive changes (new leads, custom deals, scheduled tasks, stage changes)
          in browser localStorage. If you wish to restore the pristine starting dataset of sample accounts
          and pipeline deals, you can reset below.
        </p>

        <div className="p-3 bg-[#F6F7F4] rounded-xl border border-[#E3E6E1] text-[11px] text-[#747A75] flex items-center justify-between">
          <span>Current in-memory records:</span>
          <span className="font-semibold text-[#252925]">
            {leads.length} Leads · {deals.length} Deals · {tasks.length} Tasks · {contacts.length} Contacts
          </span>
        </div>

        <div>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-[#DDA34B] hover:bg-[#c6913e] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Restore Default Sample Dataset</span>
          </button>
        </div>
      </div>

      {/* 4. Portfolio Demonstration Disclosure */}
      <div className="p-5 rounded-2xl bg-[#F6F7F4] border border-[#E3E6E1] text-xs text-[#747A75] space-y-2">
        <div className="flex items-center gap-2 font-bold text-[#252925]">
          <ShieldCheck className="h-4 w-4 text-[#2F806A]" />
          <span>Axivon Technologies Portfolio Disclaimer</span>
        </div>
        <p className="leading-relaxed">
          LeadPilot is an interactive architectural portfolio demonstration engineered by Axivon Technologies.
          All names, telephone numbers, emails, companies, and financial deal values are simulated mock data.
          No real customer information is collected, processed, or transmitted to any external CRM backend.
        </p>
      </div>
    </div>
  );
}
