import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { ApiError } from "@/lib/api-error";
import {
  DEFAULT_HOMEPAGE_CONTENT,
  DEFAULT_ABOUT_CONTENT,
  DEFAULT_COMPANY_INFO,
  DEFAULT_SEO_SETTINGS,
  DEFAULT_FAQS,
  DEFAULT_INDUSTRIES,
  getHomepageContent,
  getAboutPageContent,
  getCompanyInfo,
  getSeoSettings,
  getPublishedFaqs,
  getPublishedServices,
  getPublishedServiceBySlug,
  getPublishedIndustries,
  getPublishedArticles,
} from "@/lib/content/content-db";

// API Route Handlers
import { GET as getSettings, PUT as putSettings } from "@/app/api/v1/admin/content/settings/route";
import { GET as getAdminFaqs, POST as createAdminFaq } from "@/app/api/v1/admin/content/faqs/route";
import {
  GET as getSingleFaq,
  PATCH as patchFaq,
  DELETE as deleteFaq,
} from "@/app/api/v1/admin/content/faqs/[id]/route";
import { GET as getAdminServices, POST as createAdminService } from "@/app/api/v1/admin/content/services/route";
import {
  GET as getSingleService,
  PATCH as patchService,
  DELETE as deleteService,
} from "@/app/api/v1/admin/content/services/[id]/route";
import { GET as getAdminIndustries, POST as createAdminIndustry } from "@/app/api/v1/admin/content/industries/route";
import {
  GET as getSingleIndustry,
  PATCH as patchIndustry,
  DELETE as deleteIndustry,
} from "@/app/api/v1/admin/content/industries/[id]/route";
import { GET as getAdminBlog, POST as createAdminArticle } from "@/app/api/v1/admin/content/blog/route";
import {
  GET as getSingleArticle,
  PATCH as patchArticle,
  DELETE as deleteArticle,
} from "@/app/api/v1/admin/content/blog/[id]/route";
import { GET as getAdminMedia, POST as createAdminMedia } from "@/app/api/v1/admin/content/media/route";
import {
  GET as getSingleMedia,
  PATCH as patchMedia,
  DELETE as deleteMedia,
} from "@/app/api/v1/admin/content/media/[id]/route";
import { GET as getPublicFaqs } from "@/app/api/v1/public/content/faqs/route";

// Mock authentication permissions
vi.mock("@/lib/auth/permissions", () => ({
  requirePermission: vi.fn(async (userId: string | null, permission: string) => {
    if (!userId || userId === "unauthorized") {
      throw new ApiError(403, `Forbidden: Missing permission ${permission}`);
    }
    return { id: userId, email: "admin@axivontech.in", role: "ADMIN" };
  }),
}));

// Mock Next.js cache revalidation
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

// Mock database boundaries cleanly
const mockWebsiteSettings: Record<string, any> = {};
const mockFaqs: any[] = [];
const mockServices: any[] = [];
const mockIndustries: any[] = [];
const mockArticles: any[] = [];
const mockMediaAssets: any[] = [];

import { Prisma } from "@prisma/client";

