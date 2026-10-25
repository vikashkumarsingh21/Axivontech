import { describe, it, expect } from "vitest";
import {
  getErrorMessage,
  getFieldErrors,
  parseApiResponse,
  STATUS_ERROR_MESSAGES,
} from "@/lib/errors/client";

describe("Central Error Helper - getErrorMessage", () => {
  it("never returns '[object Object]'", () => {
    expect(getErrorMessage("[object Object]")).not.toBe("[object Object]");
    expect(getErrorMessage("[object Object]")).toBe("Something went wrong. Please try again.");
    expect(getErrorMessage(new Error("[object Object]"))).toBe("Something went wrong. Please try again.");
    expect(getErrorMessage({ error: {} })).toBe("Something went wrong. Please try again.");
  });

  it("handles simple string error", () => {
    expect(getErrorMessage("Invalid password")).toBe("Invalid password");
    expect(getErrorMessage("  Whitespace trimmed  ")).toBe("Whitespace trimmed");
  });

  it("strips 'Error: ' prefix safely", () => {
    expect(getErrorMessage("Error: Network failure")).toBe("Network failure");
    expect(getErrorMessage("Error: [object Object]")).toBe("Something went wrong. Please try again.");
  });

  it("handles standard Error instances", () => {
    expect(getErrorMessage(new Error("Database connection lost"))).toBe("Database connection lost");
  });

  it("handles Network errors (TypeError Failed to fetch)", () => {
    const fetchError = new TypeError("Failed to fetch");
    expect(getErrorMessage(fetchError)).toBe("Could not reach the server. Check your connection and try again.");
  });

  it("handles AbortError / Timeout", () => {
    const abortErr = new Error("The operation was aborted");
    abortErr.name = "AbortError";
    expect(getErrorMessage(abortErr)).toBe("The request timed out. Please try again.");
  });

  it("handles { message: '...' } shape", () => {
    expect(getErrorMessage({ message: "Account is suspended" })).toBe("Account is suspended");
  });

  it("handles { error: '...' } string shape", () => {
    expect(getErrorMessage({ error: "Rate limit exceeded" })).toBe("Rate limit exceeded");
  });

  it("handles { error: { message: '...' } } nested shape", () => {
    expect(getErrorMessage({ error: { message: "Invalid credentials" } })).toBe("Invalid credentials");
  });

  it("handles standard backend API shape { error: { code, message, fields } }", () => {
    const shape = {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Password must be at least 8 characters",
        fields: { password: ["Password must be at least 8 characters"] },
      },
    };
    expect(getErrorMessage(shape)).toBe("Password must be at least 8 characters");
  });

  it("handles Zod issues array", () => {
    const zodIssues = [
      { path: ["email"], message: "Invalid email address format" },
      { path: ["password"], message: "Password is required" },
    ];
    expect(getErrorMessage(zodIssues)).toBe("Invalid email address format");
  });

  it("handles Zod details format with _errors", () => {
    const zodDetails = {
      details: {
        _errors: [],
        email: { _errors: ["Email is required"] },
      },
    };
    expect(getErrorMessage(zodDetails)).toBe("Email is required");
  });

  it("handles non-JSON HTML 500 response text", () => {
    const html500 = "<!DOCTYPE html><html><body><h1>500 Internal Server Error</h1></body></html>";
    expect(getErrorMessage(html500, 500)).toBe("Could not reach the server. Check your connection and try again.");
  });

  it("falls back to friendly status messages when input is empty or null", () => {
    expect(getErrorMessage(null, 400)).toBe(STATUS_ERROR_MESSAGES[400]);
    expect(getErrorMessage(undefined, 401)).toBe(STATUS_ERROR_MESSAGES[401]);
    expect(getErrorMessage("", 403)).toBe(STATUS_ERROR_MESSAGES[403]);
    expect(getErrorMessage(null, 404)).toBe(STATUS_ERROR_MESSAGES[404]);
    expect(getErrorMessage(null, 409)).toBe(STATUS_ERROR_MESSAGES[409]);
    expect(getErrorMessage(null, 413)).toBe(STATUS_ERROR_MESSAGES[413]);
    expect(getErrorMessage(null, 429)).toBe(STATUS_ERROR_MESSAGES[429]);
    expect(getErrorMessage(null, 500)).toBe(STATUS_ERROR_MESSAGES[500]);
  });
});

describe("Central Error Helper - getFieldErrors", () => {
  it("extracts from error.fields format", () => {
    const apiPayload = {
      error: {
        fields: {
          email: ["Email must be valid"],
          password: ["Password is too short"],
        },
      },
    };
    const errors = getFieldErrors(apiPayload);
    expect(errors.email).toBe("Email must be valid");
    expect(errors.password).toBe("Password is too short");
  });

  it("extracts from Zod issues array", () => {
    const payload = {
      error: {
        issues: [
          { path: ["contact", "email"], message: "Invalid contact email" },
        ],
      },
    };
    const errors = getFieldErrors(payload);
    expect(errors["contact.email"]).toBe("Invalid contact email");
  });

  it("extracts from Zod details format", () => {
    const payload = {
      details: {
        fullName: { _errors: ["Full name is required"] },
      },
    };
    const errors = getFieldErrors(payload);
    expect(errors.fullName).toBe("Full name is required");
  });

  it("returns empty object for non-field errors", () => {
    expect(getFieldErrors(null)).toEqual({});
    expect(getFieldErrors("Some error")).toEqual({});
    expect(getFieldErrors(new Error("Failed"))).toEqual({});
  });
});

describe("Central Error Helper - parseApiResponse", () => {
  it("parses successful JSON response", async () => {
    const mockRes = new Response(JSON.stringify({ user: { id: "123", name: "Alice" } }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
    const parsed = await parseApiResponse(mockRes);
    expect(parsed.ok).toBe(true);
    expect(parsed.status).toBe(200);
    expect(parsed.data).toEqual({ user: { id: "123", name: "Alice" } });
    expect(parsed.errorMessage).toBeNull();
  });

  it("parses standard API error object safely without crashing", async () => {
    const mockRes = new Response(
      JSON.stringify({
        success: false,
        error: { code: "API_ERROR", message: "Incorrect email or password." },
        message: "Incorrect email or password.",
      }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
    const parsed = await parseApiResponse(mockRes);
    expect(parsed.ok).toBe(false);
    expect(parsed.status).toBe(401);
    expect(parsed.errorMessage).toBe("Incorrect email or password.");
    expect(parsed.errorMessage).not.toContain("[object");
  });

  it("parses 429 rate limit with Retry-After header", async () => {
    const mockRes = new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": "25",
      },
    });
    const parsed = await parseApiResponse(mockRes);
    expect(parsed.ok).toBe(false);
    expect(parsed.status).toBe(429);
    expect(parsed.retryAfter).toBe(25);
    expect(parsed.errorMessage).toBe("Too many attempts. Please try again in 25 seconds.");
  });

  it("handles empty body safely", async () => {
    const mockRes = new Response("", { status: 500 });
    const parsed = await parseApiResponse(mockRes);
    expect(parsed.ok).toBe(false);
    expect(parsed.errorMessage).toBe("Could not reach the server. Check your connection and try again.");
  });

  it("handles HTML 500 crash page without JSON parse exception", async () => {
    const mockRes = new Response("<html><body>Internal Server Error</body></html>", {
      status: 500,
      headers: { "Content-Type": "text/html" },
    });
    const parsed = await parseApiResponse(mockRes);
    expect(parsed.ok).toBe(false);
    expect(parsed.errorMessage).toBe("Could not reach the server. Check your connection and try again.");
  });
});
