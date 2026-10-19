/**
 * Business Intelligence Date Filtering & Period Comparison Engine
 * Supports timezone-aware boundaries (Asia/Kolkata) and period comparison math.
 */

export type DateRangePreset =
  | "today"
  | "yesterday"
  | "last_7_days"
  | "last_30_days"
  | "last_90_days"
  | "this_month"
  | "previous_month"
  | "this_quarter"
  | "previous_quarter"
  | "this_year"
  | "previous_year"
  | "custom";

export interface ParsedDateRange {
  preset: DateRangePreset;
  startDate: Date;
  endDate: Date;
  prevStartDate: Date;
  prevEndDate: Date;
  label: string;
}

export interface MetricComparison {
  current: number;
  previous: number;
  diff: number;
  percentage: number | null;
  direction: "UP" | "DOWN" | "FLAT" | "N/A";
  isImprovement?: boolean; // depends on whether higher is better (e.g. leads) or worse (e.g. overdue tasks)
}

/**
 * Calculates current and previous equivalent date boundaries.
 */
export function resolveDateRange(
  preset: DateRangePreset = "last_30_days",
  customStart?: string | null,
  customEnd?: string | null
): ParsedDateRange {
  const now = new Date();

  // Helper to get start/end of day
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  const endOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

  let startDate: Date;
  let endDate: Date;
  let prevStartDate: Date;
  let prevEndDate: Date;
  let label = "Last 30 Days";

  if (preset === "custom" && customStart && customEnd) {
    const s = new Date(customStart.includes("T") ? customStart : `${customStart}T00:00:00.000Z`);
    const e = new Date(customEnd.includes("T") ? customEnd : `${customEnd}T23:59:59.999Z`);
    if (!isNaN(s.getTime()) && !isNaN(e.getTime()) && s <= e) {
      startDate = s;
      endDate = e;
      const spanMs = endDate.getTime() - startDate.getTime();
      prevEndDate = new Date(startDate.getTime() - 1);
      prevStartDate = new Date(prevEndDate.getTime() - spanMs);
      label = `${startDate.toISOString().slice(0, 10)} to ${endDate.toISOString().slice(0, 10)}`;
      return { preset: "custom", startDate, endDate, prevStartDate, prevEndDate, label };
    }
  }

  switch (preset) {
    case "today": {
      startDate = startOfDay(now);
      endDate = endOfDay(now);
      prevStartDate = new Date(startDate.getTime() - 24 * 60 * 60_000);
      prevEndDate = new Date(endDate.getTime() - 24 * 60 * 60_000);
      label = "Today";
      break;
    }
    case "yesterday": {
      const yesterday = new Date(now.getTime() - 24 * 60 * 60_000);
      startDate = startOfDay(yesterday);
      endDate = endOfDay(yesterday);
      prevStartDate = new Date(startDate.getTime() - 24 * 60 * 60_000);
      prevEndDate = new Date(endDate.getTime() - 24 * 60 * 60_000);
      label = "Yesterday";
      break;
    }
    case "last_7_days": {
      endDate = endOfDay(now);
      startDate = startOfDay(new Date(now.getTime() - 6 * 24 * 60 * 60_000));
      prevEndDate = new Date(startDate.getTime() - 1);
      prevStartDate = startOfDay(new Date(prevEndDate.getTime() - 6 * 24 * 60 * 60_000));
      label = "Last 7 Days";
      break;
    }
    case "last_30_days": {
      endDate = endOfDay(now);
      startDate = startOfDay(new Date(now.getTime() - 29 * 24 * 60 * 60_000));
      prevEndDate = new Date(startDate.getTime() - 1);
      prevStartDate = startOfDay(new Date(prevEndDate.getTime() - 29 * 24 * 60 * 60_000));
      label = "Last 30 Days";
      break;
    }
    case "last_90_days": {
      endDate = endOfDay(now);
      startDate = startOfDay(new Date(now.getTime() - 89 * 24 * 60 * 60_000));
      prevEndDate = new Date(startDate.getTime() - 1);
      prevStartDate = startOfDay(new Date(prevEndDate.getTime() - 89 * 24 * 60 * 60_000));
      label = "Last 90 Days";
      break;
    }
    case "this_month": {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      endDate = endOfDay(now);
      prevStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      prevEndDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      label = "This Month";
      break;
    }
    case "previous_month": {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      prevStartDate = new Date(now.getFullYear(), now.getMonth() - 2, 1, 0, 0, 0, 0);
      prevEndDate = new Date(now.getFullYear(), now.getMonth() - 1, 0, 23, 59, 59, 999);
      label = "Previous Month";
      break;
    }
    case "this_quarter": {
      const qMonth = Math.floor(now.getMonth() / 3) * 3;
      startDate = new Date(now.getFullYear(), qMonth, 1, 0, 0, 0, 0);
      endDate = endOfDay(now);
      prevStartDate = new Date(now.getFullYear(), qMonth - 3, 1, 0, 0, 0, 0);
      prevEndDate = new Date(now.getFullYear(), qMonth, 0, 23, 59, 59, 999);
      label = "This Quarter";
      break;
    }
    case "previous_quarter": {
      const qMonth = Math.floor(now.getMonth() / 3) * 3;
      startDate = new Date(now.getFullYear(), qMonth - 3, 1, 0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), qMonth, 0, 23, 59, 59, 999);
      prevStartDate = new Date(now.getFullYear(), qMonth - 6, 1, 0, 0, 0, 0);
      prevEndDate = new Date(now.getFullYear(), qMonth - 3, 0, 23, 59, 59, 999);
      label = "Previous Quarter";
      break;
    }
    case "this_year": {
      startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
      endDate = endOfDay(now);
      prevStartDate = new Date(now.getFullYear() - 1, 0, 1, 0, 0, 0, 0);
      prevEndDate = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
      label = "This Year";
      break;
    }
    case "previous_year": {
      startDate = new Date(now.getFullYear() - 1, 0, 1, 0, 0, 0, 0);
      endDate = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
      prevStartDate = new Date(now.getFullYear() - 2, 0, 1, 0, 0, 0, 0);
      prevEndDate = new Date(now.getFullYear() - 2, 11, 31, 23, 59, 59, 999);
      label = "Previous Year";
      break;
    }
    default: {
      endDate = endOfDay(now);
      startDate = startOfDay(new Date(now.getTime() - 29 * 24 * 60 * 60_000));
      prevEndDate = new Date(startDate.getTime() - 1);
      prevStartDate = startOfDay(new Date(prevEndDate.getTime() - 29 * 24 * 60 * 60_000));
      label = "Last 30 Days";
      break;
    }
  }

  return { preset, startDate, endDate, prevStartDate, prevEndDate, label };
}

/**
 * Calculates percentage delta and direction between current and previous values.
 * Strictly prevents division by zero, NaN, or Infinity.
 */
export function calculateComparison(
  current: number,
  previous: number,
  higherIsBetter: boolean = true
): MetricComparison {
  const diff = current - previous;

  let percentage: number | null = null;
  let direction: "UP" | "DOWN" | "FLAT" | "N/A" = "FLAT";

  if (previous === 0) {
    if (current === 0) {
      percentage = 0;
      direction = "FLAT";
    } else if (current > 0) {
      percentage = null; // Cannot calculate percentage on 0 denominator
      direction = "UP";
    } else {
      percentage = null;
      direction = "DOWN";
    }
  } else {
    percentage = Math.round(((current - previous) / Math.abs(previous)) * 100 * 10) / 10;
    if (diff > 0) direction = "UP";
    else if (diff < 0) direction = "DOWN";
    else direction = "FLAT";
  }

  const isImprovement =
    direction === "FLAT"
      ? undefined
      : higherIsBetter
      ? direction === "UP"
      : direction === "DOWN";

  return {
    current,
    previous,
    diff,
    percentage,
    direction,
    isImprovement,
  };
}
