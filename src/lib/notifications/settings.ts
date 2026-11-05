import { db } from "@/lib/db";
import { ReminderScheduleSettings } from "./types";

export const DEFAULT_REMINDER_SETTINGS: ReminderScheduleSettings = {
  timezone: "Asia/Kolkata",
  attendanceReminderTime: "10:00",
  attendanceManagerAlertTime: "11:30",
  workReportReminderTime: "17:00",
  workReportOverdueTime: "19:00",
  workDays: [1, 2, 3, 4, 5, 6], // Mon - Sat
  enableAttendanceReminders: true,
  enableWorkReportReminders: true,
  enableTaskReminders: true,
};

const SETTINGS_KEY = "notifications.reminder_settings";

let cachedSettings: { data: ReminderScheduleSettings; expiresAt: number } | null = null;

export async function getReminderScheduleSettings(): Promise<ReminderScheduleSettings> {
  const now = Date.now();
  if (cachedSettings && cachedSettings.expiresAt > now) {
    return cachedSettings.data;
  }

  try {
    const record = await db.organizationSetting.findUnique({
      where: { key: SETTINGS_KEY },
    });

    if (record?.value && typeof record.value === "object") {
      const merged: ReminderScheduleSettings = {
        ...DEFAULT_REMINDER_SETTINGS,
        ...(record.value as Partial<ReminderScheduleSettings>),
      };
      cachedSettings = { data: merged, expiresAt: now + 60_000 }; // 1 min cache
      return merged;
    }
  } catch (err) {
    console.warn("[NotificationSettings] Failed to fetch settings, using defaults", err);
  }

  return DEFAULT_REMINDER_SETTINGS;
}

export async function updateReminderScheduleSettings(
  partial: Partial<ReminderScheduleSettings>
): Promise<ReminderScheduleSettings> {
  const current = await getReminderScheduleSettings();
  const updated: ReminderScheduleSettings = {
    ...current,
    ...partial,
  };

  await db.organizationSetting.upsert({
    where: { key: SETTINGS_KEY },
    create: {
      key: SETTINGS_KEY,
      value: updated as any,
    },
    update: {
      value: updated as any,
    },
  });

  cachedSettings = { data: updated, expiresAt: Date.now() + 60_000 };
  return updated;
}
