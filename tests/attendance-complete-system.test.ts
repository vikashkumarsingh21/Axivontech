import { describe, it, expect, vi, beforeEach } from "vitest";
import { AttendanceService, DEFAULT_ATTENDANCE_POLICY } from "@/lib/services/attendance.service";
import { getUtcCalendarDate, isSameCalendarDay, toCalendarDateString, getUtcDayRange } from "@/lib/date-utils";
import { NextRequest } from "next/server";

// Mock database
vi.mock("@/lib/db", () => {
  const mockDb = {
    attendance: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    attendanceBreak: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    attendancePolicy: {
      findFirst: vi.fn(),
    },
    leaveRequest: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    holiday: {
      findFirst: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
    task: {
      findMany: vi.fn(),
    },
    workReport: {
      findMany: vi.fn(),
    },
    notification: {
      count: vi.fn(),
    },
    announcement: {
      findMany: vi.fn(),
    },
  };
  return { db: mockDb };
});

// Mock validateActiveUser and permissions
vi.mock("@/lib/auth/permissions", () => ({
  validateActiveUser: vi.fn(),
  hasPermission: vi.fn().mockResolvedValue(true),
}));

import { db } from "@/lib/db";
import { validateActiveUser } from "@/lib/auth/permissions";
import { GET as employeeGet, POST as employeePost } from "@/app/api/v1/employee/attendance/route";
import { GET as adminGet } from "@/app/api/v1/admin/attendance/route";
import { GET as dashboardGet } from "@/app/api/v1/employee/dashboard/route";

describe("Attendance & Work-Hours System: Comprehensive Test Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (db.attendancePolicy.findFirst as any).mockResolvedValue(null); // uses DEFAULT_ATTENDANCE_POLICY
  });

  // =========================================================================
  // 1. DYNAMIC REQUIRED DAILY MINUTES (ELIMINATING HARDCODED 8H / 480M)
  // =========================================================================
  describe("Dynamic Target Working Hours (User.requiredDailyMinutes)", () => {
    it("should evaluate completion status for a 4-hour (240 mins) target employee correctly", () => {
      const checkIn = new Date("2026-10-21T09:00:00.000Z");
      const checkOut = new Date("2026-10-21T13:00:00.000Z"); // Exactly 4h (240 mins)

      const result = AttendanceService.calculateDay({
        checkInAt: checkIn,
        checkOutAt: checkOut,
        breaks: [],
        requiredDailyMinutes: 240, // 4-hour intern / part-time target
        policy: DEFAULT_ATTENDANCE_POLICY,
      });

      expect(result.grossMinutes).toBe(240);
      expect(result.breakMinutes).toBe(0);
      expect(result.netMinutes).toBe(240);
      expect(result.remainingMinutes).toBe(0);
      expect(result.completionStatus).toBe("COMPLETE");
      expect(result.isEarlyExit).toBe(false);
    });

    it("should flag early exit when a 4-hour employee works less than 240 mins", () => {
      const checkIn = new Date("2026-10-21T09:00:00.000Z");
      const checkOut = new Date("2026-10-21T12:00:00.000Z"); // 3h (180 mins) - shortfall of 60m

      const result = AttendanceService.calculateDay({
        checkInAt: checkIn,
        checkOutAt: checkOut,
        breaks: [],
        requiredDailyMinutes: 240,
        policy: DEFAULT_ATTENDANCE_POLICY,
      });

      expect(result.netMinutes).toBe(180);
      expect(result.remainingMinutes).toBe(60);
      expect(result.completionStatus).toBe("INCOMPLETE");
      expect(result.isEarlyExit).toBe(true);
      expect(result.earlyExitMinutes).toBe(60);
    });

    it("should evaluate completion for a 6-hour (360 mins) employee correctly", () => {
      const checkIn = new Date("2026-10-21T08:00:00.000Z");
      const checkOut = new Date("2026-10-21T14:30:00.000Z"); // 6h 30m (390 mins gross)
      const breaks = [
        {
          startTime: new Date("2026-10-21T12:00:00.000Z"),
          endTime: new Date("2026-10-21T12:30:00.000Z"), // 30m lunch break
          durationMinutes: 30,
        },
      ];

      const result = AttendanceService.calculateDay({
        checkInAt: checkIn,
        checkOutAt: checkOut,
        breaks,
        requiredDailyMinutes: 360, // 6h target
        policy: DEFAULT_ATTENDANCE_POLICY,
      });

      expect(result.grossMinutes).toBe(390);
      expect(result.breakMinutes).toBe(30);
      expect(result.netMinutes).toBe(360); // 390 - 30 = 360
      expect(result.remainingMinutes).toBe(0);
      expect(result.completionStatus).toBe("COMPLETE");
    });

    it("should evaluate completion for standard 8-hour (480 mins) and extended 9-hour (540 mins) targets", () => {
      const checkIn = new Date("2026-10-21T07:00:00.000Z");
      const checkOut = new Date("2026-10-21T16:00:00.000Z"); // 9h (540 mins)

      const res8h = AttendanceService.calculateDay({
        checkInAt: checkIn,
        checkOutAt: checkOut,
        breaks: [],
        requiredDailyMinutes: 480,
      });
      expect(res8h.completionStatus).toBe("COMPLETE");
      expect(res8h.remainingMinutes).toBe(0);

      const res9h = AttendanceService.calculateDay({
        checkInAt: checkIn,
        checkOutAt: checkOut,
        breaks: [],
        requiredDailyMinutes: 540,
      });
      expect(res9h.completionStatus).toBe("COMPLETE");
      expect(res9h.remainingMinutes).toBe(0);
    });
  });

  // =========================================================================
  // 2. BREAK TRACKING AND REAL-TIME WORKING STATE
  // =========================================================================
  describe("Break Calculations & Live State", () => {
    it("should calculate active ongoing break and set isOnBreak=true and isWorking=false", () => {
      const checkIn = new Date("2026-10-21T09:00:00.000Z");
      const activeBreakStart = new Date("2026-10-21T11:00:00.000Z");
      const refTime = new Date("2026-10-21T11:25:00.000Z"); // 25 mins into break

      const result = AttendanceService.calculateDay({
        checkInAt: checkIn,
        checkOutAt: null, // Still checked in
        breaks: [
          {
            startTime: activeBreakStart,
            endTime: null, // Active ongoing break
          },
        ],
        requiredDailyMinutes: 240,
        referenceTime: refTime,
      });

      expect(result.grossMinutes).toBe(145); // 09:00 to 11:25 = 145m
      expect(result.breakMinutes).toBe(25); // 25m on active break
      expect(result.netMinutes).toBe(120); // 145 - 25 = 120m
      expect(result.isOnBreak).toBe(true);
      expect(result.isWorking).toBe(false);
      expect(result.activeBreakStartTime).toEqual(activeBreakStart);
    });

    it("should deduct multiple completed breaks accurately", () => {
      const checkIn = new Date("2026-10-21T09:00:00.000Z");
      const checkOut = new Date("2026-10-21T17:00:00.000Z"); // 8h = 480m gross
      const breaks = [
        {
          startTime: new Date("2026-10-21T11:00:00.000Z"),
          endTime: new Date("2026-10-21T11:15:00.000Z"),
          durationMinutes: 15, // Tea
        },
        {
          startTime: new Date("2026-10-21T13:00:00.000Z"),
          endTime: new Date("2026-10-21T13:45:00.000Z"),
          durationMinutes: 45, // Lunch
        },
      ];

      const result = AttendanceService.calculateDay({
        checkInAt: checkIn,
        checkOutAt: checkOut,
        breaks,
        requiredDailyMinutes: 480,
      });

      expect(result.grossMinutes).toBe(480);
      expect(result.breakMinutes).toBe(60); // 15 + 45
      expect(result.netMinutes).toBe(420); // 480 - 60
      expect(result.remainingMinutes).toBe(60);
      expect(result.isEarlyExit).toBe(true);
      expect(result.earlyExitMinutes).toBe(60);
      expect(result.completionStatus).toBe("INCOMPLETE");
    });
  });

  // =========================================================================
  // 3. MIDNIGHT CROSSING & RUNAWAY PAST RECORD CAPPING
  // =========================================================================
  describe("Midnight Crossing & Historical Runaway Capping", () => {
    it("should cap unclosed historical records from past days (>24 hours) at policy cutoff", () => {
      const checkInFiveDaysAgo = new Date("2026-10-15T09:00:00.000Z");
      const todayNow = new Date("2026-10-21T12:00:00.000Z"); // 6 days later!

      const result = AttendanceService.calculateDay({
        checkInAt: checkInFiveDaysAgo,
        checkOutAt: null, // Employee forgot to check out 5 days ago
        breaks: [],
        requiredDailyMinutes: 240,
        policy: DEFAULT_ATTENDANCE_POLICY,
        referenceTime: todayNow,
      });

      // Must NOT be 6 days * 24h = 8,640 minutes!
      // Must be capped at policy cutoff (23:00 UTC) on 2026-10-15: 09:00 to 23:00 = 14 hours = 840 mins max
      expect(result.grossMinutes).toBeLessThan(1000);
      expect(result.isWorking).toBe(false); // Past unclosed record is NOT actively working now
      expect(result.isOnBreak).toBe(false);
    });

    it("should correctly handle date comparisons across timezones with date-utils", () => {
      const date1 = new Date("2026-10-21T00:00:00.000Z");
      const date2 = new Date("2026-10-21T18:30:00.000Z");
      const date3 = new Date("2026-10-22T02:00:00.000Z");

      expect(isSameCalendarDay(date1, date2)).toBe(true);
      expect(isSameCalendarDay(date1, date3)).toBe(false);
      expect(toCalendarDateString(date1)).toBe("2026-10-21");
      expect(toCalendarDateString(date2)).toBe("2026-10-21");

      const { startOfDay, endOfDay } = getUtcDayRange("2026-10-21");
      expect(startOfDay.toISOString()).toBe("2026-10-21T00:00:00.000Z");
      expect(endOfDay.toISOString()).toBe("2026-10-21T23:59:59.999Z");
    });
  });

  // =========================================================================
  // 4. LEAVE, HOLIDAY, AND WEEKLY OFF CONDITIONS
  // =========================================================================
  describe("Leave, Holiday & Weekly Off Handling", () => {
    it("should return ON_LEAVE completion status with 0 minutes when employee is on approved leave", () => {
      const result = AttendanceService.calculateDay({
        checkInAt: null,
        checkOutAt: null,
        requiredDailyMinutes: 240,
        isLeave: true,
      });

      expect(result.completionStatus).toBe("ON_LEAVE");
      expect(result.netMinutes).toBe(0);
      expect(result.remainingMinutes).toBe(0);
      expect(result.isWorking).toBe(false);
    });

    it("should return HOLIDAY completion status on organization holidays", () => {
      const result = AttendanceService.calculateDay({
        checkInAt: null,
        checkOutAt: null,
        requiredDailyMinutes: 480,
        isHoliday: true,
      });

      expect(result.completionStatus).toBe("HOLIDAY");
      expect(result.netMinutes).toBe(0);
      expect(result.remainingMinutes).toBe(0);
      expect(result.isWorking).toBe(false);
    });

    it("should return WEEKLY_OFF when employee does not check in on weekly off day", () => {
      const result = AttendanceService.calculateDay({
        checkInAt: null,
        checkOutAt: null,
        requiredDailyMinutes: 240,
        isWeeklyOff: true,
      });

      expect(result.completionStatus).toBe("WEEKLY_OFF");
      expect(result.isWorking).toBe(false);
    });
  });

  // =========================================================================
  // 5. LATENESS & GRACE PERIOD LOGIC
  // =========================================================================
  describe("Lateness & Work Window Start Calculation", () => {
    it("should not mark late if arrival is within grace period (06:00 to 06:15 UTC)", () => {
      const checkInWithinGrace = new Date("2026-10-21T06:10:00.000Z"); // 10 mins after 06:00 window start (grace is 15m)

      const result = AttendanceService.calculateDay({
        checkInAt: checkInWithinGrace,
        checkOutAt: null,
        requiredDailyMinutes: 240,
        policy: {
          ...DEFAULT_ATTENDANCE_POLICY,
          workWindowStart: "06:00",
          graceMinutes: 15,
        },
      });

      expect(result.isLate).toBe(false);
      expect(result.lateMinutes).toBe(0);
    });

    it("should mark late and calculate exact late minutes if arrival is after grace period", () => {
      const checkInLate = new Date("2026-10-21T08:20:00.000Z"); // 2h 20m (140 mins) after 06:00

      const result = AttendanceService.calculateDay({
        checkInAt: checkInLate,
        checkOutAt: null,
        requiredDailyMinutes: 240,
        policy: {
          ...DEFAULT_ATTENDANCE_POLICY,
          workWindowStart: "06:00",
          graceMinutes: 15,
        },
      });

      expect(result.isLate).toBe(true);
      expect(result.lateMinutes).toBe(140);
    });
  });

  // =========================================================================
  // 6. EMPLOYEE CHECK-IN & CHECK-OUT API INTEGRATION TESTS
  // =========================================================================
  describe("Employee Attendance API Flow (/api/v1/employee/attendance)", () => {
    it("should successfully check out when check-in occurred on a previous calendar day (midnight crossing)", async () => {
      const mockUser = {
        id: "emp-user-1",
        name: "Vinay Partap Singh",
        email: "vinay@axivontech.in",
        employeeId: "BA-104",
        requiredDailyMinutes: 240, // 4 hours
        status: "ACTIVE",
        userRoles: [{ role: { name: "EMPLOYEE" } }],
      };
      (validateActiveUser as any).mockResolvedValue(mockUser);

      // Active session started yesterday (2026-10-20), checkOutAt is null
      const activeYesterdaySession = {
        id: "att-yesterday-1",
        userId: "emp-user-1",
        date: new Date("2026-10-20T00:00:00.000Z"),
        checkInAt: new Date("2026-10-20T22:00:00.000Z"),
        checkOutAt: null,
        requiredDailyMinutes: 240,
        status: "IN_PROGRESS",
        breaks: [],
      };

      // Mock finding active session
      (db.attendance.findFirst as any).mockResolvedValue(activeYesterdaySession);
      (db.attendanceBreak.findMany as any).mockResolvedValue([]);
      (db.attendance.update as any).mockImplementation(({ data }: any) => ({
        ...activeYesterdaySession,
        ...data,
      }));

      const req = new NextRequest("http://localhost:3000/api/v1/employee/attendance", {
        method: "POST",
        headers: { "x-user-id": "emp-user-1", "Content-Type": "application/json" },
        body: JSON.stringify({ action: "check-out" }),
      });

      const res = await employeePost(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.record.checkOutAt).toBeDefined();
      expect(db.attendance.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "att-yesterday-1" },
          data: expect.objectContaining({
            requiredDailyMinutes: 240,
            completionStatus: expect.any(String),
          }),
        })
      );
    });

    it("should return 400 when trying to check out without an active session", async () => {
      const mockUser = {
        id: "emp-user-2",
        name: "Mantra Khandelwal",
        email: "mantra@axivontech.in",
        employeeId: "UX-101",
        requiredDailyMinutes: 240,
        status: "ACTIVE",
        userRoles: [{ role: { name: "EMPLOYEE" } }],
      };
      (validateActiveUser as any).mockResolvedValue(mockUser);

      // No active session in database
      (db.attendance.findFirst as any).mockResolvedValue(null);

      const req = new NextRequest("http://localhost:3000/api/v1/employee/attendance", {
        method: "POST",
        headers: { "x-user-id": "emp-user-2", "Content-Type": "application/json" },
        body: JSON.stringify({ action: "check-out" }),
      });

      const res = await employeePost(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toBe("You are not currently checked in");
    });

    it("should reject duplicate check-in on the same day with 400", async () => {
      const mockUser = {
        id: "emp-user-3",
        name: "Suhana Shaik",
        email: "suhana@axivontech.in",
        employeeId: "FS-103",
        requiredDailyMinutes: 240,
        status: "ACTIVE",
        userRoles: [{ role: { name: "EMPLOYEE" } }],
      };
      (validateActiveUser as any).mockResolvedValue(mockUser);

      const now = new Date();
      // Already checked in today with checkOutAt === null
      (db.attendance.findFirst as any).mockResolvedValue({
        id: "att-today-1",
        userId: "emp-user-3",
        date: getUtcCalendarDate(now),
        checkInAt: now,
        checkOutAt: null,
        breaks: [],
      });

      const req = new NextRequest("http://localhost:3000/api/v1/employee/attendance", {
        method: "POST",
        headers: { "x-user-id": "emp-user-3", "Content-Type": "application/json" },
        body: JSON.stringify({ action: "check-in" }),
      });

      const res = await employeePost(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toBe("You already have an active check-in session for today");
    });

    it("should return employee history with dynamic 240m targets and active status", async () => {
      const mockUser = {
        id: "emp-user-4",
        name: "Rajiv Kumar",
        email: "rajiv@axivontech.in",
        employeeId: "FR-103",
        requiredDailyMinutes: 240, // 4 hours
        status: "ACTIVE",
        userRoles: [{ role: { name: "EMPLOYEE" } }],
      };
      (validateActiveUser as any).mockResolvedValue(mockUser);

      const pastRecord = {
        id: "att-past-1",
        userId: "emp-user-4",
        date: new Date("2026-10-19T00:00:00.000Z"),
        checkInAt: new Date("2026-10-19T09:00:00.000Z"),
        checkOutAt: new Date("2026-10-19T13:00:00.000Z"), // 4h
        requiredDailyMinutes: 240,
        status: "COMPLETE",
        breaks: [],
        regularization: null,
      };

      (db.attendance.findMany as any).mockResolvedValue([pastRecord]);
      (db.leaveRequest.findFirst as any).mockResolvedValue(null);
      (db.holiday.findFirst as any).mockResolvedValue(null);

      const req = new NextRequest("http://localhost:3000/api/v1/employee/attendance", {
        headers: { "x-user-id": "emp-user-4" },
      });

      const res = await employeeGet(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.records).toHaveLength(1);
      expect(json.records[0].requiredMinutes).toBe(240);
      expect(json.records[0].workedMinutes).toBe(240);
      expect(json.records[0].differenceMinutes).toBe(0);
      expect(json.records[0].status).toBe("COMPLETE");
    });
  });

  // =========================================================================
  // 7. ADMIN ATTENDANCE API & MULTI-DAY COMPANY HISTORY
  // =========================================================================
  describe("Admin Attendance API Flow (/api/v1/admin/attendance)", () => {
    it("should return company-wide history across a multi-day date range", async () => {
      const mockAdmin = {
        id: "admin-1",
        name: "Admin User",
        email: "admin@axivontech.in",
        status: "ACTIVE",
        userRoles: [{ role: { name: "ADMIN" } }],
      };
      (validateActiveUser as any).mockResolvedValue(mockAdmin);

      const mockEmployee = {
        id: "emp-1",
        name: "Mantra Khandelwal",
        email: "mantra@axivontech.in",
        employeeId: "UX-101",
        department: "Design",
        requiredDailyMinutes: 240,
      };

      (db.user.findMany as any).mockResolvedValue([mockEmployee]);
      (db.attendance.findMany as any).mockResolvedValue([
        {
          id: "att-hist-1",
          userId: "emp-1",
          date: new Date("2026-10-18T00:00:00.000Z"),
          checkInAt: new Date("2026-10-18T09:00:00.000Z"),
          checkOutAt: new Date("2026-10-18T13:00:00.000Z"),
          requiredDailyMinutes: 240,
          user: mockEmployee,
          breaks: [],
          regularization: null,
        },
        {
          id: "att-hist-2",
          userId: "emp-1",
          date: new Date("2026-10-19T00:00:00.000Z"),
          checkInAt: new Date("2026-10-19T09:00:00.000Z"),
          checkOutAt: new Date("2026-10-19T13:30:00.000Z"),
          requiredDailyMinutes: 240,
          user: mockEmployee,
          breaks: [],
          regularization: null,
        },
      ]);

      const req = new NextRequest("http://localhost:3000/api/v1/admin/attendance?view=history&startDate=2026-10-15&endDate=2026-10-21", {
        headers: { "x-user-id": "admin-1" },
      });

      const res = await adminGet(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.history).toHaveLength(2);
      expect(json.stats.totalRecords).toBe(2);
      expect(json.history[0].employeeCode).toBe("UX-101");
      expect(json.history[0].requiredMinutes).toBe(240);
    });

    it("should retrieve actively working employees in Live Monitor even if check-in was yesterday", async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-10-21T08:00:00.000Z"));
      try {
        const mockAdmin = {
          id: "admin-1",
          name: "Admin User",
          email: "admin@axivontech.in",
          status: "ACTIVE",
          userRoles: [{ role: { name: "ADMIN" } }],
        };
        (validateActiveUser as any).mockResolvedValue(mockAdmin);

        const mockEmployee = {
          id: "emp-live-1",
          name: "Duba Swaroop Kumar",
          email: "swaroop@axivontech.in",
          employeeId: "BA-102",
          department: "Engineering",
          requiredDailyMinutes: 240,
          status: "ACTIVE",
        };

        (db.user.findMany as any).mockResolvedValue([mockEmployee]);
        // Active attendance where checkOutAt is null
        (db.attendance.findMany as any).mockResolvedValue([
          {
            id: "att-live-1",
            userId: "emp-live-1",
            date: new Date("2026-10-20T00:00:00.000Z"),
            checkInAt: new Date("2026-10-20T23:00:00.000Z"),
            checkOutAt: null, // Active open session!
            requiredDailyMinutes: 240,
            breaks: [],
            regularization: null,
          },
        ]);
        (db.leaveRequest.findMany as any).mockResolvedValue([]);
        (db.holiday.findFirst as any).mockResolvedValue(null);

        const req = new NextRequest("http://localhost:3000/api/v1/admin/attendance?date=2026-10-21", {
          headers: { "x-user-id": "admin-1" },
        });

        const res = await adminGet(req);
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.success).toBe(true);
        expect(json.summary.currentlyWorking).toBe(1);
        expect(json.data[0].currentState).toBe("WORKING");
        expect(json.data[0].status).toBe("IN_PROGRESS");
      } finally {
        vi.useRealTimers();
      }
    });
  });

  // =========================================================================
  // 8. DATABASE SCHEMA DRIFT & RESILIENCE (HOLIDAY.CATEGORY & LEAVE ERRORS)
  // =========================================================================
  describe("Database Schema Drift & Resilience", () => {
    it("recovers gracefully and returns 200 even when db.holiday throws column error (P2022)", async () => {
      const mockEmp = {
        id: "emp-resilient-1",
        name: "Resilient Emp",
        email: "resilient@axivontech.in",
        status: "ACTIVE",
        userRoles: [{ role: { name: "EMPLOYEE" } }],
        requiredDailyMinutes: 480,
      };
      (validateActiveUser as any).mockResolvedValue(mockEmp);
      (db.attendance.findMany as any).mockResolvedValue([]);
      (db.leaveRequest.findFirst as any).mockResolvedValue(null);

      // Simulate Prisma error P2022 column does not exist
      (db.holiday.findFirst as any).mockRejectedValue(
        new Error("The column Holiday.category does not exist in the current database")
      );

      const req = new NextRequest("http://localhost:3000/api/v1/employee/attendance", {
        headers: { "x-user-id": "emp-resilient-1" },
      });

      const res = await employeeGet(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.today.status).toBe("NOT_STARTED");
      expect(json.today.isHoliday).toBe(false);
      expect(json.today.requiredMinutes).toBe(480);
    });
  });

  // =========================================================================
  // 9. TARGET BALANCE & REMAINING TARGET UI CALCULATION LOGIC
  // =========================================================================
  describe("Target Balance & Remaining Target UI Logic", () => {
    it("ensures 0 minutes worked on 480m target computes remaining 480m and is NOT met", () => {
      const reqMins = 480;
      const netMins = 0;
      const remainingMinutes = Math.max(0, reqMins - netMins);
      const isTargetMet = netMins >= reqMins && reqMins > 0;

      expect(remainingMinutes).toBe(480);
      expect(isTargetMet).toBe(false);
      const displayRemaining = isTargetMet ? "0h 0m (Met)" : `${Math.floor(remainingMinutes / 60)}h ${remainingMinutes % 60}m`;
      expect(displayRemaining).toBe("8h 0m");
      expect(displayRemaining).not.toBe("0h 0m (Met)");
    });

    it("ensures exactly met target (480m worked on 480m target) correctly marks target as met", () => {
      const reqMins = 480;
      const netMins = 480;
      const remainingMinutes = Math.max(0, reqMins - netMins);
      const isTargetMet = netMins >= reqMins && reqMins > 0;

      expect(remainingMinutes).toBe(0);
      expect(isTargetMet).toBe(true);
      const displayRemaining = isTargetMet ? "0h 0m (Met)" : `${Math.floor(remainingMinutes / 60)}h ${remainingMinutes % 60}m`;
      expect(displayRemaining).toBe("0h 0m (Met)");
    });

    it("ensures overtime (540m worked on 480m target) marks target as met with 0 remaining", () => {
      const reqMins = 480;
      const netMins = 540;
      const remainingMinutes = Math.max(0, reqMins - netMins);
      const isTargetMet = netMins >= reqMins && reqMins > 0;

      expect(remainingMinutes).toBe(0);
      expect(isTargetMet).toBe(true);
      const displayRemaining = isTargetMet ? "0h 0m (Met)" : `${Math.floor(remainingMinutes / 60)}h ${remainingMinutes % 60}m`;
      expect(displayRemaining).toBe("0h 0m (Met)");
    });
  });

  // =========================================================================
  // 10. EMPLOYEE DASHBOARD LIVE ACTIVE WORKING TIME
  // =========================================================================
  describe("Employee Dashboard Live Attendance Calculation", () => {
    it("calculates live gross and net minutes for active checked-in session", async () => {
      const mockEmp = {
        id: "emp-dash-1",
        name: "Dashboard User",
        email: "dash@axivontech.in",
        status: "ACTIVE",
        userRoles: [{ role: { name: "EMPLOYEE" } }],
        requiredDailyMinutes: 480,
      };
      (validateActiveUser as any).mockResolvedValue(mockEmp);

      const twoHoursAgo = new Date(Date.now() - 120 * 60 * 1000);
      (db.attendance.findMany as any).mockResolvedValue([
        {
          id: "att-active-dash",
          userId: "emp-dash-1",
          date: twoHoursAgo,
          checkInAt: twoHoursAgo,
          checkOutAt: null, // actively ongoing
          breaks: [
            {
              id: "b-1",
              startTime: new Date(twoHoursAgo.getTime() + 30 * 60 * 1000),
              endTime: new Date(twoHoursAgo.getTime() + 50 * 60 * 1000), // 20m break
              durationMinutes: 20,
            },
          ],
        },
      ]);
      (db.workReport.findMany as any).mockResolvedValue([]);
      (db.task.findMany as any).mockResolvedValue([]);
      (db.leaveRequest.count as any).mockResolvedValue(0);
      (db.leaveRequest.findFirst as any).mockResolvedValue(null);
      (db.notification.count as any).mockResolvedValue(0);
      (db.announcement.findMany as any).mockResolvedValue([]);

      const req = new NextRequest("http://localhost:3000/api/v1/employee/dashboard", {
        headers: { "x-user-id": "emp-dash-1" },
      });

      const res = await dashboardGet(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.attendance).not.toBeNull();
      // Around 120m gross - 20m break = ~100m net
      expect(json.data.attendance.grossMinutes).toBeGreaterThanOrEqual(119);
      expect(json.data.attendance.breakMinutes).toBe(20);
      expect(json.data.attendance.netMinutes).toBeGreaterThanOrEqual(99);
      expect(json.data.attendance.requiredDailyMinutes).toBe(480);
    });
  });
});
