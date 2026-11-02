import { describe, it, expect, vi, beforeEach } from "vitest";
import { getExecutiveScope, isDepartmentAllowed } from "@/lib/auth/executive-scope";
import {
  enforceExecutiveAccountLimits,
  preventExecutiveDemotion,
  preventCrossExecutiveCredentialModification,
  isExecutiveRole,
  getExecutiveAccountSummary,
} from "@/lib/auth/executive-account-guard";
import { resolveRoleDashboardUrl, ROLE_PRIORITY } from "@/lib/auth/roles";
import { POST as changePassword } from "@/app/api/v1/auth/change-password/route";
import { PATCH as updateRole } from "@/app/api/v1/executive/people/[id]/role/route";
import { POST as resetPasswordAdmin } from "@/app/api/v1/executive/people/[id]/password-reset/route";
import { NextRequest } from "next/server";

// Mock User Database & Audit Store
let mockUsers: any[] = [];
let mockSessions: any[] = [];
let mockAuditLogs: any[] = [];
let currentSessionUser: any = null;

vi.mock("@/lib/auth/session", () => ({
  getAuthenticatedSession: vi.fn().mockImplementation(() => {
    if (!currentSessionUser) {
      const err: any = new Error("Authentication required");
      err.statusCode = 401;
      return Promise.reject(err);
    }
    return Promise.resolve({
      userId: currentSessionUser.id,
      email: currentSessionUser.email,
      name: currentSessionUser.name,
      role: currentSessionUser.role,
      status: currentSessionUser.status,
    });
  }),
  signSession: vi.fn().mockResolvedValue("mocked-jwt-session-token"),
}));

vi.mock("@/lib/auth/permissions", () => ({
  requirePermission: vi.fn().mockImplementation((userId: string | null) => {
    if (!userId) {
      const err: any = new Error("Unauthorized");
      err.statusCode = 401;
      throw err;
    }
    const user = mockUsers.find((u) => u.id === userId);
    if (!user || user.status === "INACTIVE") {
      const err: any = new Error("Forbidden");
      err.statusCode = 403;
      throw err;
    }
    return Promise.resolve(user);
  }),
}));

vi.mock("@/lib/auth/password", () => ({
  verifyPassword: vi.fn().mockImplementation((password: string, hash: string) => {
    return Promise.resolve(password === hash || hash === `hashed_${password}`);
  }),
  hashPassword: vi.fn().mockImplementation((password: string) => {
    return Promise.resolve(`hashed_${password}`);
  }),
  validatePasswordStrength: vi.fn().mockImplementation((password: string) => {
    const isValid = password.length >= 10 && /[A-Z]/.test(password) && /[0-9]/.test(password);
    return {
      isValid,
      errors: isValid ? [] : ["Password too weak"],
    };
  }),
}));

vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: vi.fn().mockImplementation(({ where, include }) => {
        const u = mockUsers.find((user) => user.id === where.id || user.email === where.email);
        if (!u) return Promise.resolve(null);
        return Promise.resolve({
          ...u,
          userRoles: u.userRoles || [{ role: { name: u.role } }],
          executiveProfile: u.executiveProfile || null,
        });
      }),
      findFirst: vi.fn().mockImplementation(({ where }) => {
        const u = mockUsers.find((user) => {
          if (where.id?.not && user.id === where.id.not) return false;
          if (where.userRoles?.some?.role?.name) {
            const requiredRole = where.userRoles.some.role.name;
            const hasRole = user.userRoles?.some((ur: any) => ur.role.name === requiredRole) || user.role === requiredRole;
            return hasRole;
          }
          return false;
        });
        return Promise.resolve(u || null);
      }),
      findMany: vi.fn().mockImplementation(({ where }) => {
        const filtered = mockUsers.filter((user) => {
          if (where.userRoles?.some?.role?.name) {
            const roleName = where.userRoles.some.role.name;
            return user.userRoles?.some((ur: any) => ur.role.name === roleName) || user.role === roleName;
          }
          return true;
        });
        return Promise.resolve(filtered);
      }),
      update: vi.fn().mockImplementation(({ where, data }) => {
        const idx = mockUsers.findIndex((user) => user.id === where.id);
        if (idx !== -1) {
          mockUsers[idx] = { ...mockUsers[idx], ...data, updatedAt: new Date() };
          return Promise.resolve(mockUsers[idx]);
        }
        return Promise.resolve(null);
      }),
    },
    role: {
      findUnique: vi.fn().mockImplementation(({ where }) => {
        return Promise.resolve({ id: `role-${where.name.toLowerCase()}`, name: where.name });
      }),
      create: vi.fn().mockImplementation(({ data }) => {
        return Promise.resolve({ id: `role-${data.name.toLowerCase()}`, name: data.name });
      }),
    },
    userRole: {
      deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
      create: vi.fn().mockImplementation(({ data }) => Promise.resolve(data)),
    },
    session: {
      deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    auditLog: {
      create: vi.fn().mockImplementation(({ data }) => {
        mockAuditLogs.push(data);
        return Promise.resolve(data);
      }),
    },
    $transaction: vi.fn().mockImplementation(async (arg) => {
      if (Array.isArray(arg)) {
        return Promise.all(arg);
      }
      if (typeof arg === "function") {
        return arg({
          user: {
            findFirst: vi.fn().mockImplementation(({ where }: any) => {
              const u = mockUsers.find((user) => {
                if (where.id?.not && user.id === where.id.not) return false;
                if (where.userRoles?.some?.role?.name) {
                  const requiredRole = where.userRoles.some.role.name;
                  return user.userRoles?.some((ur: any) => ur.role.name === requiredRole) || user.role === requiredRole;
                }
                return false;
              });
              return Promise.resolve(u || null);
            }),
            update: vi.fn().mockImplementation(({ where, data }: any) => {
              const idx = mockUsers.findIndex((user) => user.id === where.id);
              if (idx !== -1) {
                mockUsers[idx] = { ...mockUsers[idx], ...data };
                return Promise.resolve(mockUsers[idx]);
              }
              return Promise.resolve(null);
            }),
          },
          role: {
            findUnique: vi.fn().mockResolvedValue({ id: "role-test", name: "TEST" }),
            create: vi.fn().mockResolvedValue({ id: "role-test", name: "TEST" }),
          },
          userRole: {
            deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
            create: vi.fn().mockResolvedValue({ count: 1 }),
          },
          session: {
            deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
          },
          auditLog: {
            create: vi.fn().mockImplementation(({ data }: any) => {
              mockAuditLogs.push(data);
              return Promise.resolve(data);
            }),
          },
        });
      }
      return Promise.resolve(null);
    }),
  },
}));

