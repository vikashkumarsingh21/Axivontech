import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  DEMO_PROJECTS,
  DEMO_CATEGORIES,
  getDemoProjectBySlug,
  getDemoProjectImage,
  getDemoProjectSlug,
  getLiveDemoProjects,
  getFeaturedDemoProjects,
} from "@/data/demo-projects";
import { GET as getAdminDemos, POST as createAdminDemo } from "@/app/api/v1/admin/demo-projects/route";
import {
  GET as getSingleAdminDemo,
  PATCH as patchAdminDemo,
  DELETE as deleteAdminDemo,
} from "@/app/api/v1/admin/demo-projects/[id]/route";
import { NextRequest } from "next/server";
import { ApiError } from "@/lib/api-error";

// Mock authentication permissions
vi.mock("@/lib/auth/permissions", () => ({
  requirePermission: vi.fn(async (userId: string | null, permission: string) => {
    if (!userId || userId === "unauthorized") {
      throw new ApiError(403, `Forbidden: Missing permission ${permission}`);
    }
    return { id: userId, email: "admin@axivontech.in", role: "ADMIN" };
  }),
}));

// Mock database boundaries cleanly
vi.mock("@/lib/db", () => ({
  db: {
    portfolioProject: {
      findMany: vi.fn(async () => []),
      findFirst: vi.fn(async () => null),
      create: vi.fn(async ({ data }: any) => ({
        id: "mock-proj-id",
        ...data,
      })),
      update: vi.fn(async ({ where, data }: any) => ({
        id: where.id,
        ...data,
      })),
    },
  },
}));

