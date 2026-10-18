import { describe, it, expect, vi, beforeEach } from "vitest";

// ============================================================================
// STEP 9: BUSINESS INTELLIGENCE, ANALYTICS, REPORTING & DECISION-MAKING DASHBOARD
// ============================================================================

// Mock database
vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: vi.fn(),
      count: vi.fn().mockResolvedValue(12),
    },
    userRole: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    lead: {
      count: vi.fn().mockResolvedValue(25),
      findMany: vi.fn().mockResolvedValue([]),
      groupBy: vi.fn().mockResolvedValue([]),
    },
    followUp: {
      count: vi.fn().mockResolvedValue(2),
    },
    partnerProject: {
      count: vi.fn().mockResolvedValue(8),
      findMany: vi.fn().mockResolvedValue([]),
      groupBy: vi.fn().mockResolvedValue([]),
    },
    partnerProjectMilestone: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([]),
      groupBy: vi.fn().mockResolvedValue([]),
    },
    partnerContract: {
      count: vi.fn().mockResolvedValue(3),
      findMany: vi.fn().mockResolvedValue([]),
    },
    partnerPayment: {
      count: vi.fn().mockResolvedValue(4),
      findMany: vi.fn().mockResolvedValue([]),
    },
    commission: {
      count: vi.fn().mockResolvedValue(2),
      findMany: vi.fn().mockResolvedValue([]),
    },
    brokerProfile: {
      count: vi.fn().mockResolvedValue(5),
    },
    businessPartnerApplication: {
      count: vi.fn().mockResolvedValue(14),
      findMany: vi.fn().mockResolvedValue([]),
      groupBy: vi.fn().mockResolvedValue([]),
    },
    crmClient: {
      count: vi.fn().mockResolvedValue(6),
    },
    qaIssue: {
      count: vi.fn().mockResolvedValue(1),
    },
    task: {
      count: vi.fn().mockResolvedValue(15),
      findMany: vi.fn().mockResolvedValue([]),
      groupBy: vi.fn().mockResolvedValue([]),
    },
    leaveRequest: {
      count: vi.fn().mockResolvedValue(2),
    },
    jobPosting: {
      count: vi.fn().mockResolvedValue(4),
    },
    careerApplication: {
      count: vi.fn().mockResolvedValue(18),
      groupBy: vi.fn().mockResolvedValue([]),
    },
    automationWorkflow: {
      count: vi.fn().mockResolvedValue(7),
    },
    automationExecution: {
      count: vi.fn().mockResolvedValue(45),
      findMany: vi.fn().mockResolvedValue([]),
    },
    backgroundJob: {
      groupBy: vi.fn().mockResolvedValue([
        { status: "COMPLETED", _count: { id: 38 } },
        { status: "PENDING", _count: { id: 2 } },
      ]),
    },
    emailLog: {
      count: vi.fn().mockResolvedValue(50),
    },
    auditLog: {
      create: vi.fn().mockResolvedValue({ id: "audit-1" }),
    },
  },
}));

import { db } from "@/lib/db";
import { resolveDateRange, calculateComparison } from "@/lib/bi/date-filters";
import { BusinessIntelligenceService } from "@/lib/bi/metrics";
import { sanitizeCsvValue, generateCsv } from "@/lib/bi/csv-export";

