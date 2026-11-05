import { describe, it, expect, vi, beforeEach } from "vitest";
import { CentralScheduler } from "@/lib/scheduler/central-scheduler";
import { POST as processDueJobsHandler, GET as processDueJobsGetHandler } from "@/app/api/internal/cron/process-due-jobs/route";

const TEST_SECRET = "super_secure_cron_secret_32_characters_long";

// In-memory mock store
const mockDb = {
  organizationSettings: new Map<string, any>(),
  users: [
    {
      id: "emp-1",
      name: "Rohan Sharma",
      email: "rohan@axivontech.in",
      department: "Engineering",
      status: "ACTIVE",
      userRoles: [{ role: { name: "EMPLOYEE" } }],
      userPreference: { inAppNotifications: true, emailNotifications: true },
    },
    {
      id: "mgr-1",
      name: "Vikram Malhotra",
      email: "vikram@axivontech.in",
      department: "Engineering",
      status: "ACTIVE",
      userRoles: [{ role: { name: "DEPARTMENT_MANAGER" } }],
      userPreference: { inAppNotifications: true, emailNotifications: true },
    },
  ],
  notifications: [] as any[],
  attendances: [] as any[],
  workReports: [] as any[],
  tasks: [] as any[],
  approvalRequests: [] as any[],
  leaveRequests: [] as any[],
  regularizationRequests: [] as any[],
  backgroundJobs: [] as any[],
  holidays: [] as any[],
};

