import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  registerDeviceToken,
  unregisterDeviceToken,
  getUserDeviceTokens,
  sendPushNotification,
} from "@/lib/notifications/push";
import { NotificationService } from "@/lib/notifications/service";
import {
  getZonedTimeParts,
  isWorkingDay,
  runAttendanceReminders,
  runWorkReportReminders,
  runTaskDeadlineReminders,
  notifyWorkReportSubmitted,
  notifyLeaveSubmitted,
  notifyLeaveDecided,
  notifyTaskAssigned,
} from "@/lib/notifications/reminders";
import { DEFAULT_REMINDER_SETTINGS } from "@/lib/notifications/settings";

// In-memory data store for mocks
const mockDb = {
  notifications: [] as any[],
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
      id: "emp-2",
      name: "Priya Patel",
      email: "priya@axivontech.in",
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
    {
      id: "admin-1",
      name: "Admin User",
      email: "admin@axivontech.in",
      department: "Operations",
      status: "ACTIVE",
      userRoles: [{ role: { name: "ADMIN" } }],
      userPreference: { inAppNotifications: true, emailNotifications: true },
    },
  ],
  departments: [
    {
      id: "dept-eng",
      name: "Engineering",
      code: "ENG",
      managerId: "mgr-1",
      managers: [{ userId: "mgr-1" }],
    },
  ],
  attendances: [] as any[],
  workReports: [] as any[],
  leaveRequests: [] as any[],
  tasks: [] as any[],
  holidays: [] as any[],
};

