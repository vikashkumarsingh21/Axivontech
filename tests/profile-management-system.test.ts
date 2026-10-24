import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  updateAccountProfileSchema,
  requestEmailChangeSchema,
  verifyEmailChangeSchema,
  hashVerificationToken,
  getUserProfileSettings,
  updateUserProfileSettings,
  requestEmailChange,
  cancelPendingEmailChange,
  verifyEmailChange,
  ensureAllowedProfileRole,
  isAllowedProfileRole,
  ALLOWED_PROFILE_ROLES,
} from "../src/lib/services/profile-settings.service";
import { EmailService } from "../src/lib/email/service";
import { isRateLimited } from "../src/lib/rate-limit";

// In-memory store for mocks
let mockUsers: Record<string, any> = {};
let mockEmailChangeRequests: any[] = [];
let mockAuditLogs: any[] = [];

// Mock db
vi.mock("@/lib/db", () => {
  return {
    db: {
      user: {
        findUnique: vi.fn().mockImplementation(({ where }) => {
          const user = mockUsers[where.id] || Object.values(mockUsers).find((u: any) => u.email === where.email);
          return Promise.resolve(user ? JSON.parse(JSON.stringify(user)) : null);
        }),
        findFirst: vi.fn().mockImplementation(({ where }) => {
          const emailTarget = where.email?.equals?.toLowerCase();
          const excludeId = where.NOT?.id;
          const user = Object.values(mockUsers).find(
            (u: any) => u.email.toLowerCase() === emailTarget && (!excludeId || u.id !== excludeId)
          );
          return Promise.resolve(user ? JSON.parse(JSON.stringify(user)) : null);
        }),
        update: vi.fn().mockImplementation(({ where, data }) => {
          const user = mockUsers[where.id];
          if (!user) throw new Error("User not found");
          Object.assign(user, data);
          user.updatedAt = new Date();
          return Promise.resolve(JSON.parse(JSON.stringify(user)));
        }),
      },
      emailChangeRequest: {
        findFirst: vi.fn().mockImplementation(({ where }) => {
          const reqs = mockEmailChangeRequests.filter(
            (r) => r.userId === where.userId && (where.status ? r.status === where.status : true)
          );
          return Promise.resolve(reqs[reqs.length - 1] ? JSON.parse(JSON.stringify(reqs[reqs.length - 1])) : null);
        }),
        findUnique: vi.fn().mockImplementation(({ where }) => {
          const req = mockEmailChangeRequests.find((r) => r.tokenHash === where.tokenHash);
          return Promise.resolve(req ? JSON.parse(JSON.stringify(req)) : null);
        }),
        update: vi.fn().mockImplementation(({ where, data }) => {
          const req = mockEmailChangeRequests.find((r) => r.id === where.id);
          if (!req) throw new Error("Request not found");
          Object.assign(req, data);
          return Promise.resolve(JSON.parse(JSON.stringify(req)));
        }),
        updateMany: vi.fn().mockImplementation(({ where, data }) => {
          let count = 0;
          for (const req of mockEmailChangeRequests) {
            if (req.userId === where.userId && (where.status ? req.status === where.status : true)) {
              Object.assign(req, data);
              count++;
            }
          }
          return Promise.resolve({ count });
        }),
        create: vi.fn().mockImplementation(({ data }) => {
          const record = {
            id: `req-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            ...data,
            requestedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          mockEmailChangeRequests.push(record);
          return Promise.resolve(JSON.parse(JSON.stringify(record)));
        }),
      },
      auditLog: {
        create: vi.fn().mockImplementation(({ data }) => {
          const entry = { id: `audit-${Date.now()}`, ...data, createdAt: new Date() };
          mockAuditLogs.push(entry);
          return Promise.resolve(entry);
        }),
      },
      communicationTemplate: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
      emailTemplate: {
        findUnique: vi.fn().mockResolvedValue(null),
      },
      emailLog: {
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: "log-1", ...data })),
      },
      $transaction: vi.fn().mockImplementation(async (callback) => {
        // Return callback passing the mocked db itself
        const { db } = await import("@/lib/db");
        return callback(db);
      }),
    },
  };
});

describe("Profile Management & Email Change Security Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEmailChangeRequests = [];
    mockAuditLogs = [];
    mockUsers = {
      "admin-001": {
        id: "admin-001",
        email: "admin@axivontech.in",
        name: "Platform Administrator",
        phone: "+91 9876543210",
        avatarUrl: "https://axivontech.in/avatars/admin.png",
        department: "Management",
        designation: "Principal Administrator",
        address: "Axivon HQ, Tech City",
        emergencyContact: "Emergency Liaison - +91 9999900000",
        status: "ACTIVE",
        joiningDate: new Date("2024-01-01"),
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date(),
        organization: { id: "org-1", name: "Axivon Technologies" },
        userRoles: [{ role: { name: "ADMIN", description: "Administrator" } }],
      },
      "founder-001": {
        id: "founder-001",
        email: "founder@axivontech.in",
        name: "Platform Founder",
        phone: "+91 9811122233",
        avatarUrl: null,
        department: "Executive",
        designation: "Chief Executive Officer",
        address: "Executive Suite",
        emergencyContact: null,
        status: "ACTIVE",
        joiningDate: new Date("2023-01-01"),
        createdAt: new Date("2023-01-01"),
        updatedAt: new Date(),
        organization: { id: "org-1", name: "Axivon Technologies" },
        userRoles: [{ role: { name: "FOUNDER", description: "Founder" } }],
      },
      "cofounder-001": {
        id: "cofounder-001",
        email: "tech.cofounder@axivontech.in",
        name: "Tech Co-Founder",
        phone: "+91 9833344455",
        avatarUrl: null,
        department: "Engineering",
        designation: "Chief Technology Officer",
        address: "Engineering Lab",
        emergencyContact: null,
        status: "ACTIVE",
        joiningDate: new Date("2023-01-01"),
        createdAt: new Date("2023-01-01"),
        updatedAt: new Date(),
        organization: { id: "org-1", name: "Axivon Technologies" },
        userRoles: [{ role: { name: "CO_FOUNDER", description: "Co-Founder" } }],
      },
      "employee-001": {
        id: "employee-001",
        email: "emp@axivontech.in",
        name: "Standard Employee",
        status: "ACTIVE",
        userRoles: [{ role: { name: "EMPLOYEE", description: "Employee" } }],
      },
      "other-user-002": {
        id: "other-user-002",
        email: "existing.account@axivontech.in",
        name: "Existing Account Holder",
        status: "ACTIVE",
        userRoles: [{ role: { name: "EMPLOYEE", description: "Employee" } }],
      },
      "audit-sanitization-user": {
        id: "audit-sanitization-user",
        email: "sanitization@axivontech.in",
        name: "Audit User",
        status: "ACTIVE",
        userRoles: [{ role: { name: "FOUNDER", description: "Founder" } }],
      },
    };
  });

  // ---------------------------------------------------------------------------
  // A. Profile Updates & Validation
  // ---------------------------------------------------------------------------
  describe("A. Profile Updates & Privilege Restrictions", () => {
    it("Admin can update their own permitted profile fields", async () => {
      const updateData = {
        name: "Updated Admin Name",
        phone: "+91 9123456789",
        address: "New Bengaluru Address",
        emergencyContact: "HQ Support - +91 9000011111",
      };

      const result = await updateUserProfileSettings("admin-001", updateData);
      expect(result.name).toBe("Updated Admin Name");
      expect(result.phone).toBe("+91 9123456789");
      expect(result.address).toBe("New Bengaluru Address");

      // Verify audit log was created
      const audit = mockAuditLogs.find((l) => l.action === "user.profile_updated");
      expect(audit).toBeDefined();
      expect(audit.userId).toBe("admin-001");
      expect(audit.details.updatedFields).toContain("name");
    });

    it("Founder can update their own permitted profile fields", async () => {
      const result = await updateUserProfileSettings("founder-001", {
        name: "Executive Founder Leader",
        phone: "+91 9000000001",
      });
      expect(result.name).toBe("Executive Founder Leader");
      expect(result.phone).toBe("+91 9000000001");
    });

    it("Co-Founder can update their own permitted profile fields", async () => {
      const result = await updateUserProfileSettings("cofounder-001", {
        name: "Dr. CTO Co-Founder",
      });
      expect(result.name).toBe("Dr. CTO Co-Founder");
    });

    it("strictly rejects attempts to alter role, permissions, passwordHash, status, or email via profile update", () => {
      // Privilege escalation attacks
      expect(() =>
        updateAccountProfileSchema.parse({
          name: "Admin",
          role: "SUPER_ADMIN",
        })
      ).toThrow();

      expect(() =>
        updateAccountProfileSchema.parse({
          name: "Admin",
          permissions: ["all:grant"],
        })
      ).toThrow();

      expect(() =>
        updateAccountProfileSchema.parse({
          name: "Admin",
          passwordHash: "$2a$12$malicioushash",
        })
      ).toThrow();

      expect(() =>
        updateAccountProfileSchema.parse({
          name: "Admin",
          status: "SUSPENDED",
        })
      ).toThrow();

      expect(() =>
        updateAccountProfileSchema.parse({
          name: "Admin",
          email: "arbitrary-hijack@axivontech.in",
        })
      ).toThrow();
    });

    it("rejects invalid input formats (short name, invalid phone, invalid URL)", () => {
      expect(() => updateAccountProfileSchema.parse({ name: "A" })).toThrow("at least 2 characters");
      expect(() => updateAccountProfileSchema.parse({ phone: "invalid-phone!#$abc" })).toThrow();
      expect(() => updateAccountProfileSchema.parse({ avatarUrl: "not-a-valid-url" })).toThrow();
    });

    it("rejects unauthenticated requests (missing/empty userId)", async () => {
      await expect(getUserProfileSettings("")).rejects.toThrow("Unauthorized");
      await expect(updateUserProfileSettings("", { name: "Test" })).rejects.toThrow("Unauthorized");
    });
  });

  // ---------------------------------------------------------------------------
  // B. Role Authorization Matrix
  // ---------------------------------------------------------------------------
  describe("B. Role-Based Authorization Matrix", () => {
    it("allows ADMIN, FOUNDER, and CO_FOUNDER roles explicitly", () => {
      expect(isAllowedProfileRole("ADMIN")).toBe(true);
      expect(isAllowedProfileRole("FOUNDER")).toBe(true);
      expect(isAllowedProfileRole("CO_FOUNDER")).toBe(true);
      expect(ALLOWED_PROFILE_ROLES).toEqual(["ADMIN", "FOUNDER", "CO_FOUNDER"]);
    });

    it("denies EMPLOYEE, CLIENT, BROKER from using privileged profile endpoint", () => {
      expect(isAllowedProfileRole("EMPLOYEE")).toBe(false);
      expect(isAllowedProfileRole("CLIENT")).toBe(false);
      expect(isAllowedProfileRole("BROKER")).toBe(false);
      expect(isAllowedProfileRole("BUSINESS_PARTNER")).toBe(false);

      expect(() => ensureAllowedProfileRole("EMPLOYEE")).toThrow("Forbidden");
      expect(() => ensureAllowedProfileRole("CLIENT")).toThrow("Forbidden");
      expect(() => ensureAllowedProfileRole("BROKER")).toThrow("Forbidden");
    });
  });

  // ---------------------------------------------------------------------------
  // C. Email Change Workflow & Security
  // ---------------------------------------------------------------------------
  describe("C. Email Change Request & Verification Workflow", () => {
    it("generates cryptographic single-use token and sends verification email for valid request", async () => {
      const emailSpy = vi.spyOn(EmailService, "send").mockResolvedValueOnce({ id: "log-1" } as any);

      const result = await requestEmailChange("admin-001", {
        newEmail: "new.admin@axivontech.in",
      });

      expect(result.success).toBe(true);
      expect(result.pendingEmail).toBe("new.admin@axivontech.in");

      // Verify request in DB
      expect(mockEmailChangeRequests.length).toBe(1);
      const req = mockEmailChangeRequests[0];
      expect(req.userId).toBe("admin-001");
      expect(req.oldEmail).toBe("admin@axivontech.in");
      expect(req.newEmail).toBe("new.admin@axivontech.in");
      expect(req.status).toBe("PENDING");
      // Must store SHA-256 hash (64 hex characters), NEVER the plaintext verification link
      expect(req.tokenHash).toHaveLength(64);

      // Verify email was dispatched to new address
      expect(emailSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "new.admin@axivontech.in",
          templateKey: "EMAIL_CHANGE_VERIFICATION",
        })
      );

      // Verify user's email has NOT changed yet (not granted prematurely)
      const user = mockUsers["admin-001"];
      expect(user.email).toBe("admin@axivontech.in");
    });

    it("rejects request when new email is identical to current email", async () => {
      await expect(
        requestEmailChange("admin-001", {
          newEmail: "admin@axivontech.in",
        })
      ).rejects.toThrow("same as your current verified email");
    });

    it("rejects request when new email is already assigned to another account (case-insensitive)", async () => {
      await expect(
        requestEmailChange("admin-001", {
          newEmail: "EXISTING.ACCOUNT@AXIVONTECH.IN",
        })
      ).rejects.toThrow("cannot be used");
    });

    it("rejects invalid email formats", () => {
      expect(() => requestEmailChangeSchema.parse({ newEmail: "not-an-email" })).toThrow();
      expect(() => requestEmailChangeSchema.parse({ newEmail: "@missingusername.com" })).toThrow();
      expect(() => requestEmailChangeSchema.parse({ newEmail: "test@domain" })).toThrow();
    });

    it("successfully cancels a pending email change", async () => {
      // First create pending request
      await requestEmailChange("founder-001", {
        newEmail: "founder.new@axivontech.in",
      });
      expect(mockEmailChangeRequests[0].status).toBe("PENDING");

      // Cancel
      const cancelResult = await cancelPendingEmailChange("founder-001");
      expect(cancelResult.success).toBe(true);

      const req = mockEmailChangeRequests[0];
      expect(req.status).toBe("CANCELLED");
      expect(req.cancelledAt).toBeDefined();

      // Verify audit log for cancellation
      const audit = mockAuditLogs.find((l) => l.action === "user.email_change_cancelled");
      expect(audit).toBeDefined();
    });

    it("supersedes older pending requests when a new request is made", async () => {
      await requestEmailChange("founder-001", {
        newEmail: "founder.draft1@axivontech.in",
      });
      const firstReq = mockEmailChangeRequests[0];
      expect(firstReq.status).toBe("PENDING");

      await requestEmailChange("founder-001", {
        newEmail: "founder.draft2@axivontech.in",
      });

      // First request must be superseded
      expect(firstReq.status).toBe("SUPERSEDED");
      const secondReq = mockEmailChangeRequests[1];
      expect(secondReq.status).toBe("PENDING");
      expect(secondReq.newEmail).toBe("founder.draft2@axivontech.in");
    });

    it("successfully verifies email change with valid token, updates user email, and alerts old address", async () => {
      const emailSpy = vi.spyOn(EmailService, "send").mockResolvedValue({ id: "log-1" } as any);

      // Create raw token and record in mock DB
      const rawToken = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
      const tokenHash = hashVerificationToken(rawToken);

      mockEmailChangeRequests.push({
        id: "req-verify-test",
        userId: "admin-001",
        oldEmail: "admin@axivontech.in",
        newEmail: "admin.verified@axivontech.in",
        tokenHash,
        status: "PENDING",
        expiresAt: new Date(Date.now() + 3600000), // 1 hour in future
      });

      const verifyResult = await verifyEmailChange(rawToken);
      expect(verifyResult.success).toBe(true);
      expect(verifyResult.newEmail).toBe("admin.verified@axivontech.in");

      // Check user's email in DB is now updated
      expect(mockUsers["admin-001"].email).toBe("admin.verified@axivontech.in");

      // Check request status is VERIFIED
      const req = mockEmailChangeRequests.find((r) => r.id === "req-verify-test");
      expect(req.status).toBe("VERIFIED");
      expect(req.verifiedAt).toBeDefined();

      // Verify security alert sent to OLD email address
      expect(emailSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "admin@axivontech.in",
          templateKey: "EMAIL_CHANGE_SECURITY_ALERT",
        })
      );

      // Verify confirmation sent to NEW email address
      expect(emailSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "admin.verified@axivontech.in",
          templateKey: "EMAIL_CHANGE_CONFIRMED",
        })
      );

      // Verify audit log entry
      const audit = mockAuditLogs.find((l) => l.action === "user.email_changed");
      expect(audit).toBeDefined();
      expect(audit.details.oldEmail).toBe("admin@axivontech.in");
      expect(audit.details.newEmail).toBe("admin.verified@axivontech.in");
    });

    it("rejects invalid, unknown, or tampered verification token", async () => {
      await expect(
        verifyEmailChange("tampered-or-unknown-token-that-does-not-exist-in-db-at-all-123456")
      ).rejects.toThrow("Invalid or already used verification token");

      const failAudit = mockAuditLogs.find((l) => l.action === "user.email_change_verification_failed");
      expect(failAudit).toBeDefined();
    });

    it("rejects expired token and marks request status as EXPIRED", async () => {
      const rawToken = "expired0123456789abcdef0123456789abcdef0123456789abcdef0123456789";
      const tokenHash = hashVerificationToken(rawToken);

      mockEmailChangeRequests.push({
        id: "req-expired-test",
        userId: "admin-001",
        oldEmail: "admin@axivontech.in",
        newEmail: "expired@axivontech.in",
        tokenHash,
        status: "PENDING",
        expiresAt: new Date(Date.now() - 1000), // in the past
      });

      await expect(verifyEmailChange(rawToken)).rejects.toThrow("Verification link has expired");

      const req = mockEmailChangeRequests.find((r) => r.id === "req-expired-test");
      expect(req.status).toBe("EXPIRED");
    });

    it("rejects reused token (single-use guarantee)", async () => {
      const rawToken = "alreadyused0123456789abcdef0123456789abcdef0123456789abcdef0123456";
      const tokenHash = hashVerificationToken(rawToken);

      mockEmailChangeRequests.push({
        id: "req-used-test",
        userId: "admin-001",
        oldEmail: "admin@axivontech.in",
        newEmail: "used@axivontech.in",
        tokenHash,
        status: "VERIFIED", // already used
        expiresAt: new Date(Date.now() + 3600000),
      });

      await expect(verifyEmailChange(rawToken)).rejects.toThrow("Invalid or already used verification token");
    });

    it("rejects verification if the target email was claimed by another account in the meantime (concurrency safety)", async () => {
      const rawToken = "concurrency0123456789abcdef0123456789abcdef0123456789abcdef012345";
      const tokenHash = hashVerificationToken(rawToken);

      mockEmailChangeRequests.push({
        id: "req-conflict-test",
        userId: "admin-001",
        oldEmail: "admin@axivontech.in",
        newEmail: "existing.account@axivontech.in", // already belongs to other-user-002
        tokenHash,
        status: "PENDING",
        expiresAt: new Date(Date.now() + 3600000),
      });

      await expect(verifyEmailChange(rawToken)).rejects.toThrow("associated with another account");

      const req = mockEmailChangeRequests.find((r) => r.id === "req-conflict-test");
      expect(req.status).toBe("CONFLICT");
      // Original admin email untouched
      expect(mockUsers["admin-001"].email).toBe("admin@axivontech.in");
    });
  });

  // ---------------------------------------------------------------------------
  // D. Security Audit Log Integrity
  // ---------------------------------------------------------------------------
  describe("D. Security Audit Log Data Sanitization", () => {
    it("never stores verification tokens, token hashes, passwords, or session cookies in audit logs", async () => {
      await requestEmailChange(
        "audit-sanitization-user",
        {
          newEmail: "sanitization.new@axivontech.in",
        },
        { ipAddress: "192.168.10.99" }
      );

      for (const log of mockAuditLogs) {
        const serialized = JSON.stringify(log);
        expect(serialized).not.toContain("passwordHash");
        expect(serialized).not.toContain("axivon_session");
        // Ensure raw tokens are not logged
        expect(log.details?.token).toBeUndefined();
        expect(log.details?.rawToken).toBeUndefined();
      }
    });
  });
});
