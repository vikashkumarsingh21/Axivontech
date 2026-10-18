import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock database
vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    userRole: {
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
    },
    role: {
      findUnique: vi.fn().mockResolvedValue({ id: "role-client", name: "CLIENT" }),
    },
    partnerProject: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    partnerProjectMilestone: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    partnerDocument: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
    partnerPayment: {
      findMany: vi.fn(),
    },
    qaIssue: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    notification: {
      findMany: vi.fn(),
      create: vi.fn(),
      createMany: vi.fn(),
      update: vi.fn(),
    },
    auditLog: {
      create: vi.fn().mockResolvedValue({ id: "audit-1" }),
    },
    session: {
      deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    crmClient: {
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    $transaction: vi.fn().mockImplementation(async (callback) => {
      return callback(db);
    }),
  },
}));

import { db } from "@/lib/db";
import { GET as getClientProjects } from "@/app/api/v1/client/projects/route";
import { GET as getClientProjectDetail } from "@/app/api/v1/client/projects/[id]/route";
import { GET as getClientDocuments } from "@/app/api/v1/client/documents/route";
import { GET as getClientUat } from "@/app/api/v1/client/uat/route";
import { POST as approveClientUat } from "@/app/api/v1/client/projects/[id]/uat/route";
import { GET as getClientInvoices } from "@/app/api/v1/client/invoices/route";
import { GET as getClientSupport, POST as createClientSupport } from "@/app/api/v1/client/support/route";
import { GET as getClientMe, PATCH as updateClientMe } from "@/app/api/v1/client/me/route";
import { POST as activateClientAccount } from "@/app/api/v1/client/auth/activate/route";
import { NextRequest } from "next/server";

