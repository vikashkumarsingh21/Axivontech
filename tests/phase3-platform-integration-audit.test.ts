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
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
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
    paymentSettings: {
      findFirst: vi.fn().mockResolvedValue({ id: "pay-1", type: "BANK", isActive: true }),
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
  requirePermission: vi.fn().mockImplementation(async (userId: string | null, permission: string) => {
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }
    if (userId === "unauthorized-broker-id" || userId === "unauthorized-client-id") {
      throw new ApiError(403, "Forbidden: insufficient permissions");
    }
    return { id: userId, role: "ADMIN", name: "Auditor" };
  }),
  validateActiveUser: vi.fn().mockImplementation(async (userId: string) => {
    if (userId === "inactive-user-id") {
      throw new ApiError(403, "User account is disabled or deactivated");
    }
    return true;
  }),
}));

describe("Phase 3: Final Platform-Wide Integration Audit & Security Verification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // =========================================================================
  // 1. CROSS-TENANT ISOLATION: BROKER DATA ACCESS
  // =========================================================================
  describe("Cross-Broker Data Leakage Prevention", () => {
    it("strictly prevents Broker A from requesting payout on Broker B's commission", async () => {
      const { db } = await import("@/lib/db");
      const { POST } = await import("@/app/api/v1/broker/commissions/payout-request/route");

      // Broker A profile found
      (db.brokerProfile.findUnique as any).mockResolvedValue({
        id: "broker-profile-A",
        userId: "broker-user-A",
      });

      // Commission query finds a commission belonging to Broker B (brokerProfileId: "broker-profile-B")
      (db.commission.findUnique as any).mockResolvedValue({
        id: "comm-belonging-to-B",
        brokerProfileId: "broker-profile-B", // Belongs to different broker
        status: "APPROVED",
        commissionAmount: 25000,
        partnerProject: {
          projectCode: "AXV-2026-099",
          projectName: "Broker B Project",
        },
      });

      const req = new NextRequest("http://localhost:3000/api/v1/broker/commissions/payout-request", {
        method: "POST",
        headers: {
          "x-user-id": "broker-user-A",
          "x-user-role": "BROKER",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          commissionId: "comm-belonging-to-B",
          payoutMethod: "BANK_TRANSFER",
          payoutDetails: {
            accountHolder: "Broker A",
            accountNumber: "123456789012",
            ifsc: "HDFC0001234",
            bankName: "HDFC Bank",
          },
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.error).toMatch(/does not belong to your broker account|access denied/i);
    });
  });

  // =========================================================================
  // 2. CROSS-TENANT ISOLATION: CLIENT DOCUMENT VAULT & DELIVERY REPORTS
  // =========================================================================
  describe("Cross-Client Document Vault Security", () => {
    it("strictly blocks Client B from downloading Client A's project delivery report", async () => {
      const { db } = await import("@/lib/db");
      const { GET } = await import("@/app/api/v1/client/projects/[id]/documents/[docId]/download/route");

      // Document query filters by partnerProject: { clientUserId: "client-user-B" } -> returns null
      (db.partnerDocument.findFirst as any).mockResolvedValue(null);

      const req = new NextRequest(
        "http://localhost:3000/api/v1/client/projects/proj-client-A/documents/doc-report-1/download",
        {
          method: "GET",
          headers: {
            "x-user-id": "client-user-B",
            "x-user-role": "CLIENT",
          },
        }
      );

      const res = await GET(req, {
        params: Promise.resolve({ id: "proj-client-A", docId: "doc-report-1" }),
      });

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toMatch(/document not found or access denied/i);
    });

    it("allows authorized Client A to view and stream their own verified HTML delivery report", async () => {
      const { db } = await import("@/lib/db");
      const { GET } = await import("@/app/api/v1/client/projects/[id]/documents/[docId]/download/route");

      const mockHtmlContent = "<html><body><h1>Official Axivon Delivery Report</h1></body></html>";
      const dataUri = `data:text/html;charset=utf-8,${encodeURIComponent(mockHtmlContent)}`;

      (db.partnerDocument.findFirst as any).mockResolvedValue({
        id: "doc-report-1",
        title: "Official Project Delivery Report - AXV-2026-001",
        category: "CLIENT_REPORT",
        fileUrl: dataUri,
        mimeType: "text/html",
        isClientVisible: true,
      });

      const req = new NextRequest(
        "http://localhost:3000/api/v1/client/projects/proj-client-A/documents/doc-report-1/download",
        {
          method: "GET",
          headers: {
            "x-user-id": "client-user-A",
            "x-user-role": "CLIENT",
          },
        }
      );

      const res = await GET(req, {
        params: Promise.resolve({ id: "proj-client-A", docId: "doc-report-1" }),
      });

      expect(res.status).toBe(200);
      expect(res.headers.get("content-type")).toContain("text/html");
      expect(res.headers.get("content-disposition")).toContain("inline");
      const text = await res.text();
      expect(text).toContain("Official Axivon Delivery Report");
    });
  });

  // =========================================================================
  // 3. RBAC SECURITY ON FINANCIAL & CONTRACTUAL VERIFICATION
  // =========================================================================
  describe("RBAC Protection on Payment Verification", () => {
    it("rejects unauthorized payment verification attempts by non-admin accounts with HTTP 403", async () => {
      const { PATCH } = await import("@/app/api/v1/admin/partner-payments/[id]/route");

      const req = new NextRequest("http://localhost:3000/api/v1/admin/partner-payments/payment-101", {
        method: "PATCH",
        headers: {
          "x-user-id": "unauthorized-broker-id",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "verify" }),
      });

      const res = await PATCH(req, {
        params: Promise.resolve({ id: "payment-101" }),
      });

      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.error).toMatch(/insufficient permissions/i);
    });
  });

  // =========================================================================
  // 4. BUSINESS INVARIANT: DIRECT CLIENT ZERO BROKER COMMISSION
  // =========================================================================
  describe("Direct Engagement Invariant: Zero Broker Commission", () => {
    it("confirms direct client payment without generating any commission records", async () => {
      const { db } = await import("@/lib/db");
      const { PATCH } = await import("@/app/api/v1/admin/partner-payments/[id]/route");

      const mockDirectPayment = {
        id: "payment-direct-1",
        partnerProjectId: "proj-direct-101",
        status: "SUBMITTED",
        amountPaid: 250000,
        currency: "INR",
        projectPrice: 500000,
        partnerProject: {
          id: "proj-direct-101",
          projectCode: "AXV-DIR-001",
          brokerProfileId: null, // Direct client (no broker)
          status: "PAYMENT_PENDING",
          clientEmail: "ceo@directcorp.com",
        },
      };

      (db.partnerPayment.findUnique as any).mockResolvedValue(mockDirectPayment);
      (db.partnerContract.findUnique as any).mockResolvedValue({
        id: "contract-1",
        partnerProjectId: "proj-direct-101",
        status: "VERIFIED",
      });
      (db.partnerPayment.update as any).mockResolvedValue({
        ...mockDirectPayment,
        status: "CONFIRMED",
        verifiedAt: new Date(),
      });
      (db.partnerProject.update as any).mockResolvedValue({
        ...mockDirectPayment.partnerProject,
        status: "CONFIRMED",
      });

      const req = new NextRequest("http://localhost:3000/api/v1/admin/partner-payments/payment-direct-1", {
        method: "PATCH",
        headers: {
          "x-user-id": "admin-officer-id",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "verify" }),
      });

      const res = await PATCH(req, {
        params: Promise.resolve({ id: "payment-direct-1" }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);

      // Verify that NO commission was created
      expect(db.commission.create).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // 5. QUALITY GATE: DELIVERY BLOCKED WITHOUT UAT APPROVAL
  // =========================================================================
  describe("Quality Gate: Project Delivery Enforcement", () => {
    it("strictly blocks project delivery when qaStatus is not UAT_APPROVED with HTTP 400", async () => {
      const { db } = await import("@/lib/db");
      const { POST } = await import("@/app/api/v1/admin/partner-projects/[id]/delivery/route");

      (db.partnerProject.findUnique as any).mockResolvedValue({
        id: "proj-uat-pending",
        projectCode: "AXV-2026-009",
        status: "IN_PROGRESS",
        qaStatus: "UAT_READY", // Awaiting client acceptance
        brokerProfile: null,
      });

      const req = new NextRequest("http://localhost:3000/api/v1/admin/partner-projects/proj-uat-pending/delivery", {
        method: "POST",
        headers: {
          "x-user-id": "admin-officer-id",
          "Content-Type": "application/json",
        },
      });

      const res = await POST(req, {
        params: Promise.resolve({ id: "proj-uat-pending" }),
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toMatch(/UAT must be approved before delivery/i);
    });

    it("allows delivery and auto-generates delivery report when qaStatus is UAT_APPROVED", async () => {
      const { db } = await import("@/lib/db");
      const { POST } = await import("@/app/api/v1/admin/partner-projects/[id]/delivery/route");

      (db.partnerProject.findUnique as any).mockResolvedValue({
        id: "proj-uat-cleared",
        projectCode: "AXV-2026-010",
        projectName: "Logistics Enterprise Suite",
        status: "IN_PROGRESS",
        qaStatus: "UAT_APPROVED", // Approved by client
        clientUserId: "client-user-1",
        brokerProfile: null,
        clientName: "Rohan Mehta",
        companyName: "Mehta Logistics",
        clientEmail: "rohan@mehtalogistics.in",
        clientPhone: "+919876501234",
        requiredService: "ERP System",
        projectBudget: "INR 10,00,000",
        expectedTimeline: "3 Months",
        detailedRequirement: "Logistics cloud system",
        milestones: [],
        qaIssues: [],
        documents: [],
        contract: {
          status: "VERIFIED",
          contractName: "Master Service Agreement",
          versions: [],
        },
        createdAt: new Date(),
      });

      (db.partnerProject.update as any).mockResolvedValue({
        id: "proj-uat-cleared",
        projectCode: "AXV-2026-010",
        status: "DELIVERED",
        deliveredAt: new Date(),
        qaStatus: "UAT_APPROVED",
      });

      (db.partnerDocument.findFirst as any).mockResolvedValue(null);
      (db.partnerDocument.create as any).mockResolvedValue({
        id: "doc-auto-report-1",
        title: "Official Project Delivery Report - AXV-2026-010",
        category: "CLIENT_REPORT",
      });
      (db.partnerDocument.update as any).mockResolvedValue({
        id: "doc-auto-report-1",
        title: "Official Project Delivery Report - AXV-2026-010",
        category: "CLIENT_REPORT",
      });

      const req = new NextRequest("http://localhost:3000/api/v1/admin/partner-projects/proj-uat-cleared/delivery", {
        method: "POST",
        headers: {
          "x-user-id": "admin-officer-id",
          "Content-Type": "application/json",
        },
      });

      const res = await POST(req, {
        params: Promise.resolve({ id: "proj-uat-cleared" }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.deliveryReport).toBeDefined();
      expect(data.deliveryReport.category).toBe("CLIENT_REPORT");
    });
  });

  // =========================================================================
  // 6. LIFECYCLE GATE: COMPLETION BLOCKED WITHOUT DELIVERY
  // =========================================================================
  describe("Lifecycle Gate: Project Completion Gate", () => {
    it("strictly blocks project completion when project status is not DELIVERED with HTTP 400", async () => {
      const { db } = await import("@/lib/db");
      const { POST } = await import("@/app/api/v1/admin/partner-projects/[id]/completion/route");

      (db.partnerProject.findUnique as any).mockResolvedValue({
        id: "proj-not-delivered",
        projectCode: "AXV-2026-011",
        status: "IN_PROGRESS",
      });

      const req = new NextRequest("http://localhost:3000/api/v1/admin/partner-projects/proj-not-delivered/completion", {
        method: "POST",
        headers: {
          "x-user-id": "admin-officer-id",
          "Content-Type": "application/json",
        },
      });

      const res = await POST(req, {
        params: Promise.resolve({ id: "proj-not-delivered" }),
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toMatch(/must be DELIVERED before it can be marked as COMPLETED/i);
    });

    it("successfully finalizes completion when project is DELIVERED", async () => {
      const { db } = await import("@/lib/db");
      const { POST } = await import("@/app/api/v1/admin/partner-projects/[id]/completion/route");

      (db.partnerProject.findUnique as any).mockResolvedValue({
        id: "proj-delivered-ready",
        projectCode: "AXV-2026-012",
        status: "DELIVERED",
      });

      (db.partnerProject.update as any).mockResolvedValue({
        id: "proj-delivered-ready",
        projectCode: "AXV-2026-012",
        status: "COMPLETED",
        completedAt: new Date(),
      });

      const req = new NextRequest("http://localhost:3000/api/v1/admin/partner-projects/proj-delivered-ready/completion", {
        method: "POST",
        headers: {
          "x-user-id": "admin-officer-id",
          "Content-Type": "application/json",
        },
      });

      const res = await POST(req, {
        params: Promise.resolve({ id: "proj-delivered-ready" }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.status).toBe("COMPLETED");
    });
  });

  // =========================================================================
  // 7. SLA & SETTLEMENT GATE: MANDATORY UTR
  // =========================================================================
  describe("Settlement Gate: Mandatory UTR for Commission Payout", () => {
    it("strictly requires Bank Transaction Reference (UTR) before marking commission as PAID", async () => {
      const { db } = await import("@/lib/db");
      const { PATCH } = await import("@/app/api/v1/admin/commissions/[id]/route");

      (db.commission.findUnique as any).mockResolvedValue({
        id: "comm-ready-payout",
        status: "REQUESTED",
        commissionAmount: 50000,
        brokerProfile: {
          userId: "broker-user-1",
          user: { name: "Ananya Roy", email: "ananya@royenterprises.com" },
        },
      });

      const req = new NextRequest("http://localhost:3000/api/v1/admin/commissions/comm-ready-payout", {
        method: "PATCH",
        headers: {
          "x-user-id": "admin-officer-id",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "pay",
          // Omitting payoutReference / UTR
        }),
      });

      const res = await PATCH(req, {
        params: Promise.resolve({ id: "comm-ready-payout" }),
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toMatch(/bank transaction reference \(UTR\) is strictly required/i);
    });

    it("settles commission to PAID when valid UTR is provided", async () => {
      const { db } = await import("@/lib/db");
      const { PATCH } = await import("@/app/api/v1/admin/commissions/[id]/route");

      (db.commission.findUnique as any).mockResolvedValue({
        id: "comm-ready-payout",
        status: "REQUESTED",
        commissionAmount: 50000,
        brokerProfile: {
          userId: "broker-user-1",
          user: { name: "Ananya Roy", email: "ananya@royenterprises.com" },
        },
      });

      const req = new NextRequest("http://localhost:3000/api/v1/admin/commissions/comm-ready-payout", {
        method: "PATCH",
        headers: {
          "x-user-id": "admin-officer-id",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "pay",
          payoutReference: "AXISB2026102198765432",
          notes: "Processed via Axis Corporate Portal",
        }),
      });

      const res = await PATCH(req, {
        params: Promise.resolve({ id: "comm-ready-payout" }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.payoutReference).toBe("AXISB2026102198765432");
      expect(db.commission.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: "PAID",
            payoutReference: "AXISB2026102198765432",
          }),
        })
      );
    });
  });

  // =========================================================================
  // 8. LIFECYCLE GUARD: CRM LEAD DUPLICATE CONVERSION REJECTION
  // =========================================================================
  describe("CRM Lead Duplicate Conversion Guard", () => {
    it("rejects duplicate conversion of already converted lead with HTTP 400", async () => {
      const { db } = await import("@/lib/db");
      const { POST } = await import("@/app/api/v1/crm/leads/[id]/convert/route");

      (db.lead.findUnique as any).mockResolvedValue({
        id: "lead-already-converted",
        status: "QUALIFIED",
        qualificationStatus: "QUALIFIED",
        convertedClientId: "client-existing-1",
      });

      const req = new NextRequest("http://localhost:3000/api/v1/crm/leads/lead-already-converted/convert", {
        method: "POST",
        headers: {
          "x-user-id": "admin-officer-id",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ createOpportunity: true }),
      });

      const res = await POST(req, {
        params: Promise.resolve({ id: "lead-already-converted" }),
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toMatch(/lead is already converted/i);
    });
  });

  // =========================================================================
  // 9. CLIENT ACTIVATION TOKEN SECURITY & SINGLE-USE ENFORCEMENT
  // =========================================================================
  describe("Client Activation Token Lifecycle", () => {
    it("rejects activation when token is invalid or already consumed with HTTP 400", async () => {
      const { db } = await import("@/lib/db");
      const { POST } = await import("@/app/api/v1/client/auth/activate/route");

      // User with this token not found (already activated or invalid)
      (db.user.findFirst as any).mockResolvedValue(null);

      const req = new NextRequest("http://localhost:3000/api/v1/client/auth/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: "consumed-token-1234567890",
          newPassword: "StrongPassword123!",
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toMatch(/invalid or expired activation token/i);
    });

    it("activates user, clears activationToken, invalidates sessions, and sets status to ACTIVE", async () => {
      const { db } = await import("@/lib/db");
      const { POST } = await import("@/app/api/v1/client/auth/activate/route");

      const mockPendingUser = {
        id: "client-user-pending-1",
        email: "client@acme.com",
        status: "PENDING_ACTIVATION",
        activationToken: "valid-secure-token-abcdef12345",
      };

      (db.user.findFirst as any).mockResolvedValue(mockPendingUser);
      (db.user.update as any).mockResolvedValue({
        ...mockPendingUser,
        status: "ACTIVE",
        activationToken: null,
      });

      const req = new NextRequest("http://localhost:3000/api/v1/client/auth/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: "valid-secure-token-abcdef12345",
          newPassword: "SecurePassword2026!",
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);

      // Verify that activationToken was cleared in update
      expect(db.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            activationToken: null,
            status: "ACTIVE",
            mustChangePassword: false,
          }),
        })
      );
      // Verify sessions were wiped
      expect(db.session.deleteMany).toHaveBeenCalledWith({
        where: { userId: "client-user-pending-1" },
      });
    });
  });

  // =========================================================================
  // 10. ADMIN PARTNER PROJECT QA STATUS ADVANCEMENT
  // =========================================================================
  describe("Admin Partner Project QA Status Advancement", () => {
    it("allows admin to advance project QA status to UAT_READY and UAT_APPROVED", async () => {
      const { db } = await import("@/lib/db");
      const { PATCH } = await import("@/app/api/v1/admin/partner-projects/[id]/route");

      (db.partnerProject.update as any).mockResolvedValue({
        id: "proj-101",
        qaStatus: "UAT_READY",
      });

      const req = new NextRequest("http://localhost:3000/api/v1/admin/partner-projects/proj-101", {
        method: "PATCH",
        headers: {
          "x-user-id": "admin-officer-id",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ qaStatus: "UAT_READY" }),
      });

      const res = await PATCH(req, {
        params: Promise.resolve({ id: "proj-101" }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(db.partnerProject.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ qaStatus: "UAT_READY" }),
        })
      );
    });

    it("rejects invalid qaStatus with HTTP 400", async () => {
      const { PATCH } = await import("@/app/api/v1/admin/partner-projects/[id]/route");

      const req = new NextRequest("http://localhost:3000/api/v1/admin/partner-projects/proj-101", {
        method: "PATCH",
        headers: {
          "x-user-id": "admin-officer-id",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ qaStatus: "INVALID_STATUS" }),
      });

      const res = await PATCH(req, {
        params: Promise.resolve({ id: "proj-101" }),
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toMatch(/invalid qaStatus/i);
    });
  });
});
