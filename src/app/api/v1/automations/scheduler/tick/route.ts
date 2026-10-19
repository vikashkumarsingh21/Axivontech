import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/permissions";
import { handleApiError } from "@/lib/api-error";
import { PersistentScheduler } from "@/lib/workflow-engine/scheduler";

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    // Verify permission or cron secret header
    const cronSecret = req.headers.get("x-cron-secret");
    const expectedSecret = process.env.CRON_SECRET || "axivon_cron_internal_2026";

    if (cronSecret !== expectedSecret) {
      await requirePermission(userId, "automation.manage");
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
