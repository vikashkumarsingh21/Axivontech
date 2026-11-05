import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { CentralScheduler } from "@/lib/scheduler/central-scheduler";
import { handleApiError, ApiError } from "@/lib/api-error";

export const dynamic = "force-dynamic";

/**
 * Axivon Technologies — Secure External Scheduler Endpoint
 *
 * Route: POST /api/internal/cron/process-due-jobs
 *
 * Security Requirements:
 * 1. HTTPS only in production (rejects x-forwarded-proto: http with 403).
 * 2. Authorization header: "Bearer <CRON_SECRET>".
 * 3. Timing-safe comparison to prevent side-channel timing attacks.
 * 4. Fails closed (401 Unauthorized) on missing or invalid secrets.
 * 5. Secret is never logged, exposed to frontend, or accepted in URL query parameters.
 */
function authenticateExternalScheduler(req: NextRequest) {
  const isProduction = process.env.NODE_ENV === "production";

  // 1. Enforce HTTPS in production
  if (isProduction) {
    const proto = req.headers.get("x-forwarded-proto");
    if (proto && proto.toLowerCase() === "http") {
      throw new ApiError(403, "Forbidden: HTTPS is strictly required for scheduler endpoints.");
    }
  }

  // 2. Validate Authorization: Bearer <CRON_SECRET>
  const authHeader = req.headers.get("authorization") || "";
  if (!authHeader.startsWith("Bearer ")) {
    throw new ApiError(
      401,
      "Unauthorized: Missing or malformed Authorization header. Must be Bearer <CRON_SECRET>."
    );
  }

  const incomingToken = authHeader.substring(7).trim();
  if (!incomingToken) {
    throw new ApiError(401, "Unauthorized: Bearer token is empty.");
  }

  // 3. Resolve configured secret
  const configuredSecret = process.env.CRON_SECRET?.trim() || "";

  if (isProduction) {
    if (!configuredSecret || configuredSecret.length < 16) {
      console.error(
        "[CRON_SECURITY_ALERT]: CRON_SECRET is not properly configured in production environment."
      );
      throw new ApiError(
        500,
        "Server configuration error: CRON_SECRET must be configured with at least 16 characters in production."
      );
    }
  } else if (!configuredSecret && process.env.NODE_ENV !== "test") {
    throw new ApiError(
      500,
      "Development configuration required: Please set CRON_SECRET in your environment."
    );
  }

  const expectedSecret =
    configuredSecret ||
    (process.env.NODE_ENV === "test"
      ? process.env.CRON_SECRET || "super_secure_cron_secret_32_characters_long"
      : "");

  if (!expectedSecret) {
    throw new ApiError(500, "Server configuration error: CRON_SECRET is not configured.");
  }

  // 4. Constant-time comparison
  const incomingBuf = Buffer.from(incomingToken);
  const expectedBuf = Buffer.from(expectedSecret);

  if (
    incomingBuf.length !== expectedBuf.length ||
    !crypto.timingSafeEqual(incomingBuf, expectedBuf)
  ) {
    throw new ApiError(401, "Unauthorized: Invalid cron authentication credentials.");
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate Request
    authenticateExternalScheduler(req);

    // 2. Parse request body if JSON supplied
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Body is optional
    }

    // 3. Resolve dryRun mode according to Phase 5 requirements:
    // Requires CRON_DRY_RUN=false in environment to perform real execution!
    // Defaults safely to dry-run mode.
    const envDryRun = process.env.CRON_DRY_RUN?.toLowerCase().trim();
    const isRealExecutionAllowed = envDryRun === "false";

    const { searchParams } = new URL(req.url);
    const queryDryRun = searchParams.get("dryRun");
    const bodyDryRun = body?.dryRun;

    let dryRun = true;
    if (queryDryRun === "true" || bodyDryRun === true) {
      dryRun = true;
    } else if (queryDryRun === "false" || bodyDryRun === false) {
      dryRun = !isRealExecutionAllowed;
    } else {
      dryRun = !isRealExecutionAllowed;
    }

    // 4. Parse optional clock injection for testability
    const nowParam = searchParams.get("now") || body?.now;
    let now: Date | undefined;
    if (nowParam) {
      const parsed = new Date(nowParam);
      if (!isNaN(parsed.getTime())) {
        now = parsed;
      }
    }

    // 5. Execute Central Scheduler
    const result = await CentralScheduler.processDueJobs({
      now,
      dryRun,
    });

    // 6. Return concise execution summary (No sensitive data, well under 64 KB)
    return NextResponse.json({
      success: result.success,
      dryRun: result.dryRun,
      processed: result.processed,
      sent: result.sent,
      skipped: result.skipped,
      failed: result.failed,
      durationMs: result.durationMs,
      executionId: result.executionId,
      ...(result.message ? { message: result.message } : {}),
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function GET(req: NextRequest) {
  try {
    authenticateExternalScheduler(req);

    const { searchParams } = new URL(req.url);
    const view = searchParams.get("view");

    if (view === "history") {
      const logs = await CentralScheduler.getRecentLogs(20);
      return NextResponse.json({ success: true, logs });
    }

    return NextResponse.json({
      success: true,
      endpoint: "/api/internal/cron/process-due-jobs",
      method: "POST",
      description: "Axivon Technologies Central Background Job Scheduler Endpoint",
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
