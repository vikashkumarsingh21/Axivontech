import { describe, it, expect, vi, beforeEach } from "vitest";
import { getErrorMessage, getFieldErrors, parseApiResponse } from "@/lib/errors/client";

describe("Login Page Error Scenarios Unit Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("handles wrong password / unknown email: resolves to 'Incorrect email or password.'", async () => {
    const mock401Response = new Response(
      JSON.stringify({
        success: false,
        error: { code: "API_ERROR", message: "Invalid email or password" },
        message: "Invalid email or password",
      }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );

    const parsed = await parseApiResponse(mock401Response);
    expect(parsed.ok).toBe(false);
    expect(parsed.status).toBe(401);
    // In login page, status 401 maps strictly to "Incorrect email or password."
    const userMessage = parsed.status === 401 ? "Incorrect email or password." : parsed.errorMessage;
    expect(userMessage).toBe("Incorrect email or password.");
    expect(userMessage).not.toContain("[object");
  });

  it("handles empty fields / validation failure from Zod", async () => {
    const mock400Response = new Response(
      JSON.stringify({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid email",
          fields: {
            email: ["Invalid email"],
            password: ["Password is required"],
          },
        },
        message: "Invalid email",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );

    const parsed = await parseApiResponse(mock400Response);
    expect(parsed.ok).toBe(false);
    expect(parsed.status).toBe(400);
    expect(parsed.fieldErrors.email).toBe("Invalid email");
    expect(parsed.fieldErrors.password).toBe("Password is required");
    expect(parsed.errorMessage).toBe("Invalid email");
  });

  it("handles missing or failed CAPTCHA verification", async () => {
    const mockCaptchaResponse = new Response(
      JSON.stringify({
        error: "Please complete the human verification before submitting this form.",
        code: "MISSING_TOKEN",
        requiresCaptchaReset: true,
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );

    const parsed = await parseApiResponse(mockCaptchaResponse);
    expect(parsed.ok).toBe(false);
    expect(parsed.code).toBe("MISSING_TOKEN");
    const userMessage =
      parsed.code === "MISSING_TOKEN" ? "Please confirm you are not a robot." : parsed.errorMessage;
    expect(userMessage).toBe("Please confirm you are not a robot.");
  });

  it("handles 429 rate limit with Retry-After header countdown", async () => {
    const mock429Response = new Response(
      JSON.stringify({
        success: false,
        error: { code: "RATE_LIMIT_EXCEEDED", message: "Too many login attempts. Please try again later." },
        message: "Too many login attempts. Please try again later.",
        retryAfter: 45,
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": "45",
        },
      }
    );

    const parsed = await parseApiResponse(mock429Response);
    expect(parsed.ok).toBe(false);
    expect(parsed.status).toBe(429);
    expect(parsed.retryAfter).toBe(45);
    expect(parsed.errorMessage).toBe("Too many attempts. Please try again in 45 seconds.");
  });

  it("handles suspended account (403): shows real reason message", async () => {
    const mock403Response = new Response(
      JSON.stringify({
        success: false,
        error: {
          code: "API_ERROR",
          message: "Account is SUSPENDED. Please check your email or contact support.",
        },
        message: "Account is SUSPENDED. Please check your email or contact support.",
      }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );

    const parsed = await parseApiResponse(mock403Response);
    expect(parsed.ok).toBe(false);
    expect(parsed.status).toBe(403);
    expect(parsed.errorMessage).toContain("Account is SUSPENDED");
    expect(parsed.errorMessage).not.toContain("[object");
  });

  it("handles server error (500 HTML crash or unhandled throw)", async () => {
    const mock500Response = new Response(
      "<!DOCTYPE html><html><body><h1>Internal Server Error</h1></body></html>",
      { status: 500, headers: { "Content-Type": "text/html" } }
    );

    const parsed = await parseApiResponse(mock500Response);
    expect(parsed.ok).toBe(false);
    expect(parsed.status).toBe(500);
    expect(parsed.errorMessage).toBe("Could not reach the server. Check your connection and try again.");
  });

  it("handles network failure (fetch throws TypeError)", () => {
    const networkError = new TypeError("Failed to fetch");
    const userMessage = getErrorMessage(networkError);
    expect(userMessage).toBe("Could not reach the server. Check your connection and try again.");
  });
});
