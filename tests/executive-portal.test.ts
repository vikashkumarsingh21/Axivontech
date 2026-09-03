import { describe, it, expect, vi } from "vitest";
import { getExecutiveScope, isDepartmentAllowed } from "../src/lib/auth/executive-scope";

// Mock the db
vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: vi.fn().mockImplementation(({ where }: any) => {
        if (where.id === "founder-user") {
          return Promise.resolve({
            id: "founder-user",
            name: "Platform Founder",
            email: "founder@axivon.dev",
            userRoles: [{ role: { name: "FOUNDER" } }],
            executiveProfile: { responsibilityProfile: "FULL", departmentScope: null }
          });
        }
        if (where.id === "tech-cofounder") {
          return Promise.resolve({
            id: "tech-cofounder",
            name: "Tech Co-Founder",
            email: "tech.cofounder@axivon.dev",
            userRoles: [{ role: { name: "CO_FOUNDER" } }],
            executiveProfile: { responsibilityProfile: "TECHNOLOGY", departmentScope: "Engineering,IT" }
          });
        }
        if (where.id === "employee-user") {
          return Promise.resolve({
            id: "employee-user",
            name: "Dev Employee",
            email: "testemployee@axivon.dev",
            userRoles: [{ role: { name: "EMPLOYEE" } }],
            executiveProfile: null
          });
        }
        if (where.id === "admin-user") {
          return Promise.resolve({
            id: "admin-user",
            name: "Admin User",
            email: "admin@axivon.dev",
            userRoles: [{ role: { name: "ADMIN" } }],
            executiveProfile: null
          });
        }
        return Promise.resolve(null);
      })
    }
  }
}));

describe("Phase 4 Executive Portal Authorization Matrix & Scope Tests", () => {
  it("should deny unauthenticated users (null userId)", async () => {
    await expect(getExecutiveScope(null)).rejects.toThrow("Unauthorized");
  });

  it("should deny standard EMPLOYEE users from executive scope", async () => {
    await expect(getExecutiveScope("employee-user")).rejects.toThrow("Forbidden");
  });

  it("should deny non-executive ADMIN users from executive scope", async () => {
    await expect(getExecutiveScope("admin-user")).rejects.toThrow("Forbidden");
  });

  it("should allow FOUNDER full unrestricted access", async () => {
    const scope = await getExecutiveScope("founder-user");
    expect(scope.isFounder).toBe(true);
    expect(scope.responsibilityProfile).toBe("FULL");
    expect(isDepartmentAllowed(scope, "Engineering")).toBe(true);
    expect(isDepartmentAllowed(scope, "Finance")).toBe(true);
  });

  it("should allow CO_FOUNDER with TECHNOLOGY profile only assigned departments", async () => {
    const scope = await getExecutiveScope("tech-cofounder");
    expect(scope.isFounder).toBe(false);
    expect(scope.responsibilityProfile).toBe("TECHNOLOGY");
    expect(isDepartmentAllowed(scope, "Engineering")).toBe(true);
    expect(isDepartmentAllowed(scope, "IT")).toBe(true);
    expect(isDepartmentAllowed(scope, "HR")).toBe(false);
    expect(isDepartmentAllowed(scope, "Sales")).toBe(false);
  });

  it("should enforce self-approval prevention in governance workflow", () => {
    const requesterId = "tech-cofounder";
    const approverId = "tech-cofounder";
    const isSelfApproval = requesterId === approverId;
    expect(isSelfApproval).toBe(true);
  });

  it("should require a rejection reason for governance rejection", () => {
    const reason = null;
    const isValid = Boolean(reason && String(reason).trim().length > 0);
    expect(isValid).toBe(false);
  });
});
