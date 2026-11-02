import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST as registerLead } from "@/app/api/v1/broker/leads/create/route";
import { POST as uploadLeadDoc } from "@/app/api/v1/broker/leads/upload/route";
import { GET as getCrmLead } from "@/app/api/v1/crm/leads/[id]/route";
import { createUnifiedLeadSchema } from "@/app/api/v1/broker/leads/create/route";
import { NextRequest } from "next/server";

// Mock authentication & authorization
let mockSessionUser: any = {
  id: "broker-user-123",
  email: "broker@partner.dev",
  name: "Active Broker",
  role: "BROKER",
  status: "ACTIVE",
};

vi.mock("@/lib/auth/session", () => ({
  getAuthenticatedSession: vi.fn().mockImplementation(() => {
    if (!mockSessionUser) return Promise.resolve(null);
    return Promise.resolve({
      userId: mockSessionUser.id,
      email: mockSessionUser.email,
      name: mockSessionUser.name,
      role: mockSessionUser.role,
      status: mockSessionUser.status,
    });
  }),
}));

vi.mock("@/lib/api/broker", async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    requireBroker: vi.fn().mockImplementation(() => {
      if (!mockSessionUser) {
        const err: any = new Error("Authentication required.");
        err.statusCode = 401;
        throw err;
      }
      return Promise.resolve({
        userId: mockSessionUser.id,
        brokerId: "broker-profile-456",
        broker: { id: "broker-profile-456", userId: mockSessionUser.id, status: "ACTIVE" },
      });
    }),
    logBrokerAudit: vi.fn().mockResolvedValue(true),
    notifyAdmins: vi.fn().mockResolvedValue(true),
    checkRateLimit: vi.fn(),
  };
});

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
      name: "Admin Officer",
      role: "ADMIN",
    });
  }),
}));

// In-memory data store for tests
let leadsDb: any[] = [];
let documentsDb: any[] = [];
const brokerProfilesDb: any[] = [
  {
    id: "broker-profile-456",
    userId: "broker-user-123",
    partnerId: "PTN-2026-0042",
    referralCode: "AXV-REF-0042",
    companyName: "Premier Tech Brokers",
  },
];

vi.mock("@/lib/db", () => ({
  db: {
    lead: {
      count: vi.fn().mockImplementation(() => Promise.resolve(leadsDb.length)),
      findFirst: vi.fn().mockImplementation(({ where }) => {
        const match = leadsDb.find((l) => {
          if (where.id && l.id !== where.id) return false;
          if (where.email && l.email.toLowerCase() === where.email.toLowerCase()) return true;
          if (where.phone && l.phone === where.phone) return true;
          if (where.OR) {
            return where.OR.some((cond: any) => {
              if (cond.email) {
                const targetEmail = typeof cond.email === "object" ? cond.email.equals : cond.email;
                if (targetEmail && l.email.toLowerCase() === targetEmail.toLowerCase()) return true;
              }
              if (cond.phone) {
                const targetPhone = typeof cond.phone === "object" ? cond.phone.equals : cond.phone;
                if (targetPhone && l.phone === targetPhone) return true;
              }
              return false;
            });
          }
          return false;
        });
        return Promise.resolve(match || null);
      }),
      findUnique: vi.fn().mockImplementation(({ where, include }) => {
        const lead = leadsDb.find((l) => l.id === where.id);
        if (!lead) return Promise.resolve(null);
        const result = { ...lead };
        if (include?.owner) {
          result.owner = {
            id: mockSessionUser.id,
            name: mockSessionUser.name,
            email: mockSessionUser.email,
            brokerProfile: brokerProfilesDb[0],
          };
        }
        if (include?.convertedProject) {
          result.convertedProject = null;
        }
        return Promise.resolve(result);
      }),
      create: vi.fn().mockImplementation(({ data }) => {
        const newLead = {
          id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          leadCode: `LD-20261101-${Math.floor(1000 + Math.random() * 9000)}`,
          createdAt: new Date(),
          updatedAt: new Date(),
          ...data,
        };
        leadsDb.push(newLead);
        return Promise.resolve(newLead);
      }),
    },
    partnerDocument: {
      create: vi.fn().mockImplementation(({ data }) => {
        const newDoc = {
          id: `doc_${Date.now()}`,
          createdAt: new Date(),
          ...data,
        };
        documentsDb.push(newDoc);
        return Promise.resolve(newDoc);
      }),
      findMany: vi.fn().mockImplementation(({ where }) => {
        const results = documentsDb.filter((d) => {
          if (where.description?.contains) {
            return d.description?.includes(where.description.contains);
          }
          return true;
        });
        return Promise.resolve(results);
      }),
    },
    brokerProfile: {
      findUnique: vi.fn().mockImplementation(({ where }) => {
        const bp = brokerProfilesDb.find((b) => b.userId === where.userId);
        return Promise.resolve(bp || null);
      }),
    },
    $transaction: vi.fn().mockImplementation(async (arg) => {
      if (typeof arg === "function") {
        return arg({
          lead: {
            create: vi.fn().mockImplementation(({ data }) => {
              const newLead = {
                id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                leadCode: `LD-20261101-${Math.floor(1000 + Math.random() * 9000)}`,
                createdAt: new Date(),
                updatedAt: new Date(),
                ...data,
              };
              leadsDb.push(newLead);
              return Promise.resolve(newLead);
            }),
          },
          partnerDocument: {
            create: vi.fn().mockImplementation(({ data }) => {
              const newDoc = {
                id: `doc_${Date.now()}`,
                createdAt: new Date(),
                userId: data.uploadedById || data.userId,
                documentType: data.title || data.documentType,
                ...data,
              };
              documentsDb.push(newDoc);
              return Promise.resolve(newDoc);
            }),
          },
          leadActivity: {
            create: vi.fn().mockResolvedValue({ id: "act_1" }),
          },
          auditLog: {
            create: vi.fn().mockResolvedValue({ id: "audit_1" }),
          },
        });
      }
      return Promise.all(arg);
    }),
  },
}));

