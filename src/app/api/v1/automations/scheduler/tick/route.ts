import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/permissions";
import { getAuthenticatedSession } from "@/lib/auth/session";
import { verifyCronRequest } from "@/lib/auth/cron";
import { handleApiError } from "@/lib/api-error";
import { PersistentScheduler } from "@/lib/workflow-engine/scheduler";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecretHeader = req.headers.get("x-cron-secret");

    if (authHeader || cronSecretHeader) {
      verifyCronRequest(req);
    } else {
      const session = await getAuthenticatedSession(req);
      await requirePermission(session.userId, "automation.manage");
    }

    const { searchParams } = new URL(req.url);
    const batchSize = Math.min(parseInt(searchParams.get("batchSize") || "10", 10), 50);

    const result = await PersistentScheduler.processDueJobs(batchSize);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary: result,
    });
  } catch (error: any) {
    return handleApiError(error);
  }
}
