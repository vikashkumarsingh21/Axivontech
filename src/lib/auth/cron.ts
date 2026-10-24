import crypto from "crypto";
import { ApiError } from "@/lib/api-error";

/**
 * Validates server-side cron authorization for scheduled jobs and automations.
 *
 * Rules:
 * 1. Checks Authorization header ("Bearer <secret>") or "x-cron-secret" header.
 * 2. In production (NODE_ENV === "production"), requires CRON_SECRET to be configured
 *    with a minimum length of 16 characters. Fails closed (500) if missing.
 * 3. Compares tokens using constant-time comparison (crypto.timingSafeEqual) to prevent timing attacks.
 * 4. Rejects all unauthorized requests with 401 Unauthorized before any job or destruction is triggered.
 * 5. In test environment (NODE_ENV === "test"), allows mock tokens if explicitly set.
 */
export function verifyCronRequest(req: Request): { authorized: boolean } {
  const configuredSecret = process.env.CRON_SECRET?.trim() || "";
  const isProduction = process.env.NODE_ENV === "production";

  // Production Fail-Closed Safeguard: Refuse to execute if secret is unconfigured
  if (isProduction) {
    if (!configuredSecret || configuredSecret.length < 16) {
      console.error("[CRON_SECURITY_ALERT]: CRON_SECRET is not properly configured in production.");
      throw new ApiError(
        500,
        "Server configuration error: CRON_SECRET must be configured with at least 16 characters in production."
      );
    }
  } else if (!configuredSecret && process.env.NODE_ENV !== "test") {
    // Development without CRON_SECRET: Fail closed rather than using hardcoded fallbacks
    throw new ApiError(
      500,
      "Development configuration required: Please set CRON_SECRET in your .env file."
    );
  }

  // Extract token from Authorization: Bearer <token> or x-cron-secret header
  const authHeader = req.headers.get("authorization") || "";
  let incomingToken = "";

  if (authHeader.startsWith("Bearer ")) {
    incomingToken = authHeader.substring(7).trim();
  } else {
    incomingToken = (req.headers.get("x-cron-secret") || "").trim();
  }

  if (!incomingToken) {
    throw new ApiError(401, "Unauthorized: Cron authentication token is missing.");
  }

  const expectedSecret = configuredSecret || (process.env.NODE_ENV === "test" ? (process.env.CRON_SECRET || "super_secure_cron_secret_32_characters_long") : "");
  if (!expectedSecret) {
    throw new ApiError(500, "Server configuration error: CRON_SECRET is not configured.");
  }

  // Timing-safe comparison to prevent side-channel timing attacks
  const incomingBuf = Buffer.from(incomingToken);
  const expectedBuf = Buffer.from(expectedSecret);

  if (incomingBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(incomingBuf, expectedBuf)) {
    throw new ApiError(401, "Unauthorized: Invalid cron authentication credentials.");
  }

  return { authorized: true };
}
