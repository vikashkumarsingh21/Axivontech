"use client";

import { useEffect, useState } from "react";
import { useAppMode } from "@/features/app-mode/useAppMode";
import { MobileNotificationCenter } from "@/components/mobile/MobileNotificationCenter";

type Tab = "composer" | "history" | "settings" | "logs";

export default function AdminNotificationsPage() {
  const { isAppMode } = useAppMode();
  const [activeTab, setActiveTab] = useState<Tab>("composer");

  // Notifications Log
  const [logs, setLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // Broadcast History
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Settings
  const [settings, setSettings] = useState<any>({
    attendanceReminderTime: "10:00",
    attendanceManagerAlertTime: "11:30",
    workReportReminderTime: "17:00",
    workReportOverdueTime: "19:00",
    enableAttendanceReminders: true,
    enableWorkReportReminders: true,
    enableTaskReminders: true,
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);

  // Composer Form State
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("ANNOUNCEMENT");
  const [priority, setPriority] = useState("NORMAL");
  const [recipientType, setRecipientType] = useState("ALL_ACTIVE_USERS");
  const [targetId, setTargetId] = useState("");
  const [link, setLink] = useState("");
  const [sendInApp, setSendInApp] = useState(true);
  const [sendPush, setSendPush] = useState(true);
  const [sendEmail, setSendEmail] = useState(false);
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchLogs = () => {
    setLogsLoading(true);
    fetch("/api/v1/admin/notifications")
      .then((r) => r.json())
      .then((d) => {
        setLogs(d.data || []);
        setLogsLoading(false);
      })
      .catch(() => setLogsLoading(false));
  };

  const fetchHistory = () => {
    setHistoryLoading(true);
    fetch("/api/v1/admin/notifications/history")
      .then((r) => r.json())
      .then((d) => {
        setHistory(d.data || []);
        setHistoryLoading(false);
      })
      .catch(() => setHistoryLoading(false));
  };

  const fetchSettings = () => {
    setSettingsLoading(true);
    fetch("/api/v1/admin/notifications/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.data) setSettings(d.data);
        setSettingsLoading(false);
      })
      .catch(() => setSettingsLoading(false));
  };

  useEffect(() => {
    fetchLogs();
    fetchHistory();
    fetchSettings();
  }, []);

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setFeedback({ type: "error", text: "Please enter both a title and message." });
      return;
    }

    setSending(true);
    setFeedback(null);

    const channels: string[] = [];
    if (sendInApp) channels.push("IN_APP");
    if (sendPush) channels.push("PUSH");
    if (sendEmail) channels.push("EMAIL");

    const payload: any = {
      title: title.trim(),
      message: message.trim(),
      category,
      priority,
      recipientType,
      link: link.trim() || null,
      channels,
      sendEmail,
    };

    if (recipientType === "SPECIFIC_USER") payload.targetUserId = targetId.trim();
    if (recipientType === "SELECTED_ROLE") payload.role = targetId.trim();
    if (recipientType === "SELECTED_DEPARTMENT") payload.departmentId = targetId.trim();

    try {
      const res = await fetch("/api/v1/admin/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to send notification");
      }

      setFeedback({
        type: "success",
        text: `Broadcast dispatched successfully to ${data.data.sentCount} recipient(s)!`,
      });
      setTitle("");
      setMessage("");
      setLink("");
      fetchHistory();
      fetchLogs();
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Could not dispatch notification" });
    } finally {
      setSending(false);
    }
  };

  const handleSaveSettings = async () => {
    setSettingsSaving(true);
    try {
      const res = await fetch("/api/v1/admin/notifications/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        alert("Reminder schedule settings updated successfully!");
      }
    } catch {
      alert("Failed to update reminder settings");
    } finally {
      setSettingsSaving(false);
    }
  };

  if (isAppMode) {
    return (
      <MobileNotificationCenter
        notifications={logs}
        isLoading={logsLoading}
        emptyTitle="No admin notifications"
        emptyDescription="System audit alerts and automated announcements will appear here."
      />
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Notification Center</h1>
        <p className="text-gray-400 mt-1">
          Manage system broadcasts, automated reminders, Android push notifications, and delivery analytics.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 gap-2">
        <button
          onClick={() => setActiveTab("composer")}
          className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 -mb-px ${
            activeTab === "composer"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          Send Notification
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 -mb-px ${
            activeTab === "history"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          Broadcast History
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 -mb-px ${
            activeTab === "settings"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          Automated Reminder Schedules
        </button>
        <button
          onClick={() => setActiveTab("logs")}
          className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 -mb-px ${
            activeTab === "logs"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          Notifications Feed ({logs.length})
        </button>
      </div>

      {/* Tab 1: Composer */}
      {activeTab === "composer" && (
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Compose & Dispatch Notification</h2>

          {feedback && (
            <div
              className={`p-4 rounded-xl text-sm mb-6 ${
                feedback.type === "success"
                  ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                  : "bg-red-500/10 border border-red-500/30 text-red-400"
              }`}
            >
              {feedback.text}
            </div>
          )}

          <form onSubmit={handleSendBroadcast} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Target Audience
                </label>
                <select
                  value={recipientType}
                  onChange={(e) => setRecipientType(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="ALL_ACTIVE_USERS">All Active Users (Organization-wide)</option>
                  <option value="ALL_EMPLOYEES">All Employees</option>
                  <option value="ALL_BROKERS">All Partner Brokers</option>
                  <option value="ALL_MANAGERS">All Department Managers</option>
                  <option value="FOUNDERS">Founders & Leadership</option>
                  <option value="SELECTED_DEPARTMENT">Specific Department</option>
                  <option value="SELECTED_ROLE">Specific Role</option>
                  <option value="SPECIFIC_USER">Single Specific User</option>
                </select>
              </div>

              {(recipientType === "SELECTED_DEPARTMENT" ||
                recipientType === "SELECTED_ROLE" ||
                recipientType === "SPECIFIC_USER") && (
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    {recipientType === "SELECTED_DEPARTMENT" && "Department Name or ID"}
                    {recipientType === "SELECTED_ROLE" && "Role Name (e.g. EMPLOYEE, BROKER)"}
                    {recipientType === "SPECIFIC_USER" && "Target User ID"}
                  </label>
                  <input
                    type="text"
                    required
                    value={targetId}
                    onChange={(e) => setTargetId(e.target.value)}
                    placeholder="Enter identifier..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="ANNOUNCEMENT">Announcement</option>
                  <option value="GENERAL">General Notice</option>
                  <option value="URGENT">Urgent Alert</option>
                  <option value="MAINTENANCE">Maintenance Notice</option>
                  <option value="SYSTEM">System Notice</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="LOW">Low</option>
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High (Prominent)</option>
                  <option value="URGENT">Urgent (Red Alert + Immediate Push)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Notification Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Company Townhall Today at 4:00 PM"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Notification Message
              </label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter detailed notification content..."
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Action Deep-Link (Optional)
              </label>
              <input
                type="text"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="e.g. /employee/attendance or /admin/reports"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Delivery Channels */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Delivery Channels
              </label>
              <div className="flex flex-wrap gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={sendInApp}
                    onChange={(e) => setSendInApp(e.target.checked)}
                    className="rounded bg-black/40 border-white/20 text-blue-500 focus:ring-0"
                  />
                  <span>In-App Notification</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={sendPush}
                    onChange={(e) => setSendPush(e.target.checked)}
                    className="rounded bg-black/40 border-white/20 text-blue-500 focus:ring-0"
                  />
                  <span>Android Push Notification (FCM)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={sendEmail}
                    onChange={(e) => setSendEmail(e.target.checked)}
                    className="rounded bg-black/40 border-white/20 text-blue-500 focus:ring-0"
                  />
                  <span>Transactional Email</span>
                </label>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={sending}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium rounded-xl text-sm transition-all"
              >
                {sending ? "Dispatching..." : "Send Notification"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Broadcast History */}
      {activeTab === "history" && (
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Broadcast Dispatch History</h2>
          {historyLoading ? (
            <p className="text-gray-400 text-sm">Loading broadcast history...</p>
          ) : history.length === 0 ? (
            <p className="text-gray-400 text-sm">No notifications have been broadcast yet.</p>
          ) : (
            <div className="divide-y divide-white/5">
              {history.map((item) => (
                <div key={item.id} className="py-4 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm">{item.title}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {item.category}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded border ${
                          item.priority === "URGENT"
                            ? "bg-red-500/10 text-red-400 border-red-500/20"
                            : item.priority === "HIGH"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-white/5 text-gray-400 border-white/10"
                        }`}
                      >
                        {item.priority}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-sm text-gray-300">{item.message}</p>

                  <div className="flex flex-wrap items-center gap-6 text-xs text-gray-400 pt-1">
                    <span>Target: {item.recipientType.replace(/_/g, " ")}</span>
                    <span>Audience: {item.sentCount} sent</span>
                    <span>Read: {item.readCount || 0} ({item.readPercentage || 0}%)</span>
                    <span>By: {item.senderName || "Admin"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Reminder Settings */}
      {activeTab === "settings" && (
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-white">Automated Reminder Configurations</h2>
            <p className="text-gray-400 text-sm">
              Configure daily business hours and trigger times for automated attendance, work reports, and tasks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-blue-400">Attendance Reminders</h3>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Morning Check-In Reminder Time (IST)
                </label>
                <input
                  type="text"
                  value={settings.attendanceReminderTime || "10:00"}
                  onChange={(e) =>
                    setSettings({ ...settings, attendanceReminderTime: e.target.value })
                  }
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Manager Missing Attendance Alert Cutoff (IST)
                </label>
                <input
                  type="text"
                  value={settings.attendanceManagerAlertTime || "11:30"}
                  onChange={(e) =>
                    setSettings({ ...settings, attendanceManagerAlertTime: e.target.value })
                  }
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={settings.enableAttendanceReminders !== false}
                  onChange={(e) =>
                    setSettings({ ...settings, enableAttendanceReminders: e.target.checked })
                  }
                  className="rounded bg-black/40 border-white/20 text-blue-500 focus:ring-0"
                />
                <span>Enable Automated Attendance Reminders</span>
              </label>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-blue-400">Daily Work Report Reminders</h3>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Pre-Deadline Reminder Time (IST)
                </label>
                <input
                  type="text"
                  value={settings.workReportReminderTime || "17:00"}
                  onChange={(e) =>
                    setSettings({ ...settings, workReportReminderTime: e.target.value })
                  }
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Overdue Alert Time (IST)
                </label>
                <input
                  type="text"
                  value={settings.workReportOverdueTime || "19:00"}
                  onChange={(e) =>
                    setSettings({ ...settings, workReportOverdueTime: e.target.value })
                  }
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={settings.enableWorkReportReminders !== false}
                  onChange={(e) =>
                    setSettings({ ...settings, enableWorkReportReminders: e.target.checked })
                  }
                  className="rounded bg-black/40 border-white/20 text-blue-500 focus:ring-0"
                />
                <span>Enable Automated Work Report Reminders</span>
              </label>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSaveSettings}
              disabled={settingsSaving}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl text-sm transition-all"
            >
              {settingsSaving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Logs Feed */}
      {activeTab === "logs" && (
        <div className="space-y-3">
          {logsLoading ? (
            <p className="text-gray-400">Loading notifications...</p>
          ) : logs.length === 0 ? (
            <p className="text-gray-400">No notifications.</p>
          ) : (
            logs.map((n) => (
              <div
                key={n.id}
                className={`bg-[#111111] border border-white/10 rounded-xl p-4 ${
                  n.isRead ? "opacity-60" : ""
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-white font-medium text-sm">{n.title}</p>
                      {n.priority && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-gray-400 border border-white/10">
                          {n.priority}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm mt-1">{n.message}</p>
                    <p className="text-gray-600 text-xs mt-2">
                      To: {n.user?.name} ({n.user?.email}) &middot; {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full h-fit ${
                      n.isRead ? "bg-gray-500/10 text-gray-500" : "bg-blue-500/10 text-blue-400"
                    }`}
                  >
                    {n.isRead ? "Read" : "Unread"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
