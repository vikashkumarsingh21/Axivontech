import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST, GET } from "../src/app/api/v1/auth/logout/route";

vi.mock("@/lib/db", () => ({
  db: {
    session: {
      deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    auditLog: {
      create: vi.fn().mockResolvedValue({ id: "audit-1" }),
    },
  },
}));

vi.mock("@/lib/auth/session", () => ({
  verifySession: vi.fn().mockResolvedValue({ userId: "user-123", role: "ADMIN" }),
}));

describe("Logout Redirection & Session Termination Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET /api/v1/auth/logout should redirect browser directly to /login?logged_out=1", async () => {
    const req = new NextRequest("http://localhost:3000/api/v1/auth/logout", {
      method: "GET",
      headers: {
        cookie: "axivon_session=valid-test-token",
      },
    });

    const res = await GET(req);

    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toContain("/login?logged_out=1");
    // Cookie should be cleared
    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toBeDefined();
    expect(setCookie).toContain("axivon_session=");
  });

  it("POST /api/v1/auth/logout with form submission should 303 redirect to /login?logged_out=1", async () => {
    const req = new NextRequest("http://localhost:3000/api/v1/auth/logout", {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        accept: "text/html,application/xhtml+xml",
        cookie: "axivon_session=valid-test-token",
      },
    });

    const res = await POST(req);

    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toContain("/login?logged_out=1");
    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toBeDefined();
  });

  it("POST /api/v1/auth/logout from fetch/JSON client should return JSON with redirectTo field", async () => {
    const req = new NextRequest("http://localhost:3000/api/v1/auth/logout", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
        cookie: "axivon_session=valid-test-token",
      },
    });

    const res = await POST(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toBe("Logged out successfully");
    expect(body.redirectTo).toBe("/login?logged_out=1");
  });
});
