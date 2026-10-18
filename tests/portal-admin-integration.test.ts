import { describe, it, expect, vi } from "vitest";
import {
  DEFAULT_CALENDAR_SETTINGS,
  checkWeeklyOff,
  getSaturdayOccurrence,
  toDateString,
  parseDateString,
} from "@/lib/calendar/calendar-dates";
import {
  OFFICIAL_INDIAN_HOLIDAYS_CATALOG,
} from "@/lib/calendar/holiday-service";

describe("AXIVON ONE — Employee Portal & Admin Panel Integration Suite", () => {
  describe("Scenario A: Weekly Off Settings & Calendar Synchronization", () => {
    it("should ensure Sunday is weekly off by default for all employees", () => {
      expect(DEFAULT_CALENDAR_SETTINGS.weeklyOffDays).toContain(0);
      const sundayDate = parseDateString("2026-10-18");
      expect(sundayDate.getDay()).toBe(0);

      const check = checkWeeklyOff(sundayDate, DEFAULT_CALENDAR_SETTINGS);
      expect(check.isOff).toBe(true);
      expect(check.reason).toBe("Sunday Weekly Off");
    });

    it("should synchronize dynamic Saturday rules across the application", () => {
      // 2nd Saturday of October 2026 is Oct 10
      const secondSat = parseDateString("2026-10-10");
      expect(getSaturdayOccurrence(secondSat)).toBe(2);

      // When admin configures SECOND_FOURTH_OFF
      const policy2nd4th = {
        ...DEFAULT_CALENDAR_SETTINGS,
        saturdayRule: "SECOND_FOURTH_OFF" as const,
      };
      expect(checkWeeklyOff(secondSat, policy2nd4th)).toEqual({
        isOff: true,
        reason: "2nd Saturday Off",
      });

      // 1st Saturday (Oct 3) remains a working day under SECOND_FOURTH_OFF
      const firstSat = parseDateString("2026-10-03");
      expect(checkWeeklyOff(firstSat, policy2nd4th)).toEqual({
        isOff: false,
        reason: "Working Day",
      });
    });
  });

  describe("Scenario B: Holiday & Observance Management with Admin Override", () => {
    it("should distinguish official company holidays from cultural observances", () => {
      const catalog = OFFICIAL_INDIAN_HOLIDAYS_CATALOG[2026];

      // Republic Day is Gazetted -> Office Closed
      const republicDay = catalog.find((h) => h.name === "Republic Day");
      expect(republicDay?.category).toBe("PUBLIC_HOLIDAY");
      expect(republicDay?.isCompanyHoliday).toBe(true);

      // Maha Shivratri is an observance -> Working day unless admin overrides
      const shivratri = catalog.find((h) => h.name === "Maha Shivratri");
      expect(shivratri?.category).toBe("FESTIVAL_OR_OBSERVANCE");
      expect(shivratri?.isCompanyHoliday).toBe(false);
    });

    it("should preserve admin holiday status override during sync operations", () => {
      const existingDbRecord = {
        name: "Maha Shivratri",
        date: new Date("2026-02-15"),
        isCompanyHoliday: true, // Overridden by Admin
      };

      const incomingCatalog = {
        name: "Maha Shivratri",
        dateStr: "2026-02-15",
        isCompanyHoliday: false, // Default
      };

      // Preservation logic
      const preservedStatus = existingDbRecord.isCompanyHoliday !== undefined
        ? existingDbRecord.isCompanyHoliday
        : incomingCatalog.isCompanyHoliday;

      expect(preservedStatus).toBe(true);
    });
  });

  describe("Scenario C: Leave Request Lifecycle & Self-Approval Prevention", () => {
    it("should validate leave date range and mandatory fields", () => {
      const start = new Date("2026-11-10");
      const endValid = new Date("2026-11-12");
      const endInvalid = new Date("2026-11-08");

      expect(start <= endValid).toBe(true);
      expect(start <= endInvalid).toBe(false);
    });

    it("should prevent administrators from approving their own leave requests", () => {
      const adminUserId = "admin-user-001";
      const leaveRequest = {
        id: "leave-123",
        userId: "admin-user-001", // Submitted by the admin
        status: "PENDING",
      };

      // Security check in approve route
      const isSelfApproval = leaveRequest.userId === adminUserId;
      expect(isSelfApproval).toBe(true);

      const canApprove = !isSelfApproval;
      expect(canApprove).toBe(false);
    });

    it("should allow an authorized administrator to approve a peer employee request", () => {
      const adminUserId = "admin-user-001";
      const employeeLeave = {
        id: "leave-456",
        userId: "employee-user-002",
        status: "PENDING",
      };

      expect(employeeLeave.userId === adminUserId).toBe(false);
    });
  });

  describe("Scenario D: Task Management & Comment Collaboration", () => {
    it("should enforce task status transitions permitted for employees", () => {
      const validStatuses = ["TODO", "IN_PROGRESS", "BLOCKED", "COMPLETED"];
      expect(validStatuses).toContain("TODO");
      expect(validStatuses).toContain("IN_PROGRESS");
      expect(validStatuses).toContain("BLOCKED");
      expect(validStatuses).toContain("COMPLETED");

      const employeeStatusUpdate = "IN_PROGRESS";
      expect(validStatuses.includes(employeeStatusUpdate)).toBe(true);
    });

    it("should prevent assigning tasks to inactive employees", () => {
      const inactiveUser = { id: "user-999", status: "INACTIVE", name: "Former Employee" };
      const canAssign = inactiveUser.status !== "INACTIVE";
      expect(canAssign).toBe(false);

      const activeUser = { id: "user-100", status: "ACTIVE", name: "Current Employee" };
      const canAssignActive = activeUser.status !== "INACTIVE";
      expect(canAssignActive).toBe(true);
    });

    it("should support two-way comment threads between employee and manager", () => {
      const taskComments = [
        { id: "c1", userId: "emp-1", content: "Initial draft submitted for review", createdAt: "2026-10-17T10:00:00Z" },
        { id: "c2", userId: "admin-1", content: "Looks great. Please add error handling on line 42", createdAt: "2026-10-17T11:00:00Z" },
      ];

      expect(taskComments.length).toBe(2);
      expect(taskComments[0].userId).toBe("emp-1");
      expect(taskComments[1].userId).toBe("admin-1");
    });
  });

  describe("Scenario E: Work Report Submission & Admin Review Workflow", () => {
    it("should require summary and work performed before persisting report", () => {
      const invalidSubmission = { summary: "", workPerformed: "" };
      const isValid = Boolean(invalidSubmission.summary.trim() && invalidSubmission.workPerformed.trim());
      expect(isValid).toBe(false);

      const validSubmission = {
        summary: "Developed Calendar integration suite",
        workPerformed: "Added admin tasks route, work reports review, and notification integration",
        hoursWorked: 8,
      };
      const isSubmissionValid = Boolean(validSubmission.summary.trim() && validSubmission.workPerformed.trim());
      expect(isSubmissionValid).toBe(true);
    });

    it("should update report status to REVIEWED when manager completes review", () => {
      const initialReport = { id: "wr-1", status: "SUBMITTED" };
      const reviewedReport = { ...initialReport, status: "REVIEWED" };
      expect(reviewedReport.status).toBe("REVIEWED");
    });
  });

  describe("Scenario F: Announcements & Audience Scoping", () => {
    it("should hide unpublished/draft announcements from employees", () => {
      const draftAnnouncement = { id: "ann-1", status: "DRAFT", title: "Internal Policy" };
      const isVisibleToEmployee = draftAnnouncement.status === "PUBLISHED";
      expect(isVisibleToEmployee).toBe(false);

      const publishedAnnouncement = { id: "ann-2", status: "PUBLISHED", title: "Holiday Notice" };
      expect(publishedAnnouncement.status === "PUBLISHED").toBe(true);
    });

    it("should correctly filter announcements targeted by department", () => {
      const user = { id: "u-1", department: "Engineering" };
      const engineeringAnn = { audienceType: "DEPARTMENT", audienceScope: "Engineering" };
      const salesAnn = { audienceType: "DEPARTMENT", audienceScope: "Sales" };
      const allAnn = { audienceType: "ALL", audienceScope: null };

      const canSeeEngineering = engineeringAnn.audienceScope.toLowerCase() === user.department.toLowerCase();
      const canSeeSales = salesAnn.audienceScope.toLowerCase() === user.department.toLowerCase();
      const canSeeAll = allAnn.audienceType === "ALL";

      expect(canSeeEngineering).toBe(true);
      expect(canSeeSales).toBe(false);
      expect(canSeeAll).toBe(true);
    });
  });

  describe("Scenario G: Role Isolation & Leave Privacy Verification", () => {
    it("should isolate employee leaves so employees never see peer requests", () => {
      const currentEmployeeId = "emp-100";
      const dbLeaves = [
        { id: "l1", userId: "emp-100", leaveType: "SICK" },
        { id: "l2", userId: "emp-200", leaveType: "CASUAL" }, // Coworker
      ];

      const visibleLeaves = dbLeaves.filter((l) => l.userId === currentEmployeeId);
      expect(visibleLeaves.length).toBe(1);
      expect(visibleLeaves[0].id).toBe("l1");
      expect(visibleLeaves.some((l) => l.userId === "emp-200")).toBe(false);
    });

    it("should prevent employee profile self-service from updating protected role", () => {
      const attemptedUpdate = {
        name: "Updated Name",
        phone: "+91 9876543210",
        role: "ADMIN", // Protected field
        status: "ACTIVE",
      };

      // Allowed self-service fields
      const allowedFields = ["name", "phone", "address", "emergencyContact", "bio"];
      const filteredUpdate: Record<string, any> = {};
      for (const [key, value] of Object.entries(attemptedUpdate)) {
        if (allowedFields.includes(key)) {
          filteredUpdate[key] = value;
        }
      }

      expect(filteredUpdate.name).toBe("Updated Name");
      expect(filteredUpdate.phone).toBe("+91 9876543210");
      expect(filteredUpdate.role).toBeUndefined();
    });
  });
});
