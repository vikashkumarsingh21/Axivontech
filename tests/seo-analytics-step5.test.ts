import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import {
  sanitizeAnalyticsParams,
  trackEvent,
  trackPageView,
  trackLeadSubmission,
  trackPartnerApplication,
  trackDemoView,
  trackDemoFilter,
  trackWhatsAppClick,
  trackServiceCtaClick,
} from "@/lib/analytics";
import {
  KEYWORD_PAGE_MAPPINGS,
  getKeywordMappingForPath,
  getMappingsByIntent,
} from "@/lib/seo/keyword-mapping";
import {
  getSeoSettings,
  getPublishedArticleBySlug,
  getPublishedArticles,
  DEFAULT_SEO_SETTINGS,
} from "@/lib/content/content-db";

// Mock db for content settings, services, articles, and careers
vi.mock("@/lib/db", () => ({
  db: {
    siteContentSetting: {
      findUnique: vi.fn().mockImplementation(({ where }) => {
        if (where.key === "seo") {
          return Promise.resolve({
            id: "setting-seo",
            key: "seo",
            data: {
              ...DEFAULT_SEO_SETTINGS,
              allowIndexing: true,
            },
          });
        }
        return Promise.resolve(null);
      }),
    },
    websiteService: {
      findMany: vi.fn().mockResolvedValue([
        { id: "s1", slug: "web-development", status: "PUBLISHED" },
        { id: "s2", slug: "mobile-app-development", status: "PUBLISHED" },
        { id: "s3", slug: "custom-software-development", status: "PUBLISHED" },
      ]),
    },
    careersPageSetting: {
      findFirst: vi.fn().mockResolvedValue({ careersPageEnabled: true }),
      findUnique: vi.fn().mockResolvedValue({ careersPageEnabled: true }),
    },
    jobPosting: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    websiteArticle: {
      findMany: vi.fn().mockResolvedValue([
        {
          id: "b1",
          slug: "crafting-modern-web-applications",
          title: "Crafting Modern Web Applications in 2026",
          status: "PUBLISHED",
          publishedAt: new Date(),
          createdAt: new Date(),
          authorName: "Vikash Kumar",
          authorRole: "Lead Architect",
          excerpt: "Guide to scalable web applications",
          readingTime: "6 min",
          keywords: ["Next.js", "Web Architecture"],
        },
      ]),
      findFirst: vi.fn().mockImplementation(({ where }) => {
        if (where.slug === "crafting-modern-web-applications" && where.status === "PUBLISHED") {
          return Promise.resolve({
            id: "b1",
            slug: "crafting-modern-web-applications",
            title: "Crafting Modern Web Applications in 2026",
            status: "PUBLISHED",
            contentHtml: "<p>Article content here...</p>",
            excerpt: "Guide to scalable web applications",
            category: "Engineering",
            publishedAt: new Date(),
            createdAt: new Date(),
            authorName: "Vikash Kumar",
            authorRole: "Lead Architect",
            readingTime: "6 min",
            keywords: ["Next.js", "Web Architecture"],
          });
        }
        return Promise.resolve(null);
      }),
    },
  },
}));

