import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from "fs";
import path from "path";
import { COMPANY_STATS, HOMEPAGE_STATS } from "@/data/company-stats";
import { servicesData } from "@/data/services";
import { DEMO_PROJECTS } from "@/data/demo-projects";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";

// Mock db for testing route handlers
vi.mock("@/lib/db", () => {
  return {
    db: {
      lead: {
        count: vi.fn().mockResolvedValue(0),
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockImplementation(({ data }) =>
          Promise.resolve({
            id: "lead-test-1",
            leadCode: data.leadCode,
            name: data.name,
            email: data.email,
            phone: data.phone,
            companyName: data.companyName,
            serviceInterest: data.serviceInterest,
            status: data.status,
            createdAt: new Date(),
          })
        ),
      },
      leadActivity: {
        create: vi.fn().mockResolvedValue({ id: "act-1" }),
      },
      userRole: {
        findMany: vi.fn().mockResolvedValue([{ userId: "admin-1" }]),
      },
      notification: {
        createMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      careerPageSetting: {
        findFirst: vi.fn().mockResolvedValue({ careersPageEnabled: false }),
        findUnique: vi.fn().mockResolvedValue({ careersPageEnabled: false }),
      },
      jobPosting: {
        findMany: vi.fn().mockResolvedValue([]),
      },
    },
  };
});

describe("STEP 1: Website Reliability & Credibility Tests", () => {
  describe("Company Statistics & Data Consistency", () => {
    it("has 10 specialized engineering services matching company-stats", () => {
      expect(servicesData.length).toBe(10);
      expect(COMPANY_STATS.coreServices.numericValue).toBe(10);
      expect(COMPANY_STATS.coreServices.value).toBe("10");
    });

    it("verifies all 4 core company statistics have consistent definitions", () => {
      expect(COMPANY_STATS.projectsDelivered.value).toBe("10+");
      expect(COMPANY_STATS.projectsDelivered.label).toBe("Projects Delivered");

      expect(COMPANY_STATS.coreServices.value).toBe("10");
      expect(COMPANY_STATS.coreServices.label).toBe("Core Services");

      expect(COMPANY_STATS.support.value).toBe("24/7");
      expect(COMPANY_STATS.support.label).toBe("Dedicated Support");

      expect(COMPANY_STATS.codeQuality.value).toBe("100%");
      expect(COMPANY_STATS.codeQuality.label).toBe("Code Quality Focus");

      expect(HOMEPAGE_STATS.length).toBe(4);
    });

    it("ensures live demo project catalogue distinguishes Live Demos from Coming Soon", () => {
      const liveDemos = DEMO_PROJECTS.filter((p) => p.status === "Live Demo");
      const comingSoon = DEMO_PROJECTS.filter((p) => p.status === "Coming Soon");

      expect(liveDemos.length).toBe(8);
      expect(comingSoon.length).toBeGreaterThan(0);

      // Verify all 8 live demo slugs
      const liveSlugs = liveDemos.map((p) => p.slug);
      expect(liveSlugs).toContain("corporatepro");
      expect(liveSlugs).toContain("medicare");
      expect(liveSlugs).toContain("foodiehub");
      expect(liveSlugs).toContain("edusmart");
      expect(liveSlugs).toContain("novacart");
      expect(liveSlugs).toContain("fitzone");
      expect(liveSlugs).toContain("estatevista");
      expect(liveSlugs).toContain("leadpilot");
    });
  });

  describe("Sitemap & Technical SEO Health", () => {
    it("includes all 8 live demo projects in sitemap", async () => {
      const sitemapItems = await sitemap();
      const urls = sitemapItems.map((item) => item.url);

      expect(urls).toContain("https://axivontech.in/demo-projects/business/corporatepro");
      expect(urls).toContain("https://axivontech.in/demo-projects/healthcare/medicare");
      expect(urls).toContain("https://axivontech.in/demo-projects/food/foodiehub");
      expect(urls).toContain("https://axivontech.in/demo-projects/education/edusmart");
      expect(urls).toContain("https://axivontech.in/demo-projects/ecommerce/novacart");
      expect(urls).toContain("https://axivontech.in/demo-projects/fitness/fitzone");
      expect(urls).toContain("https://axivontech.in/demo-projects/real-estate/estatevista");
      expect(urls).toContain("https://axivontech.in/demo-projects/saas/leadpilot");
    });

    it("includes all 10 core service pages in sitemap", async () => {
      const sitemapItems = await sitemap();
      const urls = sitemapItems.map((item) => item.url);

      for (const service of servicesData) {
        expect(urls).toContain(`https://axivontech.in/services/${service.slug}`);
      }
    });

    it("ensures robots.txt disallows private routes while allowing public index", async () => {
      const robotsConfig = await robots();
      const rules = Array.isArray(robotsConfig.rules) ? robotsConfig.rules[0] : robotsConfig.rules;

      expect(rules.allow).toBe("/");
      expect(rules.disallow).toContain("/api/");
      expect(rules.disallow).toContain("/admin/");
      expect(rules.disallow).toContain("/employee/");
      expect(rules.disallow).toContain("/executive/");
      expect(rules.disallow).toContain("/login");
    });
  });

  describe("Contact API Validation & Lead Intake", () => {
    it("rejects contact submissions missing name with HTTP 400", async () => {
      const { POST } = await import("@/app/api/contact/route");
      const req = new Request("http://localhost:3000/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "test@example.com", message: "Hello", captchaToken: "1x00000000000000000000AA" }),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.message).toContain("Full Name is required");
    });

    it("rejects contact submissions with invalid email with HTTP 400", async () => {
      const { POST } = await import("@/app/api/contact/route");
      const req = new Request("http://localhost:3000/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Alice", email: "not-an-email", message: "Hello", captchaToken: "1x00000000000000000000AA" }),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.message).toContain("valid email address");
    });

    it("accepts valid contact submission and returns HTTP 200 with lead creation", async () => {
      const { POST } = await import("@/app/api/contact/route");
      const req = new Request("http://localhost:3000/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Rohan Varma",
          email: "rohan@example.com",
          phone: "+91 9876543210",
          service: "Website Development",
          message: "Looking for an enterprise web platform",
          captchaToken: "1x00000000000000000000AA",
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.message).toBe("Message sent successfully!");
    });
  });

  describe("Static Public Asset Integrity", () => {
    it("confirms leadership portrait assets exist", () => {
      expect(fs.existsSync(path.join("public", "assets/images/team/vikas-kumar-founder.jpg"))).toBe(true);
      expect(fs.existsSync(path.join("public", "assets/images/team/rokhiya-khanam-cofounder.jpg"))).toBe(true);
    });

    it("confirms placeholder.jpg asset exists for fail-safe fallbacks", () => {
      expect(fs.existsSync(path.join("public", "assets/images/placeholder.jpg"))).toBe(true);
    });

    it("confirms image assets exist for all 10 services", () => {
      for (const service of servicesData) {
        const imagePath = path.join("public", `assets/images/services/${service.slug}.jpg`);
        expect(fs.existsSync(imagePath), `Missing asset for service: ${service.slug}`).toBe(true);
      }
    });
  });
});
