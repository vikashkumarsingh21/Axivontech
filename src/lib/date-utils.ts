/**
 * Standardized Calendar Date & Timezone Normalization Utilities
 *
 * Ensures consistent handling of PostgreSQL `@db.Date` fields across all timezones
 * (e.g. IST UTC+5:30, UTC, EST, etc.) to prevent midnight offset collisions
 * and unique constraint failures on (userId, date).
 */

/**
 * Returns a Date object anchored at UTC midnight (00:00:00.000Z) representing
 * the calendar date (YYYY-MM-DD) for a given date.
 * If input is a Date, extracts local calendar year, month, and date.
 * If input is a string (e.g. "2026-10-21" or ISO), parses the date portion.
 */
export function getUtcCalendarDate(date: Date | string = new Date()): Date {
  if (typeof date === "string") {
    // If it's a date string like "2026-10-21" or "2026-10-21T..."
    const match = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1;
      const day = parseInt(match[3], 10);
      return new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
    }
    date = new Date(date);
  }

  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  return new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
}

/**
 * Formats any Date object or date string into a stable "YYYY-MM-DD" calendar date string.
 */
export function toCalendarDateString(date: Date | string | null | undefined): string {
  if (!date) return "";
  if (typeof date === "string") {
    const match = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) return match[0];
    date = new Date(date);
  }
  return date.toISOString().split("T")[0];
}

/**
 * Checks whether two dates represent the exact same calendar day (YYYY-MM-DD).
 */
export function isSameCalendarDay(
  d1: Date | string | null | undefined,
  d2: Date | string | null | undefined
): boolean {
  if (!d1 || !d2) return false;
  return toCalendarDateString(d1) === toCalendarDateString(d2);
}

/**
 * Returns UTC start-of-day and end-of-day Date objects for querying date ranges in PostgreSQL.
 */
export function getUtcDayRange(date: Date | string = new Date()): {
  startOfDay: Date;
  endOfDay: Date;
} {
  const startOfDay = getUtcCalendarDate(date);
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1);
  return { startOfDay, endOfDay };
}
