import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  generateStrongPassword,
  validatePasswordStrength,
  hashPassword,
  verifyPassword,
} from "@/lib/auth/password";
import {
  approveAndCreateBrokerAccount,
  checkEmailAvailability,
  resetBrokerPassword,
} from "@/lib/auth/broker-account-service";

// In-memory mock database state
let mockUsers: any[] = [];
let mockBrokerProfiles: any[] = [];
let mockApplications: any[] = [];
let mockApplicationStatusHistories: any[] = [];
let mockAuditLogs: any[] = [];
let mockSessions: any[] = [];
let mockJobs: any[] = [];

vi.mock("@/lib/jobs/runner", () => ({
  JobRunner: {
    enqueue: vi.fn().mockImplementation((jobType: string, payload: any) => {
      mockJobs.push({ jobType, payload });
      return Promise.resolve({ success: true, jobId: `job_${Date.now()}` });
    }),
  },
}));

vi.mock("@/lib/db", () => {
  const getMockDb = () => ({
    organization: {
      findFirst: vi.fn().mockResolvedValue({ id: "org-01", name: "Axivon Technologies" }),
    },
    role: {
      upsert: vi.fn().mockResolvedValue({ id: "role-bp", name: "BUSINESS_PARTNER" }),
      findUnique: vi.fn().mockResolvedValue({ id: "role-bp", name: "BUSINESS_PARTNER" }),
    },
    userRole: {
      upsert: vi.fn().mockResolvedValue({ id: "ur-01", userId: "usr-01", roleId: "role-bp" }),
    },
    user: {
      findFirst: vi.fn().mockImplementation(({ where }: any) => {
        let res = [...mockUsers];
        if (where?.email) {
          const target = typeof where.email === "string" ? where.email : where.email.equals;
          res = res.filter((u) => u.email.toLowerCase() === target.toLowerCase());
        }
        if (where?.id) res = res.filter((u) => u.id === where.id);
        if (where?.role) res = res.filter((u) => u.role === where.role);
        if (where?.status) res = res.filter((u) => u.status === where.status);
        return Promise.resolve(res[0] || null);
      }),
      findUnique: vi.fn().mockImplementation(({ where, include }: any) => {
        const found = mockUsers.find(
          (u) => u.id === where?.id || u.email?.toLowerCase() === where?.email?.toLowerCase()
        );
        if (!found) return Promise.resolve(null);
        if (include?.brokerProfile) {
          const profile = mockBrokerProfiles.find((p) => p.userId === found.id);
          found.brokerProfile = profile || null;
        }
        if (include?.userRoles) {
          found.userRoles = [{ role: { name: found.role || "BUSINESS_PARTNER" } }];
        }
        return Promise.resolve({ ...found });
      }),
      create: vi.fn().mockImplementation(({ data }: any) => {
        const newUser = {
          id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          role: "BUSINESS_PARTNER",
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockUsers.push(newUser);
        return Promise.resolve(newUser);
      }),
      update: vi.fn().mockImplementation(({ where, data }: any) => {
        const idx = mockUsers.findIndex((u) => u.id === where?.id);
        if (idx !== -1) {
          mockUsers[idx] = { ...mockUsers[idx], ...data, updatedAt: new Date() };
          return Promise.resolve(mockUsers[idx]);
        }
        return Promise.resolve(null);
      }),
    },
    brokerProfile: {
      findFirst: vi.fn().mockImplementation(({ where, include }: any) => {
        let res = [...mockBrokerProfiles];
        if (where?.OR) {
          res = res.filter((p) =>
            where.OR.some(
              (cond: any) =>
                (cond.id && cond.id === p.id) ||
                (cond.userId && cond.userId === p.userId) ||
                (cond.partnerId && cond.partnerId === p.partnerId)
            )
          );
        } else {
          if (where?.userId) res = res.filter((p) => p.userId === where.userId);
          if (where?.user?.email) {
            const target = typeof where.user.email === "string" ? where.user.email : where.user.email.equals;
            const user = mockUsers.find((u) => u.email.toLowerCase() === target.toLowerCase());
            res = user ? res.filter((p) => p.userId === user.id) : [];
          }
          if (where?.referralCode) res = res.filter((p) => p.referralCode === where.referralCode);
        }
        const found = res[0] || null;
        if (found && include?.user) {
          const user = mockUsers.find((u) => u.id === found.userId);
          return Promise.resolve({ ...found, user: user || null });
        }
        return Promise.resolve(found);
      }),
      findUnique: vi.fn().mockImplementation(({ where }: any) => {
        const found = mockBrokerProfiles.find((p) => p.id === where?.id || p.userId === where?.userId);
        return Promise.resolve(found || null);
      }),
      create: vi.fn().mockImplementation(({ data }: any) => {
        const newProfile = {
          id: `bp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          role: "BUSINESS_PARTNER",
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockBrokerProfiles.push(newProfile);
        return Promise.resolve(newProfile);
      }),
      update: vi.fn().mockImplementation(({ where, data }: any) => {
        const idx = mockBrokerProfiles.findIndex((p) => p.id === where?.id || p.userId === where?.userId);
        if (idx !== -1) {
          mockBrokerProfiles[idx] = { ...mockBrokerProfiles[idx], ...data, updatedAt: new Date() };
          return Promise.resolve(mockBrokerProfiles[idx]);
        }
        return Promise.resolve(null);
      }),
    },
    businessPartnerApplication: {
      findFirst: vi.fn().mockImplementation(({ where }: any) => {
        let res = [...mockApplications];
        if (where?.OR) {
          res = res.filter((a) =>
            where.OR.some((cond: any) => (cond.id && cond.id === a.id) || (cond.applicationId && cond.applicationId === a.applicationId))
          );
        } else {
          if (where?.id) res = res.filter((a) => a.id === where.id);
          if (where?.applicationId) res = res.filter((a) => a.applicationId === where.applicationId);
          if (where?.email) res = res.filter((a) => a.email.toLowerCase() === (typeof where.email === "string" ? where.email : where.email.equals).toLowerCase());
        }
        return Promise.resolve(res[0] || null);
      }),
      findUnique: vi.fn().mockImplementation(({ where }: any) => {
        const found = mockApplications.find((a) => a.id === where?.id || a.applicationId === where?.applicationId);
        return Promise.resolve(found || null);
      }),
      update: vi.fn().mockImplementation(({ where, data }: any) => {
        const idx = mockApplications.findIndex((a) => a.id === where?.id);
        if (idx !== -1) {
          mockApplications[idx] = { ...mockApplications[idx], ...data, updatedAt: new Date() };
          return Promise.resolve(mockApplications[idx]);
        }
        return Promise.resolve(null);
      }),
    },
    applicationStatusHistory: {
      create: vi.fn().mockImplementation(({ data }: any) => {
        const entry = { id: `ash_${Date.now()}`, ...data, createdAt: new Date() };
        mockApplicationStatusHistories.push(entry);
        return Promise.resolve(entry);
      }),
    },
    auditLog: {
      create: vi.fn().mockImplementation(({ data }: any) => {
        const log = { id: `log_${Date.now()}`, ...data, createdAt: new Date() };
        mockAuditLogs.push(log);
        return Promise.resolve(log);
      }),
    },
    session: {
      deleteMany: vi.fn().mockImplementation(({ where }: any) => {
        const before = mockSessions.length;
        mockSessions = mockSessions.filter((s) => s.userId !== where?.userId);
        return Promise.resolve({ count: before - mockSessions.length });
      }),
    },
  });

  const mockDbInstance = {
    ...getMockDb(),
    $transaction: vi.fn().mockImplementation(async (callback: any) => {
      return await callback(getMockDb());
    }),
  };

  return { db: mockDbInstance };
});

describe("Approved Partner Login Creation & Security Test Suite", () => {
  beforeEach(() => {
    mockUsers = [];
    mockBrokerProfiles = [];
    mockApplications = [];
    mockApplicationStatusHistories = [];
    mockAuditLogs = [];
    mockSessions = [];
    mockJobs = [];

    // Seed Admin user
    mockUsers.push({
      id: "admin-user-01",
      email: "admin@axivontech.in",
      name: "Admin User",
      role: "ADMIN",
      status: "ACTIVE",
      passwordHash: "$2b$12$eXampleHashedPasswordForAdminUser123456",
    });

    // Seed test application
    mockApplications.push({
      id: "app-test-01",
      applicationId: "BPA-2026-QA0001",
      fullName: "Jane Broker Applicant",
      email: "jane.broker@axivon.test",
      phone: "+91 9876543210",
      city: "Bangalore",
      status: "SUBMITTED",
      occupation: "Independent Technology Consultant",
    });
  });

  describe("1. Password Generation & Complexity Rules", () => {
    it("should generate crypto-secure passwords of 14+ chars without ambiguous characters", () => {
      for (let i = 0; i < 20; i++) {
        const pwd = generateStrongPassword(14);
        expect(pwd.length).toBeGreaterThanOrEqual(14);
        expect(pwd).not.toMatch(/[0Oo1lI]/);
        expect(pwd).toMatch(/[a-z]/);
        expect(pwd).toMatch(/[A-Z]/);
        expect(pwd).toMatch(/[0-9]/);
        expect(pwd).toMatch(/[^a-zA-Z0-9]/);

        const val = validatePasswordStrength(pwd);
        expect(val.isValid).toBe(true);
      }
    });

    it("should validate and reject weak manual passwords with explicit error messages", () => {
      const short = validatePasswordStrength("Ab1!");
      expect(short.isValid).toBe(false);
      expect(short.errors).toContain("Password must be at least 10 characters long.");

      const noUpper = validatePasswordStrength("weakpass123!");
      expect(noUpper.isValid).toBe(false);
      expect(noUpper.errors).toContain("Must contain at least one uppercase letter (A-Z).");

      const noNumber = validatePasswordStrength("WeakPassword!");
      expect(noNumber.isValid).toBe(false);
      expect(noNumber.errors).toContain("Must contain at least one digit (0-9).");

      const noSymbol = validatePasswordStrength("WeakPassword123");
      expect(noSymbol.isValid).toBe(false);
      expect(noSymbol.errors).toContain("Must contain at least one special character (!@#$%^&* etc.).");
    });

    it("should produce valid bcrypt salt round 12 hashes", async () => {
      const plain = "StrongValid#2026";
      const hash = await hashPassword(plain);
      expect(hash.startsWith("$2a$12$") || hash.startsWith("$2b$12$")).toBe(true);

      const isValid = await verifyPassword(plain, hash);
      expect(isValid).toBe(true);
      const isInvalid = await verifyPassword("WrongPassword#999", hash);
      expect(isInvalid).toBe(false);
    });
  });

  describe("2. Pre-flight Email Availability Check", () => {
    it("should report an unused email as available", async () => {
      const res = await checkEmailAvailability("unused.applicant@axivon.test");
      expect(res.available).toBe(true);
      expect(res.user).toBeNull();
    });

    it("should report an existing user email as unavailable with role context", async () => {
      const res = await checkEmailAvailability("admin@axivontech.in");
      expect(res.available).toBe(false);
      expect(res.user?.role).toBe("ADMIN");
      expect(res.user?.email).toBe("admin@axivontech.in");
    });
  });

  describe("3. Atomic Approval & Account Creation Flow", () => {
    it("should atomically approve application and create active broker account with generated password", async () => {
      const strongPwd = generateStrongPassword(14);
      const result = await approveAndCreateBrokerAccount({
        applicationId: "app-test-01",
        adminUserId: "admin-user-01",
        email: "jane.broker@axivon.test",
        mode: "DIRECT_PASSWORD",
        password: strongPwd,
        mustChangePassword: true,
        partnerType: "Independent Technology Consultant",
        internalNote: "Applicant verified during QA interview.",
      });

      expect(result.success).toBe(true);
      expect(result.email).toBe("jane.broker@axivon.test");
      expect(result.partnerId).toMatch(/^AX[PV]-/);
      expect(result.referralCode).toBeTruthy();
      expect(result.mustChangePassword).toBe(true);
      expect(result.user.status).toBe("ACTIVE");
      expect(result.user.role).toBe("BUSINESS_PARTNER");

      // Verify Application status updated to APPROVED
      const app = mockApplications.find((a) => a.id === "app-test-01");
      expect(app.status).toBe("APPROVED");
      expect(app.reviewedById).toBe("admin-user-01");

      // Verify AuditLog was recorded WITHOUT raw password
      const auditLog = mockAuditLogs.find(
        (l) => l.action === "PARTNER_APPLICATION_APPROVED_AND_ACCOUNT_CREATED"
      );
      expect(auditLog).toBeDefined();
      expect(JSON.stringify(auditLog.details)).not.toContain(strongPwd);

      // Verify Database User does NOT store plain password
      const dbUser = mockUsers.find((u) => u.email === "jane.broker@axivon.test");
      expect(dbUser.passwordHash).not.toBe(strongPwd);
      expect(await verifyPassword(strongPwd, dbUser.passwordHash)).toBe(true);
    });

    it("should handle activation-link mode properly", async () => {
      const result = await approveAndCreateBrokerAccount({
        applicationId: "app-test-01",
        adminUserId: "admin-user-01",
        email: "jane.broker@axivon.test",
        mode: "ACTIVATION_LINK",
        mustChangePassword: true,
      });

      expect(result.success).toBe(true);
      expect(result.user.status).toBe("PENDING_ACTIVATION");
      expect(result.mustChangePassword).toBe(true);
      expect(result.activationLink).toContain("/broker-partner/activate?token=");

      // Verify activation email job was enqueued
      const emailJob = mockJobs.find((j) => j.jobType === "SEND_EMAIL");
      expect(emailJob).toBeDefined();
      expect(emailJob.payload.to).toBe("jane.broker@axivon.test");
      expect(emailJob.payload.templateKey).toBe("PARTNER_ACCOUNT_ACTIVATION");
    });

    it("should be idempotent: approving twice does not duplicate user or broker profile", async () => {
      // First approval
      await approveAndCreateBrokerAccount({
        applicationId: "app-test-01",
        adminUserId: "admin-user-01",
        email: "jane.broker@axivon.test",
        mode: "DIRECT_PASSWORD",
        password: generateStrongPassword(14),
        mustChangePassword: true,
      });

      expect(mockUsers.filter((u) => u.email === "jane.broker@axivon.test").length).toBe(1);
      expect(mockBrokerProfiles.length).toBe(1);

      // Second approval attempt on same application
      const secondCall = await approveAndCreateBrokerAccount({
        applicationId: "app-test-01",
        adminUserId: "admin-user-01",
        email: "jane.broker@axivon.test",
        mode: "DIRECT_PASSWORD",
        password: generateStrongPassword(14),
        mustChangePassword: true,
      });

      expect(secondCall.success).toBe(true);
      expect(secondCall.isExisting).toBe(true);
      // Ensure no duplicates
      expect(mockUsers.filter((u) => u.email === "jane.broker@axivon.test").length).toBe(1);
      expect(mockBrokerProfiles.length).toBe(1);
    });

    it("should reject creation if email already belongs to a user with another role", async () => {
      // Admin email is admin@axivontech.in
      await expect(
        approveAndCreateBrokerAccount({
          applicationId: "app-test-01",
          adminUserId: "admin-user-01",
          email: "admin@axivontech.in",
          mode: "DIRECT_PASSWORD",
          password: generateStrongPassword(14),
          mustChangePassword: true,
        })
      ).rejects.toThrow();
    });
  });

  describe("4. Reset Broker Password Service", () => {
    beforeEach(async () => {
      // Provision an active broker user
      await approveAndCreateBrokerAccount({
        applicationId: "app-test-01",
        adminUserId: "admin-user-01",
        email: "jane.broker@axivon.test",
        mode: "DIRECT_PASSWORD",
        password: generateStrongPassword(14),
        mustChangePassword: false,
      });
    });

    it("should reset password directly and enforce mustChangePassword", async () => {
      const brokerUser = mockUsers.find((u) => u.email === "jane.broker@axivon.test");
      const newPwd = generateStrongPassword(14);

      const res = await resetBrokerPassword({
        userId: brokerUser.id,
        adminUserId: "admin-user-01",
        mode: "DIRECT_PASSWORD",
        newPassword: newPwd,
        mustChangePassword: true,
      });

      expect(res.success).toBe(true);
      expect(res.credentials?.password).toBe(newPwd);
      expect(res.credentials?.mustChangePassword).toBe(true);

      // Verify db user updated
      const updatedUser = mockUsers.find((u) => u.id === brokerUser.id);
      expect(updatedUser.mustChangePassword).toBe(true);
      expect(await verifyPassword(newPwd, updatedUser.passwordHash)).toBe(true);

      // Verify audit log recorded WITHOUT raw password
      const resetLog = mockAuditLogs.find(
        (l) => l.action === "BROKER_PASSWORD_RESET_BY_ADMIN" || l.action === "BROKER_PASSWORD_RESET_DIRECT"
      );
      expect(resetLog).toBeDefined();
      expect(JSON.stringify(resetLog.details)).not.toContain(newPwd);
    });
  });
});
