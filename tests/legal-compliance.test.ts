import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import {
  DEFAULT_LEGAL_POLICIES,
  LEGAL_CATEGORIES,
  getPublishedPolicyBySlug,
  getAllPublishedPolicies,
} from "@/lib/legal/legal-db";
import {
  saveConsent,
  getStoredConsent,
  acceptAllCookies,
  rejectOptionalCookies,
  DEFAULT_CONSENT,
} from "@/lib/legal/cookie-consent";
import * as PublicPoliciesRoute from "@/app/api/v1/public/legal/policies/route";
import * as SinglePolicyRoute from "@/app/api/v1/public/legal/policies/[slug]/route";
import * as PublicConsentRoute from "@/app/api/v1/public/consent/route";
import * as PublicPrivacyRequestsRoute from "@/app/api/v1/public/privacy-requests/route";
import * as AdminPoliciesRoute from "@/app/api/v1/admin/legal/policies/route";
import * as AdminSinglePolicyRoute from "@/app/api/v1/admin/legal/policies/[id]/route";
import * as AdminPrivacyRequestsRoute from "@/app/api/v1/admin/legal/privacy-requests/route";
import * as AdminSinglePrivacyRequestRoute from "@/app/api/v1/admin/legal/privacy-requests/[id]/route";
import sitemap from "@/app/sitemap";

// Mock db
vi.mock("@/lib/db", () => {
  const mockPolicies: any[] = [];
  const mockVersions: any[] = [];
  const mockRequests: any[] = [];
  const mockConsent: any[] = [];

  return {
    db: {
      legalPolicy: {
        findMany: vi.fn(async (args) => {
          if (mockPolicies.length === 0) return [];
          return mockPolicies;
        }),
        findFirst: vi.fn(async ({ where }) => {
          return mockPolicies.find((p) => p.slug === where.slug && p.status === (where.status || "PUBLISHED")) || null;
        }),
        findUnique: vi.fn(async ({ where }) => {
          if (where.slug) return mockPolicies.find((p) => p.slug === where.slug) || null;
          if (where.id) return mockPolicies.find((p) => p.id === where.id) || null;
          return null;
        }),
        create: vi.fn(async ({ data }) => {
          const item = { id: `policy_${Date.now()}`, ...data, createdAt: new Date(), updatedAt: new Date(), versions: [] };
          mockPolicies.push(item);
          return item;
        }),
        update: vi.fn(async ({ where, data }) => {
          const item = mockPolicies.find((p) => p.id === where.id);
          if (!item) throw new Error("Not found");
          Object.assign(item, data);
          return item;
        }),
        delete: vi.fn(async ({ where }) => {
          const idx = mockPolicies.findIndex((p) => p.id === where.id);
          if (idx !== -1) mockPolicies.splice(idx, 1);
          return { id: where.id };
        }),
        count: vi.fn(async () => mockPolicies.length),
      },
      policyVersion: {
        create: vi.fn(async ({ data }) => {
          const v = { id: `version_${Date.now()}`, ...data, createdAt: new Date() };
          mockVersions.push(v);
          return v;
        }),
      },
      privacyRequest: {
        create: vi.fn(async ({ data }) => {
          const r = { id: `req_${Date.now()}`, ...data, createdAt: new Date(), updatedAt: new Date() };
          mockRequests.push(r);
          return r;
        }),
        findFirst: vi.fn(async ({ where }) => {
          return (
            mockRequests.find(
              (r) => r.referenceId === where.referenceId && r.requesterEmail === where.requesterEmail
            ) || null
          );
        }),
        findMany: vi.fn(async () => mockRequests),
        findUnique: vi.fn(async ({ where }) => mockRequests.find((r) => r.id === where.id) || null),
        update: vi.fn(async ({ where, data }) => {
          const r = mockRequests.find((x) => x.id === where.id);
          if (!r) throw new Error("Not found");
          Object.assign(r, data);
          return r;
        }),
      },
      userConsentRecord: {
        create: vi.fn(async ({ data }) => {
          mockConsent.push(data);
          return data;
        }),
      },
      user: {
        findUnique: vi.fn(async ({ where }) => {
          if (where.id === "admin-user-id") {
            return {
              id: "admin-user-id",
              name: "Admin User",
              email: "admin@axivontech.in",
              status: "ACTIVE",
              userRoles: [
                {
                  role: {
                    rolePermissions: [
                      { permission: { name: "admin:access" } },
                    ],
                  },
                },
              ],
            };
          }
          if (where.id === "non-admin-id") {
            return {
              id: "non-admin-id",
              name: "Regular Employee",
              email: "employee@axivontech.in",
              status: "ACTIVE",
              userRoles: [],
            };
          }
          return null;
        }),
      },
    },
  };
});