describe("Step 9: Business Intelligence, Analytics & Reporting System", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --------------------------------------------------------------------------
  // Scenario A: Date Filtering & Boundaries
  // --------------------------------------------------------------------------
  describe("Scenario A: Date Filtering & Boundaries", () => {
    it("should resolve 'today' date range with start at 00:00:00 and end at 23:59:59", () => {
      const range = resolveDateRange("today");
      expect(range.preset).toBe("today");
      expect(range.startDate.getHours()).toBe(0);
      expect(range.startDate.getMinutes()).toBe(0);
      expect(range.endDate.getHours()).toBe(23);
      expect(range.endDate.getMinutes()).toBe(59);
      expect(range.prevStartDate.getTime()).toBeLessThan(range.startDate.getTime());
    });

    it("should resolve 'last_30_days' with exact previous equivalent interval", () => {
      const range = resolveDateRange("last_30_days");
      expect(range.preset).toBe("last_30_days");
      expect(range.label).toBe("Last 30 Days");
      const currentSpan = range.endDate.getTime() - range.startDate.getTime();
      const prevSpan = range.prevEndDate.getTime() - range.prevStartDate.getTime();
      // Both spans should cover 30 days within sub-millisecond precision
      expect(Math.abs(currentSpan - prevSpan)).toBeLessThan(1000);
      expect(range.prevEndDate.getTime()).toBeLessThan(range.startDate.getTime());
    });

    it("should support valid 'custom' date ranges", () => {
      const range = resolveDateRange("custom", "2026-01-01", "2026-01-15");
      expect(range.preset).toBe("custom");
      expect(range.startDate.toISOString().slice(0, 10)).toBe("2026-01-01");
      expect(range.endDate.toISOString().slice(0, 10)).toBe("2026-01-15");
      expect(range.prevEndDate.getTime()).toBeLessThan(range.startDate.getTime());
    });
  });

  // --------------------------------------------------------------------------
  // Scenario B: Period Comparison & Zero-Denominator Safety
  // --------------------------------------------------------------------------
  describe("Scenario B: Period Comparison & Zero-Denominator Safety", () => {
    it("should calculate positive change accurately", () => {
      const result = calculateComparison(100, 50, true);
      expect(result.diff).toBe(50);
      expect(result.percentage).toBe(100);
      expect(result.direction).toBe("UP");
      expect(result.isImprovement).toBe(true);
    });

    it("should calculate negative change accurately", () => {
      const result = calculateComparison(50, 100, true);
      expect(result.diff).toBe(-50);
      expect(result.percentage).toBe(-50);
      expect(result.direction).toBe("DOWN");
      expect(result.isImprovement).toBe(false);
    });

    it("should handle previous value of 0 safely without division by zero or Infinity", () => {
      const result = calculateComparison(25, 0, true);
      expect(result.diff).toBe(25);
      expect(result.percentage).toBeNull(); // Cannot divide by zero
      expect(result.direction).toBe("UP");
      expect(result.isImprovement).toBe(true);
    });

    it("should handle 0 current and 0 previous as FLAT", () => {
      const result = calculateComparison(0, 0, true);
      expect(result.diff).toBe(0);
      expect(result.percentage).toBe(0);
      expect(result.direction).toBe("FLAT");
    });

    it("should invert improvement flag when higher is worse (e.g. overdue items)", () => {
      const result = calculateComparison(5, 2, false); // overdue increased from 2 to 5
      expect(result.direction).toBe("UP");
      expect(result.isImprovement).toBe(false); // higher overdue is worse!
    });
  });

  // --------------------------------------------------------------------------
  // Scenario C: Authoritative BI Service Metric Calculations
  // --------------------------------------------------------------------------
  describe("Scenario C: Authoritative BI Service Metric Calculations", () => {
    it("should compute qualification and conversion rates safely in getBusinessOverview", async () => {
      const dateRange = resolveDateRange("last_30_days");

      // Mock specific counts
      vi.mocked(db.lead.count)
        .mockResolvedValueOnce(100) // total all time
        .mockResolvedValueOnce(50)  // new in period
        .mockResolvedValueOnce(25)  // qualified in period
        .mockResolvedValueOnce(10)  // converted in period
        .mockResolvedValueOnce(40)  // prev new
        .mockResolvedValueOnce(15)  // prev qualified
        .mockResolvedValueOnce(5);  // prev converted

      const overview = await BusinessIntelligenceService.getBusinessOverview(dateRange);

      expect(overview.kpis.newLeads.current).toBe(50);
      expect(overview.kpis.qualifiedLeads.current).toBe(25);
      expect(overview.kpis.convertedLeads.current).toBe(10);
      // Qualification Rate = (25 / 50) * 100 = 50%
      expect(overview.kpis.qualificationRate.value).toBe(50);
      expect(overview.kpis.qualificationRate.formatted).toBe("50%");
      // Conversion Rate = (10 / 50) * 100 = 20%
      expect(overview.kpis.conversionRate.value).toBe(20);
      expect(overview.kpis.conversionRate.formatted).toBe("20%");
    });

    it("should calculate financial metrics with decimal precision", async () => {
      const dateRange = resolveDateRange("this_year");

      vi.mocked(db.partnerPayment.findMany)
        .mockResolvedValueOnce([
          { amountPaid: 150000, advanceAmount: 150000, currency: "INR" },
          { amountPaid: 250000, advanceAmount: 250000, currency: "INR" },
        ] as any)
        .mockResolvedValueOnce([
          { amountPaid: null, advanceAmount: 100000, currency: "INR" },
        ] as any);

      vi.mocked(db.partnerContract.findMany).mockResolvedValueOnce([
        { partnerProject: { finalProjectValue: 800000 } },
      ] as any);

      vi.mocked(db.commission.findMany)
        .mockResolvedValueOnce([{ commissionAmount: 40000 }] as any)
        .mockResolvedValueOnce([{ commissionAmount: 20000 }] as any);

      const finance = await BusinessIntelligenceService.getFinancialAnalytics(dateRange);

      expect(finance.currency).toBe("INR");
      expect(finance.metrics.cashCollected.amount).toBe(400000);
      expect(finance.metrics.cashCollected.formatted).toContain("4,00,000");
      expect(finance.metrics.pendingReceivables.amount).toBe(100000);
      expect(finance.metrics.contractedValue.amount).toBe(800000);
      expect(finance.metrics.commissionsPayable.amount).toBe(40000);
      expect(finance.metrics.commissionsPaid.amount).toBe(20000);
    });

    it("should compute platform health and automation success rates", async () => {
      const dateRange = resolveDateRange("last_30_days");

      vi.mocked(db.automationWorkflow.count).mockResolvedValue(5);
      vi.mocked(db.automationExecution.count)
        .mockResolvedValueOnce(50) // total
        .mockResolvedValueOnce(48) // success
        .mockResolvedValueOnce(2); // failed

      vi.mocked(db.emailLog.count)
        .mockResolvedValueOnce(95) // sent
        .mockResolvedValueOnce(5);  // failed

      const health = await BusinessIntelligenceService.getPlatformHealth(dateRange);

      expect(health.activeWorkflowsCount).toBe(5);
      expect(health.automation.totalExecutions).toBe(50);
      expect(health.automation.successfulExecutions).toBe(48);
      expect(health.automation.failedExecutions).toBe(2);
      expect(health.automation.successRate.value).toBe(96);
      expect(health.emailDelivery.deliveryRate).toBe(95);
    });
  });

  // --------------------------------------------------------------------------
  // Scenario D: Safe CSV Export & Formula-Injection Protection
  // --------------------------------------------------------------------------
  describe("Scenario D: Safe CSV Export & Formula-Injection Protection", () => {
    it("should sanitize dangerous formula injection characters (=, +, -, @)", () => {
      expect(sanitizeCsvValue("=SUM(A1:A10)")).toBe("'=SUM(A1:A10)");
      expect(sanitizeCsvValue("+1234567890")).toBe("'+1234567890");
      expect(sanitizeCsvValue("-cmd|' /C calc'!A0")).toBe("'-cmd|' /C calc'!A0");
      expect(sanitizeCsvValue("@maliciousFunction()")).toBe("'@maliciousFunction()");
    });

    it("should escape quotes and wrap in quotes for strings with commas", () => {
      expect(sanitizeCsvValue('Acme, "Inc."')).toBe('"Acme, ""Inc."""');
    });

    it("should generate RFC 4180-compliant CSV with UTF-8 BOM", () => {
      const testData = [
        { id: "1", name: "Ananya Roy", formula: "=1+1", company: "Acme, Corp" },
      ];
      const columns = [
        { header: "ID", accessor: (r: any) => r.id },
        { header: "Name", accessor: (r: any) => r.name },
        { header: "Formula Field", accessor: (r: any) => r.formula },
        { header: "Company", accessor: (r: any) => r.company },
      ];

      const csv = generateCsv(testData, columns);
      expect(csv.startsWith("\uFEFF")).toBe(true); // UTF-8 BOM
      expect(csv).toContain("ID,Name,Formula Field,Company");
      expect(csv).toContain("1,Ananya Roy,'=1+1,\"Acme, Corp\"");
    });
  });

  // --------------------------------------------------------------------------
  // Scenario E: API Authorization & Security
  // --------------------------------------------------------------------------
  describe("Scenario E: API Authorization & Security", () => {
    it("should reject unauthenticated request to /api/v1/analytics/overview with HTTP 401", async () => {
      const { GET } = await import("@/app/api/v1/analytics/overview/route");
      const req = new Request("http://localhost:3000/api/v1/analytics/overview") as any;

      const res = await GET(req);
      expect(res.status).toBe(401);
    });

    it("should allow admin access to /api/v1/analytics/overview", async () => {
      vi.mocked(db.user.findUnique).mockResolvedValue({
        id: "admin-1",
        status: "ACTIVE",
        userRoles: [{ role: { name: "ADMIN", rolePermissions: [] } }],
      } as any);

      const { GET } = await import("@/app/api/v1/analytics/overview/route");
      const req = new Request("http://localhost:3000/api/v1/analytics/overview", {
        headers: { "x-user-id": "admin-1" },
      }) as any;

      const res = await GET(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.kpis).toBeDefined();
    });

    it("should reject non-Founder / non-Finance from /api/v1/analytics/finance with HTTP 403", async () => {
      // User with standard role and no finance permission
      vi.mocked(db.user.findUnique).mockResolvedValue({
        id: "employee-1",
        status: "ACTIVE",
        userRoles: [
          {
            role: {
              name: "EMPLOYEE",
              rolePermissions: [],
            },
          },
        ],
      } as any);

      const { GET } = await import("@/app/api/v1/analytics/finance/route");
      const req = new Request("http://localhost:3000/api/v1/analytics/finance", {
        headers: { "x-user-id": "employee-1" },
      }) as any;

      const res = await GET(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error).toMatch(/Founder or Finance authorization/i);
    });

    it("should allow Founder to access /api/v1/analytics/finance", async () => {
      vi.mocked(db.user.findUnique).mockResolvedValue({
        id: "founder-1",
        status: "ACTIVE",
        userRoles: [
          {
            role: {
              name: "FOUNDER",
              rolePermissions: [],
            },
          },
        ],
      } as any);

      const { GET } = await import("@/app/api/v1/analytics/finance/route");
      const req = new Request("http://localhost:3000/api/v1/analytics/finance", {
        headers: { "x-user-id": "founder-1" },
      }) as any;

      const res = await GET(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.currency).toBe("INR");
    });

    it("should stream sanitized CSV file on /api/v1/analytics/export", async () => {
      vi.mocked(db.user.findUnique).mockResolvedValue({
        id: "admin-1",
        status: "ACTIVE",
        userRoles: [{ role: { name: "ADMIN", rolePermissions: [] } }],
      } as any);

      vi.mocked(db.lead.findMany).mockResolvedValue([
        {
          id: "lead-1",
          leadCode: "LD-20261018-0001",
          name: "Saurabh Sharma",
          email: "saurabh@example.com",
          phone: "9876543210",
          companyName: "TechCorp",
          serviceInterest: "Full Stack Development",
          source: "WEBSITE_CONTACT",
          status: "NEW",
          qualificationStatus: "QUALIFIED",
          createdAt: new Date("2026-10-18T10:00:00Z"),
        },
      ] as any);

      const { GET } = await import("@/app/api/v1/analytics/export/route");
      const req = new Request("http://localhost:3000/api/v1/analytics/export?reportType=leads", {
        headers: { "x-user-id": "admin-1" },
      }) as any;

      const res = await GET(req);
      expect(res.status).toBe(200);
      expect(res.headers.get("content-type")).toContain("text/csv");
      expect(res.headers.get("content-disposition")).toContain("axivon_leads_");

      const text = await res.text();
      expect(text).toContain("Lead Code,Client Name,Email");
      expect(text).toContain("LD-20261018-0001,Saurabh Sharma,saurabh@example.com");
    });
  });
});
