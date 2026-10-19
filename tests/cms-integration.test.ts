import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { ApiError } from "@/lib/api-error";

// Content Helpers
import {
  getHomepageContent,
  getAboutPageContent,
  getPublishedServices,
  getPublishedIndustries,
  getPublishedPortfolioProjects,
  getPublishedFaqs,
  DEFAULT_HOMEPAGE_CONTENT,
  DEFAULT_ABOUT_CONTENT,
  DEFAULT_FAQS,
  DEFAULT_INDUSTRIES,
} from "@/lib/content/content-db";

// API Handlers
import { GET as getSummary } from "@/app/api/v1/admin/content/summary/route";
import { POST as uploadMedia } from "@/app/api/v1/admin/content/media/upload/route";
import { DELETE as deleteMedia } from "@/app/api/v1/admin/content/media/[id]/route";

// Mock Authentication
vi.mock("@/lib/auth/permissions", () => ({
  requirePermission: vi.fn(async (userId: string | null, permission: string) => {
    if (!userId || userId === "unauthorized") {
      throw new ApiError(403, `Forbidden: Missing permission ${permission}`);
    }
    return { id: userId, email: "admin@axivontech.in", role: "ADMIN" };
  }),
}));

// Mock Next.js cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

// Mock fs/promises for uploads
vi.mock("fs/promises", () => ({
  writeFile: vi.fn().mockResolvedValue(undefined),
  mkdir: vi.fn().mockResolvedValue(undefined),
  unlink: vi.fn().mockResolvedValue(undefined),
}));

// In-Memory mock store
let mockSettings: Record<string, any> = {};
let mockServices: any[] = [];
let mockIndustries: any[] = [];
let mockFaqs: any[] = [];
let mockArticles: any[] = [];
let mockMediaAssets: any[] = [];
let mockPortfolioProjects: any[] = [];
let mockPosters: any[] = [];
let mockCareersSetting: any = { id: "default", careersPageEnabled: false };
let mockJobs: any[] = [];

vi.mock("@/lib/db", () => ({
  db: {
    websiteSetting: {
      findUnique: vi.fn(async ({ where }: any) => mockSettings[where.key] || null),
      create: vi.fn(async ({ data }: any) => {
        mockSettings[data.key] = data;
        return data;
      }),
      update: vi.fn(async ({ where, data }: any) => {
        mockSettings[where.key] = { ...(mockSettings[where.key] || {}), ...data };
        return mockSettings[where.key];
      }),
    },
    websiteService: {
      findMany: vi.fn(async (query?: any) => {
        let list = [...mockServices];
        if (query?.where?.status) {
          list = list.filter((s) => s.status === query.where.status);
        }
        return list;
      }),
      findUnique: vi.fn(async ({ where }: any) => {
        return mockServices.find((s) => s.slug === where.slug || s.id === where.id) || null;
      }),
    },
    websiteIndustry: {
      findMany: vi.fn(async (query?: any) => {
        let list = [...mockIndustries];
        if (query?.where?.status) {
          list = list.filter((i) => i.status === query.where.status);
        }
        return list;
      }),
    },
    websiteFaq: {
      findMany: vi.fn(async (query?: any) => {
        let list = [...mockFaqs];
        if (query?.where?.status) {
          list = list.filter((f) => f.status === query.where.status);
        }
        return list;
      }),
    },
    websiteArticle: {
      findMany: vi.fn(async (query?: any) => {
        let list = [...mockArticles];
        if (query?.where?.status) {
          list = list.filter((a) => a.status === query.where.status);
        }
        if (query?.where?.featuredImage) {
          list = list.filter((a) => a.featuredImage === query.where.featuredImage);
        }
        return list;
      }),
    },
    mediaAsset: {
      findMany: vi.fn(async () => [...mockMediaAssets]),
      findUnique: vi.fn(async ({ where }: any) => {
        return mockMediaAssets.find((m) => m.id === where.id) || null;
      }),
      create: vi.fn(async ({ data }: any) => {
        const item = { id: `media-${Date.now()}`, ...data };
        mockMediaAssets.push(item);
        return item;
      }),
      delete: vi.fn(async ({ where }: any) => {
        const idx = mockMediaAssets.findIndex((m) => m.id === where.id);
        if (idx !== -1) {
          return mockMediaAssets.splice(idx, 1)[0];
        }
        return null;
      }),
    },
    portfolioProject: {
      findMany: vi.fn(async (query?: any) => {
        let list = [...mockPortfolioProjects];
        if (query?.where?.status) {
          list = list.filter((p) => p.status === query.where.status);
        }
        if (query?.where?.OR) {
          const conditions = query.where.OR;
          list = list.filter((p) =>
            conditions.some((cond: any) =>
              (cond.heroImage && p.heroImage === cond.heroImage) ||
              (cond.thumbnail && p.thumbnail === cond.thumbnail)
            )
          );
        }
        return list;
      }),
      findUnique: vi.fn(async ({ where }: any) => {
        return mockPortfolioProjects.find((p) => p.slug === where.slug || p.id === where.id) || null;
      }),
    },
    loginPagePoster: {
      findMany: vi.fn(async (query?: any) => {
        let list = [...mockPosters];
        if (query?.where?.status) {
          list = list.filter((p) => p.status === query.where.status);
        }
        if (query?.where?.imageUrl) {
          list = list.filter((p) => p.imageUrl === query.where.imageUrl);
        }
        return list;
      }),
    },
    careersPageSetting: {
      findUnique: vi.fn(async () => mockCareersSetting),
    },
    jobPosting: {
      findMany: vi.fn(async () => [...mockJobs]),
    },
  },
}));

