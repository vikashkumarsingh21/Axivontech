import { describe, it, expect, vi, beforeEach } from "vitest";
import { DELETE as singleDelete } from "@/app/api/v1/crm/leads/[id]/route";
import { DELETE as bulkDelete } from "@/app/api/v1/crm/leads/route";
import { NextRequest } from "next/server";

// Mock DB and permissions
vi.mock("@/lib/auth/permissions", () => ({
  requirePermission: vi.fn().mockImplementation((userId: string | null) => {
    if (!userId) {
      const err: any = new Error("Unauthorized");
      err.statusCode = 401;
      throw err;
    }
    return Promise.resolve({
      id: userId,
      email: "admin@axivon.dev",
      name: "Admin User",
    });
  }),
}));

const mockAuditLogs: any[] = [];
let mockLeads: any[] = [];
let mockActivities: any[] = [];
let mockFollowUps: any[] = [];
let mockNotes: any[] = [];
let mockMeetings: any[] = [];
let mockOpportunities: any[] = [];
let mockProjects: any[] = [];

vi.mock("@/lib/db", () => {
  return {
    db: {
      $transaction: vi.fn().mockImplementation(async (callback) => {
        if (typeof callback === "function") {
          return callback({
            leadActivity: {
              deleteMany: vi.fn().mockImplementation(({ where }) => {
                if (where.leadId?.in) {
                  mockActivities = mockActivities.filter((a) => !where.leadId.in.includes(a.leadId));
                } else if (where.leadId) {
                  mockActivities = mockActivities.filter((a) => a.leadId !== where.leadId);
                }
                return Promise.resolve({ count: 1 });
              }),
            },
            followUp: {
              deleteMany: vi.fn().mockImplementation(({ where }) => {
                if (where.leadId?.in) {
                  mockFollowUps = mockFollowUps.filter((f) => !where.leadId.in.includes(f.leadId));
                } else if (where.leadId) {
                  mockFollowUps = mockFollowUps.filter((f) => f.leadId !== where.leadId);
                }
                return Promise.resolve({ count: 1 });
              }),
            },
            leadNote: {
              deleteMany: vi.fn().mockImplementation(({ where }) => {
                if (where.leadId?.in) {
                  mockNotes = mockNotes.filter((n) => !where.leadId.in.includes(n.leadId));
                } else if (where.leadId) {
                  mockNotes = mockNotes.filter((n) => n.leadId !== where.leadId);
                }
                return Promise.resolve({ count: 1 });
              }),
            },
            leadMeeting: {
              deleteMany: vi.fn().mockImplementation(({ where }) => {
                if (where.leadId?.in) {
                  mockMeetings = mockMeetings.filter((m) => !where.leadId.in.includes(m.leadId));
                } else if (where.leadId) {
                  mockMeetings = mockMeetings.filter((m) => m.leadId !== where.leadId);
                }
                return Promise.resolve({ count: 0 });
              }),
            },
            opportunity: {
              updateMany: vi.fn().mockImplementation(({ where, data }) => {
                const targetIds = where.leadId?.in ? where.leadId.in : [where.leadId];
                mockOpportunities.forEach((op) => {
                  if (targetIds.includes(op.leadId)) {
                    op.leadId = data.leadId;
                  }
                });
                return Promise.resolve({ count: targetIds.length });
              }),
            },
            partnerProject: {
              updateMany: vi.fn().mockImplementation(({ where, data }) => {
                const targetIds = where.leadId?.in ? where.leadId.in : [where.leadId];
                mockProjects.forEach((p) => {
                  if (targetIds.includes(p.leadId)) {
                    p.leadId = data.leadId;
                  }
                });
                return Promise.resolve({ count: targetIds.length });
              }),
            },
            lead: {
              delete: vi.fn().mockImplementation(({ where }) => {
                const idx = mockLeads.findIndex((l) => l.id === where.id);
                if (idx !== -1) {
                  const deleted = mockLeads.splice(idx, 1)[0];
                  return Promise.resolve(deleted);
                }
                return Promise.resolve(null);
              }),
              deleteMany: vi.fn().mockImplementation(({ where }) => {
                const initialCount = mockLeads.length;
                mockLeads = mockLeads.filter((l) => !where.id.in.includes(l.id));
                return Promise.resolve({ count: initialCount - mockLeads.length });
              }),
            },
            auditLog: {
              create: vi.fn().mockImplementation(({ data }) => {
                mockAuditLogs.push(data);
                return Promise.resolve(data);
              }),
            },
          });
        }
        return Promise.all(callback);
      }),
      lead: {
        findUnique: vi.fn().mockImplementation(({ where }) => {
          return Promise.resolve(mockLeads.find((l) => l.id === where.id) || null);
        }),
      },
    },
  };
});

