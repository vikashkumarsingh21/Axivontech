import { NextRequest, NextResponse } from "next/server";
import { closeStaleAttendance } from "@/lib/attendance/stale-attendance";
import { handleApiError, ApiError } from "@/lib/api-error";

/**
 * Scheduled Cron / Automation Endpoint: /api/v1/cron/close-attendance
 * 
 * Closes unclosed attendance records from past days at midnight.
 * Security: Validates authorization header or CRON_SECRET.
 * Testability: Accepts ?now=ISO_STRING and ?dryRun=true for automated tests.
 */
export async function GET(req: NextRequest) {
  return handleCronExecution(req);
}

export async function POST(req: NextRequest) {
  return handleCronExecution(req);
}

async function handleCronExecution(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecretHeader = req.headers.get("x-cron-secret");
    const { searchParams } = new URL(req.url);
    const querySecret = searchParams.get("secret");

    const expectedSecret = process.env.CRON_SECRET || process.env.INTERNAL_API_SECRET;

    // Allow execution in development/test environments or if expectedSecret matches
    const isDevOrTest = process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
    const suppliedSecret = cronSecretHeader || querySecret || bearerToken;

    if (!isDevOrTest && expectedSecret && suppliedSecret !== expectedSecret) {
      throw new ApiError(401, "Unauthorized: Invalid cron secret", undefined, "UNAUTHORIZED");
    }

    // Optional injectable clock via query parameter (ISO string or timestamp)
    const nowParam = searchParams.get("now");
    const dryRunParam = searchParams.get("dryRun");
    const userIdParam = searchParams.get("userId") || undefined;

    let targetNow = new Date();
    if (nowParam) {
      const parsed = new Date(nowParam);
      if (!isNaN(parsed.getTime())) {
        targetNow = parsed;
      }
    }

    const isDryRun = dryRunParam === "true" || dryRunParam === "1";

    const result = await closeStaleAttendance(targetNow, {
      userId: userIdParam,
      dryRun: isDryRun,
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: isDryRun
        ? `Dry run: ${result.closedCount} records would be closed`
        : `Successfully processed stale attendance: ${result.closedCount} records closed`,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
