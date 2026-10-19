import { describe, it, expect, vi, beforeEach } from "vitest";

// ============================================================================
// STEP 10: FINAL PLATFORM-WIDE AUDIT, END-TO-END TESTING, SECURITY HARDENING,
// RELIABILITY & PRODUCTION READINESS
// ============================================================================

// Mock Prisma DB for isolated, non-destructive testing
vi.mock("@/lib/db", () => ({
  db: {
    $transaction: vi.fn().mockImplementation((promises) => {
      if (Array.isArray(promises)) return Promise.all(promises);
      return typeof promises === "function" ? promises(db) : promises;
    }),
    user: {
      findUnique: vi.fn(),
      count: vi.fn().mockResolvedValue(10),
    },
    userRole: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    lead: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn().mockResolvedValue(null),
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(20),
    },
    leadActivity: {
      create: vi.fn().mockResolvedValue({ id: "act-1" }),
    },
    brokerProfile: {
      findUnique: vi.fn().mockResolvedValue(null),
      count: vi.fn().mockResolvedValue(5),
    },
    partnerProject: {
      findUnique: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(5),
    },
    partnerContract: {
      findUnique: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
    },
    partnerPayment: {
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(4),
    },
    commission: {
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(2),
    },
    task: {
      findUnique: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(15),
    },
    automationRule: {
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(3),
    },
    automationAuditLog: {
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockResolvedValue({ id: "log-1" }),
      count: vi.fn().mockResolvedValue(45),
    },
    queuedJob: {
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockResolvedValue({ id: "job-1" }),
      update: vi.fn().mockResolvedValue({ id: "job-1", status: "COMPLETED" }),
      count: vi.fn().mockResolvedValue(0),
    },
    websiteSetting: {
      findUnique: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
    },
    backgroundJob: {
      findMany: vi.fn().mockResolvedValue([]),
      groupBy: vi.fn().mockResolvedValue([]),
      update: vi.fn().mockResolvedValue({ id: "job-1" }),
    },
    notification: {
      createMany: vi.fn().mockResolvedValue({ count: 1 }),
      create: vi.fn().mockResolvedValue({ id: "notif-1" }),
    },
    emailLog: {
      count: vi.fn().mockResolvedValue(25),
    },
    auditLog: {
      create: vi.fn().mockResolvedValue({ id: "aud-1" }),
    },
  },
}));

import { NextRequest } from "next/server";
import { resolveDateRange, calculateComparison } from "@/lib/bi/date-filters";
import { sanitizeCsvValue, generateCsv, CsvColumn } from "@/lib/bi/csv-export";
import { GET as getOverviewAnalytics } from "@/app/api/v1/analytics/overview/route";
import { GET as getFinanceAnalytics } from "@/app/api/v1/analytics/finance/route";
import { POST as processJobs } from "@/app/api/v1/jobs/process/route";
import { POST as submitPublicLead } from "@/app/api/v1/public/leads/route";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth/permissions";

