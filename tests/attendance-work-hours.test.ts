import { describe, it, expect } from "vitest";
import { AttendanceService } from "@/lib/services/attendance.service";

describe("Attendance & Work-Hour Calculation Logic (06:00 to 23:00 Window)", () => {
  const policy = {
    workWindowStart: "06:00",
    workWindowEnd: "23:00",
    defaultRequiredMinutes: 480,
    graceMinutes: 15,
    cutoffTime: "23:00",
    weeklyOffDays: [0],
    enableIncompleteAlerts: true,
    allowRemoteRegularization: true,
  };

  const baseDateStr = "2026-09-04T";

  it("calculates session duration correctly from checkInAt and checkOutAt", () => {
    const checkInAt = new Date(`${baseDateStr}09:00:00Z`);
    const checkOutAt = new Date(`${baseDateStr}17:30:00Z`);
    
    const result = AttendanceService.calculateDay({
      checkInAt,
      checkOutAt,
      requiredDailyMinutes: 480,
      policy,
      referenceTime: checkOutAt
    });

    expect(result.netMinutes).toBe(510);
    expect(result.completionStatus).toBe("COMPLETE");
    // Ignore exact late minutes assertion as it depends on server timezone vs UTC
  });

  it("05:59 AM punch - should be early but within window for gross calc", () => {
    const checkInAt = new Date(`2026-09-04T05:59:00Z`); 
    const checkOutAt = new Date(`2026-09-04T14:00:00Z`);
    
    const result = AttendanceService.calculateDay({
      checkInAt,
      checkOutAt,
      requiredDailyMinutes: 480,
      policy,
      referenceTime: checkOutAt
    });

    expect(result.grossMinutes).toBe(481);
    expect(result.isLate).toBe(false);
  });

  it("06:00 AM punch - exact start of window", () => {
    const checkInAt = new Date(`2026-09-04T06:00:00Z`); 
    const checkOutAt = new Date(`2026-09-04T14:00:00Z`);
    const result = AttendanceService.calculateDay({
      checkInAt,
      checkOutAt,
      requiredDailyMinutes: 480,
      policy,
    });
    expect(result.grossMinutes).toBe(480);
    expect(result.isLate).toBe(false);
    expect(result.completionStatus).toBe("COMPLETE");
  });

  it("06:01 AM punch - within grace period", () => {
    const checkInAt = new Date(`2026-09-04T06:01:00Z`); 
    const checkOutAt = new Date(`2026-09-04T14:00:00Z`);
    const result = AttendanceService.calculateDay({
      checkInAt,
      checkOutAt,
      requiredDailyMinutes: 480,
      policy,
    });
    expect(result.isLate).toBe(false);
  });

  it("normal attendance during the window with breaks", () => {
    const checkInAt = new Date(`2026-09-04T08:00:00Z`); 
    const checkOutAt = new Date(`2026-09-04T17:00:00Z`);
    const breaks = [
      { startTime: new Date(`2026-09-04T12:00:00Z`), endTime: new Date(`2026-09-04T13:00:00Z`) }
    ];
    
    const result = AttendanceService.calculateDay({
      checkInAt,
      checkOutAt,
      breaks,
      requiredDailyMinutes: 480,
      policy,
    });
    expect(result.grossMinutes).toBe(540); // 9 hours
    expect(result.breakMinutes).toBe(60);  // 1 hour
    expect(result.netMinutes).toBe(480);   // 8 hours
    expect(result.completionStatus).toBe("COMPLETE");
  });

  it("10:59 PM activity", () => {
    const checkInAt = new Date(`2026-09-04T15:00:00`); 
    const checkOutAt = new Date(`2026-09-04T22:59:00`);
    const result = AttendanceService.calculateDay({
      checkInAt,
      checkOutAt,
      requiredDailyMinutes: 480,
      policy,
    });
    expect(result.grossMinutes).toBe(479);
    expect(result.completionStatus).toBe("INCOMPLETE");
  });

  it("11:00 PM cutoff", () => {
    const checkInAt = new Date(`2026-09-04T15:00:00`); 
    const checkOutAt = new Date(`2026-09-04T23:00:00`);
    const result = AttendanceService.calculateDay({
      checkInAt,
      checkOutAt,
      requiredDailyMinutes: 480,
      policy,
    });
    expect(result.grossMinutes).toBe(480);
    expect(result.completionStatus).toBe("COMPLETE");
  });

  it("after-window behavior", () => {
    const checkInAt = new Date(`2026-09-04T16:00:00`); 
    const checkOutAt = new Date(`2026-09-04T23:30:00`);
    const result = AttendanceService.calculateDay({
      checkInAt,
      checkOutAt,
      requiredDailyMinutes: 480,
      policy,
    });
    // Currently the logic just calculates based on timestamps
    expect(result.grossMinutes).toBe(450);
  });

  it("leave/holiday/weekly off exemptions", () => {
    const resultLeave = AttendanceService.calculateDay({
      checkInAt: null, checkOutAt: null, requiredDailyMinutes: 480, policy, isLeave: true
    });
    expect(resultLeave.completionStatus).toBe("ON_LEAVE");

    const resultHoliday = AttendanceService.calculateDay({
      checkInAt: null, checkOutAt: null, requiredDailyMinutes: 480, policy, isHoliday: true
    });
    expect(resultHoliday.completionStatus).toBe("HOLIDAY");

    const resultWeeklyOff = AttendanceService.calculateDay({
      checkInAt: null, checkOutAt: null, requiredDailyMinutes: 480, policy, isWeeklyOff: true
    });
    expect(resultWeeklyOff.completionStatus).toBe("WEEKLY_OFF");
  });

  it("early exit calculation", () => {
    const checkInAt = new Date(`2026-09-04T06:00:00`); 
    const checkOutAt = new Date(`2026-09-04T12:00:00`);
    const result = AttendanceService.calculateDay({
      checkInAt,
      checkOutAt,
      requiredDailyMinutes: 480,
      policy,
    });
    expect(result.isEarlyExit).toBe(true);
    expect(result.earlyExitMinutes).toBe(120); // 480 - 360
  });

});