describe("Founder & Co-Founder Portal Consolidation & Security Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuditLogs = [];
    mockSessions = [];

    // Initialize exactly one designated Founder and one designated Co-Founder
    mockUsers = [
      {
        id: "usr-founder-001",
        name: "Vikas Kumar",
        email: "founder@axivon.dev",
        passwordHash: "hashed_FounderSecure@2026",
        role: "FOUNDER",
        status: "ACTIVE",
        userRoles: [{ role: { name: "FOUNDER" } }],
        executiveProfile: { responsibilityProfile: "FULL", departmentScope: null },
      },
      {
        id: "usr-cofounder-001",
        name: "Rokhiya Khanam",
        email: "tech.cofounder@axivon.dev",
        passwordHash: "hashed_CoFounderSecure@2026",
        role: "CO_FOUNDER",
        status: "ACTIVE",
        userRoles: [{ role: { name: "CO_FOUNDER" } }],
        executiveProfile: { responsibilityProfile: "TECHNOLOGY", departmentScope: null },
      },
      {
        id: "usr-admin-001",
        name: "Admin User",
        email: "admin@axivon.dev",
        passwordHash: "hashed_AdminSecure@2026",
        role: "ADMIN",
        status: "ACTIVE",
        userRoles: [{ role: { name: "ADMIN" } }],
      },
      {
        id: "usr-employee-001",
        name: "Dev Employee",
        email: "dev@axivon.dev",
        passwordHash: "hashed_Employee@2026",
        role: "EMPLOYEE",
        status: "ACTIVE",
        userRoles: [{ role: { name: "EMPLOYEE" } }],
      },
    ];

    currentSessionUser = mockUsers[0];
  });

  describe("1. Shared Executive Dashboard Navigation & 50-50 Business Permissions", () => {
    it("redirects both FOUNDER and CO_FOUNDER to /executive/dashboard", () => {
      expect(resolveRoleDashboardUrl("FOUNDER")).toBe("/executive/dashboard");
      expect(resolveRoleDashboardUrl("CO_FOUNDER")).toBe("/executive/dashboard");
    });

    it("assigns equal top administrative weight (100) to both Founder and Co-Founder", () => {
      expect(ROLE_PRIORITY.FOUNDER).toBe(100);
      expect(ROLE_PRIORITY.CO_FOUNDER).toBe(100);
      expect(ROLE_PRIORITY.CO_FOUNDER).toBe(ROLE_PRIORITY.FOUNDER);
    });

    it("grants full unrestricted departmental and project visibility to both Founder and Co-Founder", async () => {
      const founderScope = await getExecutiveScope("usr-founder-001");
      const coFounderScope = await getExecutiveScope("usr-cofounder-001");

      // Verify Founder scope
      expect(founderScope.isFounder).toBe(true);
      expect(founderScope.isExecutive).toBe(true);
      expect(founderScope.allowedDepartments).toBeNull();
      expect(founderScope.allowedProjects).toBeNull();
      expect(isDepartmentAllowed(founderScope, "Engineering")).toBe(true);
      expect(isDepartmentAllowed(founderScope, "Finance")).toBe(true);

      // Verify Co-Founder scope (Equal 50-50 partnership)
      expect(coFounderScope.isFounder).toBe(true);
      expect(coFounderScope.isCoFounder).toBe(true);
      expect(coFounderScope.isExecutive).toBe(true);
      expect(coFounderScope.allowedDepartments).toBeNull();
      expect(coFounderScope.allowedProjects).toBeNull();
      expect(isDepartmentAllowed(coFounderScope, "Engineering")).toBe(true);
      expect(isDepartmentAllowed(coFounderScope, "Operations")).toBe(true);
      expect(isDepartmentAllowed(coFounderScope, "HR")).toBe(true);
      expect(isDepartmentAllowed(coFounderScope, "Finance")).toBe(true);
    });
  });

  describe("2. Account Separation & Distinct Identities", () => {
    it("maintains separate user IDs, emails, display names, and password hashes", () => {
      const founder = mockUsers.find((u) => u.role === "FOUNDER");
      const coFounder = mockUsers.find((u) => u.role === "CO_FOUNDER");

      expect(founder.id).not.toBe(coFounder.id);
      expect(founder.email).not.toBe(coFounder.email);
      expect(founder.name).not.toBe(coFounder.name);
      expect(founder.passwordHash).not.toBe(coFounder.passwordHash);
      expect(founder.role).toBe("FOUNDER");
      expect(coFounder.role).toBe("CO_FOUNDER");
    });
  });

  describe("3. Strict Account-Count Enforcement (Exactly 1 Founder & 1 Co-Founder)", () => {
    it("reports exactly 1 Founder and 1 Co-Founder as valid pair", async () => {
      const summary = await getExecutiveAccountSummary();
      expect(summary.founderCount).toBe(1);
      expect(summary.coFounderCount).toBe(1);
      expect(summary.isValidPair).toBe(true);
    });

    it("rejects attempt to create or assign a second FOUNDER account with 409 Conflict", async () => {
      await expect(
        enforceExecutiveAccountLimits("FOUNDER", "usr-employee-001")
      ).rejects.toThrow("The organization permits exactly ONE designated Founder account");
    });

    it("rejects attempt to create or assign a second CO_FOUNDER account with 409 Conflict", async () => {
      await expect(
        enforceExecutiveAccountLimits("CO_FOUNDER", "usr-employee-001")
      ).rejects.toThrow("The organization permits exactly ONE designated Co-Founder account");
    });

    it("allows the existing Founder and Co-Founder to re-validate their own accounts without conflict", async () => {
      await expect(
        enforceExecutiveAccountLimits("FOUNDER", "usr-founder-001")
      ).resolves.not.toThrow();

      await expect(
        enforceExecutiveAccountLimits("CO_FOUNDER", "usr-cofounder-001")
      ).resolves.not.toThrow();
    });

    it("protects designated Founder and Co-Founder from demotion or role removal", async () => {
      await expect(
        preventExecutiveDemotion("usr-founder-001")
      ).rejects.toThrow("cannot be demoted");

      await expect(
        preventExecutiveDemotion("usr-cofounder-001")
      ).rejects.toThrow("cannot be demoted");
    });
  });

  describe("4. Credential Isolation & Self-Service Password Management", () => {
    it("prohibits Founder from modifying or resetting Co-Founder credentials via administrative endpoint", async () => {
      await expect(
        preventCrossExecutiveCredentialModification(
          "usr-founder-001",
          "usr-cofounder-001",
          "reset password for"
        )
      ).rejects.toThrow("Executive Credential Isolation: Cross-executive administrative modification is prohibited");
    });

    it("prohibits Co-Founder from modifying or resetting Founder credentials via administrative endpoint", async () => {
      await expect(
        preventCrossExecutiveCredentialModification(
          "usr-cofounder-001",
          "usr-founder-001",
          "reset password for"
        )
      ).rejects.toThrow("Executive Credential Isolation: Cross-executive administrative modification is prohibited");
    });

    it("allows Founder to securely change their own password via self-service", async () => {
      currentSessionUser = mockUsers[0]; // Founder

      const req = new NextRequest("http://localhost:3000/api/v1/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: "hashed_FounderSecure@2026",
          newPassword: "BrandNewFounderPassword@2026",
          confirmPassword: "BrandNewFounderPassword@2026",
        }),
      });

      const res = await changePassword(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);

      // Verify updated hash
      expect(mockUsers[0].passwordHash).toBe("hashed_BrandNewFounderPassword@2026");
      // Verify audit log
      expect(mockAuditLogs.some((l) => l.action === "user.password_change_completed")).toBe(true);
    });

    it("allows Co-Founder to securely change their own password via self-service", async () => {
      currentSessionUser = mockUsers[1]; // Co-Founder

      const req = new NextRequest("http://localhost:3000/api/v1/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: "hashed_CoFounderSecure@2026",
          newPassword: "BrandNewCoFounderPassword@2026",
          confirmPassword: "BrandNewCoFounderPassword@2026",
        }),
      });

      const res = await changePassword(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);

      // Verify updated hash
      expect(mockUsers[1].passwordHash).toBe("hashed_BrandNewCoFounderPassword@2026");
    });

    it("blocks executive password reset through administrative override endpoint", async () => {
      const req = new Request("http://localhost:3000/api/v1/executive/people/usr-cofounder-001/password-reset", {
        method: "POST",
        headers: {
          "x-user-id": "usr-founder-001",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newPassword: "UnauthorizedPassword@123",
          confirmPassword: "UnauthorizedPassword@123",
        }),
      });

      const res = await resetPasswordAdmin(req, {
        params: Promise.resolve({ id: "usr-cofounder-001" }),
      });
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error).toContain("Executive credentials cannot be reset");
    });
  });

  describe("5. Role Management Endpoint Security", () => {
    it("allows Founder or Co-Founder to promote a standard employee to Admin", async () => {
      const req = new Request("http://localhost:3000/api/v1/executive/people/usr-employee-001/role", {
        method: "PATCH",
        headers: {
          "x-user-id": "usr-cofounder-001",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ roleName: "ADMIN" }),
      });

      const res = await updateRole(req, {
        params: Promise.resolve({ id: "usr-employee-001" }),
      });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.message).toContain("Role changed to ADMIN");
    });

    it("rejects attempt to demote Founder or Co-Founder via role management endpoint", async () => {
      const req = new Request("http://localhost:3000/api/v1/executive/people/usr-cofounder-001/role", {
        method: "PATCH",
        headers: {
          "x-user-id": "usr-founder-001",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ roleName: "EMPLOYEE" }),
      });

      const res = await updateRole(req, {
        params: Promise.resolve({ id: "usr-cofounder-001" }),
      });
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error).toContain("Cannot change a Founder's role");
    });

    it("rejects attempt to assign a second CO_FOUNDER role with HTTP 409 Conflict", async () => {
      const req = new Request("http://localhost:3000/api/v1/executive/people/usr-employee-001/role", {
        method: "PATCH",
        headers: {
          "x-user-id": "usr-founder-001",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ roleName: "CO_FOUNDER" }),
      });

      const res = await updateRole(req, {
        params: Promise.resolve({ id: "usr-employee-001" }),
      });
      expect(res.status).toBe(409);
      const json = await res.json();
      expect(json.error).toContain("The organization permits exactly ONE designated Co-Founder account");
    });
  });

  describe("6. Non-Executive & Unrelated Portal Isolation", () => {
    it("denies standard employees from accessing executive scope", async () => {
      await expect(getExecutiveScope("usr-employee-001")).rejects.toThrow("Forbidden");
    });

    it("denies administrative users from accessing executive scope", async () => {
      await expect(getExecutiveScope("usr-admin-001")).rejects.toThrow("Forbidden");
    });

    it("preserves Admin, Broker, and Employee route resolution", () => {
      expect(resolveRoleDashboardUrl("ADMIN")).toBe("/admin/dashboard");
      expect(resolveRoleDashboardUrl("BUSINESS_PARTNER")).toBe("/broker/dashboard");
      expect(resolveRoleDashboardUrl("BROKER")).toBe("/broker/dashboard");
      expect(resolveRoleDashboardUrl("EMPLOYEE")).toBe("/employee/dashboard");
    });
  });
});
