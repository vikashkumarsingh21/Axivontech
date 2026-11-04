import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { isAllowedAppRoute } from "@/features/app-mode/routing";
import { isPortalOrStandaloneRoute } from "@/lib/utils";
import { resolveRoleDashboardUrl, normalizeRole } from "@/lib/auth/roles";

describe("AxivonTech — Complete Separation of Public Website and Android Application", () => {
  describe("1. Route Policy & In-App Containment", () => {
    it("strictly disallows public marketing routes inside the Android Application", () => {
      const publicMarketingRoutes = [
        "/",
        "/about",
        "/services",
        "/careers",
        "/contact",
        "/blog",
        "/pricing",
        "/industries",
        "/portfolio",
        "/demo-projects",
      ];

      for (const route of publicMarketingRoutes) {
        expect(isAllowedAppRoute(route)).toBe(false);
      }
    });

    it("explicitly permits dedicated app and authenticated portal routes inside the Android Application", () => {
      const appAndPortalRoutes = [
        "/app",
        "/app/login",
        "/login",
        "/logout",
        "/admin",
        "/admin/dashboard",
        "/executive",
        "/executive/dashboard",
        "/employee",
        "/employee/dashboard",
        "/broker",
        "/broker/dashboard",
        "/manager",
        "/manager/dashboard",
        "/client",
        "/client/dashboard",
        "/auth/change-password",
        "/api/v1/auth/login",
      ];

      for (const route of appAndPortalRoutes) {
        expect(isAllowedAppRoute(route)).toBe(true);
      }
    });
  });

  describe("2. Public Layout & Standalone Route Isolation", () => {
    it("marks /app, /app/login and all authenticated portals as standalone routes to suppress public Navbar, Footer, and Marketing Widgets", () => {
      expect(isPortalOrStandaloneRoute("/app")).toBe(true);
      expect(isPortalOrStandaloneRoute("/app/login")).toBe(true);
      expect(isPortalOrStandaloneRoute("/admin/dashboard")).toBe(true);
      expect(isPortalOrStandaloneRoute("/employee/dashboard")).toBe(true);
      expect(isPortalOrStandaloneRoute("/broker/dashboard")).toBe(true);
      expect(isPortalOrStandaloneRoute("/executive/dashboard")).toBe(true);
      expect(isPortalOrStandaloneRoute("/manager/dashboard")).toBe(true);
      expect(isPortalOrStandaloneRoute("/client/dashboard")).toBe(true);
    });

    it("ensures public website routes are NOT marked as portal routes so marketing navigation renders properly for website visitors", () => {
      expect(isPortalOrStandaloneRoute("/")).toBe(false);
      expect(isPortalOrStandaloneRoute("/about")).toBe(false);
      expect(isPortalOrStandaloneRoute("/services")).toBe(false);
      expect(isPortalOrStandaloneRoute("/careers")).toBe(false);
      expect(isPortalOrStandaloneRoute("/contact")).toBe(false);
      expect(isPortalOrStandaloneRoute("/blog")).toBe(false);
    });
  });

  describe("3. Role-Based Portal Resolution for In-App Users", () => {
    it("routes ADMIN to Admin Portal (/admin/dashboard)", () => {
      expect(resolveRoleDashboardUrl("ADMIN")).toBe("/admin/dashboard");
    });

    it("routes FOUNDER and CO_FOUNDER to Executive Portal (/executive/dashboard)", () => {
      expect(resolveRoleDashboardUrl("FOUNDER")).toBe("/executive/dashboard");
      expect(resolveRoleDashboardUrl("CO_FOUNDER")).toBe("/executive/dashboard");
    });

    it("routes EMPLOYEE to Employee Portal (/employee/dashboard)", () => {
      expect(resolveRoleDashboardUrl("EMPLOYEE")).toBe("/employee/dashboard");
    });

    it("routes BUSINESS_PARTNER and BROKER alias to Partner Portal (/broker/dashboard)", () => {
      expect(resolveRoleDashboardUrl("BUSINESS_PARTNER")).toBe("/broker/dashboard");
      expect(resolveRoleDashboardUrl("BROKER")).toBe("/broker/dashboard");
    });

    it("routes DEPARTMENT_MANAGER and MANAGER alias to Manager Portal (/manager/dashboard)", () => {
      expect(resolveRoleDashboardUrl("DEPARTMENT_MANAGER")).toBe("/manager/dashboard");
      expect(resolveRoleDashboardUrl("MANAGER")).toBe("/manager/dashboard");
    });

    it("routes CLIENT to Client Portal (/client/dashboard)", () => {
      expect(resolveRoleDashboardUrl("CLIENT")).toBe("/client/dashboard");
    });
  });

  describe("4. Capacitor & Android Application Bundle Inspection", () => {
    it("configures mobile capacitor server URL to dedicated /app endpoint", () => {
      const configPath = path.join(process.cwd(), "mobile", "capacitor.config.json");
      const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

      expect(config.server.url).toBe("https://axivontech.in/app");
      expect(config.appendUserAgent).toContain("AxivonApp");
    });

    it("configures local fallback index.html to navigate to dedicated /app endpoint", () => {
      const indexPath = path.join(process.cwd(), "mobile", "dist", "index.html");
      const html = fs.readFileSync(indexPath, "utf-8");

      expect(html).toContain('window.location.replace("https://axivontech.in/app")');
      // Must not contain marketing content
      expect(html).not.toContain("Contact Us");
      expect(html).not.toContain("Our Services");
      expect(html).not.toContain("Careers at Axivon");
    });

    it("verifies mobile assets directory excludes public website marketing pages and components", () => {
      const distDir = path.join(process.cwd(), "mobile", "dist");
      const files = fs.readdirSync(distDir);

      // Dist directory must only contain index.html and assets/ (branding logos)
      expect(files).toContain("index.html");
      expect(files).toContain("assets");

      // Verify no public marketing pages are bundled locally
      expect(files).not.toContain("about");
      expect(files).not.toContain("services");
      expect(files).not.toContain("careers");
      expect(files).not.toContain("blog");
      expect(files).not.toContain("contact");
    });
  });

  describe("5. Dedicated App Route File Verification", () => {
    it("verifies existence of dedicated /app layout, entry point, and login pages", () => {
      const appLayoutPath = path.join(process.cwd(), "src", "app", "app", "layout.tsx");
      const appEntryPath = path.join(process.cwd(), "src", "app", "app", "page.tsx");
      const appLoginPath = path.join(process.cwd(), "src", "app", "app", "login", "page.tsx");

      expect(fs.existsSync(appLayoutPath)).toBe(true);
      expect(fs.existsSync(appEntryPath)).toBe(true);
      expect(fs.existsSync(appLoginPath)).toBe(true);
    });

    it("verifies dedicated /app/login imports no public website marketing components", () => {
      const appLoginContent = fs.readFileSync(
        path.join(process.cwd(), "src", "app", "app", "login", "page.tsx"),
        "utf-8"
      );

      // Verifies official company logo is used
      expect(appLoginContent).toContain("/assets/logo/logo-full.png");
      // Verifies authentication endpoint
      expect(appLoginContent).toContain("/api/v1/auth/login");
      // Verifies role resolver is wired
      expect(appLoginContent).toContain("resolveRoleDashboardUrl");

      // Verifies no public marketing imports
      expect(appLoginContent).not.toContain("@/components/Navbar");
      expect(appLoginContent).not.toContain("@/components/Footer");
      expect(appLoginContent).not.toContain("LoginPosterCarousel");
      expect(appLoginContent).not.toContain("ChatWidget");
      expect(appLoginContent).not.toContain("FloatingWhatsAppButton");
    });
  });
});