describe("Unified Lead Registration System", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    leadsDb = [];
    documentsDb = [];
    mockSessionUser = {
      id: "broker-user-123",
      email: "broker@partner.dev",
      name: "Active Broker",
      role: "BROKER",
      status: "ACTIVE",
    };
  });

  describe("Schema Validation (createUnifiedLeadSchema)", () => {
    it("validates that required client fields are present", () => {
      const invalidPayload = {
        name: "",
        email: "not-an-email",
        phone: "",
        serviceInterest: "",
      };
      const result = createUnifiedLeadSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
      if (!result.success) {
        const fieldErrors = result.error.flatten().fieldErrors;
        expect(fieldErrors.name).toBeDefined();
        expect(fieldErrors.email).toBeDefined();
        expect(fieldErrors.phone).toBeDefined();
        expect(fieldErrors.serviceInterest).toBeDefined();
      }
    });

    it("accepts a minimal early-stage opportunity", () => {
      const validEarlyStage = {
        name: "Acme Enterprises",
        email: "contact@acme.test",
        phone: "+91 9876543210",
        serviceInterest: "Website Development",
        opportunityStage: "EARLY_STAGE",
      };
      const result = createUnifiedLeadSchema.safeParse(validEarlyStage);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.opportunityStage).toBe("EARLY_STAGE");
        expect(result.data.name).toBe("Acme Enterprises");
      }
    });

    it("accepts a comprehensive confirmed opportunity with documents and budget", () => {
      const validConfirmed = {
        name: "Global Logistics Ltd",
        contactPerson: "Sarah Jenkins",
        email: "sarah@globallogistics.test",
        phone: "+91 9123456789",
        companyName: "Global Logistics Ltd",
        industry: "Supply Chain & Logistics",
        city: "Mumbai",
        state: "Maharashtra",
        serviceInterest: "Custom Software Development",
        leadTitle: "Enterprise Fleet Management Portal",
        projectDescription: "Real-time dispatch, GPS telematics, and billing automation.",
        clientRequirements: "Must integrate with SAP ERP and support 500 active drivers.",
        budget: "₹1,500,000",
        timeline: "3-6 months",
        opportunityStage: "CONFIRMED",
        documents: [
          {
            name: "Scope_of_Work.pdf",
            url: "/uploads/lead-documents/sow-123.pdf",
            size: 1048576,
            type: "application/pdf",
          },
        ],
      };
      const result = createUnifiedLeadSchema.safeParse(validConfirmed);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.opportunityStage).toBe("CONFIRMED");
        expect(result.data.documents).toHaveLength(1);
      }
    });
  });

  describe("API Endpoint Security & Server-Side Identity Attribution", () => {
    it("returns 401 when the user session is missing", async () => {
      mockSessionUser = null;
      const req = new NextRequest("http://localhost:3000/api/v1/broker/leads/create", {
        method: "POST",
        body: JSON.stringify({
          name: "Test Client",
          email: "test@client.com",
          phone: "9988776655",
          serviceInterest: "Cloud Solutions",
        }),
      });

      const res = await registerLead(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.success).toBe(false);
    });

    it("returns 403 when the authenticated user does not have broker access", async () => {
      mockSessionUser = {
        id: "regular-user-999",
        email: "user@axivon.dev",
        name: "Regular User",
        role: "CLIENT",
        status: "ACTIVE",
      };
      const req = new NextRequest("http://localhost:3000/api/v1/broker/leads/create", {
        method: "POST",
        body: JSON.stringify({
          name: "Test Client",
          email: "test@client.com",
          phone: "9988776655",
          serviceInterest: "Cloud Solutions",
        }),
      });

      const res = await registerLead(req);
      expect(res.status).toBe(403);
    });

    it("strictly attributes lead ownership to the authenticated session, ignoring client-supplied brokerId/ownerId", async () => {
      const spoofedPayload = {
        name: "Victim Corporation",
        email: "victim@corp.com",
        phone: "9123456780",
        serviceInterest: "Mobile App Development",
        ownerId: "malicious-spoofed-user-id",
        brokerId: "malicious-spoofed-broker-id",
        opportunityStage: "EARLY_STAGE",
      };

      const req = new NextRequest("http://localhost:3000/api/v1/broker/leads/create", {
        method: "POST",
        body: JSON.stringify(spoofedPayload),
      });

      const res = await registerLead(req);
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.success).toBe(true);

      // Verify in DB that ownerId is the session user, not spoofed id
      const created = leadsDb[0];
      expect(created.ownerId).toBe("broker-user-123");
      expect(created.ownerId).not.toBe("malicious-spoofed-user-id");
    });
  });

  describe("Early-Stage vs Confirmed Opportunity Workflows", () => {
    it("registers early-stage lead with NEW status and UNQUALIFIED qualification", async () => {
      const payload = {
        name: "Early Stage Tech Co",
        email: "founder@earlytech.com",
        phone: "9876500000",
        serviceInterest: "AI and Machine Learning Solutions",
        opportunityStage: "EARLY_STAGE",
      };

      const req = new NextRequest("http://localhost:3000/api/v1/broker/leads/create", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const res = await registerLead(req);
      expect(res.status).toBe(201);
      const json = await res.json();

      expect(json.success).toBe(true);
      expect(json.data.status).toBe("NEW");
      expect(json.data.qualificationStatus).toBe("UNQUALIFIED");
      expect(json.data.leadCode).toMatch(/^LD-\d{8}-\d{4}$/);
    });

    it("registers confirmed lead with QUALIFIED status and creates document links", async () => {
      const payload = {
        name: "Confirmed Enterprise",
        contactPerson: "Chief Officer",
        email: "ceo@confirmedent.com",
        phone: "9876511111",
        serviceInterest: "Custom Software Development",
        leadTitle: "ERP Modernization",
        opportunityStage: "CONFIRMED",
        documents: [
          {
            name: "Requirements_Doc.pdf",
            url: "/uploads/lead-documents/reqs-001.pdf",
            size: 524288,
            type: "application/pdf",
          },
        ],
      };

      const req = new NextRequest("http://localhost:3000/api/v1/broker/leads/create", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const res = await registerLead(req);
      expect(res.status).toBe(201);
      const json = await res.json();

      expect(json.success).toBe(true);
      expect(json.data.status).toBe("QUALIFIED");
      expect(json.data.qualificationStatus).toBe("QUALIFIED");

      // Verify document linkage
      expect(documentsDb.length).toBe(1);
      expect(documentsDb[0].userId).toBe("broker-user-123");
      expect(documentsDb[0].documentType).toBe("Requirements_Doc.pdf");
      expect(documentsDb[0].fileUrl).toBe("/uploads/lead-documents/reqs-001.pdf");
      expect(documentsDb[0].description).toContain(json.data.leadCode);
    });
  });

  describe("Duplicate Detection Safeguards", () => {
    it("rejects duplicate registration within 30 days and preserves existing lead", async () => {
      // First registration
      const initialPayload = {
        name: "Duplicate Corp",
        email: "duplicate@corp.com",
        phone: "9876522222",
        serviceInterest: "UI/UX Design",
        opportunityStage: "EARLY_STAGE",
      };

      const req1 = new NextRequest("http://localhost:3000/api/v1/broker/leads/create", {
        method: "POST",
        body: JSON.stringify(initialPayload),
      });
      const res1 = await registerLead(req1);
      expect(res1.status).toBe(201);

      // Attempt second registration with same email
      const req2 = new NextRequest("http://localhost:3000/api/v1/broker/leads/create", {
        method: "POST",
        body: JSON.stringify({
          name: "Duplicate Corp Copy",
          email: "duplicate@corp.com",
          phone: "9876533333",
          serviceInterest: "Cloud Solutions",
        }),
      });
      const res2 = await registerLead(req2);
      expect(res2.status).toBe(409);
      const json2 = await res2.json();
      expect(json2.success).toBe(false);
      const errText = typeof json2.error === "string" ? json2.error : (json2.error?.message || json2.message || "");
      expect(errText).toContain("30 days");
    });
  });

  describe("Supporting Document Upload Security", () => {
    it("rejects executable file extensions", async () => {
      const formData = new FormData();
      const fakeFile = new File(["malicious payload"], "malware.exe", { type: "application/x-msdownload" });
      formData.append("file", fakeFile);

      const req = new NextRequest("http://localhost:3000/api/v1/broker/leads/upload", {
        method: "POST",
        body: formData,
      });

      const res = await uploadLeadDoc(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
      const errText = typeof json.error === "string" ? json.error : (json.error?.message || json.message || "");
      expect(errText).toContain("Unsupported file type");
    });

    it("rejects files exceeding the 10MB limit", async () => {
      const formData = new FormData();
      // Create a mock large file with real size > 10MB
      const largeFile = new File([new Uint8Array(11 * 1024 * 1024)], "bigfile.txt", { type: "text/plain" });
      formData.append("file", largeFile);

      const req = new NextRequest("http://localhost:3000/api/v1/broker/leads/upload", {
        method: "POST",
        body: formData,
      });

      const res = await uploadLeadDoc(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
      const errText = typeof json.error === "string" ? json.error : (json.error?.message || json.message || "");
      expect(errText).toContain("10MB");
    });
  });

  describe("Admin CRM Lead Inspection", () => {
    it("retrieves lead with broker partner attribution and attached documents", async () => {
      // Create a lead in DB
      const lead = {
        id: "lead_admin_inspect_1",
        leadCode: "LD-20261101-9988",
        name: "Enterprise Client",
        email: "enterprise@client.com",
        phone: "+91 9888877777",
        serviceInterest: "Business Automation",
        status: "QUALIFIED",
        qualificationStatus: "QUALIFIED",
        ownerId: "broker-user-123",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      leadsDb.push(lead);

      // Attach a document
      documentsDb.push({
        id: "doc_test_1",
        userId: "broker-user-123",
        documentType: "Enterprise_Specs.pdf",
        fileUrl: "/uploads/lead-documents/specs.pdf",
        fileSize: 1048576,
        description: `Lead Document for LD-20261101-9988`,
        createdAt: new Date(),
      });

      const req = new NextRequest("http://localhost:3000/api/v1/crm/leads/lead_admin_inspect_1", {
        headers: { "x-user-id": "admin-user-001" },
      });

      const res = await getCrmLead(req, { params: Promise.resolve({ id: "lead_admin_inspect_1" }) });
      expect(res.status).toBe(200);
      const json = await res.json();
      const leadResult = json.data || json.lead;

      expect(leadResult).toBeDefined();
      expect(leadResult.leadCode).toBe("LD-20261101-9988");
      expect(leadResult.owner).toBeDefined();
      expect(leadResult.owner.brokerProfile.partnerId).toBe("PTN-2026-0042");
      expect(leadResult.documents).toBeDefined();
      expect(leadResult.documents).toHaveLength(1);
      expect(leadResult.documents[0].documentType).toBe("Enterprise_Specs.pdf");
    });
  });
});