describe("Step 5 — SEO, Dynamic Sitemap, & Robots Directives", () => {
  it("generates a dynamic sitemap including core pages and dynamic CMS entities", async () => {
    const entries = await sitemap();

    expect(Array.isArray(entries)).toBe(true);
    expect(entries.length).toBeGreaterThan(10);

    const urls = entries.map((e) => e.url);

    // Core static pages
    expect(urls).toContain("https://axivontech.in");
    expect(urls).toContain("https://axivontech.in/about");
    expect(urls).toContain("https://axivontech.in/contact");
    expect(urls).toContain("https://axivontech.in/demo-projects");
    expect(urls).toContain("https://axivontech.in/business-partner");
    expect(urls).toContain("https://axivontech.in/careers");
    expect(urls).toContain("https://axivontech.in/blog");

    // Dynamic services
    expect(urls).toContain("https://axivontech.in/services/web-development");
    expect(urls).toContain("https://axivontech.in/services/mobile-app-development");

    // Dynamic blog articles
    expect(urls).toContain("https://axivontech.in/blog/crafting-modern-web-applications");

    // All entries must have valid changeFrequency and priority
    entries.forEach((entry) => {
      expect(entry.url).toMatch(/^https:\/\/axivontech\.in/);
      expect(entry.changeFrequency).toBeDefined();
      expect(entry.priority).toBeGreaterThanOrEqual(0.1);
      expect(entry.priority).toBeLessThanOrEqual(1.0);
    });
  });

  it("strictly excludes private, employee, and administrative routes from the sitemap", async () => {
    const entries = await sitemap();
    const urls = entries.map((e) => e.url);

    const prohibitedPrefixes = [
      "/admin",
      "/employee",
      "/executive",
      "/broker",
      "/client",
      "/api",
      "/login",
      "/logout",
      "/preferences",
      "/reminders",
    ];

    prohibitedPrefixes.forEach((prefix) => {
      const hasProhibited = urls.some((u) => u.includes(prefix));
      expect(hasProhibited).toBe(false);
    });
  });

  it("generates robots.txt with search engine directives and protected disallow paths", async () => {
    const directives = await robots();

    expect(directives).toBeDefined();
    expect(directives.sitemap).toBe("https://axivontech.in/sitemap.xml");

    const rules = Array.isArray(directives.rules) ? directives.rules[0] : directives.rules;
    expect(rules.userAgent).toBe("*");
    expect(rules.allow).toBe("/");

    // Disallow list must cover private routes
    const disallows = rules.disallow as string[];
    expect(disallows).toContain("/api/");
    expect(disallows).toContain("/admin/");
    expect(disallows).toContain("/employee/");
    expect(disallows).toContain("/executive/");
    expect(disallows).toContain("/broker/");
    expect(disallows).toContain("/client/");
    expect(disallows).toContain("/login");
  });
});

describe("Step 5 — Analytics Engine & Zero-PII Sanitization", () => {
  let originalWindow: any;

  beforeEach(() => {
    originalWindow = global.window;
  });

  afterEach(() => {
    global.window = originalWindow;
    vi.restoreAllMocks();
  });

  it("sanitizes parameter payloads by removing keys matching sensitive PII patterns", () => {
    const dirtyParams = {
      service_name: "Web Development",
      lead_code: "AX-2026-001",
      email: "client@example.com",
      user_email: "ceo@startup.co",
      phone: "+91 99999 88888",
      applicantPhone: "9876543210",
      password: "SuperSecretPassword123!",
      name: "John Doe",
      applicantName: "Jane Smith",
      client_name: "Acme Corp Lead",
      address: "123 Business Way",
      budget_tier: "enterprise",
    };

    const clean = sanitizeAnalyticsParams(dirtyParams);

    // Allowed business metrics
    expect(clean.service_name).toBe("Web Development");
    expect(clean.lead_code).toBe("AX-2026-001");
    expect(clean.budget_tier).toBe("enterprise");

    // Stripped PII fields
    expect(clean.email).toBeUndefined();
    expect(clean.user_email).toBeUndefined();
    expect(clean.phone).toBeUndefined();
    expect(clean.applicantPhone).toBeUndefined();
    expect(clean.password).toBeUndefined();
    expect(clean.name).toBeUndefined();
    expect(clean.applicantName).toBeUndefined();
    expect(clean.client_name).toBeUndefined();
    expect(clean.address).toBeUndefined();
  });

  it("strips values that contain email addresses or phone patterns inside generic keys", () => {
    const dirtyParams = {
      action: "inquiry_submit",
      contact_info: "Please reach me at vikash@mycompany.io for details",
      raw_notes: "Call me on +91 91572 26367 tomorrow morning",
      valid_metric: "custom-software",
    };

    const clean = sanitizeAnalyticsParams(dirtyParams);

    expect(clean.action).toBe("inquiry_submit");
    expect(clean.valid_metric).toBe("custom-software");
    expect(clean.contact_info).toBe("[REDACTED_EMAIL]");
    expect(clean.raw_notes).toBe("[REDACTED_PHONE]");
  });

  it("handles undefined window safely on server-side environments", () => {
    // In Node/SSR, window is undefined
    expect(() => {
      trackEvent("test_event", { metric: 123 });
      trackPageView("/services/web-development");
      trackLeadSubmission({ leadCode: "AX-TEST", serviceInterest: "Web" });
      trackPartnerApplication({ applicationCode: "BP-TEST" });
    }).not.toThrow();
  });

  it("fires gtag with sanitized parameters in client browser environment", () => {
    const mockGtag = vi.fn();
    (global as any).window = {
      gtag: mockGtag,
    };

    // Track Lead Submission
    trackLeadSubmission({
      leadCode: "AX-2026-999",
      serviceInterest: "Custom Software",
      sourcePage: "/contact",
      email: "should-be-stripped@test.com",
    });

    expect(mockGtag).toHaveBeenCalledWith(
      "event",
      "generate_lead",
      expect.objectContaining({
        lead_code: "AX-2026-999",
        service_type: "Custom Software",
        source_page: "/contact",
      })
    );

    // Verify PII was stripped from the gtag payload
    const lastCallParams = mockGtag.mock.calls[0][2];
    expect(lastCallParams.email).toBeUndefined();

    // Track Partner Application
    trackPartnerApplication({
      applicationCode: "BP-2026-001",
      partnershipType: "BROKER",
      phone: "+91 99999 00000",
    });

    expect(mockGtag).toHaveBeenCalledWith(
      "event",
      "partner_application",
      expect.objectContaining({
        application_code: "BP-2026-001",
        business_type: "BROKER",
      })
    );

    // Track Demo Interactions
    trackDemoView("estatevista", "Real Estate");
    expect(mockGtag).toHaveBeenCalledWith("event", "select_content", {
      content_type: "demo_project",
      item_id: "estatevista",
      category: "Real Estate",
    });

    trackDemoFilter("Healthcare");
    expect(mockGtag).toHaveBeenCalledWith("event", "filter_demo_portfolio", {
      category: "Healthcare",
    });

    trackWhatsAppClick("contact_page");
    expect(mockGtag).toHaveBeenCalledWith("event", "contact_whatsapp", {
      channel: "whatsapp",
      source_location: "contact_page",
    });

    trackServiceCtaClick("web-development", "hero_cta");
    expect(mockGtag).toHaveBeenCalledWith("event", "service_cta_click", {
      service_slug: "web-development",
      cta_location: "hero_cta",
    });
  });
});