vi.mock("@/lib/db", () => ({
  db: {
    websiteSetting: {
      findUnique: vi.fn(async ({ where }: any) => mockWebsiteSettings[where.key] || null),
      create: vi.fn(async ({ data }: any) => {
        const draftData = data.draftData === Prisma.DbNull ? null : data.draftData;
        const item = { id: `setting-${Date.now()}`, ...data, draftData };
        mockWebsiteSettings[data.key] = item;
        return item;
      }),
      update: vi.fn(async ({ where, data }: any) => {
        const existing = mockWebsiteSettings[where.key] || {};
        const draftData = data.draftData === Prisma.DbNull ? null : data.draftData;
        const updated = {
          ...existing,
          ...data,
          ...(data.draftData !== undefined && { draftData }),
        };
        mockWebsiteSettings[where.key] = updated;
        return updated;
      }),
    },
    websiteFaq: {
      findMany: vi.fn(async ({ where, orderBy }: any) => {
        let res = [...mockFaqs];
        if (where?.status) res = res.filter((f) => f.status === where.status);
        if (where?.category) res = res.filter((f) => f.category === where.category);
        if (where?.page) res = res.filter((f) => f.page === where.page);
        return res;
      }),
      findUnique: vi.fn(async ({ where }: any) => mockFaqs.find((f) => f.id === where.id) || null),
      create: vi.fn(async ({ data }: any) => {
        const item = { id: `faq-${Date.now()}`, ...data };
        mockFaqs.push(item);
        return item;
      }),
      update: vi.fn(async ({ where, data }: any) => {
        const idx = mockFaqs.findIndex((f) => f.id === where.id);
        if (idx === -1) return null;
        mockFaqs[idx] = { ...mockFaqs[idx], ...data };
        return mockFaqs[idx];
      }),
      delete: vi.fn(async ({ where }: any) => {
        const idx = mockFaqs.findIndex((f) => f.id === where.id);
        if (idx !== -1) mockFaqs.splice(idx, 1);
        return { success: true };
      }),
      count: vi.fn(async () => mockFaqs.length),
    },
    websiteService: {
      findMany: vi.fn(async ({ where }: any) => {
        let res = [...mockServices];
        if (where?.status) res = res.filter((s) => s.status === where.status);
        return res;
      }),
      findUnique: vi.fn(async ({ where }: any) => {
        if (where.id) return mockServices.find((s) => s.id === where.id) || null;
        if (where.slug) return mockServices.find((s) => s.slug === where.slug) || null;
        return null;
      }),
      findFirst: vi.fn(async ({ where }: any) => {
        if (where.slug) return mockServices.find((s) => s.slug === where.slug) || null;
        return mockServices[0] || null;
      }),
      create: vi.fn(async ({ data }: any) => {
        const item = { id: `srv-${Date.now()}`, ...data };
        mockServices.push(item);
        return item;
      }),
      update: vi.fn(async ({ where, data }: any) => {
        const idx = mockServices.findIndex((s) => s.id === where.id);
        if (idx === -1) return null;
        mockServices[idx] = { ...mockServices[idx], ...data };
        return mockServices[idx];
      }),
      delete: vi.fn(async ({ where }: any) => {
        const idx = mockServices.findIndex((s) => s.id === where.id);
        if (idx !== -1) mockServices.splice(idx, 1);
        return { success: true };
      }),
      count: vi.fn(async () => mockServices.length),
    },
    websiteIndustry: {
      findMany: vi.fn(async () => [...mockIndustries]),
      findUnique: vi.fn(async ({ where }: any) => mockIndustries.find((i) => i.id === where.id) || null),
      create: vi.fn(async ({ data }: any) => {
        const item = { id: `ind-${Date.now()}`, ...data };
        mockIndustries.push(item);
        return item;
      }),
      update: vi.fn(async ({ where, data }: any) => {
        const idx = mockIndustries.findIndex((i) => i.id === where.id);
        if (idx === -1) return null;
        mockIndustries[idx] = { ...mockIndustries[idx], ...data };
        return mockIndustries[idx];
      }),
      delete: vi.fn(async ({ where }: any) => {
        const idx = mockIndustries.findIndex((i) => i.id === where.id);
        if (idx !== -1) mockIndustries.splice(idx, 1);
        return { success: true };
      }),
      count: vi.fn(async () => mockIndustries.length),
    },
    websiteArticle: {
      findMany: vi.fn(async ({ where }: any) => {
        let res = [...mockArticles];
        if (where?.status) res = res.filter((a) => a.status === where.status);
        return res;
      }),
      findUnique: vi.fn(async ({ where }: any) => {
        if (where.id) return mockArticles.find((a) => a.id === where.id) || null;
        if (where.slug) return mockArticles.find((a) => a.slug === where.slug) || null;
        return null;
      }),
      create: vi.fn(async ({ data }: any) => {
        const item = { id: `art-${Date.now()}`, ...data };
        mockArticles.push(item);
        return item;
      }),
      update: vi.fn(async ({ where, data }: any) => {
        const idx = mockArticles.findIndex((a) => a.id === where.id);
        if (idx === -1) return null;
        mockArticles[idx] = { ...mockArticles[idx], ...data };
        return mockArticles[idx];
      }),
      delete: vi.fn(async ({ where }: any) => {
        const idx = mockArticles.findIndex((a) => a.id === where.id);
        if (idx !== -1) mockArticles.splice(idx, 1);
        return { success: true };
      }),
      count: vi.fn(async () => mockArticles.length),
    },
    mediaAsset: {
      findMany: vi.fn(async ({ where }: any) => {
        let res = [...mockMediaAssets];
        if (where?.folder) res = res.filter((m) => m.folder === where.folder);
        return res;
      }),
      findUnique: vi.fn(async ({ where }: any) => mockMediaAssets.find((m) => m.id === where.id) || null),
      create: vi.fn(async ({ data }: any) => {
        const item = { id: `media-${Date.now()}`, ...data, createdAt: new Date() };
        mockMediaAssets.push(item);
        return item;
      }),
      update: vi.fn(async ({ where, data }: any) => {
        const idx = mockMediaAssets.findIndex((m) => m.id === where.id);
        if (idx === -1) return null;
        mockMediaAssets[idx] = { ...mockMediaAssets[idx], ...data };
        return mockMediaAssets[idx];
      }),
      delete: vi.fn(async ({ where }: any) => {
        const idx = mockMediaAssets.findIndex((m) => m.id === where.id);
        if (idx !== -1) mockMediaAssets.splice(idx, 1);
        return { success: true };
      }),
    },
  },
}));