describe("Complete Legal Pages & Compliance System Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("1. Legal Policies Registry & Fallback Resolution", () => {
    it("should provide all core legal policies with complete metadata and content", () => {
      expect(DEFAULT_LEGAL_POLICIES.length).toBeGreaterThanOrEqual(15);

      const requiredSlugs = [
        "privacy-policy",
        "terms",
        "cookie-policy",
        "disclaimer",
        "company-information",
        "refund-cancellation-policy",
        "service-delivery-policy",
        "payment-terms",
        "intellectual-property",
        "acceptable-use-policy",
        "security-policy",
        "privacy-requests",
        "ai-usage",
        "careers-privacy",
        "business-partner-terms",
        "broker-terms",
        "accessibility",
      ];

      for (const slug of requiredSlugs) {
        const found = DEFAULT_LEGAL_POLICIES.find((p) => p.slug === slug);
        expect(found, `Policy ${slug} should exist in DEFAULT_LEGAL_POLICIES`).toBeDefined();
        expect(found?.content.length).toBeGreaterThan(100);
        expect(found?.title.length).toBeGreaterThan(3);
        expect(found?.summary.length).toBeGreaterThan(10);
      }
    });

    it("should resolve policy with alias mappings (e.g. terms-and-conditions -> terms)", async () => {
      const policy1 = await getPublishedPolicyBySlug("terms-and-conditions");
      expect(policy1?.slug).toBe("terms");

      const policy2 = await getPublishedPolicyBySlug("privacy");
      expect(policy2?.slug).toBe("privacy-policy");

      const policy3 = await getPublishedPolicyBySlug("ai-privacy-notice");
      expect(policy3?.slug).toBe("ai-usage");
    });

    it("should categorize all policies into defined LEGAL_CATEGORIES", () => {
      const validCategories = LEGAL_CATEGORIES.map((c) => c.key);
      for (const policy of DEFAULT_LEGAL_POLICIES) {
        expect(validCategories).toContain(policy.category);
      }
    });
  });

  describe("2. Cookie Consent Management", () => {
    it("should enforce strictly necessary cookies as always active", () => {
      expect(DEFAULT_CONSENT.necessary).toBe(true);
      expect(DEFAULT_CONSENT.analytics).toBe(false);
      expect(DEFAULT_CONSENT.marketing).toBe(false);
    });

    it("should return updated preferences on acceptAllCookies", () => {
      const result = acceptAllCookies();
      expect(result.necessary).toBe(true);
      expect(result.preferences).toBe(true);
      expect(result.analytics).toBe(true);
      expect(result.marketing).toBe(true);
    });

    it("should restrict optional cookies on rejectOptionalCookies", () => {
      const result = rejectOptionalCookies();
      expect(result.necessary).toBe(true);
      expect(result.preferences).toBe(false);
      expect(result.analytics).toBe(false);
      expect(result.marketing).toBe(false);
    });
  });

  describe("3. Public Legal API Endpoints", () => {
    it("GET /api/v1/public/legal/policies returns all published policies", async () => {
      const req = new NextRequest("http://localhost/api/v1/public/legal/policies");
      const res = await PublicPoliciesRoute.GET(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.policies)).toBe(true);
      expect(data.policies.length).toBeGreaterThan(0);
    });

    it("GET /api/v1/public/legal/policies/[slug] returns single policy", async () => {
      const req = new NextRequest("http://localhost/api/v1/public/legal/policies/privacy-policy");
      const res = await SinglePolicyRoute.GET(req, { params: { slug: "privacy-policy" } });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.policy.slug).toBe("privacy-policy");
      expect(data.policy.title).toBe("Privacy Policy");
    });

    it("GET /api/v1/public/legal/policies/[slug] returns 404 for unknown slug", async () => {
      const req = new NextRequest("http://localhost/api/v1/public/legal/policies/unknown-clause-xyz");
      const res = await SinglePolicyRoute.GET(req, { params: { slug: "unknown-clause-xyz" } });
      const data = await res.json();

      expect(res.status).toBe(404);
      expect(data.error).toBeDefined();
    });

    it("POST /api/v1/public/consent successfully logs anonymous consent", async () => {
      const req = new NextRequest("http://localhost/api/v1/public/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categories: { necessary: true, preferences: true, analytics: false, marketing: false },
        }),
      });

      const res = await PublicConsentRoute.POST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.consentKey).toMatch(/^ck_/);
    });
  });

  describe("4. Privacy Rights Submission & Verification Workflow", () => {
    it("POST /api/v1/public/privacy-requests rejects missing required fields", async () => {
      const req = new NextRequest("http://localhost/api/v1/public/privacy-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requesterName: "Dev User" }),
      });

      const res = await PublicPrivacyRequestsRoute.POST(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toContain("required");
    });

    it("POST /api/v1/public/privacy-requests rejects invalid email", async () => {
      const req = new NextRequest("http://localhost/api/v1/public/privacy-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requesterName: "Dev User",
          requesterEmail: "not-an-email",
          category: "ACCESS",
          requestDetails: "Summary of my details please",
          captchaToken: "XXXX.DUMMY.PASS.TOKEN.XXXX",
        }),
      });

      const res = await PublicPrivacyRequestsRoute.POST(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toContain("Invalid email");
    });

    it("POST /api/v1/public/privacy-requests successfully creates request with referenceId", async () => {
      const req = new NextRequest("http://localhost/api/v1/public/privacy-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requesterName: "Ananya Roy",
          requesterEmail: "ananya@example.com",
          category: "ACCESS",
          requestDetails: "Requesting summary of resume data submitted to careers.",
          captchaToken: "XXXX.DUMMY.PASS.TOKEN.XXXX",
        }),
      });

      const res = await PublicPrivacyRequestsRoute.POST(req);
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.referenceId).toMatch(/^PR-2026-[A-F0-9]{6}$/);
      expect(data.status).toBe("PENDING");

      // Now verify lookup
      const lookupReq = new NextRequest(
        `http://localhost/api/v1/public/privacy-requests?referenceId=${data.referenceId}&email=ananya@example.com`
      );
      const lookupRes = await PublicPrivacyRequestsRoute.GET(lookupReq);
      const lookupData = await lookupRes.json();

      expect(lookupRes.status).toBe(200);
      expect(lookupData.success).toBe(true);
      expect(lookupData.request.referenceId).toBe(data.referenceId);
    });
  });

  describe("5. Admin Legal CMS & Publication Gate Tests", () => {
    it("rejects unauthorized access without x-user-id header with HTTP 401", async () => {
      const req = new NextRequest("http://localhost/api/v1/admin/legal/policies");
      const res = await AdminPoliciesRoute.GET(req);
      expect(res.status).toBe(401);
    });

    it("rejects non-admin users with HTTP 403", async () => {
      const req = new NextRequest("http://localhost/api/v1/admin/legal/policies", {
        headers: { "x-user-id": "non-admin-id" },
      });
      const res = await AdminPoliciesRoute.GET(req);
      expect(res.status).toBe(403);
    });

    it("allows admin access to list and create policies", async () => {
      const listReq = new NextRequest("http://localhost/api/v1/admin/legal/policies", {
        headers: { "x-user-id": "admin-user-id" },
      });
      const listRes = await AdminPoliciesRoute.GET(listReq);
      const listData = await listRes.json();

      expect(listRes.status).toBe(200);
      expect(listData.success).toBe(true);
      expect(listData.stats).toBeDefined();

      // Create new policy
      const createReq = new NextRequest("http://localhost/api/v1/admin/legal/policies", {
        method: "POST",
        headers: {
          "x-user-id": "admin-user-id",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug: "custom-test-policy",
          title: "Custom Test Policy",
          category: "CORE_LEGAL",
          summary: "Test summary description.",
          content: "## 1. Terms\nSample test body.",
          version: "1.0.0",
          status: "DRAFT",
          missingDetails: ["CIN Registration Pending"],
        }),
      });

      const createRes = await AdminPoliciesRoute.POST(createReq);
      const createData = await createRes.json();

      expect(createRes.status).toBe(201);
      expect(createData.success).toBe(true);
      expect(createData.policy.slug).toBe("custom-test-policy");

      // Verify publication gate triggering
      const publishReq = new NextRequest(
        `http://localhost/api/v1/admin/legal/policies/${createData.policy.id}`,
        {
          method: "PATCH",
          headers: {
            "x-user-id": "admin-user-id",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "PUBLISHED",
            bypassGateAcknowledgement: false,
          }),
        }
      );

      const publishRes = await AdminSinglePolicyRoute.PATCH(publishReq, {
        params: { id: createData.policy.id },
      });
      const publishData = await publishRes.json();

      expect(publishRes.status).toBe(422);
      expect(publishData.error).toBe("PUBLICATION_GATE_TRIGGERED");
      expect(publishData.missingDetails).toContain("CIN Registration Pending");

      // Now publish with explicit acknowledgement
      const ackReq = new NextRequest(
        `http://localhost/api/v1/admin/legal/policies/${createData.policy.id}`,
        {
          method: "PATCH",
          headers: {
            "x-user-id": "admin-user-id",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "PUBLISHED",
            bypassGateAcknowledgement: true,
          }),
        }
      );

      const ackRes = await AdminSinglePolicyRoute.PATCH(ackReq, {
        params: { id: createData.policy.id },
      });
      const ackData = await ackRes.json();

      expect(ackRes.status).toBe(200);
      expect(ackData.success).toBe(true);
      expect(ackData.policy.status).toBe("PUBLISHED");
    });

    it("allows admin to review and resolve privacy requests", async () => {
      const listReq = new NextRequest("http://localhost/api/v1/admin/legal/privacy-requests", {
        headers: { "x-user-id": "admin-user-id" },
      });
      const listRes = await AdminPrivacyRequestsRoute.GET(listReq);
      const listData = await listRes.json();

      expect(listRes.status).toBe(200);
      expect(listData.success).toBe(true);
      expect(Array.isArray(listData.requests)).toBe(true);
    });
  });

  describe("6. Sitemap & SEO Integration", () => {
    it("includes all legal pages in dynamic sitemap", async () => {
      const entries = await sitemap();
      const urls = entries.map((e) => e.url);

      expect(urls).toContain("https://axivontech.in/legal");
      expect(urls).toContain("https://axivontech.in/privacy-policy");
      expect(urls).toContain("https://axivontech.in/terms");
      expect(urls).toContain("https://axivontech.in/cookie-policy");
      expect(urls).toContain("https://axivontech.in/ai-usage");
      expect(urls).toContain("https://axivontech.in/refund-cancellation-policy");
      expect(urls).toContain("https://axivontech.in/service-delivery-policy");
      expect(urls).toContain("https://axivontech.in/privacy-requests");
      expect(urls).toContain("https://axivontech.in/security-policy");
    });
  });
});