describe("CMS Integration & Persistence Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSettings = {};
    mockServices = [];
    mockIndustries = [];
    mockFaqs = [];
    mockArticles = [];
    mockMediaAssets = [];
    mockPortfolioProjects = [];
    mockPosters = [];
    mockCareersSetting = { id: "default", careersPageEnabled: false };
    mockJobs = [];
  });

  describe("Content DB Helpers with Dynamic Fallbacks", () => {
    it("getHomepageContent returns DEFAULT_HOMEPAGE_CONTENT when DB is unpopulated", async () => {
      const content = await getHomepageContent();
      expect(content).toBeDefined();
      expect(content.hero.headline).toBe(DEFAULT_HOMEPAGE_CONTENT.hero.headline);
      expect(content.closingCta.heading).toBe(DEFAULT_HOMEPAGE_CONTENT.closingCta.heading);
    });

    it("getHomepageContent overlays live published DB settings", async () => {
      mockSettings["homepage"] = {
        key: "homepage",
        status: "PUBLISHED",
        data: {
          hero: {
            eyebrow: "Next-Gen Enterprise",
            headline: "Custom CMS Driven Headline",
            highlight: "Engineered for scale",
            subcopy: "Live dynamic test copy.",
            primaryCtaText: "Get Started Now",
            primaryCtaLink: "/contact",
            secondaryCtaText: "Explore Portfolio",
            secondaryCtaLink: "/portfolio",
            capabilityBadges: ["AI", "Cloud"],
          },
        },
      };

      const content = await getHomepageContent();
      expect(content.hero.headline).toBe("Custom CMS Driven Headline");
      expect(content.hero.eyebrow).toBe("Next-Gen Enterprise");
      // Fallbacks preserved for other unconfigured fields
      expect(content.closingCta.heading).toBe(DEFAULT_HOMEPAGE_CONTENT.closingCta.heading);
    });

    it("getAboutPageContent returns DEFAULT_ABOUT_CONTENT when DB is empty", async () => {
      const content = await getAboutPageContent();
      expect(content.mission).toBe(DEFAULT_ABOUT_CONTENT.mission);
      expect(content.founder.name).toBe(DEFAULT_ABOUT_CONTENT.founder.name);
    });

    it("getAboutPageContent overlays published DB content", async () => {
      mockSettings["about"] = {
        key: "about",
        status: "PUBLISHED",
        data: {
          mission: "Custom mission updated via CMS admin.",
          founder: {
            name: "Vikas Kumar Singh",
            role: "Founder & Chief Architect",
            bio: "Updated bio through admin CMS.",
            quote: DEFAULT_ABOUT_CONTENT.founder.quote,
            image: DEFAULT_ABOUT_CONTENT.founder.image,
          },
        },
      };

      const content = await getAboutPageContent();
      expect(content.mission).toBe("Custom mission updated via CMS admin.");
      expect(content.founder.bio).toBe("Updated bio through admin CMS.");
      expect(content.vision).toBe(DEFAULT_ABOUT_CONTENT.vision);
    });

    it("getPublishedServices returns catalog when DB has no published records", async () => {
      const services = await getPublishedServices();
      expect(services.length).toBeGreaterThan(0);
      expect(services.some((s) => s.slug === "web-development")).toBe(true);
    });

    it("getPublishedServices incorporates DB-managed service records", async () => {
      mockServices = [
        {
          id: "srv-custom-1",
          slug: "custom-software-development",
          title: "Custom Tailored Software Solutions",
          shortDescription: "Tailored software designed specifically for your enterprise.",
          status: "PUBLISHED",
          displayOrder: 1,
        },
      ];

      const services = await getPublishedServices();
      const customSrv = services.find((s) => s.slug === "custom-software-development");
      expect(customSrv).toBeDefined();
      expect(customSrv?.title).toBe("Custom Tailored Software Solutions");
    });

    it("getPublishedIndustries merges database industries with static defaults", async () => {
      mockIndustries = [
        {
          id: "ind-1",
          slug: "fintech-banking",
          title: "FinTech & Banking Infrastructure",
          description: "Mission-critical financial systems.",
          tags: ["Payments", "Security"],
          status: "PUBLISHED",
          displayOrder: 1,
        },
      ];

      const industries = await getPublishedIndustries();
      const customInd = industries.find((i) => i.slug === "fintech-banking");
      expect(customInd).toBeDefined();
      expect(customInd?.title).toBe("FinTech & Banking Infrastructure");
      // Other static industries still available
      expect(industries.length).toBeGreaterThan(1);
    });

    it("getPublishedPortfolioProjects returns DB projects and merges details", async () => {
      mockPortfolioProjects = [
        {
          id: "proj-1",
          slug: "novacart",
          title: "NovaCart E-Commerce Platform",
          category: "E-Commerce",
          industry: "Retail",
          shortDescription: "High-performance store with 10k SKU catalog.",
          status: "PUBLISHED",
          displayOrder: 1,
        },
      ];

      const projects = await getPublishedPortfolioProjects();
      const novaCart = projects.find((p) => p.slug === "novacart");
      expect(novaCart).toBeDefined();
      expect(novaCart?.title).toBe("NovaCart E-Commerce Platform");
    });

    it("getPublishedFaqs filters by category and page correctly", async () => {
      mockFaqs = [
        {
          id: "faq-1",
          question: "How long does deployment take?",
          answer: "Usually 2-4 weeks.",
          category: "GENERAL",
          page: "HOME",
          status: "PUBLISHED",
          displayOrder: 1,
        },
        {
          id: "faq-2",
          question: "Draft question?",
          answer: "Draft answer.",
          category: "GENERAL",
          page: "HOME",
          status: "DRAFT",
          displayOrder: 2,
        },
      ];

      const faqs = await getPublishedFaqs("GENERAL", "HOME");
      expect(faqs.some((f) => f.question === "How long does deployment take?")).toBe(true);
      expect(faqs.some((f) => f.question === "Draft question?")).toBe(false);
    });
  });

  describe("Admin Content Summary API (/api/v1/admin/content/summary)", () => {
    it("rejects unauthorized access without proper headers", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/admin/content/summary", {
        headers: { "x-user-id": "unauthorized" },
      });
      const res = await getSummary(req);
      expect(res.status).toBe(403);
    });

    it("returns real aggregated telemetry across all content modules", async () => {
      mockServices = [
        { id: "s1", status: "PUBLISHED" },
        { id: "s2", status: "DRAFT" },
      ];
      mockIndustries = [
        { id: "i1", status: "PUBLISHED" },
      ];
      mockFaqs = [
        { id: "f1", status: "PUBLISHED", category: "TECH" },
        { id: "f2", status: "ARCHIVED", category: "TECH" },
      ];
      mockMediaAssets = [
        { id: "m1", fileSize: 2048, fileType: "image/png" },
        { id: "m2", fileSize: 4096, fileType: "image/jpeg" },
      ];
      mockPortfolioProjects = [
        { id: "p1", status: "PUBLISHED", featured: true },
      ];

      const req = new NextRequest("http://localhost:3000/api/v1/admin/content/summary", {
        headers: { "x-user-id": "admin-1" },
      });
      const res = await getSummary(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.summary.services.total).toBe(2);
      expect(data.summary.services.published).toBe(1);
      expect(data.summary.services.draft).toBe(1);

      expect(data.summary.industries.total).toBe(1);
      expect(data.summary.industries.published).toBe(1);

      expect(data.summary.faqs.total).toBe(2);
      expect(data.summary.faqs.published).toBe(1);
      expect(data.summary.faqs.archived).toBe(1);

      expect(data.summary.media.total).toBe(2);
      expect(data.summary.media.totalBytes).toBe(6144);

      expect(data.summary.careers.careersPageEnabled).toBe(false);
    });
  });

  describe("Media Library Upload & Deletion Safety (/api/v1/admin/content/media)", () => {
    it("upload rejects missing file payload with HTTP 400", async () => {
      const formData = new FormData();
      formData.append("folder", "general");

      const req = new NextRequest("http://localhost:3000/api/v1/admin/content/media/upload", {
        method: "POST",
        headers: { "x-user-id": "admin-1" },
        body: formData,
      });

      const res = await uploadMedia(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain("No file provided");
    });

    it("upload rejects unsupported MIME types with HTTP 400", async () => {
      const blob = new Blob(["malicious-content"], { type: "application/x-msdownload" });
      const file = new File([blob], "bad_file.exe", { type: "application/x-msdownload" });

      const formData = new FormData();
      formData.append("file", file);

      const req = new NextRequest("http://localhost:3000/api/v1/admin/content/media/upload", {
        method: "POST",
        headers: { "x-user-id": "admin-1" },
        body: formData,
      });

      const res = await uploadMedia(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain("Invalid file type");
    });

    it("upload accepts valid image and registers MediaAsset record", async () => {
      const blob = new Blob(["mock-image-bytes"], { type: "image/png" });
      const file = new File([blob], "hero-banner.png", { type: "image/png" });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "banners");
      formData.append("altText", "Main Hero Banner");

      const req = new NextRequest("http://localhost:3000/api/v1/admin/content/media/upload", {
        method: "POST",
        headers: { "x-user-id": "admin-1" },
        body: formData,
      });

      const res = await uploadMedia(req);
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.asset.url).toContain("/uploads/media/banners/");
      expect(data.asset.altText).toBe("Main Hero Banner");
      expect(mockMediaAssets.length).toBe(1);
    });

    it("delete blocks deletion with HTTP 409 if asset is referenced by active content", async () => {
      const assetUrl = "/uploads/media/banners/campaign.png";
      mockMediaAssets = [
        { id: "asset-123", url: assetUrl, filename: "campaign.png" },
      ];

      // Article referencing this asset
      mockArticles = [
        { id: "art-1", title: "Enterprise Scaling Guide", slug: "enterprise-scaling", featuredImage: assetUrl },
      ];

      const req = new NextRequest("http://localhost:3000/api/v1/admin/content/media/asset-123", {
        method: "DELETE",
        headers: { "x-user-id": "admin-1" },
      });

      const res = await deleteMedia(req, { params: Promise.resolve({ id: "asset-123" }) });
      expect(res.status).toBe(409);
      const data = await res.json();
      expect(data.error).toBe("ASSET_IN_USE");
      expect(data.references[0]).toContain('Article: "Enterprise Scaling Guide"');
      // Ensure asset was not removed
      expect(mockMediaAssets.length).toBe(1);
    });

    it("delete succeeds when force=true even if referenced", async () => {
      const assetUrl = "/uploads/media/banners/campaign.png";
      mockMediaAssets = [
        { id: "asset-123", url: assetUrl, filename: "campaign.png" },
      ];
      mockArticles = [
        { id: "art-1", title: "Enterprise Scaling Guide", slug: "enterprise-scaling", featuredImage: assetUrl },
      ];

      const req = new NextRequest("http://localhost:3000/api/v1/admin/content/media/asset-123?force=true", {
        method: "DELETE",
        headers: { "x-user-id": "admin-1" },
      });

      const res = await deleteMedia(req, { params: Promise.resolve({ id: "asset-123" }) });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(mockMediaAssets.length).toBe(0);
    });

    it("delete succeeds when asset is unreferenced", async () => {
      mockMediaAssets = [
        { id: "asset-456", url: "/uploads/media/general/unreferenced.jpg", filename: "unreferenced.jpg" },
      ];

      const req = new NextRequest("http://localhost:3000/api/v1/admin/content/media/asset-456", {
        method: "DELETE",
        headers: { "x-user-id": "admin-1" },
      });

      const res = await deleteMedia(req, { params: Promise.resolve({ id: "asset-456" }) });
      expect(res.status).toBe(200);
      expect(mockMediaAssets.length).toBe(0);
    });
  });
});
