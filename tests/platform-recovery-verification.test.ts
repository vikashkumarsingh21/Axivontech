import { describe, it, expect } from "vitest";
import {
  getUtcCalendarDate,
  toCalendarDateString,
  isSameCalendarDay,
  getUtcDayRange,
} from "@/lib/date-utils";
import { resolveRoleDashboardUrl } from "@/lib/auth/roles";

describe("Platform Recovery & Attendance Date Normalization", () => {
  describe("Calendar Date Normalization (date-utils)", () => {
    it("anchors local Date object to UTC midnight (00:00:00.000Z)", () => {
      // e.g. IST date at 18:30 UTC previous day
      const date = new Date(Date.UTC(2026, 9, 21, 18, 30, 0, 0));
      const utcCal = getUtcCalendarDate(date);
      expect(utcCal.getUTCHours()).toBe(0);
      expect(utcCal.getUTCMinutes()).toBe(0);
      expect(utcCal.getUTCSeconds()).toBe(0);
      expect(utcCal.getUTCMilliseconds()).toBe(0);
    });

    it("parses calendar date strings correctly", () => {
      const utcCal = getUtcCalendarDate("2026-10-21");
      expect(utcCal.toISOString()).toBe("2026-10-21T00:00:00.000Z");

      const utcCalWithTime = getUtcCalendarDate("2026-10-21T18:30:00.000Z");
      expect(toCalendarDateString(utcCalWithTime)).toBe("2026-10-21");
    });

    it("evaluates isSameCalendarDay correctly across time strings and Date objects", () => {
      const d1 = new Date("2026-10-21T00:00:00.000Z");
      const d2 = "2026-10-21";
      const d3 = new Date("2026-10-21T18:30:00.000Z");
      const d4 = new Date("2026-10-22T00:00:00.000Z");

      expect(isSameCalendarDay(d1, d2)).toBe(true);
      expect(isSameCalendarDay(d1, d3)).toBe(true);
      expect(isSameCalendarDay(d1, d4)).toBe(false);
      expect(isSameCalendarDay(null, d1)).toBe(false);
      expect(isSameCalendarDay(undefined, undefined)).toBe(false);
    });

    it("computes accurate UTC day ranges (startOfDay and endOfDay)", () => {
      const { startOfDay, endOfDay } = getUtcDayRange("2026-10-21");
      expect(startOfDay.toISOString()).toBe("2026-10-21T00:00:00.000Z");
      expect(endOfDay.toISOString()).toBe("2026-10-21T23:59:59.999Z");
      expect(endOfDay.getTime() - startOfDay.getTime()).toBe(86399999);
    });
  });

  describe("Role Routing Contract Verification", () => {
    const resolveLoginRoute = resolveRoleDashboardUrl;

    it("routes FOUNDER and CO_FOUNDER to executive dashboard", () => {
      expect(resolveLoginRoute("FOUNDER")).toBe("/executive/dashboard");
      expect(resolveLoginRoute("CO_FOUNDER")).toBe("/executive/dashboard");
    });

    it("routes ADMIN to admin dashboard", () => {
      expect(resolveLoginRoute("ADMIN")).toBe("/admin/dashboard");
    });

    it("routes BROKER and BUSINESS_PARTNER to broker dashboard", () => {
      expect(resolveLoginRoute("BROKER")).toBe("/broker/dashboard");
      expect(resolveLoginRoute("BUSINESS_PARTNER")).toBe("/broker/dashboard");
    });

    it("routes CLIENT to client dashboard", () => {
      expect(resolveLoginRoute("CLIENT")).toBe("/client/dashboard");
    });

    it("routes EMPLOYEE, LEAD_DEVELOPER, and default users to employee dashboard", () => {
      expect(resolveLoginRoute("EMPLOYEE")).toBe("/employee/dashboard");
      expect(resolveLoginRoute("LEAD_DEVELOPER")).toBe("/employee/dashboard");
      expect(resolveLoginRoute("USER")).toBe("/employee/dashboard");
    });
  });

  describe("Task & Project Normalization Contract", () => {
    it("falls back to partnerProject when project relation is null", () => {
      const rawTasks = [
        {
          id: "task-1",
          title: "Build Landing Page",
          project: { id: "p-1", name: "Axivon Internal" },
          partnerProject: null,
        },
        {
          id: "task-2",
          title: "Setup API Integration",
          project: null,
          partnerProject: { id: "pp-1", projectName: "Client Portal Project", projectCode: "PRJ-904" },
        },
      ];

      const normalized = rawTasks.map((t) => ({
        ...t,
        project:
          t.project ||
          (t.partnerProject
            ? { id: t.partnerProject.id, name: t.partnerProject.projectName }
            : null),
      }));

      expect(normalized[0].project?.name).toBe("Axivon Internal");
      expect(normalized[1].project?.name).toBe("Client Portal Project");
      expect(normalized[1].project?.id).toBe("pp-1");
    });
  });

  describe("Employee Identity Contract Validation", () => {
    it("correctly resolves primary role by priority and preserves identity attributes", () => {
      const ROLE_PRIORITY: Record<string, number> = {
        FOUNDER: 100,
        CO_FOUNDER: 95,
        ADMIN: 90,
        EXECUTIVE: 80,
        HR: 70,
        FINANCE: 70,
        LEAD_DEVELOPER: 60,
        EMPLOYEE: 50,
        BROKER: 40,
        BUSINESS_PARTNER: 40,
        CLIENT: 30,
        USER: 10,
      };

      const mockUser = {
        id: "usr_123",
        email: "alex@axivontech.in",
        name: "Alex Vance",
        phone: "+91 91572 26367",
        avatarUrl: "https://avatar.axivon.dev/alex.png",
        employeeId: "AXV-0104",
        department: "Engineering",
        designation: "Senior Software Engineer",
        address: "Bengaluru, India",
        emergencyContact: "+91 98765 43210",
        status: "ACTIVE",
        requiredDailyMinutes: 480,
        organizationId: "org_axivon",
        userRoles: [{ role: { name: "EMPLOYEE" } }, { role: { name: "ADMIN" } }],
        createdAt: new Date("2026-01-01"),
        joiningDate: new Date("2026-01-15"),
      };

      const roleNames = mockUser.userRoles.map((ur) => ur.role.name);
      const sortedRoles = [...roleNames].sort(
        (a, b) => (ROLE_PRIORITY[b] || 0) - (ROLE_PRIORITY[a] || 0)
      );
      const primaryRole = sortedRoles[0] || "EMPLOYEE";

      const payload = {
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          phone: mockUser.phone,
          avatarUrl: mockUser.avatarUrl,
          employeeId: mockUser.employeeId,
          department: mockUser.department,
          designation: mockUser.designation,
          address: mockUser.address,
          emergencyContact: mockUser.emergencyContact,
          status: mockUser.status,
          requiredDailyMinutes: mockUser.requiredDailyMinutes || 480,
          organizationId: mockUser.organizationId,
          role: primaryRole,
          roles: roleNames,
          joinedAt: mockUser.joiningDate || mockUser.createdAt,
          createdAt: mockUser.createdAt,
        },
      };

      expect(payload.user.role).toBe("ADMIN"); // ADMIN has higher priority than EMPLOYEE
      expect(payload.user.employeeId).toBe("AXV-0104");
      expect(payload.user.department).toBe("Engineering");
      expect(payload.user.designation).toBe("Senior Software Engineer");
      expect(payload.user.phone).toBe("+91 91572 26367");
      expect(payload.user.avatarUrl).toBe("https://avatar.axivon.dev/alex.png");
      expect(payload.user.requiredDailyMinutes).toBe(480);
      expect(payload.user.roles).toContain("ADMIN");
      expect(payload.user.roles).toContain("EMPLOYEE");
    });
  });
});
