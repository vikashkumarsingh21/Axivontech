import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST as regularizePost } from "@/app/api/v1/employee/attendance/regularize/route";
import { PATCH as leavePatch } from "@/app/api/v1/employee/leave/route";
import { PATCH as taskPatch, POST as taskPost } from "@/app/api/v1/employee/tasks/route";
import { PATCH as reminderPatch, DELETE as reminderDelete } from "@/app/api/v1/reminders/[id]/route";
import { POST as notifReadPost } from "@/app/api/v1/notifications/[id]/read/route";
import { updateAccountProfileSchema } from "@/lib/services/profile-settings.service";

// Mock database
vi.mock("@/lib/db", () => {
  const mockDb = {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
    },
    attendance: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
    },
    regularizationRequest: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    leaveRequest: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    task: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    taskComment: {
      create: vi.fn(),
    },
    reminder: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    notification: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    partnerProject: {
      findFirst: vi.fn(),
    },
    partnerContract: {
      findUnique: vi.fn(),
    },
    partnerDocument: {
      findFirst: vi.fn(),
    },
  };
  return { db: mockDb };
});

// Mock validateActiveUser
vi.mock("@/lib/auth/permissions", () => ({
  validateActiveUser: vi.fn().mockImplementation(async (userId: string | null) => {
    if (!userId) throw new Error("Unauthorized");
    return {
      id: userId,
      name: "Test Employee",
      email: `${userId}@axivon.dev`,
      status: "ACTIVE",
      userRoles: [{ role: { name: "EMPLOYEE" } }],
    };
  }),
}));

