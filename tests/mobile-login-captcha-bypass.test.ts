import { describe, it, expect, vi } from "vitest";
import { POST } from "../src/app/api/v1/auth/login/route";
import { NextRequest } from "next/server";
import { db } from "../src/lib/db";

describe("Mobile App vs Web Authentication Protection", () => {
  it("blocks web login requests when captcha is missing", async () => {
    const req = new NextRequest("http://localhost:3000/api/v1/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
      },
      body: JSON.stringify({
        email: "admin@axivontech.in",
        password: "wrongpassword",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.code).toBe("MISSING_TOKEN");
  });

  it("permits mobile app requests to verify credentials without requiring reCAPTCHA token", async () => {
    vi.spyOn(db.user, "findUnique").mockResolvedValueOnce(null as any);

    const req = new NextRequest("http://localhost:3000/api/v1/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-axivon-app": "1",
        "user-agent": "Mozilla/5.0 (Linux; Android 14) AxivonApp/1.0.1",
      },
      body: JSON.stringify({
        email: "nonexistent.user.test@axivontech.in",
        password: "SomePassword123",
      }),
    });

    const res = await POST(req);
    // Should NOT be 400 MISSING_TOKEN; should proceed to database query and return 401 Invalid email or password
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.message || data.error?.message).toBe("Invalid email or password");
  });
});
