import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST as publicLeadsPOST } from "@/app/api/v1/public/leads/route";
import { POST as contactPOST } from "@/app/api/contact/route";
import { NextRequest } from "next/server";
import { clearUsedTokensCacheForTesting } from "@/lib/captcha";

// Mock Database
const createdLeads: any[] = [];
const createdNotifications: any[] = [];
const createdActivities: any[] = [];
const sentEmails: any[] = [];

vi.mock("@/lib/db", () => {
  return {
    db: {
      $transaction: vi.fn().mockImplementation(async (fns) => {
        if (Array.isArray(fns)) {
          return Promise.all(fns);
        }
        return fns();
      }),
      lead: {
        count: vi.fn().mockImplementation(() => Promise.resolve(createdLeads.length)),
        create: vi.fn().mockImplementation(({ data }) => {
          const lead = {
            id: `lead-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          createdLeads.push(lead);
          return Promise.resolve(lead);
        }),
        findFirst: vi.fn().mockResolvedValue(null),
        findMany: vi.fn().mockImplementation(() => Promise.resolve(createdLeads)),
      },
      leadActivity: {
        create: vi.fn().mockImplementation(({ data }) => {
          createdActivities.push(data);
          return Promise.resolve({ id: `act-${Date.now()}`, ...data });
        }),
      },
      userRole: {
        findMany: vi.fn().mockResolvedValue([
          { userId: "admin-user-id" },
          { userId: "founder-user-id" },
        ]),
      },
      notification: {
        createMany: vi.fn().mockImplementation(({ data }) => {
          createdNotifications.push(...data);
          return Promise.resolve({ count: data.length });
        }),
      },
      brokerProfile: {
        findUnique: vi.fn().mockResolvedValue(null),
      },
      communicationTemplate: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
      emailTemplate: {
        findUnique: vi.fn().mockResolvedValue(null),
      },
      emailLog: {
        create: vi.fn().mockImplementation(({ data }) => {
          sentEmails.push(data);
          return Promise.resolve({ id: `log-${Date.now()}`, ...data });
        }),
      },
    },
  };
});

describe("Contact Form & Lead Submission Verification Suite", () => {
  beforeEach(() => {
    clearUsedTokensCacheForTesting();
    createdLeads.length = 0;
    createdNotifications.length = 0;
    createdActivities.length = 0;
    sentEmails.length = 0;
    vi.clearAllMocks();
  });

  it("submits contact inquiry with action 'contact_form' and saves lead to database", async () => {
    const payload = {
      name: "Rohit Verma",
      fullName: "Rohit Verma",
      email: "rohit.verma@innovate.co.in",
      phone: "+91 91572 26367",
      company: "Innovate Solutions",
      companyName: "Innovate Solutions",
      website: "https://innovate.co.in",
      service: "AI Solutions",
      serviceInterest: "AI Solutions",
      industry: "Healthcare & Medical",
      budget: "₹1,50,000 - ₹5,00,000",
      timeline: "1-2 Months",
      message: "We need an intelligent workflow automation engine for medical diagnostics records.",
      source: "WEBSITE_CONTACT",
      captchaToken: "1x00000000000000000000AA", // Cloudflare test pass key
    };

    const req = new NextRequest("http://localhost:3000/api/v1/public/leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "103.21.244.2",
      },
      body: JSON.stringify(payload),
    });

    const res = await publicLeadsPOST(req);
    expect(res.status).toBe(201);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.leadCode).toMatch(/^LD-\d{8}-\d{4}$/);

    // Verify lead was inserted in DB
    expect(createdLeads.length).toBe(1);
    const saved = createdLeads[0];
    expect(saved.name).toBe("Rohit Verma");
    expect(saved.email).toBe("rohit.verma@innovate.co.in");
    expect(saved.phone).toBe("+91 91572 26367");
    expect(saved.companyName).toBe("Innovate Solutions");
    expect(saved.serviceInterest).toBe("AI Solutions");
    expect(saved.status).toBe("NEW");

    // Verify admin notifications were generated for Admin and Founder
    expect(createdNotifications.length).toBe(2);
    expect(createdNotifications.some((n) => n.userId === "admin-user-id")).toBe(true);
    expect(createdNotifications.some((n) => n.userId === "founder-user-id")).toBe(true);
    expect(createdNotifications[0].title).toContain("Rohit Verma");
    expect(createdNotifications[0].link).toContain("/admin/crm/leads/");

    // Verify lead email notification was logged
    expect(sentEmails.length).toBeGreaterThanOrEqual(1);
    const internalLeadEmail = sentEmails.find((e) => e.templateKey === "NEW_WEBSITE_LEAD");
    expect(internalLeadEmail).toBeDefined();
    expect(internalLeadEmail.subject).toContain("Rohit Verma");
  });

  it("submits contact inquiry via standard POST /api/contact route", async () => {
    const payload = {
      name: "Pooja Patel",
      email: "pooja.patel@retailtech.in",
      phone: "(079) 2656-1234",
      company: "RetailTech Gujarat",
      service: "E-Commerce Development",
      subject: "E-Commerce Development",
      message: "Looking for an omnichannel marketplace platform.",
      captchaToken: "1x00000000000000000000AA",
    };

    const req = new Request("http://localhost:3000/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "103.21.244.5",
      },
      body: JSON.stringify(payload),
    });

    const res = await contactPOST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.leadCode).toBeDefined();

    // Verify lead creation
    expect(createdLeads.length).toBe(1);
    expect(createdLeads[0].name).toBe("Pooja Patel");
    expect(createdLeads[0].email).toBe("pooja.patel@retailtech.in");

    // Verify notifications
    expect(createdNotifications.length).toBe(2);
    expect(createdNotifications[0].title).toContain("Pooja Patel");

    // Verify email dispatch
    expect(sentEmails.some((e) => e.templateKey === "NEW_WEBSITE_LEAD")).toBe(true);
  });

  it("supports international and formatted phone numbers", async () => {
    const phoneFormats = [
      "+91 91572 26367",
      "(555) 123-4567",
      "+1-800-555-0199",
      "9157226367",
    ];

    for (const phone of phoneFormats) {
      const payload = {
        name: "Test Client",
        email: `test-${Math.random().toString(36).substring(7)}@example.com`,
        phone,
        service: "Cloud Solutions",
        message: "Testing phone format acceptance.",
        captchaToken: "1x00000000000000000000AA",
      };

      const req = new NextRequest("http://localhost:3000/api/v1/public/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": `10.0.0.${Math.floor(Math.random() * 200)}` },
        body: JSON.stringify(payload),
      });

      const res = await publicLeadsPOST(req);
      expect(res.status).toBe(201);
    }
  });

  it("rejects malicious bot payload caught by honeypot website_trap without database insert", async () => {
    const payload = {
      name: "Bot User",
      email: "bot@spamnetwork.com",
      phone: "+1 555 000 0000",
      service: "Web Development",
      message: "Spam content from automated script",
      website_trap: "http://bot-redirect-link.xyz",
      captchaToken: "1x00000000000000000000AA",
    };

    const req = new NextRequest("http://localhost:3000/api/v1/public/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const res = await publicLeadsPOST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.botBlocked).toBe(true);

    // Zero leads saved in DB for honeypot bot
    expect(createdLeads.length).toBe(0);
  });
});
