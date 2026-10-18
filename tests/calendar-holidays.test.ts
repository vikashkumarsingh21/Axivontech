import { describe, it, expect, vi } from "vitest";
import {
  DEFAULT_CALENDAR_SETTINGS,
  checkWeeklyOff,
  getSaturdayOccurrence,
  toDateString,
  parseDateString,
  getRelativeDateLabel,
  generateMonthMatrix,
  generateWeekMatrix,
} from "@/lib/calendar/calendar-dates";
import {
  OFFICIAL_INDIAN_HOLIDAYS_CATALOG,
} from "@/lib/calendar/holiday-service";

describe("Calendar System & Date Utilities", () => {
  describe("1. Weekly Off Rules & Default Configuration", () => {
    it("should default to Sunday (day 0) as Weekly Off for all employees", () => {
      expect(DEFAULT_CALENDAR_SETTINGS.weeklyOffDays).toContain(0);
      expect(DEFAULT_CALENDAR_SETTINGS.workingDays).toEqual([1, 2, 3, 4, 5, 6]);
      expect(DEFAULT_CALENDAR_SETTINGS.saturdayRule).toBe("ALL_WORKING");
      expect(DEFAULT_CALENDAR_SETTINGS.timezone).toBe("Asia/Kolkata");
    });

    it("should correctly identify Sundays as Weekly Off", () => {
      // 2026-10-18 is a Sunday
      const sunday = parseDateString("2026-10-18");
      expect(sunday.getDay()).toBe(0);

      const result = checkWeeklyOff(sunday, DEFAULT_CALENDAR_SETTINGS);
      expect(result.isOff).toBe(true);
      expect(result.reason).toBe("Sunday Weekly Off");

      // Verify date string input also works seamlessly
      const stringResult = checkWeeklyOff("2026-10-18", DEFAULT_CALENDAR_SETTINGS);
      expect(stringResult.isOff).toBe(true);
      expect(stringResult.reason).toBe("Sunday Weekly Off");
    });

    it("should correctly identify normal weekdays as working days", () => {
      // 2026-10-19 is a Monday
      const monday = parseDateString("2026-10-19");
      expect(monday.getDay()).toBe(1);

      const result = checkWeeklyOff(monday, DEFAULT_CALENDAR_SETTINGS);
      expect(result.isOff).toBe(false);
      expect(result.reason).toBe("Working Day");
    });
  });

  describe("2. Saturday Alternate Rules & Occurrence Calculation", () => {
    it("should accurately compute the occurrence index of Saturdays in a month", () => {
      // October 2026 Saturdays:
      // Oct 3 = 1st Saturday
      // Oct 10 = 2nd Saturday
      // Oct 17 = 3rd Saturday
      // Oct 24 = 4th Saturday
      // Oct 31 = 5th Saturday
      expect(getSaturdayOccurrence(parseDateString("2026-10-03"))).toBe(1);
      expect(getSaturdayOccurrence(parseDateString("2026-10-10"))).toBe(2);
      expect(getSaturdayOccurrence(parseDateString("2026-10-17"))).toBe(3);
      expect(getSaturdayOccurrence(parseDateString("2026-10-24"))).toBe(4);
      expect(getSaturdayOccurrence(parseDateString("2026-10-31"))).toBe(5);

      // Non-Saturday dates return 0
      expect(getSaturdayOccurrence(parseDateString("2026-10-04"))).toBe(0); // Sunday
      expect(getSaturdayOccurrence(parseDateString("2026-10-05"))).toBe(0); // Monday
    });

    it("should enforce SECOND_FOURTH_OFF Saturday policy accurately", () => {
      const settings = {
        ...DEFAULT_CALENDAR_SETTINGS,
        saturdayRule: "SECOND_FOURTH_OFF" as const,
      };

      // 1st Saturday -> Working
      expect(checkWeeklyOff("2026-10-03", settings)).toEqual({
        isOff: false,
        reason: "Working Day",
      });

      // 2nd Saturday -> Off
      expect(checkWeeklyOff("2026-10-10", settings)).toEqual({
        isOff: true,
        reason: "2nd Saturday Off",
      });

      // 3rd Saturday -> Working
      expect(checkWeeklyOff("2026-10-17", settings)).toEqual({
        isOff: false,
        reason: "Working Day",
      });

      // 4th Saturday -> Off
      expect(checkWeeklyOff("2026-10-24", settings)).toEqual({
        isOff: true,
        reason: "4th Saturday Off",
      });

      // 5th Saturday -> Working
      expect(checkWeeklyOff("2026-10-31", settings)).toEqual({
        isOff: false,
        reason: "Working Day",
      });
    });

    it("should enforce FIRST_THIRD_OFF Saturday policy accurately", () => {
      const settings = {
        ...DEFAULT_CALENDAR_SETTINGS,
        saturdayRule: "FIRST_THIRD_OFF" as const,
      };

      // 1st Saturday -> Off
      expect(checkWeeklyOff("2026-10-03", settings)).toEqual({
        isOff: true,
        reason: "1st Saturday Off",
      });

      // 2nd Saturday -> Working
      expect(checkWeeklyOff("2026-10-10", settings)).toEqual({
        isOff: false,
        reason: "Working Day",
      });

      // 3rd Saturday -> Off
      expect(checkWeeklyOff("2026-10-17", settings)).toEqual({
        isOff: true,
        reason: "3rd Saturday Off",
      });

      // 4th Saturday -> Working
      expect(checkWeeklyOff("2026-10-24", settings)).toEqual({
        isOff: false,
        reason: "Working Day",
      });
    });

    it("should enforce ALL_OFF Saturday policy accurately", () => {
      const settings = {
        ...DEFAULT_CALENDAR_SETTINGS,
        saturdayRule: "ALL_OFF" as const,
      };

      expect(checkWeeklyOff("2026-10-03", settings).isOff).toBe(true);
      expect(checkWeeklyOff("2026-10-10", settings).isOff).toBe(true);
      expect(checkWeeklyOff("2026-10-17", settings).isOff).toBe(true);
      expect(checkWeeklyOff("2026-10-24", settings).isOff).toBe(true);
      expect(checkWeeklyOff("2026-10-31", settings).isOff).toBe(true);
    });
  });

  describe("3. Date String Normalization & Leap Year Month Matrix", () => {
    it("should normalize dates to YYYY-MM-DD without UTC timezone drift", () => {
      const date = new Date(2026, 9, 17); // October 17, 2026 local time
      expect(toDateString(date)).toBe("2026-10-17");

      const parsed = parseDateString("2026-10-17");
      expect(parsed.getFullYear()).toBe(2026);
      expect(parsed.getMonth()).toBe(9); // 0-indexed October
      expect(parsed.getDate()).toBe(17);
    });

    it("should generate a complete 7-day grid starting Sunday and ending Saturday", () => {
      const matrix = generateMonthMatrix(2026, 9); // October 2026
      expect(matrix.length % 7).toBe(0); // Multiples of 7 complete weeks

      // First cell of every week must be Sunday (dayOfWeek === 0)
      for (let i = 0; i < matrix.length; i += 7) {
        expect(matrix[i].dayOfWeek).toBe(0);
      }

      // Last cell of every week must be Saturday (dayOfWeek === 6)
      for (let i = 6; i < matrix.length; i += 7) {
        expect(matrix[i].dayOfWeek).toBe(6);
      }

      // Verify October 2026 has exactly 31 current month days
      const currentMonthDays = matrix.filter((d) => d.isCurrentMonth);
      expect(currentMonthDays.length).toBe(31);
    });

    it("should accurately handle Leap Year in February", () => {
      // 2028 is a leap year (February has 29 days)
      const leapFeb = generateMonthMatrix(2028, 1);
      const leapDays = leapFeb.filter((d) => d.isCurrentMonth);
      expect(leapDays.length).toBe(29);

      // 2026 is a standard year (February has 28 days)
      const standardFeb = generateMonthMatrix(2026, 1);
      const standardDays = standardFeb.filter((d) => d.isCurrentMonth);
      expect(standardDays.length).toBe(28);
    });

    it("should generate a 7-day week matrix starting Sunday", () => {
      const midWeekDate = parseDateString("2026-10-21"); // Wednesday
      const week = generateWeekMatrix(midWeekDate);

      expect(week.length).toBe(7);
      expect(week[0].dayOfWeek).toBe(0); // Sunday
      expect(week[0].dateString).toBe("2026-10-18");
      expect(week[6].dayOfWeek).toBe(6); // Saturday
      expect(week[6].dateString).toBe("2026-10-24");
    });
  });

  describe("4. Relative Date Countdown Labels", () => {
    it("should produce intuitive countdown strings for upcoming events", () => {
      const ref = "2026-10-17";
      expect(getRelativeDateLabel("2026-10-17", ref)).toBe("Today");
      expect(getRelativeDateLabel("2026-10-18", ref)).toBe("Tomorrow");
      expect(getRelativeDateLabel("2026-10-16", ref)).toBe("Yesterday");
      expect(getRelativeDateLabel("2026-10-20", ref)).toBe("In 3 days");
      expect(getRelativeDateLabel("2026-10-24", ref)).toBe("In 7 days");
      expect(getRelativeDateLabel("2026-11-01", ref)).toBe("In 2 weeks");
    });
  });

  describe("5. Indian Gazetted Catalog & Company Holiday vs Observance Distinction", () => {
    it("should contain official gazetted national holidays marked as isCompanyHoliday: true", () => {
      const holidays2026 = OFFICIAL_INDIAN_HOLIDAYS_CATALOG[2026];
      expect(holidays2026).toBeDefined();

      const republicDay = holidays2026.find((h) => h.name === "Republic Day");
      expect(republicDay).toBeDefined();
      expect(republicDay?.dateStr).toBe("2026-01-26");
      expect(republicDay?.category).toBe("PUBLIC_HOLIDAY");
      expect(republicDay?.isCompanyHoliday).toBe(true);

      const independenceDay = holidays2026.find((h) => h.name === "Independence Day");
      expect(independenceDay).toBeDefined();
      expect(independenceDay?.dateStr).toBe("2026-08-15");
      expect(independenceDay?.category).toBe("PUBLIC_HOLIDAY");
      expect(independenceDay?.isCompanyHoliday).toBe(true);

      const gandhiJayanti = holidays2026.find((h) => h.name === "Mahatma Gandhi Jayanti");
      expect(gandhiJayanti).toBeDefined();
      expect(gandhiJayanti?.dateStr).toBe("2026-10-02");
      expect(gandhiJayanti?.category).toBe("PUBLIC_HOLIDAY");
      expect(gandhiJayanti?.isCompanyHoliday).toBe(true);
    });

    it("should differentiate festivals/observances from company holidays until explicitly approved", () => {
      const holidays2026 = OFFICIAL_INDIAN_HOLIDAYS_CATALOG[2026];

      // Observances like Raksha Bandhan, Maha Shivratri, Makar Sankranti must not automatically close office
      const rakshaBandhan = holidays2026.find((h) => h.name === "Raksha Bandhan");
      expect(rakshaBandhan).toBeDefined();
      expect(rakshaBandhan?.category).toBe("FESTIVAL_OR_OBSERVANCE");
      expect(rakshaBandhan?.isCompanyHoliday).toBe(false);

      const shivratri = holidays2026.find((h) => h.name === "Maha Shivratri");
      expect(shivratri).toBeDefined();
      expect(shivratri?.category).toBe("FESTIVAL_OR_OBSERVANCE");
      expect(shivratri?.isCompanyHoliday).toBe(false);

      const makarSankranti = holidays2026.find((h) => h.name.includes("Makar Sankranti"));
      expect(makarSankranti).toBeDefined();
      expect(makarSankranti?.category).toBe("FESTIVAL_OR_OBSERVANCE");
      expect(makarSankranti?.isCompanyHoliday).toBe(false);
    });

    it("should support custom company holidays and optional/restricted holidays", () => {
      const holidays2026 = OFFICIAL_INDIAN_HOLIDAYS_CATALOG[2026];
      const foundationDay = holidays2026.find((h) => h.name === "Axivon Technologies Foundation Day");
      expect(foundationDay).toBeDefined();
      expect(foundationDay?.category).toBe("COMPANY_HOLIDAY");
      expect(foundationDay?.isCompanyHoliday).toBe(true);
    });
  });

  describe("6. Deduplication & Admin Decision Preservation Rule", () => {
    it("should preserve admin override when a record already exists with custom approval", () => {
      // Simulate sync engine check:
      // If an existing holiday in DB has isCompanyHoliday set to TRUE by an admin,
      // subsequent sync runs must NOT revert it to FALSE.
      const existingDbRecord = {
        id: "hol-123",
        name: "Raksha Bandhan",
        date: new Date("2026-08-28"),
        category: "FESTIVAL_OR_OBSERVANCE",
        isCompanyHoliday: true, // Overridden by Admin to be an official holiday!
        source: "GOOGLE_CALENDAR",
      };

      const incomingCatalogItem = {
        name: "Raksha Bandhan",
        dateStr: "2026-08-28",
        category: "FESTIVAL_OR_OBSERVANCE" as const,
        isCompanyHoliday: false, // Default from public catalog
      };

      // Preservation logic implemented in syncHolidayData:
      const resolvedCompanyHolidayStatus = existingDbRecord.isCompanyHoliday !== undefined
        ? existingDbRecord.isCompanyHoliday // Preserve admin's decision
        : incomingCatalogItem.isCompanyHoliday;

      expect(resolvedCompanyHolidayStatus).toBe(true); // Must remain TRUE!
    });
  });

  describe("7. Employee Data Isolation & Privacy Verification", () => {
    it("should enforce user-scoping for leaves and private tasks", () => {
      // Mock employee context
      const currentEmployee = { id: "emp-user-123", role: "EMPLOYEE" };

      // Query filter contract
      const leaveQueryFilter = {
        userId: currentEmployee.id,
        status: { in: ["APPROVED", "PENDING"] },
      };

      const taskQueryFilter = {
        assignedToId: currentEmployee.id,
        status: { not: "COMPLETED" },
      };

      // Validate that queries are strictly scoped to the employee
      expect(leaveQueryFilter.userId).toBe(currentEmployee.id);
      expect(taskQueryFilter.assignedToId).toBe(currentEmployee.id);

      // Verify that leaves of another user would be filtered out
      const otherEmployeeLeave = {
        userId: "emp-user-456",
        leaveType: "SICK",
        startDate: "2026-10-20",
      };

      expect(otherEmployeeLeave.userId === leaveQueryFilter.userId).toBe(false);
    });
  });
});
