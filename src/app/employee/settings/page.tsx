"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/employee/PageHeader";
import { EpButton } from "@/components/employee/EpButton";
import { SkeletonCard } from "@/components/employee/SkeletonCard";
import { ChangePasswordForm } from "@/components/employee/ChangePasswordForm";
import {
  Lock,
  Bell,
  Globe,
  Moon,
  CheckCircle2,
  AlertCircle,
  Settings,
  Mail,
  ShieldCheck,
} from "lucide-react";

interface ServerSettings {
  emailNotifications: boolean;
  inAppNotifications: boolean;
  timezone: string;
  theme: "dark" | "light" | "system";
}

export default function EmployeeSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Server settings
  const [serverSettings, setServerSettings] = useState<ServerSettings>({
    emailNotifications: true,
    inAppNotifications: true,
    timezone: "Asia/Kolkata",
    theme: "dark",
  });

  // Client-specific notification preferences
  const [emailDigest, setEmailDigest] = useState(true);
  const [taskAlerts, setTaskAlerts] = useState(true);
  const [attendanceReminders, setAttendanceReminders] = useState(true);
  const [announcementAlerts, setAnnouncementAlerts] = useState(true);

  const loadPreferences = useCallback(async () => {
    try {
      setLoading(true);
      // 1. Fetch server settings
      const res = await fetch("/api/v1/employee/settings");
      const data = await res.json();
      if (data.success && data.settings) {
        setServerSettings({
          emailNotifications: data.settings.emailNotifications ?? true,
          inAppNotifications: data.settings.inAppNotifications ?? true,
          timezone: data.settings.timezone || "Asia/Kolkata",
          theme: data.settings.theme || "dark",
        });
      }

      // 2. Fetch local storage preferences
      const stored = localStorage.getItem("axivon_employee_prefs");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.emailDigest !== undefined) setEmailDigest(Boolean(parsed.emailDigest));
        if (parsed.taskAlerts !== undefined) setTaskAlerts(Boolean(parsed.taskAlerts));
        if (parsed.attendanceReminders !== undefined)
          setAttendanceReminders(Boolean(parsed.attendanceReminders));
        if (parsed.announcementAlerts !== undefined)
          setAnnouncementAlerts(Boolean(parsed.announcementAlerts));
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  const handleSavePreferences = async () => {
    try {
      setSaving(true);
      setError(null);

      // Save to server
      const res = await fetch("/api/v1/employee/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailNotifications: serverSettings.emailNotifications,
          inAppNotifications: serverSettings.inAppNotifications,
          timezone: serverSettings.timezone,
          theme: serverSettings.theme,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save settings on server");
      }

      // Save to localStorage
      localStorage.setItem(
        "axivon_employee_prefs",
        JSON.stringify({
          emailDigest,
          taskAlerts,
          attendanceReminders,
          announcementAlerts,
        })
      );

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update preferences");
    } finally {
      setSaving(false);
    }
  };

  const ToggleSwitch = ({
    checked,
    onChange,
    label,
    description,
  }: {
    checked: boolean;
    onChange: (val: boolean) => void;
    label: string;
    description: string;
  }) => (
    <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0B0D10] border border-[#1E2530] hover:border-[#22262D] transition-colors">
      <div className="pr-4">
        <div className="font-semibold text-xs sm:text-sm text-[#E6E8EB]">{label}</div>
        <div className="text-[11px] sm:text-xs text-[#8B94A1] mt-0.5">{description}</div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          checked ? "bg-[#5FA8A0]" : "bg-[#1E2530]"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6 max-w-4xl"
    >
      {/* Page Header */}
      <PageHeader
        title="Account Settings & Preferences"
        subtitle="Manage your security credentials, workspace notifications, and locale preferences."
        icon={Settings}
      />

      {savedSuccess && (
        <div className="p-3 bg-[#34D399]/10 border border-[#34D399]/20 rounded-xl text-[#34D399] text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Workspace notification preferences updated successfully.</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-[#F87171]/10 border border-[#F87171]/20 rounded-xl text-[#F87171] text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Security: Password Change */}
      <Card className="p-6 bg-[#111317] border-[#1E2530] rounded-2xl space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-[#1E2530]">
          <div className="w-9 h-9 rounded-xl bg-[#5FA8A0]/10 border border-[#5FA8A0]/20 flex items-center justify-center text-[#5FA8A0]">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#E6E8EB]">Security & Password</h2>
            <p className="text-xs text-[#8B94A1]">
              Update your account password to protect your corporate credentials.
            </p>
          </div>
        </div>

        <div className="max-w-md pt-1">
          <ChangePasswordForm />
        </div>
      </Card>

      {/* Workspace Notifications */}
      <Card className="p-6 bg-[#111317] border-[#1E2530] rounded-2xl space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-[#1E2530]">
          <div className="w-9 h-9 rounded-xl bg-[#67C5D8]/10 border border-[#67C5D8]/20 flex items-center justify-center text-[#67C5D8]">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#E6E8EB]">Notification Channels & Alerts</h2>
            <p className="text-xs text-[#8B94A1]">
              Configure internal alerts and scheduled email dispatches.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            <SkeletonCard rows={3} />
            <SkeletonCard rows={3} />
          </div>
        ) : (
          <div className="space-y-3">
            <ToggleSwitch
              checked={serverSettings.emailNotifications}
              onChange={(val) =>
                setServerSettings((prev) => ({ ...prev, emailNotifications: val }))
              }
              label="Email Notifications"
              description="Receive transactional and urgent account updates via work email."
            />

            <ToggleSwitch
              checked={serverSettings.inAppNotifications}
              onChange={(val) =>
                setServerSettings((prev) => ({ ...prev, inAppNotifications: val }))
              }
              label="In-App Notifications"
              description="Surface live badges and alerts inside your employee portal."
            />

            <ToggleSwitch
              checked={emailDigest}
              onChange={setEmailDigest}
              label="Daily EOD Summary Digest"
              description="Receive nightly summary of your work logs and team updates."
            />

            <ToggleSwitch
              checked={taskAlerts}
              onChange={setTaskAlerts}
              label="Task Assignment Alerts"
              description="Get notified when project managers assign you tasks or comments."
            />

            <ToggleSwitch
              checked={attendanceReminders}
              onChange={setAttendanceReminders}
              label="Attendance Check-In Reminders"
              description="Portal reminder if check-in is not logged by 09:45 AM."
            />

            <ToggleSwitch
              checked={announcementAlerts}
              onChange={setAnnouncementAlerts}
              label="Company Announcements Broadcast"
              description="High-priority notices and executive announcements."
            />

            <div className="pt-3 flex justify-end">
              <EpButton
                size="sm"
                variant="primary"
                onClick={handleSavePreferences}
                isLoading={saving}
                className="text-xs h-9 px-4"
              >
                Save Preferences
              </EpButton>
            </div>
          </div>
        )}
      </Card>

      {/* Workplace Localization & Theme */}
      <Card className="p-6 bg-[#111317] border-[#1E2530] rounded-2xl space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-[#1E2530]">
          <div className="w-9 h-9 rounded-xl bg-[#D6B779]/10 border border-[#D6B779]/20 flex items-center justify-center text-[#D6B779]">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#E6E8EB]">Locale & Display</h2>
            <p className="text-xs text-[#8B94A1]">
              Company-wide display parameters and theme standards.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 bg-[#0B0D10] border border-[#1E2530] rounded-xl space-y-1">
            <div className="text-[#8B94A1]">Timezone</div>
            <div className="font-semibold text-[#E6E8EB]">
              {serverSettings.timezone} (IST, UTC+5:30)
            </div>
          </div>

          <div className="p-3.5 bg-[#0B0D10] border border-[#1E2530] rounded-xl space-y-1">
            <div className="text-[#8B94A1]">Language & Format</div>
            <div className="font-semibold text-[#E6E8EB]">English (India) • DD/MM/YYYY</div>
          </div>

          <div className="p-3.5 bg-[#0B0D10] border border-[#1E2530] rounded-xl space-y-1">
            <div className="text-[#8B94A1]">Display Theme</div>
            <div className="font-semibold text-[#5FA8A0] flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5" /> High-Contrast Dark
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
