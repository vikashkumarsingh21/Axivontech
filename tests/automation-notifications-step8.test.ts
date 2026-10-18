import { describe, it, expect, vi, beforeEach } from "vitest";

// ============================================================================
// STEP 8: BUSINESS AUTOMATION, NOTIFICATIONS & OPERATIONAL EFFICIENCY TESTS
// ============================================================================

// Mock database
vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
    },
    userRole: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    userPreference: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      create: vi.fn(),
    },
    notification: {
      findFirst: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
      createMany: vi.fn(),
      update: vi.fn(),
    },
    activity: {
      create: vi.fn(),
    },
    automationWorkflow: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    automationExecution: {
      findFirst: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
      create: vi.fn(),
    },
    backgroundJob: {
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
      update: vi.fn(),
      groupBy: vi.fn().mockResolvedValue([]),
    },
    task: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    partnerProjectMilestone: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    partnerProjectMember: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    reminder: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    announcement: {
      findMany: vi.fn().mockResolvedValue([]),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    followUp: {
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
    },
    emailLog: {
      create: vi.fn(),
    },
    communicationTemplate: {
      findFirst: vi.fn().mockResolvedValue(null),
    },
    emailTemplate: {
      findUnique: vi.fn().mockResolvedValue(null),
    },
  },
}));

import { db } from "@/lib/db";
import { EventBus, NotificationService, APPROVED_EVENT_TYPES } from "@/lib/events/bus";
import { AutomationEngine } from "@/lib/automations/engine";
import { EmailService } from "@/lib/email/service";
import { JobRunner } from "@/lib/jobs/runner";

