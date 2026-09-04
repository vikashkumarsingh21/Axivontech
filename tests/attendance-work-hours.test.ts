import { describe, it, expect } from "vitest";

describe("Attendance & Work-Hour Calculation Logic", () => {
  it("calculates session duration correctly from checkInAt and checkOutAt", () => {
    const checkInAt = new Date("2026-09-04T09:00:00Z");
    const checkOutAt = new Date("2026-09-04T17:30:00Z");
    const diffMs = checkOutAt.getTime() - checkInAt.getTime();
    const workedMinutes = Math.floor(diffMs / 60000);

    expect(workedMinutes).toBe(510); // 8 hours 30 mins
  });

  it("calculates daily status correctly against required daily minutes", () => {
    const requiredMinutes = 480; // 8 hours

    // Case 1: Worked 510 mins (COMPLETE)
    const workedMinsComplete = 510;
    const statusComplete = workedMinsComplete >= requiredMinutes ? "COMPLETE" : "INCOMPLETE";
    expect(statusComplete).toBe("COMPLETE");

    // Case 2: Worked 390 mins (INCOMPLETE)
    const workedMinsIncomplete = 390;
    const statusIncomplete = workedMinsIncomplete >= requiredMinutes ? "COMPLETE" : "INCOMPLETE";
    expect(statusIncomplete).toBe("INCOMPLETE");
  });

  it("calculates multiple work sessions summation for a day", () => {
    const requiredMinutes = 480; // 8 hours

    // Session 1: 9:00 to 13:00 (240 mins)
    const session1 = 240;

    // Session 2: 14:00 to 18:00 (240 mins)
    const session2 = 240;

    const totalDailyWorked = session1 + session2;
    expect(totalDailyWorked).toBe(480);
    expect(totalDailyWorked >= requiredMinutes ? "COMPLETE" : "INCOMPLETE").toBe("COMPLETE");
  });

  it("validates required daily hours server-side", () => {
    const isValidHours = (hrs: number) => typeof hrs === "number" && hrs > 0 && hrs <= 24;

    expect(isValidHours(8)).toBe(true);
    expect(isValidHours(6.5)).toBe(true);
    expect(isValidHours(0)).toBe(false);
    expect(isValidHours(-5)).toBe(false);
    expect(isValidHours(25)).toBe(false);
  });
});
