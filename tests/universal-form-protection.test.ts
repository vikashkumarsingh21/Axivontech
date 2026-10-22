import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { verifyFormProtection } from "@/lib/captcha/verify-request";
import {
  verifyRecaptchaToken,
  clearUsedRecaptchaTokensCacheForTesting,
  getRecaptchaSiteKey,
  getRecaptchaSecretKey,
  RECAPTCHA_TEST_KEYS,
} from "@/lib/captcha/recaptcha";
import { POST as contactPOST } from "@/app/api/contact/route";
import { POST as publicLeadsPOST } from "@/app/api/v1/public/leads/route";
import { POST as careersPOST } from "@/app/api/careers/route";
import { POST as partnerAppsPOST } from "@/app/api/v1/public/business-partner/applications/route";
import { POST as reviewsPOST } from "@/app/api/v1/public/reviews/route";
import { POST as privacyRequestsPOST } from "@/app/api/v1/public/privacy-requests/route";
import { POST as projectRequestsPOST } from "@/app/api/v1/public/project-requests/route";

vi.mock("@/lib/careers/careers-db", () => ({
  isCareersPageEnabled: vi.fn().mockResolvedValue(true),
}));

// Mock DB interactions for routes
vi.mock("@/lib/db", () => {
  return {
    db: {
      $transaction: vi.fn().mockImplementation(async (fns) => {
        if (Array.isArray(fns)) return Promise.all(fns);
        return fns();
      }),
      lead: {
        count: vi.fn().mockResolvedValue(0),
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: "lead-test-1", ...data })),
        findFirst: vi.fn().mockResolvedValue(null),
      },
      leadActivity: {
        create: vi.fn().mockResolvedValue({ id: "act-1" }),
      },
      userRole: {
        findMany: vi.fn().mockResolvedValue([{ userId: "admin-1" }]),
      },
      notification: {
        createMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      brokerProfile: {
        findUnique: vi.fn().mockResolvedValue(null),
        findFirst: vi.fn().mockResolvedValue({ id: "bp-1", partnerId: "BP-AX-001", tier: "REGISTERED" }),
      },
      communicationTemplate: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
      emailTemplate: {
        findUnique: vi.fn().mockResolvedValue(null),
      },
      emailLog: {
        create: vi.fn().mockResolvedValue({ id: "log-1" }),
      },
      careersPageSetting: {
        findUnique: vi.fn().mockResolvedValue({ enabled: true }),
      },
      businessPartnerApplication: {
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: "bpa-1", ...data })),
        findFirst: vi.fn().mockResolvedValue(null),
      },
      clientReview: {
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: "rev-1", ...data })),
        findFirst: vi.fn().mockResolvedValue(null),
      },
      privacyRequest: {
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: "pr-1", ...data })),
        findFirst: vi.fn().mockResolvedValue(null),
      },
      project: {
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: "prj-1", ...data })),
      },
      auditLog: {
        create: vi.fn().mockResolvedValue({ id: "audit-1" }),
      },
    },
  };
});