vi.mock("@/lib/db", () => {
  return {
    db: {
      organizationSetting: {
        findUnique: vi.fn().mockImplementation(({ where }: any) => {
          const val = mockDb.organizationSettings.get(where.key);
          return Promise.resolve(val ? { key: where.key, value: val, updatedAt: new Date() } : null);
        }),
        findMany: vi.fn().mockImplementation(({ where }: any) => {
          const prefix = where?.key?.startsWith || "";
          const list: any[] = [];
          for (const [k, v] of mockDb.organizationSettings.entries()) {
            if (k.startsWith(prefix)) list.push({ key: k, value: v, updatedAt: new Date() });
          }
          return Promise.resolve(list);
        }),
        upsert: vi.fn().mockImplementation(({ where, create, update }: any) => {
          const existing = mockDb.organizationSettings.get(where.key);
          const val = existing ? (update.value || update) : (create.value || create);
          mockDb.organizationSettings.set(where.key, val);
          return Promise.resolve({ key: where.key, value: val });
        }),
        create: vi.fn().mockImplementation(({ data }: any) => {
          mockDb.organizationSettings.set(data.key, data.value);
          return Promise.resolve(data);
        }),
        update: vi.fn().mockImplementation(({ where, data }: any) => {
          mockDb.organizationSettings.set(where.key, data.value);
          return Promise.resolve({ key: where.key, value: data.value });
        }),
        deleteMany: vi.fn().mockImplementation(({ where }: any) => {
          mockDb.organizationSettings.delete(where.key);
          return Promise.resolve({ count: 1 });
        }),
      },

      user: {
        findUnique: vi.fn().mockImplementation(({ where }: any) => {
          const u = mockDb.users.find((user) => user.id === where.id || user.email === where.email);
          return Promise.resolve(u || null);
        }),
        findMany: vi.fn().mockImplementation(({ where }: any) => {
          return Promise.resolve(
            mockDb.users.filter((user) => {
              if (where?.status && user.status !== where.status) return false;
              if (where?.userRoles?.some?.role?.name) {
                if (typeof where.userRoles.some.role.name === "string") {
                  const roleName = where.userRoles.some.role.name;
                  const hasRole = user.userRoles.some((ur: any) => ur.role.name === roleName);
                  if (!hasRole) return false;
                } else if (where.userRoles.some.role.name?.in) {
                  const roles = where.userRoles.some.role.name.in;
                  const hasRole = user.userRoles.some((ur: any) => roles.includes(ur.role.name));
                  if (!hasRole) return false;
                }
              }
              return true;
            })
          );
        }),
      },

      department: {
        findUnique: vi.fn().mockImplementation(() =>
          Promise.resolve({ id: "dept-eng", name: "Engineering", code: "ENG", managerId: "mgr-1" })
        ),
        findFirst: vi.fn().mockImplementation(() =>
          Promise.resolve({ id: "dept-eng", name: "Engineering", code: "ENG", managerId: "mgr-1" })
        ),
        findMany: vi.fn().mockImplementation(() =>
          Promise.resolve([{ id: "dept-eng", name: "Engineering", code: "ENG", managerId: "mgr-1" }])
        ),
      },

      departmentManager: {
        findMany: vi.fn().mockImplementation(() =>
          Promise.resolve([{ userId: "mgr-1", departmentId: "dept-eng" }])
        ),
      },

      notification: {
        create: vi.fn().mockImplementation(({ data }: any) => {
          const rec = { id: `notif-${Date.now()}-${Math.random()}`, ...data, createdAt: new Date() };
          mockDb.notifications.push(rec);
          return Promise.resolve(rec);
        }),
        createMany: vi.fn().mockImplementation(({ data }: any) => {
          const created = data.map((d: any) => ({
            id: `notif-${Date.now()}-${Math.random()}`,
            ...d,
            createdAt: new Date(),
          }));
          mockDb.notifications.push(...created);
          return Promise.resolve({ count: created.length });
        }),
        findFirst: vi.fn().mockImplementation(({ where }: any) => {
          return Promise.resolve(
            mockDb.notifications.find((n) => {
              if (where?.userId && n.userId !== where.userId) return false;
              if (where?.dedupKey && n.dedupKey !== where.dedupKey) return false;
              return true;
            }) || null
          );
        }),
        findMany: vi.fn().mockImplementation(() => Promise.resolve(mockDb.notifications)),
        count: vi.fn().mockImplementation(() => Promise.resolve(mockDb.notifications.length)),
      },

      attendance: {
        findFirst: vi.fn().mockImplementation(({ where }: any) => {
          return Promise.resolve(mockDb.attendances.find((a) => a.userId === where.userId) || null);
        }),
        findMany: vi.fn().mockImplementation(() => Promise.resolve(mockDb.attendances)),
        update: vi.fn().mockImplementation(({ where, data }: any) => {
          const idx = mockDb.attendances.findIndex((a) => a.id === where.id);
          if (idx !== -1) {
            mockDb.attendances[idx] = { ...mockDb.attendances[idx], ...data };
            return Promise.resolve(mockDb.attendances[idx]);
          }
          return Promise.resolve({ id: where.id, ...data });
        }),
      },

      workReport: {
        findFirst: vi.fn().mockImplementation(({ where }: any) => {
          return Promise.resolve(
            mockDb.workReports.find(
              (r) => r.userId === where.userId && r.status === (where.status || "SUBMITTED")
            ) || null
          );
        }),
      },

      task: {
        findMany: vi.fn().mockImplementation(() => {
          return Promise.resolve(
            mockDb.tasks.filter(
              (t) => !["COMPLETED", "DONE", "CANCELLED"].includes(t.status) && t.dueDate
            )
          );
        }),
      },

      approvalRequest: {
        findMany: vi.fn().mockImplementation(() => Promise.resolve(mockDb.approvalRequests)),
      },

      leaveRequest: {
        findFirst: vi.fn().mockImplementation(({ where }: any) => {
          return Promise.resolve(
            mockDb.leaveRequests.find(
              (l) => l.userId === where.userId && l.status === where.status
            ) || null
          );
        }),
        findMany: vi.fn().mockImplementation(() => Promise.resolve(mockDb.leaveRequests)),
      },

      regularizationRequest: {
        findMany: vi.fn().mockImplementation(() => Promise.resolve(mockDb.regularizationRequests)),
      },

      backgroundJob: {
        findMany: vi.fn().mockImplementation(() => Promise.resolve(mockDb.backgroundJobs)),
        count: vi.fn().mockImplementation(() => Promise.resolve(mockDb.backgroundJobs.length)),
        update: vi.fn().mockImplementation(({ where, data }: any) => {
          const idx = mockDb.backgroundJobs.findIndex((j) => j.id === where.id);
          if (idx !== -1) {
            mockDb.backgroundJobs[idx] = { ...mockDb.backgroundJobs[idx], ...data };
            return Promise.resolve(mockDb.backgroundJobs[idx]);
          }
          return Promise.resolve({ id: where.id, ...data });
        }),
      },

      holiday: {
        findFirst: vi.fn().mockImplementation(() => Promise.resolve(mockDb.holidays[0] || null)),
      },

      emailLog: {
        create: vi.fn().mockImplementation(({ data }: any) => Promise.resolve(data)),
        findFirst: vi.fn().mockImplementation(() => Promise.resolve(null)),
      },
    },
  };
});

