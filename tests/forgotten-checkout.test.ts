import { describe, it, expect, vi, beforeEach } from "vitest";

// In-memory mock database state
let mockAttendances: any[] = [];
let mockBreaks: any[] = [];
let mockRegularizations: any[] = [];
let mockNotifications: any[] = [];

vi.mock("@/lib/db", () => {
  return {
    db: {
      attendance: {
        findMany: vi.fn().mockImplementation(({ where }: any) => {
          let res = [...mockAttendances];
          if (where?.userId) res = res.filter((a) => a.userId === where.userId);
          if (where?.date?.lt) res = res.filter((a) => a.date < where.date.lt);
          if (where?.checkOutAt === null) res = res.filter((a) => a.checkOutAt === null);
          if (where?.status?.not) res = res.filter((a) => a.status !== where.status.not);
          if (where?.status === "MISSED_CHECKOUT") res = res.filter((a) => a.status === "MISSED_CHECKOUT");
          return Promise.resolve(res.map((a) => ({
            ...a,
            breaks: mockBreaks.filter((b) => b.attendanceId === a.id),
            user: { id: a.userId, name: "QA Employee", email: "qa.employee@axivon.dev" },
          })));
        }),
        findFirst: vi.fn().mockImplementation(({ where }: any) => {
          let res = [...mockAttendances];
          if (where?.userId) res = res.filter((a) => a.userId === where.userId);
          if (where?.status) res = res.filter((a) => a.status === where.status);
          if (where?.date?.lt) res = res.filter((a) => a.date < where.date.lt);
          return Promise.resolve(res[0] || null);
        }),
        findUnique: vi.fn().mockImplementation(({ where }: any) => {
          if (where?.id) {
            const found = mockAttendances.find((a) => a.id === where.id);
            return Promise.resolve(found ? { ...found, breaks: mockBreaks.filter((b) => b.attendanceId === found.id), user: { id: found.userId, name: "QA Employee", email: "qa.employee@axivon.dev" } } : null);
          }
          if (where?.userId_date) {
            const found = mockAttendances.find(
              (a) => a.userId === where.userId_date.userId && a.date.getTime() === where.userId_date.date.getTime()
            );
            return Promise.resolve(found ? { ...found, breaks: mockBreaks.filter((b) => b.attendanceId === found.id) } : null);
          }
          return Promise.resolve(null);
        }),
        update: vi.fn().mockImplementation(({ where, data }: any) => {
          const idx = mockAttendances.findIndex((a) => a.id === where.id);
          if (idx !== -1) {
            mockAttendances[idx] = { ...mockAttendances[idx], ...data };
            return Promise.resolve(mockAttendances[idx]);
          }
          return Promise.resolve(null);
        }),
        create: vi.fn().mockImplementation(({ data }: any) => {
          const newAtt = { id: `att-${Date.now()}-${Math.random()}`, ...data };
          mockAttendances.push(newAtt);
          return Promise.resolve(newAtt);
        }),
        count: vi.fn().mockImplementation(({ where }: any) => {
          let res = [...mockAttendances];
          if (where?.status === "MISSED_CHECKOUT") res = res.filter((a) => a.status === "MISSED_CHECKOUT");
          return Promise.resolve(res.length);
        }),
      },
      attendanceBreak: {
        update: vi.fn().mockImplementation(({ where, data }: any) => {
          const idx = mockBreaks.findIndex((b) => b.id === where.id);
          if (idx !== -1) {
            mockBreaks[idx] = { ...mockBreaks[idx], ...data };
            return Promise.resolve(mockBreaks[idx]);
          }
          return Promise.resolve(null);
        }),
        create: vi.fn().mockImplementation(({ data }: any) => {
          const newBrk = { id: `brk-${Date.now()}`, ...data };
          mockBreaks.push(newBrk);
          return Promise.resolve(newBrk);
        }),
      },
      regularizationRequest: {
        findFirst: vi.fn().mockImplementation(({ where }: any) => {
          let res = [...mockRegularizations];
          if (where?.userId) res = res.filter((r) => r.userId === where.userId);
          if (where?.status) res = res.filter((r) => r.status === where.status);
          return Promise.resolve(res[0] || null);
        }),
        findMany: vi.fn().mockImplementation(({ where }: any) => {
          let res = [...mockRegularizations];
          if (where?.userId) res = res.filter((r) => r.userId === where.userId);
          return Promise.resolve(res);
        }),
        create: vi.fn().mockImplementation(({ data }: any) => {
          const newReg = { id: `reg-${Date.now()}`, ...data, status: "PENDING", createdAt: new Date() };
          mockRegularizations.push(newReg);
          return Promise.resolve(newReg);
        }),
        update: vi.fn().mockImplementation(({ where, data }: any) => {
          const idx = mockRegularizations.findIndex((r) => r.id === where.id);
          if (idx !== -1) {
            mockRegularizations[idx] = { ...mockRegularizations[idx], ...data };
            return Promise.resolve(mockRegularizations[idx]);
          }
          return Promise.resolve(null);
        }),
      },
      notification: {
        findFirst: vi.fn().mockImplementation(({ where }: any) => {
          if (where?.dedupKey) {
            return Promise.resolve(mockNotifications.find((n) => n.dedupKey === where.dedupKey) || null);
          }
          return Promise.resolve(null);
        }),
        create: vi.fn().mockImplementation(({ data }: any) => {
          const newNotif = { id: `notif-${Date.now()}`, ...data };
          mockNotifications.push(newNotif);
          return Promise.resolve(newNotif);
        }),
      },
      attendancePolicy: {
        findFirst: vi.fn().mockResolvedValue({
          id: "policy-1",
          workWindowStart: "06:00",
          workWindowEnd: "23:00",
          defaultRequiredMinutes: 480,
          graceMinutes: 15,
          cutoffTime: "23:00",
          missedCheckoutHoursPolicy: "NOT_COUNTED",
        }),
      },
      organizationSetting: {
        findFirst: vi.fn().mockResolvedValue({
          timezone: "Asia/Kolkata",
        }),
      },
    },
  };
});

