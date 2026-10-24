import { NextRequest, NextResponse } from "next/server";
import { JobRunner } from "@/lib/jobs/runner";
import { handleApiError, ApiError } from "@/lib/api-error";
import { requirePermission } from "@/lib/auth/permissions";
import { verifyCronRequest } from "@/lib/auth/cron";
import { getAuthenticatedSession } from "@/lib/auth/session";

async function verifyAuth(req: Request) {
  const authHeader = req.headers.get("authorization");
  const cronHeader = req.headers.get("x-cron-secret");

  if (authHeader || cronHeader) {
    verifyCronRequest(req);
    return { isCron: true };
  }

  // Not a cron request: requires authenticated session cookie with admin:access
  const session = await getAuthenticatedSession(req);
  const user = await requirePermission(session.userId, "admin:access");
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
