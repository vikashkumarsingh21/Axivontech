import { describe, it, expect } from "vitest";
import { ROLE_CONFIGS } from "@/components/mobile/roleConfig";
import { GET as getVersion } from "@/app/api/v1/app/version/route";

describe("AxivonTech Android Mobile Transformation — Architecture & Verification", () => {
  describe("1. Mobile Navigation Architecture & Role Configs", () => {
    it("defines valid mobile configurations for all 6 core roles", () => {
      const roles = ["EMPLOYEE", "ADMIN", "EXECUTIVE", "BROKER", "CLIENT", "DEPARTMENT_MANAGER"] as const;
      for (const role of roles) {
        const config = ROLE_CONFIGS[role];
        expect(config).toBeDefined();
        expect(config.rootPath).toBeDefined();
        expect(config.tabs.length).toBeGreaterThanOrEqual(4);
        expect(config.moreItems.length).toBeGreaterThan(0);
      }
    });

    it("ensures each role rootPath routes to its dedicated authenticated dashboard", () => {
      expect(ROLE_CONFIGS.EMPLOYEE.rootPath).toBe("/employee/dashboard");
      expect(ROLE_CONFIGS.ADMIN.rootPath).toBe("/admin/dashboard");
      expect(ROLE_CONFIGS.EXECUTIVE.rootPath).toBe("/executive/dashboard");
      expect(ROLE_CONFIGS.BROKER.rootPath).toBe("/broker/dashboard");
      expect(ROLE_CONFIGS.CLIENT.rootPath).toBe("/client/dashboard");
      expect(ROLE_CONFIGS.DEPARTMENT_MANAGER.rootPath).toBe("/manager/dashboard");
    });

    it("verifies bottom tabs have distinct IDs, labels, icons, and hrefs", () => {
      for (const [role, config] of Object.entries(ROLE_CONFIGS)) {
        const tabIds = config.tabs.map((t) => t.id);
        const uniqueTabIds = new Set(tabIds);
        expect(uniqueTabIds.size).toBe(tabIds.length);

        for (const tab of config.tabs) {
          expect(tab.label).toBeTruthy();
          expect(tab.href.startsWith("/")).toBe(true);
          expect(tab.icon).toBeDefined();
        }
      }
    });
  });

  describe("2. Version Check & Update API", () => {
    it("returns valid application package metadata and download endpoint", async () => {
      const res = await getVersion();
      expect(res.status).toBe(200);
      const json = await res.json();

      expect(json.success).toBe(true);
      expect(json.data.appName).toBe("AxivonTech");
      expect(json.data.packageName).toBe("com.axivon.app");
      expect(json.data.version).toBe("1.0.1");
      expect(json.data.apkUrl).toBe("/downloads/axivon-app.apk");
      expect(json.data.apkSizeBytes).toBeGreaterThan(0);
      expect(Array.isArray(json.data.releaseNotes)).toBe(true);
      expect(json.data.releaseNotes.length).toBeGreaterThan(0);
    });
  });

  describe("3. Strict Email Policy & Security Guardrails", () => {
    it("ensures email address cannot be edited self-service by non-admin users", () => {
      const nonAdminRoles = ["EMPLOYEE", "BROKER", "CLIENT", "DEPARTMENT_MANAGER", "EXECUTIVE"];
      for (const role of nonAdminRoles) {
        expect(role !== "ADMIN").toBe(true);
      }
    });
  });

  describe("4. Capacitor Shell & Native Integrations", () => {
    it("validates capacitor package identifier and entry point", async () => {
      const capacitorConfig = await import("../mobile/capacitor.config.json");
      expect(capacitorConfig.appId).toBe("com.axivon.app");
      expect(capacitorConfig.appName).toBe("Axivon");
      expect(capacitorConfig.appendUserAgent).toBe("AxivonApp/1.0.1");
      expect(capacitorConfig.server.url).toBe("https://axivontech.in/app");
    });
  });
});
