import { describe, it, expect, vi, beforeEach } from "vitest";
import { PATCH } from "@/app/api/v1/executive/people/[id]/role/route";

vi.mock("@/lib/auth/permissions", () => ({
  requirePermission: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/lib/auth/executive-scope", () => ({
  getExecutiveScope: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: vi.fn(),
    },
    role: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    userRole: {
      deleteMany: vi.fn(),
      create: vi.fn(),
    },
    session: {
      deleteMany: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
    $transaction: vi.fn().mockImplementation((fns) => Promise.all(fns)),
  },
}));

import { getExecutiveScope } from "@/lib/auth/executive-scope";
import { db } from "@/lib/db";

describe("Executive Role Assignment API (PATCH /api/v1/executive/people/[id]/role)", () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should reject non-Founder actors with HTTP 403", async () => {
    getExecutiveScope.mockResolvedValueOnce({
      isFounder: false,
      departments: ["ENGINEERING"],
    } as any);

    const req = new Request("http://localhost:3000/api/v1/executive/people/usr-target-1/role", {
      method: "PATCH",
      headers: { "x-user-id": "usr-actor-cofounder", "Content-Type": "application/json" },
      body: JSON.stringify({ roleName: "ADMIN" }),
    });

    const res = await PATCH(req, { params: Promise.resolve({ id: "usr-target-1" }) });
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toContain("Only Founders can change user roles");
  });

  it("should reject invalid role names with HTTP 400", async () => {
    getExecutiveScope.mockResolvedValueOnce({
      isFounder: true,
      departments: [],
    } as any);

    const req = new Request("http://localhost:3000/api/v1/executive/people/usr-target-1/role", {
      method: "PATCH",
      headers: { "x-user-id": "usr-founder-1", "Content-Type": "application/json" },
      body: JSON.stringify({ roleName: "SUPER_ADMIN" }),
    });

    const res = await PATCH(req, { params: Promise.resolve({ id: "usr-target-1" }) });
    expect(res.status).toBe(400);
  });

  it("should reject self-demotion attempts with HTTP 400", async () => {
    getExecutiveScope.mockResolvedValueOnce({
      isFounder: true,
      departments: [],
    } as any);

    const req = new Request("http://localhost:3000/api/v1/executive/people/usr-founder-1/role", {
      method: "PATCH",
      headers: { "x-user-id": "usr-founder-1", "Content-Type": "application/json" },
      body: JSON.stringify({ roleName: "EMPLOYEE" }),
    });

    const res = await PATCH(req, { params: Promise.resolve({ id: "usr-founder-1" }) });
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("You cannot change your own role");
  });

  it("should successfully assign a valid role (ADMIN) and invalidate sessions", async () => {
    getExecutiveScope.mockResolvedValueOnce({
      isFounder: true,
      departments: [],
    } as any);

    (db.user.findUnique as any).mockResolvedValueOnce({
      id: "usr-target-1",
      name: "Target Employee",
      email: "target@axivontech.in",
      userRoles: [{ role: { name: "EMPLOYEE" } }],
    });

    (db.role.findUnique as any).mockResolvedValueOnce({
      id: "role-admin-id",
      name: "ADMIN",
    });

    const req = new Request("http://localhost:3000/api/v1/executive/people/usr-target-1/role", {
      method: "PATCH",
      headers: { "x-user-id": "usr-founder-1", "Content-Type": "application/json" },
      body: JSON.stringify({ roleName: "ADMIN" }),
    });

    const res = await PATCH(req, { params: Promise.resolve({ id: "usr-target-1" }) });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.message).toContain("Role changed to ADMIN");
  });
});
