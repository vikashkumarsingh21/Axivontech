import { describe, it, expect, vi, beforeEach } from "vitest";
import { mobileApi, MobileApiError } from "@/lib/mobile/api-client";
import { normalizeRole, resolveRoleDashboardUrl, canAccessPartnerPortal, isBusinessPartnerRole, isDepartmentManagerRole } from "@/lib/auth/roles";
import { generateStrongPassword, validatePasswordStrength } from "@/lib/auth/password-utils";

describe("Mobile Application Backend Integration & Verification Suite", () => {
  // ─── 1. Central Mobile API Client Tests ────────────────────────────────────
  describe("1. Central Mobile API Client Core Functionality", () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it("should instantiate with proper default configuration and allow baseUrl override", () => {
      expect(mobileApi).toBeDefined();
      expect(mobileApi.getBaseUrl()).toBeDefined();

      const originalBase = mobileApi.getBaseUrl();
      mobileApi.setBaseUrl("https://api.axivontech.in");
      expect(mobileApi.getBaseUrl()).toBe("https://api.axivontech.in");
      mobileApi.setBaseUrl(originalBase); // restore
    });

    it("should inject persistent headers, credentials: 'include', and parse JSON responses", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ success: true, data: { status: "ACTIVE" } }),
      });
      global.fetch = mockFetch;

      const result = await mobileApi.get("/api/v1/auth/session");

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, init] = mockFetch.mock.calls[0];
      expect(url).toContain("/api/v1/auth/session");
      expect(init.credentials).toBe("include");
      expect(init.headers["X-Requested-With"]).toBe("AxivonApp");
      expect(init.headers["X-Axivon-Client"]).toBe("AndroidMobileApp/1.0.0");
      expect(result.success).toBe(true);
      expect(result.data.status).toBe("ACTIVE");
    });

    it("should construct query strings accurately with parameter filtering", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ success: true, leads: [] }),
      });
      global.fetch = mockFetch;

      await mobileApi.get("/api/v1/broker/leads", {
        status: "CONVERTED",
        limit: 25,
        page: 1,
        emptyVal: undefined,
        nullVal: null,
      });

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain("status=CONVERTED");
      expect(url).toContain("limit=25");
      expect(url).toContain("page=1");
      expect(url).not.toContain("emptyVal");
      expect(url).not.toContain("nullVal");
    });

    it("should serialize JSON payloads on POST and PATCH mutations", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ success: true, leadId: "lead-101" }),
      });
      global.fetch = mockFetch;

      const payload = {
        clientName: "Acme Corp",
        clientEmail: "contact@acme.com",
        clientPhone: "+91 9876543210",
        estimatedBudget: 500000,
      };

      const res = await mobileApi.post("/api/v1/broker/leads", payload);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [, init] = mockFetch.mock.calls[0];
      expect(init.method).toBe("POST");
      expect(init.headers["Content-Type"]).toBe("application/json");
      expect(JSON.parse(init.body)).toEqual(payload);
      expect(res.leadId).toBe("lead-101");
    });

    it("should throw MobileApiError with status code, message, and error details on failure", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({
          error: "Forbidden: Cross-department access violation",
          code: "DEPT_FORBIDDEN",
        }),
      });
      global.fetch = mockFetch;

      await expect(mobileApi.post("/api/v1/manager/tasks", {})).rejects.toThrow(MobileApiError);

      try {
        await mobileApi.post("/api/v1/manager/tasks", {});
      } catch (err: any) {
        expect(err).toBeInstanceOf(MobileApiError);
        expect(err.statusCode).toBe(403);
        expect(err.message).toContain("Cross-department access violation");
        expect(err.code).toBe("DEPT_FORBIDDEN");
      }
    });

    it("should enforce maximum file size limits during multipart uploads", async () => {
      const mockFormData = new FormData();
      // Create a mock oversized blob (16 MB)
      const bigBuffer = new Uint8Array(16 * 1024 * 1024);
      const file = new File([bigBuffer], "large-contract.pdf", { type: "application/pdf" });
      mockFormData.append("document", file);

      await expect(
        mobileApi.upload("/api/v1/documents/upload", mockFormData, { maxSizeBytes: 15 * 1024 * 1024 })
      ).rejects.toThrow(/exceeds maximum allowed size/);
    });

    it("should retry idempotent GET requests on network failures with exponential backoff", async () => {
      let callCount = 0;
      const mockFetch = vi.fn().mockImplementation(async () => {
        callCount++;
        if (callCount < 2) {
          throw new Error("Network transient disconnect");
        }
        return {
          ok: true,
          status: 200,
          headers: new Headers({ "content-type": "application/json" }),
          json: async () => ({ success: true, attempts: callCount }),
        };
      });
      global.fetch = mockFetch;

      const res = await mobileApi.get("/api/v1/employee/dashboard", undefined, { retries: 2 });
      expect(res.attempts).toBe(2);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it("should NOT retry non-idempotent POST operations on network failure", async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error("Network drop during POST"));
      global.fetch = mockFetch;

      await expect(
        mobileApi.post("/api/v1/employee/attendance/check-in", { note: "Morning clock in" })
      ).rejects.toThrow(/Network drop/);

      expect(mockFetch).toHaveBeenCalledTimes(1); // Never retried
    });
  });

  // ─── 2. Authentication, Roles & Session Persistence ──────────────────────
  describe("2. Authentication, Roles & Session Persistence", () => {
    it("should normalize roles consistently across canonical names and legacy aliases", () => {
      expect(normalizeRole("BROKER")).toBe("BUSINESS_PARTNER");
      expect(normalizeRole("broker")).toBe("BUSINESS_PARTNER");
      expect(normalizeRole("BUSINESS_PARTNER")).toBe("BUSINESS_PARTNER");
      expect(normalizeRole("partner")).toBe("BUSINESS_PARTNER");
      expect(normalizeRole("MANAGER")).toBe("DEPARTMENT_MANAGER");
      expect(normalizeRole("department_manager")).toBe("DEPARTMENT_MANAGER");
      expect(normalizeRole("ADMIN")).toBe("ADMIN");
      expect(normalizeRole("FOUNDER")).toBe("FOUNDER");
      expect(normalizeRole("CO_FOUNDER")).toBe("CO_FOUNDER");
      expect(normalizeRole("EMPLOYEE")).toBe("EMPLOYEE");
      expect(normalizeRole("CLIENT")).toBe("CLIENT");
      expect(normalizeRole(null)).toBe("USER");
    });

    it("should resolve correct role dashboard URL without leaking desktop views", () => {
      expect(resolveRoleDashboardUrl("FOUNDER")).toBe("/executive/dashboard");
      expect(resolveRoleDashboardUrl("CO_FOUNDER")).toBe("/executive/dashboard");
      expect(resolveRoleDashboardUrl("ADMIN")).toBe("/admin/dashboard");
      expect(resolveRoleDashboardUrl("DEPARTMENT_MANAGER")).toBe("/manager/dashboard");
      expect(resolveRoleDashboardUrl("MANAGER")).toBe("/manager/dashboard");
      expect(resolveRoleDashboardUrl("BUSINESS_PARTNER")).toBe("/broker/dashboard");
      expect(resolveRoleDashboardUrl("BROKER")).toBe("/broker/dashboard");
      expect(resolveRoleDashboardUrl("CLIENT")).toBe("/client/dashboard");
      expect(resolveRoleDashboardUrl("EMPLOYEE")).toBe("/employee/dashboard");
    });

    it("should verify equal executive authority for Founder and Co-Founder", () => {
      expect(canAccessPartnerPortal("FOUNDER")).toBe(true);
      expect(canAccessPartnerPortal("CO_FOUNDER")).toBe(true);
      expect(canAccessPartnerPortal("ADMIN")).toBe(true);
      expect(canAccessPartnerPortal("BUSINESS_PARTNER")).toBe(true);
      expect(canAccessPartnerPortal("BROKER")).toBe(true);
      expect(canAccessPartnerPortal("EMPLOYEE")).toBe(false);
      expect(canAccessPartnerPortal("CLIENT")).toBe(false);
    });

    it("should generate cryptographically sound passwords without confusing characters", () => {
      for (let i = 0; i < 25; i++) {
        const pwd = generateStrongPassword(14);
        expect(pwd.length).toBeGreaterThanOrEqual(14);
        // Excludes 0, O, o, 1, l, I
        expect(pwd).not.toMatch(/[0Oo1lI]/);
        // Has all 4 character classes
        expect(pwd).toMatch(/[a-z]/);
        expect(pwd).toMatch(/[A-Z]/);
        expect(pwd).toMatch(/[0-9]/);
        expect(pwd).toMatch(/[^a-zA-Z0-9]/);

        const check = validatePasswordStrength(pwd);
        expect(check.isValid).toBe(true);
        expect(check.score).toBeGreaterThanOrEqual(3);
      }
    });

    it("should reject weak manual passwords with explicit descriptive errors", () => {
      const weak = validatePasswordStrength("weak");
      expect(weak.isValid).toBe(false);
      expect(weak.errors.length).toBeGreaterThan(0);
      expect(weak.errors.some((e) => e.includes("at least 10 characters"))).toBe(true);
    });
  });

  // ─── 3. Domain API Namespaces ─────────────────────────────────────────────
  describe("3. Domain API Namespaces Verification", () => {
    it("should expose typed auth methods", () => {
      expect(typeof mobileApi.auth.login).toBe("function");
      expect(typeof mobileApi.auth.getSession).toBe("function");
      expect(typeof mobileApi.auth.logout).toBe("function");
      expect(typeof mobileApi.auth.changePassword).toBe("function");
    });

    it("should expose typed employee methods covering all attendance, tasks, leaves, and reports", () => {
      expect(typeof mobileApi.employee.getDashboard).toBe("function");
      expect(typeof mobileApi.employee.getAttendance).toBe("function");
      expect(typeof mobileApi.employee.checkIn).toBe("function");
      expect(typeof mobileApi.employee.checkOut).toBe("function");
      expect(typeof mobileApi.employee.toggleBreak).toBe("function");
      expect(typeof mobileApi.employee.getTasks).toBe("function");
      expect(typeof mobileApi.employee.updateTaskStatus).toBe("function");
      expect(typeof mobileApi.employee.getWorkReports).toBe("function");
      expect(typeof mobileApi.employee.submitWorkReport).toBe("function");
      expect(typeof mobileApi.employee.getLeave).toBe("function");
      expect(typeof mobileApi.employee.applyLeave).toBe("function");
      expect(typeof mobileApi.employee.getNotifications).toBe("function");
      expect(typeof mobileApi.employee.getProfile).toBe("function");
    });

    it("should expose typed broker methods covering leads, earnings, payouts, and contracts", () => {
      expect(typeof mobileApi.broker.getDashboard).toBe("function");
      expect(typeof mobileApi.broker.getLeads).toBe("function");
      expect(typeof mobileApi.broker.registerLead).toBe("function");
      expect(typeof mobileApi.broker.getProjects).toBe("function");
      expect(typeof mobileApi.broker.getCommissions).toBe("function");
      expect(typeof mobileApi.broker.requestPayout).toBe("function");
      expect(typeof mobileApi.broker.getContracts).toBe("function");
      expect(typeof mobileApi.broker.getProfile).toBe("function");
      expect(typeof mobileApi.broker.updateProfile).toBe("function");
    });

    it("should expose typed manager methods scoped to department boundaries", () => {
      expect(typeof mobileApi.manager.getDashboard).toBe("function");
      expect(typeof mobileApi.manager.getEmployees).toBe("function");
      expect(typeof mobileApi.manager.getTasks).toBe("function");
      expect(typeof mobileApi.manager.assignTask).toBe("function");
      expect(typeof mobileApi.manager.getAttendance).toBe("function");
      expect(typeof mobileApi.manager.getLeaveRequests).toBe("function");
      expect(typeof mobileApi.manager.reviewLeave).toBe("function");
      expect(typeof mobileApi.manager.getWorkReports).toBe("function");
    });

    it("should expose typed admin methods covering applications, employees, and app settings", () => {
      expect(typeof mobileApi.admin.getDashboard).toBe("function");
      expect(typeof mobileApi.admin.getApplications).toBe("function");
      expect(typeof mobileApi.admin.approveApplication).toBe("function");
      expect(typeof mobileApi.admin.getEmployees).toBe("function");
      expect(typeof mobileApi.admin.getDepartments).toBe("function");
      expect(typeof mobileApi.admin.getTasks).toBe("function");
      expect(typeof mobileApi.admin.getAttendance).toBe("function");
      expect(typeof mobileApi.admin.getLeads).toBe("function");
    });

    it("should expose typed executive governance methods for 50-50 oversight", () => {
      expect(typeof mobileApi.executive.getDashboard).toBe("function");
      expect(typeof mobileApi.executive.getApprovals).toBe("function");
      expect(typeof mobileApi.executive.reviewApproval).toBe("function");
      expect(typeof mobileApi.executive.getPeople).toBe("function");
      expect(typeof mobileApi.executive.getReports).toBe("function");
    });

    it("should expose typed client methods for projects, documents, and invoices", () => {
      expect(typeof mobileApi.client.getDashboard).toBe("function");
      expect(typeof mobileApi.client.getProjects).toBe("function");
      expect(typeof mobileApi.client.getDocuments).toBe("function");
      expect(typeof mobileApi.client.getInvoices).toBe("function");
      expect(typeof mobileApi.client.getTickets).toBe("function");
      expect(typeof mobileApi.client.createTicket).toBe("function");
    });

    it("should expose typed shared notification methods", () => {
      expect(typeof mobileApi.notifications.getAll).toBe("function");
      expect(typeof mobileApi.notifications.getUnreadCount).toBe("function");
      expect(typeof mobileApi.notifications.markRead).toBe("function");
      expect(typeof mobileApi.notifications.markAllRead).toBe("function");
    });
  });
});
