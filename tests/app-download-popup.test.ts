import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET as getAppVersion } from "@/app/api/v1/app/version/route";

describe("Mobile App Download Popup Integration Tests", () => {
  it("GET /api/v1/app/version returns valid payload with apkUrl and popupEnabled for both nested and flat consumers", async () => {
    const res = await getAppVersion();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);

    // 1. Nested data structure (consumed by MobileProfileSettings & new APIs)
    expect(json.data).toBeDefined();
    expect(json.data.apkUrl).toBeTruthy();
    expect(json.data.version).toBeTruthy();
    expect(json.data.popupEnabled).toBe(true);

    // 2. Root-level properties (consumed by PortalAppPromptWrapper, UpdateGate & legacy clients)
    expect(json.apkUrl).toBe(json.data.apkUrl);
    expect(json.latestVersion).toBe(json.data.version);
    expect(json.popupEnabled).toBe(true);
    expect(json.enabled).toBe(true);
  });

  it("PortalAppPromptWrapper correctly resolves apkConfigured and popupEnabled from version response", async () => {
    const res = await getAppVersion();
    const data = await res.json();

    const payload = data?.data || data;
    const apkUrl = payload?.apkUrl || data?.apkUrl || payload?.downloadUrl || data?.downloadUrl;
    const popupEnabled = payload?.popupEnabled !== false && data?.popupEnabled !== false;
    const enabled = payload?.enabled !== false && data?.enabled !== false;

    const appConfig = {
      enabled,
      popupEnabled,
      apkConfigured: Boolean(apkUrl),
    };

    expect(appConfig.enabled).toBe(true);
    expect(appConfig.popupEnabled).toBe(true);
    expect(appConfig.apkConfigured).toBe(true);
  });

  it("ensures portal routes are covered and distinguished from mobile app mode", () => {
    const PORTAL_PREFIXES = [
      "/admin",
      "/executive",
      "/employee",
      "/broker",
      "/client",
      "/manager",
    ];

    const testRoutes = [
      { path: "/employee/dashboard", isPortal: true },
      { path: "/admin/users", isPortal: true },
      { path: "/broker/leads", isPortal: true },
      { path: "/client/projects", isPortal: true },
      { path: "/manager/team", isPortal: true },
      { path: "/executive/overview", isPortal: true },
      { path: "/", isPortal: false },
      { path: "/about", isPortal: false },
      { path: "/contact", isPortal: false },
    ];

    for (const test of testRoutes) {
      const match = PORTAL_PREFIXES.some(
        (prefix) => test.path === prefix || test.path.startsWith(`${prefix}/`)
      );
      expect(match).toBe(test.isPortal);
    }
  });
});