describe("Step 10: Final Platform-Wide Audit & Production Readiness", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --------------------------------------------------------------------------
  // GATE 1: Public Website & Lead Generation Integrity
  // --------------------------------------------------------------------------
  describe("Gate 1: Public Website & Lead Generation Integrity", () => {
    it("should reject spam honeypot submissions cleanly without persistence", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/public/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: "Spam Bot",
          email: "bot@spam.com",
          phone: "9999999999",
          message: "Buy cheap crypto",
          honeypot: "I am a spam bot filling hidden inputs",
        }),
      });

      const res = await submitPublicLead(req);
      const data = await res.json();

      // Honeypot trap should succeed with dummy response without db insertion
      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(db.lead.create).not.toHaveBeenCalled();
    });

    it("should reject invalid email and phone in public inquiries", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/public/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: "Valid Name",
          email: "invalid-email-address",
          phone: "123",
          message: "Hi",
        }),
      });

      const res = await submitPublicLead(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBeDefined();
    });

    it("should accept valid inquiries, generate leadCode, and persist safely", async () => {
      (db.lead.create as any).mockResolvedValueOnce({
        id: "lead-new-1",
        leadCode: "LD-20261018-0001",
        name: "Enterprise Client",
        email: "contact@enterprise.com",
        phone: "+91 9876543210",
        message: "Need a custom cloud ERP solution.",
        status: "NEW",
        source: "WEBSITE_CONTACT",
        createdAt: new Date(),
      });

      const req = new NextRequest("http://localhost:3000/api/v1/public/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: "Enterprise Client",
          email: "contact@enterprise.com",
          phone: "+91 9876543210",
          message: "Need a custom cloud ERP solution.",
          serviceInterest: "Cloud Solutions",
          captchaToken: "1x00000000000000000000AA",
        }),
      });

      const res = await submitPublicLead(req);
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.leadCode).toBeDefined();
      expect(db.lead.create).toHaveBeenCalled();
    });
  });

  // --------------------------------------------------------------------------
  // GATE 2: Role-Based Access Control (RBAC) & Data Isolation
  // --------------------------------------------------------------------------
  describe("Gate 2: RBAC & Tenant Data Isolation", () => {
    it("should block unauthenticated requests to protected analytics with HTTP 401", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/analytics/overview");
      const res = await getOverviewAnalytics(req);
      expect(res.status).toBe(401);
    });

    it("should block non-Founder users from /api/v1/analytics/finance with HTTP 403", async () => {
      (db.user.findUnique as any).mockResolvedValueOnce({
        id: "employee-1",
        email: "emp@axivontech.in",
        status: "ACTIVE",
        role: "EMPLOYEE",
        userRoles: [
          {
            role: {
              name: "EMPLOYEE",
              rolePermissions: [],
            },
          },
        ],
      });

      const req = new NextRequest("http://localhost:3000/api/v1/analytics/finance", {
        headers: { "x-user-id": "employee-1" },
      });

      const res = await getFinanceAnalytics(req);
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.error).toMatch(/Founder or Finance authorization/i);
    });

    it("should grant FOUNDER access to financial metrics", async () => {
      (db.user.findUnique as any).mockResolvedValueOnce({
        id: "founder-1",
        email: "founder@axivontech.in",
        status: "ACTIVE",
        role: "FOUNDER",
        userRoles: [
          {
            role: {
              name: "FOUNDER",
              rolePermissions: [],
            },
          },
        ],
      });

      const req = new NextRequest("http://localhost:3000/api/v1/analytics/finance", {
        headers: { "x-user-id": "founder-1" },
      });

      const res = await getFinanceAnalytics(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.currency).toBe("INR");
    });

    it("should enforce server-side permission checks on administrative mutations", async () => {
      await expect(requirePermission(null, "admin:access")).rejects.toThrow("Unauthorized");
    });
  });

  // --------------------------------------------------------------------------
  // GATE 3: Business Intelligence, Zero-Denominator & Mathematical Safety
  // --------------------------------------------------------------------------
  describe("Gate 3: BI Mathematical Safety & Spreadsheet Formula Injection Defense", () => {
    it("should compute period comparisons without division by zero or NaN", () => {
      // 0 to 0
      const comp1 = calculateComparison(0, 0);
      expect(comp1.direction).toBe("FLAT");
      expect(comp1.percentage).toBe(0);
      expect(Number.isFinite(comp1.percentage)).toBe(true);

      // 0 to 10
      const comp2 = calculateComparison(10, 0);
      expect(comp2.direction).toBe("UP");
      expect(comp2.percentage).toBeNull(); // Safe null instead of Infinity

      // 10 to 5
      const comp3 = calculateComparison(10, 5);
      expect(comp3.direction).toBe("UP");
      expect(comp3.percentage).toBe(100);

      // 5 to 10 (drop)
      const comp4 = calculateComparison(5, 10);
      expect(comp4.direction).toBe("DOWN");
      expect(comp4.percentage).toBe(-50);
    });

    it("should correctly handle inverted polarity metrics (e.g. overdue tasks)", () => {
      // Overdue tasks increased from 2 to 5 -> Not an improvement
      const badChange = calculateComparison(5, 2, false);
      expect(badChange.isImprovement).toBe(false);

      // Overdue tasks decreased from 5 to 1 -> Is an improvement
      const goodChange = calculateComparison(1, 5, false);
      expect(goodChange.isImprovement).toBe(true);
    });

    it("should sanitize dangerous formula injection characters in CSV cells", () => {
      expect(sanitizeCsvValue("=cmd|' /C calc'!A0")).toBe("'=cmd|' /C calc'!A0");
      expect(sanitizeCsvValue("+1+2")).toBe("'+1+2");
      expect(sanitizeCsvValue("-50")).toBe("'-50");
      expect(sanitizeCsvValue("@SUM(A1:A10)")).toBe("'@SUM(A1:A10)");
      expect(sanitizeCsvValue("\tTAB_INJECTION")).toBe("'\tTAB_INJECTION");
      expect(sanitizeCsvValue("\rRETURN_INJECTION")).toBe("\"'\rRETURN_INJECTION\"");
      // Benign cells remain intact
      expect(sanitizeCsvValue("Normal Lead Name")).toBe("Normal Lead Name");
      expect(sanitizeCsvValue(12500)).toBe("12500");
    });

    it("should format RFC 4180 compliant CSV strings with BOM header", () => {
      const columns: CsvColumn<any>[] = [
        { header: "Name", accessor: (r) => r.name },
        { header: "Company, LLC", accessor: (r) => r.company },
        { header: "Formula Payload", accessor: (r) => r.payload },
      ];
      const rows = [
        { name: "John Doe", company: "Axivon, Inc.", payload: "=1+1" },
        { name: 'Jane "VIP" Smith', company: "Tech Corp", payload: "Standard" },
      ];

      const csv = generateCsv(rows, columns);
      expect(csv.startsWith("\uFEFF")).toBe(true); // UTF-8 BOM
      expect(csv).toContain('"Company, LLC"'); // header with comma escaped
      expect(csv).toContain('"Axivon, Inc."'); // cell with comma escaped
      expect(csv).toContain('Jane ""VIP"" Smith'); // double quotes escaped
      expect(csv).toContain("'=1+1"); // formula escaped
    });
  });

  // --------------------------------------------------------------------------
  // GATE 4: Background Jobs, Automation Resilience & Graceful Recovery
  // --------------------------------------------------------------------------
  describe("Gate 4: Background Job Queue & Automation Resilience", () => {
    it("should reject unauthorized invocations to /api/v1/jobs/process with HTTP 401", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/jobs/process", {
        method: "POST",
        headers: { "Authorization": "Bearer wrong-secret" },
      });

      const res = await processJobs(req);
      expect(res.status).toBe(401);
    });

    it("should execute queued jobs and return processed metrics safely with valid Bearer token", async () => {
      const origSecret = process.env.CRON_SECRET;
      process.env.CRON_SECRET = "test-cron-secret";

      const req = new NextRequest("http://localhost:3000/api/v1/jobs/process", {
        method: "POST",
        headers: { "Authorization": "Bearer test-cron-secret" },
      });

      const res = await processJobs(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.timestamp).toBeDefined();

      process.env.CRON_SECRET = origSecret;
    });
  });

  // --------------------------------------------------------------------------
  // GATE 5: Date Range Boundaries & Timezone Consistency
  // --------------------------------------------------------------------------
  describe("Gate 5: Date Boundary Calculations", () => {
    it("should resolve 'this_month' boundaries covering 1st to end of current month", () => {
      const range = resolveDateRange("this_month");
      expect(range.preset).toBe("this_month");
      expect(range.label).toBe("This Month");
      expect(range.startDate.getDate()).toBe(1);
      expect(range.prevEndDate.getTime()).toBeLessThan(range.startDate.getTime());
    });

    it("should resolve 'custom' dates in UTC without calendar day shift", () => {
      const range = resolveDateRange("custom", "2026-03-01", "2026-03-31");
      expect(range.preset).toBe("custom");
      expect(range.startDate.toISOString().slice(0, 10)).toBe("2026-03-01");
      expect(range.endDate.toISOString().slice(0, 10)).toBe("2026-03-31");
      expect(range.prevEndDate.getTime()).toBeLessThan(range.startDate.getTime());
    });
  });
});