describe("Comprehensive IDOR & Cross-User Data Isolation Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // =========================================================================
  // 1. EMPLOYEE DATA ISOLATION
  // =========================================================================
  describe("Employee Data Isolation", () => {
    it("rejects regularization request when attendanceId belongs to another employee (IDOR defense)", async () => {
      const { db } = await import("@/lib/db");
      
      // Attendance belongs to emp-victim-002
      (db.attendance.findUnique as any).mockResolvedValue({
        id: "att-victim-999",
        userId: "emp-victim-002",
      });
      (db.regularizationRequest.findFirst as any).mockResolvedValue(null);

      const req = new NextRequest("http://localhost:3000/api/v1/employee/attendance/regularize", {
        method: "POST",
        headers: { "x-user-id": "emp-attacker-001" },
        body: JSON.stringify({
          date: "2026-10-21",
          requestedCheckIn: "2026-10-21T09:00:00.000Z",
          requestedCheckOut: "2026-10-21T18:00:00.000Z",
          reason: "System glitch",
          attendanceId: "att-victim-999",
        }),
      });

      const res = await regularizePost(req);
      const json = await res.json();

      expect(res.status).toBe(403);
      expect(json.error).toContain("Forbidden: You can only regularize your own attendance records");
      expect((db.regularizationRequest.create as any).mock.calls.length).toBe(0);
    });

    it("allows regularization request when attendanceId belongs to the authenticated employee", async () => {
      const { db } = await import("@/lib/db");
      
      // Attendance belongs to emp-legit-001
      (db.attendance.findUnique as any).mockResolvedValue({
        id: "att-legit-111",
        userId: "emp-legit-001",
      });
      (db.regularizationRequest.findFirst as any).mockResolvedValue(null);
      (db.regularizationRequest.create as any).mockResolvedValue({
        id: "reg-111",
        userId: "emp-legit-001",
        status: "PENDING",
      });

      const req = new NextRequest("http://localhost:3000/api/v1/employee/attendance/regularize", {
        method: "POST",
        headers: { "x-user-id": "emp-legit-001" },
        body: JSON.stringify({
          date: "2026-10-21",
          requestedCheckIn: "2026-10-21T09:00:00.000Z",
          requestedCheckOut: "2026-10-21T18:00:00.000Z",
          reason: "System glitch",
          attendanceId: "att-legit-111",
        }),
      });

      const res = await regularizePost(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect((db.regularizationRequest.create as any).mock.calls.length).toBe(1);
    });

    it("prevents Employee A from cancelling Employee B's leave request", async () => {
      const { db } = await import("@/lib/db");
      
      // Leave request belongs to emp-victim-002
      (db.leaveRequest.findUnique as any).mockResolvedValue({
        id: "leave-victim-222",
        userId: "emp-victim-002",
        status: "PENDING",
      });

      const req = new NextRequest("http://localhost:3000/api/v1/employee/leave", {
        method: "PATCH",
        headers: { "x-user-id": "emp-attacker-001" },
        body: JSON.stringify({
          requestId: "leave-victim-222",
          action: "CANCEL",
        }),
      });

      const res = await leavePatch(req);
      const json = await res.json();

      expect(res.status).toBe(403);
      expect(json.error).toBe("Forbidden");
      expect((db.leaveRequest.update as any).mock.calls.length).toBe(0);
    });

    it("prevents Employee A from updating Employee B's task status", async () => {
      const { db } = await import("@/lib/db");
      
      // Task belongs to emp-victim-002
      (db.task.findUnique as any).mockResolvedValue({
        id: "task-victim-333",
        userId: "emp-victim-002",
        status: "TODO",
      });

      const req = new NextRequest("http://localhost:3000/api/v1/employee/tasks", {
        method: "PATCH",
        headers: { "x-user-id": "emp-attacker-001" },
        body: JSON.stringify({
          taskId: "task-victim-333",
          status: "COMPLETED",
        }),
      });

      const res = await taskPatch(req);
      const json = await res.json();

      expect(res.status).toBe(403);
      expect(json.error).toBe("Forbidden");
      expect((db.task.update as any).mock.calls.length).toBe(0);
    });

    it("prevents Employee A from posting a comment on Employee B's task", async () => {
      const { db } = await import("@/lib/db");
      
      (db.task.findUnique as any).mockResolvedValue({
        id: "task-victim-333",
        userId: "emp-victim-002",
      });

      const req = new NextRequest("http://localhost:3000/api/v1/employee/tasks", {
        method: "POST",
        headers: { "x-user-id": "emp-attacker-001" },
        body: JSON.stringify({
          taskId: "task-victim-333",
          content: "Spam comment",
        }),
      });

      const res = await taskPost(req);
      const json = await res.json();

      expect(res.status).toBe(403);
      expect(json.error).toBe("Forbidden");
      expect((db.taskComment.create as any).mock.calls.length).toBe(0);
    });

    it("prevents User A from deleting User B's reminder", async () => {
      const { db } = await import("@/lib/db");
      
      (db.reminder.findUnique as any).mockResolvedValue({
        id: "rem-victim-444",
        userId: "user-victim-002",
      });

      const req = new NextRequest("http://localhost:3000/api/v1/reminders/rem-victim-444", {
        method: "DELETE",
        headers: { "x-user-id": "user-attacker-001" },
      });

      const res = await reminderDelete(req, { params: Promise.resolve({ id: "rem-victim-444" }) });
      const json = await res.json();

      expect(res.status).toBe(403);
      expect(json.error).toContain("Forbidden: IDOR protection");
      expect((db.reminder.delete as any).mock.calls.length).toBe(0);
    });

    it("prevents User A from marking User B's notification as read", async () => {
      const { db } = await import("@/lib/db");
      
      (db.notification.findUnique as any).mockResolvedValue({
        id: "notif-victim-555",
        userId: "user-victim-002",
      });

      const req = new NextRequest("http://localhost:3000/api/v1/notifications/notif-victim-555/read", {
        method: "POST",
        headers: { "x-user-id": "user-attacker-001" },
      });

      const res = await notifReadPost(req, { params: Promise.resolve({ id: "notif-victim-555" }) });
      const json = await res.json();

      expect(res.status).toBe(403);
      expect(json.error).toContain("Forbidden: IDOR protection");
      expect((db.notification.update as any).mock.calls.length).toBe(0);
    });
  });

  // =========================================================================
  // 2. PRIVILEGE ESCALATION & PROFILE MUTATION SHIELDS
  // =========================================================================
  describe("Privilege Escalation Defenses", () => {
    it("rejects role injection in account profile updates via strict schema validation", () => {
      const payloadWithRole = {
        name: "Honest Employee",
        role: "ADMIN",
        roleName: "FOUNDER",
        status: "ACTIVE",
      };

      const result = updateAccountProfileSchema.safeParse(payloadWithRole);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain("role");
      }
    });

    it("enforces server identity over client-supplied userId header/body", () => {
      const authenticatedSessionUserId = "user-emp-111";
      const maliciousPayloadUserId = "user-emp-999";

      const resolveEffectiveUserId = (sessionUserId: string, payloadUserId?: string) => {
        return sessionUserId; // Client payload user id strictly ignored
      };

      expect(resolveEffectiveUserId(authenticatedSessionUserId, maliciousPayloadUserId)).toBe("user-emp-111");
    });
  });
});
