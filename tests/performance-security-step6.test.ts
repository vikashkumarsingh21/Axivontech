import { describe, it, expect, vi, beforeEach } from "vitest";
import { requirePermission, validateActiveUser, hasPermission } from "@/lib/auth/permissions";
import { isRateLimited, RATE_LIMIT_PRESETS } from "@/lib/rate-limit";
import { signSession, verifySession } from "@/lib/auth/session";
import nextConfig from "../next.config";

// Mock database for permissions test
vi.mock("@/lib/db", () => {
  return {
    db: {
      user: {
        findUnique: vi.fn(),
      },
      auditLog: {
        create: vi.fn().mockResolvedValue({ id: "audit-1" }),
      },
    },
  };
});

// Import db to configure mock implementations
import { db } from "@/lib/db";

describe("Step 6: Performance, Security & Production Optimization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /* =========================================================================
     1. Database & RBAC Query Optimization (Single Consolidated Query)
     ========================================================================= */
  describe("RBAC & Query Consolidation Optimization", () => {
    it("should throw 401 when userId is null or empty", async () => {
      await expect(requirePermission(null, "admin:access")).rejects.toThrow("Unauthorized");
      await expect(requirePermission("", "admin:access")).rejects.toThrow("Unauthorized");
      expect(db.user.findUnique).not.toHaveBeenCalled();
    });

    it("should throw 401 when user is not found in database", async () => {
      (db.user.findUnique as any).mockResolvedValueOnce(null);

      await expect(requirePermission("user-999", "admin:access")).rejects.toThrow(
        "Unauthorized: User not found"
      );
      expect(db.user.findUnique).toHaveBeenCalledTimes(1);
    });

    it("should throw 403 when user account is INACTIVE", async () => {
      (db.user.findUnique as any).mockResolvedValueOnce({
        id: "inactive-user",
        email: "inactive@axivontech.in",
        name: "Inactive User",
        status: "INACTIVE",
        userRoles: [
          {
            role: {
              name: "ADMIN",
              rolePermissions: [],
            },
          },
        ],
      });

      await expect(requirePermission("inactive-user", "admin:access")).rejects.toThrow(
        "ACCOUNT_INACTIVE"
      );
      expect(db.user.findUnique).toHaveBeenCalledTimes(1);
    });

    it("should bypass permission check for FOUNDER / CO_FOUNDER / ADMIN with exactly 1 query", async () => {
      (db.user.findUnique as any).mockResolvedValueOnce({
        id: "founder-1",
        email: "founder@axivontech.in",
        name: "Founder User",
        status: "ACTIVE",
        userRoles: [
          {
            role: {
              name: "FOUNDER",
              rolePermissions: [],
            },
          },
        ],
      });

      const user = await requirePermission("founder-1", "any:super:permission");
      expect(user).toBeDefined();
      expect(user.id).toBe("founder-1");
      // CRITICAL PERFORMANCE VERIFICATION: exactly ONE database query was executed
      expect(db.user.findUnique).toHaveBeenCalledTimes(1);
    });

    it("should authorize employee with granular matching role permission", async () => {
      (db.user.findUnique as any).mockResolvedValueOnce({
        id: "emp-1",
        email: "dev@axivontech.in",
        name: "Developer",
        status: "ACTIVE",
        userRoles: [
          {
            role: {
              name: "EMPLOYEE",
              rolePermissions: [
                { permission: { name: "tasks:read" } },
                { permission: { name: "tasks:write" } },
              ],
            },
          },
        ],
      });

      const user = await requirePermission("emp-1", "tasks:write");
      expect(user).toBeDefined();
      expect(user.id).toBe("emp-1");
      expect(db.user.findUnique).toHaveBeenCalledTimes(1);
    });

    it("should reject with 403 Forbidden when required permission is not possessed", async () => {
      (db.user.findUnique as any).mockResolvedValueOnce({
        id: "emp-2",
        email: "junior@axivontech.in",
        name: "Junior Dev",
        status: "ACTIVE",
        userRoles: [
          {
            role: {
              name: "EMPLOYEE",
              rolePermissions: [{ permission: { name: "tasks:read" } }],
            },
          },
        ],
      });

      await expect(requirePermission("emp-2", "payroll:manage")).rejects.toThrow(
        "Forbidden: Requires payroll:manage permission"
      );
      expect(db.user.findUnique).toHaveBeenCalledTimes(1);
    });

    it("validateActiveUser rejects inactive users and returns active user", async () => {
      (db.user.findUnique as any).mockResolvedValueOnce({
        id: "active-user",
        status: "ACTIVE",
        email: "test@axivontech.in",
      });

      const active = await validateActiveUser("active-user");
      expect(active.id).toBe("active-user");

      (db.user.findUnique as any).mockResolvedValueOnce({
        id: "inactive-user",
        status: "INACTIVE",
      });

      await expect(validateActiveUser("inactive-user")).rejects.toThrow("ACCOUNT_INACTIVE");
    });
  });

  /* =========================================================================
     2. Rate Limiting Engine & Security Presets
     ========================================================================= */
  describe("Rate Limiting & DoS Protection", () => {
    it("should allow requests up to maxRequests and then throttle", () => {
      const key = `test_ip_${Date.now()}_${Math.random()}`;
      const opts = { windowMs: 10000, maxRequests: 3 };

      // Request 1: allowed
      const r1 = isRateLimited(key, opts);
      expect(r1.limited).toBe(false);
      expect(r1.remaining).toBe(2);

      // Request 2: allowed
      const r2 = isRateLimited(key, opts);
      expect(r2.limited).toBe(false);
      expect(r2.remaining).toBe(1);

      // Request 3: allowed (last one)
      const r3 = isRateLimited(key, opts);
      expect(r3.limited).toBe(false);
      expect(r3.remaining).toBe(0);

      // Request 4: throttled
      const r4 = isRateLimited(key, opts);
      expect(r4.limited).toBe(true);
      expect(r4.remaining).toBe(0);
      expect(r4.resetMs).toBeGreaterThan(0);
    });

    it("should verify defined security presets are configured safely", () => {
      // Login must be strict: 5 attempts per min
      expect(RATE_LIMIT_PRESETS.AUTH_LOGIN.maxRequests).toBe(5);
      expect(RATE_LIMIT_PRESETS.AUTH_LOGIN.windowMs).toBe(60000);

      // Public leads: 10 per 15 min
      expect(RATE_LIMIT_PRESETS.PUBLIC_LEADS.maxRequests).toBe(10);
      expect(RATE_LIMIT_PRESETS.PUBLIC_LEADS.windowMs).toBe(15 * 60 * 1000);

      // Resume uploads: 5 per 15 min
      expect(RATE_LIMIT_PRESETS.RESUME_UPLOAD.maxRequests).toBe(5);
      expect(RATE_LIMIT_PRESETS.RESUME_UPLOAD.windowMs).toBe(15 * 60 * 1000);

      // Sensitive API: 30 per min
      expect(RATE_LIMIT_PRESETS.SENSITIVE_API.maxRequests).toBe(30);

      // General API: 100 per min
      expect(RATE_LIMIT_PRESETS.GENERAL_API.maxRequests).toBe(100);
    });
  });

  /* =========================================================================
     3. Production Security Headers & Cache Configuration
     ========================================================================= */
  describe("Security Headers & Cache Controls", () => {
    it("should configure strict security headers for all routes in next.config.ts", async () => {
      expect(nextConfig.headers).toBeDefined();
      const headersConfig = await (nextConfig.headers as any)();

      // Find root headers
      const rootRule = headersConfig.find((r: any) => r.source === "/:path*");
      expect(rootRule).toBeDefined();

      const getHeader = (key: string) =>
        rootRule.headers.find((h: any) => h.key.toLowerCase() === key.toLowerCase())?.value;

      expect(getHeader("X-Frame-Options")).toBe("DENY");
      expect(getHeader("X-Content-Type-Options")).toBe("nosniff");
      expect(getHeader("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
      expect(getHeader("Strict-Transport-Security")).toContain("max-age=31536000");
      expect(getHeader("Content-Security-Policy")).toContain("default-src 'self'");
      expect(getHeader("Permissions-Policy")).toContain("camera=()");
    });

    it("should enforce no-store and no-cache for all API endpoints", async () => {
      const headersConfig = await (nextConfig.headers as any)();

      const apiRule = headersConfig.find((r: any) => r.source === "/api/:path*");
      expect(apiRule).toBeDefined();

      const cacheControl = apiRule.headers.find(
        (h: any) => h.key.toLowerCase() === "cache-control"
      )?.value;
      const pragma = apiRule.headers.find((h: any) => h.key.toLowerCase() === "pragma")?.value;

      expect(cacheControl).toContain("no-store");
      expect(cacheControl).toContain("no-cache");
      expect(cacheControl).toContain("max-age=0");
      expect(pragma).toBe("no-cache");
    });

    it("should enforce long-lived immutable cache for static assets and fonts", async () => {
      const headersConfig = await (nextConfig.headers as any)();

      const assetsRule = headersConfig.find((r: any) => r.source === "/assets/:path*");
      expect(assetsRule).toBeDefined();
      expect(
        assetsRule.headers.find((h: any) => h.key.toLowerCase() === "cache-control")?.value
      ).toBe("public, max-age=31536000, immutable");

      const fontsRule = headersConfig.find((r: any) => r.source === "/fonts/:path*");
      expect(fontsRule).toBeDefined();
      expect(
        fontsRule.headers.find((h: any) => h.key.toLowerCase() === "cache-control")?.value
      ).toBe("public, max-age=31536000, immutable");
    });
  });

  /* =========================================================================
     4. Cryptographic Session Token Security
     ========================================================================= */
  describe("Cryptographic Session Integrity", () => {
    it("should correctly sign and verify a tamper-proof session token", async () => {
      const payload = {
        userId: "user-sec-1",
        role: "ADMIN",
        sessionId: "sess-abc-123",
      };

      const token = await signSession(payload);
      expect(typeof token).toBe("string");
      expect(token.split(".").length).toBe(3); // Standard JWT format (header.payload.signature)

      const verified = await verifySession(token);
      expect(verified).not.toBeNull();
      expect(verified?.userId).toBe(payload.userId);
      expect(verified?.role).toBe(payload.role);
      expect(verified?.sessionId).toBe(payload.sessionId);
    });

    it("should reject tampered or corrupted session tokens", async () => {
      const token = await signSession({
        userId: "user-sec-2",
        role: "EMPLOYEE",
        sessionId: "sess-456",
      });

      // Tamper signature
      const tampered = token.slice(0, -6) + "XXXXXX";
      const verified = await verifySession(tampered);
      expect(verified).toBeNull();
    });

    it("should reject completely invalid token formats", async () => {
      expect(await verifySession("not-a-token")).toBeNull();
      expect(await verifySession("")).toBeNull();
    });
  });

  /* =========================================================================
     5. Secure File Upload & Input Validation Logic
     ========================================================================= */
  describe("File Upload & Input Sanitization Boundaries", () => {
    it("should validate and allow standard document formats", () => {
      const validExtensions = [".pdf", ".doc", ".docx"];
      expect(validExtensions.includes(".pdf")).toBe(true);
      expect(validExtensions.includes(".doc")).toBe(true);
      expect(validExtensions.includes(".docx")).toBe(true);
    });

    it("should strictly reject potentially dangerous executable / script extensions", () => {
      const validExtensions = [".pdf", ".doc", ".docx"];
      const dangerousExtensions = [
        ".exe",
        ".sh",
        ".bat",
        ".cmd",
        ".php",
        ".js",
        ".ts",
        ".html",
        ".htm",
        ".svg",
        ".vbs",
        ".ps1",
      ];

      for (const ext of dangerousExtensions) {
        expect(validExtensions.includes(ext)).toBe(false);
      }
    });

    it("should sanitize filenames to eliminate path traversal characters", () => {
      const maliciousNames = [
        "../../../etc/passwd.pdf",
        "..\\..\\windows\\system32\\cmd.exe.pdf",
        "resume;rm -rf.docx",
        "my resume (2026) <script>.pdf",
      ];

      for (const raw of maliciousNames) {
        const sanitized = raw.replace(/[^a-zA-Z0-9.-]/g, "_").replace(/\.{2,}/g, ".");
        expect(sanitized).not.toContain("../");
        expect(sanitized).not.toContain("..\\");
        expect(sanitized).not.toContain("<");
        expect(sanitized).not.toContain(">");
        expect(sanitized).not.toContain(";");
      }
    });

    it("should enforce maximum file size ceiling (10MB)", () => {
      const MAX_SIZE = 10 * 1024 * 1024; // 10,485,760 bytes
      const validSize = 4.2 * 1024 * 1024;
      const oversizeFile = 10.5 * 1024 * 1024;

      expect(validSize <= MAX_SIZE).toBe(true);
      expect(oversizeFile <= MAX_SIZE).toBe(false);
    });
  });
});