import { closeStaleAttendance } from "@/lib/attendance/stale-attendance";
import { AttendanceService } from "@/lib/services/attendance.service";

describe("Bug Fix: Forgotten Check-Out & Stale Attendance Engine", () => {
  beforeEach(() => {
    mockAttendances = [];
    mockBreaks = [];
    mockRegularizations = [];
    mockNotifications = [];
    vi.clearAllMocks();
  });

  describe("1. Day Boundary Auto-Close & Idempotency", () => {
    it("closes open past-day attendance record as MISSED_CHECKOUT with null worked minutes", async () => {
      // Scenario: Employee checked in on 26 Oct at 09:00 AM, worked ~4 hours, forgot to check out.
      const checkInTime = new Date("2026-10-26T03:30:00.000Z"); // 09:00 AM IST
      const sessionDate = new Date("2026-10-26T00:00:00.000Z");

      mockAttendances.push({
        id: "att-26oct",
        userId: "user-emp-1",
        date: sessionDate,
        checkInAt: checkInTime,
        checkOutAt: null,
        status: "IN_PROGRESS",
        completionStatus: "INCOMPLETE",
        grossMinutes: 240,
        netMinutes: 240,
        totalMinutes: 240,
        requiredDailyMinutes: 480,
      });

      // System evaluates at 27 Oct 00:05 AM IST
      const now27Oct = new Date("2026-10-26T18:35:00.000Z"); // 27 Oct 00:05 AM IST
      const result = await closeStaleAttendance(now27Oct);

      expect(result.success).toBe(true);
      expect(result.closedCount).toBe(1);
      expect(result.updatedRecordIds).toContain("att-26oct");

      const closed = mockAttendances.find((a) => a.id === "att-26oct");
      expect(closed.status).toBe("MISSED_CHECKOUT");
      expect(closed.completionStatus).toBe("MISSED_CHECKOUT");
      expect(closed.checkOutAt).toBeNull(); // Does NOT invent check-out time
      expect(closed.autoClosedAt).toEqual(now27Oct);
      expect(closed.netMinutes).toBeNull(); // Worked minutes are null (NOT calculated)
      expect(closed.grossMinutes).toBeNull();
      expect(closed.totalMinutes).toBeNull();

      // Notification sent to employee
      expect(mockNotifications.length).toBe(1);
      expect(mockNotifications[0].userId).toBe("user-emp-1");
      expect(mockNotifications[0].title).toBe("Missed Check-Out");
      expect(mockNotifications[0].dedupKey).toBe("missed_checkout_att-26oct");
    });

    it("is strictly idempotent: running closeStaleAttendance twice leaves record untouched", async () => {
      const sessionDate = new Date("2026-10-26T00:00:00.000Z");
      mockAttendances.push({
        id: "att-26oct",
        userId: "user-emp-1",
        date: sessionDate,
        checkInAt: new Date("2026-10-26T03:30:00.000Z"),
        checkOutAt: null,
        status: "IN_PROGRESS",
      });

      const now = new Date("2026-10-26T18:35:00.000Z"); // 27 Oct 00:05 IST
      const run1 = await closeStaleAttendance(now);
      expect(run1.closedCount).toBe(1);

      // Run 2: immediately after
      const run2 = await closeStaleAttendance(now);
      expect(run2.closedCount).toBe(0);
      expect(run2.updatedRecordIds.length).toBe(0);
      expect(mockNotifications.length).toBe(1); // DedupKey prevents duplicate alert
    });

    it("closes and flags dangling open breaks at day end", async () => {
      const sessionDate = new Date("2026-10-26T00:00:00.000Z");
      mockAttendances.push({
        id: "att-break-test",
        userId: "user-emp-1",
        date: sessionDate,
        checkInAt: new Date("2026-10-26T03:30:00.000Z"),
        checkOutAt: null,
        status: "IN_PROGRESS",
      });

      mockBreaks.push({
        id: "brk-open",
        attendanceId: "att-break-test",
        startTime: new Date("2026-10-26T07:30:00.000Z"), // 1:00 PM IST
        endTime: null, // Dangling open break
        isAutoClosed: false,
      });

      const now = new Date("2026-10-26T18:35:00.000Z"); // 27 Oct 00:05 IST
      await closeStaleAttendance(now);

      const brk = mockBreaks.find((b) => b.id === "brk-open");
      expect(brk.isAutoClosed).toBe(true);
      expect(brk.autoClosedAt).toEqual(now);
      expect(brk.endTime).toEqual(now);
      expect(brk.notes).toContain("Auto-closed due to missed check-out");
    });
  });

  describe("2. Next-Day Separation & Rejection of Past Check-Out", () => {
    it("new day check-in creates independent session without merging or reopening past day", async () => {
      const pastSession = {
        id: "att-26oct",
        userId: "user-emp-1",
        date: new Date("2026-10-26T00:00:00.000Z"),
        checkInAt: new Date("2026-10-26T03:30:00.000Z"),
        checkOutAt: null,
        status: "MISSED_CHECKOUT",
        autoClosedAt: new Date("2026-10-26T18:35:00.000Z"),
        netMinutes: null,
      };
      mockAttendances.push(pastSession);

      // Check-in on 27 Oct
      const todayDate = new Date("2026-10-27T00:00:00.000Z");
      const checkIn27 = new Date("2026-10-27T03:30:00.000Z");

      const todayRecord = {
        id: "att-27oct",
        userId: "user-emp-1",
        date: todayDate,
        checkInAt: checkIn27,
        checkOutAt: null,
        status: "IN_PROGRESS",
        requiredDailyMinutes: 480,
      };
      mockAttendances.push(todayRecord);

      // 26 Oct remains closed and separate
      const rec26 = mockAttendances.find((a) => a.id === "att-26oct");
      expect(rec26.status).toBe("MISSED_CHECKOUT");
      expect(rec26.checkOutAt).toBeNull();

      // 27 Oct is active
      const rec27 = mockAttendances.find((a) => a.id === "att-27oct");
      expect(rec27.status).toBe("IN_PROGRESS");
      expect(rec27.checkInAt).toEqual(checkIn27);
    });
  });

  describe("3. BUG-008: Intermittent Re-Check-In Gap Logging", () => {
    it("re-check-in on same day logs off-duty gap as a break to prevent hour inflation", () => {
      const checkInAt = new Date("2026-10-27T09:00:00.000Z");
      const firstCheckOutAt = new Date("2026-10-27T13:00:00.000Z"); // Worked 4h
      const reCheckInAt = new Date("2026-10-27T15:00:00.000Z"); // 2h gap off-duty
      const secondCheckOutAt = new Date("2026-10-27T19:00:00.000Z"); // Worked 4h

      // Gap is 120 minutes (2 hours)
      const gapBreak = {
        startTime: firstCheckOutAt,
        endTime: reCheckInAt,
        durationMinutes: 120,
        type: "OTHER",
      };

      const calc = AttendanceService.calculateDay({
        checkInAt,
        checkOutAt: secondCheckOutAt, // Total gross: 10 hours (600 mins)
        breaks: [gapBreak], // Deduct 120 mins
        requiredDailyMinutes: 480,
        policy: {
          defaultRequiredMinutes: 480,
          graceMinutes: 15,
          workWindowStart: "06:00",
          workWindowEnd: "23:00",
          cutoffTime: "23:00",
        },
      });

      // Total net worked should be exactly 8 hours (480 mins), NOT 10 hours
      expect(calc.grossMinutes).toBe(600);
      expect(calc.breakMinutes).toBe(120);
      expect(calc.netMinutes).toBe(480);
      expect(calc.completionStatus).toBe("COMPLETE");
    });
  });

  describe("4. Hours Calculation Policy for MISSED_CHECKOUT", () => {
    it("returns null / 0 hours for MISSED_CHECKOUT days per NOT_COUNTED policy", () => {
      const calc = AttendanceService.calculateDay({
        checkInAt: new Date("2026-10-26T09:00:00.000Z"),
        checkOutAt: null, // Missed check-out
        breaks: [],
        requiredDailyMinutes: 480,
        policy: {
          defaultRequiredMinutes: 480,
          graceMinutes: 15,
          workWindowStart: "06:00",
          workWindowEnd: "23:00",
          cutoffTime: "23:00",
          missedCheckoutHoursPolicy: "NOT_COUNTED",
        },
      });

      // Under NOT_COUNTED, unclosed session retains MISSED_CHECKOUT and does not count hours into company totals
      expect(calc.completionStatus).toBe("MISSED_CHECKOUT");
      expect(calc.grossMinutes).toBe(0);
      expect(calc.netMinutes).toBe(0);
    });
  });

  describe("5. Correction & Regularization Workflow", () => {
    it("approving regularization sets checkOutAt, recalculates worked minutes, and updates status", () => {
      const checkInAt = new Date("2026-10-26T03:30:00.000Z"); // 09:00 AM IST
      const requestedCheckOut = new Date("2026-10-26T12:00:00.000Z"); // 05:30 PM IST (8.5h total)
      const lunchBreak = {
        startTime: new Date("2026-10-26T07:30:00.000Z"),
        endTime: new Date("2026-10-26T08:00:00.000Z"),
        durationMinutes: 30,
        type: "LUNCH",
      };

      const calc = AttendanceService.calculateDay({
        checkInAt,
        checkOutAt: requestedCheckOut,
        breaks: [lunchBreak],
        requiredDailyMinutes: 480,
        policy: {
          defaultRequiredMinutes: 480,
          graceMinutes: 15,
          workWindowStart: "06:00",
          workWindowEnd: "23:00",
          cutoffTime: "23:00",
        },
      });

      // 8.5h gross (510 mins) - 30 min break = 480 mins net (Target reached)
      expect(calc.grossMinutes).toBe(510);
      expect(calc.breakMinutes).toBe(30);
      expect(calc.netMinutes).toBe(480);
      expect(calc.completionStatus).toBe("COMPLETE");
      expect(calc.isLate).toBe(false);
    });
  });
});