describe("Step 5 — Keyword-to-Page Mapping & Intent Architecture", () => {
  it("provides comprehensive keyword mappings for all key business landing pages", () => {
    expect(KEYWORD_PAGE_MAPPINGS.length).toBeGreaterThanOrEqual(10);

    const requiredPaths = [
      "/",
      "/services/web-development",
      "/services/mobile-apps",
      "/services/custom-software",
      "/services/ai-solutions",
      "/demos",
      "/about",
      "/contact",
      "/partners",
      "/careers",
      "/blog",
    ];

    requiredPaths.forEach((path) => {
      const mapping = getKeywordMappingForPath(path);
      expect(mapping).toBeDefined();
      expect(mapping?.primaryKeyword).toBeTruthy();
      expect(mapping?.secondaryKeywords.length).toBeGreaterThan(0);
      expect(mapping?.serpSnippetGuidelines.recommendedTitle).toBeTruthy();
      expect(mapping?.serpSnippetGuidelines.recommendedDescription).toBeTruthy();
      expect(mapping?.conversionGoal).toBeTruthy();
    });
  });

  it("correctly queries mappings by search intent", () => {
    const transactional = getMappingsByIntent("TRANSACTIONAL");
    expect(transactional.length).toBeGreaterThanOrEqual(4);
    const paths = transactional.map((m) => m.targetPath);
    expect(paths).toContain("/contact");
    expect(paths).toContain("/services/web-development");

    const commercial = getMappingsByIntent("COMMERCIAL");
    expect(commercial.length).toBeGreaterThanOrEqual(2);
    const commPaths = commercial.map((m) => m.targetPath);
    expect(commPaths).toContain("/");
    expect(commPaths).toContain("/demos");
  });
});

describe("Step 5 — Dynamic Blog Slug Retrieval", () => {
  it("retrieves published article by slug", async () => {
    const article = await getPublishedArticleBySlug("crafting-modern-web-applications");
    expect(article).not.toBeNull();
    expect(article?.slug).toBe("crafting-modern-web-applications");
    expect(article?.title).toBe("Crafting Modern Web Applications in 2026");
  });

  it("returns null for non-existent blog article slug", async () => {
    const article = await getPublishedArticleBySlug("non-existent-article-xyz");
    expect(article).toBeNull();
  });
});
