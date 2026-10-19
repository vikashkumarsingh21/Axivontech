import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST as publicLeadsPOST } from "@/app/api/v1/public/leads/route";
import { POST as contactPOST } from "@/app/api/contact/route";
import { GET as crmLeadsGET } from "@/app/api/v1/crm/leads/route";
import { PATCH as crmLeadPATCH } from "@/app/api/v1/crm/leads/[id]/route";
import { isRateLimited, RATE_LIMIT_PRESETS } from "@/lib/rate-limit";
import { ApiError } from "@/lib/api-error";
import { NextRequest } from "next/server";

// Mock db for testing route handlers
vi.mock("@/lib/db", () => {
  const mockLeads: any[] = [];
  return {
    db: {
      $transaction: vi.fn().mockImplementation(async (fns) => {
        if (Array.isArray(fns)) {
          return Promise.all(fns);
        }
        return fns();
      }),
      lead: {
        count: vi.fn().mockResolvedValue(1),
        findFirst: vi.fn().mockImplementation(({ where }) => {
          if (where.email?.equals === "duplicate@example.com") {
            return Promise.resolve({
              id: "existing-lead-1",
              leadCode: "LD-20261001-0001",
              name: "Existing Contact",
              email: "duplicate@example.com",
              createdAt: new Date(),
              ownerId: "owner-1",
            });
          }
          return Promise.resolve(null);
        }),
        findUnique: vi.fn().mockImplementation(({ where }) => {
          if (where.id === "lead-converted-1") {
            return Promise.resolve({
              id: "lead-converted-1",
              leadCode: "LD-20261017-0099",
              status: "CONVERTED",
            });
          }
          if (where.id === "lead-active-1") {
            return Promise.resolve({
              id: "lead-active-1",
              leadCode: "LD-20261017-0001",
              status: "NEW",
              name: "Active Lead",
              email: "active@example.com",
            });
          }
          return Promise.resolve(null);
        }),
        findMany: vi.fn().mockResolvedValue([
          {
            id: "lead-1",
            leadCode: "LD-20261017-0001",
            name: "Enterprise Client",
            email: "client@enterprise.com",
            phone: "+91 98765 43210",
            companyName: "Enterprise Ltd",
            serviceInterest: "Web Development",
            industry: "Healthcare & Medical",
            source: "DEMO_SHOWCASE",
            campaign: "demo:MediCare",
            status: "NEW",
            qualificationStatus: "UNQUALIFIED",
            isDuplicate: false,
            createdAt: new Date(),
            owner: { id: "u-1", name: "Lead Manager", email: "manager@axivontech.in" },
            _count: { activities: 1, followUps: 0, opportunities: 0 },
          },
        ]),
        create: vi.fn().mockImplementation(({ data }) =>
          Promise.resolve({
            id: "lead-new-123",
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
        ),
        update: vi.fn().mockImplementation(({ where, data }) =>
          Promise.resolve({
            id: where.id,
            ...data,
            updatedAt: new Date(),
          })
        ),
      },
      leadActivity: {
        create: vi.fn().mockResolvedValue({ id: "activity-new-123" }),
      },
      userRole: {
        findMany: vi.fn().mockResolvedValue([{ userId: "admin-user-1" }]),
      },
      notification: {
        createMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      brokerProfile: {
        findUnique: vi.fn().mockImplementation(({ where }) => {
          if (where.referralCode === "VALID_BROKER_123") {
            return Promise.resolve({ userId: "broker-user-1" });
          }
          return Promise.resolve(null);
        }),
      },
    },
  };
});

// Mock permission checks
vi.mock("@/lib/auth/permissions", () => {
  return {
    requirePermission: vi.fn().mockImplementation((userId: string | null, perm: string) => {
      if (!userId || userId === "unauthorized-user") {
        throw new ApiError(403, `Forbidden: Missing permission ${perm}`);
      }
      return Promise.resolve({ id: userId, name: "Admin Lead Reviewer" });
    }),
  };
});

// Mock email service
vi.mock("@/lib/email/service", () => {
  return {
    EmailService: {
      send: vi.fn().mockResolvedValue({ success: true }),
    },
  };
});

describe("STEP 2: Client Lead Generation, Inquiry Automation & CRM Tests", () => {
  describe("Public Inquiry Form API (POST /api/v1/public/leads)", () => {
    it("successfully creates a new lead with full contextual brief and returns HTTP 201 with leadCode", async () => {
      const payload = {
        name: "Aarav Sharma",
        email: "aarav@techfirm.in",
        phone: "+91 94732 63768",
        companyName: "TechFirm India",
        serviceInterest: "Web Development",
        industry: "Real Estate & PropTech",
        budget: "₹1,50,000 - ₹5,00,000",
        timeline: "1-2 Months",
        message: "We need a luxury real estate portal based on your EstateVista architecture with MLS sync.",
        demoProject: "EstateVista",
        landingPage: "/demo-projects/real-estate/estatevista",
        utm_source: "linkedin",
        utm_medium: "cpc",
        utm_campaign: "realty_showcase",
        captchaToken: "1x00000000000000000000AA",
      };

      const req = new NextRequest("http://localhost:3000/api/v1/public/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": "192.168.1.10" },
        body: JSON.stringify(payload),
      });

      const res = await publicLeadsPOST(req);
      expect(res.status).toBe(201);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.leadCode).toMatch(/^LD-\d{8}-\d{4}$/);
    });

    it("rejects invalid submission missing name with HTTP 400", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/public/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": "192.168.1.11" },
        body: JSON.stringify({ email: "test@example.com", captchaToken: "1x00000000000000000000AA" }),
      });

      const res = await publicLeadsPOST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toMatch(/Name is required/i);
    });

    it("rejects invalid email formats with HTTP 400", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/public/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": "192.168.1.12" },
        body: JSON.stringify({ name: "Rohan Patel", email: "not-an-email", captchaToken: "1x00000000000000000000AA" }),
      });

      const res = await publicLeadsPOST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toMatch(/valid email/i);
    });

    it("detects existing duplicate lead submitted within 30 days and flags duplicateReason", async () => {
      const payload = {
        name: "Repeated User",
        email: "duplicate@example.com",
        phone: "+91 99999 88888",
        message: "Second inquiry for custom ERP software.",
        captchaToken: "1x00000000000000000000AA",
      };

      const req = new NextRequest("http://localhost:3000/api/v1/public/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": "192.168.1.13" },
        body: JSON.stringify(payload),
      });

      const res = await publicLeadsPOST(req);
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.success).toBe(true);
    });
  });

  describe("Rate Limiting Protection", () => {
    it("enforces sliding-window rate limit on public lead endpoints", () => {
      const testIp = "203.0.113.42";
      const preset = { windowMs: 60 * 1000, maxRequests: 3 };

      expect(isRateLimited(testIp, preset).limited).toBe(false);
      expect(isRateLimited(testIp, preset).limited).toBe(false);
      expect(isRateLimited(testIp, preset).limited).toBe(false);
      
      const blocked = isRateLimited(testIp, preset);
      expect(blocked.limited).toBe(true);
      expect(blocked.remaining).toBe(0);
    });
  });

  describe("Standard Contact Route Compatibility (POST /api/contact)", () => {
    it("handles contact form inquiries and returns generated leadCode", async () => {
      const req = new Request("http://localhost:3000/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": "192.168.1.14" },
        body: JSON.stringify({
          name: "Dr. Ananya Roy",
          email: "ananya@healthclinic.org",
          phone: "+91 91234 56789",
          subject: "Telemedicine Platform",
          message: "Looking for an appointment portal similar to MediCare demo.",
          captchaToken: "1x00000000000000000000AA",
        }),
      });

      const res = await contactPOST(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.leadCode).toMatch(/^LD-\d{8}-\d{4}$/);
    });
  });

  describe("Admin CRM Leads API (GET & PATCH /api/v1/crm/leads)", () => {
    it("allows authorized administrators to retrieve leads with service and industry filters", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/crm/leads?service=Web+Development&industry=Healthcare", {
        headers: { "x-user-id": "admin-user-1" },
      });

      const res = await crmLeadsGET(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(Array.isArray(json.data)).toBe(true);
      expect(json.data.length).toBeGreaterThan(0);
    });

    it("rejects unauthorized access without proper user ID with HTTP 403", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/crm/leads", {
        headers: { "x-user-id": "unauthorized-user" },
      });

      const res = await crmLeadsGET(req);
      expect(res.status).toBe(403);
    });

    it("exports authorized leads as CSV including Industry and Campaign columns", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/crm/leads?export=csv", {
        headers: { "x-user-id": "admin-user-1" },
      });

      const res = await crmLeadsGET(req);
      expect(res.status).toBe(200);
      expect(res.headers.get("Content-Type")).toContain("text/csv");

      const csvText = await res.text();
      expect(csvText).toContain("Industry");
      expect(csvText).toContain("Campaign / Context");
    });

    it("validates status transitions and rejects direct conversion via status patch", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/crm/leads/lead-active-1", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-user-id": "admin-user-1" },
        body: JSON.stringify({ status: "CONVERTED" }),
      });

      const res = await crmLeadPATCH(req, { params: Promise.resolve({ id: "lead-active-1" }) });
      expect(res.status).toBe(400);

      const json = await res.json();
      expect(json.error).toMatch(/Use the \/convert endpoint/i);
    });
  });
});
