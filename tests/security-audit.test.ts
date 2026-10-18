import { describe, it, expect, vi, beforeEach } from "vitest";
import { isRateLimited, RATE_LIMIT_PRESETS } from "@/lib/rate-limit";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import nextConfig from "../next.config";

describe("Security Hardening & Protection Audits", () => {
  describe("Rate Limiting Enforcement", () => {
    it("should allow up to 5 login attempts within window and throttle 6th", () => {
      const testIp = `test-ip-${Date.now()}`;
      const key = `auth_login:${testIp}`;

      // 5 attempts allowed
      for (let i = 0; i < 5; i++) {
        const res = isRateLimited(key, RATE_LIMIT_PRESETS.AUTH_LOGIN);
        expect(res.limited).toBe(false);
        expect(res.remaining).toBe(4 - i);
      }

      // 6th attempt should be blocked
      const blocked = isRateLimited(key, RATE_LIMIT_PRESETS.AUTH_LOGIN);
      expect(blocked.limited).toBe(true);
      expect(blocked.remaining).toBe(0);
      expect(blocked.resetMs).toBeGreaterThan(0);
    });

    it("should throttle public lead submissions exceeding rate limit", () => {
      const testIp = `lead-ip-${Date.now()}`;
      const key = `public_lead:${testIp}`;

      for (let i = 0; i < 10; i++) {
        const res = isRateLimited(key, RATE_LIMIT_PRESETS.PUBLIC_LEADS);
        expect(res.limited).toBe(false);
      }

      const blocked = isRateLimited(key, RATE_LIMIT_PRESETS.PUBLIC_LEADS);
      expect(blocked.limited).toBe(true);
      expect(blocked.remaining).toBe(0);
    });
  });

  describe("Password Cryptographic Security", () => {
    it("should hash passwords with strong salt rounds and correctly verify", async () => {
      const plainPassword = "SuperSecurePassword123!@#";
      const hash = await hashPassword(plainPassword);

      expect(hash).not.toBe(plainPassword);
      expect(hash.startsWith("$2a$12$") || hash.startsWith("$2b$12$")).toBe(true);

      const isValid = await verifyPassword(plainPassword, hash);
      expect(isValid).toBe(true);

      const isInvalid = await verifyPassword("WrongPassword123!", hash);
      expect(isInvalid).toBe(false);
    }, 15000);
  });

  describe("HTTP Security Headers Audit", () => {
    it("should configure strict Content-Security-Policy and clickjacking prevention", async () => {
      expect(nextConfig.headers).toBeDefined();
      if (typeof nextConfig.headers !== "function") {
        throw new Error("headers must be a function in nextConfig");
      }

      const headersConfig = await nextConfig.headers();
      const rootHeaderEntry = headersConfig.find((h: any) => h.source === "/:path*");
      expect(rootHeaderEntry).toBeDefined();

      const headersList = rootHeaderEntry.headers;
      const headersMap = new Map(headersList.map((h: any) => [h.key, h.value]));

      // 1. Clickjacking protection (X-Frame-Options + frame-ancestors)
      expect(headersMap.get("X-Frame-Options")).toBe("DENY");
      const csp = headersMap.get("Content-Security-Policy");
      expect(csp).toBeDefined();
      expect(csp).toContain("frame-ancestors 'none'");

      // 2. MIME sniffing protection
      expect(headersMap.get("X-Content-Type-Options")).toBe("nosniff");

      // 3. Strict-Transport-Security (HSTS)
      expect(headersMap.get("Strict-Transport-Security")).toContain("max-age=31536000");
      expect(headersMap.get("Strict-Transport-Security")).toContain("includeSubDomains");

      // 4. Referrer-Policy
      expect(headersMap.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");

      // 5. Permissions-Policy
      expect(headersMap.get("Permissions-Policy")).toContain("camera=()");
      expect(headersMap.get("Permissions-Policy")).toContain("microphone=()");
    });
  });
});