describe("CRM Lead Deletion System", () => {
  beforeEach(() => {
    mockAuditLogs.length = 0;
    mockLeads = [
      {
        id: "lead-wrong-1",
        leadCode: "LD-20261026-0001",
        name: "Jane Doe Client (Duplicate)",
        email: "client.lead.1@axivon.test",
        companyName: "Acme Corp",
      },
      {
        id: "lead-wrong-2",
        leadCode: "LD-20261026-0002",
        name: "Jane Doe Client 2",
        email: "client.lead.2@axivon.test",
        companyName: "Acme Corp",
      },
    ];
    mockActivities = [{ id: "act-1", leadId: "lead-wrong-1", activityType: "CREATED" }];
    mockFollowUps = [{ id: "fu-1", leadId: "lead-wrong-1", type: "CALL" }];
    mockNotes = [{ id: "n-1", leadId: "lead-wrong-1", content: "Test note" }];
    mockMeetings = [];
    mockOpportunities = [{ id: "opp-1", leadId: "lead-wrong-1", name: "Big Deal" }];
    mockProjects = [{ id: "proj-1", leadId: "lead-wrong-1", name: "Website Rebuild" }];
  });

  describe("Single Lead Deletion (DELETE /api/v1/crm/leads/[id])", () => {
    it("successfully deletes an erroneous lead with all associated sub-records", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/crm/leads/lead-wrong-1", {
        method: "DELETE",
        headers: { "x-user-id": "admin-user-id" },
      });

      const res = await singleDelete(req, {
        params: Promise.resolve({ id: "lead-wrong-1" }),
      });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain("LD-20261026-0001");

      // Verify cascading removals
      expect(mockLeads.find((l) => l.id === "lead-wrong-1")).toBeUndefined();
      expect(mockActivities.length).toBe(0);
      expect(mockFollowUps.length).toBe(0);
      expect(mockNotes.length).toBe(0);

      // Verify unlinking from projects/opportunities
      expect(mockOpportunities[0].leadId).toBeNull();
      expect(mockProjects[0].leadId).toBeNull();

      // Verify Audit Log was recorded
      expect(mockAuditLogs.some((log) => log.action === "CRM_LEAD_DELETED")).toBe(true);
    });

    it("returns 404 ApiError when lead to delete does not exist", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/crm/leads/non-existent-lead", {
        method: "DELETE",
        headers: { "x-user-id": "admin-user-id" },
      });

      const res = await singleDelete(req, {
        params: Promise.resolve({ id: "non-existent-lead" }),
      });
      const data = await res.json();

      expect(res.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.message).toBe("Lead not found");
    });
  });

  describe("Bulk Lead Deletion (DELETE /api/v1/crm/leads)", () => {
    it("successfully deletes multiple selected erroneous leads at once", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/crm/leads", {
        method: "DELETE",
        headers: { "x-user-id": "admin-user-id", "content-type": "application/json" },
        body: JSON.stringify({ leadIds: ["lead-wrong-1", "lead-wrong-2"] }),
      });

      const res = await bulkDelete(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.deletedCount).toBe(2);
      expect(mockLeads.length).toBe(0);

      // Verify bulk audit log recorded
      expect(mockAuditLogs.some((log) => log.action === "CRM_LEADS_BULK_DELETED")).toBe(true);
    });

    it("rejects request if leadIds is empty or invalid", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/crm/leads", {
        method: "DELETE",
        headers: { "x-user-id": "admin-user-id", "content-type": "application/json" },
        body: JSON.stringify({ leadIds: [] }),
      });

      const res = await bulkDelete(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });
});
