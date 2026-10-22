import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST as loginPOST } from "@/app/api/v1/auth/login/route";
import {
  clearUsedRecaptchaTokensCacheForTesting,
  RECAPTCHA_TEST_KEYS,
} from "@/lib/captcha/recaptcha";
import { clearUsedTokensCacheForTesting } from "@/lib/captcha/turnstile";

// Mock DB interactions
const mockFindUniqueUser = vi.fn();
const mockCreateSession = vi.fn();
const mockCreateAuditLog = vi.fn();
const mockVerifyPassword = vi.fn();
const mockSignSession = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: (...args: any[]) => mockFindUniqueUser(...args),
    },
    session: {
      create: (...args: any[]) => mockCreateSession(...args),
    },
    auditLog: {
      create: (...args: any[]) => mockCreateAuditLog(...args),
    },
  },
}));

vi.mock("@/lib/auth/password", () => ({
  verifyPassword: (...args: any[]) => mockVerifyPassword(...args),
}));

vi.mock("@/lib/auth/session", () => ({
  signSession: (...args: any[]) => mockSignSession(...args),
}));

function createLoginRequest(body: Record<string, any>, ip = "192.168.1.100") {
  return new NextRequest("http://localhost:3000/api/v1/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": ip,
      "user-agent": "Vitest-Test-Agent",
    },
    body: JSON.stringify(body),
  });
}

