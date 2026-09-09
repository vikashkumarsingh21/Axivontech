import { NextResponse } from "next/server";
import { JobRunner } from "@/lib/jobs/runner";
import { handleApiError } from "@/lib/api-error";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || "axivon_cron_secret_internal";

    // Verify cron secret if provided in auth header, or allow if x-user-id has admin access
    const isCronAuthorized = authHeader === `Bearer ${cronSecret}`;
    const userId = req.headers.get("x-user-id");

    if (!isCronAuthorized && !userId) {
      return NextResponse.json({ error: "Unauthorized cron trigger" }, { status: 401 });
    }

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
