import { describe, it, expect, vi, beforeEach } from "vitest";

// ==========================================
// 1. Mocks & Fixtures Setup
// ==========================================

const mockAuditLogs: any[] = [];
let mockApplications: any[] = [];
let mockUsers: any[] = [];
let mockBrokerProfiles: any[] = [];
let mockSessions: any[] = [];
let mockLeads: any[] = [];
let mockProjects: any[] = [];
let mockCommissions: any[] = [];
let mockContracts: any[] = [];
let mockDocuments: any[] = [];

vi.mock("@/lib/auth/permissions", () => ({
  requirePermission: vi.fn().mockImplementation((userId: string, perm: string) => {
    if (!userId) {
      const err: any = new Error("Unauthorized");
      err.statusCode = 401;
      throw err;
    }
    if (userId === "unauthorized_user") {
      const err: any = new Error("Forbidden: Missing required permission " + perm);
      err.statusCode = 403;
      throw err;
    }
    return Promise.resolve({
      id: userId,
      email: "admin@axivon.com",
      name: "Admin Tester",
    });
  }),
  invalidateUserPermissionCache: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    $transaction: vi.fn().mockImplementation(async (callback) => {
      if (typeof callback === "function") {
        return callback({
          businessPartnerApplication: {
            delete: vi.fn().mockImplementation(({ where }) => {
              const idx = mockApplications.findIndex((a) => a.id === where.id);
              if (idx !== -1) {
                const removed = mockApplications.splice(idx, 1)[0];
                return Promise.resolve(removed);
              }
              return Promise.resolve(null);
            }),
            deleteMany: vi.fn().mockImplementation(({ where }) => {
              if (where.id?.in) {
                const before = mockApplications.length;
                mockApplications = mockApplications.filter((a) => !where.id.in.includes(a.id));
                return Promise.resolve({ count: before - mockApplications.length });
              }
              return Promise.resolve({ count: 0 });
            }),
          },
          applicationMeeting: {
            deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
          },
          partnerApplicationHistory: {
            deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
          },
          user: {
            update: vi.fn().mockImplementation(({ where, data }) => {
              const u = mockUsers.find((user) => user.id === where.id);
              if (u) {
                Object.assign(u, data);
                return Promise.resolve(u);
              }
              return Promise.resolve(null);
            }),
            delete: vi.fn().mockImplementation(({ where }) => {
              const idx = mockUsers.findIndex((u) => u.id === where.id);
              if (idx !== -1) {
                return Promise.resolve(mockUsers.splice(idx, 1)[0]);
              }
              return Promise.resolve(null);
            }),
          },
          brokerProfile: {
            delete: vi.fn().mockImplementation(({ where }) => {
              const idx = mockBrokerProfiles.findIndex((bp) => bp.id === where.id);
              if (idx !== -1) {
                return Promise.resolve(mockBrokerProfiles.splice(idx, 1)[0]);
              }
              return Promise.resolve(null);
            }),
          },
          session: {
            deleteMany: vi.fn().mockImplementation(({ where }) => {
              mockSessions = mockSessions.filter((s) => s.userId !== where.userId);
              return Promise.resolve({ count: 1 });
            }),
          },
          userRole: {
            deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
          },
          lead: {
            count: vi.fn().mockResolvedValue(0),
          },
          partnerProject: {
            count: vi.fn().mockResolvedValue(0),
          },
          organizationSetting: {
            deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
          },
          auditLog: {
            create: vi.fn().mockImplementation(({ data }) => {
              mockAuditLogs.push(data);
              return Promise.resolve({ id: "audit_" + Date.now(), ...data });
            }),
          },
        });
      }
      return Promise.resolve();
    }),
    businessPartnerApplication: {
      findUnique: vi.fn().mockImplementation(({ where }) => {
        return Promise.resolve(mockApplications.find((a) => a.id === where.id) || null);
      }),
      findFirst: vi.fn().mockImplementation(({ where }) => {
        if (where?.OR) {
          for (const cond of where.OR) {
            if (cond.id) {
              const match = mockApplications.find((a) => a.id === cond.id);
              if (match) return Promise.resolve(match);
            }
            if (cond.applicationId) {
              const match = mockApplications.find((a) => a.applicationId === cond.applicationId);
              if (match) return Promise.resolve(match);
            }
          }
        }
        if (where?.id) {
          return Promise.resolve(mockApplications.find((a) => a.id === where.id) || null);
        }
        return Promise.resolve(mockApplications[0] || null);
      }),
      findMany: vi.fn().mockImplementation(({ where }) => {
        if (where?.id?.in) {
          return Promise.resolve(mockApplications.filter((a) => where.id.in.includes(a.id)));
        }
        return Promise.resolve(mockApplications);
      }),
    },
    user: {
      findUnique: vi.fn().mockImplementation(({ where }) => {
        return Promise.resolve(mockUsers.find((u) => u.id === where.id || u.email === where.email) || null);
      }),
      findFirst: vi.fn().mockImplementation(({ where }) => {
        if (where?.email?.equals) {
          return Promise.resolve(
            mockUsers.find((u) => u.email.toLowerCase() === where.email.equals.toLowerCase()) || null
          );
        }
        if (where?.email) {
          return Promise.resolve(mockUsers.find((u) => u.email === where.email) || null);
        }
        if (where?.OR) {
          for (const cond of where.OR) {
            if (cond.id) {
              const match = mockUsers.find((u) => u.id === cond.id);
              if (match) return Promise.resolve(match);
            }
            if (cond.brokerProfile?.id) {
              const match = mockUsers.find((u) => u.brokerProfile?.id === cond.brokerProfile.id);
              if (match) return Promise.resolve(match);
            }
          }
        }
        return Promise.resolve(null);
      }),
      findMany: vi.fn().mockImplementation(({ where }) => {
        if (where?.email?.in) {
          return Promise.resolve(mockUsers.filter((u) => where.email.in.includes(u.email)));
        }
        return Promise.resolve(mockUsers);
      }),
    },
    lead: {
      count: vi.fn().mockImplementation(({ where }) => {
        const count = mockLeads.filter((l) => l.ownerId === where.ownerId).length;
        return Promise.resolve(count);
      }),
    },
    partnerProject: {
      count: vi.fn().mockImplementation(({ where }) => {
        const count = mockProjects.filter((p) => p.brokerProfileId === where.brokerProfileId).length;
        return Promise.resolve(count);
      }),
    },
    partnerContract: {
      count: vi.fn().mockImplementation(({ where }) => {
        const profileId = where?.partnerProject?.brokerProfileId;
        const count = mockContracts.filter((c) => c.brokerProfileId === profileId).length;
        return Promise.resolve(count);
      }),
    },
    commission: {
      count: vi.fn().mockImplementation(({ where }) => {
        let list = mockCommissions.filter((c) => c.brokerProfileId === where.brokerProfileId);
        if (where.status) list = list.filter((c) => c.status === where.status);
        return Promise.resolve(list.length);
      }),
    },
    partnerDocument: {
      count: vi.fn().mockImplementation(({ where }) => {
        const count = mockDocuments.filter((d) => d.brokerProfileId === where.brokerProfileId).length;
        return Promise.resolve(count);
      }),
    },
    partnerPayment: {
      count: vi.fn().mockResolvedValue(0),
    },
    crmClient: {
      count: vi.fn().mockResolvedValue(0),
    },
    auditLog: {
      create: vi.fn().mockImplementation(({ data }) => {
        mockAuditLogs.push(data);
        return Promise.resolve({ id: "audit_" + Date.now(), ...data });
      }),
    },
  },
}));

