import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { verifyCronRequest } from "@/lib/auth/cron";

describe("Cron Endpoint Security & Secret Verification", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.CRON_SECRET = "super_secure_cron_secret_32_characters_long";
    process.env.NODE_ENV = "test";
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should reject cron requests with missing authorization headers (401)", () => {
    const req = new Request("http://localhost:3000/api/v1/cron/cleanup-users", {
      method: "GET",
      headers: new Headers(),
    });

    expect(() => verifyCronRequest(req)).toThrow(/Cron authentication token is missing/);
  });

  it("should reject cron requests with invalid token (401)", () => {
    const req = new Request("http://localhost:3000/api/v1/cron/cleanup-users", {
      method: "GET",
      headers: new Headers({
        authorization: "Bearer wrong_token_attempt",
      }),
    });

    expect(() => verifyCronRequest(req)).toThrow(/Invalid cron authentication credentials/);
  });

  it("should allow cron requests with matching Bearer token", () => {
    const req = new Request("http://localhost:3000/api/v1/cron/cleanup-users", {
      method: "GET",
      headers: new Headers({
        authorization: `Bearer ${process.env.CRON_SECRET}`,
      }),
    });

    const result = verifyCronRequest(req);
    expect(result.authorized).toBe(true);
  });

  it("should allow cron requests with matching x-cron-secret header", () => {
    const req = new Request("http://localhost:3000/api/v1/automations/scheduler/tick", {
      method: "POST",
      headers: new Headers({
        "x-cron-secret": `${process.env.CRON_SECRET}`,
      }),
    });

    const result = verifyCronRequest(req);
    expect(result.authorized).toBe(true);
  });

  it("should fail closed (500) in production when CRON_SECRET is missing or too short", () => {
    process.env.NODE_ENV = "production";
    delete process.env.CRON_SECRET;

    const req = new Request("http://localhost:3000/api/v1/cron/cleanup-users", {
      method: "GET",
      headers: new Headers({
        authorization: "Bearer some_token",
      }),
    });

    expect(() => verifyCronRequest(req)).toThrow(/CRON_SECRET must be configured with at least 16 characters in production/);
  });

  it("should reject legacy hardcoded fallbacks like axivon_cron_secret_internal", () => {
    const req = new Request("http://localhost:3000/api/v1/jobs/process", {
      method: "POST",
      headers: new Headers({
        authorization: "Bearer axivon_cron_secret_internal",
      }),
    });

    expect(() => verifyCronRequest(req)).toThrow(/Invalid cron authentication credentials/);
  });
});
