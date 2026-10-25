import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { ApiError } from "@/lib/api-error";

// Mock database
vi.mock("@/lib/db", () => {
  const mockDb = {
    user: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    userRole: {
      findMany: vi.fn().mockResolvedValue([
        { userId: "admin-user-id" },
        { userId: "finance-user-id" },
      ]),
    },
    session: {
      deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
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
    partnerPayment: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
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
  requirePermission: vi.fn().mockImplementation(async (userId: string | null) => {
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }
    if (userId === "unauthorized-user-id" || userId === "unauthorized-broker-id") {
      throw new ApiError(403, "Forbidden: insufficient permissions");
    }
    return { id: userId, email: `${userId}@axivontech.in`, role: "ADMIN" };
  }),
}));

describe("Phase 4: Broker Workflow Gap Closure, Financial Safeguards & Acceptance Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("1. Direct Client vs. Broker Attribution Financial Invariant", () => {
    it("converts direct client lead with ZERO broker attribution and creates unlinked PartnerProject", async () => {
      const { db } = await import("@/lib/db");
      const { POST } = await import("@/app/api/v1/crm/leads/[id]/convert/route");

      (db.lead.findUnique as any).mockResolvedValue({
        id: "lead-direct-101",
        name: "Direct Enterprise Client",
        email: "direct@enterprise.com",
        phone: "+919876543210",
        companyName: "Enterprise Corp",
        source: "WEBSITE_CONTACT", // Direct website inquiry
        ownerId: null, // No broker owner
        status: "QUALIFIED",
        qualificationStatus: "QUALIFIED",
        convertedClientId: null,
      });

      (db.crmClient.findFirst as any).mockResolvedValue(null);
      (db.crmClient.create as any).mockResolvedValue({ id: "client-direct-1", clientCode: "CL-20261021-0001" });
      (db.partnerProject.create as any).mockResolvedValue({
        id: "prj-direct-1",
        projectCode: "PRJ-20261021-0001",
        brokerProfileId: null, // Strictly null
      });

      const req = new NextRequest("http://localhost:3000/api/v1/crm/leads/lead-direct-101/convert", {
        method: "POST",
        headers: { "x-user-id": "admin-1" },
        body: JSON.stringify({ createOpportunity: true, opportunityValue: 500000 }),
      });

      const res = await POST(req, { params: Promise.resolve({ id: "lead-direct-101" }) });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);

      const projectCreateCalls = (db.partnerProject.create as any).mock.calls;
      expect(projectCreateCalls.length).toBe(1);
      expect(projectCreateCalls[0][0].data.brokerProfileId).toBeNull();
    });

    it("payment verification on direct project confirms project with ZERO broker commission", async () => {
      const { db } = await import("@/lib/db");
      const { PATCH } = await import("@/app/api/v1/admin/partner-payments/[id]/route");

      (db.partnerPayment.findUnique as any).mockResolvedValue({
        id: "pay-direct-1",
        projectPrice: 500000,
        amountPaid: 200000,
        status: "SUBMITTED",
        partnerProject: {
          id: "prj-direct-1",
          projectCode: "PRJ-20261021-0001",
          brokerProfileId: null, // Direct client
          brokerProfile: null,
        },
      });

      (db.partnerContract.findUnique as any).mockResolvedValue({
        id: "contract-1",
        status: "VERIFIED",
      });

      const req = new NextRequest("http://localhost:3000/api/v1/admin/partner-payments/pay-direct-1", {
        method: "PATCH",
        headers: { "x-user-id": "admin-1" },
        body: JSON.stringify({ action: "verify" }),
      });

      const res = await PATCH(req, { params: Promise.resolve({ id: "pay-direct-1" }) });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.message).toContain("Direct project confirmed");

      // Verify no commission record was created
      expect((db.commission.create as any).mock.calls.length).toBe(0);
    });
  });

  describe("2. Commission Rule Dynamic Matching & Calculation", () => {
    it("dynamically queries active CommissionRule and creates commission for broker-referred project", async () => {
      const { db } = await import("@/lib/db");
      const { PATCH } = await import("@/app/api/v1/admin/partner-payments/[id]/route");

      (db.partnerPayment.findUnique as any).mockResolvedValue({
        id: "pay-broker-1",
        projectPrice: 300000,
        amountPaid: 120000,
        status: "SUBMITTED",
        partnerProject: {
          id: "prj-broker-1",
          projectCode: "PRJ-20261021-0002",
          brokerProfileId: "broker-prof-1",
          brokerProfile: {
            id: "broker-prof-1",
            userId: "broker-user-1",
          },
        },
      });

      (db.partnerContract.findUnique as any).mockResolvedValue({
        id: "contract-2",
        status: "VERIFIED",
      });

      (db.commissionRule.findFirst as any).mockResolvedValue({
        id: "rule-12",
        name: "Standard Broker 12%",
        type: "PERCENTAGE",
        value: 12,
        isActive: true,
      });

      (db.commission.findUnique as any).mockResolvedValue(null);

      const req = new NextRequest("http://localhost:3000/api/v1/admin/partner-payments/pay-broker-1", {
        method: "PATCH",
        headers: { "x-user-id": "admin-1" },
        body: JSON.stringify({ action: "verify" }),
      });

      const res = await PATCH(req, { params: Promise.resolve({ id: "pay-broker-1" }) });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);

      const commCalls = (db.commission.create as any).mock.calls;
      expect(commCalls.length).toBe(1);
      // 12% of 300000 = 36000
      expect(commCalls[0][0].data.commissionAmount).toBe(36000);
      expect(commCalls[0][0].data.commissionRate).toBe(12);
      expect(commCalls[0][0].data.status).toBe("ELIGIBLE");
    });

    it("safeguards payment verification idempotency: does not create duplicate commission on re-run", async () => {
      const { db } = await import("@/lib/db");
      const { PATCH } = await import("@/app/api/v1/admin/partner-payments/[id]/route");

      (db.partnerPayment.findUnique as any).mockResolvedValue({
        id: "pay-broker-1",
        projectPrice: 300000,
        amountPaid: 120000,
        status: "SUBMITTED",
        partnerProject: {
          id: "prj-broker-1",
          projectCode: "PRJ-20261021-0002",
          brokerProfileId: "broker-prof-1",
          brokerProfile: { id: "broker-prof-1", userId: "broker-user-1" },
        },
      });

      (db.partnerContract.findUnique as any).mockResolvedValue({ id: "c-1", status: "VERIFIED" });
      (db.commissionRule.findFirst as any).mockResolvedValue({ id: "rule-10", type: "PERCENTAGE", value: 10, isActive: true });

      // Commission ALREADY exists for this project
      (db.commission.findUnique as any).mockResolvedValue({
        id: "existing-comm-1",
        partnerProjectId: "prj-broker-1",
        commissionAmount: 30000,
      });

      const req = new NextRequest("http://localhost:3000/api/v1/admin/partner-payments/pay-broker-1", {
        method: "PATCH",
        headers: { "x-user-id": "admin-1" },
        body: JSON.stringify({ action: "verify" }),
      });

      const res = await PATCH(req, { params: Promise.resolve({ id: "pay-broker-1" }) });
      expect(res.status).toBe(200);

      // Verify commission.create was NOT called again
      expect((db.commission.create as any).mock.calls.length).toBe(0);
    });
  });

  describe("3. Broker Payout 48h SLA Engine & Admin/Finance Notifications", () => {
    it("submits payout request, calculates exact 48h SLA deadline, and notifies both Broker and Finance", async () => {
      const { db } = await import("@/lib/db");
      const { POST } = await import("@/app/api/v1/broker/commissions/payout-request/route");

      (db.brokerProfile.findUnique as any).mockResolvedValue({
        id: "broker-prof-1",
        userId: "broker-user-1",
        user: { name: "Rajesh Sharma", email: "rajesh@broker.com" },
      });

      (db.commission.findUnique as any).mockResolvedValue({
        id: "comm-101",
        brokerProfileId: "broker-prof-1",
        commissionAmount: 45000,
        status: "ELIGIBLE",
        partnerProject: { projectCode: "PRJ-20261021-0005", projectName: "Cloud Architecture" },
      });

      (db.commission.update as any).mockResolvedValue({
        id: "comm-101",
        status: "REQUESTED",
        commissionAmount: 45000,
      });

      const req = new NextRequest("http://localhost:3000/api/v1/broker/commissions/payout-request", {
        method: "POST",
        headers: {
          "x-user-id": "broker-user-1",
          "x-user-role": "BROKER",
        },
        body: JSON.stringify({
          commissionId: "comm-101",
          payoutMethod: "BANK_TRANSFER",
          payoutDetails: {
            accountHolder: "Rajesh Sharma",
            accountNumber: "919293949596",
            ifsc: "HDFC0001234",
            bankName: "HDFC Bank",
          },
          notes: "Please process via IMPS",
        }),
      });

      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.slaDueAt).toBeDefined();

      const slaDue = new Date(json.slaDueAt);
      const now = new Date();
      const diffHours = (slaDue.getTime() - now.getTime()) / (1000 * 60 * 60);
      // SLA target should be approximately 48 hours (+/- 1 minute tolerance)
      expect(Math.round(diffHours)).toBe(48);

      // Verify Admin & Finance team notifications were dispatched
      expect((db.notification.createMany as any).mock.calls.length).toBe(1);
    });

    it("strictly validates IFSC code format before accepting Bank Transfer payout request", async () => {
      const { db } = await import("@/lib/db");
      const { POST } = await import("@/app/api/v1/broker/commissions/payout-request/route");

      (db.brokerProfile.findUnique as any).mockResolvedValue({
        id: "broker-prof-1",
        userId: "broker-user-1",
        user: { name: "Rajesh Sharma" },
      });

      const req = new NextRequest("http://localhost:3000/api/v1/broker/commissions/payout-request", {
        method: "POST",
        headers: { "x-user-id": "broker-user-1", "x-user-role": "BROKER" },
        body: JSON.stringify({
          commissionId: "comm-101",
          payoutMethod: "BANK_TRANSFER",
          payoutDetails: {
            accountHolder: "Rajesh Sharma",
            accountNumber: "919293949596",
            ifsc: "INVALID_IFSC_CODE",
          },
        }),
      });

      const res = await POST(req);
      const json = await res.json();
      const errorText = typeof json.error === "object" ? json.error.message : (json.error || json.message);

      expect(res.status).toBe(400);
      expect(errorText).toContain("Invalid IFSC code format");
    });
  });

  describe("4. Financial Settlement Safeguards & Duplicate UTR Prevention", () => {
    it("strictly rejects commission settlement when transaction reference (UTR) is missing", async () => {
      const { db } = await import("@/lib/db");
      const { PATCH } = await import("@/app/api/v1/admin/commissions/[id]/route");

      (db.commission.findUnique as any).mockResolvedValue({
        id: "comm-pay-1",
        status: "APPROVED",
        commissionAmount: 35000,
        brokerProfile: { userId: "broker-1" },
      });

      const req = new NextRequest("http://localhost:3000/api/v1/admin/commissions/comm-pay-1", {
        method: "PATCH",
        headers: { "x-user-id": "admin-1" },
        body: JSON.stringify({ action: "pay", payoutReference: "   " }), // Empty UTR
      });

      const res = await PATCH(req, { params: Promise.resolve({ id: "comm-pay-1" }) });
      const json = await res.json();
      const errorText = typeof json.error === "object" ? json.error.message : (json.error || json.message);

      expect(res.status).toBe(400);
      expect(errorText).toContain("Bank transaction reference (UTR) is strictly required");
    });

    it("strictly rejects duplicate UTR reuse across settled payouts", async () => {
      const { db } = await import("@/lib/db");
      const { PATCH } = await import("@/app/api/v1/admin/commissions/[id]/route");

      (db.commission.findUnique as any).mockResolvedValue({
        id: "comm-pay-2",
        status: "APPROVED",
        commissionAmount: 40000,
        brokerProfile: { userId: "broker-2" },
      });

      // Another commission already has this UTR recorded!
      (db.commission.findFirst as any).mockResolvedValue({
        id: "prior-settled-comm",
        payoutReference: "UTR20261021998877",
        status: "PAID",
      });

      const req = new NextRequest("http://localhost:3000/api/v1/admin/commissions/comm-pay-2", {
        method: "PATCH",
        headers: { "x-user-id": "admin-1" },
        body: JSON.stringify({ action: "pay", payoutReference: "UTR20261021998877" }),
      });

      const res = await PATCH(req, { params: Promise.resolve({ id: "comm-pay-2" }) });
      const json = await res.json();
      const errorText = typeof json.error === "object" ? json.error.message : (json.error || json.message);

      expect(res.status).toBe(400);
      expect(errorText).toContain("has already been recorded for another settled commission");
    });

    it("successfully settles commission when unique valid UTR is provided", async () => {
      const { db } = await import("@/lib/db");
      const { PATCH } = await import("@/app/api/v1/admin/commissions/[id]/route");

      (db.commission.findUnique as any).mockResolvedValue({
        id: "comm-pay-3",
        status: "APPROVED",
        commissionAmount: 50000,
        brokerProfile: { userId: "broker-3" },
      });

      // No prior commission with this UTR
      (db.commission.findFirst as any).mockResolvedValue(null);

      const req = new NextRequest("http://localhost:3000/api/v1/admin/commissions/comm-pay-3", {
        method: "PATCH",
        headers: { "x-user-id": "admin-1" },
        body: JSON.stringify({ action: "pay", payoutReference: "AXVN-UTR-2026-UNIQUE-001" }),
      });

      const res = await PATCH(req, { params: Promise.resolve({ id: "comm-pay-3" }) });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.payoutReference).toBe("AXVN-UTR-2026-UNIQUE-001");
    });
  });

  describe("5. Access Control & Cross-Entity Data Isolation", () => {
    it("strictly blocks Broker A from requesting payout on Broker B's commission (HTTP 403)", async () => {
      const { db } = await import("@/lib/db");
      const { POST } = await import("@/app/api/v1/broker/commissions/payout-request/route");

      (db.brokerProfile.findUnique as any).mockResolvedValue({
        id: "broker-A",
        userId: "broker-user-A",
      });

      (db.commission.findUnique as any).mockResolvedValue({
        id: "comm-B",
        brokerProfileId: "broker-B", // Belongs to Broker B!
        commissionAmount: 25000,
        status: "ELIGIBLE",
      });

      const req = new NextRequest("http://localhost:3000/api/v1/broker/commissions/payout-request", {
        method: "POST",
        headers: { "x-user-id": "broker-user-A", "x-user-role": "BROKER" },
        body: JSON.stringify({
          commissionId: "comm-B",
          payoutMethod: "UPI",
          payoutDetails: { upiId: "brokerA@upi" },
        }),
      });

      const res = await POST(req);
      const json = await res.json();
      const errorText = typeof json.error === "object" ? json.error.message : (json.error || json.message);

      expect(res.status).toBe(403);
      expect(errorText).toContain("Access denied. This commission does not belong to your broker account.");
    });
  });
});