describe("Universal Form Protection: Dual Check Verification (Policy + Google reCAPTCHA v2)", () => {
  beforeEach(() => {
    clearUsedRecaptchaTokensCacheForTesting();
    vi.clearAllMocks();
  });

  describe("1. Google reCAPTCHA v2 Verification Service", () => {
    it("provides valid Google reCAPTCHA v2 credentials and test fallback when unconfigured", () => {
      const siteKeyInfo = getRecaptchaSiteKey();
      const secretKeyInfo = getRecaptchaSecretKey();

      expect(siteKeyInfo.siteKey).toBeDefined();
      expect(siteKeyInfo.siteKey.length).toBeGreaterThan(10);
      expect(secretKeyInfo.secretKey).toBeDefined();

      // Test fallback behavior when env variables are empty
      const origSite = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
      const origSecret = process.env.RECAPTCHA_SECRET_KEY;
      try {
        delete process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
        delete process.env.RECAPTCHA_SECRET_KEY;

        const fallbackSite = getRecaptchaSiteKey();
        const fallbackSecret = getRecaptchaSecretKey();
        expect(fallbackSite.siteKey).toBe(RECAPTCHA_TEST_KEYS.ALWAYS_PASSES_SITEKEY);
        expect(fallbackSecret.secretKey).toBe(RECAPTCHA_TEST_KEYS.ALWAYS_PASSES_SECRET);
        expect(fallbackSite.isTestKey).toBe(true);
        expect(fallbackSecret.isTestKey).toBe(true);
      } finally {
        if (origSite !== undefined) process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY = origSite;
        if (origSecret !== undefined) process.env.RECAPTCHA_SECRET_KEY = origSecret;
      }
    });

    it("rejects missing reCAPTCHA token with MISSING_TOKEN status", async () => {
      const result = await verifyRecaptchaToken({ token: "" });
      expect(result.success).toBe(false);
      expect(result.status).toBe("MISSING_TOKEN");
      expect(result.message).toContain("Please complete the human verification");
    });

    it("rejects token with invalid length bounds with INVALID_TOKEN status", async () => {
      const result = await verifyRecaptchaToken({ token: "123" });
      expect(result.success).toBe(false);
      expect(result.status).toBe("INVALID_TOKEN");
    });

    it("verifies valid reCAPTCHA tokens successfully in test mode", async () => {
      const result = await verifyRecaptchaToken({
        token: RECAPTCHA_TEST_KEYS.ALWAYS_PASSES_SITEKEY,
        expectedHostname: "localhost",
      });
      expect(result.success).toBe(true);
      expect(result.status).toBe("VERIFIED");
      expect(result.hostname).toBe("localhost");
    });

    it("rejects replayed tokens to prevent token reuse attacks", async () => {
      const uniqueToken = `REPLAY_TEST_TOKEN_${Date.now()}_ABC`;
      
      // First verification creates cache entry
      const firstResult = await verifyRecaptchaToken({ token: uniqueToken });
      expect(firstResult.success).toBe(true);

      // Second verification of the exact same token MUST be rejected
      const secondResult = await verifyRecaptchaToken({ token: uniqueToken });
      expect(secondResult.success).toBe(false);
      expect(secondResult.status).toBe("EXPIRED_OR_REPLAYED");
      expect(secondResult.message).toContain("already been used");
    });

    it("rejects explicit invalid test tokens", async () => {
      const result = await verifyRecaptchaToken({ token: "TEST_BLOCKED_RECAPTCHA_TOKEN" });
      expect(result.success).toBe(false);
      expect(result.status).toBe("INVALID_TOKEN");
    });
  });

  describe("2. verifyFormProtection Orchestrator Unit Tests", () => {
    it("CHECK 1: rejects submissions missing privacyPolicyAcknowledged when required", async () => {
      const req = new NextRequest("http://localhost/api/test");
      const body = {
        name: "Test User",
        email: "test@example.com",
        recaptchaToken: RECAPTCHA_TEST_KEYS.ALWAYS_PASSES_SITEKEY,
      };

      const result = await verifyFormProtection(req, body, {
        requirePolicyAcknowledgement: true,
        requireCaptcha: true,
      });

      expect(result.success).toBe(false);
      expect(result.errorResponse).toBeDefined();
      expect(result.errorResponse!.status).toBe(400);

      const json = await result.errorResponse!.json();
      expect(json.code).toBe("POLICY_ACKNOWLEDGEMENT_REQUIRED");
      expect(json.error).toContain("Please acknowledge the Privacy Policy");
      expect(json.policyUrl).toBe("/privacy-policy");
    });

    it("CHECK 1: rejects submissions with explicitly outdated policyVersion", async () => {
      const req = new NextRequest("http://localhost/api/test");
      const body = {
        name: "Test User",
        email: "test@example.com",
        privacyPolicyAcknowledged: true,
        policyVersion: "0.9.0", // Outdated version
        recaptchaToken: RECAPTCHA_TEST_KEYS.ALWAYS_PASSES_SITEKEY,
      };

      const result = await verifyFormProtection(req, body, {
        requirePolicyAcknowledgement: true,
        requireCaptcha: true,
      });

      expect(result.success).toBe(false);
      expect(result.errorResponse!.status).toBe(400);

      const json = await result.errorResponse!.json();
      expect(json.code).toBe("OUTDATED_POLICY_VERSION");
      expect(json.error).toContain("Privacy Policy has been updated");
    });

    it("CHECK 2: rejects submissions without a CAPTCHA token", async () => {
      const req = new NextRequest("http://localhost/api/test");
      const body = {
        name: "Test User",
        email: "test@example.com",
        privacyPolicyAcknowledged: true,
        policyVersion: "1.0.0",
      };

      const result = await verifyFormProtection(req, body, {
        requirePolicyAcknowledgement: true,
        requireCaptcha: true,
      });

      expect(result.success).toBe(false);
      expect(result.errorResponse!.status).toBe(400);

      const json = await result.errorResponse!.json();
      expect(json.code).toBe("MISSING_TOKEN");
      expect(json.error).toContain("human verification");
    });

    it("SUCCEEDS when both Check 1 (policy) and Check 2 (captcha) are satisfied", async () => {
      const req = new NextRequest("http://localhost/api/test");
      const body = {
        name: "Test User",
        email: "test@example.com",
        privacyPolicyAcknowledged: true,
        policyVersion: "1.0.0",
        recaptchaToken: RECAPTCHA_TEST_KEYS.ALWAYS_PASSES_SITEKEY,
      };

      const result = await verifyFormProtection(req, body, {
        requirePolicyAcknowledgement: true,
        requireCaptcha: true,
      });

      expect(result.success).toBe(true);
      expect(result.errorResponse).toBeUndefined();
    });

    it("blocks bot traps (honeypot fields) with silent 200 without database creation", async () => {
      const req = new NextRequest("http://localhost/api/test");
      const body = {
        name: "Bot User",
        website_trap: "http://spam-link.xyz",
        privacyPolicyAcknowledged: true,
        recaptchaToken: RECAPTCHA_TEST_KEYS.ALWAYS_PASSES_SITEKEY,
      };

      const result = await verifyFormProtection(req, body, {
        checkHoneypot: true,
        requirePolicyAcknowledgement: true,
        requireCaptcha: true,
      });

      expect(result.success).toBe(false);
      expect(result.errorResponse!.status).toBe(200);
      const json = await result.errorResponse!.json();
      expect(json.botBlocked).toBe(true);
    });
  });

  describe("3. End-to-End API Route Enforcement", () => {
    it("POST /api/contact: blocks submission if policy is not acknowledged", async () => {
      const req = new Request("http://localhost:3000/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Direct API Spammer",
          email: "spam@bot.com",
          message: "Attempting to bypass frontend",
          recaptchaToken: RECAPTCHA_TEST_KEYS.ALWAYS_PASSES_SITEKEY,
        }),
      });

      const res = await contactPOST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.code).toBe("POLICY_ACKNOWLEDGEMENT_REQUIRED");
    });

    it("POST /api/contact: blocks submission if reCAPTCHA token is missing", async () => {
      const req = new Request("http://localhost:3000/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Direct API Spammer",
          email: "spam@bot.com",
          message: "Attempting to bypass frontend",
          privacyPolicyAcknowledged: true,
        }),
      });

      const res = await contactPOST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.code).toBe("MISSING_TOKEN");
    });

    it("POST /api/contact: accepts submission when BOTH checks are satisfied", async () => {
      const req = new Request("http://localhost:3000/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Legitimate Visitor",
          email: "visitor@example.com",
          phone: "+91 98765 43210",
          message: "Interested in Cloud Architecture services",
          privacyPolicyAcknowledged: true,
          policyVersion: "1.0.0",
          recaptchaToken: RECAPTCHA_TEST_KEYS.ALWAYS_PASSES_SITEKEY,
        }),
      });

      const res = await contactPOST(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
    });

    it("POST /api/v1/public/leads: rejects submissions missing privacy policy acknowledgement", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/public/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: "Lead Tester",
          email: "lead@example.com",
          message: "Bypassing policy check",
          recaptchaToken: RECAPTCHA_TEST_KEYS.ALWAYS_PASSES_SITEKEY,
        }),
      });

      const res = await publicLeadsPOST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.code).toBe("POLICY_ACKNOWLEDGEMENT_REQUIRED");
    });

    it("POST /api/careers: rejects job application without policy acknowledgement", async () => {
      const req = new Request("http://localhost:3000/api/careers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: "Job Applicant",
          email: "applicant@example.com",
          phone: "+91 91234 56789",
          position: "Frontend Engineer",
          experience: "3 years",
          recaptchaToken: RECAPTCHA_TEST_KEYS.ALWAYS_PASSES_SITEKEY,
        }),
      });

      const res = await careersPOST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.code).toBe("POLICY_ACKNOWLEDGEMENT_REQUIRED");
    });

    it("POST /api/v1/public/business-partner/applications: rejects partner app without dual checks", async () => {
      const req = new Request("http://localhost:3000/api/v1/public/business-partner/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: "Partner Applicant",
          email: "partner@example.com",
          phone: "+91 91234 56789",
          country: "India",
          city: "Ahmedabad",
          occupation: "Consultant",
        }),
      });

      const res = await partnerAppsPOST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.code).toBe("POLICY_ACKNOWLEDGEMENT_REQUIRED");
    });

    it("POST /api/v1/public/reviews: rejects review without policy acknowledgement", async () => {
      const req = new Request("http://localhost:3000/api/v1/public/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: 5,
          reviewText: "Outstanding engineering team and excellent delivery cadence.",
          reviewerName: "Chief Technology Officer",
          publicConsent: true,
          recaptchaToken: RECAPTCHA_TEST_KEYS.ALWAYS_PASSES_SITEKEY,
        }),
      });

      const res = await reviewsPOST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.code).toBe("POLICY_ACKNOWLEDGEMENT_REQUIRED");
    });

    it("POST /api/v1/public/privacy-requests: rejects privacy request without dual verification", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/public/privacy-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requesterName: "Citizen",
          requesterEmail: "citizen@example.com",
          category: "ACCESS",
          requestDetails: "Request data summary",
        }),
      });

      const res = await privacyRequestsPOST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.code).toBe("POLICY_ACKNOWLEDGEMENT_REQUIRED");
    });

    it("POST /api/v1/public/project-requests: rejects project request without policy acknowledgement", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/public/project-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: "Client Org",
          clientEmail: "client@org.com",
          clientPhone: "+91 99999 88888",
          companyName: "Org Ltd",
          industry: "Fintech",
          city: "Mumbai",
          state: "Maharashtra",
          country: "India",
          projectName: "Trading Platform",
          requiredService: "Software Development",
          detailedRequirement: "Build trading portal",
          expectedTimeline: "3 Months",
          projectBudget: "₹10,00,000",
          referralCode: "BP-AX-001",
          recaptchaToken: RECAPTCHA_TEST_KEYS.ALWAYS_PASSES_SITEKEY,
        }),
      });

      const res = await projectRequestsPOST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.code).toBe("POLICY_ACKNOWLEDGEMENT_REQUIRED");
    });
  });
});
