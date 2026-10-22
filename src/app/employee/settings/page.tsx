"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ChangePasswordForm } from "@/components/employee/ChangePasswordForm";
import {
  Lock,
  Bell,
  Globe,
  Moon,
  ShieldCheck,
  CheckCircle2,
  Smartphone,
  Laptop,
  Check,
} from "lucide-react";

export default function EmployeeSettingsPage() {
  const [emailDigest, setEmailDigest] = useState(true);
  const [taskAlerts, setTaskAlerts] = useState(true);
  const [attendanceReminders, setAttendanceReminders] = useState(true);
  const [announcementAlerts, setAnnouncementAlerts] = useState(true);
  const [savedSettings, setSavedSettings] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("axivon_employee_prefs");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.emailDigest !== undefined) setEmailDigest(Boolean(parsed.emailDigest));
        if (parsed.taskAlerts !== undefined) setTaskAlerts(Boolean(parsed.taskAlerts));
        if (parsed.attendanceReminders !== undefined) setAttendanceReminders(Boolean(parsed.attendanceReminders));
        if (parsed.announcementAlerts !== undefined) setAnnouncementAlerts(Boolean(parsed.announcementAlerts));
      }
    } catch {
      // ignore localStorage parse issues
    }
  }, []);

  const handleSavePreferences = () => {
    try {
      localStorage.setItem(
        "axivon_employee_prefs",
        JSON.stringify({
          emailDigest,
          taskAlerts,
          attendanceReminders,
          announcementAlerts,
        })
      );
    } catch {
      // ignore
    }
    setSavedSettings(true);
    setTimeout(() => setSavedSettings(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#F3F5F7] tracking-tight">
          Account Settings & Preferences
        </h1>
        <p className="text-sm text-[#A7B0BC] mt-1">
          Manage your security credentials, workspace notifications, and locale preferences.
        </p>
      </div>

      {savedSettings && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Workspace notification preferences updated successfully.</span>
        </div>
      )}

      {/* Security: Password Change */}
      <Card className="p-6 bg-[#151A21] border-[#29313B] rounded-2xl space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-[#1E2530]">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#F3F5F7]">Security & Password</h2>
            <p className="text-xs text-[#7E8997]">
              Update your account password to protect your corporate credentials.
            </p>
          </div>
        </div>

        <div className="max-w-md pt-2">
          <ChangePasswordForm />
        </div>
      </Card>

      {/* Workspace Notifications */}
      <Card className="p-6 bg-[#151A21] border-[#29313B] rounded-2xl space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-[#1E2530]">
          <div className="w-9 h-9 rounded-xl bg-[#67C5D8]/10 border border-[#67C5D8]/20 flex items-center justify-center text-[#67C5D8]">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#F3F5F7]">Notification Channels</h2>
            <p className="text-xs text-[#7E8997]">
              Configure internal alerts and scheduled email dispatches.
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#10151B] border border-[#1E2530]">
            <div>
              <div className="font-semibold text-[#F3F5F7]">Daily EOD Summary Digest</div>
              <div className="text-[#7E8997]">Receive nightly summary of your work logs and team updates</div>
            </div>
            <input
              type="checkbox"
              checked={emailDigest}
              onChange={(e) => setEmailDigest(e.target.checked)}
              className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[#10151B] border border-[#1E2530]">
            <div>
              <div className="font-semibold text-[#F3F5F7]">Task Assignment Alerts</div>
              <div className="text-[#7E8997]">Get notified when project managers assign you tasks or comments</div>
            </div>
            <input
              type="checkbox"
              checked={taskAlerts}
              onChange={(e) => setTaskAlerts(e.target.checked)}
              className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[#10151B] border border-[#1E2530]">
            <div>
              <div className="font-semibold text-[#F3F5F7]">Attendance Check-In Reminders</div>
              <div className="text-[#7E8997]">Desktop reminders if check-in is not logged by 09:45 AM</div>
            </div>
            <input
              type="checkbox"
              checked={attendanceReminders}
              onChange={(e) => setAttendanceReminders(e.target.checked)}
              className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[#10151B] border border-[#1E2530]">
            <div>
              <div className="font-semibold text-[#F3F5F7]">Company Announcements Broadcast</div>
              <div className="text-[#7E8997]">High-priority notices and executive announcements</div>
            </div>
            <input
              type="checkbox"
              checked={announcementAlerts}
              onChange={(e) => setAnnouncementAlerts(e.target.checked)}
              className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              size="sm"
              onClick={handleSavePreferences}
              className="bg-emerald-500 hover:bg-emerald-600 text-[#04130E] font-semibold text-xs"
            >
              Save Preferences
            </Button>
          </div>
        </div>
      </Card>

      {/* Workplace Localization & Theme */}
      <Card className="p-6 bg-[#151A21] border-[#29313B] rounded-2xl space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-[#1E2530]">
          <div className="w-9 h-9 rounded-xl bg-[#D6B779]/10 border border-[#D6B779]/20 flex items-center justify-center text-[#D6B779]">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#F3F5F7]">Locale & Display</h2>
            <p className="text-xs text-[#7E8997]">Company-wide display parameters and theme standards.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 bg-[#10151B] border border-[#1E2530] rounded-xl space-y-1">
            <div className="text-[#7E8997]">Timezone</div>
            <div className="font-semibold text-[#F3F5F7]">Asia/Kolkata (IST, UTC+5:30)</div>
          </div>

          <div className="p-3.5 bg-[#10151B] border border-[#1E2530] rounded-xl space-y-1">
            <div className="text-[#7E8997]">Language & Format</div>
            <div className="font-semibold text-[#F3F5F7]">English (India) • DD/MM/YYYY</div>
          </div>

          <div className="p-3.5 bg-[#10151B] border border-[#1E2530] rounded-xl space-y-1">
            <div className="text-[#7E8997]">Display Theme</div>
            <div className="font-semibold text-emerald-400 flex items-center gap-1">
              <Moon className="w-3.5 h-3.5" /> High-Contrast Dark
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
