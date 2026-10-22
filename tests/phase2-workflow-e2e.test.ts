import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock database
vi.mock("@/lib/db", () => {
  const mockDb = {
    lead: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    crmClient: {
      findFirst: vi.fn(),
      create: vi.fn(),
      count: vi.fn().mockResolvedValue(0),
    },
    opportunity: {
      create: vi.fn(),
      count: vi.fn().mockResolvedValue(0),
    },
    pipelineStage: {
      findUnique: vi.fn().mockResolvedValue({ id: "stage-qual", key: "QUALIFIED", probability: 25 }),
    },
    brokerProfile: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
    },
    partnerProject: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn().mockResolvedValue(0),
    },
    partnerContract: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    partnerContractVersion: {
      update: vi.fn(),
      create: vi.fn(),
    },
    partnerPayment: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    paymentSettings: {
      findFirst: vi.fn().mockResolvedValue({ id: "pay-1", type: "BANK", isActive: true }),
    },
    userRole: {
      findMany: vi.fn().mockResolvedValue([
        { userId: "admin-user-id" },
        { userId: "finance-user-id" },
      ]),
    },
    commission: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    commissionRule: {
      findFirst: vi.fn().mockResolvedValue({ id: "rule-10", name: "Standard 10%", type: "PERCENTAGE", value: 10, isActive: true }),
    },
    partnerDocument: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    leadActivity: {
      create: vi.fn(),
    },
    auditLog: {
      create: vi.fn().mockResolvedValue({ id: "audit-1" }),
    },
    notification: {
      create: vi.fn().mockResolvedValue({ id: "notif-1" }),
      createMany: vi.fn().mockResolvedValue({ count: 2 }),
    },
    $transaction: vi.fn((callbackOrArray) => {
      if (typeof callbackOrArray === "function") {
        return callbackOrArray(mockDb);
      }
      return Promise.all(callbackOrArray);
    }),
  };
  return { db: mockDb };
});

// Mock auth & permissions
vi.mock("@/lib/auth/permissions", () => ({
  requirePermission: vi.fn().mockResolvedValue({ id: "admin-user-id", role: "ADMIN", name: "Admin Officer" }),
  validateActiveUser: vi.fn().mockResolvedValue(true),
}));