vi.mock("@/lib/db", () => {
  return {
    db: {
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
        findMany: vi.fn().mockImplementation(({ where }: any) => {
          return Promise.resolve(
            mockDb.notifications.filter((n) => {
              if (where?.userId && n.userId !== where.userId) return false;
              if (where?.isRead !== undefined && n.isRead !== where.isRead) return false;
              return true;
            })
          );
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
        count: vi.fn().mockImplementation(({ where }: any) => {
          const filtered = mockDb.notifications.filter((n) => {
            if (where?.userId) {
              if (typeof where.userId === "string" && n.userId !== where.userId) return false;
              if (Array.isArray(where.userId?.in) && !where.userId.in.includes(n.userId)) return false;
            }
            if (where?.isRead !== undefined && n.isRead !== where.isRead) return false;
            if (where?.title && n.title !== where.title) return false;
            return true;
          });
          return Promise.resolve(filtered.length);
        }),
      },

      organizationSetting: {
        findUnique: vi.fn().mockImplementation(({ where }: any) => {
          const val = mockDb.organizationSettings.get(where.key);
          return Promise.resolve(val ? { key: where.key, value: val, updatedAt: new Date() } : null);
        }),
        findMany: vi.fn().mockImplementation(({ where }: any) => {
          const prefix = where?.key?.startsWith || "";
          const list: any[] = [];
          for (const [k, v] of mockDb.organizationSettings.entries()) {
            if (k.startsWith(prefix)) {
              list.push({ key: k, value: v, updatedAt: new Date() });
            }
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
        findUnique: vi.fn().mockImplementation(({ where }: any) => {
          return Promise.resolve(mockDb.departments.find((d) => d.id === where.id) || null);
        }),
        findFirst: vi.fn().mockImplementation(({ where }: any) => {
          return Promise.resolve(mockDb.departments[0] || null);
        }),
        findMany: vi.fn().mockImplementation(() => Promise.resolve(mockDb.departments)),
      },

      departmentManager: {
        findMany: vi.fn().mockImplementation(() => Promise.resolve([{ userId: "mgr-1", departmentId: "dept-eng" }])),
      },

      attendance: {
        findFirst: vi.fn().mockImplementation(({ where }: any) => {
          return Promise.resolve(mockDb.attendances.find((a) => a.userId === where.userId) || null);
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

      leaveRequest: {
        findFirst: vi.fn().mockImplementation(({ where }: any) => {
          return Promise.resolve(
            mockDb.leaveRequests.find(
              (l) => l.userId === where.userId && l.status === where.status
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

describe("Axivon Technologies — Smart Notification & Automated Reminder System", () => {
  beforeEach(() => {
    mockDb.notifications.length = 0;
    mockDb.attendances.length = 0;
    mockDb.workReports.length = 0;
    mockDb.leaveRequests.length = 0;
    mockDb.tasks.length = 0;
    mockDb.holidays.length = 0;
    mockDb.organizationSettings.clear();
    vi.clearAllMocks();
  });

  describe("1. Push Notification Device Token Lifecycle", () => {
    it("registers and stores Android device tokens in user collection", async () => {
      const record = await registerDeviceToken(
        "emp-1",
        "fcm_test_device_token_xyz_123",
        "ANDROID",
        "Pixel 7 Pro"
      );
      expect(record.token).toBe("fcm_test_device_token_xyz_123");
      expect(record.userId).toBe("emp-1");
      expect(record.platform).toBe("ANDROID");

      const userTokens = await getUserDeviceTokens("emp-1");
      expect(userTokens.length).toBe(1);
      expect(userTokens[0].token).toBe("fcm_test_device_token_xyz_123");
    });

    it("unregisters token on sign-out cleanly", async () => {
      await registerDeviceToken("emp-1", "token_to_remove_abc", "ANDROID");
      expect((await getUserDeviceTokens("emp-1")).length).toBe(1);

      const unregisterRes = await unregisterDeviceToken("token_to_remove_abc");
      expect(unregisterRes).toBe(true);
      expect((await getUserDeviceTokens("emp-1")).length).toBe(0);
    });

    it("sends non-blocking simulated push notifications in development", async () => {
      const pushRes = await sendPushNotification(["test_fcm_token_1", "test_fcm_token_2"], {
        title: "Test Alert",
        body: "Checking notification engine",
        priority: "high",
      });
      expect(pushRes.sentCount).toBe(2);
      expect(pushRes.failedCount).toBe(0);
    });
  });

  describe("2. Central Notification Service", () => {
    it("dispatches in-app notification with priority and category", async () => {
      const res = await NotificationService.sendToUser("emp-1", {
        type: "ADMIN_ANNOUNCEMENT",
        title: "Platform Maintenance",
        message: "Scheduled updates tonight from 11 PM to 1 AM",
        category: "MAINTENANCE",
        priority: "HIGH",
        link: "/announcements",
      });

      expect(res.inApp).toBe(true);
      expect(mockDb.notifications.length).toBe(1);
      const created = mockDb.notifications[0];
      expect(created.userId).toBe("emp-1");
      expect(created.title).toBe("Platform Maintenance");
      expect(created.priority).toBe("HIGH");
      expect(created.entityType).toBe("MAINTENANCE");
    });

    it("enforces 24-hour deduplication to prevent duplicate notification spam", async () => {
      const dedupKey = "attendance_reminder:emp-1:2026-11-05";

      const first = await NotificationService.sendToUser("emp-1", {
        type: "ATTENDANCE_REMINDER",
        title: "Mark Attendance",
        message: "Please remember to mark attendance",
        dedupKey,
      });
      expect(first.inApp).toBe(true);

      const second = await NotificationService.sendToUser("emp-1", {
        type: "ATTENDANCE_REMINDER",
        title: "Mark Attendance",
        message: "Please remember to mark attendance",
        dedupKey,
      });
      expect(second.inApp).toBe(false);
      expect(mockDb.notifications.length).toBe(1);
    });

    it("resolves target audience for role, department, and organization", async () => {
      const empAudience = await NotificationService.resolveAudience("ALL_EMPLOYEES");
      expect(empAudience).toContain("emp-1");
      expect(empAudience).toContain("emp-2");

      const orgAudience = await NotificationService.resolveAudience("ALL_ACTIVE_USERS");
      expect(orgAudience.length).toBe(4);
    });

    it("records broadcast audit history and computes read analytics", async () => {
      await NotificationService.recordBroadcastHistory({
        id: "bc-test-1",
        senderId: "admin-1",
        senderName: "Admin User",
        title: "Q4 Townhall",
        message: "Join us today",
        category: "ANNOUNCEMENT",
        priority: "NORMAL",
        recipientType: "ALL_EMPLOYEES",
        recipientUserIds: ["emp-1", "emp-2"],
        sentCount: 2,
        createdAt: new Date().toISOString(),
      });

      // Mark one notification as read
      mockDb.notifications.push({
        id: "n-1",
        userId: "emp-1",
        title: "Q4 Townhall",
        isRead: true,
      });

      const history = await NotificationService.getBroadcastHistory(5);
      expect(history.length).toBe(1);
      expect(history[0].title).toBe("Q4 Townhall");
      expect(history[0].readCount).toBe(1);
      expect(history[0].readPercentage).toBe(50);
    });
  });

  describe("3. Automated Attendance Reminders", () => {
    it("identifies working days in Asia/Kolkata timezone", async () => {
      // Wednesday (working day)
      const wednesday = new Date("2026-11-04T04:30:00Z"); // 10:00 AM IST
      const parts = getZonedTimeParts(wednesday, "Asia/Kolkata");
      const check = await isWorkingDay(parts, DEFAULT_REMINDER_SETTINGS);
      expect(check.isWorkDay).toBe(true);
    });

    it("skips attendance reminders on Sunday (weekly off)", async () => {
      // Sunday
      const sunday = new Date("2026-11-08T04:30:00Z"); // 10:00 AM IST
      const res = await runAttendanceReminders({ now: sunday });
      expect(res.executed).toBe(false);
      expect(res.reason).toContain("Weekly Off");
    });

    it("exempts employees with approved leave from attendance reminders", async () => {
      // Employee 1 has approved leave today
      mockDb.leaveRequests.push({
        userId: "emp-1",
        status: "APPROVED",
        startDate: new Date("2026-11-05T00:00:00Z"),
        endDate: new Date("2026-11-05T23:59:59Z"),
      });

      const now = new Date("2026-11-05T04:35:00Z"); // 10:05 AM IST
      const res = await runAttendanceReminders({ now, dryRun: false });

      expect(res.executed).toBe(true);
      expect(res.exemptedOnLeave).toBe(1);
    });

    it("exempts employees who already checked in today", async () => {
      // Employee 1 already checked in
      mockDb.attendances.push({
        userId: "emp-1",
        date: new Date("2026-11-05T00:00:00Z"),
        checkInAt: new Date("2026-11-05T03:30:00Z"),
      });

      const now = new Date("2026-11-05T04:35:00Z"); // 10:05 AM IST
      const res = await runAttendanceReminders({ now, dryRun: false });

      expect(res.executed).toBe(true);
      expect(res.alreadyCheckedIn).toBe(1);
    });

    it("sends manager cutoff alert after 11:30 AM for missing attendance", async () => {
      // No attendances marked, time is 11:45 AM IST (06:15 UTC)
      const cutoffTime = new Date("2026-11-05T06:15:00Z");
      const res = await runAttendanceReminders({ now: cutoffTime, dryRun: false });

      expect(res.executed).toBe(true);
      expect(res.managerAlertsSent).toBeGreaterThan(0);

      const managerAlert = mockDb.notifications.find(
        (n) => n.type === "ATTENDANCE_MISSING_MANAGER_ALERT"
      );
      expect(managerAlert).toBeDefined();
      expect(managerAlert.userId).toBe("mgr-1");
    });
  });

  describe("4. Daily Work Report Reminders", () => {
    it("dispatches 5:00 PM pre-deadline reminder to employees without report", async () => {
      const fivePmIst = new Date("2026-11-05T11:35:00Z"); // 17:05 IST
      const res = await runWorkReportReminders({ now: fivePmIst, dryRun: false });

      expect(res.executed).toBe(true);
      expect(res.regularRemindersSent).toBeGreaterThan(0);

      const reminder = mockDb.notifications.find((n) => n.type === "WORK_REPORT_REMINDER");
      expect(reminder).toBeDefined();
      expect(reminder.title).toContain("Daily Work Report Reminder");
    });

    it("dispatches 7:00 PM URGENT overdue alert if report still missing", async () => {
      const sevenPmIst = new Date("2026-11-05T13:35:00Z"); // 19:05 IST
      const res = await runWorkReportReminders({ now: sevenPmIst, dryRun: false });

      expect(res.executed).toBe(true);
      expect(res.overdueAlertsSent).toBeGreaterThan(0);

      const overdue = mockDb.notifications.find((n) => n.type === "WORK_REPORT_OVERDUE");
      expect(overdue).toBeDefined();
      expect(overdue.priority).toBe("URGENT");
    });

    it("automatically stops work report reminders once report is submitted", async () => {
      // Employee 1 submits work report
      mockDb.workReports.push({
        userId: "emp-1",
        date: new Date("2026-11-05T00:00:00Z"),
        status: "SUBMITTED",
      });

      const sevenPmIst = new Date("2026-11-05T13:35:00Z");
      const res = await runWorkReportReminders({ now: sevenPmIst, dryRun: false });

      expect(res.alreadySubmitted).toBe(1);
      // Verify emp-1 did not get overdue notification
      const emp1Overdue = mockDb.notifications.find(
        (n) => n.userId === "emp-1" && n.type === "WORK_REPORT_OVERDUE"
      );
      expect(emp1Overdue).toBeUndefined();
    });

    it("notifies Department Manager when an employee submits their daily work report", async () => {
      await notifyWorkReportSubmitted({
        reportId: "wr-101",
        employeeUserId: "emp-1",
        date: new Date("2026-11-05T00:00:00Z"),
        hoursWorked: 8.5,
        summary: "Completed notification engine architecture and test suites.",
      });

      const mgrNotif = mockDb.notifications.find((n) => n.type === "WORK_REPORT_SUBMITTED");
      expect(mgrNotif).toBeDefined();
      expect(mgrNotif.userId).toBe("mgr-1");
      expect(mgrNotif.title).toContain("Rohan Sharma");
      expect(mgrNotif.message).toContain("8.5 hrs");
    });
  });

  describe("5. Task Assignment & Deadline Reminders", () => {
    it("notifies assignee upon new task assignment", async () => {
      await notifyTaskAssigned({
        taskId: "task-01",
        assigneeUserId: "emp-1",
        taskTitle: "Implement In-App Notification Bell",
        assignerName: "Vikram Malhotra",
        dueDate: new Date("2026-11-06T18:00:00Z"),
      });

      const notif = mockDb.notifications.find((n) => n.type === "TASK_ASSIGNED");
      expect(notif).toBeDefined();
      expect(notif.userId).toBe("emp-1");
      expect(notif.message).toContain("Vikram Malhotra");
    });

    it("triggers due tomorrow, due today, and overdue task deadline reminders", async () => {
      const now = new Date("2026-11-05T10:00:00Z");

      mockDb.tasks.push(
        {
          id: "t-due-today",
          title: "Critical Bugfix",
          userId: "emp-1",
          dueDate: new Date("2026-11-05T12:00:00Z"), // today
          status: "IN_PROGRESS",
        },
        {
          id: "t-overdue",
          title: "Quarterly Audit Report",
          userId: "emp-2",
          dueDate: new Date("2026-11-01T00:00:00Z"), // in the past
          status: "IN_PROGRESS",
        }
      );

      const res = await runTaskDeadlineReminders({ now, dryRun: false });
      expect(res.executed).toBe(true);
      expect(res.dueTodaySent).toBe(1);
      expect(res.overdueSent).toBe(1);

      const overdueNotif = mockDb.notifications.find((n) => n.type === "TASK_OVERDUE");
      expect(overdueNotif).toBeDefined();
      expect(overdueNotif.priority).toBe("URGENT");
    });

    it("automatically stops task reminders once task is completed", async () => {
      const now = new Date("2026-11-05T10:00:00Z");

      // Completed task
      mockDb.tasks.push({
        id: "t-completed",
        title: "Done Task",
        userId: "emp-1",
        dueDate: new Date("2026-11-05T12:00:00Z"),
        status: "COMPLETED",
      });

      const res = await runTaskDeadlineReminders({ now, dryRun: false });
      expect(res.tasksEvaluated).toBe(0); // non-completed query filters out COMPLETED
      expect(mockDb.notifications.length).toBe(0);
    });
  });

  describe("6. Leave Lifecycle Notifications", () => {
    it("notifies Department Manager when employee submits leave request", async () => {
      await notifyLeaveSubmitted({
        leaveId: "leave-99",
        employeeUserId: "emp-1",
        leaveType: "CASUAL",
        startDate: new Date("2026-11-10T00:00:00Z"),
        endDate: new Date("2026-11-11T00:00:00Z"),
        reason: "Personal family event",
      });

      const notif = mockDb.notifications.find((n) => n.type === "LEAVE_SUBMITTED");
      expect(notif).toBeDefined();
      expect(notif.userId).toBe("mgr-1");
      expect(notif.message).toContain("Personal family event");
    });

    it("notifies employee when leave request is approved or rejected", async () => {
      await notifyLeaveDecided({
        leaveId: "leave-99",
        employeeUserId: "emp-1",
        status: "APPROVED",
        approverName: "Vikram Malhotra",
      });

      const notif = mockDb.notifications.find((n) => n.type === "LEAVE_APPROVED");
      expect(notif).toBeDefined();
      expect(notif.userId).toBe("emp-1");
      expect(notif.title).toContain("Approved");
    });
  });

  describe("7. Department Manager Permission Containment", () => {
    it("allows manager to send announcements to their own department", async () => {
      const { POST: managerSend } = await import(
        "@/app/api/v1/manager/notifications/send/route"
      );
      const req = new Request("http://localhost/api/v1/manager/notifications/send", {
        method: "POST",
        headers: {
          "x-user-id": "mgr-1",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Sprint Planning at 2 PM",
          message: "Please prepare your story points.",
          departmentId: "dept-eng",
        }),
      });

      const res = await managerSend(req as any);
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it("rejects cross-department announcement attempts with HTTP 403 Forbidden", async () => {
      const { POST: managerSend } = await import(
        "@/app/api/v1/manager/notifications/send/route"
      );
      const req = new Request("http://localhost/api/v1/manager/notifications/send", {
        method: "POST",
        headers: {
          "x-user-id": "mgr-1",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Cross Department Notice",
          message: "This should not be allowed.",
          departmentId: "dept-sales-unauthorized",
        }),
      });

      const res = await managerSend(req as any);
      expect(res.status).toBe(403);
      const data = await res.json();
      const errMsg = typeof data.error === "string" ? data.error : data.error?.message || data.message;
      expect(errMsg).toContain("Access denied");
    });
  });

  describe("8. Scheduled Reminders Cron Endpoint", () => {
    it("executes reminder checks deterministically via ?now= and ?dryRun=true", async () => {
      const { GET: cronHandler } = await import("@/app/api/v1/cron/reminders/route");
      const req = new Request(
        "http://localhost/api/v1/cron/reminders?now=2026-11-05T04:35:00Z&dryRun=true&type=all",
        {
          headers: {
            "x-cron-secret": process.env.CRON_SECRET || "",
          },
        }
      );

      const res = await cronHandler(req as any);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.report.dryRun).toBe(true);
      expect(data.report.attendance).toBeDefined();
      expect(data.report.workReport).toBeDefined();
      expect(data.report.tasks).toBeDefined();
    });
  });
});