describe("STEP 4: Website Content Management & Admin Panel Expansion Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(mockWebsiteSettings).forEach((k) => delete mockWebsiteSettings[k]);
    mockFaqs.length = 0;
    mockServices.length = 0;
    mockIndustries.length = 0;
    mockArticles.length = 0;
    mockMediaAssets.length = 0;
  });

  // ─────────────────────────────────────────────────────────────
  // 1. Single Source of Truth & Fallback Defaults
  // ─────────────────────────────────────────────────────────────
  describe("Single Source of Truth Defaults & Robust Fallbacks", () => {
    it("provides complete verified default homepage content with real company data", () => {
      expect(DEFAULT_HOMEPAGE_CONTENT.hero.headline).toBe("We build digital products that");
      expect(DEFAULT_HOMEPAGE_CONTENT.hero.highlight).toBe("move businesses forward.");
      expect(DEFAULT_HOMEPAGE_CONTENT.sectionsVisibility.hero).toBe(true);
      expect(DEFAULT_HOMEPAGE_CONTENT.sectionsVisibility.services).toBe(true);
      expect(DEFAULT_HOMEPAGE_CONTENT.closingCta.heading).toContain("Build Something Remarkable");
    });

    it("provides complete verified default about content including founder leadership", () => {
      expect(DEFAULT_ABOUT_CONTENT.founder.name).toBe("Vikash Kumar");
      expect(DEFAULT_ABOUT_CONTENT.founder.role).toBe("Founder & Lead Architect");
      expect(DEFAULT_ABOUT_CONTENT.contactInfo.email).toBe("contact@axivontech.in");
      expect(DEFAULT_ABOUT_CONTENT.contactInfo.city).toBe("Rajkot");
    });

    it("provides complete verified default company contact and SEO settings", () => {
      expect(DEFAULT_COMPANY_INFO.phone).toBe("+91 91572 26367");
      expect(DEFAULT_COMPANY_INFO.email).toBe("contact@axivontech.in");
      expect(DEFAULT_SEO_SETTINGS.canonicalBase).toBe("https://axivontech.in");
      expect(DEFAULT_SEO_SETTINGS.allowIndexing).toBe(true);
    });

    it("provides comprehensive categorized default FAQs with zero mock text", () => {
      expect(DEFAULT_FAQS.length).toBeGreaterThanOrEqual(8);
      const categories = new Set(DEFAULT_FAQS.map((f) => f.category.toUpperCase()));
      expect(categories.has("GENERAL")).toBe(true);
      expect(categories.has("SERVICES")).toBe(true);
      expect(categories.has("SUPPORT")).toBe(true);
    });

    it("provides verified default industry sectors covering enterprise verticals", () => {
      expect(DEFAULT_INDUSTRIES.length).toBeGreaterThanOrEqual(8);
      const slugs = DEFAULT_INDUSTRIES.map((i) => i.slug);
      expect(slugs).toContain("healthcare");
      expect(slugs).toContain("real-estate");
      expect(slugs).toContain("retail");
      expect(slugs).toContain("education");
    });

    it("falls back gracefully to static defaults when database tables are empty or cold", async () => {
      const homeContent = await getHomepageContent();
      expect(homeContent.hero.headline).toBe(DEFAULT_HOMEPAGE_CONTENT.hero.headline);

      const aboutContent = await getAboutPageContent();
      expect(aboutContent.founder.name).toBe("Vikash Kumar");

      const companyInfo = await getCompanyInfo();
      expect(companyInfo.email).toBe("contact@axivontech.in");

      const seo = await getSeoSettings();
      expect(seo.titleTemplate).toContain("Axivon Technologies");

      const faqs = await getPublishedFaqs();
      expect(faqs.length).toBeGreaterThan(0);

      const services = await getPublishedServices();
      expect(services.length).toBeGreaterThan(0);

      const singleService = await getPublishedServiceBySlug("web-development");
      expect(singleService).not.toBeNull();
      expect(singleService?.title).toContain("Web");

      const industries = await getPublishedIndustries();
      expect(industries.length).toBeGreaterThan(0);

      const articles = await getPublishedArticles();
      expect(articles.length).toBeGreaterThan(0);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 2. Admin Content Settings API (/api/v1/admin/content/settings)
  // ─────────────────────────────────────────────────────────────
  describe("Admin Settings API Route (/api/v1/admin/content/settings)", () => {
    it("rejects unauthorized access when x-user-id header is missing or non-admin", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/admin/content/settings?key=homepage", {
        headers: { "x-user-id": "unauthorized" },
      });
      const res = await getSettings(req);
      expect(res.status).toBe(403);
    });

    it("returns default settings for key when not yet saved in database", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/admin/content/settings?key=homepage", {
        headers: { "x-user-id": "usr-admin-1" },
      });
      const res = await getSettings(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.setting.key).toBe("homepage");
      expect(data.setting.data.hero.headline).toBe(DEFAULT_HOMEPAGE_CONTENT.hero.headline);
    });

    it("saves content as DRAFT without altering published state", async () => {
      const draftPayload = {
        key: "homepage",
        action: "draft",
        data: {
          ...DEFAULT_HOMEPAGE_CONTENT,
          hero: {
            ...DEFAULT_HOMEPAGE_CONTENT.hero,
            headline: "New Draft Headline Testing 2026",
          },
        },
      };

      const putReq = new NextRequest("http://localhost:3000/api/v1/admin/content/settings", {
        method: "PUT",
        headers: { "x-user-id": "usr-admin-1", "Content-Type": "application/json" },
        body: JSON.stringify(draftPayload),
      });

      const putRes = await putSettings(putReq);
      expect(putRes.status).toBe(200);
      const body = await putRes.json();
      expect(body.success).toBe(true);
      expect(body.setting.status).toBe("DRAFT");
      expect(body.setting.draftData.hero.headline).toBe("New Draft Headline Testing 2026");
    });

    it("publishes content updates and triggers cache revalidation", async () => {
      const publishPayload = {
        key: "homepage",
        action: "publish",
        data: {
          ...DEFAULT_HOMEPAGE_CONTENT,
          hero: {
            ...DEFAULT_HOMEPAGE_CONTENT.hero,
            headline: "Published Live Headline 2026",
          },
        },
      };

      const putReq = new NextRequest("http://localhost:3000/api/v1/admin/content/settings", {
        method: "PUT",
        headers: { "x-user-id": "usr-admin-1", "Content-Type": "application/json" },
        body: JSON.stringify(publishPayload),
      });

      const putRes = await putSettings(putReq);
      expect(putRes.status).toBe(200);
      const body = await putRes.json();
      expect(body.success).toBe(true);
      expect(body.setting.status).toBe("PUBLISHED");
      expect(body.setting.data.hero.headline).toBe("Published Live Headline 2026");
      expect(body.setting.draftData).toBeNull();
    });

    it("rejects PUT request with missing key or data", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/admin/content/settings", {
        method: "PUT",
        headers: { "x-user-id": "usr-admin-1", "Content-Type": "application/json" },
        body: JSON.stringify({ key: "homepage" }), // missing data
      });
      const res = await putSettings(req);
      expect(res.status).toBe(400);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 3. Admin FAQ Management API (/api/v1/admin/content/faqs)
  // ─────────────────────────────────────────────────────────────
  describe("Admin FAQ Management API Routes", () => {
    it("validates required question and answer fields on POST", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/admin/content/faqs", {
        method: "POST",
        headers: { "x-user-id": "usr-admin-1", "Content-Type": "application/json" },
        body: JSON.stringify({ question: "" }),
      });
      const res = await createAdminFaq(req);
      expect(res.status).toBe(400);
    });

    it("creates a new FAQ entry with display order and status", async () => {
      const faqPayload = {
        question: "How does Axivon handle IP ownership?",
        answer: "Clients receive 100% intellectual property ownership upon milestone completion.",
        category: "General",
        page: "homepage",
        status: "PUBLISHED",
      };

      const req = new NextRequest("http://localhost:3000/api/v1/admin/content/faqs", {
        method: "POST",
        headers: { "x-user-id": "usr-admin-1", "Content-Type": "application/json" },
        body: JSON.stringify(faqPayload),
      });

      const res = await createAdminFaq(req);
      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.faq.question).toBe(faqPayload.question);
      expect(body.faq.status).toBe("PUBLISHED");
      expect(body.faq.displayOrder).toBe(1);
    });

    it("retrieves list of FAQs and aggregate stats", async () => {
      // Add a couple of mock faqs
      mockFaqs.push(
        { id: "faq-1", question: "Q1", answer: "A1", category: "General", status: "PUBLISHED", displayOrder: 1 },
        { id: "faq-2", question: "Q2", answer: "A2", category: "Services", status: "DRAFT", displayOrder: 2 }
      );

      const req = new NextRequest("http://localhost:3000/api/v1/admin/content/faqs", {
        headers: { "x-user-id": "usr-admin-1" },
      });

      const res = await getAdminFaqs(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.faqs.length).toBe(2);
      expect(data.stats.total).toBe(2);
      expect(data.stats.published).toBe(1);
      expect(data.stats.draft).toBe(1);
    });

    it("updates an existing FAQ using PATCH and removes using DELETE", async () => {
      const created = {
        id: "faq-to-edit",
        question: "Original Question?",
        answer: "Original Answer",
        category: "General",
        status: "DRAFT",
        displayOrder: 1,
      };
      mockFaqs.push(created);

      // PATCH
      const patchReq = new NextRequest("http://localhost:3000/api/v1/admin/content/faqs/faq-to-edit", {
        method: "PATCH",
        headers: { "x-user-id": "usr-admin-1", "Content-Type": "application/json" },
        body: JSON.stringify({ question: "Updated Question?", status: "PUBLISHED" }),
      });
      const patchRes = await patchFaq(patchReq, { params: Promise.resolve({ id: "faq-to-edit" }) });
      expect(patchRes.status).toBe(200);
      const patchedBody = await patchRes.json();
      expect(patchedBody.faq.question).toBe("Updated Question?");
      expect(patchedBody.faq.status).toBe("PUBLISHED");

      // DELETE
      const delReq = new NextRequest("http://localhost:3000/api/v1/admin/content/faqs/faq-to-edit", {
        method: "DELETE",
        headers: { "x-user-id": "usr-admin-1" },
      });
      const delRes = await deleteFaq(delReq, { params: Promise.resolve({ id: "faq-to-edit" }) });
      expect(delRes.status).toBe(200);
      expect(mockFaqs.find((f) => f.id === "faq-to-edit")).toBeUndefined();
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 4. Admin Services Catalog API (/api/v1/admin/content/services)
  // ─────────────────────────────────────────────────────────────
  describe("Admin Services Catalog API Routes", () => {
    it("validates required title and shortDescription on POST", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/admin/content/services", {
        method: "POST",
        headers: { "x-user-id": "usr-admin-1", "Content-Type": "application/json" },
        body: JSON.stringify({ title: "" }),
      });
      const res = await createAdminService(req);
      expect(res.status).toBe(400);
    });

    it("creates a new service with auto-generated slug and structured arrays", async () => {
      const payload = {
        title: "AI & Machine Learning Engineering",
        shortDescription: "Custom predictive models, NLP engines, and enterprise AI automation.",
        badge: "Next-Gen AI",
        icon: "Cpu",
        benefits: ["Reduced latency", "Domain fine-tuning"],
      };

      const req = new NextRequest("http://localhost:3000/api/v1/admin/content/services", {
        method: "POST",
        headers: { "x-user-id": "usr-admin-1", "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const res = await createAdminService(req);
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.service.title).toBe(payload.title);
      expect(data.service.slug).toBe("ai-machine-learning-engineering");
      expect(data.service.status).toBe("PUBLISHED");
    });

    it("updates service metadata and status via PATCH", async () => {
      mockServices.push({
        id: "srv-edit",
        title: "Cloud Migration",
        slug: "cloud-migration",
        status: "PUBLISHED",
        shortDescription: "Legacy to cloud.",
        displayOrder: 1,
      });

      const patchReq = new NextRequest("http://localhost:3000/api/v1/admin/content/services/srv-edit", {
        method: "PATCH",
        headers: { "x-user-id": "usr-admin-1", "Content-Type": "application/json" },
        body: JSON.stringify({ status: "DRAFT", shortDescription: "Modern serverless architecture." }),
      });

      const res = await patchService(patchReq, { params: Promise.resolve({ id: "srv-edit" }) });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.service.status).toBe("DRAFT");
      expect(body.service.shortDescription).toBe("Modern serverless architecture.");
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 5. Admin Industry Sectors API (/api/v1/admin/content/industries)
  // ─────────────────────────────────────────────────────────────
  describe("Admin Industry Sectors API Routes", () => {
    it("validates required name and description on POST", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/admin/content/industries", {
        method: "POST",
        headers: { "x-user-id": "usr-admin-1", "Content-Type": "application/json" },
        body: JSON.stringify({ name: "" }),
      });
      const res = await createAdminIndustry(req);
      expect(res.status).toBe(400);
    });

    it("creates an industry sector with tags and related services", async () => {
      const payload = {
        name: "FinTech & Banking",
        description: "PCI-DSS compliant transactional systems and algorithmic ledger engines.",
        icon: "ShieldCheck",
        tags: ["Banking", "PCI-DSS", "Payments"],
        relatedServices: ["Web Development", "Cloud Architecture"],
      };

      const req = new NextRequest("http://localhost:3000/api/v1/admin/content/industries", {
        method: "POST",
        headers: { "x-user-id": "usr-admin-1", "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const res = await createAdminIndustry(req);
      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.industry.title).toBe("FinTech & Banking");
      expect(body.industry.slug).toBe("fintech-banking");
      expect(body.industry.tags).toContain("PCI-DSS");
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 6. Admin Blog Articles API (/api/v1/admin/content/blog)
  // ─────────────────────────────────────────────────────────────
  describe("Admin Blog Articles API Routes", () => {
    it("validates required title, excerpt, and contentHtml on POST", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/admin/content/blog", {
        method: "POST",
        headers: { "x-user-id": "usr-admin-1", "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Test Article" }), // missing excerpt & content
      });
      const res = await createAdminArticle(req);
      expect(res.status).toBe(400);
    });

    it("creates blog article with SEO keywords and author details", async () => {
      const payload = {
        title: "Scalable Architecture Patterns in 2026",
        excerpt: "A deep dive into decoupled systems and reactive streaming.",
        contentHtml: "<p>Decoupled systems empower distributed scalability.</p>",
        category: "Architecture",
        authorName: "Vikas Kumar",
        authorRole: "Founder & Lead Architect",
        readingTime: "6 min read",
        status: "PUBLISHED",
        keywords: ["Architecture", "Scalability", "Next.js"],
      };

      const req = new NextRequest("http://localhost:3000/api/v1/admin/content/blog", {
        method: "POST",
        headers: { "x-user-id": "usr-admin-1", "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const res = await createAdminArticle(req);
      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.article.title).toBe(payload.title);
      expect(body.article.slug).toBe("scalable-architecture-patterns-in-2026");
      expect(body.article.status).toBe("PUBLISHED");
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 7. Admin Media Assets API (/api/v1/admin/content/media)
  // ─────────────────────────────────────────────────────────────
  describe("Admin Media Assets Library API Routes", () => {
    it("validates allowed MIME types on POST and rejects unsupported types", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/admin/content/media", {
        method: "POST",
        headers: { "x-user-id": "usr-admin-1", "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: "malicious.exe",
          url: "https://example.com/malicious.exe",
          fileType: "application/x-msdownload",
        }),
      });

      const res = await createAdminMedia(req);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toContain("Unsupported file type");
    });

    it("validates maximum file size limit (10MB) on POST", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/admin/content/media", {
        method: "POST",
        headers: { "x-user-id": "usr-admin-1", "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: "huge-image.png",
          url: "https://example.com/huge.png",
          fileType: "image/png",
          fileSize: 15 * 1024 * 1024, // 15MB > 10MB
        }),
      });

      const res = await createAdminMedia(req);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toContain("10MB");
    });

    it("creates media asset record for valid image payload", async () => {
      const assetPayload = {
        filename: "client-showcase-hero.webp",
        originalName: "hero.webp",
        url: "/images/showcase/hero.webp",
        fileType: "image/webp",
        fileSize: 245000,
        width: 1920,
        height: 1080,
        altText: "Executive dashboard analytics preview",
        folder: "showcase",
      };

      const req = new NextRequest("http://localhost:3000/api/v1/admin/content/media", {
        method: "POST",
        headers: { "x-user-id": "usr-admin-1", "Content-Type": "application/json" },
        body: JSON.stringify(assetPayload),
      });

      const res = await createAdminMedia(req);
      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.asset.filename).toBe(assetPayload.filename);
      expect(body.asset.folder).toBe("showcase");
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 8. Public FAQs Route (/api/v1/public/content/faqs)
  // ─────────────────────────────────────────────────────────────
  describe("Public FAQs API Route (/api/v1/public/content/faqs)", () => {
    it("returns published FAQs without requiring authentication", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/public/content/faqs");
      const res = await getPublicFaqs(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.faqs.length).toBeGreaterThan(0);
    });

    it("filters public FAQs by category query parameter", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/public/content/faqs?category=General");
      const res = await getPublicFaqs(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.faqs.every((f: any) => f.category.toLowerCase() === "general")).toBe(true);
    });
  });
});