describe("AXIVON ONE: Login Route Anti-Bot & CAPTCHA Verification Security Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearUsedRecaptchaTokensCacheForTesting();
    clearUsedTokensCacheForTesting();
  });

  describe("1. Anti-Bot & CAPTCHA Enforcement on /api/v1/auth/login", () => {
    it("rejects login attempt with HTTP 400 when anti-bot token is missing", async () => {
      const req = createLoginRequest(
        {
          email: "admin@axivontech.in",
          password: "SecurePassword123!",
        },
        "10.0.0.1"
      );

      const res = await loginPOST(req);
      expect(res.status).toBe(400);

      const data = await res.json();
      expect(data.error).toBe("Please complete the human verification before submitting this form.");
      expect(data.code).toBe("MISSING_TOKEN");
      expect(data.requiresCaptchaReset).toBe(true);

      // Verify no database user lookup was performed
      expect(mockFindUniqueUser).not.toHaveBeenCalled();
    });

    it("rejects login attempt with HTTP 400 when token is an empty string", async () => {
      const req = createLoginRequest(
        {
          email: "admin@axivontech.in",
          password: "SecurePassword123!",
          recaptchaToken: "   ",
        },
        "10.0.0.2"
      );

      const res = await loginPOST(req);
      expect(res.status).toBe(400);

      const data = await res.json();
      expect(data.code).toBe("MISSING_TOKEN");
      expect(mockFindUniqueUser).not.toHaveBeenCalled();
    });

    it("rejects login attempt with HTTP 400 when anti-bot token is invalid or malformed", async () => {
      const req = createLoginRequest(
        {
          email: "admin@axivontech.in",
          password: "SecurePassword123!",
          recaptchaToken: "INVALID_TEST_TOKEN",
        },
        "10.0.0.3"
      );

      const res = await loginPOST(req);
      expect(res.status).toBe(400);

      const data = await res.json();
      expect(data.code).toBe("INVALID_TOKEN");
      expect(data.requiresCaptchaReset).toBe(true);
      expect(mockFindUniqueUser).not.toHaveBeenCalled();
    });

    it("silently traps automated bots when honeypot website_trap is filled", async () => {
      const req = createLoginRequest(
        {
          email: "bot@spammer.com",
          password: "BotPassword!",
          website_trap: "automated-bot-entry",
          recaptchaToken: RECAPTCHA_TEST_KEYS.ALWAYS_PASSES_SITEKEY,
        },
        "10.0.0.4"
      );

      const res = await loginPOST(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.botBlocked).toBe(true);
      expect(mockFindUniqueUser).not.toHaveBeenCalled();
    });
  });

  describe("2. Rate Limiting Defense", () => {
    it("returns HTTP 429 when rate limit is exceeded for the IP address", async () => {
      const spamIp = "198.51.100.42";

      // RATE_LIMIT_PRESETS.AUTH_LOGIN has maxRequests: 5
      for (let i = 0; i < 5; i++) {
        const req = createLoginRequest(
          {
            email: "test@axivontech.in",
            password: "wrong-password",
            recaptchaToken: RECAPTCHA_TEST_KEYS.ALWAYS_PASSES_SITEKEY,
          },
          spamIp
        );
        mockFindUniqueUser.mockResolvedValueOnce(null);
        await loginPOST(req);
      }

      // 6th request from the same IP must be rate limited
      const limitedReq = createLoginRequest(
        {
          email: "test@axivontech.in",
          password: "wrong-password",
          recaptchaToken: RECAPTCHA_TEST_KEYS.ALWAYS_PASSES_SITEKEY,
        },
        spamIp
      );

      const res = await loginPOST(limitedReq);
      expect(res.status).toBe(429);

      const data = await res.json();
      expect(data.error).toBe("Too many login attempts. Please try again later.");
      expect(res.headers.get("Retry-After")).toBeDefined();
    });
  });

  describe("3. Authentication & Account Access Control", () => {
    it("rejects login with HTTP 401 when email does not exist", async () => {
      mockFindUniqueUser.mockResolvedValueOnce(null);

      const req = createLoginRequest(
        {
          email: "nonexistent@axivontech.in",
          password: "ValidPassword123!",
          recaptchaToken: RECAPTCHA_TEST_KEYS.ALWAYS_PASSES_SITEKEY,
        },
        "10.0.1.1"
      );

      const res = await loginPOST(req);
      expect(res.status).toBe(401);

      const data = await res.json();
      expect(data.error).toBe("Invalid email or password");
    });

    it("rejects login with HTTP 401 when password does not match", async () => {
      mockFindUniqueUser.mockResolvedValueOnce({
        id: "usr-1",
        email: "user@axivontech.in",
        passwordHash: "$2b$10$hashedPasswordSample",
        status: "ACTIVE",
        mustChangePassword: false,
        userRoles: [{ role: { name: "EMPLOYEE" } }],
      });
      mockVerifyPassword.mockResolvedValueOnce(false);

      const req = createLoginRequest(
        {
          email: "user@axivontech.in",
          password: "WrongPassword!",
          recaptchaToken: RECAPTCHA_TEST_KEYS.ALWAYS_PASSES_SITEKEY,
        },
        "10.0.1.2"
      );

      const res = await loginPOST(req);
      expect(res.status).toBe(401);

      const data = await res.json();
      expect(data.error).toBe("Invalid email or password");
    });

    it("rejects login with HTTP 403 when account is INACTIVE or SUSPENDED", async () => {
      mockFindUniqueUser.mockResolvedValueOnce({
        id: "usr-suspended",
        email: "suspended@axivontech.in",
        passwordHash: "$2b$10$hashedPasswordSample",
        status: "SUSPENDED",
        mustChangePassword: false,
        userRoles: [{ role: { name: "EMPLOYEE" } }],
      });
      mockVerifyPassword.mockResolvedValueOnce(true);

      const req = createLoginRequest(
        {
          email: "suspended@axivontech.in",
          password: "CorrectPassword123!",
          recaptchaToken: RECAPTCHA_TEST_KEYS.ALWAYS_PASSES_SITEKEY,
        },
        "10.0.1.3"
      );

      const res = await loginPOST(req);
      expect(res.status).toBe(403);

      const data = await res.json();
      expect(data.error).toContain("Account is SUSPENDED");
    });

    it("rejects login with HTTP 403 when user must change password", async () => {
      mockFindUniqueUser.mockResolvedValueOnce({
        id: "usr-pending-activation",
        email: "newhire@axivontech.in",
        passwordHash: "$2b$10$hashedPasswordSample",
        status: "ACTIVE",
        mustChangePassword: true,
        userRoles: [{ role: { name: "EMPLOYEE" } }],
      });
      mockVerifyPassword.mockResolvedValueOnce(true);

      const req = createLoginRequest(
        {
          email: "newhire@axivontech.in",
          password: "TempPassword123!",
          recaptchaToken: RECAPTCHA_TEST_KEYS.ALWAYS_PASSES_SITEKEY,
        },
        "10.0.1.4"
      );

      const res = await loginPOST(req);
      expect(res.status).toBe(403);

      const data = await res.json();
      expect(data.error).toContain("Please complete your account activation");
    });
  });

  describe("4. Successful Authentication & Session Issuance", () => {
    it("successfully logs in active user when credentials and CAPTCHA are valid", async () => {
      mockFindUniqueUser.mockResolvedValueOnce({
        id: "usr-admin-1",
        name: "Admin User",
        email: "admin@axivontech.in",
        passwordHash: "$2b$10$correctHashedPassword",
        status: "ACTIVE",
        mustChangePassword: false,
        userRoles: [{ role: { name: "ADMIN" } }],
      });
      mockVerifyPassword.mockResolvedValueOnce(true);
      mockSignSession.mockResolvedValueOnce("signed-session-jwt-token-12345");
      mockCreateSession.mockResolvedValueOnce({ id: "sess-1" });
      mockCreateAuditLog.mockResolvedValueOnce({ id: "audit-1" });

      const req = createLoginRequest(
        {
          email: "admin@axivontech.in",
          password: "CorrectPassword123!",
          recaptchaToken: RECAPTCHA_TEST_KEYS.ALWAYS_PASSES_SITEKEY,
        },
        "10.0.2.1"
      );

      const res = await loginPOST(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.user).toBeDefined();
      expect(data.user.id).toBe("usr-admin-1");
      expect(data.user.email).toBe("admin@axivontech.in");
      expect(data.user.role).toBe("ADMIN");

      // Verify session cookie was set
      const cookieHeader = res.headers.get("set-cookie");
      expect(cookieHeader).toBeDefined();
      expect(cookieHeader).toContain("axivon_session=signed-session-jwt-token-12345");
      expect(cookieHeader?.toLowerCase()).toContain("httponly");

      // Verify DB audit log and session records
      expect(mockCreateSession).toHaveBeenCalledTimes(1);
      expect(mockCreateAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: "usr-admin-1",
            action: "user.login",
            resource: "Auth",
          }),
        })
      );
    });

    it("supports backward-compatible captchaToken field name in request body", async () => {
      mockFindUniqueUser.mockResolvedValueOnce({
        id: "usr-employee-1",
        name: "Employee User",
        email: "employee@axivontech.in",
        passwordHash: "$2b$10$correctHashedPassword",
        status: "ACTIVE",
        mustChangePassword: false,
        userRoles: [{ role: { name: "EMPLOYEE" } }],
      });
      mockVerifyPassword.mockResolvedValueOnce(true);
      mockSignSession.mockResolvedValueOnce("signed-session-jwt-token-emp");
      mockCreateSession.mockResolvedValueOnce({ id: "sess-2" });
      mockCreateAuditLog.mockResolvedValueOnce({ id: "audit-2" });

      // Using captchaToken instead of recaptchaToken
      const req = createLoginRequest(
        {
          email: "employee@axivontech.in",
          password: "CorrectPassword123!",
          captchaToken: RECAPTCHA_TEST_KEYS.ALWAYS_PASSES_SITEKEY,
        },
        "10.0.2.2"
      );

      const res = await loginPOST(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.user.role).toBe("EMPLOYEE");
    });
  });

  describe("5. Content Security Policy & reCAPTCHA Integration Verification", () => {
    it("ensures CSP explicitly includes frame-src for Google reCAPTCHA", async () => {
      const nextConfig = (await import("../next.config")).default;
      const headersConfig = await (nextConfig.headers as any)();
      const rootRule = headersConfig.find((r: any) => r.source === "/:path*");
      const csp = rootRule.headers.find((h: any) => h.key.toLowerCase() === "content-security-policy")?.value;

      expect(csp).toBeDefined();
      expect(csp).toContain("frame-src");
      expect(csp).toContain("https://www.google.com/recaptcha/");
      expect(csp).toContain("https://recaptcha.google.com/recaptcha/");
    });

    it("sanitizes public site key and secret key by stripping quotes", async () => {
      const { getRecaptchaSiteKey, getRecaptchaSecretKey } = await import("@/lib/captcha/recaptcha");
      const siteInfo = getRecaptchaSiteKey();
      const secretInfo = getRecaptchaSecretKey();

      expect(siteInfo.siteKey).not.toContain('"');
      expect(siteInfo.siteKey).not.toContain("'");
      expect(siteInfo.siteKey.length).toBeGreaterThan(10);

      if (secretInfo.secretKey) {
        expect(secretInfo.secretKey).not.toContain('"');
        expect(secretInfo.secretKey).not.toContain("'");
      }
    });
  });

  describe("6. Chrome Password Manager & Autofill Semantics", () => {
    it("ensures login page source code provides required password manager attributes", async () => {
      const fs = await import("fs");
      const path = await import("path");
      const loginPageSource = fs.readFileSync(
        path.join(process.cwd(), "src/app/login/page.tsx"),
        "utf8"
      );

      // Verify semantic <form> container
      expect(loginPageSource).toContain("<form");
      expect(loginPageSource).toContain("onSubmit={handleLogin}");
      expect(loginPageSource).toContain('method="post"');

      // Verify email input has name="email", id="email", and autoComplete="username"
      expect(loginPageSource).toContain('name="email"');
      expect(loginPageSource).toContain('id="email"');
      expect(loginPageSource).toContain('autoComplete="username"');

      // Verify password input has name="password", id="password", and autoComplete="current-password"
      expect(loginPageSource).toContain('name="password"');
      expect(loginPageSource).toContain('id="password"');
      expect(loginPageSource).toContain('autoComplete="current-password"');

      // Verify onInput is implemented to catch browser autofill events
      expect(loginPageSource).toContain('onInput=');

      // Verify DOM extraction fallback in handleLogin to prevent React controlled input desync
      expect(loginPageSource).toContain('elements.namedItem("email")');
      expect(loginPageSource).toContain('elements.namedItem("password")');
    });

    it("verifies global CSS contains dark mode webkit-autofill rules for legible contrast", async () => {
      const fs = await import("fs");
      const path = await import("path");
      const globalsCss = fs.readFileSync(
        path.join(process.cwd(), "src/app/globals.css"),
        "utf8"
      );

      expect(globalsCss).toContain("input:-webkit-autofill");
      expect(globalsCss).toContain("-webkit-box-shadow");
      expect(globalsCss).toContain("-webkit-text-fill-color");
    });

    it("ensures autofilled credentials do not bypass server-side CAPTCHA verification", async () => {
      // Simulate autofilled email and password submitted without CAPTCHA
      const autofilledReq = createLoginRequest(
        {
          email: "saved_chrome_user@axivontech.in",
          password: "SavedChromePassword123!",
        },
        "10.0.3.1"
      );

      const res = await loginPOST(autofilledReq);
      expect(res.status).toBe(400);

      const data = await res.json();
      expect(data.code).toBe("MISSING_TOKEN");
      expect(mockFindUniqueUser).not.toHaveBeenCalled();
      expect(mockCreateSession).not.toHaveBeenCalled();
    });
  });

  describe("7. Provider Outages, Token Expiry, and Replay Defenses", () => {
    it("handles replayed / already consumed reCAPTCHA tokens by rejecting login", async () => {
      const replayToken = "REPLAY_TEST_TOKEN_XYZ";

      // First verification succeeds in test mode and registers token in used cache
      const firstReq = createLoginRequest(
        {
          email: "user@axivontech.in",
          password: "SecurePassword123!",
          recaptchaToken: replayToken,
        },
        "10.0.4.1"
      );
      mockFindUniqueUser.mockResolvedValueOnce({
        id: "usr-emp",
        email: "user@axivontech.in",
        passwordHash: "$2b$10$hashedPasswordSample",
        status: "ACTIVE",
        mustChangePassword: false,
        userRoles: [{ role: { name: "EMPLOYEE" } }],
      });
      mockVerifyPassword.mockResolvedValueOnce(true);
      mockSignSession.mockResolvedValueOnce("session-token-emp");

      const firstRes = await loginPOST(firstReq);
      expect(firstRes.status).toBe(200);

      // Second attempt using the same token must be rejected as replayed
      const secondReq = createLoginRequest(
        {
          email: "user@axivontech.in",
          password: "SecurePassword123!",
          recaptchaToken: replayToken,
        },
        "10.0.4.1"
      );

      const secondRes = await loginPOST(secondReq);
      expect(secondRes.status).toBe(400);

      const data = await secondRes.json();
      expect(data.code).toBe("EXPIRED_OR_REPLAYED");
      expect(data.requiresCaptchaReset).toBe(true);
    });

    it("handles expired tokens with HTTP 400 and requiresCaptchaReset", async () => {
      const expiredReq = createLoginRequest(
        {
          email: "user@axivontech.in",
          password: "SecurePassword123!",
          recaptchaToken: "TEST_EXPIRED_RECAPTCHA_TOKEN",
        },
        "10.0.4.2"
      );

      const res = await loginPOST(expiredReq);
      expect(res.status).toBe(400);

      const data = await res.json();
      expect(data.code).toBe("EXPIRED_OR_REPLAYED");
      expect(data.requiresCaptchaReset).toBe(true);
    });
  });
});