describe("Step 7: Client Experience & Client Portal Verification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /* =========================================================================
     1. Scenario A: Client Access & Tenant Isolation
     ========================================================================= */
  describe("Scenario A: Client Project Access & Isolation", () => {
    it("should reject unauthenticated request with HTTP 401", async () => {
      const req = new NextRequest("http://localhost/api/v1/client/projects");
      const res = await getClientProjects(req);
      expect(res.status).toBe(401);
    });

    it("should reject non-CLIENT roles from accessing client project directory", async () => {
      const req = new NextRequest("http://localhost/api/v1/client/projects", {
        headers: {
          "x-user-id": "emp-1",
          "x-user-role": "EMPLOYEE",
        },
      });
      const res = await getClientProjects(req);
      expect(res.status).toBe(401);
    });

    it("should return only projects assigned to authenticated client", async () => {
      const mockProjects = [
        {
          id: "proj-1",
          projectCode: "PRJ-001",
          projectName: "Enterprise FinTech Suite",
          status: "IN_PROGRESS",
          progressPercentage: 65,
        },
      ];

      (db.user.findUnique as any).mockResolvedValueOnce({
        id: "client-1",
        status: "ACTIVE",
      });
      (db.partnerProject.findMany as any).mockResolvedValueOnce(mockProjects);

      const req = new NextRequest("http://localhost/api/v1/client/projects", {
        headers: {
          "x-user-id": "client-1",
          "x-user-role": "CLIENT",
        },
      });

      const res = await getClientProjects(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data).toEqual(mockProjects);
      expect(db.partnerProject.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { clientUserId: "client-1" },
        })
      );
    });

    it("should reject access to a project belonging to a different client (IDOR defense)", async () => {
      (db.user.findUnique as any).mockResolvedValueOnce({
        id: "client-attacker",
        status: "ACTIVE",
      });
      // Database returns null because clientUserId doesn't match
      (db.partnerProject.findFirst as any).mockResolvedValueOnce(null);

      const req = new NextRequest("http://localhost/api/v1/client/projects/proj-victim", {
        headers: {
          "x-user-id": "client-attacker",
          "x-user-role": "CLIENT",
        },
      });

      const res = await getClientProjectDetail(req, {
        params: Promise.resolve({ id: "proj-victim" }),
      });

      expect(res.status).toBe(404);
      expect(db.partnerProject.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: "proj-victim",
            clientUserId: "client-attacker",
          },
        })
      );
    });
  });

  /* =========================================================================
     2. Scenario C: Milestone Visibility
     ========================================================================= */
  describe("Scenario C: Milestone Delivery & Visibility Controls", () => {
    it("should retrieve project workspace with only client-visible milestones", async () => {
      const mockWorkspace = {
        id: "proj-1",
        projectCode: "PRJ-001",
        projectName: "Enterprise FinTech Suite",
        status: "IN_PROGRESS",
        milestones: [
          { id: "m-1", title: "Architecture Blueprint", status: "COMPLETED", order: 1 },
          { id: "m-2", title: "Core Engine API", status: "IN_PROGRESS", order: 2 },
        ],
        documents: [],
        team: [],
      };

      (db.user.findUnique as any).mockResolvedValueOnce({
        id: "client-1",
        status: "ACTIVE",
      });
      (db.partnerProject.findFirst as any).mockResolvedValueOnce(mockWorkspace);

      const req = new NextRequest("http://localhost/api/v1/client/projects/proj-1", {
        headers: {
          "x-user-id": "client-1",
          "x-user-role": "CLIENT",
        },
      });

      const res = await getClientProjectDetail(req, {
        params: Promise.resolve({ id: "proj-1" }),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.milestones.length).toBe(2);
      expect(db.partnerProject.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          select: expect.objectContaining({
            milestones: expect.objectContaining({
              where: { isClientVisible: true },
            }),
          }),
        })
      );
    });
  });

  /* =========================================================================
     3. Scenario D: Deliverables & UAT Signoff Workflow
     ========================================================================= */
  describe("Scenario D: Deliverables & UAT Signoff", () => {
    it("should fetch published deliverables awaiting UAT across client projects", async () => {
      const mockUatProjects = [
        {
          id: "proj-1",
          projectCode: "PRJ-001",
          qaStatus: "UAT_READY",
          documents: [
            {
              id: "deliv-1",
              title: "Sprint 2 Release Package",
              category: "CLIENT_DELIVERABLE",
            },
          ],
        },
      ];

      (db.user.findUnique as any).mockResolvedValueOnce({
        id: "client-1",
        status: "ACTIVE",
      });
      (db.partnerProject.findMany as any).mockResolvedValueOnce(mockUatProjects);

      const req = new NextRequest("http://localhost/api/v1/client/uat", {
        headers: {
          "x-user-id": "client-1",
          "x-user-role": "CLIENT",
        },
      });

      const res = await getClientUat(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data[0].qaStatus).toBe("UAT_READY");
      expect(json.data[0].documents.length).toBe(1);
    });

    it("should record client UAT approval and log audit event", async () => {
      const mockProject = {
        id: "proj-1",
        projectCode: "PRJ-001",
        clientUserId: "client-1",
        qaStatus: "UAT_READY",
      };

      (db.partnerProject.findUnique as any).mockResolvedValueOnce(mockProject);
      (db.partnerProject.update as any).mockResolvedValueOnce({
        ...mockProject,
        qaStatus: "UAT_APPROVED",
      });

      const req = new NextRequest("http://localhost/api/v1/client/projects/proj-1/uat", {
        method: "POST",
        headers: {
          "x-user-id": "client-1",
          "x-user-role": "CLIENT",
        },
      });

      const res = await approveClientUat(req, {
        params: Promise.resolve({ id: "proj-1" }),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.qaStatus).toBe("UAT_APPROVED");
      expect(db.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: "UAT_APPROVED",
            userId: "client-1",
          }),
        })
      );
    });
  });

  /* =========================================================================
     4. Scenario E: Document Vault Permissions
     ========================================================================= */
  describe("Scenario E: Document Vault & Isolation", () => {
    it("should fetch client-visible documents filtered by category", async () => {
      (db.user.findUnique as any).mockResolvedValueOnce({
        id: "client-1",
        status: "ACTIVE",
      });
      (db.partnerDocument.findMany as any).mockResolvedValueOnce([
        {
          id: "doc-1",
          title: "Architecture Specification",
          category: "PROJECT_DOCS",
          isClientVisible: true,
        },
      ]);

      const req = new NextRequest(
        "http://localhost/api/v1/client/documents?category=PROJECT_DOCS",
        {
          headers: {
            "x-user-id": "client-1",
            "x-user-role": "CLIENT",
          },
        }
      );

      const res = await getClientDocuments(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.length).toBe(1);
      expect(db.partnerDocument.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isClientVisible: true,
            category: "PROJECT_DOCS",
            partnerProject: { clientUserId: "client-1" },
          }),
        })
      );
    });
  });

  /* =========================================================================
     5. Scenario F: Client Support Requests
     ========================================================================= */
  describe("Scenario F: Client Support Tickets & Helpdesk", () => {
    it("should allow a client to submit a support inquiry and notify internal admins", async () => {
      (db.user.findUnique as any).mockResolvedValueOnce({
        id: "client-1",
        name: "Acme Corp Lead",
        status: "ACTIVE",
      });
      (db.partnerProject.findFirst as any).mockResolvedValueOnce({
        id: "proj-1",
        clientUserId: "client-1",
      });
      (db.qaIssue.create as any).mockResolvedValueOnce({
        id: "issue-101",
        title: "Test payment callback in staging",
        severity: "HIGH",
        status: "OPEN",
        partnerProject: {
          id: "proj-1",
          projectCode: "PRJ-001",
          projectName: "FinTech App",
        },
      });
      (db.userRole.findMany as any).mockResolvedValueOnce([
        { userId: "admin-1" },
        { userId: "admin-2" },
      ]);

      const req = new NextRequest("http://localhost/api/v1/client/support", {
        method: "POST",
        headers: {
          "x-user-id": "client-1",
          "x-user-role": "CLIENT",
        },
        body: JSON.stringify({
          projectId: "proj-1",
          subject: "Test payment callback in staging",
          message: "Encountering error code 502 during staging verification.",
          priority: "HIGH",
        }),
      });

      const res = await createClientSupport(req);
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.data.id).toBe("issue-101");
      expect(db.notification.createMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.arrayContaining([
            expect.objectContaining({
              userId: "admin-1",
              type: "WARNING",
            }),
          ]),
        })
      );
    });

    it("should retrieve support inquiry history for the authenticated client", async () => {
      (db.user.findUnique as any).mockResolvedValueOnce({
        id: "client-1",
        status: "ACTIVE",
      });
      (db.qaIssue.findMany as any).mockResolvedValueOnce([
        {
          id: "issue-101",
          title: "Test payment callback in staging",
          status: "OPEN",
        },
      ]);

      const req = new NextRequest("http://localhost/api/v1/client/support", {
        headers: {
          "x-user-id": "client-1",
          "x-user-role": "CLIENT",
        },
      });

      const res = await getClientSupport(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.length).toBe(1);
    });
  });

  /* =========================================================================
     6. Scenario G: Client Account Activation
     ========================================================================= */
  describe("Scenario G: Client Account Activation", () => {
    it("should activate pending client account with valid token and password", async () => {
      const mockPendingUser = {
        id: "client-new",
        email: "partner@client.com",
        status: "PENDING_ACTIVATION",
        activationToken: "valid-activation-token-1234567890",
      };

      (db.user.findFirst as any).mockResolvedValueOnce(mockPendingUser);
      (db.user.update as any).mockResolvedValueOnce({
        ...mockPendingUser,
        status: "ACTIVE",
        activationToken: null,
      });

      const req = new NextRequest("http://localhost/api/v1/client/auth/activate", {
        method: "POST",
        body: JSON.stringify({
          token: "valid-activation-token-1234567890",
          newPassword: "SecurePassword123!",
        }),
      });

      const res = await activateClientAccount(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(db.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: "CLIENT_ACCOUNT_ACTIVATED",
          }),
        })
      );
    });
  });

  /* =========================================================================
     7. Scenario I & J: Financial Overview & Profile Management
     ========================================================================= */
  describe("Scenario I & J: Financial Scope Control & Account Settings", () => {
    it("should fetch authorized client payments and contract records", async () => {
      (db.user.findUnique as any).mockResolvedValueOnce({
        id: "client-1",
        status: "ACTIVE",
      });
      (db.partnerPayment.findMany as any).mockResolvedValueOnce([
        {
          id: "pay-1",
          projectPrice: 500000,
          advanceAmount: 200000,
          remainingAmount: 300000,
          currency: "INR",
          status: "VERIFIED",
          partnerProject: {
            id: "proj-1",
            projectCode: "PRJ-001",
            projectName: "FinTech Platform",
          },
        },
      ]);

      const req = new NextRequest("http://localhost/api/v1/client/invoices", {
        headers: {
          "x-user-id": "client-1",
          "x-user-role": "CLIENT",
        },
      });

      const res = await getClientInvoices(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.length).toBe(1);
      expect(json.data[0].status).toBe("VERIFIED");
    });

    it("should allow client to update non-sensitive profile contact information", async () => {
      (db.user.findUnique as any).mockResolvedValueOnce({
        id: "client-1",
        status: "ACTIVE",
      });
      (db.user.update as any).mockResolvedValueOnce({
        id: "client-1",
        name: "Client Lead",
        phone: "+91 98765 43210",
        address: "DLF Cyber City, Tower B, Gurugram",
        status: "ACTIVE",
      });

      const req = new NextRequest("http://localhost/api/v1/client/me", {
        method: "PATCH",
        headers: {
          "x-user-id": "client-1",
          "x-user-role": "CLIENT",
        },
        body: JSON.stringify({
          phone: "+91 98765 43210",
          address: "DLF Cyber City, Tower B, Gurugram",
        }),
      });

      const res = await updateClientMe(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.phone).toBe("+91 98765 43210");
      expect(db.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "client-1" },
          data: {
            phone: "+91 98765 43210",
            address: "DLF Cyber City, Tower B, Gurugram",
          },
        })
      );
    });
  });
});
