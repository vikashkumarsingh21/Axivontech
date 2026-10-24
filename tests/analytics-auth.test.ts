import { describe, it, expect } from "vitest";
import { signSession, getAuthenticatedSession } from "@/lib/auth/session";

describe("Analytics API Authorization & Session Integrity", () => {
  const validUser = {
    userId: "usr_founder_001",
    role: "FOUNDER",
    sessionId: "sess_test_123",
  };

  it("should reject requests without any session cookie or token (401 Unauthorized)", async () => {
    const req = new Request("http://localhost:3000/api/v1/analytics/finance", {
      method: "GET",
      headers: new Headers(),
    });

    await expect(getAuthenticatedSession(req)).rejects.toThrow(/Authentication required/);
  });

  it("should reject forged caller-supplied x-user-id header without valid session cookie", async () => {
    // Attacker sends forged x-user-id in headers
    const req = new Request("http://localhost:3000/api/v1/analytics/finance", {
      method: "GET",
      headers: new Headers({
        "x-user-id": "usr_founder_001",
        "x-user-role": "FOUNDER",
        "x-forged-test": "true",
      }),
    });

    await expect(getAuthenticatedSession(req)).rejects.toThrow(/Authentication required/);
  });

  it("should reject invalid or tampered session token", async () => {
    const req = new Request("http://localhost:3000/api/v1/analytics/finance", {
      method: "GET",
      headers: new Headers({
        cookie: "axivon_session=tampered.invalid.jwt.token",
      }),
    });

    await expect(getAuthenticatedSession(req)).rejects.toThrow(/Invalid or expired session/);
  });

  it("should successfully authenticate when a valid signed session cookie is provided", async () => {
    const token = await signSession(validUser);

    const req = new Request("http://localhost:3000/api/v1/analytics/finance", {
      method: "GET",
      headers: new Headers({
        cookie: `axivon_session=${token}`,
      }),
    });

    const session = await getAuthenticatedSession(req);
    expect(session.userId).toBe(validUser.userId);
    expect(session.role).toBe(validUser.role);
  });

  it("should ignore spoofed x-user-id even when a valid session belongs to another user", async () => {
    const employeeUser = {
      userId: "usr_employee_999",
      role: "EMPLOYEE",
      sessionId: "sess_employee_999",
    };
    const employeeToken = await signSession(employeeUser);

    // Attacker has an employee session cookie, but sends x-user-id: usr_founder_001 in headers
    const req = new Request("http://localhost:3000/api/v1/analytics/finance", {
      method: "GET",
      headers: new Headers({
        cookie: `axivon_session=${employeeToken}`,
        "x-user-id": "usr_founder_001",
        "x-user-role": "FOUNDER",
      }),
    });

    const session = await getAuthenticatedSession(req);
    // Identity must come strictly from the signed JWT payload, not the spoofed header
    expect(session.userId).toBe("usr_employee_999");
    expect(session.role).toBe("EMPLOYEE");
  });
});
