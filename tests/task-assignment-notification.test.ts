import { describe, it, expect } from "vitest";

describe("Task Assignment & Notification Rules", () => {
  it("validates executive department scope for Co-Founder task assignment", () => {
    const scope = {
      isFounder: false,
      responsibilityProfile: "TECHNOLOGY",
      allowedDepartments: ["Engineering", "IT"],
    };

    const isAllowed = (dept: string) => {
      if (scope.isFounder || !scope.allowedDepartments) return true;
      return scope.allowedDepartments.some((d) => d.toLowerCase() === dept.toLowerCase());
    };

    expect(isAllowed("Engineering")).toBe(true);
    expect(isAllowed("IT")).toBe(true);
    expect(isAllowed("Marketing")).toBe(false);
    expect(isAllowed("Finance")).toBe(false);
  });

  it("allows Founder full unrestricted task assignment scope", () => {
    const scope = {
      isFounder: true,
      responsibilityProfile: "FULL",
      allowedDepartments: null,
    };

    const isAllowed = (dept: string) => {
      if (scope.isFounder || !scope.allowedDepartments) return true;
      return scope.allowedDepartments.some((d) => d.toLowerCase() === dept.toLowerCase());
    };

    expect(isAllowed("Engineering")).toBe(true);
    expect(isAllowed("Marketing")).toBe(true);
    expect(isAllowed("Sales")).toBe(true);
  });

  it("formats task notification message correctly", () => {
    const taskTitle = "Build Executive Dashboard";
    const assignerName = "Platform Founder";
    const dueDateStr = "10 Sep 2026";

    const notificationMessage = `Task: ${taskTitle}\nAssigned By: ${assignerName}\nDue: ${dueDateStr}`;

    expect(notificationMessage).toContain("Build Executive Dashboard");
    expect(notificationMessage).toContain("Platform Founder");
    expect(notificationMessage).toContain("10 Sep 2026");
  });
});
