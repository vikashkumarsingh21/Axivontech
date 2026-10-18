import { NextRequest, NextResponse } from "next/server";
import { JobRunner } from "@/lib/jobs/runner";
import { handleApiError, ApiError } from "@/lib/api-error";
import { requirePermission } from "@/lib/auth/permissions";

async function verifyAuth(req: Request) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || "axivon_cron_secret_internal";

  const isCronAuthorized = authHeader === `Bearer ${cronSecret}`;
  if (isCronAuthorized) {
    return { isCron: true };
  }

  const userId = req.headers.get("x-user-id");
  if (!userId) {
    throw new ApiError(401, "Unauthorized cron trigger");
  }

  const user = await requirePermission(userId, "admin:access");
  return { isCron: false, user };
}

export async function POST(req: Request) {
  try {
    await verifyAuth(req);
    const results = await JobRunner.processPending();

    return NextResponse.json({
      success: true,
      processedCount: results.length,
      jobs: results,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function GET(req: Request) {
  try {
    await verifyAuth(req);
    const results = await JobRunner.processPending();

    return NextResponse.json({
      success: true,
      processedCount: results.length,
      jobs: results,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