describe("Axivon Technologies — Secure External Scheduler Architecture", () => {
  beforeEach(() => {
    process.env.CRON_SECRET = TEST_SECRET;
    mockDb.notifications.length = 0;
    mockDb.attendances.length = 0;
    mockDb.workReports.length = 0;
    mockDb.tasks.length = 0;
    mockDb.approvalRequests.length = 0;
    mockDb.leaveRequests.length = 0;
    mockDb.regularizationRequests.length = 0;
    mockDb.backgroundJobs.length = 0;
    mockDb.holidays.length = 0;
    mockDb.organizationSettings.clear();
    vi.clearAllMocks();
  });

  describe("1. Secure Authentication & HTTPS Enforcement", () => {
    it("rejects unauthenticated requests with HTTP 401 Unauthorized", async () => {
      const req = new Request("http://localhost/api/internal/cron/process-due-jobs", {
        method: "POST",
      });

      const res = await processDueJobsHandler(req as any);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error.message || data.message).toContain("Missing or malformed Authorization header");
    });

    it("rejects requests with invalid Bearer token with HTTP 401 Unauthorized", async () => {
      const req = new Request("http://localhost/api/internal/cron/process-due-jobs", {
        method: "POST",
        headers: {
          authorization: "Bearer wrong_secret_token_1234567890123456",
        },
      });

      const res = await processDueJobsHandler(req as any);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error.message || data.message).toContain("Invalid cron authentication credentials");
    });

    it("does not accept authentication in query parameters (requires header)", async () => {
      const req = new Request(
        `http://localhost/api/internal/cron/process-due-jobs?secret=${TEST_SECRET}`,
        {
          method: "POST",
        }
      );

      const res = await processDueJobsHandler(req as any);
      expect(res.status).toBe(401);
    });

    it("accepts valid Bearer <CRON_SECRET> header with HTTP 200", async () => {
      const req = new Request("http://localhost/api/internal/cron/process-due-jobs?dryRun=true", {
        method: "POST",
        headers: {
          authorization: `Bearer ${TEST_SECRET}`,
        },
      });

      const res = await processDueJobsHandler(req as any);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(typeof data.processed).toBe("number");
      expect(typeof data.sent).toBe("number");
      expect(typeof data.skipped).toBe("number");
      expect(typeof data.failed).toBe("number");
      expect(typeof data.durationMs).toBe("number");
      expect(typeof data.executionId).toBe("string");
    });
  });

  describe("2. Concurrency Control (Mutex Lock)", () => {
    it("prevents overlapping concurrent execution if a prior job is still running", async () => {
      // Simulate an active lock created 5 seconds ago
      const nowMs = Date.now();
      mockDb.organizationSettings.set("cron_lock:process_due_jobs", {
        executionId: "cron_active_lock_test",
        lockedAt: nowMs - 5000,
        expiresAt: nowMs + 40000, // Still has 40s remaining
      });

      const req = new Request("http://localhost/api/internal/cron/process-due-jobs?dryRun=true", {
        method: "POST",
        headers: {
          authorization: `Bearer ${TEST_SECRET}`,
        },
      });

      const res = await processDueJobsHandler(req as any);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.processed).toBe(0);
      expect(data.message).toContain("Concurrent execution prevented");
    });

    it("releases mutex lock cleanly after processing so subsequent runs succeed", async () => {
      const first = await CentralScheduler.processDueJobs({ dryRun: true });
      expect(first.success).toBe(true);

      // Verify lock was released
      const lockAfter = mockDb.organizationSettings.get("cron_lock:process_due_jobs");
      expect(lockAfter).toBeUndefined();

      // Subsequent run executes successfully
      const second = await CentralScheduler.processDueJobs({ dryRun: true });
      expect(second.success).toBe(true);
    });
  });

  describe("3. Unified Business Workflows Execution", () => {
    it("processes attendance, work reports, tasks, and approval reminders in one batch", async () => {
      const now = new Date("2026-11-05T04:35:00Z"); // 10:05 AM IST on Thursday

      mockDb.tasks.push({
        id: "task-test-01",
        title: "Test Task",
        userId: "emp-1",
        dueDate: new Date("2026-11-05T12:00:00Z"),
        status: "IN_PROGRESS",
      });

      const result = await CentralScheduler.processDueJobs({ now, dryRun: false });
      expect(result.success).toBe(true);
      expect(result.dryRun).toBe(false);
      expect(result.processed).toBeGreaterThan(0);
      expect(result.sent).toBeGreaterThan(0);
    });

    it("persists execution audit logs in OrganizationSetting for monitoring", async () => {
      const result = await CentralScheduler.processDueJobs({ dryRun: true });
      expect(result.executionId).toBeDefined();

      const logKey = `cron_exec_log:${result.executionId}`;
      const savedLog = mockDb.organizationSettings.get(logKey);
      expect(savedLog).toBeDefined();
      expect(savedLog.executionId).toBe(result.executionId);
      expect(savedLog.status).toBe("SUCCESS");

      // Verify recent logs query
      const recentLogs = await CentralScheduler.getRecentLogs(5);
      expect(recentLogs.length).toBeGreaterThan(0);
      expect(recentLogs[0].executionId).toBe(result.executionId);
    });
  });

  describe("4. Dry Run Mode Safety Guarantee", () => {
    it("defaults to safe dry-run mode without modifying records when CRON_DRY_RUN is unset", async () => {
      delete process.env.CRON_DRY_RUN;

      const req = new Request("http://localhost/api/internal/cron/process-due-jobs", {
        method: "POST",
        headers: {
          authorization: `Bearer ${TEST_SECRET}`,
        },
      });

      const res = await processDueJobsHandler(req as any);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.dryRun).toBe(true);
      // Verify no production notifications were persisted in dry run
      expect(mockDb.notifications.length).toBe(0);
    });

    it("enforces dry-run when CRON_DRY_RUN=true even if caller tries dryRun=false", async () => {
      process.env.CRON_DRY_RUN = "true";

      const req = new Request("http://localhost/api/internal/cron/process-due-jobs?dryRun=false", {
        method: "POST",
        headers: {
          authorization: `Bearer ${TEST_SECRET}`,
        },
      });

      const res = await processDueJobsHandler(req as any);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.dryRun).toBe(true);
      expect(mockDb.notifications.length).toBe(0);
    });

    it("allows real notification dispatching only when CRON_DRY_RUN=false is explicitly set", async () => {
      process.env.CRON_DRY_RUN = "false";

      const now = new Date("2026-11-05T04:35:00Z"); // 10:05 AM IST on Thursday

      const req = new Request(
        `http://localhost/api/internal/cron/process-due-jobs?now=${now.toISOString()}`,
        {
          method: "POST",
          headers: {
            authorization: `Bearer ${TEST_SECRET}`,
          },
        }
      );

      const res = await processDueJobsHandler(req as any);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.dryRun).toBe(false);
      expect(data.sent).toBeGreaterThan(0);
      // In real execution, notifications are actually created
      expect(mockDb.notifications.length).toBeGreaterThan(0);
    });
  });
});
