/**
 * Axivon Technologies — Calendar & Date Utilities
 * Handles timezone-safe date calculations, weekly off rules (including Sunday & Saturday rules),
 * month matrix computation, leap years, and relative time labels.
 */

export interface CalendarScheduleSettings {
  weeklyOffDays: number[]; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday. Default: [0]
  workingDays: number[]; // Default: [1, 2, 3, 4, 5, 6]
  saturdayRule: "ALL_WORKING" | "ALL_OFF" | "SECOND_FOURTH_OFF" | "FIRST_THIRD_OFF";
  timezone: string; // Default: "Asia/Kolkata"
  country: string; // Default: "India"
  state: string; // Default: "Gujarat"
  holidaySource: string; // Default: "GOOGLE_CALENDAR"
  autoSyncEnabled?: boolean;
  lastSyncAt?: string | null;
  lastSyncResult?: {
    added: number;
    updated: number;
    unchanged: number;
    total: number;
    timestamp: string;
    source: string;
  } | null;
}

export const DEFAULT_CALENDAR_SETTINGS: CalendarScheduleSettings = {
  weeklyOffDays: [0], // Sunday is weekly off by default
  workingDays: [1, 2, 3, 4, 5, 6],
  saturdayRule: "ALL_WORKING",
  timezone: "Asia/Kolkata",
  country: "India",
  state: "Gujarat",
  holidaySource: "GOOGLE_CALENDAR",
  autoSyncEnabled: true,
};

/**
 * Format a Date object into YYYY-MM-DD string without UTC offset drift.
 */
export function toDateString(date: Date | string): string {
  if (typeof date === "string") {
    // If already in YYYY-MM-DD format, return the date part
    if (/^\d{4}-\d{2}-\d{2}/.test(date)) {
      return date.slice(0, 10);
    }
    date = new Date(date);
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parse a YYYY-MM-DD string into a local Date representing midnight of that day.
 */
export function parseDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

/**
 * Determine which Saturday of the month a given date is (1st, 2nd, 3rd, 4th, or 5th).
 */
export function getSaturdayOccurrence(date: Date): number {
  if (date.getDay() !== 6) return 0;
  const dayOfMonth = date.getDate();
  return Math.ceil(dayOfMonth / 7);
}

/**
 * Check whether a given date is a configured Weekly Off.
 */
export function checkWeeklyOff(
  date: Date | string,
  settings: CalendarScheduleSettings = DEFAULT_CALENDAR_SETTINGS
): { isOff: boolean; reason: string } {
  const d = typeof date === "string" ? parseDateString(date) : date;
  const dayOfWeek = d.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat

  // Check if dayOfWeek is in configured weekly off days (e.g. Sunday = 0)
  if (settings.weeklyOffDays.includes(dayOfWeek)) {
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return { isOff: true, reason: `${dayNames[dayOfWeek]} Weekly Off` };
  }

  // Saturday Alternate Rule Check
  if (dayOfWeek === 6) {
    const satOccur = getSaturdayOccurrence(d);
    if (settings.saturdayRule === "ALL_OFF") {
      return { isOff: true, reason: "Saturday Weekly Off" };
    }
    if (settings.saturdayRule === "SECOND_FOURTH_OFF" && (satOccur === 2 || satOccur === 4)) {
      const suffix = satOccur === 2 ? "2nd" : "4th";
      return { isOff: true, reason: `${suffix} Saturday Off` };
    }
    if (settings.saturdayRule === "FIRST_THIRD_OFF" && (satOccur === 1 || satOccur === 3)) {
      const suffix = satOccur === 1 ? "1st" : "3rd";
      return { isOff: true, reason: `${suffix} Saturday Off` };
    }
  }

  return { isOff: false, reason: "Working Day" };
}

/**
 * Calculate human-readable countdown/relative date label.
 */
export function getRelativeDateLabel(targetDateStr: string, referenceDateStr?: string): string {
  const ref = referenceDateStr ? parseDateString(referenceDateStr) : new Date();
  ref.setHours(0, 0, 0, 0);

  const target = parseDateString(targetDateStr);
  target.setHours(0, 0, 0, 0);

  const diffMs = target.getTime() - ref.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays > 7 && diffDays <= 30) return `In ${Math.round(diffDays / 7)} weeks`;
  if (diffDays < -1 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;

  return target.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/**
 * Generate a complete 7-day-column Month Calendar Matrix (Sunday through Saturday).
 * Accurately handles leap years and fills lead/tail days to form complete rows.
 */
export function generateMonthMatrix(year: number, monthIndex: number) {
  const firstDayOfWeek = new Date(year, monthIndex, 1).getDay(); // 0 = Sunday
  const daysInCurrentMonth = new Date(year, monthIndex + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, monthIndex, 0).getDate();

  const days: {
    date: Date;
    dateString: string;
    dayNumber: number;
    isCurrentMonth: boolean;
    isPrevMonth: boolean;
    isNextMonth: boolean;
    dayOfWeek: number;
  }[] = [];

  // Previous month trailing days
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const dayNumber = daysInPrevMonth - i;
    const date = new Date(year, monthIndex - 1, dayNumber);
    days.push({
      date,
      dateString: toDateString(date),
      dayNumber,
      isCurrentMonth: false,
      isPrevMonth: true,
      isNextMonth: false,
      dayOfWeek: date.getDay(),
    });
  }

  // Current month days
  for (let dayNumber = 1; dayNumber <= daysInCurrentMonth; dayNumber++) {
    const date = new Date(year, monthIndex, dayNumber);
    days.push({
      date,
      dateString: toDateString(date),
      dayNumber,
      isCurrentMonth: true,
      isPrevMonth: false,
      isNextMonth: false,
      dayOfWeek: date.getDay(),
    });
  }

  // Next month leading days to complete full weeks (multiples of 7)
  const remaining = (7 - (days.length % 7)) % 7;
  for (let dayNumber = 1; dayNumber <= remaining; dayNumber++) {
    const date = new Date(year, monthIndex + 1, dayNumber);
    days.push({
      date,
      dateString: toDateString(date),
      dayNumber,
      isCurrentMonth: false,
      isPrevMonth: false,
      isNextMonth: true,
      dayOfWeek: date.getDay(),
    });
  }

  return days;
}

/**
 * Generate a 7-day Week Matrix around a selected date, starting Sunday.
 */
export function generateWeekMatrix(selectedDate: Date) {
  const current = new Date(selectedDate);
  current.setHours(0, 0, 0, 0);
  const dayOfWeek = current.getDay(); // 0 = Sunday

  const sunday = new Date(current);
  sunday.setDate(current.getDate() - dayOfWeek);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(sunday);
    date.setDate(sunday.getDate() + i);
    days.push({
      date,
      dateString: toDateString(date),
      dayNumber: date.getDate(),
      dayOfWeek: date.getDay(),
    });
  }
  return days;
}