describe("STEP 3: Interactive Demo Portfolio & Client Conversion Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Demo Projects Catalogue Data Integrity", () => {
    it("contains exactly 47 structured demo projects across industry categories", () => {
      expect(DEMO_PROJECTS.length).toBe(47);
    });

    it("has exactly 8 Live Interactive Demos with verified internal routes", () => {
      const liveDemos = getLiveDemoProjects();
      expect(liveDemos.length).toBe(8);

      const liveSlugs = liveDemos.map((d) => d.slug || d.id);
      expect(liveSlugs).toContain("corporatepro");
      expect(liveSlugs).toContain("medicare");
      expect(liveSlugs).toContain("foodiehub");
      expect(liveSlugs).toContain("edusmart");
      expect(liveSlugs).toContain("novacart");
      expect(liveSlugs).toContain("estatevista");
      expect(liveSlugs).toContain("fitzone");
      expect(liveSlugs).toContain("leadpilot");

      // Verify every live demo has a valid internal URL
      liveDemos.forEach((demo) => {
        expect(demo.status).toBe("Live Demo");
        expect(demo.demoUrl).toBeDefined();
        expect(demo.demoUrl?.startsWith("/demo-projects/")).toBe(true);
      });
    });

    it("guarantees unique slugs across all 47 demo projects", () => {
      const slugs = DEMO_PROJECTS.map((p) => getDemoProjectSlug(p));
      const uniqueSlugs = new Set(slugs);
      expect(uniqueSlugs.size).toBe(DEMO_PROJECTS.length);
    });

    it("ensures every project has a verified, non-empty image asset URL", () => {
      DEMO_PROJECTS.forEach((project) => {
        const img = getDemoProjectImage(project);
        expect(img).toBeDefined();
        expect(typeof img).toBe("string");
        expect(img.length).toBeGreaterThan(0);
        expect(img.startsWith("/")).toBe(true);
      });
    });

    it("ensures all Coming Soon projects have valid enquiry types and no dead demo links", () => {
      const comingSoon = DEMO_PROJECTS.filter((p) => p.status === "Coming Soon");
      expect(comingSoon.length).toBe(39);

      comingSoon.forEach((p) => {
        expect(p.enquiryType).toBe("Request a Similar Project");
        // Coming soon projects must not link to live routes
        expect(p.demoUrl).toBeUndefined();
      });
    });
  });

  describe("Portfolio Search, Filter and Sorting Logic", () => {
    it("resolves specific project by slug or ID via getDemoProjectBySlug", () => {
      const estate = getDemoProjectBySlug("estatevista");
      expect(estate).toBeDefined();
      expect(estate?.name).toBe("EstateVista");
      expect(estate?.category).toBe("Real Estate");

      const fitzone = getDemoProjectBySlug("fitzone");
      expect(fitzone).toBeDefined();
      expect(fitzone?.name).toBe("FitZone");
      expect(fitzone?.category).toBe("Fitness & Wellness");

      const unknown = getDemoProjectBySlug("non-existent-project");
      expect(unknown).toBeUndefined();
    });

    it("retrieves featured flagship showcase projects", () => {
      const featured = getFeaturedDemoProjects();
      expect(featured.length).toBeGreaterThan(0);
      featured.forEach((p) => {
        expect(p.isFeatured).toBe(true);
        expect(p.status).toBe("Live Demo");
      });
    });

    it("categorizes projects under predefined valid DEMO_CATEGORIES", () => {
      const allCategories = new Set(DEMO_CATEGORIES as readonly string[]);
      DEMO_PROJECTS.forEach((p) => {
        expect(allCategories.has(p.category)).toBe(true);
      });
    });
  });

  describe("Deep-Linking & Lead Generation Integration (Phase 2 Alignment)", () => {
    it("generates correct contextual preselection query parameters for inquiries", () => {
      const project = getDemoProjectBySlug("estatevista")!;
      const targetUrl = `/contact?demo=${encodeURIComponent(project.name)}&industry=${encodeURIComponent(
        project.category
      )}&service=web-development#contact-form`;

      expect(targetUrl).toContain("demo=EstateVista");
      expect(targetUrl).toContain("industry=Real%20Estate");
      expect(targetUrl).toContain("service=web-development");
      expect(targetUrl).toContain("#contact-form");
    });
  });

  describe("Admin Panel Demo Projects API (/api/v1/admin/demo-projects)", () => {
    it("rejects unauthorized access without proper user ID with HTTP 403", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/admin/demo-projects", {
        method: "GET",
        headers: { "x-user-id": "unauthorized" },
      });

      const res = await getAdminDemos(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error).toContain("Forbidden");
    });

    it("returns all projects and accurate statistics for authorized admin", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/admin/demo-projects", {
        method: "GET",
        headers: { "x-user-id": "admin-1" },
      });

      const res = await getAdminDemos(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(Array.isArray(json.projects)).toBe(true);
      expect(json.projects.length).toBe(47);
      expect(json.stats.total).toBe(47);
      expect(json.stats.live).toBe(8);
      expect(json.stats.comingSoon).toBe(39);
    });

    it("filters demo projects by search keyword", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/admin/demo-projects?search=EstateVista", {
        method: "GET",
        headers: { "x-user-id": "admin-1" },
      });

      const res = await getAdminDemos(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.projects.length).toBe(1);
      expect(json.projects[0].name).toBe("EstateVista");
    });

    it("filters demo projects by status (LIVE)", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/admin/demo-projects?status=LIVE", {
        method: "GET",
        headers: { "x-user-id": "admin-1" },
      });

      const res = await getAdminDemos(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.projects.length).toBe(8);
      json.projects.forEach((p: any) => expect(p.status).toBe("Live Demo"));
    });

    it("rejects project creation missing name or shortDescription with HTTP 400", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/admin/demo-projects", {
        method: "POST",
        headers: { "x-user-id": "admin-1", "Content-Type": "application/json" },
        body: JSON.stringify({ category: "Healthcare" }),
      });

      const res = await createAdminDemo(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain("required");
    });

    it("accepts valid demo project creation with HTTP 201", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/admin/demo-projects", {
        method: "POST",
        headers: { "x-user-id": "admin-1", "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "OmniSupply",
          category: "Logistics",
          shortDescription: "Enterprise supply chain tracking demonstration.",
          targetAudience: "Global distributors",
          features: ["Fleet GPS", "Route Optimization"],
          status: "Coming Soon",
        }),
      });

      const res = await createAdminDemo(req);
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.project.name).toBe("OmniSupply");
    });

    it("fetches single demo project via GET /api/v1/admin/demo-projects/[id]", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/admin/demo-projects/estatevista", {
        method: "GET",
        headers: { "x-user-id": "admin-1" },
      });

      const res = await getSingleAdminDemo(req, {
        params: Promise.resolve({ id: "estatevista" }),
      });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.project.name).toBe("EstateVista");
    });

    it("updates demo project metadata via PATCH /api/v1/admin/demo-projects/[id]", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/admin/demo-projects/estatevista", {
        method: "PATCH",
        headers: { "x-user-id": "admin-1", "Content-Type": "application/json" },
        body: JSON.stringify({
          shortDescription: "Updated high-precision architectural luxury portal.",
          isFeatured: true,
        }),
      });

      const res = await patchAdminDemo(req, {
        params: Promise.resolve({ id: "estatevista" }),
      });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.project.shortDescription).toContain("Updated high-precision");
    });

    it("archives a demo project via DELETE /api/v1/admin/demo-projects/[id]", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/admin/demo-projects/estatevista", {
        method: "DELETE",
        headers: { "x-user-id": "admin-1" },
      });

      const res = await deleteAdminDemo(req, {
        params: Promise.resolve({ id: "estatevista" }),
      });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
    });
  });
});