describe("Phase 2: Broker-to-Client Business Workflow & Direct Client Lifecycle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // =========================================================================
  // 1. DIRECT CLIENT ACQUISITION & PROJECT CONVERSION
  // =========================================================================
  describe("Direct Client Acquisition & Conversion (Zero Broker Commission)", () => {
    it("converts direct website lead into client, opportunity, and project with brokerProfileId: null", async () => {
      const { db } = await import("@/lib/db");
      const { POST } = await import("@/app/api/v1/crm/leads/[id]/convert/route");

      const mockLead = {
        id: "lead-direct-101",
        leadCode: "LD-20261021-0001",
        name: "Vikram Malhotra",
        email: "vikram@directtech.in",
        phone: "+919876543210",
        companyName: "DirectTech Pvt Ltd",
        source: "WEBSITE_CONTACT", // Direct website inquiry (no broker code)
        status: "QUALIFIED",
        budget: 500000,
        serviceInterest: "Cloud Platform Modernization",
        ownerId: "sales-rep-1",
      };

      (db.lead.findUnique as any).mockResolvedValue(mockLead);
      (db.crmClient.findFirst as any).mockResolvedValue(null);
      (db.crmClient.create as any).mockResolvedValue({
        id: "client-direct-1",
        clientCode: "CL-20261021-0001",
        companyName: "DirectTech Pvt Ltd",
      });
      (db.opportunity.create as any).mockResolvedValue({
        id: "opp-direct-1",
        opportunityCode: "OPP-20261021-0001",
        value: 500000,
      });
      (db.partnerProject.create as any).mockImplementation(({ data }: any) => ({
        id: "proj-direct-1",
        ...data,
      }));
      (db.lead.update as any).mockResolvedValue({
        ...mockLead,
        status: "CONVERTED",
        convertedClientId: "client-direct-1",
      });

      const req = new NextRequest("http://localhost:3000/api/v1/crm/leads/lead-direct-101/convert", {
        method: "POST",
        headers: { "x-user-id": "admin-user-id", "Content-Type": "application/json" },
        body: JSON.stringify({ createOpportunity: true, opportunityValue: 500000 }),
      });

      const res = await POST(req, { params: Promise.resolve({ id: "lead-direct-101" }) });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);

      // Verify PartnerProject was created with brokerProfileId: null
      expect(db.partnerProject.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            brokerProfileId: null,
            clientEmail: "vikram@directtech.in",
            status: "PROJECT_REQUESTED",
          }),
        })
      );
    });

    it("verifies direct project payment without generating broker commission", async () => {
      const { db } = await import("@/lib/db");
      const { PATCH } = await import("@/app/api/v1/admin/partner-payments/[id]/route");

      const mockPayment = {
        id: "payment-direct-1",
        amountPaid: 200000,
        projectPrice: 500000,
        status: "SUBMITTED",
        partnerProject: {
          id: "proj-direct-1",
          projectCode: "PRJ-20261021-0001",
          brokerProfileId: null, // Direct client (no broker)
          brokerProfile: null,
        },
      };

      (db.partnerPayment.findUnique as any).mockResolvedValue(mockPayment);
      (db.partnerContract.findUnique as any).mockResolvedValue({
        id: "contract-1",
        status: "VERIFIED",
      });

      const req = new Request("http://localhost:3000/api/v1/admin/partner-payments/payment-direct-1", {
        method: "PATCH",
        headers: { "x-user-id": "admin-user-id", "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify" }),
      });

      const res = await PATCH(req, { params: Promise.resolve({ id: "payment-direct-1" }) });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.message).toContain("Direct project confirmed");

      // Invariant: Direct project must NOT generate any broker commission record
      expect(db.commission.create).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // 2. BROKER REFERRAL ATTRIBUTION & COMMISSION GENERATION
  // =========================================================================
  describe("Broker Referral Attribution & Commission Generation", () => {
    it("generates eligible commission when broker-referred client payment is verified", async () => {
      const { db } = await import("@/lib/db");
      const { PATCH } = await import("@/app/api/v1/admin/partner-payments/[id]/route");

      const mockPayment = {
        id: "payment-broker-1",
        amountPaid: 200000,
        projectPrice: 500000,
        status: "SUBMITTED",
        partnerProject: {
          id: "proj-broker-1",
          projectCode: "PRJ-20261021-0002",
          brokerProfileId: "broker-profile-1",
          brokerProfile: {
            id: "broker-profile-1",
            userId: "broker-user-1",
          },
        },
      };

      (db.partnerPayment.findUnique as any).mockResolvedValue(mockPayment);
      (db.partnerContract.findUnique as any).mockResolvedValue({
        id: "contract-broker-1",
        status: "VERIFIED",
      });

      const req = new Request("http://localhost:3000/api/v1/admin/partner-payments/payment-broker-1", {
        method: "PATCH",
        headers: { "x-user-id": "admin-user-id", "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify" }),
      });

      const res = await PATCH(req, { params: Promise.resolve({ id: "payment-broker-1" }) });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.message).toContain("Commission created");

      // Commission created in status ELIGIBLE with 10% rate (₹50,000)
      expect(db.commission.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            partnerProjectId: "proj-broker-1",
            brokerProfileId: "broker-profile-1",
            commissionAmount: 50000,
            status: "ELIGIBLE",
          }),
        })
      );
    });
  });

  // =========================================================================
  // 3. BROKER PAYOUT REQUEST & 48-HOUR SLA ENGINE
  // =========================================================================
  describe("Broker Payout Request Workflow & 48h SLA Engine", () => {
    it("rejects payout requests from non-brokers with HTTP 403", async () => {
      const { POST } = await import("@/app/api/v1/broker/commissions/payout-request/route");

      const req = new NextRequest("http://localhost:3000/api/v1/broker/commissions/payout-request", {
        method: "POST",
        headers: { "x-user-id": "client-user-1", "x-user-role": "CLIENT" },
        body: JSON.stringify({ commissionId: "comm-1", payoutMethod: "BANK_TRANSFER" }),
      });

      const res = await POST(req);
      expect(res.status).toBe(403);
    });

    it("rejects payout request with invalid IFSC code format", async () => {
      const { db } = await import("@/lib/db");
      const { POST } = await import("@/app/api/v1/broker/commissions/payout-request/route");

      (db.brokerProfile.findUnique as any).mockResolvedValue({
        id: "broker-profile-1",
        userId: "broker-user-1",
        user: { name: "Anil Sharma", email: "anil@partner.com" },
      });

      const req = new NextRequest("http://localhost:3000/api/v1/broker/commissions/payout-request", {
        method: "POST",
        headers: { "x-user-id": "broker-user-1", "x-user-role": "BROKER" },
        body: JSON.stringify({
          commissionId: "comm-1",
          payoutMethod: "BANK_TRANSFER",
          payoutDetails: {
            accountHolder: "Anil Sharma",
            accountNumber: "1234567890",
            ifsc: "INVALID_IFSC", // Bad format
          },
        }),
      });

      const res = await POST(req);
      const json = await res.json();
      expect(res.status).toBe(400);
      expect(json.error).toContain("Invalid IFSC code format");
    });

    it("accepts valid payout request and calculates 48-hour SLA due timestamp", async () => {
      const { db } = await import("@/lib/db");
      const { POST } = await import("@/app/api/v1/broker/commissions/payout-request/route");

      (db.brokerProfile.findUnique as any).mockResolvedValue({
        id: "broker-profile-1",
        userId: "broker-user-1",
        user: { name: "Anil Sharma", email: "anil@partner.com" },
      });

      const mockCommission = {
        id: "comm-1",
        brokerProfileId: "broker-profile-1",
        commissionAmount: 50000,
        status: "ELIGIBLE",
        partnerProject: { projectCode: "PRJ-20261021-0002" },
      };

      (db.commission.findUnique as any).mockResolvedValue(mockCommission);
      (db.commission.update as any).mockImplementation(({ data }: any) => ({
        ...mockCommission,
        ...data,
      }));

      const req = new NextRequest("http://localhost:3000/api/v1/broker/commissions/payout-request", {
        method: "POST",
        headers: { "x-user-id": "broker-user-1", "x-user-role": "BROKER" },
        body: JSON.stringify({
          commissionId: "comm-1",
          payoutMethod: "BANK_TRANSFER",
          payoutDetails: {
            accountHolder: "Anil Sharma",
            accountNumber: "987654321098",
            ifsc: "HDFC0001234",
            bankName: "HDFC Bank",
          },
          notes: "Please transfer to savings account.",
        }),
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.message).toContain("SLA target is 48 business hours");

      // Verify update: status = REQUESTED and payoutDueAt is ~48h in future
      expect(db.commission.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "comm-1" },
          data: expect.objectContaining({
            status: "REQUESTED",
            payoutMethod: "BANK_TRANSFER",
          }),
        })
      );

      const updatedCall = (db.commission.update as any).mock.calls[0][0];
      const diffHours = (updatedCall.data.payoutDueAt.getTime() - updatedCall.data.payoutRequestedAt.getTime()) / (1000 * 60 * 60);
      expect(Math.round(diffHours)).toBe(48);
    });
  });

  // =========================================================================
  // 4. ADMIN PAYOUT REVIEW, SLA TRACKING & SETTLEMENT CONFIRMATION
  // =========================================================================
  describe("Admin Payout Review & Verified Settlement (UTR Mandatory)", () => {
    it("reports live SLA status for requested payouts in admin commissions list", async () => {
      const { db } = await import("@/lib/db");
      const { GET } = await import("@/app/api/v1/admin/commissions/route");

      const now = new Date();
      // Payout 1: Requested 10 hours ago, due in 38h -> HEALTHY
      const healthyDue = new Date(now.getTime() + 38 * 3600 * 1000);
      // Payout 2: Requested 36 hours ago, due in 12h -> WARNING
      const warningDue = new Date(now.getTime() + 12 * 3600 * 1000);
      // Payout 3: Requested 50 hours ago, due 2h ago -> BREACHED
      const breachedDue = new Date(now.getTime() - 2 * 3600 * 1000);

      (db.commission.findMany as any).mockResolvedValue([
        {
          id: "comm-healthy",
          status: "REQUESTED",
          commissionAmount: 25000,
          payoutRequestedAt: new Date(now.getTime() - 10 * 3600 * 1000),
          payoutDueAt: healthyDue,
        },
        {
          id: "comm-warning",
          status: "REQUESTED",
          commissionAmount: 30000,
          payoutRequestedAt: new Date(now.getTime() - 36 * 3600 * 1000),
          payoutDueAt: warningDue,
        },
        {
          id: "comm-breached",
          status: "REQUESTED",
          commissionAmount: 40000,
          payoutRequestedAt: new Date(now.getTime() - 50 * 3600 * 1000),
          payoutDueAt: breachedDue,
        },
      ]);

      const req = new Request("http://localhost:3000/api/v1/admin/commissions");
      const res = await GET(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.data).toHaveLength(3);
      expect(json.data[0].slaStatus).toBe("HEALTHY");
      expect(json.data[1].slaStatus).toBe("WARNING");
      expect(json.data[2].slaStatus).toBe("BREACHED");
    });

    it("strictly requires Bank Transaction Reference (UTR) before marking payout as PAID", async () => {
      const { db } = await import("@/lib/db");
      const { PATCH } = await import("@/app/api/v1/admin/commissions/[id]/route");

      (db.commission.findUnique as any).mockResolvedValue({
        id: "comm-1",
        status: "PROCESSING",
        commissionAmount: 50000,
        brokerProfile: { userId: "broker-user-1" },
      });

      // Attempt pay without payoutReference UTR
      const req = new Request("http://localhost:3000/api/v1/admin/commissions/comm-1", {
        method: "PATCH",
        headers: { "x-user-id": "admin-user-id", "Content-Type": "application/json" },
        body: JSON.stringify({ action: "pay", payoutReference: "" }),
      });

      const res = await PATCH(req, { params: Promise.resolve({ id: "comm-1" }) });
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error).toContain("Bank transaction reference (UTR) is strictly required");
    });

    it("successfully marks commission as PAID when verified UTR settlement is provided", async () => {
      const { db } = await import("@/lib/db");
      const { PATCH } = await import("@/app/api/v1/admin/commissions/[id]/route");

      (db.commission.findUnique as any).mockResolvedValue({
        id: "comm-1",
        status: "PROCESSING",
        commissionAmount: 50000,
        brokerProfile: { userId: "broker-user-1" },
      });

      const req = new Request("http://localhost:3000/api/v1/admin/commissions/comm-1", {
        method: "PATCH",
        headers: { "x-user-id": "admin-user-id", "Content-Type": "application/json" },
        body: JSON.stringify({ action: "pay", payoutReference: "AXIV26102198765" }),
      });

      const res = await PATCH(req, { params: Promise.resolve({ id: "comm-1" }) });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.payoutReference).toBe("AXIV26102198765");

      expect(db.commission.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "comm-1" },
          data: expect.objectContaining({
            status: "PAID",
            payoutReference: "AXIV26102198765",
          }),
        })
      );
    });
  });

  // =========================================================================
  // 5. AUTOMATED PROJECT REPORT GENERATION & CLIENT PORTAL ACCESS
  // =========================================================================
  describe("Automated Project Report Generation & Delivery Workflow", () => {
    it("compiles verified HTML delivery report containing direct contractual certification and milestones", async () => {
      const { compileDeliveryReportHtml } = await import("@/lib/reports/project-report-generator");

      const reportHtml = compileDeliveryReportHtml({
        projectCode: "PRJ-20261021-0001",
        projectName: "Cloud Platform Modernization",
        companyName: "DirectTech Pvt Ltd",
        clientName: "Vikram Malhotra",
        clientEmail: "vikram@directtech.in",
        clientPhone: "+919876543210",
        requiredService: "Cloud Architecture",
        status: "DELIVERED",
        qaStatus: "UAT_APPROVED",
        progressPercentage: 100,
        createdAt: new Date(),
        deliveredAt: new Date(),
        milestones: [
          { title: "Architecture & Infrastructure", status: "COMPLETED", order: 1, completionDate: new Date() },
          { title: "Service Implementation", status: "COMPLETED", order: 2, completionDate: new Date() },
          { title: "Final UAT & Handover", status: "COMPLETED", order: 3, completionDate: new Date() },
        ],
        qaIssues: [],
        deliverables: [{ title: "Production Cluster Config", category: "CLIENT_DELIVERABLE", createdAt: new Date() }],
      });

      // Verify essential report contents
      expect(reportHtml).toContain("AXIVON TECHNOLOGIES");
      expect(reportHtml).toContain("PRJ-20261021-0001");
      expect(reportHtml).toContain("DirectTech Pvt Ltd");
      expect(reportHtml).toContain("Architecture & Infrastructure");
      expect(reportHtml).toContain("Direct Contractual Handover Certification");
      expect(reportHtml).toContain("executed directly by");
      expect(reportHtml).toContain("Axivon Technologies");
      expect(reportHtml).toContain("UAT_APPROVED");
    });

    it("automatically generates and publishes delivery report when project status moves to DELIVERED", async () => {
      const { db } = await import("@/lib/db");
      const { POST } = await import("@/app/api/v1/admin/partner-projects/[id]/delivery/route");

      const mockProject = {
        id: "proj-101",
        projectCode: "PRJ-20261021-0001",
        projectName: "Enterprise App",
        companyName: "DirectTech Pvt Ltd",
        clientName: "Vikram",
        clientEmail: "vikram@directtech.in",
        clientPhone: "9876543210",
        requiredService: "Development",
        status: "IN_PROGRESS",
        qaStatus: "UAT_APPROVED", // UAT approved
        progressPercentage: 100,
        createdAt: new Date(),
        brokerProfileId: null,
        clientUserId: "client-user-1",
        milestones: [{ id: "m-1", title: "Build Complete", status: "COMPLETED", order: 1 }],
        qaIssues: [],
        documents: [],
      };

      (db.partnerProject.findUnique as any).mockResolvedValue(mockProject);
      (db.partnerProject.update as any).mockResolvedValue({ ...mockProject, status: "DELIVERED" });
      (db.partnerDocument.findFirst as any).mockResolvedValue(null);
      (db.partnerDocument.create as any).mockResolvedValue({
        id: "doc-report-1",
        title: "Official Delivery & Verification Report — PRJ-20261021-0001",
        category: "CLIENT_REPORT",
        fileUrl: "data:text/html;charset=utf-8,report",
      });

      const req = new NextRequest("http://localhost:3000/api/v1/admin/partner-projects/proj-101/delivery", {
        method: "POST",
        headers: { "x-user-id": "admin-user-id" },
      });

      const res = await POST(req, { params: Promise.resolve({ id: "proj-101" }) });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.deliveryReport.category).toBe("CLIENT_REPORT");

      // Verify report was saved to PartnerDocument with client visibility
      expect(db.partnerDocument.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            partnerProjectId: "proj-101",
            category: "CLIENT_REPORT",
            isClientVisible: true,
            isImportant: true,
          }),
        })
      );
    });
  });
});
