import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock database
vi.mock("@/lib/db", () => {
  const mockDb = {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    userRole: {
      findMany: vi.fn(),
    },
    attendance: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    workReport: {
      findMany: vi.fn(),
      count: vi.fn(),
      upsert: vi.fn(),
    },
    task: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    taskComment: {
      create: vi.fn(),
    },
    project: {
      findMany: vi.fn(),
    },
    leaveRequest: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    announcement: {
      findMany: vi.fn(),
    },
    document: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    notification: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      createMany: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    holiday: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  };
  return { db: mockDb };
});

// Mock authentication & permissions
vi.mock("@/lib/auth/permissions", () => ({
  validateActiveUser: vi.fn(),
  hasPermission: vi.fn().mockResolvedValue(true),
}));

// Mock event bus
vi.mock("@/lib/events/bus", () => ({
  EventBus: {
    emit: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock document service
vi.mock("@/lib/services/document.service", () => ({
  canAccessDocument: vi.fn().mockResolvedValue(true),
}));

// Mock calendar holiday sync
vi.mock("@/lib/calendar/holiday-service", () => ({
  getCalendarSettings: vi.fn().mockResolvedValue({
    weeklyOffDays: [0, 6],
    timezone: "Asia/Kolkata",
  }),
  syncHolidays: vi.fn().mockResolvedValue([]),
}));

import { db } from "@/lib/db";
import { validateActiveUser } from "@/lib/auth/permissions";

// Route imports
import { GET as dashboardGet } from "@/app/api/v1/employee/dashboard/route";
import { GET as tasksGet, PATCH as tasksPatch, POST as tasksPost } from "@/app/api/v1/employee/tasks/route";
import { GET as workReportsGet, POST as workReportsPost } from "@/app/api/v1/employee/work-reports/route";
import { GET as projectsGet } from "@/app/api/v1/employee/projects/route";
import { GET as leaveGet, POST as leavePost, PATCH as leavePatch } from "@/app/api/v1/employee/leave/route";
import { GET as announcementsGet } from "@/app/api/v1/employee/announcements/route";
import { GET as documentsGet } from "@/app/api/v1/employee/documents/route";
import { GET as notificationsGet, PATCH as notificationsPatch } from "@/app/api/v1/employee/notifications/route";
import { GET as onboardingGet } from "@/app/api/v1/employee/onboarding/route";
import { POST as supportPost } from "@/app/api/v1/employee/support/route";

describe("Axivon One: Employee Portal End-to-End API Integration Suite", () => {
  const mockEmployee = {
    id: "emp-test-42",
    name: "Mantra Khandelwal",
    email: "mantra@axivontech.in",
    department: "Design",
    designation: "UI/UX Engineer",
    employeeId: "AXV-DES-007",
    status: "ACTIVE",
    requiredDailyMinutes: 240, // 4 hours per day
    userRoles: [{ role: { name: "EMPLOYEE" } }],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (validateActiveUser as any).mockResolvedValue(mockEmployee);
  });

  // ── 1. EMPLOYEE DASHBOARD ───────────────────────────────────────────────
  describe("1. Employee Dashboard API (/api/v1/employee/dashboard)", () => {
    it("returns authorized employee stats and calculates live worked time for active attendance", async () => {
      const checkInTime = new Date(Date.now() - 90 * 60 * 1000); // 90 mins ago
      (db.attendance.findMany as any).mockResolvedValue([
        {
          id: "att-1",
          userId: mockEmployee.id,
          date: checkInTime,
          checkInAt: checkInTime,
          checkOutAt: null, // Active
          breaks: [],
        },
      ]);
      (db.workReport.findMany as any).mockResolvedValue([]);
      (db.task.findMany as any).mockResolvedValue([
        { id: "t-1", title: "Design Wireframes", status: "IN_PROGRESS", userId: mockEmployee.id },
      ]);
      (db.leaveRequest.count as any).mockResolvedValue(0);
      (db.leaveRequest.findFirst as any).mockResolvedValue(null);
      (db.notification.count as any).mockResolvedValue(2);
      (db.announcement.findMany as any).mockResolvedValue([]);

      const req = new NextRequest("http://localhost:3000/api/v1/employee/dashboard", {
        headers: { "x-user-id": mockEmployee.id },
      });

      const res = await dashboardGet(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.attendance.netMinutes).toBeGreaterThanOrEqual(89);
      expect(json.data.attendance.requiredDailyMinutes).toBe(240);
      expect(json.data.taskStats.active).toBe(1);
      expect(json.data.unreadNotifs).toBe(2);
    });
  });

  // ── 2. TASKS & SPRINT DELIVERABLES ──────────────────────────────────────
  describe("2. Task Management API (/api/v1/employee/tasks)", () => {
    it("retrieves only tasks assigned to the authenticated employee", async () => {
      (db.task.findMany as any).mockResolvedValue([
        {
          id: "task-101",
          title: "Build Responsive Header",
          status: "TODO",
          priority: "HIGH",
          userId: mockEmployee.id,
          project: { id: "p-1", name: "Corporate Portal", status: "ACTIVE" },
          comments: [],
        },
      ]);

      const req = new NextRequest("http://localhost:3000/api/v1/employee/tasks", {
        headers: { "x-user-id": mockEmployee.id },
      });

      const res = await tasksGet(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.tasks).toHaveLength(1);
      expect(json.tasks[0].title).toBe("Build Responsive Header");
    });

    it("allows employee to update status of their own assigned task", async () => {
      (db.task.findUnique as any).mockResolvedValue({
        id: "task-101",
        userId: mockEmployee.id,
        status: "TODO",
      });
      (db.task.update as any).mockResolvedValue({
        id: "task-101",
        userId: mockEmployee.id,
        status: "IN_PROGRESS",
      });

      const req = new NextRequest("http://localhost:3000/api/v1/employee/tasks", {
        method: "PATCH",
        headers: { "x-user-id": mockEmployee.id, "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: "task-101", status: "IN_PROGRESS" }),
      });

      const res = await tasksPatch(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.task.status).toBe("IN_PROGRESS");
    });

    it("prevents employee from modifying tasks assigned to other employees", async () => {
      (db.task.findUnique as any).mockResolvedValue({
        id: "task-other",
        userId: "other-user-99", // Different user
        status: "TODO",
      });

      const req = new NextRequest("http://localhost:3000/api/v1/employee/tasks", {
        method: "PATCH",
        headers: { "x-user-id": mockEmployee.id, "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: "task-other", status: "COMPLETED" }),
      });

      const res = await tasksPatch(req);
      expect(res.status).toBe(403);
    });

    it("allows employee to add comment to their assigned task", async () => {
      (db.task.findUnique as any).mockResolvedValue({
        id: "task-101",
        userId: mockEmployee.id,
      });
      (db.taskComment.create as any).mockResolvedValue({
        id: "c-1",
        taskId: "task-101",
        content: "Draft completed for review",
        user: { id: mockEmployee.id, name: mockEmployee.name },
      });

      const req = new NextRequest("http://localhost:3000/api/v1/employee/tasks", {
        method: "POST",
        headers: { "x-user-id": mockEmployee.id, "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: "task-101", content: "Draft completed for review" }),
      });

      const res = await tasksPost(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.comment.content).toBe("Draft completed for review");
    });
  });

  // ── 3. WORK REPORTS ─────────────────────────────────────────────────────
  describe("3. Work Reports API (/api/v1/employee/work-reports)", () => {
    it("submits and upserts daily work report with employee target hours default", async () => {
      (db.workReport.upsert as any).mockResolvedValue({
        id: "rep-1",
        userId: mockEmployee.id,
        date: new Date(),
        summary: "Sprint 4 Completed",
        workPerformed: "Designed screens, tested API integration",
        hoursWorked: 4, // Matches 240 mins / 60
        status: "SUBMITTED",
      });

      const req = new NextRequest("http://localhost:3000/api/v1/employee/work-reports", {
        method: "POST",
        headers: { "x-user-id": mockEmployee.id, "Content-Type": "application/json" },
        body: JSON.stringify({
          summary: "Sprint 4 Completed",
          workPerformed: "Designed screens, tested API integration",
        }),
      });

      const res = await workReportsPost(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.report.status).toBe("SUBMITTED");
      expect(json.report.hoursWorked).toBe(4);
    });

    it("rejects work report submission with missing required fields", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/employee/work-reports", {
        method: "POST",
        headers: { "x-user-id": mockEmployee.id, "Content-Type": "application/json" },
        body: JSON.stringify({
          summary: "", // Missing
          workPerformed: "",
        }),
      });

      const res = await workReportsPost(req);
      expect(res.status).toBe(400);
    });
  });

  // ── 4. PROJECTS ─────────────────────────────────────────────────────────
  describe("4. Projects Scoping API (/api/v1/employee/projects)", () => {
    it("returns assigned projects for employee", async () => {
      (db.project.findMany as any).mockResolvedValue([
        {
          id: "proj-1",
          name: "Axivon One Redesign",
          status: "ACTIVE",
          _count: { tasks: 5, members: 3 },
        },
      ]);

      const req = new NextRequest("http://localhost:3000/api/v1/employee/projects", {
        headers: { "x-user-id": mockEmployee.id },
      });

      const res = await projectsGet(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data).toHaveLength(1);
      expect(json.data[0].name).toBe("Axivon One Redesign");
    });
  });

  // ── 5. LEAVE MANAGEMENT ─────────────────────────────────────────────────
  describe("5. Leave Management API (/api/v1/employee/leave)", () => {
    it("submits a new leave request in PENDING state", async () => {
      (db.leaveRequest.create as any).mockResolvedValue({
        id: "leave-101",
        userId: mockEmployee.id,
        leaveType: "SICK",
        startDate: new Date("2026-11-10"),
        endDate: new Date("2026-11-11"),
        reason: "Fever and rest",
        status: "PENDING",
      });

      const req = new NextRequest("http://localhost:3000/api/v1/employee/leave", {
        method: "POST",
        headers: { "x-user-id": mockEmployee.id, "Content-Type": "application/json" },
        body: JSON.stringify({
          leaveType: "SICK",
          startDate: "2026-11-10",
          endDate: "2026-11-11",
          reason: "Fever and rest",
        }),
      });

      const res = await leavePost(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.request.status).toBe("PENDING");
    });

    it("rejects leave request when endDate is earlier than startDate", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/employee/leave", {
        method: "POST",
        headers: { "x-user-id": mockEmployee.id, "Content-Type": "application/json" },
        body: JSON.stringify({
          leaveType: "CASUAL",
          startDate: "2026-11-15",
          endDate: "2026-11-10", // Invalid
          reason: "Trip",
        }),
      });

      const res = await leavePost(req);
      expect(res.status).toBe(400);
    });

    it("allows employee to cancel their own PENDING leave request", async () => {
      (db.leaveRequest.findUnique as any).mockResolvedValue({
        id: "leave-101",
        userId: mockEmployee.id,
        status: "PENDING",
      });
      (db.leaveRequest.update as any).mockResolvedValue({
        id: "leave-101",
        status: "CANCELLED",
      });

      const req = new NextRequest("http://localhost:3000/api/v1/employee/leave", {
        method: "PATCH",
        headers: { "x-user-id": mockEmployee.id, "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: "leave-101", action: "CANCEL" }),
      });

      const res = await leavePatch(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.request.status).toBe("CANCELLED");
    });

    it("prevents cancelling already approved or rejected leave requests", async () => {
      (db.leaveRequest.findUnique as any).mockResolvedValue({
        id: "leave-approved",
        userId: mockEmployee.id,
        status: "APPROVED",
      });

      const req = new NextRequest("http://localhost:3000/api/v1/employee/leave", {
        method: "PATCH",
        headers: { "x-user-id": mockEmployee.id, "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: "leave-approved", action: "CANCEL" }),
      });

      const res = await leavePatch(req);
      expect(res.status).toBe(400);
    });
  });

  // ── 6. ANNOUNCEMENTS ────────────────────────────────────────────────────
  describe("6. Announcements Broadcast API (/api/v1/employee/announcements)", () => {
    it("returns published announcements matching employee audience scope", async () => {
      (db.announcement.findMany as any).mockResolvedValue([
        {
          id: "ann-1",
          title: "All Hands Meeting",
          content: "Quarterly review this Friday at 4 PM",
          status: "PUBLISHED",
          publishAt: new Date(Date.now() - 3600000),
          expiresAt: null,
          audienceType: "ALL",
          audienceScope: null,
          createdBy: { name: "CEO", email: "ceo@axivontech.in" },
        },
      ]);

      const req = new NextRequest("http://localhost:3000/api/v1/employee/announcements", {
        headers: { "x-user-id": mockEmployee.id },
      });

      const res = await announcementsGet(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.announcements).toHaveLength(1);
      expect(json.announcements[0].title).toBe("All Hands Meeting");
    });
  });

  // ── 7. DOCUMENT CENTER ──────────────────────────────────────────────────
  describe("7. Document Center API (/api/v1/employee/documents)", () => {
    it("returns accessible documents filtered by security policy", async () => {
      (db.document.findMany as any).mockResolvedValue([
        {
          id: "doc-1",
          title: "Axivon Employee Handbook 2026",
          category: "HANDBOOK",
          fileUrl: "/docs/handbook.pdf",
          isArchived: false,
          permissions: [],
        },
      ]);

      const req = new NextRequest("http://localhost:3000/api/v1/employee/documents", {
        headers: { "x-user-id": mockEmployee.id },
      });

      const res = await documentsGet(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.documents).toHaveLength(1);
      expect(json.documents[0].title).toBe("Axivon Employee Handbook 2026");
    });
  });

  // ── 8. NOTIFICATIONS ────────────────────────────────────────────────────
  describe("8. Notifications API (/api/v1/employee/notifications)", () => {
    it("marks all notifications as read for authenticated employee", async () => {
      (db.notification.updateMany as any).mockResolvedValue({ count: 3 });

      const req = new NextRequest("http://localhost:3000/api/v1/employee/notifications", {
        method: "PATCH",
        headers: { "x-user-id": mockEmployee.id, "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });

      const res = await notificationsPatch(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
    });
  });

  // ── 9. ONBOARDING CHECKLIST ─────────────────────────────────────────────
  describe("9. Onboarding Checklist API (/api/v1/employee/onboarding)", () => {
    it("calculates real progress percentage based on database milestones", async () => {
      (db.user.findUnique as any).mockResolvedValue({
        name: mockEmployee.name,
        email: mockEmployee.email,
        phone: "+91 9876543210",
        address: "Hyderabad, India",
        emergencyContact: "+91 9123456780",
        employeeId: mockEmployee.employeeId,
        department: mockEmployee.department,
        designation: mockEmployee.designation,
      });
      (db.attendance.count as any).mockResolvedValue(5);
      (db.workReport.count as any).mockResolvedValue(3);
      (db.task.count as any).mockResolvedValue(2);
      (db.document.count as any).mockResolvedValue(10);

      const req = new NextRequest("http://localhost:3000/api/v1/employee/onboarding", {
        headers: { "x-user-id": mockEmployee.id },
      });

      const res = await onboardingGet(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.progressPercent).toBe(100);
      expect(json.completedSteps).toBe(6);
    });
  });

  // ── 10. HELP & SUPPORT ──────────────────────────────────────────────────
  describe("10. Help & Support Dispatch API (/api/v1/employee/support)", () => {
    it("dispatches support ticket to Admin/HR notifications and returns confirmation", async () => {
      (db.userRole.findMany as any).mockResolvedValue([
        { userId: "admin-user-1" },
        { userId: "hr-user-2" },
      ]);
      (db.notification.createMany as any).mockResolvedValue({ count: 2 });
      (db.notification.create as any).mockResolvedValue({ id: "notif-emp-conf" });

      const req = new NextRequest("http://localhost:3000/api/v1/employee/support", {
        method: "POST",
        headers: { "x-user-id": mockEmployee.id, "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: "Figma License Provisioning",
          category: "Technical Support",
          priority: "HIGH",
          message: "Requesting Figma enterprise seat for Design sprint.",
        }),
      });

      const res = await supportPost(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(db.notification.createMany).toHaveBeenCalled();
      expect(db.notification.create).toHaveBeenCalled();
    });

    it("rejects support ticket with missing subject or message", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/employee/support", {
        method: "POST",
        headers: { "x-user-id": mockEmployee.id, "Content-Type": "application/json" },
        body: JSON.stringify({ subject: "", message: "" }),
      });

      const res = await supportPost(req);
      expect(res.status).toBe(400);
    });
  });
});
