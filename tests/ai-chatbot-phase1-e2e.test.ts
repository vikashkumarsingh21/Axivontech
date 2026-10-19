import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// In-memory mock database state
interface MockDoc {
  id: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
  sourceType: string;
  sourceReference?: string | null;
  status: string;
  version: number;
  createdById?: string | null;
  updatedById?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const mockKnowledgeDocs: MockDoc[] = [];
const mockGaps: any[] = [];
const mockFeedbacks: any[] = [];
const mockLeads: any[] = [];
const mockActivities: any[] = [];
let mockChatbotSetting: any = null;

// Mock database
vi.mock("@/lib/db", () => ({
  db: {
    knowledgeDocument: {
      findMany: vi.fn(async ({ where, skip = 0, take = 20, orderBy }: any = {}) => {
        let results = [...mockKnowledgeDocs];
        if (where?.status) {
          results = results.filter((d) => d.status === where.status);
        }
        if (where?.category) {
          results = results.filter((d) => d.category === where.category);
        }
        if (where?.OR) {
          results = results.filter((d) =>
            where.OR.some((cond: any) => {
              if (cond.title?.contains) {
                return d.title.toLowerCase().includes(cond.title.contains.toLowerCase());
              }
              if (cond.content?.contains) {
                return d.content.toLowerCase().includes(cond.content.contains.toLowerCase());
              }
              return false;
            })
          );
        }
        return results.slice(skip, skip + take);
      }),
      count: vi.fn(async ({ where }: any = {}) => {
        let results = [...mockKnowledgeDocs];
        if (where?.status) results = results.filter((d) => d.status === where.status);
        if (where?.category) results = results.filter((d) => d.category === where.category);
        return results.length;
      }),
      findUnique: vi.fn(async ({ where }: any) => {
        return mockKnowledgeDocs.find((d) => d.id === where.id) || null;
      }),
      create: vi.fn(async ({ data }: any) => {
        const item: MockDoc = {
          id: `kd-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          title: data.title,
          category: data.category,
          content: data.content,
          tags: data.tags || [],
          sourceType: data.sourceType || "MANUAL",
          sourceReference: data.sourceReference || null,
          status: data.status || "DRAFT",
          version: data.version || 1,
          createdById: data.createdById || null,
          updatedById: data.updatedById || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockKnowledgeDocs.push(item);
        return item;
      }),
      update: vi.fn(async ({ where, data }: any) => {
        const idx = mockKnowledgeDocs.findIndex((d) => d.id === where.id);
        if (idx === -1) throw new Error("Document not found");
        mockKnowledgeDocs[idx] = {
          ...mockKnowledgeDocs[idx],
          ...data,
          updatedAt: new Date(),
        };
        return mockKnowledgeDocs[idx];
      }),
      delete: vi.fn(async ({ where }: any) => {
        const idx = mockKnowledgeDocs.findIndex((d) => d.id === where.id);
        if (idx !== -1) mockKnowledgeDocs.splice(idx, 1);
        return { success: true };
      }),
    },
    chatKnowledgeGap: {
      findFirst: vi.fn(async ({ where }: any) => {
        return (
          mockGaps.find(
            (g) => g.question === where.question && (!where.status || g.status === where.status)
          ) || null
        );
      }),
      findMany: vi.fn(async ({ skip = 0, take = 20 }: any = {}) => {
        return mockGaps.slice(skip, skip + take);
      }),
      count: vi.fn(async () => mockGaps.length),
      create: vi.fn(async ({ data }: any) => {
        const item = {
          id: `gap-${Date.now()}`,
          ...data,
          frequency: data.frequency || 1,
          status: data.status || "OPEN",
          createdAt: new Date(),
          updatedAt: new Date(),
          resolvedAt: null,
        };
        mockGaps.push(item);
        return item;
      }),
      update: vi.fn(async ({ where, data }: any) => {
        const idx = mockGaps.findIndex((g) => g.id === where.id);
        if (idx !== -1) {
          mockGaps[idx] = { ...mockGaps[idx], ...data, updatedAt: new Date() };
          return mockGaps[idx];
        }
        return null;
      }),
    },
    chatFeedback: {
      create: vi.fn(async ({ data }: any) => {
        const item = { id: `fb-${Date.now()}`, ...data, createdAt: new Date() };
        mockFeedbacks.push(item);
        return item;
      }),
      findMany: vi.fn(async ({ where, skip = 0, take = 20 }: any = {}) => {
        let results = [...mockFeedbacks];
        if (where?.rating) results = results.filter((f) => f.rating === where.rating);
        return results.slice(skip, skip + take);
      }),
      count: vi.fn(async ({ where }: any = {}) => {
        let results = [...mockFeedbacks];
        if (where?.rating) results = results.filter((f) => f.rating === where.rating);
        return results.length;
      }),
    },
    organizationSetting: {
      findUnique: vi.fn(async ({ where }: any) => {
        if (where.key === "CHATBOT_CONFIG") {
          return mockChatbotSetting ? { key: "CHATBOT_CONFIG", value: mockChatbotSetting } : null;
        }
        return null;
      }),
      upsert: vi.fn(async ({ create, update }: any) => {
        mockChatbotSetting = { ...(create?.value || update?.value) };
        return { key: "CHATBOT_CONFIG", value: mockChatbotSetting };
      }),
    },
    lead: {
      count: vi.fn(async () => mockLeads.length),
      findFirst: vi.fn(async () => null),
      create: vi.fn(async ({ data }: any) => {
        const item = { id: `lead-${Date.now()}`, ...data, createdAt: new Date() };
        mockLeads.push(item);
        return item;
      }),
    },
    leadActivity: {
      create: vi.fn(async ({ data }: any) => {
        const item = { id: `act-${Date.now()}`, ...data, createdAt: new Date() };
        mockActivities.push(item);
        return item;
      }),
    },
    userRole: {
      findMany: vi.fn(async () => [{ userId: "admin-1" }]),
    },
    notification: {
      createMany: vi.fn(async () => ({ count: 1 })),
    },
    portfolioProject: {
      findMany: vi.fn(async () => []),
    },
  },
}));

// Mock permission checker
vi.mock("@/lib/auth/permissions", () => ({
  requirePermission: vi.fn(async (userId: string | null) => {
    if (!userId || userId === "unauthorized-user") {
      const { ApiError } = await import("@/lib/api-error");
      throw new ApiError(401, "Unauthorized");
    }
  }),
}));

// Mock rate limiting
vi.mock("@/lib/rate-limit", () => ({
  isRateLimited: vi.fn(() => ({ limited: false, resetMs: 0 })),
  RATE_LIMIT_PRESETS: { PUBLIC_LEADS: { windowMs: 900000, maxRequests: 50 } },
}));

describe("AXIVON AI Phase 1: End-to-End System Tests", () => {
  beforeEach(() => {
    mockKnowledgeDocs.length = 0;
    mockGaps.length = 0;
    mockFeedbacks.length = 0;
    mockLeads.length = 0;
    mockActivities.length = 0;
    mockChatbotSetting = null;
  });

  describe("1. Authoritative Knowledge Base & Publication Lifecycle", () => {
    it("retrieves ONLY currently published documents and excludes drafts and archived docs", async () => {
      mockKnowledgeDocs.push(
        {
          id: "doc-pub-1",
          title: "Web Services",
          category: "SERVICES",
          content: "Published web services information.",
          tags: ["web"],
          sourceType: "MANUAL",
          status: "PUBLISHED",
          version: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "doc-draft-1",
          title: "Internal Unapproved Draft",
          category: "PRICING",
          content: "Confidential draft: do not expose.",
          tags: ["pricing"],
          sourceType: "MANUAL",
          status: "DRAFT",
          version: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "doc-archived-1",
          title: "Discontinued Legacy Service",
          category: "SERVICES",
          content: "Old discontinued product.",
          tags: ["legacy"],
          sourceType: "MANUAL",
          status: "ARCHIVED",
          version: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      );

      const { getPublishedKnowledge } = await import("@/lib/chatbot/knowledge-base");
      const published = await getPublishedKnowledge();

      expect(published.length).toBe(1);
      expect(published[0].id).toBe("doc-pub-1");
      expect(published[0].title).toBe("Web Services");
    });

    it("immediately removes unpublished or archived document from active retrieval", async () => {
      const { getPublishedKnowledge } = await import("@/lib/chatbot/knowledge-base");

      mockKnowledgeDocs.push({
        id: "doc-to-retire",
        title: "Temporary Promo",
        category: "SERVICES",
        content: "Promo content active now.",
        tags: ["promo"],
        sourceType: "MANUAL",
        status: "PUBLISHED",
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      let published = await getPublishedKnowledge();
      expect(published.some((d) => d.id === "doc-to-retire")).toBe(true);

      // Simulate admin unpublishing or archiving
      const doc = mockKnowledgeDocs.find((d) => d.id === "doc-to-retire");
      if (doc) doc.status = "ARCHIVED";

      published = await getPublishedKnowledge();
      expect(published.some((d) => d.id === "doc-to-retire")).toBe(false);
    });
  });

  describe("2. Admin Knowledge CRUD Operations (/api/v1/admin/ai/knowledge)", () => {
    it("rejects unauthenticated requests with HTTP 401", async () => {
      const { GET: getDocs } = await import("@/app/api/v1/admin/ai/knowledge/route");
      const req = new NextRequest("http://localhost:3000/api/v1/admin/ai/knowledge");
      const res = await getDocs(req);
      expect(res.status).toBe(401);
    });

    it("creates a new knowledge document with valid admin session", async () => {
      const { POST: createDoc } = await import("@/app/api/v1/admin/ai/knowledge/route");
      const req = new NextRequest("http://localhost:3000/api/v1/admin/ai/knowledge", {
        method: "POST",
        headers: {
          "x-user-id": "admin-super",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Cloud Infrastructure Consulting",
          category: "SERVICES",
          content: "Axivon provides AWS, GCP, and Azure cloud migrations and DevOps architecture.",
          tags: ["cloud", "aws", "devops"],
          status: "PUBLISHED",
        }),
      });

      const res = await createDoc(req);
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.title).toBe("Cloud Infrastructure Consulting");
      expect(json.data.version).toBe(1);
      expect(mockKnowledgeDocs.length).toBe(1);
    });

    it("updates document content and increments version number", async () => {
      mockKnowledgeDocs.push({
        id: "doc-edit-1",
        title: "Mobile App Capabilities",
        category: "SERVICES",
        content: "Original version 1 text.",
        tags: ["mobile"],
        sourceType: "MANUAL",
        status: "PUBLISHED",
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const { PATCH: updateDoc } = await import("@/app/api/v1/admin/ai/knowledge/[id]/route");
      const req = new NextRequest("http://localhost:3000/api/v1/admin/ai/knowledge/doc-edit-1", {
        method: "PATCH",
        headers: {
          "x-user-id": "admin-super",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: "Updated version 2 content with Flutter and React Native details.",
        }),
      });

      const res = await updateDoc(req, { params: Promise.resolve({ id: "doc-edit-1" }) });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.version).toBe(2);
      expect(json.data.content).toContain("Updated version 2");
    });

    it("archives document on standard DELETE request", async () => {
      mockKnowledgeDocs.push({
        id: "doc-del-1",
        title: "Retiring Doc",
        category: "COMPANY",
        content: "About to be archived.",
        tags: [],
        sourceType: "MANUAL",
        status: "PUBLISHED",
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const { DELETE: deleteDoc } = await import("@/app/api/v1/admin/ai/knowledge/[id]/route");
      const req = new NextRequest("http://localhost:3000/api/v1/admin/ai/knowledge/doc-del-1", {
        headers: { "x-user-id": "admin-super" },
      });

      const res = await deleteDoc(req, { params: Promise.resolve({ id: "doc-del-1" }) });
      expect(res.status).toBe(200);
      expect(mockKnowledgeDocs[0].status).toBe("ARCHIVED");
    });

    it("permanently deletes document when ?permanent=true is passed", async () => {
      mockKnowledgeDocs.push({
        id: "doc-perm-1",
        title: "Permanently Gone",
        category: "COMPANY",
        content: "Content to wipe.",
        tags: [],
        sourceType: "MANUAL",
        status: "ARCHIVED",
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const { DELETE: deleteDoc } = await import("@/app/api/v1/admin/ai/knowledge/[id]/route");
      const req = new NextRequest(
        "http://localhost:3000/api/v1/admin/ai/knowledge/doc-perm-1?permanent=true",
        { headers: { "x-user-id": "admin-super" } }
      );

      const res = await deleteDoc(req, { params: Promise.resolve({ id: "doc-perm-1" }) });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.message).toContain("permanently deleted");
      expect(mockKnowledgeDocs.length).toBe(0);
    });
  });

  describe("3. Document Upload & Text Extraction (/api/v1/admin/ai/knowledge/upload)", () => {
    it("returns extracted preview without persisting when preview=true is passed", async () => {
      const { POST: uploadDoc } = await import("@/app/api/v1/admin/ai/knowledge/upload/route");

      const formData = new FormData();
      const fileBlob = new Blob(["# Axivon Enterprise Overview\n\nAxivon designs custom enterprise software."], {
        type: "text/markdown",
      });
      formData.append("file", fileBlob, "enterprise-overview.md");
      formData.append("category", "COMPANY");
      formData.append("preview", "true");

      const req = new NextRequest("http://localhost:3000/api/v1/admin/ai/knowledge/upload", {
        method: "POST",
        headers: { "x-user-id": "admin-super" },
        body: formData,
      });

      const res = await uploadDoc(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.preview).toBe(true);
      expect(json.data.title).toBe("Enterprise Overview");
      expect(json.data.content).toContain("Axivon designs custom enterprise software");
      // Verify nothing was persisted
      expect(mockKnowledgeDocs.length).toBe(0);
    });

    it("rejects unsupported file formats (.exe)", async () => {
      const { POST: uploadDoc } = await import("@/app/api/v1/admin/ai/knowledge/upload/route");

      const formData = new FormData();
      formData.append("file", new Blob(["malicious code"]), "installer.exe");

      const req = new NextRequest("http://localhost:3000/api/v1/admin/ai/knowledge/upload", {
        method: "POST",
        headers: { "x-user-id": "admin-super" },
        body: formData,
      });

      const res = await uploadDoc(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain("Unsupported file format");
    });
  });

  describe("4. Knowledge Gap Tracking & Status Resolution", () => {
    it("logs knowledge gaps and sanitizes PII before recording", async () => {
      const { logKnowledgeGap } = await import("@/lib/chatbot/knowledge-gap-logger");

      await logKnowledgeGap("Can you build an app for user john.doe@gmail.com with phone 9876543210?", "PROJECT_INQUIRY");

      expect(mockGaps.length).toBe(1);
      expect(mockGaps[0].question).not.toContain("john.doe@gmail.com");
      expect(mockGaps[0].question).not.toContain("9876543210");
      expect(mockGaps[0].question).toContain("[email]");
      expect(mockGaps[0].question).toContain("[phone]");
      expect(mockGaps[0].frequency).toBe(1);
    });

    it("updates gap status to ADDRESSED via admin PATCH route", async () => {
      mockGaps.push({
        id: "gap-123",
        question: "do you offer cobol legacy migration?",
        intent: "SERVICE_INFORMATION",
        frequency: 3,
        status: "OPEN",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const { PATCH: updateGap } = await import("@/app/api/v1/admin/ai/knowledge/gaps/[id]/route");
      const req = new NextRequest("http://localhost:3000/api/v1/admin/ai/knowledge/gaps/gap-123", {
        method: "PATCH",
        headers: {
          "x-user-id": "admin-super",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "ADDRESSED" }),
      });

      const res = await updateGap(req, { params: Promise.resolve({ id: "gap-123" }) });
      expect(res.status).toBe(200);
      expect(mockGaps[0].status).toBe("ADDRESSED");
    });
  });

  describe("5. Visitor Feedback & Satisfaction Analytics", () => {
    it("persists visitor feedback and calculates satisfaction rate accurately", async () => {
      const { POST: postFeedback } = await import("@/app/api/chat/feedback/route");

      // Submit 3 HELPFUL and 1 NOT_HELPFUL
      for (let i = 0; i < 3; i++) {
        const req = new NextRequest("http://localhost:3000/api/chat/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId: `conv-${i}`,
            rating: "HELPFUL",
            comment: "Very clear explanation!",
          }),
        });
        const res = await postFeedback(req);
        expect(res.status).toBe(200);
      }

      const reqBad = new NextRequest("http://localhost:3000/api/chat/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: "conv-bad",
          rating: "NOT_HELPFUL",
          comment: "Needed human escalation.",
        }),
      });
      await postFeedback(reqBad);

      expect(mockFeedbacks.length).toBe(4);

      // Verify admin analytics endpoint
      const { GET: getFeedbackReport } = await import("@/app/api/v1/admin/ai/knowledge/feedback/route");
      const adminReq = new NextRequest("http://localhost:3000/api/v1/admin/ai/knowledge/feedback", {
        headers: { "x-user-id": "admin-super" },
      });
      const reportRes = await getFeedbackReport(adminReq);
      expect(reportRes.status).toBe(200);
      const reportJson = await reportRes.json();
      expect(reportJson.analytics.totalRatings).toBe(4);
      expect(reportJson.analytics.helpfulCount).toBe(3);
      expect(reportJson.analytics.notHelpfulCount).toBe(1);
      expect(reportJson.analytics.satisfactionRate).toBe(75); // 3/4 = 75%
    });
  });

  describe("6. Admin Chatbot Settings & Public Reflection", () => {
    it("updates settings and ensures public configuration does not leak internal data", async () => {
      const { PUT: updateSettings } = await import("@/app/api/v1/admin/ai/knowledge/settings/route");
      const { GET: getPublicConfig } = await import("@/app/api/chat/config/route");

      const updateReq = new NextRequest("http://localhost:3000/api/v1/admin/ai/knowledge/settings", {
        method: "PUT",
        headers: {
          "x-user-id": "admin-super",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          enabled: true,
          botName: "Axivon Enterprise AI",
          welcomeHeading: "Ready to scale your technical infrastructure?",
          welcomeSubtitle: "Ask about custom web apps, mobile solutions, or AI workflows.",
          suggestedQuestions: ["Our Architecture Stack", "Book Consultation"],
        }),
      });

      const updateRes = await updateSettings(updateReq);
      expect(updateRes.status).toBe(200);

      // Verify public config endpoint reflects changes
      const configRes = await getPublicConfig();
      expect(configRes.status).toBe(200);
      const configJson = await configRes.json();
      expect(configJson.botName).toBe("Axivon Enterprise AI");
      expect(configJson.welcomeHeading).toBe("Ready to scale your technical infrastructure?");
      expect(configJson.suggestedQuestions).toContain("Our Architecture Stack");
      expect(configJson.apiKey).toBeUndefined();
      expect(configJson.geminiKey).toBeUndefined();
    });
  });

  describe("7. Public Chat API Pipeline (/api/chat)", () => {
    it("answers grounded inquiries from database knowledge and reports LOCAL_FALLBACK when no Gemini key is set", async () => {
      mockKnowledgeDocs.push({
        id: "doc-web-1",
        title: "Web Engineering",
        category: "SERVICES",
        content: "Axivon engineers scalable React and Next.js platforms with zero downtime architecture.",
        tags: ["web", "nextjs", "react"],
        sourceType: "WEBSITE_PAGE",
        status: "PUBLISHED",
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      delete process.env.GEMINI_API_KEY;

      const { POST: chatRoute } = await import("@/app/api/chat/route");
      const chatReq = new NextRequest("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Tell me about your Next.js web engineering services.",
        }),
      });

      const res = await chatRoute(chatReq);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.reply).toContain("Axivon engineers scalable React and Next.js platforms");
      expect(json.engineUsed).toBe("LOCAL_FALLBACK");
      expect(json.conversationId).toBeDefined();
    });

    it("returns conservative refusal with official contact details for unknown queries", async () => {
      delete process.env.GEMINI_API_KEY;

      const { POST: chatRoute } = await import("@/app/api/chat/route");
      const chatReq = new NextRequest("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Do you sell high-speed hyperloop trains?",
        }),
      });

      const res = await chatRoute(chatReq);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.reply).toContain("I don't have verified information");
      expect(json.reply).toContain("info@axivontech.in");
      expect(json.reply).toContain("+91 9473263768");
    });
  });
});
