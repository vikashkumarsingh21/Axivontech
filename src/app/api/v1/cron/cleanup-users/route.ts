import { NextResponse } from "next/server";
import { JobRunner } from "@/lib/jobs/runner";

// In production, this would be secured by a cron secret (e.g., verifying a Vercel Cron header)
export async function GET(req: Request) {
  try {
    // Enqueue the job so the background worker or POST /api/v1/admin/jobs can pick it up
    const job = await JobRunner.enqueue("INACTIVE_USER_CLEANUP");
    
    // Attempt to process it immediately if there is no separate background worker loop
    const results = await JobRunner.processPending();

    return NextResponse.json({ success: true, enqueued: job, processed: results });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