// Import target API routes
import { DELETE as deleteApplicationRoute } from "@/app/api/v1/admin/business-partner/applications/[id]/route";
import { POST as bulkDeleteApplicationsRoute } from "@/app/api/v1/admin/business-partner/applications/bulk-delete/route";
import { GET as getDependencyCheckRoute } from "@/app/api/v1/admin/brokers/[id]/dependency-check/route";
import { POST as deactivateBrokerRoute } from "@/app/api/v1/admin/brokers/[id]/deactivate/route";
import { DELETE as deleteBrokerRoute } from "@/app/api/v1/admin/brokers/[id]/route";

// ==========================================
// 2. Test Suite
// ==========================================

describe("Partner Application & Broker Account Deletion & Deactivation Suite", () => {
  beforeEach(() => {
    mockAuditLogs.length = 0;
    mockApplications = [
      {
        id: "app_1",
        applicationId: "APP-001",
        fullName: "Rohan Sharma",
        email: "rohan@example.com",
        status: "SUBMITTED",
        createdAt: new Date(),
      },
      {
        id: "app_2",
        applicationId: "APP-002",
        fullName: "Priya Patel",
        email: "priya@example.com",
        status: "APPROVED",
        createdAt: new Date(),
      },
    ];

    mockUsers = [
      {
        id: "user_broker_with_leads",
        email: "priya@example.com",
        name: "Priya Patel",
        status: "ACTIVE",
        userRoles: [{ role: { name: "BUSINESS_PARTNER" } }],
        brokerProfile: {
          id: "profile_with_leads",
          referralCode: "PRIYA10",
        },
      },
      {
        id: "user_clean_broker",
        email: "clean@partner.com",
        name: "Clean Partner",
        status: "ACTIVE",
        userRoles: [{ role: { name: "BUSINESS_PARTNER" } }],
        brokerProfile: {
          id: "profile_clean",
          referralCode: "CLEAN01",
        },
      },
      {
        id: "admin_user_id",
        email: "admin@axivon.com",
        name: "Admin User",
        status: "ACTIVE",
        userRoles: [{ role: { name: "ADMIN" } }],
        brokerProfile: null,
      },
    ];

    mockBrokerProfiles = [
      { id: "profile_with_leads", userId: "user_broker_with_leads", referralCode: "PRIYA10" },
      { id: "profile_clean", userId: "user_clean_broker", referralCode: "CLEAN01" },
    ];

    mockSessions = [
      { id: "sess_1", userId: "user_broker_with_leads" },
      { id: "sess_2", userId: "user_clean_broker" },
    ];

    mockLeads = [
      { id: "lead_1", ownerId: "user_broker_with_leads", name: "Client Lead 1" },
    ];

    mockProjects = [
      { id: "proj_1", brokerProfileId: "profile_with_leads", projectName: "Project Alpha" },
    ];

    mockCommissions = [
      { id: "comm_1", brokerProfileId: "profile_with_leads", amount: 15000, status: "PAID" },
    ];

    mockContracts = [];
    mockDocuments = [];
  });

  // -------------------------------------------------------------
  // Test 1: Single Partner Application Deletion
  // -------------------------------------------------------------
  it("should successfully delete a partner application with valid reason and record audit log", async () => {
    const req = new Request("http://localhost/api/v1/admin/business-partner/applications/app_1", {
      method: "DELETE",
      headers: { "x-user-id": "admin_user_id" },
      body: JSON.stringify({ reason: "Applicant submitted duplicate entry" }),
    });

    const res = await deleteApplicationRoute(req, {
      params: Promise.resolve({ id: "app_1" }),
    });

    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockApplications.some((a) => a.id === "app_1")).toBe(false);

    // Verify audit log creation
    const log = mockAuditLogs.find((l) => l.action === "BUSINESS_PARTNER_APPLICATION_DELETED");
    expect(log).toBeDefined();
    expect(log.details.reason).toBe("Applicant submitted duplicate entry");
  });

  it("should safely delete application without deleting associated broker user account", async () => {
    // app_2 has matching email with user_broker_with_leads
    const req = new Request("http://localhost/api/v1/admin/business-partner/applications/app_2", {
      method: "DELETE",
      headers: { "x-user-id": "admin_user_id" },
      body: JSON.stringify({ reason: "Application archived after onboarding" }),
    });

    const res = await deleteApplicationRoute(req, {
      params: Promise.resolve({ id: "app_2" }),
    });

    const data = await res.json();
    expect(res.status).toBe(200);
    expect(mockApplications.some((a) => a.id === "app_2")).toBe(false);

    // Assert broker account remains intact
    const brokerUser = mockUsers.find((u) => u.email === "priya@example.com");
    expect(brokerUser).toBeDefined();
    expect(brokerUser.status).toBe("ACTIVE");
    expect(data.linkedBrokerPreserved).toBe(true);
  });

  it("should enforce RBAC and reject unauthorized application deletion with 403", async () => {
    const req = new Request("http://localhost/api/v1/admin/business-partner/applications/app_1", {
      method: "DELETE",
      headers: { "x-user-id": "unauthorized_user" },
      body: JSON.stringify({ reason: "Unauthorized attempt" }),
    });

    const res = await deleteApplicationRoute(req, {
      params: Promise.resolve({ id: "app_1" }),
    });

    expect(res.status).toBe(403);
  });

  // -------------------------------------------------------------
  // Test 2: Bulk Partner Applications Deletion
  // -------------------------------------------------------------
  it("should bulk delete applications safely and return deletedCount", async () => {
    const req = new Request("http://localhost/api/v1/admin/business-partner/applications/bulk-delete", {
      method: "POST",
      headers: { "x-user-id": "admin_user_id" },
      body: JSON.stringify({
        applicationIds: ["app_1", "app_2"],
        reason: "Periodic purge of obsolete application forms",
      }),
    });

    const res = await bulkDeleteApplicationsRoute(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.deletedCount).toBe(2);
    expect(mockApplications.length).toBe(0);
  });

  // -------------------------------------------------------------
  // Test 3: Broker Dependency Check
  // -------------------------------------------------------------
  it("should report canPermanentlyDelete = false for broker with leads and projects", async () => {
    const req = new Request("http://localhost/api/v1/admin/brokers/user_broker_with_leads/dependency-check", {
      method: "GET",
      headers: { "x-user-id": "admin_user_id" },
    });

    const res = await getDependencyCheckRoute(req, {
      params: Promise.resolve({ id: "user_broker_with_leads" }),
    });

    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.data.canPermanentlyDelete).toBe(false);
    expect(data.data.counts.leads).toBe(1);
    expect(data.data.counts.projects).toBe(1);
    expect(data.data.counts.commissions).toBe(1);
  });

  it("should report canPermanentlyDelete = true for broker with zero dependencies", async () => {
    const req = new Request("http://localhost/api/v1/admin/brokers/user_clean_broker/dependency-check", {
      method: "GET",
      headers: { "x-user-id": "admin_user_id" },
    });

    const res = await getDependencyCheckRoute(req, {
      params: Promise.resolve({ id: "user_clean_broker" }),
    });

    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.data.canPermanentlyDelete).toBe(true);
    expect(data.data.counts.total).toBe(0);
  });

  // -------------------------------------------------------------
  // Test 4: Broker Safe Deactivation (Option A)
  // -------------------------------------------------------------
  it("should deactivate broker, revoke sessions, preserve business records and log audit", async () => {
    const req = new Request("http://localhost/api/v1/admin/brokers/user_broker_with_leads/deactivate", {
      method: "POST",
      headers: { "x-user-id": "admin_user_id" },
      body: JSON.stringify({ reason: "Partner agreement expired by mutual consent" }),
    });

    const res = await deactivateBrokerRoute(req, {
      params: Promise.resolve({ id: "user_broker_with_leads" }),
    });

    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);

    const broker = mockUsers.find((u) => u.id === "user_broker_with_leads");
    expect(broker.status).toBe("INACTIVE");

    // Check sessions revoked
    expect(mockSessions.some((s) => s.userId === "user_broker_with_leads")).toBe(false);

    // Business records preserved
    expect(mockLeads.some((l) => l.ownerId === "user_broker_with_leads")).toBe(true);
    expect(mockProjects.some((p) => p.brokerProfileId === "profile_with_leads")).toBe(true);

    // Audit log recorded
    const log = mockAuditLogs.find((l) => l.action === "BROKER_DEACTIVATED");
    expect(log).toBeDefined();
    expect(log.details.reason).toBe("Partner agreement expired by mutual consent");
  });

  // -------------------------------------------------------------
  // Test 5: Broker Permanent Deletion (Option B) Safeguards
  // -------------------------------------------------------------
  it("should STRICTLY BLOCK permanent deletion when broker has business records", async () => {
    const req = new Request("http://localhost/api/v1/admin/brokers/user_broker_with_leads", {
      method: "DELETE",
      headers: { "x-user-id": "admin_user_id" },
      body: JSON.stringify({
        reason: "Admin wants to delete broker with leads",
        confirmationWord: "DELETE",
      }),
    });

    const res = await deleteBrokerRoute(req, {
      params: Promise.resolve({ id: "user_broker_with_leads" }),
    });

    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error).toBe("CANNOT_DELETE_HAS_DEPENDENCIES");
    expect(data.dependencies.total).toBeGreaterThan(0);

    // Verify account and business records were NOT deleted
    expect(mockUsers.some((u) => u.id === "user_broker_with_leads")).toBe(true);
    expect(mockLeads.length).toBe(1);
    expect(mockProjects.length).toBe(1);
  });

  it("should allow permanent deletion when broker has ZERO dependencies", async () => {
    const req = new Request("http://localhost/api/v1/admin/brokers/user_clean_broker", {
      method: "DELETE",
      headers: { "x-user-id": "admin_user_id" },
      body: JSON.stringify({
        reason: "Test account registered in error, zero records",
        confirmationWord: "DELETE",
      }),
    });

    const res = await deleteBrokerRoute(req, {
      params: Promise.resolve({ id: "user_clean_broker" }),
    });

    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);

    // Verify user and broker profile are removed
    expect(mockUsers.some((u) => u.id === "user_clean_broker")).toBe(false);
    expect(mockBrokerProfiles.some((bp) => bp.id === "profile_clean")).toBe(false);

    // Verify audit log
    const log = mockAuditLogs.find((l) => l.action === "BROKER_PERMANENTLY_DELETED");
    expect(log).toBeDefined();
    expect(log.details.deletedBrokerEmail).toBe("clean@partner.com");
  });
});
