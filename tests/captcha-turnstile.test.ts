import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  verifyTurnstileToken,
  getCaptchaMetrics,
  clearUsedTokensCacheForTesting,
  verifyFormProtection,
  getTurnstileSiteKey,
  getTurnstileSecretKey,
} from "@/lib/captcha";
import { NextRequest } from "next/server";

describe("Cloudflare Turnstile CAPTCHA & Anti-Bot Security System", () => {
  beforeEach(() => {
    clearUsedTokensCacheForTesting();
  });

  describe("Configuration & Confidentiality", () => {
    it("provides a valid public sitekey without exposing secret keys", () => {
      const siteKeyInfo = getTurnstileSiteKey();
      expect(siteKeyInfo).toBeTruthy();
      expect(typeof siteKeyInfo.siteKey).toBe("string");
      expect(siteKeyInfo.siteKey.length).toBeGreaterThan(5);

      const secretInfo = getTurnstileSecretKey();
      expect(secretInfo.isConfigured).toBe(true);
      // Secret key must never equal the site key
      expect(secretInfo.secretKey).not.toBe(siteKeyInfo.siteKey);
    });

    it("never leaks secret keys in error or verification results", async () => {
      const secretInfo = getTurnstileSecretKey();
      const secret = secretInfo.secretKey;

      const result = await verifyTurnstileToken({
        token: "MALICIOUS_DUMMY_TOKEN_xyz",
      });

      expect(result.success).toBe(false);
      const serialized = JSON.stringify(result);
      if (secret) {
        expect(serialized).not.toContain(secret);
      }
    });
  });

  describe("Token Verification Engine (verifyTurnstileToken)", () => {
    it("fails when token is null, undefined, or empty string", async () => {
      const resNull = await verifyTurnstileToken({ token: null });
      expect(resNull.success).toBe(false);
      expect(resNull.status).toBe("MISSING_TOKEN");

      const resUndefined = await verifyTurnstileToken({ token: undefined });
      expect(resUndefined.success).toBe(false);
      expect(resUndefined.status).toBe("MISSING_TOKEN");

      const resEmpty = await verifyTurnstileToken({ token: "   " });
      expect(resEmpty.success).toBe(false);
      expect(resEmpty.status).toBe("MISSING_TOKEN");
    });

    it("accepts Cloudflare official test pass token", async () => {
      const res = await verifyTurnstileToken({
        token: "1x00000000000000000000AA",
      });
      expect(res.success).toBe(true);
      expect(res.status).toBe("VERIFIED");
    });

    it("accepts dummy pass testing token", async () => {
      const res = await verifyTurnstileToken({
        token: "XXXX.DUMMY.PASS.TOKEN.XXXX",
      });
      expect(res.success).toBe(true);
      expect(res.status).toBe("VERIFIED");
    });

    it("rejects Cloudflare official test fail token", async () => {
      const res = await verifyTurnstileToken({
        token: "2x00000000000000000000AB",
      });
      expect(res.success).toBe(false);
      expect(res.status).toBe("INVALID_TOKEN");
    });

    it("rejects dummy fail token", async () => {
      const res = await verifyTurnstileToken({
        token: "XXXX.DUMMY.FAIL.TOKEN.XXXX",
      });
      expect(res.success).toBe(false);
      expect(res.status).toBe("INVALID_TOKEN");
    });

    it("enforces replay prevention (single-use tokens)", async () => {
      const replayToken = `XXXX.TEST.REPLAY.${Date.now()}`;

      // First verification: passes
      const firstRes = await verifyTurnstileToken({ token: replayToken });
      expect(firstRes.success).toBe(true);
      expect(firstRes.status).toBe("VERIFIED");

      // Second verification with the exact same token: must be rejected as duplicate
      const secondRes = await verifyTurnstileToken({ token: replayToken });
      expect(secondRes.success).toBe(false);
      expect(secondRes.status).toBe("EXPIRED_OR_DUPLICATE");
      expect(secondRes.message).toContain("already been used");
    });

    it("records verification metrics accurately", async () => {
      const initialMetrics = getCaptchaMetrics();
      const initialTotal = initialMetrics.totalVerifications;
      const initialPassed = initialMetrics.successfulVerifications;
      const initialFailed = initialMetrics.failedVerifications;

      // Pass one
      await verifyTurnstileToken({ token: "1x00000000000000000000AA" });
      // Fail one
      await verifyTurnstileToken({ token: "2x00000000000000000000AB" });

      const updatedMetrics = getCaptchaMetrics();
      expect(updatedMetrics.totalVerifications).toBe(initialTotal + 2);
      expect(updatedMetrics.successfulVerifications).toBe(initialPassed + 1);
      expect(updatedMetrics.failedVerifications).toBe(initialFailed + 1);
      expect(updatedMetrics.lastVerifiedAt).not.toBeNull();
    });
  });

  describe("Form Protection Boundary (verifyFormProtection)", () => {
    it("catches bots using honeypot trap field without verifying captcha", async () => {
      const req = new NextRequest("http://localhost:3000/api/contact", {
        method: "POST",
      });

      const body = {
        website_trap: "http://spam-bot-url.com",
        name: "Bot Spammer",
        email: "bot@spammer.com",
      };

      const result = await verifyFormProtection(req, body, {
        action: "contact",
        checkHoneypot: true,
      });

      expect(result.success).toBe(false);
      expect(result.response).toBeDefined();
      expect(result.response?.status).toBe(200); // Silent drop / trap response
    });

    it("rejects request when captcha token is missing", async () => {
      const req = new NextRequest("http://localhost:3000/api/contact", {
        method: "POST",
      });

      const body = {
        name: "Legitimate Visitor",
        email: "visitor@example.com",
      };

      const result = await verifyFormProtection(req, body, {
        action: "contact",
      });

      expect(result.success).toBe(false);
      expect(result.response?.status).toBe(400);

      const json = await result.response?.json();
      expect(json.code).toBe("MISSING_TOKEN");
      expect(json.requiresCaptchaReset).toBe(true);
    });

    it("rejects request with invalid captcha token", async () => {
      const req = new NextRequest("http://localhost:3000/api/contact", {
        method: "POST",
      });

      const body = {
        captchaToken: "2x00000000000000000000AB",
        name: "Visitor",
        email: "visitor@example.com",
      };

      const result = await verifyFormProtection(req, body, {
        action: "contact",
      });

      expect(result.success).toBe(false);
      expect(result.response?.status).toBe(400);

      const json = await result.response?.json();
      expect(json.code).toBe("INVALID_TOKEN");
    });

    it("accepts request with valid test captcha token", async () => {
      const req = new NextRequest("http://localhost:3000/api/contact", {
        method: "POST",
      });

      const body = {
        captchaToken: "1x00000000000000000000AA",
        name: "Genuine Client",
        email: "client@axivontech.in",
      };

      const result = await verifyFormProtection(req, body, {
        action: "contact",
      });

      expect(result.success).toBe(true);
      expect(result.captchaResult?.success).toBe(true);
      expect(result.response).toBeUndefined();
    });

    it("reads token from headers when not in body", async () => {
      const req = new NextRequest("http://localhost:3000/api/contact", {
        method: "POST",
        headers: {
          "x-captcha-token": "1x00000000000000000000AA",
        },
      });

      const body = {
        name: "Genuine Client",
        email: "client@axivontech.in",
      };

      const result = await verifyFormProtection(req, body, {
        action: "contact",
      });

      expect(result.success).toBe(true);
      expect(result.captchaResult?.success).toBe(true);
    });
  });
});
