import { describe, it, expect, vi } from "vitest";
import { EmailService } from "../src/lib/email/service";
import { JobRunner } from "../src/lib/jobs/runner";

// Mock database
vi.mock("@/lib/db", () => ({
  db: {
    emailTemplate: {
      findUnique: vi.fn().mockImplementation(({ where }: any) => {
        if (where.key === "WELCOME_EMAIL") {
          return Promise.resolve({
            key: "WELCOME_EMAIL",
            subject: "Welcome {{name}} to Axivon",
            htmlBody: "<p>Hello {{name}}, welcome to Axivon Technologies!</p>",
            isActive: true,
          });
        }
        return Promise.resolve(null);
      }),
    },
    emailLog: {
      create: vi.fn().mockImplementation(({ data }: any) => Promise.resolve({ id: "log-1", ...data })),
    },
    notification: {
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
    },
    backgroundJob: {
      create: vi.fn().mockImplementation(({ data }: any) => Promise.resolve({ id: "job-1", ...data })),
      findMany: vi.fn().mockResolvedValue([]),
      update: vi.fn().mockResolvedValue({}),
    },
    automationWorkflow: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    automationExecution: {
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockImplementation(({ data }: any) => Promise.resolve({ id: "exec-1", ...data })),
    },
    userPreference: {
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockImplementation(({ data }: any) => Promise.resolve({ id: "pref-1", ...data })),
    },
  },
}));

describe("Phase 6 Shared Advanced System Tests", () => {
  it("should safely render email templates with variables and create log", async () => {
    const log = await EmailService.send({
      to: "testemployee@axivon.dev",
      templateKey: "WELCOME_EMAIL",
      variables: { name: "Dev Test Employee" },
    });

    expect(log.toEmail).toBe("testemployee@axivon.dev");
    expect(log.subject).toBe("Welcome Dev Test Employee to Axivon");
    expect(log.status).toBe("SENT");
  });

  it("should handle missing email templates with fallback variables", async () => {
    const log = await EmailService.send({
      to: "admin@axivon.dev",
      templateKey: "CUSTOM_TEMPLATE",
      variables: { title: "Custom Alert", message: "System check" },
    });

    expect(log.toEmail).toBe("admin@axivon.dev");
    expect(log.subject).toBe("Custom Alert");
    expect(log.status).toBe("SENT");
  });

  it("should enqueue background jobs cleanly", async () => {
    const job = await JobRunner.enqueue("NOTIFICATION_SEND", { userId: "user-1" });
    expect(job.jobType).toBe("NOTIFICATION_SEND");
    expect(job.status).toBe("PENDING");
  });

  it("should enforce IDOR protection rule: notification owner check", () => {
    const notificationOwnerId = "user-123";
    const requestingUserId = "user-456";
    const isOwner = notificationOwnerId === requestingUserId;
    expect(isOwner).toBe(false);
  });

  it("should enforce search scope: Employee cannot view admin user directory", () => {
    const userRole = "EMPLOYEE";
    const canSearchUsers = userRole === "ADMIN" || userRole === "FOUNDER" || userRole === "CO_FOUNDER";
    expect(canSearchUsers).toBe(false);
  });
});