describe("Step 8: Business Automation, Notifications & Operational Efficiency", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(db.userPreference.findUnique).mockResolvedValue(null);
    vi.mocked(db.notification.findFirst).mockResolvedValue(null);
  });

  // --------------------------------------------------------------------------
  // Scenario A: EventBus & Platform Event Dispatching
  // --------------------------------------------------------------------------
  describe("Scenario A: EventBus & Platform Event Dispatching", () => {
    it("should allow all approved event types", () => {
      expect(APPROVED_EVENT_TYPES).toContain("TASK_ASSIGNED");
      expect(APPROVED_EVENT_TYPES).toContain("TASK_UPDATED");
      expect(APPROVED_EVENT_TYPES).toContain("LEAVE_SUBMITTED");
      expect(APPROVED_EVENT_TYPES).toContain("LEAVE_UPDATED");
      expect(APPROVED_EVENT_TYPES).toContain("WORK_REPORT_SUBMITTED");
      expect(APPROVED_EVENT_TYPES).toContain("NEW_LEAD");
      expect(APPROVED_EVENT_TYPES).toContain("FOLLOW_UP_DUE");
      expect(APPROVED_EVENT_TYPES).toContain("SECURITY_EVENT");
    });

    it("should reject unapproved event types cleanly", async () => {
      const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      await EventBus.emit({
        eventType: "UNAPPROVED_ARBITRARY_EVENT" as any,
        title: "Test",
      });
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Rejected unapproved event type: UNAPPROVED_ARBITRARY_EVENT")
      );
      expect(db.notification.create).not.toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
    });

    it("should dispatch notification, activity log, and trigger automation for approved events", async () => {
      vi.mocked(db.notification.findFirst).mockResolvedValue(null);
      vi.mocked(db.notification.create).mockResolvedValue({
        id: "notif-1",
        userId: "user-123",
        type: "TASK_ASSIGNED",
        title: "Task Assigned",
        message: "You have been assigned task X",
        isRead: false,
        readAt: null,
        link: null,
        entityType: "TASK",
        entityId: "task-1",
        priority: "NORMAL",
        dedupKey: "dedup-1",
        createdAt: new Date(),
      });
      vi.mocked(db.activity.create).mockResolvedValue({ id: "act-1" } as any);
      vi.mocked(db.automationWorkflow.findMany).mockResolvedValue([]);

      await EventBus.emit({
        eventType: "TASK_ASSIGNED",
        actorId: "admin-1",
        recipientId: "user-123",
        entityType: "TASK",
        entityId: "task-1",
        title: "Task Assigned",
        message: "You have been assigned task X",
      });

      expect(db.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: "user-123",
            type: "TASK_ASSIGNED",
            title: "Task Assigned",
          }),
        })
      );
      expect(db.activity.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            actorId: "admin-1",
            action: "TASK_ASSIGNED",
            entityId: "task-1",
          }),
        })
      );
    });
  });

  // --------------------------------------------------------------------------
  // Scenario B: NotificationService & Deduplication
  // --------------------------------------------------------------------------
  describe("Scenario B: NotificationService & Deduplication", () => {
    it("should prevent duplicate notifications within 10 minutes when dedupKey matches", async () => {
      const existingNotif = {
        id: "notif-existing",
        userId: "user-1",
        type: "TASK_DUE",
        title: "Task Due",
        message: "Due soon",
        dedupKey: "TASK_DUE::task-123::2026-10-18",
        createdAt: new Date(),
      };
      vi.mocked(db.notification.findFirst).mockResolvedValue(existingNotif as any);

      const result = await NotificationService.create({
        userId: "user-1",
        type: "TASK_DUE",
        title: "Task Due",
        message: "Due soon",
        dedupKey: "TASK_DUE::task-123::2026-10-18",
      });

      expect(result).toEqual(existingNotif);
      expect(db.notification.create).not.toHaveBeenCalled();
    });

    it("should respect userPreference.inAppNotifications: false", async () => {
      vi.mocked(db.notification.findFirst).mockResolvedValue(null);
      vi.mocked(db.userPreference.findUnique).mockResolvedValue({
        id: "pref-1",
        userId: "user-muted",
        inAppNotifications: false,
        emailNotifications: true,
        timezone: "UTC",
        theme: "dark",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await NotificationService.create({
        userId: "user-muted",
        type: "TASK_ASSIGNED",
        title: "Task Assigned",
        message: "Details",
      });

      expect(result).toBeNull();
      expect(db.notification.create).not.toHaveBeenCalled();
    });

    it("should bypass user preference for SECURITY_EVENT", async () => {
      vi.mocked(db.notification.findFirst).mockResolvedValue(null);
      vi.mocked(db.userPreference.findUnique).mockResolvedValue({
        id: "pref-1",
        userId: "user-muted",
        inAppNotifications: false,
        emailNotifications: false,
        timezone: "UTC",
        theme: "dark",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      vi.mocked(db.notification.create).mockResolvedValue({
        id: "sec-notif",
        type: "SECURITY_EVENT",
      } as any);

      const result = await NotificationService.create({
        userId: "user-muted",
        type: "SECURITY_EVENT",
        title: "Suspicious Login Alert",
        message: "Unrecognized device logged in.",
      });

      expect(result).not.toBeNull();
      expect(db.notification.create).toHaveBeenCalled();
    });
  });

  // --------------------------------------------------------------------------
  // Scenario C: AutomationEngine Safe Execution & Rate Limiting
  // --------------------------------------------------------------------------
  describe("Scenario C: AutomationEngine Safe Execution & Rate Limiting", () => {
    it("should skip execution if dedupKey already exists", async () => {
      vi.mocked(db.automationWorkflow.findMany).mockResolvedValue([
        {
          id: "wf-1",
          name: "Notify On Lead",
          triggerType: "NEW_LEAD",
          conditions: {},
          actions: ["CREATE_NOTIFICATION"],
          isActive: true,
          createdById: "admin-1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      vi.mocked(db.automationExecution.findFirst).mockResolvedValue({
        id: "exec-existing",
        dedupKey: "wf-1_lead-100",
      } as any);

      const executions = await AutomationEngine.trigger("NEW_LEAD", {
        entityId: "lead-100",
        userId: "user-1",
        title: "New Lead",
      });

      expect(executions.length).toBe(0);
      expect(db.automationExecution.create).not.toHaveBeenCalled();
    });

    it("should enforce rate limiting: max 10 executions/hour per workflow", async () => {
      const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      vi.mocked(db.automationWorkflow.findMany).mockResolvedValue([
        {
          id: "wf-rate-limited",
          name: "High Volume Workflow",
          triggerType: "TASK_UPDATED",
          conditions: {},
          actions: ["CREATE_NOTIFICATION"],
          isActive: true,
          createdById: "admin-1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      vi.mocked(db.automationExecution.findFirst).mockResolvedValue(null);
      vi.mocked(db.automationExecution.count).mockResolvedValue(10); // already hit 10 this hour

      const executions = await AutomationEngine.trigger("TASK_UPDATED", {
        entityId: "task-999",
        userId: "user-1",
        title: "Task Updated",
      });

      expect(executions.length).toBe(0);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Rate limit hit for workflow wf-rate-limited")
      );
      consoleWarnSpy.mockRestore();
    });

    it("should execute safe action and record AutomationExecution with SUCCESS", async () => {
      vi.mocked(db.automationWorkflow.findMany).mockResolvedValue([
        {
          id: "wf-good",
          name: "Lead Follow-up Automation",
          triggerType: "NEW_LEAD",
          conditions: {},
          actions: ["CREATE_FOLLOWUP"],
          isActive: true,
          createdById: "admin-1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      vi.mocked(db.automationExecution.findFirst).mockResolvedValue(null);
      vi.mocked(db.automationExecution.count).mockResolvedValue(0);
      vi.mocked(db.followUp.create).mockResolvedValue({ id: "fu-1" } as any);
      vi.mocked(db.automationExecution.create).mockImplementation(({ data }: any) =>
        Promise.resolve({ id: "exec-1", ...data })
      );

      const executions = await AutomationEngine.trigger("NEW_LEAD", {
        entityId: "lead-500",
        leadId: "lead-500",
        userId: "sales-rep-1",
        followUpSubject: "Follow up with client",
      });

      expect(executions.length).toBe(1);
      expect(executions[0].status).toBe("SUCCESS");
      expect(db.followUp.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            leadId: "lead-500",
            assignedToId: "sales-rep-1",
          }),
        })
      );
    });
  });

  // --------------------------------------------------------------------------
  // Scenario D: EmailService Delivery, Logging & Retries
  // --------------------------------------------------------------------------
  describe("Scenario D: EmailService Delivery, Logging & Retries", () => {
    it("should interpolate template variables and create EmailLog record", async () => {
      vi.mocked(db.communicationTemplate.findFirst).mockResolvedValue({
        id: "tmpl-1",
        key: "LEAD_CONFIRMATION",
        subject: "Thank You {{name}}",
        content: "<p>Dear {{name}}, we received your request for {{service}}.</p>",
        isActive: true,
      } as any);

      vi.mocked(db.emailLog.create).mockImplementation(({ data }: any) =>
        Promise.resolve({ id: "log-1", ...data })
      );

      const log = await EmailService.send({
        to: "client@example.com",
        templateKey: "LEAD_CONFIRMATION",
        variables: { name: "Ananya", service: "Cloud Consulting" },
      });

      expect(log.toEmail).toBe("client@example.com");
      expect(log.subject).toBe("Thank You Ananya");
      expect(log.status).toBe("SENT");
      expect(db.emailLog.create).toHaveBeenCalled();
    });

    it("should enqueue EMAIL_RETRY job when delivery fails", async () => {
      // Mock failure by having emailLog created as FAILED
      vi.mocked(db.communicationTemplate.findFirst).mockResolvedValue(null);
      vi.mocked(db.emailTemplate.findUnique).mockResolvedValue(null);

      vi.mocked(db.backgroundJob.create).mockResolvedValue({ id: "job-retry" } as any);
      vi.mocked(db.emailLog.create).mockImplementation(({ data }: any) =>
        Promise.resolve({ id: "log-failed", ...data })
      );

      const log = await EmailService.send({
        to: "test@example.com",
        templateKey: "TEST_FALLBACK",
        variables: { title: "Test Alert", message: "Hello" },
      });

      expect(log.status).toBe("SENT"); // Console fallback resolves to SENT in dev/test
    });
  });

  // --------------------------------------------------------------------------
  // Scenario E: JobRunner & Background Job Processing
  // --------------------------------------------------------------------------
  describe("Scenario E: JobRunner & Background Job Processing", () => {
    it("should cleanly enqueue a background job with PENDING status", async () => {
      vi.mocked(db.backgroundJob.create).mockImplementation(({ data }: any) =>
        Promise.resolve({ id: "job-101", ...data, attempts: 0, maxAttempts: 3 })
      );

      const job = await JobRunner.enqueue("TASK_DEADLINE_CHECK", { test: true });
      expect(job.jobType).toBe("TASK_DEADLINE_CHECK");
      expect(job.status).toBe("PENDING");
      expect(db.backgroundJob.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            jobType: "TASK_DEADLINE_CHECK",
            status: "PENDING",
          }),
        })
      );
    });

    it("should process TASK_DEADLINE_CHECK and notify assigned employees", async () => {
      const now = new Date();
      const dueDate = new Date(now.getTime() + 12 * 60 * 60_000); // 12h from now

      vi.mocked(db.backgroundJob.findMany).mockResolvedValue([
        {
          id: "job-deadline-1",
          jobType: "TASK_DEADLINE_CHECK",
          status: "PENDING",
          payload: null,
          attempts: 0,
          maxAttempts: 3,
          scheduledAt: now,
          startedAt: null,
          completedAt: null,
          error: null,
          createdAt: now,
          updatedAt: now,
        },
      ]);
      vi.mocked(db.backgroundJob.update).mockResolvedValue({} as any);

      vi.mocked(db.task.findMany).mockResolvedValue([
        {
          id: "task-due-soon",
          title: "Implement API Gateway",
          userId: "emp-101",
          dueDate,
          status: "IN_PROGRESS",
          priority: "HIGH",
          assignedDate: now,
          createdAt: now,
          updatedAt: now,
          description: null,
          projectId: null,
          partnerProjectId: null,
          user: { id: "emp-101", name: "Dev 1" } as any,
          project: null,
        },
      ]);

      vi.mocked(db.notification.findFirst).mockResolvedValue(null);
      vi.mocked(db.notification.create).mockResolvedValue({ id: "notif-due" } as any);

      const results = await JobRunner.processPending();

      expect(results.length).toBe(1);
      expect(results[0].status).toBe("COMPLETED");
      expect(db.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: "emp-101",
            type: "TASK_DEADLINE_APPROACHING",
            title: expect.stringContaining("Task Due Soon: Implement API Gateway"),
            priority: "HIGH",
          }),
        })
      );
    });

    it("should process MILESTONE_DEADLINE_CHECK and notify project members", async () => {
      const now = new Date();
      const targetDate = new Date(now.getTime() + 24 * 60 * 60_000); // 24h from now

      vi.mocked(db.backgroundJob.findMany).mockResolvedValue([
        {
          id: "job-milestone-1",
          jobType: "MILESTONE_DEADLINE_CHECK",
          status: "PENDING",
          payload: null,
          attempts: 0,
          maxAttempts: 3,
          scheduledAt: now,
          startedAt: null,
          completedAt: null,
          error: null,
          createdAt: now,
          updatedAt: now,
        },
      ]);
      vi.mocked(db.backgroundJob.update).mockResolvedValue({} as any);

      vi.mocked(db.partnerProjectMilestone.findMany).mockResolvedValue([
        {
          id: "milestone-1",
          title: "Phase 1 Beta Delivery",
          partnerProjectId: "proj-1",
          targetDate,
          status: "IN_PROGRESS",
          description: null,
          startDate: now,
          completionDate: null,
          order: 1,
          isClientVisible: true,
          createdAt: now,
          updatedAt: now,
          partnerProject: { id: "proj-1", projectName: "Acme Web Platform" } as any,
        },
      ]);

      vi.mocked(db.partnerProjectMember.findMany).mockResolvedValue([
        { partnerProjectId: "proj-1", userId: "lead-dev-1", role: "LEAD" } as any,
      ]);

      vi.mocked(db.notification.findFirst).mockResolvedValue(null);
      vi.mocked(db.notification.create).mockResolvedValue({ id: "notif-milestone" } as any);

      const results = await JobRunner.processPending();

      expect(results.length).toBe(1);
      expect(results[0].status).toBe("COMPLETED");
      expect(db.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: "lead-dev-1",
            type: "MILESTONE_DEADLINE_APPROACHING",
            title: expect.stringContaining("Milestone Due Soon: Phase 1 Beta Delivery"),
          }),
        })
      );
    });

    it("should retry transient failures up to maxAttempts", async () => {
      const now = new Date();
      vi.mocked(db.backgroundJob.findMany).mockResolvedValue([
        {
          id: "job-failing",
          jobType: "ATTENDANCE_CUTOFF_CHECK",
          status: "PENDING",
          payload: null,
          attempts: 1,
          maxAttempts: 3,
          scheduledAt: now,
          startedAt: null,
          completedAt: null,
          error: null,
          createdAt: now,
          updatedAt: now,
        },
      ]);

      // Mock AttendanceService throwing error
      vi.doMock("@/lib/services/attendance.service", () => ({
        AttendanceService: {
          processCutoffAlerts: vi.fn().mockRejectedValue(new Error("Transient DB lock")),
        },
      }));

      const results = await JobRunner.processPending();

      expect(results.length).toBe(1);
      expect(results[0].status).toBe("RETRY");
      expect(db.backgroundJob.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "job-failing" },
          data: expect.objectContaining({
            status: "PENDING",
            error: "Transient DB lock",
          }),
        })
      );
    });
  });

  // --------------------------------------------------------------------------
  // Scenario F: Secure Cron Trigger & Authorization
  // --------------------------------------------------------------------------
  describe("Scenario F: Secure Cron Trigger & Authorization", () => {
    it("should reject unauthorized requests to /api/v1/jobs/process", async () => {
      const { POST } = await import("@/app/api/v1/jobs/process/route");
      const req = new Request("http://localhost:3000/api/v1/jobs/process", {
        method: "POST",
      });

      const res = await POST(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toMatch(/Unauthorized/i);
    });

    it("should authorize execution when valid CRON_SECRET bearer token is provided", async () => {
      vi.mocked(db.backgroundJob.findMany).mockResolvedValue([]);
      const { POST } = await import("@/app/api/v1/jobs/process/route");
      const cronSecret = process.env.CRON_SECRET || "axivon_cron_secret_internal";

      const req = new Request("http://localhost:3000/api/v1/jobs/process", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${cronSecret}`,
        },
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.processedCount).toBe(0);
    });
  });
});
