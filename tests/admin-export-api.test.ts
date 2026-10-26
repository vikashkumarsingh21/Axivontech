import { describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST as previewHandler } from "../src/app/api/v1/admin/export/partners/preview/route";
import { POST as exportHandler } from "../src/app/api/v1/admin/export/partners/route";

describe("Admin Export API Endpoints Security & Permissions", () => {
  it("rejects non-admin role (EMPLOYEE) with 403 Forbidden", async () => {
    const req = new NextRequest("http://localhost:3000/api/v1/admin/export/partners/preview", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": "user_emp_123",
        "x-user-role": "EMPLOYEE",
      },
      body: JSON.stringify({ type: "APPLICATIONS" }),
    });

    const res = await previewHandler(req);
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error.message || json.message || json.error).toContain("Forbidden");
  });

  it("rejects non-admin role (BROKER) with 403 Forbidden", async () => {
    const req = new NextRequest("http://localhost:3000/api/v1/admin/export/partners", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": "user_broker_123",
        "x-user-role": "BUSINESS_PARTNER",
      },
      body: JSON.stringify({ type: "CONFIRMED_PARTNERS" }),
    });

    const res = await exportHandler(req);
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error.message || json.message || json.error).toContain("Forbidden");
  });

  it("rejects unauthenticated request (missing x-user-id) with 401 Unauthorized", async () => {
    const req = new NextRequest("http://localhost:3000/api/v1/admin/export/partners/preview", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ type: "APPLICATIONS" }),
    });

    const res = await previewHandler(req);
    expect(res.status).toBe(401);
  });
});
